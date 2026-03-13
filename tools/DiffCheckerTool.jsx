'use client';

import { useState, useCallback, useMemo, useRef } from 'react';

// ══════════════════════════════════════════════════════════
// ── DIFF ENGINE (Myers diff algorithm — word & line level)
// ══════════════════════════════════════════════════════════

// LCS-based diff: returns array of ops [{type: 'equal'|'insert'|'delete', value}]
const diffArrays = (a, b) => {
  const m = a.length, n = b.length;
  // DP table
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

// Inline word-level diff for changed lines
const inlineDiff = (oldLine, newLine) => {
  const oldWords = oldLine.split(/(\s+)/);
  const newWords = newLine.split(/(\s+)/);
  const ops = diffArrays(oldWords, newWords);
  const oldParts = [], newParts = [];
  ops.forEach((op) => {
    if (op.type === 'equal')  { oldParts.push({ t: 'eq', v: op.value }); newParts.push({ t: 'eq', v: op.value }); }
    if (op.type === 'delete') { oldParts.push({ t: 'del', v: op.value }); }
    if (op.type === 'insert') { newParts.push({ t: 'ins', v: op.value }); }
  });
  return { oldParts, newParts };
};

// Main line diff — returns structured diff result
const computeDiff = (oldText, newText, ignoreWhitespace, ignoreCase) => {
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

  // Map ops back to original lines
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

  // Pair adjacent delete+insert as "changed" for inline diff
  const paired = [];
  let k = 0;
  while (k < result.length) {
    if (result[k]?.type === 'delete' && result[k+1]?.type === 'insert') {
      const { oldParts, newParts } = inlineDiff(result[k].oldLine, result[k+1].newLine);
      paired.push({ type: 'changed', oldLine: result[k].oldLine, newLine: result[k+1].newLine, oldNum: result[k].oldNum, newNum: result[k+1].newNum, oldParts, newParts });
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
  const [contextLines, setContextLines]   = useState(3);       // lines around changes
  const [hasCompared, setHasCompared] = useState(false);
  const [copiedKey, setCopiedKey]     = useState('');
  const [highlightSearch, setHighlightSearch] = useState('');

  const fileOldRef = useRef(null);
  const fileNewRef = useRef(null);

  // ── Run Diff ───────────────────────────────────────────
  const runDiff = useCallback(() => {
    const result = computeDiff(oldText, newText, ignoreWS, ignoreCase);
    setDiffResult(result);
    setHasCompared(true);
  }, [oldText, newText, ignoreWS, ignoreCase]);

  // ── Re-run when options change post-compare ────────────
  const rerun = (ws, ic) => {
    if (hasCompared) {
      const result = computeDiff(oldText, newText, ws, ic);
      setDiffResult(result);
    }
  };

  const stats = useMemo(() => diffResult ? getDiffStats(diffResult) : null, [diffResult]);

  // ── Visible diff rows (context collapsing) ─────────────
  const visibleRows = useMemo(() => {
    if (!diffResult) return [];
    if (showUnchanged) return diffResult;
    // Show only changed rows + contextLines around them
    const changedIdx = new Set(
      diffResult.flatMap((d, i) => d.type !== 'equal' ? [i] : [])
    );
    const visible = new Set();
    changedIdx.forEach((i) => {
      for (let c = Math.max(0, i - contextLines); c <= Math.min(diffResult.length - 1, i + contextLines); c++) {
        visible.add(c);
      }
    });
    // Build with collapse markers
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
            lines with inline word-level diff. Perfect for code reviews, document drafts and config changes.
          </p>
          <div className="flex gap-2 justify-center mt-5 flex-wrap">
            {['Line-level Diff','Word-level Inline Diff','Split & Unified View','Ignore Whitespace','Ignore Case','Context Lines','Search Highlight','Export Diff'].map((f) => (
              <span key={f} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-medium px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* AD TOP */}
      <div className="max-w-7xl mx-auto px-6 pt-5">
        <div className="w-full h-14 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-600 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>

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
                <button onClick={() => copy(oldText + '\n\n--- vs ---\n\n' + newText, 'both')}
                  className={'text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ' + (copiedKey === 'both' ? 'bg-emerald-700 border-emerald-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-cyan-600')}>
                  {copiedKey === 'both' ? '✓ Copied' : 'Copy Both'}
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
                            {/* Old line number */}
                            <td className={'w-10 px-2 py-1 text-right select-none border-r border-slate-800 ' + rowBg(row.type, 'old') + ' ' + lineNumColor(row.type, 'old')}>
                              {row.type !== 'insert' ? row.oldNum : ''}
                            </td>
                            {/* Old line content */}
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
                            {/* New line number */}
                            <td className={'w-10 px-2 py-1 text-right select-none border-r border-slate-800 ' + rowBg(row.type, 'new') + ' ' + lineNumColor(row.type, 'new')}>
                              {row.type !== 'delete' ? row.newNum : ''}
                            </td>
                            {/* New line content */}
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
                    <span className="text-rose-400">— removed</span>
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
                {/* Visual stat cards */}
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

                  {/* Progress bar */}
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

                  {/* Text stats */}
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

                {/* Changed lines list */}
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

        {/* AD BOTTOM */}
        <div className="w-full h-14 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-600 uppercase tracking-widest">
          Advertisement — 728x90
        </div>

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

        {/* ── SEO CONTENT ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-200 mb-4">Free Online Diff Checker Compare Text & Code</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans Diff Checker compares two versions of any text or code and highlights exactly what changed line by line. Added lines are shown in green, removed lines in red, and modified lines show inline word-level highlighting so you can see the precise words that changed within a line.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Choose between Split view (side-by-side like a code review), Unified view (single column like git diff output), or Summary view with change statistics and a visual distribution chart. Toggle Ignore Whitespace to skip formatting-only changes, and Ignore Case for case-insensitive comparison. The context lines control lets you hide unchanged sections to focus only on what matters.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Upload files directly supports .txt, .js, .ts, .html, .css, .json, .xml, .md, .py, .sql, .yaml and more. Export the full diff as a standard unified diff .txt file. All processing runs entirely in your browser no text is uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
}