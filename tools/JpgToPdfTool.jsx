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

// Read raw file bytes directly — no re-encoding, pixel perfect
function readFileBytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
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

  const convert = async () => {
    if (images.length === 0) { setError('Add at least one image first.'); return; }
    setConverting(true);
    setError('');

    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        // Read raw bytes directly from the File object — zero re-encoding, pixel perfect
        const rawBytes = await readFileBytes(img.file);
        const isJpg    = img.file.type === 'image/jpeg' || img.file.type === 'image/jpg';
        const isPng    = img.file.type === 'image/png';

        let embeddedImg;
        if (isJpg) {
          // Embed JPG bytes as-is — no quality loss whatsoever
          embeddedImg = await pdfDoc.embedJpg(rawBytes);
        } else if (isPng) {
          // Embed PNG bytes as-is — preserves all pixels including transparency
          embeddedImg = await pdfDoc.embedPng(rawBytes);
        } else {
          // WebP / GIF / BMP — canvas fallback only for these formats
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
    { name: 'Merge PDF',       href: '/tools/merge-pdf',        icon: '📑' },
    { name: 'Compress PDF',    href: '/tools/compress-pdf',     icon: '🗜️' },
    { name: 'Image to Base64', href: '/tools/image-to-base64',  icon: '🔢' },
    { name: 'SVG → PDF',       href: '/tools/svg-to-pdf',       icon: '✏️' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
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
            Supports JPG, PNG, WebP, GIF, BMP — multiple files allowed
          </p>
        </div>

        {/* IMAGE PREVIEW LIST */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-700">
                {images.length} image{images.length > 1 ? 's' : ''} added
                <span className="font-normal text-slate-400 ml-2">
                  — each becomes one PDF page
                </span>
              </h2>
              <button
                onClick={() => { setImages([]); setDone(false); }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-28 object-cover"
                  />
                  {/* Page number badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </div>
                  {/* Controls */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* AD */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728×90
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert JPG to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', icon: '📂', title: 'Upload Images', desc: 'Click the drop zone or drag your JPG files in. Add as many as you need — each becomes one PDF page.' },
            { step: '2', icon: '⚙️', title: 'Set Options', desc: 'Choose page size (A4, Letter, Fit Image), orientation, margin and how the image fits the page.' },
            { step: '3', icon: '⬇️', title: 'Download PDF', desc: 'Click Convert and your PDF downloads instantly. Nothing is uploaded — all processing is in your browser.' },
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

      {/* SEO BLOCK */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            Free JPG to PDF Converter — No Upload Required
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            TOOLBeans JPG to PDF converter runs entirely inside your browser using pdf-lib,
            a JavaScript library that builds PDF documents client-side. Your images are never
            uploaded to any server — the entire conversion happens on your device, making this
            tool safe for private photos, sensitive documents and confidential images.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            You can convert a single JPG to PDF or combine multiple JPG images into one
            multi-page PDF document. The tool supports JPG, JPEG, PNG, WebP, GIF and BMP formats.
            Choose from A4, A3, Letter or Legal page sizes, set portrait or landscape orientation,
            control margins and decide how each image fits its page — fit to page, fill the page
            or keep the original image size.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Drag images into the panel in any order, reorder them with the arrow buttons,
            and remove any image before converting. The output is a standard PDF file compatible
            with Adobe Acrobat, Google Drive, Microsoft Edge and all PDF readers. No sign-up,
            no watermark, no file size limit, completely free.
          </p>
        </div>
      </section>

    </div>
  );
}