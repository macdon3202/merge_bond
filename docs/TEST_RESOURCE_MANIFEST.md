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

## StudioNet fixture set - executed

Complete every field before running live evaluation:

```text
resource_id: github-mergebond-issue-1-pr-2
purpose: positive
authoritative_owner: GitHub
canonical_origin: https://api.github.com
canonical_url_or_api: https://api.github.com/repos/macdon3202/merge_bond/issues/1; /pulls/2; /pulls/2/files; /commits/9174314be1bd5d7a7bd805eae99c86a730e7b62a/check-runs
repository_and_object_id: macdon3202/merge_bond, Issue 1, PR 2
revision_or_commit: head 9174314be1bd5d7a7bd805eae99c86a730e7b62a; merge 2db22aea9132adf513beaad12da4bf0d200a2577
expected_content_type: application/json
expected_digest_algorithm: SHA-256 over bytes fetched by contract
expected_digest: computed by deployed contract at seal/evaluation
expected_deterministic_facts: merged PR into main; production and regression paths changed; contract-tests success on exact head SHA
expected_contract_result: RESERVED
mutable_or_immutable: Issue mutable but sealed by digest; PR/checks bound to exact SHA
availability_checked_at: 2026-10-08 during StudioNet evaluation transaction 0xd3585b49fa71ad20415694ada97d83c3e941e41f3379771faae9cf7d8ed857a0
claim_being_proved: merged implementation materially satisfies the exact Issue criteria with relevant regression coverage
github_authority_scope: repository objects and check runs only
publisher_controller: macdon3202 repository; GitHub controls object/state API transport
positive_state_beneficiary: auxiliary developer wallet, not deployer
can_beneficiary_manufacture_fact_alone: contributor may author code, but cannot bypass canonical merge/base/CI gates or independent semantic consensus
base_commit: 8c0b22e (initial main)
head_commit: 9174314be1bd5d7a7bd805eae99c86a730e7b62a
required_production_paths: fixture/src/
required_test_paths: fixture/tests/
ci_workflow_and_exact_sha: contract-tests; 9174314be1bd5d7a7bd805eae99c86a730e7b62a; success
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
