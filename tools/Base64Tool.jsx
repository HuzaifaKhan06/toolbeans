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
  const [dataUri, setDataUri]       = useState('');     // NEW: full data URI for file/image preview
  const [outSearch, setOutSearch]   = useState('');     // NEW: search within output
  const fileRef                     = useRef(null);

  // ── Process ──
  const process = (text, currentMode, currentVariant) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    setError('');

    // ── JWT Special Handling ──
    if (currentMode === 'jwt') {
      const parts = text.trim().split('.');
      if (parts.length < 2) {
        setError('Invalid JWT expected format: header.payload.signature');
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
    setDataUri('');           // clear image preview when typing manually
    setFileInfo(null);
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
    setDataUri('');
    if (newInput) process(newInput, newMode, variant);
  };

  // ── File encode (now keeps full data URI for preview) ──
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
      setDataUri(dataUrl);     // NEW: store full data URI
      setMode('encode');       // a file becomes Base64 output (encode result)
      setInput(file.name);     // show filename as nominal input
      setOutput(wrapOutput ? chunkString(b64, CHUNK_SIZE) : b64);
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

  // ── Copy full data URI (NEW) ──
  const copyDataUri = async () => {
    if (!dataUri) return;
    await navigator.clipboard.writeText(dataUri);
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
    setDataUri('');
    setFileInfo(null);
    setInput(uc.text);
    setMode(uc.mode === 'jwt' ? 'decode' : uc.mode);
    setOutput('');
    setError('');
    process(uc.text, uc.mode, variant);
  };

  // ── Download decoded/encoded output as a text file (NEW) ──
  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output.replace(/\n/g, '')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'base64-encoded.txt' : 'base64-decoded.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Stats ──
  const inputBytes  = new Blob([input]).size;
  const outputBytes = new Blob([output.replace(/\n/g, '')]).size;
  const ratio       = input && output
    ? ((outputBytes / inputBytes) * 100).toFixed(0)
    : null;

  // ── Output filtered by search (NEW) ──
  const displayedOutput = outSearch && output
    ? output.split('\n').filter((l) => l.toLowerCase().includes(outSearch.toLowerCase())).join('\n')
    : output;

  const isImageDataUri = dataUri && dataUri.startsWith('data:image/');

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-green-50 via-white to-indigo-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <a href="/" className="hover:text-slate-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600">Base64 Encoder Decoder</span>
          </nav>
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
            file encoding, image preview, JWT decoding and more 100% private, runs in your browser.
          </p>
        </div>
      </section>

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
                  onClick={() => { setInput(''); setOutput(''); setError(''); setFileInfo(null); setDataUri(''); }}
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

            {/* NEW: Image preview for uploaded image files */}
            {isImageDataUri && (
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Image Preview</div>
                <img src={dataUri} alt="Uploaded preview" className="max-h-40 rounded-lg border border-slate-200" />
                <button
                  onClick={copyDataUri}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-500 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                >
                  ⎘ Copy full data URI (for CSS / HTML src)
                </button>
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
                {output && (
                  <button
                    onClick={downloadOutput}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all"
                  >
                    ⬇ Download
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

            {/* NEW: output search box (shown when output is multi-line/long) */}
            {output && output.length > 80 && (
              <div className="px-5 pt-3">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">🔍</span>
                  <input
                    value={outSearch}
                    onChange={(e) => setOutSearch(e.target.value)}
                    placeholder="Search within output…"
                    className="w-full pl-7 pr-7 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-slate-700"
                  />
                  {outSearch && (
                    <button onClick={() => setOutSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">×</button>
                  )}
                </div>
              </div>
            )}

            {/* Output Content */}
            <div
              className="px-5 py-4 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-all select-all"
              style={{ minHeight: '220px' }}
            >
              {output
                ? (displayedOutput || <span className="text-slate-300 font-sans text-sm">No lines match your search.</span>)
                : (
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

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* What is Base64  intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">What Is Base64 Encoding? A Complete Guide</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Base64 is a method for representing binary data using only 64 printable ASCII characters: the uppercase letters A to Z, the lowercase letters a to z, the digits 0 to 9, and two extra symbols (+ and / in standard Base64). It was created so that binary data, such as images, files or raw bytes, can be safely transmitted through systems that were designed to handle text only, like email, JSON, XML and URLs. Without an encoding like Base64, raw binary bytes can be corrupted or misinterpreted when they pass through text-based channels.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The name comes from the fact that the scheme uses a base of 64 values. Base64 works by taking three bytes of input (24 bits) and splitting them into four groups of six bits each. Because six bits can represent 64 different values (2 to the power of 6), each group maps neatly to one of the 64 characters in the Base64 alphabet. When the input length is not a multiple of three, the output is padded with one or two equals signs (=) so the result is always a multiple of four characters long.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            A side effect of this three-to-four expansion is that Base64-encoded data is roughly 33% larger than the original. This is the trade-off you accept in exchange for being able to move binary data safely through text-only systems. The TOOLBeans encoder shows you this size change live, so you can see exactly how much larger your encoded output is than the original input.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Encode and Decode Base64  Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Choose Encode or Decode', 'Use the Mode toggle to pick Encode (turn plain text into Base64) or Decode (turn a Base64 string back into readable text). The tool processes your input live as you type, so there is no separate button to press.'],
              ['2', 'Pick standard or URL-safe', 'Select the Variant. Standard Base64 (RFC 4648) uses + and / and is right for most cases. URL-safe Base64 replaces those with - and _ and drops padding, which is what JWT tokens, URLs and filenames require.'],
              ['3', 'Type, paste or upload', 'Type directly, click Paste to pull from your clipboard, or click File to upload any file up to 5MB. For image files the tool shows a live preview and lets you copy the full data URI for use in CSS or HTML.'],
              ['4', 'Read and search the output', 'The result appears instantly with character count, byte size and the percentage size change. For long outputs you can search within the result, toggle line wrapping, copy to clipboard, or download it as a text file.'],
              ['5', 'Swap to reverse the operation', 'Click Swap to move the output into the input box and flip the mode, so you can immediately verify that decoding your encoded value returns the original, or vice versa.'],
              ['6', 'Decode JWT tokens', 'Load the JWT sample or paste a token to decode its Base64URL header and payload into readable JSON. For full claim inspection and expiry checks, use the dedicated JWT Decoder tool.'],
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

        {/* What is Base64 used for  expanded from original */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">What Is Base64 Used For?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              ['🖼️', 'Inline Images (Data URIs)', 'Embed images directly in HTML or CSS as data URIs so the browser does not need a separate HTTP request. Useful for small icons and email templates. Upload an image here to get its data URI instantly.'],
              ['🔑', 'JWT Tokens', 'JSON Web Tokens, used for authentication across most modern web apps, encode their header and payload sections as URL-safe Base64. Decoding them lets you inspect the claims inside.'],
              ['📧', 'Email Attachments (MIME)', 'The MIME email standard uses Base64 to encode binary attachments such as PDFs and images into plain text so they survive transmission through mail servers.'],
              ['🔐', 'HTTP Basic Authentication', 'Basic Auth combines a username and password as "username:password" and Base64-encodes the result into the Authorization header. Note this is encoding, not encryption.'],
              ['💾', 'Binary Data in JSON / XML', 'APIs that exchange JSON or XML cannot hold raw binary, so files and byte arrays are Base64-encoded into string fields and decoded on the other side.'],
              ['🔗', 'URL-Safe Identifiers', 'Base64URL is used for tokens, share links, and filenames where + and / would otherwise break the URL or path. It swaps them for - and _ and removes padding.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-2xl flex-shrink-0">{icon}</div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{title}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Standard vs URL-safe  kept and expanded */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Standard vs URL-Safe Base64: What Is the Difference?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            Both variants encode the same data, but they use a slightly different alphabet for two characters. The difference matters because the standard + and / characters have special meaning inside URLs and file paths, where they would need extra escaping. URL-safe Base64 avoids that problem entirely.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Standard Base64', spec: 'RFC 4648 §4', chars: 'A–Z, a–z, 0–9, + , / , =', use: 'General encoding, email (MIME), data URIs, binary in JSON', color: 'bg-indigo-50 border-indigo-200' },
              { title: 'URL-Safe Base64', spec: 'RFC 4648 §5', chars: 'A–Z, a–z, 0–9, - , _ (no padding)', use: 'JWT tokens, URLs, query strings, filenames, cookies', color: 'bg-green-50 border-green-200' },
            ].map((v) => (
              <div key={v.title} className={`border rounded-xl p-5 ${v.color}`}>
                <div className="font-bold text-slate-800 text-sm mb-2">{v.title}</div>
                <div className="space-y-1.5">
                  <div className="text-xs text-slate-600"><strong>Spec:</strong> {v.spec}</div>
                  <div className="text-xs text-slate-600"><strong>Characters:</strong> {v.chars}</div>
                  <div className="text-xs text-slate-600"><strong>Best for:</strong> {v.use}</div>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Security warning section */}
        <article className="bg-amber-50 border border-amber-200 rounded-2xl p-7 mb-5">
          <h2 className="text-xl font-extrabold text-amber-900 mb-3">⚠️ Important: Base64 Is Not Encryption</h2>
          <p className="text-sm text-amber-800/90 leading-relaxed mb-3">
            This is the single most common misconception about Base64, and getting it wrong can cause real security problems. Base64 is an <strong>encoding</strong> scheme, not an <strong>encryption</strong> scheme. There is no secret key involved. Anyone who sees a Base64 string can decode it back to the original in seconds, exactly as this free tool does. It provides zero confidentiality.
          </p>
          <p className="text-sm text-amber-800/90 leading-relaxed">
            Never use Base64 to protect passwords, API secrets, personal data or anything sensitive. If you need to keep data secret, you need real encryption such as AES, and you must keep the key private. Base64 simply changes the <em>representation</em> of data so it can travel safely through text channels  it does not hide the data&apos;s contents from anyone.
          </p>
        </article>

        {/* Related tools */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-5">
          <h2 className="text-base font-extrabold text-slate-800 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-500 mb-4">Free tools that pair well with Base64 encoding and decoding.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['🔑', 'JWT Decoder', '/tools/jwt-decoder', 'Decode JWT tokens with full claim and expiry inspection'],
              ['{ }', 'JSON Formatter', '/tools/json-formatter', 'Format and validate decoded JSON payloads'],
              ['🔗', 'URL Encoder', '/tools/url-encoder-decoder', 'Percent-encode and decode URL components'],
              ['📡', 'API Request Tester', '/tools/api-request-tester', 'Test REST APIs and Basic Auth headers'],
            ].map(([icon, name, href, desc]) => (
              <a key={href} href={href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</div>
                </div>
              </a>
            ))}
          </div>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is this Base64 encoder and decoder free?', 'Yes. It is completely free with no usage limits, no account and no signup. Every feature, including file encoding, image preview, URL-safe mode, JWT decoding, output search and download, is available to everyone.'],
              ['Does my data get uploaded to a server?', 'No. All encoding and decoding runs entirely in your browser using JavaScript. Your text and files never leave your device and are never sent to any server, which makes the tool safe for sensitive data.'],
              ['What is the difference between standard and URL-safe Base64?', 'Standard Base64 uses + and / characters, which have special meaning in URLs and file paths. URL-safe Base64 replaces + with - and / with _ and removes padding, so the encoded string can be used directly in URLs, query strings and filenames. JWT tokens use URL-safe Base64.'],
              ['Can I encode an image or file to Base64?', 'Yes. Click the File button and upload any file up to 5MB. The tool encodes it to Base64 instantly. For images it also shows a live preview and lets you copy the full data URI, which you can paste straight into CSS or an HTML img src.'],
              ['Is Base64 the same as encryption?', 'No. Base64 is encoding, not encryption. It is fully reversible with no secret key, so anyone can decode a Base64 string instantly. Never use Base64 to protect passwords or sensitive data; use real encryption like AES for that.'],
              ['Why is my Base64 output longer than the input?', 'Base64 represents every 3 bytes of input as 4 characters of output, which makes the encoded result about 33% larger than the original. This size increase is the cost of being able to send binary data safely through text-only systems. The tool shows the exact size change for every conversion.'],
              ['Can I decode a JWT token here?', 'Yes. Paste a JWT or load the JWT sample, and the tool decodes the Base64URL header and payload into readable JSON. For full claim inspection, signature details and an expiry countdown, use the dedicated JWT Decoder tool.'],
              ['What does the padding character "=" mean?', 'The equals sign is padding. Because Base64 output must be a multiple of four characters, one or two = characters are added at the end when the input length is not a multiple of three. URL-safe Base64 usually omits padding entirely.'],
              ['Does it support Unicode and emoji?', 'Yes. The tool encodes text as UTF-8 before converting to Base64, so accented characters, non-Latin scripts and emoji are all handled correctly and decode back exactly as entered.'],
              ['Can I search inside a long encoded result?', 'Yes. When the output is long, a search box appears above it that filters the displayed lines to those containing your search text, which is handy for finding a specific segment inside a large encoded blob.'],
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