# 02-models.ps1 — Windows: pull tier-matched Ollama models and smoke-test.
[CmdletBinding()]
param(
    [int]$Tier = 2,   # 1, 2, 3, or 4
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$InformationPreference = 'Continue'

# -----------------------------------------------------------------------------
# Variables — refresh these picks at install time.
# -----------------------------------------------------------------------------
$Tier1Models = @('qwen2.5:3b', 'llama3.2:3b')
$Tier2Models = @('qwen2.5:14b', 'gemma3:12b', 'mistral-small:22b')
$Tier3Models = @('qwen2.5:32b', 'qwen2.5-coder:32b')
$Tier4Models = @('qwen2.5:72b', 'llama3.1:70b')

$SmokePrompt = 'Say hello in exactly one sentence.'

function Get-ModelsForTier {
    switch ($Tier) {
        1 { return $Tier1Models }
        2 { return $Tier2Models }
        3 { return $Tier3Models }
        4 { return $Tier4Models }
        default { throw "Invalid Tier: $Tier (must be 1-4)" }
    }
}

function Invoke-Run {
    param([scriptblock]$Action, [string]$Description)
    if ($DryRun) {
        Write-Information "[dry-run] $Description"
    } else {
        Write-Information "+ $Description"
        & $Action
    }
}

function Test-ModelPresent {
    param([string]$Model)
    if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) { return $false }
    $list = ollama list 2>$null | ForEach-Object { ($_ -split '\s+')[0] }
    return $list -contains $Model
}

function Pull-Model {
    param([string]$Model)
    if (Test-ModelPresent -Model $Model) {
        Write-Information "Model already present: $Model"
    } else {
        Invoke-Run { ollama pull $Model } "ollama pull $Model"
    }
}

function Invoke-SmokeTest {
    param([string]$Model)
    Write-Information "Smoke-testing model: $Model"
    if ($DryRun) {
        Write-Information "[dry-run] ollama run $Model '$SmokePrompt'"
        return
    }
    $job = Start-Job { param($m, $p) ollama run $m $p } -ArgumentList $Model, $SmokePrompt
    $completed = $job | Wait-Job -Timeout 300
    if (-not $completed) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
        Write-Warning "Smoke test for $Model timed out."
        return
    }
    Receive-Job $job | Out-String | Write-Information
    Remove-Job $job
    Write-Information "PASS: model responded."
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
Write-Information "=== Home AI Setup — Windows model layer ==="
Write-Information "Tier=$Tier"
Write-Information "Models: $((Get-ModelsForTier) -join ', ')"
Write-Information "DRY_RUN=$DryRun"
Write-Information ''

if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    throw "ollama command not found. Run 01-runtime.ps1 first."
}

if (-not $DryRun) {
    try {
        $null = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Warning "Ollama server not responding on 127.0.0.1:11434. Attempting to start service..."
        Start-Service -Name 'Ollama' -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
}

$models = Get-ModelsForTier
foreach ($m in $models) {
    Pull-Model -Model $m
}

Invoke-SmokeTest -Model $models[0]

Write-Information ''
Write-Information '=== Model layer complete ==='
if ($DryRun) {
    Write-Information '(dry-run: no changes were made)'
}
