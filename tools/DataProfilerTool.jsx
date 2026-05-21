'use client';

import { useState, useCallback, useRef } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// ANALYSIS ENGINE
// ══════════════════════════════════════════════════════════════════════════════

const PATTERNS = {
  email:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone:   /^[\+]?[\d\s\-\(\)]{7,15}$/,
  url:     /^https?:\/\/.+/i,
  date:    /^\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}$/,
  integer: /^-?\d+$/,
  float:   /^-?\d+\.\d+$/,
  boolean: /^(true|false|yes|no|1|0)$/i,
  uuid:    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

function detectPattern(val) {
  const s = String(val).trim();
  for (const [name, re] of Object.entries(PATTERNS)) {
    if (re.test(s)) return name;
  }
  return 'string';
}

// ── Get mode (most frequent value) ───────────────────────
function getMode(values) {
  const freq = {};
  values.forEach(v => {
    const k = String(v).trim();
    freq[k] = (freq[k] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;
  return { value: sorted[0][0], count: sorted[0][1] };
}

function analyzeColumn(values, header) {
  const total    = values.length;
  const nulls    = values.filter(v => v === null || v === undefined || v === '' || String(v).trim() === '').length;
  const nonNull  = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  const unique   = new Set(nonNull.map(v => String(v).trim().toLowerCase())).size;

  // Pattern detection on non-null values (sample first 500 for large datasets)
  const sample = nonNull.slice(0, 500);
  const patternCounts = {};
  sample.forEach(v => {
    const p = detectPattern(v);
    patternCounts[p] = (patternCounts[p] || 0) + 1;
  });
  const dominantPattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'string';

  // Numeric stats
  let numericStats = null;
  const nums = nonNull.map(v => parseFloat(String(v).replace(/,/g, ''))).filter(n => !isNaN(n));
  if (nums.length > 0 && nums.length / nonNull.length > 0.7) {
    const sorted   = [...nums].sort((a, b) => a - b);
    const sum      = nums.reduce((a, b) => a + b, 0);
    const mean     = sum / nums.length;
    const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
    const stdDev   = Math.sqrt(variance);
    // Median
    const mid    = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const outliers = nums.filter(n => Math.abs(n - mean) > 3 * stdDev).length;
    // Mode from numeric strings
    const modeResult = getMode(nonNull);

    numericStats = {
      count:        nums.length,
      countDistinct: new Set(nums).size,
      min:           sorted[0],
      max:           sorted[sorted.length - 1],
      mean:          Math.round(mean * 100) / 100,
      median,
      stdDev:        Math.round(stdDev * 100) / 100,
      sum:           Math.round(sum * 100) / 100,
      outliers,
      negative:      nums.filter(n => n < 0).length,
      zero:          nums.filter(n => n === 0).length,
      mode:          modeResult,
    };
  }

  // Type mismatch
  const typeMismatch = dominantPattern === 'integer' || dominantPattern === 'float'
    ? nonNull.filter(v => isNaN(parseFloat(String(v).replace(/,/g, '')))).length
    : 0;

  // Top values frequency
  const freq = {};
  nonNull.slice(0, 1000).forEach(v => {
    const k = String(v).trim();
    freq[k] = (freq[k] || 0) + 1;
  });
  const topValues = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([val, count]) => ({ val, count, pct: Math.round(count / total * 100) }));

  // Mode for all columns
  const modeAll = topValues.length > 0 ? { value: topValues[0].val, count: topValues[0].count } : null;

  // String length stats
  let strStats = null;
  if (dominantPattern === 'string' || dominantPattern === 'email' || dominantPattern === 'url') {
    const lengths = nonNull.map(v => String(v).length);
    if (lengths.length > 0) {
      strStats = {
        minLen: Math.min(...lengths),
        maxLen: Math.max(...lengths),
        avgLen: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
      };
    }
  }

  const fillRate   = total > 0 ? Math.round((1 - nulls / total) * 100) : 100;
  const uniqueRate = nonNull.length > 0 ? Math.round(unique / nonNull.length * 100) : 0;

  let score = 100;
  if (fillRate < 100) score -= Math.min(40, (100 - fillRate) * 2);
  if (typeMismatch > 0) score -= Math.min(30, typeMismatch * 5);
  if (uniqueRate === 0 && total > 1) score -= 10;
  score = Math.max(0, score);

  return {
    header, total, nulls, nonNull: nonNull.length,
    unique, fillRate, uniqueRate, dominantPattern,
    numericStats, typeMismatch, topValues, strStats,
    score, patternCounts, modeAll,
    count: total, countDistinct: unique,
  };
}

// ── Row duplicate detection ───────────────────────────────
function findDuplicates(rows) {
  const seen  = new Map();
  const dupes = [];
  rows.forEach((row, i) => {
    const key = JSON.stringify(Object.values(row).map(v => String(v ?? '').trim().toLowerCase()));
    if (seen.has(key)) {
      dupes.push({ rowIndex: i + 2, firstSeen: seen.get(key) + 2, rowData: row });
    } else {
      seen.set(key, i);
    }
  });
  return dupes;
}

// ── Column duplicate detection (NEW) ─────────────────────
// Two columns are duplicates if they have identical values across all rows
function findColumnDuplicates(rows, headers) {
  if (!rows.length || headers.length < 2) return [];
  const colValues = {};
  headers.forEach(h => {
    colValues[h] = rows.map(r => String(r[h] ?? '').trim().toLowerCase()).join('|||');
  });
  const dupes = [];
  const found = new Set();
  for (let i = 0; i < headers.length; i++) {
    for (let j = i + 1; j < headers.length; j++) {
      const a = headers[i], b = headers[j];
      const key = a + '::' + b;
      if (!found.has(key) && colValues[a] === colValues[b]) {
        dupes.push({
          col1: a, col2: b,
          sampleValues: rows.slice(0, 5).map(r => String(r[a] ?? '')),
        });
        found.add(key);
      }
    }
  }
  return dupes;
}

function analyzeDataset(rows, headers) {
  if (!rows.length) return null;

  const columnStats    = headers.map(h => analyzeColumn(rows.map(r => r[h]), h));
  const duplicates     = findDuplicates(rows);
  const columnDupes    = findColumnDuplicates(rows, headers);

  const avgColScore    = columnStats.reduce((a, c) => a + c.score, 0) / columnStats.length;
  const dupeDeduction  = Math.min(30, duplicates.length * 2);
  const qualityScore   = Math.max(0, Math.round(avgColScore - dupeDeduction));

  const totalNulls  = columnStats.reduce((a, c) => a + c.nulls, 0);
  const totalCells  = rows.length * headers.length;
  const nullCols    = columnStats.filter(c => c.nulls > 0);
  const mismatchCols = columnStats.filter(c => c.typeMismatch > 0);
  const lowFill     = columnStats.filter(c => c.fillRate < 70);

  return {
    totalRows: rows.length, totalCols: headers.length, totalCells, totalNulls,
    completeness: Math.round((1 - totalNulls / totalCells) * 100),
    duplicates, columnDupes, columnStats, qualityScore,
    nullCols, mismatchCols, lowFill, headers,
  };
}

// ── JSON flattener ────────────────────────────────────────
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(result, flattenObject(v, key));
    } else if (Array.isArray(v)) {
      result[key] = JSON.stringify(v);
    } else {
      result[key] = v;
    }
  }
  return result;
}

function extractRowsFromJson(data) {
  // NO row limit process all rows
  if (Array.isArray(data)) {
    const flat    = data.map(item =>
      typeof item === 'object' && item !== null ? flattenObject(item) : { value: item }
    );
    const headers = [...new Set(flat.flatMap(r => Object.keys(r)))];
    return { rows: flat, headers };
  }
  for (const val of Object.values(data)) {
    if (Array.isArray(val) && val.length > 0) return extractRowsFromJson(val);
  }
  const flat = [flattenObject(data)];
  return { rows: flat, headers: Object.keys(flat[0]) };
}

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

const PATTERN_COLORS = {
  integer: 'bg-blue-100 text-blue-700',
  float:   'bg-indigo-100 text-indigo-700',
  string:  'bg-slate-100 text-slate-700',
  email:   'bg-purple-100 text-purple-700',
  phone:   'bg-teal-100 text-teal-700',
  url:     'bg-cyan-100 text-cyan-700',
  date:    'bg-orange-100 text-orange-700',
  boolean: 'bg-pink-100 text-pink-700',
  uuid:    'bg-amber-100 text-amber-700',
};

const PATTERN_ICONS = {
  integer: '🔢', float: '🔢', string: '🔤', email: '📧',
  phone: '📞', url: '🔗', date: '📅', boolean: '✓', uuid: '🆔',
};

const scoreColor = s => s >= 90 ? 'text-emerald-600' : s >= 70 ? 'text-amber-600' : 'text-rose-600';
const scoreBg    = s => s >= 90 ? 'bg-emerald-50 border-emerald-200' : s >= 70 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';
const scoreLabel = s => s >= 90 ? 'Excellent' : s >= 70 ? 'Good' : s >= 50 ? 'Fair' : 'Poor';

const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  if (typeof n === 'number') {
    return Math.abs(n) >= 1000000 ? (n / 1000000).toFixed(1) + 'M'
      : Math.abs(n) >= 1000 ? (n / 1000).toFixed(1) + 'K'
      : String(n);
  }
  return String(n);
};

// ── Pagination helper ─────────────────────────────────────
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

const RELATED_TOOLS = [
  { name: 'CSV to SQL',         href: '/tools/csv-to-sql',         icon: '🗄️',  desc: 'Convert your cleaned CSV data to SQL INSERT statements' },
  { name: 'JSON Formatter',     href: '/tools/json-formatter',     icon: '{ }', desc: 'Format and validate JSON API responses' },
  { name: 'API Request Tester', href: '/tools/api-request-tester', icon: '📡',  desc: 'Test REST APIs and inspect JSON data live' },
  { name: 'SQL Formatter',      href: '/tools/sql-formatter',      icon: '🗄️',  desc: 'Format SQL queries for data analysis work' },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function DataProfilerTool() {
  const [source,     setSource]     = useState('file');
  const [apiUrl,     setApiUrl]     = useState('');
  const [apiKey,     setApiKey]     = useState('');
  const [apiMethod,  setApiMethod]  = useState('GET');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [fileName,   setFileName]   = useState('');

  const [rawRows,    setRawRows]    = useState([]);
  const [headers,    setHeaders]    = useState([]);
  const [analysis,   setAnalysis]   = useState(null);

  const [activeTab,    setActiveTab]    = useState('overview');
  const [searchCol,    setSearchCol]    = useState('');
  const [tablePage,    setTablePage]    = useState(0);
  const [pageSize,     setPageSize]     = useState(50);
  const [showDupes,    setShowDupes]    = useState(false);
  const [copied,       setCopied]       = useState('');
  const [tableSearch,  setTableSearch]  = useState('');

  const fileRef = useRef(null);

  // ── Load CDN libs ─────────────────────────────────────
  const loadLib = src => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  // ── Process rows ──────────────────────────────────────
  const processData = useCallback((rows, hdrs, name = '') => {
    if (!rows.length) { setError('No data rows found in the file.'); return; }
    setRawRows(rows);
    setHeaders(hdrs);
    setFileName(name);
    setAnalysis(analyzeDataset(rows, hdrs));
    setActiveTab('overview');
    setTablePage(0);
    setError('');
  }, []);

  // ── File Upload NO row limit ─────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true); setError(''); setAnalysis(null);
    try {
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'csv') {
        await loadLib('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js');
        const text   = await file.text();
        const result = window.Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
        if (result.errors.length && !result.data.length) throw new Error(result.errors[0].message);
        // ALL rows no slice
        processData(result.data, result.meta.fields || [], file.name);

      } else if (['xlsx', 'xls'].includes(ext)) {
        await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        const buffer = await file.arrayBuffer();
        const wb     = window.XLSX.read(buffer, { type: 'array' });
        const ws     = wb.Sheets[wb.SheetNames[0]];
        // ALL rows no slice
        const data   = window.XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!data.length) throw new Error('No data found in spreadsheet.');
        processData(data, Object.keys(data[0]), file.name);

      } else if (ext === 'json') {
        const text = await file.text();
        const json  = JSON.parse(text);
        const { rows, headers: hdrs } = extractRowsFromJson(json);
        processData(rows, hdrs, file.name);

      } else {
        throw new Error('Unsupported file type. Please upload CSV, Excel (.xlsx/.xls) or JSON.');
      }
    } catch (e) {
      setError(e.message || 'Failed to parse file.');
    } finally {
      setLoading(false);
    }
  };

  // ── API Fetch NO row limit ───────────────────────────
  const handleApiLoad = async () => {
    if (!apiUrl.trim()) { setError('Please enter an API URL.'); return; }
    setLoading(true); setError(''); setAnalysis(null);
    try {
      const hdrs = { 'Accept': 'application/json' };
      if (apiKey.trim()) hdrs['Authorization'] = 'Bearer ' + apiKey.trim();
      const res  = await fetch(apiUrl.trim(), { method: apiMethod, headers: hdrs });
      if (!res.ok) throw new Error(`API returned ${res.status} ${res.statusText}`);
      const json = await res.json();
      // ALL rows from JSON
      const { rows, headers: rHdrs } = extractRowsFromJson(json);
      processData(rows, rHdrs, apiUrl.trim());
    } catch (e) {
      setError(e.message.includes('Failed to fetch')
        ? 'CORS error or network issue. The API may not allow browser requests.'
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Export full report ────────────────────────────────
  const exportReport = () => {
    if (!analysis) return;
    const report = {
      source: fileName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRows: analysis.totalRows,
        totalColumns: analysis.totalCols,
        qualityScore: analysis.qualityScore,
        completeness: analysis.completeness + '%',
        duplicateRows: analysis.duplicates.length,
        duplicateColumns: analysis.columnDupes.length,
        totalNullValues: analysis.totalNulls,
      },
      columns: analysis.columnStats.map(c => ({
        name: c.header, type: c.dominantPattern,
        count: c.count, countDistinct: c.countDistinct,
        fillRate: c.fillRate + '%', uniqueValues: c.unique,
        nullCount: c.nulls, typeMismatches: c.typeMismatch,
        qualityScore: c.score, numericStats: c.numericStats,
        mode: c.modeAll,
      })),
      issues: {
        duplicateRows: analysis.duplicates.map(d => ({ rowIndex: d.rowIndex, firstSeen: d.firstSeen })),
        duplicateColumns: analysis.columnDupes,
        columnsWithNulls: analysis.nullCols.map(c => c.header),
        columnsWithTypeMismatch: analysis.mismatchCols.map(c => c.header),
        lowFillRateColumns: analysis.lowFill.map(c => c.header),
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'data-quality-report.json' });
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Download data table ───────────────────────────────
  const downloadTable = async (format) => {
    if (!rawRows.length) return;
    const rows   = filteredTableRows;
    const hdrs   = headers;

    if (format === 'csv') {
      const lines = [hdrs.join(',')];
      rows.forEach(r => {
        lines.push(hdrs.map(h => {
          const v = String(r[h] ?? '').replace(/"/g, '""');
          return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v}"` : v;
        }).join(','));
      });
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: 'data-export.csv' });
      a.click(); URL.revokeObjectURL(url);

    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: 'data-export.json' });
      a.click(); URL.revokeObjectURL(url);

    } else if (format === 'xlsx') {
      await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      const wb  = window.XLSX.utils.book_new();
      const wsData = [hdrs, ...rows.map(r => hdrs.map(h => r[h] ?? ''))];
      const ws  = window.XLSX.utils.aoa_to_sheet(wsData);
      window.XLSX.utils.book_append_sheet(wb, ws, 'Data');
      window.XLSX.writeFile(wb, 'data-export.xlsx');
    }
  };

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  // ── Filtered columns ──────────────────────────────────
  const filteredCols = analysis?.columnStats.filter(c =>
    !searchCol || c.header.toLowerCase().includes(searchCol.toLowerCase())
  ) || [];

  // ── Table rows with search filter ─────────────────────
  const filteredTableRows = tableSearch.trim()
    ? rawRows.filter(row =>
        Object.values(row).some(v => String(v ?? '').toLowerCase().includes(tableSearch.toLowerCase()))
      )
    : rawRows;

  const totalPages = Math.ceil(filteredTableRows.length / pageSize);
  const pagedRows  = filteredTableRows.slice(tablePage * pageSize, (tablePage + 1) * pageSize);

  // ── Drag & Drop ───────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-b border-slate-800 py-14">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-cyan-900/40 text-cyan-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 border border-cyan-700/50">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            Free · Browser-Only · No Upload · No Signup
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            CSV &amp; Excel{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Data Analyzer
            </span>
          </h1>
          <p className="text-slate-300 text-lg font-semibold mb-2">
            Find Duplicates, Null Values and Data Errors Instantly
          </p>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-6">
            Upload any CSV, Excel or JSON file or connect a REST API and get a complete data quality
            report in seconds. Detects duplicate rows, duplicate columns, missing values, type mismatches,
            outliers and column statistics. No code, no install, all rows processed.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {['Find Duplicates','Null Detection','Type Mismatch','Column Stats','Outlier Detection',
              'Pattern Recognition','Quality Score','API Support','Schema Inference','Export Report'].map(f => (
              <span key={f} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-medium">{f}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* ── INPUT PANEL ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex border-b border-slate-800">
            {[
              { key: 'file', label: '📁 File Upload', desc: 'CSV / Excel / JSON all rows' },
              { key: 'api',  label: '📡 API / URL',   desc: 'REST endpoint' },
            ].map(t => (
              <button key={t.key} onClick={() => { setSource(t.key); setError(''); }}
                className={'flex-1 py-4 text-sm font-bold transition-all border-b-2 ' +
                  (source === t.key ? 'border-cyan-500 text-cyan-300 bg-slate-800/40' : 'border-transparent text-slate-500 hover:text-slate-300')}>
                {t.label}
                <span className="block text-xs font-normal text-slate-600 mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {source === 'file' ? (
              <div onDrop={onDrop} onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-600 rounded-2xl p-10 text-center cursor-pointer transition-all group">
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden"
                  onChange={e => handleFile(e.target.files?.[0])} />
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <p className="text-slate-300 font-bold text-base mb-1">Drop your data file here or click to browse</p>
                <p className="text-slate-500 text-sm">CSV, Excel (.xlsx, .xls) or JSON · All rows processed · Runs entirely in your browser</p>
                {fileName && !loading && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-cyan-900/30 border border-cyan-700 text-cyan-300 text-xs font-bold px-4 py-2 rounded-full">
                    ✓ {fileName}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">API Endpoint URL</label>
                    <input value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleApiLoad()}
                      placeholder="https://api.example.com/v1/data"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-slate-200 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Bearer Token (optional)</label>
                    <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="eyJ..."
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-cyan-500 text-slate-200 text-sm font-mono" />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
                    {['GET','POST'].map(m => (
                      <button key={m} onClick={() => setApiMethod(m)}
                        className={'text-xs font-bold px-4 py-2 rounded-lg transition-all ' +
                          (apiMethod === m ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200')}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['https://jsonplaceholder.typicode.com/posts','https://jsonplaceholder.typicode.com/users',
                      'https://catfact.ninja/facts?limit=50'].map(url => (
                      <button key={url} onClick={() => setApiUrl(url)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 px-3 py-1.5 rounded-lg transition-all font-mono">
                        {url.split('/').slice(-1)[0] || 'demo'}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleApiLoad} disabled={loading || !apiUrl.trim()}
                    className="ml-auto px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold text-sm rounded-xl transition-all">
                    {loading ? 'Loading...' : 'Analyze ▶'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-800 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <div className="text-rose-300 font-bold text-sm">Error</div>
              <div className="text-rose-400/80 text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <div className="text-slate-300 font-bold">Analyzing your data...</div>
            <div className="text-slate-500 text-sm">Processing all rows detecting duplicates, nulls, type mismatches and patterns</div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {analysis && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'Total Rows',    value: fmt(analysis.totalRows),          icon: '📋', color: 'text-white' },
                { label: 'Columns',       value: fmt(analysis.totalCols),          icon: '📊', color: 'text-white' },
                { label: 'Completeness',  value: analysis.completeness + '%',      icon: '✅', color: analysis.completeness === 100 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Null Values',   value: fmt(analysis.totalNulls),         icon: '⬜', color: analysis.totalNulls === 0 ? 'text-emerald-400' : 'text-rose-400' },
                { label: 'Dupe Rows',     value: fmt(analysis.duplicates.length),  icon: '🔁', color: analysis.duplicates.length === 0 ? 'text-emerald-400' : 'text-rose-400' },
                { label: 'Dupe Columns',  value: fmt(analysis.columnDupes.length), icon: '📋', color: analysis.columnDupes.length === 0 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Type Issues',   value: fmt(analysis.mismatchCols.length),icon: '⚡', color: analysis.mismatchCols.length === 0 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Quality Score', value: analysis.qualityScore + '/100',   icon: '🏆', color: scoreColor(analysis.qualityScore) },
              ].map(card => (
                <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{card.icon}</div>
                  <div className={'text-lg font-extrabold ' + card.color}>{card.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Quality Banner */}
            <div className={'border rounded-2xl p-5 flex items-center gap-5 flex-wrap ' + scoreBg(analysis.qualityScore)}>
              <div className="flex-shrink-0">
                <div className={'text-5xl font-extrabold ' + scoreColor(analysis.qualityScore)}>{analysis.qualityScore}</div>
                <div className={'text-sm font-bold ' + scoreColor(analysis.qualityScore)}>/ 100</div>
              </div>
              <div className="flex-1 min-w-60">
                <div className={'text-base font-extrabold ' + scoreColor(analysis.qualityScore)}>
                  Data Quality: {scoreLabel(analysis.qualityScore)}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {analysis.completeness}% complete · {analysis.duplicates.length} duplicate rows ·{' '}
                  {analysis.columnDupes.length} duplicate columns · {analysis.mismatchCols.length} type issues
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {analysis.duplicates.length > 0 && (
                    <span className="text-xs bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-bold">
                      ⚠ {analysis.duplicates.length} duplicate rows
                    </span>
                  )}
                  {analysis.columnDupes.length > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold">
                      📋 {analysis.columnDupes.length} duplicate columns
                    </span>
                  )}
                  {analysis.mismatchCols.map(c => (
                    <span key={c.header} className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold">
                      ⚡ {c.header}: type mismatch
                    </span>
                  ))}
                  {analysis.qualityScore === 100 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                      ✓ No issues detected
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <button onClick={exportReport}
                  className="text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl border border-slate-700 transition-all">
                  ↓ Export Report
                </button>
                <button onClick={() => copy(JSON.stringify({ rows: analysis.totalRows, cols: analysis.totalCols, score: analysis.qualityScore }, null, 2), 'summary')}
                  className={'text-sm font-bold px-4 py-2 rounded-xl border transition-all ' + (copied === 'summary' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300')}>
                  {copied === 'summary' ? '✓ Copied' : 'Copy Summary'}
                </button>
              </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex-wrap">
              {[
                { key: 'overview', label: '📊 Overview' },
                { key: 'columns',  label: '🔬 Column Stats' },
                { key: 'data',     label: '📋 Data Table' },
                { key: 'issues',   label: `⚠️ Issues (${analysis.duplicates.length + analysis.columnDupes.length + analysis.mismatchCols.length + analysis.nullCols.length})` },
                { key: 'schema',   label: '🗂 Schema' },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={'flex-1 min-w-fit py-2.5 px-4 rounded-xl text-xs font-bold transition-all ' +
                    (activeTab === t.key ? 'bg-cyan-600 text-white shadow' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800')}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">Column Type Distribution</h3>
                  <div className="flex flex-col gap-2">
                    {Object.entries(
                      analysis.columnStats.reduce((acc, c) => {
                        acc[c.dominantPattern] = (acc[c.dominantPattern] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-3">
                        <span className={'text-xs font-bold px-2 py-0.5 rounded-full min-w-20 text-center ' + (PATTERN_COLORS[type] || 'bg-slate-100 text-slate-700')}>
                          {PATTERN_ICONS[type]} {type}
                        </span>
                        <div className="flex-1 bg-slate-800 rounded-full h-2">
                          <div className="bg-cyan-500 h-2 rounded-full" style={{ width: (count / analysis.totalCols * 100) + '%' }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 w-6">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">Column Fill Rate</h3>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {analysis.columnStats.map(c => (
                      <div key={c.header} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono truncate w-28 flex-shrink-0" title={c.header}>{c.header}</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-2">
                          <div className={'h-2 rounded-full ' + (c.fillRate === 100 ? 'bg-emerald-500' : c.fillRate >= 70 ? 'bg-amber-500' : 'bg-rose-500')}
                            style={{ width: c.fillRate + '%' }} />
                        </div>
                        <span className={'text-xs font-bold w-10 text-right ' + (c.fillRate === 100 ? 'text-emerald-400' : c.fillRate >= 70 ? 'text-amber-400' : 'text-rose-400')}>
                          {c.fillRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Numeric Column Summary */}
                {analysis.columnStats.filter(c => c.numericStats).length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
                    <h3 className="text-sm font-extrabold text-slate-200 mb-4">Numeric Column Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-800">
                            {['Column','Count','Count Distinct','Min','Max','Mean','Median','Mode','Std Dev','Sum','Outliers'].map(h => (
                              <th key={h} className="text-left py-2 px-3 text-slate-500 font-bold whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.columnStats.filter(c => c.numericStats).map(c => (
                            <tr key={c.header} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-bold text-slate-300 font-mono">{c.header}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{c.numericStats.count.toLocaleString()}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{c.numericStats.countDistinct.toLocaleString()}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.min)}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.max)}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.mean)}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.median)}</td>
                              <td className="py-2 px-3 text-cyan-400 font-mono">
                                {c.numericStats.mode ? `${c.numericStats.mode.value} (×${c.numericStats.mode.count})` : '—'}
                              </td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.stdDev)}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.sum)}</td>
                              <td className="py-2 px-3">
                                <span className={'font-bold ' + (c.numericStats.outliers > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                                  {c.numericStats.outliers}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── COLUMNS TAB ── */}
            {activeTab === 'columns' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <input value={searchCol} onChange={e => setSearchCol(e.target.value)}
                    placeholder="Search columns..."
                    className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl outline-none focus:border-cyan-500 text-slate-200 text-sm flex-1 max-w-xs" />
                  <span className="text-xs text-slate-500">{filteredCols.length} of {analysis.totalCols} columns</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCols.map(col => (
                    <div key={col.header} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-cyan-700 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-slate-200 text-sm font-mono truncate max-w-44" title={col.header}>{col.header}</div>
                          <span className={'text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ' + (PATTERN_COLORS[col.dominantPattern] || 'bg-slate-100 text-slate-700')}>
                            {PATTERN_ICONS[col.dominantPattern]} {col.dominantPattern}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={'text-lg font-extrabold ' + scoreColor(col.score)}>{col.score}</div>
                          <div className="text-xs text-slate-500">score</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        {[
                          { label: 'Fill Rate',      value: col.fillRate + '%',         color: col.fillRate === 100 ? 'text-emerald-400' : col.fillRate >= 70 ? 'text-amber-400' : 'text-rose-400' },
                          { label: 'Count Distinct', value: col.countDistinct,          color: 'text-slate-300' },
                          { label: 'Nulls',          value: col.nulls,                  color: col.nulls === 0 ? 'text-emerald-400' : 'text-rose-400' },
                        ].map(s => (
                          <div key={s.label} className="bg-slate-800/50 rounded-lg py-2">
                            <div className={'text-sm font-extrabold ' + s.color}>{s.value}</div>
                            <div className="text-xs text-slate-600">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {col.modeAll && (
                        <div className="text-xs text-slate-500 font-mono mb-1">
                          Mode: <span className="text-cyan-400">{String(col.modeAll.value).slice(0, 20)}</span> ×{col.modeAll.count}
                        </div>
                      )}
                      {col.typeMismatch > 0 && (
                        <div className="mt-1 text-xs bg-amber-900/30 border border-amber-800 text-amber-300 rounded-lg px-2 py-1">
                          ⚡ {col.typeMismatch} type mismatch{col.typeMismatch > 1 ? 'es' : ''}
                        </div>
                      )}
                      {col.numericStats && (
                        <div className="mt-2 text-xs text-slate-500 font-mono">
                          min {fmt(col.numericStats.min)} · max {fmt(col.numericStats.max)} · avg {fmt(col.numericStats.mean)}
                        </div>
                      )}
                      {col.strStats && (
                        <div className="mt-2 text-xs text-slate-500 font-mono">
                          len {col.strStats.minLen}–{col.strStats.maxLen} · avg {col.strStats.avgLen}
                        </div>
                      )}
                      {col.topValues.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-slate-600 mb-1 font-bold">Top Values</div>
                          <div className="flex flex-wrap gap-1">
                            {col.topValues.slice(0, 3).map(v => (
                              <span key={v.val} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono truncate max-w-full" title={v.val}>
                                {String(v.val).slice(0, 18)}{String(v.val).length > 18 ? '…' : ''} ×{v.count}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DATA TABLE TAB ── */}
            {activeTab === 'data' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Table toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input value={tableSearch} onChange={e => { setTableSearch(e.target.value); setTablePage(0); }}
                      placeholder="Search in table..."
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 outline-none focus:border-cyan-500 w-48" />
                    <span className="text-xs text-slate-500">
                      {filteredTableRows.length.toLocaleString()} rows
                      {tableSearch && ` (filtered from ${rawRows.length.toLocaleString()})`}
                    </span>
                    <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setTablePage(0); }}
                      className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 outline-none">
                      {[25, 50, 100, 250].map(n => <option key={n} value={n}>{n} / page</option>)}
                    </select>
                  </div>
                  {/* Download buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Download:</span>
                    {['csv', 'xlsx', 'json'].map(fmt => (
                      <button key={fmt} onClick={() => downloadTable(fmt)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-lg transition-all uppercase">
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-auto max-h-[560px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-800 z-10">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-slate-500 font-bold border-b border-slate-700 w-12">#</th>
                        {headers.map(h => {
                          const col = analysis.columnStats.find(c => c.header === h);
                          const isColDupe = analysis.columnDupes.some(d => d.col1 === h || d.col2 === h);
                          return (
                            <th key={h} className={'px-3 py-2.5 text-left border-b border-slate-700 whitespace-nowrap max-w-36 ' + (isColDupe ? 'bg-amber-900/20' : '')}>
                              <div className={'font-bold truncate ' + (isColDupe ? 'text-amber-300' : 'text-slate-300')} title={h}>
                                {h} {isColDupe && <span className="text-amber-400 text-xs">⊕</span>}
                              </div>
                              {col && (
                                <span className={'text-xs font-bold px-1.5 py-0.5 rounded ' + (PATTERN_COLORS[col.dominantPattern] || '')}>
                                  {PATTERN_ICONS[col.dominantPattern]} {col.dominantPattern}
                                </span>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((row, ri) => {
                        const absIdx = tablePage * pageSize + ri;
                        const isDupe = analysis.duplicates.some(d => d.rowIndex === absIdx + 2);
                        return (
                          <tr key={ri} className={'border-b border-slate-800/50 ' + (isDupe ? 'bg-rose-950/20' : ri % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/20')}>
                            <td className="px-3 py-2 text-slate-600 font-mono">
                              {absIdx + 1}
                              {isDupe && <span className="ml-1 text-rose-500 font-bold" title="Duplicate row">⊕</span>}
                            </td>
                            {headers.map(h => {
                              const val      = row[h];
                              const isEmpty  = val === null || val === undefined || String(val).trim() === '';
                              const col      = analysis.columnStats.find(c => c.header === h);
                              const isMismatch = col && (col.dominantPattern === 'integer' || col.dominantPattern === 'float')
                                && !isEmpty && isNaN(parseFloat(String(val)));
                              return (
                                <td key={h} className={'px-3 py-2 font-mono max-w-36 ' +
                                  (isEmpty ? 'text-slate-700 bg-slate-800/40' : isMismatch ? 'text-amber-400' : 'text-slate-300')}>
                                  <span className="truncate block" title={String(val ?? '')}>
                                    {isEmpty ? <span className="italic text-slate-600">null</span> : String(val).slice(0, 60)}
                                    {String(val ?? '').length > 60 ? '…' : ''}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination with page numbers */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 flex-wrap gap-2">
                    <span className="text-xs text-slate-500">
                      Rows {tablePage * pageSize + 1}–{Math.min((tablePage + 1) * pageSize, filteredTableRows.length)} of {filteredTableRows.length.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button onClick={() => setTablePage(0)} disabled={tablePage === 0}
                        className="text-xs px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-30 hover:bg-slate-700 text-slate-300">
                        «
                      </button>
                      <button onClick={() => setTablePage(p => Math.max(0, p - 1))} disabled={tablePage === 0}
                        className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-30 hover:bg-slate-700 text-slate-300">
                        ‹ Prev
                      </button>
                      {buildPageRange(tablePage + 1, totalPages).map((pg, i) => (
  pg === '...'
    ? <span key={`ellipsis-${i}`} className="text-xs text-slate-600 px-1">…</span>
    : <button key={`page-${pg}`} onClick={() => setTablePage(pg - 1)}
                              className={'text-xs px-3 py-1.5 rounded-lg border transition-all ' +
                                (tablePage + 1 === pg
                                  ? 'bg-cyan-600 text-white border-cyan-600 font-bold'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700')}>
                              {pg}
                            </button>
                      ))}
                      <button onClick={() => setTablePage(p => Math.min(totalPages - 1, p + 1))} disabled={tablePage >= totalPages - 1}
                        className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-30 hover:bg-slate-700 text-slate-300">
                        Next ›
                      </button>
                      <button onClick={() => setTablePage(totalPages - 1)} disabled={tablePage >= totalPages - 1}
                        className="text-xs px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-30 hover:bg-slate-700 text-slate-300">
                        »
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── ISSUES TAB ── */}
            {activeTab === 'issues' && (
              <div className="flex flex-col gap-4">

                {/* ── DUPLICATE ROWS ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-extrabold text-slate-200">
                      🔁 Duplicate Rows
                      <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' +
                        (analysis.duplicates.length === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400')}>
                        {analysis.duplicates.length}
                      </span>
                    </h3>
                    {analysis.duplicates.length > 0 && (
                      <button onClick={() => setShowDupes(!showDupes)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">
                        {showDupes ? 'Hide preview' : 'Show preview'}
                      </button>
                    )}
                  </div>

                  {analysis.duplicates.length === 0 ? (
                    <p className="text-sm text-emerald-400">✓ No duplicate rows found.</p>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-400 mb-3">
                        {analysis.duplicates.length} rows are exact duplicates of earlier rows.
                        Duplicate rows are highlighted in the Data Table tab with a ⊕ marker.
                      </p>
                      {/* Row numbers summary */}
                      <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
                        {analysis.duplicates.map((d, i) => (
                          <span key={i} className="text-xs bg-rose-900/30 border border-rose-800 text-rose-300 px-3 py-1 rounded-lg font-mono">
                            Row {d.rowIndex} = Row {d.firstSeen}
                          </span>
                        ))}
                      </div>
                      {/* Preview table of first 5 duplicate pairs */}
                      {showDupes && analysis.duplicates.slice(0, 5).length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Preview First {Math.min(5, analysis.duplicates.length)} Duplicate Rows
                          </div>
                          <div className="overflow-x-auto rounded-xl border border-rose-800/50">
                            <table className="w-full text-xs">
                              <thead className="bg-rose-950/40">
                                <tr>
                                  <th className="px-3 py-2 text-left text-rose-400 font-bold border-b border-rose-800/50">Row #</th>
                                  <th className="px-3 py-2 text-left text-rose-400 font-bold border-b border-rose-800/50">Duplicate of</th>
                                  {headers.slice(0, 6).map(h => (
                                    <th key={h} className="px-3 py-2 text-left text-slate-400 font-bold border-b border-rose-800/50 whitespace-nowrap">{h}</th>
                                  ))}
                                  {headers.length > 6 && <th className="px-3 py-2 text-slate-600 border-b border-rose-800/50">+{headers.length - 6} more</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {analysis.duplicates.slice(0, 5).map((d, i) => (
                                  <tr key={i} className="border-b border-rose-900/30 bg-rose-950/10">
                                    <td className="px-3 py-2 font-mono text-rose-400 font-bold">{d.rowIndex}</td>
                                    <td className="px-3 py-2 font-mono text-slate-500">Row {d.firstSeen}</td>
                                    {headers.slice(0, 6).map(h => (
                                      <td key={h} className="px-3 py-2 font-mono text-slate-300 max-w-24 truncate" title={String(d.rowData[h] ?? '')}>
                                        {String(d.rowData[h] ?? '').slice(0, 20)}
                                        {String(d.rowData[h] ?? '').length > 20 ? '…' : ''}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── DUPLICATE COLUMNS (NEW) ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">
                    📋 Duplicate Columns
                    <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' +
                      (analysis.columnDupes.length === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400')}>
                      {analysis.columnDupes.length}
                    </span>
                  </h3>
                  {analysis.columnDupes.length === 0 ? (
                    <p className="text-sm text-emerald-400">✓ No duplicate columns found.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-slate-400">
                        These column pairs contain identical values across all rows. One of each pair is redundant.
                        Duplicate columns are highlighted in the Data Table with a ⊕ marker on the column header.
                      </p>
                      {analysis.columnDupes.map((d, i) => (
                        <div key={i} className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="text-xs font-bold bg-amber-900/40 text-amber-300 border border-amber-700 px-3 py-1 rounded-lg font-mono">
                              {d.col1}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">= identical to =</span>
                            <span className="text-xs font-bold bg-amber-900/40 text-amber-300 border border-amber-700 px-3 py-1 rounded-lg font-mono">
                              {d.col2}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Sample Values (first 5 rows)</div>
                          <div className="flex gap-2 flex-wrap">
                            {d.sampleValues.map((v, vi) => (
                              <span key={vi} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                                {String(v).slice(0, 20)}{String(v).length > 20 ? '…' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── NULL COLUMNS ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">
                    ⬜ Columns with Null Values
                    <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' +
                      (analysis.nullCols.length === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400')}>
                      {analysis.nullCols.length}
                    </span>
                  </h3>
                  {analysis.nullCols.length === 0 ? (
                    <p className="text-sm text-emerald-400">✓ No null values found in any column.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.nullCols.map(c => (
                        <div key={c.header} className="bg-slate-800 rounded-xl p-3 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-bold text-slate-300 text-xs font-mono">{c.header}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{c.nulls} null values ({100 - c.fillRate}% empty)</div>
                          </div>
                          <div className={'text-sm font-extrabold ' + (c.fillRate >= 70 ? 'text-amber-400' : 'text-rose-400')}>
                            {c.fillRate}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── TYPE MISMATCHES ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">
                    ⚡ Type Mismatch Columns
                    <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' +
                      (analysis.mismatchCols.length === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400')}>
                      {analysis.mismatchCols.length}
                    </span>
                  </h3>
                  {analysis.mismatchCols.length === 0 ? (
                    <p className="text-sm text-emerald-400">✓ No type mismatches detected.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.mismatchCols.map(c => (
                        <div key={c.header} className="bg-slate-800 rounded-xl p-3">
                          <div className="font-bold text-slate-300 text-xs font-mono">{c.header}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Expected <span className="text-amber-400 font-bold">{c.dominantPattern}</span> but {c.typeMismatch} value{c.typeMismatch > 1 ? 's' : ''} are non-numeric strings
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── OUTLIERS ── */}
                {analysis.columnStats.filter(c => c.numericStats?.outliers > 0).length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-extrabold text-slate-200 mb-4">📉 Statistical Outliers (3σ)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.columnStats.filter(c => c.numericStats?.outliers > 0).map(c => (
                        <div key={c.header} className="bg-slate-800 rounded-xl p-3">
                          <div className="font-bold text-slate-300 text-xs font-mono">{c.header}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {c.numericStats.outliers} value{c.numericStats.outliers > 1 ? 's' : ''} more than 3 standard deviations from mean ({fmt(c.numericStats.mean)})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SCHEMA TAB ── */}
            {activeTab === 'schema' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
                  <h3 className="text-sm font-extrabold text-slate-200">Inferred Schema</h3>
                  <button onClick={() => {
                    const schema = analysis.columnStats.map(c => ({
                      column: c.header, type: c.dominantPattern,
                      nullable: c.nulls > 0, unique: c.uniqueRate === 100,
                      fillRate: c.fillRate + '%', sample: c.topValues[0]?.val || '',
                    }));
                    copy(JSON.stringify(schema, null, 2), 'schema');
                  }} className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' +
                    (copied === 'schema' ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700')}>
                    {copied === 'schema' ? '✓ Copied' : 'Copy Schema JSON'}
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-800">
                      <tr>
                        {['#','Column Name','Inferred Type','Count','Count Distinct','Nullable','Unique','Fill Rate','Mode','Sample'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-slate-400 font-bold border-b border-slate-700 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.columnStats.map((c, i) => (
                        <tr key={c.header} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="px-4 py-3 text-slate-600 font-mono">{i + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-300 font-mono">{c.header}</td>
                          <td className="px-4 py-3">
                            <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (PATTERN_COLORS[c.dominantPattern] || 'bg-slate-100 text-slate-700')}>
                              {PATTERN_ICONS[c.dominantPattern]} {c.dominantPattern}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono">{c.count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono">{c.countDistinct.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={c.nulls > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                              {c.nulls > 0 ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={c.uniqueRate === 100 ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                              {c.uniqueRate === 100 ? 'YES' : c.unique + ' vals'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={c.fillRate === 100 ? 'text-emerald-400' : 'text-amber-400'}>{c.fillRate}%</span>
                          </td>
                          <td className="px-4 py-3 text-cyan-400 font-mono max-w-24 truncate">
                            {c.modeAll ? String(c.modeAll.value).slice(0, 16) : '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 max-w-36 truncate" title={c.topValues[0]?.val || ''}>
                            {c.topValues[0]?.val ? String(c.topValues[0].val).slice(0, 30) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── RELATED TOOLS ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-extrabold text-slate-200 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-500 mb-4">Free tools that complement your data analysis and BI workflow.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map(t => (
              <a key={t.href} href={t.href}
                className="flex items-start gap-3 p-4 border border-slate-700 rounded-xl hover:border-cyan-600 hover:bg-cyan-950/20 transition-all group">
                <span className="text-2xl flex-shrink-0">{t.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">{t.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-200 mb-5">
            Free CSV and Excel Data Analyzer Check for Duplicates, Nulls and Errors Online
          </h2>
          <h3 className="text-sm font-bold text-slate-300 mb-2">What Does This Tool Do?</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This free data analyzer helps BI developers, data analysts and anyone who works with
            spreadsheets to instantly find problems in CSV and Excel files. Upload your file and
            within seconds you know exactly how many duplicate rows exist, which columns have missing
            values, where data types are inconsistent and what the statistical distribution of every
            numeric column looks like. No Python, no SQL, no formulas required.
          </p>
          <h3 className="text-sm font-bold text-slate-300 mb-2">Why No Row Limit?</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Unlike many online tools that cap processing at 10,000 rows, this analyzer processes
            your entire file regardless of size. All computation runs locally in your browser using
            JavaScript. Your data never leaves your device. For very large files above 500,000 rows,
            analysis may take a few seconds depending on your device memory, but all rows are included
            in every statistic.
          </p>
          <h3 className="text-sm font-bold text-slate-300 mb-2">Frequently Asked Questions</h3>
          <div className="flex flex-col gap-3">
            {[
              { q: 'How do I find duplicate rows in a CSV file?', a: 'Upload your CSV to this tool. The Issues tab shows all duplicate rows with their row numbers and a preview table of the first five duplicate pairs. Duplicate rows are also highlighted in the Data Table with a ⊕ marker.' },
              { q: 'What is a duplicate column?', a: 'A duplicate column is a column that contains identical values to another column across all rows. This tool detects these automatically and shows which column pairs are identical, along with sample values from each pair.' },
              { q: 'Can I analyze Excel files for data quality?', a: 'Yes. Upload .xlsx or .xls files directly. The tool reads all sheets data from the first sheet and runs the complete analysis including duplicate detection, null checking, type validation and numeric statistics.' },
              { q: 'What is Count Distinct in the numeric summary?', a: 'Count Distinct shows how many unique values exist in a column. If Count is 1000 and Count Distinct is 50, that column only has 50 different values repeated across 1000 rows. This helps identify categorical columns disguised as numeric ones.' },
              { q: 'What does Mode mean in the column statistics?', a: 'Mode is the most frequently occurring value in a column. For a product category column, the mode would be the most common category. For a numeric column, it shows the most frequently repeated number. This helps spot dominant values or data entry defaults.' },
              { q: 'How do I download the analyzed data as Excel?', a: 'Go to the Data Table tab. At the top right you will see Download buttons for CSV, XLSX and JSON. These download the currently filtered view of your data.' },
            ].map(faq => (
              <div key={faq.q} className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-sm font-bold text-slate-300 mb-1">{faq.q}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}