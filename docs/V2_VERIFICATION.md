# V2 verification packet

Status: replacement-deployment candidate; **not submission-ready**.
Update 2026-10-10: replacement source parity and live positive settlement are now
recorded in [V2 E2E](evidence/v2/STUDIONET_E2E.md), negative controls in
[negative results](evidence/v2/NEGATIVE_RESULTS.md), and public V2 publication in
[publication](evidence/v2/PUBLICATION.md). Earlier pending statements below are
historical run notes, not current deployment status. Frontend tests now 8 pass
after merging public fixture regressions. Browser-wallet journey is omitted at
user request and remains unverified.
Corrected source: [merge_bond.py](../contracts/merge_bond.py).
Specification: [SPECIFICATION.md](SPECIFICATION.md).
The primary wallet only deploys; auxiliary A sponsors, auxiliary B claims/pays out.
Any external wallet can create its own bounty, obtain author authorization for its
own payout wallet, evaluate a claim or trigger expiry. No deployer whitelist exists.

## Exact enforcement and tests

| Requirement | Enforcement | Actual-contract Direct Mode regression |
|---|---|---|
| Contributor authorizes payout | Author-owned public revision-pinned Gist; numeric owner ID equals PR author; exact JSON domain binds sender | `test_authorization_wrong_scope_rolls_back`, `test_invalid_contributor_proof_cannot_claim` |
| No stolen claim slot | Authenticate before changing PR index/counters | Wrong-scope tests then successful authorized submission |
| Bounty eligibility | Exact repository/base/PR/commit; authorization explicitly names sealed issue and funded bounty | `test_ineligible_pr_never_consumes_claim_slot` |
| Clear timing | funded <= created <= merged <= submitted < deadline | Timing parametrizations and exact-deadline refund test |
| Complete criteria | Seal full title/body, reject empty/over 12,000 UTF-8 bytes | Empty/oversized and beyond-old-slice tests |
| Complete changed-file acquisition | Exact page lengths reconciled to changed_files, maximum 200; unique filenames; PR refetch | Missing-page controls and second-page positive test |
| Complete patches | Every hunk and additions/deletions/changes reconciled; no missing/binary/zero-change/truncated patch; no slicing | Incomplete-evidence controls and full-tail LLM mock |
| Complete CI | Latest set exactly equals total_count, maximum 100; exact head/name/success | Checks pagination control and existing wrong-head/failure tests |
| No positive bypass | Deterministic gates before AI, mandatory semantic flags, current OPEN/deadline before reserve | Incomplete evidence has no model mock and cannot reserve; refund-after-reservation blocked |
| Recovery/custody | Permissionless expiry, sender-bound withdrawals, conservation/replay controls | Existing full lifecycle, expiry, double withdrawal and transfer-exception tests |

## Local verification

Commands run from the repository root with Python 3.12 / genlayer-test 0.29.2 /
genvm-linter 0.11.0 and pinned contract runner v0.2.16:

```powershell
$env:PYTHONUTF8='1'
python -m pytest -q --tb=short --junitxml=docs/evidence/v2-direct-mode-junit.xml
genvm-lint check contracts/merge_bond.py
cd frontend
npm test
npm run build
```

Fresh results and limitations are recorded at the end of this document after rerun.
Tests mock GitHub and LLM responses; they execute the actual contract public methods.
They are not independent GitHub observations or multi-validator/live E2E proof.

## Source/resource policy

Contract fetches only fixed GitHub API routes constructed from validated tokens:
issues, pulls, every supported files page, exact-head latest check runs, and public
Gist revision. No caller-provided URL or raw_url is followed.
See [GitHub Gist API documentation](https://docs.github.com/en/rest/gists/gists).

Synthetic inputs are explicitly named in `tests/test_merge_bond.py` and
`tests/test_v2_guards.py`: fixed repo `fixture-org/fixture-repo`, issue 7, PR 11,
head `aaaa…` (40 hex), merge `bbbb…` (40 hex), Gist `dddd…` (32 hex), revision
`eeee…` (40 hex), GitHub contributor ID 123. Base time is 2026-10-08T00:00:00Z.
The full fixture constructors and each named attack transformation are versioned
source, so their exact HTTP JSON bytes are reproducible via `json.dumps`.
Deployment-specific authorization domains come from the actual contract view,
not a fabricated test-side authority model. They cannot be used as live resources.

Positive source purpose: canonical PR/merge/author/diff/CI facts plus authenticated
author payout intent; expected effect RESERVED only with full semantic agreement.
Negative purposes: cross-wallet/object/revision/domain replay, wrong owner,
ineligible time/base/repo, missing/oversized criteria, incomplete pages/patches/CI;
expected effect rollback before claim creation or UNRESOLVED/REJECTED with custody
unchanged. GitHub is not authority for production impact or real-world identity.

## Replacement deployment and live sequence

1. Deploy the exact corrected contract file from the primary wallet. Record its
   address and deployment tx/source parity; do not reuse the V1 address.
2. Set `MERGEBOND_ADDRESS`, `MERGEBOND_REPO=owner/repo`, `MERGEBOND_ISSUE`, and
   optionally production/test prefixes. Use a public issue containing all criteria.
3. Run `node scripts/studionet_v2.mjs create`. This uses auxiliary wallets only,
   creates/seals/funds and records the 900-second deadline.
4. **After funding**, create a fresh PR, run the required exact-head check and merge
   it into the configured base before deadline. Existing V1 PR #2 is ineligible.
5. Set `MERGEBOND_PR`; run `node scripts/studionet_v2.mjs template`. Have that
   PR author publish the complete JSON (with the three observed PR fields filled)
   as a public `mergebond-authorization.json` Gist. Obtain its full revision.
6. Set `MERGEBOND_GIST` / `MERGEBOND_GIST_REVISION`; run stages `claim`, `evaluate`,
   `withdraw`. Each stage journals tx hash, Explorer link, full receipt, consensus,
   execution and readbacks under `docs/evidence/v2/<address>.json`.
7. Repeat relevant negative controls on that same deployment, including wrong
   wallet authorization, pre-funded PR, replay, missing source and expiry refund;
   compare full pre/post entity/config/accounting. The staged script is a happy
   journey tool, not a claim that the full negative live matrix has already run.
8. Update frontend envs to the replacement address, build/deploy, and verify the
   complete external-wallet signing/readback/reload path. V2 client blocks V1 writes.

The source grant is immutable for this claim, not revocable. GitHub account
compromise is out of scope. Incomplete or large PRs fail closed rather than falling
back to excerpts. Matching diff counts proves acquisition completeness for the
GitHub diff, **not** a full repository snapshot. CI success does not prove deployment
or absence of all bugs. Transfer emission is not recipient-side settlement proof;
observe the actual transfer result and balances on the replacement deployment.

## Historical records

V1 `0x35C387b55a7Be9E2B74Ee4d56FD631936E1F8624` and existing files under
`docs/evidence/` without a `v2` name are historical. Their transactions cannot
close V2 remediation gates. The old runner is guarded and requires an explicit
`MERGEBOND_RUN_HISTORICAL_V1=1` opt-in; it must not be used for V2 claims.

## Recorded local results — 2026-10-10

- Actual-contract Direct Mode: **75 passed, 1 xfailed**. JUnit:
  [v2-direct-mode-junit.xml](evidence/v2-direct-mode-junit.xml).
- The xfail is specifically the independent acquisition-validator replay hitting
  pinned-runner/gltest sandbox decoder `unknown type 14`; it is **not** a passing
  validator check. Unexpected errors remain failures. Direct Mode leader path
  guards are verified; multi-validator runtime verification remains a release blocker.
- 138 warnings in the recorded run: unused downstream mocks after early guards
  plus the Direct Mode sandbox-isolation warning. No claim of clean/no-warning tests.
- GenVM lint (3 checks), semantic validation and 14-method schema: passed.
- Frontend transaction/fixture tests: **7 passed**, no skipped cases.
- V2 staged lifecycle script syntax: passed. No V2 network transaction run yet.
- Initial frontend build failed with Windows sandbox `spawn EPERM`. Escalated
  retry remained at `transforming` for several minutes and was stopped after
  verifying its exact MergeBond Vite process. Full Vite production build remains
  **unverified**. A separate esbuild ESM bundle of the app with external packages
  validates JSX/import syntax only, not the production dependency bundle.
- Source/storage/ABI change requires new deploy, fresh author grant/public PR,
  same-address live positive/negative tests, value-transfer observations and
  production external-wallet journey. All remain pending.
