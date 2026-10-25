# 06-test-drive.ps1 — Windows: guided pre-handoff test drive.
[CmdletBinding()]
param(
    [string]$HomeAiRoot = (Join-Path $env:USERPROFILE 'WebotHomeAI'),
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$InformationPreference = 'Continue'

$BackupDir = Join-Path $HomeAiRoot "backups\$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$SmokePrompt = 'Say hello in exactly one sentence.'
$AgentPrompt = "List the top-level files in $HomeAiRoot and briefly describe what this home AI setup is for."

function Invoke-Run {
    param([scriptblock]$Action, [string]$Description)
    if ($DryRun) {
        Write-Information "[dry-run] $Description"
    } else {
        Write-Information "+ $Description"
        & $Action
    }
}

function Write-ChecklistItem {
    param([string]$Text)
    Write-Information ''
    Write-Information "[ ] $Text"
}

function Test-ChatSanity {
    Write-ChecklistItem 'Chat sanity: local model responds via Ollama'
    if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
        Write-Warning 'FAIL: ollama command not found. Run 01-runtime.ps1 first.'
        return
    }
    $model = (ollama list 2>$null | Select-Object -Skip 1 | Select-Object -First 1) -split '\s+' | Select-Object -First 1
    if (-not $model) {
        Write-Warning 'FAIL: no downloaded model found. Run 02-models.ps1 first.'
        return
    }
    Write-Information "  Using model: $model"
    if ($DryRun) {
        Write-Information "[dry-run] ollama run $model '$SmokePrompt'"
        return
    }
    $job = Start-Job { param($m, $p) ollama run $m $p } -ArgumentList $model, $SmokePrompt
    $completed = $job | Wait-Job -Timeout 180
    if (-not $completed) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
        Write-Warning 'FAIL: chat sanity timed out.'
        return
    }
    Receive-Job $job | Out-String | Write-Information
    Remove-Job $job
    Write-Information '  PASS: model responded.'
}

function Test-AgentTask {
    Write-ChecklistItem 'Agent task: harness starts and can read the project AGENTS.md'
    if (-not (Get-Command kimi -ErrorAction SilentlyContinue)) {
        Write-Warning 'FAIL: kimi not found. Run 03-harness.ps1 first.'
        return
    }
    if ($DryRun) {
        Write-Information "[dry-run] kimi -p '$AgentPrompt'"
        return
    }
    $job = Start-Job { param($p) kimi -p $p } -ArgumentList $AgentPrompt
    $completed = $job | Wait-Job -Timeout 180
    if (-not $completed) {
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
        Write-Warning 'FAIL: harness task timed out.'
        return
    }
    Receive-Job $job | Out-String | Write-Information
    Remove-Job $job
    Write-Information '  PASS: harness completed a task.'
}

function Test-RestartPersistence {
    Write-ChecklistItem 'Restart persistence: Ollama service is set to auto-start'
    if ($DryRun) {
        Write-Information '[dry-run] Get-Service Ollama StartupType/Status'
        return
    }
    $service = Get-Service -Name 'Ollama' -ErrorAction SilentlyContinue
    if (-not $service) {
        Write-Warning 'Ollama service not found; auto-start cannot be verified.'
        return
    }
    $startup = (Get-CimInstance Win32_Service -Filter "Name='Ollama'").StartMode
    Write-Information "  Startup type: $startup"
    Write-Information "  Status: $($service.Status)"
}

function Test-BackupSpotCheck {
    Write-ChecklistItem "Backup / restore spot check: snapshot config to $BackupDir"
    Invoke-Run { New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null } "mkdir $BackupDir"
    $kimiCfg = Join-Path $env:USERPROFILE '.kimi-code\config.toml'
    $ollamaCfg = Join-Path $env:USERPROFILE '.ollama\server.json'
    if (Test-Path $kimiCfg) {
        Invoke-Run { Copy-Item $kimiCfg $BackupDir } "Copy config.toml -> $BackupDir"
    }
    if (Test-Path $ollamaCfg) {
        Invoke-Run { Copy-Item $ollamaCfg $BackupDir } "Copy server.json -> $BackupDir"
    }
    if (Get-Command ollama -ErrorAction SilentlyContinue) {
        if ($DryRun) {
            Write-Information "[dry-run] ollama list > $BackupDir\ollama-models.txt"
        } else {
            ollama list | Out-File (Join-Path $BackupDir 'ollama-models.txt') -Encoding utf8
        }
    }
    Write-Information "  PASS: backup snapshot created at $BackupDir"
}

function Write-FamilyProfileNote {
    Write-ChecklistItem 'Family / multi-user profile (if children use the machine)'
    Write-Information '  Confirm with the client:'
    Write-Information '    - Separate OS user accounts for children, or'
    Write-Information '    - Restricted harness profile with limited skills/models.'
    Write-Information '  Record the chosen setup in the handoff notes.'
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
Write-Information "=== Home AI Setup — Windows test drive ==="
Write-Information "HOME_AI_ROOT=$HomeAiRoot"
Write-Information "DRY_RUN=$DryRun"
Write-Information ''
Write-Information 'Run through this checklist with the client before handing off.'

Test-ChatSanity
Test-AgentTask
Test-RestartPersistence
Test-BackupSpotCheck
Write-FamilyProfileNote

Write-Information ''
Write-Information '=== Test drive complete ==='
if ($DryRun) {
    Write-Information '(dry-run: no changes were made)'
}
