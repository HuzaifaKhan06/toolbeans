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
            Auto-repair broken JSON, download results — 100% runs in your browser.
          </p>
        </div>
      </section>

      {/* ── AD ── */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728×90
        </div>
      </div>

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
              <button onClick={handleRepair}
                className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2">
                🔧 Auto-Repair
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
                      ${h.action === 'format' ? 'bg-indigo-50 text-indigo-600' : h.action === 'minify' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'}`}>
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

        {/* ── AD ── */}
        <div className="mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement — 728×90
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Why Use a JSON Formatter?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '👁️', title: 'Readable Formatting',   desc: 'Transform minified one-line JSON into indented, human-readable structure instantly.' },
              { icon: '✅', title: 'Instant Validation',    desc: 'Detect JSON syntax errors immediately with descriptive error messages showing the exact problem.' },
              { icon: '🌳', title: 'Interactive Tree View', desc: 'Explore deeply nested JSON by expanding and collapsing nodes in the visual tree.' },
              { icon: '🔧', title: 'Auto-Repair',           desc: 'Automatically fix common JSON issues like trailing commas, single quotes, and unquoted keys.' },
              { icon: '⬌',  title: 'Minify for Production', desc: 'Remove all whitespace to reduce payload size for APIs and storage.' },
              { icon: '⬇️', title: 'Download as File',      desc: 'Save your formatted or minified JSON directly as a .json file to your computer.' },
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

      </section>
    </div>
  );
}
