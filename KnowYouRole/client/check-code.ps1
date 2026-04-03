$ErrorActionPreference = "Stop"
try {
    $uri = "http://localhost:5174/src/components/results/ResultsPage1.tsx"
    $response = Invoke-WebRequest -Uri $uri -TimeoutSec 5 -UseBasicParsing
    $content = $response.Content
    if ($content -match "aurora") {
        Write-Output "NEW_CODE"
    } elseif ($content -match "glass-card") {
        Write-Output "OLD_CODE"
    } else {
        Write-Output "UNKNOWN_length=$($content.Length)"
    }
} catch {
    Write-Output "Error: $_"
}
