'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';

// Page size presets in points (1 inch = 72 points)
const PAGE_SIZES = {
  A4:     { w: 595.28, h: 841.89, label: 'A4' },
  A3:     { w: 841.89, h: 1190.55, label: 'A3' },
  Letter: { w: 612,    h: 792,     label: 'Letter' },
  Legal:  { w: 612,    h: 1008,    label: 'Legal' },
  'Fit Image': { w: null, h: null, label: 'Fit to Image' },
};

const ORIENTATIONS = ['Portrait', 'Landscape'];
const MARGINS = { None: 0, Small: 20, Medium: 40, Large: 60 };

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Read raw file bytes directly no re-encoding, pixel perfect
function readFileBytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// NEW: rotate an image by 90/180/270 degrees and return lossless PNG bytes.
// Only used when the user has rotated an image; the canvas output already has the
// correct (swapped for 90/270) dimensions, so downstream layout needs no change.
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
        if (!blob) return reject(new Error('Canvas conversion failed'));
        resolve(await blob.arrayBuffer());
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = dataUrl;
  });
}

export default function JpgToPdfTool() {
  const [images, setImages]               = useState([]);
  const [pageSize, setPageSize]           = useState('A4');
  const [orientation, setOrientation]     = useState('Portrait');
  const [margin, setMargin]               = useState('Small');
  const [fit, setFit]                     = useState('fit'); // fit | fill | original
  const [quality, setQuality]             = useState(90);
  const [converting, setConverting]       = useState(false);
  const [done, setDone]                   = useState(false);
  const [dragging, setDragging]           = useState(false);
  const [error, setError]                 = useState('');
  const fileRef = useRef(null);
  const dragCounter = useRef(0);

  const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

  const addFiles = (files) => {
    setError('');
    setDone(false);
    const valid = Array.from(files).filter(f => ACCEPTED.includes(f.type));
    if (valid.length === 0) { setError('Please upload JPG, PNG, WebP, GIF or BMP images.'); return; }

    const readers = valid.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        id: Math.random().toString(36).slice(2),
        file,
        name: file.name,
        size: file.size,
        url: e.target.result,
        rotation: 0,
      });
      reader.readAsDataURL(file);
    }));

    Promise.all(readers).then(results => {
      setImages(prev => [...prev, ...results]);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onDragEnter = (e) => { e.preventDefault(); dragCounter.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current === 0) setDragging(false); };

  const removeImage = (id) => setImages(prev => prev.filter(img => img.id !== id));

  const moveImage = (id, dir) => {
    setImages(prev => {
      const idx = prev.findIndex(img => img.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  // NEW: rotate a single image (90° steps) and reverse the whole page order
  const rotateImage = (id, dir) => { setDone(false); setImages(prev => prev.map(img =>
    img.id === id ? { ...img, rotation: (((img.rotation || 0) + (dir > 0 ? 90 : 270)) % 360) } : img
  )); };
  const reverseOrder = () => { setDone(false); setImages(prev => [...prev].reverse()); };

  const convert = async () => {
    if (images.length === 0) { setError('Add at least one image first.'); return; }
    setConverting(true);
    setError('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        const rotation = img.rotation || 0;
        const isJpg    = img.file.type === 'image/jpeg' || img.file.type === 'image/jpg';
        const isPng    = img.file.type === 'image/png';

        let embeddedImg;
        if (rotation !== 0) {
          // Rotated image: render rotated to canvas → lossless PNG, then embed.
          // (Unrotated images keep the pixel-perfect raw-byte path below.)
          const pngBytes = await rotateImageToPngBytes(img.url, rotation);
          embeddedImg = await pdfDoc.embedPng(pngBytes);
        } else if (isJpg) {
          // Embed JPG bytes as-is no quality loss whatsoever
          const rawBytes = await readFileBytes(img.file);
          embeddedImg = await pdfDoc.embedJpg(rawBytes);
        } else if (isPng) {
          // Embed PNG bytes as-is preserves all pixels including transparency
          const rawBytes = await readFileBytes(img.file);
          embeddedImg = await pdfDoc.embedPng(rawBytes);
        } else {
          // WebP / GIF / BMP canvas fallback only for these formats
          // pdf-lib only natively supports JPG and PNG
          const pngBytes = await new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const imgEl  = new Image();
            imgEl.onload = () => {
              canvas.width  = imgEl.naturalWidth;
              canvas.height = imgEl.naturalHeight;
              // Use 'image-rendering: pixelated' context for sharpest output
              const ctx = canvas.getContext('2d');
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(imgEl, 0, 0);
              canvas.toBlob(async (blob) => {
                if (!blob) return reject(new Error('Canvas conversion failed'));
                resolve(await blob.arrayBuffer());
              }, 'image/png'); // PNG = lossless, best quality for fallback
            };
            imgEl.onerror = () => reject(new Error('Image load failed'));
            imgEl.src = img.url;
          });
          embeddedImg = await pdfDoc.embedPng(pngBytes);
        }

        const imgDims = embeddedImg.size();
        const marginPts = MARGINS[margin];

        // Determine page dimensions
        let pgW, pgH;
        if (pageSize === 'Fit Image') {
          pgW = imgDims.width + marginPts * 2;
          pgH = imgDims.height + marginPts * 2;
        } else {
          const preset = PAGE_SIZES[pageSize];
          pgW = orientation === 'Portrait' ? preset.w : preset.h;
          pgH = orientation === 'Portrait' ? preset.h : preset.w;
        }

        const page = pdfDoc.addPage([pgW, pgH]);
        const drawW = pgW - marginPts * 2;
        const drawH = pgH - marginPts * 2;

        let drawDims;
        if (fit === 'fit') {
          drawDims = embeddedImg.scaleToFit(drawW, drawH);
        } else if (fit === 'fill') {
          const scale = Math.max(drawW / imgDims.width, drawH / imgDims.height);
          drawDims = { width: imgDims.width * scale, height: imgDims.height * scale };
        } else {
          drawDims = { width: imgDims.width, height: imgDims.height };
        }

        const x = marginPts + (drawW - drawDims.width) / 2;
        const y = marginPts + (drawH - drawDims.height) / 2;

        page.drawImage(embeddedImg, { x, y, width: drawDims.width, height: drawDims.height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = images[0].name.replace(/\.[^.]+$/, '');
      a.download = images.length === 1
        ? 'TOOLBeans-' + baseName + '.pdf'
        : 'TOOLBeans-' + baseName + '-and-more.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError('Conversion failed: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  const RELATED_TOOLS = [
    { name: 'PNG → PDF',       href: '/tools/png-to-pdf',       icon: '🖼️' },
    { name: 'Image → PDF',     href: '/tools/image-to-pdf',     icon: '📷' },
    { name: 'PDF - PNG',       href: '/tools/pdf-to-png',        icon: '📑' },
    { name: 'Data Profiler',    href: '/tools/data-profiler',     icon: '📊' },
    { name: 'Image to Base64', href: '/tools/image-to-base64',  icon: '🔢' },
    { name: 'SVG → PDF',       href: '/tools/svg-to-pdf',       icon: '✏️' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-600 font-semibold">JPG to PDF</span>
          </nav>
          <span className="inline-block bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-red-100">
            Free · No Upload · Browser Only
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            JPG to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">PDF Converter</span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto">
            Convert JPG images to PDF instantly in your browser. Multiple images, custom page sizes,
            margins and orientation. Your files never leave your device.
          </p>
        </div>
      </section>

      {/* MAIN TOOL */}
      <section className="max-w-4xl mx-auto px-6 py-10">

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* DROP ZONE */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onClick={() => fileRef.current?.click()}
          className={
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 mb-6 ' +
            (dragging
              ? 'border-red-400 bg-red-50 scale-[1.01]'
              : 'border-slate-300 hover:border-red-300 hover:bg-red-50/40')
          }
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="text-5xl mb-3 select-none">🖼️</div>
          <p className="font-bold text-slate-700 mb-1">
            {dragging ? 'Drop images here' : 'Click or drag images here'}
          </p>
          <p className="text-xs text-slate-400">
            Supports JPG, PNG, WebP, GIF, BMP multiple files allowed
          </p>
        </div>

        {/* IMAGE PREVIEW LIST */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-sm font-bold text-slate-700">
                {images.length} image{images.length > 1 ? 's' : ''} added
                <span className="font-normal text-slate-400 ml-2">
                  each becomes one PDF page
                </span>
              </h2>
              <div className="flex items-center gap-3">
                {images.length > 1 && (
                  <button
                    onClick={reverseOrder}
                    className="text-xs text-slate-500 hover:text-red-500 font-semibold transition-colors"
                    title="Reverse the page order"
                  >
                    ⇅ Reverse order
                  </button>
                )}
                <button
                  onClick={() => { setImages([]); setDone(false); }}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="w-full h-28 overflow-hidden flex items-center justify-center bg-slate-50">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-28 object-cover transition-transform duration-200"
                      style={img.rotation ? { transform: `rotate(${img.rotation}deg)` } : undefined}
                    />
                  </div>
                  {/* Page number badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                    {idx + 1}
                  </div>
                  {/* Rotation badge */}
                  {img.rotation ? (
                    <div className="absolute bottom-12 right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md z-10 bg-red-500 text-white">
                      {img.rotation}°
                    </div>
                  ) : null}
                  {/* Reorder + remove controls */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {idx > 0 && (
                      <button
                        onClick={() => moveImage(img.id, -1)}
                        className="w-6 h-6 bg-white/90 rounded-lg text-xs flex items-center justify-center hover:bg-white shadow"
                        title="Move left"
                      >←</button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        onClick={() => moveImage(img.id, 1)}
                        className="w-6 h-6 bg-white/90 rounded-lg text-xs flex items-center justify-center hover:bg-white shadow"
                        title="Move right"
                      >→</button>
                    )}
                    <button
                      onClick={() => removeImage(img.id)}
                      className="w-6 h-6 bg-red-500 text-white rounded-lg text-xs flex items-center justify-center hover:bg-red-600 shadow"
                      title="Remove"
                    >×</button>
                  </div>
                  {/* Rotate controls */}
                  <div className="absolute inset-x-0 top-14 -translate-y-1/2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => rotateImage(img.id, -1)} className="w-8 h-8 bg-white/95 rounded-lg text-sm flex items-center justify-center shadow border border-slate-100 hover:bg-red-50" title="Rotate left 90°">⟲</button>
                    <button onClick={() => rotateImage(img.id, 1)} className="w-8 h-8 bg-white/95 rounded-lg text-sm flex items-center justify-center shadow border border-slate-100 hover:bg-red-50" title="Rotate right 90°">⟳</button>
                  </div>
                  {/* File info */}
                  <div className="p-2">
                    <p className="text-xs text-slate-600 font-medium truncate">{img.name}</p>
                    <p className="text-xs text-slate-400">{formatBytes(img.size)}</p>
                  </div>
                </div>
              ))}

              {/* Add more */}
              <button
                onClick={() => fileRef.current?.click()}
                className="h-full min-h-[140px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-red-300 hover:text-red-400 transition-colors"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs font-medium">Add more</span>
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-4">PDF Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Page Size */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Page Size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
              >
                {Object.keys(PAGE_SIZES).map(s => (
                  <option key={s} value={s}>{PAGE_SIZES[s].label}</option>
                ))}
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Orientation</label>
              <div className="flex gap-2">
                {ORIENTATIONS.map(o => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    disabled={pageSize === 'Fit Image'}
                    className={
                      'flex-1 py-2 text-xs font-bold rounded-xl border transition-all ' +
                      (orientation === o && pageSize !== 'Fit Image'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-red-200 disabled:opacity-40')
                    }
                  >
                    {o === 'Portrait' ? '↕' : '↔'} {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Margin</label>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
              >
                {Object.keys(MARGINS).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Image Fit */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image Fit</label>
              <select
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
              >
                <option value="fit">Fit (keep ratio)</option>
                <option value="fill">Fill page</option>
                <option value="original">Original size</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONVERT BUTTON */}
        <button
          onClick={convert}
          disabled={converting || images.length === 0}
          className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-base flex items-center justify-center gap-3"
        >
          {converting ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Converting to PDF…
            </>
          ) : done ? (
            '✅ Downloaded! Convert Again'
          ) : (
            `📄 Convert ${images.length > 0 ? images.length + ' Image' + (images.length > 1 ? 's' : '') : ''} to PDF`
          )}
        </button>

        {done && (
          <p className="text-center text-sm text-slate-400 mt-3">
            Your PDF has been downloaded. Add more images or adjust settings to convert again.
          </p>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert JPG to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', icon: '📂', title: 'Upload Images', desc: 'Click the drop zone or drag your JPG files in. Add as many as you need each becomes one PDF page.' },
            { step: '2', icon: '⚙️', title: 'Arrange & Set Options', desc: 'Reorder or reverse pages, rotate any sideways photo in 90° steps, then choose page size, orientation, margin and fit.' },
            { step: '3', icon: '⬇️', title: 'Download PDF', desc: 'Click Convert and your PDF downloads instantly. Nothing is uploaded all processing is in your browser.' },
          ].map((s) => (
            <div key={s.step} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center text-sm font-extrabold mb-3">{s.step}</div>
              <div className="text-2xl mb-2 select-none">{s.icon}</div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RELATED TOOLS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Related PDF Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {RELATED_TOOLS.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3.5 hover:border-red-200 hover:bg-red-50/40 transition-all group"
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-red-600 transition-colors">{t.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════ */}
      {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
      {/* ════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 pb-16 flex flex-col gap-5">

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free JPG to PDF Converter No Upload Required</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans JPG to PDF converter turns one or many JPG images into a clean PDF document right inside your browser. Whether you have a single photo to send as a PDF or a stack of scanned pages that need to become one ordered file, this tool does it in a few clicks with no account, no watermark and no file-size limit. It also accepts PNG, WebP, GIF and BMP, so you can mix formats freely in the same document.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The conversion happens entirely on your device using pdf-lib, a JavaScript library that builds PDF files in the browser. Your images are read locally and assembled into a PDF that downloads straight to your device. Nothing is ever uploaded to a server, which makes the tool fast, private and safe for personal photos, financial paperwork and confidential scans.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Each image becomes one page. You can reorder pages, reverse the whole sequence, rotate any sideways photo, and choose the page size, orientation, margin and how each image fits its page before you convert.
          </p>
        </article>

        {/* Why convert jpg to pdf */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Why Convert JPG Images to PDF?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            A JPG is perfect for a single photograph, but it falls short the moment you need to share several images as one tidy unit. A PDF solves that. It bundles many pages into a single file that opens the same way on every device, prints predictably, and is the format almost every upload portal, email recipient and office system expects for documents.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Converting JPGs to a PDF is most useful when you have photographed or scanned something that is really a document: a multi-page form, a signed contract, a set of receipts, an ID and its back side, or handwritten notes. Sending ten separate JPGs is awkward and easy to get out of order. One PDF, with the pages in the right sequence, is clean and professional.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            PDFs are also more stable for archiving. Image files can be reordered, renamed or lost individually, while a single PDF keeps everything together in a fixed order that stays readable for years.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Convert JPG to PDF Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Add your JPG images', 'Click the upload area or drag your files onto it. Hold Ctrl or Cmd in the file picker to select several at once. Each image appears as a numbered thumbnail.'],
              ['2', 'Order and rotate', 'Use the arrows to move an image earlier or later, or Reverse order to flip the whole sequence. Rotate any sideways photo or scan in 90° steps so every page sits upright.'],
              ['3', 'Choose page settings', 'Pick A4, A3, Letter, Legal or Fit Image, set portrait or landscape, choose a margin, and decide whether each image fits, fills or keeps its original size.'],
              ['4', 'Convert and download', 'Click Convert to PDF. The file builds in your browser and downloads instantly, named after your first image so it is easy to find.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Quality */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Zero Quality Loss for JPG and PNG</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Quality matters when your images are documents you need to remain legible. For JPG and PNG files, this tool embeds the original image bytes directly into the PDF with no re-encoding at all. That means the picture inside the PDF is byte-for-byte identical to the file you started with there is no extra compression, no softening and no colour shift.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            WebP, GIF and BMP are not natively supported inside PDF, so for those the tool draws the image to a canvas with smoothing disabled and exports a lossless PNG before embedding. This keeps pixels sharp and avoids the blur that lower-quality converters introduce.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The only time an image is re-encoded is when you deliberately rotate it, and even then the output is a lossless PNG. Images you do not rotate always take the direct, pixel-perfect path.
          </p>
        </article>

        {/* Settings explained */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Understanding the PDF Settings</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Page size', 'A4 is the global standard and suits most documents. Letter is the North American size used by US institutions. A3 and Legal handle larger layouts. Fit Image sizes each page exactly to its image, leaving no white border.'],
              ['Orientation', 'Portrait is taller than wide and suits document pages; landscape suits wide photos. It applies to the standard page sizes, not to Fit Image, which follows each image.'],
              ['Margin', 'Adds white space around each image from none for edge-to-edge pages to large for a generous frame. Useful when the PDF will be printed or punched for a binder.'],
              ['Image fit', 'Fit keeps the whole image visible within the margins at its correct proportions. Fill scales the image to cover the page, cropping any overflow. Original size places the image at its native dimensions.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[120px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Use cases */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Common Uses for JPG to PDF</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['📋 Scanned forms and documents', 'Photograph each page of a form, then combine the JPGs into one ordered PDF for an upload portal that only accepts PDF.'],
              ['🧾 Receipts and expenses', 'Turn a month of receipt photos into a single PDF for your accountant or an expense-claim system.'],
              ['🎓 Assignments and submissions', 'Combine photos of handwritten pages or artwork into one PDF that meets a university submission requirement.'],
              ['🏠 Property and legal evidence', 'Assemble inspection or damage photos into an organised PDF that is easy to email or print.'],
              ['💼 Portfolios and proposals', 'Merge design screenshots or product photos into a clean single-document portfolio.'],
              ['🪪 ID and application photos', 'Put the front and back of a card, or several supporting photos, into one PDF for an application.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-800 min-w-[200px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Privacy */}
        <article className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Private by Design No Upload</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Many JPG to PDF sites upload your images to a server to build the file. This one does not. The whole conversion runs locally in your browser using pdf-lib, so your images are never transmitted, stored, or seen by anyone else.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            That makes it genuinely safe for sensitive material identity documents, medical and financial paperwork, contracts and personal photos. Because there is no upload step, conversion is instant and keeps working even if your connection drops after the page has loaded.
          </p>
        </article>

        {/* Tips */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Tips for a Better JPG to PDF Result</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            A few small habits make a noticeable difference in the finished PDF. Before you convert, put the pages in the right order; the number badge on each thumbnail shows exactly where that image will land in the document, and getting the sequence right now saves you re-exporting later. If you scanned the pages with your phone, check that none came out sideways and rotate any that did, so the reader does not have to turn their head or their screen.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Match the page size to the purpose. For something that will be printed or submitted to an office or institution, A4 or Letter keeps the pages a familiar size. For a photo book or a portfolio where you want the image to fill the sheet edge to edge, Fit Image removes the white border entirely. The margin setting is worth a thought too: a small or medium margin looks tidy on screen and leaves room if the document is later hole-punched for a binder.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Finally, start from the highest-resolution images you have. Because JPG and PNG are embedded without re-encoding, the sharpness of the PDF is determined entirely by the quality of the source image. A crisp original gives a crisp PDF; a small or already-compressed image cannot be made sharper by the conversion. If a page looks soft, re-photograph or re-scan it at a higher resolution and convert again.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is this JPG to PDF converter free?', 'Yes, completely free with no sign-up, no credit card, no watermark and no file-size limit. Every feature, including rotation, reordering and all page settings, is available to everyone.'],
              ['Are my images uploaded to a server?', 'No. All conversion happens inside your browser using JavaScript, so your images never leave your device. That makes it safe for private and confidential pictures.'],
              ['Can I convert multiple JPG files to one PDF?', 'Yes. Add as many images as you want and each becomes one page in the PDF. You can reorder them with the arrows or reverse the entire sequence before converting.'],
              ['Can I rotate a JPG before converting it?', 'Yes. Each thumbnail has rotate-left and rotate-right buttons that turn the image in 90 degree steps, which is ideal for sideways phone photos or scans. Rotation is applied losslessly.'],
              ['Does converting reduce image quality?', 'No. For JPG and PNG the original image bytes are embedded directly with no re-encoding, so the image in the PDF is identical to the source file. WebP, GIF and BMP use a lossless PNG conversion.'],
              ['What image formats are supported?', 'JPG, JPEG, PNG, WebP, GIF and BMP are all supported, and you can mix them in the same PDF.'],
              ['What page size should I choose?', 'A4 is the global standard and works for most documents. Letter is the North American standard. Use Fit Image if you want each page sized exactly to its image with no white border.'],
              ['Is there a limit on how many images I can add?', 'There is no enforced limit. You can add as many images as you need; very large batches simply take a little longer because the work happens on your own device.'],
              ['Why is an image cut off in the PDF?', 'That usually means Fill mode is selected, which scales the image to cover the whole page and crops any overflow. Switch to Fit to keep the entire image visible within the margins.'],
              ['Does the converter work offline?', 'Yes. Once the page has loaded, conversion runs entirely in your browser, so it keeps working even without an internet connection.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-center justify-between">
                  {q}<span className="text-red-500 text-lg ml-3 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</div>
              </details>
            ))}
          </div>
        </article>

        {/* Closing technical */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">How This JPG to PDF Tool Works</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            When you add images, the browser reads each file with the FileReader API. For JPG and PNG, the raw bytes are passed straight to pdf-lib&apos;s embedJpg and embedPng methods, so no re-encoding takes place and the result is pixel-perfect. WebP, GIF and BMP, which PDF does not natively support, are drawn to a canvas with image smoothing disabled and exported as lossless PNG before embedding.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Each image is then placed on a page sized to your chosen preset or to the image itself, scaled to fit, fill or original size, and centred within the margins. The finished PDF is assembled in memory and downloaded directly. For combining mixed formats or other image types, try the{' '}
            <a href="/tools/image-to-pdf" className="text-red-500 hover:underline">Image to PDF</a> tool, or use{' '}
            <a href="/tools/png-to-pdf" className="text-red-500 hover:underline">PNG to PDF</a> and{' '}
            <a href="/tools/pdf-to-jpg" className="text-red-500 hover:underline">PDF to JPG</a> for related conversions.
          </p>
        </article>

      </section>

    </div>
  );
}