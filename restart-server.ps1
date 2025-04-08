# PowerShell script to restart the Next.js server
Write-Host "Stopping any running Next.js server..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*" } | Stop-Process -Force

Write-Host "Starting Next.js server..."
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "C:\Users\Nana-YawIsrael\Documents\delika-product-website"

Write-Host "Next.js server restarted successfully!" 