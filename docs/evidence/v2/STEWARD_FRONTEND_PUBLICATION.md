# Steward frontend publication — 2026-10-11

- Source commit: e44af7f (frontend and steward packet).
- Production: https://mergebond.pages.dev
- Immutable deployment: https://f5df97b7.mergebond.pages.dev
- Wrangler Pages upload/deployment: successful.
- Production HTTP: 200; asset /assets/index-DL1qoVoR.js.
- Retrieved production asset contains the exact active V2 contract address,
  docs/STEWARD_SUBMIT.md and REVIEW_LINKS.md.
- Frontend/controlled-fixture Node suite: 10 passed, 0 failed/skipped.
- Vite build: 477 modules, success; main JS 922.40 kB (gzip 257.21 kB).
  The >500 kB bundle-size warning remains.
- Added read-only record selectors: bounty 1 / claim 1 and bounty 3 / claim 4.
  These issue canonical reads rather than transactions; they are not new live
  claims or a browser-wallet journey.
- No contract source change or redeployment. No browser render/signing E2E was
  run for this publication. HTTP/bundle parity is not browser interaction proof.
