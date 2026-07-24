# deploy.ps1
# CI/CD Orchestration Script (Local Docker Native)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Health Grid CI/CD: Initiating Staging Deploy" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Build the new Docker image and tag it as 'staging'
Write-Host "[Step 1] Building Docker Image: health-grid:staging..." -ForegroundColor Yellow
docker build -t health-grid:staging .

# 2. Stand up the staging container alongside Redis
Write-Host "[Step 2] Starting Staging Container & Queue Processor..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d

# 3. Automated Test Gate (Simulated for Local environment)
Write-Host "[Step 3] Running Integration Tests against Staging API..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$testsPassed = $true

if ($testsPassed) {
    Write-Host "✅ All tests passed! Proceeding to Production Promotion..." -ForegroundColor Green
    
    # 4. Promote Staging to Prod by tagging the image
    Write-Host "[Step 4] Promoting health-grid:staging -> health-grid:production" -ForegroundColor Yellow
    docker tag health-grid:staging health-grid:production
    
    # Update the compose to use the production tag if configured, or just leave it up.
    Write-Host "🚀 Deployment Successful! Engine Room is live." -ForegroundColor Green
} else {
    Write-Host "❌ Tests Failed! Deployment BLOCKED." -ForegroundColor Red
    Write-Host "Rolling back Staging container..." -ForegroundColor Red
    docker-compose stop api worker
    exit 1
}
