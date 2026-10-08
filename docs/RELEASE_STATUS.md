# Release status

Status as of 2026-10-08: **local implementation complete; StudioNet address supplied; live E2E pending**.

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
| Public GitHub positive fixture | NOT PREPARED | manifest fields still PENDING |
| Two-wallet live lifecycle | NOT RUN | requires deployment and faucet GEN |
| Reviewer-wallet evaluation | NOT RUN | requires live claim |
| Live custody/transfer conservation | NOT RUN | requires live funded lifecycle |
| Cloudflare Pages deployment | NOT RUN | requires exact contract address |

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
