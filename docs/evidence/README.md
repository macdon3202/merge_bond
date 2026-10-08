# Local verification artifacts

This directory contains machine-generated local verification output:

- `direct-mode-junit.xml`: direct execution of the public contract methods with controlled web/LLM mocks.
- `frontend-junit.xml`: transaction normalization, finality, exact-ID and chain-ID unit tests.
- `../assets/frontend-home.png`: Chrome capture of the production bundle after runtime-exception and marker checks.

`studionet-e2e.json` contains the resumable runner's raw transaction hashes, finality/consensus/execution signals and authoritative pre/post readbacks for the live two-wallet lifecycle. `deployment-readback.json` records the initial unauthenticated configuration read. Direct-mode artifacts remain explicitly local engineering evidence and do not substitute for the live record.

The live fixture demonstrates GitHub object identity, merged diff paths, exact-SHA CI and semantic validator consensus. It does not claim independent production deployment or that the repository controller is an independent publisher.

`cloudflare-deployment.json` records the production and immutable Pages URLs plus post-deployment HTTP, header and bundle-binding checks. No API token is stored in this repository.
