'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import Link from 'next/link';

const PAGE_SIZES = {
  'Fit SVG':   { w: null,   h: null,    label: 'Fit to SVG (recommended)' },
  A4:          { w: 595.28, h: 841.89,  label: 'A4 (210 × 297 mm)'        },
  A3:          { w: 841.89, h: 1190.55, label: 'A3 (297 × 420 mm)'        },
  Letter:      { w: 612,    h: 792,     label: 'Letter (8.5 × 11 in)'      },
  Legal:       { w: 612,    h: 1008,    label: 'Legal (8.5 × 14 in)'       },
};

const MARGINS = { None: 0, Small: 20, Medium: 40, Large: 60 };
const SCALES  = { '0.5×': 0.5, '0.75×': 0.75, '1×': 1, '1.5×': 1.5, '2×': 2 };

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

// Read SVG file as text
function readSvgText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error('Failed to read: ' + file.name));
    reader.readAsText(file, 'UTF-8');
  });
}

// Parse viewBox / width / height from SVG string
function parseSvgDimensions(svgText) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(svgText, 'image/svg+xml');
  const svg    = doc.querySelector('svg');
  if (!svg) return { w: 800, h: 600 };

  // Try viewBox first most accurate
  const vb = svg.getAttribute('viewBox');
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/);
    if (parts.length === 4) {
      const w = parseFloat(parts[2]);
      const h = parseFloat(parts[3]);
      if (w > 0 && h > 0) return { w, h };
    }
  }

  // Fall back to width/height attributes
  const wAttr = svg.getAttribute('width');
  const hAttr = svg.getAttribute('height');
  const w = parseFloat(wAttr) || 800;
  const h = parseFloat(hAttr) || 600;
  return { w, h };
}

// Rasterize SVG to PNG ArrayBuffer at given pixel scale
// Uses an offscreen canvas imageSmoothingEnabled=false preserves crispness
function svgToPngBytes(svgText, svgW, svgH, scale) {
  return new Promise((resolve, reject) => {
    const pixelW = Math.round(svgW * scale);
    const pixelH = Math.round(svgH * scale);

    // Ensure SVG has explicit width/height so the browser renders at correct size
    const patched = svgText
      .replace(/<svg([^>]*)>/, (match, attrs) => {
        // Remove existing width/height so we can set exact values
        const clean = attrs
          .replace(/\s+width="[^"]*"/g, '')
          .replace(/\s+height="[^"]*"/g, '');
        return `<svg${clean} width="${pixelW}" height="${pixelH}">`;
      });

    const blob   = new Blob([patched], { type: 'image/svg+xml' });
    const objUrl = URL.createObjectURL(blob);
    const img    = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = pixelW;
      canvas.height = pixelH;
      const ctx = canvas.getContext('2d');
      // White background for SVGs with transparent background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pixelW, pixelH);
      ctx.imageSmoothingEnabled  = false;  // No blur crisp vector output
      ctx.drawImage(img, 0, 0, pixelW, pixelH);
      URL.revokeObjectURL(objUrl);
      canvas.toBlob(async (b) => {
        if (!b) return reject(new Error('Canvas export failed'));
        resolve(await b.arrayBuffer());
      }, 'image/png'); // PNG = lossless, perfect for vector content
    };

    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('SVG render failed file may contain unsupported features'));
    };

    img.src = objUrl;
  });
}

export default function SvgToPdfTool() {
  const [files,       setFiles]       = useState([]);   // { id, file, name, size, svgText, dims, previewUrl }
  const [pageSize,    setPageSize]    = useState('Fit SVG');
  const [orientation, setOrientation] = useState('Portrait');
  const [margin,      setMargin]      = useState('Small');
  const [scale,       setScale]       = useState('2×');  // default 2× = crisp on retina
  const [bgWhite,     setBgWhite]     = useState(true);
  const [converting,  setConverting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState('');
  const [progress,    setProgress]    = useState(0);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const loadFiles = async (fileList) => {
    setError(''); setDone(false);
    const svgFiles = Array.from(fileList).filter(f =>
      f.type === 'image/svg+xml' || f.name.toLowerCase().endsWith('.svg')
    );
    if (!svgFiles.length) {
      setError('Please upload SVG files only (.svg)');
      return;
    }

    const results = await Promise.all(svgFiles.map(async (file) => {
      const svgText   = await readSvgText(file);
      const dims      = parseSvgDimensions(svgText);
      const previewUrl = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
      return {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        svgText,
        dims,
        previewUrl,
      };
    }));

    setFiles(prev => [...prev, ...results]);
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); loadFiles(e.dataTransfer.files); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };
  const removeFile  = (id) => setFiles(p => p.filter(f => f.id !== id));
  const moveFile    = (id, dir) => setFiles(prev => {
    const idx = prev.findIndex(f => f.id === id);
    const nxt = idx + dir;
    if (nxt < 0 || nxt >= prev.length) return prev;
    const a = [...prev]; [a[idx], a[nxt]] = [a[nxt], a[idx]]; return a;
  });

  const convert = async () => {
    if (!files.length) { setError('Add at least one SVG file first.'); return; }
    setConverting(true); setError(''); setProgress(0);

    try {
      const pdfDoc    = await PDFDocument.create();
      const scaleVal  = SCALES[scale];
      const marginPts = MARGINS[margin];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setProgress(Math.round((i / files.length) * 90));

        // Rasterize SVG → lossless PNG at chosen scale
        const pngBytes = await svgToPngBytes(f.svgText, f.dims.w, f.dims.h, scaleVal);
        const embedded = await pdfDoc.embedPng(pngBytes);

        // Determine page size
        let pgW, pgH;
        if (pageSize === 'Fit SVG') {
          // Page exactly matches SVG aspect ratio no white space wasted
          pgW = f.dims.w + marginPts * 2;
          pgH = f.dims.h + marginPts * 2;
        } else {
          const preset = PAGE_SIZES[pageSize];
          pgW = orientation === 'Portrait' ? preset.w : preset.h;
          pgH = orientation === 'Portrait' ? preset.h : preset.w;
        }

        const page  = pdfDoc.addPage([pgW, pgH]);
        const drawW = pgW - marginPts * 2;
        const drawH = pgH - marginPts * 2;

        // Always fit SVG proportionally within draw area
        const s  = Math.min(drawW / f.dims.w, drawH / f.dims.h);
        const dw = f.dims.w * s;
        const dh = f.dims.h * s;

        page.drawImage(embedded, {
          x:      marginPts + (drawW - dw) / 2,
          y:      marginPts + (drawH - dh) / 2,
          width:  dw,
          height: dh,
        });
      }

      setProgress(96);
      const pdfBytes = await pdfDoc.save();
      const blob     = new Blob([pdfBytes], { type: 'application/pdf' });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      const base     = files[0].name.replace(/\.svg$/i, '');
      a.download     = files.length === 1
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
    { name: 'Image to PDF',   href: '/tools/image-to-pdf',  icon: '🗂️', desc: 'JPG, PNG, WebP, GIF, BMP to PDF' },
    { name: 'PNG to PDF',     href: '/tools/png-to-pdf',    icon: '🖼️', desc: 'PNG with transparency to PDF'    },
    { name: 'JPG to PDF',     href: '/tools/jpg-to-pdf',    icon: '📸', desc: 'JPEG images to PDF'              },
    { name: 'TXT to PDF',     href: '/tools/txt-to-pdf',    icon: '📄', desc: 'Plain text files to PDF'         },
    { name: 'HTML to PDF',    href: '/tools/html-to-pdf',   icon: '🌐', desc: 'Web pages to PDF'               },
    { name: 'Merge PDF',      href: '/tools/merge-pdf',     icon: '📑', desc: 'Combine PDFs into one'           },
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
            <span className="text-slate-600 font-semibold">SVG to PDF</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', 'No Upload', 'Vector Quality', 'Retina Scale'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            SVG to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert SVG vector graphics to PDF instantly in your browser. Choose render scale
            for crisp output up to 2× for retina-quality PDFs. Multiple SVGs combine into
            one multi-page PDF. No upload, no server, no watermark.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: 'SVG',  l: 'Vector Input'     },
              { v: '2×',   l: 'Default Scale'    },
              { v: '100%', l: 'Browser-Based'    },
              { v: '∞',    l: 'File Size Limit'  },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-extrabold text-slate-900">{s.v}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOL */}
      <section className="max-w-4xl mx-auto px-6 py-10">

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0 mt-px">⚠️</span>
            <span>{error}</span>
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
            accept=".svg,image/svg+xml"
            onChange={e => loadFiles(e.target.files)}
          />
          <div className="text-5xl mb-3 select-none">✏️</div>
          <p className="font-bold text-slate-700 text-base mb-1">
            {dragging ? 'Drop SVG files here' : 'Click or drag SVG files here'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            SVG files only (.svg) multiple files supported
          </p>
        </div>

        {/* FILE PREVIEW GRID */}
        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-700">
                {files.length} SVG{files.length > 1 ? 's' : ''}
                <span className="font-normal text-slate-400 ml-1.5">· each becomes one PDF page</span>
              </p>
              <button
                onClick={() => { setFiles([]); setDone(false); setProgress(0); }}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((f, idx) => (
                <div key={f.id} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-white">
                  {/* Checkerboard bg shows transparency */}
                  <div className="absolute inset-0 top-0 h-28" style={{
                    backgroundImage: 'repeating-conic-gradient(#f1f5f9 0% 25%, #ffffff 0% 50%)',
                    backgroundSize: '12px 12px',
                  }} />
                  <img
                    src={f.previewUrl}
                    alt={f.name}
                    className="relative w-full h-28 object-contain p-2"
                  />

                  {/* Page badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-red-500 text-white text-xs font-extrabold rounded-full flex items-center justify-center z-10">
                    {idx + 1}
                  </div>

                  {/* SVG dimensions badge */}
                  <div className="absolute bottom-9 left-1.5 bg-slate-800/70 text-white text-xs px-1.5 py-0.5 rounded-md z-10 font-mono">
                    {Math.round(f.dims.w)}×{Math.round(f.dims.h)}
                  </div>

                  {/* Controls */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {idx > 0 && (
                      <button onClick={() => moveFile(f.id, -1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center shadow-sm border border-slate-100 hover:bg-red-50">←</button>
                    )}
                    {idx < files.length - 1 && (
                      <button onClick={() => moveFile(f.id, 1)} className="w-6 h-6 bg-white/95 rounded-lg text-xs flex items-center justify-center shadow-sm border border-slate-100 hover:bg-red-50">→</button>
                    )}
                    <button onClick={() => removeFile(f.id)} className="w-6 h-6 bg-red-500 text-white rounded-lg text-xs flex items-center justify-center hover:bg-red-600 shadow-sm">×</button>
                  </div>

                  <div className="relative bg-white px-2 py-1.5 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-600 truncate">{f.name}</p>
                    <p className="text-xs text-slate-400">{formatBytes(f.size)}</p>
                  </div>
                </div>
              ))}

              {/* Add more */}
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
                    disabled={pageSize === 'Fit SVG'}
                    className={
                      'flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ' +
                      (orientation === o && pageSize !== 'Fit SVG'
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Render Scale
                <span className="ml-1 text-slate-300 font-normal normal-case">higher = sharper</span>
              </label>
              <div className="flex gap-1 flex-wrap">
                {Object.keys(SCALES).map(s => (
                  <button
                    key={s} onClick={() => setScale(s)}
                    className={
                      'flex-1 py-2 text-xs font-bold rounded-xl border transition-all min-w-0 ' +
                      (scale === s
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-red-200')
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {scale === '0.5×' && 'Smaller file, lower resolution'}
                {scale === '0.75×' && 'Compact good for small icons'}
                {scale === '1×' && 'Standard matches SVG dimensions'}
                {scale === '1.5×' && 'Sharp good for most uses'}
                {scale === '2×' && 'Retina quality recommended ✓'}
              </p>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {converting && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Rasterizing SVG{files.length > 1 ? 's' : ''}…</span>
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
          disabled={converting || !files.length}
          className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-base flex items-center justify-center gap-3"
        >
          {converting ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Rendering SVG…
            </>
          ) : done ? '✅ PDF Downloaded Convert Again' : (
            `📄 Convert ${files.length > 0 ? files.length + ' SVG' + (files.length > 1 ? 's' : '') : 'SVG'} to PDF`
          )}
        </button>

        {done && (
          <p className="text-center text-xs text-slate-400 mt-3">
            Saved as <strong className="text-slate-600">
              TOOLBeans-{files[0]?.name.replace(/\.svg$/i, '')}{files.length > 1 ? '-and-more' : ''}.pdf
            </strong>
          </p>
        )}
      </section>

      {/* AD */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert SVG to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload SVG Files',      d: 'Drop one or more .svg files. The tool reads the SVG viewBox to detect exact dimensions. Multiple SVGs become multiple PDF pages.' },
            { n: '2', icon: '⚙️', t: 'Choose Render Scale',   d: 'Select 2× for retina-quality output. Higher scale = sharper image in the PDF but larger file size. Fit SVG keeps the page exactly the same size as your SVG.' },
            { n: '3', icon: '⬇️', t: 'Download PDF',          d: 'The SVG is rasterized to lossless PNG using an HTML5 canvas, then embedded into the PDF. Downloads instantly, no server involved.' },
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
          <h2 className="text-lg font-extrabold text-slate-900 mb-5 text-center">Why Use This SVG to PDF Converter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔍', t: 'Retina-Quality Output',   d: 'Default 2× scale renders your SVG at double resolution sharp and crisp on high-DPI screens and when printed.' },
              { icon: '📐', t: 'Exact SVG Dimensions',    d: '"Fit SVG" page mode creates a PDF page that exactly matches your SVG viewBox no wasted white space, perfect proportions.' },
              { icon: '🔒', t: 'Completely Private',      d: 'SVG files are processed entirely in your browser. No upload, no server, no logs. Safe for logo files, design assets and proprietary graphics.' },
              { icon: '📏', t: 'Dimension Preview',       d: 'Each SVG card shows its detected viewBox dimensions so you know exactly what size your PDF pages will be before converting.' },
              { icon: '📦', t: 'Multi-SVG to One PDF',    d: 'Upload multiple SVGs and they all combine into one PDF one SVG per page. Reorder with arrow buttons before converting.' },
              { icon: '🎨', t: 'Transparent Background',  d: 'SVGs with transparent backgrounds are rendered on white in the PDF standard behaviour for printing and sharing.' },
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
            Free SVG to PDF Converter Vector Quality, No Upload
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This SVG to PDF converter runs entirely in your browser using pdf-lib and the browser&apos;s
            native SVG rendering engine. Your SVG files are never uploaded to any server the entire
            conversion happens on your device, making it safe for logo files, icon sets, design mockups
            and any proprietary vector graphics.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            SVG (Scalable Vector Graphics) is a vector format, meaning it contains mathematical
            paths rather than pixels. To embed an SVG into a PDF using pdf-lib (which only natively
            supports JPG and PNG), the tool rasterizes the SVG to a lossless PNG first using the
            browser&apos;s built-in SVG renderer via an HTML5 canvas. The render scale control lets you
            choose how many pixels per SVG unit to use: 2× is recommended for crisp output, especially
            for logos and diagrams that will be printed or viewed on high-DPI screens. For
            pixel-perfect image conversions see{' '}
            <Link href="/tools/image-to-pdf" className="text-red-500 hover:underline">Image to PDF</Link>,{' '}
            <Link href="/tools/png-to-pdf"   className="text-red-500 hover:underline">PNG to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/jpg-to-pdf"   className="text-red-500 hover:underline">JPG to PDF</Link>.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The tool reads the SVG viewBox to detect exact dimensions and shows them in the preview
            card so you always know what size the PDF pages will be. The &quot;Fit SVG&quot; page mode creates
            a PDF page that exactly matches your SVG dimensions no padding, no wasted white space.
            Multiple SVG files can be combined into one multi-page PDF by adding them all before
            converting. No sign-up, no watermark, no file size limit.
          </p>
        </div>
      </section>

    </div>
  );
}