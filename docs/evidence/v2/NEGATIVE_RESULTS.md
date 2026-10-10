# Live negative controls — 2026-10-10

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

## Expiry and sponsor refund

Permissionless expiry by B: [finalized success](https://explorer-studio.genlayer.com/transactions/0x5b7c79a06d634157137d5d7f865dea04ce35b2ffe397c18cced065d2da0d51ec).
Post-state EXPIRED_REFUNDABLE, reason NO_WINNER_BEFORE_DEADLINE, sponsor_due
1000000000000, locked zero, claimant_due zero.
Sponsor A refund: [finalized success](https://explorer-studio.genlayer.com/transactions/0x04f0db6dcca35c43f10a1f5540980bf7f39583301ced6408dd1432bef328cbf6).
Both parent transactions MAJORITY_AGREE / leader SUCCESS.
A balance before 199941991500000001000, after 199941992500000001000 wei:
exact +1000000000000. Final bounty PAID with no winner, contract balance zero,
all dues and locked zero. Cumulative deposited/outbound_requested both
2000000000000 wei across the positive payout and this refund.
