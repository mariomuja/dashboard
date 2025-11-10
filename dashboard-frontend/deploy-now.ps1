# Deploy to Vercel with project name
Write-Host "Starting Vercel deployment..." -ForegroundColor Green
Write-Host "Project: international-kpi-dashboard" -ForegroundColor Cyan

# The deployment will ask interactively for project linking
# User needs to answer:
#   1. Set up? -> Y
#   2. Which scope? -> [Their account]
#   3. Link to existing project? -> Y
#   4. Project name? -> international-kpi-dashboard

vercel deploy --prebuilt --prod --yes

Write-Host "`nIf the deployment asks for project name, enter: international-kpi-dashboard" -ForegroundColor Yellow


