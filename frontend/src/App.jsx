import React, { useMemo, useState } from 'react';
import {
  CONTRACT_ADDRESS,
  EXPLORER,
  connectWallet,
  isConfigured,
  readContract,
  waitFinalized,
  writeContract,
} from './genlayer.js';
import { returnedPositiveInt, sameAddress } from './transactions.js';

const initialDraft = {
  owner: '',
  repository: '',
  issue: '',
  branch: 'main',
  amount: '0.001',
  duration: '300',
  production: 'src/',
  tests: 'tests/',
  check: 'contract-tests',
};

const short = (value = '') => value ? `${value.slice(0, 7)}...${value.slice(-5)}` : 'not connected';
const fmt = (value) => value ? new Date(Number(value) * 1000).toLocaleString() : '--';
const parseGen = (value) => {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) throw new Error('Amount must be a positive GEN value with at most 18 decimals.');
  const [whole, fraction = ''] = value.split('.');
  const wei = BigInt(whole) * 10n ** 18n + BigInt((fraction + '0'.repeat(18)).slice(0, 18));
  if (wei <= 0n) throw new Error('Amount must be greater than zero.');
  return wei;
};

function Field({ label, children, wide = false }) {
  return <label className={wide ? 'field wide' : 'field'}><span>{label}</span>{children}</label>;
}

function TxRail({ tx }) {
  if (!tx.hash && !tx.message) return null;
  return (
    <aside className={`tx-rail ${tx.error ? 'bad' : tx.done ? 'good' : ''}`}>
      <div><b>{tx.error ? 'Action stopped' : tx.done ? 'On-chain state confirmed' : 'Transaction in progress'}</b><small>{tx.message}</small></div>
      {tx.hash && <a href={`${EXPLORER}/transactions/${tx.hash}`} target="_blank" rel="noreferrer">View transaction -&gt;</a>}
    </aside>
  );
}

function Record({ bounty, claim }) {
  if (!bounty && !claim) return <div className="empty">Load an exact bounty or claim ID to inspect canonical state.</div>;
  return (
    <div className="record">
      {bounty && <>
        <div className="record-head"><span>Bounty #{bounty.id}</span><strong>{bounty.state}</strong></div>
        <dl>
          <div><dt>Repository</dt><dd>{bounty.owner}/{bounty.repository}</dd></div>
          <div><dt>Issue / branch</dt><dd>#{bounty.issue_number} / {bounty.base_branch}</dd></div>
          <div><dt>Deadline</dt><dd>{fmt(bounty.deadline)}</dd></div>
          <div><dt>Winner</dt><dd>{short(bounty.winner)}</dd></div>
          <div className="full"><dt>Policy commitment</dt><dd className="mono">{bounty.policy_digest || 'not sealed'}</dd></div>
          <div className="full"><dt>Reason</dt><dd>{bounty.reason || '--'}</dd></div>
        </dl>
      </>}
      {claim && <>
        <div className="record-head claim"><span>Claim #{claim.id}</span><strong>{claim.state}</strong></div>
        <dl>
          <div><dt>Bounty / PR</dt><dd>#{claim.bounty_id} / PR #{claim.pr_number}</dd></div>
          <div><dt>Claimant</dt><dd>{short(claim.claimant)}</dd></div>
          <div><dt>Verdict</dt><dd>{claim.verdict || 'pending'}</dd></div>
          <div><dt>Reason</dt><dd>{claim.reason || '--'}</dd></div>
          <div className="full"><dt>Source commitment</dt><dd className="mono">{claim.source_digest || 'not evaluated'}</dd></div>
          <div><dt>Production evidence</dt><dd>{claim.production_files?.length || 0} file(s)</dd></div>
          <div><dt>Regression evidence</dt><dd>{claim.test_files?.length || 0} file(s)</dd></div>
        </dl>
      </>}
    </div>
  );
}

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [mode, setMode] = useState('sponsor');
  const [draft, setDraft] = useState(initialDraft);
  const [bountyId, setBountyId] = useState('');
  const [claimId, setClaimId] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [bounty, setBounty] = useState(null);
  const [claim, setClaim] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tx, setTx] = useState({});

  const sponsor = useMemo(() => sameAddress(wallet?.account, bounty?.sponsor), [wallet, bounty]);
  const winner = useMemo(() => sameAddress(wallet?.account, bounty?.winner), [wallet, bounty]);

  const update = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));
  const connect = async () => {
    try { setWallet(await connectWallet()); setTx({ message: 'Wallet connected. No transaction sent.', done: true }); }
    catch (error) { setTx({ message: error.message, error: true }); }
  };
  const loadBounty = async (id = bountyId) => {
    if (!id) throw new Error('Enter a bounty ID.');
    const value = await readContract('get_bounty', [BigInt(id)]);
    setBounty(value); setBountyId(String(id)); return value;
  };
  const loadClaim = async (id = claimId) => {
    if (!id) throw new Error('Enter a claim ID.');
    const value = await readContract('get_claim', [BigInt(id)]);
    setClaim(value); setClaimId(String(id)); return value;
  };
  const sync = async () => {
    try {
      setBusy(true); setTx({ message: 'Reading canonical contract state&' });
      if (bountyId) await loadBounty();
      if (claimId) await loadClaim();
      setTx({ message: 'Canonical state synchronized.', done: true });
    } catch (error) { setTx({ message: error.message, error: true }); }
    finally { setBusy(false); }
  };

  const transact = async ({ name, args = [], value = 0n, after, label }) => {
    if (!wallet) return setTx({ message: 'Connect a wallet first.', error: true });
    try {
      setBusy(true); setTx({ message: 'Confirm in your wallet&' });
      const hash = await writeContract(wallet, name, args, value);
      setTx({ hash, message: 'Submitted. Waiting for validator consensus&' });
      const receipt = await waitFinalized(hash, (state) => setTx({
        hash,
        message: `${state.label} / ${state.consensus} / ${state.execution}`,
      }));
      await after?.(receipt);
      setTx({ hash, message: label || 'Finalized and authoritative state re-read.', done: true });
    } catch (error) {
      setTx((current) => ({ ...current, message: error.message, error: true }));
    } finally { setBusy(false); }
  };

  const create = async (event) => {
    event.preventDefault();
    let amount;
    try { amount = parseGen(draft.amount); } catch (error) { return setTx({ message: error.message, error: true }); }
    return transact({
      name: 'create_bounty',
      args: [
        draft.owner.trim(), draft.repository.trim(), BigInt(draft.issue), draft.branch.trim(),
        amount, BigInt(draft.duration), draft.production.trim(), draft.tests.trim(), draft.check.trim(),
      ],
      after: async (receipt) => {
        const id = returnedPositiveInt(receipt);
        const state = await loadBounty(id);
        if (state.state !== 'DRAFT') throw new Error('Readback mismatch: expected DRAFT.');
      },
      label: 'Bounty created and DRAFT state confirmed.',
    });
  };

  const register = () => transact({ name: 'register_wallet', label: 'Wallet registration finalized.' });
  const seal = () => transact({
    name: 'seal_issue', args: [BigInt(bountyId)],
    after: async () => { const state = await loadBounty(); if (state.state !== 'SEALED') throw new Error('Readback mismatch: expected SEALED.'); },
    label: 'GitHub issue sealed and commitment confirmed.',
  });
  const fund = () => transact({
    name: 'fund_bounty', args: [BigInt(bountyId)], value: BigInt(bounty.amount),
    after: async () => { const state = await loadBounty(); if (state.state !== 'OPEN') throw new Error('Readback mismatch: expected OPEN.'); },
    label: 'Exact bounty value locked and OPEN state confirmed.',
  });
  const submit = () => transact({
    name: 'submit_claim', args: [BigInt(bountyId), BigInt(prNumber)],
    after: async (receipt) => {
      const id = returnedPositiveInt(receipt);
      const state = await loadClaim(id);
      if (state.state !== 'SUBMITTED') throw new Error('Readback mismatch: expected SUBMITTED.');
    },
    label: 'Claim submitted and exact claim ID confirmed.',
  });
  const evaluate = () => transact({
    name: 'evaluate_claim', args: [BigInt(claimId)],
    after: async () => { await loadClaim(); await loadBounty(claim?.bounty_id || bountyId); },
    label: 'Evaluation finalized; claim and bounty states re-read.',
  });
  const expire = () => transact({
    name: 'expire_bounty', args: [BigInt(bountyId)],
    after: async () => { const state = await loadBounty(); if (state.state !== 'EXPIRED_REFUNDABLE') throw new Error('Readback mismatch after expiry.'); },
    label: 'Expiry recovery confirmed on-chain.',
  });
  const withdraw = () => transact({
    name: 'withdraw_bounty', args: [BigInt(bountyId)],
    after: async () => { const state = await loadBounty(); if (state.state !== 'PAID') throw new Error('Readback mismatch after withdrawal.'); },
    label: 'Payout/refund request finalized and PAID state confirmed.',
  });

  return (
    <main>
      <header>
        <a className="brand" href="#top"><img src="/mergebond-logo.png" alt="MergeBond logo" /><div><b>MergeBond</b><span>evidence before payout</span></div></a>
        <div className="network"><i /> StudioNet</div>
        <button className="wallet" onClick={connect}>{wallet ? short(wallet.account) : 'Connect wallet'}</button>
      </header>

      <section className="hero" id="top">
        <div><p className="eyebrow">COMPETITIVE IMPLEMENTATION BOUNTIES</p><h1>Fund the fix.<br /><em>Prove the merge.</em></h1>
        <p className="lede">MergeBond locks a sponsor's GEN behind a sealed GitHub issue. The first merged PR that passes exact provenance, CI, production-code, regression-test and semantic checks reserves the payout.</p></div>
        <div className="contract-stamp"><span>Active contract</span><b>{isConfigured ? short(CONTRACT_ADDRESS) : 'not deployed'}</b>{isConfigured && <a href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">Explorer -&gt;</a>}</div>
      </section>

      <TxRail tx={tx} />

      <nav className="modes">
        {['sponsor', 'developer', 'verify'].map((item) => <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}><span>0{['sponsor','developer','verify'].indexOf(item)+1}</span>{item}</button>)}
      </nav>

      <section className="workspace">
        <div className="workflow">
          {mode === 'sponsor' && <>
            <div className="section-title"><p>SPONSOR DESK</p><h2>Define an objective target</h2><span>The wallet that creates the bounty becomes its sponsor. The deployer has no special role.</span></div>
            <form className="form-grid" onSubmit={create}>
              <Field label="GitHub owner"><input required value={draft.owner} onChange={update('owner')} placeholder="organization" /></Field>
              <Field label="Repository"><input required value={draft.repository} onChange={update('repository')} placeholder="repository" /></Field>
              <Field label="Issue number"><input required type="number" min="1" value={draft.issue} onChange={update('issue')} /></Field>
              <Field label="Base branch"><input required value={draft.branch} onChange={update('branch')} /></Field>
              <Field label="Bounty (GEN)"><input required value={draft.amount} onChange={update('amount')} /></Field>
              <Field label="Open window (120-900 sec)"><input required type="number" min="120" max="900" value={draft.duration} onChange={update('duration')} /></Field>
              <Field label="Production path prefix"><input required value={draft.production} onChange={update('production')} /></Field>
              <Field label="Test path prefix"><input required value={draft.tests} onChange={update('tests')} /></Field>
              <Field label="Required GitHub check" wide><input required value={draft.check} onChange={update('check')} /></Field>
              <button className="primary wide" disabled={busy || !isConfigured}>Create bounty draft</button>
            </form>
          </>}

          {mode === 'developer' && <>
            <div className="section-title"><p>DEVELOPER DESK</p><h2>Compete with a merged pull request</h2><span>Any external wallet can register and claim. A sponsor cannot claim its own bounty.</span></div>
            <div className="action-stack">
              <button className="outline" disabled={busy || !isConfigured} onClick={register}>Register this wallet</button>
              <Field label="Pull request number"><input type="number" min="1" value={prNumber} onChange={(event) => setPrNumber(event.target.value)} placeholder="11" /></Field>
              <button className="primary" disabled={busy || !bountyId || !prNumber} onClick={submit}>Submit competing claim</button>
              {claim && ['SUBMITTED', 'UNRESOLVED'].includes(claim.state) && <button className="signal" disabled={busy} onClick={evaluate}>Run permissionless evaluation</button>}
              {bounty?.state === 'RESERVED' && winner && <button className="primary" disabled={busy} onClick={withdraw}>Withdraw reserved bounty</button>}
            </div>
          </>}

          {mode === 'verify' && <>
            <div className="section-title"><p>PUBLIC VERIFICATION</p><h2>Replay the evidence decision</h2><span>Evaluation is permissionless. Any reviewer wallet may trigger it; identity does not influence the verdict.</span></div>
            <div className="checks">
              {['Exact issue bytes still match the sealed digest','PR is merged into the configured repository and branch','Production and regression paths both changed','Named GitHub check succeeded on the exact head SHA','Prover and falsifier agree on every consequential field'].map((item, index) => <div key={item}><b>{index+1}</b><span>{item}</span></div>)}
            </div>
            {claim && ['SUBMITTED', 'UNRESOLVED'].includes(claim.state) && <button className="signal" disabled={busy} onClick={evaluate}>Evaluate loaded claim</button>}
          </>}
        </div>

        <aside className="inspector">
          <div className="section-title"><p>CHAIN INSPECTOR</p><h2>Authoritative readback</h2></div>
          <div className="id-row"><input type="number" min="1" value={bountyId} onChange={(event) => setBountyId(event.target.value)} placeholder="Bounty ID" /><input type="number" min="1" value={claimId} onChange={(event) => setClaimId(event.target.value)} placeholder="Claim ID" /><button disabled={busy || (!bountyId && !claimId)} onClick={sync}>Sync</button></div>
          <Record bounty={bounty} claim={claim} />
          {bounty && <div className="state-actions">
            {bounty.state === 'DRAFT' && sponsor && <button onClick={seal} disabled={busy}>Seal GitHub issue</button>}
            {bounty.state === 'SEALED' && sponsor && <button onClick={fund} disabled={busy}>Fund exact amount</button>}
            {bounty.state === 'OPEN' && <button onClick={expire} disabled={busy}>Expire after deadline</button>}
            {['RESERVED','EXPIRED_REFUNDABLE'].includes(bounty.state) && (winner || sponsor) && <button onClick={withdraw} disabled={busy}>Withdraw amount due</button>}
          </div>}
        </aside>
      </section>

      <section className="how">
        <p className="eyebrow">HOW IT WORKS</p><h2>Assertions do not unlock funds.</h2>
        <div className="how-grid">
          <article><b>01</b><h3>Seal</h3><p>The sponsor commits to exact GitHub issue bytes and a deterministic repository, branch, path and CI policy.</p></article>
          <article><b>02</b><h3>Compete</h3><p>Independent developers submit merged PR numbers. The contract fetches canonical GitHub facts itself.</p></article>
          <article><b>03</b><h3>Falsify</h3><p>Validators compare issue criteria with actual production and regression patches while looking for omissions.</p></article>
          <article><b>04</b><h3>Reserve</h3><p>Only the first fully grounded claim reserves the payout. Failed or unknown facts leave funds recoverable.</p></article>
        </div>
      </section>

      <footer><span>MergeBond / {new Date().getFullYear()}</span><span>Deployer authority: none / GitHub is used only within its authoritative scope</span></footer>
    </main>
  );
}
