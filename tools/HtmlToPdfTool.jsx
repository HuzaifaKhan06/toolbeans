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

// Escape text used inside CSS content strings
const cssEscape = (s) => (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// Sanitize / wrap raw HTML ensure it is a full document
function buildFullHtml(rawHtml, opts) {
  const { pageSize, orientation, margin, zoom, bgColor,
          headerText = '', footerText = '', pageNumbers = false } = opts;
  const pageCss = orientation === 'Landscape'
    ? `${PAGE_SIZES[pageSize].css} landscape`
    : PAGE_SIZES[pageSize].css;

  const zoomNum  = parseFloat(zoom) / 100;
  const bgStyle  = bgColor ? `background:${bgColor};` : '';

  // Build @page margin-box rules for header / footer / page numbers (NEW).
  // These only emit when the user has provided content. When all are off the
  // injected block is empty, so default output is byte-for-byte unchanged.
  let mb = '';
  if (headerText) {
    mb += `\n        @top-center { content: "${cssEscape(headerText)}"; font-family: system-ui, sans-serif; font-size: 10px; color: #475569; }`;
  }
  if (footerText && pageNumbers) {
    mb += `\n        @bottom-left  { content: "${cssEscape(footerText)}"; font-family: system-ui, sans-serif; font-size: 10px; color: #475569; }`;
    mb += `\n        @bottom-right { content: "Page " counter(page) " of " counter(pages); font-family: system-ui, sans-serif; font-size: 10px; color: #475569; }`;
  } else if (footerText) {
    mb += `\n        @bottom-center { content: "${cssEscape(footerText)}"; font-family: system-ui, sans-serif; font-size: 10px; color: #475569; }`;
  } else if (pageNumbers) {
    mb += `\n        @bottom-center { content: "Page " counter(page) " of " counter(pages); font-family: system-ui, sans-serif; font-size: 10px; color: #475569; }`;
  }

  const printStyles = `
    <style id="__toolbeans_print__">
      @page {
        size: ${pageCss};
        margin: ${margin};${mb}
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

  // If already a full document, inject our print styles into <head>
  const isFullDoc = /<html[\s>]/i.test(rawHtml);

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
  // NEW: optional running header / footer / page numbers
  const [headerText,  setHeaderText]  = useState('');
  const [footerText,  setFooterText]  = useState('');
  const [pageNumbers, setPageNumbers] = useState(false);
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
    headerText, footerText, pageNumbers,
  });

  // Inject HTML into iframe and call print()
  const convertToPdf = () => {
    if (!html.trim()) { setError('Add some HTML first upload a file or paste code.'); return; }
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

  // NEW: download the print-ready HTML document
  const downloadHtml = () => {
    if (!html.trim()) { setError('Add some HTML first.'); return; }
    const blob = new Blob([buildDoc()], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = (fileName ? fileName.replace(/\.[^.]+$/, '') : 'document') + '-toolbeans.html';
    a.click();
    URL.revokeObjectURL(url);
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
    { name: 'WORD to PDF',     href: '/tools/word-to-pdf',     icon: '📑', desc: 'Convert word files to PDFs'           },
  ];

  const charCount = html.length;
  const lineCount = html ? html.split('\n').length : 0;

  return (
    <div className="min-h-screen bg-white">

      {/* Hidden iframe used for printing */}
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
            Convert HTML files to PDF using your browser&apos;s native renderer the most accurate
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
              Click <strong>Convert to PDF</strong> your browser&apos;s native print dialog opens with your HTML rendered
              as a PDF. Select <strong>&quot;Save as PDF&quot;</strong> (or &quot;Microsoft Print to PDF&quot; on Windows) as the
              destination and click Save. This method preserves all CSS, fonts and layouts perfectly better
              than any JavaScript library can achieve.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT HTML input */}
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

          {/* RIGHT Settings */}
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
                <label className="block text-xs text-slate-500 mb-1.5">Zoom {zoom}</label>
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

            {/* NEW: Header / Footer / Page numbers */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Header &amp; Footer</p>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Header text (top of every page)</label>
                <input
                  type="text" value={headerText}
                  onChange={e => { setHeaderText(e.target.value); setPreviewing(false); }}
                  placeholder="e.g. Quarterly Report"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Footer text (bottom of every page)</label>
                <input
                  type="text" value={footerText}
                  onChange={e => { setFooterText(e.target.value); setPreviewing(false); }}
                  placeholder="e.g. Confidential"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-0.5">
                <div onClick={() => { setPageNumbers(!pageNumbers); setPreviewing(false); }}
                  className={'w-9 h-5 rounded-full transition-all flex items-center px-0.5 cursor-pointer flex-shrink-0 ' + (pageNumbers ? 'bg-red-500' : 'bg-slate-200')}>
                  <div className={'w-4 h-4 bg-white rounded-full shadow-sm transition-all ' + (pageNumbers ? 'translate-x-4' : 'translate-x-0')} />
                </div>
                <span className="text-xs font-bold text-slate-600">Add page numbers</span>
              </label>
              <p className="text-xs text-slate-400 leading-relaxed">
                Repeats on every page via the print engine. Best with a Normal or Wide margin so there is room.
              </p>
            </div>

            {/* Convert button */}
            <button
              onClick={convertToPdf}
              disabled={!html.trim()}
              className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-sm flex items-center justify-center gap-2"
            >
              🖨️ Convert to PDF
            </button>

            {/* NEW: download print-ready HTML */}
            {html.trim() && (
              <button
                onClick={downloadHtml}
                className="w-full bg-white border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 font-bold py-2.5 rounded-2xl transition-all text-xs flex items-center justify-center gap-2"
              >
                ↓ Download print-ready HTML
              </button>
            )}

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Your browser print dialog will open.
              Choose <strong className="text-slate-600">&quot;Save as PDF&quot;</strong> as destination.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert HTML to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { n: '1', icon: '📁', t: 'Upload or Paste',    d: 'Drop an .html file or paste HTML code directly. Use the sample to test.' },
            { n: '2', icon: '⚙️', t: 'Set Page Options',   d: 'Choose page size, orientation, margin, zoom level, background color and optional header or footer.' },
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
              { icon: '🎨', t: 'Full CSS Support',       d: 'CSS Grid, Flexbox, variables, gradients, shadows everything your browser renders on screen is preserved in the PDF.' },
              { icon: '🔤', t: 'Web Fonts Preserved',    d: 'Google Fonts, custom @font-face, system fonts all rendered by your browser just as they appear in your web page.' },
              { icon: '📊', t: 'Tables and Images',      d: 'Complex tables, inline SVGs, background images and CSS shapes all render correctly using the native print engine.' },
              { icon: '📄', t: 'Page Break Control',     d: 'The tool injects CSS to prevent headings and images from splitting across page boundaries cleaner output automatically.' },
              { icon: '🔒', t: 'Completely Private',     d: 'HTML is processed entirely in your browser. No upload, no server, no logs. Safe for confidential documents.' },
              { icon: '👁️', t: 'Live Preview',           d: 'Preview how your HTML will look before converting check layout, check fonts, then convert when it looks right.' },
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

      {/* ════════════════════════════════════════════════ */}
      {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
      {/* ════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-16 flex flex-col gap-5">

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free HTML to PDF Converter Native Browser Render, No Upload</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans HTML to PDF converter turns HTML files and code into pixel-accurate PDF documents using your browser&apos;s own print engine the very same renderer that displays every web page you visit. Instead of re-parsing your HTML with a JavaScript library, which inevitably misinterprets some CSS, this tool injects print-optimized styles into your document and opens the native print dialog with your content rendered exactly as it appears on screen. The result is a PDF that matches your HTML faithfully, with CSS Grid, Flexbox, web fonts, gradients, box shadows and inline SVG all fully supported.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            You can either upload a .html or .htm file or paste HTML directly, and a live preview lets you check the layout before you commit. Page size, orientation, margins, zoom and background colour are all configurable, and you can now add a running header, a footer and automatic page numbers that repeat on every page. When you are happy, one click opens the print dialog where you choose Save as PDF.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Everything happens locally in your browser. Your HTML is never uploaded to a server, which makes the tool fast, private and safe for invoices, contracts, reports and any confidential document. There is no signup, no watermark and no file-size limit.
          </p>
        </article>

        {/* Why browser print */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Why the Browser Print Engine Beats JavaScript Libraries</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Most online HTML-to-PDF converters rely on a JavaScript library that reads your HTML, reinterprets the CSS, and paints the result onto a canvas or a PDF document. The problem is that these libraries are reimplementations of a browser&apos;s rendering engine, and they always lag behind. Modern CSS features such as Grid, Flexbox, custom properties, clip paths, backdrop filters and advanced font features are frequently rendered incorrectly or ignored entirely. Anyone who has tried to export a nicely styled invoice with one of these tools has seen the layout fall apart.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            This converter takes a fundamentally different approach. Because it uses the browser&apos;s own print pipeline, the rendering you get in the PDF is identical to what the browser already shows you on screen. There is no second rendering engine to disagree with the first. Whatever your browser can display, it can print, which is why this method produces the highest fidelity output available without any server-side software.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The tool also injects sensible print rules for you, such as preventing images, tables and code blocks from being split across a page break and keeping headings attached to the content that follows them. These small touches turn a raw web page into a document that reads cleanly on paper or in a PDF reader.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Convert HTML to PDF Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Add your HTML', 'Upload a .html or .htm file, or switch to the Paste tab and paste HTML code. Click Load sample HTML to try it with a ready-made document.'],
              ['2', 'Set the page options', 'Choose A4, A3, Letter or Legal, pick portrait or landscape, and set the margin. Adjust zoom and background colour if needed.'],
              ['3', 'Add a header or footer', 'Optionally enter header and footer text and switch on page numbers. These repeat automatically on every page of the PDF.'],
              ['4', 'Preview the layout', 'Click Preview before converting to see exactly how the document will look, including your page settings, before you print.'],
              ['5', 'Click Convert to PDF', 'The browser print dialog opens with your HTML rendered as a print preview. Nothing is uploaded; this all happens on your device.'],
              ['6', 'Save as PDF', 'In the destination dropdown choose Save as PDF, or Microsoft Print to PDF on Windows, then click Save to download your file.'],
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

        {/* Settings explained */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Understanding the Page Settings</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Each setting is translated into a real CSS rule and injected into your document, so it takes effect automatically when you save as PDF. Here is what each one does.
          </p>
          <div className="flex flex-col gap-3">
            {[
              ['Page size', 'Sets the paper size of the PDF through the CSS @page rule. A4 is the international standard, Letter is common in North America, and A3 or Legal suit larger documents and spreadsheets.'],
              ['Orientation', 'Portrait is taller than it is wide and suits text documents; landscape is wider and suits tables, dashboards and wide layouts. The tool appends the landscape keyword to the page size for you.'],
              ['Margin', 'Controls the white space around the content, from None for edge-to-edge designs to Wide for formal documents. Leave room when using headers, footers or page numbers so they do not overlap the content.'],
              ['Zoom', 'Scales the whole document up or down. Reduce the zoom to fit more onto each page, or increase it to enlarge small text before printing.'],
              ['Background colour', 'Forces a background colour into the print output. Browsers normally drop backgrounds when printing to save ink, so this option, combined with the exact colour adjustment rule, ensures your chosen colour appears.'],
              ['Header, footer and page numbers', 'These use CSS @page margin boxes, a print feature that places repeating content in the page margins. They are ideal for document titles, confidentiality notices and Page X of Y numbering.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[200px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Use cases */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Common Uses for HTML to PDF</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['🧾 Invoices and receipts', 'Turn an HTML invoice template into a clean, printable PDF with your styling and totals intact, ready to send to a client.'],
              ['📊 Reports and dashboards', 'Export a styled report or analytics dashboard to PDF, using landscape orientation and a footer with page numbers for a professional finish.'],
              ['📄 Documentation', 'Convert HTML documentation or a styled README into a shareable PDF for offline reading or distribution.'],
              ['✉️ Email templates', 'Save an HTML email or newsletter design as a PDF proof for review or archiving.'],
              ['🎓 Certificates and forms', 'Produce certificates, tickets or printable forms from an HTML template with precise page sizing.'],
              ['📋 Resumes and CVs', 'Convert a hand-coded HTML resume into a polished PDF that keeps your fonts and layout exactly as designed.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-800 min-w-[180px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Privacy */}
        <article className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Private and Secure by Design</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Unlike server-based converters that upload your document to be processed remotely, this tool does everything inside your browser. Your HTML is rendered in a sandboxed iframe and printed through the browser&apos;s own print API, so the content never travels across the network and is never stored anywhere.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            That makes it genuinely safe for sensitive material such as invoices with customer details, internal reports, contracts and unpublished work. Because there is no upload step, conversion is also instant and continues to work even if your connection drops after the page has loaded.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is the HTML to PDF converter free?', 'Yes. It is completely free with no signup, no watermark and no file-size limit. Every feature, including headers, footers, page numbers and all page settings, is available to everyone.'],
              ['Does it support CSS?', 'Yes, fully. Because it uses your browser\u2019s native print engine, it supports all modern CSS including Grid, Flexbox, custom properties, web fonts, gradients and shadows exactly as your browser renders them on screen.'],
              ['How do I save the PDF after clicking Convert?', 'Your browser\u2019s print dialog opens. In the Destination dropdown choose Save as PDF in Chrome or Edge, or PDF in Firefox and Safari, or Microsoft Print to PDF on Windows, then click Save.'],
              ['Are my HTML files uploaded to a server?', 'No. The HTML is rendered entirely in your browser using a sandboxed iframe and the print API. Your files never leave your device, so the tool is safe for confidential documents.'],
              ['Can I add page numbers and a header or footer?', 'Yes. Enter optional header and footer text and switch on page numbers. They are injected as CSS @page margin boxes so they repeat on every page. Use a Normal or Wide margin to leave room for them.'],
              ['Can I convert HTML that uses external CSS and images?', 'Yes. The HTML renders in an iframe using your browser, so any external resources it references, such as stylesheets, images and fonts, will load as long as they are accessible online.'],
              ['Why does my background colour disappear in the PDF?', 'Browsers drop backgrounds when printing by default to save ink. This tool sets the exact colour-adjustment rule and lets you force a background colour, so your chosen colour is preserved.'],
              ['What page sizes are supported?', 'A4, A3, Letter and Legal, in both portrait and landscape orientation, with None, Narrow, Normal or Wide margins.'],
              ['Can I download the HTML instead of printing?', 'Yes. Use Download print-ready HTML to save the fully wrapped document, including the print styles and your header or footer settings, as an .html file you can open or print later.'],
              ['Does it work on mobile?', 'Yes. You can paste or upload HTML and print to PDF from a mobile browser, although the print dialog and save options vary slightly between mobile browsers.'],
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

        {/* Closing cross-links */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-slate-500 leading-relaxed">
            For other document conversions see{' '}
            <Link href="/tools/txt-to-pdf"   className="text-red-500 hover:underline">TXT to PDF</Link>,{' '}
            <Link href="/tools/svg-to-pdf"   className="text-red-500 hover:underline">SVG to PDF</Link>,{' '}
            <Link href="/tools/image-to-pdf" className="text-red-500 hover:underline">Image to PDF</Link>,{' '}
            <Link href="/tools/word-to-pdf"  className="text-red-500 hover:underline">Word to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/jpg-to-pdf"   className="text-red-500 hover:underline">JPG to PDF</Link>.
          </p>
        </article>

      </section>

    </div>
  );
}