# Agent Rules Token Optimization Script
# Converts large .clinerules files to synopsis + full content pattern

$rulesDir = "C:/Users/mike.ullman/OneDrive - Vizio, Inc/Documents/Cline/Rules"
$fullDir = "$rulesDir/full"

# Rules to convert (excluding always-active and already converted)
$rulesToConvert = @(
    "make-tv-app",
    "kiss-html-css-js",
    "destank",
    "auto-deploy-slack",
    "use-liskov-file-system",
    "add-feature-flags",
    "upload-to-mikesendpoint",
    "assign-port",
    "refresh-me",
    "no-emojis-no-fluff",
    "deep-planning-triage",
    "add-ai-integration",
    "guided-design-wizard",
    "fix-nitpicks",
    "no-inline-styles",
    "fix-bugs",
    "prefer-controllers",
    "search-before-implementing",
    "quickstart",
    "pwa-lockdown",
    "always-ask-what-else",
    "retro",
    "bug-beacon-shortcuts",
    "show-custom-commands",
    "refactor",
    "add-ai-assistance",
    "make-lambda"
)

# Skip these (always-active or already converted)
$skipRules = @(
    "custom_instructions",
    "proactive-code-quality",
    "powershell-enforcement",
    "consolidated",
    "make-fab",
    "add-signalargh"
)

# Example rules (keep as-is for reference)
$exampleRules = @(
    "example-error-handling",
    "example-formatting",
    "example-testing"
)

Write-Host "Clinerules Token Optimization" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$totalSaved = 0
$filesConverted = 0

foreach ($ruleName in $rulesToConvert) {
    $sourceFile = "$rulesDir/$ruleName.clinerules"
    $fullFile = "$fullDir/$ruleName.md"
    
    if (-not (Test-Path $sourceFile)) {
        Write-Host "SKIP: $ruleName (file not found)" -ForegroundColor Yellow
        continue
    }
    
    $originalSize = (Get-Item $sourceFile).Length
    
    # Read original content
    $content = Get-Content $sourceFile -Raw
    
    # Move full content to full/ directory
    Set-Content -Path $fullFile -Value $content -NoNewline
    
    # Extract key information for synopsis
    $triggerMatch = $content -match '## TRIGGER\s*\n([^\n]+)'
    $trigger = if ($triggerMatch) { $Matches[1].Trim() } else { "See full content" }
    
    $purposeMatch = $content -match '## (PURPOSE|PHILOSOPHY|WHAT IS|WHAT IT DOES)\s*\n([^\n]+)'
    $purpose = if ($purposeMatch) { $Matches[2].Trim() } else { "See full content" }
    
    # Create synopsis
    $synopsis = @"
# $($ruleName -replace '-', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) })

## TRIGGER
$trigger

## PURPOSE
$purpose

## FULL IMPLEMENTATION
When trigger detected, read complete implementation:
``````powershell
`$content = Get-Content "C:/Users/mike.ullman/OneDrive - Vizio, Inc/Documents/Cline/Rules/full/$ruleName.md" -Raw
``````

Or use read_file tool:
``full/$ruleName.md``
"@
    
    # Write synopsis
    Set-Content -Path $sourceFile -Value $synopsis -NoNewline
    
    $newSize = (Get-Item $sourceFile).Length
    $saved = $originalSize - $newSize
    $totalSaved += $saved
    $filesConverted++
    
    $pctReduction = [math]::Round(($saved / $originalSize) * 100, 1)
    
    Write-Host "OK $ruleName" -ForegroundColor Green
    Write-Host "  $([math]::Round($originalSize/1KB, 2)) KB -> $([math]::Round($newSize/1KB, 2)) KB ($pctReduction% reduction)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Conversion Complete!" -ForegroundColor Green
Write-Host "Files converted: $filesConverted" -ForegroundColor Cyan
Write-Host "Total saved: $([math]::Round($totalSaved/1KB, 2)) KB" -ForegroundColor Cyan
Write-Host "Average reduction: $([math]::Round(($totalSaved / ($filesConverted * 1KB)) * 100, 1))%" -ForegroundColor Cyan
