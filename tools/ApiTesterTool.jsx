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

// ── JSON Tree Renderer (now supports search highlighting) ──
const JsonNode = ({ data, depth = 0, defaultOpen = true, searchTerm = '' }) => {
  const term = (searchTerm || '').toLowerCase();
  const [open, setOpen] = useState(defaultOpen || depth < 2);

  // auto-open nodes when searching so matches are visible
  useEffect(() => { if (term) setOpen(true); }, [term]);

  const highlight = (text) => {
    if (!term) return text;
    const str = String(text);
    const idx = str.toLowerCase().indexOf(term);
    if (idx === -1) return text;
    return (
      <>
        {str.slice(0, idx)}
        <span className="bg-amber-400/30 text-amber-200 rounded px-0.5">{str.slice(idx, idx + term.length)}</span>
        {str.slice(idx + term.length)}
      </>
    );
  };

  if (data === null)      return <span className="text-slate-400 font-mono text-xs">null</span>;
  if (data === undefined) return <span className="text-slate-400 font-mono text-xs">undefined</span>;
  if (typeof data === 'boolean') return <span className="text-pink-400 font-mono text-xs">{String(data)}</span>;
  if (typeof data === 'number')  return <span className="text-amber-400 font-mono text-xs">{highlight(data)}</span>;
  if (typeof data === 'string')  return <span className="text-emerald-400 font-mono text-xs">&quot;{highlight(data)}&quot;</span>;

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
              {!isArr && <span className="text-sky-400">&quot;{highlight(k)}&quot;</span>}
              {!isArr && <span className="text-slate-300">: </span>}
              <JsonNode data={v} depth={depth + 1} defaultOpen={depth < 1} searchTerm={searchTerm} />
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
  const [bodySearch, setBodySearch]           = useState(''); // NEW: response body search

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
    setBodySearch(''); // reset search on new request

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

  // ── Download Response Body (NEW) ───────────────────────
  const downloadResponse = () => {
    if (!response || response.error) return;
    const text = response.bodyRaw || '';
    const isJson = response.body !== null;
    const blob = new Blob([text], { type: isJson ? 'application/json' : 'text/plain' });
    const dlUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = dlUrl;
    a.download = 'api-response' + (isJson ? '.json' : '.txt');
    a.click();
    URL.revokeObjectURL(dlUrl);
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

  // ── Response header search filter (NEW) ────────────────
  const filteredHeaderEntries = response && response.headers
    ? Object.entries(response.headers).filter(([k, v]) =>
        !bodySearch || (k + ' ' + v).toLowerCase().includes(bodySearch.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Breadcrumb for SEO + navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-5">
            <a href="/" className="hover:text-slate-300">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-300">Tools</a>
            <span>/</span>
            <span className="text-slate-400">API Request Tester</span>
          </nav>
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
            {['All HTTP Methods', 'Auth Helper', 'JSON Tree View', 'Response Search', 'cURL Export', 'Save Collections', 'Request History', 'Env Variables'].map((f) => (
              <span key={f} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 font-medium px-3 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </section>

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
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) sendRequest(); }}
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
                {/* Body view toggle + SEARCH (NEW) */}
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800 bg-slate-900/50 flex-wrap">
                  <div className="flex gap-1 bg-slate-800 p-0.5 rounded-lg">
                    {['pretty', 'raw'].map((v) => (
                      <button key={v} onClick={() => setBodyView(v)}
                        className={'text-xs font-bold px-2.5 py-1 rounded-md transition-all capitalize ' + (bodyView === v ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300')}>
                        {v}
                      </button>
                    ))}
                  </div>

                  {/* NEW: response search box */}
                  <div className="relative flex-1 min-w-[160px] max-w-xs">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">🔍</span>
                    <input
                      value={bodySearch}
                      onChange={(e) => setBodySearch(e.target.value)}
                      placeholder="Search keys & values..."
                      className="w-full pl-7 pr-7 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-violet-500 text-slate-300 placeholder-slate-600"
                    />
                    {bodySearch && (
                      <button onClick={() => setBodySearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">×</button>
                    )}
                  </div>

                  <div className="flex gap-2 ml-auto">
                    {response.bodyRaw && (
                      <button onClick={downloadResponse}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all bg-slate-800 hover:bg-slate-700 text-slate-400">
                        ⬇ Download
                      </button>
                    )}
                    {response.bodyRaw && (
                      <button onClick={() => copy(response.bodyRaw, 'res-body')}
                        className={'text-xs font-bold px-2.5 py-1 rounded-lg transition-all ' + (copiedKey === 'res-body' ? 'bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400')}>
                        {copiedKey === 'res-body' ? '✓ Copied' : 'Copy Body'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 max-h-[520px] overflow-auto">
                  {bodyView === 'pretty' && response.body !== null ? (
                    <div className="font-mono text-xs leading-relaxed">
                      <JsonNode data={response.body} defaultOpen={true} searchTerm={bodySearch} />
                    </div>
                  ) : (
                    <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
                      {bodySearch
                        ? (response.bodyRaw || '').split('\n').filter((line) => line.toLowerCase().includes(bodySearch.toLowerCase())).join('\n') || '(no lines match your search)'
                        : (response.bodyRaw || '(empty response body)')}
                    </pre>
                  )}
                  {response.parseError && bodyView === 'pretty' && (
                    <p className="text-xs text-amber-500 mt-2">⚠ Could not parse as JSON: {response.parseError}. Showing raw text.</p>
                  )}
                </div>
              </div>
            )}

            {/* ── HEADERS TAB (now searchable) ── */}
            {resTab === 'headers' && response && !response.error && !loading && (
              <div>
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800 bg-slate-900/50">
                  <div className="relative flex-1 min-w-[160px] max-w-xs">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">🔍</span>
                    <input
                      value={bodySearch}
                      onChange={(e) => setBodySearch(e.target.value)}
                      placeholder="Search headers..."
                      className="w-full pl-7 pr-7 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-violet-500 text-slate-300 placeholder-slate-600"
                    />
                    {bodySearch && (
                      <button onClick={() => setBodySearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs">×</button>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 ml-auto">{filteredHeaderEntries.length} header{filteredHeaderEntries.length === 1 ? '' : 's'}</span>
                </div>
                <div className="p-5 max-h-[520px] overflow-auto">
                  <div className="grid gap-1.5">
                    {filteredHeaderEntries.map(([k, v]) => (
                      <div key={k} className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0">
                        <span className="text-xs font-mono font-bold text-sky-400 flex-shrink-0 min-w-40">{k}</span>
                        <span className="text-xs font-mono text-slate-400 break-all flex-1">{v}</span>
                        <button onClick={() => copy(v, 'h-' + k)}
                          className={'text-xs px-1.5 py-0.5 rounded transition-all flex-shrink-0 ' + (copiedKey === 'h-' + k ? 'bg-emerald-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-600')}>
                          {copiedKey === 'h-' + k ? '✓' : 'copy'}
                        </button>
                      </div>
                    ))}
                    {filteredHeaderEntries.length === 0 && (
                      <p className="text-xs text-slate-600 italic">{bodySearch ? 'No headers match your search.' : 'No response headers.'}</p>
                    )}
                  </div>
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

        {/* ════════════════════════════════════════════════ */}
        {/* ── EXPANDED SEO / EDUCATIONAL CONTENT (AdSense)  ── */}
        {/* ════════════════════════════════════════════════ */}

        {/* What is it / intro */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-2xl font-extrabold text-slate-100 mb-4">Free Online API Request Tester  Test REST APIs Without Postman</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            The TOOLBeans API Request Tester is a free, browser-based HTTP client that lets you send requests to any REST API and inspect the response without installing software, creating an account, or paying for a subscription. It is built for developers, QA engineers, students and anyone who needs to quickly check whether an API endpoint behaves the way they expect. Because it runs entirely in your browser, there is nothing to download and nothing to configure  you open the page, type a URL, and click Send.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            Traditional API clients like Postman, Insomnia or Thunder Client are powerful, but they require installation, take up disk space, and increasingly push you toward signing in and syncing your data to the cloud. For the most common day-to-day task  &quot;send a request and look at the JSON that comes back&quot;  that is far more friction than necessary. This tool strips the workflow down to its essentials while still supporting the features that matter: every HTTP method, authentication, custom headers, query parameters, request bodies, a searchable JSON response viewer, cURL export, saved collections and environment variables.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Everything happens client-side. Your requests go directly from your browser to the API you are testing, and your saved requests and history live only in your browser&apos;s local storage. Nothing is ever uploaded to TOOLBeans servers, which means you can test internal or sensitive endpoints with confidence that the request and its data are not passing through a third party.
          </p>
        </article>

        {/* How to use */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-5">How to Test an API Request  Step by Step</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['1', 'Choose a method and enter the URL', 'Pick the HTTP method (GET to read data, POST to create, PUT or PATCH to update, DELETE to remove) from the dropdown, then paste your endpoint URL into the address bar. You can type a bare domain and the tool adds https:// automatically.'],
              ['2', 'Add query parameters or headers', 'Open the Params tab to append key-value query parameters to the URL, or the Headers tab to send custom headers such as Accept or Content-Type. A live preview shows the final URL as you type, and each row can be toggled on or off without deleting it.'],
              ['3', 'Set authentication if required', 'In the Auth tab, choose Bearer Token for JWT or OAuth tokens, Basic Auth for username and password (automatically base64-encoded), or API Key to send a key in a custom header. The correct Authorization header is built for you.'],
              ['4', 'Add a request body for writes', 'For POST, PUT and PATCH requests, open the Body tab and choose JSON, form-url-encoded or raw text. The JSON editor validates your syntax in real time and shows a green check when the body is valid.'],
              ['5', 'Send and read the response', 'Click Send, or press Enter in the URL bar. The response appears with its status code, response time and size. Explore nested JSON in the collapsible tree view, search keys and values, switch to raw view, or copy and download the body.'],
              ['6', 'Save, reuse and export', 'Save the request to a collection for later, let history track recent calls automatically, define environment variables like {{baseUrl}} for reuse, and export any request as a ready-to-run cURL command for your terminal or documentation.'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">{n}</div>
                <div>
                  <div className="text-sm font-bold text-slate-200 mb-1">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Why use / benefits */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-5">Why Use a Browser-Based API Tester?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['⚡', 'Zero setup', 'No download, no install, no account. Open the page and start testing in seconds. Perfect for quick checks where launching a heavy desktop app would be overkill.'],
              ['🔒', 'Private by design', 'Requests go straight from your browser to the API. Collections and history stay in local storage. Nothing touches our servers, so sensitive endpoints stay sensitive.'],
              ['🌳', 'Readable responses', 'The collapsible JSON tree makes deeply nested API payloads easy to navigate, and the built-in search jumps straight to the key or value you need in a large response.'],
              ['🔁', 'Reproducible', 'One-click cURL export turns any request into a terminal command you can paste into scripts, share with teammates, or drop into documentation and bug reports.'],
              ['💾', 'Reusable', 'Save frequently used requests to collections and define environment variables once, then reuse them across every request with {{variable}} syntax.'],
              ['💸', 'Completely free', 'No paid tiers, no request limits, no watermark. Every feature is available to everyone, forever, with no sign-up required.'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-sm font-bold text-slate-200 mb-1">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* HTTP methods explainer */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-3">Understanding HTTP Methods</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            REST APIs use HTTP methods (also called verbs) to describe what action you want to perform on a resource. Choosing the right method is the first step in testing any endpoint correctly.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-300">Method</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-300">Purpose</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-300">Has body?</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-300">Idempotent?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[
                  ['GET', 'Retrieve data from a resource without changing it', 'No', 'Yes'],
                  ['POST', 'Create a new resource or submit data', 'Yes', 'No'],
                  ['PUT', 'Replace a resource entirely with new data', 'Yes', 'Yes'],
                  ['PATCH', 'Update part of an existing resource', 'Yes', 'No'],
                  ['DELETE', 'Remove a resource', 'Sometimes', 'Yes'],
                  ['HEAD', 'Like GET but returns only headers, no body', 'No', 'Yes'],
                  ['OPTIONS', 'Discover which methods and headers an endpoint allows', 'No', 'Yes'],
                ].map(([m, purpose, hasBody, idem]) => (
                  <tr key={m} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3"><span className={'font-bold ' + (METHOD_COLORS[m] ? METHOD_COLORS[m].split(' ')[0] : 'text-slate-300')}>{m}</span></td>
                    <td className="px-4 py-3 text-slate-400">{purpose}</td>
                    <td className="px-4 py-3 text-slate-500">{hasBody}</td>
                    <td className="px-4 py-3 text-slate-500">{idem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Status codes reference */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-3">HTTP Status Code Quick Reference</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            When you send a request, the API replies with a three-digit status code that tells you what happened. The first digit defines the category. Knowing these makes debugging far faster.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['2xx  Success', 'text-emerald-400', [['200 OK', 'Request succeeded'], ['201 Created', 'New resource was created'], ['204 No Content', 'Success with no response body']]],
              ['3xx  Redirection', 'text-amber-400', [['301 Moved Permanently', 'Resource has a new permanent URL'], ['302 Found', 'Temporary redirect'], ['304 Not Modified', 'Cached version is still valid']]],
              ['4xx  Client Error', 'text-rose-400', [['400 Bad Request', 'The request was malformed'], ['401 Unauthorized', 'Authentication is required or failed'], ['403 Forbidden', 'Authenticated but not allowed'], ['404 Not Found', 'The resource does not exist'], ['429 Too Many Requests', 'Rate limit exceeded']]],
              ['5xx  Server Error', 'text-red-400', [['500 Internal Server Error', 'Something broke on the server'], ['502 Bad Gateway', 'Invalid response from upstream'], ['503 Service Unavailable', 'Server is overloaded or down']]],
            ].map(([cat, color, rows]) => (
              <div key={cat} className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <div className={'text-sm font-extrabold mb-3 ' + color}>{cat}</div>
                <div className="flex flex-col gap-2">
                  {rows.map(([code, meaning]) => (
                    <div key={code} className="flex items-start gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300 min-w-[150px] flex-shrink-0">{code}</span>
                      <span className="text-xs text-slate-500">{meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Authentication explainer */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-3">API Authentication Types Explained</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            Most real-world APIs require some form of authentication to prove who you are. This tool supports the three most common methods and builds the correct header for you automatically.
          </p>
          <div className="flex flex-col gap-4">
            {[
              ['Bearer Token', 'The most common method for modern APIs. You send a token (often a JWT) in the Authorization header as "Bearer <token>". The server validates the token to identify you. Used by OAuth 2.0, Firebase, Auth0 and most SaaS APIs. Paste your token in the Auth tab and the header is added automatically.'],
              ['Basic Authentication', 'A username and password are combined and base64-encoded into the Authorization header as "Basic <encoded>". Simple, but should only be used over HTTPS since base64 is encoding, not encryption. Common for internal tools, legacy systems and some webhooks.'],
              ['API Key', 'A single secret string identifies your application. It can be sent in a custom header (like X-API-Key) or as a query parameter. Common for weather, maps and data APIs. This tool lets you place the key in any header name you choose.'],
            ].map(([title, desc]) => (
              <div key={title} className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <div className="text-sm font-bold text-violet-300 mb-1">{title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Use cases */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-5">Common Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ['Frontend development', 'Check the exact shape of the JSON an endpoint returns before wiring it into your React, Vue or Angular components.'],
              ['Backend debugging', 'Confirm your own API returns the right status codes, headers and body for each method while you build it.'],
              ['Learning APIs', 'Students and beginners can experiment with public APIs and see real requests and responses without any setup.'],
              ['QA and testing', 'Manually verify endpoints, reproduce bugs, and export cURL commands to attach to bug reports.'],
              ['Third-party integration', 'Explore an external API (payment, weather, maps, AI) and confirm your auth and parameters work before coding.'],
              ['Documentation', 'Generate cURL examples for your API docs, or verify that documented endpoints behave as described.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-violet-400 text-lg flex-shrink-0">▸</span>
                <div>
                  <div className="text-sm font-bold text-slate-200 mb-0.5">{title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* FAQ  expanded */}
        <article className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <h2 className="text-xl font-extrabold text-slate-100 mb-5">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Is this API tester completely free?', 'Yes. The TOOLBeans API Request Tester is 100% free with no usage limits, no account, no signup and no credit card. Every feature, including all HTTP methods, authentication, collections, environment variables, search and cURL export, is available to everyone.'],
              ['Do I need to install anything or create an account?', 'No. The tool runs entirely in your web browser. There is nothing to download or install, and no sign-up is required. Just open the page and start sending requests.'],
              ['Is it a good free alternative to Postman?', 'For the most common API testing needs, sending requests with any method, authentication, headers, bodies, saving requests and exporting cURL, yes. It covers the everyday workflow without the install, account or sync that desktop clients now require. For advanced team features like automated test scripts, mock servers and shared workspaces, a dedicated desktop client may still be preferable.'],
              ['Does the API tester support authentication?', 'Yes. It supports Bearer Token authentication (for JWT and OAuth), HTTP Basic Auth with username and password, and API Key authentication in either a custom header or query parameter. The correct Authorization header is generated automatically.'],
              ['Can I search inside a large JSON response?', 'Yes. The response Body tab has a search box that highlights matching keys and values in the JSON tree and automatically expands the nodes that contain them. In raw view the search filters to only the lines that match, and the Headers tab is searchable too.'],
              ['Can I save and reuse API requests?', 'Yes. Save any request to a named collection and reload it any time. Request history also records your last 25 requests automatically with method, URL, status and response time, all stored in your browser.'],
              ['What are environment variables for?', 'Environment variables let you define reusable values such as a base URL or API key once, then reference them anywhere in the URL, headers or body using {{variableName}} syntax. This makes it easy to switch between, for example, a development and production server without editing every field.'],
              ['Can I export my request as a cURL command?', 'Yes. Every request can be exported as a cURL command with one click, including method, headers and body. This is ideal for running the same request in a terminal, adding it to a shell script, sharing it with a teammate, or pasting it into documentation or a bug report.'],
              ['Why do I get a CORS or network error?', 'Browsers enforce CORS, a security policy that lets a server decide which websites may call it from a browser. If the API you are testing does not send permissive CORS headers, the browser blocks the response even though the API itself is working. When this happens, use the generated cURL command in your terminal, which is not subject to CORS, or test an API that allows cross-origin requests.'],
              ['Is my data safe and where are my requests sent?', 'Your requests go directly from your browser to the target API and never pass through TOOLBeans servers. Saved collections, history and environment variables are stored only in your browser local storage and are never uploaded. That said, avoid entering real production secrets on any shared computer.'],
              ['Does it support GraphQL?', 'You can test GraphQL endpoints by sending a POST request with a JSON body containing your query, since GraphQL runs over HTTP. The tool does not yet have a dedicated GraphQL query builder, but the raw request workflow works for most GraphQL testing.'],
              ['Which HTTP methods are supported?', 'All of them: GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS. Request bodies are available for POST, PUT and PATCH.'],
            ].map(([q, a], i) => (
              <details key={i} className="bg-slate-800/50 border border-slate-800 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer font-bold text-sm text-slate-200 list-none flex items-center justify-between">
                  {q}<span className="text-violet-400 text-lg ml-3 flex-shrink-0">+</span>
                </summary>
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-800 pt-3">{a}</div>
              </details>
            ))}
          </div>
        </article>

      </div>
    </div>
  );
}