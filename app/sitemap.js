// app/sitemap.js
// Next.js App Router dynamic sitemap
// Total URLs: 7 static + 39 tools + 39 blog = 85 pages

const SITE_URL = 'https://toolbeans.com';

export default function sitemap() {
  const now = new Date();

  // ── Static pages (7) ──────────────────────────────────
  const staticPages = [
    { url: SITE_URL,              lastModified: now, changeFrequency: 'daily',   priority: 1.0  },
    { url: SITE_URL + '/tools',   lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: SITE_URL + '/blog',    lastModified: now, changeFrequency: 'daily',   priority: 0.9  },
    { url: SITE_URL + '/about',   lastModified: now, changeFrequency: 'monthly', priority: 0.7  },
    { url: SITE_URL + '/contact', lastModified: now, changeFrequency: 'monthly', priority: 0.7  },
    { url: SITE_URL + '/privacy', lastModified: now, changeFrequency: 'monthly', priority: 0.4  },
    { url: SITE_URL + '/terms',   lastModified: now, changeFrequency: 'monthly', priority: 0.4  },
  ];

  // ── All 39 tool pages ─────────────────────────────────
  const toolSlugs = [
    // Developer tools (21)
    'password-generator',
    'qr-code-generator',
    'json-formatter',
    'sql-formatter',
    'base64-encoder-decoder',
    'url-encoder-decoder',
    'url-shortener',
    'text-case-converter',
    'hash-generator',
    'jwt-decoder',
    'regex-tester',
    'word-counter',
    'lorem-ipsum',
    'timestamp-converter',
    'color-picker',
    'csv-to-sql',
    'html-to-markdown',
    'code-formatter',
    'api-request-tester',
    'image-to-base64',
    'diff-checker',
    // Convert TO PDF (9)
    'jpg-to-pdf',
    'png-to-pdf',
    'image-to-pdf',
    'txt-to-pdf',
    'svg-to-pdf',
    'html-to-pdf',
    'word-to-pdf',
    'excel-to-pdf',
    'powerpoint-to-pdf',
    // Convert FROM PDF (9)
    'pdf-to-text',
    'pdf-to-jpg',
    'pdf-to-png',
    'pdf-to-html',
    'pdf-to-csv',
    'pdf-to-word',
    'pdf-to-excel',
    'pdf-to-powerpoint',
    'pdf-to-svg',
  ];

  const toolPages = toolSlugs.map((slug) => ({
    url:             SITE_URL + '/tools/' + slug,
    lastModified:    now,
    changeFrequency: 'weekly',
    priority:        0.9,
  }));

  // ── All 39 blog posts ─────────────────────────────────
  const blogSlugs = [
    // Original 21 posts (existing)
    { slug: 'how-to-create-strong-passwords',               date: '2025-01-15' },
    { slug: 'how-to-create-qr-codes',                       date: '2025-01-22' },
    { slug: 'url-encoding-explained',                       date: '2025-01-28' },
    { slug: 'what-is-base64-encoding',                      date: '2025-02-03' },
    { slug: 'how-to-write-clean-sql-queries',               date: '2025-02-05' },
    { slug: 'how-to-format-and-validate-json',              date: '2025-02-10' },
    { slug: 'how-url-shorteners-work',                      date: '2025-02-15' },
    { slug: 'what-is-jwt-and-how-it-works',                 date: '2025-02-18' },
    { slug: 'what-is-hashing-md5-sha256-explained',         date: '2025-02-22' },
    { slug: 'ideal-word-count-for-blog-posts-seo',          date: '2025-03-01' },
    { slug: 'regex-basics-beginners-guide',                 date: '2025-03-05' },
    { slug: 'what-is-lorem-ipsum-and-why-designers-use-it', date: '2025-03-08' },
    { slug: 'text-case-formats-explained',                  date: '2025-03-12' },
    { slug: 'how-to-pick-perfect-colors-for-your-website',  date: '2025-03-15' },
    { slug: 'unix-timestamp-explained',                     date: '2025-03-22' },
    { slug: 'how-to-convert-csv-to-sql',                    date: '2025-03-29' },
    { slug: 'html-vs-markdown-when-to-use-each',            date: '2025-04-05' },
    { slug: 'why-code-formatting-matters',                  date: '2025-04-12' },
    { slug: 'how-to-compare-files-with-diff',               date: '2025-04-19' },
    { slug: 'when-to-use-base64-images',                    date: '2025-04-26' },
    { slug: 'how-to-test-rest-apis-for-beginners',          date: '2025-05-03' },
    // New 18 posts (PDF and conversion tools)
    { slug: 'how-to-convert-pdf-to-word',                   date: '2025-05-10' },
    { slug: 'how-to-convert-pdf-to-excel',                  date: '2025-05-17' },
    { slug: 'how-to-convert-pdf-to-powerpoint',             date: '2025-05-24' },
    { slug: 'how-to-extract-text-from-pdf',                 date: '2025-06-01' },
    { slug: 'how-to-convert-pdf-to-jpg',                    date: '2025-06-08' },
    { slug: 'how-to-convert-pdf-to-png',                    date: '2025-06-15' },
    { slug: 'how-to-convert-pdf-to-html',                   date: '2025-06-22' },
    { slug: 'how-to-extract-tables-from-pdf-to-csv',        date: '2025-06-29' },
    { slug: 'how-to-convert-pdf-to-svg',                    date: '2025-07-06' },
    { slug: 'how-to-convert-word-to-pdf',                   date: '2025-07-13' },
    { slug: 'how-to-convert-excel-to-pdf',                  date: '2025-07-20' },
    { slug: 'how-to-convert-powerpoint-to-pdf',             date: '2025-07-27' },
    { slug: 'how-to-convert-jpg-to-pdf',                    date: '2025-08-03' },
    { slug: 'how-to-convert-png-to-pdf',                    date: '2025-08-10' },
    { slug: 'how-to-convert-svg-to-pdf',                    date: '2025-08-17' },
    { slug: 'how-to-convert-html-to-pdf',                   date: '2025-08-24' },
    { slug: 'how-to-convert-txt-to-pdf',                    date: '2025-08-31' },
    { slug: 'how-to-convert-images-to-pdf',                 date: '2025-09-07' },
    { slug: 'how-to-choose-the-right-online-developer-tool',                 date: '2025-09-08' },
  ];

  const blogPages = blogSlugs.map((post) => ({
    url:             SITE_URL + '/blog/' + post.slug,
    lastModified:    new Date(post.date),
    changeFrequency: 'monthly',
    priority:        0.75,
  }));

  // ── Final output — 85 URLs total ─────────────────────
  return [...staticPages, ...toolPages, ...blogPages];
}