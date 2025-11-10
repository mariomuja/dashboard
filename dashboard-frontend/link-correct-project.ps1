# Link to correct Vercel project: international-kpi-dashboard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vercel Project Linking Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will link to the CORRECT project:" -ForegroundColor Green
Write-Host "  → international-kpi-dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting vercel link..." -ForegroundColor Green
Write-Host ""
Write-Host "When prompted, answer:" -ForegroundColor Cyan
Write-Host "  1. Set up ...? → Y" -ForegroundColor White
Write-Host "  2. Which scope? → mario-muja" -ForegroundColor White
Write-Host "  3. Link to existing? → Y" -ForegroundColor White
Write-Host "  4. Project name? → international-kpi-dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to continue..." -ForegroundColor Green
$null = Read-Host

# Run vercel link
vercel link

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Link completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can deploy with:" -ForegroundColor Cyan
Write-Host "  vercel deploy --prebuilt --prod" -ForegroundColor Yellow
Write-Host ""


