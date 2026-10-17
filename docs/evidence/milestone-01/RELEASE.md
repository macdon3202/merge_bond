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

The page shows RPC observations, not a signed export or recipient-side transfer
receipt. Controlled historical fixtures are not independent users or new traction.
The unchanged contract test suite was not rerun for this frontend-only release;
its prior decoder xfail remains documented in V2_VERIFICATION.md.
