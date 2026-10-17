# MergeBond milestone roadmap

Baseline: `ac05f744da7120db81d7e07018919bea8fe54bae` (21 commits).
Contract class `MergeBond`; V2 has 14 public methods, deterministic acquisition
with `strict_eq` and bounded semantic prover/falsifier `prompt_comparative`.
React 19/Vite/genlayer-js 1.1.8; one application with sponsor/developer/verify
workspaces. Direct contract tests and controlled public fixtures already exist.
No appeal, reputation, encryption or external indexing service is implemented.
Existing wallet fix, prospective timing and complete-patch safeguards are baseline,
not new milestone content. Existing tests record 75 passes and one decoder xfail.

## Stage 1 — Public evidence discovery (this release)

Category: major user feature / verifiable access to existing contract decisions.
Bounded listing, evidence dossiers, deployment-scoped links and downloadable
readbacks make the existing AI decisions discoverable without knowing IDs.
Evidence: code diff, before/after code, 11 new regressions, live RPC readbacks,
browser checks and Cloudflare publication. No contract deployment is needed.
Plan estimate: 6–10 engineering hours; scoring is determined by program review,
not promised by this roadmap.

## Stage 2 — Auditable adjudication attempts

New contract functionality: bounded append-only attempt records, normalized
acquisition failure codes and persisted semantic flag diagnostics. A retry must
not erase earlier source availability or findings. Split storage-free acquisition
inputs from persistent state, and test independent validator execution and
concurrent expiry before reservation. Requires a new contract/storage deployment
and fresh positive/negative/recovery evidence. Estimate: 16–24 hours.
Do not submit Stage 1 discovery/export again as Stage 2 work.

## Stage 3 — Contributor authorization workflow integration

Integrate canonical GitHub metadata into a contributor preparation flow: inspect
the funded window, verify exact author/PR/revision, construct the author grant,
and validate a published pinned grant before signing. Read-only preflight cannot
authorize payout; the contract remains the authority. No arbitrary URL fetching,
private GitHub token in the frontend, or automatic GitHub posting. Estimate:
12–20 hours. Any additional service permissions need a separate scoped design.

## Stage 4 — External adoption

Recruit independent sponsors and contributors and measure unique actors, funded
bounties, successful claims and return usage from explicit reproducible chain
queries. Controlled fixtures and developer wallets must be excluded from user
traction. Publish observed results only; no synthetic activity or guaranteed KPI.
Timing depends on genuine adoption. Outreach is a future task, not authorized
messaging in this release.

## Lessons from the supplied references

- [Precedent Engine](https://github.com/phu1271997/prior-art-court/compare/dd427bf...dc32b9e)
  paired new persistent behavior with views, UI, tests and a changelog.
- [Prior-Art Registry](https://github.com/phu1271997/prior-art-court/commit/d652c57)
  made a separate capability visible and explicitly required redeployment.
- [Registry/refund hardening](https://github.com/phu1271997/prior-art-court/commit/32f5786)
  covered fetched-content binding and terminal-path value conservation.
- [Derivative cascade](https://github.com/phu1271997/clearance-genlayer/compare/522af75...0cc7ec5)
  changed actual downstream settlement behavior alongside UI and tests.
- [Lineage correction](https://github.com/phu1271997/clearance-genlayer/commit/c5b097c)
  tested full evidence and invalidation after a parent decision changes.

These are design/process references, not MergeBond code dependencies. This stage
adds discovery of MergeBond's existing decisions; it copies neither court case law
nor royalty settlement. Additional source counts, canary tokens and cosmetic
changes alone are not treated as meaningful new functionality or security proof.
