'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

let _idSeq = 0;
const nextId = () => (++_idSeq) + '-' + Date.now();

export default function ExcelToPdfTool() {
  // ── Queue of files (NEW: supports multiple). Each: { id, file, status, error, progress } ──
  // status: 'queued' | 'uploading' | 'converting' | 'done' | 'error'
  const [items, setItems]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const fileRef   = useRef(null);
  const dragCount = useRef(0);

  // ── Validate a single file (same rules as before) ──
  const validateFile = (f) => {
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!['.xlsx', '.xls'].includes(ext)) return 'Please upload a .xlsx or .xls file only.';
    if (f.size > 50 * 1024 * 1024) return 'File too large. Maximum size is 50 MB.';
    return null;
  };

  // ── Add files to the queue ──
  const addFiles = (fileList) => {
    setGlobalError('');
    const incoming = Array.from(fileList || []);
    const accepted = [];
    for (const f of incoming) {
      const err = validateFile(f);
      if (err) { setGlobalError(err); continue; }
      accepted.push({ id: nextId(), file: f, status: 'queued', error: '', progress: 0 });
    }
    if (accepted.length) setItems((prev) => [...prev, ...accepted]);
  };

  const patch = (id, fields) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...fields } : it)));

  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const onDrop      = (e) => { e.preventDefault(); dragCount.current = 0; setDragging(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); };
  const onDragEnter = (e) => { e.preventDefault(); dragCount.current++; setDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); dragCount.current--; if (!dragCount.current) setDragging(false); };

  // ── Convert ONE file  same endpoint, same download logic as original.
  //    Added: one automatic retry on network error for reliability. ──
  const convertOne = async (item, isRetry = false) => {
    const { id, file } = item;
    patch(id, { status: 'uploading', error: '', progress: 10 });

    try {
      const formData = new FormData();
      formData.append('file', file);
      patch(id, { status: 'converting', progress: 40 });

      const res = await fetch('/api/convert/excel-to-pdf', {
        method: 'POST',
        body:   formData,
      });

      patch(id, { progress: 85 });

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

      patch(id, { status: 'done', progress: 100 });
      return true;
    } catch (err) {
      // Reliability: retry once automatically on a likely-transient network error
      const transient = err instanceof TypeError || /network|failed to fetch|load failed/i.test(err.message || '');
      if (transient && !isRetry) {
        await new Promise((r) => setTimeout(r, 800));
        return convertOne(item, true);
      }
      patch(id, { status: 'error', error: err.message || 'Conversion failed.', progress: 0 });
      return false;
    }
  };

  // ── Convert all queued/error files sequentially (one request at a time) ──
  const [batchRunning, setBatchRunning] = useState(false);
  const convertAll = async () => {
    setBatchRunning(true);
    // Re-read latest items each loop via functional snapshot
    const snapshot = items.filter((it) => it.status === 'queued' || it.status === 'error');
    for (const it of snapshot) {
      // skip if removed mid-run
      // eslint-disable-next-line no-await-in-loop
      await convertOne(it);
    }
    setBatchRunning(false);
  };

  const retryItem = (item) => convertOne({ ...item }, false);

  const clearAll = () => { setItems([]); setGlobalError(''); setBatchRunning(false); };
  const clearDone = () => setItems((prev) => prev.filter((it) => it.status !== 'done'));

  const anyConverting = items.some((it) => it.status === 'uploading' || it.status === 'converting') || batchRunning;
  const pendingCount  = items.filter((it) => it.status === 'queued' || it.status === 'error').length;
  const doneCount     = items.filter((it) => it.status === 'done').length;

  const RELATED_TOOLS = [
    { name: 'Word to PDF',       href: '/tools/word-to-pdf',       icon: '📝', desc: 'Word documents to PDF'       },
    { name: 'PowerPoint to PDF', href: '/tools/powerpoint-to-pdf', icon: '📽️', desc: 'Presentations to PDF'        },
    { name: 'HTML to PDF',       href: '/tools/html-to-pdf',       icon: '🌐', desc: 'Web pages to PDF'            },
    { name: 'CSV to SQL',        href: '/tools/csv-to-sql',        icon: '📊', desc: 'Convert CSV to SQL queries'  },
    { name: 'Image to PDF',      href: '/tools/image-to-pdf',      icon: '🗂️', desc: 'JPG, PNG and more to PDF'   },
    { name: 'SVG to PDF',         href: '/tools/svg-to-pdf',         icon: '📑', desc: 'Convert SVG to PDFs'       },
  ];

  const STATUS_META = {
    queued:     { label: 'Queued',      cls: 'bg-slate-100 text-slate-500' },
    uploading:  { label: 'Uploading…',  cls: 'bg-amber-100 text-amber-700' },
    converting: { label: 'Converting…', cls: 'bg-amber-100 text-amber-700' },
    done:       { label: '✅ Done',      cls: 'bg-green-100 text-green-700' },
    error:      { label: '⚠️ Failed',    cls: 'bg-red-100 text-red-700'    },
  };

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
            <span className="text-slate-600 font-semibold">Excel to PDF</span>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
            {['Free', 'No Data Stored', 'LibreOffice Quality', '.xlsx & .xls', 'Multiple Files'].map(b => (
              <span key={b} className="bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Excel to{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              PDF Converter
            </span>
          </h1>
          <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
            Convert Excel spreadsheets to PDF with all formatting preserved. Cell styles,
            borders, formulas display, charts and column widths all maintained accurately.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mt-7">
            {[
              { v: '.xlsx', l: 'Primary Format'  },
              { v: '.xls',  l: 'Also Supported'  },
              { v: '50 MB', l: 'Max File Size'   },
              { v: '100%',  l: 'Cells Preserved' },
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

        {globalError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="flex-shrink-0 mt-px">⚠️</span>
            <span>{globalError}</span>
          </div>
        )}

        {/* DROP ZONE  always available so more files can be added */}
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
          className={
            'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 outline-none focus:border-red-400 ' +
            (dragging
              ? 'border-red-400 bg-red-50 scale-[1.01]'
              : 'border-slate-200 hover:border-red-300 hover:bg-red-50/30')
          }
        >
          <input
            ref={fileRef} type="file" className="hidden" multiple
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
          />
          <div className="text-5xl mb-3 select-none">📊</div>
          <p className="font-bold text-slate-700 text-lg mb-2">
            {dragging ? 'Drop your Excel files here' : items.length ? 'Add more Excel files' : 'Click or drag your Excel files here'}
          </p>
          <p className="text-sm text-slate-400">Supports .xlsx and .xls up to 50 MB each · multiple files allowed</p>
        </div>

        {/* QUEUE */}
        {items.length > 0 && (
          <div className="mt-5 flex flex-col gap-3">

            {/* Queue toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">{items.length}</span> file{items.length > 1 ? 's' : ''} in queue
                {doneCount > 0 && <span className="text-green-600 font-semibold"> · {doneCount} done</span>}
              </div>
              <div className="flex gap-2">
                {doneCount > 0 && (
                  <button onClick={clearDone} disabled={anyConverting}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50">
                    Clear completed
                  </button>
                )}
                <button onClick={clearAll} disabled={anyConverting}
                  className="text-xs text-slate-500 hover:text-red-600 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50">
                  Clear all
                </button>
              </div>
            </div>

            {/* File rows */}
            {items.map((it) => {
              const meta = STATUS_META[it.status] || STATUS_META.queued;
              const busy = it.status === 'uploading' || it.status === 'converting';
              return (
                <div key={it.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 select-none">📊</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-sm">{it.file.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatBytes(it.file.size)}</p>
                    </div>
                    <span className={'text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ' + meta.cls}>{meta.label}</span>
                    {it.status === 'error' && (
                      <button onClick={() => retryItem(it)} disabled={anyConverting}
                        className="text-xs font-bold text-red-600 hover:text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50">
                        ↻ Retry
                      </button>
                    )}
                    {!busy && it.status !== 'done' && (
                      <button onClick={() => removeItem(it.id)} disabled={anyConverting}
                        className="text-xs text-slate-400 hover:text-red-500 font-medium flex-shrink-0 transition-colors disabled:opacity-50">
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Progress */}
                  {busy && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span>{it.status === 'uploading' ? 'Uploading file…' : 'Converting with TOOLBeans…'}</span>
                        <span>{it.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: it.progress + '%' }} />
                      </div>
                    </div>
                  )}

                  {/* Per-file error */}
                  {it.status === 'error' && it.error && (
                    <p className="mt-2 text-xs text-red-600">{it.error}</p>
                  )}

                  {/* Done note */}
                  {it.status === 'done' && (
                    <p className="mt-2 text-xs text-green-600">
                      Saved as <strong>TOOLBeans-{it.file.name.replace(/\.[^.]+$/, '')}.pdf</strong>
                    </p>
                  )}
                </div>
              );
            })}

            {/* Convert button */}
            {pendingCount > 0 && (
              <button
                onClick={convertAll} disabled={anyConverting}
                className="w-full bg-red-500 hover:bg-red-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-100 text-base flex items-center justify-center gap-3"
              >
                {anyConverting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Converting…
                  </>
                ) : (pendingCount > 1 ? `📄 Convert ${pendingCount} files to PDF` : '📄 Convert to PDF')}
              </button>
            )}

            {/* All done banner */}
            {pendingCount === 0 && doneCount > 0 && !anyConverting && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2 select-none">✅</div>
                <p className="font-bold text-green-800 text-base mb-1">
                  {doneCount > 1 ? `${doneCount} PDFs Downloaded Successfully!` : 'PDF Downloaded Successfully!'}
                </p>
                <p className="text-sm text-green-600">Add more files above or clear the queue to start over.</p>
              </div>
            )}
          </div>
        )}

        {/* Support table */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">✅ Fully Preserved</p>
            <ul className="space-y-1.5">
              {['Cell content and values','Cell borders and colors','Column widths and row heights','Merged cells','Number formatting','Text formatting (bold, italic)','Multiple sheets (each as a page)','Basic charts','Freeze panes layout','Print area settings'].map(i => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-2"><span className="text-green-500 flex-shrink-0">✓</span>{i}</li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">⚠️ Limited Support</p>
            <ul className="space-y-1.5">
              {['Complex pivot tables','Macro and VBA code','Password-protected sheets','Some advanced chart types','Conditional formatting rules','Custom form controls'].map(i => (
                <li key={i} className="text-xs text-slate-600 flex items-center gap-2"><span className="text-amber-500 flex-shrink-0">~</span>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', icon: '📂', t: 'Upload Excel Files',   d: 'Drag and drop one or more .xlsx or .xls files. Up to 50 MB each.' },
            { n: '2', icon: '⚙️', t: 'TOOLBeans Converts', d: 'Each file is sent to our secure server and converted with full cell and chart fidelity using professional-grade conversion software.' },
            { n: '3', icon: '⬇️', t: 'PDFs Download',        d: 'Each PDF downloads automatically. Every file is deleted from our server immediately after conversion.' },
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

      {/* ════════════════════════════════════════════════ */}
      {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
      {/* ════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 pb-16 flex flex-col gap-5">

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free Excel to PDF Converter  All Cells and Charts Preserved</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans Excel to PDF converter turns your .xlsx and .xls spreadsheets into clean, print-ready PDF documents while keeping the layout exactly as you designed it. It is powered by LibreOffice Calc running on a dedicated server, the same rendering engine trusted for high-fidelity office conversions, so cell borders, background colors, merged cells, column widths, row heights, number formatting and charts all carry across faithfully. Each sheet in your workbook becomes its own page in the PDF.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Converting a spreadsheet to PDF is the simplest way to share data that should look the same for everyone. A PDF cannot be accidentally edited, it prints identically on any device, and the recipient does not need Excel or any spreadsheet software to open it. That makes PDF the natural format for invoices, financial reports, schedules, price lists and any spreadsheet you are sending to a client or filing for records.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            You can now convert several spreadsheets in a single session: add as many files as you like to the queue and the tool processes them one after another, downloading each as its own PDF. Files are uploaded securely over HTTPS, converted immediately, and deleted from the server right after the download completes. There is no signup, no watermark and no cost.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Convert Excel to PDF  Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Add your Excel files', 'Drag and drop one or more .xlsx or .xls files onto the upload area, or click to browse. Each file can be up to 50 MB, and you can add several at once.'],
              ['2', 'Review the queue', 'Every file appears in the queue with its name, size and a status badge. Remove any you did not mean to add before converting.'],
              ['3', 'Click Convert', 'Press Convert to PDF. The tool processes each file in turn, showing an upload and conversion progress bar so you always know where it is.'],
              ['4', 'Download happens automatically', 'As each conversion finishes, the PDF downloads to your device automatically, named after the original file with a TOOLBeans prefix.'],
              ['5', 'Retry if needed', 'If a file fails because of a temporary network issue, click Retry to try again without re-uploading. Transient errors are also retried once automatically.'],
              ['6', 'Convert more or clear', 'Add more files to keep converting, clear just the completed ones, or clear the whole queue to start fresh.'],
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

        {/* Why PDF */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Why Convert a Spreadsheet to PDF?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['🔒', 'Locked layout', 'A PDF looks identical on every device and cannot be accidentally edited, so the numbers and formatting you send are exactly what the recipient sees.'],
              ['🖨️', 'Reliable printing', 'PDFs print the same everywhere, with your print area, page breaks and column widths respected, unlike a spreadsheet that reflows per machine.'],
              ['📤', 'No software needed', 'Recipients open a PDF in any browser or reader. They do not need Excel, LibreOffice or a matching version to view it.'],
              ['📁', 'Easy archiving', 'PDF is a long-term, self-contained format ideal for records, audits and compliance, where a spreadsheet might break across software versions.'],
              ['✉️', 'Professional sharing', 'Invoices, reports and quotes look finished and tamper-resistant as a PDF, which is what clients and stakeholders expect.'],
              ['🔗', 'Combine and sign', 'Once in PDF, your spreadsheet can be merged with other documents, e-signed, or attached to a larger report.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* What's preserved deep-dive */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What Gets Preserved in the Conversion</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            Because the conversion uses a full spreadsheet engine rather than a simple data dump, the visual result matches your original closely. Here is what carries across and what to watch for.
          </p>
          <div className="flex flex-col gap-3">
            {[
              ['Cells, borders and colors', 'All cell values, border styles, fill colors and font colors are rendered exactly as in Excel, so tables look the same in the PDF.'],
              ['Merged cells and sizing', 'Merged cells, custom column widths and row heights are honoured, keeping headers and layouts intact.'],
              ['Number and text formatting', 'Currency, percentage, date and custom number formats are preserved, along with bold, italic and alignment.'],
              ['Multiple sheets', 'Every worksheet in the workbook is converted, with each sheet placed on its own page in the resulting PDF.'],
              ['Charts', 'Standard column, bar, line and pie charts are rendered into the PDF. Very advanced or custom chart types may have limited fidelity.'],
              ['Print settings', 'Print area and freeze-pane layout are respected, so the PDF reflects how the sheet was set up to print.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[190px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Privacy / reliability */}
        <article className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Security, Privacy and Reliability</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Your spreadsheets often hold sensitive information, so the conversion is built to respect that. Files are uploaded over an encrypted HTTPS connection, converted on the server, and then deleted immediately once your PDF has been generated and downloaded. Nothing is kept, indexed or shared, and there is no account that ties files to your identity.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            For reliability, each file converts independently, so one problem file never blocks the rest of your queue. If a conversion hits a temporary network error it is retried automatically once, and any file that still fails can be retried with a single click without re-uploading. This makes batch conversions dependable even on a flaky connection.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is the Excel to PDF converter free?', 'Yes. It is completely free with no usage limits, no account and no signup. There is no watermark on the output and no cap on how many files you convert.'],
              ['Can I convert more than one file at once?', 'Yes. Add as many .xlsx or .xls files as you like to the queue and the tool converts them one after another in the same session, downloading each as its own PDF.'],
              ['Are multiple sheets in a workbook converted?', 'Yes. Each worksheet in your Excel file becomes a separate page in the resulting PDF, in the same order as in the workbook.'],
              ['Is my Excel file stored on your server?', 'No. Your file is uploaded over HTTPS, converted, and then deleted immediately after the PDF is downloaded. Nothing is retained.'],
              ['Are charts preserved in the PDF?', 'Standard charts such as column, bar, line and pie are preserved. Very advanced or custom chart types may have limited support but the underlying data and layout still convert.'],
              ['What happens if a conversion fails?', 'If a file fails, you can retry it with one click without re-uploading. Transient network errors are retried automatically once, and other files in the queue are unaffected.'],
              ['What is the maximum file size?', 'Each Excel file can be up to 50 MB. Only .xlsx and .xls spreadsheet formats are accepted; other file types are rejected with a clear message.'],
              ['Will my formulas show up?', 'The converter renders the calculated values and the visual formatting of the sheet, exactly as the spreadsheet displays them, rather than the raw formula text, which is what you want in a shareable PDF.'],
              ['Do I need to install anything?', 'No. The converter runs in your browser and on our server. There is nothing to download or install, and it works on any operating system.'],
              ['Does it work on mobile?', 'Yes. You can upload and convert spreadsheets from a phone or tablet browser, and the PDF downloads to your device just as it does on desktop.'],
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

        {/* Closing cross-links (preserved spirit of original SEO block) */}
        <article className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <p className="text-sm text-slate-500 leading-relaxed">
            Looking for other conversions? Try{' '}
            <Link href="/tools/word-to-pdf"       className="text-red-500 hover:underline">Word to PDF</Link>,{' '}
            <Link href="/tools/powerpoint-to-pdf" className="text-red-500 hover:underline">PowerPoint to PDF</Link>,{' '}
            <Link href="/tools/html-to-pdf"        className="text-red-500 hover:underline">HTML to PDF</Link>{' '}
            and{' '}
            <Link href="/tools/csv-to-sql"        className="text-red-500 hover:underline">CSV to SQL</Link>.
          </p>
        </article>

      </section>

    </div>
  );
}