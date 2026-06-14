'use client';

import { useState, useCallback, useMemo, useRef } from 'react';

// ══════════════════════════════════════════════════════════
// ── DIFF ENGINE (Myers diff algorithm  word & line level)
// ══════════════════════════════════════════════════════════

// LCS-based diff: returns array of ops [{type: 'equal'|'insert'|'delete', value}]
const diffArrays = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);

  const ops = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) {
      ops.push({ type: 'equal', value: a[i] }); i++; j++;
    } else if (j < n && (i >= m || dp[i][j+1] >= dp[i+1][j])) {
      ops.push({ type: 'insert', value: b[j] }); j++;
    } else {
      ops.push({ type: 'delete', value: a[i] }); i++;
    }
  }
  return ops;
};

// Inline diff for changed lines  granularity 'word' (default) or 'char' (NEW)
const inlineDiff = (oldLine, newLine, granularity = 'word') => {
  const split = (s) => granularity === 'char' ? s.split('') : s.split(/(\s+)/);
  const oldUnits = split(oldLine);
  const newUnits = split(newLine);
  const ops = diffArrays(oldUnits, newUnits);
  const oldParts = [], newParts = [];
  ops.forEach((op) => {
    if (op.type === 'equal')  { oldParts.push({ t: 'eq', v: op.value }); newParts.push({ t: 'eq', v: op.value }); }
    if (op.type === 'delete') { oldParts.push({ t: 'del', v: op.value }); }
    if (op.type === 'insert') { newParts.push({ t: 'ins', v: op.value }); }
  });
  return { oldParts, newParts };
};

// Main line diff  returns structured diff result
const computeDiff = (oldText, newText, ignoreWhitespace, ignoreCase, granularity = 'word') => {
  const normalize = (s) => {
    let r = s;
    if (ignoreWhitespace) r = r.replace(/\s+/g, ' ').trim();
    if (ignoreCase) r = r.toLowerCase();
    return r;
  };

  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const oldNorm  = oldLines.map(normalize);
  const newNorm  = newLines.map(normalize);

  const ops = diffArrays(oldNorm, newNorm);

  let oi = 0, ni = 0;
  const result = [];
  ops.forEach((op) => {
    if (op.type === 'equal') {
      result.push({ type: 'equal', oldLine: oldLines[oi], newLine: newLines[ni], oldNum: oi + 1, newNum: ni + 1 });
      oi++; ni++;
    } else if (op.type === 'delete') {
      result.push({ type: 'delete', oldLine: oldLines[oi], oldNum: oi + 1 });
      oi++;
    } else {
      result.push({ type: 'insert', newLine: newLines[ni], newNum: ni + 1 });
      ni++;
    }
  });

  const paired = [];
  let k = 0;
  while (k < result.length) {
    const a = result[k], b = result[k+1];
    // Pair an adjacent delete+insert (in either order) into a single "changed" row
    // so the inline word/character diff is shown for edited lines.
    const del = a?.type === 'delete' ? a : b?.type === 'delete' ? b : null;
    const ins = a?.type === 'insert' ? a : b?.type === 'insert' ? b : null;
    if (del && ins && ((a?.type === 'delete' && b?.type === 'insert') || (a?.type === 'insert' && b?.type === 'delete'))) {
      const { oldParts, newParts } = inlineDiff(del.oldLine, ins.newLine, granularity);
      paired.push({ type: 'changed', oldLine: del.oldLine, newLine: ins.newLine, oldNum: del.oldNum, newNum: ins.newNum, oldParts, newParts });
      k += 2;
    } else {
      paired.push(result[k]);
      k++;
    }
  }
  return paired;
};

// ── Stats from diff ────────────────────────────────────────
const getDiffStats = (diff) => {
  let added = 0, removed = 0, changed = 0, unchanged = 0;
  diff.forEach((d) => {
    if (d.type === 'insert')  added++;
    else if (d.type === 'delete')  removed++;
    else if (d.type === 'changed') changed++;
    else unchanged++;
  });
  return { added, removed, changed, unchanged, total: diff.length };
};

// ── Escape HTML ────────────────────────────────────────────
const esc = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── Render inline diff parts as HTML ──────────────────────
const renderInlineParts = (parts, type) =>
  parts.map((p) => {
    if (p.t === 'eq') return esc(p.v);
    const cls = type === 'old'
      ? 'bg-rose-400/40 text-rose-200 rounded px-0.5'
      : 'bg-emerald-400/40 text-emerald-200 rounded px-0.5';
    return `<mark class="${cls}">${esc(p.v)}</mark>`;
  }).join('');

// ── SAMPLE DATA ───────────────────────────────────────────
const SAMPLES = [
  {
    label: 'JavaScript Function',
    old: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  console.log("Total:", total);
  return total;
}

const result = calculateTotal(cart);`,
    new: `function calculateTotal(items, taxRate = 0.08) {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

const { total, tax } = calculateTotal(cart);
console.log(\`Total: \${total}, Tax: \${tax}\`);`,
  },
  {
    label: 'JSON Config',
    old: `{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "dependencies": {
    "next": "13.0.0",
    "react": "^18.0.0"
  }
}`,
    new: `{
  "name": "my-app",
  "version": "2.0.0",
  "description": "A modern Next.js application",
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
  },
  {
    label: 'Plain Text',
    old: `Meeting Notes  March 10

Attendees: Alice, Bob, Carol

Topics discussed:
- Q1 budget review
- New product roadmap
- Team hiring plans

Next meeting: March 17`,
    new: `Meeting Notes March 12

Attendees: Alice, Bob, Carol, David

Topics discussed:
- Q1 budget review (approved)
- New product roadmap
- Team hiring plans 3 new positions approved
- Office expansion update

Action items:
- Alice: send budget report by Friday
- Bob: schedule interviews

Next meeting: March 19`,
  },
];

const RELATED_TOOLS = [
  { name: 'Code Formatter',   href: '/tools/code-formatter',   icon: '✨', desc: 'Format and beautify JS, HTML, CSS, JSON code before comparing' },
  { name: 'Word Counter',     href: '/tools/word-counter',     icon: '📝', desc: 'Count words and characters in your text documents'            },
  { name: 'HTML to Markdown', href: '/tools/html-to-markdown', icon: '🔄', desc: 'Convert HTML to Markdown for cleaner text comparison'         },
  { name: 'JSON Formatter',   href: '/tools/json-formatter',   icon: '{ }', desc: 'Format JSON before diffing to see structural changes clearly' },
];

// ══════════════════════════════════════════════════════════
// ── INLINE PARTS RENDERER (React component)
// ══════════════════════════════════════════════════════════
const InlineLine = ({ parts, side }) => (
  <>
    {parts.map((p, i) => {
      if (p.t === 'eq') return <span key={i}>{p.v}</span>;
      if (side === 'old') return <mark key={i} className="bg-rose-500/40 text-rose-100 rounded-sm px-0.5 not-italic">{p.v}</mark>;
      return <mark key={i} className="bg-emerald-500/40 text-emerald-100 rounded-sm px-0.5 not-italic">{p.v}</mark>;
    })}
  </>
);

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function DiffCheckerTool() {
  const [oldText, setOldText]         = useState('');
  const [newText, setNewText]         = useState('');
  const [diffResult, setDiffResult]   = useState(null);
  const [diffMode, setDiffMode]       = useState('split');     // split | unified | summary
  const [ignoreWS, setIgnoreWS]       = useState(false);
  const [ignoreCase, setIgnoreCase]   = useState(false);
  const [showUnchanged, setShowUnchanged] = useState(true);
  const [contextLines, setContextLines]   = useState(3);
  const [hasCompared, setHasCompared] = useState(false);
  const [copiedKey, setCopiedKey]     = useState('');
  const [highlightSearch, setHighlightSearch] = useState('');
  const [granularity, setGranularity] = useState('word');      // NEW: word | char inline diff

  const fileOldRef = useRef(null);
  const fileNewRef = useRef(null);

  // ── Run Diff ───────────────────────────────────────────
  const runDiff = useCallback(() => {
    const result = computeDiff(oldText, newText, ignoreWS, ignoreCase, granularity);
    setDiffResult(result);
    setHasCompared(true);
  }, [oldText, newText, ignoreWS, ignoreCase, granularity]);

  // ── Re-run when options change post-compare ────────────
  const rerun = (ws, ic, gran = granularity) => {
    if (hasCompared) {
      const result = computeDiff(oldText, newText, ws, ic, gran);
      setDiffResult(result);
    }
  };

  const stats = useMemo(() => diffResult ? getDiffStats(diffResult) : null, [diffResult]);

  // ── Visible diff rows (context collapsing) ─────────────
  const visibleRows = useMemo(() => {
    if (!diffResult) return [];
    if (showUnchanged) return diffResult;
    const changedIdx = new Set(
      diffResult.flatMap((d, i) => d.type !== 'equal' ? [i] : [])
    );
    const visible = new Set();
    changedIdx.forEach((i) => {
      for (let c = Math.max(0, i - contextLines); c <= Math.min(diffResult.length - 1, i + contextLines); c++) {
        visible.add(c);
      }
    });
    const rows = [];
    let lastVisible = -1;
    [...visible].sort((a, b) => a - b).forEach((idx) => {
      if (lastVisible !== -1 && idx > lastVisible + 1) {
        rows.push({ type: 'collapsed', count: idx - lastVisible - 1 });
      }
      rows.push({ ...diffResult[idx], _idx: idx });
      lastVisible = idx;
    });
    return rows;
  }, [diffResult, showUnchanged, contextLines]);

  // ── Load sample ────────────────────────────────────────
  const loadSample = (s) => {
    setOldText(s.old);
    setNewText(s.new);
    setDiffResult(null);
    setHasCompared(false);
  };

  // ── File upload ────────────────────────────────────────
  const loadFile = async (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (side === 'old') setOldText(text);
    else setNewText(text);
    setDiffResult(null); setHasCompared(false);
  };

  // ── Copy ───────────────────────────────────────────────
  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // ── Export diff as text ────────────────────────────────
  const exportDiff = () => {
    if (!diffResult) return;
    const lines = diffResult.map((d) => {
      if (d.type === 'equal')   return '  ' + (d.oldLine || '');
      if (d.type === 'delete')  return '- ' + (d.oldLine || '');
      if (d.type === 'insert')  return '+ ' + (d.newLine || '');
      if (d.type === 'changed') return '- ' + (d.oldLine || '') + '\n+ ' + (d.newLine || '');
      return '';
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'diff-toolbeans.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Swap ───────────────────────────────────────────────
  const swap = () => {
    const tmp = oldText;
    setOldText(newText);
    setNewText(tmp);
    setDiffResult(null); setHasCompared(false);
  };

  const clear = () => {
    setOldText(''); setNewText(''); setDiffResult(null); setHasCompared(false);
  };

  // ── Row background classes ─────────────────────────────
  const rowBg = (type, side) => {
    if (type === 'equal')   return 'bg-slate-900';
    if (type === 'delete')  return side === 'old' ? 'bg-rose-950/70' : 'bg-slate-900/50';
    if (type === 'insert')  return side === 'new' ? 'bg-emerald-950/70' : 'bg-slate-900/50';
    if (type === 'changed') return side === 'old' ? 'bg-rose-950/50' : 'bg-emerald-950/50';
    return 'bg-slate-900';
  };

  const rowPrefix = (type, side) => {
    if (type === 'delete' && side === 'old')   return <span className="text-rose-500 select-none mr-1">−</span>;
    if (type === 'insert' && side === 'new')   return <span className="text-emerald-500 select-none mr-1">+</span>;
    if (type === 'changed' && side === 'old')  return <span className="text-rose-400 select-none mr-1">~</span>;
    if (type === 'changed' && side === 'new')  return <span className="text-emerald-400 select-none mr-1">~</span>;
    return <span className="text-slate-700 select-none mr-1"> </span>;
  };

  const lineNumColor = (type, side) => {
    if (type === 'delete' && side === 'old')   return 'text-rose-600';
    if (type === 'insert' && side === 'new')   return 'text-emerald-600';
    if (type === 'changed')                    return side === 'old' ? 'text-rose-500' : 'text-emerald-500';
    return 'text-slate-700';
  };

  // ── Search highlight ───────────────────────────────────
  const highlightText = (text) => {
    if (!highlightSearch.trim() || !text) return esc(text || '');
    const regex = new RegExp('(' + highlightSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return esc(text).replace(regex, '<mark class="bg-yellow-400/60 text-yellow-100 rounded-sm">$1</mark>');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-5">
            <a href="/" className="hover:text-slate-300">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-300">Tools</a>
            <span>/</span>
            <span className="text-slate-300">Diff Checker</span>
          </nav>
          <span className="inline-block bg-cyan-900/40 text-cyan-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-cyan-800">
            Free · Instant · In-Browser
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            Text &amp; Code{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Diff Checker
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Compare two versions of any text or code side-by-side. Highlights added, removed and changed
            lines with inline word-level and character-level diff. Perfect for code reviews, document drafts and config changes.
          </p>
          <div className="flex gap-2 justify-center mt-5 flex-wrap">
            {['Line-level Diff','Word & Char Inline Diff','Split & Unified View','Ignore Whitespace','Ignore Case','Context Lines','Search Highlight','Export Diff'].map((f) => (
              <span key={f} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-medium px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-5">

        {/* ── SAMPLES + TOOLBAR ── */}
        <div className="flex items-center gap-3 flex-wrap bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex-shrink-0">Samples:</span>
          {SAMPLES.map((s) => (
            <button key={s.label} onClick={() => loadSample(s)}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-600 text-slate-300 font-medium px-3 py-1.5 rounded-lg transition-all">
              {s.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2 flex-wrap">
            <button onClick={swap}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 font-semibold px-3 py-1.5 rounded-lg transition-all">
              ⇄ Swap
            </button>
            <button onClick={clear}
              className="text-xs bg-slate-800 hover:bg-rose-950 hover:border-rose-800 hover:text-rose-400 border border-slate-700 text-slate-400 font-semibold px-3 py-1.5 rounded-lg transition-all">
              ✕ Clear
            </button>
          </div>
        </div>

        {/* ── INPUT PANELS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* OLD */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                <span className="text-sm font-extrabold text-slate-300">Original</span>
                {oldText && <span className="text-xs text-slate-600 font-mono">{oldText.split('\n').length} lines</span>}
              </div>
              <button onClick={() => fileOldRef.current?.click()}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 font-medium px-2.5 py-1 rounded-lg transition-all">
                📁 Upload
              </button>
              <input ref={fileOldRef} type="file" accept=".txt,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.md,.py,.php,.java,.cs,.go,.rb,.sql,.yaml,.yml,.env" className="hidden" onChange={(e) => loadFile(e, 'old')} />
            </div>
            <textarea value={oldText} onChange={(e) => { setOldText(e.target.value); setDiffResult(null); setHasCompared(false); }}
              placeholder={'Paste your original text here...\n\nThis is the "before" version the text you started with.\nChanges will be highlighted in red.'}
              className="w-full h-64 px-4 py-4 text-xs font-mono bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-rose-500/60 resize-none text-slate-300 leading-relaxed transition-all placeholder-slate-700"
              spellCheck={false} />
          </div>

          {/* NEW */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-sm font-extrabold text-slate-300">Modified</span>
                {newText && <span className="text-xs text-slate-600 font-mono">{newText.split('\n').length} lines</span>}
              </div>
              <button onClick={() => fileNewRef.current?.click()}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 font-medium px-2.5 py-1 rounded-lg transition-all">
                📁 Upload
              </button>
              <input ref={fileNewRef} type="file" accept=".txt,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.md,.py,.php,.java,.cs,.go,.rb,.sql,.yaml,.yml,.env" className="hidden" onChange={(e) => loadFile(e, 'new')} />
            </div>
            <textarea value={newText} onChange={(e) => { setNewText(e.target.value); setDiffResult(null); setHasCompared(false); }}
              placeholder={'Paste your modified text here...\n\nThis is the "after" version the updated text.\nNew additions will be highlighted in green.'}
              className="w-full h-64 px-4 py-4 text-xs font-mono bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-emerald-500/60 resize-none text-slate-300 leading-relaxed transition-all placeholder-slate-700"
              spellCheck={false} />
          </div>
        </div>

        {/* ── OPTIONS + COMPARE BUTTON ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4">

          {/* Toggles */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Ignore Whitespace', val: ignoreWS,   set: (v) => { setIgnoreWS(v);   rerun(v, ignoreCase);  } },
              { label: 'Ignore Case',       val: ignoreCase, set: (v) => { setIgnoreCase(v); rerun(ignoreWS, v);    } },
              { label: 'Show Unchanged',    val: showUnchanged, set: setShowUnchanged },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => opt.set(!opt.val)}
                  className={'w-8 h-4 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (opt.val ? 'bg-cyan-600' : 'bg-slate-700')}>
                  <div className={'w-3 h-3 bg-white rounded-full shadow transition-all ' + (opt.val ? 'translate-x-4' : 'translate-x-0')} />
                </div>
                <span className="text-xs font-semibold text-slate-400">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* NEW: inline granularity toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Inline:</span>
            <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
              {[{ key: 'word', label: 'Word' }, { key: 'char', label: 'Char' }].map((g) => (
                <button key={g.key} onClick={() => { setGranularity(g.key); rerun(ignoreWS, ignoreCase, g.key); }}
                  className={'text-xs font-bold px-2.5 py-1 rounded-md transition-all ' + (granularity === g.key ? 'bg-cyan-700 text-cyan-100' : 'text-slate-500 hover:text-slate-300')}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context lines */}
          {!showUnchanged && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Context:</span>
              {[1, 3, 5, 10].map((n) => (
                <button key={n} onClick={() => setContextLines(n)}
                  className={'text-xs font-bold px-2 py-0.5 rounded-lg transition-all ' + (contextLines === n ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-800 text-slate-500 hover:text-slate-300')}>
                  {n}
                </button>
              ))}
            </div>
          )}

          {/* View mode */}
          <div className="flex gap-1 bg-slate-800 p-1 rounded-xl ml-auto">
            {[
              { key: 'split',    label: '⬛ Split'   },
              { key: 'unified',  label: '☰ Unified' },
              { key: 'summary',  label: '📊 Summary' },
            ].map((v) => (
              <button key={v.key} onClick={() => setDiffMode(v.key)}
                className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' + (diffMode === v.key ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300')}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Compare button */}
          <button onClick={runDiff} disabled={!oldText.trim() && !newText.trim()}
            className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-extrabold px-8 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-cyan-900/30">
            Compare →
          </button>
        </div>

        {/* ── RESULTS ── */}
        {diffResult && stats && (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-3 flex-wrap bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5">
              <div className="flex gap-4 flex-wrap flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-extrabold text-emerald-400">+{stats.added}</span>
                  <span className="text-xs text-slate-500">added</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-sm font-extrabold text-rose-400">−{stats.removed}</span>
                  <span className="text-xs text-slate-500">removed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-extrabold text-amber-400">~{stats.changed}</span>
                  <span className="text-xs text-slate-500">changed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span className="text-sm font-extrabold text-slate-400">{stats.unchanged}</span>
                  <span className="text-xs text-slate-500">unchanged</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center">
                  {stats.added + stats.removed + stats.changed === 0
                    ? <span className="text-emerald-500 font-bold">✓ Files are identical</span>
                    : <span className="text-amber-500 font-bold">{stats.added + stats.removed + stats.changed} line(s) differ</span>}
                </div>
              </div>

              {/* Search + actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <input value={highlightSearch} onChange={(e) => setHighlightSearch(e.target.value)}
                  placeholder="🔍 Search in diff..."
                  className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-cyan-600 text-slate-300 placeholder-slate-600 w-40" />
                <button onClick={() => copy(oldText, 'old')}
                  className={'text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ' + (copiedKey === 'old' ? 'bg-rose-800 border-rose-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-rose-600')}>
                  {copiedKey === 'old' ? '✓' : 'Copy Original'}
                </button>
                <button onClick={() => copy(newText, 'new')}
                  className={'text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ' + (copiedKey === 'new' ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-600')}>
                  {copiedKey === 'new' ? '✓' : 'Copy Modified'}
                </button>
                <button onClick={exportDiff}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-600 transition-all">
                  ↓ Export .txt
                </button>
              </div>
            </div>

            {/* ══ SPLIT VIEW ══ */}
            {diffMode === 'split' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Headers */}
                <div className="grid grid-cols-2 border-b border-slate-800">
                  <div className="px-5 py-3 flex items-center gap-2 border-r border-slate-800 bg-slate-800/40">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Original</span>
                    <span className="text-xs text-slate-600 ml-auto font-mono">{oldText.split('\n').length} lines</span>
                  </div>
                  <div className="px-5 py-3 flex items-center gap-2 bg-slate-800/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Modified</span>
                    <span className="text-xs text-slate-600 ml-auto font-mono">{newText.split('\n').length} lines</span>
                  </div>
                </div>

                <div className="overflow-auto max-h-[640px]">
                  <table className="w-full border-collapse text-xs font-mono min-w-[640px]">
                    <tbody>
                      {visibleRows.map((row, i) => {
                        if (row.type === 'collapsed') return (
                          <tr key={'c' + i} className="border-b border-slate-800">
                            <td colSpan={4} className="px-4 py-2 text-center">
                              <button onClick={() => setShowUnchanged(true)}
                                className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                                ···  {row.count} unchanged line{row.count > 1 ? 's' : ''} hidden click to show all  ···
                              </button>
                            </td>
                          </tr>
                        );

                        const oldContent = row.type === 'insert' ? '' : (row.oldLine ?? '');
                        const newContent = row.type === 'delete' ? '' : (row.newLine ?? '');

                        return (
                          <tr key={i} className="border-b border-slate-800/50 hover:brightness-110 transition-all group">
                            <td className={'w-10 px-2 py-1 text-right select-none border-r border-slate-800 ' + rowBg(row.type, 'old') + ' ' + lineNumColor(row.type, 'old')}>
                              {row.type !== 'insert' ? row.oldNum : ''}
                            </td>
                            <td className={'px-3 py-1 border-r border-slate-800 w-1/2 ' + rowBg(row.type, 'old')}>
                              {row.type !== 'insert' && (
                                <span className="flex items-start gap-1">
                                  {rowPrefix(row.type, 'old')}
                                  <span className="flex-1 whitespace-pre-wrap break-all leading-relaxed text-slate-300">
                                    {row.type === 'changed'
                                      ? <InlineLine parts={row.oldParts} side="old" />
                                      : <span dangerouslySetInnerHTML={{ __html: highlightText(oldContent) }} />}
                                  </span>
                                </span>
                              )}
                            </td>
                            <td className={'w-10 px-2 py-1 text-right select-none border-r border-slate-800 ' + rowBg(row.type, 'new') + ' ' + lineNumColor(row.type, 'new')}>
                              {row.type !== 'delete' ? row.newNum : ''}
                            </td>
                            <td className={'px-3 py-1 w-1/2 ' + rowBg(row.type, 'new')}>
                              {row.type !== 'delete' && (
                                <span className="flex items-start gap-1">
                                  {rowPrefix(row.type, 'new')}
                                  <span className="flex-1 whitespace-pre-wrap break-all leading-relaxed text-slate-300">
                                    {row.type === 'changed'
                                      ? <InlineLine parts={row.newParts} side="new" />
                                      : <span dangerouslySetInnerHTML={{ __html: highlightText(newContent) }} />}
                                  </span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ UNIFIED VIEW ══ */}
            {diffMode === 'unified' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Unified Diff</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-rose-400"> removed</span>
                    <span className="text-emerald-400">+ added</span>
                    <span className="text-amber-400">~ changed</span>
                  </div>
                </div>
                <div className="overflow-auto max-h-[640px]">
                  <table className="w-full border-collapse text-xs font-mono">
                    <tbody>
                      {visibleRows.map((row, i) => {
                        if (row.type === 'collapsed') return (
                          <tr key={'c' + i}>
                            <td colSpan={3} className="px-4 py-2 text-center">
                              <button onClick={() => setShowUnchanged(true)}
                                className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">
                                ···  {row.count} unchanged lines hidden  ···
                              </button>
                            </td>
                          </tr>
                        );

                        if (row.type === 'equal') return (
                          <tr key={i} className="border-b border-slate-800/30">
                            <td className="w-8 px-2 py-0.5 text-right text-slate-700 select-none border-r border-slate-800">{row.oldNum}</td>
                            <td className="w-8 px-2 py-0.5 text-right text-slate-700 select-none border-r border-slate-800">{row.newNum}</td>
                            <td className="px-3 py-0.5 text-slate-500 whitespace-pre-wrap break-all">
                              <span dangerouslySetInnerHTML={{ __html: highlightText(row.oldLine) }} />
                            </td>
                          </tr>
                        );

                        const rows = [];
                        if (row.type === 'delete' || row.type === 'changed') rows.push(
                          <tr key={i + '-del'} className="border-b border-rose-900/30">
                            <td className="w-8 px-2 py-0.5 text-right text-rose-700 select-none border-r border-rose-900/40 bg-rose-950/50">{row.oldNum}</td>
                            <td className="w-8 px-2 py-0.5 border-r border-rose-900/40 bg-rose-950/50" />
                            <td className="px-3 py-0.5 bg-rose-950/40 text-rose-300 whitespace-pre-wrap break-all">
                              <span className="text-rose-500 mr-1 select-none">−</span>
                              {row.type === 'changed'
                                ? <InlineLine parts={row.oldParts} side="old" />
                                : <span dangerouslySetInnerHTML={{ __html: highlightText(row.oldLine) }} />}
                            </td>
                          </tr>
                        );
                        if (row.type === 'insert' || row.type === 'changed') rows.push(
                          <tr key={i + '-ins'} className="border-b border-emerald-900/30">
                            <td className="w-8 px-2 py-0.5 border-r border-emerald-900/40 bg-emerald-950/50" />
                            <td className="w-8 px-2 py-0.5 text-right text-emerald-700 select-none border-r border-emerald-900/40 bg-emerald-950/50">{row.newNum}</td>
                            <td className="px-3 py-0.5 bg-emerald-950/40 text-emerald-300 whitespace-pre-wrap break-all">
                              <span className="text-emerald-500 mr-1 select-none">+</span>
                              {row.type === 'changed'
                                ? <InlineLine parts={row.newParts} side="new" />
                                : <span dangerouslySetInnerHTML={{ __html: highlightText(row.newLine) }} />}
                            </td>
                          </tr>
                        );
                        return rows;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ SUMMARY VIEW ══ */}
            {diffMode === 'summary' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Lines Added',    value: stats.added,     color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-800', dot: 'bg-emerald-500' },
                      { label: 'Lines Removed',  value: stats.removed,   color: 'text-rose-400',    bg: 'bg-rose-950/50 border-rose-800',       dot: 'bg-rose-500'     },
                      { label: 'Lines Changed',  value: stats.changed,   color: 'text-amber-400',   bg: 'bg-amber-950/50 border-amber-800',     dot: 'bg-amber-500'    },
                      { label: 'Lines Unchanged',value: stats.unchanged, color: 'text-slate-400',   bg: 'bg-slate-800/50 border-slate-700',     dot: 'bg-slate-500'    },
                    ].map((s) => (
                      <div key={s.label} className={'rounded-2xl border p-5 ' + s.bg}>
                        <div className={'text-3xl font-extrabold ' + s.color}>{s.value}</div>
                        <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Change Distribution</div>
                    <div className="flex rounded-full overflow-hidden h-4">
                      {[
                        { v: stats.added,     bg: 'bg-emerald-500' },
                        { v: stats.removed,   bg: 'bg-rose-500'    },
                        { v: stats.changed,   bg: 'bg-amber-500'   },
                        { v: stats.unchanged, bg: 'bg-slate-700'   },
                      ].map((b, i) => b.v > 0 && (
                        <div key={i} className={b.bg + ' transition-all'} style={{ width: (b.v / stats.total * 100) + '%' }} />
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                      {[
                        { label: 'Added',     v: stats.added,     c: 'text-emerald-500' },
                        { label: 'Removed',   v: stats.removed,   c: 'text-rose-500'    },
                        { label: 'Changed',   v: stats.changed,   c: 'text-amber-500'   },
                        { label: 'Unchanged', v: stats.unchanged, c: 'text-slate-400'   },
                      ].map((s) => (
                        <span key={s.label}><span className={s.c + ' font-bold'}>{Math.round(s.v / stats.total * 100)}%</span> {s.label}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Text Statistics</div>
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      {[
                        ['Original lines',  oldText.split('\n').length],
                        ['Modified lines',  newText.split('\n').length],
                        ['Original chars',  oldText.length.toLocaleString()],
                        ['Modified chars',  newText.length.toLocaleString()],
                        ['Original words',  oldText.trim() ? oldText.trim().split(/\s+/).length.toLocaleString() : 0],
                        ['Modified words',  newText.trim() ? newText.trim().split(/\s+/).length.toLocaleString() : 0],
                      ].map(([k, v]) => (
                        <span key={k} className="flex justify-between pr-4">
                          <span className="text-slate-500">{k}</span>
                          <span className="text-slate-300 font-mono font-bold">{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/40">
                    <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Changed Lines Only</span>
                  </div>
                  <div className="overflow-auto max-h-[460px]">
                    {diffResult.filter((d) => d.type !== 'equal').length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <div className="text-3xl mb-2">✓</div>
                        <div className="text-sm font-bold text-emerald-500">Files are identical</div>
                      </div>
                    ) : (
                      <table className="w-full text-xs font-mono border-collapse">
                        <tbody>
                          {diffResult.filter((d) => d.type !== 'equal').map((row, i) => {
                            const rows = [];
                            if (row.type === 'delete' || row.type === 'changed') rows.push(
                              <tr key={i + '-d'} className="border-b border-slate-800">
                                <td className="px-3 py-1.5 text-right text-rose-700 w-10 select-none border-r border-slate-800 bg-rose-950/40">{row.oldNum}</td>
                                <td className="px-3 py-1.5 bg-rose-950/30 text-rose-300 whitespace-pre-wrap break-all">
                                  <span className="text-rose-500 mr-1">−</span>
                                  {row.type === 'changed' ? <InlineLine parts={row.oldParts} side="old" /> : row.oldLine}
                                </td>
                              </tr>
                            );
                            if (row.type === 'insert' || row.type === 'changed') rows.push(
                              <tr key={i + '-i'} className="border-b border-slate-800">
                                <td className="px-3 py-1.5 text-right text-emerald-700 w-10 select-none border-r border-slate-800 bg-emerald-950/40">{row.newNum}</td>
                                <td className="px-3 py-1.5 bg-emerald-950/30 text-emerald-300 whitespace-pre-wrap break-all">
                                  <span className="text-emerald-500 mr-1">+</span>
                                  {row.type === 'changed' ? <InlineLine parts={row.newParts} side="new" /> : row.newLine}
                                </td>
                              </tr>
                            );
                            return rows;
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── EMPTY STATE ── */}
        {!diffResult && (
          <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">↔️</div>
            <div className="text-slate-400 font-bold text-base mb-2">Ready to compare</div>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
              Paste text or code into both panels above or try one of the sample presets then click <strong className="text-slate-400">Compare</strong>.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {SAMPLES.map((s) => (
                <button key={s.label} onClick={() => { loadSample(s); setTimeout(runDiff, 50); }}
                  className="text-xs bg-slate-800 hover:bg-cyan-900/50 hover:border-cyan-700 border border-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl transition-all">
                  Try: {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── RELATED TOOLS ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-extrabold text-slate-200 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-500 mb-4">Free tools that work great alongside the Diff Checker.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-700 rounded-xl hover:border-cyan-600 hover:bg-cyan-950/20 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-300 group-hover:text-cyan-300 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* Intro */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-2xl font-extrabold text-slate-100 mb-4">Free Online Diff Checker  Compare Text and Code</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            The TOOLBeans Diff Checker compares two versions of any text or code and shows exactly what changed between them. Paste an original and a modified version into the two panels, click Compare, and the tool highlights every difference: lines that were added appear in green, lines that were removed appear in red, and lines that were edited show inline highlighting of the specific words or characters that changed. It is built for code reviews, tracking edits between document drafts, checking configuration changes, and any time you need to know precisely how two pieces of text differ.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            Under the hood it uses a longest-common-subsequence diff algorithm, the same family of algorithm that powers tools like git diff. This means it does not just compare lines position by position; it finds the longest sequence of lines the two versions share and reports only the genuine insertions, deletions and changes, so the result stays readable even when whole blocks have moved or been rewritten.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Everything runs entirely in your browser. Your text, code and any files you upload never leave your device and are never sent to a server, which makes it safe for proprietary source code, unpublished writing or confidential configuration. There is no account, no upload limit and no cost.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-5">How to Compare Two Texts  Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Add your two versions', 'Paste the original into the left panel and the modified version into the right, or click Upload on either side to load a file. You can also click a sample to see how it works instantly.'],
              ['2', 'Set comparison options', 'Turn on Ignore Whitespace to skip formatting-only differences, or Ignore Case for case-insensitive comparison. Choose Word or Char inline granularity for how precisely changed lines are highlighted.'],
              ['3', 'Click Compare', 'The tool runs the diff and shows the result. A stats bar summarises how many lines were added, removed, changed and left unchanged.'],
              ['4', 'Choose a view', 'Switch between Split (side by side, like a code review), Unified (one column, like git diff), and Summary (statistics plus a change-distribution chart and a changed-lines-only list).'],
              ['5', 'Focus on what matters', 'Turn off Show Unchanged to collapse identical sections, leaving only the changes plus a few lines of context that you can adjust. Use the search box to highlight a term across the whole diff.'],
              ['6', 'Copy or export', 'Copy either the original or modified text, or export the full comparison as a unified diff .txt file you can attach to a review or commit.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-200 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Views explainer */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-3">Split, Unified and Summary Views</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            The same comparison can be viewed three ways, each suited to a different task. Switch between them at any time without re-running the diff.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['⬛ Split View', 'The original and modified versions sit side by side in two columns, with changes aligned across them. This is the classic code-review layout and is best for reading two versions in parallel and seeing where each change lands.'],
              ['☰ Unified View', 'Removed and added lines are stacked in a single column, prefixed with − and +, exactly like the output of git diff or a patch file. Best for a compact, top-to-bottom read and for content that is too wide for two columns.'],
              ['📊 Summary View', 'A dashboard of the comparison: counts of added, removed, changed and unchanged lines, a visual distribution bar, text statistics, and a list showing only the changed lines. Best for a quick high-level sense of how much changed.'],
            ].map(([title, desc]) => (
              <div key={title} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-sm font-bold text-slate-200 mb-1">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Word vs char + options */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-3">Word-Level vs Character-Level Inline Diff</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            When a line is edited rather than wholly added or removed, the tool shows an inline diff that highlights only the part that changed, instead of flagging the entire line. You can control how fine that highlighting is with the Inline toggle.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            <strong className="text-slate-300">Word level</strong> highlights whole words that changed and is the most readable for prose and most code edits. <strong className="text-slate-300">Character level</strong> highlights individual characters, which is ideal for spotting a single-character difference such as a typo, a changed digit in a number, or a flipped operator like == to ===. Switch to Char when you need to find the smallest possible difference.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Two more options shape the comparison itself. <strong className="text-slate-300">Ignore Whitespace</strong> treats lines that differ only in spacing or indentation as identical, which is useful when reformatting has touched many lines but the logic is unchanged. <strong className="text-slate-300">Ignore Case</strong> compares text without regard to capitalisation, handy for case-insensitive content.
          </p>
        </article>

        {/* Use cases */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-5">What People Use a Diff Checker For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['👨‍💻 Code review', 'Compare an old and new version of a function or file to see exactly what a change does before merging or deploying it.'],
              ['📝 Document drafts', 'Spot every edit between two versions of an article, contract, essay or report, down to the individual word.'],
              ['⚙️ Config changes', 'Check what differs between two configuration or environment files to track down why an environment behaves differently.'],
              ['🔁 Debugging output', 'Compare expected output against actual output, or two log files, to isolate exactly where they diverge.'],
              ['📋 Copy-paste verification', 'Confirm that text was copied or migrated correctly by comparing the source against the destination.'],
              ['🌐 Translations and content', 'Compare two language or content versions to ensure structure and key sections line up.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-sm font-bold text-slate-200 min-w-[150px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Privacy */}
        <article className="bg-cyan-950/40 border border-cyan-900 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-3">Your Text Stays Private</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            Many online diff tools send your text to a server to compute the comparison. This one does not. The entire diff algorithm runs locally in your browser using JavaScript, including reading any files you upload.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            That matters when you are comparing proprietary source code, unpublished writing, legal documents or configuration that contains secrets. Because nothing is transmitted, you can compare sensitive material with confidence, and the tool keeps working even if your connection drops after the page loads.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is the diff checker free to use?', 'Yes. It is completely free with no usage limits, no account and no signup. Every feature, including all three views, word and character inline diff, file upload and diff export, is available to everyone.'],
              ['Does my text or code get uploaded to a server?', 'No. All comparison runs entirely in your browser. Your text, code and uploaded files never leave your device, so it is safe for proprietary or confidential material.'],
              ['What is the difference between split and unified view?', 'Split view shows the two versions side by side in two columns, like a code review. Unified view stacks removed and added lines in a single column like git diff output. Summary view shows statistics and a change-distribution chart instead of the full text.'],
              ['What does word-level versus character-level inline diff mean?', 'On a changed line, word-level highlights the whole words that differ, while character-level highlights individual characters. Use word level for readability and character level to pinpoint a tiny change such as a single typo or a changed digit.'],
              ['Can I ignore whitespace or letter case?', 'Yes. Ignore Whitespace treats lines that differ only in spacing or indentation as equal, which is useful after reformatting. Ignore Case compares without regard to capitalisation. Both update the result immediately.'],
              ['How do I hide the unchanged parts?', 'Turn off Show Unchanged. The tool then collapses identical sections and shows only the changes plus a few lines of surrounding context, which you can set to 1, 3, 5 or 10 lines.'],
              ['What file types can I upload?', 'Plain text and common code and config formats including .txt, .js, .ts, .jsx, .tsx, .html, .css, .json, .xml, .md, .py, .php, .java, .sql, .yaml and more. Files are read locally in your browser.'],
              ['Can I export or share the result?', 'Yes. Use Export .txt to download the comparison in a unified diff format with − and + markers, which you can attach to a review, paste into a ticket, or keep as a record.'],
              ['Does it work for very large files?', 'It handles typical files comfortably. Because the comparison runs in your browser, extremely large inputs depend on your device, and the diff algorithm scales with the product of the two sizes, so very large files may be slower.'],
              ['Is this the same as git diff?', 'It uses the same core idea (a longest-common-subsequence diff) and the unified view mirrors git diff output, but it works on any pasted or uploaded text, requires no repository or version control, and adds word and character level inline highlighting on top.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-200 list-none flex items-center justify-between">
                  {q}<span className="text-cyan-400 text-lg ml-3 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">{a}</div>
              </details>
            ))}
          </div>
        </article>

      </div>
    </div>
  );
}