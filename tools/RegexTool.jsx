'use client';

import { useState, useMemo, useRef } from 'react';

// ─────────────────────────────────────────────────────────────
// ── REGEX EXPLANATION ENGINE ──
// Parses a regex pattern string and returns token explanations
// ─────────────────────────────────────────────────────────────
const ESCAPE_MAP = {
  'd': { label: '\\d',       desc: 'Any digit',                                    color: 'sky'     },
  'D': { label: '\\D',       desc: 'Any non-digit',                               color: 'sky'     },
  'w': { label: '\\w',       desc: 'Any word character (letter, digit, _)',        color: 'sky'     },
  'W': { label: '\\W',       desc: 'Any non-word character',                       color: 'sky'     },
  's': { label: '\\s',       desc: 'Any whitespace (space, tab, newline)',         color: 'sky'     },
  'S': { label: '\\S',       desc: 'Any non-whitespace character',                color: 'sky'     },
  'b': { label: '\\b',       desc: 'Word boundary (between \\w and \\W)',          color: 'violet'  },
  'B': { label: '\\B',       desc: 'Non-word boundary',                           color: 'violet'  },
  'n': { label: '\\n',       desc: 'Newline character',                           color: 'amber'   },
  't': { label: '\\t',       desc: 'Tab character',                               color: 'amber'   },
  'r': { label: '\\r',       desc: 'Carriage return',                             color: 'amber'   },
  '.': { label: '\\.',       desc: 'Literal dot character',                       color: 'slate'   },
  '*': { label: '\\*',       desc: 'Literal asterisk character',                  color: 'slate'   },
  '+': { label: '\\+',       desc: 'Literal plus character',                      color: 'slate'   },
  '?': { label: '\\?',       desc: 'Literal question mark',                       color: 'slate'   },
  '^': { label: '\\^',       desc: 'Literal caret character',                     color: 'slate'   },
  '$': { label: '\\$',       desc: 'Literal dollar sign',                         color: 'slate'   },
  '(': { label: '\\(',       desc: 'Literal opening parenthesis',                 color: 'slate'   },
  ')': { label: '\\)',       desc: 'Literal closing parenthesis',                 color: 'slate'   },
  '[': { label: '\\[',       desc: 'Literal opening bracket',                     color: 'slate'   },
  '{': { label: '\\{',       desc: 'Literal opening brace',                       color: 'slate'   },
};

function explainPattern(pattern) {
  const tokens = [];
  let i = 0;

  while (i < pattern.length) {
    const ch = pattern[i];

    // Escaped character
    if (ch === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1];
      if (ESCAPE_MAP[next]) {
        tokens.push({ raw: '\\' + next, ...ESCAPE_MAP[next] });
      } else {
        tokens.push({ raw: '\\' + next, label: '\\' + next, desc: 'Escaped character: matches literal "' + next + '"', color: 'slate' });
      }
      i += 2;
      continue;
    }

    // Character class [...]
    if (ch === '[') {
      let end = pattern.indexOf(']', i + 1);
      if (end === -1) end = pattern.length - 1;
      const inner = pattern.slice(i + 1, end);
      const negated = inner.startsWith('^');
      const content = negated ? inner.slice(1) : inner;
      tokens.push({
        raw: pattern.slice(i, end + 1),
        label: pattern.slice(i, end + 1),
        desc: (negated ? 'Any character NOT in: ' : 'Any one character from: ') + content,
        color: 'orange',
      });
      i = end + 1;
      continue;
    }

    // Non-capturing group (?:...)
    if (ch === '(' && pattern.slice(i, i + 3) === '(?:') {
      let depth = 1, j = i + 3;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '(' && pattern[j-1] !== '\\') depth++;
        if (pattern[j] === ')' && pattern[j-1] !== '\\') depth--;
        j++;
      }
      tokens.push({ raw: pattern.slice(i, j), label: '(?:...)', desc: 'Non-capturing group — groups without creating a capture group', color: 'purple' });
      i = j;
      continue;
    }

    // Positive lookahead (?=...)
    if (ch === '(' && pattern.slice(i, i + 3) === '(?=') {
      let depth = 1, j = i + 3;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '(') depth++;
        if (pattern[j] === ')') depth--;
        j++;
      }
      tokens.push({ raw: pattern.slice(i, j), label: '(?=...)', desc: 'Positive lookahead — asserts what follows without consuming characters', color: 'teal' });
      i = j;
      continue;
    }

    // Negative lookahead (?!...)
    if (ch === '(' && pattern.slice(i, i + 3) === '(?!') {
      let depth = 1, j = i + 3;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '(') depth++;
        if (pattern[j] === ')') depth--;
        j++;
      }
      tokens.push({ raw: pattern.slice(i, j), label: '(?!...)', desc: 'Negative lookahead — asserts what does NOT follow', color: 'teal' });
      i = j;
      continue;
    }

    // Capturing group (...)
    if (ch === '(') {
      let depth = 1, j = i + 1;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '(' && pattern[j-1] !== '\\') depth++;
        if (pattern[j] === ')' && pattern[j-1] !== '\\') depth--;
        j++;
      }
      tokens.push({ raw: pattern.slice(i, j), label: '(...)', desc: 'Capturing group — captures matched text for back-reference or extraction', color: 'green' });
      i = j;
      continue;
    }

    // Quantifiers
    if (ch === '+') { tokens.push({ raw: '+', label: '+', desc: 'One or more of the preceding element (greedy)', color: 'fuchsia' }); i++; continue; }
    if (ch === '*') { tokens.push({ raw: '*', label: '*', desc: 'Zero or more of the preceding element (greedy)', color: 'fuchsia' }); i++; continue; }
    if (ch === '?') { tokens.push({ raw: '?', label: '?', desc: 'Zero or one of the preceding element (optional)', color: 'fuchsia' }); i++; continue; }

    // {n}, {n,}, {n,m}
    if (ch === '{') {
      const end = pattern.indexOf('}', i);
      if (end !== -1) {
        const inner = pattern.slice(i + 1, end);
        const parts = inner.split(',');
        let desc = '';
        if (parts.length === 1) desc = 'Exactly ' + parts[0] + ' of the preceding element';
        else if (parts[1] === '') desc = 'At least ' + parts[0] + ' of the preceding element';
        else desc = 'Between ' + parts[0] + ' and ' + parts[1] + ' of the preceding element';
        tokens.push({ raw: pattern.slice(i, end + 1), label: pattern.slice(i, end + 1), desc, color: 'fuchsia' });
        i = end + 1;
        continue;
      }
    }

    // Anchors
    if (ch === '^') { tokens.push({ raw: '^', label: '^', desc: 'Start of string (or line in multiline mode)', color: 'rose' }); i++; continue; }
    if (ch === '$') { tokens.push({ raw: '$', label: '$', desc: 'End of string (or line in multiline mode)', color: 'rose' }); i++; continue; }

    // Dot
    if (ch === '.') { tokens.push({ raw: '.', label: '.', desc: 'Any single character except newline (unless dotall flag s is set)', color: 'amber' }); i++; continue; }

    // Alternation
    if (ch === '|') { tokens.push({ raw: '|', label: '|', desc: 'Alternation — matches either the expression before or after the pipe', color: 'indigo' }); i++; continue; }

    // Literal character
    tokens.push({ raw: ch, label: '"' + ch + '"', desc: 'Literal character — matches exactly "' + ch + '"', color: 'slate' });
    i++;
  }

  return tokens;
}

// ─────────────────────────────────────────────────────────────
// ── BUILD HIGHLIGHTED SEGMENTS from text + matches ──
// Returns array of { text, isMatch, matchIndex, groupIndex }
// ─────────────────────────────────────────────────────────────
function buildSegments(text, matches) {
  if (!matches || matches.length === 0) return [{ text, isMatch: false }];

  const segments = [];
  let cursor = 0;

  matches.forEach((match, idx) => {
    const start = match.index;
    const end   = start + match[0].length;

    // Text before match
    if (cursor < start) {
      segments.push({ text: text.slice(cursor, start), isMatch: false });
    }
    // The match itself
    segments.push({ text: match[0], isMatch: true, matchIndex: idx });
    cursor = end;
  });

  // Remaining text
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isMatch: false });
  }

  return segments;
}

// ─────────────────────────────────────────────────────────────
// ── CHEATSHEET ENTRIES ──
// ─────────────────────────────────────────────────────────────
const CHEATSHEET = [
  {
    label: 'Email',
    pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    sample: 'Contact us at support@toolbeans.dev or sales@company.com for help.',
  },
  {
    label: 'Phone (US)',
    pattern: '(\\+1[\\s\\-]?)?\\(?\\d{3}\\)?[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}',
    flags: 'g',
    sample: 'Call us: (555) 123-4567 or +1 800-555-9999 or 212.555.0100',
  },
  {
    label: 'URL',
    pattern: 'https?:\\/\\/(www\\.)?[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:\\/~+#]*[\\w\\-@?^=%&\\/~+#])?',
    flags: 'gi',
    sample: 'Visit https://toolbeans.dev or http://www.example.com/path?q=1#anchor',
  },
  {
    label: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    sample: 'MyPass123!\nweakpass\nStrongPass@9',
  },
  {
    label: 'IPv4 Address',
    pattern: '\\b(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)\\.(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)\\.(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)\\.(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]\\d|\\d)\\b',
    flags: 'g',
    sample: 'Servers: 192.168.1.1, 10.0.0.255, 256.300.1.1 (invalid), 8.8.8.8',
  },
  {
    label: 'Date (YYYY-MM-DD)',
    pattern: '\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    sample: 'Events: 2025-01-15, 2024-12-31, invalid: 2025-13-01, 2025-00-10',
  },
  {
    label: 'Hex Color',
    pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
    flags: 'gi',
    sample: 'Colors: #FF5733, #abc, #FFFFFF, #000000, not this: #GGHHII',
  },
  {
    label: 'HTML Tags',
    pattern: '<\\/?[a-z][a-z0-9]*(?:\\s[^>]*)?>',
    flags: 'gi',
    sample: '<div class="container"><h1>Hello</h1><p>World</p></div>',
  },
  {
    label: 'Credit Card',
    pattern: '\\b(?:\\d{4}[\\s\\-]?){3}\\d{4}\\b',
    flags: 'g',
    sample: 'Cards: 4532 1234 5678 9012, 4111-1111-1111-1111, 4000000000000000',
  },
  {
    label: 'Digits Only',
    pattern: '\\d+',
    flags: 'g',
    sample: 'Order #12345 has 3 items costing $99.99 total on invoice 2025-001.',
  },
];

// ─────────────────────────────────────────────────────────────
// ── MATCH HIGHLIGHT COLORS (cycles through) ──
// ─────────────────────────────────────────────────────────────
const MATCH_COLORS = [
  'bg-fuchsia-200 text-fuchsia-900',
  'bg-violet-200 text-violet-900',
  'bg-sky-200 text-sky-900',
  'bg-emerald-200 text-emerald-900',
  'bg-amber-200 text-amber-900',
  'bg-rose-200 text-rose-900',
];

const TOKEN_COLORS = {
  sky:     'bg-sky-100 text-sky-700 border-sky-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  orange:  'bg-orange-100 text-orange-700 border-orange-200',
  purple:  'bg-purple-100 text-purple-700 border-purple-200',
  teal:    'bg-teal-100 text-teal-700 border-teal-200',
  green:   'bg-green-100 text-green-700 border-green-200',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  rose:    'bg-rose-100 text-rose-700 border-rose-200',
  indigo:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  slate:   'bg-slate-100 text-slate-700 border-slate-200',
};

const DEFAULT_TEXT = 'The quick brown fox jumps over the lazy dog.\nEmail: user@example.com | Phone: (555) 123-4567\nDate: 2025-01-15 | Price: $99.99 | IP: 192.168.1.1\nVisit https://toolbeans.dev for free developer tools.';

// ─────────────────────────────────────────────────────────────
// ── MAIN COMPONENT ──
// ─────────────────────────────────────────────────────────────
export default function RegexTool() {
  const [pattern, setPattern]       = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [testText, setTestText]     = useState(DEFAULT_TEXT);
  const [replaceWith, setReplaceWith] = useState('');
  const [flags, setFlags]           = useState({ g: true, i: false, m: false, s: false, u: false });
  const [activeTab, setActiveTab]   = useState('tester');
  const [activeResultTab, setActiveResultTab] = useState('highlighted');
  const [copied, setCopied]         = useState('');
  const [history, setHistory]       = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  // ── Build flag string ──
  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');

  // ── Compile regex and run matches ──
  const { regex, matches, regexError, replaceResult, segments } = useMemo(() => {
    if (!pattern) {
      return { regex: null, matches: [], regexError: '', replaceResult: '', segments: [{ text: testText, isMatch: false }] };
    }
    let regex = null;
    let regexError = '';
    let matches = [];
    let replaceResult = '';
    let segments = [{ text: testText, isMatch: false }];

    try {
      // Always include 'g' for finding all matches, plus 'd' for indices if available
      const runFlags = flags.g ? flagStr : flagStr + 'g';
      regex = new RegExp(pattern, runFlags);

      // Get all matches
      const allMatches = [];
      let m;
      // Use exec loop for safety with all flag combos
      const execRegex = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g');
      while ((m = execRegex.exec(testText)) !== null) {
        allMatches.push(m);
        // Prevent infinite loop for zero-length matches
        if (m[0].length === 0) { execRegex.lastIndex++; }
      }
      matches = allMatches;
      segments = buildSegments(testText, allMatches);

      // Replace preview
      if (replaceWith !== undefined) {
        try {
          const replaceRegex = new RegExp(pattern, flagStr.includes('g') ? flagStr : flagStr + 'g');
          replaceResult = testText.replace(replaceRegex, replaceWith);
        } catch { replaceResult = ''; }
      }
    } catch (e) {
      regexError = e.message;
    }

    return { regex, matches, regexError, replaceResult, segments };
  }, [pattern, testText, flagStr, replaceWith]);

  // ── Pattern explanation ──
  const explanation = useMemo(() => {
    if (!pattern) return [];
    try { return explainPattern(pattern); } catch { return []; }
  }, [pattern]);

  // ── Copy helpers ──
  const copyText = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2500);
  };

  // ── Load cheatsheet entry ──
  const loadCheatsheet = (entry) => {
    setPattern(entry.pattern);
    setTestText(entry.sample);
    const newFlags = { g: false, i: false, m: false, s: false, u: false };
    for (const f of entry.flags) { if (f in newFlags) newFlags[f] = true; }
    setFlags(newFlags);
    setShowCheatsheet(false);
    setActiveTab('tester');
    // Add to history
    setHistory((prev) => [{ pattern: entry.pattern, flagStr: entry.flags, label: entry.label, time: new Date().toLocaleTimeString() },
      ...prev.filter((h) => h.pattern !== entry.pattern)].slice(0, 10));
  };

  const handlePatternChange = (val) => {
    setPattern(val);
    if (val && !regexError) {
      setHistory((prev) => [{ pattern: val, flagStr, label: val.slice(0, 20), time: new Date().toLocaleTimeString() },
        ...prev.filter((h) => h.pattern !== val)].slice(0, 10));
    }
  };

  const matchCount  = matches.length;
  const groupCount  = matches.reduce((a, m) => a + (m.length - 1), 0);
  const hasMatches  = matchCount > 0;
  const hasPattern  = pattern.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-fuchsia-50 via-white to-pink-50 border-b border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-fuchsia-50 text-fuchsia-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-fuchsia-200">
            Developer Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Regex{' '}
            <span className="bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
              Tester
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto mb-6">
            Test regular expressions in real time with live highlighting, captured group inspection,
            pattern explanation, replace preview, and a full cheatsheet — all in your browser.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: 'Live',    label: 'Match Highlighting' },
              { value: '5 Flags', label: 'g i m s u'          },
              { value: '10+',     label: 'Cheatsheet Patterns' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-fuchsia-600">{s.value}</div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD TOP ── 
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>
      */}

      {/* ── MAIN TABS ── */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="'flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 text-center ' +
  (activeTab === tab.key
    ? 'bg-fuchsia-600 text-white shadow-md'
    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')">
          {[
            { key: 'tester',     label: '⚡ Tester'    },
            { key: 'replace',    label: '↔ Replace'   },
            { key: 'cheatsheet', label: '📋 Cheatsheet' },
            { key: 'reference',  label: '📖 Reference'  },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ' +
                (activeTab === tab.key
                  ? 'bg-fuchsia-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-6">

        {/* ══════════════════════════════════════ */}
        {/* SHARED — Pattern Input + Flags        */}
        {/* (shown on tester + replace tabs)      */}
        {/* ══════════════════════════════════════ */}
        {(activeTab === 'tester' || activeTab === 'replace') && (
          <div className="flex flex-col gap-5">

            {/* Pattern + Flags Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regex Pattern</span>
                <div className="flex items-center gap-2">
                  
                  <button
                    onClick={() => { setPattern(''); }}
                    className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all"
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>

              <div className="px-6 pt-5 pb-4">
                {/* Pattern input with / / delimiters UI */}
                <div className={
                  'flex items-center gap-0 border rounded-2xl overflow-hidden transition-all ' +
                  (regexError ? 'border-rose-300 ring-2 ring-rose-50' : hasPattern && hasMatches ? 'border-fuchsia-300 ring-2 ring-fuchsia-50' : 'border-slate-200')
                }>
                  <span className="px-4 py-3.5 text-slate-300 font-mono text-lg font-bold bg-slate-50 border-r border-slate-200 select-none">/</span>
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="Enter regex pattern…"
                    className="flex-1 px-4 py-3.5 text-sm font-mono text-slate-800 outline-none bg-white"
                    spellCheck={false}
                  />
                  <span className="px-4 py-3.5 text-slate-300 font-mono text-lg font-bold bg-slate-50 border-l border-slate-200 select-none">/{flagStr}</span>
                </div>

                {/* Error */}
                {regexError && (
                  <div className="mt-3 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-rose-600 font-medium">
                    <span className="flex-shrink-0">⚠️</span>
                    <code className="font-mono">{regexError}</code>
                  </div>
                )}

                {/* Flags */}
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flags:</span>
                  {[
                    { key: 'g', label: 'g', title: 'Global — find all matches' },
                    { key: 'i', label: 'i', title: 'Case Insensitive — ignore case' },
                    { key: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries' },
                    { key: 's', label: 's', title: 'Dotall — . matches newlines too' },
                    { key: 'u', label: 'u', title: 'Unicode — enable Unicode support' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      title={f.title}
                      onClick={() => setFlags((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
                      className={
                        'w-8 h-8 rounded-lg text-xs font-bold font-mono border-2 transition-all ' +
                        (flags[f.key]
                          ? 'bg-fuchsia-600 border-fuchsia-600 text-white shadow-md'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-fuchsia-300 hover:text-fuchsia-600')
                      }
                    >
                      {f.label}
                    </button>
                  ))}

                  {/* Live stats */}
                  {hasPattern && !regexError && (
                    <div className="ml-auto flex items-center gap-3">
                      <span className={
                        'text-sm font-extrabold px-3 py-1 rounded-xl ' +
                        (hasMatches ? 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200' : 'bg-slate-50 text-slate-400 border border-slate-200')
                      }>
                        {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                      </span>
                      {groupCount > 0 && (
                        <span className="text-sm font-extrabold px-3 py-1 rounded-xl bg-violet-50 text-violet-700 border border-violet-200">
                          {groupCount} group{groupCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── TESTER TAB ── */}
            {activeTab === 'tester' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* LEFT — Test Text Input */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Text</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => { try { const t = await navigator.clipboard.readText(); setTestText(t); } catch {} }}
                        className="text-xs text-fuchsia-600 hover:text-fuchsia-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-fuchsia-50 transition-all"
                      >
                        ⎘ Paste
                      </button>
                      <button onClick={() => setTestText('')} className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all">
                        ✕ Clear
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter test text here…"
                    className="flex-1 w-full px-5 py-4 text-sm font-mono text-slate-700 outline-none resize-none leading-relaxed bg-white"
                    style={{ minHeight: '280px' }}
                    spellCheck={false}
                  />
                  <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center gap-4">
                    <span className="text-xs text-slate-400">{testText.length} chars</span>
                    <span className="text-xs text-slate-400">{testText.split('\n').length} lines</span>
                  </div>
                </div>

                {/* RIGHT — Results Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  {/* Result sub-tabs */}
                  <div className="flex border-b border-slate-100">
                    {[
                      { key: 'highlighted', label: 'Highlighted' },
                      { key: 'matches',     label: 'Matches (' + matchCount + ')' },
                      { key: 'explain',     label: 'Explain' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setActiveResultTab(s.key)}
                        className={
                          'px-4 py-3 text-xs font-bold transition-all border-b-2 ' +
                          (activeResultTab === s.key
                            ? 'border-fuchsia-600 text-fuchsia-600 bg-fuchsia-50'
                            : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50')
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    {hasMatches && (
                      <button
                        onClick={() => copyText('matches', matches.map((m, i) => '[' + i + '] ' + m[0]).join('\n'))}
                        className={'text-xs font-bold px-3 py-2 m-1.5 rounded-lg transition-all ' + (copied === 'matches' ? 'bg-green-500 text-white' : 'bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-600')}
                      >
                        {copied === 'matches' ? '✓' : '⎘'}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto" style={{ minHeight: '280px' }}>

                    {/* Highlighted View */}
                    {activeResultTab === 'highlighted' && (
                      <div className="px-5 py-4 font-mono text-sm leading-loose whitespace-pre-wrap break-words">
                        {!hasPattern ? (
                          <span className="text-slate-300 italic">Enter a regex pattern to see highlighted matches</span>
                        ) : regexError ? (
                          <span className="text-slate-300 italic">Fix the regex error to see matches</span>
                        ) : segments.map((seg, i) => (
                          seg.isMatch ? (
                            <mark
                              key={i}
                              className={
                                'rounded px-0.5 font-bold ' +
                                MATCH_COLORS[seg.matchIndex % MATCH_COLORS.length]
                              }
                            >
                              {seg.text}
                            </mark>
                          ) : (
                            <span key={i} className="text-slate-700">{seg.text}</span>
                          )
                        ))}
                        {hasPattern && !regexError && !hasMatches && (
                          <span className="text-slate-300 italic ml-2">No matches found</span>
                        )}
                      </div>
                    )}

                    {/* Match Details */}
                    {activeResultTab === 'matches' && (
                      <div className="divide-y divide-slate-50">
                        {matches.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                            <div className="text-4xl mb-2">🔍</div>
                            <div className="text-sm">
                              {!hasPattern ? 'Enter a pattern above' : 'No matches found'}
                            </div>
                          </div>
                        ) : (
                          matches.map((m, i) => (
                            <div key={i} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={'text-xs font-extrabold px-2 py-0.5 rounded-full font-mono ' + MATCH_COLORS[i % MATCH_COLORS.length]}>
                                  #{i + 1}
                                </span>
                                <span className="text-xs text-slate-400">index: {m.index}</span>
                                <span className="text-xs text-slate-400">length: {m[0].length}</span>
                              </div>
                              {/* Full match */}
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs text-slate-400 w-16 flex-shrink-0">Match:</span>
                                <code className="text-xs bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 px-2 py-1 rounded-lg font-mono break-all">
                                  {m[0] || '(empty match)'}
                                </code>
                                <button
                                  onClick={() => copyText('m' + i, m[0])}
                                  className="text-xs text-slate-400 hover:text-fuchsia-600 font-semibold ml-auto flex-shrink-0"
                                >
                                  {copied === 'm' + i ? '✓' : '⎘'}
                                </button>
                              </div>
                              {/* Capture groups */}
                              {m.length > 1 && m.slice(1).map((g, gi) => (
                                <div key={gi} className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-slate-400 w-16 flex-shrink-0">Group {gi + 1}:</span>
                                  <code className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-lg font-mono">
                                    {g !== undefined ? g : '(undefined)'}
                                  </code>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Pattern Explanation */}
                    {activeResultTab === 'explain' && (
                      <div className="px-5 py-4">
                        {!hasPattern ? (
                          <div className="text-slate-300 italic text-sm">Enter a pattern to see the explanation</div>
                        ) : (
                          <>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                              Pattern: <code className="font-mono text-fuchsia-600">/{pattern}/{flagStr}</code>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-5">
                              {explanation.map((token, i) => (
                                <div key={i} className={'group relative border rounded-xl px-2.5 py-1.5 cursor-default ' + (TOKEN_COLORS[token.color] || TOKEN_COLORS.slate)}>
                                  <code className="text-xs font-bold font-mono">{token.label}</code>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 bg-slate-900 text-white text-xs rounded-xl px-3 py-2 w-52 shadow-xl leading-relaxed whitespace-normal pointer-events-none">
                                    {token.desc}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Token list */}
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Token Breakdown</div>
                              {explanation.map((token, i) => (
                                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                                  <code className={'text-xs font-bold px-2 py-1 rounded-lg border font-mono flex-shrink-0 ' + (TOKEN_COLORS[token.color] || TOKEN_COLORS.slate)}>
                                    {token.raw}
                                  </code>
                                  <span className="text-xs text-slate-500 leading-relaxed">{token.desc}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── REPLACE TAB ── */}
            {activeTab === 'replace' && (
              <div className="flex flex-col gap-5">

                {/* Replace input */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Replace With</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replaceWith}
                      onChange={(e) => setReplaceWith(e.target.value)}
                      placeholder="Replacement string — use $1, $2 for captured groups…"
                      className="flex-1 px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-50 transition-all"
                      spellCheck={false}
                    />
                    <button
                      onClick={() => copyText('replace', replaceResult)}
                      disabled={!replaceResult}
                      className={
                        'text-xs font-bold px-4 py-3 rounded-xl transition-all flex-shrink-0 ' +
                        (replaceResult
                          ? copied === 'replace' ? 'bg-green-500 text-white' : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed')
                      }
                    >
                      {copied === 'replace' ? '✓ Copied' : '⎘ Copy Result'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Use <code className="bg-slate-100 px-1 rounded font-mono">$1</code>, <code className="bg-slate-100 px-1 rounded font-mono">$2</code> to reference captured groups.
                    Use <code className="bg-slate-100 px-1 rounded font-mono">$&amp;</code> for the full match.
                    Use <code className="bg-slate-100 px-1 rounded font-mono">$&apos;</code> for text after match.
                  </p>
                </div>

                {/* Side by side: Original vs Replaced */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Text</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200">
                        {matchCount} match{matchCount !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <textarea
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      className="w-full px-5 py-4 text-sm font-mono text-slate-700 outline-none resize-none leading-relaxed bg-white"
                      style={{ minHeight: '260px' }}
                      spellCheck={false}
                    />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Replace Preview</span>
                      {replaceResult && replaceResult !== testText && (
                        <span className="text-xs font-bold text-emerald-600">Preview ready</span>
                      )}
                    </div>
                    <pre className="w-full px-5 py-4 text-sm font-mono text-slate-700 leading-relaxed whitespace-pre-wrap break-words overflow-auto" style={{ minHeight: '260px' }}>
                      {!hasPattern
                        ? <span className="text-slate-300 italic">Enter a pattern above</span>
                        : regexError
                        ? <span className="text-rose-400 italic">Invalid pattern: {regexError}</span>
                        : !replaceWith && replaceWith !== '0'
                        ? <span className="text-slate-300 italic">Enter replacement string above</span>
                        : replaceResult || <span className="text-slate-300 italic">No changes</span>
                      }
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    🕐 Recent Patterns ({history.length})
                  </span>
                  <span className="text-slate-400 text-sm">{showHistory ? '▲' : '▼'}</span>
                </button>
                {showHistory && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => { setPattern(h.pattern); const nf = { g:false,i:false,m:false,s:false,u:false }; for(const f of (h.flagStr||'')) { if(f in nf) nf[f]=true; } setFlags(nf); }}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <span className="text-xs text-slate-300 font-mono flex-shrink-0">{h.time}</span>
                        <code className="text-xs font-mono text-fuchsia-600 truncate flex-1">{h.pattern}</code>
                        {h.flagStr && <span className="text-xs text-slate-400 font-mono flex-shrink-0">/{h.flagStr}</span>}
                      </div>
                    ))}
                    <div className="px-6 py-3 bg-slate-50">
                      <button onClick={() => setHistory([])} className="text-xs text-rose-400 hover:text-rose-600 font-semibold">Clear History</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB 3 — CHEATSHEET                    */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'cheatsheet' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHEATSHEET.map((entry) => (
              <div key={entry.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-fuchsia-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-800 mb-0.5">{entry.label}</div>
                    <span className="text-xs bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 font-bold px-2 py-0.5 rounded-full">
                      flags: /{entry.flags || 'none'}/
                    </span>
                  </div>
                  <button
                    onClick={() => loadCheatsheet(entry)}
                    className="text-xs bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-3 py-2 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md flex-shrink-0 ml-3"
                  >
                    Use This ↗
                  </button>
                </div>
                <code className="block text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-fuchsia-700 break-all leading-relaxed">
                  {entry.pattern}
                </code>
                <div className="text-xs text-slate-400 mt-2 font-mono leading-relaxed line-clamp-2">
                  Sample: {entry.sample.slice(0, 60)}{entry.sample.length > 60 ? '…' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* TAB 4 — REFERENCE                     */}
        {/* ══════════════════════════════════════ */}
        {activeTab === 'reference' && (
          <div className="flex flex-col gap-5">

            {/* Quick reference tables */}
            {[
              {
                title: 'Character Classes',
                rows: [
                  { token: '.', desc: 'Any character except newline' },
                  { token: '\\d', desc: 'Any digit [0-9]' },
                  { token: '\\D', desc: 'Any non-digit' },
                  { token: '\\w', desc: 'Any word char [a-zA-Z0-9_]' },
                  { token: '\\W', desc: 'Any non-word character' },
                  { token: '\\s', desc: 'Any whitespace (space, tab, newline)' },
                  { token: '\\S', desc: 'Any non-whitespace character' },
                  { token: '[abc]', desc: 'Any one of: a, b, or c' },
                  { token: '[^abc]', desc: 'Any character except a, b, c' },
                  { token: '[a-z]', desc: 'Any lowercase letter a through z' },
                  { token: '[A-Z]', desc: 'Any uppercase letter A through Z' },
                ],
              },
              {
                title: 'Anchors & Boundaries',
                rows: [
                  { token: '^', desc: 'Start of string (or line with m flag)' },
                  { token: '$', desc: 'End of string (or line with m flag)' },
                  { token: '\\b', desc: 'Word boundary' },
                  { token: '\\B', desc: 'Non-word boundary' },
                  { token: '\\A', desc: 'Start of entire string' },
                  { token: '\\Z', desc: 'End of entire string' },
                ],
              },
              {
                title: 'Quantifiers',
                rows: [
                  { token: '*', desc: 'Zero or more (greedy)' },
                  { token: '+', desc: 'One or more (greedy)' },
                  { token: '?', desc: 'Zero or one (optional)' },
                  { token: '{n}', desc: 'Exactly n times' },
                  { token: '{n,}', desc: 'At least n times' },
                  { token: '{n,m}', desc: 'Between n and m times' },
                  { token: '*?', desc: 'Zero or more (lazy/non-greedy)' },
                  { token: '+?', desc: 'One or more (lazy/non-greedy)' },
                ],
              },
              {
                title: 'Groups & Lookarounds',
                rows: [
                  { token: '(abc)', desc: 'Capturing group — capture abc' },
                  { token: '(?:abc)', desc: 'Non-capturing group — group without capture' },
                  { token: '(?=abc)', desc: 'Positive lookahead — followed by abc' },
                  { token: '(?!abc)', desc: 'Negative lookahead — not followed by abc' },
                  { token: '(?<=abc)', desc: 'Positive lookbehind — preceded by abc' },
                  { token: '(?<!abc)', desc: 'Negative lookbehind — not preceded by abc' },
                  { token: '(?<name>)', desc: 'Named capturing group' },
                  { token: 'a|b', desc: 'Alternation — match a or b' },
                ],
              },
            ].map((section) => (
              <div key={section.title} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-extrabold text-slate-800">{section.title}</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {section.rows.map((row) => (
                    <div key={row.token} className="flex items-center gap-4 px-6 py-2.5 hover:bg-fuchsia-50 transition-colors group">
                      <code className="text-xs font-bold font-mono text-fuchsia-600 bg-fuchsia-50 group-hover:bg-white border border-fuchsia-200 px-2.5 py-1 rounded-lg min-w-[80px] text-center flex-shrink-0 transition-colors">
                        {row.token}
                      </code>
                      <span className="text-sm text-slate-500">{row.desc}</span>
                      <button
                        onClick={() => { setPattern((prev) => prev + row.token.replace('abc', '').replace('name', 'name')); setActiveTab('tester'); }}
                        className="ml-auto text-xs text-fuchsia-400 hover:text-fuchsia-600 font-semibold opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── AD BOTTOM ── 
        <div className="mt-8 mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement — 728x90
          </div>
        </div>
        */}

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Free Regex Tester — Why Use It?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '⚡', title: 'Live Highlighting',       desc: 'See matches highlighted in color as you type. No need to click a button — results update instantly.' },
              { icon: '🧠', title: 'Pattern Explanation',     desc: 'Not sure what your regex does? The Explain tab breaks every token down into plain English.' },
              { icon: '📋', title: '10+ Cheatsheet Patterns', desc: 'One-click patterns for Email, Phone, URL, Password, IP, Date, Hex Color and more.' },
              { icon: '↔',  title: 'Replace Mode',            desc: 'Test find-and-replace operations with capture group references like $1 and $2.' },
              { icon: '🚩', title: '5 Flag Toggles',          desc: 'Toggle g, i, m, s, u flags with visual buttons. Flag string updates in real time.' },
              { icon: '🔍', title: 'Group Inspector',         desc: 'See every captured group from every match with its index, value, and position.' },
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
        </div>

      </section>
    </div>
  );
}