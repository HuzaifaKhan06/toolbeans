'use client';

import { useState, useCallback, useRef } from 'react';

// ── Helpers ────────────────────────────────────────────────
const formatBytes = (b) => {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
};

const getMime = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
    bmp: 'image/bmp', ico: 'image/x-icon', tiff: 'image/tiff', avif: 'image/avif',
  };
  return map[ext] || 'image/png';
};

const ACCEPT = '.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.ico,.tiff,.avif';
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const OUTPUT_FORMATS = [
  { key: 'dataurl',   label: 'Data URL',       desc: 'data:image/png;base64,...',      icon: '🌐' },
  { key: 'base64',    label: 'Base64 Only',     desc: 'Raw base64 string only',         icon: '🔤' },
  { key: 'html_img',  label: 'HTML <img>',      desc: '<img src="data:..." />',         icon: '🏷️' },
  { key: 'css_bg',    label: 'CSS background',  desc: "background-image: url('...')",   icon: '🎨' },
  { key: 'markdown',  label: 'Markdown',        desc: '![alt](data:...)',               icon: '📝' },
  { key: 'json',      label: 'JSON field',      desc: '{"image": "data:..."}',          icon: '{ }' },
];

const buildOutput = (dataUrl, base64, mime, format, altText, cssClass, jsonKey) => {
  switch (format) {
    case 'dataurl':  return dataUrl;
    case 'base64':   return base64;
    case 'html_img': return `<img src="${dataUrl}" alt="${altText || 'image'}"${cssClass ? ` class="${cssClass}"` : ''} />`;
    case 'css_bg':   return `background-image: url('${dataUrl}');`;
    case 'markdown': return `![${altText || 'image'}](${dataUrl})`;
    case 'json':     return JSON.stringify({ [jsonKey || 'image']: dataUrl }, null, 2);
    default:         return dataUrl;
  }
};

const RELATED_TOOLS = [
  { name: 'Base64 Encoder',   href: '/tools/base64-encoder-decoder',  icon: '🔄', desc: 'Encode or decode any text/data as Base64 strings'   },
  { name: 'JSON Formatter',   href: '/tools/json-formatter',           icon: '{ }', desc: 'Format and validate JSON data structures'           },
  { name: 'Color Picker',     href: '/tools/color-picker',             icon: '🎨', desc: 'Pick colors from images and generate palettes'      },
  { name: 'Code Formatter',   href: '/tools/code-formatter',           icon: '✨', desc: 'Format and beautify HTML, CSS, JS and JSON code'    },
];

// ── Main Component ─────────────────────────────────────────
export default function ImageToBase64Tool() {
  const [images, setImages]         = useState([]);     // [{ id, file, name, mime, size, dataUrl, base64, w, h, error }]
  const [activeId, setActiveId]     = useState(null);
  const [format, setFormat]         = useState('dataurl');
  const [altText, setAltText]       = useState('');
  const [cssClass, setCssClass]     = useState('');
  const [jsonKey, setJsonKey]       = useState('image');
  const [isDragging, setIsDragging] = useState(false);
  const [copiedKey, setCopiedKey]   = useState('');
  const [wrapLines, setWrapLines]   = useState(true);

  const fileRef = useRef(null);

  const active = images.find((img) => img.id === activeId) || images[0] || null;

  // ── Process Files ──────────────────────────────────────
  const processFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) => {
      if (f.size > MAX_SIZE) return false;
      return f.type.startsWith('image/') || ACCEPT.includes('.' + f.name.split('.').pop().toLowerCase());
    });

    valid.forEach((file) => {
      const id = Math.random().toString(36).slice(2);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const base64  = dataUrl.split(',')[1] || '';
        const mime    = file.type || getMime(file.name);

        // Get dimensions for raster images
        if (mime !== 'image/svg+xml') {
          const img = new window.Image();
          img.onload = () => {
            setImages((prev) => prev.map((item) =>
              item.id === id ? { ...item, dataUrl, base64, mime, w: img.naturalWidth, h: img.naturalHeight } : item
            ));
          };
          img.src = dataUrl;
        } else {
          setImages((prev) => prev.map((item) =>
            item.id === id ? { ...item, dataUrl, base64, mime } : item
          ));
        }
      };
      reader.onerror = () => {
        setImages((prev) => prev.map((item) =>
          item.id === id ? { ...item, error: 'Failed to read file.' } : item
        ));
      };

      // Add placeholder immediately
      setImages((prev) => {
        const newItem = { id, file, name: file.name, mime: file.type || getMime(file.name), size: file.size, dataUrl: '', base64: '', w: null, h: null, error: null };
        const updated = [...prev, newItem];
        if (!activeId) setActiveId(id);
        return updated;
      });
      setActiveId(id);

      reader.readAsDataURL(file);
    });

    // Size-exceeded warning
    const oversized = Array.from(files).filter((f) => f.size > MAX_SIZE);
    if (oversized.length) {
      alert(oversized.length + ' file(s) exceeded the 10 MB limit and were skipped.');
    }
  }, [activeId]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = (e) => processFiles(e.target.files);

  const removeImage = (id) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (activeId === id) setActiveId(next[0]?.id || null);
      return next;
    });
  };

  const clearAll = () => { setImages([]); setActiveId(null); };

  // ── Copy / Download ────────────────────────────────────
  const copy = async (text, key) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const downloadTxt = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllZip = async () => {
    // Download each as individual txt files since JSZip isn't available
    images.forEach((img) => {
      if (!img.base64) return;
      const out = buildOutput(img.dataUrl, img.base64, img.mime, format, altText, cssClass, jsonKey);
      downloadTxt(out, img.name.replace(/\.[^.]+$/, '') + '-base64.txt');
    });
  };

  // ── Decode Base64 back to image ────────────────────────
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeResult, setDecodeResult] = useState(null);
  const [decodeError, setDecodeError]   = useState('');
  const [activeMainTab, setActiveMainTab] = useState('encode'); // encode | decode

  const handleDecode = () => {
    setDecodeError(''); setDecodeResult(null);
    let input = decodeInput.trim();
    if (!input) { setDecodeError('Paste a Base64 string or Data URL above.'); return; }
    try {
      // Accept raw base64 or full data URL
      let dataUrl = input;
      if (!input.startsWith('data:')) {
        // Try to detect mime from base64 header bytes
        const raw = atob(input.slice(0, 16).replace(/[^A-Za-z0-9+/=]/g, ''));
        let mime = 'image/png';
        if (raw.startsWith('\x89PNG')) mime = 'image/png';
        else if (raw.startsWith('\xff\xd8')) mime = 'image/jpeg';
        else if (raw.startsWith('GIF8')) mime = 'image/gif';
        else if (raw.startsWith('RIFF')) mime = 'image/webp';
        dataUrl = 'data:' + mime + ';base64,' + input;
      }
      // Validate
      const base64Part = dataUrl.split(',')[1];
      atob(base64Part); // throws if invalid
      setDecodeResult(dataUrl);
    } catch {
      setDecodeError('Invalid Base64 string. Make sure to paste a valid Base64-encoded image or Data URL.');
    }
  };

  const downloadDecoded = () => {
    if (!decodeResult) return;
    const mime = decodeResult.split(';')[0].split(':')[1] || 'image/png';
    const ext  = mime.split('/')[1].replace('jpeg','jpg').replace('svg+xml','svg');
    const a    = document.createElement('a');
    a.href     = decodeResult;
    a.download = 'decoded-image.' + ext;
    a.click();
  };

  // ── Output ─────────────────────────────────────────────
  const outputText = active?.dataUrl
    ? buildOutput(active.dataUrl, active.base64, active.mime, format, altText, cssClass, jsonKey)
    : '';

  const outputSize = outputText ? formatBytes(new Blob([outputText]).size) : '';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 border-b border-slate-100 py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-orange-200">
            Free · Instant · 100% In Browser
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Image to{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              Base64
            </span>
            {' '}Converter
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Convert images to Base64 encoded strings, Data URLs, HTML img tags, CSS backgrounds,
            Markdown and JSON. Also decode Base64 back to images. Supports batch conversion.
            No server your images never leave your device.
          </p>
          <div className="flex gap-2 justify-center mt-5 flex-wrap">
            {['PNG · JPG · GIF · WebP · SVG · BMP', 'Batch Convert', 'Data URL', 'HTML / CSS / Markdown', 'Decode Base64', 'No Upload'].map((f) => (
              <span key={f} className="text-xs bg-white border border-orange-200 text-orange-700 font-semibold px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* AD TOP */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* ── MAIN TAB: Encode / Decode ── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'encode', label: '🖼️ Image → Base64' },
            { key: 'decode', label: '🔄 Base64 → Image' },
          ].map((t) => (
            <button key={t.key} onClick={() => setActiveMainTab(t.key)}
              className={'text-sm font-extrabold px-5 py-2.5 rounded-xl transition-all ' + (activeMainTab === t.key ? 'bg-orange-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════
            ENCODE TAB
        ══════════════════════════════════ */}
        {activeMainTab === 'encode' && (
          <div className="flex flex-col gap-5">

            {/* ── DROP ZONE ── */}
            {images.length === 0 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={'border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all bg-white ' + (isDragging ? 'border-orange-400 bg-orange-50' : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/40')}>
                <div className="text-6xl mb-4">{isDragging ? '📂' : '🖼️'}</div>
                <div className="text-slate-700 font-extrabold text-xl mb-2">Drop images here or click to browse</div>
                <p className="text-slate-400 text-sm mb-4">PNG, JPG, GIF, WebP, SVG, BMP, ICO, AVIF up to 10 MB each</p>
                <span className="inline-block bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  Choose Images
                </span>
              </div>
            )}

            {/* ── LOADED STATE ── */}
            {images.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                {/* LEFT: Image List */}
                <div className="xl:col-span-1 flex flex-col gap-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {images.length} Image{images.length > 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => fileRef.current?.click()}
                          className="text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-xl border border-orange-200 transition-all">
                          + Add More
                        </button>
                        <button onClick={clearAll}
                          className="text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition-all">
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
                      {images.map((img) => (
                        <div key={img.id}
                          onClick={() => setActiveId(img.id)}
                          className={'flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ' + (activeId === img.id ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-100 hover:border-orange-200')}>
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                            {img.dataUrl ? (
                              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                            ) : img.error ? (
                              <span className="text-rose-500 text-lg">⚠</span>
                            ) : (
                              <div className="w-5 h-5 border-2 border-orange-400/30 border-t-orange-500 rounded-full animate-spin" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-700 truncate">{img.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{formatBytes(img.size)}{img.w ? ` · ${img.w}×${img.h}` : ''}</div>
                            {img.error && <div className="text-xs text-rose-500 mt-0.5">{img.error}</div>}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                            className="text-slate-300 hover:text-rose-500 transition-colors text-lg font-bold flex-shrink-0">×</button>
                        </div>
                      ))}
                    </div>

                    {/* Batch download */}
                    {images.length > 1 && (
                      <button onClick={downloadAllZip}
                        className="mt-3 w-full text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-all">
                        ↓ Download All as .txt files
                      </button>
                    )}
                  </div>

                  {/* Output Format Options */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Output Format</div>
                    <div className="flex flex-col gap-1.5">
                      {OUTPUT_FORMATS.map((f) => (
                        <button key={f.key} onClick={() => setFormat(f.key)}
                          className={'flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left ' + (format === f.key ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-100 hover:border-orange-200')}>
                          <span className="text-base flex-shrink-0">{f.icon}</span>
                          <div>
                            <div className={'text-xs font-bold ' + (format === f.key ? 'text-orange-700' : 'text-slate-700')}>{f.label}</div>
                            <div className="text-xs text-slate-400 font-mono">{f.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Format-specific options */}
                    {(format === 'html_img' || format === 'markdown') && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Alt Text</label>
                        <input value={altText} onChange={(e) => setAltText(e.target.value)}
                          placeholder="image description..."
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-orange-400 bg-slate-50" />
                      </div>
                    )}
                    {format === 'html_img' && (
                      <div className="mt-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">CSS Class (optional)</label>
                        <input value={cssClass} onChange={(e) => setCssClass(e.target.value)}
                          placeholder="my-image responsive..."
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-orange-400 bg-slate-50" />
                      </div>
                    )}
                    {format === 'json' && (
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">JSON Key Name</label>
                        <input value={jsonKey} onChange={(e) => setJsonKey(e.target.value)}
                          placeholder="image"
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-orange-400 bg-slate-50" />
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Preview + Output */}
                <div className="xl:col-span-2 flex flex-col gap-4">

                  {active && (
                    <>
                      {/* Image Preview */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</span>
                            <span className="text-xs font-mono text-slate-500">{active.name}</span>
                          </div>
                          <div className="flex gap-3 text-xs text-slate-400">
                            {active.w && <span>{active.w} × {active.h} px</span>}
                            <span>{formatBytes(active.size)}</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{active.mime}</span>
                          </div>
                        </div>
                        <div className="bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:20px_20px] rounded-xl flex items-center justify-center min-h-40 max-h-72 overflow-hidden">
                          {active.dataUrl ? (
                            <img src={active.dataUrl} alt={active.name}
                              className="max-w-full max-h-72 object-contain rounded" />
                          ) : (
                            <div className="flex flex-col items-center gap-2 py-8">
                              <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" style={{ borderWidth: 3 }} />
                              <span className="text-xs text-slate-400">Processing...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Base64 Stats */}
                      {active.base64 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Original Size',   value: formatBytes(active.size)               },
                            { label: 'Base64 Size',     value: formatBytes(active.base64.length)      },
                            { label: 'Size Increase',   value: '+' + Math.round((active.base64.length / active.size - 1) * 100) + '%' },
                            { label: 'Output Length',   value: outputText.length.toLocaleString() + ' chars' },
                          ].map((s) => (
                            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm text-center">
                              <div className="text-base font-extrabold text-orange-600">{s.value}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Output box */}
                      {active.dataUrl && (
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {OUTPUT_FORMATS.find((f) => f.key === format)?.label} Output
                              </span>
                              {outputSize && <span className="text-xs text-slate-400">{outputSize}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <div onClick={() => setWrapLines(!wrapLines)}
                                  className={'w-7 h-4 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (wrapLines ? 'bg-orange-500' : 'bg-slate-200')}>
                                  <div className={'w-3 h-3 bg-white rounded-full shadow-sm transition-all ' + (wrapLines ? 'translate-x-3' : 'translate-x-0')} />
                                </div>
                                <span className="text-xs text-slate-500">Wrap</span>
                              </label>
                              <button onClick={() => copy(outputText, 'output')}
                                className={'text-xs font-bold px-3 py-1.5 rounded-xl transition-all ' + (copiedKey === 'output' ? 'bg-emerald-500 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white')}>
                                {copiedKey === 'output' ? '✓ Copied!' : 'Copy'}
                              </button>
                              <button onClick={() => downloadTxt(outputText, active.name.replace(/\.[^.]+$/, '') + '-base64.txt')}
                                className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-3 py-1.5 rounded-xl transition-all">
                                ↓ .txt
                              </button>
                            </div>
                          </div>
                          <textarea
                            readOnly
                            value={outputText}
                            className={'w-full h-48 px-5 py-4 text-xs font-mono bg-slate-900 text-emerald-400 border-0 outline-none leading-relaxed resize-none ' + (wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto')}
                            spellCheck={false}
                          />
                        </div>
                      )}

                      {/* Quick use snippets */}
                      {active.dataUrl && format === 'dataurl' && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Use Snippets</div>
                          <div className="flex flex-col gap-2">
                            {[
                              { label: 'HTML <img>', code: `<img src="${active.dataUrl.slice(0, 40)}..." alt="image" />`, full: `<img src="${active.dataUrl}" alt="image" />` },
                              { label: 'CSS background', code: `background-image: url('${active.dataUrl.slice(0, 30)}...');`, full: `background-image: url('${active.dataUrl}');` },
                              { label: 'JavaScript', code: `const imgSrc = "${active.dataUrl.slice(0, 30)}...";`, full: `const imgSrc = "${active.dataUrl}";` },
                            ].map((s) => (
                              <div key={s.label} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                <span className="text-xs font-bold text-orange-700 flex-shrink-0 w-28">{s.label}</span>
                                <code className="text-xs font-mono text-slate-500 flex-1 truncate">{s.code}</code>
                                <button onClick={() => copy(s.full, s.label)}
                                  className={'text-xs font-bold px-2.5 py-1 rounded-lg transition-all flex-shrink-0 ' + (copiedKey === s.label ? 'bg-emerald-500 text-white' : 'bg-slate-200 hover:bg-orange-100 hover:text-orange-700 text-slate-600')}>
                                  {copiedKey === s.label ? '✓' : 'Copy'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Drop zone when images loaded but want more */}
            {images.length > 0 && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={'border border-dashed rounded-xl py-4 text-center transition-all cursor-pointer ' + (isDragging ? 'border-orange-400 bg-orange-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/30')}
                onClick={() => fileRef.current?.click()}>
                <span className="text-xs text-slate-400">+ Drop more images here or click to add</span>
              </div>
            )}

            <input ref={fileRef} type="file" accept={ACCEPT} multiple className="hidden" onChange={handleFileInput} />
          </div>
        )}

        {/* ══════════════════════════════════
            DECODE TAB
        ══════════════════════════════════ */}
        {activeMainTab === 'decode' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Paste Base64 or Data URL</div>
              <textarea
                value={decodeInput}
                onChange={(e) => { setDecodeInput(e.target.value); setDecodeResult(null); setDecodeError(''); }}
                placeholder={'Paste your Base64 string or Data URL here...\n\nAccepted formats:\n• data:image/png;base64,iVBORw0KGgo...\n• Raw Base64: iVBORw0KGgo...'}
                className="w-full h-44 px-4 py-3 text-xs font-mono bg-slate-900 text-emerald-400 border border-slate-200 rounded-xl outline-none focus:border-orange-400 resize-none leading-relaxed"
                spellCheck={false}
              />
              {decodeError && (
                <p className="text-xs text-rose-600 font-medium mt-2">⚠ {decodeError}</p>
              )}
              <div className="flex gap-3 mt-3 flex-wrap">
                <button onClick={handleDecode} disabled={!decodeInput.trim()}
                  className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all">
                  🔄 Decode to Image
                </button>
                <button onClick={() => { setDecodeInput(''); setDecodeResult(null); setDecodeError(''); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-3 rounded-xl text-sm transition-all">
                  Clear
                </button>
              </div>
            </div>

            {decodeResult && (
              <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold text-sm">✓ Valid image decoded</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-mono">
                      {decodeResult.split(';')[0].split(':')[1]}
                    </span>
                  </div>
                  <button onClick={downloadDecoded}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                    ↓ Download Image
                  </button>
                </div>
                <div className="bg-[repeating-conic-gradient(#e2e8f0_0%_25%,#f8fafc_0%_50%)] bg-[length:20px_20px] rounded-xl flex items-center justify-center min-h-48 max-h-96 overflow-hidden">
                  <img src={decodeResult} alt="Decoded" className="max-w-full max-h-96 object-contain rounded" />
                </div>
              </div>
            )}

            {/* How to get Base64 tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="text-sm font-extrabold text-amber-800 mb-2">💡 Where to find Base64 image strings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Browser DevTools',  desc: 'Open Network tab → click an image request → look for data: URLs in the response' },
                  { label: 'CSS Stylesheets',   desc: 'Inline images in CSS are often stored as data:image/... Base64 URLs' },
                  { label: 'HTML source',       desc: 'Some sites embed images as <img src="data:image/..."> directly in HTML' },
                  { label: 'JSON APIs',         desc: 'Some APIs return images as Base64 strings inside JSON response fields' },
                ].map((t) => (
                  <div key={t.label} className="bg-white rounded-xl p-3 border border-amber-100">
                    <div className="text-xs font-bold text-amber-700">{t.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FORMAT GUIDE ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900 mb-4">Output Format Guide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Data URL',        use: 'Use anywhere an image src or url() is accepted',      example: 'data:image/png;base64,ABC123...' },
              { label: 'Base64 Only',     use: 'For API payloads, storage, manual processing',        example: 'iVBORw0KGgoAAAANSUhEUgAA...' },
              { label: 'HTML <img>',      use: 'Embed image directly in HTML without external file',  example: '<img src="data:..." alt="x" />' },
              { label: 'CSS Background',  use: 'Inline background images in CSS stylesheets',         example: "background-image: url('data:...');" },
              { label: 'Markdown',        use: 'Embed images in .md files, GitHub README, wikis',     example: '![alt text](data:image/png;...)' },
              { label: 'JSON',            use: 'Include images in REST API requests or config files',  example: '{"image": "data:image/png;..."}' },
            ].map((f) => (
              <div key={f.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-bold text-orange-700 mb-1">{f.label}</div>
                <div className="text-xs text-slate-500 mb-2">{f.use}</div>
                <code className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 block truncate">{f.example}</code>
              </div>
            ))}
          </div>
        </div>

        {/* AD BOTTOM */}
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>

        {/* ── RELATED TOOLS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Free tools that work great alongside the Image to Base64 converter.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-orange-700 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free Image to Base64 Converter Online</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans Image to Base64 converter transforms any image file PNG, JPG, GIF, WebP, SVG, BMP, ICO or AVIF into a Base64-encoded string entirely in your browser. Your images are never uploaded to any server, making this the safest and fastest option available.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Choose from six output formats: raw Data URL for direct use in HTML or CSS, Base64-only string for API payloads, HTML img tag with optional alt text and class, CSS background-image property, Markdown image syntax for README files, or a JSON object field. Batch convert multiple images at once and download all results.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The built-in Base64 decoder reverses the process paste any Base64 string or Data URL and instantly preview the decoded image with a one-click download button. Useful for debugging API responses, inspecting embedded images from HTML source, or recovering images from JSON payloads.
          </p>
        </div>
      </div>
    </div>
  );
}