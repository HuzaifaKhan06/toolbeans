'use client';

import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────
// ── Base64URL decode (JWT uses Base64URL) ──
// ─────────────────────────────────────────────
function base64UrlDecode(str) {
  // Pad to multiple of 4
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4 !== 0) s += '=';
  try {
    return decodeURIComponent(
      atob(s)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(s);
  }
}

// ─────────────────────────────────────────────
// ── JWT Parser ──
// ─────────────────────────────────────────────
function parseJWT(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: must have exactly 3 parts (header.payload.signature)');

  let header, payload;
  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
  } catch {
    throw new Error('Invalid JWT header: could not decode Base64URL or parse JSON');
  }
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    throw new Error('Invalid JWT payload: could not decode Base64URL or parse JSON');
  }

  return { header, payload, signature: parts[2], raw: parts };
}

// ─────────────────────────────────────────────
// ── Algorithm Security Ratings ──
// ─────────────────────────────────────────────
const ALG_INFO = {
  none:   { level: 'critical', label: 'CRITICAL No Signature',   desc: 'Token has no signature. Anyone can forge this token. Never accept in production.', color: 'rose'   },
  HS256:  { level: 'good',     label: 'Good HMAC SHA-256',       desc: 'Symmetric signing. Secure when secret key is long and random. Common for APIs.',  color: 'emerald' },
  HS384:  { level: 'good',     label: 'Good HMAC SHA-384',       desc: 'Stronger symmetric signing. Larger key size adds security.',                       color: 'emerald' },
  HS512:  { level: 'good',     label: 'Good HMAC SHA-512',       desc: 'Strongest symmetric signing. Recommended for high-security applications.',         color: 'emerald' },
  RS256:  { level: 'best',     label: 'Best RSA SHA-256',        desc: 'Asymmetric signing. Public key can verify, private key signs. Industry standard.', color: 'sky'     },
  RS384:  { level: 'best',     label: 'Best RSA SHA-384',        desc: 'Asymmetric with stronger hash. Used by enterprise identity providers.',            color: 'sky'     },
  RS512:  { level: 'best',     label: 'Best RSA SHA-512',        desc: 'Asymmetric with maximum hash strength. Maximum security.',                        color: 'sky'     },
  ES256:  { level: 'best',     label: 'Best ECDSA SHA-256',      desc: 'Elliptic curve asymmetric signing. Smaller keys, same strength as RSA-3072.',    color: 'sky'     },
  ES384:  { level: 'best',     label: 'Best ECDSA SHA-384',      desc: 'Stronger elliptic curve. Used in modern OAuth 2.0 implementations.',              color: 'sky'     },
  ES512:  { level: 'best',     label: 'Best ECDSA SHA-512',      desc: 'Maximum elliptic curve strength.',                                               color: 'sky'     },
  PS256:  { level: 'best',     label: 'Best RSASSA-PSS SHA-256', desc: 'Modern RSA with probabilistic padding. Stronger than PKCS1v15.',                color: 'sky'     },
};

// ─────────────────────────────────────────────
// ── Standard JWT Claims Reference ──
// ─────────────────────────────────────────────
const CLAIM_INFO = {
  // Payload claims
  sub:   { full: 'Subject',           desc: 'Who the token is about usually a user ID or username.',                  icon: '👤' },
  iss:   { full: 'Issuer',            desc: 'Who issued this token usually your auth server or domain.',              icon: '🏢' },
  aud:   { full: 'Audience',          desc: 'Who this token is intended for which service should accept it.',         icon: '🎯' },
  exp:   { full: 'Expiration Time',   desc: 'Unix timestamp after which this token must not be accepted.',             icon: '⏰' },
  iat:   { full: 'Issued At',         desc: 'Unix timestamp when this token was created.',                             icon: '📅' },
  nbf:   { full: 'Not Before',        desc: 'Unix timestamp before which this token must not be accepted.',            icon: '🚦' },
  jti:   { full: 'JWT ID',            desc: 'Unique identifier for this token used to prevent replay attacks.',      icon: '🔑' },
  name:  { full: 'Full Name',         desc: 'User display name. Common in OpenID Connect tokens.',                    icon: '📝' },
  email: { full: 'Email Address',     desc: 'User email. Common in OpenID Connect and OAuth2 tokens.',                icon: '📧' },
  role:  { full: 'Role',              desc: 'User role or permission level (custom claim).',                          icon: '🛡️' },
  roles: { full: 'Roles',             desc: 'Array of user roles or permissions (custom claim).',                     icon: '🛡️' },
  scope: { full: 'Scope',             desc: 'OAuth2 permission scopes granted to this token.',                        icon: '🔐' },
  // Header claims
  alg:   { full: 'Algorithm',         desc: 'Cryptographic algorithm used to sign this token.',                       icon: '⚙️' },
  typ:   { full: 'Type',              desc: 'Token type almost always "JWT".',                                     icon: '📋' },
  kid:   { full: 'Key ID',            desc: 'Identifier for the key used to sign used to find the right public key.', icon: '🔑' },
  cty:   { full: 'Content Type',      desc: 'Media type of the token payload when nesting JWTs.',                   icon: '📄' },
};

// ─────────────────────────────────────────────
// ── Time Formatting Helpers ──
// ─────────────────────────────────────────────
const formatDate = (ts) =>
  new Date(ts * 1000).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZoneName: 'short',
  });

const formatDuration = (seconds) => {
  if (seconds < 0) return 'Expired';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
  if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
};

// ─────────────────────────────────────────────
// ── Sample JWTs ──
// ─────────────────────────────────────────────
const SAMPLES = [
  {
    label: 'Standard JWT',
    // HS256 signed sample with future exp
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMzQ1NiIsIm5hbWUiOiJKb2huIERvZSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5LCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJhdWQiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  {
    label: 'Expired Token',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzAwMSIsIm5hbWUiOiJBbGljZSBTbWl0aCIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMCwiaXNzIjoiaHR0cHM6Ly9hdXRoLmV4YW1wbGUuY29tIn0.abc123signature',
  },
  {
    label: 'OAuth2 Token',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0yMDI0LTAxIn0.eyJzdWIiOiJ1c2VyX2FiY2RlZiIsImlzcyI6Imh0dHBzOi8vb2F1dGgyLmV4YW1wbGUuY29tIiwiYXVkIjpbImh0dHBzOi8vYXBpLmV4YW1wbGUuY29tIiwiaHR0cHM6Ly9hcHAuZXhhbXBsZS5jb20iXSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.signature',
  },
  {
    label: 'Unsafe (alg:none)',
    token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJzdXBlcmFkbWluIiwiaWF0IjoxNzAwMDAwMDAwfQ.',
  },
];

// ─────────────────────────────────────────────
// ── JSON Pretty Renderer with Claim Tooltips ──
// ─────────────────────────────────────────────
function ClaimRow({ claimKey, value, isTimestamp }) {
  const [showTip, setShowTip] = useState(false);
  const info = CLAIM_INFO[claimKey];

  const getValueDisplay = () => {
    if (isTimestamp && typeof value === 'number') {
      return (
        <div>
          <span className="font-mono text-sky-700 font-bold">{value}</span>
          <span className="ml-2 text-xs text-slate-400 font-normal">→ {formatDate(value)}</span>
        </div>
      );
    }
    if (typeof value === 'boolean') return <span className={value ? 'text-emerald-600' : 'text-rose-500'}>{String(value)}</span>;
    if (typeof value === 'number') return <span className="text-blue-600 font-mono">{value}</span>;
    if (Array.isArray(value)) return <span className="text-slate-600 font-mono text-xs">{JSON.stringify(value)}</span>;
    if (typeof value === 'object') return <span className="text-slate-600 font-mono text-xs">{JSON.stringify(value)}</span>;
    return <span className="text-amber-700 font-mono">&quot;{String(value)}&quot;</span>;
  };

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-sky-50 rounded-xl transition-colors group">
      {/* Key */}
      <div className="flex items-center gap-2 min-w-[140px] flex-shrink-0">
        {info && <span className="text-base">{info.icon}</span>}
        <span className="text-xs font-bold text-sky-700 font-mono">{claimKey}</span>
        {info && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className="w-4 h-4 rounded-full bg-slate-200 hover:bg-sky-200 text-slate-500 hover:text-sky-600 text-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              ?
            </button>
            {showTip && (
              <div className="absolute left-6 top-0 z-10 bg-slate-900 text-white text-xs rounded-xl px-3 py-2 w-56 shadow-xl leading-relaxed">
                <div className="font-bold mb-1 text-sky-300">{info.full}</div>
                {info.desc}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Value */}
      <div className="flex-1 text-sm leading-relaxed break-all">{getValueDisplay()}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ── MAIN COMPONENT ──
// ─────────────────────────────────────────────
export default function JWTTool() {
  const [input, setInput]         = useState('');
  const [decoded, setDecoded]     = useState(null);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState('');
  const [now, setNow]             = useState(Math.floor(Date.now() / 1000));
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('decoder');
  const [activeSection, setActiveSection] = useState('payload');

  // Live clock updates every second for countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Decode token ──
  const decodeToken = (token) => {
    setError('');
    setDecoded(null);
    if (!token.trim()) return;
    try {
      const result = parseJWT(token);
      setDecoded(result);
      // Save to history
      setHistory((prev) => [{
        preview: token.slice(0, 30) + '…',
        alg:     result.header?.alg || '?',
        sub:     result.payload?.sub || result.payload?.name || 'Unknown',
        time:    new Date().toLocaleTimeString(),
        token,
      }, ...prev.filter((h) => h.token !== token)].slice(0, 8));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleInput = (val) => {
    setInput(val);
    decodeToken(val);
  };

  const pasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInput(text);
    } catch {}
  };

  const copyText = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2500);
  };

  const downloadDecoded = () => {
    if (!decoded) return;
    const data = {
      header:    decoded.header,
      payload:   decoded.payload,
      signature: decoded.signature,
      meta:      {
        decodedAt:  new Date().toISOString(),
        tool:       'TOOLBeans JWT Decoder',
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TOOLBeans-jwt-decoded.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived state ──
  const exp = decoded?.payload?.exp;
  const iat = decoded?.payload?.iat;
  const nbf = decoded?.payload?.nbf;
  const alg = decoded?.header?.alg;

  const isExpired      = exp ? now > exp : false;
  const isNotYetValid  = nbf ? now < nbf : false;
  const secondsLeft    = exp ? exp - now : null;
  const isExpiringSoon = !isExpired && secondsLeft !== null && secondsLeft < 300;

  const algInfo = alg ? ALG_INFO[alg] : null;
  const isCritical = alg === 'none';

  const getExpiryStatus = () => {
    if (!exp) return { color: 'slate', label: 'No Expiry Set', icon: '♾️' };
    if (isExpired) return { color: 'rose', label: 'Expired', icon: '🔴' };
    if (isExpiringSoon) return { color: 'amber', label: 'Expiring Soon', icon: '🟡' };
    return { color: 'emerald', label: 'Valid', icon: '🟢' };
  };

  const expiryStatus = getExpiryStatus();

  const tokenDuration = (exp && iat) ? exp - iat : null;

  // Timestamp claim keys
  const timestampKeys = new Set(['exp', 'iat', 'nbf']);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-blue-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-sky-50 text-sky-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-sky-200">
            Auth Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            JWT Token{' '}
            <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Decoder
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto mb-6">
            Instantly decode and inspect JSON Web Tokens. View header, payload, expiry status,
            security warnings, and all standard JWT claims 100% runs in your browser.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { value: '3 Parts',   label: 'Header · Payload · Signature' },
              { value: '100%',      label: 'Private & Offline'            },
              { value: 'Live',      label: 'Expiry Countdown'             },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-sky-600">{s.value}</div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD TOP ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          {[
            { key: 'decoder', label: '🔓 Decoder'   },
            { key: 'guide',   label: '📖 JWT Guide' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ' +
                (activeTab === tab.key
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-6">

        {/* ══════════════════════════════════ */}
        {/* TAB 1 DECODER                   */}
        {/* ══════════════════════════════════ */}
        {activeTab === 'decoder' && (
          <div className="flex flex-col gap-5">

            {/* Input Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">JWT Token Input</span>
                <div className="flex items-center gap-2">
                  <button onClick={pasteInput} className="text-xs text-sky-600 hover:text-sky-500 font-semibold px-2.5 py-1 rounded-lg hover:bg-sky-50 transition-all">
                    ⎘ Paste
                  </button>
                  <button onClick={() => { setInput(''); setDecoded(null); setError(''); }} className="text-xs text-rose-400 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-all">
                    ✕ Clear
                  </button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder={'Paste your JWT token here…\n\nExample format:\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTcwMDAwMDAwMH0.signature'}
                className="w-full px-6 py-5 text-sm text-slate-700 outline-none resize-none font-mono leading-relaxed bg-white break-all"
                style={{ minHeight: '120px' }}
              />

              {/* Token structure visualizer */}
              {input.trim() && input.trim().split('.').length >= 2 && (
                <div className="px-6 pb-4 pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Token Structure</div>
                  <div className="flex flex-wrap gap-1 font-mono text-xs leading-relaxed">
                    {input.trim().split('.').map((part, i) => {
                      const colors = [
                        'bg-rose-100 text-rose-700 border border-rose-200',
                        'bg-sky-100 text-sky-700 border border-sky-200',
                        'bg-violet-100 text-violet-700 border border-violet-200',
                      ];
                      const labels = ['Header', 'Payload', 'Signature'];
                      return (
                        <span key={i} className={'inline-flex items-center gap-1 px-2 py-1 rounded-lg ' + colors[i]}>
                          <span className="font-bold text-xs opacity-60">{labels[i]}:</span>
                          <span className="truncate max-w-[120px] sm:max-w-[200px]">{part || '(empty)'}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Samples */}
              <div className="flex items-center gap-2 px-6 py-3 border-t border-slate-100 bg-slate-50 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Samples:</span>
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleInput(s.token)}
                    className="text-xs bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-600 hover:text-sky-700 font-semibold px-3 py-1.5 rounded-xl transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-2xl px-5 py-4">
                <span className="text-rose-500 text-xl flex-shrink-0">⚠️</span>
                <div>
                  <div className="text-sm font-bold text-rose-700 mb-0.5">Invalid JWT Token</div>
                  <p className="text-xs text-rose-600 font-mono leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* ── DECODED RESULTS ── */}
            {decoded && (
              <div className="flex flex-col gap-4">

                {/* ── CRITICAL SECURITY WARNING (alg: none) ── */}
                {isCritical && (
                  <div className="flex items-start gap-3 bg-rose-50 border-2 border-rose-400 rounded-2xl px-5 py-4">
                    <span className="text-rose-500 text-2xl flex-shrink-0">🚨</span>
                    <div>
                      <div className="text-sm font-extrabold text-rose-700 mb-1">CRITICAL SECURITY WARNING</div>
                      <p className="text-xs text-rose-600 leading-relaxed">
                        This token uses <code className="bg-rose-100 px-1 rounded font-mono font-bold">alg: none</code> it has
                        NO cryptographic signature. This means anyone can forge this token and gain unauthorized access.
                        This is a well-known JWT attack vector. Never accept tokens with alg:none in production.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── EXPIRY STATUS BANNER ── */}
                <div className={
                  'flex items-center justify-between rounded-2xl px-5 py-4 border ' +
                  (isExpired
                    ? 'bg-rose-50 border-rose-200'
                    : isExpiringSoon
                    ? 'bg-amber-50 border-amber-200'
                    : exp
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200')
                }>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{expiryStatus.icon}</span>
                    <div>
                      <div className={'text-sm font-extrabold ' + (isExpired ? 'text-rose-700' : isExpiringSoon ? 'text-amber-700' : exp ? 'text-emerald-700' : 'text-slate-700')}>
                        Token is {expiryStatus.label}
                      </div>
                      {exp && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {isExpired
                            ? 'Expired ' + formatDuration(now - exp) + ' ago ' + formatDate(exp)
                            : 'Expires in ' + formatDuration(secondsLeft) + ' ' + formatDate(exp)}
                        </div>
                      )}
                      {!exp && (
                        <div className="text-xs text-slate-400 mt-0.5">No expiration claim (exp) found in this token.</div>
                      )}
                    </div>
                  </div>

                  {/* Live countdown */}
                  {exp && !isExpired && (
                    <div className={'text-right flex-shrink-0'}>
                      <div className={'text-xl font-extrabold font-mono ' + (isExpiringSoon ? 'text-amber-600' : 'text-emerald-600')}>
                        {formatDuration(secondsLeft)}
                      </div>
                      <div className="text-xs text-slate-400">remaining</div>
                    </div>
                  )}
                </div>

                {/* ── ALGORITHM SECURITY ── */}
                {algInfo && (
                  <div className={
                    'flex items-start gap-3 rounded-2xl px-5 py-4 border ' +
                    (algInfo.level === 'critical' ? 'bg-rose-50 border-rose-200' :
                     algInfo.level === 'best'     ? 'bg-sky-50 border-sky-200'   :
                                                    'bg-emerald-50 border-emerald-200')
                  }>
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {algInfo.level === 'critical' ? '🚨' : algInfo.level === 'best' ? '🏆' : '✅'}
                    </span>
                    <div>
                      <div className={'text-xs font-bold uppercase tracking-wider mb-0.5 ' +
                        (algInfo.level === 'critical' ? 'text-rose-500' : algInfo.level === 'best' ? 'text-sky-500' : 'text-emerald-500')}>
                        Algorithm Security
                      </div>
                      <div className="text-sm font-extrabold text-slate-800 mb-1">
                        <code className="font-mono">{alg}</code> {algInfo.label}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{algInfo.desc}</p>
                    </div>
                  </div>
                )}

                {/* ── TOKEN STATS ROW ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Algorithm',  value: decoded.header?.alg || 'Unknown' },
                    { label: 'Token Type', value: decoded.header?.typ || 'JWT' },
                    { label: 'Issued At',  value: iat ? formatDate(iat).split(',')[0] : 'N/A' },
                    { label: 'Valid For',  value: tokenDuration ? formatDuration(tokenDuration) : 'No expiry' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                      <div className="text-xs text-slate-400 mb-1">{s.label}</div>
                      <div className="text-sm font-extrabold text-slate-800 font-mono truncate">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* ── SECTION TABS ── */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex border-b border-slate-100">
                    {[
                      { key: 'payload',   label: 'Payload Claims'   },
                      { key: 'header',    label: 'Header'           },
                      { key: 'raw',       label: 'Raw JSON'         },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        className={
                          'px-5 py-3 text-xs font-bold transition-all border-b-2 ' +
                          (activeSection === s.key
                            ? 'border-sky-600 text-sky-600 bg-sky-50'
                            : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50')
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 px-4">
                      <button
                        onClick={() => copyText('payload', JSON.stringify(activeSection === 'header' ? decoded.header : decoded.payload, null, 2))}
                        className={
                          'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' +
                          (copied === 'payload' ? 'bg-green-500 text-white' : 'bg-sky-50 hover:bg-sky-100 text-sky-600')
                        }
                      >
                        {copied === 'payload' ? '✓ Copied' : '⎘ Copy'}
                      </button>
                      <button
                        onClick={downloadDecoded}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                      >
                        ⬇ JSON
                      </button>
                    </div>
                  </div>

                  {/* Payload Claims */}
                  {activeSection === 'payload' && (
                    <div className="p-3 divide-y divide-slate-50">
                      {Object.entries(decoded.payload).map(([k, v]) => (
                        <ClaimRow
                          key={k}
                          claimKey={k}
                          value={v}
                          isTimestamp={timestampKeys.has(k)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Header */}
                  {activeSection === 'header' && (
                    <div className="p-3 divide-y divide-slate-50">
                      {Object.entries(decoded.header).map(([k, v]) => (
                        <ClaimRow key={k} claimKey={k} value={v} isTimestamp={false} />
                      ))}
                    </div>
                  )}

                  {/* Raw JSON */}
                  {activeSection === 'raw' && (
                    <div className="p-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Header</span>
                          <button
                            onClick={() => copyText('hdr', JSON.stringify(decoded.header, null, 2))}
                            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                          >
                            {copied === 'hdr' ? '✓ Copied' : '⎘ Copy'}
                          </button>
                        </div>
                        <pre className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 text-xs font-mono text-slate-700 leading-relaxed overflow-x-auto">
                          {JSON.stringify(decoded.header, null, 2)}
                        </pre>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-sky-500 uppercase tracking-wider">Payload</span>
                          <button
                            onClick={() => copyText('pld', JSON.stringify(decoded.payload, null, 2))}
                            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                          >
                            {copied === 'pld' ? '✓ Copied' : '⎘ Copy'}
                          </button>
                        </div>
                        <pre className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 text-xs font-mono text-slate-700 leading-relaxed overflow-x-auto">
                          {JSON.stringify(decoded.payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">Signature (raw)</span>
                          <button
                            onClick={() => copyText('sig', decoded.signature)}
                            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                          >
                            {copied === 'sig' ? '✓ Copied' : '⎘ Copy'}
                          </button>
                        </div>
                        <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-xs font-mono text-violet-700 break-all leading-relaxed">
                          {decoded.signature || '(empty alg:none token)'}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                          Note: The signature cannot be verified without the secret key or public key. This tool only decodes it does not validate signatures.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Privacy notice */}
                <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-5 py-3.5">
                  <span className="text-sky-500 text-lg flex-shrink-0">🔒</span>
                  <p className="text-xs text-sky-700 leading-relaxed">
                    <strong>100% Private:</strong> Your JWT token is decoded entirely in your browser.
                    It is never sent to any server. Safe for production tokens and sensitive data.
                  </p>
                </div>

                {/* History */}
                {history.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        🕐 Recent Tokens ({history.length})
                      </span>
                      <span className="text-slate-400 text-sm">{showHistory ? '▲' : '▼'}</span>
                    </button>
                    {showHistory && (
                      <div className="border-t border-slate-100 divide-y divide-slate-50">
                        {history.map((h, i) => (
                          <div
                            key={i}
                            onClick={() => handleInput(h.token)}
                            className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <span className="text-xs text-slate-300 font-mono flex-shrink-0">{h.time}</span>
                            <span className="text-xs font-bold bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full font-mono flex-shrink-0">{h.alg}</span>
                            <span className="text-xs text-slate-500 flex-shrink-0">{h.sub}</span>
                            <span className="text-xs font-mono text-slate-300 truncate flex-1">{h.preview}</span>
                          </div>
                        ))}
                        <div className="px-6 py-3 bg-slate-50">
                          <button onClick={() => setHistory([])} className="text-xs text-rose-400 hover:text-rose-600 font-semibold">
                            Clear History
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!decoded && !error && !input && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
                <div className="text-6xl mb-4">🔓</div>
                <div className="text-slate-700 font-bold text-base mb-2">Paste a JWT Token Above</div>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Paste any JWT token to decode its header and payload, check expiry status,
                  view security warnings, and inspect all claims with explanations.
                </p>
                <button
                  onClick={() => handleInput(SAMPLES[0].token)}
                  className="mt-5 text-xs bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  Load Sample Token
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* TAB 2 JWT GUIDE                 */}
        {/* ══════════════════════════════════ */}
        {activeTab === 'guide' && (
          <div className="flex flex-col gap-5">

            {/* Structure explanation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4">JWT Structure</h2>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                A JWT (JSON Web Token) consists of three Base64URL-encoded parts separated by dots.
              </p>
              <div className="flex flex-col gap-3 mb-5">
                {[
                  { part: 'Header',    color: 'rose',   icon: '📋', desc: 'Contains the token type (JWT) and the signing algorithm (HS256, RS256, etc.).' },
                  { part: 'Payload',   color: 'sky',    icon: '📦', desc: 'Contains the claims statements about the user and additional data like expiry, roles, email.' },
                  { part: 'Signature', color: 'violet', icon: '✍️',  desc: 'Verifies the token was not tampered with. Created by signing header + payload with a secret or private key.' },
                ].map((p) => (
                  <div key={p.part} className={'flex items-start gap-4 p-4 rounded-2xl bg-' + p.color + '-50 border border-' + p.color + '-100'}>
                    <span className="text-2xl flex-shrink-0">{p.icon}</span>
                    <div>
                      <div className={'text-sm font-extrabold text-' + p.color + '-700 mb-1'}>{p.part}</div>
                      <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs">
                <div className="text-slate-400 mb-2 text-xs">Example JWT token:</div>
                <div className="break-all leading-relaxed">
                  <span className="text-rose-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-sky-400">eyJzdWIiOiJ1c2VyXzEyMyIsImlhdCI6MTcwMDAwMDAwMH0</span>
                  <span className="text-slate-500">.</span>
                  <span className="text-violet-400">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
                </div>
                <div className="flex gap-4 mt-3 text-xs">
                  <span className="text-rose-400">■ Header</span>
                  <span className="text-sky-400">■ Payload</span>
                  <span className="text-violet-400">■ Signature</span>
                </div>
              </div>
            </div>

            {/* Standard Claims Reference */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4">Standard JWT Claims</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Claim', 'Full Name', 'Type', 'Description'].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { claim: 'sub',   full: 'Subject',         type: 'string',  desc: 'Who the token is about (user ID)' },
                      { claim: 'iss',   full: 'Issuer',          type: 'string',  desc: 'Who issued the token (auth server URL)' },
                      { claim: 'aud',   full: 'Audience',        type: 'string[]',desc: 'Who the token is intended for' },
                      { claim: 'exp',   full: 'Expiration Time', type: 'number',  desc: 'Unix timestamp when token expires' },
                      { claim: 'iat',   full: 'Issued At',       type: 'number',  desc: 'Unix timestamp when token was created' },
                      { claim: 'nbf',   full: 'Not Before',      type: 'number',  desc: 'Unix timestamp token not valid before this' },
                      { claim: 'jti',   full: 'JWT ID',          type: 'string',  desc: 'Unique token ID (prevents replay attacks)' },
                      { claim: 'name',  full: 'Full Name',       type: 'string',  desc: 'User display name (OpenID Connect)' },
                      { claim: 'email', full: 'Email',           type: 'string',  desc: 'User email address (OpenID Connect)' },
                      { claim: 'scope', full: 'Scope',           type: 'string',  desc: 'OAuth2 permission scopes' },
                    ].map((row) => (
                      <tr key={row.claim} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-3 font-mono font-bold text-sky-600">{row.claim}</td>
                        <td className="px-3 py-3 text-slate-700 font-semibold">{row.full}</td>
                        <td className="px-3 py-3 font-mono text-violet-600">{row.type}</td>
                        <td className="px-3 py-3 text-slate-400 leading-relaxed">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security dos and donts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-rose-700 mb-3">❌ Never Do</h3>
                <div className="space-y-2.5">
                  {[
                    'Store sensitive data (passwords, credit cards) in the payload it is only Base64 encoded, not encrypted',
                    'Accept tokens with alg:none this is a critical security vulnerability',
                    'Use short or predictable secret keys for HMAC signing',
                    'Ignore the exp claim always validate token expiry server-side',
                    'Trust the alg header blindly validate on the server to prevent algorithm confusion attacks',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-rose-700">
                      <span className="text-rose-400 flex-shrink-0 mt-0.5">✗</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <h3 className="text-sm font-extrabold text-emerald-700 mb-3">✓ Best Practices</h3>
                <div className="space-y-2.5">
                  {[
                    'Use RS256 or ES256 for production asymmetric algorithms are more secure than symmetric',
                    'Set short expiry times (15min–1hr) and use refresh tokens for long sessions',
                    'Validate the iss (issuer) and aud (audience) claims on the server',
                    'Store JWTs in httpOnly cookies, not localStorage, to prevent XSS attacks',
                    'Rotate signing keys regularly and support key rotation via the kid header claim',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-emerald-700">
                      <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-5">FAQ</h2>
              <div className="space-y-4">
                {[
                  { q: 'Is a JWT encrypted?',                     a: 'No. A standard JWT (JWS) is only signed, not encrypted. The payload is Base64URL encoded, which anyone can decode. Sensitive data should never be stored in a JWT payload. JWE (JSON Web Encryption) is a separate standard for encrypted tokens.' },
                  { q: 'Can I verify the signature here?',         a: 'No. Signature verification requires the secret key (for HMAC) or public key (for RSA/ECDSA), which this client-side tool does not have. You should verify signatures on your server.' },
                  { q: 'Why is my token showing as expired?',      a: 'The exp claim is a Unix timestamp. If the current time (in seconds) is greater than exp, the token is expired. Check the expiry time shown in the decoder.' },
                  { q: 'What is the difference between HS256 and RS256?', a: 'HS256 uses a shared secret key (symmetric) both sides use the same key. RS256 uses a public/private key pair (asymmetric) the server signs with the private key and clients verify with the public key. RS256 is more secure for distributed systems.' },
                  { q: 'Is it safe to decode my token here?',     a: 'Yes. The entire decoding process runs in your browser using JavaScript. No data is sent to any server. Your token stays completely private.' },
                  { q: 'What is alg:none and why is it dangerous?', a: '"alg:none" means the token has no cryptographic signature. An attacker can create a token with any claims and set alg:none to bypass authentication. Some early JWT libraries accepted this never accept alg:none tokens in your server.' },
                ].map((faq, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 hover:border-sky-200 transition-colors">
                    <div className="text-sm font-bold text-slate-800 mb-1.5">Q: {faq.q}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">A: {faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AD BOTTOM ── */}
        <div className="mt-8 mb-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement 728x90
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">What is a JWT Decoder?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🔓', title: 'Instant Decoding',        desc: 'Paste any JWT and instantly see the decoded header and payload with all claims clearly labeled.' },
              { icon: '⏰', title: 'Live Expiry Countdown',   desc: 'See exactly how long until your token expires with a live countdown timer. Red when expired, green when valid.' },
              { icon: '🚨', title: 'Security Warnings',       desc: 'Automatic detection of dangerous configurations like alg:none and weak algorithms with clear explanations.' },
              { icon: '🏷️', title: 'Claims Inspector',        desc: 'Every standard JWT claim (sub, iss, aud, exp, iat) is labeled and explained with hover tooltips.' },
              { icon: '🔒', title: '100% Private',            desc: 'All decoding happens in your browser. Your tokens are never sent to any server safe for production tokens.' },
              { icon: '⬇️', title: 'Export Decoded JSON',     desc: 'Download the full decoded token as a formatted JSON file for documentation or debugging.' },
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