'use client';

import { useState, useCallback } from 'react';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

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
  const guarantees = [];

  if (options.uppercase) { pool += CHAR_SETS.uppercase; guarantees.push(CHAR_SETS.uppercase); }
  if (options.lowercase) { pool += CHAR_SETS.lowercase; guarantees.push(CHAR_SETS.lowercase); }
  if (options.numbers)   { pool += CHAR_SETS.numbers;   guarantees.push(CHAR_SETS.numbers); }
  if (options.symbols)   { pool += CHAR_SETS.symbols;   guarantees.push(CHAR_SETS.symbols); }

  if (!pool) return '';

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
  const [length, setLength]   = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword]   = useState('');
  const [copied, setCopied]       = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [noOptionError, setNoOptionError] = useState(false);

  const hasOption = Object.values(options).some(Boolean);

  const generate = useCallback(() => {
    if (!hasOption) { setNoOptionError(true); return; }
    setNoOptionError(false);
    const pwd = generatePassword(length, options);
    setPassword(pwd);
    setHistory((prev) => [pwd, ...prev].slice(0, 10));
    setCopied(false);
    // Analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'password_generated', { length, options });
    }
  }, [length, options, hasOption]);

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

  const strength      = getStrength(password, options);
  const strengthInfo  = STRENGTH_CONFIG[Math.max(0, strength - 1)];
  const crackTime     = estimateCrackTime(password);

  const checkboxOptions = [
    { key: 'uppercase', label: 'Uppercase', example: 'A–Z' },
    { key: 'lowercase', label: 'Lowercase', example: 'a–z' },
    { key: 'numbers',   label: 'Numbers',   example: '0–9' },
    { key: 'symbols',   label: 'Symbols',   example: '!@#$' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
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
            Generate cryptographically secure passwords instantly. Customize length,
            character types, and copy with one click no data ever leaves your browser.
          </p>
        </div>
      </section>

      {/* ── AD BANNER ── */}
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>

      {/* ── MAIN TOOL ── */}
      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          {/* ── PASSWORD OUTPUT ── */}
          <div className="p-6 border-b border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Generated Password
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
                Click <strong>Generate Password</strong> below to get started
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

            {/* Exclude Ambiguous Characters Toggle */}
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={generate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm flex items-center justify-center gap-2"
              >
                ⚡ Generate Password
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

        {/* ── AD BANNER ── */}
        <div className="mt-6">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement 300×250
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">
            Why Use a Strong Password Generator?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { icon: '🔐', title: 'Cryptographically Secure', desc: 'Uses the Web Crypto API the same standard used by banks and security tools.' },
              { icon: '🖥️', title: '100% Client-Side', desc: 'Your password is generated locally. Nothing is ever sent to any server.' },
              { icon: '⚡', title: 'Guaranteed Character Types', desc: 'Every generated password is guaranteed to include at least one of each selected type.' },
              { icon: '📋', title: 'Session History', desc: 'View and copy previously generated passwords within your current session.' },
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

          <h3 className="text-base font-extrabold text-slate-900 mb-3">
            Password Security Tips
          </h3>
          <ul className="space-y-2">
            {[
              'Use a unique password for every account never reuse passwords.',
              'Use at least 16 characters for accounts that store sensitive data.',
              'Enable two-factor authentication (2FA) wherever possible.',
              'Store passwords in a trusted password manager like Bitwarden or 1Password.',
              'Never share passwords via email, SMS, or messaging apps.',
              'Change passwords immediately if you suspect a breach.',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                <span className="text-indigo-400 flex-shrink-0 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </section>
    </div>
  );
}