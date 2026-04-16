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

const generateParagraph = (bank, minSentences = 3, maxSentences = 7) => {
  const len = minSentences + Math.floor(Math.random() * (maxSentences - minSentences));
  return Array.from({ length: len }, () => generateSentence(bank)).join(' ');
};

const CLASSIC_OPENING = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const generate = ({ type, amount, unit, startWithLorem, includeHTML, htmlTag }) => {
  const bank = WORD_BANKS[type] || LOREM_WORDS;

  let result = [];

  if (unit === 'paragraphs') {
    for (let i = 0; i < amount; i++) {
      let para = '';
      if (i === 0 && startWithLorem && type === 'lorem') {
        para = CLASSIC_OPENING + ' ' + generateParagraph(bank, 2, 5);
      } else {
        para = generateParagraph(bank);
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
    while (sentences.length < amount) sentences.push(generateSentence(bank));
    sentences = sentences.slice(0, amount);
    if (includeHTML) {
      return sentences.map((s) => '<' + htmlTag + '>' + s + '</' + htmlTag + '>').join('\n');
    }
    return sentences.join(' ');

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
  const [output, setOutput]           = useState('');
  const [copied, setCopied]           = useState(false);
  const [generated, setGenerated]     = useState(false);

  const handleGenerate = useCallback(() => {
    const result = generate({ type, amount: Math.min(Math.max(1, amount), 100), unit, startWithLorem, includeHTML, htmlTag });
    setOutput(result);
    setGenerated(true);
    setCopied(false);
  }, [type, amount, unit, startWithLorem, includeHTML, htmlTag]);

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
            Choose paragraphs, sentences or words. HTML output included.
          </p>
        </div>
      </section>

      {/* AD 
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
      </div>
      */}

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
                  {['paragraphs', 'sentences', 'words'].map((u) => (
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
                    (max {unit === 'words' ? '100' : unit === 'sentences' ? '50' : '20'})
                  </span>
                </label>
                <input type="number" value={amount}
                  onChange={(e) => setAmount(Math.min(
                    parseInt(e.target.value, 10) || 1,
                    unit === 'words' ? 100 : unit === 'sentences' ? 50 : 20
                  ))}
                  min="1"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-purple-400 transition-all bg-slate-50"
                />
                {/* Quick presets */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {(unit === 'paragraphs' ? [1, 3, 5, 10] : unit === 'sentences' ? [1, 5, 10, 20] : [10, 25, 50, 100]).map((n) => (
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
                      <div className="text-xs text-slate-400">Wrap in tags</div>
                    </div>
                  </label>

                  {/* HTML Tag selector */}
                  {includeHTML && (
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

        {/* AD BOTTOM 
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
        */}

        {/* SEO CONTENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free Lorem Ipsum Generator</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans Lorem Ipsum generator creates placeholder text in four styles: classic Lorem Ipsum, tech and developer terminology, corporate business language, and natural casual writing. Generate by paragraphs, sentences, or individual words with optional HTML tag wrapping for direct use in code.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Lorem Ipsum has been the standard dummy text for typesetting and design since the 1500s. Designers, developers, and publishers use placeholder text to visualize layouts and test typography without distracting readers with meaningful content. The tech and business variants are ideal for software UI mockups and presentation decks where domain-specific language makes prototypes feel more realistic.
          </p>
        </div>
      </div>
    </div>
  );
}