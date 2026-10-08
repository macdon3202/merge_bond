# Local verification artifacts

This directory contains machine-generated local verification output:

- `direct-mode-junit.xml`: direct execution of the public contract methods with controlled web/LLM mocks.
- `frontend-junit.xml`: transaction normalization, finality, exact-ID and chain-ID unit tests.
- `../assets/frontend-home.png`: Chrome capture of the production bundle after runtime-exception and marker checks.

These artifacts are local engineering evidence. They do not replace Studio Explorer transaction hashes, public GitHub source objects, real wallet balances or authoritative post-state. `deployment-readback.json` records an unauthenticated StudioNet `get_config` read from the supplied deployment; write-path E2E evidence remains pending.
