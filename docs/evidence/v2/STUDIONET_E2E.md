# V2 consolidated live StudioNet E2E

Consolidated 2026-10-11; transactions recorded 2026-10-10.
This file combines happy settlement, negative controls, domain authorization,
paginated omitted patches and expiry/refund. All transaction links open Explorer.

Contract: [0x850482D16aDD6237f269911da2516F1F51E58510](https://explorer-studio.genlayer.com/address/0x850482D16aDD6237f269911da2516F1F51E58510).
Exact deployment source parity: [DEPLOYMENT.md](DEPLOYMENT.md).
Raw journal: [full receipts and snapshots](0x850482d16add6237f269911da2516f1f51e58510.json).
Primary wallet did not test. A sponsored/evaluated; B claimed/withdrew.

## Canonical controlled test resources

- [Issue #3](https://github.com/macdon3202/merge_bond/issues/3): complete criteria sealed before funding.
- [PR #4](https://github.com/macdon3202/merge_bond/pull/4): created `2026-10-10T08:53:13Z`, merged `2026-10-10T08:53:35Z`.
- Head: `035e11a4b8041a34c2b06876df83aa632b29a5a3`.
- Merge: `19b2396a1859a09306f1eeabe5102efab2f7a4ae`.
- [Exact-head CI](https://github.com/macdon3202/merge_bond/actions/runs/38039178063/job/114175829522): contract-tests, completed/success.
- [Author Gist](https://gist.github.com/macdon3202/f4a1798c0e2f6b1e6d578ef01f804d1f/e8ef63c430bfb0ceadef5269c16fca56776ae190): contributor numeric ID `320846373`, revision `e8ef63c430bfb0ceadef5269c16fca56776ae190`.
- Bounty 1 funded_at `1791622355`, deadline `1791623255`; claim 1 submitted_at `1791622509`. Prospective PR creation and merge fit the timing rule.

These are explicitly controlled synthetic resources, not a third-party bounty or independent security audit.

## Transaction index

All parent positive writes below finalized with MAJORITY_AGREE and leader SUCCESS.

| Step | Explorer transaction |
|---|---|
| Register A | [0x816c1fec4629e1905dfde2d2076f7318613c8d070fbf8472ce06cdac2da89ca7](https://explorer-studio.genlayer.com/transactions/0x816c1fec4629e1905dfde2d2076f7318613c8d070fbf8472ce06cdac2da89ca7) |
| Register B | [0x62c715cefcbcb8b91f4ca3320442c74b179299142749bc7fb743ebc9376adbd5](https://explorer-studio.genlayer.com/transactions/0x62c715cefcbcb8b91f4ca3320442c74b179299142749bc7fb743ebc9376adbd5) |
| Create bounty | [0xc3736d0318061405667bdd0d0fe3d5bbd3b1223e81f6e39fb5bc4b5dd6ef9ac3](https://explorer-studio.genlayer.com/transactions/0xc3736d0318061405667bdd0d0fe3d5bbd3b1223e81f6e39fb5bc4b5dd6ef9ac3) |
| Seal issue | [0xebb571933375a8bc53780cf1e8d197074ef6d8f924f00389d6f906a70df7171e](https://explorer-studio.genlayer.com/transactions/0xebb571933375a8bc53780cf1e8d197074ef6d8f924f00389d6f906a70df7171e) |
| Fund | [0x95cf23321c11af58aca333f8040ea1410e983e1127a1be44e69532797b345bff](https://explorer-studio.genlayer.com/transactions/0x95cf23321c11af58aca333f8040ea1410e983e1127a1be44e69532797b345bff) |
| Authorized claim | [0xce7403289a9524dbfc55b1d634004d7403fba247a4eb7231fe1151154632f3c6](https://explorer-studio.genlayer.com/transactions/0xce7403289a9524dbfc55b1d634004d7403fba247a4eb7231fe1151154632f3c6) |
| Evaluate | [0x87d9900eee03904b111d7206c5de384f8e5122baaaa06342b96669ce44910dad](https://explorer-studio.genlayer.com/transactions/0x87d9900eee03904b111d7206c5de384f8e5122baaaa06342b96669ce44910dad) |
| Withdraw B | [0x4e086700b0bbb04a48c873163aa947f4b61ca08eaaa8076ad52f4633de65ae83](https://explorer-studio.genlayer.com/transactions/0x4e086700b0bbb04a48c873163aa947f4b61ca08eaaa8076ad52f4633de65ae83) |
| Transfer to B | [0xd49506213b34ef63cdbc0166a20fa103b194ad042b3e442033e06e6363934e22](https://explorer-studio.genlayer.com/transactions/0xd49506213b34ef63cdbc0166a20fa103b194ad042b3e442033e06e6363934e22) |
| Double withdraw rejection | [0x90d5b6e5f857e3177d41a5d1a269756d51aa2ed4aff24fb525ee6bbd56148136](https://explorer-studio.genlayer.com/transactions/0x90d5b6e5f857e3177d41a5d1a269756d51aa2ed4aff24fb525ee6bbd56148136) |
| Terminal evaluate control | [0x28aa3853508f2544e6f7153e6d7105a9358125e875af65e440572c96a0a7dbad](https://explorer-studio.genlayer.com/transactions/0x28aa3853508f2544e6f7153e6d7105a9358125e875af65e440572c96a0a7dbad) |

## Readback and economics

Claim 1: WINNER / SATISFIED, reason CRITERIA_AND_PROVENANCE_SATISFIED.
Evaluation returned RESERVED. Final bounty PAID, winning_claim 1, winner B,
no remaining due/locked balances and contract balance zero.
Wallet B balance before withdrawal `199908003499999999998` wei;
after `199908004499999999998` wei: exact delta `1000000000000` wei.
Transfer child is FINALIZED, value matches, from this contract to B.
Its RPC result_name is NO_MAJORITY and has no contract execution receipt;
do not mislabel a simple value transfer as AI consensus MAJORITY_AGREE.
Double withdrawal finalized MAJORITY_AGREE / ERROR / NOTHING_DUE;
entire config/accounting/bounty/claim snapshot unchanged.
Terminal evaluate also finalized MAJORITY_AGREE / ERROR / CLAIM_NOT_EVALUABLE,
with the complete snapshot unchanged.

## Observed limitations and test-harness corrections

- Template initially failed because a JS string was encoded instead of Address.
  Client/script now use SDK CalldataAddress; contract source was not changed.
- Seal had leader SUCCESS and majority agreement but one returned validator
  receipt ERROR. Investigation: `CONSENSUS_VALIDATOR_QUORUM_REACHED`, stderr
  `Validator execution cancelled after quorum`, fatal=false. This is quorum
  cancellation, not a discovered contract logic failure. Full receipts remain.
- Runtime warns about pickling storage / nondet reads. Positive claim/evaluation
  nonetheless have successful live leader/validator executions; warning remains.
- Withdrawal was sent while evaluate was ACCEPTED, before evaluator finality
  polling finished. Evaluation readback therefore observed the later PAID state,
  and the original harness assertion expecting only RESERVED failed. This is not
  a failed evaluation transaction. Harness now permits the same winning claim
  in RESERVED or PAID. Journal reconciliation must be sequential thereafter.
- Wrong-wallet/pre-funded-PR rejection, incomplete-source negative live cases,
  expiry/refund and independent browser-wallet/UI journey are not established
  by this positive lifecycle and terminal controls. Local mocks are not live proof.
- Latest frontend publication is recorded in [STEWARD_FRONTEND_PUBLICATION.md](STEWARD_FRONTEND_PUBLICATION.md); HTTP/bundle parity is not browser E2E.

## Live negative controls — 2026-10-10

Deployment V2, bounty 2, issue 3. Full receipts/pre-post in
[negative journal](0x850482d16add6237f269911da2516f1f51e58510-negative.json).

| Control | Actual result | Explorer |
|---|---|---|
| Historic PR #4 predates funding | FINALIZED / MAJORITY_AGREE / ERROR, generic authorization/eligibility rejection; complete rollback | [tx](https://explorer-studio.genlayer.com/transactions/0x8309475c9132fbcd835e3e1e1ef5f2538fb90283513265e82ea1deb28fc28285) |
| Sponsor A attempts claim using B grant | FINALIZED / MAJORITY_AGREE / ERROR / INVALID_CLAIM, sponsor guard; complete rollback, NOT domain-validation proof | [tx](https://explorer-studio.genlayer.com/transactions/0x693aa4ece674ca930e4a40ba6eb60b78c146b971eb3133a187ecf57bafe41016) |
| B uses nonexistent Gist/revision for prospective PR #5 | FINALIZED / MAJORITY_AGREE / ERROR, generic authorization/eligibility rejection; complete rollback | [tx](https://explorer-studio.genlayer.com/transactions/0x7a66dda12c1e1834fe464bd77cebed1014efabd87132ad59afe02cdd7ecd0927) |
| B uses valid author grant after rejections | FINALIZED / MAJORITY_AGREE / SUCCESS, exact returned claim 2; no consumed slot | [tx](https://explorer-studio.genlayer.com/transactions/0x7ba992c86243d15b59558cedb434db1c68002bda5f91e4d3d9f616362f7fd0e6) |

Prospective [PR #5](https://github.com/macdon3202/merge_bond/pull/5), head
`f54b123c909ac154844aab555b899170cfc196d1`, merge
`285783c2b3e342f0ac58e3a9735cda1e688cf88a`, author 320846373.
Created 2026-10-10T09:14:32Z, merged 09:14:49Z; funded_at 1791623642,
deadline 1791624542. [Exact-head CI](https://github.com/macdon3202/merge_bond/actions/runs/38040097748/job/114178448670).
Gist `8b91e9c251480839ba5fb942fcf30ba9`, revision
`9b99112e6b4bae89f4e9a29f7fc68086606a58ca`, owned by PR author, grants B.

No injected GitHub response is represented as live acquisition proof. Pagination
and omitted/truncated patches remain actual-contract local regression coverage,
not authenticated live malformed-GitHub-response coverage.
Browser wallet journey omitted at user request.

### Expiry and sponsor refund

Permissionless expiry by B: [finalized success](https://explorer-studio.genlayer.com/transactions/0x5b7c79a06d634157137d5d7f865dea04ce35b2ffe397c18cced065d2da0d51ec).
Post-state EXPIRED_REFUNDABLE, reason NO_WINNER_BEFORE_DEADLINE, sponsor_due
1000000000000, locked zero, claimant_due zero.
Sponsor A refund: [finalized success](https://explorer-studio.genlayer.com/transactions/0x04f0db6dcca35c43f10a1f5540980bf7f39583301ced6408dd1432bef328cbf6).
Both parent transactions MAJORITY_AGREE / leader SUCCESS.
A balance before 199941991500000001000, after 199941992500000001000 wei:
exact +1000000000000. Final bounty PAID with no winner, contract balance zero,
all dues and locked zero. Cumulative deposited/outbound_requested both
2000000000000 wei across the positive payout and this refund.

## Targeted payout-domain and incomplete-patch live controls

Same deployed V2 source, bounty 3, auxiliary sponsor A / claimant B.
Raw journal: [incomplete](0x850482d16add6237f269911da2516f1f51e58510-incomplete.json).

### Wrong payout domain

Author-owned Gist `adfadac82f4ed1abcddd0ec720221f7a`, revision
`02bfe9d0e94bb4804bdcda0cd140cfbc2251d135`, names payout A; non-sponsor B submits.
[Transaction](https://explorer-studio.genlayer.com/transactions/0x5ffca99164eadba2ccbc407a0d5fa3af71dc93a55c960fe094c18056111a9422)
FINALIZED / MAJORITY_AGREE / ERROR / CLAIM_AUTHORIZATION_OR_ELIGIBILITY_FAILED.
Complete snapshot equality true. This control does not hit sponsor self-claim.

Correct B grant `7640c9e4b0f93ff93cd47f9d24e7505a`, revision
`26c6bb97e2bf9e3887429f0702284774f6bda008`, otherwise same domain, succeeds:
[claim 3](https://explorer-studio.genlayer.com/transactions/0x8eae129f56c244fc9d59d2d39cd8edb1ed93a9c0dd9b5b69c009c434b62709f4).

### Authentic omitted patch

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

### Second-page control

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

### Expiry and refund cleanup

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
