$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot

Push-Location $project
try {
    $env:PYTHONUTF8 = '1'
    Write-Host '[1/6] GenVM lint and validation'
    genvm-lint check contracts\merge_bond.py

    Write-Host '[2/6] Direct Mode contract tests'
    python -m pytest -q

    Push-Location frontend
    try {
        Write-Host '[3/6] Frontend transaction tests'
        npm test

        Write-Host '[4/6] Dependency audit'
        npm audit

        Write-Host '[5/6] Production build'
        $env:NODE_OPTIONS = '--max-old-space-size=4096'
        npm run build

        Write-Host '[6/6] Browser render QA'
        npm run qa:browser
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
