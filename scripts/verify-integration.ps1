# verify-integration.ps1
# Traces API route handlers → client fetch calls to detect disconnected pipelines.
# Reports orphaned endpoints (backend exists, no client calls it) and
# missing handlers (client fetches an endpoint that has no route file).
param(
  [switch]$Json,
  [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot | Split-Path -Parent

Write-Host "=== StoryForge Integration Trace ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Find all API route files and their exported HTTP method handlers
$apiDir = Join-Path $root "app\api"
$apiRoutes = @{}
$handlerCount = 0

Get-ChildItem -LiteralPath $apiDir -Recurse -Filter "route.ts" -ErrorAction SilentlyContinue | ForEach-Object {
  $file = $_.FullName
  $relPath = $file.Replace($root + "\", "").Replace("\", "/")
  
  # Derive route path from file path
  $route = $relPath -replace "^app/api/", "/api/" -replace "/route\.ts$", ""
  $route = $route -replace "\[(\w+)\]", '{$1}'
  
  $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
  if (-not $content) { return }

  $methods = @()
  if ($content -match 'export\s+(async\s+)?function\s+GET\b') { $methods += "GET" }
  if ($content -match 'export\s+(async\s+)?function\s+POST\b') { $methods += "POST" }
  if ($content -match 'export\s+(async\s+)?function\s+PATCH\b') { $methods += "PATCH" }
  if ($content -match 'export\s+(async\s+)?function\s+DELETE\b') { $methods += "DELETE" }
  if ($content -match 'export\s+(async\s+)?function\s+PUT\b') { $methods += "PUT" }

  foreach ($method in $methods) {
    $key = "$method $route"
    $apiRoutes[$key] = @{ file = $relPath; method = $method; route = $route }
    $handlerCount++
    if ($Verbose) { Write-Host "  API: $method $route" -ForegroundColor DarkGray }
  }
}

Write-Host "Found $handlerCount API handlers across $($apiRoutes.Values.file | Sort-Object -Unique | Measure-Object).Count route files." -ForegroundColor DarkGray
Write-Host ""

# Step 2: Find all fetch/API calls in client code
$clientDirs = @(
  (Join-Path $root "app"),
  (Join-Path $root "components")
)

$clientCalls = @{}
$callCount = 0

$fetchPatterns = @(
  'fetch\s*\(\s*["''`](/api/\S+?["''`])',
  'fetch\s*\(\s*`(\$\{[^}]*\}/api/\S+?)`',
  '["''`](/api/\S+?)["''`]',
  'href\s*=\s*["''`](/api/\S+?)["''`]'
)

foreach ($dir in $clientDirs) {
  if (-not (Test-Path -LiteralPath $dir)) { continue }
  Get-ChildItem -LiteralPath $dir -Recurse -Include "*.tsx","*.ts" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "\\api\\" -and $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "\\route\.ts$"
  } | ForEach-Object {
    $file = $_.FullName
    $relPath = $file.Replace($root + "\", "").Replace("\", "/")
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }

    # Find fetch calls with explicit methods
    $methodPatterns = @(
      @{ Method = "GET"; Pattern = 'fetch\s*\(\s*["''`](/api/[^"''`]+)["''`]' },
      @{ Method = "POST"; Pattern = 'fetch\s*\(\s*["''`](/api/[^"''`]+)["''`][^)]*method\s*:\s*["'']POST' },
      @{ Method = "PATCH"; Pattern = 'fetch\s*\(\s*["''`](/api/[^"''`]+)["''`][^)]*method\s*:\s*["'']PATCH' },
      @{ Method = "DELETE"; Pattern = 'fetch\s*\(\s*["''`](/api/[^"''`]+)["''`][^)]*method\s*:\s*["'']DELETE' }
    )

    foreach ($mp in $methodPatterns) {
      $matches_found = [regex]::Matches($content, $mp.Pattern)
      foreach ($m in $matches_found) {
        $url = $m.Groups[1].Value
        # Normalize: remove trailing slash, remove query params
        $url = $url -replace '/$', '' -replace '\?.*$', ''
        # Collapse dynamic segments like /projects/some-id to /projects/{id}
        $url = $url -replace '/[a-zA-Z0-9_-]{10,30}(?=/|$)', '/{id}'
        
        # If no explicit method in the fetch call body, default to GET
        $actualMethod = $mp.Method
        if ($mp.Method -eq "GET" -and $content -match "fetch\s*\(\s*['\"`]$([regex]::Escape($m.Groups[1].Value))['\"`][^)]*method\s*:\s*['\""]([A-Z]+)") {
          $actualMethod = $Matches[1]
        }

        $key = "$actualMethod $url"
        if (-not $clientCalls.ContainsKey($key)) {
          $clientCalls[$key] = @()
        }
        $clientCalls[$key] += $relPath
        $callCount++
      }
    }

    # Find Supabase-based auth calls (not REST API, but part of the pipeline)
    if ($content -match 'supabase\.auth\.(signUp|signIn|signOut|signInWithOAuth)') {
      $key = "SUPABASE_AUTH"
      if (-not $clientCalls.ContainsKey($key)) { $clientCalls[$key] = @() }
      $clientCalls[$key] += $relPath
      $callCount++
    }
  }
}

Write-Host "Found $callCount client API references." -ForegroundColor DarkGray
Write-Host ""

# Step 3: Cross-reference
$orphaned = @()
$missing = @()
$connected = @()

foreach ($apiKey in $apiRoutes.Keys) {
  $matched = $false
  foreach ($clientKey in $clientCalls.Keys) {
    if ($clientKey -eq $apiKey) {
      $connected += @{ key = $apiKey; file = $apiRoutes[$apiKey].file; callers = $clientCalls[$clientKey] }
      $matched = $true
      break
    }
  }
  # Also try fuzzy match: API is /api/gamification/progress, client might have /api/gamification/progress with query
  if (-not $matched) {
    foreach ($clientKey in $clientCalls.Keys) {
      if ($clientKey -match [regex]::Escape($apiKey)) {
        $matched = $true; break
      }
    }
  }
  if (-not $matched) {
    $orphaned += @{ key = $apiKey; file = $apiRoutes[$apiKey].file }
  }
}

# Report
Write-Host "=== Results ===" -ForegroundColor Cyan
Write-Host ""

if ($orphaned.Count -gt 0) {
  Write-Host "ORPHANED ENDPOINTS (API exists, no client caller found):" -ForegroundColor Red
  foreach ($o in $orphaned) {
    Write-Host "  $($o.key)  →  $($o.file)" -ForegroundColor Red
  }
  Write-Host ""
} else {
  Write-Host "No orphaned endpoints found." -ForegroundColor Green
  Write-Host ""
}

if ($missing.Count -gt 0) {
  Write-Host "MISSING HANDLERS (client calls endpoint with no handler):" -ForegroundColor Yellow
  foreach ($m in $missing) {
    Write-Host "  $($m.key)  ←  called from $($m.file)" -ForegroundColor Yellow
  }
  Write-Host ""
} else {
  Write-Host "No missing handlers found." -ForegroundColor Green
  Write-Host ""
}

Write-Host "Connected: $($connected.Count)  |  Orphaned: $($orphaned.Count)  |  Missing: $($missing.Count)" -ForegroundColor Cyan

# Exit code: fail if orphans or missing
if ($orphaned.Count -gt 0) {
  Write-Host ""
  Write-Host "ACTION REQUIRED: $($orphaned.Count) orphaned endpoints detected." -ForegroundColor Red
  Write-Host "Either add client code to call them, or remove the unused handlers." -ForegroundColor Red
  exit 1
}

if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "ACTION REQUIRED: $($missing.Count) missing handlers detected." -ForegroundColor Red
  exit 1
}

exit 0
