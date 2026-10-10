# Threat model

## Protected assets

- GEN locked in bounty pools and sender refund ledgers.
- Sponsor policy commitment and exact issue digest.
- Claim identity, source digest, winner selection and terminal payout state.
- UI claims about transaction completion and authoritative contract state.

## Trust boundaries

- Wallet signatures authenticate actors; user-entered addresses never authorize actions.
- GitHub-controlled API responses establish only GitHub object facts within the scope documented in `SPECIFICATION.md`.
- PR patches and Issue text are untrusted evidence, never prompt instructions.
- Validators judge bounded semantic relations; contract code alone maps verdict fields to state/economic effects.
- Frontend receipts are not authoritative success; contract readback is.

## Attacks and mitigations

| Attack | Mitigation | Direct test |
|---|---|---|
| Sponsor submits its own claim | Authenticated claimant must differ from stored sponsor | `test_sponsor_cannot_claim_own_bounty` |
| Report claims work that code did not implement | Production and test paths are mandatory; semantic `report_only` must be `NO` | parameterized poisoned-artifact tests |
| CI belongs to another commit | Check-run `head_sha` must equal canonical PR head SHA | provenance mismatch tests |
| PR targets another fork/branch | Exact base `repo.full_name` and `ref` binding | provenance mismatch tests |
| Issue changes after funding policy is sealed | Current exact response bytes must match sealed digest | issue mutation test |
| Prompt injection in patch | Prompt labels content untrusted; independent falsifier; consequential schema | prompt-injection test |
| Malformed or disagreeing AI output | Exact schema plus fail-closed `UNRESOLVED` | malformed-model test |
| GitHub unavailable/rate-limited | No positive state; claim remains retryable `UNRESOLVED` | 503 source test |
| Duplicate PR reuse | `bounty_id|pr_number` consumed at submission | duplicate PR test |
| Two valid claims race | First reservation atomically closes OPEN state | competing-claim test |
| Wrong or accidental payment | Value is credited to sender refund ledger, never bounty | wrong-funding test |
| Sponsor traps funds by disappearing | Permissionless expiry after short bounded deadline | expiry/refund test |
| Double withdrawal | Due is zeroed before transfer; replay rejects | terminal replay test |
| Transfer host call fails | GenVM atomic rollback; simulated Direct Mode snapshot regression | transfer-failure test |
| UI treats receipt as success | Requires finalized agreement, successful execution and exact-record readback | frontend transaction tests |
| Deployer controls adjudication | Deployer not stored; config declares no authority | deployer-authority test |

## Residual risks

- GitHub unauthenticated API limits can cause temporary `UNRESOLVED` results.
- GitHub patch payloads may omit very large diffs; those claims should not be treated as positively proven. A future version may fetch exact blob bytes at the head SHA to eliminate this limitation.
- Natural-language criteria may be ambiguous. Unknown or validator disagreement fails closed, but sponsors should still write atomic criteria.
- A successful GitHub check proves only the named check ran successfully on the exact SHA; it does not prove production deployment.
- This repository has no third-party security audit.
- Direct Mode mocks are controlled test inputs, not independent live evidence.

## Deployment-specific checks

Before submission, confirm the deployed source is byte-for-byte the repository contract, the active address is consistent across frontend/docs/Explorer, and live GEN conservation matches contract accounting and participant balance changes.
# V2 boundary updates

The V2 source adds author-owned revision-pinned Gist authentication before claim
index consumption; exact chain/contract/bounty/policy/issue/PR/wallet/commit/window
binding; prospective PR timing; complete criteria and paginated patch acquisition;
and a final state/deadline recheck. See [specification](SPECIFICATION.md).

Repository maintainers are not trusted to authorize the PR author's payout wallet:
PR bodies and repository comments are not used for that authority. A Gist copied
by an attacker fails the owner-ID check. GitHub account compromise remains outside
this trust model. A grant cannot be revoked after submission; deletion/outage before
evaluation blocks reservation and leaves sponsor expiry recovery available.

The matrix above originated with V1; fresh V2 live coverage is pending replacement
deployment. Local adversarial tests are in `tests/test_v2_guards.py`.
