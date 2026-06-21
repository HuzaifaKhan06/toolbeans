'use client';

import { useState, useRef } from 'react';

// ── Utilities ──
const formatJSON = (text, indent = 2) => {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed, null, indent);
};

const minifyJSON = (text) => {
  const parsed = JSON.parse(text);
  return JSON.stringify(parsed);
};

// NEW: recursively sort object keys A→Z (arrays keep their order).
const sortKeysDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, k) => { acc[k] = sortKeysDeep(value[k]); return acc; }, {});
  }
  return value;
};

const getJSONStats = (text) => {
  try {
    const parsed = JSON.parse(text);
    const str    = JSON.stringify(parsed);
    const keys   = str.match(/"[^"]+"\s*:/g)?.length || 0;
    const arrays = (str.match(/\[/g) || []).length;
    const objects= (str.match(/\{/g) || []).length;
    const depth  = (() => {
      let max = 0, cur = 0;
      for (const c of str) {
        if (c === '{' || c === '[') { cur++; max = Math.max(max, cur); }
        if (c === '}' || c === ']') cur--;
      }
      return max;
    })();
    return { keys, arrays, objects, depth, size: new Blob([text]).size };
  } catch { return null; }
};

const formatBytes = (b) => b < 1024 ? `${b} B` : `${(b / 1024).toFixed(1)} KB`;

const SAMPLES = [
  {
    label: 'User Object',
    json: `{"id":1,"name":"John Doe","email":"john@example.com","age":30,"address":{"street":"123 Main St","city":"New York","country":"USA"},"tags":["developer","designer"],"active":true}`,
  },
  {
    label: 'API Response',
    json: `{"status":"success","code":200,"data":{"users":[{"id":1,"name":"Alice","role":"admin"},{"id":2,"name":"Bob","role":"user"}],"total":2,"page":1},"timestamp":"2025-01-01T00:00:00Z"}`,
  },
  {
    label: 'Config File',
    json: `{"app":"TOOLBeans","version":"1.0.0","debug":false,"database":{"host":"localhost","port":5432,"name":"TOOLBeans_db"},"features":{"analytics":true,"notifications":false}}`,
  },
];

// ── Tree Node Component ──
function TreeNode({ data, depth = 0, keyName = null, isLast = true }) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  const isObject  = data !== null && typeof data === 'object' && !Array.isArray(data);
  const isArray   = Array.isArray(data);
  const isComplex = isObject || isArray;

  const entries = isObject
    ? Object.entries(data)
    : isArray
    ? data.map((v, i) => [i, v])
    : [];

  const preview = isComplex
    ? isArray
      ? `Array(${data.length})`
      : `{${Object.keys(data).slice(0, 2).join(', ')}${Object.keys(data).length > 2 ? '…' : ''}}`
    : null;

  const getValueColor = (v) => {
    if (v === null)             return 'text-slate-400 italic';
    if (typeof v === 'boolean') return v ? 'text-green-600' : 'text-red-500';
    if (typeof v === 'number')  return 'text-blue-600';
    if (typeof v === 'string')  return 'text-amber-700';
    return 'text-slate-700';
  };

  const getValueDisplay = (v) => {
    if (v === null)             return 'null';
    if (typeof v === 'string')  return `"${v}"`;
    return String(v);
  };

  return (
    <div className="font-mono text-xs leading-relaxed">
      <div className="flex items-start gap-1 hover:bg-slate-50 rounded-lg px-1 py-0.5 group cursor-default transition-colors">
        {/* Indent */}
        {Array.from({ length: depth }).map((_, i) => (
          <span key={i} className="w-4 flex-shrink-0 border-l border-slate-100 h-full" />
        ))}

        {/* Collapse toggle */}
        {isComplex ? (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-indigo-600 flex-shrink-0 rounded transition-colors"
          >
            {collapsed ? '▶' : '▼'}
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Key */}
        {keyName !== null && (
          <span className="text-indigo-600 font-semibold flex-shrink-0">
            {typeof keyName === 'string' ? `"${keyName}"` : keyName}
            <span className="text-slate-400 font-normal">: </span>
          </span>
        )}

        {/* Value */}
        {isComplex ? (
          collapsed ? (
            <span className="text-slate-500">
              {isArray ? '[' : '{'}
              <span className="text-slate-400 italic mx-1">{preview}</span>
              {isArray ? ']' : '}'}
              {!isLast && <span className="text-slate-400">,</span>}
            </span>
          ) : (
            <span className="text-slate-500">{isArray ? '[' : '{'}</span>
          )
        ) : (
          <span className={getValueColor(data)}>
            {getValueDisplay(data)}
            {!isLast && <span className="text-slate-400">,</span>}
          </span>
        )}
      </div>

      {/* Children */}
      {isComplex && !collapsed && (
        <>
          {entries.map(([k, v], i) => (
            <TreeNode
              key={k}
              data={v}
              depth={depth + 1}
              keyName={k}
              isLast={i === entries.length - 1}
            />
          ))}
          <div className="flex items-center">
            {Array.from({ length: depth }).map((_, i) => (
              <span key={i} className="w-4 flex-shrink-0 border-l border-slate-100" />
            ))}
            <span className="w-4 flex-shrink-0" />
            <span className="font-mono text-xs text-slate-500">
              {isArray ? ']' : '}'}
              {!isLast && <span className="text-slate-400">,</span>}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default function JSONTool() {
  const [input, setInput]           = useState('');
  const [output, setOutput]         = useState('');
  const [indent, setIndent]         = useState(2);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(false);
  const [escCopied, setEscCopied]   = useState(false);
  const [activeView, setActiveView] = useState('formatted');
  const [activeTab, setActiveTab]   = useState('editor');
  const [parsed, setParsed]         = useState(null);
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef                     = useRef(null);

  const validate = (text) => {
    if (!text.trim()) { setError(''); setParsed(null); return false; }
    try {
      const p = JSON.parse(text);
      setParsed(p);
      setError('');
      return true;
    } catch (e) {
      setError(e.message);
      setParsed(null);
      return false;
    }
  };

  const handleInput = (val) => {
    setInput(val);
    validate(val);
    setOutput('');
  };

  const handleFormat = () => {
    if (!validate(input)) return;
    try {
      const result = formatJSON(input, indent);
      setOutput(result);
      setActiveView('formatted');
      addHistory('format', result);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleMinify = () => {
    if (!validate(input)) return;
    try {
      const result = minifyJSON(input);
      setOutput(result);
      setActiveView('formatted');
      addHistory('minify', result);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRepair = () => {
    if (!input.trim()) return;
    try {
      let fixed = input
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/'/g, '"');
      const result = formatJSON(fixed, indent);
      setInput(fixed);
      setOutput(result);
      setError('');
      setParsed(JSON.parse(fixed));
      addHistory('repair', result);
    } catch {
      setError('Could not auto-repair. Please fix the JSON manually.');
    }
  };

  // NEW: sort all object keys A→Z (recursive). Updates input, tree and output.
  const handleSortKeys = () => {
    if (!validate(input)) return;
    try {
      const sortedObj  = sortKeysDeep(JSON.parse(input));
      const sortedText = JSON.stringify(sortedObj, null, indent);
      setInput(sortedText);
      setParsed(sortedObj);
      setOutput(sortedText);
      setActiveView('formatted');
      addHistory('sort', sortedText);
    } catch (e) {
      setError(e.message);
    }
  };

  // NEW: copy the JSON as an escaped string literal (for embedding in code).
  const handleCopyEscaped = async () => {
    if (!validate(input)) return;
    try {
      const escaped = JSON.stringify(minifyJSON(input)); // quoted, escaped one-liner
      await navigator.clipboard.writeText(escaped);
      setEscCopied(true);
      setTimeout(() => setEscCopied(false), 2500);
    } catch (e) {
      setError(e.message);
    }
  };

  const addHistory = (action, result) => {
    setHistory((prev) => [{
      action,
      preview: result.slice(0, 60) + (result.length > 60 ? '…' : ''),
      full: result,
      time: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 8));
  };

  const copyOutput = async (text) => {
    await navigator.clipboard.writeText(text || output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadJSON = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TOOLBeans-formatted.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      setInput(text);
      validate(text);
    };
    reader.readAsText(file);
  };

  const pasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInput(text);
    } catch { /* ignore */ }
  };

  const stats = input ? getJSONStats(input) : null;
  const isValid = parsed !== null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-yellow-50 via-white to-indigo-50 border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <a href="/" className="hover:text-indigo-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-indigo-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">JSON Formatter</span>
          </nav>
          <span className="inline-block bg-yellow-50 text-yellow-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Developer Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            JSON{' '}
            <span className="bg-gradient-to-r from-yellow-500 to-indigo-600 bg-clip-text text-transparent">
              Formatter & Viewer
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto">
            Format, validate, minify and explore JSON with an interactive tree viewer.
            Auto-repair broken JSON, sort keys, download results 100% runs in your browser.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">

        {/* ── SAMPLES ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Samples</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button key={s.label}
                onClick={() => { handleInput(s.json); }}
                className="text-xs bg-slate-50 hover:bg-yellow-50 border border-slate-200 hover:border-yellow-300 text-slate-600 hover:text-yellow-700 font-semibold px-3 py-2 rounded-xl transition-all">
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* ── INPUT PANEL ── */}
          <div className="flex flex-col gap-0 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">JSON Input</span>
                {input && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isValid ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isValid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={pasteInput} className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all">⎘ Paste</button>
                <button onClick={() => fileRef.current?.click()} className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all">📎 File</button>
                <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />
                <button onClick={() => { setInput(''); setOutput(''); setError(''); setParsed(null); }}
                  className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all">✕ Clear</button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={`Paste your JSON here…\n\nExample:\n{\n  "name": "TOOLBeans",\n  "tools": 7,\n  "free": true\n}`}
              className="w-full px-5 py-4 text-sm text-slate-700 outline-none resize-none font-mono leading-relaxed bg-white flex-1"
              style={{ minHeight: '300px' }}
            />

            {/* Error */}
            {error && (
              <div className="mx-5 mb-4 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-600 font-medium">
                <span className="flex-shrink-0 text-base">⚠️</span>
                <div>
                  <div className="font-bold mb-0.5">JSON Error</div>
                  <code className="font-mono">{error}</code>
                </div>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                {[
                  { label: 'Keys', value: stats.keys },
                  { label: 'Arrays', value: stats.arrays },
                  { label: 'Objects', value: stats.objects },
                  { label: 'Depth', value: stats.depth },
                  { label: 'Size', value: formatBytes(stats.size) },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-700">{s.value}</span>
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── OUTPUT PANEL ── */}
          <div className={`flex flex-col bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${output ? 'border-indigo-200' : 'border-slate-200'}`}>

            {/* Tabs */}
            <div className={`flex items-center justify-between px-3 py-2 border-b transition-all ${output ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex gap-1">
                {[
                  { key: 'formatted', label: '{ } Formatted' },
                  { key: 'tree',      label: '🌳 Tree View' },
                  { key: 'minified',  label: '⬌ Minified' },
                ].map((v) => (
                  <button key={v.key}
                    onClick={() => {
                      setActiveView(v.key);
                      if (v.key === 'minified' && parsed) setOutput(minifyJSON(input));
                      else if (v.key === 'formatted' && parsed) setOutput(formatJSON(input, indent));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${activeView === v.key
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                      }`}>
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => copyOutput()}
                  disabled={!output && activeView !== 'tree'}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all
                    ${copied ? 'bg-green-500 text-white' : output ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                  {copied ? '✓' : '⎘'}
                </button>
                <button onClick={downloadJSON} disabled={!output}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${output ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}>
                  ⬇
                </button>
              </div>
            </div>

            {/* Output content */}
            <div className="flex-1 overflow-auto" style={{ minHeight: '300px' }}>
              {activeView === 'tree' && parsed ? (
                <div className="px-4 py-4">
                  <TreeNode data={parsed} />
                </div>
              ) : activeView === 'tree' && !parsed ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-slate-300">
                  <div className="text-5xl mb-3">🌳</div>
                  <div className="text-sm">Paste valid JSON to see the tree view</div>
                </div>
              ) : output ? (
                <pre className="px-5 py-4 text-sm text-slate-700 font-mono leading-relaxed whitespace-pre-wrap break-words select-all">
                  {output}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-slate-300">
                  <div className="text-5xl mb-3">{'{}'}</div>
                  <div className="text-sm">Click Format or Minify to see output</div>
                </div>
              )}
            </div>

            {/* Output stats */}
            {output && (
              <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">{output.length}</span>
                  <span className="text-xs text-slate-400">chars</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">{formatBytes(new Blob([output]).size)}</span>
                  <span className="text-xs text-slate-400">size</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-wrap gap-3 flex-1">
              <button onClick={handleFormat}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200">
                ✨ Format / Beautify
              </button>
              <button onClick={handleMinify}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2">
                ⬌ Minify
              </button>
              <button onClick={handleSortKeys}
                className="bg-yellow-500 hover:bg-yellow-400 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2">
                🔤 Sort Keys
              </button>
              <button onClick={handleRepair}
                className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2">
                🔧 Auto-Repair
              </button>
              <button onClick={handleCopyEscaped}
                className={'font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2 ' + (escCopied ? 'bg-green-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600')}>
                {escCopied ? '✓ Copied!' : '⤷ Copy as Escaped String'}
              </button>
              {output && (
                <button onClick={downloadJSON}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2">
                  ⬇️ Download JSON
                </button>
              )}
            </div>

            {/* Indent selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indent</span>
              <div className="flex gap-1">
                {[2, 4, '\t'].map((v) => (
                  <button key={v}
                    onClick={() => { setIndent(v); if (output) { try { setOutput(formatJSON(input, v)); } catch {} } }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border-2 transition-all
                      ${indent === v ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                    {v === '\t' ? 'TAB' : v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── HISTORY ── */}
        {history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
            <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">🕐 History ({history.length})</span>
              <span className="text-slate-400 text-sm">{showHistory ? '▲' : '▼'}</span>
            </button>
            {showHistory && (
              <div className="border-t border-slate-100 divide-y divide-slate-50">
                {history.map((h, i) => (
                  <div key={i} onClick={() => setOutput(h.full)} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 font-mono
                      ${h.action === 'format' ? 'bg-indigo-50 text-indigo-600' : h.action === 'minify' ? 'bg-slate-100 text-slate-600' : h.action === 'sort' ? 'bg-yellow-50 text-yellow-700' : 'bg-amber-50 text-amber-600'}`}>
                      {h.action}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">{h.time}</span>
                    <span className="text-xs text-slate-500 font-mono truncate flex-1">{h.preview}</span>
                  </div>
                ))}
                <div className="px-6 py-3 bg-slate-50">
                  <button onClick={() => setHistory([])} className="text-xs text-rose-400 hover:text-rose-600 font-semibold">Clear History</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* Feature grid (kept) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Why Use a JSON Formatter?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '👁️', title: 'Readable Formatting',   desc: 'Transform minified one-line JSON into indented, human-readable structure instantly.' },
              { icon: '✅', title: 'Instant Validation',    desc: 'Detect JSON syntax errors immediately with descriptive error messages showing the exact problem.' },
              { icon: '🌳', title: 'Interactive Tree View', desc: 'Explore deeply nested JSON by expanding and collapsing nodes in the visual tree.' },
              { icon: '🔧', title: 'Auto-Repair',           desc: 'Automatically fix common JSON issues like trailing commas, single quotes, and unquoted keys.' },
              { icon: '🔤', title: 'Sort Keys',             desc: 'Order every object key alphabetically and recursively, which makes diffs and reviews far easier.' },
              { icon: '⬌',  title: 'Minify for Production', desc: 'Remove all whitespace to reduce payload size for APIs and storage.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{f.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free Online JSON Formatter, Validator and Viewer</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans JSON Formatter takes messy, minified or hand-written JSON and turns it into clean, properly indented, easy-to-read text in an instant. It does far more than pretty-print: it validates your JSON and pinpoints syntax errors, lets you explore the structure in an interactive collapsible tree, minifies for production, sorts keys alphabetically, auto-repairs common mistakes, and copies the result as an escaped string ready to drop into code.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Everything runs locally in your browser. Your JSON is parsed and formatted on your own device and is never uploaded to a server, which makes the tool fast, private and safe for API responses, configuration files and any data you would rather not paste into an unknown online service. There is no signup, no watermark and no limit on size.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Whether you are debugging an API payload, tidying a config file, reviewing a data export or just trying to understand an unfamiliar structure, the formatter gives you a clear view and the tools to reshape it.
          </p>
        </article>

        {/* What is JSON */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What Is JSON and Why Formatting Matters</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            JSON, short for JavaScript Object Notation, is the most widely used format for exchanging structured data between systems. It represents data as nested objects of key and value pairs and as ordered arrays, using a small, strict syntax that almost every programming language can read and write. APIs return JSON, configuration files are written in JSON, and databases and logs store it everywhere.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The catch is that JSON is often transmitted minified, with every space and line break removed to save bandwidth. That is efficient for machines but almost unreadable for humans: a single long line with hundreds of braces and quotes. Formatting reverses this, adding indentation and line breaks so the structure becomes visible at a glance, with each level of nesting clearly stepped in.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Good formatting is not just cosmetic. It makes bugs obvious, helps you spot a missing field or a wrong value, and turns a wall of text into something you can actually navigate. Combined with validation and a tree view, it is the difference between guessing and knowing what your data contains.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Format and Validate JSON</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Paste or upload JSON', 'Paste your JSON into the input panel, use the Paste button to pull from your clipboard, load a sample, or upload a .json file. The validity badge tells you instantly whether it parses.'],
              ['2', 'Format or minify', 'Click Format to produce clean, indented JSON, or Minify to collapse it to a single compact line. Choose 2 spaces, 4 spaces or tabs for indentation.'],
              ['3', 'Explore the tree', 'Switch to Tree View to expand and collapse objects and arrays. Values are colour-coded by type so strings, numbers, booleans and nulls are easy to tell apart.'],
              ['4', 'Sort, repair or escape', 'Sort Keys orders everything alphabetically, Auto-Repair fixes common mistakes, and Copy as Escaped String gives you a ready-to-paste string literal for your code.'],
              ['5', 'Read the stats', 'The input panel reports the number of keys, arrays, objects, the nesting depth and the size, so you can gauge the shape of the data at a glance.'],
              ['6', 'Copy or download', 'Copy the formatted result to your clipboard or download it as a .json file. Your recent actions are kept in the history list so you can revisit them.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Features deep dive */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Every Tool in One Place</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Validation with clear errors', 'The formatter parses your JSON as you type and shows a green Valid or red Invalid badge. When something is wrong, it surfaces the parser\u2019s own error message so you can jump to the problem instead of hunting blindly.'],
              ['Interactive tree view', 'Large JSON is hard to read as raw text. The tree view renders it as an expandable outline with colour-coded values, so you can collapse the parts you do not care about and drill into the parts you do.'],
              ['Auto-repair', 'Hand-written JSON often has trailing commas, single quotes or unquoted keys. Auto-repair applies common fixes and reformats the result, turning almost-valid JSON into valid JSON in one click.'],
              ['Sort keys', 'Sorting every object key alphabetically, all the way down, makes two JSON documents directly comparable and produces stable, predictable output that is ideal for diffs and version control.'],
              ['Minify', 'Minify strips all non-essential whitespace to produce the smallest valid JSON, which is what you want when embedding data in a request body or storing it compactly.'],
              ['Copy as escaped string', 'Sometimes you need JSON as a string inside source code or a test. This copies a fully escaped, quoted one-line version that you can paste directly into a variable.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[200px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Common errors */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Common JSON Errors and How to Fix Them</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Trailing commas', 'A comma after the last item in an object or array is invalid in JSON, even though it is allowed in JavaScript. Remove it, or use Auto-Repair which strips trailing commas for you.'],
              ['Single quotes', 'JSON requires double quotes around both keys and string values. Single quotes are a frequent mistake when copying from JavaScript; Auto-Repair converts them.'],
              ['Unquoted keys', 'Object keys must be wrapped in double quotes. A bare key like name instead of "name" will fail to parse. Auto-Repair quotes unquoted keys.'],
              ['Missing or extra brackets', 'An unbalanced brace or bracket breaks the whole document. The validator reports where parsing failed so you can find the mismatch quickly.'],
              ['Comments', 'JSON does not support comments. If your data contains them, they must be removed before it will parse, since there is no valid way to keep them.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[180px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Privacy */}
        <article className="bg-indigo-50 border border-indigo-200 rounded-2xl p-7 mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Your Data Stays in Your Browser</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Unlike many online formatters that send your JSON to a server for processing, this tool does everything locally using the browser\u2019s built-in JSON engine. Your data is parsed, formatted, sorted and validated entirely on your device and is never transmitted or stored anywhere.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            That matters when your JSON contains API keys, tokens, personal information or internal data you should not paste into a third-party service. Because nothing is uploaded, the formatter is also instant and keeps working even if your connection drops after the page has loaded.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is the JSON formatter free?', 'Yes. It is completely free with no signup and no usage limits. Every feature, including the tree view, auto-repair, sort keys and escaped-string copy, is available to everyone.'],
              ['Is my JSON sent to a server?', 'No. All formatting, validation, sorting and other processing happens locally in your browser, so your JSON never leaves your device. That makes it safe for sensitive data.'],
              ['What is the difference between format and minify?', 'Format adds indentation and line breaks to make JSON readable. Minify removes all unnecessary whitespace to produce the smallest possible single-line JSON for transport or storage.'],
              ['What does Auto-Repair fix?', 'It applies common fixes such as removing trailing commas, converting single quotes to double quotes, and quoting unquoted object keys, then reformats the result. Heavily malformed JSON may still need a manual touch.'],
              ['What does Sort Keys do?', 'It recursively orders every object key from A to Z while leaving array order unchanged. This produces stable output that makes comparing two JSON documents and reviewing diffs much easier.'],
              ['How does the tree view help?', 'The tree view shows your JSON as an expandable, colour-coded outline. You can collapse and expand objects and arrays to navigate deeply nested data without scrolling through raw text.'],
              ['What is Copy as Escaped String for?', 'It copies your JSON as a quoted, fully escaped one-line string, which is exactly what you need when embedding JSON inside source code, a test case or another JSON field.'],
              ['Why does my JSON show as invalid?', 'The most common causes are trailing commas, single quotes, unquoted keys, comments or an unbalanced bracket. The error message names the problem, and Auto-Repair fixes the most frequent ones automatically.'],
              ['Can I upload a .json file?', 'Yes. Use the File button to load a .json file from your device. Its contents appear in the input and are validated immediately, just like pasted JSON.'],
              ['Does the formatter work offline?', 'Yes. Once the page has loaded, all processing runs in your browser, so the tool continues to work without an internet connection.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-center justify-between">
                  {q}<span className="text-indigo-500 text-lg ml-3 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</div>
              </details>
            ))}
          </div>
        </article>

      </section>
    </div>
  );
}