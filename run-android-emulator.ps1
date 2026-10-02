$ErrorActionPreference = 'Stop'

$nodeBin = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$pnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
$sdk = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } elseif ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$adb = Join-Path $sdk 'platform-tools\adb.exe'

if (-not (Test-Path (Join-Path $nodeBin 'node.exe')) -or -not (Test-Path $pnpm)) {
  throw 'The bundled Node runtime was not found for this Windows user.'
}
if (-not (Test-Path $adb)) {
  throw "Android SDK Platform-Tools were not found at $adb. Install Android SDK Platform-Tools in Android Studio, then set ANDROID_HOME or ANDROID_SDK_ROOT to your SDK folder."
}

$env:PATH = "$nodeBin;$sdk\platform-tools;$sdk\emulator;$env:PATH"
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
$env:EXPO_HOME = Join-Path $PSScriptRoot '.expo'
$env:EXPO_NO_TELEMETRY = '1'
$env:EAS_NO_VCS = '1'
Push-Location $PSScriptRoot
try {
  & $pnpm dlx eas-cli build:run --platform android --latest
} finally {
  Pop-Location
}
