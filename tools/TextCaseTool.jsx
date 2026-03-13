'use client';

import { useState, useRef } from 'react';

const CONVERSIONS = [
  {
    key: 'upper',
    label: 'UPPERCASE',
    icon: '🔠',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    activeColor: 'bg-indigo-600 border-indigo-600 text-white',
    desc: 'ALL LETTERS CAPITALIZED',
    example: 'HELLO WORLD',
  },
  {
    key: 'lower',
    label: 'lowercase',
    icon: '🔡',
    color: 'bg-slate-50 border-slate-200 text-slate-600',
    activeColor: 'bg-slate-700 border-slate-700 text-white',
    desc: 'all letters lowercase',
    example: 'hello world',
  },
  {
    key: 'title',
    label: 'Title Case',
    icon: '📝',
    color: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    activeColor: 'bg-cyan-600 border-cyan-600 text-white',
    desc: 'First Letter Of Each Word',
    example: 'Hello World',
  },
  {
    key: 'sentence',
    label: 'Sentence case',
    icon: '✏️',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    activeColor: 'bg-teal-600 border-teal-600 text-white',
    desc: 'First letter of sentence',
    example: 'Hello world, this is text.',
  },
  {
    key: 'camel',
    label: 'camelCase',
    icon: '🐪',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    activeColor: 'bg-orange-500 border-orange-500 text-white',
    desc: 'firstWordLower RestCapital',
    example: 'helloWorldExample',
  },
  {
    key: 'pascal',
    label: 'PascalCase',
    icon: '🏛️',
    color: 'bg-violet-50 border-violet-200 text-violet-700',
    activeColor: 'bg-violet-600 border-violet-600 text-white',
    desc: 'EveryWordCapitalized',
    example: 'HelloWorldExample',
  },
  {
    key: 'snake',
    label: 'snake_case',
    icon: '🐍',
    color: 'bg-green-50 border-green-200 text-green-700',
    activeColor: 'bg-green-600 border-green-600 text-white',
    desc: 'words_joined_by_underscores',
    example: 'hello_world_example',
  },
  {
    key: 'kebab',
    label: 'kebab-case',
    icon: '🍢',
    color: 'bg-rose-50 border-rose-200 text-rose-700',
    activeColor: 'bg-rose-500 border-rose-500 text-white',
    desc: 'words-joined-by-hyphens',
    example: 'hello-world-example',
  },
  {
    key: 'constant',
    label: 'CONSTANT_CASE',
    icon: '⚡',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    activeColor: 'bg-yellow-500 border-yellow-500 text-white',
    desc: 'UPPER_WITH_UNDERSCORES',
    example: 'HELLO_WORLD_EXAMPLE',
  },
  {
    key: 'dot',
    label: 'dot.case',
    icon: '•',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    activeColor: 'bg-pink-500 border-pink-500 text-white',
    desc: 'words.separated.by.dots',
    example: 'hello.world.example',
  },
  {
    key: 'path',
    label: 'path/case',
    icon: '📁',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    activeColor: 'bg-amber-500 border-amber-500 text-white',
    desc: 'words/like/a/file/path',
    example: 'hello/world/example',
  },
  {
    key: 'mock',
    label: 'mOcK cAsE',
    icon: '🃏',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    activeColor: 'bg-purple-500 border-purple-500 text-white',
    desc: 'AlTeRnAtInG cApS',
    example: 'hElLo WoRlD',
  },
];

// ── Conversion Logic ──
function getWords(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[\-_./]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

function convert(text, type) {
  if (!text) return '';

  const lines = text.split('\n');

  const convertLine = (line) => {
    if (!line.trim()) return line;
    const words = getWords(line);

    switch (type) {
      case 'upper':
        return line.toUpperCase();

      case 'lower':
        return line.toLowerCase();

      case 'title':
        return line.replace(/\w\S*/g, (w) =>
          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        );

      case 'sentence':
        return line.charAt(0).toUpperCase() +
          line.slice(1).toLowerCase().replace(/([.!?]\s+)([a-z])/g,
            (_, p, c) => p + c.toUpperCase()
          );

      case 'camel':
        return words
          .map((w, i) =>
            i === 0
              ? w.toLowerCase()
              : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          )
          .join('');

      case 'pascal':
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join('');

      case 'snake':
        return words.map((w) => w.toLowerCase()).join('_');

      case 'kebab':
        return words.map((w) => w.toLowerCase()).join('-');

      case 'constant':
        return words.map((w) => w.toUpperCase()).join('_');

      case 'dot':
        return words.map((w) => w.toLowerCase()).join('.');

      case 'path':
        return words.map((w) => w.toLowerCase()).join('/');

      case 'mock':
        return line
          .split('')
          .map((c, i) =>
            i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
          )
          .join('');

      default:
        return line;
    }
  };

  return lines.map(convertLine).join('\n');
}

// ── Stats ──
function getStats(text) {
  if (!text) return { chars: 0, words: 0, lines: 0, sentences: 0 };
  return {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
    sentences: text.split(/[.!?]+/).filter((s) => s.trim()).length,
  };
}

export default function TextCaseTool() {
  const [input, setInput]         = useState('');
  const [output, setOutput]       = useState('');
  const [activeKey, setActiveKey] = useState('');
  const [copied, setCopied]       = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [history, setHistory]     = useState([]);
  const textareaRef               = useRef(null);

  const handleConvert = (key) => {
    if (!input.trim()) return;
    const result = convert(input, key);
    setOutput(result);
    setActiveKey(key);
    setHistory((prev) => [
      { key, label: CONVERSIONS.find((c) => c.key === key)?.label, input, output: result },
      ...prev,
    ].slice(0, 8));
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'text_converted', { type: key });
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyInput = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2500);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      setOutput('');
      setActiveKey('');
    } catch {
      textareaRef.current?.focus();
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setActiveKey('');
  };

  const swapText = () => {
    if (!output) return;
    setInput(output);
    setOutput('');
    setActiveKey('');
  };

  const inputStats  = getStats(input);
  const outputStats = getStats(output);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-indigo-50 border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Text Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Text Case{' '}
            <span className="bg-gradient-to-r from-orange-500 to-indigo-600 bg-clip-text text-transparent">
              Converter
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto">
            Convert text between 12 different case formats instantly.
            Perfect for developers, writers, and content creators.
          </p>
        </div>
      </section>

      {/* ── AD ── */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>

      {/* ── MAIN TOOL ── */}
      <section className="max-w-6xl mx-auto px-6 py-8">

        {/* ── CONVERSION BUTTONS GRID ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Format to Convert
            </label>
            <span className="text-xs text-slate-400">
              {CONVERSIONS.length} formats available
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CONVERSIONS.map((c) => (
              <button
                key={c.key}
                onClick={() => handleConvert(c.key)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center group
                  ${activeKey === c.key
                    ? c.activeColor + ' shadow-md scale-105'
                    : c.color + ' hover:scale-102 hover:shadow-sm'
                  }`}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-xs font-bold leading-tight font-mono">{c.label}</span>
                <span className={`text-xs leading-tight opacity-60 hidden sm:block
                  ${activeKey === c.key ? 'opacity-80' : ''}`}>
                  {c.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── TEXT PANELS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Input */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Input Text
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={pasteFromClipboard}
                  className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                >
                  ⎘ Paste
                </button>
                <button
                  onClick={copyInput}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all
                    ${copiedInput
                      ? 'bg-green-50 text-green-600'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  {copiedInput ? '✓ Copied' : '⎘ Copy'}
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all"
                >
                  ✕ Clear
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (activeKey) handleConvert(activeKey);
              }}
              placeholder="Paste or type your text here…&#10;&#10;Examples:&#10;• helloWorldExample&#10;• hello-world-example&#10;• Hello World Text"
              className="w-full px-5 py-4 text-sm text-slate-700 outline-none resize-none font-mono leading-relaxed bg-white"
              style={{ minHeight: '220px' }}
            />

            {/* Stats Bar */}
            <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
              {[
                { label: 'Chars', value: inputStats.chars },
                { label: 'No Space', value: inputStats.charsNoSpace },
                { label: 'Words', value: inputStats.words },
                { label: 'Lines', value: inputStats.lines },
                { label: 'Sentences', value: inputStats.sentences },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">{s.value}</span>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Output */}
          <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300
            ${output ? 'border-indigo-200' : 'border-slate-200'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-3.5 border-b transition-all duration-300
              ${output ? 'border-indigo-100 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Output
                </span>
                {activeKey && (
                  <span className="text-xs bg-indigo-100 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                    {CONVERSIONS.find((c) => c.key === activeKey)?.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {output && (
                  <button
                    onClick={swapText}
                    title="Use output as new input"
                    className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                  >
                    ⇅ Use as Input
                  </button>
                )}
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200
                    ${copied
                      ? 'bg-green-500 text-white'
                      : output
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                >
                  {copied ? '✓ Copied!' : '⎘ Copy Result'}
                </button>
              </div>
            </div>

            {/* Output Content */}
            <div
              className="px-5 py-4 font-mono text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words select-all"
              style={{ minHeight: '220px' }}
            >
              {output || (
                <span className="text-slate-300 font-sans">
                  Converted text will appear here…<br /><br />
                  Select a format above to convert your text.
                </span>
              )}
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
              {[
                { label: 'Chars', value: outputStats.chars },
                { label: 'No Space', value: outputStats.charsNoSpace },
                { label: 'Words', value: outputStats.words },
                { label: 'Lines', value: outputStats.lines },
                { label: 'Sentences', value: outputStats.sentences },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">{s.value}</span>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── QUICK CONVERT ALL ── */}
        {input.trim() && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ⚡ All Conversions Preview
              </label>
              <span className="text-xs text-slate-400">Click any row to copy</span>
            </div>
            <div className="divide-y divide-slate-100">
              {CONVERSIONS.map((c) => {
                const result = convert(input, c.key);
                return (
                  <div
                    key={c.key}
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      setOutput(result);
                      setActiveKey(c.key);
                    }}
                    className="flex items-center gap-4 py-2.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer group transition-all"
                  >
                    <span className="text-base w-7 flex-shrink-0">{c.icon}</span>
                    <span className="text-xs font-bold text-slate-500 w-32 flex-shrink-0 font-mono">
                      {c.label}
                    </span>
                    <span className="text-sm text-slate-700 font-mono truncate flex-1">
                      {result}
                    </span>
                    <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      Copy ⎘
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                🕐 Recent Conversions
              </span>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-rose-400 hover:text-rose-600 font-semibold"
              >
                Clear
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => { setOutput(h.output); setActiveKey(h.key); }}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex-shrink-0 font-mono">
                    {h.label}
                  </span>
                  <span className="text-sm text-slate-600 font-mono truncate">{h.output}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AD ── */}
        <div className="mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement 728×90
          </div>
        </div>

        {/* ── FORMAT REFERENCE ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">
            Format Reference Guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONVERSIONS.map((c) => (
              <div
                key={c.key}
                className={`border rounded-xl p-4 ${c.color}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{c.icon}</span>
                  <span className="font-bold text-sm font-mono">{c.label}</span>
                </div>
                <code className="text-xs opacity-80 block mb-1">{c.example}</code>
                <p className="text-xs opacity-60">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            When to Use Each Case Format
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { case: 'camelCase',     use: 'JavaScript variables and function names',       example: 'getUserData()' },
              { case: 'PascalCase',    use: 'React components, class names',                  example: 'UserProfile' },
              { case: 'snake_case',    use: 'Python variables, database column names',        example: 'user_first_name' },
              { case: 'kebab-case',    use: 'CSS class names, URL slugs, HTML attributes',    example: 'main-nav-link' },
              { case: 'CONSTANT_CASE', use: 'Environment variables, constants',               example: 'MAX_RETRY_COUNT' },
              { case: 'Title Case',    use: 'Article headings, book titles, UI labels',       example: 'Getting Started Guide' },
              { case: 'dot.case',      use: 'Config keys, package names',                     example: 'server.port.number' },
              { case: 'path/case',     use: 'File paths, API endpoints',                      example: 'api/user/profile' },
            ].map((r) => (
              <div key={r.case} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                      {r.case}
                    </code>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{r.use}</p>
                  <code className="text-xs text-slate-400 font-mono">{r.example}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}