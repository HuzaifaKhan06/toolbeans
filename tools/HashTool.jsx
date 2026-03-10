'use client';

import { useState, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────
// ── MD5 Pure JS Implementation (no external deps) ──
// ─────────────────────────────────────────────────────
function md5(input) {
  const str = unescape(encodeURIComponent(input));
  const arr = [];
  for (let i = 0; i < str.length; i++) arr.push(str.charCodeAt(i));

  const T = [];
  for (let i = 0; i < 64; i++) T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;

  const safe_add = (x, y) => {
    const lsw = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff);
  };
  const bit_rol = (num, cnt) => (num << cnt) | (num >>> (32 - cnt));
  const md5_cmn = (q, a, b, x, s, t) => safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
  const md5_ff  = (a,b,c,d,x,s,t) => md5_cmn((b & c) | (~b & d), a, b, x, s, t);
  const md5_gg  = (a,b,c,d,x,s,t) => md5_cmn((b & d) | (c & ~d), a, b, x, s, t);
  const md5_hh  = (a,b,c,d,x,s,t) => md5_cmn(b ^ c ^ d, a, b, x, s, t);
  const md5_ii  = (a,b,c,d,x,s,t) => md5_cmn(c ^ (b | ~d), a, b, x, s, t);

  // Pad message
  arr.push(0x80);
  while (arr.length % 64 !== 56) arr.push(0);
  const bitLen = (input.length * 8);
  arr.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff, 0, 0, 0, 0);

  const words = [];
  for (let i = 0; i < arr.length; i += 4) {
    words.push((arr[i]) | (arr[i+1] << 8) | (arr[i+2] << 16) | (arr[i+3] << 24));
  }

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < words.length; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];
    const w = words.slice(i, i + 16);
    a=md5_ff(a,b,c,d,w[0],7,T[0]);   d=md5_ff(d,a,b,c,w[1],12,T[1]);   c=md5_ff(c,d,a,b,w[2],17,T[2]);   b=md5_ff(b,c,d,a,w[3],22,T[3]);
    a=md5_ff(a,b,c,d,w[4],7,T[4]);   d=md5_ff(d,a,b,c,w[5],12,T[5]);   c=md5_ff(c,d,a,b,w[6],17,T[6]);   b=md5_ff(b,c,d,a,w[7],22,T[7]);
    a=md5_ff(a,b,c,d,w[8],7,T[8]);   d=md5_ff(d,a,b,c,w[9],12,T[9]);   c=md5_ff(c,d,a,b,w[10],17,T[10]); b=md5_ff(b,c,d,a,w[11],22,T[11]);
    a=md5_ff(a,b,c,d,w[12],7,T[12]); d=md5_ff(d,a,b,c,w[13],12,T[13]); c=md5_ff(c,d,a,b,w[14],17,T[14]); b=md5_ff(b,c,d,a,w[15],22,T[15]);
    a=md5_gg(a,b,c,d,w[1],5,T[16]);  d=md5_gg(d,a,b,c,w[6],9,T[17]);   c=md5_gg(c,d,a,b,w[11],14,T[18]); b=md5_gg(b,c,d,a,w[0],20,T[19]);
    a=md5_gg(a,b,c,d,w[5],5,T[20]);  d=md5_gg(d,a,b,c,w[10],9,T[21]);  c=md5_gg(c,d,a,b,w[15],14,T[22]); b=md5_gg(b,c,d,a,w[4],20,T[23]);
    a=md5_gg(a,b,c,d,w[9],5,T[24]);  d=md5_gg(d,a,b,c,w[14],9,T[25]);  c=md5_gg(c,d,a,b,w[3],14,T[26]);  b=md5_gg(b,c,d,a,w[8],20,T[27]);
    a=md5_gg(a,b,c,d,w[13],5,T[28]); d=md5_gg(d,a,b,c,w[2],9,T[29]);   c=md5_gg(c,d,a,b,w[7],14,T[30]);  b=md5_gg(b,c,d,a,w[12],20,T[31]);
    a=md5_hh(a,b,c,d,w[5],4,T[32]);  d=md5_hh(d,a,b,c,w[8],11,T[33]);  c=md5_hh(c,d,a,b,w[11],16,T[34]); b=md5_hh(b,c,d,a,w[14],23,T[35]);
    a=md5_hh(a,b,c,d,w[1],4,T[36]);  d=md5_hh(d,a,b,c,w[4],11,T[37]);  c=md5_hh(c,d,a,b,w[7],16,T[38]);  b=md5_hh(b,c,d,a,w[10],23,T[39]);
    a=md5_hh(a,b,c,d,w[13],4,T[40]); d=md5_hh(d,a,b,c,w[0],11,T[41]);  c=md5_hh(c,d,a,b,w[3],16,T[42]);  b=md5_hh(b,c,d,a,w[6],23,T[43]);
    a=md5_hh(a,b,c,d,w[9],4,T[44]);  d=md5_hh(d,a,b,c,w[12],11,T[45]); c=md5_hh(c,d,a,b,w[15],16,T[46]); b=md5_hh(b,c,d,a,w[2],23,T[47]);
    a=md5_ii(a,b,c,d,w[0],6,T[48]);  d=md5_ii(d,a,b,c,w[7],10,T[49]);  c=md5_ii(c,d,a,b,w[14],15,T[50]); b=md5_ii(b,c,d,a,w[5],21,T[51]);
    a=md5_ii(a,b,c,d,w[12],6,T[52]); d=md5_ii(d,a,b,c,w[3],10,T[53]);  c=md5_ii(c,d,a,b,w[10],15,T[54]); b=md5_ii(b,c,d,a,w[1],21,T[55]);
    a=md5_ii(a,b,c,d,w[8],6,T[56]);  d=md5_ii(d,a,b,c,w[15],10,T[57]); c=md5_ii(c,d,a,b,w[6],15,T[58]);  b=md5_ii(b,c,d,a,w[13],21,T[59]);
    a=md5_ii(a,b,c,d,w[4],6,T[60]);  d=md5_ii(d,a,b,c,w[11],10,T[61]); c=md5_ii(c,d,a,b,w[2],15,T[62]);  b=md5_ii(b,c,d,a,w[9],21,T[63]);
    a=safe_add(a,aa); b=safe_add(b,bb); c=safe_add(c,cc); d=safe_add(d,dd);
  }

  const toHex = (n) => {
    let s = '';
    for (let i = 0; i < 4; i++) s += ('0' + ((n >>> (i * 8)) & 0xff).toString(16)).slice(-2);
    return s;
  };
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

// ─────────────────────────────────────────────────
// ── CRC32 Pure JS Implementation ──
// ─────────────────────────────────────────────────
function crc32(str) {
  let crc = -1;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  for (let i = 0; i < str.length; i++) {
    crc = table[(crc ^ str.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
}

// ─────────────────────────────────────────────────
// ── Web Crypto SHA hashing ──
// ─────────────────────────────────────────────────
async function sha(algorithm, input) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(input);
  const hashBuf = await crypto.subtle.digest(algorithm, data);
  const bytes   = Array.from(new Uint8Array(hashBuf));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─────────────────────────────────────────────────
// ── Hash all algorithms ──
// ─────────────────────────────────────────────────
const ALGORITHMS = [
  { id: 'md5',     label: 'MD5',     bits: 128, warning: true,  color: 'amber'   },
  { id: 'sha1',    label: 'SHA-1',   bits: 160, warning: true,  color: 'orange'  },
  { id: 'sha256',  label: 'SHA-256', bits: 256, warning: false, color: 'emerald' },
  { id: 'sha384',  label: 'SHA-384', bits: 384, warning: false, color: 'emerald' },
  { id: 'sha512',  label: 'SHA-512', bits: 512, warning: false, color: 'emerald' },
  { id: 'crc32',   label: 'CRC32',   bits: 32,  warning: true,  color: 'rose'    },
];

const ALGO_INFO = {
  md5:    { full: 'Message Digest 5',        use: 'Checksums, file integrity (non-security)',    secure: false },
  sha1:   { full: 'Secure Hash Algorithm 1', use: 'Legacy systems, Git commit IDs',              secure: false },
  sha256: { full: 'SHA-2 (256-bit)',          use: 'Password hashing, digital signatures, SSL',  secure: true  },
  sha384: { full: 'SHA-2 (384-bit)',          use: 'High security apps, TLS certificates',       secure: true  },
  sha512: { full: 'SHA-2 (512-bit)',          use: 'Maximum security, blockchain, HMAC',         secure: true  },
  crc32:  { full: 'Cyclic Redundancy Check', use: 'Error detection, ZIP/PNG checksums only',    secure: false },
};

const SAMPLES = [
  { label: 'Hello World',    value: 'Hello, World!' },
  { label: 'Email',          value: 'user@example.com' },
  { label: 'Password',       value: 'MySecurePassword123!' },
  { label: 'Empty string',   value: '' },
  { label: 'TOOLBeans',        value: 'TOOLBeans Developer Tools' },
];

const formatBytes = (b) => b < 1024 ? b + ' B' : (b / 1024).toFixed(1) + ' KB';

// ─────────────────────────────────────────────────
// ── HASH ROW COMPONENT ──
// ─────────────────────────────────────────────────
function HashRow({ algo, hash, loading, copied, onCopy }) {
  const info  = ALGO_INFO[algo.id];
  const badge = algo.warning
    ? 'bg-amber-50 text-amber-600 border-amber-200'
    : 'bg-emerald-50 text-emerald-600 border-emerald-200';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all duration-200">

      {/* Top row — label + security badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-extrabold text-slate-800 font-mono">{algo.label}</span>
          <span className={'text-xs font-bold px-2 py-0.5 rounded-full border ' + badge}>
            {algo.bits}-bit
          </span>
          {algo.warning && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200">
              ⚠ Not for security
            </span>
          )}
          {!algo.warning && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              ✓ Secure
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">{info.full}</span>
      </div>

      {/* Hash output */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-700 break-all leading-relaxed min-h-[44px] flex items-center">
          {loading ? (
            <span className="text-slate-300 animate-pulse">Computing hash…</span>
          ) : hash ? (
            hash
          ) : (
            <span className="text-slate-300 italic">Enter text to generate hash</span>
          )}
        </div>
        <button
          onClick={() => onCopy(algo.id, hash)}
          disabled={!hash}
          className={
            'flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-3 rounded-xl transition-all ' +
            (copied === algo.id
              ? 'bg-green-500 text-white'
              : hash
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-0.5 hover:shadow-md'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed')
          }
        >
          {copied === algo.id ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>

      {/* Use case */}
      <p className="text-xs text-slate-400 leading-relaxed">{info.use}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────
// ── MAIN COMPONENT ──
// ─────────────────────────────────────────────────
export default function HashTool() {
  const [input, setInput]           = useState('');
  const [hashes, setHashes]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [copied, setCopied]         = useState('');
  const [copiedAll, setCopiedAll]   = useState(false);
  const [activeAlgos, setActiveAlgos] = useState(['md5','sha1','sha256','sha256','sha384','sha512','crc32']);
  const [uppercase, setUppercase]   = useState(false);
  const [hmacKey, setHmacKey]       = useState('');
  const [hmacMode, setHmacMode]     = useState(false);
  const [hmacHash, setHmacHash]     = useState('');
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab]   = useState('generator');
  const [compareA, setCompareA]     = useState('');
  const [compareB, setCompareB]     = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const fileRef                     = useRef(null);
  const debounceRef                 = useRef(null);

  // ── Generate all hashes ──
  const generateHashes = async (text) => {
    if (!text && text !== '') { setHashes({}); return; }
    setLoading(true);
    try {
      const [s1, s256, s384, s512] = await Promise.all([
        sha('SHA-1',   text),
        sha('SHA-256', text),
        sha('SHA-384', text),
        sha('SHA-512', text),
      ]);
      const result = {
        md5:   md5(text),
        sha1:  s1,
        sha256: s256,
        sha384: s384,
        sha512: s512,
        crc32: crc32(text),
      };
      setHashes(result);

      // Track history (last 8)
      if (text.trim()) {
        setHistory((prev) => [{
          input:  text.slice(0, 40) + (text.length > 40 ? '…' : ''),
          sha256: s256,
          time:   new Date().toLocaleTimeString(),
        }, ...prev.filter((h) => h.input !== text.slice(0, 40))].slice(0, 8));
      }
    } catch {}
    setLoading(false);
  };

  // ── Debounced input handler ──
  const handleInput = (val) => {
    setInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generateHashes(val), 150);
  };

  // ── Generate HMAC-SHA256 ──
  const generateHMAC = async () => {
    if (!input || !hmacKey) return;
    try {
      const enc     = new TextEncoder();
      const keyData = enc.encode(hmacKey);
      const msgData = enc.encode(input);
      const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false, ['sign']
      );
      const sig   = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const bytes = Array.from(new Uint8Array(sig));
      const hex   = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
      setHmacHash(hex);
    } catch { setHmacHash('Error generating HMAC'); }
  };

  // ── File hash ──
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result;
      setInput(text);
      await generateHashes(text);
    };
    reader.readAsText(file);
  };

  // ── Copy single hash ──
  const copyHash = async (id, hash) => {
    if (!hash) return;
    const val = uppercase ? hash.toUpperCase() : hash;
    await navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(''), 2500);
  };

  // ── Copy all hashes ──
  const copyAllHashes = async () => {
    if (!Object.keys(hashes).length) return;
    const lines = ALGORITHMS
      .map((a) => a.label.padEnd(8) + ': ' + (uppercase ? hashes[a.id].toUpperCase() : hashes[a.id]))
      .join('\n');
    await navigator.clipboard.writeText('Input: ' + input + '\n\n' + lines);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // ── Download hashes as text ──
  const downloadHashes = () => {
    if (!Object.keys(hashes).length) return;
    const lines = [
      'TOOLBeans Hash Generator',
      '='.repeat(40),
      'Input: ' + input,
      'Date : ' + new Date().toLocaleString(),
      '',
      ...ALGORITHMS.map((a) => a.label.padEnd(8) + ': ' + (uppercase ? hashes[a.id].toUpperCase() : hashes[a.id])),
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TOOLBeans-hashes.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Compare hashes ──
  const compareHashes = () => {
    if (!compareA || !compareB) return;
    setCompareResult(compareA.trim().toLowerCase() === compareB.trim().toLowerCase());
  };

  const pasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInput(text);
    } catch {}
  };

  const inputSize = new Blob([input]).size;
  const hasResults = Object.keys(hashes).length > 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-emerald-200">
            Security Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Hash{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto mb-6">
            Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512, and CRC32 hashes instantly.
            Verify file integrity, debug checksums — 100% runs in your browser. Nothing is sent to any server.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: '6',         label: 'Algorithms'     },
              { value: '100%',      label: 'Private'        },
              { value: 'Instant',   label: 'Live Hashing'   },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-emerald-600">{s.value}</div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD TOP ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'generator', label: '# Generator'  },
            { key: 'compare',   label: '⇌ Compare'    },
            { key: 'hmac',      label: '🔑 HMAC'      },
            { key: 'guide',     label: '📖 Guide'     },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ' +
                (activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-6">

        {/* ══════════════════════════════════ */}
        {/* TAB 1 — GENERATOR                 */}
        {/* ══════════════════════════════════ */}
        {activeTab === 'generator' && (
          <div className="flex flex-col gap-5">

            {/* Input Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Text</span>
                  {input && (
                    <span className="text-xs text-slate-400 font-mono">
                      {input.length} chars · {formatBytes(inputSize)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={pasteInput} className="text-xs text-emerald-600 hover:text-emerald-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-all">
                    ⎘ Paste
                  </button>
                  <button onClick={() => fileRef.current?.click()} className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all">
                    📎 File
                  </button>
                  <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
                  <button onClick={() => { setInput(''); setHashes({}); }} className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all">
                    ✕ Clear
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={'Enter any text, paste a password, URL, or upload a file to generate hashes…\n\nExample:\n  Hello, World!\n  user@example.com\n  MySecretPassword123!'}
                className="w-full px-6 py-5 text-sm text-slate-700 outline-none resize-none font-mono leading-relaxed bg-white"
                style={{ minHeight: '140px' }}
              />

              {/* Quick Samples */}
              <div className="flex items-center gap-2 px-6 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleInput(s.value)}
                    className="text-xs bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 font-semibold px-3 py-1.5 rounded-xl transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Uppercase toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setUppercase(!uppercase)}
                  className={'w-10 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer ' + (uppercase ? 'bg-emerald-600' : 'bg-slate-200')}
                >
                  <div className={'w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ' + (uppercase ? 'translate-x-4' : 'translate-x-0')} />
                </div>
                <span className="text-sm font-semibold text-slate-600">Uppercase Output</span>
              </label>

              {/* Bulk actions */}
              {hasResults && (
                <div className="flex gap-2">
                  <button
                    onClick={copyAllHashes}
                    className={'text-xs font-bold px-4 py-2.5 rounded-xl transition-all ' + (copiedAll ? 'bg-green-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-0.5 hover:shadow-md')}
                  >
                    {copiedAll ? '✓ Copied All' : '⎘ Copy All Hashes'}
                  </button>
                  <button
                    onClick={downloadHashes}
                    className="text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                  >
                    ⬇ Download .txt
                  </button>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5">
              <span className="text-emerald-500 text-lg flex-shrink-0">🔒</span>
              <p className="text-xs text-emerald-700 leading-relaxed">
                <strong>100% Private:</strong> All hashing happens directly in your browser using the Web Crypto API.
                Your input text is never sent to any server. Safe for passwords, secrets, and sensitive data.
              </p>
            </div>

            {/* Hash Results */}
            <div className="flex flex-col gap-3">
              {ALGORITHMS.map((algo) => (
                <HashRow
                  key={algo.id}
                  algo={algo}
                  hash={hashes[algo.id] ? (uppercase ? hashes[algo.id].toUpperCase() : hashes[algo.id]) : ''}
                  loading={loading}
                  copied={copied}
                  onCopy={copyHash}
                />
              ))}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    🕐 Recent Hashes ({history.length})
                  </span>
                  <span className="text-slate-400 text-sm">{showHistory ? '▲' : '▼'}</span>
                </button>
                {showHistory && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => handleInput(h.input.replace('…', ''))}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-slate-300 font-mono flex-shrink-0">{h.time}</span>
                        <span className="text-xs font-mono text-slate-600 flex-shrink-0 max-w-[140px] truncate">{h.input}</span>
                        <span className="text-xs font-mono text-emerald-600 truncate flex-1">{h.sha256}</span>
                      </div>
                    ))}
                    <div className="px-6 py-3 bg-slate-50">
                      <button onClick={() => setHistory([])} className="text-xs text-rose-400 hover:text-rose-600 font-semibold">
                        Clear History
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* TAB 2 — COMPARE                   */}
        {/* ══════════════════════════════════ */}
        {activeTab === 'compare' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-2">Hash Comparator</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Paste two hashes to verify they match. Useful for verifying file integrity, comparing checksums, or validating token signatures. Case-insensitive comparison.
              </p>

              <div className="flex flex-col gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hash A</label>
                  <input
                    type="text"
                    value={compareA}
                    onChange={(e) => { setCompareA(e.target.value); setCompareResult(null); }}
                    placeholder="Paste first hash here…"
                    className="w-full px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hash B</label>
                  <input
                    type="text"
                    value={compareB}
                    onChange={(e) => { setCompareB(e.target.value); setCompareResult(null); }}
                    placeholder="Paste second hash here…"
                    className="w-full px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={compareHashes}
                disabled={!compareA || !compareB}
                className={
                  'w-full font-bold py-3.5 rounded-xl transition-all text-sm ' +
                  (compareA && compareB
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-200'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed')
                }
              >
                ⇌ Compare Hashes
              </button>

              {compareResult !== null && (
                <div className={'mt-5 rounded-2xl p-5 border ' + (compareResult ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}>
                  <div className={'text-lg font-extrabold mb-1 ' + (compareResult ? 'text-emerald-700' : 'text-rose-700')}>
                    {compareResult ? '✓ Hashes Match!' : '✗ Hashes Do Not Match'}
                  </div>
                  <p className={'text-sm leading-relaxed ' + (compareResult ? 'text-emerald-600' : 'text-rose-600')}>
                    {compareResult
                      ? 'The two hashes are identical (case-insensitive). The files or data they represent are the same.'
                      : 'The two hashes are different. The data has been modified, corrupted, or they are from different inputs.'}
                  </p>
                  {!compareResult && compareA.length === compareB.length && (
                    <p className="text-xs text-rose-500 mt-2 font-mono">
                      Same length ({compareA.length} chars) — likely same algorithm but different data.
                    </p>
                  )}
                  {!compareResult && compareA.length !== compareB.length && (
                    <p className="text-xs text-rose-500 mt-2 font-mono">
                      Different lengths ({compareA.length} vs {compareB.length} chars) — possibly different algorithms.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Use cases */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-800 mb-4">Common Use Cases</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '📦', title: 'File Download Verification', desc: 'Verify a downloaded file was not corrupted or tampered by comparing its hash with the published one.' },
                  { icon: '🔑', title: 'Password Validation',        desc: 'Compare hashed passwords without storing plaintext. Never compare plaintext passwords directly.' },
                  { icon: '🔗', title: 'API Token Validation',       desc: 'Check if an API token or HMAC signature matches expected value during authentication.' },
                  { icon: '📋', title: 'Data Integrity Check',        desc: 'Ensure database records or backup files have not been altered between backup and restore.' },
                ].map((c) => (
                  <div key={c.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="text-2xl flex-shrink-0">{c.icon}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">{c.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* TAB 3 — HMAC                      */}
        {/* ══════════════════════════════════ */}
        {activeTab === 'hmac' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-2">HMAC-SHA256 Generator</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                HMAC (Hash-based Message Authentication Code) combines a secret key with your message to produce a tamper-proof signature. Used in API authentication, webhooks, and JWT signatures.
              </p>

              <div className="flex flex-col gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter the message to sign…"
                    className="w-full px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secret Key</label>
                  <input
                    type="text"
                    value={hmacKey}
                    onChange={(e) => setHmacKey(e.target.value)}
                    placeholder="Enter your secret key…"
                    className="w-full px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={generateHMAC}
                disabled={!input || !hmacKey}
                className={
                  'w-full font-bold py-3.5 rounded-xl transition-all text-sm mb-5 ' +
                  (input && hmacKey
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-200'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed')
                }
              >
                🔑 Generate HMAC-SHA256
              </button>

              {hmacHash && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">HMAC-SHA256 Result</div>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 font-mono text-xs text-slate-700 break-all leading-relaxed bg-white border border-emerald-100 rounded-xl px-4 py-3">
                      {hmacHash}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(hmacHash); }}
                      className="flex-shrink-0 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-3 rounded-xl transition-all"
                    >
                      ⎘ Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* HMAC info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="text-sm font-extrabold text-amber-800 mb-3">🔑 When to Use HMAC</h3>
              <div className="space-y-2.5">
                {[
                  'Signing webhook payloads (GitHub, Stripe, Shopify all use HMAC-SHA256)',
                  'Generating API request signatures to prevent tampering',
                  'Verifying the integrity of data passed between services',
                  'Creating time-limited tokens with a shared secret',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                    <span className="text-amber-400 flex-shrink-0 mt-0.5">→</span>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* TAB 4 — GUIDE                     */}
        {/* ══════════════════════════════════ */}
        {activeTab === 'guide' && (
          <div className="flex flex-col gap-5">

            {/* Algorithm comparison table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4">Algorithm Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Algorithm', 'Output Size', 'Speed', 'Security', 'Best For'].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { algo: 'MD5',     size: '128-bit / 32 hex', speed: '⚡ Very Fast', sec: '❌ Broken',      use: 'Checksums only. Never passwords.' },
                      { algo: 'SHA-1',   size: '160-bit / 40 hex', speed: '⚡ Fast',      sec: '⚠ Deprecated', use: 'Legacy systems, Git commits.' },
                      { algo: 'SHA-256', size: '256-bit / 64 hex', speed: '✅ Fast',      sec: '✅ Secure',      use: 'Passwords, SSL, digital signatures.' },
                      { algo: 'SHA-384', size: '384-bit / 96 hex', speed: '✅ Fast',      sec: '✅ Very Secure', use: 'TLS certs, high-security apps.' },
                      { algo: 'SHA-512', size: '512-bit / 128 hex',speed: '✅ Fast',      sec: '✅ Maximum',     use: 'Maximum security, blockchain.' },
                      { algo: 'CRC32',   size: '32-bit / 8 hex',   speed: '⚡ Fastest',  sec: '❌ Not crypto',  use: 'ZIP/PNG error detection only.' },
                    ].map((row) => (
                      <tr key={row.algo} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 font-mono font-bold text-slate-800">{row.algo}</td>
                        <td className="px-3 py-3 font-mono text-slate-500">{row.size}</td>
                        <td className="px-3 py-3">{row.speed}</td>
                        <td className="px-3 py-3">{row.sec}</td>
                        <td className="px-3 py-3 text-slate-500 leading-relaxed">{row.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-rose-700 mb-3">❌ Never Use For Passwords</h3>
                <div className="space-y-2">
                  {['MD5 — cracked in seconds with rainbow tables','SHA-1 — collision attacks proven','CRC32 — not a cryptographic hash','Raw SHA-256 without salt — vulnerable to dictionary attacks'].map((i) => (
                    <div key={i} className="text-xs text-rose-600 flex items-start gap-2">
                      <span className="flex-shrink-0">✗</span>{i}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-emerald-700 mb-3">✓ Recommended Practices</h3>
                <div className="space-y-2">
                  {['Use bcrypt, Argon2, or scrypt for storing passwords','Use SHA-256 or SHA-512 for file integrity checks','Use HMAC-SHA256 for API authentication','Always use a salt when hashing passwords'].map((i) => (
                    <div key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                      <span className="flex-shrink-0">✓</span>{i}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-5">FAQ</h2>
              <div className="space-y-4">
                {[
                  { q: 'Is hashing the same as encryption?', a: 'No. Hashing is one-way — you cannot reverse a hash back to the original. Encryption is two-way — it can be decrypted with a key.' },
                  { q: 'Why does the same input always produce the same hash?', a: 'Hash functions are deterministic. The same input always produces the same output, which makes them useful for verification.' },
                  { q: 'What is a hash collision?', a: 'When two different inputs produce the same hash output. MD5 and SHA-1 have known collision attacks, which is why they are considered insecure for cryptographic use.' },
                  { q: 'Can I use MD5 for anything?', a: 'Yes — checksums for non-security purposes like verifying a file downloaded correctly. Never use MD5 for password storage or security tokens.' },
                  { q: 'What is a salt in hashing?', a: 'A random value added to the input before hashing. Salts prevent rainbow table attacks and ensure identical passwords produce different hashes.' },
                  { q: 'Is my input safe here?', a: 'Yes. All hashing happens in your browser using the Web Crypto API. Nothing is sent to any server. This is safe for sensitive inputs.' },
                ].map((faq, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 hover:border-emerald-200 transition-colors">
                    <div className="text-sm font-bold text-slate-800 mb-1.5">Q: {faq.q}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">A: {faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AD BOTTOM ── */}
        <div className="mt-8 mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement — 728x90
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">What is a Hash Generator?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔐', title: 'Cryptographic Hashing',   desc: 'A hash function converts any input into a fixed-size string. The same input always produces the same hash — instantly verifiable.' },
              { icon: '📦', title: 'File Integrity',           desc: 'Generate SHA-256 of any file and share the hash. Anyone can verify the file was not tampered with by comparing hashes.' },
              { icon: '🔑', title: 'Password Security',        desc: 'Websites store hashed passwords, never plaintext. When you log in, your input is hashed and compared to the stored hash.' },
              { icon: '🛡️', title: 'API Authentication',       desc: 'HMAC-SHA256 signs API requests so servers can verify requests have not been modified in transit.' },
              { icon: '⚡', title: 'Instant & Private',        desc: 'Uses the browser-native Web Crypto API. No server calls, no logging, no storage. Completely private.' },
              { icon: '🔍', title: 'Hash Comparison',          desc: 'Paste two hashes to instantly verify they match. Essential for file verification and security audits.' },
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