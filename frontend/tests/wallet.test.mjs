import test from 'node:test';
import assert from 'node:assert/strict';
import { connectInjected } from '../src/wallet.js';

const account = `0x${'12'.repeat(20)}`;
const chain = {
  id: 61999,
  name: 'StudioNet',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://example.invalid'] } },
};

function fixture({ current = '0xf22f', unknown = false, reject = false, stuck = false, changed = false } = {}) {
  const calls = [];
  const provider = { async request({ method }) {
    calls.push(method);
    if (method === 'eth_requestAccounts') return [account];
    if (method === 'eth_accounts') return [changed ? `0x${'34'.repeat(20)}` : account];
    if (method === 'eth_chainId') return current;
    if (method === 'wallet_switchEthereumChain') {
      if (reject) throw Object.assign(new Error('User rejected'), { code: 4001 });
      if (unknown) {
        unknown = false;
        throw Object.assign(new Error('Unknown chain'), { code: 4902 });
      }
      if (!stuck) current = '0xf22f';
      return null;
    }
    if (method === 'wallet_addEthereumChain') return null;
    throw new Error(`Unsupported method: ${method}`);
  } };
  const client = { connect() { throw new Error('SDK Snap connect must not run'); } };
  return {
    provider,
    calls,
    client,
    factory: (config) => { assert.equal(config.provider, provider); return client; },
  };
}

test('connects a non-Snap wallet without calling a Snap method', async () => {
  const f = fixture();
  const wallet = await connectInjected(f.provider, chain, f.factory);
  assert.equal(wallet.client, f.client);
  assert.equal(wallet.account, account);
  assert.deepEqual(f.calls, ['eth_requestAccounts', 'eth_chainId', 'eth_chainId', 'eth_accounts']);
});

test('uses the selected provider instead of a global aggregator', async () => {
  const f = fixture(); f.provider.isMetaMask = true;
  await connectInjected({ providers: [{ request() { throw new Error('Wrong provider'); } }, f.provider] }, chain, f.factory);
});

test('switches the wrong chain and verifies the result', async () => {
  const f = fixture({ current: '0x1' });
  await connectInjected(f.provider, chain, f.factory);
  assert.ok(f.calls.includes('wallet_switchEthereumChain'));
});

test('adds an unknown chain, switches and never requests Snaps', async () => {
  const f = fixture({ current: '0x1', unknown: true });
  await connectInjected(f.provider, chain, f.factory);
  assert.equal(f.calls.filter((method) => method === 'wallet_switchEthereumChain').length, 2);
  assert.ok(f.calls.includes('wallet_addEthereumChain'));
  assert.ok(f.calls.every((method) => !method.toLowerCase().includes('snap')));
});

test('propagates rejection without trying to add a chain', async () => {
  const f = fixture({ current: '0x1', reject: true });
  await assert.rejects(connectInjected(f.provider, chain, f.factory), /User rejected/);
  assert.ok(!f.calls.includes('wallet_addEthereumChain'));
});

test('does not report connected after an ineffective switch', async () => {
  const f = fixture({ current: '0x1', stuck: true });
  await assert.rejects(connectInjected(f.provider, chain, f.factory), /not on/);
});

test('rejects changed account and missing wallet', async () => {
  const f = fixture({ changed: true });
  await assert.rejects(connectInjected(f.provider, chain, f.factory), /changed/);
  await assert.rejects(connectInjected(null, chain, f.factory), /Install/);
});
