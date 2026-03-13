// app/page.js
import Link from 'next/link';

export const metadata = {
  title: 'TOOLBeans  Free Online Developer Tools',
  description:
    'Free online tools for developers and data professionals. Password generator, JSON formatter, QR code generator, JWT decoder, regex tester, diff checker, Base64 encoder, CSV to SQL and more. No signup, no limits, runs in your browser.',
  alternates: { canonical: 'https://toolbeans.com' },
  openGraph: {
    title: 'TOOLBeans  Free Online Developer Tools',
    description:
      '21 free developer tools  password generator, JSON formatter, QR code generator, JWT decoder, regex tester and more. All private, all browser-based.',
    url: 'https://toolbeans.com',
  },
};

// ── JSON-LD: WebPage + FAQPage ────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://toolbeans.com/#webpage',
      url: 'https://toolbeans.com',
      name: 'TOOLBeans  Free Online Developer Tools',
      description:
        '21 free browser-based tools for developers. Password generator, JSON formatter, QR code generator, JWT decoder, regex tester, diff checker, CSV to SQL converter and more.',
      isPartOf: { '@id': 'https://toolbeans.com/#website' },
      about: { '@id': 'https://toolbeans.com/#organization' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolbeans.com' },
        ],
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
            text: 'No. All 21 tools run entirely in your browser using JavaScript. Your data never leaves your device, making TOOLBeans safe to use with sensitive or production data.',
          },
        },
        {
          '@type': 'Question',
          name: 'What developer tools does TOOLBeans offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'TOOLBeans offers 21 free tools: password generator, QR code generator, JSON formatter, SQL formatter, Base64 encoder/decoder, URL encoder/decoder, URL shortener, text case converter, hash generator, JWT decoder, regex tester, word counter, lorem ipsum generator, color picker, timestamp converter, CSV to SQL converter, HTML to Markdown, code formatter, diff checker, image to Base64, and API request tester.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does TOOLBeans work on mobile?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. TOOLBeans is fully responsive and works on any device  desktop, tablet and mobile. All 21 tools are touch-friendly and tested across modern browsers.',
          },
        },
      ],
    },
  ],
};

// ── 6 FEATURED tools shown on homepage ───────────────────
const featuredTools = [
  {
    name: 'Password Generator',
    desc: 'Generate cryptographically secure passwords with custom length, character sets and strength scoring. Safe for production use.',
    icon: '🔒',
    href: '/tools/password-generator',
    badge: 'Security',
    badgeColor: 'bg-indigo-50 text-indigo-600',
    iconBg: 'bg-indigo-50',
    border: 'hover:border-indigo-200',
  },
  {
    name: 'JSON Formatter',
    desc: 'Beautify, minify, validate and auto-repair JSON. Tree view, file upload and syntax error detection included.',
    icon: '{}',
    href: '/tools/json-formatter',
    badge: 'Developer',
    badgeColor: 'bg-yellow-50 text-yellow-600',
    iconBg: 'bg-yellow-50',
    border: 'hover:border-yellow-200',
  },
  {
    name: 'QR Code Generator',
    desc: 'Create QR codes for URLs, text, emails and phone numbers. Download as PNG, SVG or PDF with customizable colors.',
    icon: '📱',
    href: '/tools/qr-code-generator',
    badge: 'Utility',
    badgeColor: 'bg-cyan-50 text-cyan-600',
    iconBg: 'bg-cyan-50',
    border: 'hover:border-cyan-200',
  },
  {
    name: 'JWT Decoder',
    desc: 'Decode JSON Web Tokens and inspect header, payload, expiry countdown and all claims. Security warnings for weak algorithms.',
    icon: '🔓',
    href: '/tools/jwt-decoder',
    badge: 'Auth',
    badgeColor: 'bg-sky-50 text-sky-600',
    iconBg: 'bg-sky-50',
    border: 'hover:border-sky-200',
  },
  {
    name: 'Regex Tester',
    desc: 'Test regular expressions with live match highlighting, captured group inspector, pattern explanation engine and replace mode.',
    icon: '⚡',
    href: '/tools/regex-tester',
    badge: 'Developer',
    badgeColor: 'bg-fuchsia-50 text-fuchsia-600',
    iconBg: 'bg-fuchsia-50',
    border: 'hover:border-fuchsia-200',
  },
  {
    name: 'Diff Checker',
    desc: 'Compare two files or text blocks and instantly highlight every addition, deletion and change. Split, unified and summary views.',
    icon: '↔️',
    href: '/tools/diff-checker',
    badge: 'Developer',
    badgeColor: 'bg-cyan-50 text-cyan-600',
    iconBg: 'bg-cyan-50',
    border: 'hover:border-cyan-200',
  },
];

// ── WHY section ───────────────────────────────────────────
const features = [
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Every tool processes your input in real time in the browser. No API calls, no loading spinners, no waiting.',
  },
  {
    icon: '🔒',
    title: 'Your Data Stays Private',
    desc: 'Nothing you type or upload is sent to a server. All processing is client-side  safe for production tokens, passwords and sensitive files.',
  },
  {
    icon: '🆓',
    title: 'Free With No Limits',
    desc: 'All 21 tools are 100% free. No account, no credit card, no daily cap. Use as much as you need.',
  },
  {
    icon: '📱',
    title: 'Works on Any Device',
    desc: 'Fully responsive across desktop, tablet and mobile. The same experience wherever you work.',
  },
  {
    icon: '🎯',
    title: 'Designed for Developers',
    desc: 'Clean interfaces, copy buttons on every output, file upload support and session history  built the way developers work.',
  },
  {
    icon: '🔄',
    title: 'Always Growing',
    desc: 'New tools are added regularly. If you need something that is not here yet, reach out and it will likely be built next.',
  },
];

// ── Stats ─────────────────────────────────────────────────
const stats = [
  { value: '21',   label: 'Free Tools'        },
  { value: '0',    label: 'Sign-up Required'  },
  { value: '100%', label: 'Browser-Based'     },
  { value: '∞',    label: 'Usage Limit'       },
];


export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
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
            {/* LEFT */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-500 font-medium shadow-sm mb-5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                21 free tools  no sign-up ever required
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                Free Online Tools for{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Developers
                </span>{' '}
                and Data Professionals
              </h1>

              <p className="text-base text-slate-500 font-light max-w-lg mb-7 leading-relaxed">
                TOOLBeans gives you 21 browser-based utilities  password generator, JSON formatter,
                QR code creator, JWT decoder, diff checker, CSV to SQL converter and more.
                Instant results, zero data sent to any server, completely free.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm"
                >
                  ⚡ Explore All 21 Tools
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 bg-white hover:border-indigo-300 hover:text-indigo-600 text-slate-700 font-semibold px-5 py-2.5 rounded-xl border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-sm"
                >
                  Read the Blog →
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-slate-100">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT  floating preview cards */}
            <div className="flex-1 w-full hidden lg:flex flex-col gap-3 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-cyan-200 rounded-3xl blur-3xl opacity-20" />
              {[
                { icon: '🔒', name: 'Password Generator',  sub: 'Cryptographically secure',     bg: 'bg-indigo-50'  },
                { icon: '📱', name: 'QR Code Generator',   sub: 'PNG, SVG and PDF export',      bg: 'bg-cyan-50',    ml: true },
                { icon: '{}', name: 'JSON Formatter',      sub: 'Beautify, minify, validate',   bg: 'bg-yellow-50'  },
                { icon: '↔️', name: 'Diff Checker',        sub: 'Compare files instantly',      bg: 'bg-teal-50',    ml: true },
                { icon: '⚡', name: 'Regex Tester',        sub: 'Live match highlighting',      bg: 'bg-fuchsia-50' },
              ].map((card) => (
                <div
                  key={card.name}
                  className={'relative bg-white border border-slate-200 rounded-2xl p-4 shadow-md flex items-center gap-3 hover:-translate-y-1 transition-all duration-300' + (card.ml ? ' ml-6' : '')}
                >
                  <div className={'w-10 h-10 ' + card.bg + ' rounded-xl flex items-center justify-center text-xl flex-shrink-0 select-none'}>
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
                  +16 more free tools →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            AD BANNER
        ════════════════════════════════════════ */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="w-full h-20 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement  728×90
          </div>
        </div>

        {/* ════════════════════════════════════════
            FEATURED 6 TOOLS
        ════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-16" id="tools">
          <div className="text-center mb-14">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              Popular Tools
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
              The Most-Used Tools on TOOLBeans
            </h2>
            <p className="text-slate-400 font-light max-w-xl mx-auto">
              Every tool runs in your browser  no account needed, no data collected, no cost.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredTools.map((tool) => (
              <div
                key={tool.href}
                className={'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group ' + tool.border}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={'w-12 h-12 ' + tool.iconBg + ' rounded-xl flex items-center justify-center text-xl flex-shrink-0 select-none'}>
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

          {/* View All CTA */}
          <div className="text-center mt-10">
            <p className="text-sm text-slate-400 mb-4">
              Showing 6 of 21 free tools
            </p>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200"
            >
              View All 21 Free Tools →
            </Link>
          </div>
        </section>

        {/* ════════════════════════════════════════
            WHY TOOLBEANS
        ════════════════════════════════════════ */}
        <section className="bg-white border-y border-slate-100 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                Why TOOLBeans
              </span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
                Built for Speed, Privacy and Simplicity
              </h2>
              <p className="text-slate-400 font-light max-w-xl mx-auto">
                No paywalls, no accounts, no tracking. Just the developer tools you actually need.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div key={f.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <div className="text-3xl mb-4 select-none">{f.icon}</div>
                  <h3 className="font-bold text-slate-800 text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            ALL TOOLS TAG CLOUD  SEO internal links
        ════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">All 21 Free Tools</p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Password Generator',       href: '/tools/password-generator',     icon: '🔒' },
                { name: 'QR Code Generator',        href: '/tools/qr-code-generator',      icon: '📱' },
                { name: 'JSON Formatter',           href: '/tools/json-formatter',         icon: '{}' },
                { name: 'SQL Formatter',            href: '/tools/sql-formatter',          icon: '🗄️' },
                { name: 'Base64 Encoder / Decoder', href: '/tools/base64-encoder-decoder', icon: '🔐' },
                { name: 'URL Encoder / Decoder',    href: '/tools/url-encoder-decoder',    icon: '🔗' },
                { name: 'URL Shortener',            href: '/tools/url-shortener',          icon: '✂️' },
                { name: 'Text Case Converter',      href: '/tools/text-case-converter',    icon: '🔤' },
                { name: 'Hash Generator',           href: '/tools/hash-generator',         icon: '#️⃣' },
                { name: 'JWT Decoder',              href: '/tools/jwt-decoder',            icon: '🔓' },
                { name: 'Regex Tester',             href: '/tools/regex-tester',           icon: '⚡' },
                { name: 'Word Counter',             href: '/tools/word-counter',           icon: '📝' },
                { name: 'Lorem Ipsum Generator',    href: '/tools/lorem-ipsum',            icon: '✍️' },
                { name: 'Timestamp Converter',      href: '/tools/timestamp-converter',    icon: '⏱️' },
                { name: 'Color Picker',             href: '/tools/color-picker',           icon: '🎨' },
                { name: 'CSV to SQL',               href: '/tools/csv-to-sql',             icon: '📊' },
                { name: 'HTML to Markdown',         href: '/tools/html-to-markdown',       icon: '🔄' },
                { name: 'Code Formatter',           href: '/tools/code-formatter',         icon: '✨' },
                { name: 'API Tester',               href: '/tools/api-request-tester',     icon: '📡' },
                { name: 'Image to Base64',          href: '/tools/image-to-base64',        icon: '🖼️' },
                { name: 'Diff Checker',             href: '/tools/diff-checker',           icon: '↔️' },
              ].map((t) => (
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
        </section>

        {/* ════════════════════════════════════════
            FAQ
        ════════════════════════════════════════ */}
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
                  a: 'Yes. All 21 tools on TOOLBeans are 100% free with no usage limits. No account, no credit card and no subscription is ever required.',
                },
                {
                  q: 'Does TOOLBeans send my data to a server?',
                  a: 'No. Every tool runs entirely in your browser using JavaScript. Your passwords, tokens, code and files never leave your device  making TOOLBeans safe for sensitive and production data.',
                },
                {
                  q: 'What tools does TOOLBeans offer?',
                  a: 'TOOLBeans offers 21 free tools: password generator, QR code generator, JSON formatter, SQL formatter, Base64 encoder/decoder, URL encoder/decoder, URL shortener, text case converter, hash generator, JWT decoder, regex tester, word counter, lorem ipsum generator, color picker, timestamp converter, CSV to SQL converter, HTML to Markdown, code formatter, diff checker, image to Base64, and API request tester.',
                },
                {
                  q: 'Does TOOLBeans work on mobile?',
                  a: 'Yes. TOOLBeans is fully responsive and works on desktop, tablet and mobile. All tools are touch-friendly and tested across modern browsers.',
                },
                {
                  q: 'How is TOOLBeans different from other tool sites?',
                  a: 'TOOLBeans is built for real-world developer workflows. Every tool goes beyond the basics  JWT expiry countdown, regex pattern explanation, SQL dialect switching, LCS-powered diff, batch Base64 image processing and more. No bloat, no paywalls.',
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

        {/* ════════════════════════════════════════
            CTA
        ════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl px-10 py-16 text-center text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-x-1/3 translate-y-1/3" />
            <div className="relative">
              <h2 className="text-4xl font-extrabold mb-4">Ready to Work Smarter?</h2>
              <p className="text-indigo-100 font-light mb-3 max-w-md mx-auto">
                21 free developer tools  no sign-up, no limits, no cost.
              </p>
              <p className="text-indigo-200 text-xs mb-8 max-w-sm mx-auto">
                Password generator, JSON formatter, diff checker, JWT decoder, CSV to SQL converter
                and 16 more  all in one place at TOOLBeans.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm"
                >
                  ⚡ Browse All 21 Tools
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200 text-sm"
                >
                  Read the Blog →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SEO TEXT BLOCK
        ════════════════════════════════════════ */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              21 Free Online Developer Tools  No Sign-up Required
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              TOOLBeans is a free collection of 21 browser-based tools built for software developers,
              data engineers, DevOps professionals and anyone who works with code or data every day.
              Every tool runs entirely in your browser using JavaScript  your input never touches a
              server and your data stays completely private.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The most popular tools include the free{' '}
              <Link href="/tools/password-generator" className="text-indigo-600 hover:underline">password generator</Link>,
              which uses the Web Crypto API to create cryptographically secure passwords, the{' '}
              <Link href="/tools/json-formatter" className="text-indigo-600 hover:underline">JSON formatter</Link>{' '}
              which validates and beautifies JSON with tree view and auto-repair, and the{' '}
              <Link href="/tools/jwt-decoder" className="text-indigo-600 hover:underline">JWT decoder</Link>{' '}
              which shows expiry countdown and security warnings. The{' '}
              <Link href="/tools/diff-checker" className="text-indigo-600 hover:underline">diff checker</Link>{' '}
              uses a custom LCS algorithm to highlight every change between two texts or files.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Other tools include a{' '}
              <Link href="/tools/qr-code-generator" className="text-indigo-600 hover:underline">QR code generator</Link>,{' '}
              <Link href="/tools/sql-formatter" className="text-indigo-600 hover:underline">SQL formatter</Link> supporting six dialects,{' '}
              <Link href="/tools/csv-to-sql" className="text-indigo-600 hover:underline">CSV to SQL converter</Link>,{' '}
              <Link href="/tools/regex-tester" className="text-indigo-600 hover:underline">regex tester</Link> with pattern explanation,{' '}
              <Link href="/tools/image-to-base64" className="text-indigo-600 hover:underline">image to Base64</Link>,{' '}
              <Link href="/tools/api-request-tester" className="text-indigo-600 hover:underline">API request tester</Link>,{' '}
              <Link href="/tools/color-picker" className="text-indigo-600 hover:underline">color picker</Link>,{' '}
              <Link href="/tools/timestamp-converter" className="text-indigo-600 hover:underline">timestamp converter</Link>{' '}
              and more. All tools are free with no account or usage limit.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}