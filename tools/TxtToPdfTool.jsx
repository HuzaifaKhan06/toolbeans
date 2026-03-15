'use client';

import { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Link from 'next/link';

const PAGE_SIZES = {
  A4:     { w: 595.28, h: 841.89,  label: 'A4 (210 × 297 mm)'    },
  A3:     { w: 841.89, h: 1190.55, label: 'A3 (297 × 420 mm)'    },
  Letter: { w: 612,    h: 792,     label: 'Letter (8.5 × 11 in)'  },
  Legal:  { w: 612,    h: 1008,    label: 'Legal (8.5 × 14 in)'   },
};

const FONT_SIZES  = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24];
const MARGINS_PT  = { Narrow: 36, Normal: 54, Wide: 72 };
const LINE_HEIGHTS = { Compact: 1.2, Normal: 1.5, Relaxed: 1.8 };

const FONT_OPTIONS = {
  Courier:       StandardFonts.Courier,
  'Courier Bold': StandardFonts.CourierBold,
  Helvetica:     StandardFonts.Helvetica,
  'Times Roman': StandardFonts.TimesRoman,
};

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

// Read text file as UTF-8 string
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = ()  => reject(new Error('Failed to read: ' + file.name));
    reader.readAsText(file, 'UTF-8');
  });
}

// Sanitize text — replace characters pdf-lib's WinAnsi can't handle
function sanitizeText(str) {
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ')
    // Replace common Unicode chars with ASCII equivalents
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    // Remove chars outside WinAnsi range (0-255)
    .replace(/[^\x00-\xFF]/g, '?');
}

// Wrap a single line to fit within maxWidth points
function wrapLine(text, font, fontSize, maxWidth) {
  if (!text.trim()) return [''];
  const words  = text.split(' ');
  const lines  = [];
  let current  = '';

  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    const w    = font.widthOfTextAtSize(test, fontSize);
    if (w > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function TxtToPdfTool() {
  const [text,        setText]        = useState('');
  const [fileName,    setFileName]    = useState('');
  const [fileSize,    setFileSize]    = useState(0);
  const [pageSize,    setPageSize]    = useState('A4');
  const [orientation, setOrientation] = useState('Portrait');
  const [fontSize,    setFontSize]    = useState(11);
  const [fontName,    setFontName]    = useState('Courier');
  const [marginKey,   setMarginKey]   = useState('Normal');
  const [lineHeight,  setLineHeight]  = useState('Normal');
  const [showLineNos, setShowLineNos] = useState(false);
  const [title,       setTitle]       = useState('');
  const [converting,  setConverting]  = useState(false);
  const [done,        setDone]        = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [error,       setError]       = useState('');
  const [stats,       setStats]       = useState(null);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const ACCEPTED = ['text/plain', 'text/csv', 'text/markdown', 'text/html', ''];

  const loadFile = async (file) => {
    setError(''); setDone(false);
    const isText = file.type.startsWith('text/') || file.name.match(/\.(txt|csv|md|log|ini|cfg|xml|json|js|ts|py|rb|sh|bat|env|gitignore|yaml|yml)$/i);
    if (!isText) { setError('Please upload a text file (.txt, .csv, .md, .log, .json, .xml etc.)'); return; }
    try {
      const content = await readTextFile(file);
      setText(content);
      setFileName(file.name);
      setFileSize(file.size);
      setTitle(file.name.replace(/\.[^.]+$/, ''));
      const lines = content.split('\n');
      setStats({
        lines: lines.length,
        words: content.trim().split(/\s+/).filter(Boolean).length,
        chars: content.length,
      });
    } catch (err) {
      setError('Could not read file: ' + err.message);
    }
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const convert = async () => {
    const content = text.trim();
    if (!content) { setError('Add some text or upload a .txt file first.'); return; }
    setConverting(true); setError('');

    try {
      const pdfDoc   = await PDFDocument.create();
      const font     = await pdfDoc.embedFont(FONT_OPTIONS[fontName]);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const preset   = PAGE_SIZES[pageSize];
      const pgW      = orientation === 'Portrait' ? preset.w : preset.h;
      const pgH      = orientation === 'Portrait' ? preset.h : preset.w;
      const marginPt = MARGINS_PT[marginKey];
      const lhFactor = LINE_HEIGHTS[lineHeight];
      const lineH    = fontSize * lhFactor;
      const maxW     = pgW - marginPt * 2;
      const maxH     = pgH - marginPt * 2;

      // Sanitize and wrap all lines
      const raw      = sanitizeText(content);
      const rawLines = raw.split('\n');

      // Build wrapped line list with optional line numbers
      const allLines = [];
      rawLines.forEach((rawLine, idx) => {
        const prefix   = showLineNos ? String(idx + 1).padStart(4, ' ') + '  ' : '';
        const fullLine = prefix + rawLine;
        const wrapped  = wrapLine(fullLine, font, fontSize, maxW);
        wrapped.forEach(w => allLines.push(w));
      });

      // Paginate
      const linesPerPage = Math.floor(maxH / lineH);
      let pageIdx = 0;
      let page    = pdfDoc.addPage([pgW, pgH]);

      // Optional title header on first page
      if (title.trim()) {
        const titleFontSize = Math.min(fontSize + 4, 18);
        const titleY        = pgH - marginPt + 10;
        page.drawText(sanitizeText(title.trim()), {
          x:    marginPt,
          y:    titleY,
          size: titleFontSize,
          font: boldFont,
          color: rgb(0.18, 0.18, 0.18),
        });
        // Thin rule under title
        page.drawLine({
          start: { x: marginPt,      y: titleY - titleFontSize - 4 },
          end:   { x: pgW - marginPt, y: titleY - titleFontSize - 4 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      }

      allLines.forEach((line, i) => {
        const localIdx = i % linesPerPage;

        // New page when needed
        if (i > 0 && localIdx === 0) {
          pageIdx++;
          page = pdfDoc.addPage([pgW, pgH]);
        }

        const y = pgH - marginPt - (localIdx * lineH) - lineH;

        if (line.trim()) {
          page.drawText(line, {
            x:     marginPt,
            y,
            size:  fontSize,
            font,
            color: rgb(0.12, 0.12, 0.12),
          });
        }
      });

      // Page numbers at bottom
      const totalPages = pdfDoc.getPageCount();
      if (totalPages > 1) {
        pdfDoc.getPages().forEach((pg, i) => {
          pg.drawText(`${i + 1} / ${totalPages}`, {
            x:    pgW / 2 - 15,
            y:    marginPt / 2,
            size: 8,
            font,
            color: rgb(0.6, 0.6, 0.6),
          });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob     = new Blob([pdfBytes], { type: 'application/pdf' });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      const base     = (fileName || 'document').replace(/\.[^.]+$/, '');
      a.download     = 'TOOLBeans-' + base + '.pdf';
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

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = text ? text.split('\n').length : 0;
  const charCount = text.length;

  const RELATED_TOOLS = [
    { name: 'HTML to PDF',    href: '/tools/html-to-pdf',     icon: '🌐', desc: 'Web pages to PDF'          },
    { name: 'SVG to PDF',     href: '/tools/svg-to-pdf',      icon: '✏️', desc: 'Vector graphics to PDF'    },
    { name: 'Image to PDF',   href: '/tools/image-to-pdf',    icon: '🗂️', desc: 'Any image format to PDF'   },
    { name: 'JPG to PDF',     href: '/tools/jpg-to-pdf',      icon: '📸', desc: 'JPEG images to PDF'        },
    { name: 'PNG to PDF',     href: '/tools/png-to-pdf',      icon: '🖼️', desc: 'PNG with transparency'     },
    { name: 'Word Counter',   href: '/tools/word-counter',    icon: '📝', desc: 'Count words and characters' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link>
            <span>/</span>
            <span className="text-slate-600 font-semibold">TXT to PDF</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', 'No Upload', 'Custom Font & Size', 'Line Numbers'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            TXT to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert plain text files to PDF instantly in your browser. Upload a .txt file or paste
            text directly. Customize font, size, margins, line spacing and add a title or line numbers.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: 'TXT',   l: 'CSV · MD · LOG'    },
              { v: '4',     l: 'Font Choices'       },
              { v: '100%',  l: 'Browser-Based'      },
              { v: '∞',     l: 'File Size'          },
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
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Text input */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* File upload zone */}
            <div
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onClick={() => fileRef.current?.click()}
              className={
                'border-2 border-dashed rounded-2xl px-6 py-5 text-center cursor-pointer transition-all duration-200 ' +
                (dragging
                  ? 'border-red-400 bg-red-50 scale-[1.005]'
                  : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30')
              }
            >
              <input
                ref={fileRef} type="file" className="hidden"
                accept=".txt,.csv,.md,.log,.ini,.cfg,.xml,.json,.js,.ts,.py,.rb,.sh,.bat,.env,.yaml,.yml,.gitignore"
                onChange={e => e.target.files[0] && loadFile(e.target.files[0])}
              />
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl select-none">📄</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700">
                    {fileName ? fileName : (dragging ? 'Drop file here' : 'Click or drag a text file')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fileSize
                      ? formatBytes(fileSize) + ' · ' + lineCount + ' lines · ' + wordCount + ' words'
                      : '.txt · .csv · .md · .log · .json · .xml and more'}
                  </p>
                </div>
                {fileName && (
                  <button
                    onClick={e => { e.stopPropagation(); setText(''); setFileName(''); setFileSize(0); setStats(null); setTitle(''); setDone(false); }}
                    className="ml-auto text-xs text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            {/* Text area */}
            <div className="relative">
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setDone(false); }}
                placeholder="Or paste / type your text here…"
                rows={18}
                spellCheck={false}
                className="w-full px-4 py-3 text-sm font-mono border border-slate-200 rounded-2xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 resize-y transition-all placeholder:text-slate-300 leading-relaxed bg-slate-50"
              />
              {/* Live stats bar */}
              {text && (
                <div className="absolute bottom-3 right-3 flex gap-3 text-xs text-slate-400 bg-slate-50/80 backdrop-blur-sm px-2 py-1 rounded-lg pointer-events-none">
                  <span>{lineCount} lines</span>
                  <span>·</span>
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{charCount} chars</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Settings */}
          <div className="flex flex-col gap-4">

            {/* Title */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Document Title <span className="text-slate-300 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="My Document"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
              />
            </div>

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
                  {Object.keys(MARGINS_PT).map(m => (
                    <button
                      key={m} onClick={() => setMarginKey(m)}
                      className={
                        'flex-1 py-2 text-xs font-bold rounded-xl border transition-all ' +
                        (marginKey === m
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

            {/* Typography settings */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Typography</p>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Font</label>
                <select
                  value={fontName} onChange={e => setFontName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 bg-white"
                >
                  {Object.keys(FONT_OPTIONS).map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Font Size — {fontSize}pt</label>
                <input
                  type="range" min={8} max={24} value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-xs text-slate-300 mt-0.5">
                  <span>8pt</span><span>24pt</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5">Line Spacing</label>
                <div className="flex gap-2">
                  {Object.keys(LINE_HEIGHTS).map(l => (
                    <button
                      key={l} onClick={() => setLineHeight(l)}
                      className={
                        'flex-1 py-2 text-xs font-bold rounded-xl border transition-all ' +
                        (lineHeight === l
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-red-200')
                      }
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line numbers toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setShowLineNos(p => !p)}
                  className={
                    'w-10 h-5 rounded-full transition-all duration-200 flex items-center px-0.5 flex-shrink-0 ' +
                    (showLineNos ? 'bg-red-500' : 'bg-slate-200')
                  }
                >
                  <div className={
                    'w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ' +
                    (showLineNos ? 'translate-x-5' : 'translate-x-0')
                  } />
                </div>
                <span className="text-xs text-slate-600 font-medium">Show line numbers</span>
              </label>
            </div>

            {/* Convert button */}
            <button
              onClick={convert}
              disabled={converting || !text.trim()}
              className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-sm flex items-center justify-center gap-2"
            >
              {converting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Building PDF…
                </>
              ) : done ? '✅ Downloaded — Convert Again' : '📄 Convert to PDF'}
            </button>

            {done && (
              <p className="text-center text-xs text-slate-400">
                Saved as <strong className="text-slate-600">TOOLBeans-{(fileName || 'document').replace(/\.[^.]+$/, '')}.pdf</strong>
              </p>
            )}
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
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How to Convert TXT to PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload or Paste Text',  d: 'Drop a .txt file into the uploader, or simply paste or type text directly into the editor. Supports TXT, CSV, Markdown, log files and more.' },
            { n: '2', icon: '⚙️', t: 'Customize the PDF',    d: 'Choose page size, orientation, margin, font, font size and line spacing. Optionally add a document title and turn on line numbers.' },
            { n: '3', icon: '⬇️', t: 'Download Your PDF',    d: 'Click Convert. Your PDF downloads instantly. All text is embedded as real selectable text — not an image — so it is searchable and copyable.' },
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
          <h2 className="text-lg font-extrabold text-slate-900 mb-5 text-center">Why Use This TXT to PDF Converter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔍', t: 'Real Selectable Text',  d: 'Text is embedded as actual PDF text — not rasterized into an image. You can select, copy and search it in any PDF reader.' },
              { icon: '🔒', t: 'Completely Private',    d: 'Your text never leaves your device. No server, no upload, no logs. Paste passwords, source code or sensitive notes safely.' },
              { icon: '🔢', t: 'Line Numbers',          d: 'Toggle line numbers on or off. Useful for code files, scripts, config files and any text where line position matters.' },
              { icon: '🖋️', t: 'Font Control',          d: 'Choose Courier, Helvetica or Times Roman. Adjust font size from 8pt to 24pt. Courier is ideal for code and log files.' },
              { icon: '📐', t: 'Full Page Control',     d: 'A4, A3, Letter or Legal. Portrait or landscape. Narrow, Normal or Wide margins. Compact, Normal or Relaxed line spacing.' },
              { icon: '📄', t: 'Auto Page Numbers',     d: 'Multi-page PDFs automatically get page numbers at the bottom. The total page count is shown as "1 / 12" style.' },
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
            Free TXT to PDF Converter — Selectable Text, No Upload
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            This TXT to PDF converter runs entirely in your browser using pdf-lib, a JavaScript
            library that builds PDF documents client-side. Your text files are never uploaded to
            any server — everything happens on your device, making it safe to convert logs containing
            credentials, source code files, private notes or any sensitive plain text content.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Unlike image-based converters that screenshot your text, this tool embeds text as real
            PDF text using pdf-lib&apos;s standard font embedding. The result is a fully searchable,
            selectable PDF where you can copy text, use Ctrl+F to search, and the file size stays
            small. Supported formats include .txt, .csv, .md (Markdown), .log, .json, .xml, .js,
            .ts, .py, .sh, .yaml and most other plain text formats.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The converter supports four fonts — Courier (best for code), Helvetica (clean and modern),
            Courier Bold and Times Roman — with font sizes from 8pt to 24pt and three line spacing
            options. You can also add a document title that appears as a header on the first page,
            and enable line numbers which is useful for code reviews and log file analysis. For
            other document types, see{' '}
            <Link href="/tools/image-to-pdf" className="text-red-500 hover:underline">Image to PDF</Link>,{' '}
            <Link href="/tools/jpg-to-pdf"   className="text-red-500 hover:underline">JPG to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/png-to-pdf"   className="text-red-500 hover:underline">PNG to PDF</Link>.
          </p>
        </div>
      </section>

    </div>
  );
}