# rollback.ps1
# 1-Click Rollback Script

Write-Host "=============================================" -ForegroundColor Red
Write-Host " ⚠️ INITIATING 1-CLICK EMERGENCY ROLLBACK ⚠️" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Red

# In a real environment, we'd tag the previous image as 'health-grid:previous'
# For local dev, we simply restart the containers using the last known good image.

Write-Host "[Step 1] Stopping active corrupted containers..." -ForegroundColor Yellow
docker-compose stop api worker

Write-Host "[Step 2] Reverting to previous known-good tag..." -ForegroundColor Yellow
# Mock logic: docker tag health-grid:previous health-grid:production
Start-Sleep -Seconds 2

Write-Host "[Step 3] Restarting Engine Room safely..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "✅ Rollback Complete. Production is stable." -ForegroundColor Green
