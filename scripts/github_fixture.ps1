param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('issue', 'issue-edit', 'pr', 'merge', 'pr-status', 'checks', 'job-log', 'gist')]
  [string]$Action,
  [string]$Title,
  [string]$Body,
  [string]$Head,
  [string]$Base = 'main',
  [int]$Number,
  [string]$Sha,
  [long]$JobId
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$credentialLines = @('protocol=https', 'host=github.com', 'username=macdon3202', '') | git credential fill
$credential = @{}
foreach ($line in $credentialLines) {
  if ($line -match '^([^=]+)=(.*)$') { $credential[$matches[1]] = $matches[2] }
}
if (-not $credential.password) { throw 'No GitHub credential is available from Git Credential Manager.' }

$headers = @{
  Authorization = "Bearer $($credential.password)"
  Accept = 'application/vnd.github+json'
  'X-GitHub-Api-Version' = '2022-11-28'
  'User-Agent' = 'MergeBond-E2E'
}
$root = 'https://api.github.com/repos/macdon3202/merge_bond'

switch ($Action) {
  'gist' {
    if (-not $Body) { throw 'Supply exact authorization JSON in Body' }
    $null = $Body | ConvertFrom-Json
    $payload = @{ description='MergeBond V2 synthetic E2E payout authorization'; public=$true; files=@{ 'mergebond-authorization.json'=@{content=$Body} } } | ConvertTo-Json -Depth 8
    $result = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/gists' -Headers $headers -Body $payload -ContentType 'application/json' -TimeoutSec 30
    [ordered]@{ id=$result.id; revision=$result.history[0].version; owner_id=$result.owner.id; html_url=$result.html_url } | ConvertTo-Json
  }
  'issue' {
    $payload = @{ title = $Title; body = $Body } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Post -Uri "$root/issues" -Headers $headers -Body $payload -ContentType 'application/json' -TimeoutSec 30
    [ordered]@{ number = $result.number; html_url = $result.html_url } | ConvertTo-Json
  }
  'issue-edit' {
    $payload = @{ title = $Title; body = $Body } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Patch -Uri "$root/issues/$Number" -Headers $headers -Body $payload -ContentType 'application/json' -TimeoutSec 30
    [ordered]@{ number = $result.number; html_url = $result.html_url; updated_at = $result.updated_at } | ConvertTo-Json
  }
  'pr' {
    $payload = @{ title = $Title; body = $Body; head = $Head; base = $Base } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Post -Uri "$root/pulls" -Headers $headers -Body $payload -ContentType 'application/json' -TimeoutSec 30
    [ordered]@{ number = $result.number; html_url = $result.html_url; head_sha = $result.head.sha } | ConvertTo-Json
  }
  'merge' {
    $payload = @{ merge_method = 'squash'; commit_title = $Title } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Put -Uri "$root/pulls/$Number/merge" -Headers $headers -Body $payload -ContentType 'application/json' -TimeoutSec 30
    [ordered]@{ merged = $result.merged; sha = $result.sha; message = $result.message } | ConvertTo-Json
  }
  'pr-status' {
    $result = Invoke-RestMethod -Uri "$root/pulls/$Number" -Headers $headers -TimeoutSec 30
    [ordered]@{ state = $result.state; merged = $result.merged; head_sha = $result.head.sha; merge_sha = $result.merge_commit_sha; contributor_id=$result.user.id; created_at=$result.created_at; merged_at=$result.merged_at } | ConvertTo-Json
  }
  'checks' {
    $result = Invoke-RestMethod -Uri "$root/commits/$Sha/check-runs" -Headers $headers -TimeoutSec 30
    $result.check_runs | Select-Object name,status,conclusion,html_url | ConvertTo-Json
  }
  'job-log' {
    $log = Join-Path $env:TEMP "mergebond-job-$JobId.log"
    Invoke-WebRequest -Uri "$root/actions/jobs/$JobId/logs" -Headers $headers -OutFile $log -TimeoutSec 30
    Get-Content -LiteralPath $log
    Remove-Item -LiteralPath $log -Force
  }
}
