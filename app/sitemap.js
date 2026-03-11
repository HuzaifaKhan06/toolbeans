// app/sitemap.js
// Next.js App Router dynamic sitemap — auto-submitted to Google via robots.txt
// Generates: https://toolbeans.com/sitemap.xml

const SITE_URL = 'https://toolbeans.com';

// Priority and changeFrequency guide for Google:
// priority 1.0  = most important page on the site
// priority 0.9  = very important (main tool pages)
// priority 0.7  = secondary pages (about, contact)
// priority 0.5  = low priority (legal pages)
// changeFrequency 'daily'   = Google checks this often (homepage)
// changeFrequency 'weekly'  = tools (content rarely changes but tools improve)
// changeFrequency 'monthly' = static pages

export default function sitemap() {
  const now = new Date();

  // ── Static pages ──
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

  // ── All 11 tool pages ──
  // Each tool gets priority 0.9 — these are the money pages for SEO
  const toolSlugs = [
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
  ];

  const toolPages = toolSlugs.map((slug) => ({
    url: SITE_URL + '/tools/' + slug,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticPages, ...toolPages];
}