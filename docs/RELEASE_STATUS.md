# Release status

Status as of 2026-10-08: **StudioNet happy/failure/conflict lifecycle and frontend readback verified**.

| Gate | Status | Evidence |
|---|---|---|
| Contract runner pinned | PASS | first two lines of `contracts/merge_bond.py` |
| GenVM lint and validation | PASS | `genvm-lint check`; 13 methods |
| Direct Mode contract tests | PASS | 23 tests |
| Transfer failure rollback regression | PASS | `test_transfer_emission_failure_rolls_back_claimable_state` |
| Frontend transaction tests | PASS | 5 tests, including StudioNet chain guard |
| Dependency audit | PASS | `npm audit`: 0 vulnerabilities |
| Production build | PASS | Vite production build |
| Browser render/runtime QA | PASS | rendered markers, zero runtime exceptions, `docs/assets/frontend-home.png` |
| StudioNet deployment address | RPC READBACK PASS; SOURCE MATCH PENDING | `get_config` returned `MERGE_BOND_V1`, expected architecture, zero records and no deployer authority |
| Public GitHub positive fixture | PASS | Issue #1, PR #2, exact head/merge SHA and successful exact-SHA checks |
| Two-wallet live lifecycle | PASS | sponsor `0xfed9…5e43`, developer `0xc675…57b8`; raw hashes in `docs/evidence/studionet-e2e.json` |
| Permissionless evaluation | PASS | sponsor wallet triggered evaluation; contract granted no evaluator role or deployer authority |
| Live custody/transfer conservation | PASS | deposited/outbound `1999999999999`; final balance and all claimable/locked fields zero |
| Live adversarial sequences | PASS (selected) | wrong actor, wrong value/refund, sponsor self-claim, losing evaluation after reservation, double withdrawal; complete pre/post equality where rejected |
| Frontend authoritative reconciliation | PASS | production UI loaded bounty #1 `PAID` and claim #1 `WINNER` after canonical sync |
| Cloudflare Pages deployment | NOT RUN | deployment remains separate from StudioNet E2E |

## Release rule

Do not call this submission-ready until all NOT RUN items have real public evidence. Local reports describe test output; they are not substitutes for GitHub API facts, Studio Explorer transactions or authoritative post-state.

## Address synchronization checklist

After deployment, the one exact address must appear in:

- `frontend/.env.local` for local verification;
- Cloudflare Pages `VITE_CONTRACT_ADDRESS` environment variable;
- README deployment section;
- this file;
- Studio Explorer link and E2E record.

Search the repository for obsolete `0x` addresses before release. Deployment wallet must not perform sponsor, developer or reviewer actions.

Studio Explorer: https://explorer-studio.genlayer.com/address/0x35C387b55a7Be9E2B74Ee4d56FD631936E1F8624
