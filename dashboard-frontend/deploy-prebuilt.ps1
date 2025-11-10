# Automated Vercel Prebuilt Deployment Script

# Step 1: Create .vercel/output structure
Write-Host "Creating .vercel/output structure..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path ".vercel\output\static" | Out-Null
New-Item -ItemType Directory -Force -Path ".vercel\output\functions" | Out-Null

# Step 2: Copy built frontend
Write-Host "Copying built frontend..." -ForegroundColor Green
Copy-Item -Path "dist\kpi-dashboard\*" -Destination ".vercel\output\static\" -Recurse -Force

# Step 3: Copy API functions
Write-Host "Copying API functions..." -ForegroundColor Green
Copy-Item -Path "api" -Destination ".vercel\output\functions\" -Recurse -Force

# Step 4: Create config.json
Write-Host "Creating config.json..." -ForegroundColor Green
$config = @{
    version = 3
    routes = @(
        @{
            src = "/api/(.*)"
            dest = "/api/`$1"
        },
        @{
            handle = "filesystem"
        },
        @{
            src = "/(.*)"
            dest = "/index.html"
        }
    )
} | ConvertTo-Json -Depth 10

$config | Out-File -FilePath ".vercel\output\config.json" -Encoding utf8

Write-Host "`n.vercel/output structure created successfully!" -ForegroundColor Green
Write-Host "`nNow run: vercel deploy --prebuilt --prod" -ForegroundColor Yellow
Write-Host "`nNote: You will need to answer these questions:" -ForegroundColor Cyan
Write-Host "  1. Set up? -> Y" -ForegroundColor White
Write-Host "  2. Which scope? -> [Your Vercel account]" -ForegroundColor White
Write-Host "  3. Link to existing project? -> Y" -ForegroundColor White
Write-Host "  4. Project name? -> kpi-dashboard-eight" -ForegroundColor White

