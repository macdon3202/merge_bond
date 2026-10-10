export const CONTRACT_VERSION = 'MERGE_BOND_V2';

export function normalizeHash(value) {
  const hash = typeof value === 'string' ? value : value?.txId || value?.hash;
  if (!/^0x[0-9a-f]{64}$/i.test(hash || '')) {
    throw new Error('Wallet returned an invalid transaction hash.');
  }
  return hash;
}

function receiptRows(value) {
  const raw = value?.consensus_data?.leader_receipt
    ?? value?.consensus_data?.validators
    ?? value?.consensusData?.leaderReceipt
    ?? [];
  return Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : [];
}

export function receiptState(value) {
  const status = String(value?.statusName || value?.status_name || value?.status || '').toUpperCase();
  const rows = receiptRows(value);
  const leader = rows.find((row) => String(row?.mode).toLowerCase() === 'leader') || rows[0] || {};
  const execution = String(leader.execution_result || leader.executionResult || value?.execution_result || '').toUpperCase();
  const consensus = String(
    value?.result_name || value?.consensus_result_name || value?.consensus_result || value?.consensusResult || '',
  ).toUpperCase();
  const agreed = ['MAJORITY_AGREE', 'AGREE', 'ACCEPTED'].includes(consensus);
  const terminalBad = ['FAILED', 'REJECTED', 'CANCELLED', 'UNDETERMINED'].includes(status);
  const failed = terminalBad
    || execution.includes('ERROR')
    || consensus.includes('DISAGREE')
    || (status === 'FINALIZED' && (!agreed || execution !== 'SUCCESS'));
  return {
    label: status || 'PENDING',
    finalized: status === 'FINALIZED' && agreed && execution === 'SUCCESS' && !failed,
    failed,
    consensus: consensus || 'PENDING',
    execution: execution || 'PENDING',
    reason: typeof leader?.result?.payload === 'string' ? leader.result.payload : '',
  };
}

export function returnedPositiveInt(receipt) {
  const rows = receiptRows(receipt);
  const leader = rows.find((row) => String(row?.mode).toLowerCase() === 'leader') || rows[0] || {};
  const candidates = [
    leader?.result?.data,
    leader?.result?.value,
    leader?.result?.payload,
    receipt?.result,
    receipt?.return_value,
  ];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object') {
      const exact = candidate.readable ?? candidate.value ?? candidate.data;
      if (/^[1-9]\d*$/.test(String(exact)) && Number.isSafeInteger(Number(exact))) return Number(exact);
    }
    if (Number.isInteger(candidate) && candidate > 0) return candidate;
    if (typeof candidate !== 'string') continue;
    const text = candidate.trim();
    if (/^\d+$/.test(text) && Number(text) > 0) return Number(text);
    try {
      const parsed = JSON.parse(text);
      const nested = parsed?.result ?? parsed?.value ?? parsed?.data;
      if (Number.isInteger(Number(nested)) && Number(nested) > 0) return Number(nested);
    } catch {
      // A plain return payload is handled by the numeric branch.
    }
  }
  throw new Error('Finalized transaction did not expose its exact record ID. Load the ID from Explorer.');
}

export function sameAddress(left, right) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

export function sameChainId(value, expected) {
  try { return BigInt(value) === BigInt(expected); } catch { return false; }
}
