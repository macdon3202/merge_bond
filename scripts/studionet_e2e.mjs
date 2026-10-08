import { createAccount, createClient } from '../frontend/node_modules/genlayer-js/dist/index.js';
import { studionet } from '../frontend/node_modules/genlayer-js/dist/chains/index.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const ADDRESS = '0x35C387b55a7Be9E2B74Ee4d56FD631936E1F8624';
const ROOT = new URL('../../', import.meta.url);
const stateDir = new URL('./.state/', import.meta.url);
const stateFile = new URL('./.state/mergebond-studionet.json', import.meta.url);
const evidenceFile = new URL('../docs/evidence/studionet-e2e.json', import.meta.url);
mkdirSync(stateDir, { recursive: true });
const json = value => JSON.stringify(value, (_, item) => typeof item === 'bigint' ? String(item) : item, 2);

function secrets() {
  return Object.fromEntries(readFileSync(new URL('secrets/genlayer-test-wallets.env', ROOT), 'utf8')
    .split(/\r?\n/).filter(line => line.includes('=') && !line.trim().startsWith('#'))
    .map(line => { const index = line.indexOf('='); return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"<]|['">]$/g, '')]; }));
}
function account(which) {
  const key = secrets()[`SERVICE_LEDGER_KEY_${which}`];
  if (!key) throw new Error(`MISSING_WALLET_${which}`);
  return createAccount(key.startsWith('0x') ? key : `0x${key}`);
}
const accounts = { A: account('A'), B: account('B') };
const clients = Object.fromEntries(Object.entries(accounts).map(([key, value]) => [key, createClient({ chain: studionet, account: value })]));
const reader = createClient({ chain: studionet });
const read = (functionName, args = []) => reader.readContract({ address: ADDRESS, functionName, args });
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {
  network: 'studionet', contract: ADDRESS, started_at: new Date().toISOString(),
  actors: { sponsor: accounts.A.address, developer: accounts.B.address }, actions: {}, assertions: [], readbacks: {},
  github: { repository: 'macdon3202/merge_bond', issue: 1, pr: 2, head_sha: '9174314be1bd5d7a7bd805eae99c86a730e7b62a', merge_sha: '2db22aea9132adf513beaad12da4bf0d200a2577' },
};
const save = () => writeFileSync(stateFile, `${json(state)}\n`);

function receiptSignals(tx) {
  const status = String(tx.statusName || tx.status_name || tx.status || '').toUpperCase();
  const consensus = String(tx.result_name || tx.consensus_result_name || tx.consensus_result || '').toUpperCase();
  const raw = tx.consensus_data?.leader_receipt || tx.consensus_data?.validators || [];
  const receipts = Array.isArray(raw) ? raw : [raw];
  const leader = receipts.find(item => String(item?.mode).toLowerCase() === 'leader') || receipts.find(item => item?.vote !== 'idle') || receipts[0] || {};
  const execution = String(leader.execution_result || leader.executionResult || tx.execution_result || '').toUpperCase();
  return { status, consensus, execution, payload: leader?.result?.payload ?? leader?.result?.data ?? null };
}
async function wait(hash, expectError = false) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    const tx = await reader.getTransaction({ hash });
    const result = receiptSignals(tx);
    if (['FINALIZED', 'UNDETERMINED'].includes(result.status)) {
      const errored = /ERROR|FAIL|REVERT/.test(result.execution) || /DISAGREE/.test(result.consensus);
      if (errored !== expectError) throw new Error(`UNEXPECTED_RESULT expected_error=${expectError} ${json(result)}`);
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error(`PENDING_NO_RESUBMIT ${hash}`);
}
function returnedId(payload) {
  if (payload && typeof payload === 'object') {
    return returnedId(payload.readable ?? payload.value ?? payload.result ?? payload.data);
  }
  if (Number.isInteger(payload) && payload > 0) return payload;
  if (typeof payload === 'string') {
    const clean = payload.replace(/^"|"$/g, '').trim();
    if (/^[1-9]\d*$/.test(clean)) return Number(clean);
    try { const parsed = JSON.parse(payload); return returnedId(parsed?.result ?? parsed?.value ?? parsed); } catch {}
  }
  throw new Error(`EXACT_ID_NOT_RETURNED ${json(payload)}`);
}
async function send(name, who, functionName, args = [], { value = 0n, expectError = false, before, after } = {}) {
  if (state.actions[name]?.phase === 'VERIFIED') return state.actions[name];
  const pre = before ? await before() : null;
  const raw = await clients[who].writeContract({ address: ADDRESS, functionName, args, value });
  const hash = typeof raw === 'string' ? raw : raw?.txId || raw?.hash || raw?.transactionHash;
  if (!/^0x[0-9a-f]{64}$/i.test(hash || '')) throw new Error(`BAD_TX_HASH ${name}`);
  state.actions[name] = { who, functionName, args, value: String(value), hash, phase: 'SUBMITTED', pre };
  save();
  const receipt = await wait(hash, expectError);
  const post = after ? await after(receipt) : null;
  state.actions[name] = { ...state.actions[name], phase: 'VERIFIED', receipt, post };
  save();
  console.log(json({ name, hash, receipt, post }));
  return state.actions[name];
}
const assert = (condition, label, details = {}) => {
  if (!condition) throw new Error(`ASSERTION_FAILED ${label} ${json(details)}`);
  state.assertions.push({ label, passed: true, details }); save();
};

async function main() {
  const config = await read('get_config');
  assert(config.version === 'MERGE_BOND_V1', 'deployment version', config);
  await send('register_sponsor', 'A', 'register_wallet');
  await send('register_developer', 'B', 'register_wallet');
  const amount = 1_000_000_000_000n;
  const create = await send('create_happy', 'A', 'create_bounty', ['macdon3202', 'merge_bond', 1n, 'main', amount, 900n, 'fixture/src/', 'fixture/tests/', 'contract-tests']);
  state.happy_bounty_id ||= returnedId(create.receipt.payload); save();
  const bid = BigInt(state.happy_bounty_id);
  const draft = await read('get_bounty', [bid]); assert(draft.state === 'DRAFT', 'create -> DRAFT', draft);
  await send('failure_wrong_actor_seal', 'B', 'seal_issue', [bid], { expectError: true, before: () => read('get_bounty', [bid]), after: () => read('get_bounty', [bid]) });
  assert(json(state.actions.failure_wrong_actor_seal.pre) === json(state.actions.failure_wrong_actor_seal.post), 'wrong actor rollback equality');
  await send('seal_happy', 'A', 'seal_issue', [bid], { after: () => read('get_bounty', [bid]) });
  assert(state.actions.seal_happy.post.state === 'SEALED' && state.actions.seal_happy.post.issue_digest, 'canonical issue sealed', state.actions.seal_happy.post);
  await send('failure_wrong_value', 'A', 'fund_bounty', [bid], { value: amount - 1n, before: () => read('get_bounty', [bid]), after: () => read('get_bounty', [bid]) });
  assert(state.actions.failure_wrong_value.post.state === 'SEALED', 'wrong value cannot open bounty', state.actions.failure_wrong_value.post);
  await send('withdraw_wrong_value_refund', 'A', 'withdraw_refund');
  await send('fund_happy', 'A', 'fund_bounty', [bid], { value: amount, after: () => read('get_bounty', [bid]) });
  assert(state.actions.fund_happy.post.state === 'OPEN', 'exact funding -> OPEN', state.actions.fund_happy.post);
  await send('failure_sponsor_self_claim', 'A', 'submit_claim', [bid, 2n], { expectError: true, before: () => read('get_bounty', [bid]), after: () => read('get_bounty', [bid]) });
  assert(json(state.actions.failure_sponsor_self_claim.pre) === json(state.actions.failure_sponsor_self_claim.post), 'sponsor self-claim rollback equality');
  const claim = await send('submit_valid_claim', 'B', 'submit_claim', [bid, 2n]);
  state.happy_claim_id ||= returnedId(claim.receipt.payload); save();
  const cid = BigInt(state.happy_claim_id);
  const conflict = await send('submit_competing_claim', 'B', 'submit_claim', [bid, 999n]);
  state.conflict_claim_id ||= returnedId(conflict.receipt.payload); save();
  await send('evaluate_valid_claim', 'A', 'evaluate_claim', [cid], { after: async () => ({ bounty: await read('get_bounty', [bid]), claim: await read('get_claim', [cid]), accounting: await read('get_accounting') }) });
  assert(state.actions.evaluate_valid_claim.post.bounty.state === 'RESERVED' && state.actions.evaluate_valid_claim.post.claim.state === 'WINNER', 'semantic evaluation reserves exact winner', state.actions.evaluate_valid_claim.post);
  const losing = BigInt(state.conflict_claim_id);
  await send('conflict_late_evaluation', 'B', 'evaluate_claim', [losing], { expectError: true, before: () => read('get_claim', [losing]), after: () => read('get_claim', [losing]) });
  assert(json(state.actions.conflict_late_evaluation.pre) === json(state.actions.conflict_late_evaluation.post), 'losing claim cannot mutate after reservation');
  await send('withdraw_winner', 'B', 'withdraw_bounty', [bid], { after: async () => ({ bounty: await read('get_bounty', [bid]), accounting: await read('get_accounting') }) });
  assert(state.actions.withdraw_winner.post.bounty.state === 'PAID' && state.actions.withdraw_winner.post.bounty.claimant_due === '0', 'winner payout -> PAID', state.actions.withdraw_winner.post);
  await send('failure_double_withdraw', 'B', 'withdraw_bounty', [bid], { expectError: true, before: () => read('get_bounty', [bid]), after: () => read('get_bounty', [bid]) });
  assert(json(state.actions.failure_double_withdraw.pre) === json(state.actions.failure_double_withdraw.post), 'double withdrawal rollback equality');
  state.readbacks.final_config = await read('get_config');
  state.readbacks.final_accounting = await read('get_accounting');
  state.completed_at = new Date().toISOString(); save();
  writeFileSync(evidenceFile, `${json(state)}\n`);
  console.log(json({ complete: true, evidence: new URL(evidenceFile).pathname, final: state.readbacks }));
}

await main();
