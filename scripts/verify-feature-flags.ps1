# verify-feature-flags.ps1
# Detects feature flags defined in lib/flags.ts that are never gated in any code.
# Also detects strings passed to isEnabled() that don't match any defined flag.
param(
  [switch]$Json
)

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot | Split-Path -Parent

Write-Host "=== StoryForge Feature Flag Gate Check ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Extract flag IDs from lib/flags.ts
$flagsFile = Join-Path $root "lib\flags.ts"
if (-not (Test-Path -LiteralPath $flagsFile)) {
  Write-Host "ERROR: lib/flags.ts not found" -ForegroundColor Red
  exit 1
}

$flagsContent = Get-Content $flagsFile -Raw
$flagMatches = [regex]::Matches($flagsContent, 'id:\s*"([^"]+)"')
$definedFlags = @{}
foreach ($m in $flagMatches) {
  $id = $m.Groups[1].Value
  $definedFlags[$id] = $true
}

Write-Host "Defined flags: $($definedFlags.Count)" -ForegroundColor DarkGray
foreach ($f in $definedFlags.Keys | Sort-Object) {
  Write-Host "  $f" -ForegroundColor DarkGray
}
Write-Host ""

# Step 2: Search codebase for flag usage
$searchDirs = @("app", "components", "lib")
$usedFlags = @{}
$unknownFlags = @()

foreach ($dir in $searchDirs) {
  $searchPath = Join-Path $root $dir
  if (-not (Test-Path -LiteralPath $searchPath)) { continue }

  # Search for isEnabled/isEnabledSync calls
  $results = rg --no-heading --no-filename -i 'isEnabled(Sync)?\s*\(\s*["'']([^"'']+)' $searchPath --glob '!**/node_modules/**' --glob '!**/.next/**' 2>$null
  if ($results) {
    foreach ($line in $results) {
      if ($line -match '["''](\w+)["'']') {
        $flagId = $Matches[1]
        $normalized = $flagId.ToLower().Replace("-", "_")
        
        # Check if matches a defined flag (case-insensitive, normalize separators)
        $found = $false
        foreach ($def in $definedFlags.Keys) {
          if ($def.ToLower().Replace("-", "_") -eq $normalized) {
            $usedFlags[$def] = $true
            $found = $true
            break
          }
        }
        if (-not $found) {
          $unknownFlags[$flagId] = $true
        }
      }
    }
  }

  # Also search for feature flag env vars
  $envResults = rg --no-heading --no-filename 'NEXT_PUBLIC_FEATURE_(\w+)' $searchPath --glob '!**/node_modules/**' --glob '!**/.next/**' 2>$null
  if ($envResults) {
    # These are covered by the env fallback in flags.ts
  }
}

Write-Host "Used flags: $($usedFlags.Count)" -ForegroundColor DarkGray
Write-Host ""

# Step 3: Report
$ungated = @()
foreach ($def in $definedFlags.Keys) {
  if (-not $usedFlags.ContainsKey($def)) {
    $ungated += $def
  }
}

if ($ungated.Count -gt 0) {
  Write-Host "UNGATED FLAGS (defined but never checked in code):" -ForegroundColor Yellow
  foreach ($f in $ungated | Sort-Object) {
    Write-Host "  $f" -ForegroundColor Yellow
  }
  Write-Host ""
} else {
  Write-Host "All defined flags are gated." -ForegroundColor Green
  Write-Host ""
}

if ($unknownFlags.Count -gt 0) {
  Write-Host "UNKNOWN FLAGS (passed to isEnabled but not defined):" -ForegroundColor Red
  foreach ($f in $unknownFlags.Keys | Sort-Object) {
    Write-Host "  $f" -ForegroundColor Red
  }
  Write-Host ""
}

Write-Host "Defined: $($definedFlags.Count)  |  Gated: $($usedFlags.Count)  |  Ungated: $($ungated.Count)  |  Unknown: $($unknownFlags.Count)" -ForegroundColor Cyan

# Exit code: warn on ungated, fail on unknown
if ($unknownFlags.Count -gt 0) {
  Write-Host ""
  Write-Host "ACTION REQUIRED: $($unknownFlags.Count) unknown flags detected." -ForegroundColor Red
  exit 1
}

if ($ungated.Count -gt 0) {
  Write-Host ""
  Write-Host "WARNING: $($ungated.Count) flags are defined but never gated. Consider adding gating or removing the flag." -ForegroundColor Yellow
  # Warning only — don't fail CI for ungated flags (may be intentional)
}

exit 0
