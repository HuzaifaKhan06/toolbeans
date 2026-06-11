'use client';
// tools/CsvNullValueCheckerTool.jsx
// Path: toolbeans/tools/CsvNullValueCheckerTool.jsx
//
// STANDALONE tool  finds null/empty/null-like values in CSV files,
// shows fill rate per column, and fills or drops missing data.
// Entirely browser-based. Papa Parse loaded from CDN.

import { useState, useRef, useMemo, useCallback } from 'react';

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

// ── Null-like text patterns (the key differentiator) ──────
const NULL_LIKE = new Set([
  'null', 'na', 'n/a', 'none', 'nan', '-', '--', '#n/a', '#null!',
  'undefined', '(blank)', '(empty)', 'missing', 'nil', 'unknown', 'tbd', '?', 'n.a.', 'n.a',
]);

function isMissing(value, treatNullLike) {
  const v = (value ?? '').toString().trim();
  if (v === '') return true;
  if (treatNullLike && NULL_LIKE.has(v.toLowerCase())) return true;
  return false;
}

// ── Core analysis ──────────────────────────────────────────
function analyseData(rows, headers, treatNullLike) {
  const totalRows = rows.length;

  const columns = headers.map((h, ci) => {
    let nullCount = 0;
    const nullRows = [];
    const numericValues = [];
    const freq = new Map();

    rows.forEach((row, ri) => {
      const raw = row[ci];
      if (isMissing(raw, treatNullLike)) {
        nullCount++;
        nullRows.push(ri + 2); // +2: row 1 is header
      } else {
        const v = (raw ?? '').toString().trim();
        const cleanedNum = Number(v.replace(/,/g, ''));
        if (v !== '' && !isNaN(cleanedNum)) numericValues.push(cleanedNum);
        freq.set(v, (freq.get(v) || 0) + 1);
      }
    });

    const fillRate = totalRows > 0 ? ((totalRows - nullCount) / totalRows) * 100 : 100;
    const isNumeric = numericValues.length > 0 && numericValues.length >= (totalRows - nullCount) * 0.6;
    const mean = numericValues.length > 0
      ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
      : null;

    let mode = null, modeCount = 0;
    for (const [val, cnt] of freq) {
      if (cnt > modeCount) { mode = val; modeCount = cnt; }
    }

    return { name: h, index: ci, nullCount, fillRate, nullRows, isNumeric, mean, mode };
  });

  const totalCells = totalRows * headers.length;
  const totalNulls = columns.reduce((s, c) => s + c.nullCount, 0);
  const completeness = totalCells > 0 ? ((totalCells - totalNulls) / totalCells) * 100 : 100;
  const columnsWithNulls = columns.filter(c => c.nullCount > 0).length;

  return { columns, totalNulls, completeness, totalRows, columnsWithNulls };
}

// ── Color helpers ───────────────────────────────────────────
function fillColor(rate) {
  if (rate >= 99.999) return { bg: '#0ea5e9', text: '#0369a1', light: '#f0f9ff', border: '#bae6fd' }; // full = sky
  if (rate >= 95)     return { bg: '#22c55e', text: '#16a34a', light: '#f0fdf4', border: '#bbf7d0' }; // good = green
  if (rate >= 70)     return { bg: '#f59e0b', text: '#d97706', light: '#fffbeb', border: '#fde68a' }; // warn = amber
  return                     { bg: '#ef4444', text: '#dc2626', light: '#fef2f2', border: '#fecaca' }; // bad = red
}

// ── Main component ────────────────────────────────────────
export default function CsvNullValueCheckerTool() {
  const [fileName, setFileName]     = useState('');
  const [headers, setHeaders]       = useState([]);
  const [origRows, setOrigRows]     = useState([]);
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [tab, setTab]               = useState('overview');
  const [treatNullLike, setTreatNullLike] = useState(false);
  const [selectedCol, setSelectedCol]     = useState(0);
  const [customFill, setCustomFill]       = useState('');
  const [edited, setEdited]               = useState(false);
  const fileInputRef = useRef(null);

  // ── Parse file ──────────────────────────────────────────
  const parseFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file (.csv). For Excel files, export as CSV first or use the Data Profiler tool.');
      return;
    }
    setLoading(true);
    setError('');
    setEdited(false);
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
        setOrigRows(dataRows);
        setRows(dataRows);
        setSelectedCol(0);
        setTab('overview');
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

  // ── Live analysis (recomputes on every rows/toggle change) ──
  const analysis = useMemo(() => {
    if (headers.length === 0) return null;
    return analyseData(rows, headers, treatNullLike);
  }, [rows, headers, treatNullLike]);

  const col = analysis?.columns?.[selectedCol];

  // ── Cleaning actions ──────────────────────────────────────
  const fillColumnWith = (value) => {
    setRows(prev => prev.map(row => {
      if (!isMissing(row[selectedCol], treatNullLike)) return row;
      const next = [...row];
      next[selectedCol] = value;
      return next;
    }));
    setEdited(true);
  };

  const dropRowsForColumn = () => {
    setRows(prev => prev.filter(row => !isMissing(row[selectedCol], treatNullLike)));
    setEdited(true);
  };

  const dropAllRowsWithNulls = () => {
    setRows(prev => prev.filter(row => !headers.some((_, ci) => isMissing(row[ci], treatNullLike))));
    setEdited(true);
  };

  const reset = () => {
    setRows(origRows);
    setEdited(false);
    setCustomFill('');
  };

  // ── Download cleaned CSV ──────────────────────────────────
  const downloadCSV = () => {
    const lines = [headers.join(',')];
    rows.forEach(row => {
      lines.push(headers.map((_, i) => {
        const v = (row[i] ?? '').toString();
        return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.csv', '') + '-filled.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Rows that would be dropped by global action (preview count) ──
  const dropAllPreviewCount = useMemo(() => {
    if (!analysis) return 0;
    return rows.filter(row => headers.some((_, ci) => isMissing(row[ci], treatNullLike))).length;
  }, [rows, headers, treatNullLike, analysis]);

  const hasFile = headers.length > 0 && !loading;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#0c2d48 60%,#0f172a 100%)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a>
            <span>/</span>
            <a href="/tools" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tools</a>
            <span>/</span>
            <span style={{ color: '#cbd5e1' }}>CSV Null Value Checker</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.28)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 15 }}>⬜</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7dd3fc' }}>CSV Null Value Checker</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4.5vw,44px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
            Find Null and Missing Values<br />
            <span style={{ background: 'linear-gradient(90deg,#38bdf8,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>by Column in Any CSV</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 580, margin: '0 0 24px', lineHeight: 1.7 }}>
            Upload a CSV and instantly see fill rate and completeness for every column 
            including hidden missing data disguised as &quot;N/A&quot;, &quot;NULL&quot; or &quot;none&quot;.
            Fill or drop missing values and download the cleaned file.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['CSV files only', 'Detects NULL / N/A / none text', 'Fill rate per column', 'No upload to server', 'Free forever'].map(f => (
              <span key={f} style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.22)', color: '#bae6fd', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>✓ {f}</span>
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
            style={{ border: '2px dashed #bae6fd', borderRadius: 20, padding: '60px 28px', textAlign: 'center', cursor: 'pointer', background: '#fff', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.background = '#f0f9ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.background = '#fff'; }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>📂</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Drop your CSV file here</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>CSV files only  your file never leaves your browser</p>
            <button style={{ background: 'linear-gradient(135deg,#0ea5e9,#22d3ee)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Choose CSV File
            </button>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>Supports any CSV regardless of size. No row limit.</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin .8s linear infinite' }} />
            <p style={{ color: '#64748b' }}>Scanning for missing values…</p>
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
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 12, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>File</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{fileName}</p>
              </div>
              <div style={{ width: 1, height: 36, background: '#f1f5f9', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rows</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{rows.length.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Columns</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{headers.length}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Missing cells</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: analysis.totalNulls > 0 ? '#dc2626' : '#16a34a' }}>{analysis.totalNulls.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Completeness</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: fillColor(analysis.completeness).text }}>{analysis.completeness.toFixed(1)}%</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {edited && (
                  <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>↩ Reset</button>
                )}
                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer' }}>Open new file</button>
                <button onClick={downloadCSV} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#22d3ee)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⬇ Download Cleaned CSV</button>
              </div>
            </div>

            {/* Null-like text toggle  the differentiator */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: treatNullLike ? '#f0f9ff' : '#fff', border: `1px solid ${treatNullLike ? '#bae6fd' : '#e2e8f0'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, cursor: 'pointer' }}>
              <input type="checkbox" checked={treatNullLike} onChange={e => setTreatNullLike(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: '#0ea5e9', cursor: 'pointer', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0c4a6e' }}>Also detect &quot;null-like&quot; text as missing</p>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                  Treats cells containing <code style={{ background: '#e0f2fe', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>NULL</code>, <code style={{ background: '#e0f2fe', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>N/A</code>, <code style={{ background: '#e0f2fe', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>none</code>, <code style={{ background: '#e0f2fe', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>NaN</code>, <code style={{ background: '#e0f2fe', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>-</code> and similar placeholder text as missing data  not just truly empty cells.
                  {treatNullLike && <strong style={{ color: '#0369a1' }}> Currently ON  counts above include these.</strong>}
                </p>
              </div>
            </label>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #e2e8f0', borderBottom: 'none', background: '#f8fafc' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'details',  label: 'Null Details', count: analysis.columnsWithNulls },
                { id: 'clean',    label: 'Clean Data' },
                { id: 'preview',  label: 'Data Preview' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '13px 8px', border: 'none', borderBottom: tab === t.id ? '2px solid #0ea5e9' : '2px solid transparent', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#0284c7' : '#64748b', fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {t.label}
                  {t.count !== undefined && (
                    <span style={{ background: t.count > 0 ? '#fef2f2' : '#f0fdf4', color: t.count > 0 ? '#dc2626' : '#16a34a', border: `1px solid ${t.count > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: 24, marginBottom: 20 }}>

              {/* OVERVIEW tab  fill rate bars */}
              {tab === 'overview' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '14px 18px', background: fillColor(analysis.completeness).light, border: `1px solid ${fillColor(analysis.completeness).border}`, borderRadius: 12 }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: fillColor(analysis.completeness).text }}>{analysis.completeness.toFixed(1)}%</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Overall completeness</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                        {analysis.totalNulls === 0
                          ? 'No missing values detected  this dataset is fully complete.'
                          : `${analysis.totalNulls.toLocaleString()} missing cell${analysis.totalNulls === 1 ? '' : 's'} across ${analysis.columnsWithNulls} of ${headers.length} column${headers.length === 1 ? '' : 's'}.`}
                      </p>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fill rate by column</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {analysis.columns.map(c => {
                      const fc = fillColor(c.fillRate);
                      return (
                        <div key={c.index}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{c.name}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: fc.text }}>{c.fillRate.toFixed(1)}% {c.nullCount > 0 && <span style={{ color: '#94a3b8', fontWeight: 400 }}>({c.nullCount} missing)</span>}</span>
                          </div>
                          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${c.fillRate}%`, background: fc.bg, borderRadius: 999, transition: 'width .3s' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* NULL DETAILS tab */}
              {tab === 'details' && (
                <div>
                  {analysis.columnsWithNulls === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                      <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 4px' }}>No missing values found</p>
                      <p style={{ color: '#64748b', fontSize: 13 }}>
                        Every cell across all {headers.length} columns and {rows.length.toLocaleString()} rows contains a value
                        {treatNullLike ? ' (including null-like text checks).' : '. Try enabling "Detect null-like text" to check for hidden placeholders like N/A.'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {analysis.columns.filter(c => c.nullCount > 0).map(c => {
                        const fc = fillColor(c.fillRate);
                        const shown = c.nullRows.slice(0, 12);
                        return (
                          <div key={c.index} style={{ background: fc.light, border: `1px solid ${fc.border}`, borderRadius: 12, padding: '14px 18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{c.name}</span>
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>column {c.index + 1}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                                <span style={{ color: fc.text, fontWeight: 700 }}>{c.fillRate.toFixed(1)}% filled</span>
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>{c.nullCount} missing</span>
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                              Affected row{c.nullCount === 1 ? '' : 's'}: {shown.map(r => `Row ${r}`).join(', ')}
                              {c.nullRows.length > 12 && ` and ${c.nullRows.length - 12} more`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* CLEAN DATA tab */}
              {tab === 'clean' && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step 1  Choose a column</p>
                    <select value={selectedCol} onChange={e => { setSelectedCol(Number(e.target.value)); setCustomFill(''); }} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, color: '#1e293b', background: '#fff' }}>
                      {analysis.columns.map(c => (
                        <option key={c.index} value={c.index}>
                          {c.name} {c.nullCount > 0 ? ` ${c.nullCount} missing (${c.fillRate.toFixed(1)}% filled)` : ' complete'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {col && (
                    <>
                      {col.nullCount === 0 ? (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                          <p style={{ margin: 0, fontSize: 13, color: '#16a34a', fontWeight: 700 }}>✅ &quot;{col.name}&quot; has no missing values  nothing to clean.</p>
                        </div>
                      ) : (
                        <div style={{ marginBottom: 20 }}>
                          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step 2  Fill {col.nullCount} missing value{col.nullCount === 1 ? '' : 's'} in &quot;{col.name}&quot;</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginBottom: 12 }}>
                            <button onClick={() => fillColumnWith('0')} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Fill with 0</p>
                              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>For numeric columns where missing = none</p>
                            </button>
                            {col.isNumeric && col.mean !== null && (
                              <button onClick={() => fillColumnWith(String(Math.round(col.mean * 100) / 100))} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Fill with mean</p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Average = {(Math.round(col.mean * 100) / 100).toLocaleString()}</p>
                              </button>
                            )}
                            {col.mode !== null && (
                              <button onClick={() => fillColumnWith(col.mode)} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Fill with most common</p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Mode = &quot;{col.mode}&quot;</p>
                              </button>
                            )}
                            <button onClick={dropRowsForColumn} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', textAlign: 'left' }}>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#dc2626' }}>Drop these {col.nullCount} row{col.nullCount === 1 ? '' : 's'}</p>
                              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Removes rows missing &quot;{col.name}&quot;</p>
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input value={customFill} onChange={e => setCustomFill(e.target.value)} placeholder="Or type a custom fill value…" style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }} />
                            <button onClick={() => customFill !== '' && fillColumnWith(customFill)} disabled={customFill === ''} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: customFill === '' ? '#e2e8f0' : '#0ea5e9', color: '#fff', fontSize: 13, fontWeight: 700, cursor: customFill === '' ? 'default' : 'pointer' }}>Fill</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Global drop-all action */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
                    <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Or  global action</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: dropAllPreviewCount > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${dropAllPreviewCount > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: '14px 18px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: dropAllPreviewCount > 0 ? '#dc2626' : '#16a34a' }}>
                          {dropAllPreviewCount > 0
                            ? `Drop all rows with ANY missing value`
                            : 'No rows contain missing values'}
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>
                          {dropAllPreviewCount > 0
                            ? `This will remove ${dropAllPreviewCount.toLocaleString()} of ${rows.length.toLocaleString()} rows, leaving ${(rows.length - dropAllPreviewCount).toLocaleString()} fully complete rows.`
                            : 'Nothing to drop  every row is fully populated.'}
                        </p>
                      </div>
                      {dropAllPreviewCount > 0 && (
                        <button onClick={dropAllRowsWithNulls} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Drop {dropAllPreviewCount.toLocaleString()} Rows
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DATA PREVIEW tab */}
              {tab === 'preview' && (
                <div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                    Showing first 20 of {rows.length.toLocaleString()} rows. Missing cells are highlighted.
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 400 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>#</th>
                          {headers.slice(0, 10).map((h, ci) => (
                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {h}
                              {analysis.columns[ci]?.nullCount > 0 && <span style={{ marginLeft: 6, fontSize: 10, color: '#dc2626' }}>●</span>}
                            </th>
                          ))}
                          {headers.length > 10 && <th style={{ padding: '8px 10px', color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>+{headers.length - 10} more</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 20).map((row, ri) => (
                          <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: ri % 2 === 0 ? '#fff' : '#f8fafc' }}>
                            <td style={{ padding: '7px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>{ri + 2}</td>
                            {headers.slice(0, 10).map((_, ci) => {
                              const missing = isMissing(row[ci], treatNullLike);
                              return (
                                <td key={ci} style={{ padding: '7px 10px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: missing ? '#fef2f2' : 'transparent', color: missing ? '#dc2626' : '#334155', fontStyle: missing ? 'italic' : 'normal' }}>
                                  {missing ? `(${(row[ci] ?? '').toString().trim() || 'empty'})` : row[ci]}
                                </td>
                              );
                            })}
                            {headers.length > 10 && <td />}
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
            <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0284c7', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>How to use</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>How to Find Null Values in a CSV File</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
              This tool checks every cell in your CSV for missing data, including hidden placeholder text that looks like a value but represents nothing.
              No formulas, no pandas, no Excel COUNTBLANK needed.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
              {[
                { step: '1', icon: '📂', title: 'Upload your CSV',     desc: 'Click or drag your CSV file onto the upload area. Only CSV files are accepted. Your file is read locally  nothing is sent to any server.' },
                { step: '2', icon: '📊', title: 'Check the overview',  desc: 'See overall completeness and a fill rate bar for every column. Green is complete, amber is mostly complete, red needs attention.' },
                { step: '3', icon: '🔎', title: 'Toggle null-like text', desc: 'Enable "Detect null-like text" to also catch cells containing NULL, N/A, none, NaN or "-"  values that look filled but mean nothing.' },
                { step: '4', icon: '🧹', title: 'Fill, drop, download', desc: 'In Clean Data, fill missing values with zero, mean, mode or custom text  or drop incomplete rows. Then download the cleaned CSV.' },
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

          {/* What counts as null  the differentiator section */}
          <div style={{ marginBottom: 56, background: 'linear-gradient(135deg,#0c2d48,#0c4a6e)', borderRadius: 18, padding: '36px 32px', color: '#fff' }}>
            <div style={{ display: 'inline-block', background: 'rgba(125,211,252,0.15)', border: '1px solid rgba(125,211,252,0.3)', color: '#7dd3fc', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>The hidden problem</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 14px' }}>Why &quot;100% Filled&quot; Columns Often Aren&apos;t</h2>
            <p style={{ color: '#bae6fd', lineHeight: 1.7, marginBottom: 16, fontSize: 14 }}>
              Most null checkers  including basic spreadsheet formulas like COUNTBLANK  only catch cells that are <em>literally</em> empty.
              But real-world CSVs exported from CRMs, forms, APIs and legacy systems are full of cells that contain text specifically meaning &quot;no value&quot;: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>NULL</code>, <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>N/A</code>, <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>none</code>, <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>NaN</code>, <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>-</code>, <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>undefined</code>.
            </p>
            <p style={{ color: '#bae6fd', lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
              A column showing 100% fill rate by a basic check can still be functionally empty in 15% of rows if those rows contain the literal text &quot;N/A&quot;.
              When that column is loaded into Power BI as a numeric measure, those text values either break the import or get silently coerced to zero  corrupting your averages without any error message.
              The &quot;Detect null-like text&quot; toggle in this tool reveals exactly this gap, recalculating fill rates in real time so you see the true picture.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              {[
                ['🔲', 'Truly empty', 'Cell has zero characters  the obvious case every tool catches'],
                ['␣', 'Whitespace only', 'Looks empty visually but contains a space or tab character'],
                ['🏷️', 'Null-like text', 'Cells containing NULL, N/A, none, NaN, -, undefined and similar'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 12px' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#e0f2fe' }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#bae6fd', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why missing values break things + 4 ways to handle */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>Why this matters</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Why Missing Values Break Downstream Systems</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 16, lineHeight: 1.7 }}>
              A SQL import that hits a null in a NOT NULL column rejects the row or the whole file depending on the database. A Power BI measure summing a column with nulls returns a blank. A model trained on incomplete data either errors out or learns from corrupted patterns. The fill rate percentage tells you not just whether the problem exists, but how severe it is  a column at 99% has a trivial gap, while a column at 45% has a structural collection problem upstream.
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Four ways to handle missing values, all available in the Clean Data tab</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
              {[
                { icon: '0️⃣', title: 'Fill with Zero', desc: 'Replaces missing values with 0. Best for numeric counts or quantities where missing genuinely means none.' },
                { icon: '📐', title: 'Fill with Mean',  desc: 'Replaces missing values with the column average. A standard imputation technique for continuous numeric data.' },
                { icon: '🏷️', title: 'Fill with Mode',  desc: 'Replaces missing values with the most common value in that column. Works for any data type, ideal for categorical fields.' },
                { icon: '✏️', title: 'Custom or Drop',  desc: 'Type any custom fill text (e.g. "Unknown"), or drop rows entirely  either for one column or any row with any gap.' },
              ].map(o => (
                <div key={o.title} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '16px 14px' }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{o.icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{o.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{o.desc}</p>
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
                ['What exactly counts as a missing value?', 'By default: cells that are completely empty or contain only whitespace. Enable "Detect null-like text" to also count cells containing NULL, N/A, n/a, none, NaN, -, --, #N/A, undefined, nil, unknown, TBD and similar placeholder text  case-insensitively.'],
                ['Why did my completeness score change when I toggled "Detect null-like text"?', "That's the point. If your data was exported from a system that writes literal \"N/A\" or \"NULL\" text instead of leaving cells empty, the basic check sees those as filled. Toggling the option recalculates every fill rate to reveal the true completeness  often surfacing problems that were completely invisible before."],
                ['Can I fill different columns with different strategies?', 'Yes. Select a column from the dropdown in Clean Data, choose a fill method just for that column, then select the next column and repeat. Each action applies only to the currently selected column.'],
                ['What happens if I fill a text column with "mean"?', 'The "Fill with mean" option only appears for columns where most values are numeric. For text columns, use "Fill with most common value" (mode) or type a custom value instead.'],
                ['Can I undo my changes?', 'Yes. Click Reset at any time to restore the file exactly as it was when uploaded. This works for any number of fill or drop actions performed in the same session.'],
                ['How is this different from the TOOLBeans Data Profiler?', 'This tool is purpose-built for one job: finding and fixing missing values in CSV files, including hidden null-like text that basic checks miss, with per-column fill strategies (zero, mean, mode, custom). The Data Profiler is broader  it covers duplicates, type mismatches, outliers and an overall quality score across CSV, Excel, JSON and API data, but does not offer the null-like text detection or per-column fill workflow this tool provides.'],
              ].map(([q, a], i) => (
                <details key={i} style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {q} <span style={{ color: '#0ea5e9', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>+</span>
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
                ['📊', 'Data Profiler',          '/tools/data-profiler',          'Full quality report: nulls, types, outliers, duplicates'],
                ['🔁', 'Find Duplicates in CSV',  '/tools/find-duplicates-in-csv', 'Detect and remove duplicate rows, columns, headers'],
                ['🗄️', 'CSV to SQL',              '/tools/csv-to-sql',             'Convert cleaned CSV to SQL INSERT statements'],
                ['{}', 'JSON Formatter',          '/tools/json-formatter',         'Validate and format JSON data'],
                ['📈', 'Find Outliers in Data',   '/tools/find-outliers-in-data',  'Detect statistical outliers using 3-sigma rule'],
                ['↔️', 'Diff Checker',            '/tools/diff-checker',           'Compare two text files and highlight differences'],
              ].map(([icon, name, href, desc]) => (
                <a key={href} href={href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.borderColor = '#bae6fd'; }}
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