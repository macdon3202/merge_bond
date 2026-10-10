// Staged V2 lifecycle. Never deploys or loads the primary wallet.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createAccount, createClient } from '../frontend/node_modules/genlayer-js/dist/index.js';
import { studionet } from '../frontend/node_modules/genlayer-js/dist/chains/index.js';
import { CalldataAddress } from '../frontend/node_modules/genlayer-js/dist/types/index.js';
import { normalizeHash, receiptState, returnedPositiveInt } from '../frontend/src/transactions.js';

const address = process.env.MERGEBOND_ADDRESS;
if (!/^0x[0-9a-f]{40}$/i.test(address || '') || address.toLowerCase() === '0x35c387b55a7be9e2b74ee4d56fd631936e1f8624') {
  throw new Error('Set MERGEBOND_ADDRESS to the replacement V2 deployment; V1 is forbidden.');
}
const stage = process.argv[2];
if (!['create', 'template', 'claim', 'evaluate', 'evaluate-incomplete', 'withdraw', 'expire', 'replay', 'negative'].includes(stage)) throw new Error('Invalid lifecycle stage');
const env = Object.fromEntries(readFileSync(new URL('../../secrets/genlayer-test-wallets.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(line => line.includes('=') && !line.trim().startsWith('#'))
  .map(line => { const i = line.indexOf('='); return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"<]|['">]$/g, '')]; }));
const accounts = Object.fromEntries(['A', 'B'].map(role => {
  const key = env[`SERVICE_LEDGER_KEY_${role}`];
  if (!key) throw new Error(`Missing auxiliary wallet ${role}`);
  return [role, createAccount(key.startsWith('0x') ? key : `0x${key}`)];
}));
const reader = createClient({ chain: studionet });
const clients = Object.fromEntries(Object.entries(accounts).map(([role, account]) => [role, createClient({ chain: studionet, account })]));
const read = (functionName, args = []) => reader.readContract({ address, functionName, args });
async function balance(accountAddress) {
  const url = studionet.rpcUrls.default.http[0];
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [accountAddress, 'latest'] }) });
  const result = await response.json();
  if (!response.ok || result.error || typeof result.result !== 'string') throw new Error('Balance read failed');
  return BigInt(result.result).toString();
}
const config = await read('get_config');
if (config.version !== 'MERGE_BOND_V2') throw new Error('V2 source/version mismatch; no write sent.');
const dir = new URL('../docs/evidence/v2/', import.meta.url);
mkdirSync(dir, { recursive: true });
const run = process.env.MERGEBOND_RUN || '';
if (run && !/^[a-z0-9-]+$/.test(run)) throw new Error('Invalid run journal name');
const file = new URL(`${address.toLowerCase()}${run ? '-' + run : ''}.json`, dir);
const sourceHash = createHash('sha256').update(readFileSync(new URL('../contracts/merge_bond.py', import.meta.url))).digest('hex');
const state = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {
  contract: address, network: 'studionet', chain_id: String(studionet.id), source_sha256: sourceHash,
  actors: { sponsor: accounts.A.address, authorized_payout: accounts.B.address }, actions: {},
};
if (state.source_sha256 !== sourceHash) throw new Error('Source changed since this journal started; do not mix release evidence.');
const json = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? String(v) : v, 2);
const save = () => writeFileSync(file, json(state) + '\n');
const snapshot = async () => ({
  config: await read('get_config'), accounting: await read('get_accounting'),
  bounty: state.bounty_id ? await read('get_bounty', [BigInt(state.bounty_id)]) : null,
  claim: state.claim_id ? await read('get_claim', [BigInt(state.claim_id)]) : null,
});
async function send(label, role, functionName, args = [], value = 0n, expectFailure = false) {
  let action = state.actions[label];
  if (action?.verified) return action;
  if (!action) {
    const pre = await snapshot();
    const hash = normalizeHash(await clients[role].writeContract({ address, functionName, args, value }));
    action = { role, functionName, args, value: String(value), pre, hash,
      explorer: `https://explorer-studio.genlayer.com/transactions/${hash}` };
    state.actions[label] = action; save();
  }
  // Resume the stored hash rather than sending a duplicate after a timeout.
  for (let i = 0; i < 160; i++) {
    const tx = await reader.getTransaction({ hash: action.hash });
    const signals = receiptState(tx);
    if (signals.failed) {
      action.receipt = tx; action.signals = signals; save();
      if (expectFailure && signals.label === 'FINALIZED' && signals.consensus === 'MAJORITY_AGREE' && signals.execution === 'ERROR') {
        action.post = await snapshot();
        action.rollback_equal = json(action.pre) === json(action.post);
        if (!action.rollback_equal) throw new Error(`Negative control mutated state: ${action.explorer}`);
        action.verified = true; action.expected_failure = true; save();
        console.log(json({ label, hash: action.hash, signals, rollback_equal: true })); return action;
      }
      if (expectFailure && signals.label !== 'FINALIZED') { await new Promise(resolve => setTimeout(resolve, 3000)); continue; }
      throw new Error(`Transaction failed: ${action.explorer}`);
    }
    if (signals.finalized) {
      if (expectFailure) throw new Error('Expected rejection but transaction succeeded');
      action.receipt = tx; action.signals = signals; action.post = await snapshot();
      action.verified = true; save(); console.log(json({ label, role, hash: action.hash, explorer: action.explorer, signals, post: action.post })); return action;
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error(`Pending; rerun the same stage to reconcile, not resubmit: ${action.explorer}`);
}
function exactId(receipt) {
  try { return returnedPositiveInt(receipt); } catch {
    const rows = receipt.consensus_data?.leader_receipt || receipt.consensus_data?.validators || [];
    const leader = (Array.isArray(rows) ? rows : [rows]).find(row => row?.mode === 'leader');
    const value = leader?.result?.payload?.readable;
    if (/^[1-9]\d*$/.test(String(value))) return Number(value);
    throw new Error('No exact returned ID; inspect Explorer. Do not use a global counter.');
  }
}
if (stage === 'create') {
  const repo = process.env.MERGEBOND_REPO?.split('/');
  const issue = process.env.MERGEBOND_ISSUE;
  if (repo?.length !== 2 || !/^[1-9]\d*$/.test(issue || '')) throw new Error('Set MERGEBOND_REPO and MERGEBOND_ISSUE before writes.');
  const amount = BigInt(process.env.MERGEBOND_AMOUNT_WEI || '1000000000000');
  await send('register_A', 'A', 'register_wallet');
  await send('register_B', 'B', 'register_wallet');
  const created = await send('create', 'A', 'create_bounty', [repo[0], repo[1], BigInt(issue), 'main', amount, BigInt(process.env.MERGEBOND_DURATION || '900'),
    process.env.MERGEBOND_PRODUCTION_PREFIX || 'fixture/src/', process.env.MERGEBOND_TEST_PREFIX || 'fixture/tests/', 'contract-tests']);
  state.bounty_id ||= exactId(created.receipt); save();
  await send('seal', 'A', 'seal_issue', [BigInt(state.bounty_id)]);
  await send('fund', 'A', 'fund_bounty', [BigInt(state.bounty_id)], amount);
  state.latest = await snapshot(); save();
  if (state.latest.bounty.state !== 'OPEN') throw new Error('Expected funded OPEN readback');
  console.log('Now create/merge a NEW qualifying PR and its author-owned Gist BEFORE the recorded deadline.');
} else {
  if (!state.bounty_id) throw new Error('Run create first.');
  const bid = BigInt(state.bounty_id);
  if (stage === 'negative') {
    const label = process.env.MERGEBOND_CONTROL;
    if (!['historic-pr', 'wrong-wallet', 'wrong-domain', 'missing-gist'].includes(label)) throw new Error('Specify negative control');
    const pr = BigInt(process.env.MERGEBOND_PR);
    const gist = process.env.MERGEBOND_GIST || '00000000000000000000000000000000';
    const revision = process.env.MERGEBOND_GIST_REVISION || '0000000000000000000000000000000000000000';
    await send(label, label === 'wrong-wallet' ? 'A' : 'B', 'submit_claim', [bid, pr, gist, revision], 0n, true);
  } else if (stage === 'template' || stage === 'claim') {
    const pr = process.env.MERGEBOND_PR;
    if (!/^[1-9]\d*$/.test(pr || '')) throw new Error('Set MERGEBOND_PR');
    if (stage === 'template') console.log(json(await read('get_authorization_template', [bid, BigInt(pr), new CalldataAddress(Uint8Array.from(accounts.B.address.slice(2).match(/../g), byte => parseInt(byte, 16)))])));
    else {
      const gist = process.env.MERGEBOND_GIST, revision = process.env.MERGEBOND_GIST_REVISION;
      if (!/^[0-9a-f]{32}$/.test(gist || '') || !/^[0-9a-f]{40}$/.test(revision || '')) throw new Error('Set Gist ID and full revision');
      const action = await send('claim', 'B', 'submit_claim', [bid, BigInt(pr), gist, revision]);
      state.claim_id ||= exactId(action.receipt); state.latest = await snapshot(); save();
      if (state.latest.claim.state !== 'SUBMITTED') throw new Error('Claim readback mismatch');
    }
  } else if (stage === 'evaluate' || stage === 'evaluate-incomplete') {
    if (!state.claim_id) throw new Error('Run claim first.');
    await send('evaluate', 'A', 'evaluate_claim', [BigInt(state.claim_id)]);
    state.latest = await snapshot(); save();
    if (stage === 'evaluate-incomplete') {
      if (state.latest.claim.state !== 'UNRESOLVED' || state.latest.bounty.state !== 'OPEN'
        || state.latest.bounty.winning_claim !== 0 || state.latest.accounting.claimant_claimable !== '0') throw new Error('Incomplete source did not fail closed');
      console.log('Incomplete source remains non-payable');
      exitStage();
    }
    if (state.latest.claim.state !== 'WINNER' || !['RESERVED', 'PAID'].includes(state.latest.bounty.state)
      || Number(state.latest.bounty.winning_claim) !== Number(state.claim_id)) throw new Error('No matching winner; inspect journal.');
  } else if (stage === 'replay') {
    const b = await read('get_bounty', [bid]);
    if (b.state !== 'PAID') throw new Error('Replay control requires settled PAID state');
    await send('double_withdraw', 'B', 'withdraw_bounty', [bid], 0n, true);
    await send('terminal_evaluate', 'A', 'evaluate_claim', [BigInt(state.claim_id)], 0n, true);
  } else if (stage === 'expire') {
    const b = await read('get_bounty', [bid]);
    const delay = Number(b.deadline) * 1000 - Date.now() + 3000;
    if (delay > 0) throw new Error(`Deadline not reached; retry in ${Math.ceil(delay / 1000)} seconds; no write sent`);
    await send('expire', 'B', 'expire_bounty', [bid]);
  }
  else {
    const b = await read('get_bounty', [bid]);
    const role = b.state === 'EXPIRED_REFUNDABLE' ? 'A' : 'B';
    const before = await balance(accounts[role].address);
    await send(`withdraw_${role}`, role, 'withdraw_bounty', [bid]);
    state.latest = await snapshot(); state.recipient_balance = { role, before, after: await balance(accounts[role].address) }; save();
    if (state.latest.bounty.state !== 'PAID') throw new Error('Withdrawal readback mismatch');
    // Transfer-request finality is not itself recipient-side settlement proof.
    console.log('Inspect transfer execution and recipient balance before calling settlement proven.');
  }
}
function exitStage() { process.exit(0); }
