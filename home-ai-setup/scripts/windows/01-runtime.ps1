# 01-runtime.ps1 — Windows: install Ollama, bind to loopback, disable cloud features, auto-start.
[CmdletBinding()]
param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$InformationPreference = 'Continue'

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------
$OllamaHost = if ($env:OLLAMA_HOST) { $env:OLLAMA_HOST } else { '127.0.0.1:11434' }
$OllamaOrigins = if ($env:OLLAMA_ORIGINS) { $env:OLLAMA_ORIGINS } else { 'http://localhost,https://localhost,http://127.0.0.1,https://127.0.0.1' }

function Invoke-Run {
    param([scriptblock]$Action, [string]$Description)
    if ($DryRun) {
        Write-Information "[dry-run] $Description"
    } else {
        Write-Information "+ $Description"
        & $Action
    }
}

function Test-OllamaInstalled {
    return [bool](Get-Command ollama -ErrorAction SilentlyContinue)
}

function Install-Ollama {
    if (Test-OllamaInstalled) {
        $ver = (ollama --version 2>$null) -join ' '
        Write-Information "Ollama already installed: $ver"
        return
    }

    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Invoke-Run { winget install --id Ollama.Ollama --source winget -e --accept-package-agreements --accept-source-agreements } `
            "winget install --id Ollama.Ollama"
    } else {
        throw "winget not found. Install Ollama manually from https://ollama.com/download/windows"
    }
}

function Set-OllamaEnvironment {
    Invoke-Run {
        [Environment]::SetEnvironmentVariable('OLLAMA_HOST', $OllamaHost, 'User')
        [Environment]::SetEnvironmentVariable('OLLAMA_NO_CLOUD', '1', 'User')
        [Environment]::SetEnvironmentVariable('OLLAMA_NOHISTORY', '1', 'User')
        [Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', $OllamaOrigins, 'User')
        # Also set in current process so the rest of the session sees them.
        $env:OLLAMA_HOST = $OllamaHost
        $env:OLLAMA_NO_CLOUD = '1'
        $env:OLLAMA_NOHISTORY = '1'
        $env:OLLAMA_ORIGINS = $OllamaOrigins
    } "Set OLLAMA_* user environment variables"
}

function Write-OllamaServerJson {
    $dir = Join-Path $env:USERPROFILE '.ollama'
    Invoke-Run {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        '{"disable_ollama_cloud":true}' | Set-Content -Path (Join-Path $dir 'server.json') -Encoding utf8
    } "Write $dir\server.json with disable_ollama_cloud=true"
}

function Start-OllamaService {
    $service = Get-Service -Name 'Ollama' -ErrorAction SilentlyContinue
    if (-not $service) {
        Write-Warning "Ollama service not found. The Ollama app should be started manually after installation."
        return
    }

    Invoke-Run {
        Set-Service -Name 'Ollama' -StartupType Automatic
        if ($service.Status -ne 'Running') {
            Start-Service -Name 'Ollama'
        } else {
            Restart-Service -Name 'Ollama'
        }
    } "Set Ollama service to Automatic and start/restart it"
}

function Write-ThermalsNote {
    Write-Information ''
    Write-Information 'Power / thermals sanity check:'
    Write-Information '  - If this is an always-on box, set Power & sleep to Never sleep when plugged in.'
    Write-Information '  - Ensure the machine has adequate airflow; sustained inference can run hot.'
    Write-Information '  - Laptops used as always-on servers should stay plugged in and ventilated.'
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
Write-Information "=== Home AI Setup — Windows runtime layer ==="
Write-Information "OLLAMA_HOST=$OllamaHost"
Write-Information "DRY_RUN=$DryRun"
Write-Information ''

Install-Ollama
Set-OllamaEnvironment
Write-OllamaServerJson
Start-OllamaService
Write-ThermalsNote

Write-Information ''
Write-Information '=== Runtime layer complete ==='
if ($DryRun) {
    Write-Information '(dry-run: no changes were made)'
}
