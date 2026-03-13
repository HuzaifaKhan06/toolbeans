// app/sitemap.js
// Next.js App Router dynamic sitemap — auto-submitted to Google via robots.txt
// Generates: https://toolbeans.com/sitemap.xml
// Total URLs: 7 static + 21 tools + 21 blog = 49 pages

const SITE_URL = 'https://toolbeans.com';

export default function sitemap() {
  const now = new Date();

  // ── Static pages ──────────────────────────────────────
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: SITE_URL + '/tools',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: SITE_URL + '/blog',          // blog index page
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: SITE_URL + '/about',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: SITE_URL + '/contact',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: SITE_URL + '/privacy',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: SITE_URL + '/terms',
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // ── All 21 tool pages ─────────────────────────────────
  const toolSlugs = [
    // Phase 1 — 11 tools
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
  ];

  const toolPages = toolSlugs.map((slug) => ({
    url: SITE_URL + '/tools/' + slug,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // ── All 21 blog posts ─────────────────────────────────
  // Real publish dates — Google uses these for freshness ranking
  const blogSlugs = [
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
    { slug: 'text-case-formats-explained',                  date: '2025-03-12' },
    { slug: 'what-is-lorem-ipsum-and-why-designers-use-it', date: '2025-03-08' },
    { slug: 'how-to-pick-perfect-colors-for-your-website',  date: '2025-03-15' },
    { slug: 'unix-timestamp-explained',                     date: '2025-03-22' },
    { slug: 'how-to-convert-csv-to-sql',                    date: '2025-03-29' },
    { slug: 'html-vs-markdown-when-to-use-each',            date: '2025-04-05' },
    { slug: 'why-code-formatting-matters',                  date: '2025-04-12' },
    { slug: 'how-to-compare-files-with-diff',               date: '2025-04-19' },
    { slug: 'when-to-use-base64-images',                    date: '2025-04-26' },
    { slug: 'how-to-test-rest-apis-for-beginners',          date: '2025-05-03' },
  ];

  const blogPages = blogSlugs.map((post) => ({
    url: SITE_URL + '/blog/' + post.slug,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // ── Final output — 49 URLs total ─────────────────────
  return [...staticPages, ...toolPages, ...blogPages];
}