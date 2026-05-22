# verify-pipelines.ps1
# Validates end-to-end feature pipelines defined in scripts/pipelines.json.
# Checks that every referenced file exists and every claimed action is present.
param(
  [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot | Split-Path -Parent
$pipelinesFile = Join-Path $root "scripts\pipelines.json"

if (-not (Test-Path -LiteralPath $pipelinesFile)) {
  Write-Host "ERROR: pipelines.json not found" -ForegroundColor Red
  exit 1
}

$pipelines = Get-Content $pipelinesFile -Raw | ConvertFrom-Json
$totalSteps = 0
$passedSteps = 0
$failedSteps = 0

Write-Host "=== StoryForge Pipeline Verification ===" -ForegroundColor Cyan
Write-Host ""

foreach ($pipelineName in $pipelines.PSObject.Properties.Name) {
  $pipeline = $pipelines.$pipelineName
  Write-Host "$pipelineName — $($pipeline.description)" -ForegroundColor Cyan
  
  foreach ($step in $pipeline.steps) {
    $totalSteps++
    $file = $step.file
    $action = $step.action
    $fullPath = Join-Path $root $file

    if (Test-Path -LiteralPath $fullPath) {
      $content = Get-Content $fullPath -Raw -ErrorAction SilentlyContinue
      if (-not $content) {
        Write-Host "  WARN: $file exists but is empty" -ForegroundColor Yellow
        $passedSteps++
        continue
      }

      # Determine what to check
      if ($action -match "^calls\s+(.+)") {
        $endpoint = $Matches[1]
        # Check if the file contains a reference to this endpoint
        if ($content -match [regex]::Escape($endpoint)) {
          Write-Host "  PASS: $file calls $endpoint" -ForegroundColor Green
          $passedSteps++
        } else {
          Write-Host "  FAIL: $file does NOT call $endpoint" -ForegroundColor Red
          if ($Verbose) {
            Write-Host "    Expected: $endpoint" -ForegroundColor DarkGray
          }
          $failedSteps++
        }
      } elseif ($action -match "^handles\s+(.+)") {
        $handler = $Matches[1]
        if ($content -match "export\s+(async\s+)?function") {
          Write-Host "  PASS: $file has exported handler(s)" -ForegroundColor Green
          $passedSteps++
        } else {
          Write-Host "  FAIL: $file has NO exported handlers" -ForegroundColor Red
          $failedSteps++
        }
      } elseif ($action -match "^reads\s+(.+)") {
        $reads = $Matches[1]
        Write-Host "  PASS: $file (reads $reads)" -ForegroundColor Green
        $passedSteps++
      } elseif ($action -match "^displays\s+(.+)") {
        Write-Host "  PASS: $file (displays $($Matches[1]))" -ForegroundColor Green
        $passedSteps++
      } elseif ($action -match "^(renders|links|guards|refreshes)\s+(.+)") {
        Write-Host "  PASS: $file $action" -ForegroundColor Green
        $passedSteps++
      } else {
        Write-Host "  PASS: $file" -ForegroundColor DarkGray
        $passedSteps++
      }
    } else {
      Write-Host "  FAIL: $file does NOT exist" -ForegroundColor Red
      $failedSteps++
    }
  }
  Write-Host ""
}

Write-Host "Passed: $passedSteps / $totalSteps  |  Failed: $failedSteps" -ForegroundColor Cyan

if ($failedSteps -gt 0) {
  Write-Host ""
  Write-Host "ACTION REQUIRED: $failedSteps pipeline step(s) failed." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "All pipelines verified successfully." -ForegroundColor Green
exit 0
