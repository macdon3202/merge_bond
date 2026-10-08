# Test matrix

Executed locally on 2026-10-08 against `contracts/merge_bond.py` with runner v0.2.16.

## Contract Direct Mode

| Category | Scenario | Expected consequence | Result |
|---|---|---|---|
| Happy path | Seal, exact fund, submit, permissionless evaluate, winner withdraw | `RESERVED -> PAID`, exact transfer value | PASS |
| Source quality | Markdown/report only | No reservation | PASS |
| Source quality | Test-only change | No reservation | PASS |
| Source quality | Production-only change | No reservation | PASS |
| Semantic falsifier | Plausible diff fails criteria | `REJECTED`, funds remain locked | PASS |
| Availability | GitHub 503 | `UNRESOLVED`, no economic mutation | PASS |
| AI schema | Malformed model output | `UNRESOLVED` | PASS |
| Injection | Patch tells validator to approve | Rejected by substantive result | PASS |
| Provenance | PR unmerged/open | No reservation | PASS |
| Provenance | Wrong base branch | No reservation | PASS |
| Revision | CI head differs from PR head | No reservation | PASS |
| CI | Named check failed | No reservation | PASS |
| Commitment | Issue bytes changed after seal | No reservation | PASS |
| Authorization | Non-sponsor seals | Revert; state unchanged | PASS |
| Conflict | Sponsor claims own bounty | Revert; state unchanged | PASS |
| Replay | Same PR submitted twice | Revert; counter unchanged | PASS |
| Value safety | Wrong attached amount | Sender refund ledger; no lock | PASS |
| Recovery | Deadline passes without winner | Permissionless sponsor refund | PASS |
| Race | Two claimants compete | First valid reservation closes pool | PASS |
| Replay | Winner withdraws twice | Second call reverts | PASS |
| Atomicity | Host transfer throws | Claimable state restored | PASS |
| Authority | Deployer introspection | No deployer authority | PASS |
| Runtime pin | Runner header | Exact approved runner hash | PASS |

Total: **23 passed**. Warning messages about unused mocks are expected negative-control instrumentation; tests assert the source gate exits before irrelevant downstream mocks are consumed.

## Frontend units

| Scenario | Result |
|---|---|
| SDK returns string hash, `{txId}`, or `{hash}` | PASS |
| Invalid transaction ID | PASS (rejected) |
| `FINALIZED + MAJORITY_AGREE + SUCCESS` | PASS |
| Accepted but not finalized | PASS (not reported complete) |
| Consensus disagreement / execution error | PASS (failed) |
| Exact returned numeric record ID extraction | PASS |
| Case-insensitive active-wallet comparison | PASS |
| Decimal/hex StudioNet chain-ID comparison | PASS |

Total: **5 test cases passed**.

Dependency audit after pinning Vite 7.3.7 and patched transitive build tools: **0 vulnerabilities** reported by `npm audit`.

## Browser production QA

`npm run qa:browser` launches the built Vite bundle in installed Chrome, listens for runtime exceptions, verifies key rendered markers, reads document dimensions and captures `artifacts/frontend-home.png`. This is render QA only; it does not sign a transaction.

Latest QA result: **PASS**, rendered document 1409 x 2194, screenshot preserved at `docs/assets/frontend-home.png`.

## Required live tests (not yet run)

- exact StudioNet contract deployment and source match;
- main wallet performs deployment only;
- auxiliary sponsor and developer wallets perform the primary lifecycle;
- reviewer wallet independently evaluates and reads state;
- real GEN custody, refund and winner transfer;
- live negative controls and post-transaction UI reconciliation;
- Cloudflare production deployment.

Do not mark these rows passed until transaction hashes and post-state are recorded.
