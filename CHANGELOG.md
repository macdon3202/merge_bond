# Changelog

## 1.1.0 — 2026-10-17

### Public Bounty & Evidence Explorer

- Discover bounties and claims through live contract counters and bounded pages
  of eight records, newest first. Search and state filters operate on the loaded
  page; failed reads do not silently remove records.
- Open an evidence dossier with complete sealed criteria, policy/issue/source
  commitments, author grant, exact PR revision, observed paths and outcome reason.
- Share links bound to chain, deployment, bounty and optional claim. Cross-bounty
  claims and links to another deployment are rejected.
- Download dated JSON with original readbacks, global accounting and integer
  conservation/coverage checks. Observation times and non-atomic-read limitations
  are included; outbound requests are not recipient settlement proof.
- Add 11 explorer regression tests (28 frontend/fixture tests total) and a
  read-only StudioNet verification script. See the milestone evidence packet.

Contract source, ABI, custody logic and V2 deployment are unchanged. This release
does not add a new adjudication, claim real-user traction, or repeat the earlier
wallet compatibility remediation.
