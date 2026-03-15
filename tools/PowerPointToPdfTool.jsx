'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

export default function PowerPointToPdfTool() {
  const [file,      setFile]      = useState(null);
  const [status,    setStatus]    = useState('idle');
  const [error,     setError]     = useState('');
  const [dragging,  setDragging]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  const loadFile = (f) => {
    setError(''); setStatus('idle'); setProgress(0);
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!['.pptx', '.ppt'].includes(ext)) {
      setError('Please upload a .pptx or .ppt file only.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50 MB.');
      return;
    }
    setFile(f);
  };

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  const convert = async () => {
    if (!file) { setError('Please upload a PowerPoint file first.'); return; }
    setStatus('uploading'); setError(''); setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      setStatus('converting'); setProgress(40);

      const res = await fetch('/api/convert/powerpoint-to-pdf', {
        method: 'POST',
        body:   formData,
      });

      setProgress(85);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Conversion failed. Please try again.');
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `TOOLBeans-${file.name.replace(/\.[^.]+$/, '')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
      setProgress(0);
    }
  };

  const reset = () => { setFile(null); setStatus('idle'); setError(''); setProgress(0); };
  const isConverting = status === 'uploading' || status === 'converting';

  const RELATED_TOOLS = [
    { name: 'Word to PDF',    href: '/tools/word-to-pdf',    icon: '📝', desc: 'Word documents to PDF'      },
    { name: 'Excel to PDF',   href: '/tools/excel-to-pdf',   icon: '📊', desc: 'Spreadsheets to PDF'        },
    { name: 'Image to PDF',   href: '/tools/image-to-pdf',   icon: '🗂️', desc: 'JPG, PNG and more to PDF'  },
    { name: 'HTML to PDF',    href: '/tools/html-to-pdf',    icon: '🌐', desc: 'Web pages to PDF'           },
    { name: 'SVG to PDF',     href: '/tools/svg-to-pdf',     icon: '✏️', desc: 'Vector graphics to PDF'    },
    { name: 'Merge PDF',      href: '/tools/merge-pdf',      icon: '📑', desc: 'Combine multiple PDFs'      },
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
            <span className="text-slate-600 font-semibold">PowerPoint to PDF</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', 'No Data Stored', 'LibreOffice Quality', '.pptx & .ppt'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            PowerPoint to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert PowerPoint presentations to PDF with all slides, images and layouts intact.
            Each slide becomes one PDF page. Perfect for sharing presentations without needing PowerPoint.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: '.pptx', l: 'Primary Format'   },
              { v: '.ppt',  l: 'Also Supported'   },
              { v: '50 MB', l: 'Max File Size'     },
              { v: '1:1',   l: 'Slides to Pages'  },
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
      <section className="max-w-3xl mx-auto px-6 py-10">

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0 mt-px">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* DROP ZONE */}
        {!file ? (
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onClick={() => fileRef.current?.click()}
            className={
              'border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 ' +
              (dragging
                ? 'border-red-400 bg-red-50 scale-[1.01]'
                : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30')
            }
          >
            <input
              ref={fileRef} type="file" className="hidden"
              accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
              onChange={e => e.target.files[0] && loadFile(e.target.files[0])}
            />
            <div className="text-6xl mb-4 select-none">📽️</div>
            <p className="font-bold text-slate-700 text-lg mb-2">
              {dragging ? 'Drop your PowerPoint file here' : 'Click or drag your PowerPoint file here'}
            </p>
            <p className="text-sm text-slate-400">Supports .pptx and .ppt up to 50 MB</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 select-none">📽️</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate text-base">{file.name}</p>
                <p className="text-sm text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
              </div>
              {status === 'done' ? (
                <span className="text-sm bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-xl flex-shrink-0">✅ Done</span>
              ) : !isConverting ? (
                <button onClick={reset} className="text-sm text-slate-400 hover:text-red-500 transition-colors flex-shrink-0 font-medium">✕ Remove</button>
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
              <button
                onClick={convert} disabled={isConverting}
                className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-base flex items-center justify-center gap-3"
              >
                {isConverting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    {status === 'uploading' ? 'Uploading…' : 'Converting slides…'}
                  </>
                ) : '📄 Convert to PDF'}
              </button>
            )}

            {status === 'done' && (
              <div className="flex flex-col gap-3">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                  <div className="text-4xl mb-2 select-none">✅</div>
                  <p className="font-bold text-green-800 text-base mb-1">PDF Downloaded Successfully!</p>
                  <p className="text-sm text-green-600">Saved as <strong>TOOLBeans-{file.name.replace(/\.[^.]+$/, '')}.pdf</strong></p>
                </div>
                <button onClick={reset} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl transition-all text-sm">
                  Convert Another File
                </button>
              </div>
            )}
          </div>
        )}

        {/* Support table */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">✅ Fully Preserved</p>
            <ul className="space-y-1.5">
              {['All slides (one slide = one page)','Slide backgrounds and colors','Text and text formatting','Images and photos','Shapes and diagrams','Slide layouts','Tables on slides','Speaker notes (hidden in PDF)','Slide transitions ignored (static PDF)','Font styles and sizes'].map(i => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-2"><span className="text-green-500 flex-shrink-0">✓</span>{i}</li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">⚠️ Limited Support</p>
            <ul className="space-y-1.5">
              {['Animations (converted to static)','Embedded videos','Custom fonts (replaced with similar)','3D effects','Some SmartArt layouts','Password-protected files'].map(i => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-2"><span className="text-amber-500 flex-shrink-0">~</span>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* AD */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload Presentation', d: 'Drag and drop your .pptx or .ppt file. Up to 50 MB and unlimited slides.' },
            { n: '2', icon: '⚙️', t: 'TOOLBeans Converts',  d: 'Our secure server converts every slide to a PDF page preserving backgrounds, images and text with professional accuracy.' },
            { n: '3', icon: '⬇️', t: 'PDF Downloads',       d: 'One PDF with all slides downloads automatically. File deleted from server immediately.' },
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

      {/* RELATED */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RELATED_TOOLS.map(t => (
            <Link key={t.href} href={t.href} className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-red-200 hover:shadow-md transition-all group">
              <span className="text-2xl flex-shrink-0 mt-0.5">{t.icon}</span>
              <div>
                <p className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free PowerPoint to PDF Converter Every Slide Preserved</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            TOOLBeans PowerPoint to PDF converter uses LibreOffice Impress on a dedicated server
            to convert .pptx and .ppt files to PDF. Every slide becomes one PDF page with
            backgrounds, images, shapes and text all preserved accurately.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your file is uploaded securely over HTTPS, converted immediately and deleted right
            after your PDF downloads. For other office conversions see{' '}
            <Link href="/tools/word-to-pdf"  className="text-red-500 hover:underline">Word to PDF</Link>,{' '}
            <Link href="/tools/excel-to-pdf" className="text-red-500 hover:underline">Excel to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/image-to-pdf" className="text-red-500 hover:underline">Image to PDF</Link>.
          </p>
        </div>
      </section>

    </div>
  );
}