import test from 'node:test';
import assert from 'node:assert/strict';
import { accountingCheck, dossierJson, evidenceLinks, loadDossier, loadPage, readLink, recordId, recordLink } from '../src/explorer.js';

const scope = { contract: '0x850482D16aDD6237f269911da2516F1F51E58510', chainId: 61999 };
const config = { version: 'MERGE_BOND_V2', bounty_count: 18, claim_count: 1 };
const bounty = { id: 1, owner: 'fixture-org', repository: 'fixture-repo', issue_number: 3, state: 'PAID', policy_digest: 'a'.repeat(64) };
const claim = { id: 1, bounty_id: 1, pr_number: 4, head_sha: 'b'.repeat(40), gist_id: 'c'.repeat(32), gist_revision: 'd'.repeat(40) };
const accounting = { deposited: '100', locked: '20', claimant_claimable: '30', sponsor_claimable: '10', refund_claimable: '5', outbound_requested: '35', balance: '65' };
const read = async method => ({ get_config: config, get_bounty: bounty, get_claim: claim, get_accounting: accounting })[method];

test('pagination acquires exactly 8 descending IDs and handles the final page', async () => {
  const calls = [];
  const reader = async (method, args) => { calls.push([method, args]); return method === 'get_config' ? config : { id: Number(args[0]), state: 'OPEN' }; };
  const first = await loadPage(reader, 'bounties');
  assert.deepEqual(first.rows.map(r => r.id), [18, 17, 16, 15, 14, 13, 12, 11]);
  assert.equal(first.pages, 3);
  assert.equal(calls.length, 9);
  const last = await loadPage(reader, 'bounties', 2);
  assert.deepEqual(last.rows.map(r => r.id), [2, 1]);
});

test('an unreadable row fails the whole page instead of hiding missing evidence', async () => {
  await assert.rejects(loadPage(async (method, args) => {
    if (method === 'get_config') return config;
    if (args[0] === 15n) throw new Error('RPC unavailable');
    return { id: Number(args[0]) };
  }, 'bounties'), /RPC unavailable/);
});

test('empty deployments require no entity reads', async () => {
  const result = await loadPage(async method => { assert.equal(method, 'get_config'); return { ...config, bounty_count: 0 }; }, 'bounties');
  assert.deepEqual(result.rows, []);
  assert.equal(result.pages, 0);
});

test('wrong contract version, malformed counts and wrong record IDs fail closed', async () => {
  await assert.rejects(loadPage(async () => ({ ...config, version: 'MERGE_BOND_V1' }), 'bounties'), /V2/);
  await assert.rejects(loadPage(async () => ({ ...config, bounty_count: '9007199254740992' }), 'bounties'), /range/);
  await assert.rejects(loadPage(async () => ({ ...config, bounty_count: -1 }), 'bounties'), /range/);
  await assert.rejects(loadPage(async method => method === 'get_config' ? config : { id: 999 }, 'claims', 0), /identity/);
  await assert.rejects(loadPage(read, 'users'), /Invalid/);
  await assert.rejects(loadPage(read, 'claims', -1), /Invalid/);
});

test('record IDs retain uint256 precision and reject coercion shortcuts', () => {
  assert.equal(recordId('9007199254740993'), '9007199254740993');
  for (const value of [null, '0', '01', '-1', '1.1', '1e2', ' 1', String(2n ** 256n)]) assert.throws(() => recordId(value));
});

test('deep links bind exact chain, deployment, bounty and claim', () => {
  const url = recordLink('https://mergebond.example/?old=1#old', scope, 1, 4);
  assert.deepEqual(readLink(url, scope), { bounty: '1', claim: '4' });
  assert.ok(!url.includes('old'));
  assert.throws(() => readLink(url.replace('61999', '1'), scope), /another chain/);
  assert.throws(() => readLink(url, { ...scope, contract: '0x' + '11'.repeat(20) }), /another chain/);
  assert.equal(readLink('https://example.com', scope), null);
});

test('dossier rejects a claim attached to a different bounty', async () => {
  await assert.rejects(loadDossier(async method => method === 'get_claim' ? { ...claim, bounty_id: 2 } : read(method), scope, 1, 1), /do not match/);
});

test('dossier exports original readbacks, exact scope and honest non-atomic timing', async () => {
  const packet = await loadDossier(read, scope, 1, 1);
  const output = JSON.parse(dossierJson(packet));
  assert.equal(output.schema, 'MERGEBOND_READBACK_V1');
  assert.equal(output.chain_id, '61999');
  assert.equal(output.contract, scope.contract);
  assert.deepEqual(output.bounty, bounty);
  assert.deepEqual(output.claim, claim);
  assert.deepEqual(output.accounting, accounting);
  assert.equal(output.observation.atomic, false);
  assert.ok(output.observation.started_at <= output.observation.completed_at);
  assert.equal(output.checks.ledgerConserved, true);
  assert.ok(output.limitations.some(x => x.includes('recipient settlement')));
  assert.equal(JSON.parse(dossierJson({ value: 9007199254740993n })).value, '9007199254740993');
});

test('bounty-only dossier does not fetch or invent a claim', async () => {
  const packet = await loadDossier(async method => { assert.notEqual(method, 'get_claim'); return read(method); }, scope, 1);
  assert.equal(packet.claim, null);
  assert.equal(evidenceLinks(packet).length, 1);
});

test('accounting uses bigint math and exposes insolvency and conservation failures separately', () => {
  assert.deepEqual(accountingCheck(accounting), { ledgerConserved: true, balanceCoversLiabilities: true, liabilitiesWei: '65' });
  assert.equal(accountingCheck({ ...accounting, balance: '64' }).balanceCoversLiabilities, false);
  assert.equal(accountingCheck({ ...accounting, deposited: '101' }).ledgerConserved, false);
  assert.equal(accountingCheck({ ...accounting, balance: '1000' }).ledgerConserved, true);
  assert.throws(() => accountingCheck({ ...accounting, locked: '-1' }), /invalid/);
  assert.throws(() => accountingCheck({}), /invalid/);
  const huge = '9007199254740993000000000';
  assert.equal(accountingCheck({ ...accounting, deposited: huge, locked: huge, claimant_claimable: '0', sponsor_claimable: '0', refund_claimable: '0', outbound_requested: '0', balance: huge }).ledgerConserved, true);
});

test('evidence links preserve pinned revisions and reject URL injection tokens', async () => {
  const packet = await loadDossier(read, scope, 1, 1);
  const links = evidenceLinks(packet);
  assert.equal(links.length, 4);
  assert.ok(links.some(x => x.url.endsWith(`${claim.gist_id}/${claim.gist_revision}`)));
  assert.ok(links.every(x => x.url.startsWith('https://github.com/') || x.url.startsWith('https://api.github.com/')));
  assert.deepEqual(evidenceLinks({ ...packet, bounty: { ...bounty, owner: '../evil' } }), []);
});
