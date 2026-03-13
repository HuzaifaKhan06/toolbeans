// app/tools/page.jsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

// ── All 21 tools ──────────────────────────────────────────────────────────────
const tools = [
  { name: 'Password Generator',     desc: 'Generate cryptographically secure passwords with custom length, uppercase, lowercase, numbers and symbols. Includes strength meter and crack time estimate.',         icon: '🔒', href: '/tools/password-generator',     color: 'bg-indigo-50',  badge: 'Security',  badgeColor: 'bg-indigo-100 text-indigo-700',  keywords: 'strong password generator, secure random password'           },
  { name: 'QR Code Generator',      desc: 'Create QR codes for URLs, text, email, phone, Wi-Fi and more. Choose from multiple sizes and color themes. Download as PNG, SVG or PDF.',                          icon: '📱', href: '/tools/qr-code-generator',      color: 'bg-cyan-50',    badge: 'Utility',   badgeColor: 'bg-cyan-100 text-cyan-700',      keywords: 'qr code generator free, create qr code online'              },
  { name: 'JSON Formatter',         desc: 'Beautify, minify, validate and auto-repair JSON. Tree view with collapsible nodes, custom indentation and syntax error detection.',                                icon: '{}', href: '/tools/json-formatter',         color: 'bg-yellow-50',  badge: 'Developer', badgeColor: 'bg-yellow-100 text-yellow-700',  keywords: 'json formatter online, json beautifier, json validator'      },
  { name: 'SQL Formatter',          desc: 'Format and beautify SQL queries. Supports MySQL, PostgreSQL, SQLite, T-SQL, BigQuery and MariaDB dialects with keyword case control.',                             icon: '🗄️', href: '/tools/sql-formatter',          color: 'bg-rose-50',    badge: 'Database',  badgeColor: 'bg-rose-100 text-rose-700',      keywords: 'sql formatter online, sql beautifier, format sql query'      },
  { name: 'Base64 Encoder / Decoder', desc: 'Encode text or files to Base64 and decode Base64 back to plain text. Handles JWT tokens natively. Supports URL-safe Base64.',                                  icon: '🔐', href: '/tools/base64-encoder-decoder', color: 'bg-green-50',   badge: 'Encoding',  badgeColor: 'bg-green-100 text-green-700',    keywords: 'base64 encode online, base64 decode online'                 },
  { name: 'URL Encoder / Decoder',  desc: 'Encode and decode URL components, full URLs and query strings. Includes query string builder and percent-encoding reference table.',                               icon: '🔗', href: '/tools/url-encoder-decoder',    color: 'bg-purple-50',  badge: 'Encoding',  badgeColor: 'bg-purple-100 text-purple-700',  keywords: 'url encode online, url decode online, percent encoding'      },
  { name: 'URL Shortener',          desc: 'Shorten long URLs to clean short links. Set custom aliases, track click counts and generate QR codes per link.',                                                   icon: '✂️', href: '/tools/url-shortener',          color: 'bg-violet-50',  badge: 'Utility',   badgeColor: 'bg-violet-100 text-violet-700',  keywords: 'url shortener free, shorten url online'                     },
  { name: 'Text Case Converter',    desc: 'Convert text to camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case and more. Live re-conversion with word and character stats.',            icon: '🔤', href: '/tools/text-case-converter',    color: 'bg-orange-50',  badge: 'Text',      badgeColor: 'bg-orange-100 text-orange-700',  keywords: 'text case converter, camelcase to snake_case'               },
  { name: 'Hash Generator',         desc: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashes from any text or file. Includes HMAC-SHA256 and hash comparison tab.',                            icon: '#️⃣', href: '/tools/hash-generator',         color: 'bg-emerald-50', badge: 'Security',  badgeColor: 'bg-emerald-100 text-emerald-700', keywords: 'sha256 hash generator, md5 generator online'               },
  { name: 'JWT Decoder',            desc: 'Decode JSON Web Tokens and inspect header, payload and all claims. Live expiry countdown and security warnings for weak algorithms.',                               icon: '🔓', href: '/tools/jwt-decoder',            color: 'bg-sky-50',     badge: 'Auth',      badgeColor: 'bg-sky-100 text-sky-700',        keywords: 'jwt decoder online, decode jwt token'                        },
  { name: 'Regex Tester',           desc: 'Test regular expressions with live match highlighting, flag toggles, captured group inspector, replace mode and a 10-pattern cheatsheet.',                         icon: '⚡', href: '/tools/regex-tester',           color: 'bg-fuchsia-50', badge: 'Developer', badgeColor: 'bg-fuchsia-100 text-fuchsia-700', keywords: 'regex tester online, regular expression tester'            },
  { name: 'Word Counter',           desc: 'Count words, characters, sentences and paragraphs instantly. Reading time estimate, keyword density and export options included.',                                  icon: '📝', href: '/tools/word-counter',           color: 'bg-emerald-50', badge: 'Writing',   badgeColor: 'bg-emerald-100 text-emerald-700', keywords: 'word counter online, character counter free'               },
  { name: 'Lorem Ipsum Generator',  desc: 'Generate Lorem Ipsum placeholder text in paragraphs, sentences or words. Styles include Classic, Tech, Business and Casual with HTML output.',                    icon: '✍️', href: '/tools/lorem-ipsum',            color: 'bg-purple-50',  badge: 'Writing',   badgeColor: 'bg-purple-100 text-purple-700',  keywords: 'lorem ipsum generator, placeholder text generator'          },
  { name: 'Timestamp Converter',    desc: 'Convert Unix timestamps instantly. Supports Unix seconds, milliseconds, ISO 8601, SQL DateTime and multiple timezone formats with real-time clock.',               icon: '⏱️', href: '/tools/timestamp-converter',    color: 'bg-sky-50',     badge: 'Developer', badgeColor: 'bg-sky-100 text-sky-700',        keywords: 'unix timestamp converter, epoch converter online'           },
  { name: 'Color Picker',           desc: 'Create color palettes, tints, shades and gradients for UI design and branding. Real-time previews, harmony suggestions and export options.',                       icon: '🎨', href: '/tools/color-picker',           color: 'bg-pink-50',    badge: 'Design',    badgeColor: 'bg-pink-100 text-pink-700',      keywords: 'color picker online, hex color picker, color palette'       },
  { name: 'CSV to SQL',             desc: 'Convert CSV files to SQL INSERT statements instantly. Paste data or upload CSV, TSV, TXT or Excel files to generate clean queries for any database.',              icon: '📊', href: '/tools/csv-to-sql',             color: 'bg-emerald-50', badge: 'Database',  badgeColor: 'bg-emerald-100 text-emerald-700', keywords: 'csv to sql converter, csv to insert statements'            },
  { name: 'HTML to Markdown',       desc: 'Convert HTML to clean Markdown instantly. Supports GitHub Flavored Markdown, tables, code blocks and live preview for accurate formatting.',                       icon: '🔄', href: '/tools/html-to-markdown',       color: 'bg-teal-50',    badge: 'Writing',   badgeColor: 'bg-teal-100 text-teal-700',      keywords: 'html to markdown converter, html to md online'              },
  { name: 'Code Formatter',         desc: 'Format JavaScript, TypeScript, HTML, CSS, JSON and XML instantly. Syntax highlighting, minify option and side-by-side diff view.',                                 icon: '✨', href: '/tools/code-formatter',         color: 'bg-violet-50',  badge: 'Developer', badgeColor: 'bg-violet-100 text-violet-700',  keywords: 'code formatter online, js formatter, html beautifier'       },
  { name: 'API Tester',             desc: 'Test and debug REST APIs in your browser. All HTTP methods, authentication management, JSON tree response view and cURL export.',                                   icon: '📡', href: '/tools/api-request-tester',    color: 'bg-violet-50',  badge: 'Developer', badgeColor: 'bg-violet-100 text-violet-700',  keywords: 'api tester online, rest api tester, test api in browser'    },
  { name: 'Image to Base64',        desc: 'Convert PNG, JPG, SVG, WebP images to Base64 Data URL, HTML img tag, CSS background or JSON. Batch convert multiple files entirely in your browser.',             icon: '🖼️', href: '/tools/image-to-base64',        color: 'bg-orange-50',  badge: 'Developer', badgeColor: 'bg-orange-100 text-orange-700',  keywords: 'image to base64 converter, png to base64 online'            },
  { name: 'Diff Checker',           desc: 'Compare two versions of text or code side-by-side. Word-level inline diff, split and unified view, ignore whitespace and export diff.',                            icon: '↔️', href: '/tools/diff-checker',           color: 'bg-cyan-50',    badge: 'Developer', badgeColor: 'bg-cyan-100 text-cyan-700',      keywords: 'diff checker online, text compare tool, code diff'          },
];

// ── Categories with tool name lists for dropdowns ─────────────────────────────
const categories = [
  { key: 'All',       label: 'All Tools', desc: 'Browse all 21 free tools',                    tools: [] },
  { key: 'Developer', label: 'Developer', desc: 'Code, formatting, testing and API tools',     tools: ['JSON Formatter','Regex Tester','Timestamp Converter','Code Formatter','API Tester','Image to Base64','Diff Checker'] },
  { key: 'Security',  label: 'Security',  desc: 'Password, hashing and token tools',           tools: ['Password Generator','Hash Generator'] },
  { key: 'Encoding',  label: 'Encoding',  desc: 'Encode and decode data formats',              tools: ['Base64 Encoder / Decoder','URL Encoder / Decoder'] },
  { key: 'Database',  label: 'Database',  desc: 'SQL and data conversion tools',               tools: ['SQL Formatter','CSV to SQL'] },
  { key: 'Utility',   label: 'Utility',   desc: 'QR codes, URL tools and general utilities',   tools: ['QR Code Generator','URL Shortener'] },
  { key: 'Writing',   label: 'Writing',   desc: 'Text tools for writers and designers',        tools: ['Word Counter','Lorem Ipsum Generator','HTML to Markdown'] },
  { key: 'Text',      label: 'Text',      desc: 'Text transformation and conversion tools',    tools: ['Text Case Converter'] },
  { key: 'Design',    label: 'Design',    desc: 'Color and visual design tools',               tools: ['Color Picker'] },
  { key: 'Auth',      label: 'Auth',      desc: 'Authentication and token inspection tools',   tools: ['JWT Decoder'] },
];

const stats = [
  { value: '21',   label: 'Free Tools'     },
  { value: '0',    label: 'Sign-up Needed' },
  { value: '100%', label: 'Browser-Based'  },
  { value: '∞',    label: 'Free Forever'   },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com'       },
        { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
      ],
    },
    {
      '@type': 'CollectionPage',
      '@id': 'https://toolbeans.com/tools/#collectionpage',
      url: 'https://toolbeans.com/tools',
      name: 'Free Online Developer Tools  TOOLBeans',
      description: '21 free browser-based tools for developers, data engineers and everyday users.',
      isPartOf: { '@id': 'https://toolbeans.com/#website' },
      hasPart: tools.map((t) => ({
        '@type': 'SoftwareApplication',
        name: t.name,
        url: 'https://toolbeans.com' + t.href,
        applicationCategory: 'DeveloperApplication',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      })),
    },
  ],
};

// ── Category pill with hover dropdown ────────────────────────────────────────
function CategoryPill({ cat, toolsList, onFilter, activeFilter, isLast }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);
  const pillRef = useRef(null);
  const isActive = activeFilter === cat.key;
  const matchedTools = toolsList.filter((t) => cat.tools.includes(t.name));
  const hasDropdown = cat.key !== 'All' && matchedTools.length > 0;

  // Detect if pill is near right edge  flip dropdown to open left
  const [flipLeft, setFlipLeft] = useState(false);
  const checkFlip = () => {
    if (!pillRef.current) return;
    const rect = pillRef.current.getBoundingClientRect();
    setFlipLeft(rect.right + 288 > window.innerWidth - 16);
  };

  const open_ = () => {
    clearTimeout(timeoutRef.current);
    if (hasDropdown) { checkFlip(); setOpen(true); }
  };
  const close_ = () => { timeoutRef.current = setTimeout(() => setOpen(false), 120); };

  return (
    <div
      ref={pillRef}
      className="relative"
      onMouseEnter={open_}
      onMouseLeave={close_}
    >
      {/* Pill button */}
      <button
        onClick={() => { onFilter(cat.key); setOpen(false); }}
        className={
          'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all duration-150 select-none whitespace-nowrap ' +
          (isActive
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50')
        }
      >
        {cat.label}
        <span className={
          'text-xs rounded-full px-1.5 py-px font-bold tabular-nums ' +
          (isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-400')
        }>
          {cat.key === 'All' ? tools.length : cat.tools.length}
        </span>
        {hasDropdown && (
          <svg
            className={'w-3 h-3 transition-transform duration-150 ' + (open ? 'rotate-180' : '')}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown panel  flips left when near viewport edge */}
      {open && hasDropdown && (
        <div
          className={'absolute top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 p-4 w-64 ' +
            (flipLeft ? 'right-0' : 'left-0')}
          onMouseEnter={() => clearTimeout(timeoutRef.current)}
          onMouseLeave={close_}
        >
          {/* Caret  moves with flip */}
          <div className={'absolute -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45 rounded-sm ' +
            (flipLeft ? 'right-5' : 'left-5')} />

          <p className="text-xs text-slate-400 font-medium mb-3 pl-0.5">{cat.desc}</p>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 gap-1">
            {matchedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-colors"
              >
                <span className="text-sm leading-none flex-shrink-0">{tool.icon}</span>
                <span className="text-xs font-semibold leading-tight">{tool.name}</span>
              </Link>
            ))}
          </div>

          {/* Footer link */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <button
              onClick={() => { onFilter(cat.key); setOpen(false); }}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Show all {cat.tools.length} {cat.label} tools →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTools = activeFilter === 'All'
    ? tools
    : tools.filter((t) => t.badge === activeFilter);

  const activeCategory = categories.find((c) => c.key === activeFilter);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">

        {/* HERO */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">

            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-600 font-semibold">All Tools</span>
            </nav>

            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-indigo-100">
              21 Free Tools
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Free Online{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Developer Tools
              </span>
            </h1>

            <p className="text-base text-slate-500 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
              Every tool runs entirely in your browser  no account, no server, no data collection.
              Password generator, JSON formatter, QR code creator, JWT decoder, regex tester,
              hash generator and 15 more  all free, all private, all instant.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── CATEGORY NAV ── */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.key}
                  cat={cat}
                  toolsList={tools}
                  onFilter={setActiveFilter}
                  activeFilter={activeFilter}
                />
              ))}
            </div>
          </div>
        </section>

        {/* AD TOP */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement  728×90
          </div>
        </div>

        {/* TOOLS GRID */}
        <section className="max-w-6xl mx-auto px-6 pb-10">

          {/* Filter header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {activeFilter === 'All' ? 'All Tools' : activeFilter + ' Tools'}
                <span className="text-sm font-normal text-slate-400 ml-2">
                  {filteredTools.length} available
                </span>
              </h2>
              {activeFilter !== 'All' && activeCategory?.desc && (
                <p className="text-xs text-slate-400 mt-0.5">{activeCategory.desc}</p>
              )}
            </div>
            {activeFilter !== 'All' && (
              <button
                onClick={() => setActiveFilter('All')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                ← Show All 21 Tools
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <div
                key={tool.href}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200 flex flex-col group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={'w-12 h-12 ' + tool.color + ' rounded-xl flex items-center justify-center text-2xl flex-shrink-0'}>
                    {tool.icon}
                  </div>
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + tool.badgeColor}>
                    {tool.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-2">{tool.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{tool.desc}</p>
                <p className="sr-only">{tool.keywords}</p>

                <Link
                  href={tool.href}
                  className="inline-flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                >
                  Open Tool →
                </Link>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredTools.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-slate-500">No tools in this category yet.</p>
              <button onClick={() => setActiveFilter('All')} className="mt-3 text-sm text-indigo-600 font-semibold hover:underline">
                Show all 21 tools →
              </button>
            </div>
          )}

          {/* AD BOTTOM */}
          <div className="mt-10">
            <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
              Advertisement  728×90
            </div>
          </div>

          {/* POPULAR TOOLS TAG CLOUD  SEO anchor text links, visually light */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Popular Tools</p>
            <div className="flex flex-wrap gap-2">
              {tools.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-150"
                >
                  <span className="text-sm leading-none">{t.icon}</span>
                  {t.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-10 text-center text-white">
            <h3 className="text-2xl font-extrabold mb-2">Missing a Tool?</h3>
            <p className="text-indigo-100 text-sm font-light mb-6 max-w-md mx-auto">
              New tools are added regularly. Send a request and it will likely be built next.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm"
            >
              Request a Tool →
            </Link>
          </div>
        </section>

        {/* SEO TEXT BLOCK */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              21 Free Browser-Based Developer Tools  What Is Available on TOOLBeans
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              TOOLBeans offers 21 free online tools built for software developers, data engineers,
              DevOps professionals and anyone who works regularly with code, tokens or text data.
              Every tool runs entirely inside your browser using client-side JavaScript  nothing
              you enter is ever sent to a server, making it safe to use real production data, live
              JWT tokens, actual passwords and sensitive files.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The security category includes a{' '}
              <Link href="/tools/password-generator" className="text-indigo-600 hover:underline">free password generator</Link>{' '}
              using the Web Crypto API, a{' '}
              <Link href="/tools/hash-generator" className="text-indigo-600 hover:underline">hash generator</Link>{' '}
              supporting MD5, SHA-256, SHA-512 and CRC32, and a{' '}
              <Link href="/tools/jwt-decoder" className="text-indigo-600 hover:underline">JWT decoder</Link>{' '}
              with live expiry countdown. The developer category covers an{' '}
              <Link href="/tools/json-formatter" className="text-indigo-600 hover:underline">online JSON formatter</Link>,{' '}
              <Link href="/tools/sql-formatter" className="text-indigo-600 hover:underline">SQL formatter</Link>,{' '}
              <Link href="/tools/regex-tester" className="text-indigo-600 hover:underline">regex tester</Link>,{' '}
              <Link href="/tools/code-formatter" className="text-indigo-600 hover:underline">code formatter</Link>,{' '}
              <Link href="/tools/diff-checker" className="text-indigo-600 hover:underline">diff checker</Link>{' '}
              and an{' '}
              <Link href="/tools/api-request-tester" className="text-indigo-600 hover:underline">API tester</Link>.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Utility and writing tools include a{' '}
              <Link href="/tools/qr-code-generator" className="text-indigo-600 hover:underline">QR code generator</Link>{' '}
              that exports to PNG, SVG and PDF, a{' '}
              <Link href="/tools/url-shortener" className="text-indigo-600 hover:underline">URL shortener</Link>{' '}
              with custom aliases, a{' '}
              <Link href="/tools/base64-encoder-decoder" className="text-indigo-600 hover:underline">Base64 encoder/decoder</Link>,{' '}
              <Link href="/tools/color-picker" className="text-indigo-600 hover:underline">color picker</Link>,{' '}
              <Link href="/tools/csv-to-sql" className="text-indigo-600 hover:underline">CSV to SQL converter</Link>,{' '}
              <Link href="/tools/word-counter" className="text-indigo-600 hover:underline">word counter</Link>{' '}
              and more. All 21 tools are permanently free with no account required and no usage limit.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}