'use client';
// tools/DataQualityScoreTool.jsx
// Path: toolbeans/tools/DataQualityScoreTool.jsx
//
// STANDALONE tool  computes a weighted 0-100 data quality score from
// 4 factors (completeness 40%, uniqueness 30%, type consistency 20%,
// statistical integrity 10%), detects type mismatches and 3-sigma
// outliers, generates plain-English insights, infers a schema, and
// exports a JSON quality report. Entirely browser-based, CSV only.
// Papa Parse loaded from CDN.

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

// ── Type inference ─────────────────────────────────────────
const DATE_RE = /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$|^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/;
const BOOL_VALUES = new Set(['true', 'false', 'yes', 'no', 'y', 'n']);

function cleanNumeric(v) {
  return v.replace(/,/g, '').replace(/^\$/, '').replace(/%$/, '').trim();
}
function isNumericStr(v) {
  const c = cleanNumeric(v);
  return c !== '' && !isNaN(Number(c));
}
function inferType(values) {
  if (values.length === 0) return 'text';
  let num = 0, date = 0, bool = 0;
  values.forEach(v => {
    if (isNumericStr(v)) num++;
    if (DATE_RE.test(v)) date++;
    if (BOOL_VALUES.has(v.toLowerCase())) bool++;
  });
  const n = values.length;
  if (num / n >= 0.7) return 'number';
  if (date / n >= 0.7) return 'date';
  if (bool / n >= 0.7) return 'boolean';
  return 'text';
}
function matchesType(v, type) {
  if (type === 'number')  return isNumericStr(v);
  if (type === 'date')    return DATE_RE.test(v);
  if (type === 'boolean') return BOOL_VALUES.has(v.toLowerCase());
  return true; // text accepts anything
}

// ── 3-sigma outlier detection ─────────────────────────────
function findOutliers(numericVals) {
  if (numericVals.length < 4) return { outliers: [], mean: null, stdDev: null };
  const nums = numericVals.map(v => v.value);
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / nums.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return { outliers: [], mean, stdDev };
  const outliers = numericVals
    .map(v => ({ ...v, sigma: Math.abs(v.value - mean) / stdDev }))
    .filter(v => v.sigma > 3)
    .sort((a, b) => b.sigma - a.sigma);
  return { outliers, mean, stdDev };
}

// ── Core analysis: builds columns, score, breakdown ────────
function analyseData(rows, headers) {
  const totalRows = rows.length;
  const totalColumns = headers.length;

  const columns = headers.map((h, ci) => {
    let nullCount = 0;
    const nonNull = []; // { value: string, rowNum }
    rows.forEach((row, ri) => {
      const raw = (row[ci] ?? '').toString().trim();
      if (raw === '') { nullCount++; }
      else nonNull.push({ value: raw, rowNum: ri + 2 }); // +2: row 1 = header
    });

    const fillRate = totalRows > 0 ? ((totalRows - nullCount) / totalRows) * 100 : 100;
    const valueStrs = nonNull.map(v => v.value);
    const type = inferType(valueStrs);
    const mismatches = nonNull
      .filter(v => !matchesType(v.value, type))
      .map(v => ({ rowNum: v.rowNum, value: v.value }));

    let mean = null, stdDev = null, outliers = [];
    if (type === 'number') {
      const mismatchRows = new Set(mismatches.map(m => m.rowNum));
      const numericVals = nonNull
        .filter(v => !mismatchRows.has(v.rowNum))
        .map(v => ({ value: Number(cleanNumeric(v.value)), rowNum: v.rowNum }));
      const r = findOutliers(numericVals);
      mean = r.mean; stdDev = r.stdDev; outliers = r.outliers;
    }

    const distinct = new Set(valueStrs.map(v => v.toLowerCase()));
    const isUnique = nonNull.length > 0 && distinct.size === nonNull.length;

    return { name: h, index: ci, type, fillRate, nullCount, isUnique, mismatches, mean, stdDev, outliers, exampleValue: valueStrs[0] || '' };
  });

  // Duplicate rows (full-row, case-insensitive, trimmed)
  const seen = new Set();
  let duplicateCount = 0;
  rows.forEach(row => {
    const key = headers.map((_, ci) => (row[ci] ?? '').toString().trim().toLowerCase()).join('||');
    if (seen.has(key)) duplicateCount++; else seen.add(key);
  });
  const duplicatePercentage = totalRows > 0 ? (duplicateCount / totalRows) * 100 : 0;

  const totalCells = totalRows * totalColumns;
  const totalNulls = columns.reduce((s, c) => s + c.nullCount, 0);
  const overallFillRate = totalCells > 0 ? ((totalCells - totalNulls) / totalCells) * 100 : 100;

  // ── Score: starts at 100, weighted deductions ──
  const completenessDeduction = Math.min(40, (100 - overallFillRate) * 0.4);
  const uniquenessDeduction   = Math.min(30, duplicatePercentage * 1.5);
  const mismatchColCount      = columns.filter(c => c.mismatches.length > 0).length;
  const typeDeduction         = Math.min(20, mismatchColCount * 7);
  const outlierColCount       = columns.filter(c => c.outliers.length > 0).length;
  const statDeduction         = Math.min(10, outlierColCount * 3);

  const totalDeduction = completenessDeduction + uniquenessDeduction + typeDeduction + statDeduction;
  const score = Math.max(0, Math.round(100 - totalDeduction));
  const grade = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Poor';
  const gradeColor = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const gradeLight = score >= 90 ? '#f0fdf4' : score >= 70 ? '#fffbeb' : '#fef2f2';
  const gradeBorder = score >= 90 ? '#bbf7d0' : score >= 70 ? '#fde68a' : '#fecaca';

  const scoreBreakdown = {
    completeness:         { score: Math.round(100 - (completenessDeduction / 40) * 100),  weight: 40, deduction: Math.round(completenessDeduction * 10) / 10 },
    uniqueness:           { score: Math.round(100 - (uniquenessDeduction / 30) * 100),     weight: 30, deduction: Math.round(uniquenessDeduction * 10) / 10 },
    typeConsistency:      { score: Math.round(100 - (typeDeduction / 20) * 100),           weight: 20, deduction: typeDeduction },
    statisticalIntegrity: { score: Math.round(100 - (statDeduction / 10) * 100),           weight: 10, deduction: statDeduction },
  };

  return {
    totalRows, totalColumns, columns,
    duplicateCount, duplicatePercentage,
    totalNulls, overallFillRate,
    score, grade, gradeColor, gradeLight, gradeBorder,
    scoreBreakdown,
  };
}

// ── Plain-English insight generation ──────────────────────
function generateInsights(a) {
  const insights = [];

  if (a.duplicateCount > 0) {
    insights.push({ type: 'warning', icon: '🔁', text: `${a.duplicateCount.toLocaleString()} duplicate row${a.duplicateCount === 1 ? '' : 's'} found (${a.duplicatePercentage.toFixed(1)}% of data)  every SUM and COUNT on this dataset is inflated by this amount. Use the Find Duplicates in CSV tool to remove them.` });
  } else {
    insights.push({ type: 'success', icon: '✅', text: 'No duplicate rows detected  every row is unique.' });
  }

  const lowFill = a.columns.filter(c => c.fillRate < 70);
  if (lowFill.length > 0) {
    lowFill.forEach(c => {
      insights.push({ type: 'warning', icon: '⬜', text: `Column "${c.name}" is only ${c.fillRate.toFixed(1)}% complete (${c.nullCount.toLocaleString()} missing values)  usually a structural data collection issue. Use the CSV Null Value Checker to fill or drop these.` });
    });
  } else if (a.totalNulls === 0) {
    insights.push({ type: 'success', icon: '✅', text: 'No missing values detected across any column.' });
  } else {
    insights.push({ type: 'info', icon: '⬜', text: `${a.totalNulls.toLocaleString()} missing value${a.totalNulls === 1 ? '' : 's'} found, but every column remains above 70% complete  minor gaps only.` });
  }

  const mismatchCols = a.columns.filter(c => c.mismatches.length > 0);
  if (mismatchCols.length > 0) {
    mismatchCols.forEach(c => {
      const ex = c.mismatches[0];
      const exVal = ex.value.length > 30 ? ex.value.slice(0, 30) + '…' : ex.value;
      insights.push({ type: 'warning', icon: '🔢', text: `Column "${c.name}" is mostly ${c.type} but contains ${c.mismatches.length} non-${c.type} value${c.mismatches.length === 1 ? '' : 's'}  e.g. "${exVal}" in row ${ex.rowNum}. This will break SUM/AVERAGE in Power BI and may fail SQL imports.` });
    });
  } else {
    insights.push({ type: 'success', icon: '✅', text: 'No type inconsistencies detected  every column has uniform data types.' });
  }

  const outlierCols = a.columns.filter(c => c.outliers.length > 0);
  if (outlierCols.length > 0) {
    outlierCols.forEach(c => {
      const ex = c.outliers[0];
      insights.push({ type: 'info', icon: '📊', text: `Column "${c.name}" has ${c.outliers.length} statistical outlier${c.outliers.length === 1 ? '' : 's'}  e.g. ${ex.value.toLocaleString()} in row ${ex.rowNum}, ${ex.sigma.toFixed(1)}σ from the mean of ${c.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Verify these values are correct.` });
    });
  } else {
    insights.push({ type: 'success', icon: '✅', text: 'No statistical outliers detected in numeric columns.' });
  }

  return insights;
}

// ── Standardize headers to snake_case, handling collisions ──
function standardizeHeader(h) {
  let s = h.trim();
  s = s.replace(/[^a-zA-Z0-9]+/g, '_');
  s = s.replace(/^_+|_+$/g, '');
  if (s === '') s = 'column';
  if (/^[0-9]/.test(s)) s = 'col_' + s;
  return s.toLowerCase();
}
function standardizeAllHeaders(headers) {
  const used = new Map();
  const newHeaders = headers.map(h => {
    const base = standardizeHeader(h);
    const count = used.get(base) || 0;
    const final = count > 0 ? `${base}_${count + 1}` : base;
    used.set(base, count + 1);
    return final;
  });
  const changes = headers.map((h, i) => ({ old: h, new: newHeaders[i] })).filter(c => c.old !== c.new);
  return { newHeaders, changes };
}

// ── Color helper for fill rates etc ───────────────────────
function rateColor(rate) {
  if (rate >= 95) return { text: '#16a34a', bg: '#22c55e', light: '#f0fdf4', border: '#bbf7d0' };
  if (rate >= 70) return { text: '#d97706', bg: '#f59e0b', light: '#fffbeb', border: '#fde68a' };
  return             { text: '#dc2626', bg: '#ef4444', light: '#fef2f2', border: '#fecaca' };
}

// ── Main component ─────────────────────────────────────────
export default function DataQualityScoreTool() {
  const [fileName, setFileName]       = useState('');
  const [headers, setHeaders]         = useState([]);
  const [origHeaders, setOrigHeaders] = useState([]);
  const [rows, setRows]               = useState([]);
  const [origRows, setOrigRows]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [tab, setTab]                 = useState('overview');
  const [headerChanges, setHeaderChanges] = useState([]);
  const [edited, setEdited]           = useState(false);
  const [copied, setCopied]           = useState(false);
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
    setHeaderChanges([]);
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
        setOrigHeaders(hdrs);
        setRows(dataRows);
        setOrigRows(dataRows);
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

  // ── Live analysis ─────────────────────────────────────────
  const analysis = useMemo(() => headers.length === 0 ? null : analyseData(rows, headers), [rows, headers]);
  const insights = useMemo(() => analysis ? generateInsights(analysis) : [], [analysis]);

  // ── Actions ───────────────────────────────────────────────
  const applyStandardizeHeaders = () => {
    const { newHeaders, changes } = standardizeAllHeaders(headers);
    setHeaders(newHeaders);
    setHeaderChanges(changes);
    setEdited(true);
  };

  const reset = () => {
    setHeaders(origHeaders);
    setRows(origRows);
    setHeaderChanges([]);
    setEdited(false);
  };

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
    a.download = fileName.replace('.csv', '') + '-standardized.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = () => {
    if (!analysis) return;
    const report = {
      fileName,
      generatedAt: new Date().toISOString(),
      summary: { totalRows: analysis.totalRows, totalColumns: analysis.totalColumns, qualityScore: analysis.score, grade: analysis.grade },
      scoreBreakdown: analysis.scoreBreakdown,
      duplicates: { count: analysis.duplicateCount, percentage: Math.round(analysis.duplicatePercentage * 100) / 100 },
      columns: analysis.columns.map(c => ({
        name: c.name, type: c.type, fillRate: Math.round(c.fillRate * 100) / 100,
        nullCount: c.nullCount, unique: c.isUnique, exampleValue: c.exampleValue,
        mismatchCount: c.mismatches.length, outlierCount: c.outliers.length,
        mean: c.mean !== null ? Math.round(c.mean * 100) / 100 : null,
        stdDev: c.stdDev !== null ? Math.round(c.stdDev * 100) / 100 : null,
      })),
      typeMismatches: analysis.columns.filter(c => c.mismatches.length > 0).map(c => ({ column: c.name, dominantType: c.type, values: c.mismatches })),
      outliers: analysis.columns.filter(c => c.outliers.length > 0).map(c => ({
        column: c.name, mean: Math.round(c.mean * 100) / 100, stdDev: Math.round(c.stdDev * 100) / 100,
        values: c.outliers.map(o => ({ rowNum: o.rowNum, value: o.value, sigma: Math.round(o.sigma * 100) / 100 })),
      })),
      insights: insights.map(i => ({ type: i.type, text: i.text })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.csv', '') + '-quality-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySchema = () => {
    if (!analysis) return;
    const schema = analysis.columns.map(c => ({ name: c.name, type: c.type, fillRate: Math.round(c.fillRate * 100) / 100, unique: c.isUnique, example: c.exampleValue }));
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const hasFile = headers.length > 0 && !loading;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0f172a 0%,#022c22 60%,#0f172a 100%)', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 24 }}>
            <a href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</a>
            <span>/</span>
            <a href="/tools" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tools</a>
            <span>/</span>
            <span style={{ color: '#cbd5e1' }}>Data Quality Checker</span>
          </nav>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.28)', borderRadius: 999, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 15 }}>🏆</span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6ee7b7' }}>Data Quality Checker</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4.5vw,44px)', fontWeight: 800, color: '#fff', margin: '0 0 14px', lineHeight: 1.15 }}>
            Get a Data Quality Score<br />
            <span style={{ background: 'linear-gradient(90deg,#34d399,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>for Any CSV in Seconds</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 580, margin: '0 0 24px', lineHeight: 1.7 }}>
            Upload a CSV and get a weighted 0–100 score across completeness, uniqueness, type consistency
            and statistical integrity  plus type mismatches and 3-sigma outliers with exact row numbers,
            an inferred schema, and a downloadable JSON report.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['CSV files only', 'Type mismatch + outlier detection', 'Plain-English insights', 'No upload to server', 'Free forever'].map(f => (
              <span key={f} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', color: '#a7f3d0', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>✓ {f}</span>
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
            style={{ border: '2px dashed #a7f3d0', borderRadius: 20, padding: '60px 28px', textAlign: 'center', cursor: 'pointer', background: '#fff', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdfa'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.background = '#fff'; }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>📂</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#1e293b' }}>Drop your CSV file here</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>CSV files only  your file never leaves your browser</p>
            <button style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Choose CSV File
            </button>
            <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>Supports any CSV regardless of size. No row limit.</p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin .8s linear infinite' }} />
            <p style={{ color: '#64748b' }}>Calculating quality score…</p>
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
            {/* Summary bar with score */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 12, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `conic-gradient(${analysis.gradeColor} ${analysis.score * 3.6}deg, #e2e8f0 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: analysis.gradeColor, lineHeight: 1 }}>{analysis.score}</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quality score</p>
                  <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: analysis.gradeColor }}>{analysis.grade}</p>
                </div>
              </div>
              <div style={{ width: 1, height: 36, background: '#f1f5f9', flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>File</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1e293b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rows × Cols</p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{analysis.totalRows.toLocaleString()} × {analysis.totalColumns}</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {edited && (
                  <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>↩ Reset</button>
                )}
                <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer' }}>Open new file</button>
                <button onClick={applyStandardizeHeaders} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #a7f3d0', background: '#f0fdfa', color: '#0f766e', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>🏷️ Standardize Headers</button>
                <button onClick={downloadCSV} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⬇ CSV</button>
                <button onClick={exportReport} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#14b8a6)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>📄 Export Quality Report</button>
              </div>
            </div>

            {/* Header standardization banner */}
            {headerChanges.length > 0 && (
              <div style={{ background: '#f0fdfa', border: '1px solid #a7f3d0', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#0f766e' }}>✓ {headerChanges.length} header{headerChanges.length === 1 ? '' : 's'} standardized to snake_case</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                  {headerChanges.map((c, i) => (
                    <span key={i} style={{ fontSize: 12, color: '#0f766e' }}>
                      <code style={{ background: '#ccfbf1', padding: '1px 5px', borderRadius: 4 }}>{c.old}</code> → <code style={{ background: '#ccfbf1', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>{c.new}</code>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderRadius: '14px 14px 0 0', overflow: 'hidden', border: '1px solid #e2e8f0', borderBottom: 'none', background: '#f8fafc' }}>
              {[
                { id: 'overview',   label: 'Overview' },
                { id: 'mismatches', label: 'Type Mismatches', count: analysis.columns.filter(c => c.mismatches.length > 0).length },
                { id: 'outliers',   label: 'Outliers',        count: analysis.columns.filter(c => c.outliers.length > 0).length },
                { id: 'schema',     label: 'Schema' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '13px 8px', border: 'none', borderBottom: tab === t.id ? '2px solid #10b981' : '2px solid transparent', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? '#059669' : '#64748b', fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {t.label}
                  {t.count !== undefined && (
                    <span style={{ background: t.count > 0 ? '#fef2f2' : '#f0fdf4', color: t.count > 0 ? '#dc2626' : '#16a34a', border: `1px solid ${t.count > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: 24, marginBottom: 20 }}>

              {/* OVERVIEW  score breakdown + insights */}
              {tab === 'overview' && (
                <div>
                  <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score breakdown (4 weighted factors)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    {[
                      ['Completeness',          analysis.scoreBreakdown.completeness,         'Based on overall fill rate across all cells'],
                      ['Uniqueness',            analysis.scoreBreakdown.uniqueness,            'Based on % of duplicate rows'],
                      ['Type Consistency',      analysis.scoreBreakdown.typeConsistency,       '−7 pts per column with mixed data types'],
                      ['Statistical Integrity', analysis.scoreBreakdown.statisticalIntegrity,  '−3 pts per numeric column with 3σ outliers'],
                    ].map(([label, b, sub]) => {
                      const c = rateColor(b.score);
                      return (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'baseline' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{label} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 11 }}>({b.weight}% weight)</span></span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{b.score}/100 {b.deduction > 0 && <span style={{ color: '#94a3b8', fontWeight: 400 }}>(−{b.deduction} pts)</span>}</span>
                          </div>
                          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginBottom: 3 }}>
                            <div style={{ height: '100%', width: `${b.score}%`, background: c.bg, borderRadius: 999, transition: 'width .3s' }} />
                          </div>
                          <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{sub}</p>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Insights</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {insights.map((ins, i) => {
                      const palette = ins.type === 'success'
                        ? { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' }
                        : ins.type === 'warning'
                        ? { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' }
                        : { bg: '#f0f9ff', border: '#bae6fd', text: '#0c4a6e' };
                      return (
                        <div key={i} style={{ background: palette.bg, border: `1px solid ${palette.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                          <p style={{ margin: 0, fontSize: 13, color: palette.text, lineHeight: 1.6 }}>{ins.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TYPE MISMATCHES tab */}
              {tab === 'mismatches' && (() => {
                const cols = analysis.columns.filter(c => c.mismatches.length > 0);
                return cols.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 4px' }}>No type mismatches found</p>
                    <p style={{ color: '#64748b', fontSize: 13 }}>Every column has consistent data types throughout.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {cols.map(c => (
                      <div key={c.index}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{c.name}</span>
                          <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>mostly {c.type}</span>
                          <span style={{ fontSize: 11, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>{c.mismatches.length} mismatch{c.mismatches.length === 1 ? '' : 'es'}</span>
                        </div>
                        <div style={{ border: '1px solid #fecaca', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', background: '#fef2f2', padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#dc2626' }}>
                            <span>Row</span><span>Value (does not match "{c.type}")</span>
                          </div>
                          {c.mismatches.slice(0, 12).map((m, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', padding: '7px 14px', fontSize: 13, borderTop: '1px solid #fee2e2', background: i % 2 === 0 ? '#fff' : '#fffafa' }}>
                              <span style={{ fontWeight: 700, color: '#dc2626' }}>Row {m.rowNum}</span>
                              <span style={{ color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{m.value}"</span>
                            </div>
                          ))}
                          {c.mismatches.length > 12 && (
                            <div style={{ padding: '7px 14px', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #fee2e2' }}>and {c.mismatches.length - 12} more…</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* OUTLIERS tab */}
              {tab === 'outliers' && (() => {
                const cols = analysis.columns.filter(c => c.outliers.length > 0);
                return cols.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 4px' }}>No statistical outliers found</p>
                    <p style={{ color: '#64748b', fontSize: 13 }}>No numeric values fall more than 3 standard deviations from their column mean.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {cols.map(c => (
                      <div key={c.index}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>mean = {c.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}, σ = {c.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          <span style={{ fontSize: 11, background: '#f0f9ff', color: '#0284c7', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>{c.outliers.length} outlier{c.outliers.length === 1 ? '' : 's'}</span>
                        </div>
                        <div style={{ border: '1px solid #bae6fd', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', background: '#f0f9ff', padding: '8px 14px', fontSize: 11, fontWeight: 700, color: '#0284c7' }}>
                            <span>Row</span><span>Value</span><span>Distance</span>
                          </div>
                          {c.outliers.slice(0, 12).map((o, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', padding: '7px 14px', fontSize: 13, borderTop: '1px solid #e0f2fe', background: i % 2 === 0 ? '#fff' : '#f9feff' }}>
                              <span style={{ fontWeight: 700, color: '#0284c7' }}>Row {o.rowNum}</span>
                              <span style={{ color: '#334155' }}>{o.value.toLocaleString()}</span>
                              <span style={{ color: '#64748b' }}>{o.sigma.toFixed(1)}σ</span>
                            </div>
                          ))}
                          {c.outliers.length > 12 && (
                            <div style={{ padding: '7px 14px', fontSize: 12, color: '#94a3b8', borderTop: '1px solid #e0f2fe' }}>and {c.outliers.length - 12} more…</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* SCHEMA tab */}
              {tab === 'schema' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Inferred schema for all {headers.length} columns. Use this to write CREATE TABLE statements or document the dataset.</p>
                    <button onClick={copySchema} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #a7f3d0', background: copied ? '#10b981' : '#f0fdfa', color: copied ? '#fff' : '#0f766e', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {copied ? '✓ Copied!' : '📋 Copy Schema as JSON'}
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f0fdfa' }}>
                          <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#0f766e', fontWeight: 700 }}>Column</th>
                          <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#0f766e', fontWeight: 700 }}>Type</th>
                          <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#0f766e', fontWeight: 700 }}>Fill rate</th>
                          <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#0f766e', fontWeight: 700 }}>Unique</th>
                          <th style={{ padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#0f766e', fontWeight: 700 }}>Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.columns.map((c, i) => {
                          const fc = rateColor(c.fillRate);
                          return (
                            <tr key={c.index} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                              <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1e293b' }}>{c.name}</td>
                              <td style={{ padding: '9px 12px' }}><span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{c.type}</span></td>
                              <td style={{ padding: '9px 12px', color: fc.text, fontWeight: 700 }}>{c.fillRate.toFixed(1)}%</td>
                              <td style={{ padding: '9px 12px' }}>{c.isUnique ? <span style={{ color: '#16a34a' }}>✓ yes</span> : <span style={{ color: '#94a3b8' }}></span>}</td>
                              <td style={{ padding: '9px 12px', color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.exampleValue || <em style={{ color: '#cbd5e1' }}>(empty)</em>}</td>
                            </tr>
                          );
                        })}
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
            <div style={{ display: 'inline-block', background: '#d1fae5', color: '#059669', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>How to use</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>How to Check Data Quality Before Loading into Power BI or a Database</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 32, lineHeight: 1.7 }}>
              Skipping a quality check is the leading cause of dashboards showing wrong numbers, database imports failing with cryptic errors, and reports that a stakeholder later flags as inconsistent with the source system.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
              {[
                { step: '1', icon: '📂', title: 'Upload your CSV',        desc: 'Click or drag your export file onto the upload area. Your file is read locally  nothing is sent to any server.' },
                { step: '2', icon: '🏆', title: 'Read the score',         desc: 'See your weighted 0–100 score and a plain-English insight card for every issue, with positive confirmations for what is already clean.' },
                { step: '3', icon: '🔢', title: 'Drill into the details', desc: 'Type Mismatches and Outliers tabs show exact row numbers for values that will break Power BI measures or skew averages.' },
                { step: '4', icon: '📄', title: 'Export and fix',         desc: 'Standardize headers, copy the inferred schema, or export the full JSON quality report  then load into Power BI or your database.' },
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

          {/* What makes up the score */}
          <div style={{ marginBottom: 56, background: 'linear-gradient(135deg,#022c22,#064e3b)', borderRadius: 18, padding: '36px 32px', color: '#fff' }}>
            <div style={{ display: 'inline-block', background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.3)', color: '#6ee7b7', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>The formula</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 14px' }}>What Makes Up Your Data Quality Score</h2>
            <p style={{ color: '#a7f3d0', lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>
              The score starts at 100. Each of the four factors below can deduct points up to its weight, and the final score is <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>max(0, round(100 − total deductions))</code>. A score of 90+ is Excellent (ready for production), 70–89 is Good (minor issues to review), and below 70 is Poor (multiple problems that will cause errors downstream).
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
              {[
                ['Completeness', '40%', 'Deduction = (100 − overall fill rate) × 0.4. A dataset with 80% overall fill rate loses 8 points.'],
                ['Uniqueness', '30%', 'Deduction = duplicate row % × 1.5, capped at 30. Reaches the cap once 20% of rows are duplicates.'],
                ['Type Consistency', '20%', '7 points lost for every column where the dominant type (number/date/boolean) has exceptions, capped at 20.'],
                ['Statistical Integrity', '10%', '3 points lost for every numeric column containing values more than 3σ from the mean, capped at 10.'],
              ].map(([title, weight, desc]) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#d1fae5' }}>{title}</p>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7' }}>{weight}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#a7f3d0', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Type mismatches & outliers  the differentiator */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>What this tool catches</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Type Mismatches and Outliers  Issues Other Tools Miss</h2>
            <p style={{ fontSize: 15, color: '#64748b', marginBottom: 22, lineHeight: 1.7 }}>
              Duplicate rows and missing values are well-known problems with dedicated tools. These two checks are different  they only surface when you analyse the <em>shape</em> of the data within each column, and they are the most common cause of &quot;the data looks fine but the dashboard is wrong.&quot;
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>🔢</span>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#dc2626' }}>Type Mismatches</h3>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
                  This tool first determines the dominant type of each column  number, date, boolean or text  by checking what percentage of non-empty values match each pattern (numbers handle commas, currency symbols and percent signs; dates match common YYYY-MM-DD and DD/MM/YYYY formats). If a column is at least 70% one type, every value that does not match is flagged as a mismatch with its row number. An &quot;amount&quot; column with 997 numeric rows and 3 rows containing &quot;N/A&quot; or &quot;pending&quot; will have those 3 rows listed exactly. In Power BI, a single non-numeric value forces the entire column to be typed as text, silently breaking every SUM and AVERAGE. In SQL, the import simply fails.
                </p>
              </div>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>📊</span>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0284c7' }}>Statistical Outliers (3-Sigma Rule)</h3>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
                  For every column classified as numeric, the tool calculates the mean and standard deviation of its values (excluding any type-mismatch rows), then flags any value more than three standard deviations from the mean  the standard threshold used in statistical process control. A &quot;quantity&quot; column averaging 12 with a standard deviation of 3 would flag a row containing 9,999 as an outlier roughly 3,329σ away. Outliers are not automatically wrong, but a single typo like an extra zero can shift an average enough to mislead an entire report, and this check surfaces exactly which row to verify.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999, marginBottom: 14 }}>FAQ</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 28px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['What is a data quality score and how is it calculated?', 'The score starts at 100 and points are deducted across four weighted factors: completeness (up to 40, based on overall fill rate), uniqueness (up to 30, based on duplicate row percentage), type consistency (up to 20, 7 points per column with mixed types) and statistical integrity (up to 10, 3 points per numeric column with 3σ outliers). The result is rounded to the nearest whole number with a floor of 0. 90–100 is Excellent, 70–89 is Good, below 70 is Poor.'],
                ['What does this tool check that the Find Duplicates and Null Value Checker tools do not?', 'Type mismatches and statistical outliers  neither dedicated tool covers these. This tool also combines duplicate counts, missing-value rates, type mismatches and outliers into one weighted score with plain-English insights, an inferred schema and a downloadable JSON report. For deep duplicate removal or null-filling with multiple fill strategies, this tool links directly to those dedicated tools.'],
                ['What is a type mismatch and why does it break Power BI and SQL imports?', 'A type mismatch is a value that does not match the dominant type of its column  most commonly a text value like "N/A" in an otherwise numeric column. SQL rejects imports when a numeric column receives text. Power BI infers the whole column as text the moment it sees one non-numeric value, breaking every SUM, AVERAGE or other numeric measure on that column.'],
                ['How does the statistical outlier detection work?', 'For every dominantly-numeric column, the tool computes the mean and standard deviation, then flags any value where |value − mean| / standard deviation > 3  the 3-sigma rule. Each flagged value is shown with its row number and exactly how many standard deviations it sits from the mean.'],
                ['Can I export a quality report to share with my team?', 'Yes. Export Quality Report downloads a JSON file containing the score and its 4-factor breakdown, every column with its inferred type, fill rate, uniqueness flag and example value, the full lists of type mismatches and outliers with row numbers, the duplicate count, and all generated insights  useful as a data handover document or a quality baseline for future comparisons.'],
                ['What does "Standardize Headers" do?', 'It rewrites every column name to snake_case: trimming whitespace, replacing spaces and special characters with underscores, collapsing repeats, and lowercasing the result. "Customer Name " becomes "customer_name" and "Order-ID#" becomes "order_id". Any header that would collide with another after standardization gets a numeric suffix. The tool shows exactly which names changed before you download.'],
                ['Is my CSV file uploaded to a server?', 'No. Your file is read directly in your browser using the JavaScript FileReader API and is never transmitted anywhere. The score calculation, type inference and outlier detection all run locally, which makes this safe for confidential business data.'],
                ['Does this tool work with Excel files?', 'This tool is built specifically for CSV files for fast, reliable browser-based parsing. If your data is in Excel, export the sheet as CSV first (File > Save As > CSV), or use the TOOLBeans Data Profiler, which supports XLSX, XLS and REST API sources directly.'],
              ].map(([q, a], i) => (
                <details key={i} style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                  <summary style={{ padding: '14px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#1e293b', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {q} <span style={{ color: '#10b981', fontSize: 18, flexShrink: 0, marginLeft: 12 }}>+</span>
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
                ['📊', 'Data Profiler',          '/tools/data-profiler',          'Full analysis for CSV, Excel, JSON and APIs'],
                ['🗄️', 'CSV to SQL',              '/tools/csv-to-sql',             'Convert your standardized CSV to SQL INSERT statements'],
                ['{}', 'JSON Formatter',          '/tools/json-formatter',         'Validate and format JSON data'],
                ['↔️', 'Diff Checker',            '/tools/diff-checker',           'Compare two text files and highlight differences'],
              ].map(([icon, name, href, desc]) => (
                <a key={href} href={href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#d1fae5'; e.currentTarget.style.borderColor = '#a7f3d0'; }}
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