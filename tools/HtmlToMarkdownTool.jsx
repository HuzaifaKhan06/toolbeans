'use client';

import { useState, useCallback, useRef } from 'react';

// ── HTML → Markdown Engine ─────────────────────────────────
const htmlToMarkdown = (html, options = {}) => {
  const { githubMode = false, cleanHtml = false, preserveLinks = true } = options;

  if (!html || !html.trim()) return '';

  // 1. Optionally strip unwanted tags entirely
  let cleaned = html;
  if (cleanHtml) {
    // Remove script, style, head, meta, link, comment nodes
    cleaned = cleaned
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\/?(?:html|body|head|meta|link|title|base|noscript|template|slot|canvas|svg|iframe|object|embed|applet|form|input|button|select|textarea|label|fieldset|legend|datalist|output|progress|meter|details|summary|dialog|menu|menuitem)[^>]*>/gi, '')
      .replace(/\s(?:class|id|style|data-[a-z-]+|aria-[a-z-]+|role|tabindex|onclick|onload|onmouseover|onkeydown|onkeyup|onchange|onfocus|onblur|onsubmit|onreset|onselect|onerror|onabort|onmousedown|onmouseup|onmousemove|onmouseout|oncontextmenu|ondblclick|onkeypress|onresize|onscroll|onunload|onbeforeunload|onhashchange|onpopstate|onstorage|onmessage|onoffline|ononline|onpagehide|onpageshow|onvisibilitychange|lang|dir|xml:lang|xmlns|content|charset|http-equiv|name|property|itemprop|itemscope|itemtype|rel|target|type|placeholder|value|checked|selected|disabled|readonly|required|multiple|size|maxlength|min|max|step|pattern|autocomplete|autofocus|spellcheck|draggable|contenteditable|translate|hidden|open)="[^"]*"/gi, '')
      .replace(/\s(?:class|id|style)='[^']*'/gi, '');
  }

  // 2. Decode common HTML entities
  const decodeEntities = (str) =>
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '...')
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&trade;/g, '™')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  // 3. Process block elements first, then inline
  let md = cleaned;

  // Pre / Code blocks (must come before inline code)
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    const lang = (_.match(/class="[^"]*language-([a-z]+)/) || [])[1] || '';
    return '\n\n```' + lang + '\n' + decodeEntities(code.replace(/<[^>]+>/g, '')) + '\n```\n\n';
  });
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => {
    return '\n\n```\n' + decodeEntities(code.replace(/<[^>]+>/g, '')) + '\n```\n\n';
  });

  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const innerMd = htmlToMarkdown(inner, options).trim();
    return '\n\n' + innerMd.split('\n').map((l) => '> ' + l).join('\n') + '\n\n';
  });

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows = [];
    const rowMatches = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    rowMatches.forEach((row, ri) => {
      const cells = [];
      const cellMatches = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
      cellMatches.forEach((cell) => {
        const isHeader = /^<th/i.test(cell);
        const text = cell.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        cells.push({ text: decodeEntities(text), isHeader });
      });
      rows.push(cells);
    });
    if (!rows.length) return '';
    const colCount = Math.max(...rows.map((r) => r.length));
    let tablemd = '\n\n';
    rows.forEach((row, ri) => {
      const padded = [...row, ...Array(Math.max(0, colCount - row.length)).fill({ text: '', isHeader: false })];
      tablemd += '| ' + padded.map((c) => c.text || ' ').join(' | ') + ' |\n';
      if (ri === 0) tablemd += '| ' + padded.map(() => '---').join(' | ') + ' |\n';
    });
    return tablemd + '\n';
  });

  // Ordered lists
  const convertList = (html, ordered, depth = 0) => {
    const itemMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    return itemMatches.map((item, i) => {
      let inner = item.replace(/<\/?li[^>]*>/gi, '');
      // Handle nested lists
      inner = inner
        .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => '\n' + convertList(c, false, depth + 1))
        .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => '\n' + convertList(c, true, depth + 1));
      const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const indent = '  '.repeat(depth);
      const prefix = ordered ? (i + 1) + '. ' : '- ';
      return indent + prefix + decodeEntities(text);
    }).join('\n');
  };

  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, c) => '\n\n' + convertList(c, false) + '\n\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, c) => '\n\n' + convertList(c, true) + '\n\n');

  // Headings h1-h6
  for (let i = 6; i >= 1; i--) {
    md = md.replace(new RegExp('<h' + i + '[^>]*>([\\s\\S]*?)<\\/h' + i + '>', 'gi'), (_, inner) => {
      const text = decodeEntities(inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
      return '\n\n' + '#'.repeat(i) + ' ' + text + '\n\n';
    });
  }

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '\n\n---\n\n');

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => '\n\n' + inner.trim() + '\n\n');

  // Divs / sections / articles → newlines
  md = md.replace(/<\/?(?:div|section|article|header|footer|main|aside|nav|figure|figcaption)[^>]*>/gi, '\n');

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '  \n');

  // ── Inline elements ────────────────────────────────────
  // Bold
  md = md.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, t) => '**' + t.trim() + '**');
  // Italic
  md = md.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, (_, t) => '_' + t.trim() + '_');
  // Strikethrough
  md = md.replace(/<(?:s|strike|del)[^>]*>([\s\S]*?)<\/(?:s|strike|del)>/gi, (_, t) => githubMode ? '~~' + t.trim() + '~~' : t.trim());
  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => '`' + decodeEntities(t.replace(/<[^>]+>/g, '')) + '`');
  // Mark / highlight GFM doesn't support native highlight but use bold
  md = md.replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, (_, t) => '**' + t.trim() + '**');
  // Superscript / subscript
  md = md.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, (_, t) => githubMode ? '^' + t + '^' : t);
  md = md.replace(/<sub[^>]*>([\s\S]*?)<\/sub>/gi, (_, t) => '~' + t + '~');

  // Links
  if (preserveLinks) {
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const linkText = text.replace(/<[^>]+>/g, '').trim();
      return '[' + linkText + '](' + href + ')';
    });
    md = md.replace(/<a[^>]*href='([^']*)'[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
      const linkText = text.replace(/<[^>]+>/g, '').trim();
      return '[' + linkText + '](' + href + ')';
    });
  } else {
    md = md.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, (_, t) => t.replace(/<[^>]+>/g, '').trim());
  }

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, (_, src, alt) => '![' + alt + '](' + src + ')');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, (_, alt, src) => '![' + alt + '](' + src + ')');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, (_, src) => '![](' + src + ')');

  // GitHub-specific: task lists
  if (githubMode) {
    md = md.replace(/- \[( |x|X)\] /g, (_, c) => '- [' + c + '] ');
  }

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode any remaining entities
  md = decodeEntities(md);

  // Normalize whitespace
  md = md
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]+$/gm, '')
    .trim();

  return md;
};

// ── Simple Markdown → HTML for Preview ────────────────────
const markdownToHtml = (md) => {
  if (!md) return '';
  let html = md;

  // Code blocks
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, lang, code) =>
    '<pre class="bg-slate-900 text-emerald-400 rounded-xl p-4 overflow-x-auto text-xs font-mono my-4"><code>' + escHtml(code.trim()) + '</code></pre>'
  );

  // Headings
  for (let i = 6; i >= 1; i--) {
    const sizes = ['text-3xl','text-2xl','text-xl','text-lg','text-base','text-sm'];
    html = html.replace(new RegExp('^#{' + i + '} (.+)$', 'gm'), '<h' + i + ' class="font-extrabold ' + sizes[i-1] + ' text-slate-900 mt-6 mb-3">' + '$1' + '</h' + i + '>');
  }

  // Tables
  html = html.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)*)/g, (table) => {
    const lines = table.trim().split('\n');
    const header = lines[0].split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map((c) => '<th class="px-3 py-2 text-left font-bold text-slate-700 bg-slate-100 border border-slate-200">' + c.trim() + '</th>').join('');
    const rows = lines.slice(2).map((l) => '<tr>' + l.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map((c) => '<td class="px-3 py-2 border border-slate-200 text-slate-600">' + c.trim() + '</td>').join('') + '</tr>').join('');
    return '<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse"><thead><tr>' + header + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  });

  // Blockquote
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-emerald-400 pl-4 py-1 my-3 text-slate-600 italic bg-emerald-50 rounded-r-lg">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-6 border-slate-200" />');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em class="italic text-slate-700">$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through text-slate-400">$1</del>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-rose-600 font-mono text-xs px-1.5 py-0.5 rounded">$1</code>');

  // Links & images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 underline hover:text-emerald-800" target="_blank" rel="noopener">$1</a>');

  // Lists
  html = html.replace(/^(- .+\n?)+/gm, (block) => '<ul class="list-disc pl-6 my-3 space-y-1">' + block.trim().split('\n').map((l) => '<li class="text-slate-600">' + l.replace(/^- /, '') + '</li>').join('') + '</ul>');
  html = html.replace(/^(\d+\. .+\n?)+/gm, (block) => '<ol class="list-decimal pl-6 my-3 space-y-1">' + block.trim().split('\n').map((l) => '<li class="text-slate-600">' + l.replace(/^\d+\. /, '') + '</li>').join('') + '</ol>');

  // Paragraphs
  html = html.replace(/\n\n([^<\n].+)/g, '\n\n<p class="text-slate-600 leading-relaxed mb-3">$1</p>');

  return html;
};

const escHtml = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── Sample HTML ───────────────────────────────────────────
const SAMPLE_HTML = `<h1>Getting Started with React</h1>
<p>React is a <strong>JavaScript library</strong> for building <em>user interfaces</em>. It was created by <a href="https://facebook.com">Facebook</a> and is now maintained by Meta and the community.</p>

<h2>Key Features</h2>
<ul>
  <li>Component-based architecture</li>
  <li>Virtual DOM for performance</li>
  <li>Unidirectional data flow</li>
  <li>Rich ecosystem and community</li>
</ul>

<h2>Installation</h2>
<p>Install React using npm or yarn:</p>
<pre><code class="language-bash">npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev</code></pre>

<h2>Example Component</h2>
<pre><code class="language-jsx">function Hello({ name }) {
  return &lt;h1&gt;Hello, {name}!&lt;/h1&gt;;
}</code></pre>

<h2>Comparison Table</h2>
<table>
  <tr><th>Feature</th><th>React</th><th>Vue</th><th>Angular</th></tr>
  <tr><td>Learning Curve</td><td>Medium</td><td>Easy</td><td>Hard</td></tr>
  <tr><td>Performance</td><td>High</td><td>High</td><td>High</td></tr>
  <tr><td>Bundle Size</td><td>Small</td><td>Small</td><td>Large</td></tr>
</table>

<blockquote>
  <p>React makes it painless to create interactive UIs. Design simple views for each state in your application.</p>
</blockquote>

<h3>Useful Links</h3>
<p>Visit the <a href="https://react.dev">official React docs</a> to learn more. You can also check the <a href="https://github.com/facebook/react">GitHub repository</a>.</p>

<hr/>

<p>Happy coding! <strong>React</strong> is a great choice for modern web development.</p>`;

// ── Related Tools ──────────────────────────────────────────
const RELATED_TOOLS = [
  { name: 'Word Counter',    href: '/tools/word-counter',    icon: '📝', desc: 'Count words, characters and reading time in your content' },
  { name: 'Code Formatter',  href: '/tools/code-formatter',  icon: '✨', desc: 'Format and beautify HTML, CSS, JavaScript code' },
  { name: 'Base64 Encoder',  href: '/tools/base64-encoder-decoder', icon: '🔄', desc: 'Encode or decode Base64 strings and data' },
  { name: 'JSON Formatter',  href: '/tools/json-formatter',  icon: '{ }', desc: 'Format, validate and explore JSON data structures' },
];

// ── Main Component ─────────────────────────────────────────
export default function HtmlToMarkdownTool() {
  const [html, setHtml]           = useState('');
  const [markdown, setMarkdown]   = useState('');
  const [activeView, setActiveView] = useState('split');   // split | markdown | preview
  const [githubMode, setGithub]   = useState(true);
  const [cleanHtml, setClean]     = useState(false);
  const [preserveLinks, setLinks] = useState(true);
  const [copied, setCopied]       = useState(false);
  const [converted, setConverted] = useState(false);
  const [liveMode, setLive]       = useState(true);
  const fileRef                   = useRef(null);

  const convert = useCallback((input, opts) => {
    const result = htmlToMarkdown(input, opts);
    setMarkdown(result);
    setConverted(true);
  }, []);

  const handleHtmlChange = (val) => {
    setHtml(val);
    if (liveMode) {
      convert(val, { githubMode, cleanHtml, preserveLinks });
    }
  };

  const handleManualConvert = () => {
    convert(html, { githubMode, cleanHtml, preserveLinks });
  };

  const handleCopy = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'converted-toolbeans.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setHtml(text);
    convert(text, { githubMode, cleanHtml, preserveLinks });
  };

  const loadSample = () => {
    setHtml(SAMPLE_HTML);
    convert(SAMPLE_HTML, { githubMode, cleanHtml, preserveLinks });
  };

  const reset = () => {
    setHtml(''); setMarkdown(''); setConverted(false);
  };

  const toggleOption = (key, value) => {
    const opts = { githubMode, cleanHtml, preserveLinks, [key]: value };
    if (key === 'githubMode')    setGithub(value);
    if (key === 'cleanHtml')     setClean(value);
    if (key === 'preserveLinks') setLinks(value);
    if (html.trim()) convert(html, opts);
  };

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const lineCount = markdown ? markdown.split('\n').length : 0;
  const charCount = markdown.length;

  const Toggle = ({ value, onChange, label, desc }) => (
    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all">
      <div onClick={() => onChange(!value)}
        className={'w-9 h-5 rounded-full transition-all flex items-center px-0.5 cursor-pointer flex-shrink-0 ' + (value ? 'bg-teal-500' : 'bg-slate-200')}>
        <div className={'w-4 h-4 bg-white rounded-full shadow-sm transition-all ' + (value ? 'translate-x-4' : 'translate-x-0')} />
      </div>
      <div>
        <div className="text-xs font-bold text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 border-b border-slate-100 py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-teal-200">
            Free · Live Conversion · No Signup
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            HTML to{' '}
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Markdown
            </span>
            {' '}Converter
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Convert HTML markup to clean, readable Markdown instantly. Supports GitHub Flavored Markdown,
            tables, code blocks, nested lists, blockquotes, links and images with live preview.
          </p>

          {/* Feature badges */}
          <div className="flex gap-2 justify-center mt-6 flex-wrap">
            {['Live Preview','Tables','Code Blocks','Nested Lists','Blockquotes','GitHub GFM','Image Tags','Clean HTML'].map((f) => (
              <span key={f} className="text-xs bg-white border border-teal-200 text-teal-700 font-semibold px-3 py-1 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* AD TOP 
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
      </div>
      */}

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-5">

        {/* ── TOOLBAR ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
          {/* Left: actions */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={loadSample}
              className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200">
              Load Sample HTML
            </button>
            <button onClick={() => fileRef.current?.click()}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200">
              📁 Upload .html
            </button>
            <input ref={fileRef} type="file" accept=".html,.htm,.txt" className="hidden" onChange={handleUpload} />
            <button onClick={reset}
              className="text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200">
              Clear
            </button>
            {!liveMode && (
              <button onClick={handleManualConvert}
                disabled={!html.trim()}
                className="text-xs bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold px-4 py-2 rounded-xl transition-all">
                ▶ Convert
              </button>
            )}
          </div>

          {/* Right: view toggle + live toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Live toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setLive(!liveMode)}
                className={'w-8 h-4 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (liveMode ? 'bg-teal-500' : 'bg-slate-200')}>
                <div className={'w-3 h-3 bg-white rounded-full shadow-sm transition-all ' + (liveMode ? 'translate-x-4' : 'translate-x-0')} />
              </div>
              <span className="text-xs font-bold text-slate-600">Live</span>
            </label>

            {/* View mode */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { key: 'split',    label: '⬛ Split'   },
                { key: 'markdown', label: '# Markdown' },
                { key: 'preview',  label: '👁 Preview'  },
              ].map((v) => (
                <button key={v.key} onClick={() => setActiveView(v.key)}
                  className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' + (activeView === v.key ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700')}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── OPTIONS ROW ── */}
        <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Options</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Toggle value={githubMode}    onChange={(v) => toggleOption('githubMode', v)}
              label="GitHub Flavored Markdown" desc="~~strikethrough~~, tables, task lists" />
            <Toggle value={cleanHtml}     onChange={(v) => toggleOption('cleanHtml', v)}
              label="Clean HTML First"         desc="Strip scripts, styles, class/id attrs" />
            <Toggle value={preserveLinks} onChange={(v) => toggleOption('preserveLinks', v)}
              label="Preserve Links"           desc="Keep [text](url) markdown links" />
          </div>
        </div>

        {/* ── EDITOR AREA ── */}
        <div className={activeView === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : 'flex flex-col gap-5'}>

          {/* HTML INPUT shown in split + always when not in preview-only */}
          {(activeView === 'split' || activeView === 'markdown') && activeView !== 'preview' && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">HTML Input</span>
                  {html && <span className="text-xs text-slate-400">{html.length.toLocaleString()} chars</span>}
                </div>
                {html && (
                  <button onClick={() => { setHtml(''); setMarkdown(''); setConverted(false); }}
                    className="text-xs text-slate-400 hover:text-rose-500 transition-colors">✕ clear</button>
                )}
              </div>
              <div className="relative flex-1">
                <textarea
                  value={html}
                  onChange={(e) => handleHtmlChange(e.target.value)}
                  placeholder={'Paste your HTML here...\n\n<h1>Title</h1>\n<p>Some <strong>bold</strong> and <em>italic</em> text.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>'}
                  className="w-full h-[520px] px-4 py-4 text-xs font-mono border border-slate-200 rounded-2xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none bg-slate-900 text-slate-200 leading-relaxed transition-all"
                  spellCheck={false}
                />
                {/* Line count badge */}
                {html && (
                  <div className="absolute bottom-3 right-3 text-xs text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded">
                    {html.split('\n').length} lines
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MARKDOWN OUTPUT + PREVIEW */}
          {(activeView === 'split' || activeView === 'markdown' || activeView === 'preview') && (
            <div className="flex flex-col">

              {/* Output header with stats + actions */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {activeView === 'preview' ? 'Rendered Preview' : 'Markdown Output'}
                  </span>
                  {converted && markdown && (
                    <div className="flex gap-2 text-xs text-slate-400">
                      <span>{wordCount} words</span>
                      <span>{lineCount} lines</span>
                      <span>{charCount.toLocaleString()} chars</span>
                    </div>
                  )}
                </div>
                {markdown && (
                  <div className="flex gap-2">
                    {activeView !== 'preview' && (
                      <>
                        <button onClick={handleCopy}
                          className={'text-xs font-bold px-3 py-1.5 rounded-xl transition-all ' + (copied ? 'bg-emerald-500 text-white' : 'bg-teal-600 hover:bg-teal-500 text-white')}>
                          {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                        <button onClick={handleDownload}
                          className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-3 py-1.5 rounded-xl transition-all">
                          ↓ .md
                        </button>
                      </>
                    )}
                    {activeView === 'split' && (
                      <button onClick={() => setActiveView('preview')}
                        className="text-xs bg-white border border-slate-200 hover:border-teal-300 text-slate-600 font-semibold px-3 py-1.5 rounded-xl transition-all">
                        👁 Preview
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Markdown raw text */}
              {activeView !== 'preview' && (
                <div className="relative flex-1">
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="Markdown output will appear here as you type HTML..."
                    className="w-full h-[520px] px-4 py-4 text-xs font-mono border border-slate-200 rounded-2xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-50 resize-none bg-white text-slate-700 leading-relaxed transition-all"
                    spellCheck={false}
                  />
                  {!markdown && html && !liveMode && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                      <button onClick={handleManualConvert}
                        className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg">
                        ▶ Convert Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Preview */}
              {activeView === 'preview' && (
                <div className="h-[520px] overflow-y-auto border border-slate-200 rounded-2xl bg-white p-6">
                  {markdown ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                      No content to preview yet paste HTML and convert first.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── HTML TAG REFERENCE ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900 mb-4">HTML → Markdown Tag Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { html: '<h1> – <h6>',   md: '# Heading 1 … ###### Heading 6',   label: 'Headings'    },
              { html: '<strong>, <b>', md: '**bold text**',                     label: 'Bold'        },
              { html: '<em>, <i>',     md: '_italic text_',                     label: 'Italic'      },
              { html: '<a href="">',   md: '[text](url)',                        label: 'Links'       },
              { html: '<img src="">',  md: '![alt](src)',                        label: 'Images'      },
              { html: '<code>',        md: '`inline code`',                     label: 'Code'        },
              { html: '<pre><code>',   md: '```lang\\ncode\\n```',              label: 'Code Block'  },
              { html: '<ul><li>',      md: '- list item',                       label: 'Unordered'   },
              { html: '<ol><li>',      md: '1. list item',                      label: 'Ordered'     },
              { html: '<blockquote>',  md: '> quoted text',                     label: 'Blockquote'  },
              { html: '<hr>',          md: '---',                               label: 'Divider'     },
              { html: '<table>',       md: '| col | col |\\n|---|---|',         label: 'Table'       },
              { html: '<br>',          md: '  \\n (2 spaces)',                  label: 'Line Break'  },
              { html: '<del>, <s>',    md: '~~strikethrough~~',                 label: 'Strike'      },
              { html: '<p>',           md: 'paragraph\\n\\n',                  label: 'Paragraph'   },
              { html: '&amp; entities', md: 'Decoded automatically',            label: 'Entities'    },
            ].map((row) => (
              <div key={row.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs font-bold text-teal-700 mb-1">{row.label}</div>
                <div className="text-xs font-mono text-slate-600 bg-white rounded px-2 py-1 border border-slate-200 mb-1">{row.html}</div>
                <div className="text-xs text-slate-400">→ <span className="font-mono">{row.md}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* AD BOTTOM 
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
        */}

        {/* ── RELATED TOOLS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Other free tools that work great alongside the HTML to Markdown converter.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free HTML to Markdown Converter</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans HTML to Markdown converter transforms HTML markup into clean, readable Markdown instantly as you type. It handles all standard HTML elements headings h1–h6, bold and italic text, links, images, unordered and ordered lists with nesting, code blocks with language hints, blockquotes, tables, and horizontal rules.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            Enable <strong>GitHub Flavored Markdown</strong> mode for strikethrough (~~text~~), task list checkboxes, and table support compatible with GitHub README files, wikis, and GitHub Pages. The <strong>Clean HTML</strong> option strips away scripts, stylesheets, inline styles, class and ID attributes to produce minimal, portable Markdown without layout noise.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The tool is ideal for bloggers migrating from WordPress or other CMS platforms, developers writing documentation, technical writers converting web content to Markdown-based wikis, and anyone moving content from HTML emails to Markdown documents. All conversion happens entirely in your browser no data is sent to any server.
          </p>
        </div>
      </div>
    </div>
  );
}