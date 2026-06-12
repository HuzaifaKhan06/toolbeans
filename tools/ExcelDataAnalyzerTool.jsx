'use client';
// tools/ExcelDataAnalyzerTool.jsx
// Path: toolbeans/tools/ExcelDataAnalyzerTool.jsx
//
// STANDALONE tool  reads .xlsx/.xls via SheetJS (different library
// and file format from every other CSV-only tool in the family).
// Detects all sheets in the workbook with a selector; computes a full
// descriptive-statistics table per column (count, distinct, min, max,
// mean, median, mode, std dev, sum); shows a condensed Issues Summary
// (duplicates / low-fill / type mismatches / outliers) that cross-
// links to the dedicated CSV tools for deep cleanup; exports XLSX/CSV.

import { useState, useRef, useMemo, useCallback } from 'react';

// ── Load SheetJS from CDN ──────────────────────────────────
let xlsxLoaded = false;
function loadXLSX() {
  return new Promise((resolve) => {
    if (xlsxLoaded || (typeof window !== 'undefined' && window.XLSX)) {
      xlsxLoaded = true;
      return resolve(window.XLSX);
    }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => { xlsxLoaded = true; resolve(window.XLSX); };
    document.head.appendChild(s);
  });
}

// ── Numeric helpers ─────────────────────────────────────────
function cleanNumeric(v) {
  return v.replace(/,/g, '').replace(/^\$/, '').replace(/%$/, '').trim();
}
function isNumericStr(v) {
  const c = cleanNumeric(v);
  return c !== '' && !isNaN(Number(c));
}

// ── Descriptive statistics: count, distinct, min/max/mean/median/mode/stdDev/sum ──
function computeStats(numericVals) {
  if (numericVals.length === 0) return null;
  const sorted = [...numericVals].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const variance = sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  // mode
  const freq = new Map();
  let modeVal = sorted[0], modeCount = 0;
  numericVals.forEach(v => { const c = (freq.get(v) || 0) + 1; freq.set(v, c); if (c > modeCount) { modeCount = c; modeVal = v; } });
  return { min: sorted[0], max: sorted[n - 1], mean, median, mode: modeVal, hasMode: modeCount > 1, stdDev, sum, count: n };
}

// 3-sigma outlier info (condensed: count + first example only)
function outlierInfo(numericVals, stats) {
  if (numericVals.length < 4 || !stats || stats.stdDev === 0) return { count: 0, example: null };
  const flagged = numericVals
    .map(v => ({ value: v, sigma: Math.abs(v - stats.mean) / stats.stdDev }))
    .filter(o => o.sigma > 3)
    .sort((a, b) => b.sigma - a.sigma);
  return { count: flagged.length, example: flagged[0] || null };
}

// type mismatch info (condensed: count + first example only)
function mismatchInfo(nonNullStrs, isNumeric) {
  if (!isNumeric) return { count: 0, example: null };
  const bad = nonNullStrs.filter(v => !isNumericStr(v));
  return { count: bad.length, example: bad[0] || null };
}

// ── Per-sheet analysis ──────────────────────────────────────
function analyseSheet(rows, headers) {
  const totalRows = rows.length;

  const columns = headers.map((h, ci) => {
    let nullCount = 0;
    const nonNull = [];
    rows.forEach(row => {
      const raw = (row[ci] ?? '').toString().trim();
      if (raw === '') nullCount++; else nonNull.push(raw);
    });

    const fillRate = totalRows > 0 ? ((totalRows - nullCount) / totalRows) * 100 : 100;
    const distinctCount = new Set(nonNull.map(v => v.toLowerCase())).size;

    let numericMatch = 0;
    const numericVals = [];
    nonNull.forEach(v => { if (isNumericStr(v)) { numericMatch++; numericVals.push(Number(cleanNumeric(v))); } });
    const isNumeric = nonNull.length > 0 && numericMatch / nonNull.length >= 0.7;

    const stats = isNumeric ? computeStats(numericVals) : null;
    const mismatch = mismatchInfo(nonNull, isNumeric);
    const outlier = isNumeric ? outlierInfo(numericVals, stats) : { count: 0, example: null };

    let textMode = null;
    if (!isNumeric && nonNull.length > 0) {
      const freq = new Map(); let best = null, bestC = 0;
      nonNull.forEach(v => { const c = (freq.get(v) || 0) + 1; freq.set(v, c); if (c > bestC) { bestC = c; best = v; } });
      textMode = bestC > 1 ? best : null;
    }

    return {
      name: h, index: ci, fillRate, nullCount, count: nonNull.length, distinctCount,
      isNumeric, stats, textMode, exampleValue: nonNull[0] || '',
      mismatchCount: mismatch.count, mismatchExample: mismatch.example,
      outlierCount: outlier.count, outlierExample: outlier.example,
    };
  });

  // Duplicate rows (full-row, case-insensitive, trimmed)
  const seen = new Set();
  let duplicateCount = 0;
  const duplicateRowIndexes = new Set();
  rows.forEach((row, i) => {
    const key = headers.map((_, ci) => (row[ci] ?? '').toString().trim().toLowerCase()).join('||');
    if (seen.has(key)) { duplicateCount++; duplicateRowIndexes.add(i); }
    else seen.add(key);
  });

  return { totalRows, totalColumns: headers.length, columns, duplicateCount, duplicateRowIndexes };
}

// ── Color helper ─────────────────────────────────────────────
function rateColor(rate) {
  if (rate >= 95) return { text: '#15803d', bg: '#22c55e', light: '#f0fdf4', border: '#bbf7d0' };
  if (rate >= 70) return { text: '#a16207', bg: '#eab308', light: '#fefce8', border: '#fef08a' };
  return             { text: '#dc2626', bg: '#ef4444', light: '#fef2f2', border: '#fecaca' };
}
const fmt = (n, d = 2) => n === null || n === undefined ? '' : n.toLocaleString(undefined, { maximumFractionDigits: d });

// ── Main component ─────────────────────────────────────────
export default function ExcelDataAnalyzerTool() {
  const [fileName, setFileName]   = useState('');
  const [sheetNames, setSheetNames] = useState([]);
  const [sheets, setSheets]       = useState({}); // { [name]: { headers, rows, origRows } }
  const [activeSheet, setActiveSheet] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [tab, setTab]             = useState('stats');
  const fileInputRef = useRef(null);

  // ── Parse workbook ────────────────────────────────────────
  const parseFile = useCallback(async (file) => {
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError('Please upload an Excel file (.xlsx or .xls). For CSV files, use the Find Duplicates, Null Value Checker or Data Quality Checker tools.');
      return;
    }
    setLoading(true);
    setError('');
    setFileName(file.name);

    try {
      const XLSX = await loadXLSX();
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const parsed = {};
          workbook.SheetNames.forEach(name => {
            const ws = workbook.Sheets[name];
            const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
            if (!json || json.length === 0) return;
            const headers = (json[0] || []).map((h, i) => { const s = String(h ?? '').trim(); return s === '' ? `Column ${i + 1}` : s; });
            const rows = json.slice(1)
              .map(r => { const row = [...r]; while (row.length < headers.length) row.push(''); return row.slice(0, headers.length).map(c => String(c ?? '')); })
              .filter(r => r.some(c => c.trim() !== ''));
            parsed[name] = { headers, rows, origRows: rows };
          });
          const names = Object.keys(parsed);
          if (names.length === 0) {
            setError('No data found in this workbook. Every sheet appears empty.');
            setLoading(false);
            return;
          }
          setSheets(parsed);
          setSheetNames(names);
          setActiveSheet(names[0]);
          setTab('stats');
          setLoading(false);
        } catch (err) {
          setError('Could not read this file. Make sure it is a valid .xlsx or .xls workbook.');
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch {
      setError('Could not load the Excel parser. Check your connection and try again.');
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) parseFile(f); e.target.value = ''; };
  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) parseFile(f); };

  const current = sheets[activeSheet];
  const analysis = useMemo(() => current ? analyseSheet(current.rows, current.headers) : null, [current]);
  const edited = current ? current.rows.length !== current.origRows.length : false;

  // ── Actions ───────────────────────────────────────────────
  const removeDuplicates = () => {
    if (!current) return;
    const seen = new Set();
    const next = current.rows.filter(row => {
      const key = current.headers.map((_, ci) => (row[ci] ?? '').toString().trim().toLowerCase()).join('||');
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    setSheets(prev => ({ ...prev, [activeSheet]: { ...prev[activeSheet], rows: next } }));
  };

  const reset = () => {
    if (!current) return;
    setSheets(prev => ({ ...prev, [activeSheet]: { ...prev[activeSheet], rows: prev[activeSheet].origRows } }));
  };

  const downloadXLSX = async () => {
    if (!current) return;
    const XLSX = await loadXLSX();
    const ws = XLSX.utils.aoa_to_sheet([current.headers, ...current.rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeSheet.slice(0, 31) || 'Sheet1');
    XLSX.writeFile(wb, fileName.replace(/\.(xlsx|xls)$/i, '') + '-' + activeSheet.replace(/[^a-z0-9]/gi, '_') + '-analyzed.xlsx');
  };

  const downloadCSV = () => {
    if (!current) return;
    const lines = [current.headers.join(',')];
    current.rows.forEach(row => {
      lines.push(current.headers.map((_, i) => {
        const v = (row[i] ?? '').toString();
        return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.(xlsx|xls)$/i, '') + '-' + activeSheet.replace(/[^a-z0-9]/gi, '_') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasFile = sheetNames.length > 0 && !loading;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#052e16 60%,#0f172a 100%)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a>
            <span>/</span>
            <a href="/tools" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tools</a>
            <span>/</span>
            <span style={{ color: '#cbd5e1' }}>Excel Data Analyzer</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 15 }}>📗</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#86efac' }}>Excel Data Analyzer</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4.5vw,44px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
            Analyze Every Sheet in an<br />
            <span style={{ background: 'linear-gradient(90deg,#4ade80,#a3e635)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Excel File  No Excel Needed</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 580, margin: '0 0 24px', lineHeight: 1.7 }}>
            Upload a .xlsx or .xls file. Every sheet is detected automatically  switch between
            them to get a full statistics table (count, distinct, min, max, mean, median, mode,
            std dev, sum) plus duplicates, missing values and outliers, instantly.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['XLSX and XLS supported', 'Multi-sheet detection', 'Full statistics table', 'No upload to server', 'Free forever'].map(f => (
              <span key={f} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)', color: '#bbf7d0', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>✓ {f}</span>
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
            style={{ border: '2px dashed #bbf7d0', borderRadius: 20, padding: '60px 28px', textAlign: 'center', cursor: 'pointer', background: '#fff', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.background = '#f0fdf4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#bbf7d0'; e.currentTarget.style.background = '#fff'; }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>📗</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Drop your Excel file here</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>.xlsx and .xls files  your file never leaves your browser</p>
            <button style={{ background: 'linear-gradient(135deg,#16a34a,#84cc16)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Choose Excel File
            </button>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>Multi-sheet workbooks supported. No row limit.</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin .8s linear infinite' }} />
            <p style={{ color: '#64748b' }}>Reading workbook…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#dc2626', fontSize: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>⚠️</span> {error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18 }}>×</button>
          </div>
        )}

        {hasFile && current && analysis && (
          <>
            {/* Sheet selector  the multi-sheet differentiator */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {sheetNames.length > 1 ? `${sheetNames.length} sheets detected  select one to analyze` : '1 sheet detected'}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sheetNames.map(name => {
                  const s = sheets[name];
                  const active = name === activeSheet;
                  return (
                    <button key={name} onClick={() => setActiveSheet(name)} style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${active ? '#16a34a' : '#e2e8f0'}`, background: active ? '#16a34a' : '#fff', color: active ? '#fff' : '#475569', fontSize: 13, fontWeight: active ? 700 : 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      📄 {name} <span style={{ fontSize: 11, opacity: 0.8 }}>({s.rows.length.toLocaleString()} × {s.headers.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary bar */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>File</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1e293b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</p>
              </div>
              <div style={{ width: 1, height: 36, background: '#f1f5f9', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rows × Cols</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{analysis.totalRows.toLocaleString()} × {analysis.totalColumns}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duplicates</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: analysis.duplicateCount > 0 ? '#dc2626' : '#15803d' }}>{analysis.duplicateCount.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Numeric cols</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{analysis.columns.filter(c => c.isNumeric).length} / {analysis.totalColumns}</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {edited && (
                  <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>↩ Reset sheet</button>
                )}
                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer' }}>Open new file</button>
                <button onClick={downloadCSV} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⬇ CSV</button>
                <button onClick={downloadXLSX} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#16a34a,#84cc16)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>⬇ Download XLSX</button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #e2e8f0', borderBottom: 'none', background: '#f8fafc' }}>
              {[
                { id: 'stats',   label: 'Column Statistics' },
                { id: 'issues',  label: 'Issues Summary', count: analysis.duplicateCount + analysis.columns.filter(c => c.fillRate < 70 || c.mismatchCount > 0 || c.outlierCount > 0).length },
                { id: 'preview', label: 'Data Preview' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '13px 8px', border: 'none', borderBottom: tab === t.id ? '2px solid #16a34a' : '2px solid transparent', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#15803d' : '#64748b', fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {t.label}
                  {t.count !== undefined && (
                    <span style={{ background: t.count > 0 ? '#fef2f2' : '#f0fdf4', color: t.count > 0 ? '#dc2626' : '#16a34a', border: `1px solid ${t.count > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: 24, marginBottom: 20 }}>

              {/* COLUMN STATISTICS  the headline feature */}
              {tab === 'stats' && (
                <div>
                  {analysis.totalRows === 0 ? (
                    <p style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>This sheet has headers but no data rows.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
                        <thead>
                          <tr style={{ background: '#f0fdf4' }}>
                            {['Column', 'Type', 'Count', 'Distinct', 'Nulls', 'Fill %', 'Min', 'Max', 'Mean', 'Median', 'Mode', 'Std Dev', 'Sum'].map(h => (
                              <th key={h} style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#15803d', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.columns.map((c, i) => {
                            const fc = rateColor(c.fillRate);
                            const s = c.stats;
                            return (
                              <tr key={c.index} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</td>
                                <td style={{ padding: '8px 10px' }}><span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{c.isNumeric ? 'numeric' : 'text'}</span></td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{c.count.toLocaleString()}</td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{c.distinctCount.toLocaleString()}</td>
                                <td style={{ padding: '8px 10px', color: c.nullCount > 0 ? '#dc2626' : '#94a3b8' }}>{c.nullCount.toLocaleString()}</td>
                                <td style={{ padding: '8px 10px', color: fc.text, fontWeight: 700 }}>{c.fillRate.toFixed(1)}%</td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{s ? fmt(s.min) : ''}</td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{s ? fmt(s.max) : ''}</td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{s ? fmt(s.mean) : ''}</td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{s ? fmt(s.median) : ''}</td>
                                <td style={{ padding: '8px 10px', color: '#334155', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s ? (s.hasMode ? fmt(s.mode) : '') : (c.textMode ? `"${c.textMode}"` : '')}</td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{s ? fmt(s.stdDev) : ''}</td>
                                <td style={{ padding: '8px 10px', color: '#334155' }}>{s ? fmt(s.sum, 0) : ''}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>
                    &quot;Mode&quot; shows &quot;&quot; when every value in a column is unique (no repeated value exists). Numeric detection requires at least 70% of a column&apos;s values to parse as numbers (commas, $ and % are handled).
                  </p>
                </div>
              )}

              {/* ISSUES SUMMARY  condensed, cross-links to dedicated tools */}
              {tab === 'issues' && (() => {
                const lowFill = analysis.columns.filter(c => c.fillRate < 70);
                const mismatchCols = analysis.columns.filter(c => c.mismatchCount > 0);
                const outlierCols = analysis.columns.filter(c => c.outlierCount > 0);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Duplicates */}
                    <div style={{ background: analysis.duplicateCount > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${analysis.duplicateCount > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: analysis.duplicateCount > 0 ? '#dc2626' : '#16a34a' }}>
                          {analysis.duplicateCount > 0 ? `🔁 ${analysis.duplicateCount.toLocaleString()} duplicate row${analysis.duplicateCount === 1 ? '' : 's'} found` : '✅ No duplicate rows'}
                        </p>
                        {analysis.duplicateCount > 0 && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#64748b' }}>For full duplicate-column and header detection too, export as CSV and use <a href="/tools/find-duplicates-in-csv" style={{ color: '#16a34a', fontWeight: 600 }}>Find Duplicates in CSV</a>.</p>}
                      </div>
                      {analysis.duplicateCount > 0 && <button onClick={removeDuplicates} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>Remove Duplicates</button>}
                    </div>

                    {/* Low fill columns */}
                    <div style={{ background: lowFill.length > 0 ? '#fefce8' : '#f0fdf4', border: `1px solid ${lowFill.length > 0 ? '#fef08a' : '#bbf7d0'}`, borderRadius: 12, padding: '14px 18px' }}>
                      {lowFill.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>✅ All columns are at least 70% complete</p>
                      ) : (
                        <>
                          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#a16207' }}>⬜ {lowFill.length} column{lowFill.length === 1 ? '' : 's'} below 70% fill rate</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {lowFill.map(c => <span key={c.index} style={{ fontSize: 12, background: '#fef9c3', color: '#854d0e', padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}>{c.name}: {c.fillRate.toFixed(1)}%</span>)}
                          </div>
                          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>To fill or drop these, export as CSV and use the <a href="/tools/csv-null-value-checker" style={{ color: '#16a34a', fontWeight: 600 }}>CSV Null Value Checker</a>.</p>
                        </>
                      )}
                    </div>

                    {/* Type mismatches */}
                    <div style={{ background: mismatchCols.length > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${mismatchCols.length > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: '14px 18px' }}>
                      {mismatchCols.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>✅ No type inconsistencies detected</p>
                      ) : (
                        <>
                          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>🔢 {mismatchCols.length} column{mismatchCols.length === 1 ? '' : 's'} with mixed data types</p>
                          {mismatchCols.map(c => (
                            <p key={c.index} style={{ margin: '2px 0', fontSize: 12, color: '#64748b' }}>
                              <strong style={{ color: '#1e293b' }}>{c.name}</strong>: {c.mismatchCount} non-numeric value{c.mismatchCount === 1 ? '' : 's'} (e.g. &quot;{c.mismatchExample}&quot;)
                            </p>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Outliers */}
                    <div style={{ background: outlierCols.length > 0 ? '#f0f9ff' : '#f0fdf4', border: `1px solid ${outlierCols.length > 0 ? '#bae6fd' : '#bbf7d0'}`, borderRadius: 12, padding: '14px 18px' }}>
                      {outlierCols.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>✅ No statistical outliers detected</p>
                      ) : (
                        <>
                          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#0284c7' }}>📊 {outlierCols.length} column{outlierCols.length === 1 ? '' : 's'} with 3σ outliers</p>
                          {outlierCols.map(c => (
                            <p key={c.index} style={{ margin: '2px 0', fontSize: 12, color: '#64748b' }}>
                              <strong style={{ color: '#1e293b' }}>{c.name}</strong>: {c.outlierCount} outlier{c.outlierCount === 1 ? '' : 's'} (e.g. {c.outlierExample.value.toLocaleString()}, {c.outlierExample.sigma.toFixed(1)}σ from mean)
                            </p>
                          ))}
                        </>
                      )}
                    </div>

                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                      For a full weighted 0–100 quality score combining all of these factors, export as CSV and use the <a href="/tools/data-quality-checker" style={{ color: '#16a34a', fontWeight: 600 }}>Data Quality Checker</a>.
                    </p>
                  </div>
                );
              })()}

              {/* DATA PREVIEW */}
              {tab === 'preview' && (
                <div>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                    Showing first 20 of {analysis.totalRows.toLocaleString()} rows in &quot;{activeSheet}&quot;. {analysis.duplicateCount > 0 && 'Duplicate rows highlighted.'}
                  </p>
                  {analysis.totalRows === 0 ? (
                    <p style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>This sheet has headers but no data rows.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 400 }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>#</th>
                            {current.headers.slice(0, 10).map(h => (
                              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                            {current.headers.length > 10 && <th style={{ padding: '8px 10px', color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>+{current.headers.length - 10} more</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {current.rows.slice(0, 20).map((row, ri) => {
                            const isDup = analysis.duplicateRowIndexes.has(ri);
                            return (
                              <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', background: isDup ? '#fef2f2' : (ri % 2 === 0 ? '#fff' : '#f8fafc') }}>
                                <td style={{ padding: '7px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 11 }}>{ri + 2}</td>
                                {current.headers.slice(0, 10).map((_, ci) => (
                                  <td key={ci} style={{ padding: '7px 10px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: isDup ? '#dc2626' : '#334155' }}>{row[ci]}</td>
                                ))}
                                {current.headers.length > 10 && <td />}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* ── SEO Content ──────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>

          {/* How to use */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>How to use</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>How to Analyze an Excel File Without Opening Excel</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
              This tool reads .xlsx and .xls files directly in your browser using SheetJS. No Excel, no Google Sheets, no installation.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
              {[
                { step: '1', icon: '📂', title: 'Upload your workbook', desc: 'Click or drag your .xlsx or .xls file onto the upload area. The file is read locally  nothing is sent to any server.' },
                { step: '2', icon: '📄', title: 'Pick a sheet',          desc: 'Every sheet in the workbook is detected and shown with its row and column count. Click any sheet to analyze it.' },
                { step: '3', icon: '📊', title: 'Review the statistics', desc: 'Column Statistics gives count, distinct, nulls, fill rate, min, max, mean, median, mode, std dev and sum  for every column, instantly.' },
                { step: '4', icon: '⬇', title: 'Fix and export',        desc: 'Remove duplicates with one click in Issues Summary, then download the sheet as XLSX or CSV.' },
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

          {/* Multi-sheet differentiator */}
          <div style={{ marginBottom: 56, background: 'linear-gradient(135deg,#052e16,#14532d)', borderRadius: 18, padding: '36px 32px', color: '#fff' }}>
            <div style={{ display: 'inline-block', background: 'rgba(134,239,172,0.15)', border: '1px solid rgba(134,239,172,0.3)', color: '#86efac', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>Built for real workbooks</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 14px' }}>Multiple Sheets? No Problem.</h2>
            <p style={{ color: '#bbf7d0', lineHeight: 1.7, marginBottom: 16, fontSize: 14 }}>
              Most &quot;analyze your spreadsheet online&quot; tools quietly read only the first sheet and ignore the rest  fine for a single export, useless for a real workbook with a &quot;Raw Data&quot; tab, a &quot;Summary&quot; tab and three regional breakdown tabs.
            </p>
            <p style={{ color: '#bbf7d0', lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
              This tool detects every sheet the moment your file loads and shows each one&apos;s row and column count immediately, so you can see at a glance which tab actually holds the data you care about. Click any sheet to switch  its statistics table, issue summary and data preview are computed independently, and switching back and forth preserves any cleanup you have done on each sheet separately.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              {[
                ['📄', 'Every sheet listed', 'Row × column counts shown for all sheets on upload'],
                ['🔄', 'Independent analysis', 'Switching sheets re-runs stats, issues and preview for that sheet only'],
                ['🧮', 'No formulas',          'Count, distinct, mean, median, mode, std dev, sum  computed instantly'],
                ['⬇', 'Per-sheet export',     'Download just the sheet you analyzed as XLSX or CSV'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 12px' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#dcfce7' }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#bbf7d0', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Excel vs This Tool comparison */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>Time saved</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>What This Tool Does That Takes Far Longer in Excel</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 22, lineHeight: 1.7 }}>
              Excel is built for data entry and manual analysis, not automated quality checking. Getting a full statistical picture of a dataset usually means writing several formulas per column or building a pivot table.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>Task</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#15803d', fontWeight: 700 }}>This Tool</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontWeight: 700 }}>In Excel</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Count, distinct, min, max, mean, median, mode, std dev, sum', 'Full table, automatic on upload', 'Up to 10 separate formulas per column'],
                    ['See null count per column',     'Shown automatically',  'COUNTBLANK formula per column'],
                    ['Find all duplicate rows',        'Instant, with one-click removal', 'Conditional formatting or Remove Duplicates tool'],
                    ['Switch between sheets',          'Click a sheet pill, re-analyzed instantly', 'Click each tab and re-run formulas'],
                    ['Detect type mismatches',          'Automatic, with example values', 'Not practical without VBA'],
                    ['Export results as XLSX or CSV',  'One click',             'Save As, choose format'],
                  ].map(([task, t, excel], i) => (
                    <tr key={task} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#334155' }}>{task}</td>
                      <td style={{ padding: '10px 14px', color: '#15803d', fontWeight: 600 }}>{t}</td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{excel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>FAQ</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 28px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Can I analyze an Excel file online without installing Excel?', 'Yes. This tool reads .xlsx and .xls files directly in your browser using SheetJS. No Excel, Google Sheets or other software is required. Upload your file and get sheet detection, column statistics, duplicate analysis and an issue summary immediately.'],
                ['Does this tool support Excel files with multiple sheets?', 'Yes  every sheet is detected on upload and listed with its row and column counts. Use the sheet selector to switch between sheets; each is parsed and analyzed independently with its own statistics table, issue summary and data preview.'],
                ['What column statistics does this tool calculate?', 'For every column: count, distinct value count, null count and fill rate. For columns where at least 70% of values are numeric: minimum, maximum, mean, median, mode, standard deviation and sum. For text columns, the most frequent value is shown where one exists.'],
                ['How does this compare to using Excel formulas like COUNTIF, COUNTBLANK and AVERAGE?', 'Replicating this statistics table in Excel requires up to ten formulas per column, or a pivot table with multiple value fields configured per column. This tool computes everything for every column the moment the file loads  no formulas, no helper columns.'],
                ['Does this tool also check for duplicates, missing values, type mismatches and outliers?', 'Yes, as condensed cards in Issues Summary: duplicate row count with one-click removal, columns below 70% fill rate, columns with type mismatches and their examples, and columns with 3-sigma outliers. For deep cleanup  multiple duplicate types, per-column null-filling, or a full 0-100 quality score  export as CSV and use the linked dedicated tools.'],
                ['Can I download the analyzed data as Excel or CSV?', 'Yes. Download XLSX writes the currently selected sheet back to a .xlsx file using SheetJS, including any duplicates you removed. Download CSV exports the same sheet as comma-separated text.'],
                ['Is my Excel file uploaded to a server?', 'No. The file is read as binary data directly in your browser and parsed locally with SheetJS. Nothing is transmitted anywhere, which makes this safe for confidential spreadsheets and financial models.'],
                ['Can I analyze very large Excel files or workbooks with many sheets?', 'There is no row limit per sheet and no limit on the number of sheets. All sheets are parsed on upload; full statistics are computed for one sheet at a time as you select it, keeping the tool responsive. Processing time depends on your device.'],
              ].map(([q, a], i) => (
                <details key={i} style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {q} <span style={{ color: '#16a34a', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>+</span>
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
                ['🔁', 'Find Duplicates in CSV', '/tools/find-duplicates-in-csv', 'Detect and remove duplicate rows, columns, headers'],
                ['⬜', 'CSV Null Value Checker', '/tools/csv-null-value-checker', 'Find and fill missing values column by column'],
                ['🏆', 'Data Quality Checker',   '/tools/data-quality-checker',   'Weighted 0-100 score, type mismatches, outliers'],
                ['📊', 'Data Profiler',          '/tools/data-profiler',          'Full analysis for CSV, Excel, JSON and APIs'],
                ['🗄️', 'CSV to SQL',              '/tools/csv-to-sql',             'Convert your exported CSV to SQL INSERT statements'],
                ['{}', 'JSON Formatter',          '/tools/json-formatter',         'Validate and format JSON data'],
              ].map(([icon, name, href, desc]) => (
                <a key={href} href={href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
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