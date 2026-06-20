'use client';

import { useState, useRef, useCallback } from 'react';

// ── Utilities ──────────────────────────────────────────────
const formatBytes = (b) => {
  if (b === 0 || b == null) return '0 KB';
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
};

const MIME = { jpeg: 'image/jpeg', webp: 'image/webp', png: 'image/png' };
const EXT  = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };

let _idSeq = 0;
const nextId = () => (++_idSeq) + '-' + Date.now();

// Decode a File into an HTMLImageElement (and keep an object URL for preview)
const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image file.')); };
    img.src = url;
  });

// Draw an image onto a canvas at full resolution (white matte for JPEG to avoid black bg)
const drawToCanvas = (img, withWhiteBg) => {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (withWhiteBg) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(img, 0, 0);
  return canvas;
};

// Promise wrapper around canvas.toBlob
const canvasToBlob = (canvas, mime, quality) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });

// ── Encode at a given quality ──────────────────────────────
const encodeAtQuality = async (canvas, mime, quality) => {
  // PNG ignores the quality arg (lossless); JPEG/WebP use it (0..1)
  const blob = await canvasToBlob(canvas, mime, mime === 'image/png' ? undefined : quality);
  return blob;
};

// ── Binary-search the highest quality whose size <= targetBytes ──
// Returns { blob, quality }. If even quality 0 is too big, returns the smallest.
const compressToTarget = async (canvas, mime, targetBytes) => {
  if (mime === 'image/png') {
    // PNG is lossless  quality slider does nothing. Just encode once.
    const blob = await encodeAtQuality(canvas, mime, 1);
    return { blob, quality: 1, note: 'PNG is lossless; convert to JPEG or WebP to hit a smaller target.' };
  }
  let lo = 0.05, hi = 1.0, best = null, bestQ = lo;
  // First check: even max quality already under target? keep it.
  const top = await encodeAtQuality(canvas, mime, hi);
  if (top && top.size <= targetBytes) return { blob: top, quality: hi };
  // 8 iterations of binary search ~ fine granularity
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    // eslint-disable-next-line no-await-in-loop
    const blob = await encodeAtQuality(canvas, mime, mid);
    if (!blob) break;
    if (blob.size <= targetBytes) { best = blob; bestQ = mid; lo = mid; }
    else { hi = mid; }
  }
  if (!best) {
    // Couldn't get under target even at low quality  return lowest quality attempt
    const floor = await encodeAtQuality(canvas, mime, 0.05);
    return { blob: floor, quality: 0.05, note: 'Target is smaller than this image can reach at full resolution.' };
  }
  return { blob: best, quality: bestQ };
};

// ── Main compress dispatch for one item ────────────────────
const compressItem = async (item, settings) => {
  const { img } = item._decoded;
  const outFormat = settings.format === 'keep'
    ? (item.file.type === 'image/png' ? 'png' : item.file.type === 'image/webp' ? 'webp' : 'jpeg')
    : settings.format;
  const mime = MIME[outFormat];
  const canvas = drawToCanvas(img, mime === 'image/jpeg');  // white bg only for JPEG

  let result;
  if (settings.mode === 'target') {
    const targetBytes = Math.max(1, Math.round(settings.targetKB * 1024));
    result = await compressToTarget(canvas, mime, targetBytes);
  } else if (settings.mode === 'percent') {
    // Reduce to (100 - percent)% of ORIGINAL size as the target
    const targetBytes = Math.max(1, Math.round(item.file.size * (1 - settings.percent / 100)));
    result = await compressToTarget(canvas, mime, targetBytes);
  } else {
    // quality slider mode
    const q = Math.min(1, Math.max(0.05, settings.quality / 100));
    const blob = await encodeAtQuality(canvas, mime, q);
    result = { blob, quality: q };
  }

  if (!result.blob) throw new Error('Compression failed for this image.');
  return {
    blob: result.blob,
    outMime: mime,
    outExt: EXT[mime],
    quality: result.quality,
    note: result.note || '',
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
};

const RELATED_TOOLS = [
  { name: 'Image to Base64',  href: '/tools/image-to-base64',        icon: '🖼️', desc: 'Convert images to Base64 data URLs for inline use' },
  { name: 'Color Picker',     href: '/tools/color-picker',           icon: '🎨', desc: 'Pick colors and extract palettes from images' },
  { name: 'Base64 Encoder',   href: '/tools/base64-encoder-decoder', icon: '🔄', desc: 'Encode and decode Base64 strings and files' },
  { name: 'Excel to PDF',     href: '/tools/excel-to-pdf',           icon: '📊', desc: 'Convert spreadsheets to PDF documents' },
];

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function ImageCompressorTool() {
  // queue items: { id, file, status, error, _decoded:{img,url}, result, outUrl }
  const [items, setItems]   = useState([]);
  const [dragging, setDragging] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [running, setRunning] = useState(false);

  // settings
  const [mode, setMode]       = useState('target');   // target | percent | quality
  const [targetKB, setTargetKB] = useState(50);
  const [percent, setPercent]   = useState(50);
  const [quality, setQuality]   = useState(80);
  const [format, setFormat]     = useState('keep');   // keep | jpeg | webp | png

  const fileRef = useRef(null);
  const dragCount = useRef(0);

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  const validate = (f) => {
    const okType = ACCEPTED.includes(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name);
    if (!okType) return 'Only JPG, PNG and WebP images are supported.';
    if (f.size > 30 * 1024 * 1024) return 'Image too large. Maximum size is 30 MB.';
    return null;
  };

  const addFiles = useCallback(async (fileList) => {
    setGlobalError('');
    const incoming = Array.from(fileList || []);
    const toAdd = [];
    for (const f of incoming) {
      const err = validate(f);
      if (err) { setGlobalError(err); continue; }
      toAdd.push({ id: nextId(), file: f, status: 'pending', error: '', _decoded: null, result: null, outUrl: '' });
    }
    if (!toAdd.length) return;
    // Decode each for preview + dimensions
    for (const it of toAdd) {
      try {
        // eslint-disable-next-line no-await-in-loop
        it._decoded = await loadImage(it.file);
      } catch (e) {
        it.status = 'error'; it.error = e.message;
      }
    }
    setItems((prev) => [...prev, ...toAdd]);
  }, []);

  const patch = (id, fields) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...fields } : it)));

  const removeItem = (id) =>
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?._decoded?.url) URL.revokeObjectURL(it._decoded.url);
      if (it?.outUrl) URL.revokeObjectURL(it.outUrl);
      return prev.filter((x) => x.id !== id);
    });

  const clearAll = () => {
    items.forEach((it) => { if (it._decoded?.url) URL.revokeObjectURL(it._decoded.url); if (it.outUrl) URL.revokeObjectURL(it.outUrl); });
    setItems([]); setGlobalError('');
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const settings = { mode, targetKB, percent, quality, format };

  const runOne = async (it) => {
    if (!it._decoded) return;
    patch(it.id, { status: 'working', error: '' });
    try {
      const out = await compressItem(it, settings);
      const outUrl = URL.createObjectURL(out.blob);
      patch(it.id, { status: 'done', result: out, outUrl });
    } catch (e) {
      patch(it.id, { status: 'error', error: e.message || 'Compression failed.' });
    }
  };

  const compressAll = async () => {
    setRunning(true);
    const snapshot = items.filter((it) => it._decoded && it.status !== 'working');
    for (const it of snapshot) {
      // eslint-disable-next-line no-await-in-loop
      await runOne(it);
    }
    setRunning(false);
  };

  const download = (it) => {
    if (!it.result || !it.outUrl) return;
    const base = it.file.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = it.outUrl;
    a.download = `TOOLBeans-${base}-compressed.${it.result.outExt}`;
    a.click();
  };

  const downloadAll = () => items.filter((it) => it.status === 'done').forEach((it, i) => setTimeout(() => download(it), i * 250));

  const doneCount    = items.filter((it) => it.status === 'done').length;
  const pendingCount = items.filter((it) => it._decoded && it.status !== 'done').length;

  // aggregate savings
  const totals = items.reduce((acc, it) => {
    if (it.status === 'done' && it.result) {
      acc.before += it.file.size;
      acc.after  += it.result.blob.size;
    }
    return acc;
  }, { before: 0, after: 0 });
  const totalSavedPct = totals.before ? Math.max(0, Math.round((1 - totals.after / totals.before) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <a href="/" className="hover:text-teal-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-teal-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Image Compressor</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', '100% Private', 'Exact KB Target', 'JPG · PNG · WebP'].map((b) => (
              <span key={b} className="bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-teal-100">{b}</span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Online Free{' '}
            <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">Image Compressor</span>
            {' '}Tool
          </h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Compress JPG, PNG and WebP images to an exact size in KB or by a percentage, while keeping
            the highest possible quality and full resolution. Everything runs in your browser nothing is uploaded.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">

        {globalError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0 mt-px">⚠️</span><span>{globalError}</span>
          </div>
        )}

        {/* ── SETTINGS PANEL ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Compression Settings</div>

          {/* Mode selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
            {[
              { key: 'target',  label: '🎯 Target Size', desc: 'Compress to an exact KB size' },
              { key: 'percent', label: '📉 By Percent',  desc: 'Reduce size by a percentage' },
              { key: 'quality', label: '🎚️ Quality',     desc: 'Set a manual quality level' },
            ].map((m) => (
              <button key={m.key} onClick={() => setMode(m.key)}
                className={'text-left px-4 py-3 rounded-xl border-2 transition-all ' + (mode === m.key ? 'bg-teal-50 border-teal-400' : 'bg-slate-50 border-slate-200 hover:border-teal-200')}>
                <div className={'text-sm font-bold ' + (mode === m.key ? 'text-teal-700' : 'text-slate-700')}>{m.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>

          {/* Mode-specific control */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
            {mode === 'target' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Target size (KB)  the tool finds the best quality at or under this size</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <input type="number" min="1" value={targetKB}
                    onChange={(e) => setTargetKB(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-teal-400 bg-white" />
                  <span className="text-sm text-slate-400">KB</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {[20, 31, 50, 100, 200, 500].map((v) => (
                      <button key={v} onClick={() => setTargetKB(v)}
                        className={'text-xs font-bold px-2.5 py-1 rounded-lg transition-all ' + (targetKB === v ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-teal-300')}>
                        {v} KB
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {mode === 'percent' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Reduce file size by: <span className="text-teal-600 font-mono">{percent}%</span></label>
                <input type="range" min="5" max="95" step="5" value={percent}
                  onChange={(e) => setPercent(parseInt(e.target.value))}
                  className="w-full accent-teal-500" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Light (5%)</span><span>Aggressive (95%)</span>
                </div>
              </div>
            )}
            {mode === 'quality' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Quality level: <span className="text-teal-600 font-mono">{quality}</span></label>
                <input type="range" min="5" max="100" step="1" value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full accent-teal-500" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Smaller file</span><span>Higher quality</span>
                </div>
              </div>
            )}
          </div>

          {/* Output format */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">Output format</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'keep', label: 'Keep original' },
                { key: 'jpeg', label: 'JPEG (smallest photos)' },
                { key: 'webp', label: 'WebP (best ratio)' },
                { key: 'png',  label: 'PNG (lossless)' },
              ].map((f) => (
                <button key={f.key} onClick={() => setFormat(f.key)}
                  className={'text-xs font-bold px-3 py-2 rounded-xl border transition-all ' + (format === f.key ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white border-slate-200 text-slate-600 hover:border-cyan-300')}>
                  {f.label}
                </button>
              ))}
            </div>
            {format === 'png' && (
              <p className="text-xs text-amber-600 mt-2">⚠️ PNG is lossless  it ignores quality/target. For a smaller file, choose JPEG or WebP.</p>
            )}
          </div>
        </div>

        {/* ── DROP ZONE ── */}
        <div
          onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
          onDragEnter={onDragEnter} onDragLeave={onDragLeave}
          onClick={() => fileRef.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
          className={'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all outline-none focus:border-teal-400 ' + (dragging ? 'border-teal-400 bg-teal-50 scale-[1.01]' : 'border-slate-200 hover:border-teal-300 hover:bg-teal-50/30')}>
          <input ref={fileRef} type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }} />
          <div className="text-5xl mb-3 select-none">🗜️</div>
          <p className="font-bold text-slate-700 text-lg mb-2">
            {dragging ? 'Drop your images here' : items.length ? 'Add more images' : 'Click or drag images here'}
          </p>
          <p className="text-sm text-slate-400">JPG, PNG and WebP up to 30 MB each · multiple files allowed</p>
        </div>

        {/* ── QUEUE / RESULTS ── */}
        {items.length > 0 && (
          <div className="flex flex-col gap-4">

            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">{items.length}</span> image{items.length > 1 ? 's' : ''}
                {doneCount > 0 && <span className="text-teal-600 font-semibold"> · {doneCount} compressed · {totalSavedPct}% smaller total</span>}
              </div>
              <div className="flex gap-2">
                {doneCount > 0 && (
                  <button onClick={downloadAll} disabled={running}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-all disabled:opacity-50">
                    ↓ Download all ({doneCount})
                  </button>
                )}
                <button onClick={clearAll} disabled={running}
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-all disabled:opacity-50">
                  Clear all
                </button>
              </div>
            </div>

            {/* Compress button */}
            {pendingCount > 0 && (
              <button onClick={compressAll} disabled={running}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold py-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-100 text-base flex items-center justify-center gap-3">
                {running ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Compressing…
                  </>
                ) : (pendingCount > 1 ? `🗜️ Compress ${pendingCount} images` : '🗜️ Compress image')}
              </button>
            )}

            {/* Result cards */}
            {items.map((it) => {
              const before = it.file.size;
              const after  = it.result?.blob.size;
              const savedPct = (after != null && before) ? Math.max(0, Math.round((1 - after / before) * 100)) : null;
              const grew = after != null && after > before;
              return (
                <div key={it.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    {/* thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      {it._decoded?.url
                        ? <img src={it.outUrl || it._decoded.url} alt={it.file.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-sm">{it.file.name}</p>
                      {it.result ? (
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                          <span className="text-slate-400 line-through">{formatBytes(before)}</span>
                          <span className="text-slate-300">→</span>
                          <span className="font-bold text-teal-700">{formatBytes(after)}</span>
                          {savedPct != null && !grew && (
                            <span className="bg-teal-100 text-teal-700 font-bold px-2 py-0.5 rounded-full">−{savedPct}%</span>
                          )}
                          {grew && (
                            <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">already optimal</span>
                          )}
                          <span className="text-slate-400">· {it.result.width}×{it.result.height}px · {it.result.outExt.toUpperCase()}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">{formatBytes(before)} · {it._decoded ? `${it._decoded.img.naturalWidth}×${it._decoded.img.naturalHeight}px` : 'reading…'}</p>
                      )}
                      {it.result?.note && <p className="text-xs text-amber-600 mt-1">{it.result.note}</p>}
                      {it.status === 'error' && <p className="text-xs text-rose-600 mt-1">{it.error}</p>}
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {it.status === 'working' && (
                        <svg className="animate-spin w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      )}
                      {it.status === 'done' && (
                        <button onClick={() => download(it)}
                          className="text-xs font-bold px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all">
                          ↓ Download
                        </button>
                      )}
                      {!running && (
                        <button onClick={() => removeItem(it.id)}
                          className="text-slate-300 hover:text-rose-500 text-sm transition-colors">✕</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── RELATED TOOLS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-800 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Free tools that work well alongside the Image Compressor.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/30 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-700 group-hover:text-teal-700 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Online Free Image Compressor Tool  Compress to an Exact KB Size</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans online free image compressor tool shrinks JPG, PNG and WebP images so they take up less space while keeping them looking as close to the original as possible. You can compress an image to an exact target size in kilobytes, reduce it by a percentage, or set a quality level by hand. It is built for the everyday problem of an image being too big: a photo that will not fit a 31 KB upload limit, a screenshot that is slowing down a web page, or a batch of pictures that need to be email-friendly.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Everything happens right inside your browser. When you add an image it is decoded onto a canvas and re-encoded locally using your browser&apos;s built-in image engine, so nothing is ever uploaded to a server. That makes it fast, completely private, and usable even on a slow connection once the page has loaded. There is no signup, no watermark and no limit on how many images you compress.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The before-and-after preview and the exact size readout let you see precisely what you are getting before you download, so you stay in control of the balance between file size and visual quality.
          </p>
        </article>

        {/* Honest "max quality" section */}
        <article className="bg-teal-50 border border-teal-200 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Can You Compress Without Losing Any Quality?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            It helps to be honest about how image compression works. Making a file meaningfully smaller almost always involves giving up a small amount of detail that is what creates the space saving. True lossless compression (where not a single pixel changes) can only trim a limited amount, and it cannot guarantee hitting a small exact size like 31 KB. So a tool that promises both an exact tiny size and zero quality loss is promising something that is not physically possible.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            What this tool does instead is keep quality as high as possible for the size you ask for. It never shrinks your image&apos;s resolution it keeps every pixel dimension and it picks the highest quality setting that still meets your target. For most photos the difference at the resulting size is barely noticeable, and the before-and-after preview lets you judge it yourself. If you need genuinely lossless output, choose the PNG format, which keeps the image pixel-perfect (though the file will be larger).
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            In short: you get the smallest file at the best possible quality for that size, with full resolution preserved and full visibility into the result.
          </p>
        </article>

        {/* Three modes */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Three Ways to Compress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['🎯 Target Size (KB)', 'Type the exact size you need, such as 31 KB, and the tool automatically searches across quality levels to find the highest quality version that lands at or just under your target. Perfect for upload limits and forms with a strict size cap.'],
              ['📉 By Percent', 'Choose how much smaller you want the file, for example 30% smaller or 50% smaller. The tool aims for that reduction from the original size. Great when you just want "noticeably smaller" without a specific number in mind.'],
              ['🎚️ Quality', 'Set a quality level from 5 to 100 yourself and see the resulting size. This gives you direct manual control and is handy when you know roughly what quality you are comfortable with.'],
            ].map(([title, desc]) => (
              <div key={title} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Compress an Image  Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Choose a mode', 'Pick Target Size, By Percent, or Quality at the top of the settings panel, then set your value such as a target of 31 KB.'],
              ['2', 'Pick an output format', 'Keep the original format, or convert to JPEG or WebP for much smaller photos, or PNG for lossless output.'],
              ['3', 'Add your images', 'Drag and drop one or more images onto the upload area, or click to browse. Each appears with its current size and dimensions.'],
              ['4', 'Click Compress', 'The tool processes each image in your browser and shows the new size, the percentage saved, and a preview thumbnail.'],
              ['5', 'Check the result', 'Compare the before and after sizes. Adjust the target or quality and compress again if you want a different balance.'],
              ['6', 'Download', 'Download each compressed image individually, or use Download all to save the whole batch at once.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-teal-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Format guide */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">JPEG vs WebP vs PNG  Which Format Should You Pick?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            Choosing the right output format often saves more space than any quality setting. Here is a quick guide.
          </p>
          <div className="flex flex-col gap-3">
            {[
              ['JPEG', 'The best all-round choice for photographs and complex images with lots of colors. It compresses smoothly and is supported everywhere. Use it when you want the smallest file for a photo and do not need transparency.'],
              ['WebP', 'A modern format that usually produces smaller files than JPEG at the same quality, and also supports transparency. Ideal for the web and supported by all current browsers. Choose it when you want the best size-to-quality ratio.'],
              ['PNG', 'Lossless and supports transparency, so it keeps the image pixel-perfect but the file is larger. Best for logos, icons, screenshots with sharp text, or any image where you cannot accept any quality loss. The quality and target settings do not apply to PNG.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[70px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mt-4">
            A common, very effective trick: take a large PNG photo and convert it to WebP or JPEG. Because PNG is lossless it is often huge for photographs, and switching format can cut the size dramatically with little visible change.
          </p>
        </article>

        {/* Privacy */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Your Images Never Leave Your Device</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Many online compressors upload your images to a server, process them there, and send them back. This one does not. All decoding and re-encoding happens locally in your browser using the standard Canvas API, so your images are never transmitted, stored, or seen by anyone else.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            That makes it safe for personal photos, work screenshots, client assets, and anything confidential. It also means compression is instant there is no upload wait and it keeps working even if your connection drops after the page has loaded.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is the image compressor free?', 'Yes. It is completely free with no usage limits, no account and no signup. There is no watermark on the output and no cap on how many images you compress.'],
              ['Are my images uploaded to a server?', 'No. All compression runs entirely in your browser using the Canvas API. Your images never leave your device and are never sent anywhere, which makes it safe for private or confidential pictures.'],
              ['Can I compress an image to an exact size like 31 KB?', 'Yes. Choose Target Size mode and enter your number, for example 31 KB. The tool automatically searches quality levels to find the best-looking version that lands at or just under your target, getting as close as the format allows.'],
              ['Will compressing lower my image quality?', 'Any real reduction in file size involves some quality trade-off, because that is how compression frees up space. The tool keeps your full resolution and picks the highest quality that meets your target, and the before-and-after preview lets you see the result before downloading.'],
              ['How can I compress without any quality loss at all?', 'Choose the PNG output format. PNG is lossless and keeps the image pixel-perfect. The file will be larger than a compressed JPEG or WebP, but no detail is lost.'],
              ['Which formats can I compress?', 'You can compress JPG/JPEG, PNG and WebP. You can also convert between them, for example turning a large PNG into a much smaller WebP or JPEG, which often saves the most space.'],
              ['Can I compress several images at once?', 'Yes. Add as many images as you like to the queue, compress them all with your chosen settings, then download them individually or all at once.'],
              ['Does it reduce the image dimensions?', 'No. The tool keeps the full pixel dimensions of your image. It reduces file size through compression and format choice, not by shrinking the resolution.'],
              ['What is the maximum file size I can add?', 'Each image can be up to 30 MB. Very large images take a moment longer to process because the work happens on your own device.'],
              ['Why did my file get bigger instead of smaller?', 'This can happen if the original is already highly compressed, or if you convert a small JPEG to PNG. In that case the tool shows an "already optimal" note; try a different format such as WebP or keep the original.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-center justify-between">
                  {q}<span className="text-teal-500 text-lg ml-3 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</div>
              </details>
            ))}
          </div>
        </article>

      </div>
    </div>
  );
}