# Historical V1 — not V2 remediation evidence

These transactions belong to source V1. Contributor authorization, prospective
timing and complete-acquisition guards need fresh transactions after V2 deployment.
See [V2 verification](../V2_VERIFICATION.md).

# MergeBond StudioNet E2E transaction record

This document is the human-readable index for the raw machine record in [`studionet-e2e.json`](studionet-e2e.json). Every transaction below was submitted to the deployed contract, reached `FINALIZED`, and was reconciled against authoritative contract state. Error transactions are expected negative controls, not failed test infrastructure.

## Deployment and actors

- Network: GenLayer StudioNet
- Contract: [`0x35C387b55a7Be9E2B74Ee4d56FD631936E1F8624`](https://explorer-studio.genlayer.com/address/0x35C387b55a7Be9E2B74Ee4d56FD631936E1F8624)
- Contract version: `MERGE_BOND_V1`
- Architecture: `COMPETITIVE_CLAIM_POOL_CRITERIA_LATTICE`
- Deployer authority: `NONE`
- Sponsor wallet A: `0xFeD97e2aE1A8C1983b7cA206B3545e6A2c685E43`
- Developer wallet B: `0xc67532aeF9D2879cBA9375a02E6217A3524657B8`
- GitHub source: [`macdon3202/merge_bond`](https://github.com/macdon3202/merge_bond)
- Sealed criteria: [Issue #1](https://github.com/macdon3202/merge_bond/issues/1)
- Evaluated implementation: [PR #2](https://github.com/macdon3202/merge_bond/pull/2)
- PR head SHA: `9174314be1bd5d7a7bd805eae99c86a730e7b62a`
- Merge SHA: `2db22aea9132adf513beaad12da4bf0d200a2577`

## Transaction index

| # | Scenario | Actor | Contract method | Transaction | Final result | Authoritative effect |
|---:|---|---|---|---|---|---|
| 1 | Register sponsor | A | `register_wallet` | [`0x930607…87203`](https://explorer-studio.genlayer.com/transactions/0x930607b526af809ef9674f2ea2b9298c60b698f613a9388002e873506a987203) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Sponsor wallet registered. |
| 2 | Register developer | B | `register_wallet` | [`0x37516c…57bc3`](https://explorer-studio.genlayer.com/transactions/0x37516c21bf367a4a85cf8b009fa4cc75ee89a6660e447aa19408e935ccc57bc3) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Developer wallet registered. |
| 3 | Create happy-path bounty | A | `create_bounty` | [`0xc4df37…7b73a`](https://explorer-studio.genlayer.com/transactions/0xc4df37cc00c66f40204082c1de9cc269654fe66d6840c15a5e8b1a7a8807b73a) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Returned exact Bounty ID `1`; state `DRAFT`. |
| 4 | Wrong actor attempts seal | B | `seal_issue` | [`0x8da0e5…a3124`](https://explorer-studio.genlayer.com/transactions/0x8da0e5080ec1f117b330ae601ce47faff54bfc3dbee13b24c7c2e4ad9a6a3124) | `FINALIZED / MAJORITY_AGREE / ERROR: SPONSOR_REQUIRED` | Complete bounty pre/post state remained equal and `DRAFT`. |
| 5 | Seal canonical Issue | A | `seal_issue` | [`0x6a76db…0fe72`](https://explorer-studio.genlayer.com/transactions/0x6a76db21d6a2a71a423dc98ba77cbf904ed2f8c58e8f71404edd305b6bd0fe72) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | State `SEALED`; Issue digest `c5b0589e…cd19a`; policy digest `7bb225ba…253f`. |
| 6 | Fund with wrong value | A | `fund_bounty` | [`0x91333c…53070`](https://explorer-studio.genlayer.com/transactions/0x91333cbc72544d12a85d01668f36c8cd7902538cb65dbf6e9dbbb83f31a53070) | `FINALIZED / MAJORITY_AGREE / SUCCESS: REFUND_CLAIMABLE` | Bounty remained `SEALED`; `999999999999` wei credited only to sponsor refund ledger. |
| 7 | Withdraw wrong-value refund | A | `withdraw_refund` | [`0xb41827…4e1e`](https://explorer-studio.genlayer.com/transactions/0xb418275c37f4efc559e4103efb99e318dc1da574685521f583ce3b15bb514e1e) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Refund transfer requested and refund claimable returned to zero. |
| 8 | Fund exact bounty amount | A | `fund_bounty` | [`0xb37faa…38f1`](https://explorer-studio.genlayer.com/transactions/0xb37faa5177da0e1da9f49bd4d4c246cbab91343cc7530aae3c71e0501a2a38f1) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Exactly `1000000000000` wei locked; state `OPEN`. |
| 9 | Sponsor attempts self-claim | A | `submit_claim` | [`0x623088…a98`](https://explorer-studio.genlayer.com/transactions/0x623088172efa0ca199f8b0cdf9b06d6dc5938bbab58771cd7fc481686b899a98) | `FINALIZED / MAJORITY_AGREE / ERROR: INVALID_CLAIM` | Complete bounty pre/post state remained equal and `OPEN`. |
| 10 | Submit valid merged PR | B | `submit_claim` | [`0xe25da1…cb8e`](https://explorer-studio.genlayer.com/transactions/0xe25da1cbf87ee5e0f4ae4115c64380db55f51d78c36751e7a33380ba8867cb8e) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Returned exact Claim ID `1`; state `SUBMITTED`. |
| 11 | Submit competing claim | B | `submit_claim` | [`0xcac665…5e4c`](https://explorer-studio.genlayer.com/transactions/0xcac6653f05dab0d846cc1933b20fc33e7e7f77632f0459e83b83264553ee5e4c) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Returned Claim ID `2`; competing claim staged before reservation. |
| 12 | Evaluate valid claim | A | `evaluate_claim` | [`0xd3585b…57a0`](https://explorer-studio.genlayer.com/transactions/0xd3585b49fa71ad20415694ada97d83c3e941e41f3379771faae9cf7d8ed857a0) | `FINALIZED / MAJORITY_AGREE / SUCCESS: RESERVED` | Claim `1` became `WINNER/SATISFIED`; bounty became `RESERVED`; claimant due `1000000000000`. |
| 13 | Evaluate losing claim after reservation | B | `evaluate_claim` | [`0x9304e8…7082`](https://explorer-studio.genlayer.com/transactions/0x9304e895692322e7cc33c1de5b915087a1c1f4fed1e1e0ad95f2fac4e91a7082) | `FINALIZED / MAJORITY_AGREE / ERROR: BOUNTY_NOT_OPEN` | Claim `2` pre/post state remained equal; no second reservation or payout. |
| 14 | Winner withdraws | B | `withdraw_bounty` | [`0xead099…35cc`](https://explorer-studio.genlayer.com/transactions/0xead099fb45aa5fb672de655ed79e4a59f6c5b487b4606a4dcb361d38f6fd35cc) | `FINALIZED / MAJORITY_AGREE / SUCCESS` | Bounty became `PAID`; claimant due zero; contract balance zero. |
| 15 | Replay winner withdrawal | B | `withdraw_bounty` | [`0x913668…29de`](https://explorer-studio.genlayer.com/transactions/0x9136681a3cb585408692e74fcdaa36f97299f398d6f3723080cfbae7ee3c29de) | `FINALIZED / MAJORITY_AGREE / ERROR: NOTHING_DUE` | Complete bounty pre/post state remained equal; double payout prevented. |

## Semantic evaluation readback

Transaction 12 fetched the canonical Issue, merged PR, changed-file list and exact-head check runs. The authoritative claim readback was:

```json
{
  "id": 1,
  "bounty_id": 1,
  "pr_number": 2,
  "state": "WINNER",
  "verdict": "SATISFIED",
  "reason": "CRITERIA_AND_PROVENANCE_SATISFIED",
  "head_sha": "9174314be1bd5d7a7bd805eae99c86a730e7b62a",
  "merge_sha": "2db22aea9132adf513beaad12da4bf0d200a2577",
  "production_files": ["fixture/src/eligibility.js"],
  "test_files": ["fixture/tests/eligibility.test.mjs"],
  "source_digest": "b6fce70d68d5319190faff0a41fd7e01170ac751f2859c5d0d1928c795d864cf"
}
```

## Final accounting and invariants

```json
{
  "balance": "0",
  "deposited": "1999999999999",
  "locked": "0",
  "claimant_claimable": "0",
  "sponsor_claimable": "0",
  "refund_claimable": "0",
  "outbound_requested": "1999999999999"
}
```

Verified invariants:

- `deposited == balance + locked + all claimable + outbound_requested`
- The wrong-value deposit was recoverable and never opened the bounty.
- Only the winning claim reserved the pool.
- Payout reduced claimant due to zero before transfer emission.
- Rejected and replayed transactions preserved complete relevant state.
- Final contract balance, locked funds and every claimable bucket are zero.

## Frontend reconciliation

The production frontend at [mergebond.pages.dev](https://mergebond.pages.dev) loaded Bounty ID `1` and Claim ID `1` through the contract read methods and displayed:

- `Bounty #1 — PAID`
- `Claim #1 — WINNER`
- `Canonical state synchronized.`

The browser test required the exact deployed address, these live states, and zero runtime exceptions before passing. The rendered result is stored at [`docs/assets/frontend-home.png`](../assets/frontend-home.png).

## Evidence scope

This run proves the recorded StudioNet transitions, value accounting, canonical GitHub gates, validator verdict and frontend readback for this fixture. GitHub is authoritative for its repository objects, merge state and check runs; it is not presented as proof of an unrelated production deployment. Direct-mode poisoned-evidence, source-unavailable, malformed-model and transfer-failure cases remain separately documented in the test matrix and JUnit artifact.
