'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

// ─── Worker-safe pdf.js loader ───────────────────────────────────────────────
// new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url) tells
// Webpack / Turbopack to resolve the worker from YOUR local node_modules.
// The version is always guaranteed to match — no CDN, no hardcoded strings.
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
// ─────────────────────────────────────────────────────────────────────────────

export default function PdfToTextTool() {
  const [file,      setFile]      = useState(null);
  const [status,    setStatus]    = useState('idle');
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState('');
  const [dragging,  setDragging]  = useState(false);
  const [text,      setText]      = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [copyDone,  setCopyDone]  = useState(false);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const loadFile = (f) => {
    setError(''); setStatus('idle'); setProgress(0); setText(''); setPageCount(0); setWordCount(0);
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Please upload a PDF file (.pdf only).'); return; }
    if (f.size > 50 * 1024 * 1024) { setError('File too large. Maximum size is 50 MB.'); return; }
    setFile(f);
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const extract = async () => {
    if (!file) { setError('Please upload a PDF file first.'); return; }
    setStatus('extracting'); setError(''); setProgress(5); setText('');
    try {
      const pdfjsLib = await loadPdfJs();

      const arrayBuffer = await file.arrayBuffer();
      const pdf   = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const total = pdf.numPages;
      setPageCount(total);

      let fullText = '';
      for (let i = 1; i <= total; i++) {
        const page    = await pdf.getPage(i);
        const content = await page.getTextContent();
        let pageText  = '';
        let lastY     = null;
        content.items.forEach((item) => {
          if ('str' in item) {
            const y = item.transform[5];
            if (lastY !== null && Math.abs(lastY - y) > 2) pageText += '\n';
            pageText += item.str;
            lastY = y;
          }
        });
        fullText += `--- Page ${i} ---\n${pageText.trim()}\n\n`;
        setProgress(Math.round((i / total) * 90) + 5);
      }

      const trimmed = fullText.trim();
      setText(trimmed);
      setWordCount(trimmed.split(/\s+/).filter(Boolean).length);
      setProgress(100);
      setStatus('done');
    } catch (err) {
      console.error('PDF extract error:', err?.message || err);
      setError('Failed to extract text. The PDF may be scanned/image-based or password protected.');
      setStatus('error'); setProgress(0);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `TOOLBeans-${file.name.replace('.pdf', '')}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopyDone(true); setTimeout(() => setCopyDone(false), 2000);
  };

  const reset = () => { setFile(null); setStatus('idle'); setError(''); setProgress(0); setText(''); setPageCount(0); setWordCount(0); };
  const isExtracting = status === 'extracting';

  const RELATED = [
    { name: 'PDF → JPG',   href: '/tools/pdf-to-jpg',   icon: '📸' },
    { name: 'PDF → PNG',   href: '/tools/pdf-to-png',   icon: '🖼️' },
    { name: 'PDF → Word',  href: '/tools/pdf-to-word',  icon: '📝' },
    { name: 'PDF → HTML',  href: '/tools/pdf-to-html',  icon: '🌐' },
    { name: 'Word → PDF',  href: '/tools/word-to-pdf',  icon: '📄' },
    { name: 'PDF → CSV',   href: '/tools/pdf-to-csv',   icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link><span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link><span>/</span>
            <span className="text-slate-600 font-semibold">PDF to Text</span>
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free','No Upload','Browser-Based','All Pages'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">{b}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            PDF to <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Text Converter</span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Extract all text from any PDF instantly. Every page extracted, line breaks preserved. Runs entirely in your browser — your file never leaves your device.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[{v:'PDF',l:'Input'},{v:'TXT',l:'Output'},{v:'50 MB',l:'Max Size'},{v:'100%',l:'Private'}].map(s => (
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
                <p className="font-bold text-slate-800 truncate text-base">{file.name}</p>
                <p className="text-sm text-slate-400 mt-0.5">{formatBytes(file.size)}{pageCount > 0 ? ` · ${pageCount} pages` : ''}</p>
              </div>
              {status === 'done' ? (
                <span className="text-sm bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-xl flex-shrink-0">✅ Done</span>
              ) : !isExtracting ? (
                <button onClick={reset} className="text-sm text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 font-medium">✕ Remove</button>
              ) : null}
            </div>

            {isExtracting && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Extracting text from PDF…</span><span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
                </div>
              </div>
            )}

            {status !== 'done' && (
              <button onClick={extract} disabled={isExtracting}
                className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-base flex items-center justify-center gap-3">
                {isExtracting ? (
                  <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Extracting text…</>
                ) : '📝 Extract Text'}
              </button>
            )}

            {status === 'done' && text && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-3">
                  {[{v:pageCount,l:'Pages'},{v:wordCount.toLocaleString(),l:'Words'},{v:text.length.toLocaleString(),l:'Characters'}].map(s => (
                    <div key={s.l} className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-red-600">{s.v}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
                <textarea readOnly value={text}
                  className="w-full h-64 text-xs text-slate-600 font-mono bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none outline-none leading-relaxed" />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={downloadTxt} className="bg-red-500 hover:bg-red-400 text-white font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2">
                    ⬇️ Download .txt
                  </button>
                  <button onClick={copyText} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all text-sm flex items-center justify-center gap-2">
                    {copyDone ? '✅ Copied!' : '📋 Copy All Text'}
                  </button>
                </div>
                <button onClick={reset} className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-2xl transition-all text-sm">
                  Convert Another PDF
                </button>
              </div>
            )}

            {status === 'done' && text.length < 50 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                ⚠️ Very little text extracted. This PDF may be <strong>scanned/image-based</strong>. Text extraction only works on PDFs with selectable text.
              </div>
            )}
          </div>
        )}
      </section>
       {/* Add
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">Advertisement — 728×90</div>
      </div>
      */}

      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {n:'1',icon:'📂',t:'Upload PDF',       d:'Drag and drop or click to upload any PDF up to 50 MB.'},
            {n:'2',icon:'⚙️',t:'Text Extracted',   d:'pdf.js reads every page and extracts all text with line breaks preserved.'},
            {n:'3',icon:'⬇️',t:'Download or Copy', d:'Download as .txt or copy all text to clipboard. Your PDF never leaves your browser.'},
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
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free PDF to Text Converter — Extract Text From Any PDF</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            TOOLBeans PDF to Text converter uses pdf.js to extract all text content from your PDF directly in the browser. No file is uploaded to any server — everything runs locally on your device, making it completely private and instant.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Note: this tool works on PDFs with selectable text. Scanned PDFs require OCR software. For other conversions see{' '}
            <Link href="/tools/pdf-to-word" className="text-red-500 hover:underline">PDF to Word</Link>,{' '}
            <Link href="/tools/pdf-to-jpg"  className="text-red-500 hover:underline">PDF to JPG</Link> and{' '}
            <Link href="/tools/pdf-to-html" className="text-red-500 hover:underline">PDF to HTML</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}