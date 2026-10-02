param([switch]$DevClient)

$ErrorActionPreference = 'Stop'

$nodeBin = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$pnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
$sdk = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } elseif ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }

if (-not (Test-Path (Join-Path $nodeBin 'node.exe')) -or -not (Test-Path $pnpm)) {
  throw 'The bundled Node runtime was not found for this Windows user.'
}

$env:PATH = "$nodeBin;$env:PATH"
if (Test-Path (Join-Path $sdk 'platform-tools\adb.exe')) {
  $env:PATH = "$sdk\platform-tools;$sdk\emulator;$env:PATH"
  $env:ANDROID_HOME = $sdk
  $env:ANDROID_SDK_ROOT = $sdk
}
$env:EXPO_HOME = Join-Path $PSScriptRoot '.expo'
$env:EXPO_NO_TELEMETRY = '1'
Push-Location $PSScriptRoot
try {
  if ($DevClient) {
    & $pnpm exec expo start --dev-client --lan --port 8083
  } else {
    & $pnpm exec expo start --lan --port 8083
  }
} finally {
  Pop-Location
}
