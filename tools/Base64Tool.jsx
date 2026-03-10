'use client';

import { useState, useRef } from 'react';

// ── Utilities ──
const isValidBase64 = (str) => {
  if (!str || str.trim() === '') return false;
  const cleaned = str.replace(/\s/g, '');
  return /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) && cleaned.length % 4 === 0;
};

const encodeBase64 = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return null;
  }
};

const decodeBase64 = (text) => {
  try {
    const cleaned = text.replace(/\s/g, '');
    return decodeURIComponent(escape(atob(cleaned)));
  } catch {
    return null;
  }
};

const encodeBase64URL = (text) => {
  try {
    return btoa(unescape(encodeURIComponent(text)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return null;
  }
};

const decodeBase64URL = (text) => {
  try {
    const padded = text.replace(/-/g, '+').replace(/_/g, '/');
    const pad = padded.length % 4;
    const paddedStr = pad ? padded + '='.repeat(4 - pad) : padded;
    return decodeURIComponent(escape(atob(paddedStr)));
  } catch {
    return null;
  }
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CHUNK_SIZE = 60;
const chunkString = (str, size) =>
  str.match(new RegExp(`.{1,${size}}`, 'g'))?.join('\n') || str;

const USE_CASES = [
  { icon: '🔑', label: 'JWT Token',    text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', mode: 'jwt' },
  { icon: '{}', label: 'JSON Data',    text: '{"name":"TOOLBeans","version":"1.0","tools":7}', mode: 'encode' },
  { icon: '🔗', label: 'URL Encode',   text: 'https://TOOLBeans.dev/tools?ref=base64&utm_source=tool', mode: 'encode' },
  { icon: '🔐', label: 'API Key',      text: 'dXNlcm5hbWU6cGFzc3dvcmQxMjM=', mode: 'decode' },
];

export default function Base64Tool() {
  const [input, setInput]           = useState('');
  const [output, setOutput]         = useState('');
  const [mode, setMode]             = useState('encode');
  const [variant, setVariant]       = useState('standard');
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(false);
  const [wrapOutput, setWrapOutput] = useState(false);
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [fileInfo, setFileInfo]     = useState(null);
  const fileRef                     = useRef(null);

  // ── Process ──
  const process = (text, currentMode, currentVariant) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    setError('');

    // ── JWT Special Handling ──
    if (currentMode === 'jwt') {
      const parts = text.trim().split('.');
      if (parts.length < 2) {
        setError('Invalid JWT — expected format: header.payload.signature');
        setOutput('');
        return;
      }
      try {
        const decodeJWTPart = (part) => {
          const padded = part.replace(/-/g, '+').replace(/_/g, '/');
          const pad = padded.length % 4;
          const paddedStr = pad ? padded + '='.repeat(4 - pad) : padded;
          return JSON.parse(decodeURIComponent(escape(atob(paddedStr))));
        };

        const header    = decodeJWTPart(parts[0]);
        const payload   = decodeJWTPart(parts[1]);
        const signature = parts[2] || '(none)';

        const result = JSON.stringify({
          header,
          payload,
          signature,
        }, null, 2);

        setOutput(result);
        setHistory((prev) => [
          {
            mode: 'jwt',
            variant: currentVariant,
            input: text.slice(0, 60) + '…',
            output: result.slice(0, 60) + '…',
            full: result,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 10));
      } catch {
        setError('Failed to decode JWT. Make sure all 3 parts are valid Base64URL.');
        setOutput('');
      }
      return;
    }

    // ── Standard Encode / Decode ──
    let result = null;

    if (currentMode === 'encode') {
      result = currentVariant === 'url'
        ? encodeBase64URL(text)
        : encodeBase64(text);
      if (result === null) {
        setError('Encoding failed. Input contains unsupported characters.');
        setOutput('');
        return;
      }
    } else {
      const cleaned = text.replace(/\s/g, '');
      const isURL = /^[A-Za-z0-9\-_]*$/.test(cleaned);
      const isStd = isValidBase64(cleaned);

      if (!isURL && !isStd) {
        setError('Invalid Base64 string. Make sure you copied the full encoded text.');
        setOutput('');
        return;
      }

      result = currentVariant === 'url'
        ? decodeBase64URL(text)
        : decodeBase64(text);

      if (result === null) {
        setError('Decoding failed. The input is not valid Base64.');
        setOutput('');
        return;
      }
    }

    const finalOutput = wrapOutput ? chunkString(result, CHUNK_SIZE) : result;
    setOutput(finalOutput);

    setHistory((prev) => [
      {
        mode: currentMode,
        variant: currentVariant,
        input: text.slice(0, 60) + (text.length > 60 ? '…' : ''),
        output: result.slice(0, 60) + (result.length > 60 ? '…' : ''),
        full: result,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ].slice(0, 10));
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

  const handleWrap = (v) => {
    setWrapOutput(v);
    if (output) {
      const base = output.replace(/\n/g, '');
      setOutput(v ? chunkString(base, CHUNK_SIZE) : base);
    }
  };

  // ── Swap ──
  const swapIO = () => {
    const newInput = output.replace(/\n/g, '');
    const newMode  = mode === 'encode' ? 'decode' : 'encode';
    setInput(newInput);
    setMode(newMode);
    setOutput('');
    setError('');
    if (newInput) process(newInput, newMode, variant);
  };

  // ── File encode ──
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    setFileInfo({ name: file.name, size: formatBytes(file.size), type: file.type });
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      const b64 = dataUrl.split(',')[1];
      setInput(b64);
      setMode('decode');
      setOutput('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // ── Copy ──
  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output.replace(/\n/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Paste ──
  const pasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInput(text);
    } catch { /* ignore */ }
  };

  // ── Load sample ──
  const loadSample = (uc) => {
    setInput(uc.text);
    setMode(uc.mode === 'jwt' ? 'decode' : uc.mode);
    setOutput('');
    setError('');
    process(uc.text, uc.mode, variant);
  };

  // ── Stats ──
  const inputBytes  = new Blob([input]).size;
  const outputBytes = new Blob([output.replace(/\n/g, '')]).size;
  const ratio       = input && output
    ? ((outputBytes / inputBytes) * 100).toFixed(0)
    : null;

  const encodedPreview = input && mode === 'encode' && output
    ? output.replace(/\n/g, '').slice(0, 4)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-green-50 via-white to-indigo-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-green-50 text-green-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Encoding Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Base64{' '}
            <span className="bg-gradient-to-r from-green-500 to-indigo-600 bg-clip-text text-transparent">
              Encoder / Decoder
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto">
            Encode or decode Base64 strings instantly. Supports standard, URL-safe,
            file encoding, JWT decoding and more — 100% private, runs in your browser.
          </p>
        </div>
      </section>

      {/* ── AD ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728×90
        </div>
      </div>

      {/* ── MAIN TOOL ── */}
      <section className="max-w-5xl mx-auto px-6 py-8">

        {/* ── MODE + VARIANT BAR ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

            {/* Mode Toggle */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mode</div>
              <div className="flex gap-2">
                {[
                  { key: 'encode', label: '⬆️ Encode', desc: 'Text → Base64' },
                  { key: 'decode', label: '⬇️ Decode', desc: 'Base64 → Text' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => handleMode(m.key)}
                    className={`flex flex-col items-start px-5 py-2.5 rounded-xl border-2 transition-all duration-200
                      ${mode === m.key
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                  >
                    <span className="font-bold text-sm">{m.label}</span>
                    <span className={`text-xs font-mono mt-0.5 ${mode === m.key ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Variant */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Variant</div>
              <div className="flex gap-2">
                {[
                  { key: 'standard', label: 'Standard',  desc: 'RFC 4648' },
                  { key: 'url',      label: 'URL-Safe',  desc: 'RFC 4648 §5' },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => handleVariant(v.key)}
                    className={`flex flex-col items-start px-4 py-2.5 rounded-xl border-2 transition-all duration-200
                      ${variant === v.key
                        ? 'bg-green-600 border-green-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-green-300'
                      }`}
                  >
                    <span className="font-bold text-sm">{v.label}</span>
                    <span className={`text-xs font-mono mt-0.5 ${variant === v.key ? 'text-green-100' : 'text-slate-400'}`}>
                      {v.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wrap Toggle */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Output Wrap</div>
              <button
                onClick={() => handleWrap(!wrapOutput)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all
                  ${wrapOutput
                    ? 'bg-cyan-600 border-cyan-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-cyan-300'
                  }`}
              >
                <span className="text-sm font-bold">{wrapOutput ? '↵ Wrapped' : '→ Single Line'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── QUICK SAMPLES ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Quick Load Samples
          </div>
          <div className="flex flex-wrap gap-2">
            {USE_CASES.map((uc) => (
              <button
                key={uc.label}
                onClick={() => loadSample(uc)}
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              >
                <span>{uc.icon}</span>
                <span>{uc.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono
                  ${uc.mode === 'encode'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-orange-50 text-orange-600'
                  }`}>
                  {uc.mode}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── INPUT / OUTPUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* Input */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
                </span>
                {variant === 'url' && (
                  <span className="text-xs bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full">
                    URL-Safe
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={pasteInput}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                >
                  ⎘ Paste
                </button>
                {/* File Upload */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all"
                >
                  📎 File
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={handleFile}
                  accept="*/*"
                />
                <button
                  onClick={() => { setInput(''); setOutput(''); setError(''); setFileInfo(null); }}
                  className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all"
                >
                  ✕ Clear
                </button>
              </div>
            </div>

            {/* File info badge */}
            {fileInfo && (
              <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                <span className="text-xs">📎</span>
                <span className="text-xs text-blue-700 font-semibold">{fileInfo.name}</span>
                <span className="text-xs text-blue-400">{fileInfo.size}</span>
                <span className="text-xs text-blue-400">{fileInfo.type}</span>
              </div>
            )}

            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={
                mode === 'encode'
                  ? 'Enter text to encode…\n\nExamples:\n• Any plain text\n• JSON objects\n• URLs\n• API credentials'
                  : 'Paste Base64 string to decode…\n\nExamples:\n• SGVsbG8gV29ybGQ=\n• JWT token payload\n• Encoded credentials'
              }
              className="w-full px-5 py-4 text-sm text-slate-700 outline-none resize-none font-mono leading-relaxed bg-white"
              style={{ minHeight: '220px' }}
            />

            {/* Input Stats */}
            <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-700">{input.length}</span>
                <span className="text-xs text-slate-400">chars</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-700">{formatBytes(inputBytes)}</span>
                <span className="text-xs text-slate-400">size</span>
              </div>
              {mode === 'decode' && input && (
                <div className={`flex items-center gap-1 ml-auto`}>
                  {isValidBase64(input.replace(/\s/g, '')) ? (
                    <span className="text-xs bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded-full">
                      ✓ Valid Base64
                    </span>
                  ) : (
                    <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                      ✗ Check Format
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Output */}
          <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300
            ${output ? 'border-indigo-200' : 'border-slate-200'}`}>
            <div className={`flex items-center justify-between px-5 py-3.5 border-b transition-all
              ${output ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                </span>
                {output && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                    {mode === 'encode' ? '⬆️ Encoded' : '⬇️ Decoded'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {output && (
                  <button
                    onClick={swapIO}
                    title="Swap output to input"
                    className="text-xs text-indigo-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-all"
                  >
                    ⇄ Swap
                  </button>
                )}
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200
                    ${copied
                      ? 'bg-green-500 text-white'
                      : output
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                >
                  {copied ? '✓ Copied!' : '⎘ Copy'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-5 mt-4 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-600 font-medium">
                <span className="text-base flex-shrink-0">⚠️</span>
                <div>
                  <div className="font-bold mb-0.5">Error</div>
                  {error}
                </div>
              </div>
            )}

            {/* Output Content */}
            <div
              className="px-5 py-4 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-all select-all"
              style={{ minHeight: '220px' }}
            >
              {output || (
                <span className="text-slate-300 font-sans text-sm">
                  {mode === 'encode'
                    ? 'Your encoded Base64 will appear here…'
                    : 'Your decoded text will appear here…'
                  }
                </span>
              )}
            </div>

            {/* Output Stats */}
            {output && (
              <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">
                    {output.replace(/\n/g, '').length}
                  </span>
                  <span className="text-xs text-slate-400">chars</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">{formatBytes(outputBytes)}</span>
                  <span className="text-xs text-slate-400">size</span>
                </div>
                {ratio && (
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-bold ${
                      mode === 'encode' ? 'text-orange-500' : 'text-green-600'
                    }`}>
                      {mode === 'encode' ? `+${ratio - 100}%` : `-${100 - ratio}%`}
                    </span>
                    <span className="text-xs text-slate-400">size change</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SWAP BUTTON ── */}
        <div className="flex justify-center mb-5">
          <button
            onClick={swapIO}
            disabled={!output}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all duration-200
              ${output
                ? 'bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400'
                : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
          >
            ⇄ Swap Input ↔ Output &amp; Switch Mode
          </button>
        </div>

        {/* ── HISTORY ── */}
        {history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                🕐 Recent Operations ({history.length})
              </span>
              <span className="text-slate-400 text-sm">{showHistory ? '▲' : '▼'}</span>
            </button>
            {showHistory && (
              <div className="border-t border-slate-100">
                <div className="divide-y divide-slate-50">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setOutput(h.full);
                        setCopied(false);
                      }}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 font-mono
                        ${h.mode === 'encode'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-orange-50 text-orange-600'
                        }`}>
                        {h.mode}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex-shrink-0">{h.time}</span>
                      <span className="text-xs text-slate-500 font-mono truncate flex-1">{h.output}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-rose-400 hover:text-rose-600 font-semibold"
                  >
                    Clear History
                  </button>
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

        {/* ── INFO CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            {
              icon: '🔒',
              title: '100% Private',
              desc: 'All encoding and decoding runs entirely in your browser. No data is ever sent to any server.',
              color: 'bg-green-50 border-green-100',
            },
            {
              icon: '⚡',
              title: 'Instant Results',
              desc: 'Output updates in real-time as you type. No button clicks needed for live encoding.',
              color: 'bg-indigo-50 border-indigo-100',
            },
            {
              icon: '📎',
              title: 'File Encoding',
              desc: 'Upload any file up to 5MB and get its Base64 representation instantly for data URIs.',
              color: 'bg-cyan-50 border-cyan-100',
            },
          ].map((c) => (
            <div key={c.title} className={`border rounded-2xl p-5 ${c.color}`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-bold text-slate-800 text-sm mb-1">{c.title}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">
            What is Base64 & When Do You Use It?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {[
              { icon: '🖼️', title: 'Inline Images',       desc: 'Embed images directly in HTML/CSS as data URIs — no separate HTTP request needed.' },
              { icon: '🔑', title: 'JWT Tokens',           desc: 'JSON Web Tokens use Base64URL encoding for the header and payload sections.' },
              { icon: '📧', title: 'Email Attachments',    desc: 'MIME email standard uses Base64 to encode binary attachments as text.' },
              { icon: '🔐', title: 'API Authentication',   desc: 'HTTP Basic Auth sends credentials as Base64-encoded username:password strings.' },
              { icon: '💾', title: 'Binary Data Transfer', desc: 'Transfer binary data safely through text-only channels like JSON APIs.' },
              { icon: '🔗', title: 'URL-Safe Variant',     desc: 'Base64URL replaces + with - and / with _ for safe use in URLs and filenames.' },
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

          <h3 className="text-base font-extrabold text-slate-900 mb-3">
            Standard vs URL-Safe Base64
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Standard Base64',
                spec: 'RFC 4648',
                chars: 'A–Z, a–z, 0–9, +, /, =',
                use: 'General encoding, email, data URIs',
                color: 'bg-indigo-50 border-indigo-200',
              },
              {
                title: 'URL-Safe Base64',
                spec: 'RFC 4648 §5',
                chars: 'A–Z, a–z, 0–9, -, _, no padding',
                use: 'JWT tokens, URLs, filenames, cookies',
                color: 'bg-green-50 border-green-200',
              },
            ].map((v) => (
              <div key={v.title} className={`border rounded-xl p-4 ${v.color}`}>
                <div className="font-bold text-slate-800 text-sm mb-2">{v.title}</div>
                <div className="space-y-1">
                  <div className="text-xs text-slate-500"><strong>Spec:</strong> {v.spec}</div>
                  <div className="text-xs text-slate-500"><strong>Chars:</strong> {v.chars}</div>
                  <div className="text-xs text-slate-500"><strong>Use:</strong> {v.use}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}