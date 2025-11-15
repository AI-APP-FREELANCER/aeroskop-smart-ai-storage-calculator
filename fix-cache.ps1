# PowerShell script to clear Next.js cache and restart
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Stop any running Node processes (optional - be careful)
# Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Remove .next folder
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Deleted .next folder" -ForegroundColor Green
} else {
    Write-Host "⚠ .next folder not found" -ForegroundColor Yellow
}

# Remove node_modules/.cache if exists
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "✓ Deleted node_modules/.cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "Cache cleared! Now restart your dev server:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then hard refresh your browser: Ctrl+Shift+R" -ForegroundColor Cyan

