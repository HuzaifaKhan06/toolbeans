'use client';

import { useState, useRef } from 'react';

// ── Utilities ──
const encodeURL = (text, mode) => {
  try {
    if (mode === 'full') return encodeURI(text);
    if (mode === 'component') return encodeURIComponent(text);
    if (mode === 'legacy') return escape(text);
    return encodeURIComponent(text);
  } catch { return null; }
};

const decodeURL = (text, mode) => {
  try {
    if (mode === 'full') return decodeURI(text);
    if (mode === 'component') return decodeURIComponent(text);
    if (mode === 'legacy') return unescape(text);
    return decodeURIComponent(text);
  } catch { return null; }
};

const isAlreadyEncoded = (text) => /%[0-9A-Fa-f]{2}/.test(text);

const parseQueryString = (url) => {
  try {
    const u = new URL(url.includes('://') ? url : 'https://x.com?' + url.split('?')[1] || url);
    const params = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return params;
  } catch { return []; }
};

const buildQueryString = (params) => {
  return params
    .filter((p) => p.key.trim())
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join('&');
};

const CHAR_TABLE = [
  { char: ' ',  encoded: '%20', desc: 'Space' },
  { char: '!',  encoded: '%21', desc: 'Exclamation' },
  { char: '#',  encoded: '%23', desc: 'Hash' },
  { char: '$',  encoded: '%24', desc: 'Dollar' },
  { char: '&',  encoded: '%26', desc: 'Ampersand' },
  { char: "'",  encoded: '%27', desc: 'Apostrophe' },
  { char: '(',  encoded: '%28', desc: 'Open paren' },
  { char: ')',  encoded: '%29', desc: 'Close paren' },
  { char: '*',  encoded: '%2A', desc: 'Asterisk' },
  { char: '+',  encoded: '%2B', desc: 'Plus' },
  { char: ',',  encoded: '%2C', desc: 'Comma' },
  { char: '/',  encoded: '%2F', desc: 'Slash' },
  { char: ':',  encoded: '%3A', desc: 'Colon' },
  { char: ';',  encoded: '%3B', desc: 'Semicolon' },
  { char: '=',  encoded: '%3D', desc: 'Equals' },
  { char: '?',  encoded: '%3F', desc: 'Question' },
  { char: '@',  encoded: '%40', desc: 'At sign' },
  { char: '[',  encoded: '%5B', desc: 'Open bracket' },
  { char: ']',  encoded: '%5D', desc: 'Close bracket' },
];

const SAMPLES = [
  { label: 'URL with spaces',    text: 'https://example.com/search?q=hello world&lang=en', mode: 'encode' },
  { label: 'Encoded URL',        text: 'https://example.com/path%20to%20page?name=John%20Doe&city=New%20York', mode: 'decode' },
  { label: 'Query String',       text: 'name=John Doe&email=john@example.com&message=Hello World!', mode: 'encode' },
  { label: 'Special Characters', text: 'price=$100 & discount=50% off (today only)!', mode: 'encode' },
];

export default function URLTool() {
  const [input, setInput]         = useState('');
  const [output, setOutput]       = useState('');
  const [mode, setMode]           = useState('encode');
  const [variant, setVariant]     = useState('component');
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState(false);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff]   = useState(false);
  const [activeTab, setActiveTab] = useState('converter');

  // Query Builder
  const [queryParams, setQueryParams] = useState([{ key: '', value: '' }]);
  const [baseURL, setBaseURL]         = useState('https://example.com/api');
  const [builtURL, setBuiltURL]       = useState('');

  const process = (text, currentMode, currentVariant) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    setError('');

    if (currentMode === 'encode') {
      const alreadyEncoded = isAlreadyEncoded(text);
      const result = encodeURL(text, currentVariant);
      if (result === null) {
        setError('Encoding failed. Please check your input.');
        setOutput('');
        return;
      }
      if (alreadyEncoded) {
        setError('⚠️ Warning: Input appears to already be encoded. Result may be double-encoded.');
      }
      setOutput(result);
      addHistory(currentMode, text, result);
    } else {
      const result = decodeURL(text, currentVariant);
      if (result === null) {
        setError('Decoding failed. The input may not be valid percent-encoded text.');
        setOutput('');
        return;
      }
      setOutput(result);
      addHistory(currentMode, text, result);
    }
  };

  const addHistory = (m, inp, out) => {
    setHistory((prev) => [{
      mode: m,
      input: inp.slice(0, 50) + (inp.length > 50 ? '…' : ''),
      output: out.slice(0, 50) + (out.length > 50 ? '…' : ''),
      full: out,
      time: new Date().toLocaleTimeString(),
    }, ...prev].slice(0, 10));
  };

  const handleInput = (val) => {
    setInput(val);
    if (val.trim()) process(val, mode, variant);
    else { setOutput(''); setError(''); }
  };

  const handleMode = (m) => {
    setMode(m);
    if (input.trim()) process(input, m, variant);
  };

  const handleVariant = (v) => {
    setVariant(v);
    if (input.trim()) process(input, mode, v);
  };

  const swapIO = () => {
    const newInput = output;
    const newMode  = mode === 'encode' ? 'decode' : 'encode';
    setInput(newInput);
    setMode(newMode);
    setOutput('');
    setError('');
    if (newInput) process(newInput, newMode, variant);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const pasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInput(text);
    } catch { /* ignore */ }
  };

  // Build URL from query params
  const buildURL = () => {
    const qs = buildQueryString(queryParams);
    const result = qs ? `${baseURL}?${qs}` : baseURL;
    setBuiltURL(result);
  };

  const addParam = () => setQueryParams((p) => [...p, { key: '', value: '' }]);
  const removeParam = (i) => setQueryParams((p) => p.filter((_, idx) => idx !== i));
  const updateParam = (i, field, val) => {
    setQueryParams((p) => p.map((item, idx) =>
      idx === i ? { ...item, [field]: val } : item
    ));
  };

  // Parse URL into parts
  const parseURL = () => {
    try {
      const u = new URL(input.includes('://') ? input : 'https://' + input);
      return {
        protocol: u.protocol,
        host: u.hostname,
        port: u.port || '(default)',
        path: u.pathname,
        query: u.search,
        hash: u.hash || '(none)',
        params: parseQueryString(input),
      };
    } catch { return null; }
  };

  const urlParts = input ? parseURL() : null;

  // Diff view
  const getDiff = () => {
    if (!input || !output) return [];
    const a = input.split('');
    const b = output.split('');
    return b.map((char, i) => ({
      char,
      changed: char !== a[i],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Encoding Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            URL{' '}
            <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Encoder / Decoder
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto">
            Encode special characters in URLs, decode percent-encoded strings,
            parse URL components, and build query strings all in one place.
          </p>
        </div>
      </section>

      {/* ── AD ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'converter', label: '⇄ Encoder/Decoder' },
            { key: 'builder',   label: '🔧 Query Builder' },
            { key: 'parser',    label: '🔍 URL Parser' },
            { key: 'reference', label: '📖 Char Reference' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-6">

        {/* ══ TAB 1: CONVERTER ══ */}
        {activeTab === 'converter' && (
          <div className="flex flex-col gap-5">

            {/* Mode + Variant + Options */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">

                {/* Mode */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mode</div>
                  <div className="flex gap-2">
                    {[
                      { key: 'encode', label: '⬆️ Encode', desc: 'Text → %XX' },
                      { key: 'decode', label: '⬇️ Decode', desc: '%XX → Text' },
                    ].map((m) => (
                      <button key={m.key} onClick={() => handleMode(m.key)}
                        className={`flex flex-col items-start px-4 py-2.5 rounded-xl border-2 transition-all
                          ${mode === m.key
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}>
                        <span className="font-bold text-sm">{m.label}</span>
                        <span className={`text-xs font-mono mt-0.5 ${mode === m.key ? 'text-indigo-100' : 'text-slate-400'}`}>{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Variant */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Encoding Type</div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'component', label: 'encodeURIComponent', desc: 'Encodes everything' },
                      { key: 'full',      label: 'encodeURI',          desc: 'Keeps URL chars' },
                      { key: 'legacy',    label: 'escape()',           desc: 'Legacy mode' },
                    ].map((v) => (
                      <button key={v.key} onClick={() => handleVariant(v.key)}
                        className={`flex flex-col items-start px-3 py-2 rounded-xl border-2 transition-all
                          ${variant === v.key
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-purple-300'
                          }`}>
                        <span className="font-bold text-xs font-mono">{v.label}</span>
                        <span className={`text-xs mt-0.5 ${variant === v.key ? 'text-purple-100' : 'text-slate-400'}`}>{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Samples */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Samples</div>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map((s) => (
                  <button key={s.label} onClick={() => { setInput(s.text); setMode(s.mode); process(s.text, s.mode, variant); }}
                    className="flex items-center gap-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                    {s.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${s.mode === 'encode' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{s.mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input / Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Input */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {mode === 'encode' ? 'Raw URL / Text' : 'Encoded URL'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={pasteInput} className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all">⎘ Paste</button>
                    <button onClick={() => { setInput(''); setOutput(''); setError(''); }} className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all">✕ Clear</button>
                  </div>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => handleInput(e.target.value)}
                  placeholder={mode === 'encode'
                    ? 'Enter URL or text to encode…\n\nExample:\nhttps://example.com/search?q=hello world'
                    : 'Enter encoded URL to decode…\n\nExample:\nhttps://example.com/path%20name?q=hello%20world'
                  }
                  className="w-full px-5 py-4 text-sm text-slate-700 outline-none resize-none font-mono leading-relaxed bg-white"
                  style={{ minHeight: '200px' }}
                />
                <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-700">{input.length}</span>
                    <span className="text-xs text-slate-400">chars</span>
                  </div>
                  {isAlreadyEncoded(input) && mode === 'encode' && (
                    <span className="text-xs bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full">
                      ⚠️ Looks encoded
                    </span>
                  )}
                </div>
              </div>

              {/* Output */}
              <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${output ? 'border-indigo-200' : 'border-slate-200'}`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b transition-all ${output ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
                    </span>
                    {output && <span className="text-xs bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">{mode === 'encode' ? '✓ Encoded' : '✓ Decoded'}</span>}
                  </div>
                  <div className="flex gap-2">
                    {output && (
                      <button onClick={swapIO} className="text-xs text-indigo-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-all">⇄ Swap</button>
                    )}
                    <button onClick={copyOutput} disabled={!output}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : output ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                      {copied ? '✓ Copied!' : '⎘ Copy'}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mx-5 mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
                    <span className="flex-shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="px-5 py-4 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-all select-all" style={{ minHeight: '200px' }}>
                  {output || <span className="text-slate-300 font-sans text-sm">Result will appear here…</span>}
                </div>

                {output && (
                  <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-700">{output.length}</span>
                      <span className="text-xs text-slate-400">chars</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold ${mode === 'encode' ? 'text-orange-500' : 'text-green-600'}`}>
                        {mode === 'encode'
                          ? output.length > input.length ? `+${output.length - input.length} chars` : 'Same length'
                          : output.length < input.length ? `-${input.length - output.length} chars` : 'Same length'
                        }
                      </span>
                    </div>
                    <button onClick={() => setShowDiff(!showDiff)} className="text-xs text-indigo-500 font-semibold ml-auto hover:text-indigo-700">
                      {showDiff ? 'Hide' : 'Show'} Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Diff View */}
            {showDiff && output && (
              <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Character Changes</div>
                <div className="font-mono text-sm leading-relaxed break-all">
                  {getDiff().map((d, i) => (
                    <span key={i} className={d.changed ? 'bg-indigo-100 text-indigo-700 rounded px-0.5' : 'text-slate-600'}>
                      {d.char}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">🕐 History ({history.length})</span>
                  <span className="text-slate-400 text-sm">{showHistory ? '▲' : '▼'}</span>
                </button>
                {showHistory && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {history.map((h, i) => (
                      <div key={i} onClick={() => setOutput(h.full)} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 font-mono ${h.mode === 'encode' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{h.mode}</span>
                        <span className="text-xs text-slate-400 font-mono flex-shrink-0">{h.time}</span>
                        <span className="text-xs text-slate-500 font-mono truncate flex-1">{h.output}</span>
                      </div>
                    ))}
                    <div className="px-6 py-3 bg-slate-50">
                      <button onClick={() => setHistory([])} className="text-xs text-rose-400 hover:text-rose-600 font-semibold">Clear History</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 2: QUERY BUILDER ══ */}
        {activeTab === 'builder' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">🔧 Query String Builder</h2>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Base URL</label>
                <input type="text" value={baseURL} onChange={(e) => setBaseURL(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 font-mono"
                  placeholder="https://api.example.com/endpoint" />
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Parameters</label>
                <div className="flex flex-col gap-2">
                  {queryParams.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={p.key} onChange={(e) => updateParam(i, 'key', e.target.value)}
                        placeholder="Key" className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-mono" />
                      <span className="text-slate-300 font-mono">=</span>
                      <input type="text" value={p.value} onChange={(e) => updateParam(i, 'value', e.target.value)}
                        placeholder="Value" className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-mono" />
                      <button onClick={() => removeParam(i)} className="text-rose-400 hover:text-rose-600 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50">×</button>
                    </div>
                  ))}
                </div>
                <button onClick={addParam} className="mt-3 text-xs text-indigo-600 font-bold hover:text-indigo-500 flex items-center gap-1">
                  + Add Parameter
                </button>
              </div>
              <button onClick={buildURL} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all text-sm">
                🔧 Build URL
              </button>
              {builtURL && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Built URL</span>
                    <button onClick={() => navigator.clipboard.writeText(builtURL)}
                      className="text-xs bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-indigo-500">⎘ Copy</button>
                  </div>
                  <code className="text-sm text-indigo-600 font-mono break-all">{builtURL}</code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB 3: URL PARSER ══ */}
        {activeTab === 'parser' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">🔍 URL Parser</h2>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Enter URL to Parse</label>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-mono"
                  placeholder="https://example.com/path?name=John&city=London#section" />
              </div>
              {urlParts ? (
                <div className="space-y-3">
                  {[
                    { label: 'Protocol',  value: urlParts.protocol, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Host',      value: urlParts.host,     color: 'bg-indigo-50 text-indigo-700' },
                    { label: 'Port',      value: urlParts.port,     color: 'bg-purple-50 text-purple-700' },
                    { label: 'Path',      value: urlParts.path,     color: 'bg-cyan-50 text-cyan-700' },
                    { label: 'Query',     value: urlParts.query || '(none)', color: 'bg-green-50 text-green-700' },
                    { label: 'Fragment',  value: urlParts.hash,     color: 'bg-orange-50 text-orange-700' },
                  ].map((p) => (
                    <div key={p.label} className="flex items-start gap-3">
                      <span className="text-xs font-bold text-slate-400 w-16 flex-shrink-0 mt-0.5 uppercase">{p.label}</span>
                      <code className={`text-xs font-mono px-2 py-1 rounded-lg flex-1 break-all ${p.color}`}>{p.value}</code>
                    </div>
                  ))}
                  {urlParts.params.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">Query Parameters</div>
                      <div className="space-y-2">
                        {urlParts.params.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5">
                            <code className="text-xs font-bold text-indigo-600 font-mono">{p.key}</code>
                            <span className="text-slate-300">=</span>
                            <code className="text-xs text-slate-600 font-mono">{p.value}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : input ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-600 font-medium">
                  ⚠️ Could not parse URL. Make sure it starts with https:// or http://
                </div>
              ) : (
                <div className="text-center py-12 text-slate-300">
                  <div className="text-5xl mb-3">🔍</div>
                  <div className="text-sm">Enter a URL above to see its components</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB 4: CHAR REFERENCE ══ */}
        {activeTab === 'reference' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 mb-5">📖 URL Character Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase">Char</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase">Encoded</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase">Description</th>
                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-400 uppercase">Try It</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CHAR_TABLE.map((row) => (
                    <tr key={row.char} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3"><code className="text-base font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{row.char}</code></td>
                      <td className="py-2.5 px-3"><code className="text-sm text-indigo-600 font-mono font-bold">{row.encoded}</code></td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">{row.desc}</td>
                      <td className="py-2.5 px-3">
                        <button onClick={() => { setActiveTab('converter'); setInput(row.char); process(row.char, 'encode', variant); }}
                          className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold hover:underline">
                          Encode →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── AD ── */}
        <div className="mt-8 mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement 728×90
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">URL Encoding Explained</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🔗', title: 'What is URL Encoding?', desc: 'URL encoding (percent-encoding) converts characters into a format that can be safely transmitted over the internet by replacing unsafe characters with % followed by hex values.' },
              { icon: '⚙️', title: 'encodeURIComponent vs encodeURI', desc: 'encodeURIComponent encodes everything including &, =, and ? best for query values. encodeURI keeps those characters as they have meaning in a full URL.' },
              { icon: '🌍', title: 'Unicode Support', desc: 'Non-ASCII characters like Arabic, Chinese, or emoji are encoded as UTF-8 byte sequences. e.g. "مرحبا" becomes %D9%85%D8%B1%D8%AD%D8%A8%D8%A7' },
              { icon: '🛡️', title: 'Security Benefits', desc: 'Proper URL encoding prevents injection attacks by ensuring special characters are treated as data, not as URL structure or code.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="text-sm font-bold text-slate-700 mb-1">{f.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}