param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('issue', 'issue-edit', 'pr', 'merge', 'pr-status', 'checks')]
  [string]$Action,
  [string]$Title,
  [string]$Body,
  [string]$Head,
  [string]$Base = 'main',
  [int]$Number,
  [string]$Sha
)

$ErrorActionPreference = 'Stop'
$credentialLines = @('protocol=https', 'host=github.com', '') | git credential fill
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
  'issue' {
    $payload = @{ title = $Title; body = $Body } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Post -Uri "$root/issues" -Headers $headers -Body $payload -ContentType 'application/json'
    [ordered]@{ number = $result.number; html_url = $result.html_url } | ConvertTo-Json
  }
  'issue-edit' {
    $payload = @{ title = $Title; body = $Body } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Patch -Uri "$root/issues/$Number" -Headers $headers -Body $payload -ContentType 'application/json'
    [ordered]@{ number = $result.number; html_url = $result.html_url; updated_at = $result.updated_at } | ConvertTo-Json
  }
  'pr' {
    $payload = @{ title = $Title; body = $Body; head = $Head; base = $Base } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Post -Uri "$root/pulls" -Headers $headers -Body $payload -ContentType 'application/json'
    [ordered]@{ number = $result.number; html_url = $result.html_url; head_sha = $result.head.sha } | ConvertTo-Json
  }
  'merge' {
    $payload = @{ merge_method = 'squash'; commit_title = $Title } | ConvertTo-Json
    $result = Invoke-RestMethod -Method Put -Uri "$root/pulls/$Number/merge" -Headers $headers -Body $payload -ContentType 'application/json'
    [ordered]@{ merged = $result.merged; sha = $result.sha; message = $result.message } | ConvertTo-Json
  }
  'pr-status' {
    $result = Invoke-RestMethod -Uri "$root/pulls/$Number" -Headers $headers
    [ordered]@{ state = $result.state; merged = $result.merged; head_sha = $result.head.sha; merge_sha = $result.merge_commit_sha } | ConvertTo-Json
  }
  'checks' {
    $result = Invoke-RestMethod -Uri "$root/commits/$Sha/check-runs" -Headers $headers
    $result.check_runs | Select-Object name,status,conclusion,html_url | ConvertTo-Json
  }
}
