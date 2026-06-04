'use client';

import { useState, useCallback, useRef, useMemo } from 'react';

// ══════════════════════════════════════════════════════════════════════════════
// ANALYSIS ENGINE (unchanged from working version)
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

function getMode(arr) {
  const freq = {};
  arr.forEach(v => { const k = String(v).trim(); freq[k] = (freq[k] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.length ? { value: sorted[0][0], count: sorted[0][1] } : null;
}

function analyzeColumn(values, header) {
  const total   = values.length;
  const nulls   = values.filter(v => v === null || v === undefined || v === '' || String(v).trim() === '').length;
  const nonNull = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  const unique  = new Set(nonNull.map(v => String(v).trim().toLowerCase())).size;

  const sample = nonNull.slice(0, 500);
  const patternCounts = {};
  sample.forEach(v => { const p = detectPattern(v); patternCounts[p] = (patternCounts[p] || 0) + 1; });
  const dominantPattern = Object.entries(patternCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'string';

  let numericStats = null;
  const nums = nonNull.map(v => parseFloat(String(v).replace(/,/g, ''))).filter(n => !isNaN(n) && isFinite(n));
  if (nums.length > 0 && nums.length / nonNull.length > 0.7) {
    const sorted   = [...nums].sort((a, b) => a - b);
    const sum      = nums.reduce((a, b) => a + b, 0);
    const mean     = sum / nums.length;
    const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
    const stdDev   = Math.sqrt(variance);
    const mid      = Math.floor(sorted.length / 2);
    const median   = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    numericStats = {
      count: nums.length, countDistinct: new Set(nums).size,
      min: sorted[0], max: sorted[sorted.length - 1],
      mean: Math.round(mean * 100) / 100, median,
      stdDev: Math.round(stdDev * 100) / 100,
      sum: Math.round(sum * 100) / 100,
      outliers: nums.filter(n => Math.abs(n - mean) > 3 * stdDev).length,
      negative: nums.filter(n => n < 0).length,
      zero: nums.filter(n => n === 0).length,
      mode: getMode(nonNull),
      distribution: (() => {
        if (sorted.length < 2) return [];
        const mn = sorted[0], mx = sorted[sorted.length - 1];
        if (mn === mx) return [{ label: String(mn), count: nums.length }];
        const bw = (mx - mn) / 5;
        const buckets = Array.from({ length: 5 }, (_, i) => ({
          label: (mn + i * bw).toFixed(1) + '–' + (mn + (i + 1) * bw).toFixed(1),
          count: 0,
        }));
        nums.forEach(n => { const bi = Math.min(4, Math.max(0, Math.floor((n - mn) / bw))); if (bi >= 0 && bi <= 4 && !isNaN(bi) && isFinite(bi)) buckets[bi].count++; });
        return buckets;
      })(),
    };
  }

  const typeMismatch = dominantPattern === 'integer' || dominantPattern === 'float'
    ? nonNull.filter(v => isNaN(parseFloat(String(v).replace(/,/g, '')))).length : 0;

  const freq = {};
  nonNull.slice(0, 1000).forEach(v => { const k = String(v).trim(); freq[k] = (freq[k] || 0) + 1; });
  const topValues = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([val, count]) => ({ val, count, pct: Math.round(count / total * 100) }));
  const modeAll = topValues.length > 0 ? { value: topValues[0].val, count: topValues[0].count } : null;

  let strStats = null;
  if (['string','email','url'].includes(dominantPattern)) {
    const lengths = nonNull.map(v => String(v).length);
    if (lengths.length) strStats = {
      minLen: Math.min(...lengths), maxLen: Math.max(...lengths),
      avgLen: Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length),
    };
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

function findDuplicateRows(rows) {
  const seen = new Map();
  const dupes = [];
  rows.forEach((row, i) => {
    const key = JSON.stringify(Object.values(row).map(v => String(v ?? '').trim().toLowerCase()));
    if (seen.has(key)) dupes.push({ rowIndex: i + 2, firstSeen: seen.get(key) + 2, rowData: row });
    else seen.set(key, i);
  });
  return dupes;
}

function findDuplicateColumns(rows, headers) {
  if (!rows.length || headers.length < 2) return [];
  const colSigs = {};
  headers.forEach(h => { colSigs[h] = rows.map(r => String(r[h] ?? '').trim().toLowerCase()).join('|||'); });
  const dupes = [], found = new Set();
  for (let i = 0; i < headers.length; i++) {
    for (let j = i + 1; j < headers.length; j++) {
      const a = headers[i], b = headers[j];
      const key = a + '::' + b;
      if (!found.has(key) && colSigs[a] === colSigs[b]) {
        dupes.push({ col1: a, col2: b, sampleValues: rows.slice(0, 5).map(r => String(r[a] ?? '')) });
        found.add(key);
      }
    }
  }
  return dupes;
}

// ── NEW: Detect duplicate column header names (same name, different data) ──
function findDuplicateHeaderNames(headers) {
  const seen = {}, dupes = [];
  headers.forEach((h, idx) => {
    const key = String(h).trim().toLowerCase();
    if (seen[key] !== undefined) {
      dupes.push({ name: h, firstIndex: seen[key], dupeIndex: idx });
    } else {
      seen[key] = idx;
    }
  });
  return dupes;
}

function generateInsights(analysis) {
  const insights = [];
  const { totalRows, qualityScore, duplicates, columnDupes, nullCols, mismatchCols, columnStats } = analysis;

  if (qualityScore >= 90) insights.push({ type: 'success', icon: '✅', title: 'Excellent Data Quality', text: `Your dataset scores ${qualityScore}/100. Clean and ready for analysis or database import.` });
  else if (qualityScore >= 70) insights.push({ type: 'warning', icon: '⚠️', title: 'Good with Minor Issues', text: `Score ${qualityScore}/100. Fix the issues below before production use.` });
  else insights.push({ type: 'error', icon: '🚨', title: 'Significant Data Quality Issues', text: `Score ${qualityScore}/100. Multiple problems detected that will cause errors in dashboards and databases.` });

  if (duplicates.length > 0) {
    const pct = Math.round(duplicates.length / totalRows * 100);
    insights.push({ type: 'error', icon: '🔁', title: `${duplicates.length} Duplicate Rows (${pct}%)`, text: `${pct}% of your rows are exact copies. This inflates every SUM and COUNT by ${pct}%. Remove before analysis.` });
  }
  if (columnDupes.length > 0) insights.push({ type: 'warning', icon: '📋', title: `${columnDupes.length} Redundant Column${columnDupes.length > 1 ? 's' : ''}`, text: `"${columnDupes[0].col1}" and "${columnDupes[0].col2}" are identical columns. Wastes memory and causes confusion in joins.` });
  const criticalNulls = nullCols.filter(c => c.fillRate < 70);
  if (criticalNulls.length > 0) insights.push({ type: 'error', icon: '⬜', title: `${criticalNulls.length} Column${criticalNulls.length > 1 ? 's' : ''} Severely Empty`, text: `"${criticalNulls[0].header}" is only ${criticalNulls[0].fillRate}% complete. Below 70% fill rate signals a data collection problem.` });
  if (mismatchCols.length > 0) insights.push({ type: 'warning', icon: '⚡', title: `${mismatchCols.length} Type Mismatch${mismatchCols.length > 1 ? 'es' : ''}`, text: `"${mismatchCols[0].header}" has text mixed into a numeric column. Will break SQL imports and Power BI measures.` });
  const highCard = columnStats.filter(c => c.uniqueRate === 100 && c.total > 10 && c.dominantPattern !== 'uuid');
  if (highCard.length > 0) insights.push({ type: 'info', icon: '🔑', title: `${highCard.length} Likely ID Column${highCard.length > 1 ? 's' : ''}`, text: `"${highCard[0].header}" has 100% unique values  this is likely a primary key column.` });
  const withOutliers = columnStats.filter(c => c.numericStats?.outliers > 0);
  if (withOutliers.length > 0) {
    const total = withOutliers.reduce((a, c) => a + c.numericStats.outliers, 0);
    insights.push({ type: 'warning', icon: '📉', title: `${total} Statistical Outlier${total > 1 ? 's' : ''} Detected`, text: `${withOutliers.length} numeric column${withOutliers.length > 1 ? 's have' : ' has'} values more than 3σ from the mean. Review before aggregating.` });
  }
  const lowVar = columnStats.filter(c => c.uniqueRate < 5 && c.total > 50 && c.dominantPattern === 'string');
  if (lowVar.length > 0) insights.push({ type: 'info', icon: '🏷️', title: `${lowVar.length} Categorical Column${lowVar.length > 1 ? 's' : ''}`, text: `"${lowVar[0].header}" has fewer than 5% unique values  ideal for grouping and filtering in dashboards.` });

  return insights;
}

function analyzeDataset(rows, headers) {
  if (!rows.length) return null;
  const columnStats  = headers.map(h => analyzeColumn(rows.map(r => r[h]), h));
  const duplicates   = findDuplicateRows(rows);
  const columnDupes  = findDuplicateColumns(rows, headers);
  const headerDupes  = findDuplicateHeaderNames(headers);
  const avgColScore  = columnStats.reduce((a, c) => a + c.score, 0) / columnStats.length;
  const qualityScore = Math.max(0, Math.round(avgColScore - Math.min(30, duplicates.length * 2)));
  const totalNulls   = columnStats.reduce((a, c) => a + c.nulls, 0);
  const totalCells   = rows.length * headers.length;
  const nullCols     = columnStats.filter(c => c.nulls > 0);
  const mismatchCols = columnStats.filter(c => c.typeMismatch > 0);
  const lowFill      = columnStats.filter(c => c.fillRate < 70);
  const result = {
    totalRows: rows.length, totalCols: headers.length, totalCells, totalNulls,
    completeness: Math.round((1 - totalNulls / totalCells) * 100),
    duplicates, columnDupes, headerDupes, columnStats, qualityScore,
    nullCols, mismatchCols, lowFill, headers,
  };
  result.insights = generateInsights(result);
  return result;
}

function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) Object.assign(result, flattenObject(v, key));
    else if (Array.isArray(v)) result[key] = JSON.stringify(v);
    else result[key] = v;
  }
  return result;
}

// ── FIX 4: Deep JSON extractor  finds the largest nested array at any depth ──
function findLargestArray(obj, depth = 0) {
  if (depth > 4) return null; // max depth guard
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') return obj;
  if (obj && typeof obj === 'object') {
    let best = null;
    for (const val of Object.values(obj)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
        if (!best || val.length > best.length) best = val;
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        const nested = findLargestArray(val, depth + 1);
        if (nested && (!best || nested.length > best.length)) best = nested;
      }
    }
    return best;
  }
  return null;
}

// Also extract pagination metadata from a Laravel/standard paginated response
function extractPaginationMeta(data) {
  const meta = {};
  // Standard Laravel pagination: data.last_page, data.total, data.data.last_page
  const check = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.last_page)  meta.lastPage  = Number(obj.last_page);
    if (obj.total)      meta.total     = Number(obj.total);
    if (obj.per_page)   meta.perPage   = Number(obj.per_page);
    if (obj.current_page) meta.currentPage = Number(obj.current_page);
    // recurse one level
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object' && !Array.isArray(v) && !meta.lastPage) check(v);
    }
  };
  check(data);
  return meta;
}

function extractRowsFromJson(data) {
  if (Array.isArray(data)) {
    const flat = data.map(item => typeof item === 'object' && item !== null ? flattenObject(item) : { value: item });
    return { rows: flat, headers: [...new Set(flat.flatMap(r => Object.keys(r)))] };
  }
  // Deep search for the largest array of objects (handles nested paginated responses)
  const found = findLargestArray(data);
  if (found) {
    const flat = found.map(item => typeof item === 'object' && item !== null ? flattenObject(item) : { value: item });
    return { rows: flat, headers: [...new Set(flat.flatMap(r => Object.keys(r)))] };
  }
  const flat = [flattenObject(data)];
  return { rows: flat, headers: Object.keys(flat[0]) };
}

// ══════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════════════════════

const PATTERN_COLORS = {
  integer: 'bg-blue-100 text-blue-700 border-blue-200',
  float:   'bg-violet-100 text-violet-700 border-violet-200',
  string:  'bg-slate-100 text-slate-600 border-slate-200',
  email:   'bg-purple-100 text-purple-700 border-purple-200',
  phone:   'bg-teal-100 text-teal-700 border-teal-200',
  url:     'bg-cyan-100 text-cyan-700 border-cyan-200',
  date:    'bg-orange-100 text-orange-700 border-orange-200',
  boolean: 'bg-pink-100 text-pink-700 border-pink-200',
  uuid:    'bg-amber-100 text-amber-700 border-amber-200',
};

const PATTERN_ICONS = { integer: '123', float: '1.2', string: 'Abc', email: '@', phone: '☎', url: '🔗', date: '📅', boolean: 'T/F', uuid: 'ID' };
const TYPE_COLORS_BAR = { integer: '#3b82f6', float: '#8b5cf6', string: '#64748b', email: '#a855f7', phone: '#14b8a6', url: '#06b6d4', date: '#f97316', boolean: '#ec4899', uuid: '#f59e0b' };
const CHART_PALETTE = ['#3b82f6','#8b5cf6','#10b981','#f97316','#ef4444','#06b6d4','#f59e0b','#ec4899','#14b8a6','#a855f7'];

const scoreColor = s => s >= 90 ? '#16a34a' : s >= 70 ? '#d97706' : '#dc2626';
const scoreLabel = s => s >= 90 ? 'Excellent' : s >= 70 ? 'Good' : s >= 50 ? 'Fair' : 'Poor';
const scoreBadge = s => s >= 90 ? 'bg-emerald-100 text-emerald-700' : s >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

const fmt = (n) => {
  if (n === null || n === undefined) return '';
  if (typeof n === 'number') {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(Math.round(n * 100) / 100);
  }
  return String(n);
};

function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

// ── standardize header name ──────────────────────────────
function standardizeHeader(h) {
  return h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_');
}

// ── Mini bar (exactly from working version) ───────────────
function MiniBar({ value, max, color = '#3b82f6' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: pct + '%', backgroundColor: color }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{value}</span>
    </div>
  );
}

// ── Score Ring (exactly from working version) ─────────────
function ScoreRing({ score, size = 80 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="14" fontWeight="800" fill={color}>{score}</text>
    </svg>
  );
}

// ── Distribution Bar Chart (exactly from working version) ──
function DistributionChart({ buckets }) {
  if (!buckets || !buckets.length) return null;
  const max = Math.max(...buckets.map(b => b.count));
  return (
    <div className="flex items-end gap-1 h-16">
      {buckets.map((b, i) => {
        const h = max > 0 ? Math.round((b.count / max) * 100) : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
              {b.label}: {b.count}
            </div>
            <div className="w-full bg-blue-500 rounded-t transition-all" style={{ height: h + '%', minHeight: b.count > 0 ? '2px' : 0 }} />
          </div>
        );
      })}
    </div>
  );
}

// ── Inline Bar Chart for Dashboard ───────────────────────
function InlineBarChart({ data, color = '#3b82f6' }) {
  const max = Math.max(...data.map(d => d.value));
  const chartH = 140;
  const chartW = 280;
  const barW = Math.min(36, Math.floor((chartW - (data.length - 1) * 6) / data.length));
  const gap = data.length > 1 ? (chartW - barW * data.length) / (data.length - 1) : 0;
  return (
    <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 24}`} className="overflow-visible">
      {data.map((d, i) => {
        const barH = max > 0 ? Math.round((d.value / max) * chartH) : 0;
        const x = i * (barW + gap);
        const y = chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={color} rx="3" opacity="0.85" />
            <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize="9" fill="#64748b"
              className="truncate">
              {String(d.label).slice(0, 8)}{String(d.label).length > 8 ? '…' : ''}
            </text>
            {barH > 14 && (
              <text x={x + barW / 2} y={y + 11} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">
                {fmt(d.value)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart for Dashboard ─────────────────────────────
function DonutChart({ data, size = 140 }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return null;
  const cx = size / 2, cy = size / 2, r = size / 2 - 16, ir = r * 0.55;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const ix1 = cx + ir * Math.cos(angle - sweep), iy1 = cy + ir * Math.sin(angle - sweep);
    const ix2 = cx + ir * Math.cos(angle), iy2 = cy + ir * Math.sin(angle);
    const path = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${ir},${ir} 0 ${large},0 ${ix1},${iy1} Z`;
    return { path, color: CHART_PALETTE[i % CHART_PALETTE.length], pct: Math.round(d.value / total * 100), label: d.label };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} opacity="0.9" />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e293b">{total.toLocaleString()}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#64748b">total</text>
    </svg>
  );
}

const RELATED_TOOLS = [
  { name: 'CSV to SQL',         href: '/tools/csv-to-sql',         icon: '🗄️',  desc: 'Convert cleaned CSV to SQL INSERT statements' },
  { name: 'JSON Formatter',     href: '/tools/json-formatter',     icon: '{ }', desc: 'Format and validate JSON API responses' },
  { name: 'API Request Tester', href: '/tools/api-request-tester', icon: '📡',  desc: 'Test REST APIs and inspect live JSON data' },
  { name: 'SQL Formatter',      href: '/tools/sql-formatter',      icon: '🗄️',  desc: 'Format SQL queries for data analysis' },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function DataProfilerTool() {
  const [source,    setSource]    = useState('file');
  const [apiUrl,    setApiUrl]    = useState('');
  const [apiKey,    setApiKey]    = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [fileName,  setFileName]  = useState('');
  // ── API features: size warning + pagination ────────────
  const [apiWarning,    setApiWarning]    = useState('');  // partial data warning
  const [fetchAllPages, setFetchAllPages] = useState(false); // paginated fetch toggle
  const [maxPages,      setMaxPages]      = useState(10);    // max pages to fetch
  const [fetchProgress, setFetchProgress] = useState('');    // live progress text
  // ── Pre-rename header duplicates (detected before SheetJS renames them) ──
  const [preRenameHdrDupes, setPreRenameHdrDupes] = useState([]);

  const [rawRows,   setRawRows]   = useState([]);
  const [headers,   setHeaders]   = useState([]);
  const [analysis,  setAnalysis]  = useState(null);

  // Transform state
  const [txRows,       setTxRows]       = useState(null);   // transformed rows
  const [txHeaders,    setTxHeaders]    = useState(null);   // transformed headers
  const [txLog,        setTxLog]        = useState([]);     // applied transform log
  const [nullFillMode, setNullFillMode] = useState('drop'); // drop | zero | mean | empty

  const [activeTab,   setActiveTab]   = useState('insights');
  const [searchCol,   setSearchCol]   = useState('');
  const [tablePage,   setTablePage]   = useState(0);
  const [pageSize,    setPageSize]    = useState(50);
  const [showDupes,   setShowDupes]   = useState(false);
  const [copied,      setCopied]      = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const fileRef = useRef(null);

  const loadLib = src => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  const processData = useCallback((rows, hdrs, name = '', rawDupeHdrs = []) => {
    if (!rows.length || !hdrs.length) { setError('No data rows found.'); return; }
    setRawRows(rows); setHeaders(hdrs); setFileName(name);
    // rawDupeHdrs: header pairs detected from raw Excel BEFORE SheetJS renamed them
    setPreRenameHdrDupes(rawDupeHdrs);
    setAnalysis(analyzeDataset(rows, hdrs));
    setTxRows(null); setTxHeaders(null); setTxLog([]);
    setActiveTab('insights'); setTablePage(0); setError('');
  }, []);

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
      } else if (['xlsx','xls'].includes(ext)) {
        await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        const buffer = await file.arrayBuffer();
        const wb = window.XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        // Read raw header row FIRST before any library auto-renames duplicates
        const rawArr = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!rawArr.length) throw new Error('No data found in spreadsheet.');
        const rawHeaders = rawArr[0].map(h => String(h ?? '').trim());
        // STEP 1: Detect duplicates from the RAW headers (before any renaming)
        const seenRaw = {};
        const xlsxRawDupes = [];
        rawHeaders.forEach((h, idx) => {
          const key = h.toLowerCase();
          if (seenRaw[key] !== undefined) {
            xlsxRawDupes.push({ name: h, firstIndex: seenRaw[key], dupeIndex: idx });
          } else { seenRaw[key] = idx; }
        });
        // STEP 2: Now rename duplicates for safe analysis: Class→Class, Class→Class_2
        const seenHdrs = {};
        const finalHeaders = rawHeaders.map(h => {
          const key = h.toLowerCase();
          if (seenHdrs[key] === undefined) { seenHdrs[key] = 1; return h; }
          seenHdrs[key]++; return h + '_' + seenHdrs[key];
        });
        // STEP 3: Build rows using renamed headers
        const dataRows = rawArr.slice(1).filter(row => row.some(c => c !== '' && c !== null && c !== undefined));
        const data = dataRows.map(row => {
          const obj = {};
          finalHeaders.forEach((h, i) => { obj[h] = row[i] ?? ''; });
          return obj;
        });
        if (!data.length) throw new Error('No data found in spreadsheet.');
        // STEP 4: Pass raw duplicates so the tool reports the originals, not the renamed ones
        processData(data, finalHeaders, file.name, xlsxRawDupes);
      } else if (ext === 'json') {
        const json = JSON.parse(await file.text());
        const { rows, headers: hdrs } = extractRowsFromJson(json);
        processData(rows, hdrs, file.name);
      } else {
        throw new Error('Unsupported file type. Upload CSV, Excel or JSON.');
      }
    } catch (e) { setError(e.message || 'Failed to parse file.'); }
    finally { setLoading(false); }
  };

  const handleApiLoad = async () => {
    if (!apiUrl.trim()) { setError('Please enter an API URL.'); return; }
    setLoading(true); setError(''); setAnalysis(null); setApiWarning(''); setFetchProgress('');
    const API_ROW_LIMIT = 50000; // Feature 1: max rows before truncation warning
    try {
      const reqHdrs = { 'Accept': 'application/json' };
      if (apiKey.trim()) reqHdrs['Authorization'] = 'Bearer ' + apiKey.trim();

      // ── Feature 3: Paginated API handling ────────────────────────────────
      // Detect if the URL already has a page param or user wants all pages
      const hasPagination = fetchAllPages;
      let allRows = [], allHdrs = [], totalFetched = 0, truncated = false;

      if (hasPagination) {
        // Build base URL without existing page param, then loop pages
        let baseUrl = apiUrl.trim();
        // Detect the page param name (page, p, offset, pageNum, page_num, pageNumber)
        const pageParamMatch = baseUrl.match(/[?&](page|p|pagenum|page_num|pagenumber)=\d*/i);
        const pageParam = pageParamMatch ? pageParamMatch[1] : 'page';
        // Remove any existing page= from the URL
        baseUrl = baseUrl.replace(/([?&])(page|p|pagenum|page_num|pagenumber)=\d*/gi, '').replace(/\?&/, '?').replace(/&&/, '&').replace(/[?&]$/, '');
        const sep = baseUrl.includes('?') ? '&' : '?';

        let detectedLastPage = maxPages;
        for (let pg = 1; pg <= detectedLastPage; pg++) {
          setFetchProgress(`Fetching page ${pg} of ${detectedLastPage}...`);
          const pageUrl = `${baseUrl}${sep}${pageParam}=${pg}`;
          const res = await fetch(pageUrl, { method: apiMethod, headers: reqHdrs });
          if (!res.ok) { if (pg === 1) throw new Error(`API returned ${res.status} ${res.statusText}`); break; }
          const json = await res.json();
          // On first page, auto-detect actual total pages from response metadata
          if (pg === 1) {
            const paginMeta = extractPaginationMeta(json);
            if (paginMeta.lastPage && paginMeta.lastPage > 1) {
              detectedLastPage = Math.min(paginMeta.lastPage, maxPages);
              setFetchProgress(`API has ${paginMeta.lastPage} pages (${paginMeta.total?.toLocaleString() ?? '?'} records). Fetching up to ${detectedLastPage} pages...`);
            }
          }
          const extracted = extractRowsFromJson(json);
          const pageRows = extracted?.rows ?? [];
          const pageHdrs = extracted?.headers ?? [];
          if (!pageRows.length || !pageHdrs.length) { if (pg === 1) throw new Error('API returned no rows on page 1. Check the endpoint or try without Fetch All Pages.'); break; }
          if (pg === 1) allHdrs = pageHdrs;
          allRows = allRows.concat(pageRows);
          totalFetched = allRows.length;
          // Feature 1: Enforce row limit even across pages
          if (totalFetched >= API_ROW_LIMIT) {
            allRows = allRows.slice(0, API_ROW_LIMIT);
            truncated = true;
            setApiWarning(`⚠️ Data truncated at ${API_ROW_LIMIT.toLocaleString()} rows across ${pg} pages. Your API has more data  increase Max Pages or filter at the source.`);
            break;
          }
        }
        setFetchProgress('');
      } else {
        // ── Single fetch  also auto-detects paginated APIs ───────────────
        const res = await fetch(apiUrl.trim(), { method: apiMethod, headers: reqHdrs });
        if (!res.ok) throw new Error(`API returned ${res.status} ${res.statusText}`);
        const text = await res.text();
        const byteSize = new Blob([text]).size;
        const json = JSON.parse(text);
        // Check if response looks like a paginated API (has last_page / total fields)
        const paginMeta = extractPaginationMeta(json);
        const { rows: fetchedRows, headers: fetchedHdrs } = extractRowsFromJson(json);
        allHdrs = fetchedHdrs;

        if (paginMeta.lastPage && paginMeta.lastPage > 1) {
          // Auto-detected paginated API  suggest switching on
          allRows = fetchedRows;
          setApiWarning(`⚠️ Paginated API detected  this is page 1 of ${paginMeta.lastPage} (${paginMeta.total?.toLocaleString() ?? '?'} total records). Enable "Fetch All Pages" above to load all ${paginMeta.lastPage} pages.`);
        } else if (fetchedRows.length > API_ROW_LIMIT) {
          allRows = fetchedRows.slice(0, API_ROW_LIMIT);
          setApiWarning(`⚠️ Response contains ${fetchedRows.length.toLocaleString()} rows  showing first ${API_ROW_LIMIT.toLocaleString()} rows. Filter at source for full data.`);
        } else {
          allRows = fetchedRows;
          setApiWarning(`✅ Full response loaded  ${allRows.length.toLocaleString()} rows · ${(byteSize / 1024).toFixed(1)} KB`);
        }
      }

      if (!allRows.length) throw new Error('API returned no data rows. Check the endpoint or response format.');
      processData(allRows, allHdrs, apiUrl.trim());
    } catch (e) {
      setFetchProgress('');
      setError(e.message.includes('Failed to fetch') ? 'CORS error  the API may not allow browser requests. Try a public API or add CORS headers to your server.' : e.message);
    } finally { setLoading(false); }
  };

  // ── Active working data (transformed or raw) ──────────
  const activeRows    = txRows    ?? rawRows;
  const activeHeaders = txHeaders ?? headers;

  // ── TRANSFORMATION ACTIONS ────────────────────────────
  const tablePreviewRef = useRef(null);

  const applyTransform = (label, newRows, newHdrs) => {
    setTxRows(newRows);
    setTxHeaders(newHdrs ?? activeHeaders);
    setTxLog(prev => [...prev, label]);
    setTablePage(0);
    // FIX 3: Auto-scroll to live preview table so user sees the result
    setTimeout(() => {
      tablePreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  const txRemoveDupeRows = () => {
    const seen = new Set();
    const before = activeRows.length;
    const deduped = activeRows.filter(row => {
      const key = JSON.stringify(activeHeaders.map(h => String(row[h] ?? '').trim().toLowerCase()));
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    applyTransform(`Removed ${before - deduped.length} duplicate rows`, deduped);
  };

  const txRemoveDupeCols = () => {
    if (!analysis) return;
    const toRemove = new Set(analysis.columnDupes.map(d => d.col2));
    const newHdrs = activeHeaders.filter(h => !toRemove.has(h));
    applyTransform(`Removed ${toRemove.size} duplicate column${toRemove.size > 1 ? 's' : ''}`, activeRows, newHdrs);
  };

  const txRemoveNullRows = () => {
    const before = activeRows.length;
    const cleaned = activeRows.filter(row =>
      activeHeaders.every(h => {
        const v = row[h];
        return v !== null && v !== undefined && String(v).trim() !== '';
      })
    );
    applyTransform(`Removed ${before - cleaned.length} rows with null values`, cleaned);
  };

  const txFillNulls = () => {
    const newRows = activeRows.map(row => {
      const newRow = { ...row };
      activeHeaders.forEach(h => {
        const v = newRow[h];
        const isEmpty = v === null || v === undefined || String(v).trim() === '';
        if (isEmpty) {
          if (nullFillMode === 'zero') newRow[h] = '0';
          else if (nullFillMode === 'empty') newRow[h] = '';
          else if (nullFillMode === 'mean') {
            const col = analysis?.columnStats.find(c => c.header === h);
            newRow[h] = col?.numericStats ? String(col.numericStats.mean) : '0';
          }
        }
      });
      return newRow;
    });
    applyTransform(`Filled null values with ${nullFillMode === 'zero' ? '0' : nullFillMode === 'mean' ? 'column mean' : 'empty string'}`, newRows);
  };

  const txStandardizeHeaders = () => {
    const mapping = {};
    activeHeaders.forEach(h => { mapping[h] = standardizeHeader(h); });
    const newHdrs = activeHeaders.map(h => mapping[h]);
    const newRows = activeRows.map(row => {
      const newRow = {};
      activeHeaders.forEach(h => { newRow[mapping[h]] = row[h]; });
      return newRow;
    });
    applyTransform('Standardized column names to snake_case', newRows, newHdrs);
  };

  const txReset = () => { setTxRows(null); setTxHeaders(null); setTxLog([]); setTablePage(0); };

  // ── NEW: Remove duplicate header names (keep first, rename dupes to name_2, name_3) ──
  const txDedupeHeaders = () => {
    if (!effectiveHdrDupes.length) return;
    const seen = {};
    const newHdrs = activeHeaders.map(h => {
      const key = String(h).trim().toLowerCase();
      if (seen[key] === undefined) { seen[key] = 1; return h; }
      seen[key]++; return h + '_' + seen[key];
    });
    const newRows = activeRows.map(row => {
      const newRow = {};
      activeHeaders.forEach((h, i) => { newRow[newHdrs[i]] = row[h]; });
      return newRow;
    });
    applyTransform(`Renamed ${effectiveHdrDupes.length} duplicate header${effectiveHdrDupes.length > 1 ? 's' : ''} (added _2, _3 suffix)`, newRows, newHdrs);
  };

  // ── EXPORT ────────────────────────────────────────────
  const exportReport = () => {
    if (!analysis) return;
    const report = {
      source: fileName, generatedAt: new Date().toISOString(),
      summary: { totalRows: analysis.totalRows, totalColumns: analysis.totalCols, qualityScore: analysis.qualityScore, completeness: analysis.completeness + '%', duplicateRows: analysis.duplicates.length, totalNullValues: analysis.totalNulls },
      insights: analysis.insights.map(i => ({ title: i.title, detail: i.text })),
      columns: analysis.columnStats.map(c => ({ name: c.header, type: c.dominantPattern, count: c.count, countDistinct: c.countDistinct, fillRate: c.fillRate + '%', nullCount: c.nulls, typeMismatches: c.typeMismatch, qualityScore: c.score, numericStats: c.numericStats })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'data-quality-report.json' }).click();
    URL.revokeObjectURL(url);
  };

  const downloadData = async (format) => {
    const rows = filteredTableRows;
    const hdrs = activeHeaders;
    if (format === 'csv') {
      const lines = [hdrs.map(h => `"${h}"`).join(',')];
      rows.forEach(r => lines.push(hdrs.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')));
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: 'data-export.csv' }).click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const out  = rows.map(r => Object.fromEntries(hdrs.map(h => [h, r[h] ?? ''])));
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: 'data-export.json' }).click();
      URL.revokeObjectURL(url);
    } else if (format === 'xlsx') {
      await loadLib('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      const wb  = window.XLSX.utils.book_new();
      const ws  = window.XLSX.utils.aoa_to_sheet([hdrs, ...rows.map(r => hdrs.map(h => r[h] ?? ''))]);
      window.XLSX.utils.book_append_sheet(wb, ws, 'Data');
      window.XLSX.writeFile(wb, 'data-export.xlsx');
    }
  };

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(''), 2000);
  };

  // ── Derived ───────────────────────────────────────────
  const filteredCols = analysis?.columnStats.filter(c =>
    !searchCol || c.header.toLowerCase().includes(searchCol.toLowerCase())
  ) || [];

  const filteredTableRows = useMemo(() => {
    if (!tableSearch.trim()) return activeRows;
    return activeRows.filter(row => Object.values(row).some(v => String(v ?? '').toLowerCase().includes(tableSearch.toLowerCase())));
  }, [activeRows, tableSearch]);

  const totalPages = Math.ceil(filteredTableRows.length / pageSize);
  const pagedRows  = filteredTableRows.slice(tablePage * pageSize, (tablePage + 1) * pageSize);

  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

  const hasTransforms     = txLog.length > 0;
  const nullCount         = analysis ? analysis.totalNulls : 0;
  const dupeCount         = analysis ? analysis.duplicates.length : 0;
  const dupeCols          = analysis ? analysis.columnDupes.length : 0;
  // Use pre-rename dupes (from raw Excel) when available, else fall back to runtime detection
  const effectiveHdrDupes = preRenameHdrDupes.length > 0 ? preRenameHdrDupes : (analysis?.headerDupes ?? []);
  const dupeHeaderCount   = effectiveHdrDupes.length;

  // ── Dashboard data prep ───────────────────────────────
  const dashboardCharts = useMemo(() => {
    if (!analysis) return [];
    const charts = [];
    analysis.columnStats.forEach(col => {
      if (col.numericStats && col.numericStats.distribution.length > 0) {
        charts.push({
          type: 'bar', title: col.header,
          subtitle: `min ${fmt(col.numericStats.min)} · max ${fmt(col.numericStats.max)} · avg ${fmt(col.numericStats.mean)}`,
          data: col.numericStats.distribution.map(b => ({ label: b.label, value: b.count })),
          color: TYPE_COLORS_BAR[col.dominantPattern] || '#3b82f6',
        });
      } else if (col.topValues.length > 1 && col.uniqueRate < 80) {
        charts.push({
          type: 'donut', title: col.header,
          subtitle: `${col.unique} unique values · ${col.fillRate}% filled`,
          data: col.topValues.slice(0, 6).map(v => ({ label: v.val, value: v.count })),
        });
      }
    });
    return charts.slice(0, 12);
  }, [analysis]);

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HEADER ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">

            {/* Logo-style colorful title */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl select-none">📊</span>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">CSV &amp; Excel</span>
                  <span className="text-slate-800"> Data Analyzer</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Find duplicates, nulls &amp; errors · Clean &amp; export · Auto dashboard
                </p>
              </div>
            </div>

            {/* Compact badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: '∞ All Rows', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: '🔒 No Upload', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { label: '⚡ Free', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              ].map(b => (
                <span key={b.label} className={'text-xs font-bold px-3 py-1.5 rounded-full border ' + b.color}>{b.label}</span>
              ))}
            </div>
          </div>

          {/* Feature pills  compact single row */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {['🔁 Duplicates','⬜ Nulls','⚡ Type Check','📊 Stats','📉 Outliers','💡 Insights','🔧 Clean','📈 Dashboard','⬇️ Export','📡 API'].map(f => (
              <span key={f} className="text-xs bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* ── INPUT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[{ key: 'file', label: '📁 Upload File', sub: 'CSV / Excel / JSON' }, { key: 'api', label: '📡 Connect API', sub: 'REST endpoint' }].map(t => (
              <button key={t.key} onClick={() => { setSource(t.key); setError(''); }}
                className={'flex-1 py-4 text-sm font-bold transition-all border-b-2 ' + (source === t.key ? 'border-blue-500 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600')}>
                {t.label}
                <span className="block text-xs font-normal text-slate-400 mt-0.5">{t.sub}</span>
              </button>
            ))}
          </div>
          <div className="p-6">
            {source === 'file' ? (
              <div onDrop={onDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 rounded-2xl p-12 text-center cursor-pointer transition-all group">
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <div className="text-6xl mb-3 group-hover:scale-110 transition-transform select-none">📊</div>
                <p className="text-slate-800 font-bold text-lg mb-1">Drop your data file here</p>
                <p className="text-slate-400 text-sm mb-4">or click to browse  CSV, Excel (.xlsx / .xls) or JSON</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {['CSV','XLSX','XLS','JSON'].map(f => (
                    <span key={f} className="text-xs font-bold bg-slate-100 border border-slate-200 text-slate-500 px-4 py-1.5 rounded-lg">{f}</span>
                  ))}
                </div>
                {fileName && !loading && (
                  <div className="mt-5 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-5 py-2 rounded-full">
                    ✓ {fileName}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">API Endpoint URL</label>
                    <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleApiLoad()}
                      placeholder="https://api.example.com/v1/data"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-800 text-sm font-mono shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Bearer Token (optional)</label>
                    <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="eyJ..."
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-800 text-sm font-mono shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {['GET','POST'].map(m => (
                      <button key={m} onClick={() => setApiMethod(m)}
                        className={'text-xs font-bold px-4 py-2 rounded-lg transition-all ' + (apiMethod === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {['https://jsonplaceholder.typicode.com/posts','https://jsonplaceholder.typicode.com/users'].map(url => (
                      <button key={url} onClick={() => setApiUrl(url)}
                        className="text-xs bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg font-mono transition-all">
                        {url.split('/').pop()}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleApiLoad} disabled={loading || !apiUrl.trim()}
                    className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all">
                    {loading ? 'Loading...' : 'Analyze ▶'}
                  </button>
                </div>

                {/* ── Feature 3: Paginated API controls ── */}
                <div className="flex items-center gap-3 flex-wrap bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={fetchAllPages} onChange={e => setFetchAllPages(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Fetch All Pages</span>
                  </label>
                  <span className="text-xs text-slate-400">for APIs with <code className="bg-slate-200 px-1 rounded">?page=1</code> style pagination</span>
                  {fetchAllPages && (
                    <div className="flex items-center gap-2 ml-auto">
                      <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Max pages:</label>
                      <input type="number" min={1} max={100} value={maxPages}
                        onChange={e => setMaxPages(Math.max(1, Math.min(100, +e.target.value)))}
                        className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-mono text-center" />
                      <span className="text-xs text-slate-400">(stops early if page returns no data)</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── API WARNING (size/truncation notice) ── */}
        {apiWarning && (
          <div className={'rounded-xl p-4 flex items-start gap-3 border ' + (apiWarning.startsWith('✅') ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200')}>
            <span className="text-xl flex-shrink-0">{apiWarning.startsWith('✅') ? '✅' : '⚠️'}</span>
            <div>
              <div className={(apiWarning.startsWith('✅') ? 'text-emerald-700' : 'text-amber-700') + ' font-bold text-sm'}>
                {apiWarning.startsWith('✅') ? 'Full Data Loaded' : 'Partial Data  Size Limit Reached'}
              </div>
              <div className={(apiWarning.startsWith('✅') ? 'text-emerald-600' : 'text-amber-600') + ' text-xs mt-0.5'}>{apiWarning.replace(/^[✅⚠️]\s*/, '')}</div>
            </div>
          </div>
        )}

        {/* ── FETCH PROGRESS ── */}
        {fetchProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
            <span className="text-blue-700 text-sm font-medium">{fetchProgress}</span>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <div className="text-red-700 font-bold text-sm">Error</div>
              <div className="text-red-600 text-xs mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center gap-4 shadow-sm">
            <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            <div className="text-slate-800 font-bold text-lg">Analyzing your data...</div>
            <div className="text-slate-400 text-sm">Detecting duplicates, nulls, type patterns and outliers across all rows</div>
          </div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {analysis && !loading && (
          <div className="flex flex-col gap-5">

            {/* ── SUMMARY CARDS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
              {[
                { label: 'Total Rows',  value: analysis.totalRows.toLocaleString(),   icon: '📋', color: 'text-slate-800' },
                { label: 'Columns',     value: analysis.totalCols,                    icon: '📊', color: 'text-slate-800' },
                { label: 'Completeness',value: analysis.completeness + '%',           icon: '✅', color: analysis.completeness === 100 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Nulls',       value: analysis.totalNulls.toLocaleString(),  icon: '⬜', color: analysis.totalNulls === 0 ? 'text-emerald-600' : 'text-red-600' },
                { label: 'Dupe Rows',    value: analysis.duplicates.length,              icon: '🔁', color: analysis.duplicates.length === 0 ? 'text-emerald-600' : 'text-red-600' },
                { label: 'Dupe Headers', value: dupeHeaderCount,                         icon: '🏷️', color: dupeHeaderCount === 0 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Dupe Cols',    value: analysis.columnDupes.length,             icon: '📋', color: analysis.columnDupes.length === 0 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Type Issues',  value: analysis.mismatchCols.length,            icon: '⚡', color: analysis.mismatchCols.length === 0 ? 'text-emerald-600' : 'text-amber-600' },
                { label: 'Quality',     value: analysis.qualityScore + '/100',        icon: '🏆', color: analysis.qualityScore >= 90 ? 'text-emerald-600' : analysis.qualityScore >= 70 ? 'text-amber-600' : 'text-red-600' },
              ].map(card => (
                <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">{card.icon}</div>
                  <div className={'text-xl font-extrabold ' + card.color}>{card.value}</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{card.label}</div>
                </div>
              ))}
            </div>

            {/* ── QUALITY BANNER ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-6 flex-wrap">
                <ScoreRing score={analysis.qualityScore} size={96} />
                <div className="flex-1 min-w-60">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-extrabold text-slate-900">Data Quality Score</h2>
                    <span className={'text-sm font-bold px-3 py-1 rounded-full ' + scoreBadge(analysis.qualityScore)}>
                      {scoreLabel(analysis.qualityScore)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    {analysis.completeness}% complete · {analysis.duplicates.length} duplicate rows · {analysis.columnDupes.length} duplicate columns · {analysis.mismatchCols.length} type issues
                  </p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-sm">
                    {[
                      { label: 'Completeness',     pct: analysis.completeness, color: '#16a34a' },
                      { label: 'No Duplicates',     pct: analysis.duplicates.length === 0 ? 100 : Math.round((1 - analysis.duplicates.length / analysis.totalRows) * 100), color: '#3b82f6' },
                      { label: 'Type Consistency',  pct: analysis.mismatchCols.length === 0 ? 100 : Math.round((1 - analysis.mismatchCols.length / analysis.totalCols) * 100), color: '#8b5cf6' },
                      { label: 'Column Health',     pct: Math.round(analysis.columnStats.reduce((a, c) => a + c.score, 0) / analysis.columnStats.length), color: '#f97316' },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                          <span>{m.label}</span><span className="font-bold">{m.pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full">
                          <div className="h-2 rounded-full transition-all" style={{ width: m.pct + '%', backgroundColor: m.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  <button onClick={exportReport}
                    className="text-sm bg-slate-900 hover:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
                    ↓ Export Report
                  </button>
                  <button onClick={() => { setActiveTab('transform'); }}
                    className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
                    🔧 Clean Data
                  </button>
                </div>
              </div>
            </div>

            {/* ── TABS ── */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5 flex gap-1 flex-wrap">
              {[
                { key: 'insights',   label: '💡 Insights'    },
                { key: 'overview',   label: '📊 Overview'    },
                { key: 'columns',    label: '🔬 Columns'     },
                { key: 'dashboard',  label: '📈 Dashboard'   },
                { key: 'transform',  label: '🔧 Clean Data'  },
                { key: 'data',       label: '📋 Data Table'  },
                { key: 'issues',     label: `⚠️ Issues (${analysis.duplicates.length + analysis.columnDupes.length + effectiveHdrDupes.length + analysis.mismatchCols.length + analysis.nullCols.length})` },
                { key: 'schema',     label: '🗂 Schema'      },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={'flex-1 min-w-fit py-2.5 px-3 rounded-xl text-xs font-bold transition-all ' +
                    (activeTab === t.key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ══════ INSIGHTS TAB ══════ */}
            {activeTab === 'insights' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.insights.map((ins, i) => {
                    const bg = { success: 'bg-emerald-50 border-emerald-200', warning: 'bg-amber-50 border-amber-200', error: 'bg-red-50 border-red-200', info: 'bg-blue-50 border-blue-200' };
                    const tc = { success: 'text-emerald-800', warning: 'text-amber-800', error: 'text-red-800', info: 'text-blue-800' };
                    const tx = { success: 'text-emerald-700', warning: 'text-amber-700', error: 'text-red-700', info: 'text-blue-700' };
                    return (
                      <div key={i} className={'border rounded-2xl p-5 ' + bg[ins.type]}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">{ins.icon}</span>
                          <div>
                            <div className={'text-sm font-extrabold mb-1 ' + tc[ins.type]}>{ins.title}</div>
                            <p className={'text-sm leading-relaxed ' + tx[ins.type]}>{ins.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">Column Health at a Glance</h3>
                  <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                    {analysis.columnStats.map(c => (
                      <div key={c.header} className="flex items-center gap-3 py-1.5 px-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                        onClick={() => { setActiveTab('columns'); }}>
                        <span className={'text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 ' + (PATTERN_COLORS[c.dominantPattern] || 'bg-slate-100 text-slate-600 border-slate-200')}>
                          {PATTERN_ICONS[c.dominantPattern]}
                        </span>
                        <span className="text-sm text-slate-700 font-medium min-w-0 flex-1 truncate" title={c.header}>{c.header}</span>
                        <div className="w-28 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: c.fillRate + '%', backgroundColor: c.fillRate === 100 ? '#16a34a' : c.fillRate >= 70 ? '#d97706' : '#dc2626' }} />
                            </div>
                            <span className="text-xs font-bold text-slate-500 w-8 text-right">{c.fillRate}%</span>
                          </div>
                        </div>
                        {c.nulls > 0 && <span className="text-xs text-red-500 font-bold flex-shrink-0">⬜{c.nulls}</span>}
                        {c.typeMismatch > 0 && <span className="text-xs text-amber-500 font-bold flex-shrink-0">⚡</span>}
                        <ScoreRing score={c.score} size={28} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════ OVERVIEW TAB ══════ */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">Column Type Distribution</h3>
                  <div className="flex flex-col gap-2.5">
                    {Object.entries(analysis.columnStats.reduce((acc, c) => { acc[c.dominantPattern] = (acc[c.dominantPattern] || 0) + 1; return acc; }, {}))
                      .sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-3">
                        <span className={'text-xs font-bold px-2 py-0.5 rounded border min-w-20 text-center ' + (PATTERN_COLORS[type] || 'bg-slate-100 text-slate-600 border-slate-200')}>
                          {PATTERN_ICONS[type]} {type}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                          <div className="h-2.5 rounded-full" style={{ width: (count / analysis.totalCols * 100) + '%', backgroundColor: TYPE_COLORS_BAR[type] || '#64748b' }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">Column Fill Rate</h3>
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {analysis.columnStats.map(c => (
                      <div key={c.header} className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 font-medium truncate w-28 flex-shrink-0" title={c.header}>{c.header}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: c.fillRate + '%', backgroundColor: c.fillRate === 100 ? '#16a34a' : c.fillRate >= 70 ? '#d97706' : '#dc2626' }} />
                        </div>
                        <span className={'text-xs font-bold w-10 text-right ' + (c.fillRate === 100 ? 'text-emerald-600' : c.fillRate >= 70 ? 'text-amber-600' : 'text-red-600')}>
                          {c.fillRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {analysis.columnStats.filter(c => c.numericStats).length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
                    <h3 className="text-sm font-extrabold text-slate-800 mb-4">Numeric Column Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            {['Column','Count','Distinct','Min','Max','Mean','Median','Mode','Std Dev','Sum','Outliers'].map(h => (
                              <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-bold whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.columnStats.filter(c => c.numericStats).map(c => (
                            <tr key={c.header} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-800 font-mono">{c.header}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{c.numericStats.count.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{c.numericStats.countDistinct.toLocaleString()}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{fmt(c.numericStats.min)}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{fmt(c.numericStats.max)}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{fmt(c.numericStats.mean)}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{fmt(c.numericStats.median)}</td>
                              <td className="py-2.5 px-3 text-blue-600 font-mono">{c.numericStats.mode ? `${String(c.numericStats.mode.value).slice(0,10)} ×${c.numericStats.mode.count}` : ''}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{fmt(c.numericStats.stdDev)}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-mono">{fmt(c.numericStats.sum)}</td>
                              <td className="py-2.5 px-3">
                                <span className={'font-bold ' + (c.numericStats.outliers > 0 ? 'text-amber-600' : 'text-emerald-600')}>{c.numericStats.outliers}</span>
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

            {/* ══════ COLUMNS TAB ══════ */}
            {activeTab === 'columns' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <input value={searchCol} onChange={e => setSearchCol(e.target.value)} placeholder="Search columns..."
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-slate-700 text-sm shadow-sm flex-1 max-w-xs" />
                  <span className="text-xs text-slate-400">{filteredCols.length} of {analysis.totalCols} columns</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCols.map(col => (
                    <div key={col.header} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 text-sm font-mono truncate" title={col.header}>{col.header}</div>
                          <span className={'text-xs font-bold px-2 py-0.5 rounded border mt-1 inline-block ' + (PATTERN_COLORS[col.dominantPattern] || 'bg-slate-100 text-slate-600 border-slate-200')}>
                            {PATTERN_ICONS[col.dominantPattern]} {col.dominantPattern}
                          </span>
                        </div>
                        <ScoreRing score={col.score} size={44} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        {[
                          { label: 'Fill', value: col.fillRate + '%', color: col.fillRate === 100 ? 'text-emerald-600' : col.fillRate >= 70 ? 'text-amber-600' : 'text-red-600' },
                          { label: 'Distinct', value: col.countDistinct, color: 'text-slate-700' },
                          { label: 'Nulls', value: col.nulls, color: col.nulls === 0 ? 'text-emerald-600' : 'text-red-600' },
                        ].map(s => (
                          <div key={s.label} className="bg-slate-50 rounded-xl py-2 border border-slate-100">
                            <div className={'text-sm font-extrabold ' + s.color}>{s.value}</div>
                            <div className="text-xs text-slate-400">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {col.modeAll && <div className="text-xs text-slate-500 mb-2 font-mono">Mode: <span className="text-blue-600 font-bold">{String(col.modeAll.value).slice(0,20)}</span> ×{col.modeAll.count}</div>}
                      {col.typeMismatch > 0 && <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-2 py-1 mb-2">⚡ {col.typeMismatch} type mismatch{col.typeMismatch > 1 ? 'es' : ''}</div>}
                      {col.numericStats?.distribution?.length > 1 && (
                        <div className="mb-2">
                          <div className="text-xs text-slate-400 mb-1">Distribution</div>
                          <DistributionChart buckets={col.numericStats.distribution} />
                        </div>
                      )}
                      {col.numericStats && <div className="text-xs text-slate-400 font-mono">{fmt(col.numericStats.min)} → {fmt(col.numericStats.max)} · avg {fmt(col.numericStats.mean)}</div>}
                      {col.topValues.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-slate-400 mb-1">Top Values</div>
                          {col.topValues.slice(0,3).map(v => (
                            <MiniBar key={v.val} value={v.count} max={col.topValues[0].count} color={TYPE_COLORS_BAR[col.dominantPattern] || '#3b82f6'} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════ DASHBOARD TAB ══════ */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-5">
                {/* Summary metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Records', value: activeRows.length.toLocaleString(), icon: '📋', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                    { label: 'Columns', value: activeHeaders.length, icon: '📊', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
                    { label: 'Data Quality', value: analysis.qualityScore + '/100', icon: '🏆', color: analysis.qualityScore >= 90 ? 'text-emerald-600' : 'text-amber-600', bg: analysis.qualityScore >= 90 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200' },
                    { label: 'Completeness', value: analysis.completeness + '%', icon: '✅', color: analysis.completeness === 100 ? 'text-emerald-600' : 'text-orange-600', bg: analysis.completeness === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200' },
                  ].map(m => (
                    <div key={m.label} className={'border rounded-2xl p-5 text-center ' + m.bg}>
                      <div className="text-3xl mb-2">{m.icon}</div>
                      <div className={'text-2xl font-extrabold ' + m.color}>{m.value}</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>

                {dashboardCharts.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="text-5xl mb-3">📈</div>
                    <div className="text-slate-600 font-bold text-base mb-1">No charts to display</div>
                    <p className="text-slate-400 text-sm">Your dataset needs at least one numeric or categorical column with multiple distinct values to generate charts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {dashboardCharts.map((chart, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-1">
                          <h3 className="text-sm font-extrabold text-slate-800 truncate" title={chart.title}>{chart.title}</h3>
                          <p className="text-xs text-slate-400">{chart.subtitle}</p>
                        </div>
                        <div className="mt-3">
                          {chart.type === 'bar' ? (
                            <InlineBarChart data={chart.data} color={chart.color} />
                          ) : (
                            <div className="flex items-start gap-3">
                              <DonutChart data={chart.data} size={110} />
                              <div className="flex-1 min-w-0">
                                {chart.data.slice(0, 5).map((d, j) => (
                                  <div key={j} className="flex items-center gap-2 mb-1">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_PALETTE[j % CHART_PALETTE.length] }} />
                                    <span className="text-xs text-slate-600 truncate flex-1" title={d.label}>{String(d.label).slice(0,14)}</span>
                                    <span className="text-xs font-bold text-slate-700 flex-shrink-0">{d.value}</span>
                                  </div>
                                ))}
                                {chart.data.length > 5 && <div className="text-xs text-slate-400 mt-1">+{chart.data.length - 5} more</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════ CLEAN DATA (TRANSFORM) TAB ══════ */}
            {activeTab === 'transform' && (
              <div className="flex flex-col gap-4">
                {/* Action buttons panel */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">Data Cleaning Actions</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Apply transformations step by step, then download the cleaned dataset</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasTransforms && (
                        <button onClick={txReset} className="text-xs text-red-600 hover:text-red-800 font-bold border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg bg-white transition-all">
                          ↺ Reset All
                        </button>
                      )}
                      <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
                        {activeRows.length.toLocaleString()} rows · {activeHeaders.length} columns
                        {hasTransforms && <span className="ml-1 text-blue-600 font-bold">· Modified</span>}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                      {/* Remove duplicate rows */}
                      <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">🔁</span>
                          <div>
                            <div className="text-sm font-bold text-slate-800">Remove Duplicate Rows</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {dupeCount > 0 ? <span className="text-red-600 font-bold">{dupeCount} duplicate rows detected</span> : <span className="text-emerald-600">No duplicates found</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={txRemoveDupeRows} disabled={dupeCount === 0}
                          className="w-full text-xs font-bold py-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 text-white disabled:text-slate-400 border-blue-600 disabled:border-slate-200">
                          Remove {dupeCount} Duplicate Rows
                        </button>
                      </div>

                      {/* Remove duplicate columns */}
                      <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">📋</span>
                          <div>
                            <div className="text-sm font-bold text-slate-800">Remove Duplicate Columns</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {dupeCols > 0 ? <span className="text-amber-600 font-bold">{dupeCols} identical column pair{dupeCols > 1 ? 's' : ''}</span> : <span className="text-emerald-600">No duplicate columns</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={txRemoveDupeCols} disabled={dupeCols === 0}
                          className="w-full text-xs font-bold py-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 text-white disabled:text-slate-400 border-blue-600 disabled:border-slate-200">
                          Remove {dupeCols} Duplicate Column{dupeCols > 1 ? 's' : ''}
                        </button>
                      </div>

                      {/* ── NEW: Rename duplicate header names ── */}
                      <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">🏷️</span>
                          <div>
                            <div className="text-sm font-bold text-slate-800">Rename Duplicate Headers</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {dupeHeaderCount > 0 ? <span className="text-amber-600 font-bold">{dupeHeaderCount} duplicate header name{dupeHeaderCount > 1 ? 's' : ''} detected</span> : <span className="text-emerald-600">All column names are unique</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-slate-400 bg-slate-50 rounded-lg px-2 py-1 mb-2 truncate">
                          &quot;name&quot; + &quot;name&quot; → &quot;name&quot; + &quot;name_2&quot;
                        </div>
                        <button onClick={txDedupeHeaders} disabled={dupeHeaderCount === 0}
                          className="w-full text-xs font-bold py-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 text-white disabled:text-slate-400 border-blue-600 disabled:border-slate-200">
                          Rename {dupeHeaderCount} Duplicate Header{dupeHeaderCount > 1 ? 's' : ''}
                        </button>
                      </div>

                      {/* Remove rows with nulls */}
                      <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">⬜</span>
                          <div>
                            <div className="text-sm font-bold text-slate-800">Remove Rows with Nulls</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {nullCount > 0 ? <span className="text-red-600 font-bold">{nullCount} null values across {analysis.nullCols.length} columns</span> : <span className="text-emerald-600">No null values found</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={txRemoveNullRows} disabled={nullCount === 0}
                          className="w-full text-xs font-bold py-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 text-white disabled:text-slate-400 border-blue-600 disabled:border-slate-200">
                          Drop Rows with Any Null
                        </button>
                      </div>

                      {/* Fill null values */}
                      <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">✏️</span>
                          <div>
                            <div className="text-sm font-bold text-slate-800">Fill Null Values</div>
                            <div className="text-xs text-slate-500 mt-0.5">Replace nulls instead of dropping rows</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mb-2">
                          {[{ v: 'zero', l: 'With 0' }, { v: 'mean', l: 'With Mean' }, { v: 'empty', l: 'With ""' }].map(opt => (
                            <button key={opt.v} onClick={() => setNullFillMode(opt.v)}
                              className={'text-xs font-bold px-2 py-1 rounded-lg border transition-all ' + (nullFillMode === opt.v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300')}>
                              {opt.l}
                            </button>
                          ))}
                        </div>
                        <button onClick={txFillNulls} disabled={nullCount === 0}
                          className="w-full text-xs font-bold py-2 rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 disabled:bg-slate-100 text-white disabled:text-slate-400 border-blue-600 disabled:border-slate-200">
                          Fill Nulls {nullFillMode === 'zero' ? 'with 0' : nullFillMode === 'mean' ? 'with Mean' : 'with ""'}
                        </button>
                      </div>

                      {/* Standardize headers */}
                      <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">🔤</span>
                          <div>
                            <div className="text-sm font-bold text-slate-800">Standardize Column Names</div>
                            <div className="text-xs text-slate-500 mt-0.5">Converts to lowercase snake_case  removes spaces and special characters</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-slate-400 bg-slate-50 rounded-lg px-2 py-1 mb-2 truncate">
                          &quot;First Name&quot; → first_name
                        </div>
                        <button onClick={txStandardizeHeaders}
                          className="w-full text-xs font-bold py-2 rounded-lg border transition-all bg-blue-600 hover:bg-blue-500 text-white border-blue-600">
                          Standardize Headers
                        </button>
                      </div>

                      {/* Download cleaned */}
                      <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-xl">⬇️</span>
                          <div>
                            <div className="text-sm font-bold text-blue-900">Download Data</div>
                            <div className="text-xs text-blue-600 mt-0.5">{activeRows.length.toLocaleString()} rows · {activeHeaders.length} columns{hasTransforms ? ' (cleaned)' : ''}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {['csv','xlsx','json'].map(f => (
                            <button key={f} onClick={() => downloadData(f)}
                              className="flex-1 text-xs bg-white hover:bg-blue-600 hover:text-white border border-blue-300 text-blue-700 font-bold py-2 rounded-lg transition-all uppercase">
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transform log */}
                {txLog.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider">✓ Applied Transformations</div>
                    <div className="flex flex-col gap-1">
                      {txLog.map((log, i) => (
                        <div key={i} className="text-xs text-emerald-700 flex items-center gap-2">
                          <span className="text-emerald-500 font-bold">{i + 1}.</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data preview table in transform tab  FIX 3: Live preview with ref */}
                <div ref={tablePreviewRef} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 pt-4 pb-0 flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-800">📋 Live Data Preview</span>
                    {hasTransforms && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">Cleaned</span>}
                    <span className="text-xs text-slate-400 ml-1"> updates instantly after each action above</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <input value={tableSearch} onChange={e => { setTableSearch(e.target.value); setTablePage(0); }} placeholder="Search data..."
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-400 w-40" />
                      <span className="text-xs text-slate-400">
                        {filteredTableRows.length.toLocaleString()} rows · {activeHeaders.length} cols
                        {hasTransforms && <span className="ml-1 text-blue-600 font-bold">· Cleaned</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setTablePage(0); }}
                        className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none">
                        {[25,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
                      </select>
                      <span className="text-xs text-slate-400">Download:</span>
                      {['csv','xlsx','json'].map(f => (
                        <button key={f} onClick={() => downloadData(f)}
                          className="text-xs bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 text-slate-600 font-bold px-2.5 py-1.5 rounded-lg transition-all uppercase">
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-auto max-h-[440px]">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-slate-400 font-bold w-10">#</th>
                          {activeHeaders.map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-bold text-slate-600 whitespace-nowrap max-w-32">
                              <div className="truncate" title={h}>{h}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pagedRows.map((row, ri) => (
                          <tr key={ri} className={'border-b border-slate-50 ' + (ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}>
                            <td className="px-3 py-2 text-slate-400 font-mono">{tablePage * pageSize + ri + 1}</td>
                            {activeHeaders.map(h => {
                              const val = row[h];
                              const isEmpty = val === null || val === undefined || String(val).trim() === '';
                              const col = analysis.columnStats.find(c => c.header === h || c.header === headers[activeHeaders.indexOf(h)]);
                              const isMismatch = col && (col.dominantPattern === 'integer' || col.dominantPattern === 'float') && !isEmpty && isNaN(parseFloat(String(val)));
                              return (
                                <td key={h} className={'px-3 py-2 font-mono max-w-32 ' + (isEmpty ? 'bg-red-50' : isMismatch ? 'bg-amber-50' : '')}>
                                  <span className="truncate block" title={String(val ?? '')}>
                                    {isEmpty ? <span className="italic text-slate-300">null</span> : <span className={isMismatch ? 'text-amber-600' : 'text-slate-700'}>{String(val).slice(0,50)}{String(val).length > 50 ? '…' : ''}</span>}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 flex-wrap gap-2 bg-slate-50/50">
                      <span className="text-xs text-slate-400">Rows {(tablePage * pageSize + 1).toLocaleString()}–{Math.min((tablePage + 1) * pageSize, filteredTableRows.length).toLocaleString()} of {filteredTableRows.length.toLocaleString()}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setTablePage(0)} disabled={tablePage === 0} className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-500">«</button>
                        <button onClick={() => setTablePage(p => Math.max(0, p - 1))} disabled={tablePage === 0} className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-600">‹</button>
                        {buildPageRange(tablePage + 1, totalPages).map((pg, i) => (
                          pg === '...' ? <span key={`e-${i}`} className="text-xs text-slate-300 px-1">…</span>
                            : <button key={`p-${pg}`} onClick={() => setTablePage(pg - 1)}
                                className={'text-xs px-3 py-1.5 rounded-lg border transition-all ' + (tablePage + 1 === pg ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300')}>
                                {pg}
                              </button>
                        ))}
                        <button onClick={() => setTablePage(p => Math.min(totalPages - 1, p + 1))} disabled={tablePage >= totalPages - 1} className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-600">›</button>
                        <button onClick={() => setTablePage(totalPages - 1)} disabled={tablePage >= totalPages - 1} className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-500">»</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════ DATA TABLE TAB ══════ */}
            {activeTab === 'data' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 flex-wrap gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input value={tableSearch} onChange={e => { setTableSearch(e.target.value); setTablePage(0); }} placeholder="Search in table..."
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:border-blue-400 w-44" />
                    <span className="text-xs text-slate-400">{filteredTableRows.length.toLocaleString()} rows · {activeHeaders.length} columns</span>
                    <select value={pageSize} onChange={e => { setPageSize(+e.target.value); setTablePage(0); }}
                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 outline-none">
                      {[25,50,100,250].map(n => <option key={n} value={n}>{n} / page</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Download:</span>
                    {['csv','xlsx','json'].map(f => (
                      <button key={f} onClick={() => downloadData(f)}
                        className="text-xs bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 text-slate-600 font-bold px-3 py-1.5 rounded-lg transition-all uppercase">
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-auto max-h-[560px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-slate-400 font-bold w-12">#</th>
                        {activeHeaders.map(h => {
                          const col = analysis.columnStats.find(c => c.header === h);
                          const isColDupe = analysis.columnDupes.some(d => d.col1 === h || d.col2 === h);
                          return (
                            <th key={h} className={'px-3 py-2.5 text-left whitespace-nowrap max-w-36 ' + (isColDupe ? 'bg-amber-50' : '')}>
                              <div className={'font-bold truncate ' + (isColDupe ? 'text-amber-600' : 'text-slate-700')} title={h}>
                                {h} {isColDupe && <span className="text-amber-400">⊕</span>}
                              </div>
                              {col && (
                                <span className={'text-xs font-bold px-1.5 py-0.5 rounded border mt-0.5 inline-block ' + (PATTERN_COLORS[col.dominantPattern] || '')}>
                                  {PATTERN_ICONS[col.dominantPattern]}
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
                          <tr key={ri} className={'border-b border-slate-50 ' + (isDupe ? 'bg-red-50' : ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/30')}>
                            <td className="px-3 py-2 text-slate-400 font-mono">
                              {absIdx + 1}{isDupe && <span className="ml-1 text-red-500 font-bold text-xs" title="Duplicate row">⊕</span>}
                            </td>
                            {activeHeaders.map(h => {
                              const val = row[h];
                              const isEmpty = val === null || val === undefined || String(val).trim() === '';
                              const col = analysis.columnStats.find(c => c.header === h);
                              const isMismatch = col && (col.dominantPattern === 'integer' || col.dominantPattern === 'float') && !isEmpty && isNaN(parseFloat(String(val)));
                              return (
                                <td key={h} className={'px-3 py-2 font-mono max-w-36 ' + (isEmpty ? 'bg-slate-100/60' : isMismatch ? 'bg-amber-50' : '')}>
                                  <span className="truncate block" title={String(val ?? '')}>
                                    {isEmpty ? <span className="italic text-slate-300 text-xs">null</span> : <span className={isMismatch ? 'text-amber-600' : 'text-slate-700'}>{String(val).slice(0,60)}{String(val).length > 60 ? '…' : ''}</span>}
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 flex-wrap gap-2 bg-slate-50/50">
                    <span className="text-xs text-slate-400">Rows {(tablePage * pageSize + 1).toLocaleString()}–{Math.min((tablePage + 1) * pageSize, filteredTableRows.length).toLocaleString()} of {filteredTableRows.length.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setTablePage(0)} disabled={tablePage === 0} className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-500">«</button>
                      <button onClick={() => setTablePage(p => Math.max(0, p - 1))} disabled={tablePage === 0} className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-600">‹ Prev</button>
                      {buildPageRange(tablePage + 1, totalPages).map((pg, i) => (
                        pg === '...' ? <span key={`e-${i}`} className="text-xs text-slate-300 px-1">…</span>
                          : <button key={`p-${pg}`} onClick={() => setTablePage(pg - 1)}
                              className={'text-xs px-3 py-1.5 rounded-lg border transition-all ' + (tablePage + 1 === pg ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300')}>
                              {pg}
                            </button>
                      ))}
                      <button onClick={() => setTablePage(p => Math.min(totalPages - 1, p + 1))} disabled={tablePage >= totalPages - 1} className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-600">Next ›</button>
                      <button onClick={() => setTablePage(totalPages - 1)} disabled={tablePage >= totalPages - 1} className="text-xs px-2 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:border-blue-300 text-slate-500">»</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════ ISSUES TAB ══════ */}
            {activeTab === 'issues' && (
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-extrabold text-slate-800">
                      🔁 Duplicate Rows
                      <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' + (analysis.duplicates.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                        {analysis.duplicates.length}
                      </span>
                    </h3>
                    {analysis.duplicates.length > 0 && (
                      <button onClick={() => setShowDupes(!showDupes)} className="text-xs text-blue-600 hover:text-blue-800 font-bold">
                        {showDupes ? 'Hide preview' : 'Show preview'}
                      </button>
                    )}
                  </div>
                  {analysis.duplicates.length === 0 ? <p className="text-sm text-emerald-600 font-medium">✓ No duplicate rows found.</p> : (
                    <div>
                      <p className="text-sm text-slate-600 mb-3">{analysis.duplicates.length} exact duplicate rows detected. Go to <button onClick={() => setActiveTab('transform')} className="text-blue-600 underline font-bold">Clean Data</button> to remove them.</p>
                      <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto">
                        {analysis.duplicates.map((d, i) => (
                          <span key={i} className="text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-lg font-mono">Row {d.rowIndex} = Row {d.firstSeen}</span>
                        ))}
                      </div>
                      {showDupes && (
                        <div className="overflow-x-auto rounded-xl border border-red-100">
                          <table className="w-full text-xs">
                            <thead className="bg-red-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-red-600 font-bold border-b border-red-100">Row #</th>
                                <th className="px-3 py-2 text-left text-red-600 font-bold border-b border-red-100">Copy of</th>
                                {headers.slice(0, 5).map(h => <th key={h} className="px-3 py-2 text-left text-slate-500 font-bold border-b border-red-100 whitespace-nowrap">{h}</th>)}
                                {headers.length > 5 && <th className="px-3 py-2 text-slate-400 border-b border-red-100">+{headers.length - 5} more</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {analysis.duplicates.slice(0, 5).map((d, i) => (
                                <tr key={i} className="border-b border-red-50 bg-red-50/30">
                                  <td className="px-3 py-2 font-mono text-red-600 font-bold">{d.rowIndex}</td>
                                  <td className="px-3 py-2 font-mono text-slate-400">Row {d.firstSeen}</td>
                                  {headers.slice(0, 5).map(h => <td key={h} className="px-3 py-2 font-mono text-slate-600 max-w-24 truncate">{String(d.rowData[h] ?? '').slice(0, 18)}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* ── NEW: Duplicate Header Names section ── */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">
                    🏷️ Duplicate Column Names
                    <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' + (effectiveHdrDupes.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                      {effectiveHdrDupes.length}
                    </span>
                  </h3>
                  {effectiveHdrDupes.length === 0 ? (
                    <p className="text-sm text-emerald-600 font-medium">✓ All column names are unique.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="text-sm text-slate-600">These columns share an identical name. The tool renamed them for analysis (Class→Class_2) but they were duplicates in your original file. Use Clean Data to keep the renamed version.</p>
                      {effectiveHdrDupes.map((d, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold bg-white border border-amber-300 text-amber-700 px-3 py-1 rounded-lg font-mono">{d.name}</span>
                          <span className="text-xs text-slate-400 font-bold">appears at</span>
                          <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">col {d.firstIndex + 1}</span>
                          <span className="text-xs text-slate-400">and</span>
                          <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">col {d.dupeIndex + 1}</span>
                          <span className="ml-auto text-xs text-amber-600 font-bold">→ will become {d.name}_2</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">📋 Duplicate Columns <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' + (analysis.columnDupes.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{analysis.columnDupes.length}</span></h3>
                  {analysis.columnDupes.length === 0 ? <p className="text-sm text-emerald-600 font-medium">✓ No duplicate columns found.</p> : (
                    <div className="flex flex-col gap-3">
                      {analysis.columnDupes.map((d, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-xs font-bold bg-white border border-amber-300 text-amber-700 px-3 py-1 rounded-lg font-mono">{d.col1}</span>
                            <span className="text-xs text-slate-400 font-bold">= identical to =</span>
                            <span className="text-xs font-bold bg-white border border-amber-300 text-amber-700 px-3 py-1 rounded-lg font-mono">{d.col2}</span>
                          </div>
                          <div className="flex gap-2 flex-wrap">{d.sampleValues.map((v, vi) => <span key={vi} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">{String(v).slice(0,20)}</span>)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">⬜ Null Value Columns <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' + (analysis.nullCols.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{analysis.nullCols.length}</span></h3>
                  {analysis.nullCols.length === 0 ? <p className="text-sm text-emerald-600 font-medium">✓ No null values found.</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.nullCols.map(c => (
                        <div key={c.header} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                          <div className="flex-1"><div className="font-bold text-slate-700 text-xs font-mono">{c.header}</div><div className="text-xs text-slate-400 mt-0.5">{c.nulls} nulls · {100 - c.fillRate}% empty</div></div>
                          <div className={'text-sm font-extrabold ' + (c.fillRate >= 70 ? 'text-amber-600' : 'text-red-600')}>{c.fillRate}%</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">⚡ Type Mismatch Columns <span className={'ml-2 text-xs font-bold px-2 py-0.5 rounded-full ' + (analysis.mismatchCols.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{analysis.mismatchCols.length}</span></h3>
                  {analysis.mismatchCols.length === 0 ? <p className="text-sm text-emerald-600 font-medium">✓ No type mismatches detected.</p> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.mismatchCols.map(c => (
                        <div key={c.header} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <div className="font-bold text-slate-700 text-xs font-mono">{c.header}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Expected <span className="text-amber-600 font-bold">{c.dominantPattern}</span> · {c.typeMismatch} non-numeric value{c.typeMismatch > 1 ? 's' : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {analysis.columnStats.filter(c => c.numericStats?.outliers > 0).length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-800 mb-4">📉 Statistical Outliers (3σ)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.columnStats.filter(c => c.numericStats?.outliers > 0).map(c => (
                        <div key={c.header} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <div className="font-bold text-slate-700 text-xs font-mono">{c.header}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{c.numericStats.outliers} value{c.numericStats.outliers > 1 ? 's' : ''} more than 3σ from mean ({fmt(c.numericStats.mean)})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════ SCHEMA TAB ══════ */}
            {activeTab === 'schema' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-800">Inferred Schema</h3>
                  <button onClick={() => { const schema = analysis.columnStats.map(c => ({ column: c.header, type: c.dominantPattern, nullable: c.nulls > 0, unique: c.uniqueRate === 100, count: c.count, countDistinct: c.countDistinct, fillRate: c.fillRate + '%', mode: c.modeAll?.value || null })); copy(JSON.stringify(schema, null, 2), 'schema'); }}
                    className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ' + (copied === 'schema' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-600 border-slate-200')}>
                    {copied === 'schema' ? '✓ Copied' : 'Copy Schema JSON'}
                  </button>
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>{['#','Column','Type','Count','Distinct','Nullable','Unique','Fill %','Mode','Sample'].map(h => <th key={h} className="px-4 py-3 text-left text-slate-500 font-bold whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {analysis.columnStats.map((c, i) => (
                        <tr key={c.header} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-400 font-mono">{i + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-800 font-mono">{c.header}</td>
                          <td className="px-4 py-3"><span className={'text-xs font-bold px-2 py-0.5 rounded border ' + (PATTERN_COLORS[c.dominantPattern] || 'bg-slate-100 text-slate-600 border-slate-200')}>{PATTERN_ICONS[c.dominantPattern]} {c.dominantPattern}</span></td>
                          <td className="px-4 py-3 text-slate-600 font-mono">{c.count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-600 font-mono">{c.countDistinct.toLocaleString()}</td>
                          <td className="px-4 py-3"><span className={c.nulls > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>{c.nulls > 0 ? 'YES' : 'NO'}</span></td>
                          <td className="px-4 py-3"><span className={c.uniqueRate === 100 ? 'text-blue-600 font-bold' : 'text-slate-400'}>{c.uniqueRate === 100 ? 'YES' : c.unique + ' vals'}</span></td>
                          <td className="px-4 py-3"><span className={c.fillRate === 100 ? 'text-emerald-600 font-bold' : c.fillRate >= 70 ? 'text-amber-600' : 'text-red-600'}>{c.fillRate}%</span></td>
                          <td className="px-4 py-3 text-blue-600 font-mono max-w-24 truncate">{c.modeAll ? String(c.modeAll.value).slice(0, 14) : ''}</td>
                          <td className="px-4 py-3 font-mono text-slate-400 max-w-36 truncate">{c.topValues[0]?.val ? String(c.topValues[0].val).slice(0, 24) : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── RELATED TOOLS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-800 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Free tools that complement your data workflow.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map(t => (
              <a key={t.href} href={t.href} className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                <span className="text-2xl flex-shrink-0">{t.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{t.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-800 mb-4">Free CSV and Excel Data Analyzer  Find Duplicates, Nulls and Errors Instantly</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">Upload any CSV or Excel file to instantly find duplicate rows, null values, type mismatches and data quality issues. The Clean Data tab lets you remove duplicates, fill nulls and standardize headers in one click, then download the cleaned file. The Dashboard tab auto-generates charts from your data. No Python, no SQL, no formulas required.</p>
          <div className="flex flex-col gap-3">
            {[
              { q: 'How do I find and remove duplicate rows in CSV?', a: 'Upload your file, then go to the Clean Data tab. Click "Remove Duplicate Rows" to deduplicate instantly. The row count updates and you can download the cleaned file as CSV, Excel or JSON.' },
              { q: 'Can I fill null values instead of deleting rows?', a: 'Yes. In the Clean Data tab, choose "Fill Nulls" with options to fill with 0, with the column mean, or with an empty string. This lets you keep all rows while fixing missing values.' },
              { q: 'What does the Dashboard tab show?', a: 'The Dashboard tab auto-generates bar charts for numeric columns showing value distribution, and donut charts for categorical columns showing the most frequent values. It gives you an instant visual overview without any configuration.' },
              { q: 'Does this tool process all rows?', a: 'Yes. There is no row limit. All rows are processed in your browser. Your files never leave your device.' },
            ].map(faq => (
              <div key={faq.q} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-sm font-bold text-slate-700 mb-1.5">{faq.q}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}