import React, { useEffect, useRef, useState } from 'react';
import { accountingCheck, dossierJson, evidenceLinks, loadDossier, loadPage, readLink, recordLink } from './explorer.js';

export default function Explorer({ read, scope, onOpen }) {
  const [kind, setKind] = useState('bounties');
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [listing, setListing] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [notice, setNotice] = useState('');
  const request = useRef(0);
  const readRef = useRef(read);
  readRef.current = read;

  async function inspect(bid, cid, updateUrl = true) {
    const sequence = ++request.current;
    setDetailLoading(true); setDossier(null); setDetailError(''); setNotice('');
    try {
      const result = await loadDossier(readRef.current, scope, bid, cid);
      if (sequence !== request.current) return;
      setDossier(result);
      if (updateUrl) window.history.replaceState(null, '', recordLink(window.location.href, scope, bid, cid));
    } catch (err) { if (sequence === request.current) setDetailError(err.message); }
    finally { if (sequence === request.current) setDetailLoading(false); }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setListing(null); setError('');
    loadPage(readRef.current, kind, page).then(result => {
      if (!cancelled) setListing(result);
    }).catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [kind, page, refresh]);

  useEffect(() => {
    const openLink = () => {
      try {
        const ids = readLink(window.location.href, scope);
        if (ids) inspect(ids.bounty, ids.claim, false);
      } catch (err) { setDetailError(err.message); }
    };
    openLink();
    window.addEventListener('popstate', openLink);
    return () => { request.current++; window.removeEventListener('popstate', openLink); };
  }, [scope.contract, scope.chainId]);

  const rows = listing?.rows.filter(row => (status === 'ALL' || row.state === status)
    && [row.id, row.owner, row.repository, row.pr_number, row.claimant, row.sponsor, row.reason].join(' ').toLowerCase().includes(query.toLowerCase())) || [];
  const statuses = kind === 'bounties' ? ['DRAFT', 'SEALED', 'OPEN', 'RESERVED', 'EXPIRED_REFUNDABLE', 'PAID'] : ['SUBMITTED', 'UNRESOLVED', 'REJECTED', 'WINNER'];
  const checks = dossier ? accountingCheck(dossier.accounting) : null;
  const share = dossier ? recordLink(window.location.href, scope, dossier.bounty.id, dossier.claim?.id) : '';
  function download() {
    const blob = new Blob([dossierJson(dossier)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `mergebond-bounty-${dossier.bounty.id}${dossier.claim ? '-claim-' + dossier.claim.id : ''}.json`;
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Readback JSON downloaded. Includes observation times and verification limits.');
  }

  return <section id="explore" className="explorer" aria-labelledby="explorer-title">
    <div className="explorer-heading"><div><p className="eyebrow">PUBLIC EVIDENCE EXPLORER</p><h2 id="explorer-title">Find the work. Inspect the proof.</h2>
      <p>Browse live contract records, trace the author grant and export a dated readback. No wallet required.</p></div>
      <button className="outline" onClick={() => { setRefresh(x => x + 1); if (dossier) inspect(dossier.bounty.id, dossier.claim?.id); }}>Refresh chain data</button></div>
    <div className="explorer-toolbar">
      <div role="group" aria-label="Record type">{['bounties', 'claims'].map(type => <button key={type} aria-pressed={kind === type} onClick={() => { setKind(type); setPage(0); setStatus('ALL'); }}>{type}</button>)}</div>
      <label>Search this page<input value={query} onChange={e => setQuery(e.target.value)} placeholder="ID, repository or wallet" /></label>
      <label>State<select value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">All states</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
    </div>
    <div className="explorer-grid">
      <div aria-busy={loading}>
        <p className="explorer-count">{listing ? `${listing.total} ${kind} on this contract · page ${listing.pages ? listing.page + 1 : 0} of ${listing.pages}` : 'Reading contract index…'}</p>
        {error && <p role="alert" className="explorer-error">{error} Refresh to retry; no partial page is shown.</p>}
        {loading && <p role="status">Loading canonical records…</p>}
        {listing && rows.length === 0 && <p className="empty-light">{listing.total ? 'No matches on this page. Try another page or clear filters.' : `No ${kind} have been created on this contract.`}</p>}
        <div className="record-list">{rows.map(row => <button className="record-card" key={row.id} onClick={() => inspect(kind === 'bounties' ? row.id : row.bounty_id, kind === 'claims' ? row.id : null)}>
          <span className="record-card-top"><b>{kind === 'bounties' ? 'Bounty' : 'Claim'} #{row.id}</b><span className="state-tag">{row.state}</span></span>
          <strong>{kind === 'bounties' ? `${row.owner}/${row.repository}` : `Bounty #${row.bounty_id} · PR #${row.pr_number}`}</strong>
          <small>{kind === 'bounties' ? `Issue #${row.issue_number} · ${row.amount} wei` : row.reason || 'Awaiting evaluation'}</small>
          <span className="record-card-link">Open evidence dossier →</span>
        </button>)}</div>
        <div className="pagination"><button disabled={loading || page === 0} onClick={() => setPage(p => p - 1)}>Newer records</button><button disabled={loading || !listing || page + 1 >= listing.pages} onClick={() => setPage(p => p + 1)}>Older records</button></div>
        <small>Filters apply to the loaded page (up to 8 records). Counts are records, not unique users or traction.</small>
      </div>
      <aside className="dossier" aria-label="Evidence dossier" aria-busy={detailLoading}>
        {detailLoading && <p role="status">Reading record and global accounting…</p>}
        {detailError && <p role="alert" className="explorer-error">{detailError}</p>}
        {!dossier && !detailLoading && <div className="empty-light">Choose a record to inspect its policy, authorization and custody readback.</div>}
        {dossier && <>
          <p className="eyebrow">CANONICAL READBACK / BOUNTY #{dossier.bounty.id}</p>
          <h3>{dossier.bounty.owner}/{dossier.bounty.repository}</h3>
          <p><b>{dossier.bounty.state}</b>{dossier.claim && ` · Claim #${dossier.claim.id}: ${dossier.claim.state}`}</p>
          <p className="observation">Read {new Date(dossier.observation.completed_at).toLocaleString()}. Separate latest-state reads; refresh before acting.</p>
          <dl className="dossier-facts">
            <div><dt>Funded at</dt><dd>{dossier.bounty.funded_at ? new Date(Number(dossier.bounty.funded_at) * 1000).toLocaleString() : 'Not funded'}</dd></div>
            <div><dt>Deadline</dt><dd>{dossier.bounty.deadline ? new Date(Number(dossier.bounty.deadline) * 1000).toLocaleString() : 'Not started'}</dd></div>
            <div><dt>Required check</dt><dd>{dossier.bounty.required_check}</dd></div>
            <div><dt>Base branch</dt><dd>{dossier.bounty.base_branch}</dd></div>
            <div className="full"><dt>Policy SHA-256</dt><dd>{dossier.bounty.policy_digest || 'Not sealed'}</dd></div>
            <div className="full"><dt>Issue SHA-256</dt><dd>{dossier.bounty.issue_digest || 'Not sealed'}</dd></div>
            {dossier.claim && <><div className="full"><dt>Authorized payout wallet</dt><dd>{dossier.claim.claimant}</dd></div><div className="full"><dt>Source SHA-256</dt><dd>{dossier.claim.source_digest || 'Not acquired'}</dd></div><div className="full"><dt>Outcome reason</dt><dd>{dossier.claim.reason || 'Pending'}</dd></div></>}
          </dl>
          <details><summary>Complete sealed acceptance criteria</summary><pre>{dossier.bounty.criteria || 'Not sealed'}</pre></details>
          {dossier.claim && <details><summary>Observed changed paths</summary><h4>Production</h4><pre>{dossier.claim.production_files.join('\n') || 'None recorded'}</pre><h4>Regression</h4><pre>{dossier.claim.test_files.join('\n') || 'None recorded'}</pre></details>}
          <div className="evidence-links">{evidenceLinks(dossier).map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div>
          <div className="accounting-panel"><h4>Global contract accounting</h4>
            <p className={checks.ledgerConserved && checks.balanceCoversLiabilities ? 'accounting-ok' : 'explorer-error'}>{checks.ledgerConserved ? 'Ledger equation holds' : 'Ledger mismatch'} · {checks.balanceCoversLiabilities ? 'Balance covers liabilities' : 'Balance below liabilities'}</p>
            <dl className="dossier-facts">{Object.entries(dossier.accounting).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{String(value)} wei</dd></div>)}</dl>
            <small>Outbound requested is not recipient settlement proof. Accounting covers all bounties and refund ledgers.</small>
          </div>
          <div className="dossier-actions"><button className="primary" onClick={download}>Download readback JSON</button><button className="outline" onClick={() => onOpen(dossier.bounty, dossier.claim)}>Open in workspace</button></div>
          <label className="share-link">Share this exact record<input aria-label="Share record URL" readOnly value={share} onFocus={e => e.target.select()} /></label>
          <p role="status">{notice}</p>
        </>}
      </aside>
    </div>
  </section>;
}
