Param(
  [string]$OutFile = "affiliate-rewards-extension.zip"
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (Test-Path $OutFile) { Remove-Item $OutFile }

$include = @(
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'styles/popup.css',
  'data/affiliate-list.json',
  'icons/icon16.png',
  'icons/icon48.png',
  'icons/icon128.png',
  'README.md',
  'PRIVACY.md',
  'LICENSE'
)

$files = $include | Where-Object { Test-Path $_ }
if (-not $files.Count) { throw 'No files found to package.' }

# Ensure icons exist (generate if script present and any missing)
$iconMissing = @('icons/icon16.png','icons/icon48.png','icons/icon128.png') | Where-Object { -not (Test-Path $_) }
if ($iconMissing.Count -gt 0 -and (Test-Path 'generate-icons.ps1')) {
  Write-Host 'Missing icons detected. Generating...' -ForegroundColor Yellow
  powershell -ExecutionPolicy Bypass -File ./generate-icons.ps1 -Letter 'R' | Out-Null
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipTmp = [System.IO.Path]::Combine($env:TEMP, [System.IO.Path]::GetRandomFileName())
[System.IO.Directory]::CreateDirectory($zipTmp) | Out-Null

foreach ($f in $files) {
  $destDir = Join-Path $zipTmp (Split-Path $f -Parent)
  if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
  Copy-Item $f (Join-Path $zipTmp $f)
}

if (Test-Path $OutFile) { Remove-Item $OutFile }
[System.IO.Compression.ZipFile]::CreateFromDirectory($zipTmp, $OutFile, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Remove-Item $zipTmp -Recurse -Force

Write-Host "Created $OutFile" -ForegroundColor Green
