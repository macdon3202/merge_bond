# Prospective StudioNet resource plan

Deployment: `0x850482D16aDD6237f269911da2516F1F51E58510`.
Public repository: macdon3202/merge_bond. Branch: fixture/v2-strict-gates.
Controlled synthetic implementation fixture; not an independent third-party bounty.

Issue criteria declared before funding: eligibility returns true iff all four
gates are exactly boolean true; independently reject truthy strings, numbers,
objects and arrays for every gate; retain the valid all-true case and existing
missing-gate behavior. Production change: fixture/src/eligibility.js. Regression:
fixture/tests/eligibility.test.mjs. Required exact-head check: contract-tests.

Expected positive: prospective merged PR with full patches and exact-head CI,
author-owned revision-pinned payout grant for auxiliary B, claim WINNER and
bounty RESERVED; withdrawal then recipient-side settlement observation.
Expected negatives: historic pre-funding PR and wrong-wallet authorization
cannot create claim or change custody; terminal replay cannot pay twice.

Auxiliary A sponsors/evaluates; B claims/withdraws. Primary wallet does not test.
Resource facts are fetched from canonical GitHub API by the deployed contract.
No frontend/browser E2E is inferred from SDK writes.
