'use client';

import { useState, useCallback } from 'react';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// Characters that look alike removed when "Exclude Ambiguous" is on
const AMBIGUOUS_CHARS = '0OlI1';

// Word bank for memorable passphrases (short, common, family-friendly words)
const PASSPHRASE_WORDS = [
  'apple','river','tiger','cloud','stone','maple','ocean','amber','frost','ember',
  'novel','piano','solar','lunar','coral','breeze','willow','cedar','harbor','meadow',
  'falcon','copper','silver','garden','pepper','violet','cobalt','crimson','jade','onyx',
  'comet','canyon','desert','forest','glacier','island','jungle','lagoon','marble','nectar',
  'opal','prairie','quartz','rocket','summit','timber','valley','walnut','zephyr','beacon',
  'bridge','candle','dragon','engine','feather','galaxy','hammer','indigo','jasmine','kettle',
  'lantern','mango','needle','orchid','pebble','quill','ribbon','saddle','thunder','umbrella',
  'velvet','window','yellow','anchor','basket','clover','dolphin','eagle','flame','grove',
  'hazel','ivory','kayak','ladder','melon','noble','olive','pixel','raven','sunset',
  'tunnel','urban','vivid','whale','yonder','arrow','blossom','cobble','dapper','echo',
  'fable','gravel','hollow','iris','juniper','kestrel','lemon','mellow','nimble','otter',
  'plume','quiver','rustic','spruce','tulip','vapor','wander','xenon','yarrow','zenith',
];

const STRENGTH_CONFIG = [
  { label: 'Very Weak', color: 'bg-red-500',    textColor: 'text-red-600',    width: 'w-1/5' },
  { label: 'Weak',      color: 'bg-orange-500', textColor: 'text-orange-600', width: 'w-2/5' },
  { label: 'Fair',      color: 'bg-yellow-500', textColor: 'text-yellow-600', width: 'w-3/5' },
  { label: 'Strong',    color: 'bg-blue-500',   textColor: 'text-blue-600',   width: 'w-4/5' },
  { label: 'Very Strong', color: 'bg-green-500', textColor: 'text-green-600', width: 'w-full' },
];

function getStrength(password, options) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 16) score++;
  if (options.uppercase && /[A-Z]/.test(password)) score++;
  if (options.numbers   && /[0-9]/.test(password)) score++;
  if (options.symbols   && /[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score, 5);
}

function generatePassword(length, options) {
  let pool = '';
  let guarantees = [];

  if (options.uppercase) { pool += CHAR_SETS.uppercase; guarantees.push(CHAR_SETS.uppercase); }
  if (options.lowercase) { pool += CHAR_SETS.lowercase; guarantees.push(CHAR_SETS.lowercase); }
  if (options.numbers)   { pool += CHAR_SETS.numbers;   guarantees.push(CHAR_SETS.numbers); }
  if (options.symbols)   { pool += CHAR_SETS.symbols;   guarantees.push(CHAR_SETS.symbols); }

  if (!pool) return '';

  // Honor the "Exclude Ambiguous Characters" option (0, O, l, 1, I)
  if (options.excludeAmbiguous) {
    const strip = (s) => s.split('').filter((c) => !AMBIGUOUS_CHARS.includes(c)).join('');
    pool = strip(pool);
    guarantees = guarantees.map(strip).filter((s) => s.length > 0);
  }

  // Cryptographically secure random
  const array = new Uint32Array(length + guarantees.length);
  crypto.getRandomValues(array);

  // Guarantee at least one of each selected type
  const guaranteed = guarantees.map(
    (set, i) => set[array[length + i] % set.length]
  );

  // Fill remaining characters
  const remaining = Array.from(
    { length: length - guaranteed.length },
    (_, i) => pool[array[i] % pool.length]
  );

  // Shuffle all characters together
  const combined = [...guaranteed, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

// NEW: generate a memorable passphrase from random words
function generatePassphrase(wordCount, { capitalize, separator, addNumber }) {
  const rand = new Uint32Array(wordCount + 1);
  crypto.getRandomValues(rand);
  const words = Array.from({ length: wordCount }, (_, i) => {
    const w = PASSPHRASE_WORDS[rand[i] % PASSPHRASE_WORDS.length];
    return capitalize ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });
  let result = words.join(separator);
  if (addNumber) result += separator + (100 + (rand[wordCount] % 900));
  return result;
}

function estimateCrackTime(password) {
  if (!password) return '';
  const hasUpper   = /[A-Z]/.test(password);
  const hasLower   = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);

  let charSpace = 0;
  if (hasLower)   charSpace += 26;
  if (hasUpper)   charSpace += 26;
  if (hasNumbers) charSpace += 10;
  if (hasSymbols) charSpace += 32;

  const combinations = Math.pow(charSpace, password.length);
  const guessesPerSecond = 1e12; // 1 trillion/sec (modern GPU)
  const seconds = combinations / guessesPerSecond;

  if (seconds < 1)           return 'Instantly';
  if (seconds < 60)          return `${Math.round(seconds)} seconds`;
  if (seconds < 3600)        return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400)       return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000)    return `${Math.round(seconds / 86400)} days`;
  if (seconds < 3.15e9)      return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 3.15e12)     return `${(seconds / 3.15e9).toFixed(1)} thousand years`;
  if (seconds < 3.15e15)     return `${(seconds / 3.15e12).toFixed(1)} million years`;
  return 'Billions of years';
}

export default function PasswordTool() {
  const [mode, setMode]       = useState('random'); // 'random' | 'passphrase'
  const [length, setLength]   = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  // Passphrase settings
  const [wordCount, setWordCount]     = useState(4);
  const [ppCapitalize, setPpCap]      = useState(true);
  const [ppSeparator, setPpSeparator] = useState('-');
  const [ppAddNumber, setPpAddNumber] = useState(true);

  const [password, setPassword]   = useState('');
  const [copied, setCopied]       = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [noOptionError, setNoOptionError] = useState(false);

  const hasOption = Object.values(options).some(Boolean);

  const generate = useCallback(() => {
    let pwd;
    if (mode === 'passphrase') {
      setNoOptionError(false);
      pwd = generatePassphrase(wordCount, {
        capitalize: ppCapitalize,
        separator: ppSeparator,
        addNumber: ppAddNumber,
      });
    } else {
      if (!hasOption) { setNoOptionError(true); return; }
      setNoOptionError(false);
      pwd = generatePassword(length, options);
    }
    setPassword(pwd);
    setHistory((prev) => [pwd, ...prev].slice(0, 10));
    setCopied(false);
    // Analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'password_generated', { mode, length, options });
    }
  }, [mode, length, options, hasOption, wordCount, ppCapitalize, ppSeparator, ppAddNumber]);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'password_copied');
      }
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }, []);

  // For passphrases, judge strength from the actual content rather than the random-mode checkboxes
  const strength      = mode === 'passphrase'
    ? getStrength(password, { uppercase: true, lowercase: true, numbers: true, symbols: true })
    : getStrength(password, options);
  const strengthInfo  = STRENGTH_CONFIG[Math.max(0, strength - 1)];
  const crackTime     = estimateCrackTime(password);

  const checkboxOptions = [
    { key: 'uppercase', label: 'Uppercase', example: 'A–Z' },
    { key: 'lowercase', label: 'Lowercase', example: 'a–z' },
    { key: 'numbers',   label: 'Numbers',   example: '0–9' },
    { key: 'symbols',   label: 'Symbols',   example: '!@#$' },
  ];

  const separatorOptions = [
    { value: '-', label: 'Dash -' },
    { value: '.', label: 'Dot .' },
    { value: '_', label: 'Underscore _' },
    { value: '',  label: 'None' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5">
            <a href="/" className="hover:text-indigo-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-indigo-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Password Generator</span>
          </nav>
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Security Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Password{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto">
            Generate cryptographically secure passwords or memorable passphrases instantly. Customize length,
            character types, and copy with one click no data ever leaves your browser.
          </p>
        </div>
      </section>

      {/* ── MAIN TOOL ── */}
      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* ── MODE SWITCH ── */}
          <div className="p-6 pb-0">
            <div className="flex gap-2 bg-slate-100 rounded-2xl p-1.5">
              {[
                { key: 'random',     label: '🔑 Random Password' },
                { key: 'passphrase', label: '💬 Passphrase' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => { setMode(m.key); setNoOptionError(false); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200
                    ${mode === m.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── PASSWORD OUTPUT ── */}
          <div className="p-6 border-b border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {mode === 'passphrase' ? 'Generated Passphrase' : 'Generated Password'}
            </label>

            {password ? (
              <div className="relative">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-mono text-lg text-slate-800 tracking-widest break-all pr-24 min-h-[60px] flex items-center select-all">
                  {password}
                </div>
                {/* Copy Button overlaid */}
                <button
                  onClick={() => copyToClipboard(password)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5
                    ${copied
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : copyError
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                >
                  {copied ? '✓ Copied!' : copyError ? '✕ Failed' : '⎘ Copy'}
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl px-5 py-6 text-center text-slate-400 text-sm">
                Click <strong>Generate {mode === 'passphrase' ? 'Passphrase' : 'Password'}</strong> below to get started
              </div>
            )}

            {/* Strength Bar */}
            {password && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Strength
                  </span>
                  <span className={`text-xs font-bold ${strengthInfo?.textColor}`}>
                    {strengthInfo?.label}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${strengthInfo?.color} ${strengthInfo?.width}`}
                  />
                </div>
              </div>
            )}

            {/* Crack Time */}
            {password && crackTime && (
              <div className="mt-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <span className="text-base">⏱️</span>
                <span className="text-xs text-slate-500">
                  Estimated crack time at 1 trillion guesses/sec:{' '}
                  <strong className="text-slate-700">{crackTime}</strong>
                </span>
              </div>
            )}
          </div>

          {/* ── SETTINGS ── */}
          <div className="p-6 flex flex-col gap-6">

            {/* ════ RANDOM PASSWORD SETTINGS ════ */}
            {mode === 'random' && (
              <>
                {/* Length Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Password Length
                    </label>
                    <span className="bg-indigo-50 text-indigo-600 font-extrabold text-sm px-3 py-1 rounded-lg">
                      {length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={64}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                    <span>6 (Min)</span>
                    <span>64 (Max)</span>
                  </div>

                  {/* Quick Length Presets */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {[8, 12, 16, 24, 32].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLength(l)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150
                          ${length === l
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Character Options */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Character Types
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {checkboxOptions.map(({ key, label, example }) => (
                      <button
                        key={key}
                        onClick={() =>
                          setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                        className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200
                          ${options[key]
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                      >
                        <span className={`text-lg font-bold ${options[key] ? 'text-indigo-600' : 'text-slate-300'}`}>
                          {options[key] ? '✓' : '○'}
                        </span>
                        <span className="text-xs font-bold">{label}</span>
                        <span className="text-xs opacity-60 font-mono">{example}</span>
                      </button>
                    ))}
                  </div>

                  {/* Validation Error */}
                  {noOptionError && (
                    <div className="mt-3 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-rose-600 font-medium">
                      ⚠️ Please select at least one character type.
                    </div>
                  )}
                </div>

                {/* Exclude Ambiguous Characters Toggle (now functional) */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Exclude Ambiguous Characters</div>
                    <div className="text-xs text-slate-400 mt-0.5">Removes: 0, O, l, 1, I (looks similar)</div>
                  </div>
                  <button
                    onClick={() => setOptions((prev) => ({ ...prev, excludeAmbiguous: !prev.excludeAmbiguous }))}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
                      ${options.excludeAmbiguous ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                      ${options.excludeAmbiguous ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </>
            )}

            {/* ════ PASSPHRASE SETTINGS ════ */}
            {mode === 'passphrase' && (
              <>
                {/* Word count */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Number of Words
                    </label>
                    <span className="bg-indigo-50 text-indigo-600 font-extrabold text-sm px-3 py-1 rounded-lg">
                      {wordCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                    <span>3 (Min)</span>
                    <span>8 (Max)</span>
                  </div>
                </div>

                {/* Separator */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Word Separator
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {separatorOptions.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setPpSeparator(s.value)}
                        className={`text-xs font-semibold px-3 py-2.5 rounded-xl border-2 transition-all
                          ${ppSeparator === s.value
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capitalize + Add number toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Capitalize Words</div>
                      <div className="text-xs text-slate-400 mt-0.5">River-Tiger-Amber</div>
                    </div>
                    <button
                      onClick={() => setPpCap((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${ppCapitalize ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${ppCapitalize ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-700">Add a Number</div>
                      <div className="text-xs text-slate-400 mt-0.5">Appends 100–999</div>
                    </div>
                    <button
                      onClick={() => setPpAddNumber((v) => !v)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${ppAddNumber ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${ppAddNumber ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700 leading-relaxed">
                  <span>💡</span>
                  <span>Passphrases like <strong>river-tiger-amber-stone</strong> are easy to remember and, with enough words, very hard to guess.</span>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm flex items-center justify-center gap-2"
              >
                ⚡ Generate {mode === 'passphrase' ? 'Passphrase' : 'Password'}
              </button>
              {password && (
                <button
                  onClick={generate}
                  title="Regenerate"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 px-4 rounded-xl transition-all duration-200 text-lg"
                >
                  ↻
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── PASSWORD HISTORY ── */}
        {history.length > 0 && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-700">
                🕐 Recent Passwords{' '}
                <span className="text-xs text-slate-400 font-normal ml-1">
                  (session only not saved anywhere)
                </span>
              </span>
              <span className="text-slate-400">{showHistory ? '▲' : '▼'}</span>
            </button>

            {showHistory && (
              <div className="border-t border-slate-100 divide-y divide-slate-50">
                {history.map((pwd, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <code className="text-sm text-slate-600 font-mono truncate flex-1 mr-4">
                      {pwd}
                    </code>
                    <button
                      onClick={() => copyToClipboard(pwd)}
                      className="text-xs text-indigo-600 hover:text-indigo-500 font-semibold flex-shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                ))}
                <div className="px-6 py-3 bg-slate-50">
                  <button
                    onClick={() => setHistory([])}
                    className="text-xs text-rose-400 hover:text-rose-600 font-semibold"
                  >
                    Clear History
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* Feature grid (kept) */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            Why Use a Strong Password Generator?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🔐', title: 'Cryptographically Secure', desc: 'Uses the Web Crypto API the same randomness standard used by banks and security tools.' },
              { icon: '🖥️', title: '100% Client-Side', desc: 'Your password is generated locally. Nothing is ever sent to any server.' },
              { icon: '⚡', title: 'Guaranteed Character Types', desc: 'Every random password is guaranteed to include at least one of each selected type.' },
              { icon: '💬', title: 'Memorable Passphrases', desc: 'Switch to passphrase mode for word-based passwords that are easy to remember and hard to guess.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{f.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intro */}
        <article className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Free Strong Password Generator</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The TOOLBeans password generator creates strong, unpredictable passwords and memorable passphrases right in your browser. It uses the Web Crypto API for cryptographically secure randomness, the same standard trusted by security software, so every result is genuinely unguessable rather than the weak pseudo-randomness many simple generators rely on.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            You stay in control of the result. Choose a length from 6 to 64 characters, decide which character types to include, exclude look-alike characters for easier typing, or switch to passphrase mode for a string of random words that is far easier to remember. A live strength meter and crack-time estimate show you how resilient each password is before you use it.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nothing you generate is uploaded or stored. The whole process runs locally, which makes the tool safe to use even for the passwords protecting your most important accounts.
          </p>
        </article>

        {/* Why strong passwords */}
        <article className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Why Strong, Unique Passwords Matter</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Most account breaches do not involve sophisticated hacking. They happen because people reuse the same password across many sites, or pick something short and predictable. When one site is breached and its passwords leak, attackers simply try those same email and password combinations on banks, email providers and shopping sites a technique called credential stuffing. A unique password for every account stops one breach from becoming many.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Length is the single biggest factor in how hard a password is to crack. Each extra character multiplies the number of possible combinations, so a 16-character password is astronomically harder to brute-force than an 8-character one, even if both use the same character types. That is why this tool defaults to a healthy length and lets you go much higher.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Randomness matters just as much. A password based on a name, a date or a common word is weak no matter how long it is, because attackers try those patterns first. Generating from cryptographically secure randomness removes any predictable pattern an attacker could exploit.
          </p>
        </article>

        {/* How to use */}
        <article className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">How to Generate a Secure Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Choose a mode', 'Pick Random Password for a classic strong password, or Passphrase for a memorable string of words you can type from memory.'],
              ['2', 'Set length and character types', 'For random passwords, drag the length slider and toggle uppercase, lowercase, numbers and symbols. For passphrases, choose how many words and a separator.'],
              ['3', 'Fine-tune the options', 'Turn on Exclude Ambiguous Characters to drop look-alikes like 0 and O, or capitalize words and add a number to a passphrase.'],
              ['4', 'Generate and copy', 'Click Generate, check the strength meter and crack-time estimate, then copy the result with one click. Regenerate as many times as you like.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Passwords vs passphrases */}
        <article className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Random Passwords vs Passphrases</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            A random password like <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">k7$Rm2pX9qZ</code> packs a lot of unpredictability into a short string, which is ideal when you store it in a password manager and never need to type it by hand. A passphrase like <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">river-tiger-amber-stone</code> trades a little density for memorability: it is longer, but you can actually recall and type it.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Both can be extremely secure. A passphrase gets its strength from the number of random words, not from obscure characters, so four or more truly random words already resist guessing for an impractically long time. This is why security guidance increasingly recommends passphrases for the handful of passwords you must memorise, such as your device login or your password-manager master password.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            A good rule of thumb: use random passwords stored in a manager for the dozens of accounts you never type by hand, and a strong passphrase for the few you must remember.
          </p>
        </article>

        {/* Tips (kept + expanded) */}
        <article className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900 mb-3">Password Security Tips</h3>
          <ul className="space-y-2">
            {[
              'Use a unique password for every account never reuse passwords across sites.',
              'Use at least 16 characters for accounts that store sensitive or financial data.',
              'Enable two-factor authentication (2FA) wherever it is offered.',
              'Store passwords in a trusted password manager like Bitwarden or 1Password.',
              'Never share passwords via email, SMS, or messaging apps.',
              'Change a password immediately if you suspect the service has been breached.',
              'Prefer a long passphrase for logins you must remember from memory.',
              'Avoid personal information such as names, birthdays or pet names in passwords.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                <span className="text-indigo-400 flex-shrink-0 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </article>

        {/* Privacy */}
        <article className="mt-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Generated Privately in Your Browser</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Every password and passphrase is created locally on your device using the browser&apos;s built-in cryptographic random number generator. Nothing is transmitted to a server, logged, or saved to disk. The recent-passwords list lives only in memory for the current session and disappears the moment you close or refresh the page.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Because there is no server involved, the generator is instant and works even offline once the page has loaded. That local-only design is what makes it safe to use for the credentials protecting your real accounts.
          </p>
        </article>

        {/* FAQ */}
        <article className="mt-6 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is this password generator safe?', 'Yes. Passwords are generated entirely in your browser using the Web Crypto API, a cryptographically secure source of randomness. Nothing is sent to a server or stored anywhere, so it is safe even for important accounts.'],
              ['How long should my password be?', 'Use at least 12 characters for everyday accounts and 16 or more for sensitive ones such as email, banking and your password manager. Longer is exponentially stronger.'],
              ['What is a passphrase?', 'A passphrase is a password made of several random words, such as river-tiger-amber-stone. It is easier to remember than a random string and, with enough words, just as hard to guess. Use passphrase mode to create one with your chosen word count and separator.'],
              ['What does Exclude Ambiguous Characters do?', 'It removes look-alike characters, specifically 0, O, l, 1 and I, so the password is easier to read and type correctly from a screen or printout without confusion.'],
              ['Should I include symbols?', 'Yes when the site allows it, because symbols enlarge the character space and make a password harder to crack. If a site rejects certain symbols, a longer letters-and-numbers password is still strong.'],
              ['Are my generated passwords saved or sent anywhere?', 'No. The session history is kept only in memory while the page is open and is never written to disk or transmitted. Closing or refreshing the page clears it.'],
              ['How is the crack-time estimate calculated?', 'It assumes an attacker guessing about one trillion combinations per second and computes how long it would take to exhaust the password\u2019s character space and length. It is a rough guide, not a guarantee.'],
              ['Why generate passwords instead of making my own?', 'People tend to choose predictable patterns based on words, dates and substitutions that attackers try first. A cryptographically random generator removes those patterns entirely.'],
              ['Can I use this on my phone?', 'Yes. The tool works in any modern mobile browser. Generate a password and tap Copy to place it on your clipboard, then paste it into the signup or password field.'],
              ['Does it work offline?', 'Yes. Once the page has loaded, generation runs entirely in your browser, so it continues to work without an internet connection.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-center justify-between">
                  {q}<span className="text-indigo-500 text-lg ml-3 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</div>
              </details>
            ))}
          </div>
        </article>

      </section>
    </div>
  );
}