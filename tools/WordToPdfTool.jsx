'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const PAGE_SIZES = {
  A4:     { css: 'A4',       label: 'A4 (210 × 297 mm)'    },
  A3:     { css: 'A3',       label: 'A3 (297 × 420 mm)'    },
  Letter: { css: 'letter',   label: 'Letter (8.5 × 11 in)' },
  Legal:  { css: 'legal',    label: 'Legal (8.5 × 14 in)'  },
};

const MARGINS = {
  Narrow: '12.7mm',
  Normal: '25.4mm',
  Wide:   '38.1mm',
};

const FONT_SIZES = { Small: '11px', Normal: '13px', Large: '15px' };

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

// Build a full printable HTML document from converted content
function buildPrintDoc({ bodyHtml, pageSize, orientation, margin, fontSize, preserveColors }) {
  const pageCss = orientation === 'Landscape'
    ? `${PAGE_SIZES[pageSize].css} landscape`
    : PAGE_SIZES[pageSize].css;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Document</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    @page {
      size: ${pageCss};
      margin: ${margin};
    }

    @media print {
      html, body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none !important; }
      img   { max-width: 100%; page-break-inside: avoid; }
      table { page-break-inside: avoid; }
      h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
      tr    { page-break-inside: avoid; }
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: 'Calibri', 'Segoe UI', 'Arial', sans-serif;
      font-size: ${fontSize};
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }

    body {
      padding: 0;
    }

    /* Headings */
    h1 { font-size: 2em;   font-weight: 700; margin: 0.8em 0 0.4em; color: ${preserveColors ? 'inherit' : '#1a1a1a'}; }
    h2 { font-size: 1.5em; font-weight: 700; margin: 0.7em 0 0.35em; }
    h3 { font-size: 1.25em;font-weight: 600; margin: 0.6em 0 0.3em; }
    h4, h5, h6 { font-size: 1em; font-weight: 600; margin: 0.5em 0 0.25em; }

    /* Paragraphs */
    p { margin: 0 0 0.6em; }

    /* Lists */
    ul, ol { margin: 0.4em 0 0.6em 1.5em; padding: 0; }
    li     { margin: 0.15em 0; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.8em 0;
      font-size: 0.95em;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 6px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    tr:nth-child(even) td { background: #fafafa; }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0.5em auto;
    }

    /* Inline formatting */
    strong, b { font-weight: 700; }
    em, i     { font-style: italic; }
    u         { text-decoration: underline; }
    s         { text-decoration: line-through; }

    /* Code blocks */
    pre, code {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      background: #f8f8f8;
      border-radius: 4px;
    }
    pre  { padding: 10px 14px; overflow-x: auto; border: 1px solid #e5e7eb; margin: 0.6em 0; }
    code { padding: 1px 5px; }

    /* Blockquotes */
    blockquote {
      border-left: 3px solid #e5e7eb;
      margin: 0.6em 0;
      padding: 4px 0 4px 14px;
      color: #6b7280;
    }

    /* Horizontal rule */
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 1em 0; }

    /* Links */
    a { color: #2563eb; text-decoration: underline; }

    /* mammoth annotation messages — hide them */
    .mammoth-ignored { display: none; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

export default function WordToPdfTool() {
  const [file,        setFile]        = useState(null);
  const [html,        setHtml]        = useState('');
  const [warnings,    setWarnings]    = useState([]);
  const [pageSize,    setPageSize]    = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [margin,      setMargin]      = useState('Normal');
  const [fontSize,    setFontSize]    = useState('Normal');
  const [preserveColors, setPreserveColors] = useState(true);
  const [converting,  setConverting]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [previewing,  setPreviewing]  = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState('');
  const [mammothReady, setMammothReady] = useState(false);
  const fileRef   = useRef(null);
  const iframeRef = useRef(null);
  const dragCount = useRef(0);
  const mammothRef = useRef(null);

  // Load mammoth.js dynamically on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
    script.onload = () => {
      mammothRef.current = window.mammoth;
      setMammothReady(true);
    };
    script.onerror = () => setError('Failed to load mammoth.js. Check your internet connection.');
    document.head.appendChild(script);
    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  const processFile = async (f) => {
    setError(''); setPreviewing(false); setHtml(''); setWarnings([]);
    const isDocx = f.name.match(/\.docx$/i) || f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isDoc  = f.name.match(/\.doc$/i);

    if (isDoc && !isDocx) {
      setError('.doc (old Word 97-2003 format) is not supported in the browser. Please save your file as .docx first using Word or LibreOffice, then re-upload.');
      return;
    }
    if (!isDocx) {
      setError('Please upload a .docx file (Word 2007 or later format).');
      return;
    }
    if (!mammothRef.current) {
      setError('mammoth.js is still loading, please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setFile(f);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammothRef.current.convertToHtml(
        { arrayBuffer },
        {
          // Style mapping for common Word styles
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            "p[style-name='Title']     => h1.title:fresh",
            "p[style-name='Subtitle']  => p.subtitle:fresh",
            "p[style-name='Quote']     => blockquote:fresh",
            "p[style-name='Intense Quote'] => blockquote.intense:fresh",
            "r[style-name='Strong']    => strong",
            "r[style-name='Emphasis']  => em",
          ],
          convertImage: mammothRef.current.images.imgElement(async (image) => {
            // Embed images as base64 data URLs — no external requests
            const buffer     = await image.read('base64');
            const contentType = image.contentType || 'image/png';
            return { src: `data:${contentType};base64,${buffer}` };
          }),
        }
      );

      setHtml(result.value);
      setWarnings(result.messages.filter(m => m.type === 'warning').map(m => m.message));
      setPreviewing(true);
    } catch (err) {
      console.error(err);
      setError('Could not parse the .docx file: ' + err.message + '. Make sure the file is not password protected or corrupted.');
    } finally {
      setLoading(false);
    }
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const printToPdf = () => {
    if (!html.trim()) { setError('Upload a .docx file first.'); return; }
    setError(''); setConverting(true);

    const doc    = buildPrintDoc({
      bodyHtml: html,
      pageSize, orientation,
      margin:   MARGINS[margin],
      fontSize: FONT_SIZES[fontSize],
      preserveColors,
    });

    const iframe = iframeRef.current;
    iframe.srcdoc = doc;
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          setError('Print failed: ' + err.message);
        } finally {
          setConverting(false);
        }
      }, 500);
    };
  };

  const clearAll = () => {
    setFile(null); setHtml(''); setWarnings([]);
    setPreviewing(false); setError('');
  };

  const RELATED_TOOLS = [
    { name: 'HTML to PDF',  href: '/tools/html-to-pdf',  icon: '🌐', desc: 'Web pages and HTML to PDF'       },
    { name: 'TXT to PDF',   href: '/tools/txt-to-pdf',   icon: '📄', desc: 'Plain text files to PDF'         },
    { name: 'SVG to PDF',   href: '/tools/svg-to-pdf',   icon: '✏️', desc: 'Vector graphics to PDF'          },
    { name: 'Image to PDF', href: '/tools/image-to-pdf', icon: '🗂️', desc: 'JPG, PNG, WebP and more to PDF'  },
    { name: 'JPG to PDF',   href: '/tools/jpg-to-pdf',   icon: '📸', desc: 'JPEG images to PDF'              },
    { name: 'PNG to PDF',   href: '/tools/png-to-pdf',   icon: '🖼️', desc: 'PNG with transparency to PDF'    },
  ];

  const previewDoc = html ? buildPrintDoc({
    bodyHtml: html, pageSize, orientation,
    margin: MARGINS[margin],
    fontSize: FONT_SIZES[fontSize],
    preserveColors,
  }) : '';

  return (
    <div className="min-h-screen bg-white">

      {/* Hidden print iframe */}
      <iframe
        ref={iframeRef}
        className="hidden"
        title="word-print-frame"
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
            <span className="text-slate-600 font-semibold">Word to PDF</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', 'No Upload', '.docx Supported', 'Images Embedded'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Word to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert Word .docx files to PDF entirely in your browser. No upload, no server.
            Headings, paragraphs, tables, lists and embedded images all preserved.
            Preview before you print.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: '.docx', l: 'Format Supported'  },
              { v: '100%',  l: 'Browser-Based'     },
              { v: '0',     l: 'Files Uploaded'    },
              { v: '∞',     l: 'File Size'         },
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

        {/* mammoth loading state */}
        {!mammothReady && !error && (
          <div className="mb-5 bg-slate-50 border border-slate-200 text-slate-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <svg className="animate-spin w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading mammoth.js document parser…
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0 mt-px text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Warnings from mammoth */}
        {warnings.length > 0 && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-amber-700 mb-2">
              {warnings.length} formatting note{warnings.length > 1 ? 's' : ''} — document converted successfully
            </p>
            <ul className="space-y-1">
              {warnings.slice(0, 5).map((w, i) => (
                <li key={i} className="text-xs text-amber-600 flex items-start gap-1.5">
                  <span className="flex-shrink-0 mt-px">•</span>
                  {w}
                </li>
              ))}
              {warnings.length > 5 && (
                <li className="text-xs text-amber-500">+{warnings.length - 5} more notes</li>
              )}
            </ul>
          </div>
        )}

        {/* HOW IT WORKS NOTICE */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">How this tool works</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Your .docx is parsed by <strong>mammoth.js</strong> (runs in your browser — no upload) and converted to
              clean HTML. Then your browser&apos;s <strong>native print engine</strong> renders it to PDF.
              Click <strong>&quot;Convert to PDF&quot;</strong>, then select <strong>&quot;Save as PDF&quot;</strong> in the print dialog.
              <br /><span className="mt-1 block">⚠️ <strong>Complex formatting</strong> like exact fonts, text boxes, WordArt and custom spacing may not transfer perfectly — this is a browser limitation, not a bug.</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Upload + Preview */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Drop zone */}
            {!file ? (
              <div
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onClick={() => mammothReady && fileRef.current?.click()}
                className={
                  'border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-200 ' +
                  (!mammothReady
                    ? 'border-slate-200 opacity-50 cursor-not-allowed'
                    : dragging
                    ? 'border-red-400 bg-red-50 scale-[1.01] cursor-copy'
                    : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30 cursor-pointer')
                }
              >
                <input
                  ref={fileRef} type="file" className="hidden"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={e => e.target.files[0] && processFile(e.target.files[0])}
                />
                <div className="text-5xl mb-3 select-none">📝</div>
                <p className="font-bold text-slate-700 text-base mb-1">
                  {dragging ? 'Drop .docx file here' : 'Click or drag your Word file here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  .docx only (Word 2007 or later) · .doc not supported
                </p>
              </div>
            ) : (
              /* File loaded state */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  📝
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                </div>
                {loading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="animate-spin w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Parsing…
                  </div>
                ) : html ? (
                  <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-lg">✓ Ready</span>
                ) : null}
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Live preview */}
            {html && previewing && (
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between bg-slate-50 border-b border-slate-200 px-4 py-2.5">
                  <p className="text-xs font-bold text-slate-600">Document Preview</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Scroll to review all pages</span>
                    <button
                      onClick={() => setPreviewing(false)}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
                <iframe
                  srcDoc={previewDoc}
                  title="Word Preview"
                  className="w-full bg-white"
                  style={{ height: '500px' }}
                  sandbox="allow-same-origin"
                />
              </div>
            )}

            {html && !previewing && (
              <button
                onClick={() => setPreviewing(true)}
                className="text-xs text-slate-500 hover:text-red-500 font-semibold self-start hover:underline transition-colors"
              >
                👁 Show preview →
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
                <div className="flex gap-2">
                  {Object.keys(MARGINS).map(m => (
                    <button
                      key={m} onClick={() => setMargin(m)}
                      className={
                        'flex-1 py-2 text-xs font-bold rounded-xl border transition-all ' +
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

            {/* Typography */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Typography</p>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Base Font Size</label>
                <div className="flex gap-2">
                  {Object.keys(FONT_SIZES).map(s => (
                    <button
                      key={s} onClick={() => setFontSize(s)}
                      className={
                        'flex-1 py-2 text-xs font-bold rounded-xl border transition-all ' +
                        (fontSize === s
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-red-200')
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preserve colors toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setPreserveColors(p => !p)}
                  className={
                    'w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5 flex-shrink-0 ' +
                    (preserveColors ? 'bg-red-500' : 'bg-slate-200')
                  }
                >
                  <div className={
                    'w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ' +
                    (preserveColors ? 'translate-x-5' : 'translate-x-0')
                  } />
                </div>
                <span className="text-xs text-slate-600 font-medium">Preserve heading colors</span>
              </label>
            </div>

            {/* Convert button */}
            <button
              onClick={printToPdf}
              disabled={!html || converting || loading}
              className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-sm flex items-center justify-center gap-2"
            >
              {converting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Opening print dialog…
                </>
              ) : loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Parsing document…
                </>
              ) : '🖨️ Convert to PDF'}
            </button>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Print dialog will open — choose{' '}
              <strong className="text-slate-600">&quot;Save as PDF&quot;</strong>
            </p>

            {/* Upload another */}
            {file && (
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-red-500 hover:text-red-600 font-semibold text-center hover:underline transition-colors"
              >
                Upload a different file →
              </button>
            )}
            <input
              ref={fileRef} type="file" className="hidden"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={e => e.target.files[0] && processFile(e.target.files[0])}
            />
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
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert Word to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload .docx',       d: 'Drop your Word file in. mammoth.js parses it entirely in your browser — nothing is sent to any server.' },
            { n: '2', icon: '👁',  t: 'Preview',            d: 'A live preview shows exactly how your document will look in the PDF before you print it.' },
            { n: '3', icon: '⚙️', t: 'Adjust Settings',    d: 'Set page size, orientation, margins and font size. Changes update the preview instantly.' },
            { n: '4', icon: '💾', t: 'Save as PDF',         d: 'Click Convert, then choose "Save as PDF" in your browser\'s print dialog.' },
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

      {/* WHAT IS SUPPORTED */}
      <section className="bg-slate-50 border-y border-slate-100 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-5 text-center">What Is Supported</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">✅ Supported</p>
              <ul className="space-y-2">
                {[
                  'Headings (H1–H6) and paragraph styles',
                  'Bold, italic, underline, strikethrough',
                  'Ordered and unordered lists (nested)',
                  'Tables with borders and basic styling',
                  'Embedded images (JPEG, PNG)',
                  'Hyperlinks',
                  'Blockquotes and code blocks',
                  'Horizontal rules',
                  'Basic text colors',
                ].map(i => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>{i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">⚠️ Limited or Not Supported</p>
              <ul className="space-y-2">
                {[
                  'Exact font matching (uses web-safe fallbacks)',
                  'Custom page margins from Word',
                  'Text boxes and shapes',
                  'WordArt and SmartArt',
                  'Complex multi-column layouts',
                  'Footnotes and endnotes',
                  'Track changes and comments',
                  'Password-protected documents',
                  '.doc format (Word 97-2003)',
                ].map(i => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-amber-500 flex-shrink-0 mt-0.5">~</span>{i}
                  </li>
                ))}
              </ul>
            </div>
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
            Free Word to PDF Converter — No Upload, Browser-Based
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This Word to PDF converter uses mammoth.js — an open-source JavaScript library — to
            parse your .docx file entirely inside your browser. The file is never uploaded to any
            server. mammoth.js extracts the document content (text, headings, tables, images) and
            converts it to clean HTML, which is then rendered by your browser&apos;s native print engine
            and saved as a PDF. Your document never leaves your device.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            The converter supports .docx format (Word 2007 and later). Headings H1–H6, bold,
            italic, underline, numbered and bulleted lists, tables and embedded images are all
            preserved. A live preview lets you check the output before saving. Page size, margins,
            orientation and font size are all configurable.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            For other document conversions see{' '}
            <Link href="/tools/html-to-pdf"  className="text-red-500 hover:underline">HTML to PDF</Link>,{' '}
            <Link href="/tools/txt-to-pdf"   className="text-red-500 hover:underline">TXT to PDF</Link>,{' '}
            <Link href="/tools/svg-to-pdf"   className="text-red-500 hover:underline">SVG to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/image-to-pdf" className="text-red-500 hover:underline">Image to PDF</Link>.
          </p>
        </div>
      </section>

    </div>
  );
}