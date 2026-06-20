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

// NEW: decode a base64 string back to UTF-8 text (used for SVG markup)
const b64ToText = (base64) => {
  try { return decodeURIComponent(escape(atob(base64))); }
  catch { try { return atob(base64); } catch { return ''; } }
};

// NEW: build a URL-encoded SVG data URI. For SVG this is smaller than base64
// and stays human-readable, while remaining valid in src and url() contexts.
const svgUrlEncodedDataUri = (svgText) => {
  if (!svgText) return '';
  const cleaned = svgText.replace(/\s+/g, ' ').trim();
  const encoded = cleaned
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/"/g, "'")
    .replace(/&/g, '%26')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D');
  return 'data:image/svg+xml,' + encoded;
};

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
  { name: 'Image Compressor', href: '/tools/image-compressor',         icon: '🗜️', desc: 'Compress JPG, PNG and WebP to an exact KB size'      },
  { name: 'Base64 Encoder',   href: '/tools/base64-encoder-decoder',  icon: '🔄', desc: 'Encode or decode any text/data as Base64 strings'   },
  { name: 'JSON Formatter',   href: '/tools/json-formatter',           icon: '{ }', desc: 'Format and validate JSON data structures'           },
  { name: 'Color Picker',     href: '/tools/color-picker',             icon: '🎨', desc: 'Pick colors from images and generate palettes'      },
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
  const [svgUrlEncode, setSvgUrlEncode] = useState(false);   // NEW: SVG → URL-encoded data URI

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

  // ── SVG URL-encoding helpers ───────────────────────────
  const isSvg = (item) => item && item.mime === 'image/svg+xml';
  // The data URL actually used for output: URL-encoded SVG when enabled, else the base64 data URL.
  const dataUrlFor = (item) => {
    if (item && isSvg(item) && svgUrlEncode && item.base64) {
      const enc = svgUrlEncodedDataUri(b64ToText(item.base64));
      if (enc) return enc;
    }
    return item ? item.dataUrl : '';
  };

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
      const out = buildOutput(dataUrlFor(img), img.base64, img.mime, format, altText, cssClass, jsonKey);
      downloadTxt(out, img.name.replace(/\.[^.]+$/, '') + '-base64.txt');
    });
  };

  // NEW: download every conversion in ONE labelled .txt file (more reliable than
  // triggering many downloads, which browsers often block after the first).
  const downloadCombined = () => {
    const ready = images.filter((img) => img.base64);
    if (!ready.length) return;
    const fmtLabel = OUTPUT_FORMATS.find((f) => f.key === format)?.label || format;
    const body = ready.map((img) => {
      const out = buildOutput(dataUrlFor(img), img.base64, img.mime, format, altText, cssClass, jsonKey);
      return `/* ===== ${img.name}  (${img.mime}, ${formatBytes(img.size)}) ===== */\n${out}`;
    }).join('\n\n');
    const header = `/* ${ready.length} image(s) as ${fmtLabel}  generated with TOOLBeans Image to Base64 */\n\n`;
    downloadTxt(header + body, 'toolbeans-base64-batch.txt');
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
  const effectiveDataUrl = dataUrlFor(active);
  const outputText = active?.dataUrl
    ? buildOutput(effectiveDataUrl, active.base64, active.mime, format, altText, cssClass, jsonKey)
    : '';

  const outputSize = outputText ? formatBytes(new Blob([outputText]).size) : '';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-amber-50 border-b border-slate-100 py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <a href="/" className="hover:text-orange-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-orange-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Image to Base64</span>
          </nav>

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
                      <div className="mt-3 flex flex-col gap-2">
                        <button onClick={downloadCombined}
                          className="w-full text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl transition-all">
                          ↓ Download all in one .txt
                        </button>
                        <button onClick={downloadAllZip}
                          className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-all">
                          ↓ Download as separate .txt files
                        </button>
                      </div>
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

                    {/* NEW: SVG URL-encode toggle (only relevant for SVG images) */}
                    {isSvg(active) && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <div onClick={() => setSvgUrlEncode(!svgUrlEncode)}
                            className={'w-9 h-5 rounded-full transition-all flex items-center px-0.5 cursor-pointer flex-shrink-0 mt-0.5 ' + (svgUrlEncode ? 'bg-orange-500' : 'bg-slate-300')}>
                            <div className={'w-4 h-4 bg-white rounded-full shadow-sm transition-all ' + (svgUrlEncode ? 'translate-x-4' : 'translate-x-0')} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-amber-800">URL-encode SVG (smaller)</div>
                            <div className="text-xs text-amber-600 mt-0.5">Outputs a compact, readable <span className="font-mono">data:image/svg+xml,</span> URI instead of base64 usually smaller for SVG.</div>
                          </div>
                        </label>
                      </div>
                    )}

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
                              {isSvg(active) && svgUrlEncode && format !== 'base64' && (
                                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">URL-encoded SVG</span>
                              )}
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
                              { label: 'HTML <img>', code: `<img src="${effectiveDataUrl.slice(0, 40)}..." alt="image" />`, full: `<img src="${effectiveDataUrl}" alt="image" />` },
                              { label: 'CSS background', code: `background-image: url('${effectiveDataUrl.slice(0, 30)}...');`, full: `background-image: url('${effectiveDataUrl}');` },
                              { label: 'JavaScript', code: `const imgSrc = "${effectiveDataUrl.slice(0, 30)}...";`, full: `const imgSrc = "${effectiveDataUrl}";` },
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

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free Image to Base64 Converter Online</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans Image to Base64 converter turns any image file PNG, JPG, GIF, WebP, SVG, BMP, ICO or AVIF into a Base64-encoded string that you can paste straight into your code. Instead of linking to a separate image file, a Base64 data URL embeds the whole image inside your HTML, CSS, Markdown or JSON, so the image travels with the document and needs no extra request to load.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Everything runs locally in your browser. When you add an image it is read with the FileReader API and encoded on your own device, so your pictures are never uploaded to a server. That makes the tool fast, private and safe for logos, unreleased assets, screenshots and anything confidential. There is no signup, no watermark and no limit on how many images you convert.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            You can output a raw data URL, a Base64-only string, a ready-made HTML img tag, a CSS background rule, Markdown image syntax or a JSON field and for SVG files you can switch to a smaller, human-readable URL-encoded data URI. A built-in decoder reverses the whole process, turning a Base64 string back into a downloadable image.
          </p>
        </article>

        {/* What is base64 */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What Is a Base64 Image and a Data URL?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Base64 is a way of representing binary data using only 64 plain text characters letters, digits and a couple of symbols. Because an image file is binary, encoding it as Base64 produces a long but completely text-safe string that can live inside a text document such as an HTML page, a stylesheet or a JSON payload.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            A data URL wraps that Base64 string with a small prefix that tells the browser what it is, for example <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">data:image/png;base64,</span> followed by the encoded data. Anywhere a browser accepts an image URL such as the src of an img tag or the url() of a CSS background you can use a data URL instead of a file path, and the image appears with no separate download.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The trade-off is size. Base64 uses text to represent bytes, which makes the encoded version roughly a third larger than the original file. This tool shows the exact increase for every image, so you can decide whether embedding is worth it for a given picture.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Convert an Image to Base64</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Add your images', 'Drag and drop one or more images onto the upload area, or click to browse. Each appears in the list with its size and dimensions.'],
              ['2', 'Choose an output format', 'Pick a Data URL, Base64-only string, HTML img tag, CSS background, Markdown or JSON field, depending on where you will paste the result.'],
              ['3', 'Set any options', 'Add alt text and a CSS class for the HTML img output, or a key name for JSON. For SVG files, switch on URL-encoding for a smaller result.'],
              ['4', 'Copy or download', 'Copy the output with one click, or download it as a .txt file. With several images you can download them all in one combined file.'],
              ['5', 'Use the quick snippets', 'In Data URL mode the tool also gives ready-to-paste HTML, CSS and JavaScript snippets for the selected image.'],
              ['6', 'Decode when needed', 'Switch to the Base64 to Image tab to paste a Base64 string or data URL and turn it back into a downloadable image.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Output formats explained */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Six Output Formats, One Conversion</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The same encoded image can be wrapped in whatever form your project needs. Here is when to reach for each one.
          </p>
          <div className="flex flex-col gap-3">
            {[
              ['Data URL', 'The full data:image string. Drop it into an img src, a CSS url(), or anywhere a browser expects an image address. The most versatile choice.'],
              ['Base64 only', 'Just the encoded characters with no prefix. Use it for API request bodies, database storage, or when your own code adds the data URL prefix.'],
              ['HTML img tag', 'A complete img element with your alt text and optional class, ready to paste straight into a web page.'],
              ['CSS background', 'A background-image rule with the data URL inside url(), ideal for embedding small icons and textures in a stylesheet.'],
              ['Markdown', 'Image syntax for README files, GitHub wikis and other Markdown documents, so the picture is embedded directly in the file.'],
              ['JSON field', 'A small JSON object with your chosen key, handy for config files, REST payloads and seed data.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[140px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* SVG url-encoding */}
        <article className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">A Smaller Option for SVG: URL-Encoded Data URIs</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            SVG is a text-based image format, which means it does not have to be turned into Base64 at all. Base64 encoding adds about a third to the size and turns readable markup into an opaque blob. For SVG there is a better choice: a URL-encoded data URI, where only the characters that must be escaped are percent-encoded and the rest of the markup stays as-is.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            When you load an SVG, this tool offers a URL-encode toggle. Switch it on and the output becomes a compact <span className="font-mono text-xs bg-white px-1 py-0.5 rounded">data:image/svg+xml,</span> URI that is usually smaller than the Base64 version and remains human-readable, so you can still see and tweak the shapes inside it. It works anywhere a normal data URL works in an img src or a CSS background.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            For icons and simple vector graphics this often produces noticeably leaner CSS and HTML, which is why many build tools prefer URL-encoded SVG over Base64.
          </p>
        </article>

        {/* When to use / not */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">When Should You Embed Images as Base64?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['✅ Small icons and logos', 'Tiny, frequently used graphics are great candidates. Embedding removes a network request, which can speed up the first render.'],
              ['✅ Single-file deliverables', 'When you need one self-contained HTML file, an email template, or a document with no external assets, Base64 keeps everything together.'],
              ['✅ Inline CSS sprites', 'Small background textures and UI icons embed cleanly in a stylesheet without extra files to manage.'],
              ['✅ API and config payloads', 'Sending a small image inside a JSON request or storing it in a config file is straightforward with Base64.'],
              ['❌ Large photographs', 'Big images become very long strings and bloat your HTML or CSS. Normal image files, cached by the browser, are usually faster.'],
              ['❌ Images reused across pages', 'A shared file can be cached once and reused; an embedded copy is downloaded again on every page that contains it.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-800 min-w-[190px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Privacy */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Your Images Stay on Your Device</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Many online encoders upload your files to a server to do the conversion. This one does not. The encoding and decoding both happen locally in your browser using standard web APIs, so your images are never transmitted, stored, or seen by anyone else.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            That makes it safe for brand assets, client work, screenshots containing sensitive information and anything you would rather not upload. It also means conversion is instant there is no upload wait and it keeps working even if your connection drops after the page has loaded.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is the image to Base64 converter free?', 'Yes. It is completely free with no signup and no usage limits, and every feature including batch conversion, the decoder and all output formats is available to everyone.'],
              ['Are my images uploaded to a server?', 'No. Images are read and encoded locally in your browser with the FileReader API, so they never leave your device. That makes the tool safe for private or confidential images.'],
              ['What image formats can I convert?', 'PNG, JPG/JPEG, GIF, WebP, SVG, BMP, ICO and AVIF, up to 10 MB each. You can convert several at once and download them individually or in one combined file.'],
              ['What output formats are available?', 'A raw data URL, a Base64-only string, an HTML img tag, a CSS background rule, Markdown image syntax, or a JSON field. For SVG you can also produce a smaller URL-encoded data URI.'],
              ['Can I decode Base64 back into an image?', 'Yes. Open the Base64 to Image tab, paste a Base64 string or full data URL, and the tool previews the decoded image and lets you download it with one click.'],
              ['Why is the Base64 string larger than my image file?', 'Base64 represents binary data using text characters, which adds roughly 33 percent to the size. The tool shows the exact increase for each image so you can decide whether to embed it.'],
              ['What is the difference between a data URL and a Base64 string?', 'A Base64 string is just the encoded characters. A data URL is that string with a prefix such as data:image/png;base64, that tells the browser how to interpret it, so it can be used directly as an image source.'],
              ['Why use URL-encoding for SVG instead of Base64?', 'SVG is text, so it does not need Base64. A URL-encoded data URI escapes only the necessary characters, which is usually smaller than Base64 and stays readable, while still working in img and CSS.'],
              ['Is there a size limit?', 'Each image can be up to 10 MB. Larger images produce very long strings, so for big photographs a normal image file is often the better choice.'],
              ['Does the converter work offline?', 'Yes. Once the page has loaded, both encoding and decoding run entirely in your browser, so the tool keeps working without an internet connection.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-center justify-between">
                  {q}<span className="text-orange-500 text-lg ml-3 flex-shrink-0">+</span>
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