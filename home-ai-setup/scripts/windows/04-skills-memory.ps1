# 04-skills-memory.ps1 — Windows: seed skills and create memory/knowledge layout.
[CmdletBinding()]
param(
    [string]$SeedDir,
    [string]$AgentsTemplate,
    [string]$SkillsHome = (Join-Path $env:USERPROFILE '.agents\skills'),
    [string]$KimiSkillsHome = (Join-Path $env:USERPROFILE '.kimi-code\skills'),
    [string]$HomeAiRoot = (Join-Path $env:USERPROFILE 'WebotHomeAI'),
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$InformationPreference = 'Continue'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $SeedDir) { $SeedDir = Join-Path $ScriptDir '..\..\seed-skills' }
if (-not $AgentsTemplate) { $AgentsTemplate = Join-Path $ScriptDir '..\..\client-template\AGENTS.md' }

$SeedSkills = @('capture', 'fast', 'help', 'home-ai-baseline', 'verify-work')

function Invoke-Run {
    param([scriptblock]$Action, [string]$Description)
    if ($DryRun) {
        Write-Information "[dry-run] $Description"
    } else {
        Write-Information "+ $Description"
        & $Action
    }
}

function Copy-Skill {
    param([string]$Name)
    $src = Join-Path $SeedDir $Name
    if (-not (Test-Path $src -PathType Container)) {
        throw "Seed skill not found: $src"
    }
    foreach ($destRoot in @($SkillsHome, $KimiSkillsHome)) {
        $dest = Join-Path $destRoot $Name
        if (Test-Path $dest -PathType Container) {
            Write-Information "Skill already exists: $dest (skipping)"
        } else {
            Invoke-Run { New-Item -ItemType Directory -Force -Path $destRoot | Out-Null; Copy-Item -Recurse -Path $src -Destination $dest } "Copy $src -> $dest"
        }
    }
}

function Initialize-MemoryLayout {
    Write-Information "Creating home AI memory and knowledge layout under $HomeAiRoot..."
    $dirs = @(
        (Join-Path $HomeAiRoot 'memory\seeds'),
        (Join-Path $HomeAiRoot 'knowledge\notes'),
        (Join-Path $HomeAiRoot 'knowledge\documents'),
        (Join-Path $HomeAiRoot 'projects'),
        (Join-Path $HomeAiRoot 'backups')
    )
    foreach ($d in $dirs) {
        Invoke-Run { New-Item -ItemType Directory -Force -Path $d | Out-Null } "mkdir $d"
    }

    $inbox = Join-Path $HomeAiRoot 'memory\inbox.md'
    if ($DryRun) {
        Write-Information "[dry-run] ensure $inbox exists"
    } elseif (-not (Test-Path $inbox)) {
        '# Inbox' | Set-Content -Path $inbox -Encoding utf8
    }

    if (Test-Path $AgentsTemplate) {
        $destAgents = Join-Path $HomeAiRoot 'AGENTS.md'
        if ($DryRun) {
            Write-Information "[dry-run] Copy $AgentsTemplate -> $destAgents"
        } elseif (-not (Test-Path $destAgents)) {
            Invoke-Run { Copy-Item -Path $AgentsTemplate -Destination $destAgents } "Copy $AgentsTemplate -> $destAgents"
        } else {
            Write-Information "Project AGENTS.md already exists: $destAgents (skipping)"
        }
    } else {
        Write-Warning "AGENTS.md template not found at $AgentsTemplate"
    }
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
Write-Information "=== Home AI Setup — Windows skills & memory layer ==="
Write-Information "SEED_DIR=$SeedDir"
Write-Information "SKILLS_HOME=$SkillsHome"
Write-Information "HOME_AI_ROOT=$HomeAiRoot"
Write-Information "DRY_RUN=$DryRun"
Write-Information ''

foreach ($skill in $SeedSkills) {
    Copy-Skill -Name $skill
}

Initialize-MemoryLayout

Write-Information ''
Write-Information '=== Skills & memory layer complete ==='
if ($DryRun) {
    Write-Information '(dry-run: no changes were made)'
}
