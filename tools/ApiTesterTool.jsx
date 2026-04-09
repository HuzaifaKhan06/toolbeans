'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ══════════════════════════════════════════════════════════
// ── CONSTANTS & HELPERS
// ══════════════════════════════════════════════════════════

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const METHOD_COLORS = {
  GET:     'text-emerald-600 bg-emerald-50 border-emerald-200',
  POST:    'text-blue-600    bg-blue-50    border-blue-200',
  PUT:     'text-amber-600   bg-amber-50   border-amber-200',
  PATCH:   'text-purple-600  bg-purple-50  border-purple-200',
  DELETE:  'text-rose-600    bg-rose-50    border-rose-200',
  HEAD:    'text-slate-600   bg-slate-50   border-slate-200',
  OPTIONS: 'text-teal-600    bg-teal-50    border-teal-200',
};

const STATUS_COLOR = (s) => {
  if (!s) return 'text-slate-400';
  if (s < 200) return 'text-blue-600';
  if (s < 300) return 'text-emerald-600';
  if (s < 400) return 'text-amber-600';
  if (s < 500) return 'text-rose-600';
  return 'text-red-700';
};

const STATUS_BG = (s) => {
  if (!s) return 'bg-slate-50 border-slate-200';
  if (s < 200) return 'bg-blue-50 border-blue-200';
  if (s < 300) return 'bg-emerald-50 border-emerald-200';
  if (s < 400) return 'bg-amber-50 border-amber-200';
  if (s < 500) return 'bg-rose-50 border-rose-200';
  return 'bg-red-50 border-red-200';
};

const STATUS_TEXT = (s) => {
  const map = {
    200:'OK', 201:'Created', 204:'No Content', 301:'Moved Permanently',
    302:'Found', 304:'Not Modified', 400:'Bad Request', 401:'Unauthorized',
    403:'Forbidden', 404:'Not Found', 405:'Method Not Allowed',
    408:'Request Timeout', 409:'Conflict', 422:'Unprocessable Entity',
    429:'Too Many Requests', 500:'Internal Server Error', 502:'Bad Gateway',
    503:'Service Unavailable', 504:'Gateway Timeout',
  };
  return map[s] || '';
};

const formatBytes = (b) => {
  if (b === 0) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
};

const formatMs = (ms) => ms >= 1000 ? (ms / 1000).toFixed(2) + 's' : ms + 'ms';

const genId = () => Math.random().toString(36).slice(2, 10);

const LS_HISTORY     = 'tb_api_history';
const LS_COLLECTIONS = 'tb_api_collections';
const LS_ENVIRON     = 'tb_api_env';

const safeLS = {
  get: (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

// ── Build URL with query params ────────────────────────────
const buildUrl = (base, params) => {
  const activeParams = params.filter((p) => p.enabled && p.key.trim());
  if (!activeParams.length) return base.trim();
  try {
    const url = new URL(base.trim().startsWith('http') ? base.trim() : 'https://' + base.trim());
    activeParams.forEach((p) => url.searchParams.set(p.key.trim(), p.value));
    return url.toString();
  } catch {
    const qs = activeParams.map((p) => encodeURIComponent(p.key) + '=' + encodeURIComponent(p.value)).join('&');
    return base.trim() + (base.includes('?') ? '&' : '?') + qs;
  }
};

// ── cURL Generator ─────────────────────────────────────────
const buildCurl = (method, url, headers, body, bodyType) => {
  const lines = ['curl -X ' + method + ' \\', '  "' + url + '"'];
  headers.filter((h) => h.enabled && h.key.trim()).forEach((h) => {
    lines.push('  -H "' + h.key.trim() + ': ' + h.value + '" \\');
  });
  if (body && bodyType === 'json') {
    lines.push('  -H "Content-Type: application/json" \\');
    lines.push("  -d '" + body.replace(/'/g, "'\"'\"'") + "'");
  } else if (body && bodyType === 'form') {
    lines.push('  -d "' + body + '"');
  } else if (body && bodyType === 'raw') {
    lines.push("  -d '" + body + "'");
  }
  return lines.join('\n').replace(/\\\n$/, '');
};

// ── JSON Tree Renderer ─────────────────────────────────────
const JsonNode = ({ data, depth = 0, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen || depth < 2);
  if (data === null)      return <span className="text-slate-400 font-mono text-xs">null</span>;
  if (data === undefined) return <span className="text-slate-400 font-mono text-xs">undefined</span>;
  if (typeof data === 'boolean') return <span className="text-pink-400 font-mono text-xs">{String(data)}</span>;
  if (typeof data === 'number')  return <span className="text-amber-400 font-mono text-xs">{data}</span>;
  if (typeof data === 'string')  return <span className="text-emerald-400 font-mono text-xs">&quot;{data}&quot;</span>;

  const isArr = Array.isArray(data);
  const entries = isArr ? data.map((v, i) => [i, v]) : Object.entries(data);
  const brackets = isArr ? ['[', ']'] : ['{', '}'];

  if (entries.length === 0) return <span className="text-slate-300 font-mono text-xs">{brackets[0]}{brackets[1]}</span>;

  return (
    <span className="font-mono text-xs">
      <button onClick={() => setOpen(!open)}
        className="text-slate-400 hover:text-slate-200 transition-colors mr-0.5 select-none">
        {open ? '▾' : '▸'}
      </button>
      <span className="text-slate-300">{brackets[0]}</span>
      {!open && (
        <span className="text-slate-500 cursor-pointer hover:text-slate-300" onClick={() => setOpen(true)}>
          {' '}{isArr ? entries.length + ' items' : entries.length + ' keys'}{' '}
        </span>
      )}
      {open && (
        <span className="block pl-4 border-l border-slate-700/50 ml-1">
          {entries.map(([k, v], i) => (
            <span key={k} className="block">
              {!isArr && <span className="text-sky-400">&quot;{k}&quot;</span>}
              {!isArr && <span className="text-slate-300">: </span>}
              <JsonNode data={v} depth={depth + 1} defaultOpen={depth < 1} />
              {i < entries.length - 1 && <span className="text-slate-500">,</span>}
            </span>
          ))}
        </span>
      )}
      {open && <span className="text-slate-300">{brackets[1]}</span>}
    </span>
  );
};

// ── Empty Row Helper ───────────────────────────────────────
const emptyRow = (enabled = true) => ({ id: genId(), key: '', value: '', enabled });

// ── Preset Examples ────────────────────────────────────────
const PRESETS = [
  {
    label: 'JSONPlaceholder Get Posts',
    method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [], params: [{ id: genId(), key: '_limit', value: '5', enabled: true }],
    body: '', bodyType: 'none', auth: 'none',
  },
  {
    label: 'JSONPlaceholder Get User',
    method: 'GET', url: 'https://jsonplaceholder.typicode.com/users/1',
    headers: [], params: [], body: '', bodyType: 'none', auth: 'none',
  },
  {
    label: 'JSONPlaceholder Create Post',
    method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts',
    headers: [{ id: genId(), key: 'Content-Type', value: 'application/json', enabled: true }],
    params: [],
    body: '{\n  "title": "Hello TOOLBeans",\n  "body": "Testing the API tester",\n  "userId": 1\n}',
    bodyType: 'json', auth: 'none',
  },
  {
    label: 'Open Meteo Weather (Free)',
    method: 'GET', url: 'https://api.open-meteo.com/v1/forecast',
    headers: [],
    params: [
      { id: genId(), key: 'latitude', value: '48.8566', enabled: true },
      { id: genId(), key: 'longitude', value: '2.3522', enabled: true },
      { id: genId(), key: 'current_weather', value: 'true', enabled: true },
    ],
    body: '', bodyType: 'none', auth: 'none',
  },
  {
    label: 'Cat Facts API',
    method: 'GET', url: 'https://catfact.ninja/fact',
    headers: [], params: [], body: '', bodyType: 'none', auth: 'none',
  },
  {
    label: 'Public IP Info',
    method: 'GET', url: 'https://ipinfo.io/json',
    headers: [], params: [], body: '', bodyType: 'none', auth: 'none',
  },
];

// ══════════════════════════════════════════════════════════
// ── RELATED TOOLS
// ══════════════════════════════════════════════════════════
const RELATED_TOOLS = [
  { name: 'JSON Formatter',    href: '/tools/json-formatter',    icon: '{ }', desc: 'Format, validate and explore API JSON responses'       },
  { name: 'JWT Decoder',       href: '/tools/jwt-decoder',       icon: '🔑',  desc: 'Decode and inspect JWT Bearer tokens from API auth'   },
  { name: 'Base64 Encoder',    href: '/tools/base64-encoder-decoder', icon: '🔄', desc: 'Encode credentials for Basic Auth headers'        },
  { name: 'URL Encoder',       href: '/tools/url-encoder-decoder',   icon: '🔗', desc: 'Encode or decode URL parameters and query strings' },
];

// ══════════════════════════════════════════════════════════
// ── MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function ApiTesterTool() {

  // ── Request State ──────────────────────────────────────
  const [method, setMethod]     = useState('GET');
  const [url, setUrl]           = useState('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const [params, setParams]     = useState([emptyRow()]);
  const [headers, setHeaders]   = useState([
    { id: genId(), key: 'Accept', value: 'application/json', enabled: true },
    emptyRow(true),
  ]);
  const [bodyType, setBodyType] = useState('none');
  const [body, setBody]         = useState('');
  const [authType, setAuthType] = useState('none');
  const [authValues, setAuthValues] = useState({ token: '', username: '', password: '', apiKeyName: 'X-API-Key', apiKeyVal: '' });

  // ── Response State ─────────────────────────────────────
  const [response, setResponse] = useState(null);   // { status, statusText, headers, body, bodyRaw, time, size, error }
  const [loading, setLoading]   = useState(false);
  const [resTab, setResTab]     = useState('body'); // body | headers | info | curl

  // ── UI State ───────────────────────────────────────────
  const [reqTab, setReqTab]     = useState('params'); // params | headers | body | auth
  const [bodyView, setBodyView] = useState('pretty'); // pretty | raw
  const [showCollections, setShowCollections] = useState(false);
  const [showHistory, setShowHistory]         = useState(false);
  const [copiedKey, setCopiedKey]             = useState('');

  // ── Persisted State ────────────────────────────────────
  const [history, setHistory]         = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [envVars, setEnvVars]         = useState([]);
  const [showEnv, setShowEnv]         = useState(false);

  const abortRef = useRef(null);

  // Load persisted data on mount
  useEffect(() => {
    setHistory(safeLS.get(LS_HISTORY, []));
    setCollections(safeLS.get(LS_COLLECTIONS, []));
    setEnvVars(safeLS.get(LS_ENVIRON, []));
  }, []);

  // ── Environment Variable Substitution ─────────────────
  const applyEnv = useCallback((str) => {
    let result = str;
    envVars.forEach(({ key, value }) => {
      if (key) result = result.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), value);
    });
    return result;
  }, [envVars]);

  // ── Copy Helper ────────────────────────────────────────
  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // ── Build Final Headers ────────────────────────────────
  const buildHeaders = useCallback(() => {
    const h = {};
    headers.filter((r) => r.enabled && r.key.trim()).forEach((r) => {
      h[applyEnv(r.key.trim())] = applyEnv(r.value);
    });
    // Auth
    if (authType === 'bearer' && authValues.token) {
      h['Authorization'] = 'Bearer ' + applyEnv(authValues.token);
    } else if (authType === 'basic' && authValues.username) {
      h['Authorization'] = 'Basic ' + btoa(applyEnv(authValues.username) + ':' + applyEnv(authValues.password));
    } else if (authType === 'apikey' && authValues.apiKeyName && authValues.apiKeyVal) {
      h[applyEnv(authValues.apiKeyName)] = applyEnv(authValues.apiKeyVal);
    }
    // Content-Type for body
    if (['POST','PUT','PATCH'].includes(method) && bodyType === 'json' && !h['Content-Type']) {
      h['Content-Type'] = 'application/json';
    } else if (['POST','PUT','PATCH'].includes(method) && bodyType === 'form' && !h['Content-Type']) {
      h['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return h;
  }, [headers, authType, authValues, method, bodyType, applyEnv]);

  // ── Send Request ───────────────────────────────────────
  const sendRequest = useCallback(async () => {
    const finalUrl = applyEnv(buildUrl(url, params));
    if (!finalUrl.trim() || !finalUrl.startsWith('http')) {
      setResponse({ error: 'Please enter a valid URL starting with http:// or https://' });
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setResponse(null);

    const start = performance.now();
    const finalHeaders = buildHeaders();

    let fetchBody = undefined;
    if (['POST','PUT','PATCH'].includes(method) && bodyType !== 'none' && body.trim()) {
      fetchBody = applyEnv(body);
    }

    try {
      const res = await fetch(finalUrl, {
        method,
        headers: finalHeaders,
        body: fetchBody,
        signal: abortRef.current.signal,
      });

      const elapsed = Math.round(performance.now() - start);
      const bodyText = await res.text();
      const size = new Blob([bodyText]).size;

      // Parse response headers
      const resHeaders = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      // Try JSON parse
      let parsedJson = null;
      let parseError = null;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('json') || bodyText.trim().startsWith('{') || bodyText.trim().startsWith('[')) {
        try { parsedJson = JSON.parse(bodyText); } catch (e) { parseError = e.message; }
      }

      const entry = {
        id: genId(), time: Date.now(), method, url: finalUrl,
        status: res.status, elapsed,
      };

      setResponse({
        status: res.status, statusText: res.statusText,
        headers: resHeaders, body: parsedJson, bodyRaw: bodyText,
        parseError, time: elapsed, size, ok: res.ok,
      });

      // Save to history
      const newHistory = [entry, ...history].slice(0, 25);
      setHistory(newHistory);
      safeLS.set(LS_HISTORY, newHistory);

      setResTab('body');
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      if (err.name === 'AbortError') {
        setResponse({ error: 'Request cancelled.' });
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('CORS')) {
        setResponse({
          error: 'CORS / Network Error',
          errorDetail: 'The browser blocked this request due to CORS policy, or the server is unreachable. This is common when testing third-party APIs directly from the browser.',
          isCors: true,
          time: elapsed,
        });
      } else {
        setResponse({ error: err.message, time: elapsed });
      }
    } finally {
      setLoading(false);
    }
  }, [url, method, params, body, bodyType, buildHeaders, applyEnv, history]);

  // ── Cancel Request ─────────────────────────────────────
  const cancelRequest = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
  };

  // ── Load Preset ────────────────────────────────────────
  const loadPreset = (preset) => {
    setMethod(preset.method);
    setUrl(preset.url);
    setParams(preset.params.length ? [...preset.params, emptyRow()] : [emptyRow()]);
    setHeaders(preset.headers.length ? [...preset.headers, emptyRow()] : [
      { id: genId(), key: 'Accept', value: 'application/json', enabled: true }, emptyRow(),
    ]);
    setBody(preset.body || '');
    setBodyType(preset.bodyType || 'none');
    setAuthType(preset.auth || 'none');
    setResponse(null);
    setReqTab(preset.params.length ? 'params' : preset.headers.length ? 'headers' : 'body');
  };

  // ── Save to Collection ─────────────────────────────────
  const saveToCollection = () => {
    const name = collectionName.trim() || (method + ' ' + url.slice(0, 40));
    const entry = {
      id: genId(), name, method, url,
      params: params.filter((p) => p.key),
      headers: headers.filter((h) => h.key),
      body, bodyType, authType, authValues,
    };
    const updated = [entry, ...collections].slice(0, 50);
    setCollections(updated);
    safeLS.set(LS_COLLECTIONS, updated);
    setCollectionName('');
  };

  // ── cURL Output ────────────────────────────────────────
  const curlOutput = buildCurl(method, buildUrl(url, params), headers, body, bodyType);

  // ── Param / Header Row Editor ──────────────────────────
  const RowEditor = ({ rows, setRows, addLabel }) => (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, i) => (
        <div key={row.id} className="flex items-center gap-1.5">
          <button onClick={() => setRows((prev) => prev.map((r, ri) => ri === i ? { ...r, enabled: !r.enabled } : r))}
            className={'w-5 h-5 rounded border flex-shrink-0 transition-colors ' + (row.enabled ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300')}>
            {row.enabled && <svg viewBox="0 0 12 12" className="w-3 h-3 m-auto text-white" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="2,6 5,9 10,3"/></svg>}
          </button>
          <input value={row.key} placeholder="Key"
  onChange={(e) => setRows((prev) => prev.map((r, ri) => ri === i ? { ...r, key: e.target.value } : r))}
  onBlur={(e) => { if (i === rows.length - 1 && e.target.value.trim()) setRows((prev) => [...prev, emptyRow()]); }}
  className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-700 rounded-lg outline-none focus:border-violet-500 bg-slate-800 text-slate-200 placeholder-slate-600 min-w-0" />
          <input value={row.value} placeholder="Value"
            onChange={(e) => setRows((prev) => prev.map((r, ri) => ri === i ? { ...r, value: e.target.value } : r))}
            className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-700 rounded-lg outline-none focus:border-violet-500 bg-slate-800 text-slate-200 placeholder-slate-600 min-w-0" />
          <button onClick={() => setRows((prev) => prev.filter((_, ri) => ri !== i || prev.length === 1))}
            className="w-6 h-6 text-slate-300 hover:text-rose-500 transition-colors flex-shrink-0 text-sm font-bold">
            ×
          </button>
        </div>
      ))}
      <button onClick={() => setRows((prev) => [...prev, emptyRow()])}
        className="text-xs text-violet-600 hover:text-violet-800 font-semibold w-fit mt-1 transition-colors">
        + Add {addLabel}
      </button>
    </div>
  );

  const activeParams  = params.filter((p)  => p.enabled && p.key.trim()).length;
  const activeHeaders = headers.filter((h) => h.enabled && h.key.trim()).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block bg-violet-900/50 text-violet-300 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-violet-700">
            Free · No Install · No Login
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            API{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Request Tester
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Test REST APIs directly in your browser. Send GET, POST, PUT, PATCH, DELETE requests with
            custom headers, query params, JSON body, auth tokens and see full responses instantly.
          </p>
          <div className="flex gap-2 justify-center mt-5 flex-wrap">
            {['All HTTP Methods', 'Auth Helper', 'JSON Tree View', 'cURL Export', 'Save Collections', 'Request History', 'Env Variables', 'Response Headers'].map((f) => (
              <span key={f} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-medium px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* AD 
      <div className="max-w-7xl mx-auto px-6 pt-5">
        <div className="w-full h-14 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-600 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>
          */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4">

        {/* ── PRESETS + COLLECTIONS BAR ── */}
        <div className="flex items-center gap-3 flex-wrap bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Presets:</span>
          <div className="flex gap-2 flex-wrap flex-1">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => loadPreset(p)}
                className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-600 text-slate-300 font-medium px-3 py-1.5 rounded-lg transition-all">
                <span className={'font-bold mr-1 ' + METHOD_COLORS[p.method].split(' ')[0]}>{p.method}</span>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowHistory(!showHistory); setShowCollections(false); }}
              className={'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ' + (showHistory ? 'bg-violet-700 border-violet-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-600')}>
              🕐 History {history.length > 0 && <span className="ml-1 bg-slate-700 px-1.5 rounded-full">{history.length}</span>}
            </button>
            <button onClick={() => { setShowCollections(!showCollections); setShowHistory(false); }}
              className={'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ' + (showCollections ? 'bg-violet-700 border-violet-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-600')}>
              📁 Saved {collections.length > 0 && <span className="ml-1 bg-slate-700 px-1.5 rounded-full">{collections.length}</span>}
            </button>
            <button onClick={() => { setShowEnv(!showEnv); setShowHistory(false); setShowCollections(false); }}
              className={'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ' + (showEnv ? 'bg-violet-700 border-violet-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-600')}>
              {'{ }'} Env
            </button>
          </div>
        </div>

        {/* ── HISTORY PANEL ── */}
        {showHistory && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Request History</span>
              <button onClick={() => { setHistory([]); safeLS.set(LS_HISTORY, []); }}
                className="text-xs text-rose-500 hover:text-rose-400 font-medium">Clear all</button>
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No requests yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg hover:bg-slate-750 cursor-pointer group"
                    onClick={() => { setMethod(h.method); setUrl(h.url); setShowHistory(false); }}>
                    <span className={'text-xs font-bold px-2 py-0.5 rounded border ' + (METHOD_COLORS[h.method] || 'text-slate-400')}>{h.method}</span>
                    <span className="text-xs font-mono text-slate-400 flex-1 truncate">{h.url}</span>
                    <span className={'text-xs font-bold ' + STATUS_COLOR(h.status)}>{h.status}</span>
                    <span className="text-xs text-slate-600">{formatMs(h.elapsed)}</span>
                    <span className="text-xs text-slate-600">{new Date(h.time).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COLLECTIONS PANEL ── */}
        {showCollections && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Requests</span>
              <div className="flex gap-2 ml-auto">
                <input value={collectionName} onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="Collection name (optional)..."
                  className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-violet-500 text-slate-300 w-48" />
                <button onClick={saveToCollection}
                  className="text-xs bg-violet-700 hover:bg-violet-600 text-white font-bold px-3 py-1.5 rounded-lg transition-all">
                  + Save Current
                </button>
              </div>
            </div>
            {collections.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No saved requests. Click &quot;Save Current&quot; to save this request.</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                {collections.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-2.5 bg-slate-800 rounded-lg group">
                    <span className={'text-xs font-bold px-2 py-0.5 rounded border ' + (METHOD_COLORS[c.method] || '')}>{c.method}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-300">{c.name}</div>
                      <div className="text-xs text-slate-500 font-mono truncate">{c.url}</div>
                    </div>
                    <button onClick={() => loadPreset(c)}
                      className="text-xs bg-violet-800 hover:bg-violet-700 text-violet-200 font-bold px-2.5 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      Load
                    </button>
                    <button onClick={() => { const u = collections.filter((x) => x.id !== c.id); setCollections(u); safeLS.set(LS_COLLECTIONS, u); }}
                      className="text-xs text-rose-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ENV VARIABLES ── */}
        {showEnv && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Environment Variables</span>
                <p className="text-xs text-slate-600 mt-0.5">Use {'{{variableName}}'} syntax in URL, headers and body. Stored in browser only.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {[...envVars, { id: genId(), key: '', value: '' }].map((v, i) => (
                <div key={v.id || i} className="flex gap-2">
                  <input value={v.key} placeholder="Variable name"
                    onChange={(e) => {
                      const next = [...envVars];
                      if (i >= next.length) next.push({ id: genId(), key: e.target.value, value: '' });
                      else next[i] = { ...next[i], key: e.target.value };
                      setEnvVars(next); safeLS.set(LS_ENVIRON, next);
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-violet-500 text-slate-300" />
                  <input value={v.value} placeholder="Value"
                    onChange={(e) => {
                      const next = [...envVars];
                      if (i >= next.length) next.push({ id: genId(), key: '', value: e.target.value });
                      else next[i] = { ...next[i], value: e.target.value };
                      setEnvVars(next); safeLS.set(LS_ENVIRON, next);
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-violet-500 text-slate-300" />
                  {i < envVars.length && (
                    <button onClick={() => { const n = envVars.filter((_, ei) => ei !== i); setEnvVars(n); safeLS.set(LS_ENVIRON, n); }}
                      className="text-rose-600 hover:text-rose-400 text-sm">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REQUEST BUILDER ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

          {/* URL Bar */}
          <div className="flex items-stretch gap-0 border-b border-slate-800">
            {/* Method */}
            <div className="relative flex-shrink-0">
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className={'text-sm font-extrabold px-4 py-4 bg-slate-800 border-r border-slate-700 outline-none cursor-pointer appearance-none pr-8 ' + METHOD_COLORS[method].split(' ')[0]}>
                {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">▾</span>
            </div>

            {/* URL Input */}
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              placeholder="https://api.example.com/v1/endpoint"
              className="flex-1 px-4 py-4 bg-transparent text-sm font-mono text-slate-200 outline-none placeholder-slate-600 min-w-0"
              spellCheck={false}
            />

            {/* Send button */}
            <button onClick={loading ? cancelRequest : sendRequest}
              className={'px-6 py-4 text-sm font-extrabold transition-all flex-shrink-0 ' + (loading ? 'bg-rose-700 hover:bg-rose-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white')}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Cancel
                </span>
              ) : 'Send ▶'}
            </button>
          </div>

          {/* Request Tabs */}
          <div className="flex gap-0 border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
            {[
              { key: 'params',  label: 'Params',  badge: activeParams  },
              { key: 'headers', label: 'Headers', badge: activeHeaders },
              { key: 'body',    label: 'Body',    badge: ['POST','PUT','PATCH'].includes(method) && bodyType !== 'none' ? 1 : 0 },
              { key: 'auth',    label: 'Auth',    badge: authType !== 'none' ? 1 : 0 },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setReqTab(tab.key)}
                className={'text-xs font-bold px-5 py-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ' + (reqTab === tab.key ? 'border-violet-500 text-violet-300 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300')}>
                {tab.label}
                {tab.badge > 0 && <span className="bg-violet-700 text-violet-200 text-xs px-1.5 rounded-full">{tab.badge}</span>}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 min-h-[160px]">

            {/* PARAMS */}
            {reqTab === 'params' && (
              <div>
                <p className="text-xs text-slate-600 mb-3">Query parameters appended to the URL. Use <code className="bg-slate-800 px-1 rounded text-violet-300">{'{{varName}}'}</code> for environment variables.</p>
                <RowEditor rows={params} setRows={setParams} addLabel="Parameter" />
                {activeParams > 0 && (
                  <div className="mt-3 bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-slate-500 font-mono break-all">{buildUrl(url, params)}</span>
                  </div>
                )}
              </div>
            )}

            {/* HEADERS */}
            {reqTab === 'headers' && (
              <div>
                <p className="text-xs text-slate-600 mb-3">Custom request headers. Auth headers are added automatically from the Auth tab.</p>
                <RowEditor rows={headers} setRows={setHeaders} addLabel="Header" />
              </div>
            )}

            {/* BODY */}
            {reqTab === 'body' && (
              <div>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {[
                    { key: 'none',      label: 'None'      },
                    { key: 'json',      label: 'JSON'      },
                    { key: 'form',      label: 'Form URL Encoded' },
                    { key: 'raw',       label: 'Raw Text'  },
                  ].map((bt) => (
                    <button key={bt.key} onClick={() => setBodyType(bt.key)}
                      className={'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ' + (bodyType === bt.key ? 'bg-violet-700 border-violet-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-600')}>
                      {bt.label}
                    </button>
                  ))}
                </div>
                {bodyType !== 'none' ? (
                  <>
                    {bodyType === 'json' && (
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {[
                          { label: '{}  Object',  val: '{\n  "key": "value"\n}' },
                          { label: '[]  Array',   val: '[\n  {"id": 1, "name": "Example"}\n]' },
                          { label: '🔑 Auth body', val: '{\n  "username": "user@example.com",\n  "password": "secret"\n}' },
                        ].map((t) => (
                          <button key={t.label} onClick={() => setBody(t.val)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 font-mono px-2.5 py-1 rounded-lg transition-all">
                            {t.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <textarea value={body} onChange={(e) => setBody(e.target.value)}
                      placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : bodyType === 'form' ? 'key1=value1&key2=value2' : 'Raw request body...'}
                      className="w-full h-36 px-4 py-3 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-violet-500 resize-none text-slate-300 leading-relaxed"
                      spellCheck={false}
                    />
                    {bodyType === 'json' && body && (
                      <p className="text-xs mt-1 font-medium">
                        {(() => { try { JSON.parse(body); return <span className="text-emerald-500">✓ Valid JSON</span>; } catch (e) { return <span className="text-rose-500">✗ Invalid JSON: {e.message}</span>; } })()}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-600 italic">No request body. Select JSON, Form or Raw to add a body.</p>
                )}
              </div>
            )}

            {/* AUTH */}
            {reqTab === 'auth' && (
              <div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[
                    { key: 'none',    label: 'No Auth'      },
                    { key: 'bearer',  label: 'Bearer Token' },
                    { key: 'basic',   label: 'Basic Auth'   },
                    { key: 'apikey',  label: 'API Key'      },
                  ].map((a) => (
                    <button key={a.key} onClick={() => setAuthType(a.key)}
                      className={'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ' + (authType === a.key ? 'bg-violet-700 border-violet-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-violet-600')}>
                      {a.label}
                    </button>
                  ))}
                </div>

                {authType === 'bearer' && (
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">Bearer Token</label>
                    <input value={authValues.token}
                      onChange={(e) => setAuthValues((v) => ({ ...v, token: e.target.value }))}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-violet-500 text-slate-300" />
                    <p className="text-xs text-slate-600 mt-1.5">Added as: Authorization: Bearer &lt;token&gt;</p>
                  </div>
                )}
                {authType === 'basic' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">Username</label>
                      <input value={authValues.username} onChange={(e) => setAuthValues((v) => ({ ...v, username: e.target.value }))}
                        placeholder="username" className="w-full px-3 py-2.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-violet-500 text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">Password</label>
                      <input type="password" value={authValues.password} onChange={(e) => setAuthValues((v) => ({ ...v, password: e.target.value }))}
                        placeholder="password" className="w-full px-3 py-2.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-violet-500 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-600 col-span-2">Encodes as: Authorization: Basic base64(username:password)</p>
                  </div>
                )}
                {authType === 'apikey' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">Header Name</label>
                      <input value={authValues.apiKeyName} onChange={(e) => setAuthValues((v) => ({ ...v, apiKeyName: e.target.value }))}
                        placeholder="X-API-Key" className="w-full px-3 py-2.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-violet-500 text-slate-300" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">API Key Value</label>
                      <input value={authValues.apiKeyVal} onChange={(e) => setAuthValues((v) => ({ ...v, apiKeyVal: e.target.value }))}
                        placeholder="sk-abc123..." className="w-full px-3 py-2.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-violet-500 text-slate-300" />
                    </div>
                  </div>
                )}
                {authType === 'none' && <p className="text-xs text-slate-600 italic">No authentication. Choose Bearer Token, Basic Auth or API Key above.</p>}
              </div>
            )}
          </div>
        </div>

        {/* ── RESPONSE PANEL ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

          {/* Response status bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/40 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response</span>
              {response && !response.error && (
                <div className={'flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold ' + STATUS_BG(response.status)}>
                  <span className={STATUS_COLOR(response.status)}>{response.status}</span>
                  <span className="text-slate-400">{STATUS_TEXT(response.status) || response.statusText}</span>
                </div>
              )}
              {response?.time && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  ⏱ <span className="font-mono font-bold text-slate-400">{formatMs(response.time)}</span>
                </span>
              )}
              {response?.size > 0 && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  📦 <span className="font-mono font-bold text-slate-400">{formatBytes(response.size)}</span>
                </span>
              )}
              {loading && (
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  Sending request...
                </span>
              )}
            </div>

            {/* Response tabs */}
            {(response || loading) && (
              <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
                {[
                  { key: 'body',    label: 'Body'    },
                  { key: 'headers', label: 'Headers' },
                  { key: 'curl',    label: 'cURL'    },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setResTab(tab.key)}
                    className={'text-xs font-bold px-3 py-1 rounded-lg transition-all ' + (resTab === tab.key ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300')}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Response Body */}
          <div className="min-h-[300px]">

            {/* Empty state */}
            {!response && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                <div className="text-4xl mb-3 opacity-50">📡</div>
                <div className="text-slate-400 font-bold mb-1">Ready to send</div>
                <p className="text-xs text-slate-600 max-w-sm">
                  Enter a URL above and click <strong className="text-slate-400">Send</strong> to make an API request.
                  Try one of the presets to get started instantly.
                </p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-10 h-10 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4" style={{ borderWidth: 3 }} />
                <div className="text-slate-400 text-sm font-bold">Sending request...</div>
                <div className="text-xs text-slate-600 mt-1 font-mono">{method} {url.slice(0, 60)}{url.length > 60 ? '...' : ''}</div>
              </div>
            )}

            {/* Error state */}
            {response?.error && !loading && (
              <div className="p-6">
                <div className="bg-rose-950/50 border border-rose-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">⚠️</span>
                    <span className="text-rose-300 font-extrabold text-sm">{response.error}</span>
                  </div>
                  {response.errorDetail && (
                    <p className="text-rose-400/80 text-xs leading-relaxed mb-4">{response.errorDetail}</p>
                  )}
                  {response.isCors && (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mt-3">
                      <p className="text-xs text-slate-400 font-bold mb-2">💡 Use this cURL command in your terminal instead:</p>
                      <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all">{curlOutput}</pre>
                      <button onClick={() => copy(curlOutput, 'curl-error')}
                        className={'text-xs font-bold mt-3 px-3 py-1.5 rounded-lg transition-all ' + (copiedKey === 'curl-error' ? 'bg-emerald-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300')}>
                        {copiedKey === 'curl-error' ? '✓ Copied!' : 'Copy cURL'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── BODY TAB ── */}
            {resTab === 'body' && response && !response.error && !loading && (
              <div>
                {/* Body view toggle */}
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800 bg-slate-900/50">
                  <div className="flex gap-1 bg-slate-800 p-0.5 rounded-lg">
                    {['pretty', 'raw'].map((v) => (
                      <button key={v} onClick={() => setBodyView(v)}
                        className={'text-xs font-bold px-2.5 py-1 rounded-md transition-all capitalize ' + (bodyView === v ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300')}>
                        {v}
                      </button>
                    ))}
                  </div>
                  {response.bodyRaw && (
                    <button onClick={() => copy(response.bodyRaw, 'res-body')}
                      className={'text-xs font-bold px-2.5 py-1 rounded-lg transition-all ml-auto ' + (copiedKey === 'res-body' ? 'bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400')}>
                      {copiedKey === 'res-body' ? '✓ Copied' : 'Copy Body'}
                    </button>
                  )}
                </div>

                <div className="p-5 max-h-[520px] overflow-auto">
                  {bodyView === 'pretty' && response.body !== null ? (
                    <div className="font-mono text-xs leading-relaxed">
                      <JsonNode data={response.body} defaultOpen={true} />
                    </div>
                  ) : (
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                      {response.bodyRaw || '(empty response body)'}
                    </pre>
                  )}
                  {response.parseError && bodyView === 'pretty' && (
                    <p className="text-xs text-amber-500 mt-2">⚠ Could not parse as JSON: {response.parseError}. Showing raw text.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── HEADERS TAB ── */}
            {resTab === 'headers' && response && !response.error && !loading && (
              <div className="p-5 max-h-[520px] overflow-auto">
                <div className="grid gap-1.5">
                  {Object.entries(response.headers || {}).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0">
                      <span className="text-xs font-mono font-bold text-sky-400 flex-shrink-0 min-w-40">{k}</span>
                      <span className="text-xs font-mono text-slate-400 break-all flex-1">{v}</span>
                      <button onClick={() => copy(v, 'h-' + k)}
                        className={'text-xs px-1.5 py-0.5 rounded transition-all flex-shrink-0 ' + (copiedKey === 'h-' + k ? 'bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-600')}>
                        {copiedKey === 'h-' + k ? '✓' : 'copy'}
                      </button>
                    </div>
                  ))}
                  {Object.keys(response.headers || {}).length === 0 && (
                    <p className="text-xs text-slate-600 italic">No response headers.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── cURL TAB ── */}
            {resTab === 'curl' && !loading && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-slate-500">Generated cURL command run this in your terminal to reproduce this request.</p>
                  <button onClick={() => copy(curlOutput, 'curl-main')}
                    className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' + (copiedKey === 'curl-main' ? 'bg-emerald-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300')}>
                    {copiedKey === 'curl-main' ? '✓ Copied!' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="text-xs font-mono text-emerald-400 bg-slate-800 border border-slate-700 rounded-xl p-4 whitespace-pre-wrap break-all leading-relaxed">
                  {curlOutput}
                </pre>
              </div>
            )}

            {/* Always show cURL when nothing else */}
            {!response && !loading && (
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between mb-2 mt-2">
                  <span className="text-xs text-slate-600 font-medium">cURL Preview</span>
                  <button onClick={() => copy(curlOutput, 'curl-preview')}
                    className={'text-xs font-bold px-2.5 py-1 rounded-lg transition-all ' + (copiedKey === 'curl-preview' ? 'bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-500')}>
                    {copiedKey === 'curl-preview' ? '✓' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-500 bg-slate-800/50 border border-slate-800 rounded-xl p-4 whitespace-pre-wrap break-all leading-relaxed">
                  {curlOutput}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* ── CORS INFO ── */}
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-5">
          <h3 className="text-sm font-extrabold text-amber-300 mb-2">⚠️ About Browser CORS Limitations</h3>
          <p className="text-xs text-amber-400/80 leading-relaxed mb-2">
            Browsers enforce CORS (Cross-Origin Resource Sharing) security policy which may block requests to APIs that don&apos;t explicitly allow browser access. If you see a CORS error, the API still works it just can&apos;t be called from a browser page.
          </p>
          <p className="text-xs text-amber-400/80 leading-relaxed">
            <strong className="text-amber-300">Solution:</strong> Use the generated cURL command in your terminal, or test APIs that support CORS (like JSONPlaceholder, Open-Meteo, etc.). APIs you control can add <code className="bg-amber-900/50 px-1 rounded font-mono">Access-Control-Allow-Origin: *</code> header to allow browser access.
          </p>
        </div>

        {/* ── SECURITY NOTICE ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-extrabold text-slate-300 mb-2">🔒 Privacy & Security</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All requests are sent directly from your browser to the target API no data passes through TOOLBeans servers. Saved collections and history are stored only in your browser&apos;s localStorage and never uploaded anywhere. Never enter production secrets, passwords or API keys you wouldn&apos;t share with the network between you and the target server.
          </p>
        </div>

        {/* AD BOTTOM 
        <div className="w-full h-14 bg-slate-900 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-600 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
            */}
        {/* ── RELATED TOOLS ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-extrabold text-slate-200 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-500 mb-4">Free tools that complement your API testing workflow.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-700 rounded-xl hover:border-violet-600 hover:bg-violet-950/30 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-300 group-hover:text-violet-300 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-200 mb-4">Free Online API Request Tester</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans API Request Tester lets you send HTTP requests to any REST API directly from your browser no installation, no Postman, no signup required. Test GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS requests with full control over query parameters, request headers, request body and authentication.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            The JSON tree view renders nested API responses as an interactive collapsible tree so you can explore large payloads easily. Response headers, status codes and response times are shown alongside the body. The cURL export generates a ready-to-run terminal command for every request so you can share or reproduce requests outside the browser.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Save frequently used API requests to your personal collection stored in browser localStorage, never uploaded. Environment variables let you define reusable values like base URLs and API keys using <code className="bg-slate-800 px-1 rounded font-mono text-xs">{'{{variableName}}'}</code> syntax across all your saved requests. Request history automatically tracks your last 25 requests with method, URL, status and response time.
          </p>
        </div>
      </div>
    </div>
  );
}