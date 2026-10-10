# V2 replacement deployment required

Follow [V2 verification/runbook](V2_VERIFICATION.md). The V1 runbook below is
historical: its PR predates funding and its two-argument submit_claim is obsolete.
Fund first, create/merge a fresh PR, publish the author-owned authorization Gist,
then claim with four arguments. Primary wallet only deploys; auxiliary wallets test.

# Historical V1 StudioNet two-wallet runbook

Active deployment under test: `0x35C387b55a7Be9E2B74Ee4d56FD631936E1F8624`.

Use three distinct identities:

- Deployment wallet: deploys the exact repository source and performs no product role.
- Sponsor wallet: creates, seals and funds the bounty.
- Developer wallet: registers, submits the PR and withdraws if selected.

An optional fourth reviewer wallet should trigger `evaluate_claim` to prove evaluation is permissionless. Never place private keys in this repository or chat.

## Preparation

1. Push the exact contract and tests to a public repository.
2. Prepare the public GitHub Issue/PR/check resources in `TEST_RESOURCE_MANIFEST.md`.
3. Confirm sponsor and developer wallets have sufficient faucet GEN.
4. Run `scripts/verify.ps1`.
5. Deploy `contracts/merge_bond.py` from the deployment wallet without editing source.
6. Record the Studio Explorer address and compare deployed source/schema with this repository.
7. Set `VITE_CONTRACT_ADDRESS` to that exact address and rebuild.

## Happy path

For every write, save the transaction hash, leader execution result, consensus result and authoritative readback.

1. Sponsor calls `register_wallet()`.
2. Sponsor calls `create_bounty(owner, repository, issue, branch, amount, duration, production_prefix, test_prefix, required_check)`.
3. Extract the exact returned bounty ID and read `get_bounty(id)`; require `DRAFT`.
4. Sponsor calls `seal_issue(id)`; require `SEALED`, nonempty `issue_digest` and `policy_digest`.
5. Sponsor attaches exactly `amount` and calls `fund_bounty(id)`; require `OPEN`, deadline set, and contract balance/accounting increased.
6. Developer calls `register_wallet()`.
7. Developer calls `submit_claim(id, pr_number)`; extract exact returned claim ID and require `SUBMITTED`.
8. Reviewer wallet calls `evaluate_claim(claim_id)`; require claim `WINNER`, bounty `RESERVED`, exact developer winner and `claimant_due == amount`.
9. Developer calls `withdraw_bounty(id)`; require `PAID`, due zero, outbound increased and recipient balance increased by the expected value net of gas semantics.
10. Attempt the same withdrawal again and require `NOTHING_DUE`.

## Failure and conflict paths

- Wrong actor tries to seal: must revert and preserve DRAFT.
- Sponsor tries to submit its own claim: must revert.
- Wrong attached value: bounty remains SEALED; value appears only in sender refund ledger; sender can withdraw it.
- Report-only/test-only/production-only evidence: cannot reserve funds.
- Wrong base repository/branch, stale CI SHA, failed CI or mutated Issue: cannot reserve funds.
- GitHub unavailable: claim becomes or remains `UNRESOLVED`; no payout privilege.
- Two developer claims: first valid evaluation reserves the pool; second cannot evaluate once state is no longer OPEN.

## Expiry and rollback

1. Fund a short-duration bounty and do not establish a winner.
2. After the deadline, any wallet calls `expire_bounty(id)`.
3. Require `EXPIRED_REFUNDABLE`, `locked` reduced and `sponsor_due == amount`.
4. Sponsor withdraws and require `PAID` plus actual GEN movement.
5. Transfer-emission failure rollback is covered in Direct Mode; record a live failure only if it can be produced safely and deterministically.

## UI reconciliation

Repeat the primary flow through the deployed frontend:

- visible network and exact contract address match Explorer;
- wallet shown matches signer;
- UI never reports success at submission or `ACCEPTED` alone;
- final banner contains the transaction link only after finalized agreement and successful execution;
- loaded bounty/claim state matches direct `get_bounty`/`get_claim` reads;
- wrong-role actions are absent or produce clear contract errors;
- browser refresh preserves truth because state is re-read, not cached as success.

## Evidence record template

```json
{
  "network": "studionet",
  "contract": "0x...",
  "repository_commit": "...",
  "actors": {
    "deployer": "0x...",
    "sponsor": "0x...",
    "developer": "0x...",
    "reviewer": "0x..."
  },
  "transactions": [
    {
      "step": "create_bounty",
      "hash": "0x...",
      "status": "FINALIZED",
      "consensus": "MAJORITY_AGREE",
      "execution": "SUCCESS",
      "post_state": {}
    }
  ],
  "accounting_before": {},
  "accounting_after": {},
  "limitations": []
}
```
