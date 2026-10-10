import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHash, receiptState, returnedPositiveInt, sameAddress, sameChainId } from '../src/transactions.js';

const HASH = '0x' + 'ab'.repeat(32);
const okReceipt = {
  statusName: 'FINALIZED',
  result_name: 'MAJORITY_AGREE',
  consensus_data: { leader_receipt: [{ mode: 'leader', execution_result: 'SUCCESS', result: { payload: '7' } }] },
};

test('normalizes both SDK transaction shapes', () => {
  assert.equal(normalizeHash(HASH), HASH);
  assert.equal(normalizeHash({ txId: HASH }), HASH);
  assert.equal(normalizeHash({ hash: HASH }), HASH);
  assert.throws(() => normalizeHash({ txId: 'bad' }));
});

test('requires finalized consensus and successful execution', () => {
  assert.equal(receiptState(okReceipt).finalized, true);
  assert.equal(receiptState({ ...okReceipt, statusName: 'ACCEPTED' }).finalized, false);
  assert.equal(receiptState({ ...okReceipt, result_name: 'MAJORITY_DISAGREE' }).failed, true);
});

test('extracts exact returned record ID', () => {
  assert.equal(returnedPositiveInt(okReceipt), 7);
  assert.equal(returnedPositiveInt({
    consensus_data: { leader_receipt: [{ result: { payload: '{"result":9}' } }] },
  }), 9);
  assert.throws(() => returnedPositiveInt({}));
  assert.equal(returnedPositiveInt({consensus_data: {leader_receipt: [{result: {payload: {readable: '12'}}}]}}), 12);
});

test('compares wallet addresses case-insensitively', () => {
  assert.equal(sameAddress('0xAbC', '0xaBc'), true);
  assert.equal(sameAddress('', '0xaBc'), false);
});

test('matches decimal and hexadecimal chain IDs without coercion ambiguity', () => {
  assert.equal(sameChainId('0x1234', 0x1234), true);
  assert.equal(sameChainId('not-a-chain', 0x1234), false);
});
