'use client';
// tools/CsvDuplicateFinderTool.jsx
// Path: toolbeans/tools/CsvDuplicateFinderTool.jsx
//
// STANDALONE tool finds duplicate rows, duplicate columns and duplicate
// headers in CSV files. Entirely browser-based, no server contact.
// Papa Parse is loaded from CDN no npm install needed.

import { useState, useRef, useCallback } from 'react';

// ── Load Papa Parse from CDN ──────────────────────────────
let papaLoaded = false;
function loadPapa() {
  return new Promise((resolve) => {
    if (papaLoaded || (typeof window !== 'undefined' && window.Papa)) {
      papaLoaded = true;
      return resolve(window.Papa);
    }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js';
    s.onload = () => { papaLoaded = true; resolve(window.Papa); };
    document.head.appendChild(s);
  });
}

// ── Core duplicate detection logic ────────────────────────
function analyseData(rows, headers) {
  // 1. Duplicate headers
  const headerCounts = {};
  headers.forEach((h) => {
    const k = h.trim().toLowerCase();
    headerCounts[k] = (headerCounts[k] || 0) + 1;
  });
  const duplicateHeaders = headers
    .map((h, i) => ({ name: h, index: i }))
    .filter(({ name }) => headerCounts[name.trim().toLowerCase()] > 1);

  // 2. Duplicate rows hash each row for O(n) detection
  const seen = new Map();  // rowKey → first occurrence row index (1-based, data only)
  const duplicateRows = [];
  rows.forEach((row, i) => {
    const key = headers
      .map((_, ci) => (row[ci] ?? '').toString().trim().toLowerCase())
      .join('||__||');
    const dataRowNum = i + 2; // +2 because row 1 is the header
    if (seen.has(key)) {
      duplicateRows.push({ rowNum: dataRowNum, originalRow: seen.get(key), data: row });
    } else {
      seen.set(key, dataRowNum);
    }
  });

  // 3. Duplicate columns columns with identical values across all rows
  const duplicateColumns = [];
  const colKeys = headers.map((_, ci) =>
    rows.map((row) => (row[ci] ?? '').toString().trim().toLowerCase()).join('||')
  );
  for (let a = 0; a < headers.length; a++) {
    for (let b = a + 1; b < headers.length; b++) {
      if (colKeys[a] === colKeys[b]) {
        duplicateColumns.push({ colA: headers[a], indexA: a, colB: headers[b], indexB: b });
      }
    }
  }

  return { duplicateHeaders, duplicateRows, duplicateColumns };
}

// ── Small badge ───────────────────────────────────────────
function CountBadge({ n, color }) {
  const colors = {
    red:    'background:#fef2f2;color:#dc2626;border:1px solid #fecaca',
    yellow: 'background:#fffbeb;color:#d97706;border:1px solid #fde68a',
    green:  'background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0',
    slate:  'background:#f8fafc;color:#475569;border:1px solid #e2e8f0',
  };
  return (
    <span style={{ style: colors[color], borderRadius: 9999, padding: '2px 10px', fontSize: 12, fontWeight: 700, ...parseStyle(colors[color]) }}>
      {n}
    </span>
  );
}
function parseStyle(s) {
  const o = {};
  s.split(';').forEach(p => { const [k, v] = p.split(':'); if (k && v) o[camelize(k.trim())] = v.trim(); });
  return o;
}
function camelize(s) { return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

// ── Main component ────────────────────────────────────────
export default function CsvDuplicateFinderTool() {
  const [fileName, setFileName]         = useState('');
  const [headers, setHeaders]           = useState([]);
  const [rows, setRows]                 = useState([]);         // original rows
  const [cleanRows, setCleanRows]       = useState([]);         // after removal
  const [cleanHeaders, setCleanHeaders] = useState([]);         // after col removal
  const [analysis, setAnalysis]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [tab, setTab]                   = useState('rows');     // rows | columns | headers | preview
  const [removed, setRemoved]           = useState(false);
  const [removedCols, setRemovedCols]   = useState(false);
  const [showAllDupes, setShowAllDupes] = useState(false);
  const fileInputRef = useRef(null);

  // ── Parse file ──────────────────────────────────────────
  const parseFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file (.csv). For Excel files, export as CSV first.');
      return;
    }
    setLoading(true);
    setError('');
    setAnalysis(null);
    setRemoved(false);
    setRemovedCols(false);
    setFileName(file.name);

    const Papa = await loadPapa();
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: (result) => {
        const all = result.data;
        if (!all || all.length < 2) {
          setError('The file appears empty or has only a header row. Please check your CSV.');
          setLoading(false);
          return;
        }
        const hdrs = all[0].map(String);
        const dataRows = all.slice(1);
        setHeaders(hdrs);
        setCleanHeaders(hdrs);
        setRows(dataRows);
        setCleanRows(dataRows);
        setAnalysis(analyseData(dataRows, hdrs));
        setLoading(false);
      },
      error: () => {
        setError('Could not parse the CSV file. Make sure it is a valid comma-separated file.');
        setLoading(false);
      },
    });
  }, []);

  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) parseFile(f); e.target.value = ''; };
  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) parseFile(f); };

  // ── Remove duplicate rows ────────────────────────────────
  const removeRows = () => {
    if (!analysis) return;
    const dupeNums = new Set(analysis.duplicateRows.map(d => d.rowNum));
    const next = cleanRows.filter((_, i) => !dupeNums.has(i + 2));
    setCleanRows(next);
    setRemoved(true);
    // re-analyse with cleaned data (should now report 0 dupes)
    setAnalysis(prev => ({ ...prev, duplicateRows: [] }));
  };

  // ── Remove duplicate columns ─────────────────────────────
  const removeCols = () => {
    if (!analysis) return;
    const toRemove = new Set(analysis.duplicateColumns.map(d => d.indexB));
    const nextHeaders = cleanHeaders.filter((_, i) => !toRemove.has(i));
    const nextRows = cleanRows.map(row => row.filter((_, i) => !toRemove.has(i)));
    setCleanHeaders(nextHeaders);
    setCleanRows(nextRows);
    setRemovedCols(true);
    setAnalysis(prev => ({ ...prev, duplicateColumns: [] }));
  };

  // ── Download clean CSV ────────────────────────────────────
  const downloadCSV = () => {
    const lines = [cleanHeaders.join(',')];
    cleanRows.forEach(row => {
      lines.push(cleanHeaders.map((_, i) => {
        const v = (row[i] ?? '').toString();
        return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.csv', '') + '-deduplicated.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Reset ─────────────────────────────────────────────────
  const reset = () => {
    setCleanRows(rows);
    setCleanHeaders(headers);
    setRemoved(false);
    setRemovedCols(false);
    setAnalysis(analyseData(rows, headers));
  };

  const hasFile = headers.length > 0 && !loading;
  const dupeRowCount = analysis?.duplicateRows?.length ?? 0;
  const dupeColCount = analysis?.duplicateColumns?.length ?? 0;
  const dupeHdrCount = analysis?.duplicateHeaders?.length ?? 0;
  const totalIssues = dupeRowCount + dupeColCount + dupeHdrCount;
  const displayedDupes = showAllDupes
    ? analysis?.duplicateRows
    : analysis?.duplicateRows?.slice(0, 10);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,#0f172a 100%)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a>
            <span>/</span>
            <a href="/tools" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tools</a>
            <span>/</span>
            <span style={{ color: '#cbd5e1' }}>Find Duplicates in CSV</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 15 }}>🔁</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fca5a5' }}>CSV Duplicate Finder</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4.5vw,44px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
            Find and Remove Duplicate Rows,<br />
            <span style={{ background: 'linear-gradient(90deg,#f87171,#fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Columns and Headers in CSV</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 580, margin: '0 0 24px', lineHeight: 1.7 }}>
            Upload a CSV and instantly see every duplicate with its exact row or column number.
            Remove all duplicates in one click and download the clean file.
            No code, no Excel, no server upload.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['CSV files only', 'Finds row + column + header dupes', 'Exact row numbers shown', 'No upload to server', 'Free forever'].map(f => (
              <span key={f} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', color: '#c7d2fe', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>✓ {f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool area ────────────────────────────────────── */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>

        {/* Upload zone */}
        {!hasFile && (
          <div
            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed #c7d2fe', borderRadius: 20, padding: '60px 28px', textAlign: 'center', cursor: 'pointer', background: '#fff', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f5f3ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fff'; }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>📂</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Drop your CSV file here</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>CSV files only your file never leaves your browser</p>
            <button style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Choose CSV File
            </button>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>Supports any CSV regardless of size. No row limit.</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin .8s linear infinite' }} />
            <p style={{ color: '#64748b' }}>Scanning for duplicates…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#dc2626', fontSize: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>⚠️</span> {error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18 }}>×</button>
          </div>
        )}

        {hasFile && analysis && (
          <>
            {/* Summary bar */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>File</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{fileName}</p>
              </div>
              <div style={{ width: 1, height: 36, background: '#f1f5f9', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total rows</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{cleanRows.length.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Columns</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{cleanHeaders.length}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: totalIssues > 0 ? '#dc2626' : '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total issues</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: totalIssues > 0 ? '#dc2626' : '#16a34a' }}>{totalIssues === 0 ? '✓ Clean' : totalIssues}</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(removed || removedCols) && (
                  <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>↩ Reset</button>
                )}
                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer' }}>Open new file</button>
                <button onClick={downloadCSV} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⬇ Download Clean CSV</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #e2e8f0', borderBottom: 'none', background: '#f8fafc' }}>
              {[
                { id: 'rows',    label: `Duplicate Rows`,    count: dupeRowCount,  color: dupeRowCount > 0 ? '#dc2626' : '#16a34a' },
                { id: 'columns', label: `Duplicate Columns`, count: dupeColCount,  color: dupeColCount > 0 ? '#d97706' : '#16a34a' },
                { id: 'headers', label: `Duplicate Headers`, count: dupeHdrCount,  color: dupeHdrCount > 0 ? '#7c3aed' : '#16a34a' },
                { id: 'preview', label: 'Data Preview',      count: null,          color: null },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '13px 8px', border: 'none', borderBottom: tab === t.id ? '2px solid #6366f1' : '2px solid transparent', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#6366f1' : '#64748b', fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {t.label}
                  {t.count !== null && (
                    <span style={{ background: t.count > 0 ? '#fef2f2' : '#f0fdf4', color: t.count > 0 ? t.color : '#16a34a', border: `1px solid ${t.count > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: 24, marginBottom: 20 }}>

              {/* DUPLICATE ROWS tab */}
              {tab === 'rows' && (
                <div>
                  {dupeRowCount === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                      <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 4px' }}>No duplicate rows found</p>
                      <p style={{ color: '#64748b', fontSize: 13 }}>Every row in this CSV is unique across all {cleanHeaders.length} columns.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#dc2626' }}>{dupeRowCount} duplicate {dupeRowCount === 1 ? 'row' : 'rows'} found</p>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                            {removed
                              ? 'Duplicates already removed reset to undo'
                              : `${rows.length - dupeRowCount} unique rows remain after removal`}
                          </p>
                        </div>
                        {!removed && (
                          <button onClick={removeRows} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                            Remove All {dupeRowCount} Duplicates
                          </button>
                        )}
                        {removed && (
                          <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>✓ Removed</span>
                        )}
                      </div>

                      {/* Duplicate pairs list */}
                      <div style={{ border: '1px solid #fecaca', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 3fr', background: '#fef2f2', padding: '10px 14px', borderBottom: '1px solid #fecaca', fontSize: 12, fontWeight: 700, color: '#dc2626', gap: 8 }}>
                          <span>Duplicate row #</span>
                          <span>Matches row #</span>
                          <span>First column value (preview)</span>
                        </div>
                        {displayedDupes.map((d, i) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 3fr', padding: '10px 14px', borderBottom: i < displayedDupes.length - 1 ? '1px solid #fee2e2' : 'none', fontSize: 13, color: '#475569', gap: 8, alignItems: 'center', background: i % 2 === 0 ? '#fff' : '#fff9f9' }}>
                            <span style={{ fontWeight: 700, color: '#dc2626' }}>Row {d.rowNum}</span>
                            <span style={{ color: '#64748b' }}>Row {d.originalRow}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300, color: '#334155' }}>
                              {(d.data[0] ?? '').toString().slice(0, 60) || <em style={{ color: '#94a3b8' }}>(empty)</em>}
                            </span>
                          </div>
                        ))}
                      </div>
                      {analysis.duplicateRows.length > 10 && (
                        <button onClick={() => setShowAllDupes(!showAllDupes)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 16px', fontSize: 13, color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>
                          {showAllDupes ? 'Show fewer' : `Show all ${analysis.duplicateRows.length} duplicates`}
                        </button>
                      )}

                      {/* Preview of first duplicate pair */}
                      {analysis.duplicateRows.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview: first duplicate pair</p>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                              <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                  <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}></th>
                                  {cleanHeaders.slice(0, 8).map(h => (
                                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</th>
                                  ))}
                                  {cleanHeaders.length > 8 && <th style={{ padding: '8px 10px', color: '#94a3b8', fontStyle: 'italic' }}>+{cleanHeaders.length - 8} more</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const first = analysis.duplicateRows[0];
                                  const origIdx = first.originalRow - 2;
                                  const dupeIdx = first.rowNum - 2;
                                  const origRow = rows[origIdx] ?? [];
                                  const dupeRow = rows[dupeIdx] ?? [];
                                  return (
                                    <>
                                      <tr style={{ background: '#f0fdf4' }}>
                                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0', fontSize: 11 }}>Row {first.originalRow} (original)</td>
                                        {origRow.slice(0, 8).map((v, i) => <td key={i} style={{ padding: '8px 10px', color: '#334155', borderBottom: '1px solid #e2e8f0', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</td>)}
                                        {cleanHeaders.length > 8 && <td />}
                                      </tr>
                                      <tr style={{ background: '#fef2f2' }}>
                                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0', fontSize: 11 }}>Row {first.rowNum} (duplicate)</td>
                                        {dupeRow.slice(0, 8).map((v, i) => <td key={i} style={{ padding: '8px 10px', color: '#334155', borderBottom: '1px solid #e2e8f0', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</td>)}
                                        {cleanHeaders.length > 8 && <td />}
                                      </tr>
                                    </>
                                  );
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* DUPLICATE COLUMNS tab */}
              {tab === 'columns' && (
                <div>
                  {dupeColCount === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                      <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 4px' }}>No duplicate columns found</p>
                      <p style={{ color: '#64748b', fontSize: 13 }}>Every column in this CSV has unique content across all {cleanRows.length.toLocaleString()} rows.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#d97706' }}>{dupeColCount} duplicate {dupeColCount === 1 ? 'column' : 'columns'} found</p>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>These columns contain identical values across every row. The second column in each pair is the redundant one.</p>
                        </div>
                        {!removedCols && (
                          <button onClick={removeCols} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#d97706', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                            Remove Redundant Columns
                          </button>
                        )}
                        {removedCols && <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 999, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>✓ Removed</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {analysis.duplicateColumns.map((d, i) => (
                          <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 8 }}>&quot;{d.colA}&quot;</span>
                            <span style={{ color: '#64748b', fontSize: 13 }}>has identical content to</span>
                            <span style={{ background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 8 }}>&quot;{d.colB}&quot;</span>
                            <span style={{ color: '#94a3b8', fontSize: 12 }}>column {d.indexB + 1} is redundant</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* DUPLICATE HEADERS tab */}
              {tab === 'headers' && (
                <div>
                  {dupeHdrCount === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                      <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 4px' }}>No duplicate column headers found</p>
                      <p style={{ color: '#64748b', fontSize: 13 }}>All {cleanHeaders.length} column names are unique.</p>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>{dupeHdrCount} duplicate header {dupeHdrCount === 1 ? 'name' : 'names'} detected</p>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                        Duplicate header names will cause errors when importing into SQL databases, Power BI or pandas, because column names must be unique. Rename them before importing.
                      </p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: '#f5f3ff' }}>
                              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#7c3aed', fontWeight: 700 }}>Header name</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#7c3aed', fontWeight: 700 }}>Column position</th>
                              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#7c3aed', fontWeight: 700 }}>Problem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysis.duplicateHeaders.map((h, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#faf5ff' }}>
                                <td style={{ padding: '10px 14px', fontWeight: 700, color: '#7c3aed' }}>&quot;{h.name}&quot;</td>
                                <td style={{ padding: '10px 14px', color: '#475569' }}>Column {h.index + 1}</td>
                                <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 12 }}>Appears more than once. Rename to make unique.</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ marginTop: 16, padding: '12px 16px', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 10 }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#7c3aed' }}>
                          <strong>How to fix:</strong> Open the original CSV in a text editor, rename the duplicate header to something unique (e.g. add &quot;_2&quot; or a more descriptive name), and re-upload to confirm.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* DATA PREVIEW tab */}
              {tab === 'preview' && (
                <div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>Showing first 20 rows of the current data ({cleanRows.length.toLocaleString()} rows total after any removals).</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 400 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>#</th>
                          {cleanHeaders.slice(0, 10).map(h => (
                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                          {cleanHeaders.length > 10 && <th style={{ padding: '8px 10px', color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>+{cleanHeaders.length - 10} more</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {cleanRows.slice(0, 20).map((row, ri) => (
                          <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '7px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>{ri + 2}</td>
                            {cleanHeaders.slice(0, 10).map((_, ci) => (
                              <td key={ci} style={{ padding: '7px 10px', color: '#334155', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {(row[ci] ?? '')}
                              </td>
                            ))}
                            {cleanHeaders.length > 10 && <td />}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* ── SEO Content ──────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>

          {/* How to use */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>How to use</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>How to Find Duplicate Rows in a CSV File</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
              This tool checks your CSV for three types of duplicates: duplicate rows, duplicate column contents and duplicate column headers.
              All three are checked simultaneously when you upload your file. No formulas, no pandas, no Excel needed.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
              {[
                { step: '1', icon: '📂', title: 'Upload your CSV',       desc: 'Click or drag your CSV file onto the upload area. Only CSV files are accepted. Your file is read locally nothing is sent to any server.' },
                { step: '2', icon: '🔍', title: 'Review the findings',   desc: 'Three tabs show you duplicate rows (with exact row numbers), duplicate columns (identical content) and duplicate headers. Each issue type has its own count.' },
                { step: '3', icon: '🗑️', title: 'Remove with one click', desc: 'Click "Remove All Duplicates" to strip every duplicate row, keeping only the first occurrence of each. Or remove redundant columns. Preview the data in the Data Preview tab.' },
                { step: '4', icon: '⬇', title: 'Download clean CSV',    desc: 'Click Download Clean CSV to save the deduplicated file. The filename includes "-deduplicated" so you can tell it apart from the original.' },
              ].map(s => (
                <div key={s.step} style={{ background: '#f8fafc', borderRadius: 14, padding: '20px 18px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 10, right: 14, fontSize: 38, fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>{s.step}</div>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Three types explained */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>What this tool detects</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Three Types of CSV Duplicates That Break Your Data</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>
              Most duplicate checkers only find duplicate rows. This tool finds all three types each of which causes different downstream failures.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  icon: '🔁',
                  color: '#fef2f2',
                  border: '#fecaca',
                  accent: '#dc2626',
                  title: 'Duplicate Rows the most common problem',
                  body: `A duplicate row is a row where every column value exactly matches another row in the same file. The most common cause is data being exported twice from the same system, two CSV files from overlapping date ranges being combined, or an ETL pipeline that appended records without checking for existing ones. Even a 5% duplicate rate means every SUM in your dashboard is 5% too high, every COUNT is 5% inflated, and any rate calculated from those numbers is wrong. This tool identifies every duplicate row and shows you the exact row number of the duplicate and the row it matches.`,
                },
                {
                  icon: '📊',
                  color: '#fffbeb',
                  border: '#fde68a',
                  accent: '#d97706',
                  title: 'Duplicate Columns silent redundancy',
                  body: `A duplicate column is a column where every cell value is identical to every cell value in another column throughout the entire file. This happens when the same field was exported twice under different names, or when a join operation produced two copies of the same foreign key. Duplicate columns waste storage, inflate file size and cause errors in database imports that require unique column names. pandas will silently add a suffix to duplicate column names, which breaks any downstream code that references them by name. This tool compares column contents across all rows and flags every column pair with identical values.`,
                },
                {
                  icon: '🏷️',
                  color: '#faf5ff',
                  border: '#e9d5ff',
                  accent: '#7c3aed',
                  title: 'Duplicate Headers structural errors',
                  body: `A duplicate header is a column name that appears more than once in the first row of the CSV. This is a structural problem that breaks most data tools before they even read a single data row. SQL databases raise errors immediately if two columns share a name. pandas silently renames them, breaking any code that references the column by name. Power BI may fail to load the file or produce incorrect results. The CSV format allows duplicate headers because it has no enforcement mechanism, so the error only surfaces when you try to use the file. This tool reports every duplicate header name and its column position so you can rename them before importing.`,
                },
              ].map(t => (
                <div key={t.title} style={{ background: t.color, border: `1px solid ${t.border}`, borderRadius: 14, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.accent }}>{t.title}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{t.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why duplicates are invisible */}
          <div style={{ marginBottom: 56, background: 'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius: 18, padding: '36px 32px', color: '#fff' }}>
            <div style={{ display: 'inline-block', background: 'rgba(165,180,252,0.15)', border: '1px solid rgba(165,180,252,0.3)', color: '#a5b4fc', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>Why this matters</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 14px' }}>Why Duplicate Rows Are Invisible Until Something Breaks</h2>
            <p style={{ color: '#c7d2fe', lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
              When you open a CSV in Excel or any spreadsheet viewer, duplicate rows look identical to every other row. They occupy the correct column positions, contain valid-looking values and give no visible indication that they are a repeated copy. The only way to find them is systematic comparison of every row against every other row exactly what this tool does in milliseconds.
            </p>
            <p style={{ color: '#c7d2fe', lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
              Duplicate rows compound silently. A 3% duplicate rate in a customer table means 3% of your revenue calculations are double-counted. Loaded into a dashboard, this error is invisible in individual rows and only surfaces as a mysteriously high aggregate total. By the time a stakeholder notices the number looks wrong, the data has already influenced business decisions.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              {[
                ['🔍', 'Exact row numbers', 'Know exactly which rows to verify or delete in the original source'],
                ['⚡', 'Millisecond analysis', 'String hashing compares all rows in one pass regardless of file size'],
                ['🔒', 'Browser-only', 'Financial data, client records, PII all safe to upload'],
                ['↩', 'Undoable', 'Reset to the original data at any time without re-uploading'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 12px' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#e0e7ff' }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#a5b4fc', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>FAQ</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 28px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['How does the comparison work?', 'Every row is converted to a normalised string key by joining all column values with a separator. The comparison is case-insensitive and trims leading and trailing whitespace. Two rows with "Apple" and " apple " would be flagged as duplicates. Values must otherwise match exactly: "100" and "100.0" would not match unless stored identically in the CSV.'],
                ['What if I only want to check specific columns for duplicates?', 'This tool checks all columns simultaneously to find complete row-level duplicates. If you want to deduplicate based on a subset of columns for example, finding customers with the same email regardless of how the name is spelled the best approach is to use this tool to first remove obvious complete duplicates, then export the result and use the CSV to SQL tool to write a SELECT DISTINCT query on just the columns you care about.'],
                ['Can I undo the duplicate removal?', 'Yes. Click the Reset button to restore your original data exactly as uploaded. The tool keeps a copy of the original in memory. Note: this only works within the same browser session. If you reload the page the original is gone, which is why the Download button is available both before and after removal.'],
                ['Why does my SQL import still fail after using this tool?', 'If duplicate headers are the problem, this tool will have flagged them in the Headers tab. Rename those headers in the original file before re-importing. If duplicate rows are not the issue, check the TOOLBeans Data Quality Checker tool which also detects null values, type mismatches and statistical outliers that can cause SQL import failures.'],
                ['How is this different from the TOOLBeans Data Profiler?', 'The CSV Duplicate Finder is a focused, single-purpose tool. It does one thing: finds and removes duplicate rows, columns and headers. It supports CSV files only. The Data Profiler is a broader tool that covers null values, type mismatches, outliers, column statistics and an overall quality score across CSV, Excel, JSON and REST API data. Use this tool when you specifically need to check for and remove duplicates. Use the Data Profiler when you need a full pre-load data quality audit.'],
                ['Is there a row or file size limit?', 'No. All rows in your file are analysed. The duplicate detection uses a hash-based O(n) algorithm that processes each row once, so it handles very large files without slowing down exponentially. For extremely large files over several hundred thousand rows, processing takes a few seconds on an average device.'],
              ].map(([q, a], i) => (
                <details key={i} style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {q} <span style={{ color: '#6366f1', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>+</span>
                  </summary>
                  <div style={{ padding: '0 18px 14px', fontSize: 14, color: '#64748b', lineHeight: 1.7, borderTop: '1px solid #f1f5f9' }}>{a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Related tools */}
          <div>
            <div style={{ display: 'inline-block', background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>Related tools</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>More Free Data Quality Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
              {[
                ['📊', 'Data Profiler',        '/tools/data-profiler',         'Full quality report: nulls, types, outliers, duplicates'],
                ['🗄️', 'CSV to SQL',            '/tools/csv-to-sql',             'Convert cleaned CSV to SQL INSERT statements'],
                ['{}', 'JSON Formatter',        '/tools/json-formatter',         'Validate and format JSON data'],
                ['📝', 'CSV Null Value Checker','/tools/csv-null-value-checker', 'Find every missing value by column'],
                ['📈', 'Find Outliers in Data', '/tools/find-outliers-in-data',  'Detect statistical outliers using 3-sigma rule'],
                ['↔️', 'Diff Checker',          '/tools/diff-checker',           'Compare two text files and highlight differences'],
              ].map(([icon, name, href, desc]) => (
                <a key={href} href={href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}