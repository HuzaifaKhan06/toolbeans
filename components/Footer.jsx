// components/Footer.jsx
import Link from 'next/link';

const toolLinks = [
  // Developer tools
  { label: 'Password Generator',     href: '/tools/password-generator'    },
  { label: 'QR Code Generator',      href: '/tools/qr-code-generator'     },
  { label: 'JSON Formatter',         href: '/tools/json-formatter'         },
  { label: 'JWT Decoder',            href: '/tools/jwt-decoder'            },
  { label: 'Regex Tester',           href: '/tools/regex-tester'           },
  { label: 'Hash Generator',         href: '/tools/hash-generator'         },
  { label: 'Base64 Encoder/Decoder', href: '/tools/base64-encoder-decoder' },
  { label: 'URL Encoder/Decoder',    href: '/tools/url-encoder-decoder'    },
  { label: 'SQL Formatter',          href: '/tools/sql-formatter'          },
  { label: 'Text Case Converter',    href: '/tools/text-case-converter'    },
  { label: 'URL Shortener',          href: '/tools/url-shortener'          },
  { label: 'Word Counter',           href: '/tools/word-counter'           },
  { label: 'Color Picker',           href: '/tools/color-picker'           },
  { label: 'Timestamp Converter',    href: '/tools/timestamp-converter'    },
  { label: 'Lorem Ipsum Generator',  href: '/tools/lorem-ipsum'            },
  { label: 'Code Formatter',         href: '/tools/code-formatter'         },
  { label: 'Diff Checker',           href: '/tools/diff-checker'           },
  { label: 'CSV to SQL',             href: '/tools/csv-to-sql'             },
  { label: 'HTML to Markdown',       href: '/tools/html-to-markdown'       },
  { label: 'Image to Base64',        href: '/tools/image-to-base64'        },
  { label: 'API Request Tester',     href: '/tools/api-request-tester'     },
  // PDF tools
  { label: 'Word to PDF',            href: '/tools/word-to-pdf'            },
  { label: 'Excel to PDF',           href: '/tools/excel-to-pdf'           },
  { label: 'PowerPoint to PDF',      href: '/tools/powerpoint-to-pdf'      },
  { label: 'JPG to PDF',             href: '/tools/jpg-to-pdf'             },
  { label: 'PNG to PDF',             href: '/tools/png-to-pdf'             },
  { label: 'Image to PDF',           href: '/tools/image-to-pdf'           },
  { label: 'TXT to PDF',             href: '/tools/txt-to-pdf'             },
  { label: 'SVG to PDF',             href: '/tools/svg-to-pdf'             },
  { label: 'HTML to PDF',            href: '/tools/html-to-pdf'            },
];

const blogLinks = [
  { label: 'How to Create Strong Passwords',   href: '/blog/how-to-create-strong-passwords'               },
  { label: 'QR Code Generator Guide',          href: '/blog/how-to-create-qr-codes'                       },
  { label: 'What Is Base64 Encoding?',         href: '/blog/what-is-base64-encoding'                      },
  { label: 'Format & Validate JSON',           href: '/blog/how-to-format-and-validate-json'              },
  { label: 'What Is a JWT Token?',             href: '/blog/what-is-jwt-and-how-it-works'                 },
  { label: 'Word Count for SEO',               href: '/blog/ideal-word-count-for-blog-posts-seo'          },
  { label: 'What Is Lorem Ipsum?',             href: '/blog/what-is-lorem-ipsum-and-why-designers-use-it' },
  { label: 'Colors for Your Website',          href: '/blog/how-to-pick-perfect-colors-for-your-website'  },
  { label: 'Unix Timestamps Explained',        href: '/blog/unix-timestamp-explained'                     },
  { label: 'Convert CSV to SQL',               href: '/blog/how-to-convert-csv-to-sql'                    },
  { label: 'HTML vs Markdown',                 href: '/blog/html-vs-markdown-when-to-use-each'            },
  { label: 'Why Code Formatting Matters',      href: '/blog/why-code-formatting-matters'                  },
  { label: 'How Diff Tools Work',              href: '/blog/how-to-compare-files-with-diff'               },
  { label: 'When to Use Base64 Images',        href: '/blog/when-to-use-base64-images'                    },
  { label: 'How to Test REST APIs',            href: '/blog/how-to-test-rest-apis-for-beginners'          },
  { label: 'URL Encoding Explained',           href: '/blog/url-encoding-explained'                       },
  { label: 'Clean SQL Query Writing',          href: '/blog/how-to-write-clean-sql-queries'               },
  { label: 'How URL Shorteners Work',          href: '/blog/how-url-shorteners-work'                      },
  { label: 'MD5 vs SHA-256 Explained',         href: '/blog/what-is-hashing-md5-sha256-explained'         },
  { label: 'Regex for Beginners',              href: '/blog/regex-basics-beginners-guide'                 },
  { label: 'camelCase vs snake_case',          href: '/blog/text-case-formats-explained'                  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400" role="contentinfo">

      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="xl:col-span-1 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <span className="font-extrabold text-lg text-white tracking-tight">
                TOOL<span className="text-indigo-400">Beans</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
              30 free tools for developers, designers and data engineers.
              Developer tools run in your browser. PDF tools use a secure server.
              No account. No install. No limits.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {['Free', 'Private', 'No Sign-up', '30 Tools'].map((b) => (
                <span key={b} className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2.5 py-1 rounded-full">{b}</span>
              ))}
            </div>

            <div className="bg-slate-800 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold mb-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Privacy-first by design
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browser tools never upload your data. PDF tools delete files immediately after conversion.
              </p>
            </div>
          </div>

          {/* Tools (2 columns) */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-xs uppercase tracking-wider">Free Tools</h3>
              <Link href="/tools" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {toolLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-xs text-slate-400 hover:text-white transition-colors leading-relaxed truncate">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Blog (2 columns) */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-xs uppercase tracking-wider">Blog & Guides</h3>
              <Link href="/blog" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {blogLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-xs text-slate-400 hover:text-indigo-400 transition-colors leading-relaxed truncate">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-800" />

      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} TOOLBeans. All rights reserved.</p>
          <nav className="flex items-center gap-1 flex-wrap justify-center" aria-label="Footer navigation">
            {[
              { label: 'Home',    href: '/'        },
              { label: 'Tools',   href: '/tools'   },
              { label: 'Blog',    href: '/blog'    },
              { label: 'About',   href: '/about'   },
              { label: 'Contact', href: '/contact' },
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms',   href: '/terms'   },
            ].map((link, i, arr) => (
              <span key={link.href} className="flex items-center">
                <Link href={link.href} className="text-xs text-slate-500 hover:text-white transition-colors px-2 py-1">{link.label}</Link>
                {i < arr.length - 1 && <span className="text-slate-700 text-xs select-none">·</span>}
              </span>
            ))}
          </nav>
          <p className="text-xs text-slate-700">Built with ♥ for you</p>
        </div>
      </div>

    </footer>
  );
}