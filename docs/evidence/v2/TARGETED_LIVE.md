# Targeted payout-domain and incomplete-patch live controls

Same deployed V2 source, bounty 3, auxiliary sponsor A / claimant B.
Raw journal: [incomplete](0x850482d16add6237f269911da2516f1f51e58510-incomplete.json).

## Wrong payout domain

Author-owned Gist `adfadac82f4ed1abcddd0ec720221f7a`, revision
`02bfe9d0e94bb4804bdcda0cd140cfbc2251d135`, names payout A; non-sponsor B submits.
[Transaction](https://explorer-studio.genlayer.com/transactions/0x5ffca99164eadba2ccbc407a0d5fa3af71dc93a55c960fe094c18056111a9422)
FINALIZED / MAJORITY_AGREE / ERROR / CLAIM_AUTHORIZATION_OR_ELIGIBILITY_FAILED.
Complete snapshot equality true. This control does not hit sponsor self-claim.

Correct B grant `7640c9e4b0f93ff93cd47f9d24e7505a`, revision
`26c6bb97e2bf9e3887429f0702284774f6bda008`, otherwise same domain, succeeds:
[claim 3](https://explorer-studio.genlayer.com/transactions/0x8eae129f56c244fc9d59d2d39cd8edb1ed93a9c0dd9b5b69c009c434b62709f4).

## Authentic omitted patch

[PR6](https://github.com/macdon3202/merge_bond/pull/6), head
`2fa8105ff9ebb4443f5e3eab6374a16228c8c192`, merge
`73bcb17e55db26eee211ac42c2865542e0651f92`, author 320846373.
GitHub files API: `fixture/src/large-evidence.js` additions=22000,
changes=22000, patch absent; test file additions=4, patch length=280.
PR created 2026-10-10T09:42:36Z and merged 09:42:39Z after funding 1791625309.
CI failure is explicitly retained; this is not a qualifying positive PR.
Acquisition checks `complete_patch` before CI/semantic evaluation.

[Evaluation](https://explorer-studio.genlayer.com/transactions/0xd08bc1a8cff2c941e3a1cf5835d66a8cfa7a096153c12b371c880debfae8be32)
FINALIZED / MAJORITY_AGREE / SUCCESS; business outcome UNRESOLVED / SOURCE_UNAVAILABLE.
Both returned leader/validator executions SUCCESS. No winner or claimable payout,
bounty OPEN, locked 1000000000000 wei. Generic source reason does not expose a
per-guard trace; API observations plus code order support omitted-patch attribution,
not an on-chain reason named PATCH_INCOMPLETE.

## Second-page control

[PR7](https://github.com/macdon3202/merge_bond/pull/7), head
`3324e370a2e3222f4bca60c7b0f6c7717eb2ce41`, merge
`38b3bb18ad565c96c956303a20d952cff5f5a9e2`.
Files API page1: 100 files, all have patch. Page2: 3 files:
page-100.js (1 addition, patch length43), zz-page-two-large.js (22000 additions,
patch absent), tests/page-two.test.mjs (3 additions, patch length166).
Correct author grant `1e14f3c381079c0892efd998aaa813dd` revision
`fa4012094e6cd27eae89181dd1ddaf082d4421b2`. Separate
[pagination journal](0x850482d16add6237f269911da2516f1f51e58510-pagination.json).
[Claim 4](https://explorer-studio.genlayer.com/transactions/0xbfa82e5264e8be97a35524b6e36c5dd9b941e912cdf00e613acb7f566ecd36d7)
finalized successfully with the correct grant.
[Evaluation](https://explorer-studio.genlayer.com/transactions/0x686aab477e4f54bfaba47546b6ce1de051da0df42c6a94dbde8247584b12a5d6)
FINALIZED / MAJORITY_AGREE / SUCCESS; claim 4 UNRESOLVED / SOURCE_UNAVAILABLE.
Bounty remains OPEN, winning_claim=0, claimant claimable=0, locked=1000000000000 wei.
This tests real paginated input
with an omission on page2, not a forged missing HTTP page or every truncation form.

## Expiry and refund cleanup

Deadline bounty3: 1791626209.
[Expiry by B](https://explorer-studio.genlayer.com/transactions/0x524cf9f39b1cb416a0c0063902bc9ae45356c49e34d8bafc2a24dcad2cb5dd68)
and [refund withdrawal by A](https://explorer-studio.genlayer.com/transactions/0x2d1098533950ac234c3cb9f67191b164ef0731b1f0ba33dcd83b973250afcbd1)
both FINALIZED / MAJORITY_AGREE / SUCCESS.
Sponsor balance: 199941991500000001000 -> 199941992500000001000 wei,
exact delta 1000000000000 wei. Final bounty PAID, no winner;
balance, locked, claimant_claimable, sponsor_claimable and refund_claimable all 0.
Cumulative deposited = outbound_requested = 3000000000000 wei.
The incomplete journal contains final snapshots and balance observations;
pagination journal preserves its earlier evaluation-time snapshot.

Browser-wallet E2E omitted by user request. Controlled fixtures are not third-party audit.
