import Link from 'next/link';

export const metadata = {
  title: 'All Free Developer Tools — Password Generator, JSON Formatter, JWT Decoder and More',
  description:
    'Browse 11 free online developer tools on TOOLBeans. Password generator, QR code generator, JSON formatter, SQL formatter, Base64 encoder, JWT decoder, regex tester and more. No signup, no limits.',
  keywords: [
    'free developer tools',
    'online tools for developers',
    'password generator online',
    'json formatter online free',
    'jwt decoder online',
    'regex tester online',
    'base64 encoder decoder',
    'url shortener free',
    'sha256 hash generator',
    'qr code generator free',
    'sql formatter online',
    'text case converter',
  ],
  alternates: {
    canonical: 'https://toolbeans.com/tools',
  },
  openGraph: {
    title: 'All Free Developer Tools — TOOLBeans',
    description:
      '11 free browser-based tools for developers. Password generator, JSON formatter, JWT decoder, regex tester, QR codes and more. No account required.',
    url: 'https://toolbeans.com/tools',
  },
};

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
      name: 'Free Online Developer Tools — TOOLBeans',
      description: '11 free browser-based tools for developers, data engineers and everyday users.',
      isPartOf: { '@id': 'https://toolbeans.com/#website' },
      hasPart: [
        { '@type': 'SoftwareApplication', name: 'Password Generator',      url: 'https://toolbeans.com/tools/password-generator',     applicationCategory: 'SecurityApplication'    },
        { '@type': 'SoftwareApplication', name: 'QR Code Generator',       url: 'https://toolbeans.com/tools/qr-code-generator',      applicationCategory: 'UtilitiesApplication'   },
        { '@type': 'SoftwareApplication', name: 'JSON Formatter',          url: 'https://toolbeans.com/tools/json-formatter',         applicationCategory: 'DeveloperApplication'   },
        { '@type': 'SoftwareApplication', name: 'SQL Formatter',           url: 'https://toolbeans.com/tools/sql-formatter',          applicationCategory: 'DeveloperApplication'   },
        { '@type': 'SoftwareApplication', name: 'Base64 Encoder Decoder',  url: 'https://toolbeans.com/tools/base64-encoder-decoder', applicationCategory: 'UtilitiesApplication'   },
        { '@type': 'SoftwareApplication', name: 'URL Encoder Decoder',     url: 'https://toolbeans.com/tools/url-encoder-decoder',    applicationCategory: 'UtilitiesApplication'   },
        { '@type': 'SoftwareApplication', name: 'URL Shortener',           url: 'https://toolbeans.com/tools/url-shortener',          applicationCategory: 'UtilitiesApplication'   },
        { '@type': 'SoftwareApplication', name: 'Text Case Converter',     url: 'https://toolbeans.com/tools/text-case-converter',    applicationCategory: 'UtilitiesApplication'   },
        { '@type': 'SoftwareApplication', name: 'Hash Generator',          url: 'https://toolbeans.com/tools/hash-generator',         applicationCategory: 'SecurityApplication'    },
        { '@type': 'SoftwareApplication', name: 'JWT Decoder',             url: 'https://toolbeans.com/tools/jwt-decoder',            applicationCategory: 'SecurityApplication'    },
        { '@type': 'SoftwareApplication', name: 'Regex Tester',            url: 'https://toolbeans.com/tools/regex-tester',           applicationCategory: 'DeveloperApplication'   },
      ],
    },
  ],
};

// ── All 11 tools with full SEO-targeted descriptions ──
const tools = [
  {
    name: 'Password Generator',
    desc: 'Generate cryptographically secure passwords with custom length, uppercase, lowercase, numbers and symbols. Includes strength meter, crack time estimate and session history.',
    icon: '🔒',
    href: '/tools/password-generator',
    color: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badge: 'Security',
    badgeColor: 'bg-indigo-50 text-indigo-600',
    keywords: 'strong password generator, secure random password',
  },
  {
    name: 'QR Code Generator',
    desc: 'Create QR codes for URLs, text, email, phone, Wi-Fi and more. Choose from multiple sizes and color themes. Download as PNG, SVG or centered PDF.',
    icon: '📱',
    href: '/tools/qr-code-generator',
    color: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    badge: 'Utility',
    badgeColor: 'bg-cyan-50 text-cyan-600',
    keywords: 'qr code generator free, create qr code online',
  },
  {
    name: 'JSON Formatter',
    desc: 'Beautify, minify, validate and auto-repair JSON. Tree view with collapsible nodes, custom indentation, file upload, JSON stats and syntax error detection.',
    icon: '{}',
    href: '/tools/json-formatter',
    color: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    badge: 'Developer',
    badgeColor: 'bg-yellow-50 text-yellow-600',
    keywords: 'json formatter online, json beautifier, json validator',
  },
  {
    name: 'SQL Formatter',
    desc: 'Format and beautify SQL queries into clean readable code. Supports MySQL, PostgreSQL, SQLite, T-SQL, BigQuery and MariaDB dialects with keyword case control.',
    icon: '🗄️',
    href: '/tools/sql-formatter',
    color: 'bg-rose-50',
    iconColor: 'text-rose-600',
    badge: 'Database',
    badgeColor: 'bg-rose-50 text-rose-600',
    keywords: 'sql formatter online, sql beautifier, format sql query',
  },
  {
    name: 'Base64 Encoder / Decoder',
    desc: 'Encode text or files to Base64 and decode Base64 back to plain text. Handles JWT tokens natively — splits and decodes each part separately. Supports URL-safe Base64.',
    icon: '🔐',
    href: '/tools/base64-encoder-decoder',
    color: 'bg-green-50',
    iconColor: 'text-green-600',
    badge: 'Encoding',
    badgeColor: 'bg-green-50 text-green-600',
    keywords: 'base64 encode online, base64 decode online, base64 encoder decoder',
  },
  {
    name: 'URL Encoder / Decoder',
    desc: 'Encode and decode URL components, full URLs and query strings. Includes a query string builder, URL parser and percent-encoding character reference table.',
    icon: '🔗',
    href: '/tools/url-encoder-decoder',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    badge: 'Encoding',
    badgeColor: 'bg-purple-50 text-purple-600',
    keywords: 'url encode online, url decode online, percent encoding',
  },
  {
    name: 'URL Shortener',
    desc: 'Shorten long URLs to clean short links. Set custom aliases, track click counts, generate QR codes per link and preview the destination safely before visiting.',
    icon: '✂️',
    href: '/tools/url-shortener',
    color: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badge: 'Utility',
    badgeColor: 'bg-violet-50 text-violet-600',
    keywords: 'url shortener free, shorten url online, custom short link',
  },
  {
    name: 'Text Case Converter',
    desc: 'Convert text to camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case, sentence case and more. Live re-conversion with word and character stats.',
    icon: '🔤',
    href: '/tools/text-case-converter',
    color: 'bg-orange-50',
    iconColor: 'text-orange-600',
    badge: 'Text',
    badgeColor: 'bg-orange-50 text-orange-600',
    keywords: 'text case converter, camelcase to snake_case, convert text case',
  },
  {
    name: 'Hash Generator',
    desc: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashes from any text or file. Includes HMAC-SHA256, hash comparison tab and algorithm security ratings.',
    icon: '#️⃣',
    href: '/tools/hash-generator',
    color: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badge: 'Security',
    badgeColor: 'bg-emerald-50 text-emerald-600',
    keywords: 'sha256 hash generator, md5 generator online, sha512 hash online',
  },
  {
    name: 'JWT Decoder',
    desc: 'Decode JSON Web Tokens and inspect header, payload and all claims. Live expiry countdown, security warnings for alg:none and weak algorithms, and a full JWT guide.',
    icon: '🔓',
    href: '/tools/jwt-decoder',
    color: 'bg-sky-50',
    iconColor: 'text-sky-600',
    badge: 'Auth',
    badgeColor: 'bg-sky-50 text-sky-600',
    keywords: 'jwt decoder online, decode jwt token, jwt inspector',
  },
  {
    name: 'Regex Tester',
    desc: 'Test regular expressions with live match highlighting, flag toggles, captured group inspector, pattern explanation engine, replace mode and a 10-pattern cheatsheet.',
    icon: '⚡',
    href: '/tools/regex-tester',
    color: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-600',
    badge: 'Developer',
    badgeColor: 'bg-fuchsia-50 text-fuchsia-600',
    keywords: 'regex tester online, regular expression tester, test regex live',
  },
];

const stats = [
  { value: '11',   label: 'Free Tools'      },
  { value: '0',    label: 'Sign-up Needed'  },
  { value: '100%', label: 'Browser-Based'   },
  { value: '∞',    label: 'Free Forever'    },
];

// Filter categories — used for the category nav and for Google to understand structure
const categories = [
  { key: 'All',       label: 'All Tools',      count: 11 },
  { key: 'Security',  label: 'Security',        count: 3  },
  { key: 'Developer', label: 'Developer',       count: 3  },
  { key: 'Encoding',  label: 'Encoding',        count: 3  },
  { key: 'Utility',   label: 'Utility',         count: 2  },
  { key: 'Database',  label: 'Database',        count: 1  },
  { key: 'Text',      label: 'Text',            count: 1  },
  { key: 'Auth',      label: 'Auth',            count: 1  },
];

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">

        {/* ── HERO ── */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">

            {/* Breadcrumb — visible to users and crawlers */}
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-600 font-semibold">All Tools</span>
            </nav>

            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-indigo-100">
              11 Free Tools
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Free Online{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Developer Tools
              </span>
            </h1>

            <p className="text-base text-slate-500 font-light max-w-2xl mx-auto mb-8 leading-relaxed">
              Every tool on TOOLBeans runs entirely in your browser. No account, no server, no
              data collection. Password generator, JSON formatter, QR code creator, JWT decoder,
              regex tester, hash generator and more — all free, all private, all instant.
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AD TOP ── */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement — 728x90
          </div>
        </div>

        {/* ── TOOLS GRID ── */}
        <section className="max-w-6xl mx-auto px-6 pb-10">

          {/* Category nav — static, no JS filter needed for SEO */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <span
                key={cat.key}
                className={
                  'text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-default ' +
                  (cat.key === 'All'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600')
                }
              >
                {cat.label}
                <span className="ml-1.5 opacity-60">{cat.count}</span>
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              All Tools
              <span className="text-sm font-normal text-slate-400 ml-2">{tools.length} available</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
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

                {/* Hidden keyword hint for additional long-tail targeting */}
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

          {/* ── AD BOTTOM ── */}
          <div className="mt-10">
            <div className="w-full h-16 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
              Advertisement — 728x90
            </div>
          </div>

          {/* ── RELATED TOOL GROUPINGS — internal linking ── */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security Tools</div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Tools for generating secure passwords, hashing data and decoding authentication tokens.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Password Generator', href: '/tools/password-generator' },
                  { name: 'Hash Generator',      href: '/tools/hash-generator'     },
                  { name: 'JWT Decoder',         href: '/tools/jwt-decoder'        },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <span className="text-slate-300 text-xs">→</span>{l.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Developer Tools</div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Format JSON and SQL, test regular expressions and encode or decode data for your workflow.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'JSON Formatter',       href: '/tools/json-formatter'         },
                  { name: 'SQL Formatter',         href: '/tools/sql-formatter'          },
                  { name: 'Regex Tester',          href: '/tools/regex-tester'           },
                  { name: 'Base64 Encoder',        href: '/tools/base64-encoder-decoder' },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <span className="text-slate-300 text-xs">→</span>{l.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Utility Tools</div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Generate QR codes, shorten URLs, convert text cases and encode URL components.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'QR Code Generator',    href: '/tools/qr-code-generator'   },
                  { name: 'URL Shortener',         href: '/tools/url-shortener'       },
                  { name: 'Text Case Converter',   href: '/tools/text-case-converter' },
                  { name: 'URL Encoder / Decoder', href: '/tools/url-encoder-decoder' },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                    <span className="text-slate-300 text-xs">→</span>{l.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── MISSING TOOL CTA ── */}
          <div className="mt-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-10 text-center text-white">
            <h3 className="text-2xl font-extrabold mb-2">Missing a Tool?</h3>
            <p className="text-indigo-100 text-sm font-light mb-6 max-w-md mx-auto">
              New tools are added regularly. If you need a utility that is not here yet, send a
              request through the contact page and it will likely be built next.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm"
            >
              Request a Tool →
            </Link>
          </div>
        </section>

        {/* ── SEO CONTENT BLOCK ── */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              Free Browser-Based Developer Tools — What Is Available on TOOLBeans
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              TOOLBeans offers 11 free online tools designed for software developers, data
              engineers, DevOps professionals and anyone who regularly works with code, tokens
              or text data. Every tool runs entirely inside your browser using client-side
              JavaScript, so nothing you enter is ever sent to a server. This makes it safe
              to use real production data, live JWT tokens, actual passwords and sensitive files.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The security category includes a free password generator that uses the browser
              Web Crypto API for cryptographic randomness, a hash generator supporting MD5,
              SHA-1, SHA-256, SHA-384, SHA-512 and CRC32, and a JWT decoder with live expiry
              countdown and automatic alg:none security warnings. The developer category covers
              an online JSON formatter with auto-repair and tree view, an SQL formatter
              supporting six dialects, and a regex tester with live match highlighting and a
              pattern explanation engine that breaks down every token into plain English.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Utility tools include a free QR code generator that exports to PNG, SVG and PDF,
              a URL shortener with custom aliases and click tracking, a Base64 encoder and
              decoder with full JWT token support, a URL encoder and decoder with a query
              string builder, and a text case converter supporting twelve formats including
              camelCase, PascalCase, snake_case and kebab-case. All tools are permanently free
              with no account required and no daily usage limit.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}