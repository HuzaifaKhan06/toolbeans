'use client';

import { useState, useRef } from 'react';

// ── SQL Formatter (loaded dynamically) ──
let sqlFormatterLib = null;

const loadFormatter = async () => {
  if (!sqlFormatterLib) {
    const mod = await import('sql-formatter');
    sqlFormatterLib = mod;
  }
  return sqlFormatterLib;
};

// ── Keyword Highlighter ──
const SQL_KEYWORDS = [
  'SELECT','FROM','WHERE','JOIN','LEFT','RIGHT','INNER','OUTER','FULL','CROSS',
  'ON','AS','AND','OR','NOT','IN','EXISTS','BETWEEN','LIKE','IS','NULL',
  'INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','ALTER',
  'DROP','INDEX','VIEW','DATABASE','SCHEMA','TRUNCATE','RENAME',
  'GROUP BY','ORDER BY','HAVING','LIMIT','OFFSET','UNION','ALL','DISTINCT',
  'CASE','WHEN','THEN','ELSE','END','WITH','OVER','PARTITION BY','ROWS',
  'PRIMARY KEY','FOREIGN KEY','REFERENCES','CONSTRAINT','DEFAULT','UNIQUE',
  'COUNT','SUM','AVG','MIN','MAX','COALESCE','NULLIF','CAST','CONVERT',
  'BEGIN','COMMIT','ROLLBACK','TRANSACTION',
];

const highlightSQL = (sql) => {
  if (!sql) return '';

  const escaped = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Highlight strings
  let result = escaped.replace(
    /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g,
    '<span class="sql-string">$1</span>'
  );

  // Highlight comments
  result = result.replace(
    /(--[^\n]*|\/\*[\s\S]*?\*\/)/g,
    '<span class="sql-comment">$1</span>'
  );

  // Highlight numbers
  result = result.replace(
    /\b(\d+(?:\.\d+)?)\b/g,
    '<span class="sql-number">$1</span>'
  );

  // Highlight keywords (sorted by length desc to match longer first)
  const sorted = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  sorted.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw.replace(/\s+/g, '\\s+')})\\b`, 'gi');
    result = result.replace(regex, '<span class="sql-keyword">$1</span>');
  });

  // Highlight operators
  result = result.replace(
    /([=<>!]+|[\+\-\*\/\%])/g,
    '<span class="sql-operator">$1</span>'
  );

  return result;
};

// ── Dialects ──
const DIALECTS = [
  { key: 'sql',        label: 'Standard SQL',  icon: '🗄️' },
  { key: 'mysql',      label: 'MySQL',         icon: '🐬' },
  { key: 'postgresql', label: 'PostgreSQL',    icon: '🐘' },
  { key: 'tsql',       label: 'SQL Server',    icon: '🪟' },
  { key: 'sqlite',     label: 'SQLite',        icon: '📦' },
  { key: 'mariadb',    label: 'MariaDB',       icon: '🦭' },
];

// ── Keyword Case Options ──
const KW_CASES = [
  { key: 'upper',     label: 'UPPERCASE' },
  { key: 'lower',     label: 'lowercase' },
  { key: 'preserve',  label: 'Preserve'  },
];

// ── Sample Queries ──
const SAMPLES = [
  {
    label: 'Basic SELECT',
    sql: `select u.id,u.name,u.email,o.total from users u inner join orders o on u.id=o.user_id where u.active=1 and o.total>100 order by o.total desc limit 10`,
  },
  {
    label: 'Aggregation',
    sql: `select department,count(*) as emp_count,avg(salary) as avg_salary,min(salary) as min_salary,max(salary) as max_salary from employees where hire_date>='2020-01-01' group by department having count(*)>5 order by avg_salary desc`,
  },
  {
    label: 'Subquery',
    sql: `select p.name,p.price,p.category from products p where p.price>(select avg(price) from products where category=p.category) and p.stock>0 order by p.category,p.price`,
  },
  {
    label: 'INSERT',
    sql: `insert into orders(user_id,product_id,quantity,price,status,created_at) values(1,42,3,29.99,'pending',now()),(2,17,1,99.99,'paid',now())`,
  },
  {
    label: 'CREATE TABLE',
    sql: `create table if not exists users(id int not null auto_increment,name varchar(100) not null,email varchar(255) unique not null,password varchar(255) not null,role enum('admin','user','guest') default 'user',created_at timestamp default current_timestamp,primary key(id),index idx_email(email))`,
  },
  {
    label: 'CTE + Window',
    sql: `with ranked_sales as(select salesperson_id,region,amount,row_number() over(partition by region order by amount desc) as rank from sales where year=2024) select s.name,r.region,r.amount,r.rank from ranked_sales r join salespersons s on r.salesperson_id=s.id where r.rank<=3`,
  },
];

// ── Stats ──
const getSQLStats = (sql) => {
  if (!sql.trim()) return null;
  const upper = sql.toUpperCase();
  return {
    chars:      sql.length,
    lines:      sql.split('\n').length,
    keywords:   (sql.match(/\b(SELECT|FROM|WHERE|JOIN|GROUP|ORDER|HAVING|UNION)\b/gi) || []).length,
    tables:     (sql.match(/(?:FROM|JOIN)\s+([a-zA-Z_]\w*)/gi) || []).length,
    conditions: (sql.match(/\b(AND|OR)\b/gi) || []).length,
    hasSubquery:upper.includes('SELECT') && (upper.match(/SELECT/g) || []).length > 1,
  };
};

export default function SQLTool() {
  const [input, setInput]           = useState('');
  const [output, setOutput]         = useState('');
  const [highlighted, setHighlighted] = useState('');
  const [dialect, setDialect]       = useState('sql');
  const [kwCase, setKwCase]         = useState('upper');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [activeView, setActiveView] = useState('output');
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const fileRef                     = useRef(null);

  // ── Format ──
  const handleFormat = async () => {
    if (!input.trim()) {
      setError('Please paste a SQL query to format.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const lib = await loadFormatter();
      const result = lib.format(input, {
        language:       dialect,
        keywordCase:    kwCase,
        indentStyle:    'standard',
        tabWidth:       indentSize,
        linesBetweenQueries: 2,
      });
      setOutput(result);
      setHighlighted(highlightSQL(result));
      setActiveView('output');
      setHistory((prev) => [{
        dialect,
        preview: result.slice(0, 70) + (result.length > 70 ? '…' : ''),
        full: result,
        input: input.slice(0, 70),
        time: new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 8));

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'sql_formatted', { dialect });
      }
    } catch (e) {
      setError(`Formatting failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Minify ──
  const handleMinify = () => {
    if (!input.trim()) { setError('Please paste a SQL query first.'); return; }
    setError('');
    const minified = input
      .replace(/\s+/g, ' ')
      .replace(/\s*([=<>!,();])\s*/g, '$1')
      .trim();
    setOutput(minified);
    setHighlighted(highlightSQL(minified));
    setActiveView('output');
  };

  // ── Uppercase / Lowercase keywords ──
  const handleCase = (targetCase) => {
    if (!input.trim()) return;
    let result = input;
    SQL_KEYWORDS.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      result = result.replace(regex, targetCase === 'upper' ? kw.toUpperCase() : kw.toLowerCase());
    });
    setInput(result);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadSQL = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'toolbeans-query.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  const pasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      setOutput('');
      setError('');
    } catch { /* ignore */ }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target?.result || '');
      setOutput('');
      setError('');
    };
    reader.readAsText(file);
  };

  const stats    = getSQLStats(input);
  const outStats = output ? getSQLStats(output) : null;

  // ── Line numbers helper ──
  const withLineNumbers = (text) => {
    return text.split('\n').map((line, i) => ({
      num: i + 1,
      content: line,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Highlight styles injected */}
      <style>{`
        .sql-keyword  { color: #4f46e5; font-weight: 700; }
        .sql-string   { color: #b45309; }
        .sql-number   { color: #0891b2; }
        .sql-comment  { color: #94a3b8; font-style: italic; }
        .sql-operator { color: #be123c; font-weight: 600; }
      `}</style>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-indigo-50 border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Database Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            SQL{' '}
            <span className="bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text text-transparent">
              Formatter & Beautifier
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto">
            Format messy SQL queries into clean, readable code with syntax highlighting.
            Supports MySQL, PostgreSQL, SQL Server, SQLite and more 100% free.
          </p>
        </div>
      </section>

      {/* ── AD TOP ── */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-8">

        {/* ── DIALECT SELECTOR ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Dialect */}
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">SQL Dialect</div>
              <div className="flex flex-wrap gap-2">
                {DIALECTS.map((d) => (
                  <button key={d.key} onClick={() => setDialect(d.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all
                      ${dialect === d.key
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                      }`}>
                    <span>{d.icon}</span>
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Case */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keyword Case</div>
              <div className="flex gap-2">
                {KW_CASES.map((k) => (
                  <button key={k.key} onClick={() => setKwCase(k.key)}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-bold font-mono transition-all
                      ${kwCase === k.key
                        ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-rose-300'
                      }`}>
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Indent */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Indent</div>
              <div className="flex gap-1">
                {[2, 4].map((v) => (
                  <button key={v} onClick={() => setIndentSize(v)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold border-2 transition-all
                      ${indentSize === v
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
                      }`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SAMPLES ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Samples</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button key={s.label}
                onClick={() => { setInput(s.sql); setOutput(''); setError(''); setHighlighted(''); }}
                className="text-xs bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-700 font-semibold px-3 py-2 rounded-xl transition-all">
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

          {/* ── INPUT ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SQL Input</span>
                {input && (
                  <span className="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    {input.length} chars
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={pasteInput} className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all">⎘ Paste</button>
                <button onClick={() => fileRef.current?.click()} className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-all">📎 .sql</button>
                <input ref={fileRef} type="file" accept=".sql,.txt" className="hidden" onChange={handleFile} />
                <button onClick={() => { setInput(''); setOutput(''); setError(''); setHighlighted(''); }}
                  className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all">
                  ✕ Clear
                </button>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              placeholder={`Paste your SQL query here…\n\nExample:\nselect u.id,u.name from users u\nwhere u.active=1 order by u.name`}
              className="w-full px-5 py-4 text-sm text-slate-700 outline-none resize-none font-mono leading-relaxed bg-white flex-1"
              style={{ minHeight: '280px' }}
              spellCheck={false}
            />

            {/* Error */}
            {error && (
              <div className="mx-5 mb-4 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-600 font-medium">
                <span className="flex-shrink-0 text-base">⚠️</span>
                <div>
                  <div className="font-bold mb-0.5">Error</div>
                  <code className="font-mono">{error}</code>
                </div>
              </div>
            )}

            {/* Input Stats */}
            {stats && (
              <div className="flex items-center gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                {[
                  { label: 'Chars',      value: stats.chars },
                  { label: 'Lines',      value: stats.lines },
                  { label: 'Keywords',   value: stats.keywords },
                  { label: 'Tables',     value: stats.tables },
                  { label: 'Conditions', value: stats.conditions },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-700">{s.value}</span>
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                ))}
                {stats.hasSubquery && (
                  <span className="text-xs bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full ml-auto">
                    Subquery detected
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── OUTPUT ── */}
          <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all ${output ? 'border-indigo-200' : 'border-slate-200'}`}>

            {/* View Tabs */}
            <div className={`flex items-center justify-between px-3 py-2 border-b transition-all ${output ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex gap-1">
                {[
                  { key: 'output',      label: '{ } Formatted' },
                  { key: 'highlighted', label: '🎨 Highlighted' },
                ].map((v) => (
                  <button key={v.key} onClick={() => setActiveView(v.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${activeView === v.key
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                      }`}>
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 items-center">
                {/* Line Numbers toggle */}
                <button
                  onClick={() => setLineNumbers(!lineNumbers)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all border
                    ${lineNumbers
                      ? 'bg-slate-200 text-slate-600 border-slate-200'
                      : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  title="Toggle line numbers"
                >
                  #
                </button>
                <button onClick={copyOutput} disabled={!output}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all
                    ${copied ? 'bg-green-500 text-white' : output ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                  {copied ? '✓ Copied' : '⎘ Copy'}
                </button>
                <button onClick={downloadSQL} disabled={!output}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${output ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}>
                  ⬇ .sql
                </button>
              </div>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-auto" style={{ minHeight: '280px' }}>
              {output ? (
                activeView === 'highlighted' ? (
                  <div className="px-5 py-4 overflow-x-auto">
                    {lineNumbers ? (
                      <table className="w-full border-collapse">
                        <tbody>
                          {withLineNumbers(output).map((line) => (
                            <tr key={line.num} className="hover:bg-slate-50">
                              <td className="text-right pr-4 py-0.5 text-xs text-slate-300 font-mono select-none w-8 align-top flex-shrink-0">
                                {line.num}
                              </td>
                              <td className="py-0.5">
                                <code
                                  className="text-sm font-mono leading-relaxed whitespace-pre"
                                  dangerouslySetInnerHTML={{ __html: highlightSQL(line.content) || '&nbsp;' }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <pre
                        className="text-sm font-mono leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex overflow-x-auto" style={{ minHeight: '280px' }}>
                    {lineNumbers && (
                      <div className="flex flex-col px-3 py-4 bg-slate-50 border-r border-slate-100 select-none flex-shrink-0">
                        {output.split('\n').map((_, i) => (
                          <span key={i} className="text-xs text-slate-300 font-mono leading-relaxed text-right" style={{ lineHeight: '1.625rem' }}>
                            {i + 1}
                          </span>
                        ))}
                      </div>
                    )}
                    <pre className="px-5 py-4 text-sm text-slate-700 font-mono leading-relaxed whitespace-pre flex-1 select-all">
                      {output}
                    </pre>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16 text-slate-300">
                  <div className="text-5xl mb-3">🗄️</div>
                  <div className="text-sm">Paste SQL and click Format</div>
                </div>
              )}
            </div>

            {/* Output Stats */}
            {outStats && (
              <div className="flex items-center gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                {[
                  { label: 'Lines', value: outStats.lines },
                  { label: 'Chars', value: outStats.chars },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-700">{s.value}</span>
                    <span className="text-xs text-slate-400">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex flex-wrap gap-3 items-center">
            <button onClick={handleFormat} disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-300 text-white font-bold px-7 py-3.5 rounded-xl transition-all text-sm flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200">
              {loading ? (
                <><span className="animate-spin">⟳</span> Formatting…</>
              ) : (
                <>✨ Format SQL</>
              )}
            </button>
            <button onClick={handleMinify}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm flex items-center gap-2">
              ⬌ Minify
            </button>
            <button onClick={() => handleCase('upper')}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-5 py-3.5 rounded-xl transition-all text-sm font-mono">
              UPPERCASE Keywords
            </button>
            <button onClick={() => handleCase('lower')}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-5 py-3.5 rounded-xl transition-all text-sm font-mono">
              lowercase keywords
            </button>
            {output && (
              <button onClick={downloadSQL}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm flex items-center gap-2 ml-auto">
                ⬇️ Download .sql
              </button>
            )}
          </div>
        </div>

        {/* ── HISTORY ── */}
        {history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
            <button onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">🕐 History ({history.length})</span>
              <span className="text-slate-400 text-sm">{showHistory ? '▲' : '▼'}</span>
            </button>
            {showHistory && (
              <div className="border-t border-slate-100 divide-y divide-slate-50">
                {history.map((h, i) => (
                  <div key={i} onClick={() => { setOutput(h.full); setHighlighted(highlightSQL(h.full)); }}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 font-mono bg-indigo-50 text-indigo-600">{h.dialect}</span>
                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">{h.time}</span>
                    <span className="text-xs text-slate-500 font-mono truncate flex-1">{h.preview}</span>
                  </div>
                ))}
                <div className="px-6 py-3 bg-slate-50">
                  <button onClick={() => setHistory([])} className="text-xs text-rose-400 hover:text-rose-600 font-semibold">Clear History</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AD MIDDLE ── */}
        <div className="mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement 728×90
          </div>
        </div>

        {/* ── INFO CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { icon: '🎨', title: 'Syntax Highlighting',  desc: 'Color-coded keywords, strings, numbers and operators for easy reading.', color: 'bg-indigo-50 border-indigo-100' },
            { icon: '🌍', title: '6 SQL Dialects',       desc: 'Format for MySQL, PostgreSQL, SQL Server, SQLite, MariaDB or standard SQL.', color: 'bg-rose-50 border-rose-100' },
            { icon: '⬇️', title: 'Download as .sql',     desc: 'Save your formatted query as a .sql file ready to use in any editor.', color: 'bg-green-50 border-green-100' },
          ].map((c) => (
            <div key={c.title} className={`border rounded-2xl p-5 ${c.color}`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-bold text-slate-800 text-sm mb-1">{c.title}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">
            Why Format Your SQL Queries?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-7">
            {[
              { icon: '👁️', title: 'Readability',       desc: 'Clean indentation and line breaks make complex queries easy to understand at a glance.' },
              { icon: '🐛', title: 'Easier Debugging',  desc: 'Spot syntax errors, missing clauses, and logic issues faster in formatted code.' },
              { icon: '🤝', title: 'Team Collaboration', desc: 'Consistent formatting standards make code reviews smoother and handovers easier.' },
              { icon: '📚', title: 'Documentation',     desc: 'Formatted queries are easier to copy into docs, wikis, and README files.' },
              { icon: '⚡', title: 'Performance Review', desc: 'Well-formatted SQL makes it easier to spot inefficiencies and missing indexes.' },
              { icon: '🎓', title: 'Learning SQL',      desc: 'See how queries should be structured great for students and new developers.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{f.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base font-extrabold text-slate-900 mb-3">Dialect Differences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { db: '🐬 MySQL',       note: 'Backtick identifiers, LIMIT/OFFSET syntax' },
              { db: '🐘 PostgreSQL',  note: 'Double-quote identifiers, rich window functions' },
              { db: '🪟 SQL Server',  note: 'Bracket identifiers, TOP instead of LIMIT' },
              { db: '📦 SQLite',      note: 'Lightweight, limited ALTER TABLE support' },
              { db: '🦭 MariaDB',     note: 'MySQL-compatible with extra extensions' },
              { db: '🗄️ Standard SQL', note: 'ANSI SQL-92 compliant, works everywhere' },
            ].map((d) => (
              <div key={d.db} className="flex gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-700">{d.db}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{d.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}