# 05-privacy.ps1 — Windows: disable telemetry and cloud features for Ollama and Kimi Code CLI.
[CmdletBinding()]
param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$InformationPreference = 'Continue'

$KimiHome = if ($env:KIMI_CODE_HOME) { $env:KIMI_CODE_HOME } else { Join-Path $env:USERPROFILE '.kimi-code' }

function Invoke-Run {
    param([scriptblock]$Action, [string]$Description)
    if ($DryRun) {
        Write-Information "[dry-run] $Description"
    } else {
        Write-Information "+ $Description"
        & $Action
    }
}

function Set-OllamaPrivacy {
    Write-Information 'Applying Ollama privacy settings...'
    $dir = Join-Path $env:USERPROFILE '.ollama'
    Invoke-Run {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        '{"disable_ollama_cloud":true}' | Set-Content -Path (Join-Path $dir 'server.json') -Encoding utf8
        [Environment]::SetEnvironmentVariable('OLLAMA_NO_CLOUD', '1', 'User')
        [Environment]::SetEnvironmentVariable('OLLAMA_NOHISTORY', '1', 'User')
        $env:OLLAMA_NO_CLOUD = '1'
        $env:OLLAMA_NOHISTORY = '1'
    } "Write $dir\server.json and set OLLAMA_NO_CLOUD / OLLAMA_NOHISTORY"

    $service = Get-Service -Name 'Ollama' -ErrorAction SilentlyContinue
    if ($service -and -not $DryRun) {
        Restart-Service -Name 'Ollama' -ErrorAction SilentlyContinue
    } elseif ($DryRun) {
        Write-Information '[dry-run] Restart Ollama service'
    }
}

function Set-KimiPrivacy {
    Write-Information 'Applying Kimi Code CLI privacy settings...'
    if ($DryRun) {
        Write-Information "[dry-run] Update $KimiHome\config.toml to disable telemetry/surveys"
        Write-Information "[dry-run] Update $KimiHome\tui.toml to disable auto-update"
        Write-Information '[dry-run] Set KIMI_DISABLE_TELEMETRY user environment variable'
        return
    }

    New-Item -ItemType Directory -Force -Path $KimiHome | Out-Null

    $cfg = Join-Path $KimiHome 'config.toml'
    if (Test-Path $cfg) {
        (Get-Content $cfg -Raw) `
            -replace 'telemetry\s*=\s*true', 'telemetry = false' `
            -replace 'disable_feedback_survey\s*=\s*false', 'disable_feedback_survey = true' `
            -replace 'auto_session_title\s*=\s*true', 'auto_session_title = false' `
            -replace 'builtin_product_skills\s*=\s*true', 'builtin_product_skills = false' |
            Set-Content $cfg -Encoding utf8
    } else {
        @'
telemetry = false
disable_feedback_survey = true
auto_session_title = false
builtin_product_skills = false
'@ | Set-Content $cfg -Encoding utf8
    }

    $tui = Join-Path $KimiHome 'tui.toml'
    if (Test-Path $tui) {
        $content = Get-Content $tui -Raw
        if ($content -match '\[upgrade\]') {
            $content -replace 'auto_install\s*=\s*true', 'auto_install = false' | Set-Content $tui -Encoding utf8
        } else {
            Add-Content $tui -Value "`n[upgrade]`nauto_install = false`n" -Encoding utf8
        }
    } else {
        @'
[upgrade]
auto_install = false
'@ | Set-Content $tui -Encoding utf8
    }

    [Environment]::SetEnvironmentVariable('KIMI_DISABLE_TELEMETRY', '1', 'User')
    $env:KIMI_DISABLE_TELEMETRY = '1'
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
Write-Information "=== Home AI Setup — Windows privacy layer ==="
Write-Information "KIMI_HOME=$KimiHome"
Write-Information "DRY_RUN=$DryRun"
Write-Information ''

Set-OllamaPrivacy
Set-KimiPrivacy

Write-Information ''
Write-Information '=== Privacy layer complete ==='
Write-Information '  Ollama cloud features disabled, history disabled.'
Write-Information '  Kimi telemetry off, auto-surveys off, auto-updates off.'
if ($DryRun) {
    Write-Information '(dry-run: no changes were made)'
}
