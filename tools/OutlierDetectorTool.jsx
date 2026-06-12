'use client';
// tools/OutlierDetectorTool.jsx
// Path: toolbeans/tools/OutlierDetectorTool.jsx
//
// STANDALONE tool  dedicated outlier/distribution analysis. Two
// detection methods (3-sigma Z-score and IQR/Tukey) computed for
// every numeric column, with adjustable thresholds, an interactive
// CSS histogram with shaded outlier zones, and a CSS box plot (Q1,
// median, Q3, whiskers, outlier points). No removal button by design
//  investigate, don't auto-delete. CSV only, Papa Parse from CDN.

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

// ── Numeric helpers ─────────────────────────────────────────
function cleanNumeric(v) {
  return v.replace(/,/g, '').replace(/^\$/, '').replace(/%$/, '').trim();
}
function isNumericStr(v) {
  const c = cleanNumeric(v);
  return c !== '' && !isNaN(Number(c));
}
function percentile(sortedVals, p) {
  const idx = (sortedVals.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sortedVals[lo];
  return sortedVals[lo] + (sortedVals[hi] - sortedVals[lo]) * (idx - lo);
}
const fmt = (n, d = 2) => n === null || n === undefined ? '' : n.toLocaleString(undefined, { maximumFractionDigits: d });

// ── Per-column statistics (numeric columns only, needs >= 4 values) ──
function analyseColumns(rows, headers) {
  return headers.map((h, ci) => {
    let nullCount = 0;
    const nonNull = [];
    rows.forEach((row, ri) => {
      const raw = (row[ci] ?? '').toString().trim();
      if (raw === '') nullCount++; else nonNull.push({ value: raw, rowNum: ri + 2 });
    });

    let numericMatch = 0;
    const numericVals = []; // { value:number, rowNum }
    nonNull.forEach(v => { if (isNumericStr(v.value)) { numericMatch++; numericVals.push({ value: Number(cleanNumeric(v.value)), rowNum: v.rowNum }); } });
    const isNumeric = nonNull.length > 0 && numericMatch / nonNull.length >= 0.7;

    if (!isNumeric) return { name: h, index: ci, isNumeric: false, insufficient: false };
    if (numericVals.length < 4) return { name: h, index: ci, isNumeric: true, insufficient: true, count: numericVals.length };

    const sorted = [...numericVals].sort((a, b) => a.value - b.value);
    const vals = sorted.map(v => v.value);
    const n = vals.length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const q1 = percentile(vals, 0.25);
    const median = percentile(vals, 0.5);
    const q3 = percentile(vals, 0.75);
    const iqr = q3 - q1;

    return {
      name: h, index: ci, isNumeric: true, insufficient: false,
      mean, stdDev, q1, median, q3, iqr,
      min: vals[0], max: vals[n - 1], count: n,
      numericVals: sorted,
    };
  });
}

// ── Outlier bounds + flagged values for a given method/threshold ──
function getOutliers(col, method, threshold) {
  let lower, upper;
  if (method === 'sigma') {
    lower = col.mean - threshold * col.stdDev;
    upper = col.mean + threshold * col.stdDev;
  } else {
    lower = col.q1 - threshold * col.iqr;
    upper = col.q3 + threshold * col.iqr;
  }
  const outliers = col.numericVals
    .filter(v => v.value < lower || v.value > upper)
    .map(v => ({
      ...v,
      distance: method === 'sigma' ? Math.abs(v.value - col.mean) / (col.stdDev || 1) : (v.value < lower ? lower - v.value : v.value - upper),
      side: v.value < lower ? 'low' : 'high',
    }))
    .sort((a, b) => b.distance - a.distance);
  return { lower, upper, outliers };
}

// ── Histogram binning ────────────────────────────────────────
function buildHistogram(vals, min, max, bins = 14) {
  const range = (max - min) || 1;
  const binWidth = range / bins;
  const counts = new Array(bins).fill(0);
  vals.forEach(v => {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= bins) idx = bins - 1; if (idx < 0) idx = 0;
    counts[idx]++;
  });
  return counts.map((count, i) => ({ binStart: min + i * binWidth, binEnd: min + (i + 1) * binWidth, count }));
}

// ── Histogram visualization (CSS bars, outlier bins shaded red) ──
function Histogram({ col, lower, upper }) {
  const vals = col.numericVals.map(v => v.value);
  const bins = buildHistogram(vals, col.min, col.max, 14);
  const maxCount = Math.max(...bins.map(b => b.count), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 90, gap: 3 }}>
        {bins.map((bin, i) => {
          const isOutlierBin = bin.binEnd <= lower || bin.binStart >= upper;
          const h = (bin.count / maxCount) * 100;
          return (
            <div key={i} title={`${fmt(bin.binStart)} to ${fmt(bin.binEnd)}: ${bin.count} value${bin.count === 1 ? '' : 's'}`}
              style={{ flex: 1, height: `${Math.max(h, bin.count > 0 ? 4 : 0)}%`, background: isOutlierBin ? '#fca5a5' : '#c4b5fd', borderRadius: '3px 3px 0 0', minHeight: bin.count > 0 ? 3 : 0 }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
        <span>{fmt(col.min)}</span>
        <span>{fmt(col.max)}</span>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: '#64748b' }}>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#c4b5fd', borderRadius: 2, marginRight: 5, verticalAlign: 'middle' }} />Normal range</span>
        <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fca5a5', borderRadius: 2, marginRight: 5, verticalAlign: 'middle' }} />Outlier zone</span>
      </div>
    </div>
  );
}

// ── Box plot visualization (CSS, Q1/median/Q3/whiskers/outlier dots) ──
function BoxPlot({ col, lower, upper, outliers }) {
  const { min, max, q1, median, q3 } = col;
  const range = (max - min) || 1;
  const pct = v => Math.max(0, Math.min(100, ((v - min) / range) * 100));
  const nonOutlierVals = col.numericVals.map(v => v.value).filter(v => v >= lower && v <= upper);
  const whiskerLow = nonOutlierVals.length ? Math.min(...nonOutlierVals) : q1;
  const whiskerHigh = nonOutlierVals.length ? Math.max(...nonOutlierVals) : q3;
  return (
    <div style={{ position: 'relative', height: 64, marginTop: 26, marginBottom: 30 }}>
      {/* whisker line */}
      <div style={{ position: 'absolute', top: 32, left: `${pct(whiskerLow)}%`, width: `${Math.max(pct(whiskerHigh) - pct(whiskerLow), 0)}%`, height: 2, background: '#94a3b8' }} />
      {/* whisker caps */}
      <div style={{ position: 'absolute', top: 20, left: `${pct(whiskerLow)}%`, width: 2, height: 24, background: '#94a3b8' }} />
      <div style={{ position: 'absolute', top: 20, left: `${pct(whiskerHigh)}%`, width: 2, height: 24, background: '#94a3b8' }} />
      {/* IQR box */}
      <div style={{ position: 'absolute', top: 12, left: `${pct(q1)}%`, width: `${Math.max(pct(q3) - pct(q1), 0.6)}%`, height: 40, background: '#ede9fe', border: '2px solid #8b5cf6', borderRadius: 4 }} />
      {/* median line */}
      <div style={{ position: 'absolute', top: 12, left: `${pct(median)}%`, width: 2, height: 40, background: '#7c3aed' }} />
      {/* outlier dots */}
      {outliers.map((o, i) => (
        <div key={i} title={`Row ${o.rowNum}: ${fmt(o.value)}`}
          style={{ position: 'absolute', top: 27, left: `${pct(o.value)}%`, width: 9, height: 9, marginLeft: -4.5, borderRadius: '50%', background: '#dc2626', border: '2px solid #fff', boxShadow: '0 0 0 1px #fca5a5' }} />
      ))}
      {/* axis labels */}
      <div style={{ position: 'absolute', bottom: -18, left: 0, fontSize: 11, color: '#94a3b8' }}>min {fmt(min)}</div>
      <div style={{ position: 'absolute', bottom: -18, left: `${pct(q1)}%`, fontSize: 11, color: '#8b5cf6', transform: 'translateX(-10%)' }}>Q1 {fmt(q1)}</div>
      <div style={{ position: 'absolute', bottom: -18, left: `${pct(median)}%`, fontSize: 11, color: '#7c3aed', fontWeight: 700, transform: 'translateX(-50%)' }}>median {fmt(median)}</div>
      <div style={{ position: 'absolute', bottom: -18, left: `${pct(q3)}%`, fontSize: 11, color: '#8b5cf6', transform: 'translateX(-10%)' }}>Q3 {fmt(q3)}</div>
      <div style={{ position: 'absolute', bottom: -18, right: 0, fontSize: 11, color: '#94a3b8' }}>max {fmt(max)}</div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function OutlierDetectorTool() {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders]   = useState([]);
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [tab, setTab]           = useState('overview');
  const [selectedCol, setSelectedCol] = useState(null); // index into headers
  const [method, setMethod]     = useState('sigma'); // 'sigma' | 'iqr'
  const [sigmaThreshold, setSigmaThreshold] = useState(3);
  const [iqrMultiplier, setIqrMultiplier]   = useState(1.5);
  const [copied, setCopied]     = useState(false);
  const fileInputRef = useRef(null);

  // ── Parse file ──────────────────────────────────────────
  const parseFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file (.csv). For Excel files, export as CSV first or use the Excel Data Analyzer tool.');
      return;
    }
    setLoading(true);
    setError('');
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
        setRows(dataRows);
        setSelectedCol(null);
        setTab('overview');
        setMethod('sigma'); setSigmaThreshold(3); setIqrMultiplier(1.5);
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

  // ── Analysis ──────────────────────────────────────────────
  const columns = useMemo(() => headers.length === 0 ? [] : analyseColumns(rows, headers), [rows, headers]);
  const numericCols = useMemo(() => columns.filter(c => c.isNumeric && !c.insufficient), [columns]);
  const excludedCols = useMemo(() => columns.filter(c => !c.isNumeric || c.insufficient), [columns]);

  // pick a default selected column once data loads
  const activeCol = useMemo(() => {
    if (selectedCol !== null) return numericCols.find(c => c.index === selectedCol) || null;
    return numericCols[0] || null;
  }, [selectedCol, numericCols]);

  const threshold = method === 'sigma' ? sigmaThreshold : iqrMultiplier;
  const bounds = useMemo(() => activeCol ? getOutliers(activeCol, method, threshold) : null, [activeCol, method, threshold]);

  // Default-3σ outlier index for Data Preview highlighting
  const previewOutlierMap = useMemo(() => {
    const map = new Map(); // colIndex -> Set(rowIndex)
    numericCols.forEach(c => {
      const b = getOutliers(c, 'sigma', 3);
      map.set(c.index, new Set(b.outliers.map(o => o.rowNum - 2)));
    });
    return map;
  }, [numericCols]);
  const totalDefaultOutliers = useMemo(() => {
    let n = 0; previewOutlierMap.forEach(set => n += set.size); return n;
  }, [previewOutlierMap]);

  const copyRowNumbers = () => {
    if (!bounds) return;
    const nums = bounds.outliers.map(o => o.rowNum).join(', ');
    navigator.clipboard.writeText(nums).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };

  const hasFile = headers.length > 0 && !loading;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#3b0764 60%,#0f172a 100%)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a>
            <span>/</span>
            <a href="/tools" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tools</a>
            <span>/</span>
            <span style={{ color: '#cbd5e1' }}>Find Outliers in Data</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.28)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 15 }}>📉</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d8b4fe' }}>Outlier Detector</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4.5vw,44px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
            Find Outliers Two Ways <br />
            <span style={{ background: 'linear-gradient(90deg,#c084fc,#e879f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>3-Sigma and IQR, Side by Side</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 580, margin: '0 0 24px', lineHeight: 1.7 }}>
            Upload a CSV and compare two outlier definitions per column, with adjustable thresholds
            and an interactive histogram and box plot. Every flagged value shows its row number 
            nothing is removed automatically.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['3-Sigma + IQR methods', 'Adjustable thresholds', 'Histogram + box plot', 'No upload to server', 'Free forever'].map(f => (
              <span key={f} style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)', color: '#e9d5ff', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>✓ {f}</span>
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
            style={{ border: '2px dashed #e9d5ff', borderRadius: 20, padding: '60px 28px', textAlign: 'center', cursor: 'pointer', background: '#fff', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.background = '#faf5ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.background = '#fff'; }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>📂</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Drop your CSV file here</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>CSV files only  your file never leaves your browser</p>
            <button style={{ background: 'linear-gradient(135deg,#8b5cf6,#c026d3)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Choose CSV File
            </button>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>Numeric columns need at least 4 values to be analyzed.</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#a855f7', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin .8s linear infinite' }} />
            <p style={{ color: '#64748b' }}>Computing distributions…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#dc2626', fontSize: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>⚠️</span> {error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 18 }}>×</button>
          </div>
        )}

        {hasFile && (
          <>
            {/* Summary bar */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>File</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1e293b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</p>
              </div>
              <div style={{ width: 1, height: 36, background: '#f1f5f9', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rows</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{rows.length.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Numeric cols</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{numericCols.length} / {headers.length}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Outliers (3σ default)</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: totalDefaultOutliers > 0 ? '#9333ea' : '#16a34a' }}>{totalDefaultOutliers.toLocaleString()}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer' }}>Open new file</button>
              </div>
            </div>

            {numericCols.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📉</div>
                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 4px' }}>No analyzable numeric columns found</p>
                <p style={{ color: '#64748b', fontSize: 13, maxWidth: 440, margin: '0 auto' }}>
                  Outlier detection needs columns where at least 70% of values are numeric and at least 4 such values exist.
                  {excludedCols.length > 0 && ` Found ${excludedCols.length} column${excludedCols.length === 1 ? '' : 's'} that didn't qualify: ${excludedCols.map(c => c.name).join(', ')}.`}
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #e2e8f0', borderBottom: 'none', background: '#f8fafc' }}>
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'detail',   label: 'Column Detail' },
                    { id: 'preview',  label: 'Data Preview' },
                  ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '13px 8px', border: 'none', borderBottom: tab === t.id ? '2px solid #a855f7' : '2px solid transparent', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#9333ea' : '#64748b', fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: 24, marginBottom: 20 }}>

                  {/* OVERVIEW  compact stats table for all numeric columns */}
                  {tab === 'overview' && (
                    <div>
                      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>
                        Outlier counts shown at default thresholds (3σ and 1.5×IQR). Click a row to inspect it in Column Detail with adjustable thresholds, histogram and box plot.
                      </p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 760 }}>
                          <thead>
                            <tr style={{ background: '#faf5ff' }}>
                              {['Column', 'Mean', 'Median', 'Std Dev', 'Q1', 'Q3', 'IQR', '3σ Outliers', 'IQR Outliers (1.5×)'].map(h => (
                                <th key={h} style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#9333ea', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {numericCols.map((c, i) => {
                              const s3 = getOutliers(c, 'sigma', 3);
                              const iq = getOutliers(c, 'iqr', 1.5);
                              const active = activeCol && activeCol.index === c.index;
                              return (
                                <tr key={c.index} onClick={() => { setSelectedCol(c.index); setTab('detail'); }}
                                  style={{ borderBottom: '1px solid #f1f5f9', background: active ? '#faf5ff' : (i % 2 === 0 ? '#fff' : '#f8fafc'), cursor: 'pointer' }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                                  onMouseLeave={e => e.currentTarget.style.background = active ? '#faf5ff' : (i % 2 === 0 ? '#fff' : '#f8fafc')}>
                                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#1e293b' }}>{c.name}</td>
                                  <td style={{ padding: '8px 10px', color: '#334155' }}>{fmt(c.mean)}</td>
                                  <td style={{ padding: '8px 10px', color: '#334155' }}>{fmt(c.median)}</td>
                                  <td style={{ padding: '8px 10px', color: '#334155' }}>{fmt(c.stdDev)}</td>
                                  <td style={{ padding: '8px 10px', color: '#334155' }}>{fmt(c.q1)}</td>
                                  <td style={{ padding: '8px 10px', color: '#334155' }}>{fmt(c.q3)}</td>
                                  <td style={{ padding: '8px 10px', color: '#334155' }}>{fmt(c.iqr)}</td>
                                  <td style={{ padding: '8px 10px' }}><span style={{ background: s3.outliers.length > 0 ? '#f5f3ff' : '#f0fdf4', color: s3.outliers.length > 0 ? '#9333ea' : '#16a34a', padding: '2px 9px', borderRadius: 999, fontWeight: 700 }}>{s3.outliers.length}</span></td>
                                  <td style={{ padding: '8px 10px' }}><span style={{ background: iq.outliers.length > 0 ? '#f5f3ff' : '#f0fdf4', color: iq.outliers.length > 0 ? '#9333ea' : '#16a34a', padding: '2px 9px', borderRadius: 999, fontWeight: 700 }}>{iq.outliers.length}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {excludedCols.length > 0 && (
                        <p style={{ margin: '14px 0 0', fontSize: 12, color: '#94a3b8' }}>
                          {excludedCols.length} column{excludedCols.length === 1 ? '' : 's'} excluded (not numeric or fewer than 4 numeric values): {excludedCols.map(c => c.name).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* COLUMN DETAIL  adjustable method/threshold, histogram, box plot, outlier list */}
                  {tab === 'detail' && activeCol && bounds && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
                        <select value={activeCol.index} onChange={e => setSelectedCol(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, color: '#1e293b', background: '#fff' }}>
                          {numericCols.map(c => <option key={c.index} value={c.index}>{c.name}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                          <span style={{ color: '#64748b' }}>3σ: <strong style={{ color: '#9333ea' }}>{getOutliers(activeCol, 'sigma', 3).outliers.length}</strong></span>
                          <span style={{ color: '#64748b' }}>IQR(1.5×): <strong style={{ color: '#9333ea' }}>{getOutliers(activeCol, 'iqr', 1.5).outliers.length}</strong></span>
                          <span style={{ color: '#64748b' }}>n = <strong style={{ color: '#1e293b' }}>{activeCol.count}</strong></span>
                        </div>
                      </div>

                      {/* Method + threshold controls */}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                          {[['sigma', '3-Sigma (Z-score)'], ['iqr', 'IQR (Tukey)']].map(([id, label]) => (
                            <button key={id} onClick={() => setMethod(id)} style={{ padding: '8px 16px', border: 'none', background: method === id ? '#8b5cf6' : '#fff', color: method === id ? '#fff' : '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{label}</button>
                          ))}
                        </div>
                        {method === 'sigma' ? (
                          <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                            {[2.0, 2.5, 3.0, 3.5].map(t => (
                              <button key={t} onClick={() => setSigmaThreshold(t)} style={{ padding: '8px 14px', border: 'none', background: sigmaThreshold === t ? '#ede9fe' : '#fff', color: sigmaThreshold === t ? '#7c3aed' : '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderLeft: t !== 2.0 ? '1px solid #e2e8f0' : 'none' }}>{t}σ</button>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                            {[[1.5, '1.5× (outliers)'], [3.0, '3× (extreme)']].map(([t, label]) => (
                              <button key={t} onClick={() => setIqrMultiplier(t)} style={{ padding: '8px 14px', border: 'none', background: iqrMultiplier === t ? '#ede9fe' : '#fff', color: iqrMultiplier === t ? '#7c3aed' : '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer', borderLeft: t !== 1.5 ? '1px solid #e2e8f0' : 'none' }}>{label}</button>
                            ))}
                          </div>
                        )}
                        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          Bounds: <strong style={{ color: '#9333ea' }}>{fmt(bounds.lower)}</strong> to <strong style={{ color: '#9333ea' }}>{fmt(bounds.upper)}</strong>
                        </div>
                      </div>

                      {/* Histogram */}
                      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Distribution</p>
                      <Histogram col={activeCol} lower={bounds.lower} upper={bounds.upper} />

                      {/* Box plot */}
                      <p style={{ margin: '32px 0 8px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Box Plot</p>
                      <BoxPlot col={activeCol} lower={bounds.lower} upper={bounds.upper} outliers={bounds.outliers} />

                      {/* Outlier list */}
                      <div style={{ marginTop: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Flagged values ({bounds.outliers.length})
                          </p>
                          {bounds.outliers.length > 0 && (
                            <button onClick={copyRowNumbers} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e9d5ff', background: copied ? '#8b5cf6' : '#faf5ff', color: copied ? '#fff' : '#7c3aed', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              {copied ? '✓ Copied!' : '📋 Copy Row Numbers'}
                            </button>
                          )}
                        </div>
                        {bounds.outliers.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>No values fall outside {fmt(bounds.lower)} – {fmt(bounds.upper)} at this threshold.</p>
                          </div>
                        ) : (
                          <div style={{ border: '1px solid #e9d5ff', borderRadius: 10, overflow: 'hidden', maxHeight: 280, overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 100px', background: '#faf5ff', padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#9333ea', position: 'sticky', top: 0 }}>
                              <span>Row</span><span>Value</span><span>Side</span><span>{method === 'sigma' ? 'σ from mean' : 'Distance'}</span>
                            </div>
                            {bounds.outliers.map((o, i) => (
                              <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 100px', padding: '7px 14px', fontSize: 13, borderTop: '1px solid #f3e8ff', background: i % 2 === 0 ? '#fff' : '#fdfaff' }}>
                                <span style={{ fontWeight: 700, color: '#9333ea' }}>Row {o.rowNum}</span>
                                <span style={{ color: '#334155' }}>{o.value.toLocaleString()}</span>
                                <span style={{ color: o.side === 'low' ? '#0284c7' : '#dc2626' }}>{o.side === 'low' ? '↓ low' : '↑ high'}</span>
                                <span style={{ color: '#64748b' }}>{method === 'sigma' ? `${o.distance.toFixed(1)}σ` : fmt(o.distance)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DATA PREVIEW  outlier cells highlighted at default 3σ */}
                  {tab === 'preview' && (
                    <div>
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                        Showing first 20 of {rows.length.toLocaleString()} rows. Cells shaded purple are 3σ outliers (default threshold) in a numeric column.
                      </p>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 400 }}>
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontWeight: 600, fontSize: 11 }}>#</th>
                              {headers.slice(0, 10).map((h, ci) => (
                                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {h}{previewOutlierMap.has(ci) && <span style={{ marginLeft: 6, fontSize: 10, color: '#9333ea' }}>●</span>}
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
                                  const isOutlier = previewOutlierMap.get(ci)?.has(ri);
                                  return <td key={ci} style={{ padding: '7px 10px', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: isOutlier ? '#f5f3ff' : 'transparent', color: isOutlier ? '#9333ea' : '#334155', fontWeight: isOutlier ? 700 : 400 }}>{row[ci]}</td>;
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
            <div style={{ display: 'inline-block', background: '#f3e8ff', color: '#9333ea', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>How to use</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>How to Find Outliers in a CSV File</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
              This tool calculates both standard outlier definitions for every numeric column and lets you explore each one visually.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
              {[
                { step: '1', icon: '📂', title: 'Upload your CSV',     desc: 'Click or drag your CSV file onto the upload area. Your file is read locally  nothing is sent to any server.' },
                { step: '2', icon: '📋', title: 'Scan the overview',   desc: 'Every numeric column is listed with mean, median, std dev, quartiles and outlier counts from both methods at default thresholds.' },
                { step: '3', icon: '🔬', title: 'Drill into a column', desc: 'Column Detail shows a histogram and box plot. Switch between 3-Sigma and IQR, and adjust the threshold to see the shape change live.' },
                { step: '4', icon: '📋', title: 'Investigate, not delete', desc: 'Copy the flagged row numbers and check each one in your original file. Decide case by case whether to fix, keep, or remove.' },
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

          {/* Two ways to define an outlier  the differentiator */}
          <div style={{ marginBottom: 56, background: 'linear-gradient(135deg,#3b0764,#581c87)', borderRadius: 18, padding: '36px 32px', color: '#fff' }}>
            <div style={{ display: 'inline-block', background: 'rgba(216,180,254,0.15)', border: '1px solid rgba(216,180,254,0.3)', color: '#d8b4fe', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>Two definitions, one tool</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 14px' }}>Two Ways to Define an Outlier  And Why They Disagree</h2>
            <p style={{ color: '#e9d5ff', lineHeight: 1.7, marginBottom: 16, fontSize: 14 }}>
              The <strong>3-sigma (Z-score)</strong> method assumes your data is roughly bell-shaped and asks &quot;how many standard deviations from the mean is this value?&quot; It is simple and widely taught, but the mean and standard deviation are themselves dragged around by extreme values  one massive outlier can inflate the standard deviation enough that genuinely unusual values nearby no longer look extreme by comparison.
            </p>
            <p style={{ color: '#e9d5ff', lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
              The <strong>IQR (Tukey) method</strong> instead looks at the median and the middle 50% of your data (between Q1 and Q3). Because the median barely moves even with extreme values present, this method is far more robust for skewed distributions  revenue, transaction amounts, response times  where most values cluster low and a long tail of larger values is completely normal. This tool runs both, side by side, with adjustable thresholds, so you can see exactly where and why they differ for your data.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              {[
                ['📐', '3-Sigma (Z-score)', 'mean ± threshold × std dev. Best for roughly normal data.'],
                ['📦', 'IQR (Tukey)', 'Q1/Q3 ± multiplier × IQR. Robust to skew, the box-plot standard.'],
                ['⚙️', 'Adjustable', '2.0–3.5σ or 1.5×/3× IQR  see the count change live.'],
                ['🔍', 'Compared', 'Both counts shown per column in the overview table.'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 12px' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#f3e8ff' }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#e9d5ff', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How to read the visuals + four causes */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>Reading the charts</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>How to Read the Histogram and Box Plot</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 22, lineHeight: 1.7 }}>
              The histogram groups all values into bins  taller bars mean more values fall in that range. Bins shaded red fall entirely inside the current outlier zone for your selected method and threshold; purple bins are the normal range. The box plot shows the box from Q1 to Q3 (the middle 50% of values) with a line at the median, whiskers reaching to the most extreme non-flagged values, and individual red dots for every value beyond the whiskers  hover any dot to see its row number and value.
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Four common causes of outliers in business data</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
              {[
                { icon: '⌨️', title: 'Data Entry Errors', desc: 'An extra zero, a misplaced decimal, or a copy-paste that duplicated a digit  typing 100000 instead of 10000.' },
                { icon: '🖥️', title: 'System Defaults',   desc: 'A sensor or API returns -1, 0 or 9999 for a missing reading instead of leaving the field blank.' },
                { icon: '✅', title: 'Genuine Extremes',  desc: 'A single large order, a record day, a payment reversal  real values that are the signal, not the noise.' },
                { icon: '🧪', title: 'Leftover Test Data', desc: 'Staging records with placeholder amounts like 12345.67 or dates from 1970 or 2099, never cleaned before export.' },
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
                ['What outlier detection methods does this tool use?', 'Two, calculated for every numeric column and shown side by side: the 3-sigma (Z-score) rule, which flags values more than a chosen number of standard deviations from the mean, and the IQR (Tukey) method, which flags values below Q1 minus a multiplier times the interquartile range, or above Q3 plus that multiple. Both thresholds are adjustable.'],
                ['What is the difference between the 3-sigma method and the IQR method?', 'The 3-sigma method assumes a roughly normal, symmetric distribution and uses the mean and standard deviation, both of which extreme values themselves distort  a single huge outlier can inflate the standard deviation enough to mask smaller but still unusual values. The IQR method is based on the median and quartiles, which barely move with a few extreme points, making it more robust for skewed data. The two methods often agree, but disagreement is usually a sign the data is skewed rather than normally distributed.'],
                ['Can I adjust the outlier detection threshold?', 'Yes. For 3-Sigma, choose 2.0, 2.5, 3.0 or 3.5 standard deviations  lower values flag more points. For IQR, choose the standard 1.5x multiplier ("outliers") or 3x ("extreme outliers" / "far out" points). The histogram, box plot and outlier list update immediately.'],
                ['How do I read the box plot and histogram?', 'The box plot shows a box from Q1 to Q3 with a line at the median, whiskers to the most extreme non-flagged values, and dots for every outlier beyond the whiskers  hover a dot for its row number and value. The histogram groups values into bins; bins entirely within the outlier zone for the current method and threshold are shaded red, normal bins are purple.'],
                ['Should I remove outliers from my data?', 'Not automatically. An outlier might be a data entry error to correct, or a genuine extreme value that is exactly the signal you care about. This tool has no one-click removal button by design  it lists every flagged value with its row number and lets you copy those numbers to investigate each one in your original file.'],
                ['What causes outliers in business data?', 'Four common causes: data entry errors (an extra zero, a misplaced decimal), system or sensor defaults (-1, 0 or 9999 standing in for a missing reading), genuinely extreme real values (a single large order), and leftover test or staging data with unrealistic placeholder values never cleaned before export.'],
                ['How is this different from the outlier detection in the Data Quality Checker?', 'The Data Quality Checker runs a fixed 3-sigma check as one of four factors feeding an overall 0-100 score, shown as a simple table. This tool is a dedicated deep-dive: both 3-sigma and IQR side by side, adjustable thresholds, and an actual histogram and box plot per column so you can see the shape of your data. Use the Data Quality Checker for an overall score; use this tool to investigate one column\u2019s distribution.'],
                ['Is my CSV file uploaded to a server?', 'No. Your file is read directly in your browser via the FileReader API. All statistics, binning and outlier calculations run locally  nothing is transmitted anywhere, which makes this safe for confidential data.'],
              ].map(([q, a], i) => (
                <details key={i} style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {q} <span style={{ color: '#a855f7', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>+</span>
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
                ['📗', 'Excel Data Analyzer',     '/tools/excel-data-analyzer',    'Multi-sheet stats for XLSX and XLS files'],
                ['🗄️', 'CSV to SQL',              '/tools/csv-to-sql',             'Convert your CSV to SQL INSERT statements'],
                ['{}', 'JSON Formatter',          '/tools/json-formatter',         'Validate and format JSON data'],
              ].map(([icon, name, href, desc]) => (
                <a key={href} href={href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#e9d5ff'; }}
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