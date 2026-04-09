'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

let _pdfjsLib = null;
async function loadPdfJs() {
  if (_pdfjsLib) return _pdfjsLib;
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  _pdfjsLib = pdfjsLib;
  return pdfjsLib;
}

export default function PdfToHtmlTool() {
  const [file,      setFile]      = useState(null);
  const [status,    setStatus]    = useState('idle');
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState('');
  const [dragging,  setDragging]  = useState(false);
  const [html,      setHtml]      = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [preview,   setPreview]   = useState(false);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const loadFile = (f) => {
    setError(''); setStatus('idle'); setProgress(0); setHtml(''); setPageCount(0); setPreview(false);
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Please upload a PDF file (.pdf only).'); return; }
    if (f.size > 50 * 1024 * 1024) { setError('File too large. Maximum size is 50 MB.'); return; }
    setFile(f);
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const convert = async () => {
    if (!file) { setError('Please upload a PDF file first.'); return; }
    setStatus('converting'); setError(''); setProgress(5); setHtml('');
    try {
      const pdfjsLib    = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf         = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const total       = pdf.numPages;
      setPageCount(total);

      let bodyHtml = '';

      for (let i = 1; i <= total; i++) {
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const content  = await page.getTextContent();

        let pageHtml = `<div class="pdf-page" id="page-${i}" style="position:relative;width:${Math.round(viewport.width)}px;min-height:${Math.round(viewport.height)}px;margin:0 auto 40px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12);padding:40px 48px;box-sizing:border-box;">\n`;
        pageHtml += `<div class="page-number" style="position:absolute;top:10px;right:14px;font-size:11px;color:#999;">Page ${i}</div>\n`;

        let lastY    = null;
        let lastSize = null;
        let paraText = '';

        const flushPara = () => {
          if (paraText.trim()) {
            pageHtml += `<p style="margin:0 0 8px;line-height:1.6;">${paraText.trim()}</p>\n`;
            paraText = '';
          }
        };

        content.items.forEach((item) => {
          if (!('str' in item)) return;
          const y    = Math.round(item.transform[5]);
          const size = Math.round(item.height || 12);
          if (lastY !== null && Math.abs(lastY - y) > size * 0.8) flushPara();
          const escaped = item.str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          if (size !== lastSize && size > 14) {
            flushPara();
            const tag = size > 20 ? 'h1' : size > 16 ? 'h2' : 'h3';
            pageHtml += `<${tag} style="font-size:${size}px;font-weight:bold;margin:16px 0 8px;">${escaped}</${tag}>\n`;
          } else {
            paraText += (paraText && !paraText.endsWith(' ') ? ' ' : '') + escaped;
          }
          lastY = y; lastSize = size;
        });

        flushPara();
        pageHtml += '</div>\n';
        bodyHtml += pageHtml;
        setProgress(Math.round((i / total) * 85) + 10);
      }

      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name.replace('.pdf', '')} — Converted by TOOLBeans</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 14px; background: #f0f0f0; padding: 24px 16px; color: #1a1a1a; }
    .toc { background: #fff; border-radius: 8px; padding: 20px 24px; margin-bottom: 32px; max-width: 800px; margin-left: auto; margin-right: auto; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    .toc h2 { font-size: 16px; margin-bottom: 12px; }
    .toc a { display: block; padding: 4px 0; color: #4f46e5; text-decoration: none; font-size: 13px; }
    .toc a:hover { text-decoration: underline; }
    .converted-by { text-align: center; color: #999; font-size: 12px; margin-top: 20px; font-family: Arial, sans-serif; }
    @media (max-width: 600px) { .pdf-page { padding: 20px 16px !important; } body { padding: 12px 8px; } }
  </style>
</head>
<body>
  <div class="toc">
    <h2>Table of Contents</h2>
    ${Array.from({length: total}, (_, i) => `<a href="#page-${i+1}">Page ${i+1}</a>`).join('\n    ')}
  </div>
  ${bodyHtml}
  <p class="converted-by">Converted by <a href="https://toolbeans.com" style="color:#4f46e5;">TOOLBeans</a> PDF to HTML Converter</p>
</body>
</html>`;

      setHtml(fullHtml);
      setProgress(100);
      setStatus('done');
    } catch (err) {
      console.error('PDF to HTML error:', err?.message || err);
      setError('Failed to convert PDF. The file may be password protected or corrupted.');
      setStatus('error'); setProgress(0);
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `TOOLBeans-${file.name.replace('.pdf', '')}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => { setFile(null); setStatus('idle'); setError(''); setProgress(0); setHtml(''); setPageCount(0); setPreview(false); };
  const isConverting = status === 'converting';

  const RELATED = [
    { name: 'PDF → Text',  href: '/tools/pdf-to-text',  icon: '📝' },
    { name: 'PDF → Word',  href: '/tools/pdf-to-word',  icon: '📄' },
    { name: 'PDF → JPG',   href: '/tools/pdf-to-jpg',   icon: '📸' },
    { name: 'HTML → PDF',  href: '/tools/html-to-pdf',  icon: '🌐' },
    { name: 'PDF → CSV',   href: '/tools/pdf-to-csv',   icon: '📊' },
    { name: 'Word → PDF',  href: '/tools/word-to-pdf',  icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link><span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link><span>/</span>
            <span className="text-slate-600 font-semibold">PDF to HTML</span>
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free','No Upload','Browser-Based','With TOC'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">{b}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            PDF to <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">HTML Converter</span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert PDF to a clean, responsive HTML file with table of contents. Headings detected automatically. Runs entirely in your browser.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[{v:'PDF',l:'Input'},{v:'HTML',l:'Output'},{v:'50 MB',l:'Max Size'},{v:'TOC',l:'Included'}].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-extrabold text-slate-900">{s.v}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0 mt-px">⚠️</span><span>{error}</span>
          </div>
        )}
        {!file ? (
          <div onDrop={onDrop} onDragOver={e => e.preventDefault()} onDragEnter={onDragEnter} onDragLeave={onDragLeave}
            onClick={() => fileRef.current?.click()}
            className={'border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 ' +
              (dragging ? 'border-red-400 bg-red-50 scale-[1.01]' : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30')}>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,application/pdf"
              onChange={e => e.target.files[0] && loadFile(e.target.files[0])} />
            <div className="text-6xl mb-4 select-none">📄</div>
            <p className="font-bold text-slate-700 text-lg mb-2">{dragging ? 'Drop your PDF here' : 'Click or drag your PDF here'}</p>
            <p className="text-sm text-slate-400">PDF files only — up to 50 MB</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 select-none">📄</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{file.name}</p>
                <p className="text-sm text-slate-400 mt-0.5">{formatBytes(file.size)}{pageCount > 0 ? ` · ${pageCount} pages` : ''}</p>
              </div>
              {status === 'done' ? (
                <span className="text-sm bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-xl flex-shrink-0">✅ Done</span>
              ) : !isConverting ? (
                <button onClick={reset} className="text-sm text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">✕ Remove</button>
              ) : null}
            </div>

            {isConverting && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Converting PDF to HTML…</span><span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
                </div>
              </div>
            )}

            {status !== 'done' && (
              <button onClick={convert} disabled={isConverting}
                className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all text-base flex items-center justify-center gap-3">
                {isConverting ? (
                  <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Converting…</>
                ) : '🌐 Convert to HTML'}
              </button>
            )}

            {status === 'done' && html && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {[{v:pageCount,l:'Pages'},{v:formatBytes(new Blob([html]).size),l:'HTML Size'}].map(s => (
                    <div key={s.l} className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-red-600">{s.v}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</p>
                    <button onClick={() => setPreview(!preview)} className="text-xs text-red-500 font-semibold hover:underline">
                      {preview ? 'Hide' : 'Show'} preview
                    </button>
                  </div>
                  {preview ? (
                    <iframe srcDoc={html} className="w-full h-64 border border-slate-200 rounded-lg bg-white" title="HTML Preview" />
                  ) : (
                    <textarea readOnly value={html.substring(0, 500) + '…'}
                      className="w-full h-24 text-xs font-mono text-slate-500 bg-white border border-slate-200 rounded-lg p-3 resize-none outline-none" />
                  )}
                </div>
                <button onClick={downloadHtml} className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2">
                  ⬇️ Download .html
                </button>
                <button onClick={reset} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-2xl transition-all text-sm">Convert Another PDF</button>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">Advertisement — 728×90</div>
      </div>

      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {n:'1',icon:'📂',t:'Upload PDF',      d:'Drag and drop or click to upload your PDF up to 50 MB.'},
            {n:'2',icon:'⚙️',t:'Text Extracted',  d:'pdf.js reads text positions and sizes, detects headings and generates clean HTML with a table of contents.'},
            {n:'3',icon:'⬇️',t:'Download HTML',   d:'Download a self-contained .html file that opens in any browser. Nothing uploaded to any server.'},
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

      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RELATED.map(t => (
            <Link key={t.href} href={t.href} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-red-200 hover:shadow-md transition-all group">
              <span className="text-2xl flex-shrink-0">{t.icon}</span>
              <p className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">{t.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free PDF to HTML Converter — Clean Responsive Output</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            TOOLBeans PDF to HTML converter extracts text from your PDF and generates a clean, responsive HTML file with automatic heading detection and a table of contents. The output opens in any browser and is mobile-friendly.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Best for PDFs with selectable text. For other conversions see{' '}
            <Link href="/tools/pdf-to-text" className="text-red-500 hover:underline">PDF to Text</Link>,{' '}
            <Link href="/tools/pdf-to-word" className="text-red-500 hover:underline">PDF to Word</Link> and{' '}
            <Link href="/tools/html-to-pdf" className="text-red-500 hover:underline">HTML to PDF</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}