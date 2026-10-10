$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot

Push-Location $project
try {
    $env:PYTHONUTF8 = '1'
    Write-Host '[1/6] GenVM lint and validation'
    genvm-lint check contracts\merge_bond.py
    if ($LASTEXITCODE -ne 0) { throw 'GenVM lint failed' }

    Write-Host '[2/6] Direct Mode contract tests'
    python -m pytest -q
    if ($LASTEXITCODE -ne 0) { throw 'Contract tests failed' }

    Push-Location frontend
    try {
        Write-Host '[3/6] Frontend transaction tests'
        npm test
        if ($LASTEXITCODE -ne 0) { throw 'Frontend tests failed' }

        Write-Host '[4/6] Dependency audit'
        npm audit
        if ($LASTEXITCODE -ne 0) { throw 'Dependency audit failed' }

        Write-Host '[5/6] Production build'
        $env:NODE_OPTIONS = '--max-old-space-size=4096'
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed' }

        Write-Host '[6/6] Browser render QA'
        npm run qa:browser
        if ($LASTEXITCODE -ne 0) { throw 'Browser QA failed' }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
