# V2 live StudioNet E2E — 2026-10-10

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
- No production Cloudflare deployment was performed in this run.
