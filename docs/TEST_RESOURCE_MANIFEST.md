# Test resource manifest

This file separates controlled Direct Mode fixtures from public StudioNet evidence. A locator supplied by a participant is not itself proof.

## Direct Mode fixture set

```text
resource_id: direct-fixture-v1
purpose: positive, negative, unavailable, replay, cross-object
authoritative_owner: simulated GitHub API controlled by gltest mocks
canonical_origin: https://api.github.com
canonical_url_or_api: /repos/fixture-org/fixture-repo/{issues,pulls,commits}
repository_and_object_id: fixture-org/fixture-repo, issue 7, PR 11
revision_or_commit: head a*40, merge b*40
expected_content_type: application/json
expected_digest_algorithm: SHA-256 over exact returned bytes
expected_deterministic_facts: issue/PR identity, merge status, base binding, changed paths, CI exact SHA
expected_contract_result: per docs/TEST_MATRIX.md
mutable_or_immutable: mock-controlled; issue mutation is an explicit negative control
availability_checked_at: local execution 2026-10-08
claim_being_proved: contract behavior under controlled inputs
github_authority_scope: simulated only; not public GitHub evidence
publisher_controller: test harness
positive_state_beneficiary: developer fixture wallet
can_beneficiary_manufacture_fact_alone: no within the harness; mocks are set by tests
required_production_paths: src/
required_test_paths: tests/
ci_workflow_and_exact_sha: contract-tests on a*40
runtime_authority_if_claimed: none
what_this_source_cannot_prove: StudioNet reachability, real GitHub provenance, real validator output, real GEN transfer
```

## StudioNet fixture set - pending

Complete every field before running live evaluation:

```text
resource_id: PENDING
purpose: positive
authoritative_owner: GitHub
canonical_origin: https://api.github.com
canonical_url_or_api: PENDING exact public URLs
repository_and_object_id: PENDING owner/repository, Issue ID, PR ID
revision_or_commit: PENDING full 40-character head and merge SHAs
expected_content_type: application/json
expected_digest_algorithm: SHA-256 over bytes fetched by contract
expected_digest: computed by deployed contract at seal/evaluation
expected_deterministic_facts: PENDING, written before evaluation
expected_contract_result: RESERVED
mutable_or_immutable: Issue mutable but sealed by digest; PR/checks bound to exact SHA
availability_checked_at: PENDING UTC timestamp
claim_being_proved: merged implementation materially satisfies the exact Issue criteria with relevant regression coverage
github_authority_scope: repository objects and check runs only
publisher_controller: PENDING GitHub organization/user
positive_state_beneficiary: auxiliary developer wallet, not deployer
can_beneficiary_manufacture_fact_alone: contributor may author code, but cannot bypass canonical merge/base/CI gates or independent semantic consensus
base_commit: PENDING
head_commit: PENDING
required_production_paths: PENDING
required_test_paths: PENDING
ci_workflow_and_exact_sha: PENDING
runtime_authority_if_claimed: not claimed by MergeBond
what_this_source_cannot_prove: deployment, production runtime behavior, universal absence of vulnerabilities
```

Required live negative controls:

- valid repository plus report-only PR;
- test-only PR with no production path;
- production-only PR without required regression path/check;
- successful check belonging to another SHA;
- mutable Issue changed after sealing;
- duplicate PR claim;
- unavailable GitHub response leading to `UNRESOLVED`;
- competing claim after a winner reservation.

Public URLs must require no cookie, private token, localhost access or expiring signed URL. Private keys must remain only in a gitignored local environment and must never appear in this manifest, logs or repository.
