# Legacy API Usage Finder
# This script searches for legacy API usage patterns in the codebase

Write-Host "Searching for legacy API usage patterns..."

# Define the patterns to search for
$patterns = @(
    "getApiEndpoint\(",
    "API_CONFIG\.FULL_API_URL",
    "from ['\""]@\/lib\/api\/config['\""]",
    "from ['\""]@\/lib\/api\/api-config['\""]",
    "apiClient\.(get|post|put|delete|patch)\(['\""][^\/]"
)

# Define the directory to search in
$srcDir = Join-Path $PSScriptRoot "..\src"

# Initialize results
$results = @{}
$totalFiles = 0

# Function to search for patterns in a file
function Search-File {
    param (
        [string]$filePath
    )
    
    $content = Get-Content -Path $filePath -Raw
    $totalFiles++
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $relativePath = $filePath.Replace((Join-Path $PSScriptRoot ".."), "").TrimStart("\")
            
            if (-not $results.ContainsKey($relativePath)) {
                $results[$relativePath] = @()
            }
            
            if (-not $results[$relativePath].Contains($pattern)) {
                $results[$relativePath] += $pattern
            }
        }
    }
}

# Get all TypeScript/TSX/JavaScript/JSX files
$files = Get-ChildItem -Path $srcDir -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx" -Exclude "node_modules", "dist", "build"

# Search each file
foreach ($file in $files) {
    Search-File -filePath $file.FullName
}

# Generate report
Write-Host "`n=== Legacy API Usage Check Report ===`n"
Write-Host "Total files scanned: $($files.Count)"
Write-Host "Files with legacy API usage: $($results.Count)"

if ($results.Count -gt 0) {
    Write-Host "`nFiles with legacy API usage:"
    
    $index = 1
    foreach ($filePath in $results.Keys) {
        Write-Host "`n$index. $filePath"
        Write-Host "   Legacy patterns found:"
        
        foreach ($pattern in $results[$filePath]) {
            Write-Host "   - $pattern"
        }
        
        $index++
    }
    
    Write-Host "`nRecommendation:"
    Write-Host "Migrate these files to use the enhanced API client and endpoint registry."
    Write-Host "See src/docs/legacy-api-migration-guide.md for migration instructions."
} else {
    Write-Host "`n✅ No legacy API usage detected! The codebase has been fully migrated."
}

Write-Host "`n====================================="
