// Read-only production verification. No wallets, signatures or transactions.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createClient } from '../frontend/node_modules/genlayer-js/dist/index.js';
import { studionet } from '../frontend/node_modules/genlayer-js/dist/chains/index.js';
import { dossierJson, loadDossier, loadPage, readLink, recordLink } from '../frontend/src/explorer.js';

const contract = '0x850482D16aDD6237f269911da2516F1F51E58510';
const scope = { contract, chainId: studionet.id };
const client = createClient({ chain: studionet });
const read = (functionName, args = []) => client.readContract({ address: contract, functionName, args });
const pages = {};
for (const kind of ['bounties', 'claims']) pages[kind] = await loadPage(read, kind);
const dossiers = [];
for (const [bid, cid] of [[1, 1], [3, 4]]) {
  const packet = await loadDossier(read, scope, bid, cid);
  assert.equal(packet.checks.ledgerConserved, true);
  assert.equal(packet.checks.balanceCoversLiabilities, true);
  const link = recordLink('https://mergebond.pages.dev', scope, bid, cid);
  assert.deepEqual(readLink(link, scope), { bounty: String(bid), claim: String(cid) });
  dossiers.push({ link, packet });
}
const dir = new URL('../docs/evidence/milestone-01/', import.meta.url);
mkdirSync(dir, { recursive: true });
const source = readFileSync(new URL('../contracts/merge_bond.py', import.meta.url));
const result = {
  verified_at: new Date().toISOString(), scope,
  contract_source_sha256: createHash('sha256').update(source).digest('hex'),
  method: 'Production explorer functions with live StudioNet readContract; zero writes',
  pages, dossiers,
};
writeFileSync(new URL('live-readback.json', dir), dossierJson(result));
for (const { packet } of dossiers) writeFileSync(new URL(`bounty-${packet.bounty.id}-claim-${packet.claim.id}.json`, dir), dossierJson(packet));
console.log(JSON.stringify({ verified_at: result.verified_at, scope, bounty_count: pages.bounties.total, claim_count: pages.claims.total,
  dossiers: dossiers.map(({ packet }) => ({ bounty: packet.bounty.id, claim: packet.claim.id, state: packet.claim.state, checks: packet.checks })), source_sha256: result.contract_source_sha256 }, null, 2));
