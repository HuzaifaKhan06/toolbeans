// app/page.js
import Link from 'next/link';

export const metadata = {
  title: 'TOOLBeans Free Online Developer & PDF Tools',
  description:
    'Free online tools for developers and data professionals. Password generator, JSON formatter, QR code generator, JWT decoder, Word to PDF, Excel to PDF, PowerPoint to PDF and more. No signup, no limits.',
  alternates: { canonical: 'https://toolbeans.com' },
  openGraph: {
    title: 'TOOLBeans Free Online Developer & PDF Tools',
    description:
      '30 free tools password generator, JSON formatter, QR code generator, JWT decoder, Word to PDF, Excel to PDF, PowerPoint to PDF and more. All private, all browser-based.',
    url: 'https://toolbeans.com',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://toolbeans.com/#webpage',
      url: 'https://toolbeans.com',
      name: 'TOOLBeans Free Online Developer & PDF Tools',
      description: '30 free browser-based tools for developers. Password generator, JSON formatter, JWT decoder, diff checker, Word to PDF, Excel to PDF, PowerPoint to PDF and more.',
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
            text: 'Browser-based tools like JSON Formatter, Password Generator and Regex Tester run entirely in your browser your data never leaves your device. Server-side tools like Word to PDF, Excel to PDF and PowerPoint to PDF process your file on a secure server and delete it immediately after conversion.',
          },
        },
        {
          '@type': 'Question',
          name: 'What tools does TOOLBeans offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'TOOLBeans offers 30 free tools: password generator, QR code generator, JSON formatter, SQL formatter, Base64 encoder/decoder, URL encoder/decoder, URL shortener, text case converter, hash generator, JWT decoder, regex tester, word counter, lorem ipsum generator, color picker, timestamp converter, CSV to SQL, HTML to Markdown, code formatter, diff checker, image to Base64, API tester, JPG to PDF, PNG to PDF, image to PDF, TXT to PDF, SVG to PDF, HTML to PDF, Word to PDF, Excel to PDF and PowerPoint to PDF.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does TOOLBeans work on mobile?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. TOOLBeans is fully responsive and works on any device desktop, tablet and mobile. All 30 tools are touch-friendly and tested across modern browsers.',
          },
        },
      ],
    },
  ],
};

const featuredTools = [
  { name: 'Password Generator', desc: 'Generate cryptographically secure passwords with custom length, character sets and strength scoring. Safe for production use.', icon: '🔒', href: '/tools/password-generator', badge: 'Security',  badgeColor: 'bg-indigo-50 text-indigo-600',  iconBg: 'bg-indigo-50',  border: 'hover:border-indigo-200'  },
  { name: 'JSON Formatter',     desc: 'Beautify, minify, validate and auto-repair JSON. Tree view, file upload and syntax error detection included.',                  icon: '{}', href: '/tools/json-formatter',     badge: 'Developer', badgeColor: 'bg-yellow-50 text-yellow-600', iconBg: 'bg-yellow-50',  border: 'hover:border-yellow-200'  },
  { name: 'Word to PDF',        desc: 'Convert Word .docx files to PDF with fonts, tables, images and headers fully preserved. Powered by professional conversion.',   icon: '📝', href: '/tools/word-to-pdf',        badge: 'PDF',       badgeColor: 'bg-red-50 text-red-600',       iconBg: 'bg-red-50',     border: 'hover:border-red-200'     },
  { name: 'JWT Decoder',        desc: 'Decode JSON Web Tokens and inspect header, payload, expiry countdown and all claims. Security warnings for weak algorithms.',   icon: '🔓', href: '/tools/jwt-decoder',        badge: 'Auth',      badgeColor: 'bg-sky-50 text-sky-600',       iconBg: 'bg-sky-50',     border: 'hover:border-sky-200'     },
  { name: 'Excel to PDF',       desc: 'Convert Excel spreadsheets to PDF with all cells, borders and charts preserved. Professional quality output.',                  icon: '📊', href: '/tools/excel-to-pdf',       badge: 'PDF',       badgeColor: 'bg-red-50 text-red-600',       iconBg: 'bg-red-50',     border: 'hover:border-red-200'     },
  { name: 'Diff Checker',       desc: 'Compare two files or text blocks and instantly highlight every addition, deletion and change. Split, unified and summary views.', icon: '↔️', href: '/tools/diff-checker',      badge: 'Developer', badgeColor: 'bg-cyan-50 text-cyan-600',     iconBg: 'bg-cyan-50',    border: 'hover:border-cyan-200'    },
];

const features = [
  { icon: '⚡', title: 'Instant Results',         desc: 'Browser tools process your input in real time no API calls, no loading spinners, no waiting.'                                               },
  { icon: '🔒', title: 'Your Data Stays Private',  desc: 'Browser tools run client-side nothing sent to any server. PDF conversion tools delete your file immediately after download.'                },
  { icon: '🆓', title: 'Free With No Limits',      desc: 'All 30 tools are 100% free. No account, no credit card, no daily cap. Use as much as you need.'                                               },
  { icon: '📱', title: 'Works on Any Device',      desc: 'Fully responsive across desktop, tablet and mobile. The same experience wherever you work.'                                                   },
  { icon: '📄', title: 'Professional PDF Tools',   desc: 'Word, Excel and PowerPoint to PDF powered by LibreOffice the same engine used by top PDF sites. Fonts, tables and layouts all preserved.'  },
  { icon: '🔄', title: 'Always Growing',           desc: 'New tools are added regularly. If you need something not here yet, reach out and it will likely be built next.'                               },
];

const stats = [
  { value: '30',   label: 'Free Tools'       },
  { value: '0',    label: 'Sign-up Required' },
  { value: '100%', label: 'Free Forever'     },
  { value: '∞',    label: 'Usage Limit'      },
];

// All 30 tools for tag cloud
const allTools = [
  { name: 'Password Generator',     href: '/tools/password-generator',     icon: '🔒' },
  { name: 'QR Code Generator',      href: '/tools/qr-code-generator',      icon: '📱' },
  { name: 'JSON Formatter',         href: '/tools/json-formatter',         icon: '{}' },
  { name: 'SQL Formatter',          href: '/tools/sql-formatter',          icon: '🗄️' },
  { name: 'Base64 Encoder/Decoder', href: '/tools/base64-encoder-decoder', icon: '🔐' },
  { name: 'URL Encoder/Decoder',    href: '/tools/url-encoder-decoder',    icon: '🔗' },
  { name: 'URL Shortener',          href: '/tools/url-shortener',          icon: '✂️' },
  { name: 'Text Case Converter',    href: '/tools/text-case-converter',    icon: '🔤' },
  { name: 'Hash Generator',         href: '/tools/hash-generator',         icon: '#️⃣' },
  { name: 'JWT Decoder',            href: '/tools/jwt-decoder',            icon: '🔓' },
  { name: 'Regex Tester',           href: '/tools/regex-tester',           icon: '⚡' },
  { name: 'Word Counter',           href: '/tools/word-counter',           icon: '📝' },
  { name: 'Lorem Ipsum Generator',  href: '/tools/lorem-ipsum',            icon: '✍️' },
  { name: 'Timestamp Converter',    href: '/tools/timestamp-converter',    icon: '⏱️' },
  { name: 'Color Picker',           href: '/tools/color-picker',           icon: '🎨' },
  { name: 'CSV to SQL',             href: '/tools/csv-to-sql',             icon: '📊' },
  { name: 'HTML to Markdown',       href: '/tools/html-to-markdown',       icon: '🔄' },
  { name: 'Code Formatter',         href: '/tools/code-formatter',         icon: '✨' },
  { name: 'API Tester',             href: '/tools/api-request-tester',     icon: '📡' },
  { name: 'Image to Base64',        href: '/tools/image-to-base64',        icon: '🖼️' },
  { name: 'Diff Checker',           href: '/tools/diff-checker',           icon: '↔️' },
  { name: 'JPG to PDF',             href: '/tools/jpg-to-pdf',             icon: '📸' },
  { name: 'PNG to PDF',             href: '/tools/png-to-pdf',             icon: '🖼️' },
  { name: 'Image to PDF',           href: '/tools/image-to-pdf',           icon: '🗂️' },
  { name: 'TXT to PDF',             href: '/tools/txt-to-pdf',             icon: '📄' },
  { name: 'SVG to PDF',             href: '/tools/svg-to-pdf',             icon: '✏️' },
  { name: 'HTML to PDF',            href: '/tools/html-to-pdf',            icon: '🌐' },
  { name: 'Word to PDF',            href: '/tools/word-to-pdf',            icon: '📝' },
  { name: 'Excel to PDF',           href: '/tools/excel-to-pdf',           icon: '📊' },
  { name: 'PowerPoint to PDF',      href: '/tools/powerpoint-to-pdf',      icon: '📽️' },
];

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen">

        {/* HERO */}
        <section className="relative bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4" />

          <div className="relative max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-10 py-12" style={{ minHeight: 'calc(100vh - 64px)' }}>

            {/* LEFT */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-500 font-medium shadow-sm mb-5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                30 free tools no sign-up ever required
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                Free Online Tools for{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                  Developers
                </span>{' '}
                and Data Professionals
              </h1>

              <p className="text-base text-slate-500 font-light max-w-lg mb-7 leading-relaxed">
                TOOLBeans gives you 30 free utilities password generator, JSON formatter,
                QR code creator, JWT decoder, diff checker, Word to PDF, Excel to PDF,
                PowerPoint to PDF and more. Instant results, completely free.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/tools" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm">
                  ⚡ Explore All 30 Tools
                </Link>
                <Link href="/blog" className="inline-flex items-center gap-2 bg-white hover:border-indigo-300 hover:text-indigo-600 text-slate-700 font-semibold px-5 py-2.5 rounded-xl border border-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-sm">
                  Read the Blog →
                </Link>
              </div>

              <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-slate-100">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT floating cards */}
            <div className="flex-1 w-full hidden lg:flex flex-col gap-3 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-cyan-200 rounded-3xl blur-3xl opacity-20" />
              {[
                { icon: '🔒', name: 'Password Generator',  sub: 'Cryptographically secure',   bg: 'bg-indigo-50'  },
                { icon: '📝', name: 'Word to PDF',          sub: 'LibreOffice quality output', bg: 'bg-red-50',     ml: true },
                { icon: '{}', name: 'JSON Formatter',       sub: 'Beautify, minify, validate', bg: 'bg-yellow-50'  },
                { icon: '📊', name: 'Excel to PDF',         sub: 'Cells and charts preserved', bg: 'bg-red-50',     ml: true },
                { icon: '⚡', name: 'Regex Tester',         sub: 'Live match highlighting',    bg: 'bg-fuchsia-50' },
              ].map((card) => (
                <div key={card.name} className={'relative bg-white border border-slate-200 rounded-2xl p-4 shadow-md flex items-center gap-3 hover:-translate-y-1 transition-all duration-300' + (card.ml ? ' ml-6' : '')}>
                  <div className={'w-10 h-10 ' + card.bg + ' rounded-xl flex items-center justify-center text-xl flex-shrink-0 select-none'}>{card.icon}</div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{card.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{card.sub}</div>
                  </div>
                  <span className="ml-auto text-xs bg-green-50 text-green-600 font-semibold px-2 py-1 rounded-full border border-green-100">Free</span>
                </div>
              ))}
              <div className="relative text-center mt-1">
                <Link href="/tools" className="text-xs text-indigo-600 hover:text-indigo-500 bg-white border border-slate-200 hover:border-indigo-200 rounded-full px-4 py-1.5 shadow-sm font-semibold transition-all">
                  +25 more free tools →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* AD */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="w-full h-20 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement 728×90
          </div>
        </div>

        {/* FEATURED 6 TOOLS */}
        <section className="max-w-6xl mx-auto px-6 py-16" id="tools">
          <div className="text-center mb-14">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Popular Tools</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">The Most-Used Tools on TOOLBeans</h2>
            <p className="text-slate-400 font-light max-w-xl mx-auto">Developer tools run in your browser. PDF tools use our secure server files deleted immediately after conversion.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredTools.map((tool) => (
              <div key={tool.href} className={'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group ' + tool.border}>
                <div className="flex items-start justify-between mb-4">
                  <div className={'w-12 h-12 ' + tool.iconBg + ' rounded-xl flex items-center justify-center text-xl flex-shrink-0 select-none'}>{tool.icon}</div>
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + tool.badgeColor}>{tool.badge}</span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{tool.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{tool.desc}</p>
                <Link href={tool.href} className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200">
                  Open Tool →
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-slate-400 mb-4">Showing 6 of 30 free tools</p>
            <Link href="/tools" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200">
              View All 30 Free Tools →
            </Link>
          </div>
        </section>

        {/* WHY TOOLBEANS */}
        <section className="bg-white border-y border-slate-100 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Why TOOLBeans</span>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Built for Speed, Privacy and Simplicity</h2>
              <p className="text-slate-400 font-light max-w-xl mx-auto">No paywalls, no accounts, no tracking. Just the tools you actually need.</p>
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

        {/* ALL 30 TOOLS TAG CLOUD */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">All 30 Free Tools</p>
            <div className="flex flex-wrap gap-2">
              {allTools.map((t) => (
                <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-150">
                  <span className="text-sm leading-none">{t.icon}</span>
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 border-t border-slate-100 py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-slate-400 font-light text-sm">Everything you need to know about TOOLBeans.</p>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { q: 'Are all TOOLBeans tools completely free?',         a: 'Yes. All 30 tools on TOOLBeans are 100% free with no usage limits. No account, no credit card and no subscription is ever required.' },
                { q: 'Do TOOLBeans tools send my data to a server?',     a: 'Browser-based tools like JSON Formatter and Password Generator run entirely in your browser nothing is sent to any server. PDF conversion tools like Word to PDF process your file on our secure server and delete it immediately after your PDF downloads.' },
                { q: 'What PDF tools does TOOLBeans offer?',             a: 'TOOLBeans offers 9 free PDF tools: Word to PDF, Excel to PDF, PowerPoint to PDF, JPG to PDF, PNG to PDF, Image to PDF, TXT to PDF, SVG to PDF and HTML to PDF. Word, Excel and PowerPoint conversions are powered by LibreOffice for professional quality output.' },
                { q: 'What developer tools does TOOLBeans offer?',       a: 'TOOLBeans offers 21 browser-based developer tools: password generator, QR code generator, JSON formatter, SQL formatter, Base64 encoder/decoder, URL encoder/decoder, URL shortener, text case converter, hash generator, JWT decoder, regex tester, word counter, lorem ipsum generator, color picker, timestamp converter, CSV to SQL, HTML to Markdown, code formatter, diff checker, image to Base64 and API tester.' },
                { q: 'Does TOOLBeans work on mobile?',                   a: 'Yes. TOOLBeans is fully responsive and works on desktop, tablet and mobile. All 30 tools are touch-friendly and tested across modern browsers.' },
              ].map((faq) => (
                <div key={faq.q} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl px-10 py-16 text-center text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-x-1/3 translate-y-1/3" />
            <div className="relative">
              <h2 className="text-4xl font-extrabold mb-4">Ready to Work Smarter?</h2>
              <p className="text-indigo-100 font-light mb-3 max-w-md mx-auto">30 free tools developer utilities + professional PDF conversion. No sign-up, no limits, no cost.</p>
              <p className="text-indigo-200 text-xs mb-8 max-w-sm mx-auto">Password generator, JSON formatter, Word to PDF, Excel to PDF, PowerPoint to PDF and 25 more all in one place.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/tools" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm">
                  ⚡ Browse All 30 Tools
                </Link>
                <Link href="/blog" className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/30 font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200 text-sm">
                  Read the Blog →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SEO TEXT BLOCK */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900 mb-4">
              30 Free Online Tools Developer Utilities and PDF Converters
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              TOOLBeans is a free collection of 30 tools for software developers, data engineers
              and anyone who works with code, documents or data. The 21 browser-based tools run
              entirely in your browser nothing is uploaded to any server, making them safe for
              production data, JWT tokens, passwords and sensitive files.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              The 9 PDF conversion tools are powered by LibreOffice on a secure server the same
              engine used by professional PDF sites. They include{' '}
              <Link href="/tools/word-to-pdf"       className="text-indigo-600 hover:underline">Word to PDF</Link>,{' '}
              <Link href="/tools/excel-to-pdf"      className="text-indigo-600 hover:underline">Excel to PDF</Link>,{' '}
              <Link href="/tools/powerpoint-to-pdf" className="text-indigo-600 hover:underline">PowerPoint to PDF</Link>,{' '}
              <Link href="/tools/jpg-to-pdf"        className="text-indigo-600 hover:underline">JPG to PDF</Link>,{' '}
              <Link href="/tools/png-to-pdf"        className="text-indigo-600 hover:underline">PNG to PDF</Link>,{' '}
              <Link href="/tools/image-to-pdf"      className="text-indigo-600 hover:underline">Image to PDF</Link>,{' '}
              <Link href="/tools/txt-to-pdf"        className="text-indigo-600 hover:underline">TXT to PDF</Link>,{' '}
              <Link href="/tools/svg-to-pdf"        className="text-indigo-600 hover:underline">SVG to PDF</Link>{' '}
              and{' '}
              <Link href="/tools/html-to-pdf"       className="text-indigo-600 hover:underline">HTML to PDF</Link>.
              Files are deleted immediately after conversion never stored.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Developer tools include a{' '}
              <Link href="/tools/password-generator" className="text-indigo-600 hover:underline">password generator</Link>,{' '}
              <Link href="/tools/json-formatter"     className="text-indigo-600 hover:underline">JSON formatter</Link>,{' '}
              <Link href="/tools/jwt-decoder"        className="text-indigo-600 hover:underline">JWT decoder</Link>,{' '}
              <Link href="/tools/diff-checker"       className="text-indigo-600 hover:underline">diff checker</Link>,{' '}
              <Link href="/tools/regex-tester"       className="text-indigo-600 hover:underline">regex tester</Link>,{' '}
              <Link href="/tools/csv-to-sql"         className="text-indigo-600 hover:underline">CSV to SQL converter</Link>,{' '}
              <Link href="/tools/qr-code-generator"  className="text-indigo-600 hover:underline">QR code generator</Link>{' '}
              and more. All tools are permanently free with no account or usage limit.
            </p>
          </div>
        </section>

      </div>
    </>
  );
}