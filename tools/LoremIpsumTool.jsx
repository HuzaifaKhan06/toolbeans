'use client';

import { useState, useCallback } from 'react';

// ── Full Lorem Ipsum word bank ─────────────────────────────
const LOREM_WORDS = [
  'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
  'sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore',
  'magna','aliqua','enim','ad','minim','veniam','quis','nostrud',
  'exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo',
  'consequat','duis','aute','irure','reprehenderit','voluptate','velit',
  'esse','cillum','fugiat','nulla','pariatur','excepteur','sint','occaecat',
  'cupidatat','non','proident','sunt','culpa','qui','officia','deserunt',
  'mollit','anim','id','est','laborum','pellentesque','habitant','morbi',
  'tristique','senectus','netus','malesuada','fames','ac','turpis','egestas',
  'volutpat','lacus','eleifend','mi','in','dignissim','cras','tincidunt',
  'lobortis','feugiat','vivamus','at','augue','eget','arcu','dictum','varius',
  'duis','ultricies','lacus','sed','turpis','tincidunt','id','aliquet',
  'risus','feugiat','pretium','nibh','ipsum','consequat','nisl','vel',
  'pretium','lectus','quam','id','leo','in','vitae','turpis','massa',
  'placerat','duis','ultricies','lacus','sed','turpis','tincidunt',
  'posuere','morbi','leo','urna','molestie','at','elementum','eu',
  'facilisis','sed','odio','morbi','quis','commodo','odio','aenean',
  'facilisis','magna','etiam','tempor','orci','eu','lobortis','elementum',
  'nibh','tellus','molestie','nunc','non','blandit','massa','enim',
  'nec','dui','nunc','mattis','enim','ut','tellus','elementum',
  'sagittis','vitae','et','leo','duis','ut','diam','quam',
  'nulla','facilisi','etiam','dignissim','diam','quis','enim',
  'blandit','volutpat','maecenas','volutpat','blandit','aliquam',
  'etiam','erat','velit','scelerisque','in','dictum','non',
  'consectetur','a','erat','nam','at','lectus','urna','duis',
  'convallis','convallis','tellus','id','interdum','velit',
];

const TECH_WORDS = [
  'API','database','framework','component','interface','algorithm','function',
  'variable','parameter','deployment','integration','authentication','server',
  'client','request','response','endpoint','middleware','module','package',
  'repository','branch','commit','merge','pipeline','container','instance',
  'microservice','scalability','latency','throughput','bandwidth','protocol',
  'encryption','token','session','cache','query','schema','migration',
  'refactor','dependency','library','runtime','compiler','debugger','console',
];

const BUSINESS_WORDS = [
  'strategy','stakeholder','deliverable','milestone','roadmap','synergy',
  'leverage','optimize','scalable','agile','innovative','disruptive',
  'ecosystem','revenue','pipeline','engagement','conversion','retention',
  'acquisition','metrics','KPI','dashboard','workflow','process','solution',
  'platform','mission','vision','value','growth','performance','efficiency',
  'portfolio','initiative','objective','benchmark','insight','analytics',
];

const CASUAL_WORDS = [
  'awesome','basically','literally','totally','honestly','actually',
  'definitely','absolutely','probably','obviously','clearly','simply',
  'quickly','easily','perfectly','naturally','currently','recently',
  'seriously','specifically','particularly','generally','typically',
  'usually','mostly','mainly','especially','exactly','directly',
  'immediately','eventually','finally','already','still','just','really',
];

const WORD_BANKS = {
  lorem:    LOREM_WORDS,
  tech:     TECH_WORDS,
  business: BUSINESS_WORDS,
  casual:   CASUAL_WORDS,
};

// Sentence-length presets. 'medium' matches the original 6..18 default exactly,
// so existing output is unchanged unless the user picks Short or Long.
const DENSITY = {
  short:  { min: 4,  max: 9,  label: 'Short'  },
  medium: { min: 6,  max: 18, label: 'Medium' },
  long:   { min: 12, max: 28, label: 'Long'   },
};

// ── Helpers ────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const generateSentence = (bank, minWords = 6, maxWords = 18) => {
  const len   = minWords + Math.floor(Math.random() * (maxWords - minWords));
  const words = Array.from({ length: len }, () => pick(bank));
  // Add comma randomly
  if (len > 8 && Math.random() > 0.5) {
    const commaAt = 3 + Math.floor(Math.random() * (Math.floor(len / 2)));
    words[commaAt] = words[commaAt] + ',';
  }
  return capitalize(words.join(' ')) + '.';
};

const generateParagraph = (bank, minSentences = 3, maxSentences = 7, dMin = 6, dMax = 18) => {
  const len = minSentences + Math.floor(Math.random() * (maxSentences - minSentences));
  return Array.from({ length: len }, () => generateSentence(bank, dMin, dMax)).join(' ');
};

const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const generate = ({ type, amount, unit, startWithLorem, includeHTML, htmlTag, density, ordered }) => {
  const bank = WORD_BANKS[type] || LOREM_WORDS;
  const d = DENSITY[density] || DENSITY.medium;
  const dMin = d.min, dMax = d.max;

  let result = [];

  if (unit === 'paragraphs') {
    for (let i = 0; i < amount; i++) {
      let para = '';
      if (i === 0 && startWithLorem && type === 'lorem') {
        para = CLASSIC_OPENING + ' ' + generateParagraph(bank, 2, 5, dMin, dMax);
      } else {
        para = generateParagraph(bank, 3, 7, dMin, dMax);
      }
      result.push(para);
    }
    if (includeHTML) {
      return result.map((p) => '<' + htmlTag + '>' + p + '</' + htmlTag + '>').join('\n\n');
    }
    return result.join('\n\n');

  } else if (unit === 'sentences') {
    let sentences = [];
    if (startWithLorem && type === 'lorem') sentences.push(CLASSIC_OPENING);
    while (sentences.length < amount) sentences.push(generateSentence(bank, dMin, dMax));
    sentences = sentences.slice(0, amount);
    if (includeHTML) {
      return sentences.map((s) => '<' + htmlTag + '>' + s + '</' + htmlTag + '>').join('\n');
    }
    return sentences.join(' ');

  } else if (unit === 'list') {
    // NEW: list output ordered/unordered, plain bullets or HTML ul/ol
    const items = Array.from({ length: amount }, () => generateSentence(bank, dMin, dMax));
    if (includeHTML) {
      const tag = ordered ? 'ol' : 'ul';
      return '<' + tag + '>\n' + items.map((it) => '  <li>' + it + '</li>').join('\n') + '\n</' + tag + '>';
    }
    return items.map((it, i) => (ordered ? (i + 1) + '. ' : '• ') + it).join('\n');

  } else {
    // words
    const words = [];
    if (startWithLorem && type === 'lorem') {
      words.push(...['Lorem', 'ipsum', 'dolor', 'sit', 'amet,']);
    }
    while (words.length < amount) words.push(pick(bank));
    return words.slice(0, amount).join(' ');
  }
};

const HTML_TAGS = ['p', 'div', 'span', 'li', 'blockquote', 'article', 'section'];
const TYPES     = [
  { key: 'lorem',    label: 'Classic Lorem Ipsum', desc: 'Traditional placeholder text' },
  { key: 'tech',     label: 'Tech / Dev',          desc: 'Developer terminology' },
  { key: 'business', label: 'Business',            desc: 'Corporate buzzword soup' },
  { key: 'casual',   label: 'Casual',              desc: 'Natural everyday language' },
];

export default function LoremIpsumTool() {
  const [type, setType]               = useState('lorem');
  const [unit, setUnit]               = useState('paragraphs');
  const [amount, setAmount]           = useState(3);
  const [startWithLorem, setStart]    = useState(true);
  const [includeHTML, setHTML]        = useState(false);
  const [htmlTag, setHtmlTag]         = useState('p');
  const [density, setDensity]         = useState('medium');
  const [ordered, setOrdered]         = useState(false);
  const [output, setOutput]           = useState('');
  const [copied, setCopied]           = useState(false);
  const [generated, setGenerated]     = useState(false);

  // Max amount per unit (list capped at 50 like sentences)
  const maxForUnit = (u) => (u === 'words' ? 100 : u === 'sentences' ? 50 : u === 'list' ? 50 : 20);

  const handleGenerate = useCallback(() => {
    const result = generate({
      type,
      amount: Math.min(Math.max(1, amount), maxForUnit(unit)),
      unit,
      startWithLorem,
      includeHTML,
      htmlTag,
      density,
      ordered,
    });
    setOutput(result);
    setGenerated(true);
    setCopied(false);
  }, [type, amount, unit, startWithLorem, includeHTML, htmlTag, density, ordered]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'lorem-ipsum-toolbeans.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border-b border-slate-100 py-14">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <a href="/" className="hover:text-purple-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-purple-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Lorem Ipsum Generator</span>
          </nav>
          <span className="inline-block bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Free · Instant · Multiple Styles
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Lorem Ipsum{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Generate classic Lorem Ipsum or modern alternatives tech, business and casual styles.
            Choose paragraphs, sentences, words or lists. HTML output included.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ── CONTROLS CARD ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Style</label>
              <div className="flex flex-col gap-2">
                {TYPES.map((t) => (
                  <button key={t.key} onClick={() => setType(t.key)}
                    className={'w-full text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ' + (type === t.key ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300')}>
                    <div className="font-bold">{t.label}</div>
                    <div className={'text-xs mt-0.5 ' + (type === t.key ? 'text-purple-200' : 'text-slate-400')}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Unit + Amount */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Unit</label>
                <div className="flex flex-col gap-2">
                  {['paragraphs', 'sentences', 'words', 'list'].map((u) => (
                    <button key={u} onClick={() => setUnit(u)}
                      className={'w-full text-left px-3 py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ' + (unit === u ? 'bg-pink-600 text-white border-pink-600 shadow' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-pink-300')}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Amount{' '}
                  <span className="normal-case font-normal text-slate-300">
                    (max {unit === 'words' ? '100' : unit === 'sentences' ? '50' : unit === 'list' ? '50' : '20'})
                  </span>
                </label>
                <input type="number" value={amount}
                  onChange={(e) => setAmount(Math.min(
                    parseInt(e.target.value, 10) || 1,
                    unit === 'words' ? 100 : unit === 'sentences' ? 50 : unit === 'list' ? 50 : 20
                  ))}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-purple-400 transition-all bg-slate-50"
                />
                {/* Quick presets */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {(unit === 'paragraphs' ? [1, 3, 5, 10] : unit === 'sentences' ? [1, 5, 10, 20] : unit === 'list' ? [3, 5, 10, 20] : [10, 25, 50, 100]).map((n) => (
                    <button key={n} onClick={() => setAmount(n)}
                      className={'text-xs px-2 py-1 rounded-lg border transition-all ' + (amount === n ? 'bg-purple-100 border-purple-300 text-purple-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-purple-300')}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Options</label>
                <div className="flex flex-col gap-3">

                  {/* Sentence length (density) */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Sentence Length</label>
                    <div className="flex gap-1.5">
                      {['short', 'medium', 'long'].map((d) => (
                        <button key={d} onClick={() => setDensity(d)}
                          className={'flex-1 text-xs px-2 py-1.5 rounded-lg border capitalize transition-all ' + (density === d ? 'bg-pink-100 border-pink-300 text-pink-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-pink-300')}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ordered list toggle (list unit only) */}
                  {unit === 'list' && (
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div onClick={() => setOrdered(!ordered)}
                        className={'w-10 h-6 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (ordered ? 'bg-pink-600' : 'bg-slate-200')}>
                        <div className={'w-5 h-5 bg-white rounded-full shadow-sm transition-all ' + (ordered ? 'translate-x-4' : 'translate-x-0')} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-700">Ordered List</div>
                        <div className="text-xs text-slate-400">{ordered ? 'Numbered (1. 2. 3.)' : 'Bulleted (•)'}</div>
                      </div>
                    </label>
                  )}

                  {/* Start with Lorem */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => setStart(!startWithLorem)}
                      className={'w-10 h-6 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (startWithLorem ? 'bg-purple-600' : 'bg-slate-200')}>
                      <div className={'w-5 h-5 bg-white rounded-full shadow-sm transition-all ' + (startWithLorem ? 'translate-x-4' : 'translate-x-0')} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Start with Lorem</div>
                      <div className="text-xs text-slate-400">Classic opening</div>
                    </div>
                  </label>

                  {/* HTML Output */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <div onClick={() => setHTML(!includeHTML)}
                      className={'w-10 h-6 rounded-full transition-all flex items-center px-0.5 cursor-pointer ' + (includeHTML ? 'bg-purple-600' : 'bg-slate-200')}>
                      <div className={'w-5 h-5 bg-white rounded-full shadow-sm transition-all ' + (includeHTML ? 'translate-x-4' : 'translate-x-0')} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700">HTML Output</div>
                      <div className="text-xs text-slate-400">{unit === 'list' ? 'Wrap in <ul>/<ol>' : 'Wrap in tags'}</div>
                    </div>
                  </label>

                  {/* HTML Tag selector (not for list, which uses ul/ol) */}
                  {includeHTML && unit !== 'list' && (
                    <div className="ml-12">
                      <label className="block text-xs text-slate-400 mb-1">HTML Tag</label>
                      <select value={htmlTag} onChange={(e) => setHtmlTag(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-purple-400 bg-slate-50">
                        {HTML_TAGS.map((t) => (
                          <option key={t} value={t}>&lt;{t}&gt;</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button + Stats */}
            <div className="flex flex-col gap-3 justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Generate</label>
                <button onClick={handleGenerate}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-200 text-sm">
                  ✨ Generate Text
                </button>
              </div>

              {generated && output && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Output Stats</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Words</span>
                      <span className="font-mono font-bold text-slate-700">{wordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Characters</span>
                      <span className="font-mono font-bold text-slate-700">{charCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Style</span>
                      <span className="font-bold text-purple-600 capitalize">{type}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── OUTPUT CARD ── */}
        {output && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Output Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Output</span>
                {includeHTML && (
                  <span className="text-xs bg-purple-100 text-purple-600 font-bold px-2 py-0.5 rounded-full">HTML</span>
                )}
                {unit === 'list' && (
                  <span className="text-xs bg-pink-100 text-pink-600 font-bold px-2 py-0.5 rounded-full">{ordered ? 'Ordered' : 'Bulleted'} List</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleGenerate}
                  className="text-xs bg-white border border-slate-200 hover:border-purple-300 text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition-all">
                  🔄 Regenerate
                </button>
                <button onClick={handleCopy}
                  className={'text-xs font-bold px-4 py-1.5 rounded-lg transition-all ' + (copied ? 'bg-emerald-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white')}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownload}
                  className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-3 py-1.5 rounded-lg transition-all">
                  ↓ .txt
                </button>
              </div>
            </div>

            {/* Text Output */}
            <div className="p-6">
              {includeHTML ? (
                <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-96 overflow-y-auto">
                  {output}
                </pre>
              ) : unit === 'list' ? (
                <div className="text-sm text-slate-700 leading-relaxed space-y-1.5 max-h-96 overflow-y-auto">
                  {output.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
              ) : (
                <div className="text-sm text-slate-700 leading-relaxed space-y-4 max-h-96 overflow-y-auto">
                  {unit === 'paragraphs'
                    ? output.split('\n\n').map((para, i) => <p key={i}>{para}</p>)
                    : <p>{output}</p>
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!output && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">✍️</div>
            <div className="text-slate-500 font-semibold text-base mb-2">Ready to generate</div>
            <div className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Choose your style, unit and amount above, then click Generate Text.
            </div>
            <button onClick={handleGenerate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all text-sm">
              ✨ Generate Now
            </button>
          </div>
        )}

        {/* ── USE CASES ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🎨', title: 'UI / UX Design',        desc: 'Fill wireframes, mockups and prototypes with realistic-looking placeholder text before real content is ready.' },
            { icon: '🖨️', title: 'Print & Publishing',   desc: 'Test layouts, typography and print templates without committing to real content during the design phase.' },
            { icon: '💻', title: 'Web Development',       desc: 'Populate HTML templates, test responsive layouts and style typography before integrating a CMS or API.' },
          ].map((u) => (
            <div key={u.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-3xl mb-3">{u.icon}</div>
              <div className="font-bold text-slate-800 text-sm mb-1.5">{u.title}</div>
              <p className="text-xs text-slate-500 leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* Intro */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free Lorem Ipsum Generator</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans Lorem Ipsum generator creates placeholder text in four styles classic Lorem Ipsum, tech and developer terminology, corporate business language, and natural casual writing. You can generate by paragraphs, sentences, individual words or as a list, control how long the sentences are, and optionally wrap the output in HTML tags for direct use in your code.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Everything runs instantly in your browser. There is no signup, no limit and no waiting; click Generate and the text appears, ready to copy to your clipboard or download as a plain text file. Because it is generated locally, you can produce as much placeholder text as a layout needs without ever leaving the page.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Lorem Ipsum has been the standard dummy text of the design and printing industry since the 1500s, and it remains the fastest way to see how a layout looks with real-feeling content before that content exists.
          </p>
        </article>

        {/* What is lorem ipsum */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What Is Lorem Ipsum and Why Designers Use It</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Lorem Ipsum is scrambled, meaningless text derived from a passage of classical Latin. Its purpose is to fill a design with words that look like natural language without carrying any meaning. That is exactly what makes it useful: when a layout is filled with real, readable sentences, people start reading them and judging the words instead of the design. Placeholder text keeps everyone focused on spacing, hierarchy, line length and typography.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The tradition dates back to the 1500s, when an unknown printer scrambled a galley of type to make a specimen book. The same text survived into digital design because it has a believable distribution of word and sentence lengths, which makes a mockup feel like the real thing. It is also visually neutral, so it does not pull attention the way a finished headline or paragraph would.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Modern projects often want placeholder text that fits the domain, which is why this generator also offers tech, business and casual word banks. A developer dashboard mockup reads more convincingly with words like endpoint and deployment, and a pitch deck looks more real with roadmap and stakeholder, even though the sentences still mean nothing.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Generate Placeholder Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Pick a style', 'Choose Classic Lorem Ipsum for traditional dummy text, or Tech, Business or Casual when you want the placeholder to match the tone of the real content.'],
              ['2', 'Choose a unit and amount', 'Generate paragraphs, sentences, words or a list, and set how many. Quick presets let you jump to common amounts in one tap.'],
              ['3', 'Tune length and format', 'Set sentence length to Short, Medium or Long, turn on HTML output to wrap the text in tags, and for lists pick bulleted or numbered.'],
              ['4', 'Generate and reuse', 'Click Generate, then Copy the text or download it as a .txt file. Use Regenerate to get a fresh batch with the same settings.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Styles + options explained */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Styles, Units and Options Explained</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Four text styles', 'Classic uses the familiar Latin word bank. Tech swaps in developer terminology, Business uses corporate language, and Casual uses everyday words so the placeholder matches your product.'],
              ['Paragraphs, sentences, words, list', 'Paragraphs fill body areas, sentences suit captions and short blocks, words are ideal for headings and labels, and the list option fills bullet menus and feature lists.'],
              ['Sentence length', 'Short produces terse lines, Medium matches typical prose, and Long creates dense paragraphs so you can mirror the rhythm of your real copy.'],
              ['HTML output', 'Wrap each unit in a tag of your choice, or for lists generate a complete ul or ol with li items, ready to paste straight into markup.'],
              ['Start with Lorem', 'Begin a classic block with the well-known Lorem ipsum dolor sit amet opening, which is what readers expect placeholder text to look like.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-extrabold text-slate-800 min-w-[200px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Use cases deep */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Where Placeholder Text Helps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['🎨 Design mockups', 'Fill wireframes and high-fidelity mockups so clients react to the layout, not half-written copy.'],
              ['💻 Front-end development', 'Populate components, cards and tables to test responsive behaviour and overflow before the API is wired up.'],
              ['🖨️ Print and typography', 'Test column widths, leading and font pairings on realistic blocks of text without final content.'],
              ['📊 Presentations', 'Drop believable body text into slide templates so the deck looks finished during review.'],
              ['📝 CMS and theme building', 'Seed a blog theme or template with paragraphs and lists to see how varied content lengths render.'],
              ['🧩 Email and newsletter design', 'Check how a template handles long and short text across clients before the real campaign copy is ready.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-bold text-slate-800 min-w-[180px] flex-shrink-0">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Tips */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Tips for Using Placeholder Text Well</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Match the amount of placeholder text to the amount of real content you expect. If a card will hold a two-line summary, generate a short sentence rather than a full paragraph, otherwise the mockup will look right in the demo and break the moment real copy arrives. The sentence length control is there precisely so the placeholder can mimic the density of your actual writing.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Test the extremes as well as the average. Generate one very long block and one very short block to see how your layout copes with overflow, wrapping and empty space. Designs that only ever see perfectly sized lorem ipsum often fall apart on the first unusually long or short piece of real content.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Finally, remember to replace placeholder text before anything ships. Leaving lorem ipsum in a live page or a printed piece is a classic and very public mistake. Treat the generated text as scaffolding: useful while you build, but never part of the finished product.
          </p>
        </article>

        {/* FAQ */}
        <article className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['What is Lorem Ipsum?', 'Lorem Ipsum is placeholder or dummy text used in design and publishing to fill a layout before the real content is ready. It is based on scrambled Latin so the words carry no meaning and do not distract from the visual design.'],
              ['Is this generator free?', 'Yes. It is completely free with no signup and no limits, and every option including styles, lists and sentence length is available to everyone. It runs entirely in your browser.'],
              ['Can I generate an HTML list?', 'Yes. Choose the List unit and turn on HTML output to get a ready-to-paste ul or ol with li items. With HTML off, the list is rendered as plain bullet or numbered lines.'],
              ['What is the difference between bulleted and ordered lists?', 'A bulleted (unordered) list marks each item with a bullet, while an ordered list numbers them 1, 2, 3. Toggle Ordered List when the List unit is selected to switch between them.'],
              ['Can I control how long the sentences are?', 'Yes. The Sentence Length control offers Short, Medium and Long, which changes how many words each sentence contains so the placeholder matches the density of your real content.'],
              ['What do the Tech, Business and Casual styles do?', 'They swap the Latin word bank for domain words. Tech uses developer terms, Business uses corporate language, and Casual uses everyday words, which makes mockups and decks feel more realistic.'],
              ['How much text can I generate at once?', 'You can generate up to 100 words, 50 sentences, 50 list items or 20 paragraphs per click. Generate again to keep adding more.'],
              ['Can I copy or download the text?', 'Yes. Use Copy to place the text on your clipboard, or download it as a .txt file. Regenerate produces a fresh batch with the same settings.'],
              ['Is the generated text always the same?', 'No. Each generation is randomised, so clicking Generate or Regenerate gives you different placeholder text every time, while respecting the style, unit, amount and length you chose.'],
              ['Should I leave Lorem Ipsum in a finished project?', 'No. Placeholder text is scaffolding for the design phase and must be replaced with real content before anything is published or printed. Leaving it in a live product is a common and very visible mistake.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-center justify-between">
                  {q}<span className="text-purple-500 text-lg ml-3 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</div>
              </details>
            ))}
          </div>
        </article>

      </div>
    </div>
  );
}