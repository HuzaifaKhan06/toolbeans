'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

// Read file as UTF-8 text
function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error('Failed to read: ' + file.name));
    reader.readAsText(file, 'UTF-8');
  });
}

// Page size CSS values for @page rule
const PAGE_SIZES = {
  A4:     { css: 'A4',                  label: 'A4 (210 × 297 mm)'    },
  A3:     { css: 'A3',                  label: 'A3 (297 × 420 mm)'    },
  Letter: { css: 'letter',              label: 'Letter (8.5 × 11 in)' },
  Legal:  { css: 'legal',               label: 'Legal (8.5 × 14 in)'  },
};

const MARGINS = {
  None:   '0',
  Narrow: '10mm',
  Normal: '20mm',
  Wide:   '30mm',
};

const ZOOM_LEVELS = ['75%', '90%', '100%', '110%', '125%'];

// Sanitize / wrap raw HTML — ensure it is a full document
function buildFullHtml(rawHtml, opts) {
  const { pageSize, orientation, margin, zoom, bgColor } = opts;
  const pageCss = orientation === 'Landscape'
    ? `${PAGE_SIZES[pageSize].css} landscape`
    : PAGE_SIZES[pageSize].css;

  const zoomNum  = parseFloat(zoom) / 100;
  const bgStyle  = bgColor ? `background:${bgColor};` : '';

  // If already a full document, inject our print styles into <head>
  const isFullDoc = /<html[\s>]/i.test(rawHtml);

  const printStyles = `
    <style id="__toolbeans_print__">
      @page {
        size: ${pageCss};
        margin: ${margin};
      }
      @media print {
        html, body {
          zoom: ${zoomNum};
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          ${bgStyle}
        }
        /* Avoid breaking inside common elements */
        img, table, figure, pre, blockquote { page-break-inside: avoid; }
        h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
      }
      @media screen {
        body {
          font-family: system-ui, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          font-size: 14px;
          line-height: 1.6;
          color: #1e293b;
          ${bgStyle}
        }
      }
    </style>
  `;

  if (isFullDoc) {
    // Inject before </head> or at top
    if (/<\/head>/i.test(rawHtml)) {
      return rawHtml.replace(/<\/head>/i, `${printStyles}</head>`);
    }
    return rawHtml.replace(/<head>/i, `<head>${printStyles}`);
  }

  // Wrap bare HTML fragment in a full document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Document</title>
  ${printStyles}
</head>
<body>
${rawHtml}
</body>
</html>`;
}

export default function HtmlToPdfTool() {
  const [html,        setHtml]        = useState('');
  const [fileName,    setFileName]    = useState('');
  const [fileSize,    setFileSize]    = useState(0);
  const [pageSize,    setPageSize]    = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [margin,      setMargin]      = useState('Normal');
  const [zoom,        setZoom]        = useState('100%');
  const [bgColor,     setBgColor]     = useState('#ffffff');
  const [activeTab,   setActiveTab]   = useState('upload'); // upload | paste
  const [previewing,  setPreviewing]  = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState('');
  const fileRef    = useRef(null);
  const iframeRef  = useRef(null);
  const dragCount  = useRef(0);

  const loadFile = async (file) => {
    setError('');
    const ok = file.type === 'text/html'
      || file.name.match(/\.(html?|htm)$/i);
    if (!ok) { setError('Please upload an HTML file (.html or .htm)'); return; }
    try {
      const content = await readFileText(file);
      setHtml(content);
      setFileName(file.name);
      setFileSize(file.size);
      setPreviewing(false);
    } catch (err) {
      setError('Could not read file: ' + err.message);
    }
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const buildDoc = () => buildFullHtml(html, {
    pageSize, orientation,
    margin:  MARGINS[margin],
    zoom,
    bgColor,
  });

  // Inject HTML into iframe and call print()
  const convertToPdf = () => {
    if (!html.trim()) { setError('Add some HTML first — upload a file or paste code.'); return; }
    setError('');

    const fullDoc = buildDoc();
    const iframe  = iframeRef.current;
    iframe.srcdoc = fullDoc;

    iframe.onload = () => {
      try {
        // Small delay so images / fonts load in iframe
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 400);
      } catch (err) {
        setError('Print failed: ' + err.message);
      }
    };
  };

  // Show live preview in iframe
  const showPreview = () => {
    if (!html.trim()) { setError('Add some HTML first.'); return; }
    setError('');
    const fullDoc = buildDoc();
    iframeRef.current.srcdoc = fullDoc;
    setPreviewing(true);
  };

  const clearAll = () => {
    setHtml(''); setFileName(''); setFileSize(0); setPreviewing(false); setError('');
  };

  const SAMPLE_HTML = `<h1>Sample Document</h1>
<p>This is a <strong>sample HTML</strong> document. Edit this or paste your own HTML.</p>
<h2>Features</h2>
<ul>
  <li>Preserves all CSS styles</li>
  <li>Supports web fonts</li>
  <li>Handles tables, images and lists</li>
  <li>Custom page size and margins</li>
</ul>
<table border="1" style="border-collapse:collapse;width:100%">
  <tr style="background:#f1f5f9">
    <th style="padding:8px">Name</th>
    <th style="padding:8px">Value</th>
  </tr>
  <tr>
    <td style="padding:8px">Page Size</td>
    <td style="padding:8px">A4</td>
  </tr>
  <tr>
    <td style="padding:8px">Orientation</td>
    <td style="padding:8px">Portrait</td>
  </tr>
</table>`;

  const RELATED_TOOLS = [
    { name: 'TXT to PDF',    href: '/tools/txt-to-pdf',    icon: '📄', desc: 'Plain text files to PDF'         },
    { name: 'SVG to PDF',    href: '/tools/svg-to-pdf',    icon: '✏️', desc: 'Vector graphics to PDF'          },
    { name: 'Image to PDF',  href: '/tools/image-to-pdf',  icon: '🗂️', desc: 'JPG, PNG, WebP and more to PDF'  },
    { name: 'JPG to PDF',    href: '/tools/jpg-to-pdf',    icon: '📸', desc: 'JPEG images to PDF'              },
    { name: 'PNG to PDF',    href: '/tools/png-to-pdf',    icon: '🖼️', desc: 'PNG with transparency to PDF'    },
    { name: 'Merge PDF',     href: '/tools/merge-pdf',     icon: '📑', desc: 'Combine multiple PDFs'           },
  ];

  const charCount = html.length;
  const lineCount = html ? html.split('\n').length : 0;

  return (
    <div className="min-h-screen bg-white">

      {/* Hidden iframe — used for printing */}
      <iframe
        ref={iframeRef}
        className="hidden"
        title="pdf-print-frame"
        sandbox="allow-same-origin allow-scripts allow-modals"
      />

      {/* HERO */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-600 font-semibold">HTML to PDF</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', 'No Upload', 'Native Browser Render', 'Live Preview'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            HTML to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert HTML files to PDF using your browser&apos;s native renderer — the most accurate
            HTML-to-PDF method available. All CSS, web fonts, tables and images are preserved
            exactly as they appear on screen. No upload, no server.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: 'Native', l: 'Browser Render'   },
              { v: '100%',   l: 'CSS Preserved'     },
              { v: '0',      l: 'Files Uploaded'    },
              { v: '∞',      l: 'File Size'         },
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
      <section className="max-w-5xl mx-auto px-6 py-10">

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0 mt-px">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* HOW IT WORKS NOTICE */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">How this tool works</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Click <strong>Convert to PDF</strong> — your browser&apos;s native print dialog opens with your HTML rendered
              as a PDF. Select <strong>&quot;Save as PDF&quot;</strong> (or &quot;Microsoft Print to PDF&quot; on Windows) as the
              destination and click Save. This method preserves all CSS, fonts and layouts perfectly — better
              than any JavaScript library can achieve.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — HTML input */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
              {['upload', 'paste'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    'px-4 py-2 text-xs font-bold rounded-lg transition-all ' +
                    (activeTab === tab
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700')
                  }
                >
                  {tab === 'upload' ? '📁 Upload File' : '✏️ Paste HTML'}
                </button>
              ))}
            </div>

            {/* Upload zone */}
            {activeTab === 'upload' && (
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onClick={() => fileRef.current?.click()}
                className={
                  'border-2 border-dashed rounded-2xl px-6 py-8 text-center cursor-pointer transition-all duration-200 ' +
                  (dragging
                    ? 'border-red-400 bg-red-50 scale-[1.005]'
                    : fileName
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30')
                }
              >
                <input
                  ref={fileRef} type="file" className="hidden"
                  accept=".html,.htm,text/html"
                  onChange={e => e.target.files[0] && loadFile(e.target.files[0])}
                />
                <div className="text-4xl mb-2 select-none">{fileName ? '✅' : '🌐'}</div>
                <p className="font-bold text-slate-700 text-sm">
                  {fileName
                    ? fileName
                    : dragging ? 'Drop HTML file here' : 'Click or drag an HTML file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {fileSize
                    ? `${(fileSize / 1024).toFixed(1)} KB · ${lineCount} lines`
                    : '.html and .htm files supported'}
                </p>
                {fileName && (
                  <button
                    onClick={e => { e.stopPropagation(); clearAll(); }}
                    className="mt-3 text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            )}

            {/* Paste / code editor */}
            {activeTab === 'paste' && (
              <div className="relative">
                <textarea
                  value={html}
                  onChange={e => { setHtml(e.target.value); setPreviewing(false); }}
                  placeholder={`Paste your HTML here…\n\nExample:\n<h1>My Document</h1>\n<p>Hello world</p>`}
                  rows={16}
                  spellCheck={false}
                  className="w-full px-4 py-3 text-xs font-mono border border-slate-200 rounded-2xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 resize-y bg-slate-50 leading-relaxed placeholder:text-slate-300"
                />
                {html && (
                  <div className="absolute bottom-3 right-3 flex gap-3 text-xs text-slate-400 bg-slate-50/90 px-2 py-1 rounded-lg pointer-events-none">
                    <span>{lineCount} lines</span>
                    <span>·</span>
                    <span>{charCount} chars</span>
                  </div>
                )}
              </div>
            )}

            {/* Load sample button */}
            {!html && (
              <button
                onClick={() => { setHtml(SAMPLE_HTML); setActiveTab('paste'); }}
                className="text-xs text-red-500 hover:text-red-600 font-semibold self-start hover:underline"
              >
                Load sample HTML →
              </button>
            )}

            {/* Live Preview */}
            {previewing && html && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-4 py-2">
                  <p className="text-xs font-bold text-slate-600">Live Preview</p>
                  <button onClick={() => setPreviewing(false)} className="text-xs text-slate-400 hover:text-red-500">✕ Close</button>
                </div>
                <iframe
                  srcDoc={buildDoc()}
                  title="HTML Preview"
                  className="w-full h-96 bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            )}

            {/* Preview button */}
            {html && !previewing && (
              <button
                onClick={showPreview}
                className="text-xs text-slate-500 hover:text-red-500 font-semibold self-start hover:underline transition-colors"
              >
                👁 Preview before converting →
              </button>
            )}
          </div>

          {/* RIGHT — Settings */}
          <div className="flex flex-col gap-4">

            {/* Page settings */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Page</p>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Page Size</label>
                <select
                  value={pageSize} onChange={e => setPageSize(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
                >
                  {Object.entries(PAGE_SIZES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Orientation</label>
                <div className="flex gap-2">
                  {['Portrait', 'Landscape'].map(o => (
                    <button
                      key={o} onClick={() => setOrientation(o)}
                      className={
                        'flex-1 py-2 text-xs font-bold rounded-xl border transition-all ' +
                        (orientation === o
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-red-200')
                      }
                    >
                      {o === 'Portrait' ? '↕' : '↔'} {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Margin</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.keys(MARGINS).map(m => (
                    <button
                      key={m} onClick={() => setMargin(m)}
                      className={
                        'py-2 text-xs font-bold rounded-xl border transition-all ' +
                        (margin === m
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-red-200')
                      }
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Typography / display settings */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Display</p>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Zoom — {zoom}</label>
                <div className="flex gap-1 flex-wrap">
                  {ZOOM_LEVELS.map(z => (
                    <button
                      key={z} onClick={() => setZoom(z)}
                      className={
                        'flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all min-w-0 ' +
                        (zoom === z
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-red-200')
                      }
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Background Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color" value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="w-10 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text" value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl outline-none focus:border-red-400 bg-white"
                  />
                  <button
                    onClick={() => setBgColor('#ffffff')}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2"
                    title="Reset to white"
                  >↺</button>
                </div>
              </div>
            </div>

            {/* Convert button */}
            <button
              onClick={convertToPdf}
              disabled={!html.trim()}
              className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-sm flex items-center justify-center gap-2"
            >
              🖨️ Convert to PDF
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Your browser print dialog will open.
              Choose <strong className="text-slate-600">&quot;Save as PDF&quot;</strong> as destination.
            </p>
          </div>
        </div>
      </section>

      {/* AD */}
      <div className="max-w-5xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728×90
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert HTML to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { n: '1', icon: '📁', t: 'Upload or Paste',    d: 'Drop an .html file or paste HTML code directly. Use the sample to test.' },
            { n: '2', icon: '⚙️', t: 'Set Page Options',   d: 'Choose page size, orientation, margin, zoom level and background color.' },
            { n: '3', icon: '🖨️', t: 'Click Convert',      d: 'Your browser print dialog opens with the HTML rendered as a print preview.' },
            { n: '4', icon: '💾', t: 'Save as PDF',         d: 'Select "Save as PDF" in the destination dropdown and click Save.' },
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
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-5 text-center">Why Use the Browser Print Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎨', t: 'Full CSS Support',       d: 'CSS Grid, Flexbox, variables, gradients, shadows — everything your browser renders on screen is preserved in the PDF.' },
              { icon: '🔤', t: 'Web Fonts Preserved',    d: 'Google Fonts, custom @font-face, system fonts — all rendered by your browser just as they appear in your web page.' },
              { icon: '📊', t: 'Tables and Images',      d: 'Complex tables, inline SVGs, background images and CSS shapes all render correctly using the native print engine.' },
              { icon: '📄', t: 'Page Break Control',     d: 'The tool injects CSS to prevent headings and images from splitting across page boundaries — cleaner output automatically.' },
              { icon: '🔒', t: 'Completely Private',     d: 'HTML is processed entirely in your browser. No upload, no server, no logs. Safe for confidential documents.' },
              { icon: '👁️', t: 'Live Preview',           d: 'Preview how your HTML will look before converting — check layout, check fonts, then convert when it looks right.' },
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
      <section className="max-w-5xl mx-auto px-6 py-10">
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
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            Free HTML to PDF Converter — Native Browser Render, No Upload
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This HTML to PDF converter uses your browser&apos;s native print engine — the same renderer
            that displays every web page you visit. Rather than parsing HTML with a JavaScript library
            (which always misses some CSS features), this tool injects print-optimized styles into
            your HTML and opens the browser print dialog with your content perfectly rendered. The
            result is a PDF that matches your HTML exactly — CSS Grid, Flexbox, web fonts, gradients,
            box shadows, inline SVG and all modern CSS features are fully supported.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            The tool supports uploading .html and .htm files or pasting HTML code directly. A live
            preview lets you check the layout before printing. Page size, orientation, margin, zoom
            level and background color are all configurable — the settings are injected as
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded mx-1">@page</code> and
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded mx-1">@media print</code>
            CSS rules so they apply automatically when you save as PDF. Your HTML never leaves
            your browser — no file is uploaded to any server.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            For other document conversions see{' '}
            <Link href="/tools/txt-to-pdf"   className="text-red-500 hover:underline">TXT to PDF</Link>,{' '}
            <Link href="/tools/svg-to-pdf"   className="text-red-500 hover:underline">SVG to PDF</Link>,{' '}
            <Link href="/tools/image-to-pdf" className="text-red-500 hover:underline">Image to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/jpg-to-pdf"   className="text-red-500 hover:underline">JPG to PDF</Link>.
          </p>
        </div>
      </section>

    </div>
  );
}