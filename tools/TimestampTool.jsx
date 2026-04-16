'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Helpers ────────────────────────────────────────────────
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];

const pad = (n) => String(n).padStart(2, '0');

const formatDateTime = (date, tz) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(date);
  } catch { return 'Invalid'; }
};

const formatISO = (date) => {
  try { return date.toISOString(); } catch { return ''; }
};

const formatRelative = (date) => {
  const diffMs   = date - new Date();
  const diffSecs = Math.round(diffMs / 1000);
  const abs      = Math.abs(diffSecs);
  const future   = diffSecs > 0;
  if (abs < 60)     return future ? `in ${abs}s`            : `${abs}s ago`;
  if (abs < 3600)   return future ? `in ${Math.round(abs/60)}m`  : `${Math.round(abs/60)}m ago`;
  if (abs < 86400)  return future ? `in ${Math.round(abs/3600)}h` : `${Math.round(abs/3600)}h ago`;
  if (abs < 2592000) return future ? `in ${Math.round(abs/86400)}d` : `${Math.round(abs/86400)}d ago`;
  if (abs < 31536000) return future ? `in ${Math.round(abs/2592000)}mo` : `${Math.round(abs/2592000)}mo ago`;
  return future ? `in ${Math.round(abs/31536000)}y` : `${Math.round(abs/31536000)}y ago`;
};

const getDayName = (date) => ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()];
const getMonthName = (date) => ['January','February','March','April','May','June','July','August','September','October','November','December'][date.getMonth()];

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const parseInput = (val) => {
  const trimmed = val.trim();
  if (!trimmed) return null;
  // Pure number → Unix timestamp
  if (/^\d{1,13}$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    // If ≤ 10 digits treat as seconds, else milliseconds
    return new Date(trimmed.length <= 10 ? n * 1000 : n);
  }
  // ISO string
  const d = new Date(trimmed);
  if (!isNaN(d)) return d;
  return null;
};

// ── Related Tools ──────────────────────────────────────────
const RELATED_TOOLS = [
  { name: 'JWT Decoder',       href: '/tools/jwt-decoder',       icon: '🔑', desc: 'Decode JWT tokens and inspect exp / iat timestamps' },
  { name: 'Word Counter',      href: '/tools/word-counter',      icon: '📝', desc: 'Count words and estimate reading time for your content' },
  { name: 'Hash Generator',    href: '/tools/hash-generator',    icon: '#️⃣', desc: 'Generate MD5, SHA-256 and other hashes from any text' },
];

// ── Component ──────────────────────────────────────────────
export default function TimestampTool() {
  const [input, setInput]         = useState('');
  const [date, setDate]           = useState(null);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState('');
  const [nowTs, setNowTs]         = useState(Date.now());
  const [selectedTz, setSelectedTz] = useState('UTC');
  const [activeTab, setActiveTab] = useState('convert');

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleInput = (val) => {
    setInput(val);
    if (!val.trim()) { setDate(null); setError(''); return; }
    const parsed = parseInput(val);
    if (parsed && !isNaN(parsed)) { setDate(parsed); setError(''); }
    else setError('Cannot parse try a Unix timestamp or ISO 8601 date string');
  };

  const useNow = useCallback(() => {
    const now = new Date();
    setDate(now);
    setInput(Math.floor(now.getTime() / 1000).toString());
    setError('');
  }, []);

  const copy = async (val, key) => {
    await navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyBtn = ({ value, id }) => (
    <button onClick={() => copy(value, id)}
      className={'text-xs font-bold px-2 py-1 rounded-lg transition-all flex-shrink-0 ' + (copied === id ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600')}>
      {copied === id ? '✓' : 'Copy'}
    </button>
  );

  const Row = ({ label, value, id }) => (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500 font-medium min-w-0 truncate">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-mono font-bold text-slate-800 text-right">{value}</span>
        <CopyBtn value={value} id={id} />
      </div>
    </div>
  );

  const nowDate     = new Date(nowTs);
  const unixNow     = Math.floor(nowTs / 1000);
  const msNow       = nowTs;

  // Derived from selected date
  const d = date || null;
  const unixSec  = d ? Math.floor(d.getTime() / 1000) : null;
  const unixMs   = d ? d.getTime() : null;
  const relative = d ? formatRelative(d) : null;

  // ── Epoch notable dates ──────────────────────────────────
  const NOTABLE = [
    { label: 'Unix Epoch (0)',        ts: 0,            desc: '1 Jan 1970 birth of Unix time' },
    { label: 'Y2K',                   ts: 946684800,    desc: '1 Jan 2000 00:00:00 UTC' },
    { label: 'Unix Trillion',         ts: 1000000000,   desc: '9 Sep 2001 first Unix billion' },
    { label: '2^31 Overflow',         ts: 2147483647,   desc: '19 Jan 2038 32-bit overflow day' },
    { label: 'Year 2038 Problem',     ts: 2147483648,   desc: 'First second after 32-bit overflow' },
    { label: 'Unix 2 Trillion',       ts: 2000000000,   desc: '18 May 2033' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-blue-50 border-b border-slate-100 py-14">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-sky-50 text-sky-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Free · Live Clock · No Signup
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Timestamp{' '}
            <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">Converter</span>
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Convert Unix timestamps to human-readable dates and back.
            Supports ISO 8601, milliseconds, multi-timezone display, relative time and date math.
          </p>

          {/* Live Clock Strip */}
          <div className="mt-8 inline-flex items-center gap-6 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex-wrap justify-center">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium mb-1">Unix (seconds)</div>
              <div className="text-xl font-extrabold font-mono text-sky-600">{unixNow.toLocaleString()}</div>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block" />
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium mb-1">UTC</div>
              <div className="text-sm font-bold font-mono text-slate-700">{nowDate.toUTCString()}</div>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-600 font-bold">LIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* AD 
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
      </div>
      */}

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ── INPUT CARD ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Input</div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Paste Unix timestamp (e.g. 1700000000) or ISO date (e.g. 2024-01-15T10:30:00Z)..."
                className={'w-full px-5 py-4 border rounded-2xl text-sm font-mono outline-none transition-all ' + (error ? 'border-rose-300 focus:border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-50')}
              />
              {error && <p className="text-xs text-rose-500 mt-1.5 font-medium">{error}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={useNow}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-3 rounded-2xl transition-all text-sm whitespace-nowrap">
                Use Now
              </button>
              <button onClick={() => { setInput(''); setDate(null); setError(''); }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-3 rounded-2xl transition-all text-sm">
                Clear
              </button>
            </div>
          </div>

          {/* Quick examples */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs text-slate-400 font-medium self-center">Try:</span>
            {[
              { label: 'Unix seconds', val: '1700000000' },
              { label: 'Unix ms', val: '1700000000000' },
              { label: 'ISO 8601', val: '2024-11-14T22:13:20Z' },
              { label: 'Date string', val: '2024-01-15 10:30:00' },
            ].map((ex) => (
              <button key={ex.val} onClick={() => handleInput(ex.val)}
                className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 font-medium px-2.5 py-1 rounded-lg transition-all border border-slate-200 hover:border-sky-300">
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── RESULTS ── */}
        {d && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit flex-wrap">
              {[
                { key: 'convert',   label: 'Formats'    },
                { key: 'timezones', label: 'Timezones'  },
                { key: 'dateinfo',  label: 'Date Info'  },
                { key: 'epoch',     label: 'Notable Epochs' },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={'px-4 py-2 rounded-xl text-xs font-bold transition-all ' + (activeTab === tab.key ? 'bg-sky-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ══ FORMATS ══ */}
            {activeTab === 'convert' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Unix / Numeric</div>
                  <Row label="Unix Timestamp (seconds)"  value={String(unixSec)}  id="unix-sec" />
                  <Row label="Unix Timestamp (ms)"       value={String(unixMs)}   id="unix-ms"  />
                  <Row label="Relative Time"             value={relative}         id="relative" />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ISO / Standard</div>
                  <Row label="ISO 8601 (UTC)"            value={formatISO(d)}                          id="iso"      />
                  <Row label="UTC String"                value={d.toUTCString()}                       id="utc"      />
                  <Row label="Local String"              value={d.toLocaleString()}                    id="local"    />
                  <Row label="Date Only"                 value={d.toISOString().split('T')[0]}         id="dateonly" />
                  <Row label="Time Only (UTC)"           value={d.toISOString().split('T')[1].replace('Z','')} id="timeonly" />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Developer Formats</div>
                  <Row label="RFC 2822"          value={d.toUTCString()}                     id="rfc"     />
                  <Row label="HTTP Date"         value={d.toUTCString()}                     id="http"    />
                  <Row label="JSON"              value={JSON.stringify(d)}                   id="json"    />
                  <Row label="SQL DateTime"      value={d.toISOString().replace('T',' ').replace('Z','')} id="sql" />
                  <Row label="JavaScript new Date()" value={'new Date(' + unixMs + ')'}      id="jsdate"  />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Locale Formats</div>
                  <Row label="US (MM/DD/YYYY)"   value={d.toLocaleDateString('en-US', { year:'numeric', month:'2-digit', day:'2-digit' })}      id="us"  />
                  <Row label="EU (DD/MM/YYYY)"   value={d.toLocaleDateString('en-GB', { year:'numeric', month:'2-digit', day:'2-digit' })}      id="eu"  />
                  <Row label="ISO Date"           value={d.toISOString().split('T')[0]}                                                          id="isodate" />
                  <Row label="Long (English)"     value={d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} id="long" />
                  <Row label="24h Time"           value={pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC'} id="24h" />
                </div>
              </div>
            )}

            {/* ══ TIMEZONES ══ */}
            {activeTab === 'timezones' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">World Clocks</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Highlight:</span>
                    <select value={selectedTz} onChange={(e) => setSelectedTz(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-sky-400 bg-slate-50 font-mono">
                      {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {TIMEZONES.map((tz) => {
                    const isSelected = tz === selectedTz;
                    const tzDate = formatDateTime(d, tz);
                    return (
                      <div key={tz}
                        className={'flex items-center justify-between px-4 py-3 rounded-xl border transition-all ' + (isSelected ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 border-slate-100')}>
                        <div>
                          <div className={'text-xs font-bold ' + (isSelected ? 'text-sky-700' : 'text-slate-600')}>{tz.replace('_',' ')}</div>
                          <div className={'text-xs font-mono mt-0.5 ' + (isSelected ? 'text-sky-800' : 'text-slate-500')}>{tzDate}</div>
                        </div>
                        <CopyBtn value={tzDate} id={'tz-' + tz} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ DATE INFO ══ */}
            {activeTab === 'dateinfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Date Components (UTC)</div>
                  <Row label="Year"           value={String(d.getUTCFullYear())}    id="year"    />
                  <Row label="Month"          value={pad(d.getUTCMonth() + 1) + ' ' + getMonthName(new Date(d.getUTCFullYear(), d.getUTCMonth(), 1))} id="month" />
                  <Row label="Day"            value={pad(d.getUTCDate()) + ' (' + getDayName(d) + ')'} id="day" />
                  <Row label="Hour"           value={pad(d.getUTCHours())}          id="hour"    />
                  <Row label="Minute"         value={pad(d.getUTCMinutes())}        id="min"     />
                  <Row label="Second"         value={pad(d.getUTCSeconds())}        id="sec"     />
                  <Row label="Millisecond"    value={String(d.getUTCMilliseconds())} id="ms"     />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Advanced Info</div>
                  <Row label="Day of Week"    value={getDayName(d) + ' (' + d.getUTCDay() + ')'} id="dow"    />
                  <Row label="Day of Year"    value={String(getDayOfYear(d))}       id="doy"    />
                  <Row label="Week Number"    value={'Week ' + getWeekNumber(d)}    id="weeknum" />
                  <Row label="Quarter"        value={'Q' + Math.ceil((d.getUTCMonth() + 1) / 3)} id="quarter" />
                  <Row label="Leap Year"      value={isLeapYear(d.getUTCFullYear()) ? 'Yes ✓' : 'No'} id="leap" />
                  <Row label="Days in Month"  value={String(new Date(d.getUTCFullYear(), d.getUTCMonth() + 1, 0).getDate())} id="dim" />
                </div>
              </div>
            )}

            {/* ══ NOTABLE EPOCHS ══ */}
            {activeTab === 'epoch' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Famous Unix Timestamps</div>
                <div className="flex flex-col gap-3">
                  {NOTABLE.map((n) => (
                    <div key={n.ts}
                      className="flex items-center justify-between gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-sky-200 hover:bg-sky-50 transition-all group flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm">{n.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{n.desc}</div>
                        <div className="text-xs font-mono text-sky-600 mt-1">{new Date(n.ts * 1000).toISOString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-700">{n.ts.toLocaleString()}</span>
                        <button onClick={() => handleInput(String(n.ts))}
                          className="text-xs bg-sky-100 hover:bg-sky-200 text-sky-700 font-bold px-2.5 py-1 rounded-lg transition-all">
                          Load
                        </button>
                        <CopyBtn value={String(n.ts)} id={'notable-' + n.ts} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!d && !error && (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-14 text-center">
            <div className="text-5xl mb-4">⏱️</div>
            <div className="text-slate-600 font-bold text-base mb-2">Enter a timestamp to convert</div>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Paste a Unix timestamp, ISO 8601 string or any date format above or click <strong>Use Now</strong> to convert the current time.
            </p>
            <button onClick={useNow}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 py-3 rounded-xl transition-all text-sm">
              Use Current Time
            </button>
          </div>
        )}

        {/* AD BOTTOM 
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728x90
        </div>
        */}

        {/* ── RELATED TOOLS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Other free developer tools you might find useful alongside the timestamp converter.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-sky-700 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free Unix Timestamp Converter</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans timestamp converter converts Unix timestamps (epoch time) to human-readable dates and back. Paste a Unix timestamp in seconds or milliseconds, or enter any ISO 8601 date string, and instantly see every format you need UTC, ISO, SQL, JavaScript, HTTP headers, locale formats and more.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The world clock panel shows your timestamp in all major timezones simultaneously ideal when coordinating across international teams. The date info tab breaks down day of week, week number, quarter, leap year status and days in the month. The notable epochs tab lets you explore famous timestamps like the Unix epoch (0), Y2K, the 2038 problem (2^31 overflow) and the first Unix billion.
          </p>
        </div>
      </div>
    </div>
  );
}