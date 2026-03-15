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

// Read raw file bytes — zero re-encoding, pixel perfect for JPG & PNG
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
      }, 'image/png'); // PNG = lossless — best quality for fallback
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

  const convert = async () => {
    if (!images.length) { setError('Add at least one image first.'); return; }
    setConverting(true); setError(''); setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < images.length; i++) {
        const img        = images[i];
        const embedMode  = SUPPORTED[img.type]?.embed || 'canvas';
        setProgress(Math.round(((i) / images.length) * 90));

        let embeddedImg;

        if (embedMode === 'jpg') {
          // ── JPG: read raw bytes directly — no re-encoding, pixel perfect ──
          const rawBytes = await readFileBytes(img.file);
          embeddedImg    = await pdfDoc.embedJpg(rawBytes);

        } else if (embedMode === 'png') {
          // ── PNG: read raw bytes directly — preserves transparency, pixel perfect ──
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
    { name: 'Merge PDF',    href: '/tools/merge-pdf',       icon: '📑', desc: 'Combine PDFs into one'     },
    { name: 'Compress PDF', href: '/tools/compress-pdf',    icon: '🗜️', desc: 'Reduce PDF file size'      },
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
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-700">
                {images.length} image{images.length > 1 ? 's' : ''}
                <span className="font-normal text-slate-400 ml-1.5">· each becomes one PDF page</span>
              </p>
              <button
                onClick={() => { setImages([]); setDone(false); setProgress(0); }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />

                  {/* Page number */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center z-10">
                    {idx + 1}
                  </div>

                  {/* Format badge */}
                  <div className={`absolute bottom-9 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md z-10 ${typeBadge[img.ext] || typeBadge.IMG}`}>
                    {img.ext}
                  </div>

                  {/* Controls */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {idx > 0 && (
                      <button onClick={() => moveImage(img.id, -1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center shadow-sm border border-slate-100 hover:bg-red-50">←</button>
                    )}
                    {idx < images.length - 1 && (
                      <button onClick={() => moveImage(img.id, 1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center shadow-sm border border-slate-100 hover:bg-red-50">→</button>
                    )}
                    <button onClick={() => removeImage(img.id)} className="w-6 h-6 bg-red-500 text-white rounded-lg text-xs flex items-center justify-center hover:bg-red-600 shadow-sm">×</button>
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
          ) : done ? '✅ PDF Downloaded — Convert Again' : (
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

      {/* AD */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728×90
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert Images to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload Any Images',   d: 'Drop JPG, PNG, WebP, GIF, BMP or SVG files. Mix different formats freely — each image becomes one PDF page.' },
            { n: '2', icon: '⚙️', t: 'Set PDF Options',     d: 'Choose page size, orientation, margin and how each image fits the page. Reorder images using the arrow buttons.' },
            { n: '3', icon: '⬇️', t: 'Download Instantly',  d: 'Your PDF builds and downloads in seconds. JPG and PNG images embed at full quality — zero pixel degradation.' },
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

      {/* FORMAT SUPPORT TABLE */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-5 text-center">Supported Image Formats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { fmt: 'JPG / JPEG', icon: '📸', q: 'Pixel perfect',       note: 'Raw bytes embedded directly — zero quality loss' },
              { fmt: 'PNG',        icon: '🖼️', q: 'Pixel perfect',       note: 'Raw bytes embedded — transparency fully preserved' },
              { fmt: 'WebP',       icon: '🌐', q: 'Lossless PNG export', note: 'Converted to lossless PNG before embedding' },
              { fmt: 'GIF',        icon: '🎞️', q: 'Lossless PNG export', note: 'First frame extracted at full resolution' },
              { fmt: 'BMP',        icon: '🗃️', q: 'Lossless PNG export', note: 'Uncompressed bitmap converted to PNG' },
              { fmt: 'SVG',        icon: '✏️', q: 'Lossless PNG export', note: 'Vector rasterized at native viewport size' },
            ].map(f => (
              <div key={f.fmt} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                <div className="text-3xl mb-2 select-none">{f.icon}</div>
                <p className="text-xs font-extrabold text-slate-800 mb-1">{f.fmt}</p>
                <p className="text-xs text-green-600 font-semibold mb-1">{f.q}</p>
                <p className="text-xs text-slate-400 leading-tight">{f.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED TOOLS */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RELATED_TOOLS.map(t => (
            <Link
              key={t.href} href={t.href}
              className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-red-200 hover:shadow-md transition-all group"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO BLOCK */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            Free Image to PDF Converter — All Formats, Zero Quality Loss
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This image to PDF converter supports six image formats — JPG, PNG, WebP, GIF, BMP and SVG —
            and converts them to PDF entirely inside your browser using pdf-lib. No files are uploaded
            to any server. Your images stay on your device throughout the entire process.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            For JPG and PNG images, the tool reads raw file bytes directly using the FileReader API
            and embeds them into the PDF without any re-encoding. This means the image in the PDF is
            byte-for-byte identical to your original file — no compression, no quality loss, no pixel
            degradation. For{' '}
            <Link href="/tools/jpg-to-pdf" className="text-red-500 hover:underline">JPG to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/png-to-pdf" className="text-red-500 hover:underline">PNG to PDF</Link>{' '}
            conversions, you can also use the dedicated single-format tools.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            WebP, GIF, BMP and SVG files are converted to lossless PNG before embedding, since
            pdf-lib natively supports only JPG and PNG. The canvas conversion uses
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded mx-1">imageSmoothingEnabled = false</code>
            to prevent any blurring and exports as PNG — a lossless format — so quality is maintained
            as well as technically possible in the browser. You can combine images of different formats
            in a single PDF — add a JPG header image, PNG diagrams and a WebP photo and they all
            convert correctly in one pass.
          </p>
        </div>
      </section>

    </div>
  );
}