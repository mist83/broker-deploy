# Deploy Agent to mikesendpoint.com
# Deploys facets and visualization to agent.mikesendpoint.com

param(
    [switch]$SkipFacetGeneration,
    [switch]$TestOnly
)

$ErrorActionPreference = "Stop"

Write-Host "Agent Deployment to mikesendpoint.com" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$subdomain = "agent"
$bucketName = "mikesendpoint-sites"
$s3Path = "s3://$bucketName/$subdomain/"
$indexLambdaUrl = "https://k6bcwlpyp56zmwr2gtahervzta0filrb.lambda-url.us-west-2.on.aws"

# Check if facets directory exists
if (-not (Test-Path "facets") -and -not $SkipFacetGeneration) {
    Write-Host "Facets directory not found. Generate facets first using AideaBloom." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps to generate facets:" -ForegroundColor Yellow
    Write-Host "1. Run AideaBloom: cd ../aidea-bloom && dotnet run" -ForegroundColor Gray
    Write-Host "2. Open http://localhost:5000" -ForegroundColor Gray
    Write-Host "3. Click 'Agent Rules' tab" -ForegroundColor Gray
    Write-Host "4. Click 'Import Rules' and select this directory" -ForegroundColor Gray
    Write-Host "5. Click 'Analyze Facets' button" -ForegroundColor Gray
    Write-Host "6. Click 'Generate Facet Files' in the modal" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Files to deploy
$filesToDeploy = @(
    "facets/*.facet",
    "facet-loader.clinerules",
    "rules-index.md",
    "README.md",
    "index.html"
)

Write-Host "Preparing deployment package..." -ForegroundColor Cyan

# Create temporary deployment directory
$tempDir = "$env:TEMP\agent-deploy-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copy files to temp directory
foreach ($pattern in $filesToDeploy) {
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        $destPath = Join-Path $tempDir $relativePath
        $destDir = Split-Path $destPath -Parent
        
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Copy-Item $file.FullName $destPath -Force
        Write-Host "  Copied: $relativePath" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Files prepared in: $tempDir" -ForegroundColor Green

if ($TestOnly) {
    Write-Host ""
    Write-Host "TEST MODE - Skipping actual deployment" -ForegroundColor Yellow
    Write-Host "Temp directory preserved at: $tempDir" -ForegroundColor Yellow
    exit 0
}

# Create ZIP file
$zipPath = "$env:TEMP\agent-deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host ""
Write-Host "Creating deployment ZIP..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force
Write-Host "ZIP created: $zipPath" -ForegroundColor Green

# Deploy via Index Lambda API
Write-Host ""
Write-Host "Deploying to $subdomain.mikesendpoint.com..." -ForegroundColor Cyan

try {
    $response = curl.exe -k -X POST -F "file=@$zipPath" "$indexLambdaUrl/api/deploy/$subdomain"
    Write-Host $response -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Deployment complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "URL: https://$subdomain.mikesendpoint.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Wait 30-60 seconds for CloudFront cache invalidation." -ForegroundColor Yellow
    
} catch {
    Write-Host "Deployment failed: $_" -ForegroundColor Red
    exit 1
} finally {
    # Cleanup
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test at https://$subdomain.mikesendpoint.com" -ForegroundColor Gray
Write-Host "2. Verify facets load correctly" -ForegroundColor Gray
Write-Host "3. Check visualization works" -ForegroundColor Gray
