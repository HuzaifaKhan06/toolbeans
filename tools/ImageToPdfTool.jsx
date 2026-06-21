'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';

const PAGE_SIZES = {
  A4:          { w: 595.28, h: 841.89,  label: 'A4 (210 × 297 mm)'   },
  A3:          { w: 841.89, h: 1190.55, label: 'A3 (297 × 420 mm)'   },
  Letter:      { w: 612,    h: 792,     label: 'Letter (8.5 × 11 in)' },
  Legal:       { w: 612,    h: 1008,    label: 'Legal (8.5 × 14 in)'  },
  'Fit Image': { w: null,   h: null,    label: 'Fit to Image'         },
};

const MARGINS = { None: 0, Small: 20, Medium: 40, Large: 60 };

const SUPPORTED = {
  'image/jpeg':    { ext: 'JPG',  embed: 'jpg' },
  'image/jpg':     { ext: 'JPG',  embed: 'jpg' },
  'image/png':     { ext: 'PNG',  embed: 'png' },
  'image/webp':    { ext: 'WebP', embed: 'canvas' },
  'image/gif':     { ext: 'GIF',  embed: 'canvas' },
  'image/bmp':     { ext: 'BMP',  embed: 'canvas' },
  'image/svg+xml': { ext: 'SVG',  embed: 'canvas' },
};

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

// Read raw file bytes zero re-encoding, pixel perfect for JPG & PNG
function readFileBytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error('Failed to read: ' + file.name));
    reader.readAsArrayBuffer(file);
  });
}

// Canvas fallback for WebP / GIF / BMP / SVG → lossless PNG bytes
// imageSmoothingEnabled = false keeps pixels sharp, no blur
function canvasToPngBytes(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error('Canvas export failed'));
        resolve(await blob.arrayBuffer());
      }, 'image/png'); // PNG = lossless best quality for fallback
    };
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = dataUrl;
  });
}

// NEW: rotate an image by 90/180/270 degrees and return lossless PNG bytes.
// Used only when the user has rotated an image; the canvas output already has
// the correct (swapped for 90/270) dimensions, so downstream layout is unchanged.
function rotateImageToPngBytes(dataUrl, deg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight;
      const canvas = document.createElement('canvas');
      if (deg === 90 || deg === 270) { canvas.width = h; canvas.height = w; }
      else { canvas.width = w; canvas.height = h; }
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error('Canvas export failed'));
        resolve(await blob.arrayBuffer());
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = dataUrl;
  });
}

export default function ImageToPdfTool() {
  const [images,      setImages]      = useState([]);
  const [pageSize,    setPageSize]    = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [margin,      setMargin]      = useState('Small');
  const [fit,         setFit]         = useState('fit');
  const [converting,  setConverting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState('');
  const [progress,    setProgress]    = useState(0);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const ACCEPTED_TYPES = Object.keys(SUPPORTED);

  const addFiles = (files) => {
    setError(''); setDone(false);
    const valid   = Array.from(files).filter(f => ACCEPTED_TYPES.includes(f.type));
    const invalid = Array.from(files).filter(f => !ACCEPTED_TYPES.includes(f.type));
    if (!valid.length) {
      setError('No supported images found. Please upload JPG, PNG, WebP, GIF, BMP or SVG files.');
      return;
    }
    if (invalid.length) {
      setError(`${invalid.length} unsupported file(s) skipped. Only image files are accepted.`);
    }
    Promise.all(valid.map(file => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res({
        id:   crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        ext:  SUPPORTED[file.type]?.ext || 'IMG',
        url:  e.target.result,
        rotation: 0,
      });
      r.readAsDataURL(file);
    }))).then(results => setImages(prev => [...prev, ...results]));
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); addFiles(e.dataTransfer.files); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };
  const removeImage = (id) => setImages(p => p.filter(i => i.id !== id));
  const moveImage   = (id, dir) => setImages(prev => {
    const idx = prev.findIndex(i => i.id === id);
    const nxt = idx + dir;
    if (nxt < 0 || nxt >= prev.length) return prev;
    const a = [...prev]; [a[idx], a[nxt]] = [a[nxt], a[idx]]; return a;
  });

  // NEW: rotate a single image (90° steps) and reverse the whole order
  const rotateImage = (id, dir) => { setDone(false); setImages(prev => prev.map(i =>
    i.id === id ? { ...i, rotation: (((i.rotation || 0) + (dir > 0 ? 90 : 270)) % 360) } : i
  )); };
  const reverseOrder = () => { setDone(false); setImages(prev => [...prev].reverse()); };

  const convert = async () => {
    if (!images.length) { setError('Add at least one image first.'); return; }
    setConverting(true); setError(''); setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const img        = images[i];
        const embedMode  = SUPPORTED[img.type]?.embed || 'canvas';
        const rotation   = img.rotation || 0;
        setProgress(Math.round(((i) / images.length) * 90));

        let embeddedImg;

        if (rotation !== 0) {
          // ── Rotated image: render rotated to canvas → lossless PNG, then embed ──
          // (Unrotated images keep the pixel-perfect raw-byte path below.)
          const pngBytes = await rotateImageToPngBytes(img.url, rotation);
          embeddedImg    = await pdfDoc.embedPng(pngBytes);

        } else if (embedMode === 'jpg') {
          // ── JPG: read raw bytes directly no re-encoding, pixel perfect ──
          const rawBytes = await readFileBytes(img.file);
          embeddedImg    = await pdfDoc.embedJpg(rawBytes);

        } else if (embedMode === 'png') {
          // ── PNG: read raw bytes directly preserves transparency, pixel perfect ──
          const rawBytes = await readFileBytes(img.file);
          embeddedImg    = await pdfDoc.embedPng(rawBytes);

        } else {
          // ── WebP / GIF / BMP / SVG: canvas → lossless PNG bytes ──
          // pdf-lib only natively embeds JPG and PNG
          // Canvas with imageSmoothingEnabled=false gives sharpest possible output
          const pngBytes = await canvasToPngBytes(img.url);
          embeddedImg    = await pdfDoc.embedPng(pngBytes);
        }

        const imgDims   = embeddedImg.size();
        const marginPts = MARGINS[margin];

        let pgW, pgH;
        if (pageSize === 'Fit Image') {
          pgW = imgDims.width  + marginPts * 2;
          pgH = imgDims.height + marginPts * 2;
        } else {
          const preset = PAGE_SIZES[pageSize];
          pgW = orientation === 'Portrait' ? preset.w : preset.h;
          pgH = orientation === 'Portrait' ? preset.h : preset.w;
        }

        const page  = pdfDoc.addPage([pgW, pgH]);
        const drawW = pgW - marginPts * 2;
        const drawH = pgH - marginPts * 2;

        let dw, dh;
        if (fit === 'fit') {
          const s = embeddedImg.scaleToFit(drawW, drawH);
          dw = s.width; dh = s.height;
        } else if (fit === 'fill') {
          const s = Math.max(drawW / imgDims.width, drawH / imgDims.height);
          dw = imgDims.width * s; dh = imgDims.height * s;
        } else {
          dw = imgDims.width; dh = imgDims.height;
        }

        page.drawImage(embeddedImg, {
          x:      marginPts + (drawW - dw) / 2,
          y:      marginPts + (drawH - dh) / 2,
          width:  dw,
          height: dh,
        });
      }

      setProgress(95);
      const pdfBytes = await pdfDoc.save();
      const blob     = new Blob([pdfBytes], { type: 'application/pdf' });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      const base     = images[0].name.replace(/\.[^.]+$/, '');
      a.download     = images.length === 1
        ? 'TOOLBeans-' + base + '.pdf'
        : 'TOOLBeans-' + base + '-and-more.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setProgress(100);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError('Conversion failed: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  const RELATED_TOOLS = [
    { name: 'JPG to PDF',   href: '/tools/jpg-to-pdf',      icon: '📸', desc: 'JPEG images to PDF'        },
    { name: 'PNG to PDF',   href: '/tools/png-to-pdf',      icon: '🖼️', desc: 'PNG with transparency'     },
    { name: 'SVG to PDF',   href: '/tools/svg-to-pdf',      icon: '✏️', desc: 'Vector graphics to PDF'    },
    { name: 'HTML to PDF',  href: '/tools/html-to-pdf',     icon: '🌐', desc: 'Web pages to PDF'          },
    { name: 'TEXT to PDF',    href: '/tools/txt-to-pdf',       icon: '📑', desc: 'Convert text files or text to pdf'     },
    { name: 'PDF to JPG', href: '/tools/pdf-to-jpg',    icon: '🗜️', desc: 'Convert PDF to jpg'      },
  ];

  // Format badge colors per type
  const typeBadge = {
    JPG:  'bg-orange-100 text-orange-700',
    PNG:  'bg-blue-100 text-blue-700',
    WebP: 'bg-purple-100 text-purple-700',
    GIF:  'bg-pink-100 text-pink-700',
    BMP:  'bg-slate-100 text-slate-600',
    SVG:  'bg-green-100 text-green-700',
    IMG:  'bg-slate-100 text-slate-600',
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">

          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Image to PDF</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', 'No Upload', 'JPG · PNG · WebP · GIF · BMP · SVG', 'Pixel Perfect'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Image to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert any image to PDF instantly in your browser. JPG, PNG, WebP, GIF, BMP and SVG
            all supported. Multiple images combine into one multi-page PDF. Zero quality loss.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: '6',     l: 'Formats Supported' },
              { v: '100%',  l: 'Browser-Based'     },
              { v: '0',     l: 'Files Uploaded'     },
              { v: '∞',     l: 'Images per PDF'    },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-extrabold text-slate-900">{s.v}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <section className="max-w-4xl mx-auto px-6 py-10">

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="text-base leading-none mt-px flex-shrink-0">⚠️</span>
            {error}
          </div>
        )}

        {/* DROP ZONE */}
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onClick={() => fileRef.current?.click()}
          className={
            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 mb-6 ' +
            (dragging
              ? 'border-red-400 bg-red-50 scale-[1.01]'
              : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30')
          }
        >
          <input
            ref={fileRef} type="file" multiple className="hidden"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
            onChange={e => addFiles(e.target.files)}
          />
          <div className="text-5xl mb-3 select-none">🗂️</div>
          <p className="font-bold text-slate-700 text-base mb-2">
            {dragging ? 'Drop images here' : 'Click or drag images here'}
          </p>
          {/* Format pills */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {['JPG', 'PNG', 'WebP', 'GIF', 'BMP', 'SVG'].map(f => (
              <span key={f} className="text-xs font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-500">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* IMAGE GRID */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-sm font-bold text-slate-700">
                {images.length} image{images.length > 1 ? 's' : ''}
                <span className="font-normal text-slate-400 ml-1.5">· each becomes one PDF page</span>
              </p>
              <div className="flex items-center gap-3">
                {images.length > 1 && (
                  <button
                    onClick={reverseOrder}
                    className="text-xs text-slate-500 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
                    title="Reverse the page order"
                  >
                    ⇅ Reverse order
                  </button>
                )}
                <button
                  onClick={() => { setImages([]); setDone(false); setProgress(0); }}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="w-full h-28 overflow-hidden flex items-center justify-center bg-slate-50">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-28 object-cover transition-transform duration-200"
                      style={img.rotation ? { transform: `rotate(${img.rotation}deg)` } : undefined}
                    />
                  </div>

                  {/* Page number */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center z-10">
                    {idx + 1}
                  </div>

                  {/* Format badge */}
                  <div className={`absolute bottom-9 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md z-10 ${typeBadge[img.ext] || typeBadge.IMG}`}>
                    {img.ext}
                  </div>

                  {/* Rotation badge */}
                  {img.rotation ? (
                    <div className="absolute bottom-9 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md z-10 bg-red-500 text-white">
                      {img.rotation}°
                    </div>
                  ) : null}

                  {/* Reorder + remove controls */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {idx > 0 && (
                      <button onClick={() => moveImage(img.id, -1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center shadow-sm border border-slate-100 hover:bg-red-50" title="Move earlier">←</button>
                    )}
                    {idx < images.length - 1 && (
                      <button onClick={() => moveImage(img.id, 1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center shadow-sm border border-slate-100 hover:bg-red-50" title="Move later">→</button>
                    )}
                    <button onClick={() => removeImage(img.id)} className="w-6 h-6 bg-red-500 text-white rounded-lg text-xs flex items-center justify-center hover:bg-red-600 shadow-sm" title="Remove">×</button>
                  </div>

                  {/* Rotate controls */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => rotateImage(img.id, -1)} className="w-8 h-8 bg-white/95 rounded-lg text-sm flex items-center justify-center shadow border border-slate-100 hover:bg-red-50" title="Rotate left 90°">⟲</button>
                    <button onClick={() => rotateImage(img.id, 1)} className="w-8 h-8 bg-white/95 rounded-lg text-sm flex items-center justify-center shadow border border-slate-100 hover:bg-red-50" title="Rotate right 90°">⟳</button>
                  </div>

                  <div className="bg-white px-2 py-1.5 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-600 truncate">{img.name}</p>
                    <p className="text-xs text-slate-400">{formatBytes(img.size)}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => fileRef.current?.click()}
                className="min-h-[140px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-red-300 hover:text-red-400 transition-colors"
              >
                <span className="text-3xl font-light">+</span>
                <span className="text-xs font-semibold">Add more</span>
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span>⚙️</span>
            <h2 className="text-sm font-bold text-slate-700">PDF Settings</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Page Size</label>
              <select
                value={pageSize} onChange={e => setPageSize(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
              >
                {Object.entries(PAGE_SIZES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Orientation</label>
              <div className="flex gap-2">
                {['Portrait', 'Landscape'].map(o => (
                  <button
                    key={o} onClick={() => setOrientation(o)}
                    disabled={pageSize === 'Fit Image'}
                    className={
                      'flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ' +
                      (orientation === o && pageSize !== 'Fit Image'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed')
                    }
                  >
                    {o === 'Portrait' ? '↕' : '↔'} {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Margin</label>
              <select
                value={margin} onChange={e => setMargin(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
              >
                {Object.keys(MARGINS).map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image Fit</label>
              <select
                value={fit} onChange={e => setFit(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
              >
                <option value="fit">Fit (keep ratio)</option>
                <option value="fill">Fill page</option>
                <option value="original">Original size</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {converting && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Converting image {Math.ceil((progress / 90) * images.length)} of {images.length}…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: progress + '%' }}
              />
            </div>
          </div>
        )}

        {/* CONVERT BUTTON */}
        <button
          onClick={convert}
          disabled={converting || !images.length}
          className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-base flex items-center justify-center gap-3"
        >
          {converting ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Converting…
            </>
          ) : done ? '✅ PDF Downloaded Convert Again' : (
            `📄 Convert ${images.length > 0 ? images.length + ' Image' + (images.length > 1 ? 's' : '') : 'Images'} to PDF`
          )}
        </button>

        {done && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Saved as <strong className="text-slate-600">
              TOOLBeans-{images[0]?.name.replace(/\.[^.]+$/, '')}{images.length > 1 ? '-and-more' : ''}.pdf
            </strong>
          </p>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">Steps to convert image to pdf</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload Any Images',   d: 'Drop JPG, PNG, WebP, GIF, BMP or SVG files. Mix different formats freely each image becomes one PDF page.' },
            { n: '2', icon: '⚙️', t: 'Arrange and Rotate',  d: 'Reorder images with the arrow buttons or reverse the whole order, and rotate any sideways scan or photo in 90° steps. Then choose page size, orientation, margin and fit.' },
            { n: '3', icon: '⬇️', t: 'Download Instantly',  d: 'Your PDF builds and downloads in seconds. JPG and PNG images embed at full quality zero pixel degradation.' },
          ].map(s => (
            <div key={s.n} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center text-sm font-extrabold mb-3">{s.n}</div>
              <div className="text-2xl mb-2 select-none">{s.icon}</div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">{s.t}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORMAT SUPPORT TABLE ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-2 text-center">
            Supported Image Formats and How They Are Converted
          </h2>
          <p className="text-sm text-slate-400 mb-6 text-center max-w-xl mx-auto">
            The way each format gets embedded into the PDF matters for quality. Here is exactly
            what happens to each file type.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { fmt: 'JPG / JPEG', icon: '📸', quality: 'Pixel perfect',       note: 'Raw bytes embedded with no re-encoding. The image in the PDF is byte-for-byte identical to the original file.' },
              { fmt: 'PNG',        icon: '🖼️', quality: 'Pixel perfect',       note: 'Raw bytes embedded directly. Full transparency preserved. No compression added.' },
              { fmt: 'WebP',       icon: '🌐', quality: 'Lossless PNG',        note: 'Rendered to canvas and exported as lossless PNG before embedding. No blurring, no quality reduction.' },
              { fmt: 'GIF',        icon: '🎞️', quality: 'Lossless PNG',        note: 'First frame extracted at full resolution and converted to lossless PNG.' },
              { fmt: 'BMP',        icon: '🗃️', quality: 'Lossless PNG',        note: 'Uncompressed bitmap pixels converted to lossless PNG for embedding.' },
              { fmt: 'SVG',        icon: '✏️', quality: 'Lossless PNG',        note: 'Vector graphic rasterized at its native viewport size then embedded as lossless PNG.' },
            ].map(f => (
              <div key={f.fmt} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                <div className="text-3xl mb-2 select-none">{f.icon}</div>
                <p className="text-xs font-extrabold text-slate-800 mb-1">{f.fmt}</p>
                <p className="text-xs text-emerald-600 font-semibold mb-2">{f.quality}</p>
                <p className="text-xs text-slate-400 leading-tight">{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* ── RELATED TOOLS ── */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Related PDF Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'JPG to PDF',         href: '/tools/jpg-to-pdf',         icon: '📸', desc: 'Dedicated JPG to PDF converter with the same zero quality loss approach.' },
            { name: 'PNG to PDF',         href: '/tools/png-to-pdf',         icon: '🖼️', desc: 'PNG to PDF with full transparency support and lossless embedding.' },
            { name: 'SVG to PDF',         href: '/tools/svg-to-pdf',         icon: '✏️', desc: 'Convert vector SVG graphics to a print-ready PDF document.' },
            { name: 'HTML to PDF',        href: '/tools/html-to-pdf',        icon: '🌐', desc: 'Convert HTML files and web pages to PDF using your browser renderer.' },
            { name: 'PDF to JPG',         href: '/tools/pdf-to-jpg',         icon: '📄', desc: 'Extract every PDF page as a high-quality JPG image. The reverse of this tool.' },
            { name: 'PDF to PNG',         href: '/tools/pdf-to-png',         icon: '🖼️', desc: 'Convert PDF pages to lossless PNG images with transparency support.' },
          ].map(t => (
            <a key={t.href} href={t.href}
              className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-red-200 hover:shadow-md transition-all group">
              <span className="text-2xl flex-shrink-0 mt-0.5">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* SEO BLOCK */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            The Problem: You Have 10 Photos and Need One PDF
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Here is a situation that happens to almost everyone at some point. You scanned a multi-page
            form using your phone camera. Now you have twelve separate JPG images and the upload portal
            only accepts a single PDF. Or you photographed six pages of a contract. Or you have a
            portfolio of design screenshots that need to go to a client as one clean document. You
            need to combine those image files into one PDF, and you need to do it without installing
            software or paying for a subscription.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This is exactly what this tool is for. Upload all your images in one go, drag to set the
            page order, rotate any that came out sideways, choose your page size and click convert. You get a single PDF with one image
            per page, downloaded directly to your device in seconds. No account, no watermark, no
            size limit and nothing ever leaves your browser.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The same tool works for combining a few photos into a PDF to email to someone,
            creating a printable photo document, building a simple portfolio PDF from screenshots,
            or archiving a collection of images in a format that stays organised and is readable
            on any device without any image viewer installed.
          </p>
        </div>
      </section>
 
      {/* ── HOW TO MAKE A PDF FROM PICTURES STEP BY STEP ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            How to Create a PDF from Multiple Images Step by Step
          </h2>
          <p className="text-sm text-slate-400 mb-7 leading-relaxed">
            Whether you are combining scanned document pages, photos or design screenshots, the
            process takes under a minute from start to finish.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                step: '01',
                title: 'Upload All Your Images at Once',
                detail: 'Click the upload area or drag your image files directly onto it. You can select multiple files at once in the file picker by holding Ctrl or Cmd while clicking. JPG, PNG, WebP, GIF, BMP and SVG files are all accepted. You can even mix formats a JPG photo alongside a PNG screenshot is perfectly fine.',
              },
              {
                step: '02',
                title: 'Set the Page Order and Rotation',
                detail: 'Each image shows up as a thumbnail with its page number. Hover any thumbnail to reveal the arrows to move it earlier or later, or use Reverse order to flip the whole sequence. The rotate buttons turn a sideways scan or photo in 90° steps, so every page sits upright. Page numbers update automatically as you reorder.',
              },
              {
                step: '03',
                title: 'Choose Your PDF Settings',
                detail: 'Select the page size that matches your need A4 is standard for most documents, Letter for US formats. Choose portrait or landscape orientation. Set the margin to give your images breathing room on the page. The "Fit Image" page size creates each page sized exactly to its image with no white space.',
              },
              {
                step: '04',
                title: 'Click Convert and Download',
                detail: 'Hit the Convert button. A progress bar tracks each image as it processes. When finished, the PDF downloads to your device automatically. The filename is based on your first image so it is easy to find. Open it in any PDF reader to confirm everything looks right.',
              },
            ].map(s => (
              <div key={s.step} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-3xl font-extrabold text-red-100 mb-2 leading-none">{s.step}</div>
                <h3 className="text-sm font-extrabold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ── REAL USE CASES ── */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">
          When People Use This Tool: Real Situations
        </h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          These are the actual scenarios where combining images into a PDF makes practical sense.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: '📋',
              title: 'Scanned Multi-Page Documents',
              desc: 'You photographed a 6-page form with your phone. You have 6 JPGs. The submission portal wants one PDF. Upload all 6, put them in page order, convert. Done in 30 seconds.',
            },
            {
              icon: '🏥',
              title: 'Medical or Insurance Documents',
              desc: 'Insurance claims, prescription photos, test results. Hospitals and insurers consistently ask for a single PDF. Combine your images without sending them through an unknown online service.',
            },
            {
              icon: '🎨',
              title: 'Design and Portfolio Submissions',
              desc: 'A freelancer applying for a project needs to submit a portfolio as one PDF. Screenshots of past work, UI designs or mockups can be combined into a clean single-document portfolio in minutes.',
            },
            {
              icon: '🏠',
              title: 'Property and Legal Photos',
              desc: 'Tenants photographing property damage for a dispute. Buyers documenting a property inspection. Each photo becomes a page in an organised PDF that can be emailed or printed as evidence.',
            },
            {
              icon: '📚',
              title: 'School and University Submissions',
              desc: 'Photographed handwritten assignment pages, lab work or art project photos. Most university submission portals require a single PDF. This tool creates it from your phone photos without any app.',
            },
            {
              icon: '🧾',
              title: 'Receipt and Expense Reports',
              desc: 'Finance teams and freelancers who photograph receipts for expense claims. Combine a month of receipt photos into one organised PDF for your accountant or expense submission system.',
            },
          ].map(uc => (
            <div key={uc.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-red-200 hover:shadow-md transition-all">
              <div className="text-3xl mb-3 select-none">{uc.icon}</div>
              <h3 className="text-sm font-extrabold text-slate-800 mb-2">{uc.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── PRIVACY SECTION ── */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-slate-900 rounded-2xl p-7 text-white">
          <h2 className="text-lg font-extrabold mb-3">Your Images Never Leave Your Device</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            This is not a promise buried in a privacy policy. It is how the tool actually works technically.
            The image to PDF conversion runs entirely inside your browser using a JavaScript library called
            pdf-lib. Your image files are read by the browser&apos;s FileReader API, processed in browser memory
            and written to a PDF file that downloads directly to your device. There is no server involved,
            no network request is made with your files and nothing is stored anywhere outside your browser.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            This matters especially for the types of documents people most commonly need to convert
            to PDF: medical records, legal documents, financial statements, personal photos and
            confidential business documents. With this tool, you are not trusting a third-party service
            with those files. You are processing them locally, the same way a desktop application would.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            {['No server upload', 'No account needed', 'No watermark added', 'No file size limit', 'Works offline after load'].map(b => (
              <span key={b} className="text-xs bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-full font-medium">
                ✓ {b}
              </span>
            ))}
          </div>
        </div>
      </section>
 
      {/* ── FAQ ── */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3">
          {[
            {
              q: 'How do I combine multiple images into one PDF file?',
              a: 'Upload all your images using the upload area at the top of this page. You can select multiple files at once. Each image will appear as a thumbnail with a page number. Use the arrows to reorder them if needed. Then click Convert to PDF. All images are combined into a single PDF with one image per page and the file downloads to your device automatically.',
            },
            {
              q: 'How do I make a PDF file with pictures from my phone?',
              a: 'Open this page in your phone browser (Chrome, Safari or any modern browser). Tap the upload area and choose your photos from your camera roll. You can select multiple photos at once. After arranging them in the right order, tap Convert to PDF. The PDF downloads to your phone. No app needs to be installed.',
            },
            {
              q: 'Can I rotate an image before adding it to the PDF?',
              a: 'Yes. Hover or tap a thumbnail and use the rotate-left and rotate-right buttons to turn it in 90° steps. This is ideal for phone photos or scans that came out sideways. The rotation is applied losslessly when the PDF is built, and unrotated images still use the original pixel-perfect raw-byte embedding.',
            },
            {
              q: 'Can I create a PDF from JPG images for free?',
              a: 'Yes. This JPG to PDF maker is completely free with no usage limits and no watermark. Upload any number of JPG or JPEG files, set the page size and orientation, and convert. The resulting PDF has no TOOLBeans watermark and the image quality is pixel perfect since JPG bytes are embedded directly.',
            },
            {
              q: 'Why do some tools add a watermark to my PDF?',
              a: 'Most online image to PDF tools add a watermark on the free tier to push users toward a paid plan. This tool has no paid plan and adds no watermark. The PDF you download is clean, with nothing added to your images.',
            },
            {
              q: 'What is the best page size to use when combining images into a PDF?',
              a: 'It depends on what the PDF is for. A4 (210 x 297 mm) is the standard globally and works for most document submissions. Letter (8.5 x 11 inches) is the North American standard used by US universities, courts and businesses. If your images are high resolution photos and you want them to fill the entire page with no white border, use Fit Image mode which sizes each page to exactly match the image dimensions.',
            },
            {
              q: 'Can I combine different image formats in the same PDF?',
              a: 'Yes. You can add a JPG photo, a PNG screenshot, a WebP image and an SVG diagram all at once and they will all be combined into a single PDF. Each format is handled separately and embedded with the highest quality available for that format.',
            },
            {
              q: 'How do I convert scanned pages to a PDF?',
              a: 'If you scanned each page as a separate image file, upload all of them to the tool. Set the page order using the arrows so the pages are in the correct sequence. Choose your preferred page size, typically A4 or Letter to match standard document sizes. Click Convert and all scanned pages are combined into one properly ordered PDF document.',
            },
            {
              q: 'Is there a limit on how many images I can add to one PDF?',
              a: 'There is no enforced limit. You can add as many images as you need. The conversion runs locally in your browser so performance depends on your device. For very large batches of high-resolution images, the conversion may take longer. The progress bar tracks each image so you can see it working.',
            },
            {
              q: 'What should I do if the image appears blurry in the PDF?',
              a: 'For JPG and PNG files, the quality is preserved perfectly because raw bytes are embedded directly. If you are seeing blur, it is likely because the original image resolution was low, not because of the conversion. For WebP, GIF, BMP and SVG files, the tool uses a lossless PNG canvas conversion. Make sure imageSmoothingEnabled is handled correctly, which this tool does automatically. If you need the highest possible quality, use JPG or PNG source files.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-red-200 transition-colors">
              <h3 className="text-sm font-bold text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── TECHNICAL SEO BLOCK ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            Free Online Image to PDF Converter How This Tool Works Technically
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This tool creates a PDF from multiple images using pdf-lib, a pure JavaScript PDF creation
            library that runs entirely in the browser. When you upload images, the browser reads each
            file using the FileReader API. For JPG and PNG files, the raw binary bytes are passed
            directly to pdf-lib&apos;s <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">embedJpg</code> and{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">embedPng</code> methods without
            any re-encoding. This is why the image quality in the resulting PDF is pixel-for-pixel
            identical to the original file.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            For WebP, GIF, BMP and SVG formats which pdf-lib does not natively support, the tool
            draws the image onto an HTML canvas element with{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">imageSmoothingEnabled</code> set
            to false to prevent any blurring, then exports it as a lossless PNG using{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">canvas.toBlob</code> with the
            PNG MIME type. The PNG bytes are then embedded into the PDF. This canvas approach is the
            highest quality method available in a browser environment for these formats.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            When you rotate an image, the same lossless canvas path is used: the picture is redrawn at a
            90, 180 or 270 degree angle and exported as a lossless PNG, so rotated pages stay sharp.
            Images you do not rotate are untouched and keep the direct raw-byte embedding described above.
            The page layout engine respects your chosen page size, orientation and margin settings.
            For the Fit Image mode, each page is sized to exactly the image dimensions plus the margin
            offset. For standard page sizes, the image is scaled using pdf-lib&apos;s{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">scaleToFit</code> method
            which preserves the aspect ratio. The Fill mode scales the image to cover the full page
            area. The Original Size mode embeds the image at its native pixel dimensions.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            If you need the reverse operation extracting images from a PDF use the{' '}
            <a href="/tools/pdf-to-jpg" className="text-red-500 hover:underline">PDF to JPG</a> or{' '}
            <a href="/tools/pdf-to-png" className="text-red-500 hover:underline">PDF to PNG</a> tools.
            For converting existing SVG files to pdf, use the{' '}
            <a href="/tools/pdf-to-svg" className="text-red-500 hover:underline">SVG TO PDF</a> tool.
            All tools on TOOLBeans are free, require no account and process files locally in your browser.
          </p>
        </div>
      </section>

    </div>
  );
}