# V2 replacement deployment

Verified on 2026-10-10 using StudioNet SDK reads (no primary-wallet writes).

- Contract: [0x850482D16aDD6237f269911da2516F1F51E58510](https://explorer-studio.genlayer.com/address/0x850482D16aDD6237f269911da2516F1F51E58510)
- `get_config.version`: `MERGE_BOND_V2`.
- Architecture: `COMPETITIVE_CLAIM_POOL_CRITERIA_LATTICE`.
- Deployer authority: `NONE`.
- Initial bounty/claim counts: zero.
- Duration bounds: 120–900 seconds.
- Deployed source returned by `getContractCode(address)` exactly matches `contracts/merge_bond.py` byte for byte.
- SHA-256: `c782ddc21e98c1486d319395093aa5ae326d54dab348f9c2d96746275eb68b68`.
- Schema: 14 methods, including four-argument `submit_claim` and `get_authorization_template`.

This records source/config/schema parity only. It does not prove live lifecycle, negative controls, independent validator behavior, payout settlement, or production UI reconciliation. No deployment transaction hash was supplied or inferred.

Preparation checks: authenticated GitHub account `macdon3202` (numeric ID `320846373`) has `gist`, `repo`, and `workflow` scopes. No credentials are included here. Local and production frontend environment files now select this V2 address; this does not change the published website.

Production build retry: sandbox run failed with `spawn EPERM`; elevated run stayed at `transforming` and its exact verified Vite build process was stopped. Production build remains unverified. No V2 bounty was funded during these preparation checks, avoiding a running deadline before prospective PR/Gist resources are ready.
