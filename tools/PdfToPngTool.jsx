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

export default function PdfToPngTool() {
  const [file,     setFile]     = useState(null);
  const [status,   setStatus]   = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState('');
  const [dragging, setDragging] = useState(false);
  const [pages,    setPages]    = useState([]);
  const [scale,    setScale]    = useState(2);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const loadFile = (f) => {
    setError(''); setStatus('idle'); setProgress(0); setPages([]);
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Please upload a PDF file (.pdf only).'); return; }
    if (f.size > 50 * 1024 * 1024) { setError('File too large. Maximum size is 50 MB.'); return; }
    setFile(f);
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const convert = async () => {
    if (!file) { setError('Please upload a PDF file first.'); return; }
    setStatus('converting'); setError(''); setProgress(5); setPages([]);
    try {
      const pdfjsLib    = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf         = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const total       = pdf.numPages;
      const results     = [];

      for (let i = 1; i <= total; i++) {
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas   = document.createElement('canvas');
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        const ctx      = canvas.getContext('2d');
        // PNG supports transparency — no white fill needed
        await page.render({ canvasContext: ctx, viewport }).promise;
        const url  = canvas.toDataURL('image/png');
        const size = Math.round((url.length * 3) / 4);
        results.push({ url, pageNum: i, size, width: Math.round(viewport.width), height: Math.round(viewport.height) });
        setProgress(Math.round((i / total) * 90) + 5);
      }

      setPages(results); setProgress(100); setStatus('done');
    } catch (err) {
      console.error('PDF to PNG error:', err?.message || err);
      setError('Failed to convert PDF. The file may be password protected or corrupted.');
      setStatus('error'); setProgress(0);
    }
  };

  const downloadOne = (page) => {
    const a = document.createElement('a');
    a.href = page.url;
    a.download = `TOOLBeans-${file.name.replace('.pdf', '')}-page-${page.pageNum}.png`;
    a.click();
  };
  const downloadAll = () => pages.forEach((p, i) => setTimeout(() => downloadOne(p), i * 200));
  const reset = () => { setFile(null); setStatus('idle'); setError(''); setProgress(0); setPages([]); };
  const isConverting = status === 'converting';

  const RELATED = [
    { name: 'PDF → JPG',   href: '/tools/pdf-to-jpg',   icon: '📸' },
    { name: 'PDF → Text',  href: '/tools/pdf-to-text',  icon: '📝' },
    { name: 'PDF → Word',  href: '/tools/pdf-to-word',  icon: '📄' },
    { name: 'PNG → PDF',   href: '/tools/png-to-pdf',   icon: '🖼️' },
    { name: 'JPG → PDF',   href: '/tools/jpg-to-pdf',   icon: '📸' },
    { name: 'Image → PDF', href: '/tools/image-to-pdf', icon: '🗂️' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link><span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link><span>/</span>
            <span className="text-slate-600 font-semibold">PDF to PNG</span>
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free','No Upload','Transparent BG','All Pages'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">{b}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            PDF to <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">PNG Converter</span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert every PDF page to a lossless PNG image with transparent background support. Runs entirely in your browser — nothing uploaded.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[{v:'PDF',l:'Input'},{v:'PNG',l:'Output'},{v:'50 MB',l:'Max Size'},{v:'Lossless',l:'Quality'}].map(s => (
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
                <p className="text-sm text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
              </div>
              {status === 'done' ? (
                <span className="text-sm bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-xl flex-shrink-0">✅ Done</span>
              ) : !isConverting ? (
                <button onClick={reset} className="text-sm text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">✕ Remove</button>
              ) : null}
            </div>

            {!isConverting && status !== 'done' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resolution</label>
                <select value={scale} onChange={e => setScale(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 bg-white text-slate-700">
                  <option value={1}>72 DPI — Web</option>
                  <option value={2}>144 DPI — Standard</option>
                  <option value={3}>216 DPI — High Quality</option>
                </select>
              </div>
            )}

            {isConverting && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Converting pages to PNG…</span><span>{progress}%</span>
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
                  </svg>Converting pages…</>
                ) : '🖼️ Convert to PNG'}
              </button>
            )}

            {status === 'done' && pages.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">{pages.length} page{pages.length > 1 ? 's' : ''} converted</p>
                  {pages.length > 1 && (
                    <button onClick={downloadAll} className="bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                      ⬇️ Download All ({pages.length} PNGs)
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pages.map(page => (
                    <div key={page.pageNum} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <img src={page.url} alt={`Page ${page.pageNum}`} className="w-full object-contain bg-slate-50" style={{maxHeight:'160px'}} />
                      <div className="p-3">
                        <p className="text-xs font-bold text-slate-700 mb-0.5">Page {page.pageNum}</p>
                        <p className="text-xs text-slate-400">{page.width}×{page.height}px · {formatBytes(page.size)}</p>
                        <button onClick={() => downloadOne(page)} className="mt-2 w-full bg-red-50 hover:bg-red-500 hover:text-white text-red-600 text-xs font-bold py-1.5 rounded-lg transition-all">⬇️ Download</button>
                      </div>
                    </div>
                  ))}
                </div>
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
            {n:'1',icon:'📂',t:'Upload PDF',      d:'Drag and drop or click to upload any PDF up to 50 MB.'},
            {n:'2',icon:'⚙️',t:'Pages Rendered',  d:'Each PDF page is rendered to canvas and exported as a lossless PNG with transparency support.'},
            {n:'3',icon:'⬇️',t:'Download PNGs',   d:'Download individual page PNGs or all at once. Nothing is uploaded to any server.'},
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
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free PDF to PNG Converter — Lossless Output With Transparency</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            TOOLBeans PDF to PNG converter renders each PDF page to a lossless PNG image in your browser. PNG output preserves transparency and is ideal for presentations, web graphics and archiving. No server upload required.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            For smaller file sizes use <Link href="/tools/pdf-to-jpg" className="text-red-500 hover:underline">PDF to JPG</Link>. For text extraction see <Link href="/tools/pdf-to-text" className="text-red-500 hover:underline">PDF to Text</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}