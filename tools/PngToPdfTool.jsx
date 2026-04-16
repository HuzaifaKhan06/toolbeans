'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';

const PAGE_SIZES = {
  A4:          { w: 595.28,  h: 841.89,   label: 'A4 (210 × 297 mm)'  },
  A3:          { w: 841.89,  h: 1190.55,  label: 'A3 (297 × 420 mm)'  },
  Letter:      { w: 612,     h: 792,      label: 'Letter (8.5 × 11 in)' },
  Legal:       { w: 612,     h: 1008,     label: 'Legal (8.5 × 14 in)' },
  'Fit Image': { w: null,    h: null,     label: 'Fit to Image'        },
};

const MARGINS = { None: 0, Small: 20, Medium: 40, Large: 60 };

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
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

export default function PngToPdfTool() {
  const [images,      setImages]      = useState([]);
  const [pageSize,    setPageSize]    = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [margin,      setMargin]      = useState('Small');
  const [fit,         setFit]         = useState('fit');
  const [converting,  setConverting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState('');
  const fileRef    = useRef(null);
  const dragCount  = useRef(0);

  const ACCEPTED = ['image/png'];

  const addFiles = (files) => {
    setError(''); setDone(false);
    const valid = Array.from(files).filter(f => ACCEPTED.includes(f.type));
    if (!valid.length) { setError('Please upload PNG images only (.png files).'); return; }
    Promise.all(valid.map(file => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res({ id: crypto.randomUUID(), file, name: file.name, size: file.size, url: e.target.result });
      r.readAsDataURL(file);
    }))).then(results => setImages(prev => [...prev, ...results]));
  };

  const onDrop        = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); addFiles(e.dataTransfer.files); };
  const onDragEnter   = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave   = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };
  const removeImage   = (id) => setImages(p => p.filter(i => i.id !== id));
  const moveImage     = (id, dir) => setImages(prev => {
    const idx = prev.findIndex(i => i.id === id);
    const nxt = idx + dir;
    if (nxt < 0 || nxt >= prev.length) return prev;
    const a = [...prev]; [a[idx], a[nxt]] = [a[nxt], a[idx]]; return a;
  });

  const convert = async () => {
    if (!images.length) { setError('Add at least one image first.'); return; }
    setConverting(true); setError('');
    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        // Read raw PNG bytes directly from File no canvas, no re-encoding, pixel perfect
        // PNG files embed natively into pdf-lib with full transparency preserved
        const rawBytes = await readFileBytes(img.file);
        const embedded = await pdfDoc.embedPng(rawBytes);
        const imgDims  = embedded.size();
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
          const scaled = embedded.scaleToFit(drawW, drawH);
          dw = scaled.width; dh = scaled.height;
        } else if (fit === 'fill') {
          const scale = Math.max(drawW / imgDims.width, drawH / imgDims.height);
          dw = imgDims.width * scale; dh = imgDims.height * scale;
        } else {
          dw = imgDims.width; dh = imgDims.height;
        }

        page.drawImage(embedded, {
          x: marginPts + (drawW - dw) / 2,
          y: marginPts + (drawH - dh) / 2,
          width: dw, height: dh,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      const base = images[0].name.replace(/\.[^.]+$/, '');
      a.download = images.length === 1
        ? 'TOOLBeans-' + base + '.pdf'
        : 'TOOLBeans-' + base + '-and-more.pdf';
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
    { name: 'JPG to PDF',      href: '/tools/jpg-to-pdf',       icon: '📸', desc: 'Convert JPEG images to PDF'       },
    { name: 'Image to PDF',    href: '/tools/image-to-pdf',     icon: '🖼️', desc: 'Any image format to PDF'           },
    { name: 'SVG to PDF',      href: '/tools/svg-to-pdf',       icon: '✏️', desc: 'Vector graphics to PDF'            },
    { name: 'HTML to PDF',     href: '/tools/html-to-pdf',      icon: '🌐', desc: 'Web page HTML to PDF'              },
    { name: 'Merge PDF',       href: '/tools/merge-pdf',        icon: '📑', desc: 'Combine multiple PDFs'             },
    { name: 'Image to Base64', href: '/tools/image-to-base64',  icon: '🔢', desc: 'Encode images to Base64'           },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO teal/emerald palette, distinct from JPG→PDF red ── */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">

          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-red-600 transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-600 font-semibold">PNG to PDF</span>
          </nav>

          {/* Badge row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            <span className="bg-red-50 text-red-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">Free</span>
            <span className="bg-red-50 text-red-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">Transparency Preserved</span>
            <span className="bg-red-50 text-red-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">No Upload</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            PNG to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert PNG images to PDF in your browser no upload, no server, no watermark.
            Transparency is preserved. Combine multiple PNGs into one multi-page PDF.
          </p>

          {/* Key stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: '100%',  l: 'Browser-Based'       },
              { v: '0',     l: 'Files Uploaded'       },
              { v: 'PNG+',  l: 'Transparency Support' },
              { v: '∞',     l: 'Images per PDF'       },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-extrabold text-slate-900">{s.v}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOL BODY ── */}
      <section className="max-w-4xl mx-auto px-6 py-10">

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="text-lg leading-none mt-px">⚠️</span>
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
            'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 mb-6 ' +
            (dragging
              ? 'border-red-400 bg-red-50 scale-[1.01]'
              : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30')
          }
        >
          <input
            ref={fileRef} type="file" multiple className="hidden"
            accept="image/png"
            onChange={e => addFiles(e.target.files)}
          />

          {/* Checkerboard pattern to suggest transparency support */}
          <div className="absolute top-4 right-4 w-10 h-10 rounded-lg opacity-20" style={{
            backgroundImage: 'repeating-conic-gradient(#94a3b8 0% 25%, transparent 0% 50%)',
            backgroundSize: '8px 8px',
          }} />

          <div className="text-5xl mb-3 select-none">🖼️</div>
          <p className="font-bold text-slate-700 text-base mb-1">
            {dragging ? 'Drop PNG files here' : 'Click or drag PNG files here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            PNG files only (.png) transparency is preserved
          </p>
        </div>

        {/* IMAGE LIST */}
        {images.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-700">
                {images.length} image{images.length > 1 ? 's' : ''}
                <span className="font-normal text-slate-400 ml-1.5">drag to reorder or use arrows</span>
              </p>
              <button onClick={() => { setImages([]); setDone(false); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  {/* Checkerboard bg for transparency preview */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%)',
                    backgroundSize: '12px 12px',
                  }} />
                  <img src={img.url} alt={img.name} className="relative w-full h-28 object-contain p-1" />

                  {/* Page badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center z-10">
                    {idx + 1}
                  </div>

                  {/* Controls */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {idx > 0 && (
                      <button onClick={() => moveImage(img.id, -1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center hover:bg-red-50 shadow-sm border border-slate-100">←</button>
                    )}
                    {idx < images.length - 1 && (
                      <button onClick={() => moveImage(img.id, 1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center hover:bg-red-50 shadow-sm border border-slate-100">→</button>
                    )}
                    <button onClick={() => removeImage(img.id)} className="w-6 h-6 bg-red-500 text-white rounded-lg text-xs flex items-center justify-center hover:bg-red-600 shadow-sm">×</button>
                  </div>

                  {/* Info */}
                  <div className="relative bg-white px-2 py-1.5 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-600 truncate">{img.name}</p>
                    <p className="text-xs text-slate-400">{formatBytes(img.size)}</p>
                  </div>
                </div>
              ))}

              {/* Add more tile */}
              <button
                onClick={() => fileRef.current?.click()}
                className="min-h-[140px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors"
              >
                <span className="text-3xl font-light">+</span>
                <span className="text-xs font-semibold">Add more</span>
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS PANEL */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">⚙️</span>
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
              Building your PDF…
            </>
          ) : done ? '✅ PDF Downloaded Convert Again' : (
            `📄 Convert ${images.length > 0 ? images.length + ' PNG' + (images.length > 1 ? 's' : '') : 'PNG'} to PDF`
          )}
        </button>

        {done && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Saved as <strong className="text-slate-600">TOOLBeans-{images[0]?.name.replace(/\.[^.]+$/, '')}{images.length > 1 ? '-and-more' : ''}.pdf</strong>
          </p>
        )}
      </section>

      {/* AD 
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>
      */}

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert PNG to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload PNG Files',   d: 'Drop one or more PNGs into the uploader. Transparent backgrounds are shown on a checkerboard so you can see exactly what will be embedded.' },
            { n: '2', icon: '⚙️', t: 'Configure the PDF',  d: 'Pick your page size A4, Letter, or Fit Image. Set orientation, margin and whether the image fits or fills the page.' },
            { n: '3', icon: '⬇️', t: 'Download Instantly', d: 'Click Convert. Your PDF downloads in seconds. No server involved everything runs in your browser using pdf-lib.' },
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

      {/* FEATURE HIGHLIGHTS */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-6 text-center">Why Use This PNG to PDF Converter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🫥', t: 'Transparency Preserved', d: 'PNG alpha channels are fully supported. Transparent areas stay transparent no white background added unless you choose one.' },
              { icon: '🔒', t: 'Completely Private',     d: 'Your PNG files never leave your device. The pdf-lib library builds the PDF entirely inside your browser memory.' },
              { icon: '📦', t: 'Batch Convert',          d: 'Add unlimited PNG files. Each becomes one page in the output PDF, in the order you choose.' },
              { icon: '📐', t: 'Precise Page Control',   d: 'A4, A3, Letter, Legal or fit the page exactly to your image dimensions. Portrait or landscape for any page size.' },
              { icon: '🚫', t: 'No Watermark',           d: 'The output PDF is clean no TOOLBeans watermark, no branding, no timestamps hidden in the file.' },
              { icon: '⚡', t: 'Instant Conversion',     d: 'No server round-trip means no waiting. A 10-image PDF is built and downloaded in under two seconds.' },
            ].map(f => (
              <div key={f.t} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl mb-2 select-none">{f.icon}</div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{f.t}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.d}</p>
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
            Free PNG to PDF Converter Transparency Preserved, No Upload
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This PNG to PDF converter runs entirely in your browser using{' '}
            <Link href="/tools/image-to-base64" className="text-red-600 hover:underline">pdf-lib</Link>, a
            client-side JavaScript library that builds PDF documents without any server. Your PNG files
            are never uploaded all processing happens on your device, which means this tool is safe
            for screenshots containing passwords, design mockups, confidential documents and any private image.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            The key difference between PNG and JPG for PDF conversion is transparency. PNG images
            support an alpha channel meaning parts of the image can be fully or partially transparent.
            This converter preserves that transparency by reading the raw PNG file bytes directly
            and embedding them into the PDF using pdf-lib&apos;s native PNG support no canvas, no
            re-encoding, no quality loss. The result is a pixel-perfect PDF that matches your
            original PNG exactly. Also supported:{' '}
            <Link href="/tools/jpg-to-pdf" className="text-red-600 hover:underline">JPG to PDF</Link>,{' '}
            <Link href="/tools/svg-to-pdf" className="text-red-600 hover:underline">SVG to PDF</Link>{' '}
            and other image formats.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            You can convert a single PNG or combine multiple PNG images into a single multi-page PDF.
            The reorder arrows let you arrange pages before converting. Choose from A4, A3, Letter or
            Legal page sizes, set portrait or landscape orientation, control the margin around each image,
            and decide whether the image fits the page proportionally, fills the entire page, or keeps
            its original pixel dimensions. No sign-up, no watermark, no file size limit.
          </p>
        </div>
      </section>

    </div>
  );
}