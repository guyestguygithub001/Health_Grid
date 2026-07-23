@echo off
echo Starting Health Grid EMR Server...
start "Health Grid EMR" cmd /k "set PORT=8085 && node server/server.js"

echo Starting Cloudflare Secure Tunnel...
echo Please copy the https://....trycloudflare.com link once it generates.
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --url http://localhost:8085"
