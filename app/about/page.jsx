// app/about/page.jsx
import Link from 'next/link';

export const metadata = {
  title: 'About TOOLBeans  Free Browser-Based Developer Tools',
  description:
    'TOOLBeans is a free platform of 21 browser-based developer tools. No signup, no data collection, no cost. Learn about our mission, our tools, and why privacy comes first.',
  alternates: { canonical: 'https://toolbeans.com/about' },
  openGraph: {
    title: 'About TOOLBeans  Free Browser-Based Developer Tools',
    description:
      '21 free tools for developers and data professionals. Password generator, JSON formatter, diff checker, JWT decoder, CSV to SQL and more. All private, all browser-based.',
    url: 'https://toolbeans.com/about',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://toolbeans.com/about',
  url: 'https://toolbeans.com/about',
  name: 'About TOOLBeans',
  description: 'TOOLBeans is a free platform of 21 browser-based developer tools. No signup, no data collection, no cost.',
  isPartOf: { '@id': 'https://toolbeans.com/#website' },
  about: { '@id': 'https://toolbeans.com/#organization' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://toolbeans.com'       },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://toolbeans.com/about' },
    ],
  },
};

const stats = [
  { value: '21',   label: 'Free Tools',     icon: '🛠️' },
  { value: '0',    label: 'Accounts Needed', icon: '🔓' },
  { value: '100%', label: 'Client-Side',     icon: '🖥️' },
  { value: '∞',    label: 'Always Free',     icon: '♾️' },
];

const values = [
  {
    icon: '⚡',
    title: 'Speed First',
    desc: 'Every tool runs instantly in the browser  no loading screens, no server round-trips, no waiting.',
  },
  {
    icon: '🔒',
    title: 'Privacy by Default',
    desc: 'We never collect, store or transmit what you enter. Your passwords, tokens and data stay on your device.',
  },
  {
    icon: '🆓',
    title: 'Free Forever',
    desc: 'All 21 tools are free with no usage limits. We sustain the platform through non-intrusive advertising.',
  },
  {
    icon: '🎯',
    title: 'Simplicity',
    desc: 'No bloated UIs, no confusing options. Each tool does one thing and does it really well.',
  },
  {
    icon: '🌍',
    title: 'Accessible to All',
    desc: 'No sign-up, no paywall, no region restrictions. Anyone with a browser can use TOOLBeans.',
  },
  {
    icon: '🔄',
    title: 'Constantly Growing',
    desc: 'We listen to feedback and regularly ship new tools. 21 and counting  more coming soon.',
  },
];

const allTools = [
  { name: 'Password Generator',     href: '/tools/password-generator',     cat: 'Security',  desc: 'Cryptographically secure passwords'      },
  { name: 'Hash Generator',         href: '/tools/hash-generator',         cat: 'Security',  desc: 'MD5, SHA-1, SHA-256, SHA-512 & HMAC'     },
  { name: 'JWT Decoder',            href: '/tools/jwt-decoder',            cat: 'Auth',      desc: 'Decode tokens with expiry countdown'     },
  { name: 'Base64 Encoder/Decoder', href: '/tools/base64-encoder-decoder', cat: 'Encoding',  desc: 'Base64 & Base64URL encode/decode'        },
  { name: 'URL Encoder/Decoder',    href: '/tools/url-encoder-decoder',    cat: 'Encoding',  desc: 'URL components & query string builder'   },
  { name: 'Image to Base64',        href: '/tools/image-to-base64',        cat: 'Encoding',  desc: 'Embed images as Base64 in HTML or CSS'   },
  { name: 'JSON Formatter',         href: '/tools/json-formatter',         cat: 'Developer', desc: 'Beautify, minify, validate & repair JSON' },
  { name: 'Regex Tester',           href: '/tools/regex-tester',           cat: 'Developer', desc: 'Live highlighting + pattern explainer'   },
  { name: 'Diff Checker',           href: '/tools/diff-checker',           cat: 'Developer', desc: 'Compare two texts or files instantly'    },
  { name: 'Code Formatter',         href: '/tools/code-formatter',         cat: 'Developer', desc: 'Format JS, TS, CSS, HTML, JSON & more'   },
  { name: 'API Request Tester',     href: '/tools/api-request-tester',     cat: 'Developer', desc: 'Test REST APIs from your browser'        },
  { name: 'SQL Formatter',          href: '/tools/sql-formatter',          cat: 'Data',      desc: 'MySQL, PostgreSQL, BigQuery & more'      },
  { name: 'CSV to SQL',             href: '/tools/csv-to-sql',             cat: 'Data',      desc: 'Generate INSERT/CREATE from CSV files'   },
  { name: 'Word Counter',           href: '/tools/word-counter',           cat: 'Writing',   desc: 'Words, chars, sentences & reading time'  },
  { name: 'Text Case Converter',    href: '/tools/text-case-converter',    cat: 'Writing',   desc: 'camelCase, snake_case, Title Case & more' },
  { name: 'Lorem Ipsum Generator',  href: '/tools/lorem-ipsum',            cat: 'Writing',   desc: 'Placeholder text for designs & mockups'  },
  { name: 'HTML to Markdown',       href: '/tools/html-to-markdown',       cat: 'Writing',   desc: 'Convert HTML to clean Markdown'          },
  { name: 'QR Code Generator',      href: '/tools/qr-code-generator',      cat: 'Utility',   desc: 'PNG, SVG & PDF with custom colors'       },
  { name: 'URL Shortener',          href: '/tools/url-shortener',          cat: 'Utility',   desc: 'Short links with custom aliases'         },
  { name: 'Color Picker',           href: '/tools/color-picker',           cat: 'Utility',   desc: 'HEX, RGB, HSL palette generator'         },
  { name: 'Timestamp Converter',    href: '/tools/timestamp-converter',    cat: 'Utility',   desc: 'Unix timestamp to date and back'         },
];

const catColor = {
  Security:  'bg-indigo-50 text-indigo-600 border-indigo-100',
  Auth:      'bg-sky-50 text-sky-600 border-sky-100',
  Encoding:  'bg-green-50 text-green-600 border-green-100',
  Developer: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  Data:      'bg-rose-50 text-rose-600 border-rose-100',
  Writing:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  Utility:   'bg-cyan-50 text-cyan-600 border-cyan-100',
};

const useCases = [
  {
    icon: '👨‍💻',
    role: 'Software Developers',
    desc: 'Format JSON responses, decode JWT tokens, test regex patterns, compare code diffs and format SQL queries  all without leaving the browser.',
    tools: ['JSON Formatter', 'JWT Decoder', 'Regex Tester', 'Diff Checker', 'SQL Formatter'],
  },
  {
    icon: '📊',
    role: 'Data Engineers',
    desc: 'Convert CSV files to SQL INSERT statements, format complex queries, generate Unix timestamps and encode data for pipelines.',
    tools: ['CSV to SQL', 'SQL Formatter', 'Timestamp Converter', 'Base64 Encoder/Decoder'],
  },
  {
    icon: '🎨',
    role: 'Designers & Content Creators',
    desc: 'Generate placeholder text, pick color palettes, create QR codes for print materials and convert images to Base64 for self-contained HTML.',
    tools: ['Lorem Ipsum Generator', 'Color Picker', 'QR Code Generator', 'Image to Base64'],
  },
  {
    icon: '🔐',
    role: 'Security Professionals',
    desc: 'Generate cryptographically secure passwords, compute SHA-256 hashes for file verification and decode JWT tokens for security audits.',
    tools: ['Password Generator', 'Hash Generator', 'JWT Decoder'],
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">

        {/* ── HERO ── */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-600">About</span>
            </nav>
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              About Us
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5">
              Built by Developers,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                for Developers
              </span>
            </h1>
            <p className="text-base text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
              TOOLBeans is a free platform of 21 browser-based tools built for software developers,
              data engineers, designers and anyone who works with code or data every day.
              No account, no install, no limits  just the tools you actually need.
            </p>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="text-3xl mb-2 select-none">{s.icon}</div>
                <div className="text-3xl font-extrabold text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Who We Are
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-5">Our Story</h2>
            <div className="space-y-4 text-slate-500 text-sm leading-relaxed font-light">
              <p>
                We&apos;re a small team of developers and data professionals who got tired of bloated,
                ad-heavy, account-requiring tools that should be simple. Every day we&apos;d reach for
                quick utilities  format a JSON response, generate a secure password, compare two
                code snippets, convert a CSV to SQL  and waste time hunting through sketchy websites.
              </p>
              <p>
                <strong className="text-slate-700 font-semibold">TOOLBeans was born out of that frustration.</strong>{' '}
                We wanted a single platform for the developer utilities we reach for every single day.
                Clean, fast, private and completely free.
              </p>
              <p>
                Today TOOLBeans offers 21 free tools used by software developers, data analysts,
                designers, students and productivity-focused professionals. And we&apos;re just getting
                started  new tools are added regularly based on community feedback.
              </p>
            </div>
          </div>
        </section>

        {/* ── MISSION / VALUES ── */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Our Mission
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">What We Stand For</h2>
              <p className="text-slate-400 font-light max-w-xl mx-auto text-sm">
                Reliable, private, free developer tools for everyone  no gatekeeping, no sign-ups, no paywalls.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {values.map((v) => (
                <div key={v.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <div className="text-3xl mb-4 select-none">{v.icon}</div>
                  <h3 className="font-bold text-slate-800 text-base mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO USES TOOLBEANS  replaces "How it's built" ── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Use Cases
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Who Uses TOOLBeans?</h2>
            <p className="text-slate-400 font-light max-w-xl mx-auto text-sm">
              21 free tools designed to fit into the real daily workflows of real people.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.role} className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl select-none">{uc.icon}</span>
                  <h3 className="font-extrabold text-slate-800 text-base">{uc.role}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{uc.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {uc.tools.map((t) => {
                    const tool = allTools.find((a) => a.name === t);
                    return tool ? (
                      <Link key={t} href={tool.href} className="text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition-all">
                        {t}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ALL 21 TOOLS GRID  SEO internal linking ── */}
        <section className="bg-slate-50 border-t border-slate-100 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                All Tools
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">All 21 Free Tools</h2>
              <p className="text-slate-400 font-light max-w-xl mx-auto text-sm">
                Every tool runs in your browser. No account, no data collection, no cost  ever.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                        {tool.name}
                      </span>
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full border ' + (catColor[tool.cat] || '')}>
                        {tool.cat}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{tool.desc}</p>
                  </div>
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform text-sm flex-shrink-0 mt-0.5">→</span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/tools" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200">
                Browse All 21 Tools →
              </Link>
            </div>
          </div>
        </section>

        {/* ── PRIVACY COMMITMENT ── */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 rounded-3xl p-10">
            <div className="flex items-start gap-5">
              <div className="text-4xl select-none">🔒</div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3">Our Privacy Commitment</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light mb-4">
                  All 21 tools on TOOLBeans process your data locally inside your browser.
                  We do not transmit, store or log any information you enter.
                  Your sensitive data  passwords, API keys, JWT tokens, private text 
                  never touches our servers. This is not just a promise; it is how the tools
                  are built. There is no backend to receive your data.
                </p>
                <Link href="/privacy" className="inline-flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:underline">
                  Read our full Privacy Policy →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SEO TEXT BLOCK ── */}
        <section className="max-w-4xl mx-auto px-6 pb-12">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">
              Free Online Developer Tools  About TOOLBeans
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-3">
              TOOLBeans is a free collection of 21 browser-based tools for developers,
              data engineers, DevOps professionals, designers and students. Tools include a{' '}
              <Link href="/tools/password-generator" className="text-indigo-600 hover:underline">free password generator</Link>,{' '}
              <Link href="/tools/json-formatter" className="text-indigo-600 hover:underline">JSON formatter</Link>,{' '}
              <Link href="/tools/diff-checker" className="text-indigo-600 hover:underline">diff checker</Link>,{' '}
              <Link href="/tools/jwt-decoder" className="text-indigo-600 hover:underline">JWT decoder</Link>,{' '}
              <Link href="/tools/csv-to-sql" className="text-indigo-600 hover:underline">CSV to SQL converter</Link>,{' '}
              <Link href="/tools/regex-tester" className="text-indigo-600 hover:underline">regex tester</Link>,{' '}
              <Link href="/tools/api-request-tester" className="text-indigo-600 hover:underline">API request tester</Link>,{' '}
              <Link href="/tools/color-picker" className="text-indigo-600 hover:underline">color picker</Link> and more.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              All tools are free with no account or usage limit. TOOLBeans is supported
              by non-intrusive advertising, keeping every tool free forever. New tools
              are added regularly based on community requests.
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white">
            <h3 className="text-3xl font-extrabold mb-3">Start Using TOOLBeans Today</h3>
            <p className="text-indigo-100 text-sm font-light mb-8 max-w-md mx-auto">
              21 free tools, no sign-up, no limits. Built for people who value their time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/tools" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 text-sm">
                ⚡ Explore All 21 Tools
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-transparent text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 transition-all duration-200 text-sm">
                💬 Contact Us
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}