'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ── Helpers ──
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateCode = (length = 6) => {
  let result = '';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  arr.forEach((n) => (result += ALPHABET[n % ALPHABET.length]));
  return result;
};

const isValidURL = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
};

const isValidAlias = (alias) => /^[a-zA-Z0-9_-]{3,30}$/.test(alias);

const getDomain = (url) => {
  try { return new URL(url).hostname; } catch { return url; }
};

const getFavicon = (url) => {
  try {
    const domain = new URL(url).origin;
    return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';
  } catch { return null; }
};

const formatDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const LS_KEY = 'toolbeans_links';

const loadLinks = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveLinks = (links) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(links)); } catch {}
};

// ─────────────────────────────────────────────────────────────
// ── BRAND PROTECTION — blocked words for custom aliases ──
// ─────────────────────────────────────────────────────────────
const BLOCKED_BRANDS = [
  // Streaming & Entertainment
  'netflix','youtube','spotify','twitch','disney','hulu','hbomax','primevideo','appletv',
  // Social Media
  'facebook','instagram','twitter','tiktok','snapchat','linkedin','pinterest','reddit','telegram','whatsapp','discord',
  // Tech Giants
  'google','apple','microsoft','amazon','samsung','sony','intel','nvidia','adobe',
  // Finance & Payments
  'paypal','stripe','visa','mastercard','amex','americanexpress','binance','coinbase','bitcoin','crypto','blockchain',
  // E-commerce
  'shopify','ebay','aliexpress','flipkart','daraz',
  // Cloud & Dev
  'github','gitlab','vercel','netlify','cloudflare','digitalocean','heroku','aws','azure',
  // Communication
  'zoom','slack','teams','skype','gmail','outlook',
  // Ride & Travel
  'uber','lyft','airbnb','booking','expedia','trivago',
  // Banks (generic)
  'bank','banking','wallet','loan','credit','debit',
  // Dangerous/misleading words
  'admin','support','login','signin','signup','verify','verification',
  'secure','security','official','real','legit','authentic','original',
  'helpdesk','customer','service','account','password','reset',
  // toolbeans itself
  'toolbeans','toolbeansdev','toolbeans-dev',
];

// Returns the matched brand name if blocked, null if safe
const checkBrandAlias = (alias) => {
  const lower = alias.toLowerCase().replace(/[-_]/g, '');
  const matched = BLOCKED_BRANDS.find((brand) => lower.includes(brand));
  return matched || null;
};

export default function URLShortenerTool() {
  const [input, setInput]                   = useState('');
  const [alias, setAlias]                   = useState('');
  const [useCustomAlias, setUseCustomAlias] = useState(false);
  const [result, setResult]                 = useState(null);
  const [error, setError]                   = useState('');
  const [aliasError, setAliasError]         = useState('');
  const [aliasOk, setAliasOk]               = useState(false);
  const [copied, setCopied]                 = useState(false);
  const [links, setLinks]                   = useState([]);
  const [activeTab, setActiveTab]           = useState('shortener');
  const [searchTerm, setSearchTerm]         = useState('');
  const [qrGenerated, setQrGenerated]       = useState(false);
  const [showPreview, setShowPreview]       = useState(false);
  const [urlInfo, setUrlInfo]               = useState(null);
  const canvasRef                           = useRef(null);

  useEffect(() => {
    const saved = loadLinks();
    setLinks(saved);
  }, []);

  // ── Alias validation with brand check ──
  const handleAliasChange = (val) => {
    setAlias(val);
    setAliasOk(false);
    if (!val) { setAliasError(''); return; }

    if (!isValidAlias(val)) {
      setAliasError('3–30 chars: letters, numbers, - and _ only');
      return;
    }

    const blockedBrand = checkBrandAlias(val);
    if (blockedBrand) {
      setAliasError(
        'This alias contains a protected brand name "' + blockedBrand + '". ' +
        'Using brand names in aliases is not allowed to prevent phishing and impersonation.'
      );
      return;
    }

    setAliasError('');
    setAliasOk(true);
  };

  const analyzeURL = (url) => {
    if (!isValidURL(url)) return;
    try {
      const u = new URL(url);
      const params = [];
      u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
      setUrlInfo({
        protocol: u.protocol,
        domain:   u.hostname,
        path:     u.pathname,
        params,
        hasHTTPS: u.protocol === 'https:',
        length:   url.length,
      });
    } catch { setUrlInfo(null); }
  };

  const handleShorten = () => {
    setError('');
    if (!input.trim()) { setError('Please enter a URL to shorten.'); return; }
    if (!isValidURL(input)) { setError('Please enter a valid URL starting with https:// or http://'); return; }

    if (useCustomAlias) {
      if (!alias.trim()) { setError('Please enter a custom alias or disable custom alias.'); return; }
      if (!isValidAlias(alias)) { setError('Invalid alias. Use 3–30 chars: letters, numbers, - and _'); return; }

      // ── Brand protection check ──
      const blockedBrand = checkBrandAlias(alias);
      if (blockedBrand) {
        setError(
          'Alias blocked: "' + alias + '" contains the protected brand name "' + blockedBrand + '". ' +
          'This protection prevents phishing and fake link creation. Please choose a different alias.'
        );
        return;
      }

      const exists = links.find((l) => l.code === alias);
      if (exists) { setError('Alias "' + alias + '" is already taken. Try another.'); return; }
    }

    const code     = useCustomAlias ? alias : generateCode(6);
    const shortURL = 'toolbeans.dev/s/' + code;
    const now      = Date.now();

    const newLink = {
      id:          now,
      code,
      shortURL,
      originalURL: input,
      domain:      getDomain(input),
      favicon:     getFavicon(input),
      clicks:      0,
      createdAt:   now,
      isCustom:    useCustomAlias,
    };

    const updated = [newLink, ...links];
    setLinks(updated);
    saveLinks(updated);
    setResult(newLink);
    setQrGenerated(false);
    setShowPreview(false);
    analyzeURL(input);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'url_shortened', { custom: useCustomAlias });
    }
  };

  const generateQR = async () => {
    if (!result || !canvasRef.current) return;
    try {
      const QRCode = (await import('qrcode')).default;
      await QRCode.toCanvas(canvasRef.current, 'https://' + result.shortURL, {
        width: 200,
        margin: 2,
        color: { dark: '#4f46e5', light: '#ffffff' },
      });
      setQrGenerated(true);
    } catch {}
  };

  const copyShortURL = async (url) => {
    await navigator.clipboard.writeText('https://' + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const deleteLink = (id) => {
    const updated = links.filter((l) => l.id !== id);
    setLinks(updated);
    saveLinks(updated);
    if (result && result.id === id) setResult(null);
  };

  const clearAll = () => {
    setLinks([]);
    saveLinks([]);
    setResult(null);
  };

  const simulateClick = (id) => {
    const updated = links.map((l) => l.id === id ? { ...l, clicks: l.clicks + 1 } : l);
    setLinks(updated);
    saveLinks(updated);
    if (result && result.id === id) setResult((r) => ({ ...r, clicks: r.clicks + 1 }));
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'toolbeans-qr-' + (result ? result.code : 'short') + '.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      if (isValidURL(text)) analyzeURL(text);
    } catch {}
  };

  const filtered    = links.filter((l) =>
    l.originalURL.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalClicks = links.reduce((a, l) => a + l.clicks, 0);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 border-b border-slate-100 py-14">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-violet-50 text-violet-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Free · No Signup · Unlimited
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            URL{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Shortener
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-lg mx-auto mb-6">
            Shorten long URLs instantly. Add custom aliases, generate QR codes,
            preview destinations safely, and track your links — all free, no signup.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: links.length, label: 'Links Created' },
              { value: totalClicks,  label: 'Total Clicks'  },
              { value: '100%',       label: 'Free Forever'  },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-violet-600">{s.value}</div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD ── */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'shortener', label: 'Shortener' },
            { key: 'history',   label: 'My Links (' + links.length + ')' },
            { key: 'howto',     label: 'How It Works' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ' +
                (activeTab === tab.key
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-6 py-6">

        {/* ══ TAB 1: SHORTENER ══ */}
        {activeTab === 'shortener' && (
          <div className="flex flex-col gap-5">

            {/* Input Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Long URL
              </label>

              {/* URL Input */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="url"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setError('');
                      setResult(null);
                      if (isValidURL(e.target.value)) analyzeURL(e.target.value);
                      else setUrlInfo(null);
                    }}
                    placeholder="https://your-very-long-url.com/path?with=many&query=parameters"
                    className="w-full px-4 py-3.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 font-mono transition-all"
                  />
                  {input && isValidURL(input) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
                  )}
                </div>
                <button
                  onClick={pasteFromClipboard}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all flex-shrink-0"
                >
                  Paste
                </button>
              </div>

              {/* Custom Alias Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                  <div
                    onClick={() => { setUseCustomAlias(!useCustomAlias); setAlias(''); setAliasError(''); setAliasOk(false); }}
                    className={
                      'w-10 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 cursor-pointer ' +
                      (useCustomAlias ? 'bg-violet-600' : 'bg-slate-200')
                    }
                  >
                    <div className={'w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ' + (useCustomAlias ? 'translate-x-4' : 'translate-x-0')} />
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Custom Alias</span>
                  <span className="text-xs text-slate-400">Choose your own short code</span>
                </label>
              </div>

              {/* Custom Alias Input */}
              {useCustomAlias && (
                <div className="mb-4">
                  <div className={
                    'flex items-center gap-2 border rounded-xl px-4 py-3 transition-all ' +
                    (aliasError
                      ? 'bg-rose-50 border-rose-300'
                      : aliasOk
                      ? 'bg-green-50 border-green-300'
                      : 'bg-slate-50 border-slate-200')
                  }>
                    <span className="text-xs text-slate-400 font-mono flex-shrink-0">toolbeans.dev/s/</span>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => handleAliasChange(e.target.value)}
                      placeholder="your-custom-alias"
                      className="flex-1 bg-transparent outline-none text-sm font-mono text-slate-700"
                      maxLength={30}
                    />
                    <span className="text-xs text-slate-300 flex-shrink-0">{alias.length}/30</span>
                    {aliasOk && <span className="text-green-500 text-sm flex-shrink-0">✓</span>}
                    {aliasError && <span className="text-rose-500 text-sm flex-shrink-0">✗</span>}
                  </div>

                  {/* Alias status message */}
                  {aliasError && (
                    <div className="mt-2 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                      <span className="text-rose-500 flex-shrink-0 mt-0.5">🚫</span>
                      <div>
                        <div className="text-xs font-bold text-rose-700 mb-0.5">Alias Blocked</div>
                        <p className="text-xs text-rose-600 leading-relaxed">{aliasError}</p>
                      </div>
                    </div>
                  )}
                  {aliasOk && (
                    <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                      <span>✓</span> Alias is available and valid
                    </p>
                  )}

                  {/* Brand protection notice */}
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <span className="text-amber-500 flex-shrink-0">🛡️</span>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <strong>Brand Protection Active:</strong> Aliases containing brand names like
                      netflix, google, paypal, bank, login, admin, etc. are automatically blocked
                      to prevent phishing and fake link creation.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  <span className="text-rose-500 flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="text-xs text-rose-600 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {/* Shorten Button */}
              <button
                onClick={handleShorten}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200 text-sm"
              >
                ⚡ Shorten URL
              </button>

              {/* URL Analysis */}
              {urlInfo && !result && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">URL Analysis</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Domain',   value: urlInfo.domain },
                      { label: 'Protocol', value: urlInfo.protocol },
                      { label: 'Length',   value: urlInfo.length + ' chars' },
                      { label: 'Path',     value: urlInfo.path || '/' },
                      { label: 'Params',   value: urlInfo.params.length + ' query params' },
                      { label: 'Security', value: urlInfo.hasHTTPS ? '🔒 HTTPS' : '⚠️ HTTP' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white border border-slate-100 rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                        <div className="text-xs font-bold text-slate-700 truncate font-mono">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {urlInfo.params.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-bold text-slate-400 mb-2">Query Parameters</div>
                      <div className="flex flex-wrap gap-1.5">
                        {urlInfo.params.map((p, i) => (
                          <span key={i} className="text-xs bg-indigo-50 text-indigo-600 font-mono px-2 py-0.5 rounded-full">
                            {p.key}={p.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Result Card */}
            {result && (
              <div className="bg-white border-2 border-violet-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">✓</div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">URL Shortened!</div>
                    <div className="text-xs text-slate-400">
                      {result.isCustom ? 'Custom alias' : 'Auto-generated'} · {formatDate(result.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Short URL Row */}
                <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3.5 flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-violet-400 font-medium mb-0.5">Your Short URL</div>
                    <a
                      href={'https://' + result.shortURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-extrabold text-violet-700 font-mono hover:underline"
                    >
                      {result.shortURL}
                    </a>
                  </div>
                  <button
                    onClick={() => copyShortURL(result.shortURL)}
                    className={
                      'flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl transition-all text-sm flex-shrink-0 ml-3 ' +
                      (copied ? 'bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white')
                    }
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Original URL */}
                <div className="flex items-center gap-2 mb-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  {result.favicon && (
                    <img
                      src={result.favicon}
                      alt=""
                      className="w-4 h-4 rounded flex-shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 mb-0.5">Original URL</div>
                    <p className="text-xs text-slate-600 font-mono truncate">{result.originalURL}</p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-slate-400">{result.originalURL.length} chars</div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={
                      'flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ' +
                      (showPreview
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300')
                    }
                  >
                    🔍 {showPreview ? 'Hide Preview' : 'Preview Destination'}
                  </button>
                  <button
                    onClick={generateQR}
                    className={
                      'flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ' +
                      (qrGenerated
                        ? 'bg-violet-50 border-violet-300 text-violet-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-violet-300')
                    }
                  >
                    📱 {qrGenerated ? 'QR Generated' : 'Generate QR'}
                  </button>
                  <button
                    onClick={() => simulateClick(result.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 transition-all"
                  >
                    👆 Test Click ({result.clicks})
                  </button>
                  <button
                    onClick={() => deleteLink(result.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 transition-all ml-auto"
                  >
                    🗑 Delete
                  </button>
                </div>

                {/* Preview */}
                {showPreview && (
                  <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-500 flex-1 truncate">{result.originalURL}</span>
                    </div>
                    <div className="bg-slate-50 flex items-center justify-center py-8 text-center px-6">
                      <div>
                        {result.favicon && (
                          <img
                            src={result.favicon}
                            alt=""
                            className="w-8 h-8 rounded mx-auto mb-3"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="text-sm font-bold text-slate-700 mb-1">{result.domain}</div>
                        <div className="text-xs text-slate-400 font-mono mb-3 break-all max-w-sm">{result.originalURL}</div>
                        <a
                          href={result.originalURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-violet-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-violet-500 transition-all"
                        >
                          Open in New Tab
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code */}
                {!qrGenerated && <canvas ref={canvasRef} className="hidden" />}
                {qrGenerated && (
                  <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                    <canvas ref={canvasRef} className="rounded-xl flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-slate-700 mb-1">QR Code Ready!</div>
                      <div className="text-xs text-slate-500 mb-3">
                        Scan to open your short URL. Perfect for printing, presentations, and sharing.
                      </div>
                      <button
                        onClick={downloadQR}
                        className="text-xs bg-violet-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-violet-500 transition-all"
                      >
                        Download PNG
                      </button>
                    </div>
                  </div>
                )}

                {/* URL Encoder CTA */}
                <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🔗</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-indigo-700 mb-0.5">Need to encode this URL too?</div>
                    <p className="text-xs text-indigo-600 leading-relaxed">
                      If your URL contains special characters, spaces, or Unicode — encode it first before shortening.
                    </p>
                  </div>
                  <Link
                    href="/tools/url-encoder-decoder"
                    className="flex-shrink-0 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-lg transition-all"
                  >
                    URL Encoder
                  </Link>
                </div>
              </div>
            )}

            {/* Features Grid */}
            {!result && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: '⚡', title: 'Instant Shortening',  desc: 'Paste and shorten in one click. No signup, no waiting, no limits.',                color: 'bg-violet-50 border-violet-100' },
                  { icon: '✏️', title: 'Custom Alias',         desc: 'Choose your own memorable slug like toolbeans.dev/s/my-link.',                       color: 'bg-indigo-50 border-indigo-100' },
                  { icon: '📱', title: 'QR Code Included',    desc: 'Every short URL gets a free downloadable QR code — perfect for print.',             color: 'bg-cyan-50 border-cyan-100'    },
                  { icon: '🔍', title: 'Safe Preview',         desc: 'Preview where a link leads before opening it.',                                     color: 'bg-green-50 border-green-100'  },
                  { icon: '🛡️', title: 'Brand Protection',    desc: 'Aliases with brand names like netflix, google, paypal are blocked automatically.',  color: 'bg-amber-50 border-amber-100'  },
                  { icon: '🔒', title: '100% Private',         desc: 'Links stored in your browser only. Zero tracking, zero accounts needed.',           color: 'bg-rose-50 border-rose-100'    },
                ].map((f) => (
                  <div key={f.title} className={'border rounded-2xl p-5 ' + f.color}>
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <div className="font-bold text-slate-800 text-sm mb-1">{f.title}</div>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB 2: HISTORY ══ */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4">

            {links.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Links',    value: links.length },
                  { label: 'Total Clicks',   value: totalClicks  },
                  { label: 'Custom Aliases', value: links.filter((l) => l.isCustom).length },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-extrabold text-violet-600">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {links.length > 0 && (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search links…"
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-violet-400 transition-all"
                />
                <button
                  onClick={clearAll}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 transition-all flex-shrink-0"
                >
                  Clear All
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="text-5xl mb-3">🔗</div>
                <div className="text-slate-500 font-medium text-sm">
                  {links.length === 0 ? 'No links yet. Shorten your first URL!' : 'No links match your search.'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((link) => (
                  <div key={link.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-violet-200 transition-all">
                    <div className="flex items-start gap-4">
                      {link.favicon && (
                        <img
                          src={link.favicon}
                          alt=""
                          className="w-8 h-8 rounded-lg mt-0.5 flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <a
                            href={'https://' + link.shortURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-extrabold text-violet-600 font-mono hover:underline"
                          >
                            {link.shortURL}
                          </a>
                          {link.isCustom && (
                            <span className="text-xs bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-full">Custom</span>
                          )}
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {link.clicks} clicks
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate mb-1">{link.originalURL}</p>
                        <p className="text-xs text-slate-300">{formatDate(link.createdAt)}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyShortURL(link.shortURL)}
                          className="text-xs bg-violet-50 hover:bg-violet-100 text-violet-600 font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => deleteLink(link.id)}
                          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🔗</span>
              <div className="flex-1">
                <div className="font-bold text-indigo-700 mb-1">Need to encode a URL first?</div>
                <p className="text-xs text-indigo-600 leading-relaxed mb-3">
                  URLs with special characters, spaces, or Unicode may break when shortened. Use our URL Encoder to fix them first.
                </p>
                <Link
                  href="/tools/url-encoder-decoder"
                  className="inline-block text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-all"
                >
                  Open URL Encoder / Decoder
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 3: HOW IT WORKS ══ */}
        {activeTab === 'howto' && (
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">How It Works</h2>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Paste your long URL',     desc: 'Copy any long URL and paste it into the input box. We automatically analyze the URL structure for you.' },
                  { step: '2', title: 'Customize (optional)',     desc: 'Toggle Custom Alias to choose your own short code like /my-brand or /promo2025. Brand names are blocked for security.' },
                  { step: '3', title: 'Click Shorten URL',        desc: 'Hit the button and your short URL is created instantly. No signup, no email, no waiting.' },
                  { step: '4', title: 'Generate a QR Code',       desc: 'Click Generate QR to get a downloadable QR code for your short link.' },
                  { step: '5', title: 'Preview the destination',  desc: 'Use Preview Destination to safely check the target URL before clicking.' },
                  { step: '6', title: 'Manage your links',        desc: 'All your shortened links are saved to your browser. Visit My Links to see history, track clicks, and delete links.' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-extrabold flex-shrink-0 text-sm">
                      {s.step}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 mb-1">{s.title}</div>
                      <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Protection Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-amber-800 mb-3">🛡️ Brand Protection Policy</h2>
              <p className="text-sm text-amber-700 leading-relaxed mb-4">
                To protect users from phishing and fake links, custom aliases containing official brand names are automatically blocked. This includes names like:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['netflix','google','paypal','amazon','apple','microsoft','facebook','instagram','bank','login','admin','verify'].map((b) => (
                  <span key={b} className="text-xs bg-white border border-amber-300 text-amber-700 font-mono font-bold px-2 py-1 rounded-lg">
                    {b}
                  </span>
                ))}
                <span className="text-xs text-amber-500 font-medium px-2 py-1">+ 60 more</span>
              </div>
              <p className="text-xs text-amber-600 leading-relaxed">
                This prevents people from creating links like <code className="bg-white px-1 rounded text-rose-600">toolbeans.dev/s/netflix-login</code> or <code className="bg-white px-1 rounded text-rose-600">toolbeans.dev/s/paypal-verify</code> that could mislead users.
              </p>
            </div>

            {/* FAQ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-5">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: 'Is this URL shortener really free?',        a: 'Yes, 100% free forever. No signup required, no link limits, no expiry dates.' },
                  { q: 'Where are my links stored?',                a: 'All your shortened links are stored in your browser localStorage. They are private to you.' },
                  { q: 'Why are some aliases blocked?',             a: 'Aliases containing brand names like netflix, google, paypal, bank, login are blocked to prevent phishing and impersonation attacks.' },
                  { q: 'What if my URL has special characters?',    a: 'URLs with spaces, Arabic text, or special characters need to be encoded first. Use our URL Encoder / Decoder tool.' },
                  { q: 'Can I use custom aliases for branding?',    a: 'Yes! Toggle Custom Alias and type a memorable code like /sale or /portfolio. Just avoid using brand names.' },
                  { q: 'Why does the short URL not redirect yet?',  a: 'The short URL (toolbeans.dev/s/xxx) will work once the website is deployed to a real domain with a backend database.' },
                ].map((faq, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 hover:border-violet-200 transition-colors">
                    <div className="text-sm font-bold text-slate-800 mb-1.5">Q: {faq.q}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">A: {faq.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* URL Encoder Reference */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-7">
              <div className="flex items-start gap-4">
                <span className="text-4xl flex-shrink-0">🔗</span>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-indigo-800 mb-2">
                    Related Tool: URL Encoder / Decoder
                  </h3>
                  <p className="text-sm text-indigo-700 leading-relaxed mb-4">
                    Before shortening a URL, make sure it is properly formatted. If your URL contains spaces, special characters, or non-English text — they must be percent-encoded first.
                  </p>
                  <div className="bg-white border border-indigo-200 rounded-xl p-4 mb-4">
                    <div className="text-xs font-bold text-slate-500 mb-2">Example:</div>
                    <div className="font-mono text-xs space-y-1">
                      <div className="text-rose-500">Bad: https://example.com/search?q=hello world</div>
                      <div className="text-green-600">Good: https://example.com/search?q=hello%20world</div>
                    </div>
                  </div>
                  <Link
                    href="/tools/url-encoder-decoder"
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl transition-all text-sm"
                  >
                    Open URL Encoder / Decoder
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── AD BOTTOM ── */}
        <div className="mt-8 mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement — 728x90
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">Why Use a URL Shortener?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '📱', title: 'Social Media',    desc: 'Twitter, Instagram bios, and SMS all benefit from short clean URLs that save character limits.' },
              { icon: '🖨️', title: 'Print Materials', desc: 'Business cards, flyers, and posters need short URLs that humans can actually type.' },
              { icon: '📧', title: 'Email Campaigns', desc: 'Short links look professional in emails and do not get broken by email clients wrapping long URLs.' },
              { icon: '📊', title: 'Click Tracking',  desc: 'Track how many people click each link to measure campaign performance.' },
              { icon: '🎯', title: 'Branded Links',   desc: 'Custom aliases like /promo or /sale look professional and increase trust and click-through rates.' },
              { icon: '🔒', title: 'Safe Sharing',    desc: 'Preview destination before clicking — essential for sharing links safely in messages.' },
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