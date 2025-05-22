# 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

# Simple Legacy API Usage Finder
# This script searches for legacy API usage patterns in the codebase

Write-Host "Searching for legacy API usage patterns..."

# Define the patterns to search for
$patterns = @(
    "getApiEndpoint\(",
    "API_CONFIG\.FULL_API_URL",
    "from ['\"]@\/lib\/api\/config['\"]",
    "from ['\"]@\/lib\/api\/api-config['\"]",
    "apiClient\.(get|post|put|delete|patch)\(['\"][^\/]"
)

# Define the directory to search in
$srcDir = Join-Path $PSScriptRoot "..\src"
$outputFile = Join-Path $PSScriptRoot "..\legacy-findings.txt"

# Create or clear the output file
"Legacy API Usage Findings" | Out-File -FilePath $outputFile
"=========================" | Out-File -FilePath $outputFile -Append
"" | Out-File -FilePath $outputFile -Append

$totalMatches = 0
$filesWithMatches = @{}

# Create a function to search for patterns in a file
function Find-LegacyPatterns {
    param (
        [string]$FilePath
    )
    
    $fileContent = Get-Content -Path $FilePath -Raw
    $fileMatches = 0
    $relativePath = $FilePath.Replace((Join-Path $PSScriptRoot ".."), "").TrimStart("\")
    
    foreach ($pattern in $patterns) {
        if (Select-String -InputObject $fileContent -Pattern $pattern -AllMatches) {
            $matches = (Select-String -InputObject $fileContent -Pattern $pattern -AllMatches).Matches
            $fileMatches += $matches.Count
            $totalMatches += $matches.Count
            
            if (-not $filesWithMatches.ContainsKey($relativePath)) {
                $filesWithMatches[$relativePath] = @{}
            }
            
            if (-not $filesWithMatches[$relativePath].ContainsKey($pattern)) {
                $filesWithMatches[$relativePath][$pattern] = $matches.Count
            }
        }
    }
    
    return $fileMatches
}

# Get all TypeScript/TSX files
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx"

# Process each file
$fileCount = 0
foreach ($file in $files) {
    $fileCount++
    $matches = Find-LegacyPatterns -FilePath $file.FullName
    Write-Progress -Activity "Scanning files" -Status "$fileCount of $($files.Count)" -PercentComplete (($fileCount / $files.Count) * 100)
}

# Output results
Write-Host "Scan complete!"
Write-Host "Total files scanned: $($files.Count)"
Write-Host "Files with legacy API usage: $($filesWithMatches.Count)"
Write-Host "Total legacy pattern matches: $totalMatches"

# Write detailed results to the output file
"Summary:" | Out-File -FilePath $outputFile -Append
"- Total files scanned: $($files.Count)" | Out-File -FilePath $outputFile -Append
"- Files with legacy API usage: $($filesWithMatches.Count)" | Out-File -FilePath $outputFile -Append
"- Total legacy pattern matches: $totalMatches" | Out-File -FilePath $outputFile -Append
"" | Out-File -FilePath $outputFile -Append

if ($filesWithMatches.Count -gt 0) {
    "Detailed Findings:" | Out-File -FilePath $outputFile -Append
    "" | Out-File -FilePath $outputFile -Append
    
    $index = 1
    foreach ($file in $filesWithMatches.Keys) {
        "[$index] $file" | Out-File -FilePath $outputFile -Append
        foreach ($pattern in $filesWithMatches[$file].Keys) {
            "    - Pattern: $pattern" | Out-File -FilePath $outputFile -Append
            "    - Occurrences: $($filesWithMatches[$file][$pattern])" | Out-File -FilePath $outputFile -Append
        }
        "" | Out-File -FilePath $outputFile -Append
        $index++
    }
    
    Write-Host "Detailed results have been saved to $outputFile"
    
    Write-Host "`nRecommendation:"
    Write-Host "Review the findings and migrate legacy API usage to the enhanced API client and endpoint registry."
} else {
    "No legacy API usage found in the codebase!" | Out-File -FilePath $outputFile -Append
    Write-Host "`n✅ No legacy API usage detected! The codebase has been fully migrated."
}
