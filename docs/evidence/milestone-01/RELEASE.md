# Explorer 1.1.0 — verification record

Verified 2026-10-17, Asia/Bangkok. Baseline source `ac05f74`.

## Before and after

The baseline Cloudflare deployment is still available at
https://0f65c845.mergebond.pages.dev (source `2c6768f`). Its UI has two preset
historical buttons and manual bounty/claim ID inputs, without record discovery,
a full dossier, share links or JSON downloads. Source comparison and abbreviated
before/after code are in the milestone guide.

## Automated checks

- [Frontend/fixture TAP](frontend-tests.tap): 28 passed, zero failed/skipped.
- [Live production-function verification](live-readback.json): three bounties,
  four claims; winning and incomplete-evidence dossier exports.
- Vite production build succeeded: 480 modules; JS 936.31 kB, gzip 261.24 kB.
  The >500 kB warning remains; no bundle-size improvement is claimed.
- Contract source SHA-256 is unchanged:
  `c782ddc21e98c1486d319395093aa5ae326d54dab348f9c2d96746275eb68b68`.

## Browser observations

Performed against the local Vite app connected to the real V2 StudioNet contract,
without a wallet, mocked RPC, or write transaction:

1. Bounties tab showed three canonical records, newest first.
2. Claims tab showed four records and their actual outcome reasons.
3. Claim 1 opened bounty 1 PAID / claim 1 WINNER, canonical issue/PR/head/grant
   links and global deposited/outbound 3000000000000 wei, zero liabilities/balance.
4. State filter WINNER left only claim 1. A nonmatching search showed the explicit
   page-local empty state. Clearing filters restored the records.
5. Download created `mergebond-bounty-1-claim-1.json`; parsed schema, contract,
   chain, bounty, claim, source digest and accounting matched the independent
   script readback. `observation.atomic` remained false.
6. Mobile viewport 390 x 844: document width 375, no horizontal overflow;
   record controls stack vertically. Viewport override was reset afterward.
7. Reloading a shared link reacquired the winning dossier from chain.
8. Cloudflare production opened the bounty 3 / claim 4 shared link directly:
   PAID / UNRESOLVED / SOURCE_UNAVAILABLE, zero liabilities and matching source
   links. Open in workspace populated exact bounty 3 / claim 4 and the verify tab.

## Cloudflare publication

Code commit: `73ac0afee45bdcdd62e44ea4175feffb928deff8`, pushed to `origin/main`.
Production https://mergebond.pages.dev. Immutable deployment:
https://7e54bc2a.mergebond.pages.dev.

Production returned HTTP 200. `/assets/index-kgppODPq.js` SHA-256 matches the
local build exactly:
`308276174b5ca6972c9a71addd0392a0dd58a2425df81a928365cea3084a7565`.
The bundle includes the new Explorer/export schema and exact V2 address. The
Cloudflare credential pattern is absent. Existing security headers are served.
[HTTP and bundle verification](publication.json).

Local and production env files were checked against the unchanged V2 address;
the public `.env.example` now documents it. Cloudflare is a direct-upload project,
so there is no remote Git-build env to update for this deployment.

## Submission fields

Title: MergeBond Milestone 1 — Public Bounty & Evidence Explorer

Changes & Improvements:

Added a public explorer that discovers bounties and claims directly from the
StudioNet contract, with bounded pagination, search and state filters. Each record
opens an evidence dossier containing sealed criteria, policy/source commitments,
exact PR revision, pinned author grant and outcome. Share links bind the chain,
contract and record IDs. Downloadable JSON includes dated readbacks, global
accounting checks and explicit verification limits. Added 11 explorer regression
tests (28 frontend/fixture tests pass), live readback evidence and mobile checks.
Deployed to Cloudflare Pages. Contract V2 is unchanged; no redeployment required.

Key links: production app, baseline-to-release Git diff and this verification file.

The page shows RPC observations, not a signed export or recipient-side transfer
receipt. Controlled historical fixtures are not independent users or new traction.
The unchanged contract suite was rerun after investigating a missing CI dependency:
75 passed, 1 xfailed, 138 warnings. [JUnit results](contract-tests.xml). The prior
decoder xfail remains documented in V2_VERIFICATION.md and is not counted as a
passing independent validator test.

The initial [GitHub run](https://github.com/macdon3202/merge_bond/actions/runs/39019333101)
had 75 passes and one failure because clean runners lacked `cloudpickle`.
`requirements.txt` now pins 3.1.2 (the locally tested version); the CI workflow
also builds the frontend against the exact public V2 address. No contract or
test assertion was changed to mask that failure.
