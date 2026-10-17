import { CONTRACT_VERSION, sameAddress } from './transactions.js';

export const PAGE_SIZE = 8;
const uint = /^(0|[1-9]\d*)$/;
export function recordId(value) {
  const text = String(value ?? '');
  if (!/^[1-9]\d*$/.test(text) || BigInt(text) >= 2n ** 256n) throw new Error('Enter a positive record ID.');
  return text;
}

export function recordLink(base, scope, bounty, claim) {
  const url = new URL(base);
  url.search = '';
  url.hash = 'explore';
  url.searchParams.set('chain', String(scope.chainId));
  url.searchParams.set('contract', scope.contract);
  url.searchParams.set('bounty', recordId(bounty));
  if (claim) url.searchParams.set('claim', recordId(claim));
  return url.href;
}

export function readLink(base, scope) {
  const query = new URL(base).searchParams;
  if (!query.has('bounty') && !query.has('claim')) return null;
  if (query.get('chain') !== String(scope.chainId) || !sameAddress(query.get('contract'), scope.contract)) {
    throw new Error('This record link targets another chain or contract. Open its original deployment.');
  }
  return { bounty: recordId(query.get('bounty')), claim: query.has('claim') ? recordId(query.get('claim')) : null };
}

function checkConfig(config) {
  if (config?.version !== CONTRACT_VERSION) throw new Error('Explorer requires the configured MergeBond V2 contract.');
}

// Reads are bounded to one page. An unreadable row fails the page; never hide it
// and present an incomplete subset as a complete result.
export async function loadPage(read, kind, page = 0) {
  if (!['bounties', 'claims'].includes(kind) || !Number.isSafeInteger(page) || page < 0) throw new Error('Invalid explorer page.');
  const config = await read('get_config');
  checkConfig(config);
  const count = config[kind === 'bounties' ? 'bounty_count' : 'claim_count'];
  if (!uint.test(String(count)) || BigInt(count) > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('Record count is outside the supported browser range.');
  const total = Number(count);
  const start = total - page * PAGE_SIZE;
  const ids = Array.from({ length: Math.max(0, Math.min(PAGE_SIZE, start)) }, (_, i) => start - i);
  const rows = await Promise.all(ids.map(async id => {
    const row = await read(kind === 'bounties' ? 'get_bounty' : 'get_claim', [BigInt(id)]);
    if (String(row?.id) !== String(id)) throw new Error(`Record identity mismatch at #${id}.`);
    return row;
  }));
  return { rows, total, page, pages: Math.ceil(total / PAGE_SIZE) };
}

export function accountingCheck(accounting) {
  const keys = ['deposited', 'locked', 'claimant_claimable', 'sponsor_claimable', 'refund_claimable', 'outbound_requested', 'balance'];
  if (!keys.every(key => uint.test(String(accounting?.[key] ?? '')))) throw new Error('Incomplete or invalid contract accounting.');
  const held = BigInt(accounting.locked) + BigInt(accounting.claimant_claimable) + BigInt(accounting.sponsor_claimable) + BigInt(accounting.refund_claimable);
  return {
    ledgerConserved: BigInt(accounting.deposited) === held + BigInt(accounting.outbound_requested),
    balanceCoversLiabilities: BigInt(accounting.balance) >= held,
    liabilitiesWei: String(held),
  };
}

export async function loadDossier(read, scope, bountyId, claimId = null) {
  const startedAt = new Date().toISOString();
  const bid = recordId(bountyId), cid = claimId ? recordId(claimId) : null;
  const config = await read('get_config');
  checkConfig(config);
  const [bounty, claim, accounting] = await Promise.all([
    read('get_bounty', [BigInt(bid)]),
    cid ? read('get_claim', [BigInt(cid)]) : Promise.resolve(null),
    read('get_accounting'),
  ]);
  if (String(bounty?.id) !== bid || (cid && (String(claim?.id) !== cid || String(claim?.bounty_id) !== bid))) {
    throw new Error('Bounty and claim identities do not match. No dossier was created.');
  }
  return {
    schema: 'MERGEBOND_READBACK_V1',
    network: 'studionet', chain_id: String(scope.chainId), contract: scope.contract,
    observation: { started_at: startedAt, completed_at: new Date().toISOString(), atomic: false },
    config, bounty, claim, accounting, checks: accountingCheck(accounting),
    limitations: [
      'Independent latest-state RPC reads, not a block-pinned snapshot or signed attestation.',
      'Contract accounting is global, not this bounty alone. Outbound requests do not prove recipient settlement.',
      'Controlled historical fixtures are not real-user traction or an independent audit.',
      'Source digests commit to acquired evidence; they are not a new GitHub fetch or semantic re-evaluation.',
    ],
  };
}

export function evidenceLinks(dossier) {
  const b = dossier.bounty, c = dossier.claim;
  const token = /^[a-zA-Z0-9._-]+$/;
  if (!token.test(b.owner) || !token.test(b.repository)) return [];
  const repo = `https://github.com/${b.owner}/${b.repository}`;
  const links = [{ label: 'Sealed issue source', url: `${repo}/issues/${recordId(b.issue_number)}` }];
  if (c) {
    links.push({ label: 'Merged pull request', url: `${repo}/pull/${recordId(c.pr_number)}` });
    if (/^[0-9a-f]{40}$/.test(c.head_sha)) links.push({ label: 'Exact head commit', url: `${repo}/commit/${c.head_sha}` });
    if (/^[0-9a-f]{32}$/.test(c.gist_id) && /^[0-9a-f]{40}$/.test(c.gist_revision)) {
      links.push({ label: 'Pinned author grant (GitHub API)', url: `https://api.github.com/gists/${c.gist_id}/${c.gist_revision}` });
    }
  }
  return links;
}

export function dossierJson(dossier) {
  return JSON.stringify(dossier, (_, value) => typeof value === 'bigint' ? String(value) : value, 2) + '\n';
}
