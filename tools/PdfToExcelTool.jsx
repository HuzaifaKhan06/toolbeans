'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

export default function PdfToExcelTool() {
  const [file,     setFile]     = useState(null);
  const [status,   setStatus]   = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const loadFile = (f) => {
    setError(''); setStatus('idle'); setProgress(0);
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Please upload a PDF file (.pdf only).'); return; }
    if (f.size > 50 * 1024 * 1024) { setError('File too large. Maximum size is 50 MB.'); return; }
    setFile(f);
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const convert = async () => {
    if (!file) { setError('Please upload a PDF file first.'); return; }
    setStatus('uploading'); setError(''); setProgress(10);
    try {
      const formData = new FormData();
      formData.append('file', file);
      setStatus('converting'); setProgress(40);

      const res = await fetch('/api/convert/pdf-to-excel', { method: 'POST', body: formData });
      setProgress(85);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Conversion failed. Please try again.');
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `TOOLBeans-${file.name.replace('.pdf', '')}.xlsx`; a.click();
      URL.revokeObjectURL(url);
      setProgress(100); setStatus('done');
    } catch (err) {
      setError(err.message); setStatus('error'); setProgress(0);
    }
  };

  const reset = () => { setFile(null); setStatus('idle'); setError(''); setProgress(0); };
  const isConverting = status === 'uploading' || status === 'converting';

  const RELATED = [
    { name: 'PDF → Word',       href: '/tools/pdf-to-word',       icon: '📝' },
    { name: 'PDF → PowerPoint', href: '/tools/pdf-to-powerpoint', icon: '📽️' },
    { name: 'PDF → Text',       href: '/tools/pdf-to-text',       icon: '📄' },
    { name: 'Excel → PDF',      href: '/tools/excel-to-pdf',      icon: '📊' },
    { name: 'PDF → CSV',        href: '/tools/pdf-to-csv',        icon: '📋' },
    { name: 'PDF → JPG',        href: '/tools/pdf-to-jpg',        icon: '📸' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <Link href="/" className="hover:text-red-500 transition-colors">Home</Link><span>/</span>
            <Link href="/tools" className="hover:text-red-500 transition-colors">Tools</Link><span>/</span>
            <span className="text-slate-600 font-semibold">PDF to Excel</span>
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free','No Data Stored','LibreOffice Quality','.xlsx Output'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">{b}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            PDF to <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Excel Converter</span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert PDF files to editable Excel .xlsx spreadsheets. Tables and data extracted accurately. Powered by LibreOffice on our secure server.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[{v:'PDF',l:'Input'},{v:'.xlsx',l:'Output'},{v:'50 MB',l:'Max Size'},{v:'Editable',l:'Spreadsheet'}].map(s => (
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

            {isConverting && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{status === 'uploading' ? 'Uploading file…' : 'Converting with TOOLBeans…'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: progress + '%' }} />
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
                  </svg>{status === 'uploading' ? 'Uploading…' : 'Converting…'}</>
                ) : '📊 Convert to Excel'}
              </button>
            )}

            {status === 'done' && (
              <div className="flex flex-col gap-3">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-bold text-green-800 mb-1">Excel Spreadsheet Downloaded!</p>
                  <p className="text-sm text-green-600">Saved as <strong>TOOLBeans-{file.name.replace('.pdf', '')}.xlsx</strong></p>
                </div>
                <button onClick={reset} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all text-sm">
                  Convert Another PDF
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">⚠️ Conversion Quality Note</p>
          <p className="text-xs text-slate-600 leading-relaxed">
            PDF to Excel works best on PDFs with clearly structured tables and data. Complex layouts or merged cells may need manual adjustment after conversion. For best results, use PDFs that were originally created from spreadsheets.
          </p>
        </div>
      </section>
      {/* ADD 

      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">Advertisement — 728×90</div>
      </div>
      */}

      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {n:'1',icon:'📂',t:'Upload PDF',         d:'Drag and drop or click to upload any PDF up to 50 MB.'},
            {n:'2',icon:'⚙️',t:'TOOLBeans Converts', d:'Your file is sent to our secure server where LibreOffice converts it to an editable Excel spreadsheet.'},
            {n:'3',icon:'⬇️',t:'.xlsx Downloads',    d:'Your Excel file downloads automatically. The file is deleted from our server immediately.'},
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
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free PDF to Excel Converter — Editable .xlsx Output</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            TOOLBeans PDF to Excel converter uses LibreOffice on a secure server to convert PDF files to editable .xlsx spreadsheets. The converted file opens in Microsoft Excel, Google Sheets and LibreOffice Calc.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your file is uploaded securely over HTTPS, converted immediately and deleted right after your .xlsx downloads. For other conversions see{' '}
            <Link href="/tools/word-to-pdf"        className="text-red-500 hover:underline">Word to PDF</Link>,{' '}
            <Link href="/tools/pdf-to-word"        className="text-red-500 hover:underline">PDF to Word</Link> and{' '}
            <Link href="/tools/pdf-to-powerpoint"  className="text-red-500 hover:underline">PDF to PowerPoint</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}