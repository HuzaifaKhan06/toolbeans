import Link from 'next/link';

// ── All hrefs corrected to match actual Next.js routes ──
const toolLinks = [
  { label: 'Password Generator',    href: '/tools/password-generator'    },
  { label: 'QR Code Generator',     href: '/tools/qr-code-generator'     },
  { label: 'Text Case Converter',   href: '/tools/text-case-converter'   },
  { label: 'Base64 Encoder/Decoder',href: '/tools/base64-encoder-decoder'},
  { label: 'URL Encoder/Decoder',   href: '/tools/url-encoder-decoder'   },
  { label: 'JSON Formatter',        href: '/tools/json-formatter'        },
  { label: 'SQL Formatter',         href: '/tools/sql-formatter'         },
  { label: 'URL Shortener',         href: '/tools/url-shortener'         },
  { label: 'Hash Generator',        href: '/tools/hash-generator'        },
  { label: 'JWT Decoder',           href: '/tools/jwt-decoder'           },
  { label: 'Regex Tester',          href: '/tools/regex-tester'          },
];

const companyLinks = [
  { label: 'Home',    href: '/'        },
  { label: 'Tools',   href: '/tools'   },
  { label: 'About',   href: '/about'   },
  { label: 'Contact', href: '/contact' },
];

const legalLinks = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms'   },
];

export default function Footer() {
  return (
    <footer
      className="bg-slate-900 text-slate-400"
      role="contentinfo"
      aria-label="TOOLBeans site footer"
    >

      {/* ── Main Footer Grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link
              href="/"
              aria-label="TOOLBeans — Free Online Developer Tools — Home"
              className="flex items-center gap-2 mb-4"
            >
              <span className="font-extrabold text-xl text-white tracking-tight">
                TOOL<span className="text-indigo-400">Beans</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" aria-hidden="true" />
            </Link>

            {/* Brand description — crawlers read footer text for keyword context */}
            <p className="text-sm leading-relaxed text-slate-400">
              TOOLBeans is a free collection of browser-based tools for developers, data
              engineers and everyday users. Free password generator, JSON formatter, JWT decoder
              online, regex tester and more — no account, no limits.
            </p>

            <div className="flex flex-wrap gap-2 mt-5">
              {['Free', 'Private', 'No Sign-up', 'Browser-Based'].map((badge) => (
                <span
                  key={badge}
                  className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full hover:bg-slate-700 hover:text-white transition"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Tools Column — all 11 links for crawlers */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Free Tools
            </h3>
            <ul className="flex flex-col gap-2" aria-label="Developer tools list">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Company
            </h3>
            <ul className="flex flex-col gap-2" aria-label="Company pages">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Related tool categories — extra internal linking for Google */}
            <h3 className="text-white font-bold text-sm mt-8 mb-4 uppercase tracking-wider">
              Categories
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Security Tools',  href: '/tools' },
                { label: 'Developer Tools', href: '/tools' },
                { label: 'Encoding Tools',  href: '/tools' },
                { label: 'Utility Tools',   href: '/tools' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="flex flex-col gap-2" aria-label="Legal pages">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust signals */}
            <div className="mt-6 p-4 bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                All tools run 100% in your browser. Your data is never sent to a server.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true" />
                Privacy-first by design
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-800 rounded-xl">
              <p className="text-xs text-slate-400 leading-relaxed">
                Need a tool that is not here yet?{' '}
                <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 underline">
                  Request it here
                </Link>
                . New tools added regularly.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {'© '}
            {new Date().getFullYear()}
            {' TOOLBeans — Free Online Developer Tools. All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span className="text-xs text-slate-700">
              Built with Next.js and Tailwind CSS
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}