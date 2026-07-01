@echo off
set "NODE_EXE=C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
cd /d "%~dp0"
"%NODE_EXE%" "server\server.js"
