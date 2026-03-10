import Link from 'next/link';

export const metadata = {
  title: 'TOOLBeans Free Online Developer Tools',
  description:
    'Free online tools for developers and professionals. Password generator, JSON formatter, QR code generator, JWT decoder, regex tester, URL shortener and more. No signup, no limits, runs in your browser.',
  alternates: {
    canonical: 'https://toolbeans.com',
  },
  openGraph: {
    title: 'TOOLBeans Free Online Developer Tools',
    description:
      'Password generator, JSON formatter, QR code generator, JWT decoder, regex tester and more. All free, all private, runs in your browser.',
    url: 'https://toolbeans.com',
  },
};

// JSON-LD for homepage — WebPage + FAQPage for featured snippets
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://toolbeans.com/#webpage',
      url: 'https://toolbeans.com',
      name: 'TOOLBeans Free Online Developer Tools',
      description:
        'Free online tools for developers. Password generator, JSON formatter, QR code generator, JWT decoder, regex tester, URL shortener and more.',
      isPartOf: { '@id': 'https://toolbeans.com/#website' },
      about: { '@id': 'https://toolbeans.com/#organization' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolbeans.com' }],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are all TOOLBeans tools completely free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every tool on TOOLBeans is 100% free with no usage limits. No account, no credit card, and no subscription is ever required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do TOOLBeans tools send my data to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All tools run entirely in your browser using JavaScript. Your data never leaves your device, making TOOLBeans safe to use with sensitive or production data.',
          },
        },
        {
          '@type': 'Question',
          name: 'What developer tools does TOOLBeans offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'TOOLBeans offers a password generator, QR code generator, JSON formatter, SQL formatter, Base64 encoder and decoder, URL encoder and decoder, URL shortener, text case converter, SHA256 hash generator, JWT decoder and a regex tester all free and browser-based.',
          },
        },
      ],
    },
  ],
};

const tools = [
  {
    name: 'Password Generator',
    desc: 'Generate strong, cryptographically secure passwords with custom length, character types, and strength scoring. No data sent to any server.',
    icon: '🔒',
    href: '/tools/password-generator',
    badge: 'Security',
    badgeColor: 'bg-indigo-50 text-indigo-600',
    iconBg: 'bg-indigo-50',
    border: 'hover:border-indigo-200',
  },
  {
    name: 'QR Code Generator',
    desc: 'Create QR codes for URLs, text, emails, phone numbers and more. Download as PNG, SVG, or PDF fully customizable colors and sizes.',
    icon: '📱',
    href: '/tools/qr-code-generator',
    badge: 'Utility',
    badgeColor: 'bg-cyan-50 text-cyan-600',
    iconBg: 'bg-cyan-50',
    border: 'hover:border-cyan-200',
  },
  {
    name: 'JSON Formatter',
    desc: 'Beautify, minify, validate and auto-repair JSON data. Tree view, file upload, and syntax error detection included.',
    icon: '{}',
    href: '/tools/json-formatter',
    badge: 'Developer',
    badgeColor: 'bg-yellow-50 text-yellow-600',
    iconBg: 'bg-yellow-50',
    border: 'hover:border-yellow-200',
  },
  {
    name: 'SQL Formatter',
    desc: 'Format messy SQL queries into clean, readable code. Supports MySQL, PostgreSQL, SQLite, T-SQL and BigQuery dialects.',
    icon: '🗄️',
    href: '/tools/sql-formatter',
    badge: 'Database',
    badgeColor: 'bg-rose-50 text-rose-600',
    iconBg: 'bg-rose-50',
    border: 'hover:border-rose-200',
  },
  {
    name: 'Base64 Encoder / Decoder',
    desc: 'Encode and decode Base64 and Base64URL strings instantly. Handles JWT tokens, file uploads up to 5MB and standard Base64 variants.',
    icon: '🔐',
    href: '/tools/base64-encoder-decoder',
    badge: 'Encoding',
    badgeColor: 'bg-green-50 text-green-600',
    iconBg: 'bg-green-50',
    border: 'hover:border-green-200',
  },
  {
    name: 'URL Encoder / Decoder',
    desc: 'Encode and decode URL components, query strings and full URLs. Includes a query string builder and character reference table.',
    icon: '🔗',
    href: '/tools/url-encoder-decoder',
    badge: 'Encoding',
    badgeColor: 'bg-purple-50 text-purple-600',
    iconBg: 'bg-purple-50',
    border: 'hover:border-purple-200',
  },
  {
    name: 'URL Shortener',
    desc: 'Shorten long URLs to clean short links that work forever. Custom aliases, click tracking, QR codes for each link, and safe preview mode.',
    icon: '✂️',
    href: '/tools/url-shortener',
    badge: 'Utility',
    badgeColor: 'bg-violet-50 text-violet-600',
    iconBg: 'bg-violet-50',
    border: 'hover:border-violet-200',
  },
  {
    name: 'Text Case Converter',
    desc: 'Convert text to camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case and more. Paste, convert, copy instantly.',
    icon: '🔤',
    href: '/tools/text-case-converter',
    badge: 'Text',
    badgeColor: 'bg-orange-50 text-orange-600',
    iconBg: 'bg-orange-50',
    border: 'hover:border-orange-200',
  },
  {
    name: 'Hash Generator',
    desc: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashes from any text or file. HMAC-SHA256 and hash comparison included.',
    icon: '#️⃣',
    href: '/tools/hash-generator',
    badge: 'Security',
    badgeColor: 'bg-emerald-50 text-emerald-600',
    iconBg: 'bg-emerald-50',
    border: 'hover:border-emerald-200',
  },
  {
    name: 'JWT Decoder',
    desc: 'Decode JSON Web Tokens and inspect header, payload, expiry countdown and all claims. Security warnings for alg:none and weak algorithms.',
    icon: '🔓',
    href: '/tools/jwt-decoder',
    badge: 'Auth',
    badgeColor: 'bg-sky-50 text-sky-600',
    iconBg: 'bg-sky-50',
    border: 'hover:border-sky-200',
  },
  {
    name: 'Regex Tester',
    desc: 'Test regular expressions with live match highlighting, captured group inspector, pattern explanation engine, replace mode and a full cheatsheet.',
    icon: '⚡',
    href: '/tools/regex-tester',
    badge: 'Developer',
    badgeColor: 'bg-fuchsia-50 text-fuchsia-600',
    iconBg: 'bg-fuchsia-50',
    border: 'hover:border-fuchsia-200',
  },
];

const features = [
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Every tool processes your input in real time inside the browser. There are no API calls, no loading spinners and no waiting around.',
  },
  {
    icon: '🔒',
    title: 'Your Data Stays Private',
    desc: 'Nothing you type or upload is ever sent to a server. All processing happens client-side using JavaScript, making it safe for production tokens, passwords and sensitive files.',
  },
  {
    icon: '🆓',
    title: 'Free With No Limits',
    desc: 'Every single tool is 100% free. No account to create, no credit card to enter, no daily usage cap. Use as much as you need.',
  },
  {
    icon: '📱',
    title: 'Works on Any Device',
    desc: 'TOOLBeans is fully responsive and tested on desktop, tablet and mobile. The same experience whether you are at your workstation or on the go.',
  },
  {
    icon: '🎯',
    title: 'Designed for Developers',
    desc: 'Clean interfaces, keyboard shortcuts, copy buttons on every output, file upload support, and session history built the way developers actually want to work.',
  },
  {
    icon: '🔄',
    title: 'Always Improving',
    desc: 'New tools are added regularly. If there is a utility you need that is not here yet, reach out and it will likely be built next.',
  },
];

const stats = [
  { value: '11',   label: 'Free Tools'       },
  { value: '0',    label: 'Sign-up Required' },
  { value: '100%', label: 'Browser-Based'    },
  { value: '∞',    label: 'Usage Limit'      },
];

// Tool categories for the internal linking section
const categories = [
  {
    label: 'Security Tools',
    color: 'indigo',
    links: [
      { name: 'Password Generator', href: '/tools/password-generator' },
      { name: 'Hash Generator',     href: '/tools/hash-generator'     },
      { name: 'JWT Decoder',        href: '/tools/jwt-decoder'        },
    ],
  },
  {
    label: 'Encoding Tools',
    color: 'green',
    links: [
      { name: 'Base64 Encoder / Decoder', href: '/tools/base64-encoder-decoder' },
      { name: 'URL Encoder / Decoder',    href: '/tools/url-encoder-decoder'    },
      { name: 'URL Shortener',            href: '/tools/url-shortener'          },
    ],
  },
  {
    label: 'Developer Tools',
    color: 'yellow',
    links: [
      { name: 'JSON Formatter',    href: '/tools/json-formatter'    },
      { name: 'SQL Formatter',     href: '/tools/sql-formatter'     },
      { name: 'Regex Tester',      href: '/tools/regex-tester'      },
    ],
  },
  {
    label: 'Text & Utility',
    color: 'orange',
    links: [
      { name: 'Text Case Converter', href: '/tools/text-case-converter' },
      { name: 'QR Code Generator',   href: '/tools/qr-code-generator'   },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">

        {/* ── HERO SECTION ── */}
        <section
          className="relative bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4" />

          <div
            className="relative max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-10 py-12"
            style={{ minHeight: 'calc(100vh - 64px)' }}
          >
            {/* LEFT — Main copy */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-500 font-medium shadow-sm mb-5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                11 free tools no sign-up ever required
              </div>

              {/* Primary H1 — contains main keyword naturally */}
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                Free Online Tools for{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Developers
                </span>{' '}
                and Data Professionals
              </h1>

              <p className="text-base text-slate-500 font-light max-w-lg mb-7 leading-relaxed">
                TOOLBeans brings together the utilities you reach for every day a password
                generator, JSON formatter, QR code creator, JWT decoder, regex tester and more.
                Everything runs in your browser, works instantly and keeps your data private.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm"
                >
                  ⚡ Explore All Tools
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-white hover:border-indigo-300 hover:text-indigo-600 text-slate-700 font-semibold px-5 py-2.5 rounded-xl border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-sm"
                >
                  About TOOLBeans →
                </Link>
              </div>

              {/* Trust stats */}
              <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-slate-100">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Floating tool preview cards */}
            <div className="flex-1 w-full hidden lg:flex flex-col gap-3 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-cyan-200 rounded-3xl blur-3xl opacity-20" />

              {[
                { icon: '🔒', name: 'Password Generator',     sub: 'Secure, cryptographically random',   bg: 'bg-indigo-50'  },
                { icon: '📱', name: 'QR Code Generator',      sub: 'PNG, SVG and PDF download',          bg: 'bg-cyan-50',    ml: true },
                { icon: '{}', name: 'JSON Formatter',         sub: 'Beautify, minify and validate',      bg: 'bg-yellow-50'  },
                { icon: '🔓', name: 'JWT Decoder',            sub: 'Live expiry countdown',              bg: 'bg-sky-50',     ml: true },
                { icon: '⚡', name: 'Regex Tester',           sub: 'Live match highlighting',            bg: 'bg-fuchsia-50' },
              ].map((card) => (
                <div
                  key={card.name}
                  className={'relative bg-white border border-slate-200 rounded-2xl p-4 shadow-md flex items-center gap-3 hover:-translate-y-1 transition-all duration-300' + (card.ml ? ' ml-6' : '')}
                >
                  <div className={'w-10 h-10 ' + card.bg + ' rounded-xl flex items-center justify-center text-xl flex-shrink-0'}>
                    {card.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{card.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
                  </div>
                  <span className="ml-auto text-xs bg-green-50 text-green-600 font-semibold px-2 py-1 rounded-full border border-green-100">
                    Free
                  </span>
                </div>
              ))}

              <div className="relative text-center mt-1">
                <Link
                  href="/tools"
                  className="text-xs text-indigo-600 hover:text-indigo-500 bg-white border border-slate-200 hover:border-indigo-200 rounded-full px-4 py-1.5 shadow-sm font-semibold transition-all"
                >
                  +6 more free tools →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── AD BANNER ── */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="w-full h-20 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement — 728x90
          </div>
        </div>

        {/* ── ALL TOOLS GRID ── */}
        <section className="max-w-6xl mx-auto px-6 py-16" id="tools">
          <div className="text-center mb-14">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              All Tools
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
              11 Free Developer Tools in One Place
            </h2>
            <p className="text-slate-400 font-light max-w-xl mx-auto">
              Every tool runs in your browser. No account needed, no data collected, no cost.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <div
                key={tool.href}
                className={'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group ' + tool.border}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={'w-12 h-12 ' + tool.iconBg + ' rounded-xl flex items-center justify-center text-xl flex-shrink-0'}>
                    {tool.icon}
                  </div>
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + tool.badgeColor}>
                    {tool.badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{tool.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{tool.desc}</p>
                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Open Tool →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY TOOLBEANS ── */}
        <section className="bg-white border-y border-slate-100 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                Why TOOLBeans
              </span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
                Built for Speed and Simplicity
              </h2>
              <p className="text-slate-400 font-light max-w-xl mx-auto">
                No paywalls, no accounts and no tracking. Just the tools developers actually need.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div key={f.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-slate-800 text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TOOLS BY CATEGORY — Internal Linking Section ── */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Browse Tools by Category</h2>
            <p className="text-slate-400 font-light text-sm">Find the right tool faster by what you need to do.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{cat.label}</div>
                <div className="flex flex-col gap-2">
                  {cat.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-indigo-600 hover:translate-x-1 transition-all duration-150 flex items-center gap-2 font-medium"
                    >
                      <span className="text-slate-300">→</span>
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ — Targets featured snippets ── */}
        <section className="bg-slate-50 border-t border-slate-100 py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-400 font-light text-sm">Everything you need to know about TOOLBeans.</p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  q: 'Are all TOOLBeans tools completely free?',
                  a: 'Yes. Every tool on TOOLBeans is 100% free with no usage limits. No account, no credit card and no subscription is ever required. The tools are free to use as much as you need.',
                },
                {
                  q: 'Does TOOLBeans send my data to a server?',
                  a: 'No. All tools run entirely inside your browser using JavaScript. Your input text, passwords, tokens and files never leave your device. This makes TOOLBeans safe to use with sensitive data, production JWT tokens and real passwords.',
                },
                {
                  q: 'Which tools are available on TOOLBeans?',
                  a: 'TOOLBeans currently offers 11 free tools: a password generator, QR code generator, JSON formatter, SQL formatter, Base64 encoder and decoder, URL encoder and decoder, URL shortener, text case converter, SHA256 hash generator, JWT decoder and a regex tester.',
                },
                {
                  q: 'Does TOOLBeans work on mobile?',
                  a: 'Yes. TOOLBeans is fully responsive and works on any screen size desktop, tablet and mobile. All tools are touch-friendly and tested across modern browsers.',
                },
                {
                  q: 'How is TOOLBeans different from other tool sites?',
                  a: 'TOOLBeans focuses on doing fewer things really well. Every tool includes extra features developers actually use like JWT expiry countdown, regex pattern explanation, SQL dialect switching, Base64 JWT decoding and hash comparison rather than a basic implementation that just does the minimum.',
                },
              ].map((faq) => (
                <div key={faq.q} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl px-10 py-16 text-center text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-x-1/3 translate-y-1/3" />
            <div className="relative">
              <h2 className="text-4xl font-extrabold mb-4">Ready to Work Smarter?</h2>
              <p className="text-indigo-100 font-light mb-3 max-w-md mx-auto">
                Explore all 11 free developer tools no sign-up, no limits and no cost.
              </p>
              <p className="text-indigo-200 text-xs mb-8 max-w-sm mx-auto">
                Password generator, JSON formatter, QR code creator, JWT decoder, regex tester
                and more all in one place at TOOLBeans.
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm"
              >
                ⚡ Browse All 11 Tools
              </Link>
            </div>
          </div>
        </section>

        {/* ── SEO FOOTER CONTENT ── */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              Free Online Developer Tools No Signup Required
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              TOOLBeans is a free collection of browser-based tools built for software developers,
              data engineers, DevOps professionals and anyone who works with code or data day to day.
              Every tool on this site runs entirely in your browser using JavaScript, which means
              your input never touches a server and your data stays completely private.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The most popular tools include the free password generator, which uses the Web Crypto
              API to create cryptographically secure passwords, the online JSON formatter which
              validates and beautifies JSON with tree view and auto-repair, and the JWT decoder
              which shows expiry countdown and security warnings for tokens using the alg:none
              vulnerability. The regex tester provides live match highlighting and a pattern
              explanation engine that translates every token into plain English.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Other tools include a QR code generator with PNG, SVG and PDF export, a SQL formatter
              supporting six dialects including MySQL and BigQuery, a Base64 encoder and decoder
              with full JWT token support, a URL shortener with custom aliases and click tracking,
              a SHA-256 hash generator, and a text case converter with twelve output formats.
              All tools are free to use without an account or usage limit.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}