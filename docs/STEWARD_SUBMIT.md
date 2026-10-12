# MergeBond V2 — steward submission packet

Updated 2026-10-11 (Asia/Bangkok). Main entry: [REVIEW_LINKS.md](../REVIEW_LINKS.md).

## Form fields

Title: MergeBond — Evidence-Gated Implementation Bounties

Website: https://mergebond.pages.dev

GitHub: https://github.com/macdon3202/merge_bond

Primary tag: Developer Tools. Use secondary tags only if available in the form;
do not invent unsupported dropdown values.

One-liner: GenLayer implementation bounties that bind author-authorized payout wallets to prospective merged PRs and fail closed on incomplete GitHub evidence.

## What did you change? (copy into the resubmission response)

Replaced the contract with V2 at 0x850482D16aDD6237f269911da2516F1F51E58510. A public revision-pinned Gist owned by the PR author now binds the payout sender and exact chain, contract, bounty, policy, repository, issue and PR commits. PR creation and merge must occur within the funded window. Evaluation requires complete sealed criteria, reconciled file pages and complete patches before semantic checks. Live auxiliary-wallet evidence covers successful settlement, rejected wrong payout-domain with unchanged state, historical PR/missing grant rejection, omitted patch including page 2 of a 103-file PR, and exact expiry refunds. REVIEW_LINKS.md links corrected source, receipts and readbacks. Browser-wallet signing E2E was omitted; generic SOURCE_UNAVAILABLE does not prove every truncation variant independently.

### Wallet-connect remediation response

Fixed the wallet connection error caused by genlayer-js 1.1.8 invoking
wallet_getSnaps through the global provider. MergeBond now uses the selected
EIP-1193 provider directly for account access, StudioNet network setup and the SDK
client, without requesting Snaps. It verifies the final chain/account, propagates
rejected prompts and clears stale sessions. Added seven wallet regressions; the
complete 17-test frontend/fixture suite and production build pass. The fix is live
at https://mergebond.pages.dev and the production bundle was verified against the
V2 contract. Contract source/deployment are unchanged. Real browser-extension
signing remains a manual reviewer check, not an automated claim.

## Project description

Sponsors seal complete public GitHub issue criteria, choose repository/branch,
production and regression paths, and a named CI check, then fund a bounded claim
window. Contributors submit prospective merged PRs with exact author-owned payout
authorization. Deterministic gates verify GitHub provenance, timing, complete
files/patches and exact-head CI. GenLayer evaluates whether the production change
and regression evidence satisfy the natural-language criteria. Only a grounded
winning claim reserves funds; unknown evidence cannot authorize payout. Permissionless
expiry and sender-bound withdrawal recover funds when no claim wins.

The deployer has no runtime authority. The primary wallet only deployed; auxiliary
A sponsored and auxiliary B claimed/evaluated/recovered as recorded in receipts.
GitHub fixtures are explicitly controlled synthetic test resources, not third-party
bounties or proof of real-world identity.

## Exact reviewer path

1. Open the website. Wallet connection is not needed to read historical records.
2. Click **Read happy settlement #1**: canonical bounty 1 should show PAID and
   claim 1 WINNER. Follow the happy E2E links to finality and recipient settlement.
3. Click **Read page-2 failure #4**: bounty 3 should show PAID after expiry/refund,
   no winner, claim 4 UNRESOLVED / SOURCE_UNAVAILABLE. Evidence records its earlier
   OPEN evaluation state separately from final cleanup state.
4. Read TARGETED_LIVE.md for wrong-domain rollback, PR6 omitted patch and PR7's
   100+3 paginated files with the omitted patch on page 2; each tx links to Explorer.
5. For a fresh write test, use your own funded StudioNet wallets: one sponsor and
   a different payout wallet. Create a new issue with explicit criteria, configure
   matching production/test prefixes and CI name, create/seal/fund a bounty (maximum
   window 900 seconds). Do not reuse expired bounties or historical PRs.
6. Only after funding, create a qualifying PR, complete exact-head CI and merge
   before deadline. The PR author publishes the exact authorization template as
   one public mergebond-authorization.json Gist; fill observed author ID and commit
   fields, and pin its full revision. Register the payout wallet and submit from it.
7. Any funded reviewer wallet may evaluate the fresh claim. A valid complete claim
   may reserve payout; missing evidence must not. Winner withdraws a reservation;
   otherwise after deadline anyone expires, then sponsor withdraws its refund.
   The short window requires preparing the branch/check workflow before funding.

## Expected verification outcome (under 500 characters)

Historical readback shows bounty 1 PAID / claim 1 WINNER and bounty 3 PAID with no winner / claim 4 UNRESOLVED, SOURCE_UNAVAILABLE. Live receipts link to the exact V2 deployment. Wrong payout-domain rolls back; incomplete patches never reserve funds; expiry returns the exact funded amount. Fresh tests require a new funded window, a post-funding PR and author-owned payout authorization.

## Evidence links to submit

Use REVIEW_LINKS.md as the main evidence URL:
https://github.com/macdon3202/merge_bond/blob/main/REVIEW_LINKS.md

Detailed remediation:
https://github.com/macdon3202/merge_bond/blob/main/docs/evidence/v2/TARGETED_LIVE.md

Happy settlement:
https://github.com/macdon3202/merge_bond/blob/main/docs/evidence/v2/STUDIONET_E2E.md

Corrected source:
https://github.com/macdon3202/merge_bond/blob/main/contracts/merge_bond.py

## Verification boundaries

Live tests used SDK/CLI, not V2 browser-wallet signing. Local actual-contract tests
record 75 passed and 1 known sandbox-decoder xfail; it is not a pass. Public live
receipts complement, not erase, that limitation. API patch observations plus source
ordering support targeted missing-patch attribution; the on-chain reason is generic.
Not every pagination/truncation/semantic attack was independently tested live.
No guarantee of bug-free software or independent audit is claimed.
