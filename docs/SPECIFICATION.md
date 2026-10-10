# Protocol specification

This specification describes the V2 candidate source. V2 has not yet been deployed.

## Proof obligation

For a claim to reserve a bounty, the contract must establish:

> Pull request `P` was created and merged within the funded bounty window into the exact repository and base branch; its GitHub author authorized the authenticated payout sender for this exact bounty/policy/PR/revision through an author-owned public revision-pinned Gist; all changed files and complete patches were acquired; the sponsor-named GitHub check completed successfully on the exact PR head SHA from a complete latest check set; sealed issue acceptance content has not changed; and validators establish that the full observed diff satisfies every sealed acceptance criterion without report-only changes or a security regression.

## Evidence boundaries

GitHub API facts are authoritative only for GitHub-hosted repository objects:

- exact issue identity and returned bytes;
- PR identity, merged/closed status, head SHA, merge SHA, base repository and branch;
- changed-file paths and patches returned by the PR files endpoint;
- check name, status, conclusion and exact head SHA.

These facts do not prove production deployment, runtime behavior outside the checked CI run, ownership of external systems, or general absence of vulnerabilities. MergeBond makes none of those claims.

## Deterministic gates

All must pass before semantic judgment can have a positive effect:

1. The canonical Issue acceptance snapshot (`id`, `number`, `repository_url`, complete `title`, complete `body`) hashes to the sealed digest. Metadata such as comment count or closed state is not acceptance content. Empty/oversized criteria cannot be sealed.
2. The PR number matches the claim and is both closed and merged.
3. The base repository and branch match the sealed policy.
4. Head and merge SHAs are full 40-character values.
5. At least one changed path starts with the production prefix.
6. At least one changed path starts with the test prefix.
7. The named check is completed and successful on the exact head SHA.
8. The PR number has not already been claimed for that bounty.
9. The bounty remains OPEN and is before its deadline.
10. `funded_at <= created_at <= merged_at <= submitted_at < deadline`, with strict UTC GitHub timestamps. At expiry submission/evaluation stop and permissionless recovery begins.
11. The Gist owner numeric GitHub ID equals the PR author ID; the exact revision contains only the complete `mergebond-authorization.json` file and its JSON exactly matches the domain-separated authorization template plus author ID and observed head/merge SHA. A copied Gist owned by someone else fails.
12. Authentication and eligibility pass **before** consuming the PR uniqueness index. Evaluation re-fetches the same pinned grant and verifies its digest and the same author/head/merge.
13. The PR `changed_files` count is 1–200, all expected 100-file pages are fetched with exact counts, and filenames are unique. Every diff has complete hunks and addition/deletion/change totals; omitted, binary, zero-change and truncated patches are unsupported and fail closed. No patch or criterion is sliced. The complete semantic payload is at most 120,000 bytes.
14. The `filter=latest` CI result declares at most 100 runs and returns exactly that count. More than 100 is unsupported, not partially accepted. Required check name, status, conclusion and head SHA all match.
15. A second PR fetch equals the first, preventing mixed-revision pagination. State/deadline are rechecked immediately before reservation.

Source unavailability maps to `UNRESOLVED`. A reachable but nonconforming source maps to `REJECTED`. Neither state reserves funds.

## Semantic lattice

Validators return exactly these consequential fields:

```json
{
  "criteria_satisfied": "YES|NO|UNKNOWN",
  "production_change_material": "YES|NO|UNKNOWN",
  "regression_test_relevant": "YES|NO|UNKNOWN",
  "report_only": "YES|NO|UNKNOWN",
  "security_regression": "YES|NO|UNKNOWN",
  "verdict": "SATISFIED|INSUFFICIENT|UNRESOLVED"
}
```

Positive reservation requires `YES, YES, YES, NO, NO, SATISFIED`. Any unknown mandatory fact fails closed to `UNRESOLVED`; any known negative condition becomes `REJECTED`. `prompt_comparative` requires validators to reproduce both proof and falsification and disallows repairing consequential disagreements.

## Custody invariants

Let:

```text
deposited = all accepted incoming value
locked = value still in OPEN bounties
claimant_claimable = value reserved to winners
sponsor_claimable = value recoverable after expiry
refund_claimable = rejected/misdirected attached value
outbound = transfer requests emitted
```

Expected conservation is:

```text
deposited = locked + claimant_claimable + sponsor_claimable + refund_claimable + outbound
```

Effects are recorded before the external transfer request. GenVM transaction atomicity must roll those effects back if the host transfer fails; Direct Mode explicitly simulates and verifies that rollback using a VM snapshot because the local test harness does not automatically restore raised host calls.

## Actor model

- Deployer: no stored role or method authority.
- Sponsor: authenticated sender that creates the bounty; only sponsor seals and funds it.
- Claimant: registered authenticated sender, distinct from sponsor.
- Evaluator: any wallet; cannot select the winner or alter evidence.
- Expirer: any wallet after the deadline.
- Withdrawer: only the recorded winner, sponsor with sponsor due, or owner of a refund ledger entry.

`get_authorization_template` accepts a payout address solely to generate a read-only template. Only the authenticated `submit_claim` sender can become claimant; the template itself grants nothing.

## Authorization procedure

After funding, create and merge the qualifying PR. The author calls the view
`get_authorization_template(bounty_id, pr_number, payout_wallet)` and replaces its
three placeholders with the exact `head_sha`, `merge_sha`, and numeric
`contributor_id` from GitHub's PR API. Publish the complete JSON as a public Gist
named `mergebond-authorization.json` under that same GitHub account. Use its
32-hex ID and 40-hex revision in `submit_claim(bounty_id, pr_number, gist_id, gist_revision)`.
The grant binds issue/bounty eligibility deliberately; closure keywords in a PR
description are not used as an ownership or wallet-authorization proxy.

GitHub authenticates account ownership, not a legal identity. Gist grants are
immutable per claim and cannot be revoked after submission. GitHub outage/deletion
before evaluation leaves the claim unresolved; expiry recovers sponsor custody.
The authorization alone is insufficient: complete diff/CI and semantic gates
remain mandatory. This is not a full repository snapshot or vulnerability audit.
