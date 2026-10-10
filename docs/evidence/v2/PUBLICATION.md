# V2 publication — 2026-10-10

Cloudflare Pages deployed successfully.
Production: https://mergebond.pages.dev
Immutable: https://15343b39.mergebond.pages.dev
HTTP verification: 200, asset `/assets/index-Dl7oo7iP.js` contains
`0x850482D16aDD6237f269911da2516F1F51E58510` and `MERGE_BOND_V2`.
This is HTTP/build-artifact parity, not browser-wallet E2E, omitted at user request.

Live negative journal: `0x850482d16add6237f269911da2516f1f51e58510-negative.json`.
Historic PR rejection and missing Gist rejection finalized MAJORITY_AGREE / ERROR;
complete snapshots unchanged. The A-versus-B grant attempt hit sponsor self-claim
guard INVALID_CLAIM before grant validation, so it does not prove wrong-domain
authorization. No claim that all source-completeness controls have run live.

Seal receipt ERROR was quorum cancellation: CONSENSUS_VALIDATOR_QUORUM_REACHED,
fatal=false, Validator execution cancelled after quorum; not a contract exception.

Targeted wrong-domain grant with non-sponsor caller and authentic omitted-patch
controls (including a 103-file PR with omission on page 2) have since finalized:
[targeted live evidence](TARGETED_LIVE.md). These do not prove every possible
truncation or missing-page failure independently. Browser-wallet journey omitted.
Expiry/refund has since finalized with exact sponsor balance delta, recorded in
[negative results](NEGATIVE_RESULTS.md).
