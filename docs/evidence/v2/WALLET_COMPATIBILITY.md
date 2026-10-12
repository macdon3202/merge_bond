# Wallet compatibility remediation — 2026-10-12

## Steward issue

The reviewer could not connect a wallet because `wallet_getSnaps` had no handler.
The cause was the pinned genlayer-js 1.1.8 `client.connect('studionet')` path: it
unconditionally requests MetaMask Snaps through global `window.ethereum`, even
when the application already selected a different valid EIP-1193 provider.

## Fix

MergeBond no longer calls SDK `connect()`. The production connection helper:

1. selects one injected EIP-1193 provider and retains it;
2. requests the account without requesting Snaps;
3. verifies StudioNet, switches it when necessary, and only adds it for error 4902;
4. verifies the final chain and account again; and
5. passes that exact provider to the genlayer-js client.

Rejected prompts are propagated. An ineffective network switch or account change
cannot produce a connected session. Reconnecting clears stale wallet state, and
the button is disabled while connection is pending. Existing pre-write account,
chain and contract-version guards remain unchanged.

## Verification boundaries

Seven regression tests execute the production helper with simulated EIP-1193
providers: no-Snap connection, provider selection, network switch, unknown-network
addition, rejection, ineffective switch, changed account and missing wallet.
These tests do not constitute real browser-extension signing. Production HTTP and
bundle verification likewise prove publication parity, not interactive wallet E2E.

Contract source and address are unchanged:
`0x850482D16aDD6237f269911da2516F1F51E58510`. No redeployment is required.

## Resubmission response

Fixed the wallet connection failure caused by genlayer-js 1.1.8 calling
wallet_getSnaps through the global provider. MergeBond now uses the selected
EIP-1193 provider directly for account access, StudioNet setup and the SDK client,
without requesting Snaps. It verifies the final network/account, propagates rejected
prompts and clears stale sessions. Added seven wallet regression tests covering
non-Snap and failure paths. Contract source and deployment are unchanged. Automated
provider tests and production bundle checks are documented separately from real
browser-extension signing, which must still be confirmed manually.
