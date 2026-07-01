$NodeExe = "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot
Write-Host "Starting PlateauCare EHR..."
Write-Host "Open http://localhost:8080 in your browser."
& $NodeExe "server\server.js"
