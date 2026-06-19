'use client';

import { useState, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────
// ── MD5 Pure JS Implementation (no external deps) ──
// ─────────────────────────────────────────────────────
function md5(input) {
  const str = unescape(encodeURIComponent(input));
  const arr = [];
  for (let i = 0; i < str.length; i++) arr.push(str.charCodeAt(i));
  return md5FromBytes(arr, str.length);
}

// MD5 over a raw byte array (used for binary file hashing)
function md5Bytes(bytes) {
  return md5FromBytes(Array.from(bytes), bytes.length);
}

function md5FromBytes(arr, byteLen) {
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

  // Work on a copy so we never mutate caller data
  const msg = arr.slice();
  // Pad message
  msg.push(0x80);
  while (msg.length % 64 !== 56) msg.push(0);
  const bitLen = (byteLen * 8);
  msg.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff, 0, 0, 0, 0);

  const words = [];
  for (let i = 0; i < msg.length; i += 4) {
    words.push((msg[i]) | (msg[i+1] << 8) | (msg[i+2] << 16) | (msg[i+3] << 24));
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
const _crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

function crc32(str) {
  let crc = -1;
  for (let i = 0; i < str.length; i++) {
    crc = _crcTable[(crc ^ str.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
}

// CRC32 over raw bytes (binary file hashing)
function crc32Bytes(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = _crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
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

// SHA over a raw ArrayBuffer (binary file hashing)
async function shaBuffer(algorithm, buffer) {
  const hashBuf = await crypto.subtle.digest(algorithm, buffer);
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

const formatBytes = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';

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

      {/* Top row label + security badge */}
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
  // NEW: track when the current hashes came from a binary file, and which file
  const [fileInfo, setFileInfo]     = useState(null);   // { name, size } | null
  const fileRef                     = useRef(null);
  const debounceRef                 = useRef(null);

  // ── Generate all hashes from TEXT ──
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

  // ── NEW: Generate all hashes from raw FILE BYTES (correct for binary files) ──
  const generateHashesFromBuffer = async (buffer, file) => {
    setLoading(true);
    try {
      const bytes = new Uint8Array(buffer);
      const [s1, s256, s384, s512] = await Promise.all([
        shaBuffer('SHA-1',   buffer),
        shaBuffer('SHA-256', buffer),
        shaBuffer('SHA-384', buffer),
        shaBuffer('SHA-512', buffer),
      ]);
      const result = {
        md5:    md5Bytes(bytes),
        sha1:   s1,
        sha256: s256,
        sha384: s384,
        sha512: s512,
        crc32:  crc32Bytes(bytes),
      };
      setHashes(result);
      setHistory((prev) => [{
        input:  '📄 ' + file.name,
        sha256: s256,
        time:   new Date().toLocaleTimeString(),
      }, ...prev.filter((h) => h.input !== '📄 ' + file.name)].slice(0, 8));
    } catch {}
    setLoading(false);
  };

  // ── Debounced input handler (typing = text mode) ──
  const handleInput = (val) => {
    setInput(val);
    setFileInfo(null);              // typing overrides any file-hash context
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

  // ── File hash — NOW reads raw bytes so binary files hash correctly ──
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const buffer = ev.target?.result;       // ArrayBuffer
      setInput('');                           // text box not meaningful for binary
      setFileInfo({ name: file.name, size: file.size });
      await generateHashesFromBuffer(buffer, file);
    };
    reader.readAsArrayBuffer(file);            // raw bytes so binary files hash correctly
    e.target.value = '';
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
    const head = fileInfo ? 'File: ' + fileInfo.name : 'Input: ' + input;
    await navigator.clipboard.writeText(head + '\n\n' + lines);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // ── Download hashes as text ──
  const downloadHashes = () => {
    if (!Object.keys(hashes).length) return;
    const lines = [
      'TOOLBeans Hash Generator',
      '='.repeat(40),
      fileInfo ? 'File : ' + fileInfo.name + ' (' + formatBytes(fileInfo.size) + ')' : 'Input: ' + input,
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

  const clearAll = () => { setInput(''); setHashes({}); setFileInfo(null); };

  const inputSize = new Blob([input]).size;
  const hasResults = Object.keys(hashes).length > 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <a href="/" className="hover:text-emerald-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-emerald-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Hash Generator</span>
          </nav>
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
            Verify file integrity, debug checksums 100% runs in your browser. Nothing is sent to any server.
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
        {/* TAB 1 GENERATOR                 */}
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
                  <button onClick={clearAll} className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all">
                    ✕ Clear
                  </button>
                </div>
              </div>

              {/* NEW: file-hash indicator banner */}
              {fileInfo && (
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 border-b border-emerald-100">
                  <span className="text-lg flex-shrink-0">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-800 truncate">Hashing file: {fileInfo.name}</p>
                    <p className="text-xs text-emerald-600">{formatBytes(fileInfo.size)} · raw bytes read so the checksum matches the official one</p>
                  </div>
                  <button onClick={clearAll} className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex-shrink-0">✕ Remove</button>
                </div>
              )}

              {/* Textarea */}
              <textarea
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={fileInfo
                  ? 'A file is loaded above. Start typing to switch back to hashing text…'
                  : 'Enter any text, paste a password, URL, or upload a file to generate hashes…\n\nExample:\n  Hello, World!\n  user@example.com\n  MySecretPassword123!'}
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
                Your input text and files are never sent to any server. Safe for passwords, secrets, and sensitive data.
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
                        onClick={() => !h.input.startsWith('📄') && handleInput(h.input.replace('…', ''))}
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
        {/* TAB 2 COMPARE                   */}
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
                      Same length ({compareA.length} chars) likely same algorithm but different data.
                    </p>
                  )}
                  {!compareResult && compareA.length !== compareB.length && (
                    <p className="text-xs text-rose-500 mt-2 font-mono">
                      Different lengths ({compareA.length} vs {compareB.length} chars) possibly different algorithms.
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
        {/* TAB 3 HMAC                      */}
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
        {/* TAB 4 GUIDE                     */}
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
                  {['MD5 cracked in seconds with rainbow tables','SHA-1 collision attacks proven','CRC32 not a cryptographic hash','Raw SHA-256 without salt vulnerable to dictionary attacks'].map((i) => (
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
                  { q: 'Is hashing the same as encryption?', a: 'No. Hashing is one-way you cannot reverse a hash back to the original. Encryption is two-way it can be decrypted with a key.' },
                  { q: 'Why does the same input always produce the same hash?', a: 'Hash functions are deterministic. The same input always produces the same output, which makes them useful for verification.' },
                  { q: 'What is a hash collision?', a: 'When two different inputs produce the same hash output. MD5 and SHA-1 have known collision attacks, which is why they are considered insecure for cryptographic use.' },
                  { q: 'Can I use MD5 for anything?', a: 'Yes checksums for non-security purposes like verifying a file downloaded correctly. Never use MD5 for password storage or security tokens.' },
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

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* Quick feature grid (kept, condensed) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mt-2">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">What a Hash Generator Does</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔐', title: 'Cryptographic Hashing',   desc: 'A hash function converts any input into a fixed-size string. The same input always produces the same hash instantly verifiable.' },
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

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free Online Hash Generator MD5, SHA-256, SHA-512 and More</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans Hash Generator turns any text or file into a fixed-length fingerprint called a hash. It supports six of the most widely used algorithms MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 and computes all of them at once the moment you type. Whether you need to verify that a download arrived intact, generate a checksum to share with someone else, sign an API request, or simply understand how a particular hashing algorithm behaves, this tool produces correct, standards-compliant output instantly.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            A cryptographic hash function has a few defining properties. It is deterministic, so the same input always yields exactly the same output. It is fixed-length, so a three-character message and a three-gigabyte file both produce a hash of the same size for a given algorithm. It is fast to compute in one direction but practically impossible to reverse, which is why hashes are called one-way functions. And for the secure algorithms, even a single-character change in the input produces a completely different, unpredictable output a property known as the avalanche effect.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Everything here runs entirely inside your browser. Text hashing uses the same Web Crypto API that browsers use for HTTPS, and file hashing reads the raw bytes of your file locally. Nothing you enter is ever uploaded, logged, or stored, which makes the tool safe to use with passwords, private keys, confidential documents and other sensitive material.
          </p>
        </article>

        {/* What is a hash / how it works */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What Is a Hash, and How Does It Work?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Imagine running a document through a machine that always produces the same short code for that exact document, but produces a wildly different code if even one comma changes. That code is a hash, and the machine is a hash function. Because the output is a fixed size no matter how large the input is, a hash acts like a compact digital fingerprint of the data.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            This fingerprint property is what makes hashing so useful. Two files are almost certainly identical if their SHA-256 hashes match, and almost certainly different if they do not. Software publishers rely on this every day: they publish the SHA-256 checksum of an installer next to the download link, and you can hash the file you received and compare. If the two values match, the file was not corrupted in transit and was not swapped out by an attacker.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hashing is not the same as encryption, and the difference matters. Encryption is reversible by design you encrypt data with a key and later decrypt it with a key. Hashing is intentionally irreversible: there is no key and no decrypt step, because the whole point is to represent data without being able to recover it. That is exactly why hashing is used to store passwords. A website never needs to know your actual password; it only needs to check whether the hash of what you typed matches the hash it stored when you signed up.
          </p>
        </article>

        {/* Algorithm deep dive */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">The Six Algorithms Explained</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Each algorithm this tool supports has a different history, output size and appropriate use. Choosing the right one matters, because using a weak algorithm in the wrong place is a real security risk.
          </p>
          <div className="flex flex-col gap-3">
            {[
              ['MD5 (128-bit)', 'Once the most common hash in the world, MD5 is now cryptographically broken. Researchers can deliberately create two different inputs with the same MD5 hash, so it must never be used for security. It remains perfectly fine for non-adversarial checksums, such as detecting accidental file corruption or deduplicating data.'],
              ['SHA-1 (160-bit)', 'The successor to MD5, SHA-1 is also considered broken after practical collision attacks were demonstrated. It still appears in older systems and in Git, which uses it for commit identifiers rather than security. Avoid it for any new security-sensitive work.'],
              ['SHA-256 (256-bit)', 'A member of the SHA-2 family and the workhorse of modern security. It underpins TLS certificates, blockchain systems, digital signatures and software checksums. When in doubt and you need a secure hash, SHA-256 is the sensible default.'],
              ['SHA-384 (384-bit)', 'A longer SHA-2 variant offering a larger security margin, often chosen for TLS certificates and higher-assurance applications where the extra output length is desirable.'],
              ['SHA-512 (512-bit)', 'The largest SHA-2 variant, producing a 128-character hex string. It is well suited to maximum-security contexts and can actually be faster than SHA-256 on modern 64-bit hardware.'],
              ['CRC32 (32-bit)', 'Not a cryptographic hash at all, but an error-detection code. CRC32 is built into ZIP archives and PNG images to catch accidental corruption. It is extremely fast but trivial to forge, so it should never be relied upon for security.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[150px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Generate a Hash Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Enter your text or load a file', 'Type or paste anything into the input box on the Generator tab, or click File to load a document, image, or archive. Hashes update instantly as you type.'],
              ['2', 'Read all six hashes at once', 'MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 are all computed together, each with a security badge so you know which are safe for cryptographic use.'],
              ['3', 'Toggle uppercase if needed', 'Some systems expect uppercase hex. Flip the Uppercase Output switch to match the format you are comparing against.'],
              ['4', 'Copy or download', 'Copy any single hash, copy all of them with the input label, or download a text report you can keep alongside the file as a checksum record.'],
              ['5', 'Verify with the Compare tab', 'Paste a published checksum and the hash you generated into the Compare tab to confirm a file is authentic and untampered.'],
              ['6', 'Sign data with HMAC', 'Switch to the HMAC tab, enter a message and a secret key, and generate an HMAC-SHA256 signature for API authentication or webhook verification.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* File checksums */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Verifying File Checksums the Right Way</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            One of the most common reasons people reach for a hash generator is to confirm that a downloaded file is exactly what the publisher intended. When you load a file here, the tool reads its raw bytes directly, so the SHA-256 or MD5 it produces will match the checksum printed on an official download page byte for byte. This matters because reading a binary file as text would corrupt the data and produce a wrong hash, a subtle mistake that trips up many simpler tools.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The workflow is simple. Download the file, note the official checksum the publisher lists (most use SHA-256), load your downloaded copy here, and compare the generated SHA-256 with the published one using the Compare tab. A match means the file is intact and authentic. A mismatch means the file was corrupted during download or has been altered, and you should not trust or run it. This single habit is one of the easiest ways to protect yourself from tampered installers and supply-chain attacks.
          </p>
        </article>

        {/* Security best practices */}
        <article className="bg-emerald-50 border border-emerald-200 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Hashing and Password Security</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            A frequent misunderstanding is that running a password through SHA-256 makes it safe to store. On its own, it does not. Because hashing is deterministic and fast, an attacker who steals a database of raw SHA-256 password hashes can simply hash billions of common passwords and look for matches, using precomputed rainbow tables to do it almost instantly.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Proper password storage uses a dedicated, deliberately slow algorithm bcrypt, Argon2 or scrypt combined with a unique random salt for every user. The salt ensures that two people with the same password get different stored hashes, and the slowness makes large-scale guessing impractical. The general-purpose hashes in this tool are excellent for integrity and signatures, but they are not a substitute for a real password-hashing scheme.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            For authenticating messages and API calls, HMAC is the right tool. By mixing a secret key into the hashing process, HMAC-SHA256 lets a receiver confirm both that a message is intact and that it came from someone who knows the shared secret. This is why services like GitHub, Stripe and Shopify sign their webhooks with HMAC-SHA256 it lets your server reject forged requests.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is the hash generator free and private?', 'Yes. It is completely free with no signup, and every hash is computed locally in your browser with the Web Crypto API. Your text and files are never uploaded to any server, so it is safe for passwords and confidential data.'],
              ['Is hashing the same as encryption?', 'No. Encryption is two-way and can be reversed with a key. Hashing is one-way by design there is no way to turn a hash back into the original input, which is exactly why it is used for verification and password storage.'],
              ['Can I hash a file to check its checksum?', 'Yes. Click File on the Generator tab and select any file. The tool reads the raw bytes, so the SHA-256, MD5 or other checksum it produces will exactly match the value published by the software vendor.'],
              ['Which hash is best for passwords?', 'None of these raw hashes alone. Use a purpose-built password algorithm such as bcrypt, Argon2 or scrypt together with a unique salt. MD5 and SHA-1 must never be used for passwords under any circumstances.'],
              ['Why are MD5 and SHA-1 marked as insecure?', 'Both have proven collision attacks, meaning an attacker can craft two different inputs that share the same hash. They are acceptable for non-security checksums but unsafe for signatures, certificates or security tokens.'],
              ['What is the difference between SHA-256, SHA-384 and SHA-512?', 'They are all members of the SHA-2 family and differ mainly in output length and security margin. SHA-256 is the common default; SHA-384 and SHA-512 produce longer hashes for higher-assurance use and can be faster on 64-bit systems.'],
              ['What is a hash collision?', 'A collision is when two different inputs produce the same hash. Secure algorithms make finding one computationally infeasible. The known collisions in MD5 and SHA-1 are precisely why they are considered broken for security.'],
              ['What is HMAC and when should I use it?', 'HMAC combines a secret key with a message to produce a signature that proves the message is authentic and unaltered. Use it for signing API requests and verifying webhooks, where a plain hash would not prove who created the data.'],
              ['Does the same text always give the same hash?', 'Yes. Hash functions are deterministic, so identical input always yields identical output. This is what makes hashing reliable for comparing files and verifying data has not changed.'],
              ['Why did my hash change after a tiny edit?', 'Secure hash functions exhibit the avalanche effect: changing even one character produces a completely different, unpredictable hash. This is intended behaviour and is what makes tampering easy to detect.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-center justify-between">
                  {q}<span className="text-emerald-500 text-lg ml-3 flex-shrink-0">+</span>
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