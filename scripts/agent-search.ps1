# agent-search.ps1
# StoryForge content search script.
# Excludes heavy folders by default.
# Usage: .\scripts\agent-search.ps1 -Pattern "search term" [-Path "app\"] [-CaseSensitive]
param(
  [Parameter(Mandatory = $true)]
  [string]$Pattern,

  [string]$Path = ".",

  [switch]$CaseSensitive,

  [string[]]$Exclude = @("node_modules", ".next", "test-results", ".qodo", ".idea", "dist", ".git", "pnpm-lock.yaml")
)

$caseFlag = if ($CaseSensitive) { "" } else { "--ignore-case" }

$excludeArgs = @()
foreach ($dir in $Exclude) {
  $excludeArgs += "--glob"
  $excludeArgs += "!**/$dir/**"
}

Write-Host "Searching for: $Pattern" -ForegroundColor Cyan
Write-Host "Path: $Path" -ForegroundColor DarkGray
Write-Host "----------------------------------------" -ForegroundColor DarkGray

$cmd = "rg $caseFlag --line-number --no-heading $Pattern $Path $($excludeArgs -join ' ')"
Invoke-Expression $cmd
