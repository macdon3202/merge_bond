# Milestone 01 — Public Bounty & Evidence Explorer

Date: 2026-10-17 (Asia/Bangkok). Release 1.1.0.
Baseline commit: `ac05f744da7120db81d7e07018919bea8fe54bae`.

## Problem and resulting behavior

Previously, visitors needed exact bounty/claim IDs or one of two fixed historical
buttons. They could not browse the contract or download a complete scoped
readback. Now a public explorer reads live counters and lists bounties/claims,
opens an evidence dossier, and exports dated JSON with global accounting checks.
No wallet is needed to discover or inspect GenLayer's semantic decisions.

New work is discovery, evidence inspection and export. V2 claim authorization,
patch completeness, AI consensus and the prior wallet fix are baseline features,
not improvements claimed again for this milestone.

## Before / after implementation evidence

Before, `App.jsx` at the baseline offered manual IDs:

```jsx
<input placeholder="Bounty ID" />
<input placeholder="Claim ID" />
<button onClick={sync}>Sync</button>
```

The new `Explorer.jsx` uses the live index and selected records:

```jsx
loadPage(readRef.current, kind, page)
loadDossier(readRef.current, scope, bid, cid)
<button onClick={download}>Download readback JSON</button>
```

The full diff, not these abbreviated snippets, is the implementation evidence.
Pagination uses eight records per page with exact IDs and no backend indexer.
Filtering is explicitly page-local. Global counts are contract records, not users.

## Dossier contents and trust boundary

- Deployment, chain ID, bounty and optional matching claim.
- Complete sealed acceptance text and issue/policy/source digests.
- Canonical GitHub issue, PR, exact head commit and pinned author-grant links.
- Observed production/test paths, funded/deadline times and outcome reason.
- Raw global accounting and exact integer checks:
  `deposited = locked + claimant_claimable + sponsor_claimable + refund_claimable + outbound_requested`;
  `balance >= locked + claimant_claimable + sponsor_claimable + refund_claimable`.
- Read start/end timestamps, `atomic: false`, and verification limitations.

The dossier is independent latest-state RPC reads, not a block-pinned snapshot,
new verdict, signed attestation or third-party audit. GitHub links open canonical
sources; exporting does not re-fetch them or prove their current availability.
Outbound requests are not proof of recipient settlement. A failed page/dossier
read produces an error rather than exporting a partial or invented result.

## Validation

- `cd frontend; npm test`: 28 passed, zero failed/skipped; 11 new explorer tests.
- Regressions cover page boundaries/empty deployments, failed rows, wrong version,
  identity mismatch, unsafe counts, uint256 IDs, deployment-scoped links,
  cross-bounty claim rejection, faithful JSON, bigint accounting and safe links.
- `npm run build`: successful, 480 modules. Main JS 936.31 kB / gzip 261.24 kB;
  the pre-existing large-chunk warning remains.
- `node scripts/verify_explorer.mjs`: live production-function reads verify three
  bounties and four claims; dossiers 1/1 and 3/4 retain WINNER and UNRESOLVED.
  These historical controlled fixtures are not new activity or traction.
- [Live readback results](../evidence/milestone-01/live-readback.json).
- [Winning record export](../evidence/milestone-01/bounty-1-claim-1.json).
- [Incomplete-evidence record export](../evidence/milestone-01/bounty-3-claim-4.json).

Browser and publication observations are recorded in the release evidence file
after verification. No new contract transaction, semantic evaluation or real
browser-extension signing is claimed by this frontend release.

[Browser/build/publication evidence](../evidence/milestone-01/RELEASE.md).

## Deployment

Cloudflare Pages project `mergebond`, production https://mergebond.pages.dev.
The local and production build env both use the same public V2 address:
`0x850482D16aDD6237f269911da2516F1F51E58510` (StudioNet 61999).
Direct upload uses the built `frontend/dist`; the project has no Git build hook.
Secrets are excluded from Git and the browser bundle.

Contract source hash remains
`c782ddc21e98c1486d319395093aa5ae326d54dab348f9c2d96746275eb68b68`.
No source/ABI/storage change and no contract redeployment are needed.
