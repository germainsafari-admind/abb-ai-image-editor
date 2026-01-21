# PowerShell script to sync changes from root to Hugging Face directory
# Usage: .\sync-to-hf.ps1

Write-Host "🔄 Syncing changes from root to Hugging Face directory..." -ForegroundColor Cyan

$rootDir = Get-Location
$hfDir = Join-Path $rootDir "abbaiphotoeditor"

# Directories and files to sync (excluding git-related files)
$itemsToSync = @(
    "app",
    "components",
    "lib",
    "types",
    "hooks",
    "public",
    "styles",
    "package.json",
    "pnpm-lock.yaml",
    "next.config.mjs",
    "tsconfig.json",
    "components.json",
    "postcss.config.mjs",
    "next-env.d.ts",
    ".gitattributes",
    "Dockerfile"
)

$excludePatterns = @(
    ".git",
    "node_modules",
    ".next",
    ".DS_Store"
)

Write-Host "📁 Copying files..." -ForegroundColor Yellow

foreach ($item in $itemsToSync) {
    $source = Join-Path $rootDir $item
    $dest = Join-Path $hfDir $item
    
    if (Test-Path $source) {
        if (Test-Path $dest) {
            Write-Host "  Updating: $item" -ForegroundColor Gray
            Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "  Adding: $item" -ForegroundColor Gray
        }
        
        Copy-Item -Path $source -Destination $dest -Recurse -Force -Exclude $excludePatterns
    } else {
        Write-Host "  ⚠️  Not found: $item" -ForegroundColor Yellow
    }
}

Write-Host ''
Write-Host 'Sync complete!' -ForegroundColor Green
Write-Host ''
Write-Host 'Next steps:' -ForegroundColor Cyan
Write-Host '  1. cd abbaiphotoeditor' -ForegroundColor White
Write-Host '  2. git status' -ForegroundColor White
Write-Host '  3. git add .' -ForegroundColor White
Write-Host '  4. git commit -m "Sync changes from root"' -ForegroundColor White
Write-Host '  5. git push origin main' -ForegroundColor White

