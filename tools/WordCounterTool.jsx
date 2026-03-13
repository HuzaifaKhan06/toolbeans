'use client';

import { useState, useMemo } from 'react';

// ── Text analysis helpers ──────────────────────────────────
const analyze = (text) => {
  if (!text) return {
    words: 0, chars: 0, charsNoSpace: 0, sentences: 0,
    paragraphs: 0, lines: 0, readTime: 0, speakTime: 0,
    avgWordLen: 0, longestWord: '', uniqueWords: 0,
    topWords: [], density: [],
  };

  const words        = text.trim() === '' ? [] : text.trim().split(/\s+/).filter(Boolean);
  const wordCount    = words.length;
  const chars        = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences    = (text.match(/[^.!?]*[.!?]+/g) || []).length || (text.trim() ? 1 : 0);
  const paragraphs   = text.split(/\n\s*\n/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0);
  const lines        = text.split('\n').length;

  const readTime  = Math.max(1, Math.ceil(wordCount / 238));  // avg adult 238 wpm
  const speakTime = Math.max(1, Math.ceil(wordCount / 130));  // avg speaker 130 wpm

  const wordLens   = words.map((w) => w.replace(/[^a-zA-Z]/g, '').length).filter(Boolean);
  const avgWordLen = wordLens.length ? +(wordLens.reduce((a, b) => a + b, 0) / wordLens.length).toFixed(1) : 0;
  const longestWord = words.reduce((a, b) => (b.replace(/[^a-zA-Z]/g, '').length > a.replace(/[^a-zA-Z]/g, '').length ? b : a), '').replace(/[^a-zA-Z]/g, '');

  // Word frequency
  const freq = {};
  const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','have','has','had','it','its','this','that','as','by','from','not','no','if','so','do','did','can','will','would','my','your','his','her','our','their','i','we','you','he','she','they']);
  words.forEach((w) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 2 && !STOP.has(clean)) freq[clean] = (freq[clean] || 0) + 1;
  });

  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, '').trim()).filter(Boolean)).size;

  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, pct: wordCount ? Math.round((count / wordCount) * 100) : 0 }));

  // Reading level (Flesch-Kincaid approximation)
  const syllables = words.reduce((acc, w) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    const count = clean.replace(/[^aeiouy]/g, '').length || 1;
    return acc + count;
  }, 0);

  return { words: wordCount, chars, charsNoSpace, sentences, paragraphs, lines, readTime, speakTime, avgWordLen, longestWord, uniqueWords, topWords, syllables };
};

const SAMPLE = `The quick brown fox jumps over the lazy dog. This is a classic pangram used to display fonts and test keyboards. It contains every letter of the English alphabet at least once.

Word counters are essential tools for writers, students, journalists, and professionals who need to meet specific word count requirements for essays, articles, and reports.`;

export default function WordCounterTool() {
  const [text, setText]         = useState('');
  const [copied, setCopied]     = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [goal, setGoal]         = useState('');

  const stats = useMemo(() => analyze(text), [text]);

  const goalNum    = parseInt(goal, 10) || 0;
  const goalPct    = goalNum > 0 ? Math.min(100, Math.round((stats.words / goalNum) * 100)) : 0;
  const goalLeft   = goalNum > 0 ? Math.max(0, goalNum - stats.words) : 0;

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearText = () => setText('');

  const formatTime = (mins) => {
    if (mins < 60) return mins + ' min';
    return Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
  };

  const highlights = text
    ? text.split(/(\s+)/).map((part, i) => {
        if (!part.trim()) return <span key={i}>{part}</span>;
        const clean = part.toLowerCase().replace(/[^a-z]/g, '');
        const top = stats.topWords.find((w) => w.word === clean);
        if (top && stats.topWords.indexOf(top) < 3) {
          const colors = ['bg-amber-100 text-amber-800', 'bg-violet-100 text-violet-800', 'bg-emerald-100 text-emerald-800'];
          return <mark key={i} className={'rounded px-0.5 ' + colors[stats.topWords.indexOf(top)]}>{part}</mark>;
        }
        return <span key={i}>{part}</span>;
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-slate-100 py-14">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Free · Instant · No Signup
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Word{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Counter</span>
          </h1>
          <p className="text-slate-500 text-base max-w-lg mx-auto">
            Count words, characters, sentences, paragraphs and reading time instantly.
            Top keyword frequency, word density and writing goal tracker included.
          </p>
        </div>
      </section>

      {/* AD */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: TEXTAREA ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2">
              <button onClick={() => setText(SAMPLE)}
                className="text-xs bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all">
                Load Sample
              </button>
              <button onClick={clearText}
                className="text-xs bg-white border border-slate-200 hover:border-rose-300 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all">
                Clear
              </button>
              <button onClick={copyText}
                className={'text-xs font-semibold px-3 py-2 rounded-xl transition-all border ' + (copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-600')}>
                {copied ? '✓ Copied' : 'Copy All'}
              </button>
            </div>

            {/* Word Goal */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Word Goal:</span>
              <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. 500" min="1"
                className="w-24 text-xs font-mono outline-none text-slate-700 bg-transparent" />
              {goalNum > 0 && (
                <span className={'text-xs font-bold ' + (goalPct >= 100 ? 'text-emerald-600' : 'text-amber-600')}>
                  {goalPct}%
                </span>
              )}
            </div>
          </div>

          {/* Goal Progress Bar */}
          {goalNum > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 font-medium">{stats.words.toLocaleString()} / {goalNum.toLocaleString()} words</span>
                <span className={'font-bold ' + (goalPct >= 100 ? 'text-emerald-600' : 'text-amber-600')}>
                  {goalPct >= 100 ? '🎉 Goal reached!' : goalLeft.toLocaleString() + ' words left'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={'h-2 rounded-full transition-all duration-500 ' + (goalPct >= 100 ? 'bg-emerald-500' : 'bg-amber-500')}
                  style={{ width: goalPct + '%' }} />
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here...&#10;&#10;Word count, character count, reading time and keyword density will update instantly as you type."
              className="w-full h-80 px-5 py-4 text-sm text-slate-700 border border-slate-200 rounded-2xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 resize-none leading-relaxed bg-white shadow-sm transition-all font-sans"
            />
            <div className="absolute bottom-3 right-4 text-xs text-slate-300 font-mono">
              {stats.words.toLocaleString()} words
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Words',        value: stats.words.toLocaleString(),         color: 'text-emerald-600' },
              { label: 'Characters',   value: stats.chars.toLocaleString(),          color: 'text-teal-600'    },
              { label: 'Sentences',    value: stats.sentences.toLocaleString(),      color: 'text-violet-600'  },
              { label: 'Paragraphs',   value: stats.paragraphs.toLocaleString(),     color: 'text-amber-600'   },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                <div className={'text-2xl font-extrabold ' + s.color}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: STATS PANEL ── */}
        <div className="flex flex-col gap-4">

          {/* Tab Switcher */}
          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5">
            {[{ key: 'stats', label: 'Stats' }, { key: 'keywords', label: 'Keywords' }, { key: 'highlight', label: 'Highlight' }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={'flex-1 py-2 rounded-xl text-xs font-bold transition-all ' + (activeTab === tab.key ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-700')}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Detailed Statistics</div>
                <div className="space-y-3">
                  {[
                    { label: 'Words',                  value: stats.words.toLocaleString()          },
                    { label: 'Characters (with spaces)',value: stats.chars.toLocaleString()           },
                    { label: 'Characters (no spaces)', value: stats.charsNoSpace.toLocaleString()    },
                    { label: 'Sentences',              value: stats.sentences.toLocaleString()       },
                    { label: 'Paragraphs',             value: stats.paragraphs.toLocaleString()      },
                    { label: 'Lines',                  value: stats.lines.toLocaleString()           },
                    { label: 'Unique Words',           value: stats.uniqueWords.toLocaleString()     },
                    { label: 'Avg Word Length',        value: stats.avgWordLen + ' chars'            },
                    { label: 'Longest Word',           value: stats.longestWord || '—'              },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{item.label}</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Time Estimates</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Reading Time</div>
                      <div className="text-xs text-slate-400">@ 238 words/min</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-600">{formatTime(stats.readTime)}</div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Speaking Time</div>
                      <div className="text-xs text-slate-400">@ 130 words/min</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-teal-600">{formatTime(stats.speakTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KEYWORDS TAB */}
          {activeTab === 'keywords' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Top Keywords{stats.topWords.length > 0 ? ' (stop words excluded)' : ''}
              </div>
              {stats.topWords.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Type or paste text to see keyword density
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.topWords.map(({ word, count, pct }, i) => (
                    <div key={word}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">{word}</span>
                        <span className="text-xs text-slate-400 font-mono">{count}x · {pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: (pct / (stats.topWords[0]?.pct || 1) * 100) + '%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HIGHLIGHT TAB */}
          {activeTab === 'highlight' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Keyword Highlight</div>
              <div className="flex gap-2 flex-wrap mb-4">
                {[
                  { color: 'bg-amber-100 border-amber-300 text-amber-800',   label: '#1' },
                  { color: 'bg-violet-100 border-violet-300 text-violet-800', label: '#2' },
                  { color: 'bg-emerald-100 border-emerald-300 text-emerald-800', label: '#3' },
                ].map((badge, i) => (
                  <span key={i} className={'text-xs font-bold px-2 py-0.5 rounded border ' + badge.color}>
                    {stats.topWords[i]?.word || '—'} {badge.label}
                  </span>
                ))}
              </div>
              {text ? (
                <div className="text-sm leading-relaxed text-slate-700 max-h-64 overflow-y-auto">
                  {highlights}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Paste text to see keyword highlighting
                </div>
              )}
            </div>
          )}

          {/* Writing Targets Reference */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="text-xs font-bold text-emerald-700 mb-3">📏 Common Word Targets</div>
            <div className="space-y-1.5">
              {[
                { type: 'Tweet',           count: '280 chars' },
                { type: 'Instagram caption',count: '2,200 chars' },
                { type: 'Blog post',        count: '1,500–2,500' },
                { type: 'Short story',      count: '1,000–7,500' },
                { type: 'Essay (college)',  count: '1,000–5,000' },
                { type: 'Novel',            count: '80,000+' },
              ].map((t) => (
                <div key={t.type} className="flex justify-between items-center">
                  <span className="text-xs text-emerald-700">{t.type}</span>
                  <span className="text-xs font-mono font-bold text-emerald-800">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AD BOTTOM */}
      <div className="max-w-5xl mx-auto px-6 pb-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
      </div>

      {/* SEO CONTENT */}
      <div className="max-w-5xl mx-auto px-6 pb-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free Online Word Counter</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans word counter instantly counts words, characters, sentences, paragraphs, and lines in any text. It also calculates reading time at 238 words per minute and speaking time at 130 words per minute perfect for timing speeches and presentations.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The keyword density analyzer identifies your most-used words (excluding common stop words like &quot;the&quot;, &quot;and&quot;, &quot;is&quot;) so you can optimize your writing for SEO or avoid overusing filler words. Set a word count goal to track progress on essays, articles, reports, and creative writing projects.
          </p>
        </div>
      </div>
    </div>
  );
}