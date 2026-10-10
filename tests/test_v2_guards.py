"""Synthetic, strict GitHub/LLM mocks invoking the actual deployed Direct Mode class.

The named transformations below are reproducible adversarial fixture inputs,
not observations of GitHub or proof of live consensus. Domain values are read
from the actual contract because address/chain/time are deployment-specific.
"""
import copy
import json
import pytest
from test_merge_bond import (
    AMOUNT, DEVELOPER, OTHER, SPONSOR, GIST, REVISION, PR, HEAD,
    deploy, open_bounty, draft, seal, fund, submit, prepare_authorization,
    mock_claim, mock_authorization, issue, pull, files, checks, positive,
)


def snapshot(c):
    result = {"config": c.get_config(), "bounty": c.get_bounty(1), "accounting": c.get_accounting()}
    if result["config"]["claim_count"]:
        result["claim"] = c.get_claim(1)
    return copy.deepcopy(result)


@pytest.mark.parametrize("field,value", [
    ("payout_wallet", "0x" + "33" * 20), ("contract", "0x" + "99" * 20),
    ("chain_id", "999999"), ("bounty_id", 2), ("policy_digest", "f" * 64),
    ("repository", "other/repo"), ("issue_number", 8), ("pr_number", 12),
    ("head_sha", "c" * 40), ("merge_sha", "c" * 40), ("contributor_id", 456),
    ("funded_at", 0), ("deadline", 9999999999), ("version", "MERGE_BOND_V1"),
])
def test_authorization_wrong_scope_rolls_back(direct_vm, direct_deploy, field, value):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    prepare_authorization(c, direct_vm)
    direct_vm._authorization[field] = value
    mock_claim(direct_vm)
    before = snapshot(c)
    with direct_vm.prank(DEVELOPER), direct_vm.expect_revert("CLAIM_AUTHORIZATION_OR_ELIGIBILITY_FAILED"):
        c.submit_claim(1, PR, GIST, REVISION)
    assert snapshot(c) == before
    # A failed thief cannot consume the PR uniqueness index.
    assert submit(c, direct_vm) == 1


@pytest.mark.parametrize("kind", ["wrong_owner", "private", "truncated_file", "truncated_list", "wrong_size", "extra_file", "missing_file"])
def test_invalid_contributor_proof_cannot_claim(direct_vm, direct_deploy, kind):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    prepare_authorization(c, direct_vm)
    content = json.dumps(direct_vm._authorization)
    payload = {"id": GIST, "public": True, "truncated": False, "owner": {"id": 123, "type": "User"},
               "files": {"mergebond-authorization.json": {"content": content, "size": len(content.encode()), "truncated": False}}}
    if kind == "wrong_owner": payload["owner"]["id"] = 456
    if kind == "private": payload["public"] = False
    if kind == "truncated_list": payload["truncated"] = True
    if kind == "truncated_file": payload["files"]["mergebond-authorization.json"]["truncated"] = True
    if kind == "wrong_size": payload["files"]["mergebond-authorization.json"]["size"] += 1
    if kind == "extra_file": payload["files"]["extra.json"] = {}
    if kind == "missing_file": payload["files"] = {}
    direct_vm._web_mocks = [(pattern, response) for pattern, response in direct_vm._web_mocks if "/gists/" not in pattern.pattern]
    mock_authorization(direct_vm, payload)
    before = snapshot(c)
    with direct_vm.prank(DEVELOPER), direct_vm.expect_revert("CLAIM_AUTHORIZATION_OR_ELIGIBILITY_FAILED"):
        c.submit_claim(1, PR, GIST, REVISION)
    assert snapshot(c) == before


@pytest.mark.parametrize("changes", [
    {"created_at": "2026-10-07T23:59:59Z"},  # merged later does not rescue pre-funded PR
    {"merged_at": "2026-10-07T23:59:59Z"},
    {"created_at": "2026-10-08T00:00:01Z"},  # creation after merge
    {"merged_at": "2026-10-08T00:05:00Z"},  # exact expiry/future merge
    {"created_at": None}, {"merged_at": "not-a-time"},
    {"number": 12}, {"merged": False},
    {"base": {"ref": "main", "repo": {"full_name": "other/repo"}}},
])
def test_ineligible_pr_never_consumes_claim_slot(direct_vm, direct_deploy, changes):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    prepare_authorization(c, direct_vm)
    mock_claim(direct_vm, pr_payload=pull(**changes))
    before = snapshot(c)
    with direct_vm.prank(DEVELOPER), direct_vm.expect_revert("CLAIM_AUTHORIZATION_OR_ELIGIBILITY_FAILED"):
        c.submit_claim(1, PR, GIST, REVISION)
    assert snapshot(c) == before


def test_exact_deadline_blocks_submission_and_allows_refund(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    prepare_authorization(c, direct_vm)
    direct_vm.warp("2026-10-08T00:05:00Z")
    before = snapshot(c)
    with direct_vm.prank(DEVELOPER), direct_vm.expect_revert("BOUNTY_NOT_OPEN"):
        c.submit_claim(1, PR, GIST, REVISION)
    assert snapshot(c) == before
    with direct_vm.prank(OTHER):
        assert c.expire_bounty(1) == "EXPIRED_REFUNDABLE"
    assert c.get_bounty(1)["sponsor_due"] == str(AMOUNT)


@pytest.mark.parametrize("body", ["", " " * 10, "x" * 12000, "😀" * 3100])
def test_incomplete_or_oversized_criteria_cannot_be_sealed(direct_vm, direct_deploy, body):
    c = deploy(direct_vm, direct_deploy)
    draft(c, direct_vm)
    before = snapshot(c)
    with direct_vm.expect_revert("ISSUE_BINDING_FAILED"):
        seal(c, direct_vm, issue(body))
    assert snapshot(c) == before


def test_complete_criteria_beyond_old_slice_preserved(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    draft(c, direct_vm)
    payload = issue("x" * 6500 + "\nCRITICAL: reject duplicate withdrawal")
    seal(c, direct_vm, payload)
    assert c.get_bounty(1)["criteria"].endswith("CRITICAL: reject duplicate withdrawal")
    assert len(c.get_bounty(1)["criteria"]) > 6000


@pytest.mark.parametrize("kind", ["missing", "empty", "truncated_hunk", "omitted_changes", "binary", "wrong_counts", "missing_counts", "duplicate", "too_many", "missing_page", "checks_paginated"])
def test_incomplete_evidence_cannot_reach_ai_or_reservation(direct_vm, direct_deploy, kind):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    submit(c, direct_vm)
    payload, pr, ci = files(), pull(), checks()
    if kind in {"missing", "binary"}: payload[0].pop("patch")
    if kind == "empty": payload[0]["patch"] = ""
    if kind == "truncated_hunk": payload[0]["patch"] = "@@ -0,0 +1,2 @@\n+only-one-line"
    if kind == "omitted_changes": payload[0].update(additions=2, changes=2)
    if kind == "wrong_counts": payload[0]["changes"] = 99
    if kind == "missing_counts": payload[0].pop("deletions")
    if kind == "duplicate": payload[1] = copy.deepcopy(payload[0])
    if kind == "too_many": pr["changed_files"] = 201
    if kind == "missing_page": pr["changed_files"] = 101
    if kind == "checks_paginated": ci["total_count"] = 101
    mock_claim(direct_vm, pr_payload=pr, file_payload=payload, check_payload=ci)
    # Deliberately NO model mock: reaching semantic evaluation is a test failure.
    direct_vm._llm_mocks.clear()
    before_bounty, before_accounting = c.get_bounty(1), c.get_accounting()
    with direct_vm.prank(OTHER):
        assert c.evaluate_claim(1) == "UNRESOLVED"
    assert c.get_bounty(1) == before_bounty and c.get_accounting() == before_accounting
    assert c.get_claim(1)["state"] == "UNRESOLVED"


def test_second_page_is_fetched_and_checked(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    submit(c, direct_vm)
    payload = files() + [dict(files()[0], filename=f"src/generated_{i}.py") for i in range(99)]
    mock_claim(direct_vm, pr_payload=pull(changed_files=101))
    direct_vm._web_mocks = [(pattern, response) for pattern, response in direct_vm._web_mocks if "/files" not in pattern.pattern]
    for page, batch in [(1, payload[:100]), (2, payload[100:])]:
        direct_vm.mock_web(r"api\.github\.com/repos/fixture-org/fixture-repo/pulls/11/files\?per_page=100&page=" + str(page) + "$",
                           {"method": "GET", "status": 200, "body": json.dumps(batch)})
    with direct_vm.prank(OTHER):
        assert c.evaluate_claim(1) == "RESERVED"
    assert len(c.get_claim(1)["production_files"]) == 100


def test_incomplete_second_page_and_retry(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    submit(c, direct_vm)
    payload = files() + [dict(files()[0], filename=f"src/page_{i}.py") for i in range(99)]
    mock_claim(direct_vm, pr_payload=pull(changed_files=101))
    direct_vm._web_mocks = [(pattern, response) for pattern, response in direct_vm._web_mocks if "/files" not in pattern.pattern]
    for page, batch in [(1, payload[:100]), (2, [])]:
        direct_vm.mock_web(r"api\.github\.com/repos/fixture-org/fixture-repo/pulls/11/files\?per_page=100&page=" + str(page) + "$",
                           {"method": "GET", "status": 200, "body": json.dumps(batch)})
    direct_vm._llm_mocks.clear()
    before_bounty, before_accounting = c.get_bounty(1), c.get_accounting()
    with direct_vm.prank(OTHER): assert c.evaluate_claim(1) == "UNRESOLVED"
    assert c.get_bounty(1) == before_bounty and c.get_accounting() == before_accounting
    mock_claim(direct_vm)
    with direct_vm.prank(OTHER): assert c.evaluate_claim(1) == "RESERVED"


def test_independent_source_validator_falsifies_missing_patch(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    submit(c, direct_vm)
    mock_claim(direct_vm)
    with direct_vm.prank(OTHER): assert c.evaluate_claim(1) == "RESERVED"
    # Direct Mode commits leader state; run the captured acquisition validator
    # separately against incomplete evidence, not as simulated live consensus.
    payload = files()
    payload[0].pop("patch")
    mock_claim(direct_vm, file_payload=payload)
    with direct_vm.prank(OTHER):
        try:
            result = direct_vm.run_validator(index=-2)
        except AssertionError as error:
            if str(error) == "unknown type 14":
                pytest.xfail("gltest 0.29.2 / pinned v0.2.16 sandbox decoder unknown type 14; live validator test required")
            raise
        assert result is False


def test_patch_beyond_old_limit_is_not_sliced(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    submit(c, direct_vm)
    payload = files()
    payload[0]["patch"] = "@@ -0,0 +1,2 @@\n+" + "x" * 3500 + "\n+CRITICAL_TAIL"
    payload[0].update(additions=2, changes=2)
    mock_claim(direct_vm, file_payload=payload)
    direct_vm._llm_mocks.clear()
    direct_vm.mock_llm("CRITICAL_TAIL", positive())
    with direct_vm.prank(OTHER):
        assert c.evaluate_claim(1) == "RESERVED"
    # Strict mock matches ONLY when the full tail reaches the actual LLM prompt.
    assert direct_vm._llm_mocks_hit


def test_mutated_authorization_on_retry_never_reserves(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    submit(c, direct_vm)
    direct_vm._authorization["payout_wallet"] = "0x" + "33" * 20
    mock_claim(direct_vm)
    before_bounty, before_accounting = c.get_bounty(1), c.get_accounting()
    with direct_vm.prank(OTHER):
        assert c.evaluate_claim(1) == "UNRESOLVED"
    assert c.get_bounty(1) == before_bounty and c.get_accounting() == before_accounting


def test_refund_cannot_bypass_reserved_winner(direct_vm, direct_deploy):
    c = deploy(direct_vm, direct_deploy)
    open_bounty(c, direct_vm)
    submit(c, direct_vm)
    mock_claim(direct_vm)
    with direct_vm.prank(OTHER): c.evaluate_claim(1)
    direct_vm.warp("2026-10-08T00:06:00Z")
    before = snapshot(c)
    with direct_vm.prank(SPONSOR), direct_vm.expect_revert("BOUNTY_NOT_EXPIRABLE"):
        c.expire_bounty(1)
    assert snapshot(c) == before
