'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ══════════════════════════════════════════════════════════
// ── PURE JS FORMATTERS (no dependencies, runs in browser) ─
// ══════════════════════════════════════════════════════════

// ── JSON Formatter ─────────────────────────────────────────
const formatJSON = (code, indent = 2) => {
  try {
    const parsed = JSON.parse(code);
    return { result: JSON.stringify(parsed, null, indent), error: null };
  } catch (e) {
    return { result: '', error: 'Invalid JSON: ' + e.message };
  }
};

const minifyJSON = (code) => {
  try {
    return { result: JSON.stringify(JSON.parse(code)), error: null };
  } catch (e) {
    return { result: '', error: 'Invalid JSON: ' + e.message };
  }
};

// ── CSS Formatter ──────────────────────────────────────────
const formatCSS = (code, indentSize = 2) => {
  const ind = ' '.repeat(indentSize);
  let result = code
    // normalize
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    // space after colon in properties
    .replace(/([a-zA-Z0-9_-])\s*:\s*(?!\/\/)/g, '$1: ')
    // space before {
    .replace(/\s*\{\s*/g, ' {\n')
    // newline + indent after {  
    .replace(/;\s*/g, ';\n')
    // } on own line
    .replace(/\s*\}\s*/g, '\n}\n')
    // clean up
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Indent inside blocks
  const lines = result.split('\n');
  let depth = 0;
  const indented = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed === '}') { depth = Math.max(0, depth - 1); return ind.repeat(depth) + '}'; }
    const out = ind.repeat(depth) + trimmed;
    if (trimmed.endsWith('{')) depth++;
    return out;
  });
  return { result: indented.join('\n').replace(/\n{3,}/g, '\n\n').trim(), error: null };
};

const minifyCSS = (code) => {
  const result = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .trim();
  return { result, error: null };
};

// ── HTML Formatter ─────────────────────────────────────────
const formatHTML = (code, indentSize = 2) => {
  const ind = ' '.repeat(indentSize);
  const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const INLINE = new Set(['a','abbr','acronym','b','bdo','big','br','button','cite','code','dfn','em','i','img','input','kbd','label','map','object','output','q','samp','select','small','span','strong','sub','sup','textarea','time','tt','u','var']);
  const PRE = new Set(['pre','script','style','textarea']);

  const tokens = [];
  const tagRe = /(<(?:!--[\s\S]*?--|![A-Z][^>]*|\/[a-zA-Z][^>]*|[a-zA-Z][^>]*)>)/g;
  let last = 0, m;
  while ((m = tagRe.exec(code)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', val: code.slice(last, m.index) });
    tokens.push({ type: 'tag', val: m[0] });
    last = m.index + m[0].length;
  }
  if (last < code.length) tokens.push({ type: 'text', val: code.slice(last) });

  let depth = 0;
  let inPre = false;
  let preTag = '';
  const out = [];

  for (const tok of tokens) {
    if (tok.type === 'text') {
      const t = tok.val.replace(/\s+/g, ' ').trim();
      if (!t) continue;
      if (inPre) { out.push(tok.val); continue; }
      out.push(ind.repeat(depth) + t);
      continue;
    }
    const tag = tok.val;
    // Comment
    if (tag.startsWith('<!--')) { out.push(ind.repeat(depth) + tag); continue; }
    // Doctype
    if (tag.startsWith('<!')) { out.push(tag); continue; }
    // Closing tag
    if (tag.startsWith('</')) {
      const name = tag.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase() || '';
      if (PRE.has(name)) { inPre = false; out.push('</' + name + '>'); continue; }
      if (INLINE.has(name)) { const last = out[out.length - 1]; if (last !== undefined) { out[out.length - 1] = last + tag; continue; } }
      depth = Math.max(0, depth - 1);
      out.push(ind.repeat(depth) + tag);
      continue;
    }
    // Self-closing or void
    const name = tag.match(/<([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase() || '';
    const isSelfClose = tag.endsWith('/>') || VOID.has(name);
    if (inPre) { out.push(tag); continue; }
    if (INLINE.has(name)) {
      const last = out[out.length - 1];
      if (last !== undefined && !last.match(/^\s*$/)) { out[out.length - 1] = last + tag; continue; }
    }
    out.push(ind.repeat(depth) + tag);
    if (PRE.has(name) && !isSelfClose) { inPre = true; preTag = name; continue; }
    if (!isSelfClose) depth++;
  }

  return { result: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), error: null };
};

const minifyHTML = (code) => {
  const result = code
    .replace(/<!--(?![\s\S]*?--\s*!>)[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s+>/g, '>')
    .replace(/<\s+/g, '<')
    .trim();
  return { result, error: null };
};

// ── JavaScript / TypeScript Formatter ─────────────────────
const formatJS = (code, indentSize = 2) => {
  const ind = ' '.repeat(indentSize);
  try {
    let result = code
      .replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Preserve strings and template literals
    const strings = [];
    result = result
      .replace(/`[\s\S]*?`/g, (m) => { strings.push(m); return '___STR' + (strings.length - 1) + '___'; })
      .replace(/"(?:[^"\\]|\\.)*"/g, (m) => { strings.push(m); return '___STR' + (strings.length - 1) + '___'; })
      .replace(/'(?:[^'\\]|\\.)*'/g, (m) => { strings.push(m); return '___STR' + (strings.length - 1) + '___'; });

    // Preserve comments
    const comments = [];
    result = result
      .replace(/\/\/[^\n]*/g, (m) => { comments.push(m); return '___CMT' + (comments.length - 1) + '___'; })
      .replace(/\/\*[\s\S]*?\*\//g, (m) => { comments.push(m); return '___CMT' + (comments.length - 1) + '___'; });

    // Formatting rules
    result = result
      // space before/after operators
      .replace(/([^=!<>])=([^>=])/g, '$1 = $2')
      .replace(/([^<])=>([^>])/g, '$1 => $2')
      .replace(/([^+])\+([^+=])/g, (m, a, b) => a.trim() && b.trim() ? a + ' + ' + b : m)
      // Space after keywords
      .replace(/\b(if|for|while|switch|catch)\s*\(/g, '$1 (')
      .replace(/\b(else|try|finally)\s*\{/g, '$1 {')
      // Space before {
      .replace(/\)\s*\{/g, ') {')
      .replace(/\b(class|function)\s+([A-Za-z])/g, '$1 $2')
      // Comma spacing
      .replace(/,(?!\s)/g, ', ')
      // Semicolon at end of statement (basic)
      .replace(/([^{};,\s])\n(\s*[^/\s*])/g, (m, a, b) => {
        if (b.match(/^[})\]]/)) return a + '\n' + b;
        return a + '\n' + b;
      })
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, '');

    // Re-indent using brace depth
    const lines = result.split('\n');
    let depth = 0;
    let inMultiComment = false;
    const indented = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('/*')) inMultiComment = true;
      if (inMultiComment) {
        const out = ind.repeat(depth) + trimmed;
        if (trimmed.includes('*/')) inMultiComment = false;
        return out;
      }
      // Adjust depth for closing braces at start of line
      const closingCount = (trimmed.match(/^[}\])]/) || []).length;
      if (closingCount) depth = Math.max(0, depth - 1);
      const out = ind.repeat(depth) + trimmed;
      // Count brace changes
      let opens = 0, closes = 0;
      let inStr = false, strChar = '';
      for (let i = 0; i < trimmed.length; i++) {
        const ch = trimmed[i];
        if (!inStr && (ch === '"' || ch === "'" || ch === '`')) { inStr = true; strChar = ch; }
        else if (inStr && ch === strChar && trimmed[i-1] !== '\\') inStr = false;
        else if (!inStr) {
          if (ch === '{' || ch === '[' || ch === '(') opens++;
          else if (ch === '}' || ch === ']' || ch === ')') closes++;
        }
      }
      depth = Math.max(0, depth + opens - closes - closingCount);
      return out;
    });

    result = indented.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    // Restore strings and comments
    strings.forEach((s, i) => { result = result.replace('___STR' + i + '___', s); });
    comments.forEach((c, i) => { result = result.replace('___CMT' + i + '___', c); });

    return { result, error: null };
  } catch (e) {
    return { result: code, error: 'Formatter error: ' + e.message };
  }
};

const minifyJS = (code) => {
  // Preserve strings
  const strings = [];
  let result = code
    .replace(/`[\s\S]*?`/g, (m) => { strings.push(m); return '___S' + (strings.length - 1) + '___'; })
    .replace(/"(?:[^"\\]|\\.)*"/g, (m) => { strings.push(m); return '___S' + (strings.length - 1) + '___'; })
    .replace(/'(?:[^'\\]|\\.)*'/g, (m) => { strings.push(m); return '___S' + (strings.length - 1) + '___'; })
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{},;:=+\-*/%!&|<>()[\]])\s*/g, '$1')
    .replace(/\s*=>\s*/g, '=>')
    .trim();
  strings.forEach((s, i) => { result = result.replace('___S' + i + '___', s); });
  return { result, error: null };
};

// ── XML Formatter ──────────────────────────────────────────
const formatXML = (code, indentSize = 2) => {
  const ind = ' '.repeat(indentSize);
  try {
    let depth = 0;
    const tags = code.match(/<[^>]+>|[^<]+/g) || [];
    const out = [];
    for (const tag of tags) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('</')) {
        depth = Math.max(0, depth - 1);
        out.push(ind.repeat(depth) + trimmed);
      } else if (trimmed.startsWith('<?') || trimmed.startsWith('<!')) {
        out.push(ind.repeat(depth) + trimmed);
      } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>')) {
        out.push(ind.repeat(depth) + trimmed);
        if (!trimmed.match(/<[^>]+\/>/)) depth++;
      } else if (trimmed.startsWith('<')) {
        out.push(ind.repeat(depth) + trimmed);
      } else {
        if (trimmed) out.push(ind.repeat(depth) + trimmed);
      }
    }
    return { result: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(), error: null };
  } catch (e) {
    return { result: code, error: 'XML format error: ' + e.message };
  }
};

// ── TypeScript formatter (same as JS) ─────────────────────
const formatTS = formatJS;

// ── Dispatch ──────────────────────────────────────────────
const runFormatter = (code, lang, mode, indent) => {
  if (!code.trim()) return { result: '', error: null };
  if (mode === 'minify') {
    switch (lang) {
      case 'json':       return minifyJSON(code);
      case 'css':
      case 'scss':       return minifyCSS(code);
      case 'html':       return minifyHTML(code);
      case 'javascript':
      case 'typescript': return minifyJS(code);
      default:           return { result: code, error: null };
    }
  }
  switch (lang) {
    case 'json':       return formatJSON(code, indent);
    case 'css':
    case 'scss':       return formatCSS(code, indent);
    case 'html':       return formatHTML(code, indent);
    case 'javascript': return formatJS(code, indent);
    case 'typescript': return formatTS(code, indent);
    case 'xml':        return formatXML(code, indent);
    default:           return { result: code, error: null };
  }
};

// ── Language Detection ─────────────────────────────────────
const detectLang = (code) => {
  const t = code.trim();
  if (!t) return 'javascript';
  if (t.startsWith('{') || t.startsWith('[')) {
    try { JSON.parse(t); return 'json'; } catch {}
  }
  if (t.startsWith('<?xml') || (t.startsWith('<') && !t.includes('<html') && !t.includes('<!DOCTYPE'))) return 'xml';
  if (/<!DOCTYPE html/i.test(t) || /<html[\s>]/i.test(t) || (t.startsWith('<') && /<\/(div|p|span|h[1-6]|ul|li|body|head)>/i.test(t))) return 'html';
  if (/^[@.]?[a-zA-Z][^{]*\s*\{[\s\S]*?:\s*[^{]+;/m.test(t) || t.includes('@media') || t.includes('@keyframes')) return 'css';
  if (/\binterface\b|\btype\s+\w+\s*=|\bas\s+\w|\b:\s*(string|number|boolean|void|any|never|unknown)\b/.test(t)) return 'typescript';
  return 'javascript';
};

// ── Diff Highlighter ───────────────────────────────────────
const getDiff = (original, formatted) => {
  const origLines = original.split('\n');
  const fmtLines  = formatted.split('\n');
  const maxLen    = Math.max(origLines.length, fmtLines.length);
  const diff = [];
  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i];
    const f = fmtLines[i];
    if (o === undefined) diff.push({ type: 'added',   line: f,  num: i + 1 });
    else if (f === undefined) diff.push({ type: 'removed', line: o, num: i + 1 });
    else if (o !== f) diff.push({ type: 'changed', orig: o, fmt: f, num: i + 1 });
    else diff.push({ type: 'same', line: f, num: i + 1 });
  }
  return diff;
};

// ── Languages Config ───────────────────────────────────────
const LANGUAGES = [
  { key: 'javascript', label: 'JavaScript', icon: '🟨', ext: '.js',   sample: `function calculateTotal(items, taxRate = 0.08) {\nconst subtotal = items.reduce((sum, item) => {\nreturn sum + (item.price * item.quantity);\n}, 0);\nconst tax = subtotal * taxRate;\nreturn { subtotal, tax, total: subtotal + tax };\n}\n\nconst cart = [\n{ name: 'Widget', price: 29.99, quantity: 2 },\n{ name: 'Gadget', price: 49.99, quantity: 1 },\n];\n\nconsole.log(calculateTotal(cart));` },
  { key: 'typescript', label: 'TypeScript', icon: '🔷', ext: '.ts',   sample: `interface Product {\nid: number;\nname: string;\nprice: number;\ncategory: 'electronics' | 'clothing' | 'food';\n}\n\nfunction filterByCategory(products: Product[], category: Product['category']): Product[] {\nreturn products.filter(p => p.category === category);\n}\n\nconst inventory: Product[] = [\n{ id: 1, name: 'Laptop', price: 999.99, category: 'electronics' },\n{ id: 2, name: 'T-Shirt', price: 19.99, category: 'clothing' },\n];\n\nconst electronics = filterByCategory(inventory, 'electronics');\nconsole.log(electronics);` },
  { key: 'html',       label: 'HTML',       icon: '🟧', ext: '.html', sample: `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>My Page</title>\n</head>\n<body>\n<header><nav><ul><li><a href="/">Home</a></li><li><a href="/about">About</a></li></ul></nav></header>\n<main><h1>Welcome</h1><p>This is a <strong>sample</strong> HTML page with some <em>content</em>.</p></main>\n<footer><p>&copy; 2025 My Site</p></footer>\n</body>\n</html>` },
  { key: 'css',        label: 'CSS',        icon: '🔵', ext: '.css',  sample: `:root{--primary:#6366f1;--secondary:#8b5cf6;--text:#1e293b;--bg:#f8fafc;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}\nbody{font-family:system-ui,sans-serif;color:var(--text);background:var(--bg);line-height:1.6;}\n.container{max-width:1200px;margin:0 auto;padding:0 1rem;}\n.card{background:#fff;border-radius:0.75rem;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);transition:transform 0.2s ease;}\n.card:hover{transform:translateY(-2px);}\n.btn{display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:var(--primary);color:#fff;border:none;border-radius:0.5rem;cursor:pointer;font-weight:600;}\n@media(max-width:768px){.container{padding:0 0.75rem;}}` },
  { key: 'json',       label: 'JSON',       icon: '🟩', ext: '.json', sample: `{"name":"toolbeans","version":"1.0.0","description":"Free developer tools","keywords":["tools","developer","free"],"scripts":{"dev":"next dev","build":"next build","start":"next start"},"dependencies":{"next":"14.0.0","react":"^18.0.0","react-dom":"^18.0.0"},"devDependencies":{"typescript":"^5.0.0","tailwindcss":"^3.0.0"}}` },
  { key: 'xml',        label: 'XML',        icon: '📋', ext: '.xml',  sample: `<?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Smith, John</author><title>JavaScript: The Good Parts</title><genre>Technology</genre><price>39.95</price><publish_date>2024-01-15</publish_date><description>A comprehensive guide to modern JavaScript development practices.</description></book><book id="bk102"><author>Doe, Jane</author><title>CSS Mastery</title><genre>Technology</genre><price>34.95</price><publish_date>2024-03-20</publish_date><description>Advanced CSS techniques for modern web design.</description></book></catalog>` },
  { key: 'scss',       label: 'SCSS / LESS',icon: '🌸', ext: '.scss', sample: `$primary: #6366f1;\n$secondary: #8b5cf6;\n$border-radius: 0.75rem;\n.card{background:white;border-radius:$border-radius;padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);&:hover{transform:translateY(-2px);}&__title{font-size:1.25rem;font-weight:700;color:$primary;}&__body{color:#64748b;line-height:1.6;}}` },
];

const RELATED_TOOLS = [
  { name: 'JSON Formatter',     href: '/tools/json-formatter',     icon: '{ }', desc: 'Advanced JSON tree view, validation and path explorer'     },
  { name: 'SQL Formatter',      href: '/tools/sql-formatter',      icon: '🗄️',  desc: 'Format and beautify SQL queries for all dialects'          },
  { name: 'HTML to Markdown',   href: '/tools/html-to-markdown',   icon: '🔄',  desc: 'Convert HTML markup to clean Markdown with live preview'   },
  { name: 'Diff Checker',       href: '/tools/diff-checker',       icon: '↔️',  desc: 'Compare two code snippets and highlight differences'       },
];

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT ────────────────────────────────────────
// ══════════════════════════════════════════════════════════
export default function CodeFormatterTool() {
  const [code, setCode]             = useState('');
  const [output, setOutput]         = useState('');
  const [lang, setLang]             = useState('javascript');
  const [mode, setMode]             = useState('format');       // format | minify
  const [indent, setIndent]         = useState(2);
  const [activeTab, setActiveTab]   = useState('output');       // output | diff | stats
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState('');
  const [liveMode, setLiveMode]     = useState(true);
  const [formatted, setFormatted]   = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const fileRef                     = useRef(null);
  const debounceRef                 = useRef(null);

  const format = useCallback((src, l, m, ind) => {
    const { result, error: err } = runFormatter(src, l, m, ind);
    setOutput(result);
    setError(err || '');
    setFormatted(true);
  }, []);

  const handleCodeChange = (val) => {
    setCode(val);
    if (autoDetect && val.trim()) {
      const detected = detectLang(val);
      setLang(detected);
    }
    if (liveMode) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const l = autoDetect && val.trim() ? detectLang(val) : lang;
        format(val, l, mode, indent);
      }, 400);
    }
  };

  const handleFormat = () => format(code, lang, mode, indent);

  const handleCopy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2500);
  };

  const handleDownload = () => {
    if (!output) return;
    const ext = LANGUAGES.find((l) => l.key === lang)?.ext || '.txt';
    const blob = new Blob([output], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'formatted-toolbeans' + ext;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ext  = file.name.split('.').pop().toLowerCase();
    const extMap = { js: 'javascript', ts: 'typescript', html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'scss', json: 'json', xml: 'xml' };
    const detectedLang = extMap[ext] || detectLang(text);
    setLang(detectedLang);
    setCode(text);
    format(text, detectedLang, mode, indent);
  };

  const loadSample = () => {
    const sample = LANGUAGES.find((l) => l.key === lang)?.sample || '';
    setCode(sample);
    format(sample, lang, mode, indent);
  };

  const reset = () => { setCode(''); setOutput(''); setError(''); setFormatted(false); };

  const diff       = (code && output && formatted) ? getDiff(code, output) : [];
  const changedLines = diff.filter((d) => d.type !== 'same').length;
  const reduction  = output && code ? Math.round((1 - output.length / code.length) * 100) : 0;
  const inputLines = code.split('\n').length;
  const outputLines = output ? output.split('\n').length : 0;

  const selectedLang = LANGUAGES.find((l) => l.key === lang);

  // Syntax highlight token coloring (simple, CSS-class-free approach with spans)
  const highlight = (src, language) => {
    if (!src) return '';
    let escaped = src
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (language === 'json') {
      return escaped
        .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span style="color:#7dd3fc">$1</span>:')
        .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:#86efac">$1</span>')
        .replace(/\b(true|false|null)\b/g, '<span style="color:#f9a8d4">$1</span>')
        .replace(/\b(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, '<span style="color:#fde68a">$1</span>');
    }
    if (language === 'css' || language === 'scss') {
      return escaped
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#94a3b8">$1</span>')
        .replace(/([.#:@][a-zA-Z][^{,\n]*)/g, '<span style="color:#7dd3fc">$1</span>')
        .replace(/([a-zA-Z-]+)\s*:/g, '<span style="color:#c4b5fd">$1</span>:')
        .replace(/:\s*([^;{\n]+)/g, ': <span style="color:#86efac">$1</span>');
    }
    if (language === 'html' || language === 'xml') {
      return escaped
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#94a3b8">$1</span>')
        .replace(/(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g, '<span style="color:#f9a8d4">$1</span>')
        .replace(/([a-zA-Z-]+=)("(?:[^"\\]|\\.)*")/g, '<span style="color:#c4b5fd">$1</span><span style="color:#86efac">$2</span>')
        .replace(/(&gt;)/g, '<span style="color:#f9a8d4">$1</span>');
    }
    // JS / TS
    return escaped
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#94a3b8">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#94a3b8">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|new|typeof|instanceof|async|await|try|catch|finally|throw|switch|case|break|continue|type|interface|extends|implements|enum|declare|abstract|override|readonly|public|private|protected|static|void|null|undefined|true|false)\b/g,
        '<span style="color:#c4b5fd">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#86efac">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fde68a">$1</span>')
      .replace(/\b([A-Z][a-zA-Z]*)\b/g, '<span style="color:#7dd3fc">$1</span>');
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-purple-50 border-b border-slate-100 py-14">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-violet-200">
            Free · Instant · No Upload Needed
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Code{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Formatter
            </span>
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Format, beautify and minify JavaScript, TypeScript, HTML, CSS, JSON and XML instantly.
            Live formatting, syntax highlighting, diff view and file upload all in your browser.
          </p>
          {/* Language pills */}
          <div className="flex gap-2 justify-center mt-6 flex-wrap">
            {LANGUAGES.map((l) => (
              <button key={l.key} onClick={() => { setLang(l.key); setAutoDetect(false); if (code) format(code, l.key, mode, indent); }}
                className={'text-xs font-bold px-3 py-1.5 rounded-full border transition-all ' + (lang === l.key ? 'bg-violet-600 text-white border-violet-600 shadow' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600')}>
                {l.icon} {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AD TOP 
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>
*/}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* ── TOOLBAR ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Left */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mode toggle */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {[{ key: 'format', label: '✨ Format' }, { key: 'minify', label: '⚡ Minify' }].map((m) => (
                  <button key={m.key} onClick={() => { setMode(m.key); if (code) format(code, lang, m.key, indent); }}
                    className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' + (mode === m.key ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700')}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Indent selector — only in format mode */}
              {mode === 'format' && (
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5">
                  <span className="text-xs text-slate-500 font-medium">Indent:</span>
                  {[2, 4].map((n) => (
                    <button key={n} onClick={() => { setIndent(n); if (code) format(code, lang, mode, n); }}
                      className={'text-xs font-bold px-2 py-0.5 rounded-lg transition-all ' + (indent === n ? 'bg-white text-violet-700 shadow' : 'text-slate-500 hover:text-slate-700')}>
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <button onClick={loadSample}
                className="text-xs bg-slate-100 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200">
                Load Sample
              </button>
              <button onClick={() => fileRef.current?.click()}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200">
                📁 Upload File
              </button>
              <input ref={fileRef} type="file" accept=".js,.ts,.html,.htm,.css,.scss,.less,.json,.xml,.txt" className="hidden" onChange={handleUpload} />
              <button onClick={reset}
                className="text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200">
                Clear
              </button>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setAutoDetect(!autoDetect)}
                  className={'w-8 h-4 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (autoDetect ? 'bg-violet-500' : 'bg-slate-200')}>
                  <div className={'w-3 h-3 bg-white rounded-full shadow-sm transition-all ' + (autoDetect ? 'translate-x-4' : 'translate-x-0')} />
                </div>
                <span className="text-xs font-semibold text-slate-600">Auto-detect</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setLiveMode(!liveMode)}
                  className={'w-8 h-4 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (liveMode ? 'bg-violet-500' : 'bg-slate-200')}>
                  <div className={'w-3 h-3 bg-white rounded-full shadow-sm transition-all ' + (liveMode ? 'translate-x-4' : 'translate-x-0')} />
                </div>
                <span className="text-xs font-semibold text-slate-600">Live</span>
              </label>
              {!liveMode && (
                <button onClick={handleFormat} disabled={!code.trim()}
                  className="text-xs bg-violet-600 hover:bg-violet-500 disabled:bg-slate-300 text-white font-bold px-5 py-2 rounded-xl transition-all">
                  ▶ {mode === 'format' ? 'Format' : 'Minify'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── EDITOR AREA ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* INPUT */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input</span>
                {code && (
                  <span className="text-xs text-slate-400 font-mono">{inputLines} lines · {code.length.toLocaleString()} chars</span>
                )}
              </div>
              {autoDetect && code && (
                <span className={'text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700'}>
                  {selectedLang?.icon} Detected: {selectedLang?.label}
                </span>
              )}
            </div>
            <div className="relative flex-1">
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder={'Paste your code here...\n\nSupported: JavaScript, TypeScript, HTML, CSS, SCSS, JSON, XML\n\nLive formatting is on your code will be formatted as you type.'}
                className="w-full h-[560px] px-5 py-4 text-xs font-mono border border-slate-200 rounded-2xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 resize-none bg-slate-900 text-slate-200 leading-relaxed transition-all"
                spellCheck={false}
              />
              {code && (
                <button onClick={() => handleCopy(code, 'input')}
                  className={'absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ' + (copied === 'input' ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300')}>
                  {copied === 'input' ? '✓' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {/* OUTPUT */}
          <div className="flex flex-col">
            {/* Output tabs */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { key: 'output', label: '✨ Output' },
                  { key: 'diff',   label: '↔ Diff'   },
                  { key: 'stats',  label: '📊 Stats'  },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' + (activeTab === tab.key ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700')}>
                    {tab.label}
                    {tab.key === 'diff' && changedLines > 0 && (
                      <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-bold px-1 rounded">{changedLines}</span>
                    )}
                  </button>
                ))}
              </div>
              {output && (
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(output, 'output')}
                    className={'text-xs font-bold px-3 py-1.5 rounded-xl transition-all ' + (copied === 'output' ? 'bg-emerald-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white')}>
                    {copied === 'output' ? '✓ Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleDownload}
                    className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-3 py-1.5 rounded-xl transition-all">
                    ↓ {selectedLang?.ext}
                  </button>
                </div>
              )}
            </div>

            {/* ── OUTPUT TAB ── */}
            {activeTab === 'output' && (
              <div className="relative h-[560px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-900">
                {error && (
                  <div className="absolute top-0 left-0 right-0 bg-rose-900/90 text-rose-200 text-xs font-mono px-4 py-2 z-10">
                    ⚠ {error}
                  </div>
                )}
                {output ? (
                  <pre
                    className="h-full overflow-auto p-5 text-xs font-mono text-slate-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlight(output, lang) }}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <div className="text-4xl mb-3">✨</div>
                    <div className="text-sm font-bold mb-1">Formatted code will appear here</div>
                    <div className="text-xs text-slate-600">
                      {liveMode ? 'Start typing to format live' : 'Click Format to process your code'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── DIFF TAB ── */}
            {activeTab === 'diff' && (
              <div className="h-[560px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-900">
                <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-700 bg-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded bg-red-500/40 border border-red-500" />
                    <span className="text-slate-400">Removed / Original</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500" />
                    <span className="text-slate-400">Added / Formatted</span>
                  </div>
                  <span className="ml-auto text-xs text-slate-400">{changedLines} changed lines</span>
                </div>
                <div className="overflow-auto h-full pb-8">
                  {diff.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                      Format your code first to see the diff
                    </div>
                  ) : (
                    <table className="w-full text-xs font-mono">
                      <tbody>
                        {diff.map((d, i) => {
                          if (d.type === 'same') return (
                            <tr key={i} className="border-b border-slate-800">
                              <td className="px-3 py-0.5 text-slate-600 text-right w-10 select-none">{d.num}</td>
                              <td className="px-3 py-0.5 text-slate-400 whitespace-pre">{d.line}</td>
                            </tr>
                          );
                          if (d.type === 'changed') return (
                            <tr key={i}>
                              <td colSpan={2} className="p-0">
                                <div className="flex border-b border-slate-700">
                                  <span className="w-10 px-3 py-0.5 text-slate-600 text-right select-none flex-shrink-0">{d.num}</span>
                                  <span className="flex-1 px-3 py-0.5 bg-red-950/60 text-red-300 line-through whitespace-pre">{d.orig}</span>
                                </div>
                                <div className="flex border-b border-slate-700">
                                  <span className="w-10 px-3 py-0.5 text-slate-600 text-right select-none flex-shrink-0">{d.num}</span>
                                  <span className="flex-1 px-3 py-0.5 bg-green-950/60 text-green-300 whitespace-pre">{d.fmt}</span>
                                </div>
                              </td>
                            </tr>
                          );
                          if (d.type === 'added') return (
                            <tr key={i} className="border-b border-slate-700">
                              <td className="px-3 py-0.5 text-slate-600 text-right w-10 select-none">{d.num}</td>
                              <td className="px-3 py-0.5 bg-green-950/60 text-green-300 whitespace-pre">+ {d.line}</td>
                            </tr>
                          );
                          if (d.type === 'removed') return (
                            <tr key={i} className="border-b border-slate-700">
                              <td className="px-3 py-0.5 text-slate-600 text-right w-10 select-none">{d.num}</td>
                              <td className="px-3 py-0.5 bg-red-950/60 text-red-300 line-through whitespace-pre">- {d.line}</td>
                            </tr>
                          );
                          return null;
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── STATS TAB ── */}
            {activeTab === 'stats' && (
              <div className="h-[560px] border border-slate-200 rounded-2xl overflow-auto bg-white p-6">
                {formatted && output ? (
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Input Lines',     value: inputLines.toLocaleString(),          color: 'text-slate-700'  },
                        { label: 'Output Lines',    value: outputLines.toLocaleString(),         color: 'text-violet-700' },
                        { label: 'Input Chars',     value: code.length.toLocaleString(),         color: 'text-slate-700'  },
                        { label: 'Output Chars',    value: output.length.toLocaleString(),       color: 'text-violet-700' },
                        { label: 'Changed Lines',   value: changedLines.toLocaleString(),        color: 'text-amber-700'  },
                        { label: mode === 'minify' ? 'Size Reduction' : 'Size Change',
                          value: (reduction > 0 ? '-' : reduction < 0 ? '+' : '') + Math.abs(reduction) + '%',
                          color: reduction > 0 ? 'text-emerald-700' : reduction < 0 ? 'text-rose-700' : 'text-slate-700' },
                        { label: 'Language',        value: selectedLang?.label || lang,          color: 'text-violet-700' },
                        { label: 'Mode',            value: mode === 'format' ? 'Beautify' : 'Minify', color: 'text-slate-700' },
                      ].map((s) => (
                        <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className={'text-xl font-extrabold ' + s.color}>{s.value}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Size bar */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="text-xs font-bold text-slate-500 mb-3">Size Comparison</div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Input</span>
                            <span className="font-mono font-bold text-slate-700">{code.length.toLocaleString()} chars</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-slate-400 h-2 rounded-full" style={{ width: '100%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Output</span>
                            <span className="font-mono font-bold text-violet-700">{output.length.toLocaleString()} chars</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-violet-500 h-2 rounded-full" style={{ width: Math.min(100, (output.length / code.length * 100)) + '%' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    Format code first to see statistics
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── LANGUAGE REFERENCE ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900 mb-4">Supported Languages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {LANGUAGES.map((l) => (
              <button key={l.key} onClick={() => { setLang(l.key); setAutoDetect(false); if (code) format(code, l.key, mode, indent); }}
                className={'p-3 rounded-xl border text-center transition-all hover:shadow-sm ' + (lang === l.key ? 'bg-violet-50 border-violet-300' : 'bg-slate-50 border-slate-200 hover:border-violet-200')}>
                <div className="text-2xl mb-1">{l.icon}</div>
                <div className={'text-xs font-bold ' + (lang === l.key ? 'text-violet-700' : 'text-slate-700')}>{l.label}</div>
                <div className="text-xs text-slate-400 font-mono">{l.ext}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AD BOTTOM 
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
            */}
        {/* ── RELATED TOOLS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Other free developer tools that work great alongside the code formatter.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free Online Code Formatter & Beautifier</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans code formatter instantly beautifies and formats JavaScript, TypeScript, HTML, CSS, SCSS, JSON and XML code directly in your browser no server upload, no account required. Paste messy, minified or unindented code and get clean, properly-indented output in milliseconds.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Switch to <strong>Minify mode</strong> to compress your code by removing whitespace, comments and unnecessary characters reducing file size for production deployment. The <strong>Diff view</strong> shows exactly which lines changed between input and output so you can review every formatting decision. Auto-language detection identifies your code type automatically so you don&apos;t have to select it manually.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Upload code files directly using the file picker supports .js, .ts, .html, .css, .scss, .json and .xml files. All formatting runs 100% client-side using pure JavaScript engines, meaning your code never leaves your device and the tool works even without an internet connection after the initial page load.
          </p>
        </div>
      </div>
    </div>
  );
}