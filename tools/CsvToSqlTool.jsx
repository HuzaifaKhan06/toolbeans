'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ── Load SheetJS dynamically ───────────────────────────────
const loadSheetJS = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.XLSX) { resolve(window.XLSX); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Failed to load SheetJS'));
    document.head.appendChild(script);
  });
};

// ── File type config ───────────────────────────────────────
const FILE_TYPE_CONFIG = {
  csv: {
    icon: '📄',
    label: 'CSV',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  tsv: {
    icon: '📋',
    label: 'TSV',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-700',
  },
  xlsx: {
    icon: '📊',
    label: 'Excel',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-400',
    badge: 'bg-green-100 text-green-700',
  },
  xls: {
    icon: '📊',
    label: 'Excel',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-400',
    badge: 'bg-green-100 text-green-700',
  },
  txt: {
    icon: '📝',
    label: 'TXT',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    badge: 'bg-slate-100 text-slate-700',
  },
};

// ── CSV Parser ─────────────────────────────────────────────
const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [], error: 'File must have at least a header row and one data row.' };

  const firstLine = lines[0];
  const delimiters = [',', ';', '\t', '|'];
  const delimiter = delimiters.reduce((best, d) => {
    const count = (firstLine.match(new RegExp('\\' + d === '\\|' ? '\\|' : d === '\t' ? '\t' : d, 'g')) || []).length;
    return count > (best.count || 0) ? { char: d, count } : best;
  }, { char: ',', count: 0 }).char;

  const parseRow = (line) => {
    const result = [];
    let inQuote = false, cell = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cell += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === delimiter && !inQuote) {
        result.push(cell.trim()); cell = '';
      } else {
        cell += ch;
      }
    }
    result.push(cell.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/['"]/g, '').trim());
  if (headers.some((h) => !h)) return { headers: [], rows: [], error: 'Empty column headers detected. Please check your file.' };

  const dupCheck = new Set();
  for (const h of headers) {
    if (dupCheck.has(h.toLowerCase())) return { headers: [], rows: [], error: 'Duplicate column name detected: "' + h + '". All column names must be unique.' };
    dupCheck.add(h.toLowerCase());
  }

  const rows = [];
  const parseErrors = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const row = parseRow(lines[i]);
    if (row.length !== headers.length) {
      parseErrors.push('Row ' + i + ': expected ' + headers.length + ' columns, got ' + row.length);
      if (parseErrors.length > 3) break;
    }
    rows.push(row);
  }

  return { headers, rows, error: null, warnings: parseErrors, delimiter };
};

// ── Type Detection ─────────────────────────────────────────
const detectType = (values, dialect) => {
  const nonEmpty = values.filter((v) => v !== '' && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return dialect === 'postgresql' ? 'TEXT' : 'VARCHAR(255)';

  const isInt    = nonEmpty.every((v) => /^-?\d+$/.test(v));
  const isFloat  = nonEmpty.every((v) => /^-?\d+(\.\d+)?$/.test(v));
  const isBool   = nonEmpty.every((v) => /^(true|false|0|1|yes|no)$/i.test(v));
  const isDate   = nonEmpty.every((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) || /^\d{2}\/\d{2}\/\d{4}$/.test(v));
  const isDateTime = nonEmpty.every((v) => /^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}/.test(v));
  const maxLen   = Math.max(...nonEmpty.map((v) => v.length));

  if (dialect === 'mysql' || dialect === 'mariadb') {
    if (isBool)     return 'TINYINT(1)';
    if (isInt)      return parseInt(nonEmpty[0]) > 2147483647 ? 'BIGINT' : 'INT';
    if (isFloat)    return 'DECIMAL(10,2)';
    if (isDateTime) return 'DATETIME';
    if (isDate)     return 'DATE';
    return maxLen > 255 ? 'TEXT' : 'VARCHAR(' + Math.min(255, Math.max(50, maxLen + 20)) + ')';
  }
  if (dialect === 'postgresql') {
    if (isBool)     return 'BOOLEAN';
    if (isInt)      return parseInt(nonEmpty[0]) > 2147483647 ? 'BIGINT' : 'INTEGER';
    if (isFloat)    return 'NUMERIC(10,2)';
    if (isDateTime) return 'TIMESTAMP';
    if (isDate)     return 'DATE';
    return maxLen > 255 ? 'TEXT' : 'VARCHAR(' + Math.min(255, Math.max(50, maxLen + 20)) + ')';
  }
  if (dialect === 'sqlite') {
    if (isBool || isInt)  return 'INTEGER';
    if (isFloat)          return 'REAL';
    if (isDate || isDateTime) return 'TEXT';
    return 'TEXT';
  }
  if (dialect === 'sqlserver') {
    if (isBool)     return 'BIT';
    if (isInt)      return parseInt(nonEmpty[0]) > 2147483647 ? 'BIGINT' : 'INT';
    if (isFloat)    return 'DECIMAL(10,2)';
    if (isDateTime) return 'DATETIME2';
    if (isDate)     return 'DATE';
    return maxLen > 255 ? 'NVARCHAR(MAX)' : 'NVARCHAR(' + Math.min(255, Math.max(50, maxLen + 20)) + ')';
  }
  if (dialect === 'oracle') {
    if (isBool || isInt)  return 'NUMBER(10)';
    if (isFloat)          return 'NUMBER(10,2)';
    if (isDateTime)       return 'TIMESTAMP';
    if (isDate)           return 'DATE';
    return maxLen > 255 ? 'CLOB' : 'VARCHAR2(' + Math.min(255, Math.max(50, maxLen + 20)) + ')';
  }
  if (isBool)     return 'BOOLEAN';
  if (isInt)      return 'INTEGER';
  if (isFloat)    return 'DECIMAL(10,2)';
  if (isDate || isDateTime) return 'DATE';
  return 'VARCHAR(255)';
};

// ── Identifier Quoting ─────────────────────────────────────
const quoteIdent = (name, dialect) => {
  const safe = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
  if (dialect === 'mysql' || dialect === 'mariadb') return '`' + safe + '`';
  if (dialect === 'sqlserver') return '[' + safe + ']';
  return '"' + safe + '"';
};

// ── Value Escaping ─────────────────────────────────────────
const escapeVal = (val, type, dialect) => {
  if (val === '' || val === null || val === undefined) return 'NULL';
  const t = type.toUpperCase();
  if (/^(INT|INTEGER|BIGINT|DECIMAL|NUMERIC|REAL|FLOAT|DOUBLE|NUMBER|TINYINT|BIT)/.test(t)) {
    const n = parseFloat(val);
    return isNaN(n) ? 'NULL' : String(n);
  }
  if (t === 'BOOLEAN') {
    if (/^(true|yes|1)$/i.test(val)) return dialect === 'postgresql' ? 'TRUE' : '1';
    return dialect === 'postgresql' ? 'FALSE' : '0';
  }
  const escaped = val.replace(/'/g, "''").replace(/\\/g, '\\\\');
  return "'" + escaped + "'";
};

// ── SQL Generator ──────────────────────────────────────────
const generateSQL = ({ headers, rows, tableName, dialect, includeCreate, includeDrop, insertMode, batchSize, includeTransaction, addPrimaryKey, nullEmpty }) => {
  const safeName  = tableName.trim() || 'my_table';
  const tbl       = quoteIdent(safeName, dialect);
  const colTypes  = headers.map((h, i) => detectType(rows.map((r) => r[i] || ''), dialect));
  const parts     = [];

  const aiKeyword = {
    mysql: 'INT AUTO_INCREMENT PRIMARY KEY',
    mariadb: 'INT AUTO_INCREMENT PRIMARY KEY',
    postgresql: 'SERIAL PRIMARY KEY',
    sqlite: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    sqlserver: 'INT IDENTITY(1,1) PRIMARY KEY',
    oracle: 'NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY',
  }[dialect] || 'INT AUTO_INCREMENT PRIMARY KEY';

  if (includeDrop) {
    if (dialect === 'sqlserver')  parts.push('IF OBJECT_ID(' + "'" + safeName + "'" + ', ' + "'U') IS NOT NULL DROP TABLE " + tbl + ';');
    else if (dialect === 'oracle') parts.push('BEGIN\n  EXECUTE IMMEDIATE ' + "'DROP TABLE " + safeName + "'" + ';\n  EXCEPTION WHEN OTHERS THEN NULL;\nEND;\n/');
    else parts.push('DROP TABLE IF EXISTS ' + tbl + ';');
    parts.push('');
  }

  if (includeCreate) {
    const cols = [];
    if (addPrimaryKey) cols.push('  ' + quoteIdent('id', dialect) + ' ' + aiKeyword);
    headers.forEach((h, i) => {
      const col  = quoteIdent(h, dialect);
      const type = colTypes[i];
      const nullable = nullEmpty ? ' DEFAULT NULL' : '';
      cols.push('  ' + col + ' ' + type + nullable);
    });
    parts.push('CREATE TABLE ' + tbl + ' (');
    parts.push(cols.join(',\n'));
    parts.push(');');
    parts.push('');
  }

  if (includeTransaction) {
    parts.push(dialect === 'sqlserver' ? 'BEGIN TRANSACTION;' : 'BEGIN;');
    parts.push('');
  }

  const colList = '(' + headers.map((h) => quoteIdent(h, dialect)).join(', ') + ')';

  if (insertMode === 'single') {
    rows.forEach((row) => {
      const vals = row.map((v, i) => escapeVal(nullEmpty && v === '' ? '' : v, colTypes[i], dialect)).join(', ');
      parts.push('INSERT INTO ' + tbl + ' ' + colList + ' VALUES (' + vals + ');');
    });
  } else if (insertMode === 'batch') {
    const size = Math.max(1, batchSize || 100);
    for (let start = 0; start < rows.length; start += size) {
      const chunk = rows.slice(start, start + size);
      if (dialect === 'oracle') {
        parts.push('INSERT ALL');
        chunk.forEach((row) => {
          const vals = row.map((v, i) => escapeVal(v, colTypes[i], dialect)).join(', ');
          parts.push('  INTO ' + tbl + ' ' + colList + ' VALUES (' + vals + ')');
        });
        parts.push('SELECT 1 FROM DUAL;');
      } else {
        const valRows = chunk.map((row) => '  (' + row.map((v, i) => escapeVal(v, colTypes[i], dialect)).join(', ') + ')');
        parts.push('INSERT INTO ' + tbl + ' ' + colList + ' VALUES');
        parts.push(valRows.join(',\n') + ';');
      }
      parts.push('');
    }
  } else if (insertMode === 'upsert') {
    if (dialect === 'mysql' || dialect === 'mariadb') {
      rows.forEach((row) => {
        const vals = row.map((v, i) => escapeVal(v, colTypes[i], dialect)).join(', ');
        const updates = headers.map((h, i) => quoteIdent(h, dialect) + ' = VALUES(' + quoteIdent(h, dialect) + ')').join(', ');
        parts.push('INSERT INTO ' + tbl + ' ' + colList + ' VALUES (' + vals + ')');
        parts.push('  ON DUPLICATE KEY UPDATE ' + updates + ';');
      });
    } else if (dialect === 'postgresql') {
      rows.forEach((row) => {
        const vals = row.map((v, i) => escapeVal(v, colTypes[i], dialect)).join(', ');
        const firstCol = quoteIdent(headers[0], dialect);
        const updates = headers.slice(1).map((h) => quoteIdent(h, dialect) + ' = EXCLUDED.' + quoteIdent(h, dialect)).join(', ');
        parts.push('INSERT INTO ' + tbl + ' ' + colList + ' VALUES (' + vals + ')');
        parts.push('  ON CONFLICT (' + firstCol + ') DO UPDATE SET ' + updates + ';');
      });
    } else if (dialect === 'sqlite') {
      rows.forEach((row) => {
        const vals = row.map((v, i) => escapeVal(v, colTypes[i], dialect)).join(', ');
        parts.push('INSERT OR REPLACE INTO ' + tbl + ' ' + colList + ' VALUES (' + vals + ');');
      });
    } else if (dialect === 'sqlserver') {
      rows.forEach((row) => {
        const vals = row.map((v, i) => escapeVal(v, colTypes[i], dialect)).join(', ');
        parts.push('MERGE ' + tbl + ' AS target USING (VALUES (' + vals + ')) AS source ' + colList);
        parts.push('  ON target.' + quoteIdent(headers[0], dialect) + ' = source.' + quoteIdent(headers[0], dialect));
        const updates = headers.slice(1).map((h) => 'target.' + quoteIdent(h, dialect) + ' = source.' + quoteIdent(h, dialect)).join(', ');
        parts.push('  WHEN MATCHED THEN UPDATE SET ' + updates);
        const ins = headers.map((h) => 'source.' + quoteIdent(h, dialect)).join(', ');
        parts.push('  WHEN NOT MATCHED THEN INSERT ' + colList + ' VALUES (' + ins + ');');
      });
    } else {
      rows.forEach((row) => {
        const vals = row.map((v, i) => escapeVal(v, colTypes[i], dialect)).join(', ');
        parts.push('INSERT INTO ' + tbl + ' ' + colList + ' VALUES (' + vals + ');');
      });
    }
  }

  if (includeTransaction) {
    parts.push('');
    parts.push('COMMIT;');
  }

  return parts.join('\n');
};

// ── Dialect config ─────────────────────────────────────────
const DIALECTS = [
  { key: 'mysql',      label: 'MySQL',       icon: '🐬', color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-200' },
  { key: 'postgresql', label: 'PostgreSQL',  icon: '🐘', color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200'   },
  { key: 'sqlite',     label: 'SQLite',      icon: '🪶', color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-300'  },
  { key: 'sqlserver',  label: 'SQL Server',  icon: '🪟', color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200'    },
  { key: 'mariadb',    label: 'MariaDB',     icon: '🦭', color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-200'   },
  { key: 'oracle',     label: 'Oracle',      icon: '🔴', color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200'   },
];

const INSERT_MODES = [
  { key: 'single', label: 'Single INSERT',  desc: 'One INSERT per row — safest, most compatible' },
  { key: 'batch',  label: 'Batch INSERT',   desc: 'Multiple rows per INSERT — faster for large data' },
  { key: 'upsert', label: 'Upsert / Merge', desc: 'Insert or update if key exists (dialect-specific)' },
];

const RELATED_TOOLS = [
  { name: 'SQL Formatter',      href: '/tools/sql-formatter',      icon: '🗄️', desc: 'Format and beautify your generated SQL queries' },
  { name: 'JSON Formatter',     href: '/tools/json-formatter',     icon: '{ }', desc: 'Format, validate and explore JSON data' },
  { name: 'Hash Generator',     href: '/tools/hash-generator',     icon: '#️⃣', desc: 'Generate MD5, SHA-256 hashes for data verification' },
  { name: 'Base64 Encoder',     href: '/tools/base64-encoder-decoder', icon: '🔄', desc: 'Encode binary data to Base64 strings' },
];

const SAMPLE_CSV = `name,email,age,salary,is_active,created_at
Alice Johnson,alice@example.com,28,75000.00,true,2024-01-15
Bob Smith,bob@example.com,34,92500.50,true,2024-02-20
Carol White,carol@example.com,45,110000.00,false,2023-11-10
David Lee,david@example.com,29,68000.75,true,2024-03-05
Eva Martinez,eva@example.com,38,88500.00,true,2024-01-28`;

// ── Main Component ─────────────────────────────────────────
export default function CsvToSqlTool() {
  const [inputMode, setInputMode]       = useState('paste');
  const [rawText, setRawText]           = useState('');
  const [fileName, setFileName]         = useState('');
  const [fileType, setFileType]         = useState('');   // 'csv' | 'tsv' | 'xlsx' | 'xls' | 'txt'
  const [fileSize, setFileSize]         = useState(0);
  const [parsed, setParsed]             = useState(null);
  const [parseError, setParseError]     = useState('');
  const [isLoading, setIsLoading]       = useState(false);

  const [tableName, setTableName]       = useState('my_table');
  const [dialect, setDialect]           = useState('mysql');
  const [insertMode, setInsertMode]     = useState('batch');
  const [batchSize, setBatchSize]       = useState(100);
  const [includeCreate, setCreate]      = useState(true);
  const [includeDrop, setDrop]          = useState(false);
  const [includeTransaction, setTxn]    = useState(true);
  const [addPrimaryKey, setPK]          = useState(true);
  const [nullEmpty, setNullEmpty]       = useState(true);

  const [sql, setSql]                   = useState('');
  const [generated, setGenerated]       = useState(false);
  const [activeTab, setActiveTab]       = useState('output');
  const [copied, setCopied]             = useState(false);
  const [isDragging, setIsDragging]     = useState(false);

  const fileRef = useRef(null);

  const processText = useCallback((text, name = '') => {
    if (!text.trim()) { setParsed(null); setParseError(''); return; }
    const result = parseCSV(text);
    if (result.error) { setParseError(result.error); setParsed(null); }
    else { setParsed(result); setParseError(''); if (name) setFileName(name); }
  }, []);

  // ── FIXED: Excel handler using dynamically loaded SheetJS ─
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    setFileType(ext);
    setFileSize(file.size);
    setIsLoading(true);
    setParseError('');
    setParsed(null);

    const baseName = file.name.replace(/\.[^.]+$/, '');
    const safeTableName = baseName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() || 'my_table';

    try {
      if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
        const text = await file.text();
        setRawText(text);
        processText(text, baseName);
        setTableName(safeTableName);

      } else if (ext === 'xlsx' || ext === 'xls') {
        // Dynamically load SheetJS, then parse
        const XLSX = await loadSheetJS();
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

        // Use first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to CSV with proper date formatting
        const csvText = XLSX.utils.sheet_to_csv(worksheet, { dateNF: 'yyyy-mm-dd' });

        if (!csvText || csvText.trim() === '') {
          setParseError('The Excel file appears to be empty. Please check the file and try again.');
          setIsLoading(false);
          return;
        }

        setRawText(csvText);
        processText(csvText, baseName);
        setTableName(safeTableName);

      } else {
        setParseError('Unsupported file type ".' + ext + '". Please upload a .csv, .tsv, .txt, .xlsx, or .xls file.');
      }
    } catch (err) {
      console.error('File parse error:', err);
      if (ext === 'xlsx' || ext === 'xls') {
        setParseError('Could not read the Excel file. Make sure the file is not corrupted or password-protected. You can also try: File → Save As → CSV in Excel.');
      } else {
        setParseError('Could not read the file: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [processText]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setInputMode('upload'); handleFile(file); }
  }, [handleFile]);

  const handleGenerate = () => {
    if (!parsed || parsed.rows.length === 0) return;
    const result = generateSQL({
      headers: parsed.headers,
      rows: parsed.rows,
      tableName, dialect, includeCreate, includeDrop,
      insertMode, batchSize, includeTransaction, addPrimaryKey, nullEmpty,
    });
    setSql(result);
    setGenerated(true);
    setActiveTab('output');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!sql) return;
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!sql) return;
    const blob = new Blob([sql], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = (tableName || 'export') + '-' + dialect + '.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setRawText(SAMPLE_CSV);
    processText(SAMPLE_CSV);
    setTableName('users');
    setInputMode('paste');
    setFileType('');
    setFileName('');
  };

  const reset = () => {
    setRawText(''); setParsed(null); setParseError(''); setFileName('');
    setFileType(''); setFileSize(0);
    setSql(''); setGenerated(false); setTableName('my_table');
    if (fileRef.current) fileRef.current.value = '';
  };

  const formatBytes = (b) => {
    if (b > 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
    if (b > 1024) return (b / 1024).toFixed(1) + ' KB';
    return b + ' B';
  };

  const selectedDialect = DIALECTS.find((d) => d.key === dialect);
  const colTypes = parsed ? parsed.headers.map((h, i) => detectType(parsed.rows.map((r) => r[i] || ''), dialect)) : [];
  const sqlLines   = sql ? sql.split('\n').length : 0;
  const sqlBytes   = sql ? new Blob([sql]).size : 0;
  const ftConfig   = fileType ? FILE_TYPE_CONFIG[fileType] : null;
  const hasFile    = !!fileName && inputMode === 'upload';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 border-b border-slate-100 py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-emerald-200">
            CSV · Excel · TSV → SQL — Free & Private
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            CSV &amp; Excel to{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              SQL Converter
            </span>
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Convert CSV, TSV or Excel files into SQL INSERT statements for MySQL, PostgreSQL, SQLite, SQL Server, MariaDB and Oracle.
            Auto-detects column types, supports batch inserts, upserts and transactions. Runs 100% in your browser — no data leaves your device.
          </p>
          <div className="flex gap-2 justify-center mt-6 flex-wrap">
            {DIALECTS.map((d) => (
              <button key={d.key} onClick={() => setDialect(d.key)}
                className={'text-xs font-bold px-3 py-1.5 rounded-full border transition-all ' + (dialect === d.key ? d.bg + ' ' + d.color + ' ' + d.border + ' shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300')}>
                {d.icon} {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AD TOP */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ── LEFT PANEL ── */}
          <div className="flex flex-col gap-5">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Data</div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {[{ key: 'paste', label: '✏️ Paste' }, { key: 'upload', label: '📁 Upload' }].map((m) => (
                    <button key={m.key} onClick={() => setInputMode(m.key)}
                      className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' + (inputMode === m.key ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700')}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paste Mode */}
              {inputMode === 'paste' && (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button onClick={loadSample}
                      className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200 hover:border-emerald-300">
                      Load Sample CSV
                    </button>
                    <button onClick={reset}
                      className="text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all border border-slate-200 hover:border-rose-300">
                      Clear
                    </button>
                  </div>
                  <textarea
                    value={rawText}
                    onChange={(e) => { setRawText(e.target.value); processText(e.target.value); }}
                    placeholder={'Paste your CSV or TSV data here...\n\nExample:\nname,email,age\nAlice,alice@example.com,28\nBob,bob@example.com,34'}
                    className="w-full h-52 px-4 py-3 text-xs font-mono border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 resize-none bg-slate-50 text-slate-700 leading-relaxed transition-all"
                  />
                </div>
              )}

              {/* Upload Mode */}
              {inputMode === 'upload' && (
                <div>
                  {/* ── UPLOAD DROP ZONE ── */}
                  {!hasFile ? (
                    /* Empty state — no file uploaded yet */
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      className={'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ' + (isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40')}>
                      <div className="text-4xl mb-3">{isDragging ? '📂' : '📁'}</div>
                      <div className="font-bold text-slate-700 text-sm mb-1">Drop your file here or click to browse</div>
                      <div className="text-xs text-slate-400 mb-3">Supports .csv, .tsv, .txt, .xlsx, .xls</div>
                      {/* Format badges */}
                      <div className="flex gap-2 justify-center flex-wrap">
                        {[
                          { ext: 'CSV',  icon: '📄', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                          { ext: 'TSV',  icon: '📋', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
                          { ext: 'XLSX', icon: '📊', bg: 'bg-green-50 text-green-700 border-green-200' },
                          { ext: 'XLS',  icon: '📊', bg: 'bg-green-50 text-green-700 border-green-200' },
                          { ext: 'TXT',  icon: '📝', bg: 'bg-slate-50 text-slate-600 border-slate-200' },
                        ].map((f) => (
                          <span key={f.ext} className={'text-xs font-bold px-2.5 py-1 rounded-full border ' + f.bg}>
                            {f.icon} {f.ext}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* ── FILE UPLOADED STATE — rich dialog box ── */
                    <div className={'border-2 rounded-2xl overflow-hidden transition-all ' + (ftConfig ? ftConfig.border : 'border-emerald-300')}>
                      {/* Header strip */}
                      <div className={'px-5 py-3 flex items-center justify-between ' + (ftConfig ? ftConfig.bg : 'bg-emerald-50')}>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl leading-none">
                            {ftConfig ? ftConfig.icon : '📄'}
                          </div>
                          <div>
                            <div className={'text-xs font-bold uppercase tracking-widest ' + (ftConfig ? ftConfig.color : 'text-emerald-700')}>
                              {ftConfig ? ftConfig.label + ' File' : 'File'} Uploaded
                            </div>
                            <div className="text-xs text-slate-500 font-medium mt-0.5 max-w-52 truncate">{fileName}</div>
                          </div>
                        </div>
                        <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + (ftConfig ? ftConfig.badge : 'bg-emerald-100 text-emerald-700')}>
                          .{fileType?.toUpperCase()}
                        </span>
                      </div>

                      {/* Stats row */}
                      {parsed && !parseError && (
                        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-emerald-500 font-bold text-sm">✓</span>
                            <span className="font-bold text-slate-700">{parsed.rows.length.toLocaleString()} rows</span>
                          </div>
                          <div className="w-px h-4 bg-slate-200" />
                          <div className="text-xs text-slate-500">
                            <span className="font-bold text-slate-700">{parsed.headers.length}</span> columns
                          </div>
                          <div className="w-px h-4 bg-slate-200" />
                          <div className="text-xs text-slate-500">{formatBytes(fileSize)}</div>
                          {fileType === 'xlsx' || fileType === 'xls' ? (
                            <>
                              <div className="w-px h-4 bg-slate-200" />
                              <div className="text-xs text-green-700 font-semibold">✓ Excel parsed</div>
                            </>
                          ) : null}
                        </div>
                      )}

                      {/* Loading state */}
                      {isLoading && (
                        <div className="px-5 py-4 bg-white border-t border-slate-100 flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-slate-500">
                            {fileType === 'xlsx' || fileType === 'xls' ? 'Reading Excel file...' : 'Parsing file...'}
                          </span>
                        </div>
                      )}

                      {/* Column names preview */}
                      {parsed && !parseError && parsed.headers.length > 0 && (
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                          <div className="text-xs text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">Columns detected</div>
                          <div className="flex gap-1.5 flex-wrap">
                            {parsed.headers.slice(0, 8).map((h, i) => (
                              <span key={i} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                                {h}
                              </span>
                            ))}
                            {parsed.headers.length > 8 && (
                              <span className="text-xs text-slate-400 px-2 py-0.5">+{parsed.headers.length - 8} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action row */}
                      <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => { fileRef.current?.click(); }}
                          className="text-xs text-slate-500 hover:text-emerald-600 font-semibold transition-colors flex items-center gap-1">
                          🔄 Replace file
                        </button>
                        <button onClick={reset}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors flex items-center gap-1">
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  )}

                  <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                  {/* Excel tip — only show when no file uploaded */}
                  {!hasFile && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                      <span className="text-amber-500 text-sm flex-shrink-0">💡</span>
                      <p className="text-xs text-amber-700">
                        <strong>Excel tip:</strong> Upload .xlsx or .xls files directly — they are fully supported. For best results, ensure the first row contains column headers.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Parse error */}
              {parseError && (
                <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-2">
                  <span className="text-rose-500 text-sm flex-shrink-0">⚠️</span>
                  <p className="text-xs text-rose-700 font-medium">{parseError}</p>
                </div>
              )}

              {/* Parse success banner — paste mode only */}
              {inputMode === 'paste' && parsed && !parseError && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span className="text-xs font-bold text-emerald-700">
                      Parsed: {parsed.rows.length.toLocaleString()} rows × {parsed.headers.length} columns
                    </span>
                    {parsed.delimiter && parsed.delimiter !== ',' && (
                      <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-mono">
                        delimiter: {parsed.delimiter === '\t' ? 'TAB' : parsed.delimiter}
                      </span>
                    )}
                  </div>
                  {parsed.warnings?.length > 0 && (
                    <span className="text-xs text-amber-600 font-medium">⚠️ {parsed.warnings.length} row warning(s)</span>
                  )}
                </div>
              )}
            </div>

            {/* Options Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Conversion Options</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Table Name</label>
                  <input type="text" value={tableName}
                    onChange={(e) => setTableName(e.target.value.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase())}
                    placeholder="my_table"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-emerald-400 transition-all bg-slate-50" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">SQL Dialect</label>
                  <select value={dialect} onChange={(e) => setDialect(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 transition-all bg-slate-50">
                    {DIALECTS.map((d) => (
                      <option key={d.key} value={d.key}>{d.icon} {d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Insert Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {INSERT_MODES.map((m) => (
                      <button key={m.key} onClick={() => setInsertMode(m.key)}
                        className={'text-left px-3 py-2.5 border rounded-xl transition-all ' + (insertMode === m.key ? 'bg-emerald-50 border-emerald-300 ' : 'bg-slate-50 border-slate-200 hover:border-slate-300')}>
                        <div className={'text-xs font-bold ' + (insertMode === m.key ? 'text-emerald-700' : 'text-slate-700')}>{m.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-tight">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {insertMode === 'batch' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rows per Batch</label>
                    <input type="number" value={batchSize} min="1" max="1000"
                      onChange={(e) => setBatchSize(Math.max(1, Math.min(1000, parseInt(e.target.value) || 100)))}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-emerald-400 transition-all bg-slate-50" />
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { val: includeCreate, set: setCreate,  label: 'CREATE TABLE',      desc: 'Include schema'         },
                  { val: includeDrop,   set: setDrop,    label: 'DROP IF EXISTS',     desc: 'Drop before create'     },
                  { val: includeTransaction, set: setTxn, label: 'Transaction',       desc: 'Wrap in BEGIN/COMMIT'   },
                  { val: addPrimaryKey, set: setPK,      label: 'Auto Primary Key',   desc: 'Add auto-increment id'  },
                  { val: nullEmpty,     set: setNullEmpty, label: 'NULL for empty',   desc: 'Empty cells → NULL'     },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all">
                    <div onClick={() => opt.set(!opt.val)}
                      className={'w-9 h-5 rounded-full transition-all flex items-center px-0.5 cursor-pointer flex-shrink-0 ' + (opt.val ? 'bg-emerald-500' : 'bg-slate-200')}>
                      <div className={'w-4 h-4 bg-white rounded-full shadow-sm transition-all ' + (opt.val ? 'translate-x-4' : 'translate-x-0')} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">{opt.label}</div>
                      <div className="text-xs text-slate-400">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button onClick={handleGenerate}
                disabled={!parsed || parsed.rows.length === 0}
                className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-extrabold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-200 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm">
                {parsed ? '⚡ Generate SQL — ' + parsed.rows.length.toLocaleString() + ' rows → ' + selectedDialect?.label : '⚡ Generate SQL'}
              </button>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex flex-col gap-4">

            {(generated || parsed) && (
              <div className="flex gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
                {[
                  { key: 'output',  label: '🗄️ SQL Output',    show: generated },
                  { key: 'preview', label: '👁️ Data Preview',   show: !!parsed  },
                  { key: 'schema',  label: '📋 Column Schema',  show: !!parsed  },
                ].filter((t) => t.show).map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={'flex-1 py-2 rounded-xl text-xs font-bold transition-all ' + (activeTab === tab.key ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')}>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'output' && generated && sql && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={'text-xs font-bold px-2.5 py-1 rounded-full border ' + selectedDialect?.bg + ' ' + selectedDialect?.color + ' ' + selectedDialect?.border}>
                      {selectedDialect?.icon} {selectedDialect?.label}
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>{sqlLines.toLocaleString()} lines</span>
                      <span>{formatBytes(sqlBytes)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy}
                      className={'text-xs font-bold px-4 py-2 rounded-xl transition-all ' + (copied ? 'bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white')}>
                      {copied ? '✓ Copied!' : 'Copy SQL'}
                    </button>
                    <button onClick={handleDownload}
                      className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-all">
                      ↓ .sql
                    </button>
                  </div>
                </div>
                <pre className="text-xs font-mono text-slate-700 p-5 overflow-auto max-h-[520px] leading-relaxed whitespace-pre-wrap break-words">
                  {sql}
                </pre>
              </div>
            )}

            {activeTab === 'preview' && parsed && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Preview</span>
                  <span className="text-xs text-slate-400">Showing first 20 of {parsed.rows.length.toLocaleString()} rows</span>
                </div>
                <div className="overflow-auto max-h-[520px]">
                  <table className="w-full text-xs border-collapse min-w-max">
                    <thead>
                      <tr className="bg-slate-50 sticky top-0">
                        <th className="px-3 py-2 text-left text-slate-400 font-bold border-b border-r border-slate-200 text-xs w-10">#</th>
                        {parsed.headers.map((h, i) => (
                          <th key={i} className="px-3 py-2 text-left text-slate-600 font-bold border-b border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                            {h}
                            <div className="font-mono font-normal text-emerald-600 text-xs">{colTypes[i]}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.rows.slice(0, 20).map((row, ri) => (
                        <tr key={ri} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                          <td className="px-3 py-1.5 text-slate-300 font-mono border-r border-slate-100 text-right">{ri + 1}</td>
                          {parsed.headers.map((_, ci) => (
                            <td key={ci} className="px-3 py-1.5 text-slate-600 border-r border-slate-100 last:border-0 max-w-48 truncate">
                              {row[ci] === '' || row[ci] === undefined
                                ? <span className="text-slate-300 italic">NULL</span>
                                : row[ci]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'schema' && parsed && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detected Column Schema</span>
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full border ' + selectedDialect?.bg + ' ' + selectedDialect?.color + ' ' + selectedDialect?.border}>
                    {selectedDialect?.icon} {selectedDialect?.label}
                  </span>
                </div>
                <div className="p-5">
                  {addPrimaryKey && (
                    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded">PK</span>
                        <span className="text-xs font-mono font-bold text-slate-700">id</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-600 font-bold">
                        {dialect === 'postgresql' ? 'SERIAL' : dialect === 'sqlite' ? 'INTEGER' : 'INT AUTO_INCREMENT'}
                      </span>
                    </div>
                  )}
                  {parsed.headers.map((h, i) => {
                    const sampleVals = parsed.rows.slice(0, 5).map((r) => r[i]).filter(Boolean);
                    const nullCount  = parsed.rows.filter((r) => !r[i]).length;
                    return (
                      <div key={i} className="flex items-start justify-between py-2.5 border-b border-slate-100 last:border-0 gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-800">{h}</span>
                            {nullCount > 0 && (
                              <span className="text-xs text-slate-400">{nullCount} NULL{nullCount > 1 ? 's' : ''}</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate">
                            e.g. {sampleVals.slice(0, 3).join(' · ') || '—'}
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex-shrink-0">
                          {colTypes[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!generated && !parsed && (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center flex-1">
                <div className="text-5xl mb-4">🗄️</div>
                <div className="text-slate-600 font-bold text-base mb-2">Ready to convert</div>
                <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                  Paste or upload your CSV / Excel data, configure the options, then click Generate SQL.
                </p>
                <button onClick={loadSample}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  Try Sample Data
                </button>
              </div>
            )}

            {parsed && !generated && activeTab === 'output' && (
              <div className="bg-white border border-dashed border-emerald-300 rounded-2xl p-12 text-center flex-1">
                <div className="text-5xl mb-4">✅</div>
                <div className="text-slate-700 font-bold text-base mb-1">
                  {parsed.rows.length.toLocaleString()} rows ready
                </div>
                <p className="text-slate-400 text-sm mb-4">Configure options above then generate SQL.</p>
                <button onClick={handleGenerate}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all">
                  ⚡ Generate SQL Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AD BOTTOM */}
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>

        {/* DIALECT REFERENCE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900 mb-4">SQL Dialect Reference</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DIALECTS.map((d) => (
              <button key={d.key} onClick={() => setDialect(d.key)}
                className={'p-3 rounded-xl border text-center transition-all hover:shadow-sm ' + (dialect === d.key ? d.bg + ' ' + d.border : 'bg-slate-50 border-slate-200 hover:border-slate-300')}>
                <div className="text-2xl mb-1">{d.icon}</div>
                <div className={'text-xs font-bold ' + (dialect === d.key ? d.color : 'text-slate-700')}>{d.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* RELATED TOOLS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Other free developer tools to use alongside the CSV to SQL converter.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free CSV to SQL Converter Online</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans CSV to SQL converter transforms CSV, TSV and Excel spreadsheet data into ready-to-run SQL INSERT statements for any major database. It supports MySQL, PostgreSQL, SQLite, SQL Server (T-SQL), MariaDB and Oracle — each with the correct quoting, data type mapping and syntax for that specific dialect.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            The tool automatically detects column data types — integers, decimals, booleans, dates, timestamps and strings — so your CREATE TABLE schema is generated correctly without manual type assignment. Empty cells are automatically converted to NULL values.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Choose between single INSERT statements (one per row), batch inserts (multiple rows per INSERT for better performance), or upsert mode which generates dialect-specific merge statements using ON DUPLICATE KEY UPDATE for MySQL, ON CONFLICT for PostgreSQL, INSERT OR REPLACE for SQLite, and MERGE for SQL Server. All processing happens entirely in your browser — no data is uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
}