# Protocol specification

## Proof obligation

For a claim to reserve a bounty, the contract must establish:

> Pull request `P` was merged into the bounty's exact repository and base branch; it changed at least one required production path and one required test path; the sponsor-named GitHub check completed successfully on the exact PR head SHA; the sealed issue bytes have not changed; and the observed patch substantively satisfies the sealed acceptance criteria without being report-only or introducing a security regression.

## Evidence boundaries

GitHub API facts are authoritative only for GitHub-hosted repository objects:

- exact issue identity and returned bytes;
- PR identity, merged/closed status, head SHA, merge SHA, base repository and branch;
- changed-file paths and patches returned by the PR files endpoint;
- check name, status, conclusion and exact head SHA.

These facts do not prove production deployment, runtime behavior outside the checked CI run, ownership of external systems, or general absence of vulnerabilities. MergeBond makes none of those claims.

## Deterministic gates

All must pass before semantic judgment can have a positive effect:

1. The current Issue response hashes to the digest sealed by the sponsor.
2. The PR number matches the claim and is both closed and merged.
3. The base repository and branch match the sealed policy.
4. Head and merge SHAs are full 40-character values.
5. At least one changed path starts with the production prefix.
6. At least one changed path starts with the test prefix.
7. The named check is completed and successful on the exact head SHA.
8. The PR number has not already been claimed for that bounty.
9. The bounty remains OPEN and is before its deadline.

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

No public method accepts a wallet address as an authorization substitute.
