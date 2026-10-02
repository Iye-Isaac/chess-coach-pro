$ErrorActionPreference = 'Stop'

$nodeBin = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin'
$pnpm = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'

if (-not (Test-Path (Join-Path $nodeBin 'node.exe')) -or -not (Test-Path $pnpm)) {
  throw 'The bundled Node runtime was not found for this Windows user.'
}

$env:PATH = "$nodeBin;$env:PATH"
$env:EXPO_HOME = Join-Path $PSScriptRoot '.expo'
$env:EXPO_NO_TELEMETRY = '1'
$env:EAS_NO_VCS = '1'
Push-Location $PSScriptRoot
try {
  & $pnpm dlx eas-cli build --profile development --platform android --no-wait
} finally {
  Pop-Location
}
