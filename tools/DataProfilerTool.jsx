'use client';

import { useState, useCallback, useRef } from 'react';

// ── External libs loaded from CDN via useEffect ────────────────────────────
// SheetJS  → xlsx parsing
// PapaParse → CSV parsing
// Both loaded dynamically so no npm install needed

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

function analyzeColumn(values, header) {
  const total   = values.length;
  const nulls   = values.filter(v => v === null || v === undefined || v === '' || String(v).trim() === '').length;
  const nonNull = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  const unique  = new Set(nonNull.map(v => String(v).trim().toLowerCase())).size;

  // Pattern detection on non-null values (sample first 200)
  const sample = nonNull.slice(0, 200);
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
    const sorted = [...nums].sort((a, b) => a - b);
    const sum    = nums.reduce((a, b) => a + b, 0);
    const mean   = sum / nums.length;
    const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
    const stdDev = Math.sqrt(variance);
    const median = sorted[Math.floor(sorted.length / 2)];
    const outliers = nums.filter(n => Math.abs(n - mean) > 3 * stdDev).length;

    numericStats = {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: Math.round(mean * 100) / 100,
      median,
      stdDev: Math.round(stdDev * 100) / 100,
      sum:    Math.round(sum * 100) / 100,
      outliers,
      negative: nums.filter(n => n < 0).length,
      zero:     nums.filter(n => n === 0).length,
    };
  }

  // Type mismatch: declared numeric but has non-numeric non-null values
  const typeMismatch = dominantPattern === 'integer' || dominantPattern === 'float'
    ? nonNull.filter(v => isNaN(parseFloat(String(v).replace(/,/g, '')))).length
    : 0;

  // Top values frequency
  const freq = {};
  nonNull.slice(0, 500).forEach(v => {
    const k = String(v).trim();
    freq[k] = (freq[k] || 0) + 1;
  });
  const topValues = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([val, count]) => ({ val, count, pct: Math.round(count / total * 100) }));

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

  const fillRate = total > 0 ? Math.round((1 - nulls / total) * 100) : 100;
  const uniqueRate = nonNull.length > 0 ? Math.round(unique / nonNull.length * 100) : 0;

  // Column quality score
  let score = 100;
  if (fillRate < 100) score -= Math.min(40, (100 - fillRate) * 2);
  if (typeMismatch > 0) score -= Math.min(30, typeMismatch * 5);
  if (uniqueRate === 0 && total > 1) score -= 10;
  score = Math.max(0, score);

  return {
    header,
    total,
    nulls,
    nonNull:   nonNull.length,
    unique,
    fillRate,
    uniqueRate,
    dominantPattern,
    numericStats,
    typeMismatch,
    topValues,
    strStats,
    score,
    patternCounts,
  };
}

function findDuplicates(rows) {
  const seen  = new Map();
  const dupes = [];
  rows.forEach((row, i) => {
    const key = JSON.stringify(Object.values(row).map(v => String(v ?? '').trim().toLowerCase()));
    if (seen.has(key)) {
      dupes.push({ rowIndex: i + 2, firstSeen: seen.get(key) + 2 });
    } else {
      seen.set(key, i);
    }
  });
  return dupes;
}

function analyzeDataset(rows, headers) {
  if (!rows.length) return null;

  const columnStats = headers.map(h =>
    analyzeColumn(rows.map(r => r[h]), h)
  );

  const duplicates = findDuplicates(rows);

  // Overall quality score
  const avgColScore = columnStats.reduce((a, c) => a + c.score, 0) / columnStats.length;
  const dupeDeduction = Math.min(30, duplicates.length * 2);
  const qualityScore = Math.max(0, Math.round(avgColScore - dupeDeduction));

  // Total nulls across all columns
  const totalNulls = columnStats.reduce((a, c) => a + c.nulls, 0);
  const totalCells = rows.length * headers.length;

  // Columns with issues
  const nullCols     = columnStats.filter(c => c.nulls > 0);
  const mismatchCols = columnStats.filter(c => c.typeMismatch > 0);
  const lowFill      = columnStats.filter(c => c.fillRate < 70);

  return {
    totalRows:    rows.length,
    totalCols:    headers.length,
    totalCells,
    totalNulls,
    completeness: Math.round((1 - totalNulls / totalCells) * 100),
    duplicates,
    columnStats,
    qualityScore,
    nullCols,
    mismatchCols,
    lowFill,
    headers,
  };
}

// ── Flatten nested JSON array ──────────────────────────────
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
  // Handle array of objects
  if (Array.isArray(data)) {
    const flat = data.slice(0, 10000).map(item =>
      typeof item === 'object' && item !== null ? flattenObject(item) : { value: item }
    );
    const headers = [...new Set(flat.flatMap(r => Object.keys(r)))];
    return { rows: flat, headers };
  }
  // Handle object with array value
  for (const val of Object.values(data)) {
    if (Array.isArray(val) && val.length > 0) {
      return extractRowsFromJson(val);
    }
  }
  // Single object
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

const scoreColor = (s) =>
  s >= 90 ? 'text-emerald-600' : s >= 70 ? 'text-amber-600' : 'text-rose-600';

const scoreBg = (s) =>
  s >= 90 ? 'bg-emerald-50 border-emerald-200' : s >= 70 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200';

const scoreLabel = (s) =>
  s >= 90 ? 'Excellent' : s >= 70 ? 'Good' : s >= 50 ? 'Fair' : 'Poor';

const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  if (typeof n === 'number') {
    return Math.abs(n) >= 1000000 ? (n / 1000000).toFixed(1) + 'M'
      : Math.abs(n) >= 1000 ? (n / 1000).toFixed(1) + 'K'
      : String(n);
  }
  return String(n);
};

const RELATED_TOOLS = [
  { name: 'CSV to SQL',        href: '/tools/csv-to-sql',        icon: '🗄️',  desc: 'Convert your profiled CSV data to SQL INSERT statements' },
  { name: 'JSON Formatter',    href: '/tools/json-formatter',    icon: '{ }', desc: 'Format and validate JSON API responses' },
  { name: 'API Request Tester',href: '/tools/api-request-tester',icon: '📡',  desc: 'Test REST APIs and inspect JSON data live' },
  { name: 'SQL Formatter',     href: '/tools/sql-formatter',     icon: '🗄️',  desc: 'Format SQL queries for data analysis work' },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function DataProfilerTool() {
  const [source, setSource]     = useState('file');   // file | api
  const [apiUrl, setApiUrl]     = useState('');
  const [apiKey, setApiKey]     = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fileName, setFileName] = useState('');

  const [rawRows, setRawRows]   = useState([]);
  const [headers, setHeaders]   = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const [activeTab, setActiveTab]   = useState('overview');
  const [searchCol, setSearchCol]   = useState('');
  const [tablePage, setTablePage]   = useState(0);
  const [selectedCol, setSelectedCol] = useState(null);
  const [showDupes, setShowDupes]   = useState(false);
  const [copied, setCopied]         = useState('');

  const fileRef = useRef(null);
  const PAGE_SIZE = 50;

  // ── Load libs dynamically ─────────────────────────────
  const loadLib = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  // ── Process rows after parse ──────────────────────────
  const processData = useCallback((rows, hdrs, name = '') => {
    if (!rows.length) { setError('No data rows found in the file.'); return; }
    setRawRows(rows);
    setHeaders(hdrs);
    setFileName(name);
    setAnalysis(analyzeDataset(rows, hdrs));
    setActiveTab('overview');
    setTablePage(0);
    setSelectedCol(null);
    setError('');
  }, []);

  // ── File Upload ───────────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true); setError(''); setAnalysis(null);
    try {
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'csv') {
        await loadLib('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js');
        const text = await file.text();
        const result = window.Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
        if (result.errors.length && !result.data.length) throw new Error(result.errors[0].message);
        processData(result.data, result.meta.fields || [], file.name);

      } else if (['xlsx', 'xls'].includes(ext)) {
        await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        const buffer = await file.arrayBuffer();
        const wb = window.XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = window.XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (!data.length) throw new Error('No data found in spreadsheet.');
        processData(data, Object.keys(data[0]), file.name);

      } else if (ext === 'json') {
        const text = await file.text();
        const json = JSON.parse(text);
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

  // ── API Fetch ─────────────────────────────────────────
  const handleApiLoad = async () => {
    if (!apiUrl.trim()) { setError('Please enter an API URL.'); return; }
    setLoading(true); setError(''); setAnalysis(null);
    try {
      const hdrs = { 'Accept': 'application/json' };
      if (apiKey.trim()) hdrs['Authorization'] = 'Bearer ' + apiKey.trim();
      const res = await fetch(apiUrl.trim(), { method: apiMethod, headers: hdrs });
      if (!res.ok) throw new Error(`API returned ${res.status} ${res.statusText}`);
      const json = await res.json();
      const { rows, headers: rHdrs } = extractRowsFromJson(json);
      processData(rows, rHdrs, apiUrl.trim());
    } catch (e) {
      setError(e.message.includes('Failed to fetch') ? 'CORS error or network issue. The API may not allow browser requests.' : e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Export Report ─────────────────────────────────────
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
        totalNullValues: analysis.totalNulls,
      },
      columns: analysis.columnStats.map(c => ({
        name: c.header,
        type: c.dominantPattern,
        fillRate: c.fillRate + '%',
        uniqueValues: c.unique,
        nullCount: c.nulls,
        typeMismatches: c.typeMismatch,
        qualityScore: c.score,
        numericStats: c.numericStats,
      })),
      issues: {
        duplicateRows: analysis.duplicates,
        columnsWithNulls: analysis.nullCols.map(c => c.header),
        columnsWithTypeMismatch: analysis.mismatchCols.map(c => c.header),
        lowFillRateColumns: analysis.lowFill.map(c => c.header),
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'data-profile-report.json' });
    a.click();
    URL.revokeObjectURL(url);
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

  const pagedRows = rawRows.slice(tablePage * PAGE_SIZE, (tablePage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(rawRows.length / PAGE_SIZE);

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
            BI Developer Tool · Free · Browser-Only · No Upload
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Data{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Profiler
            </span>
            {' '}&amp; Quality Inspector
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-6">
            Upload CSV, Excel or JSON files — or connect any REST API — and instantly get a full data quality report.
            Detect nulls, duplicates, type mismatches, outliers, patterns and column-level statistics in seconds.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {['Null Detection','Duplicate Rows','Type Mismatch','Outlier Detection','Pattern Recognition',
              'Column Stats','Data Quality Score','API Inspector','Schema Inference','Export Report'].map(f => (
              <span key={f} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-medium">{f}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* ── INPUT PANEL ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Source tabs */}
          <div className="flex border-b border-slate-800">
            {[
              { key: 'file', label: '📁 File Upload', desc: 'CSV / Excel / JSON' },
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
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-600 rounded-2xl p-10 text-center cursor-pointer transition-all group">
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden"
                  onChange={e => handleFile(e.target.files?.[0])} />
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                <p className="text-slate-300 font-bold text-base mb-1">Drop your data file here or click to browse</p>
                <p className="text-slate-500 text-sm">Supports CSV, Excel (.xlsx, .xls) and JSON — up to 100,000 rows — processed entirely in your browser</p>
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
                    <input value={apiKey} onChange={e => setApiKey(e.target.value)}
                      placeholder="eyJ..."
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
                    {loading ? 'Loading...' : 'Analyze API ▶'}
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
            <div className="text-slate-500 text-sm">Detecting types, patterns, nulls and duplicates</div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {analysis && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Rows',         value: fmt(analysis.totalRows),    icon: '📋', color: 'text-white' },
                { label: 'Columns',      value: fmt(analysis.totalCols),    icon: '📊', color: 'text-white' },
                { label: 'Completeness', value: analysis.completeness + '%',icon: '✅', color: analysis.completeness === 100 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Null Values',  value: fmt(analysis.totalNulls),   icon: '⬜', color: analysis.totalNulls === 0 ? 'text-emerald-400' : 'text-rose-400' },
                { label: 'Duplicates',   value: fmt(analysis.duplicates.length), icon: '🔁', color: analysis.duplicates.length === 0 ? 'text-emerald-400' : 'text-rose-400' },
                { label: 'Type Issues',  value: fmt(analysis.mismatchCols.length), icon: '⚡', color: analysis.mismatchCols.length === 0 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Quality Score',value: analysis.qualityScore + '/100', icon: '🏆', color: scoreColor(analysis.qualityScore) },
              ].map(card => (
                <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{card.icon}</div>
                  <div className={'text-xl font-extrabold ' + card.color}>{card.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Quality Score Banner */}
            <div className={'border rounded-2xl p-5 flex items-center gap-5 ' + scoreBg(analysis.qualityScore)}>
              <div className="flex-shrink-0">
                <div className={'text-5xl font-extrabold ' + scoreColor(analysis.qualityScore)}>
                  {analysis.qualityScore}
                </div>
                <div className={'text-sm font-bold ' + scoreColor(analysis.qualityScore)}>/ 100</div>
              </div>
              <div className="flex-1">
                <div className={'text-base font-extrabold ' + scoreColor(analysis.qualityScore)}>
                  Data Quality: {scoreLabel(analysis.qualityScore)}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {analysis.completeness}% complete · {analysis.duplicates.length} duplicate rows ·{' '}
                  {analysis.mismatchCols.length} type mismatch columns · {analysis.nullCols.length} columns with nulls
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {analysis.duplicates.length > 0 && (
                    <span className="text-xs bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-bold">
                      ⚠ {analysis.duplicates.length} duplicate rows
                    </span>
                  )}
                  {analysis.mismatchCols.map(c => (
                    <span key={c.header} className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold">
                      ⚡ {c.header}: type mismatch
                    </span>
                  ))}
                  {analysis.lowFill.map(c => (
                    <span key={c.header} className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full font-bold">
                      🔸 {c.header}: {c.fillRate}% filled
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
                { key: 'overview',  label: '📊 Overview'    },
                { key: 'columns',   label: '🔬 Column Stats' },
                { key: 'data',      label: '📋 Data Table'   },
                { key: 'issues',    label: '⚠️ Issues' + (analysis.duplicates.length + analysis.mismatchCols.length + analysis.nullCols.length > 0 ? ' (' + (analysis.duplicates.length + analysis.mismatchCols.length + analysis.nullCols.length) + ')' : '') },
                { key: 'schema',    label: '🗂 Schema'       },
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
                {/* Column type distribution */}
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
                          <div className="bg-cyan-500 h-2 rounded-full transition-all"
                            style={{ width: (count / analysis.totalCols * 100) + '%' }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 w-6">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fill rate per column */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">Column Fill Rate</h3>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {analysis.columnStats.map(c => (
                      <div key={c.header} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono truncate w-28 flex-shrink-0" title={c.header}>{c.header}</span>
                        <div className="flex-1 bg-slate-800 rounded-full h-2">
                          <div className={'h-2 rounded-full transition-all ' +
                            (c.fillRate === 100 ? 'bg-emerald-500' : c.fillRate >= 70 ? 'bg-amber-500' : 'bg-rose-500')}
                            style={{ width: c.fillRate + '%' }} />
                        </div>
                        <span className={'text-xs font-bold w-10 text-right ' +
                          (c.fillRate === 100 ? 'text-emerald-400' : c.fillRate >= 70 ? 'text-amber-400' : 'text-rose-400')}>
                          {c.fillRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Numeric columns summary */}
                {analysis.columnStats.filter(c => c.numericStats).length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
                    <h3 className="text-sm font-extrabold text-slate-200 mb-4">Numeric Column Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-800">
                            {['Column','Min','Max','Mean','Median','Std Dev','Sum','Outliers'].map(h => (
                              <th key={h} className="text-left py-2 px-3 text-slate-500 font-bold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.columnStats.filter(c => c.numericStats).map(c => (
                            <tr key={c.header} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                              <td className="py-2 px-3 font-bold text-slate-300 font-mono">{c.header}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.min)}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.max)}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.mean)}</td>
                              <td className="py-2 px-3 text-slate-400 font-mono">{fmt(c.numericStats.median)}</td>
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
                    <div key={col.header}
                      onClick={() => setSelectedCol(selectedCol?.header === col.header ? null : col)}
                      className={'bg-slate-900 border rounded-2xl p-4 cursor-pointer transition-all hover:border-cyan-700 ' +
                        (selectedCol?.header === col.header ? 'border-cyan-600 ring-1 ring-cyan-600' : 'border-slate-800')}>
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
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { label: 'Fill Rate', value: col.fillRate + '%', color: col.fillRate === 100 ? 'text-emerald-400' : col.fillRate >= 70 ? 'text-amber-400' : 'text-rose-400' },
                          { label: 'Unique', value: col.unique, color: 'text-slate-300' },
                          { label: 'Nulls', value: col.nulls, color: col.nulls === 0 ? 'text-emerald-400' : 'text-rose-400' },
                        ].map(s => (
                          <div key={s.label} className="bg-slate-800/50 rounded-lg py-2">
                            <div className={'text-sm font-extrabold ' + s.color}>{s.value}</div>
                            <div className="text-xs text-slate-600">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {col.typeMismatch > 0 && (
                        <div className="mt-2 text-xs bg-amber-900/30 border border-amber-800 text-amber-300 rounded-lg px-2 py-1">
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
                          len {col.strStats.minLen}–{col.strStats.maxLen} chars · avg {col.strStats.avgLen}
                        </div>
                      )}
                      {col.topValues.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-slate-600 mb-1 font-bold">Top Values</div>
                          <div className="flex flex-wrap gap-1">
                            {col.topValues.slice(0, 3).map(v => (
                              <span key={v.val} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-mono truncate max-w-full" title={v.val}>
                                {String(v.val).slice(0, 20)}{String(v.val).length > 20 ? '…' : ''} ×{v.count}
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
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 flex-wrap gap-2">
                  <div className="text-xs font-bold text-slate-400">
                    Showing rows {tablePage * PAGE_SIZE + 1}–{Math.min((tablePage + 1) * PAGE_SIZE, analysis.totalRows)} of {analysis.totalRows.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setTablePage(p => Math.max(0, p - 1))} disabled={tablePage === 0}
                      className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-all text-slate-300">
                      ← Prev
                    </button>
                    <span className="text-xs text-slate-500 font-mono">{tablePage + 1} / {totalPages}</span>
                    <button onClick={() => setTablePage(p => Math.min(totalPages - 1, p + 1))} disabled={tablePage >= totalPages - 1}
                      className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-all text-slate-300">
                      Next →
                    </button>
                  </div>
                </div>
                <div className="overflow-auto max-h-[560px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-800 z-10">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-slate-500 font-bold border-b border-slate-700 w-12">#</th>
                        {headers.map(h => {
                          const col = analysis.columnStats.find(c => c.header === h);
                          return (
                            <th key={h} className="px-3 py-2.5 text-left border-b border-slate-700 whitespace-nowrap max-w-36">
                              <div className="font-bold text-slate-300 truncate" title={h}>{h}</div>
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
                        const absIdx = tablePage * PAGE_SIZE + ri;
                        const isDupe = analysis.duplicates.some(d => d.rowIndex === absIdx + 2);
                        return (
                          <tr key={ri} className={'border-b border-slate-800/50 ' + (isDupe ? 'bg-rose-950/20' : ri % 2 === 0 ? 'bg-slate-900' : 'bg-slate-800/20')}>
                            <td className="px-3 py-2 text-slate-600 font-mono">
                              {absIdx + 1}
                              {isDupe && <span className="ml-1 text-rose-500 font-bold" title="Duplicate row">⊕</span>}
                            </td>
                            {headers.map(h => {
                              const val   = row[h];
                              const isEmpty = val === null || val === undefined || String(val).trim() === '';
                              const col   = analysis.columnStats.find(c => c.header === h);
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
              </div>
            )}

            {/* ── ISSUES TAB ── */}
            {activeTab === 'issues' && (
              <div className="flex flex-col gap-4">
                {/* Duplicates */}
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
                        {showDupes ? 'Hide' : 'Show all'}
                      </button>
                    )}
                  </div>
                  {analysis.duplicates.length === 0
                    ? <p className="text-sm text-emerald-400">✓ No duplicate rows found.</p>
                    : (
                      <div>
                        <p className="text-sm text-slate-400 mb-3">{analysis.duplicates.length} rows are exact duplicates of earlier rows.</p>
                        {showDupes && (
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                            {analysis.duplicates.map((d, i) => (
                              <span key={i} className="text-xs bg-rose-900/30 border border-rose-800 text-rose-300 px-3 py-1 rounded-lg font-mono">
                                Row {d.rowIndex} = Row {d.firstSeen}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Null columns */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">
                    ⬜ Columns with Null Values
                    <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' +
                      (analysis.nullCols.length === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400')}>
                      {analysis.nullCols.length}
                    </span>
                  </h3>
                  {analysis.nullCols.length === 0
                    ? <p className="text-sm text-emerald-400">✓ No null values found in any column.</p>
                    : (
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

                {/* Type mismatches */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-extrabold text-slate-200 mb-4">
                    ⚡ Type Mismatch Columns
                    <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' +
                      (analysis.mismatchCols.length === 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400')}>
                      {analysis.mismatchCols.length}
                    </span>
                  </h3>
                  {analysis.mismatchCols.length === 0
                    ? <p className="text-sm text-emerald-400">✓ No type mismatches detected.</p>
                    : (
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

                {/* Outliers */}
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
                  <button
                    onClick={() => {
                      const schema = analysis.columnStats.map(c => ({
                        column: c.header, type: c.dominantPattern, nullable: c.nulls > 0,
                        unique: c.uniqueRate === 100, fillRate: c.fillRate + '%',
                        sample: c.topValues[0]?.val || '',
                      }));
                      copy(JSON.stringify(schema, null, 2), 'schema');
                    }}
                    className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' +
                      (copied === 'schema' ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700')}>
                    {copied === 'schema' ? '✓ Copied' : 'Copy Schema JSON'}
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-800">
                      <tr>
                        {['#','Column Name','Inferred Type','Nullable','Unique','Fill Rate','Pattern Example'].map(h => (
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
                            <span className={c.fillRate === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                              {c.fillRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-500 max-w-36 truncate" title={c.topValues[0]?.val || ''}>
                            {c.topValues[0]?.val ? String(c.topValues[0].val).slice(0, 40) : '—'}
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
          <h2 className="text-xl font-extrabold text-slate-200 mb-5">Free Data Profiler and Quality Inspector for BI Developers</h2>

          <h3 className="text-sm font-bold text-slate-300 mb-2">What Is the TOOLBeans Data Profiler?</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            The TOOLBeans Data Profiler is a free browser-based tool designed for data analysts, BI developers and data engineers
            who need instant visibility into the quality and structure of their datasets. Upload a CSV, Excel or JSON file — or connect
            any REST API endpoint — and get a comprehensive data quality report in seconds without writing a single line of code.
            Everything runs in your browser. Your data is never uploaded to any server.
          </p>

          <h3 className="text-sm font-bold text-slate-300 mb-2">How to Use the Data Profiler</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-2">
            Using the tool takes less than 30 seconds. For file analysis, click the upload area or drag and drop your CSV, Excel or JSON file.
            The tool immediately reads the file, detects column types, counts null values, identifies duplicate rows and calculates a data quality score.
            No configuration required.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            For API data, switch to the API tab, paste any REST endpoint URL, optionally add a Bearer token and click Analyze.
            The tool fetches the JSON response, flattens nested objects automatically and profiles the resulting dataset the same way as a file upload.
            Use the JSONPlaceholder demo endpoints to try it instantly without any API credentials.
          </p>

          <h3 className="text-sm font-bold text-slate-300 mb-2">What the Tool Detects and Reports</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            The profiler checks every column for null and empty values, unique value counts, fill rate percentage, dominant data type
            (integer, float, string, email, phone, URL, date, boolean, UUID), type mismatches where a numeric column contains string values,
            statistical outliers more than three standard deviations from the mean, and top five most frequent values per column.
            Numeric columns additionally show minimum, maximum, mean, median, standard deviation and sum. String columns show minimum,
            maximum and average character length. The duplicate row detector compares every row as a complete record and flags exact duplicates
            with the row numbers of both the original and the copy.
          </p>

          <h3 className="text-sm font-bold text-slate-300 mb-2">How It Makes Your Work Easier</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Without a profiling tool, checking data quality in a large dataset means writing pandas scripts, using Excel formulas
            or manually scrolling through thousands of rows. The TOOLBeans Data Profiler replaces all of that with a single drag-and-drop action.
            BI developers connecting to data APIs can profile live endpoint responses before building dashboards to catch schema changes,
            unexpected nulls or type inconsistencies that would otherwise cause dashboard errors. Data analysts receiving files from clients
            can verify data quality in seconds before loading into a database or BI tool.
          </p>

          <h3 className="text-sm font-bold text-slate-300 mb-2">Frequently Asked Questions</h3>
          <div className="flex flex-col gap-3">
            {[
              { q: 'Is the data profiler free?', a: 'Yes. The TOOLBeans Data Profiler is completely free with no usage limits, no account and no signup required.' },
              { q: 'Does my data get uploaded to a server?', a: 'No. All file processing runs entirely in your browser using JavaScript. Your data files never leave your device and are never transmitted to any server.' },
              { q: 'What file types does the tool support?', a: 'CSV files, Excel spreadsheets (.xlsx and .xls) and JSON files are all supported. For API data, any REST endpoint returning a JSON array or object with nested arrays can be profiled.' },
              { q: 'How large a file can I analyze?', a: 'The tool handles up to around 100,000 rows comfortably in most modern browsers. Larger files may slow down depending on your device memory.' },
              { q: 'What does the data quality score mean?', a: 'The quality score from 0 to 100 reflects the overall health of your dataset. It accounts for column fill rates, type mismatches, duplicate rows and the presence of statistical outliers. A score above 90 indicates excellent data quality. Below 50 indicates significant issues that should be resolved before analysis.' },
              { q: 'Can I export the analysis results?', a: 'Yes. Click the Export Report button to download a structured JSON report containing the full column-level analysis, detected issues, duplicate row indices and the inferred schema. The schema view can also be copied as JSON with one click.' },
              { q: 'Does it work with authenticated APIs?', a: 'Yes. Enter your Bearer token in the token field and the tool adds it as an Authorization header in the API request. Basic Auth and API key headers can be added manually if needed.' },
              { q: 'What is a type mismatch?', a: 'A type mismatch occurs when a column predominantly contains numbers but has some values that are text strings. For example, an ID column where most values are integers but a few rows contain the text NULL or N/A. These mismatches cause errors when loading data into databases or BI tools.' },
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