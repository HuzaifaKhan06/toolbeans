// app/blog/page.jsx
// This is the /blog page shows all 21 article cards
import Link from 'next/link';
import { blogPosts } from '@/lib/blogData';

export const metadata = {
  title: 'Blog Developer Guides and Tool Tutorials | TOOLBeans',
  description:
    'Practical guides on passwords, JWT tokens, Base64 encoding, JSON formatting, regex, SQL, diff tools, and more. Written for developers and tech professionals.',
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/blog' },
  openGraph: {
    title: 'TOOLBeans Blog Developer Guides and Tutorials',
    description: 'Practical guides for developers covering security, encoding, data tools, PDF conversion and more.',
    url: 'https://toolbeans.com/blog',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'TOOLBeans Blog Developer Guides' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOOLBeans Blog Developer Guides and Tutorials',
    description: 'Practical guides for developers on security, encoding, data tools and more.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

// ── JSON-LD for blog index ────────────────────────────────
const blogListSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': 'https://toolbeans.com/blog/#blog',
  url: 'https://toolbeans.com/blog',
  name: 'TOOLBeans Blog',
  description: 'Practical developer guides on security, encoding, data tools, PDF conversion and more.',
  publisher: {
    '@type': 'Organization',
    name: 'TOOLBeans',
    url: 'https://toolbeans.com',
    logo: { '@type': 'ImageObject', url: 'https://toolbeans.com/logo.png' },
  },
  inLanguage: 'en-US',
};

// ── Category badge colors ─────────────────────────────────
const catColor = {
  Developer: 'bg-blue-50 text-blue-700 border-blue-200',
  Security:  'bg-rose-50 text-rose-700 border-rose-200',
  Design:    'bg-purple-50 text-purple-700 border-purple-200',
  Writing:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Data:      'bg-teal-50 text-teal-700 border-teal-200',
  Utility:   'bg-slate-100 text-slate-600 border-slate-200',
};

function Badge({ cat }) {
  return (
    <span className={'inline-block text-xs font-semibold px-3 py-1 rounded-full border ' + (catColor[cat] || catColor.Utility)}>
      {cat}
    </span>
  );
}

// Sort newest first
const allPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
const featured = allPosts[0];
const restPosts = allPosts.slice(1);

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <div className="min-h-screen bg-white">

        {/* HERO */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">

            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span className="text-slate-700" aria-hidden="true">/</span>
              <span className="text-slate-400" aria-current="page">Blog</span>
            </nav>

            <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-500/30 mb-5">
              TOOLBeans Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Practical guides for developers
            </h1>
            <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
              How things actually work: hashing, JWT tokens, regex, SQL formatting, Base64 encoding,
              and the tools that make your workflow faster. No filler, no fluff.
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-12">

          {/* FEATURED POST */}
          <div className="mb-12">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Featured Article</p>
            <Link
              href={'/blog/' + featured.slug}
              className="group block bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100 rounded-3xl p-8 hover:border-indigo-300 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="flex-1 min-w-0">
                  <Badge cat={featured.category} />
                  <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug mt-3 mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    {featured.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <time dateTime={featured.date}>
                      {new Date(featured.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{featured.readTime}</span>
                    <span className="ml-auto text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Read article
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-28 h-28 bg-indigo-100 rounded-2xl flex items-center justify-center text-5xl leading-none select-none" aria-hidden="true">
                  {featured.tool.icon}
                </div>
              </div>
            </Link>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex gap-2 flex-wrap mb-8" role="list" aria-label="Article categories">
            {['Developer', 'Security', 'Design', 'Writing', 'Data', 'Utility'].map((cat) => (
              <span key={cat} role="listitem" className={'text-xs font-semibold px-3 py-1.5 rounded-full border cursor-default ' + (catColor[cat] || catColor.Utility)}>
                {cat}
              </span>
            ))}
          </div>

          {/* ALL POSTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {restPosts.map((post) => (
              <Link
                key={post.slug}
                href={'/blog/' + post.slug}
                className="group flex flex-col bg-white border border-slate-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge cat={post.category} />
                  <span className="text-2xl leading-none select-none" role="img" aria-label={post.tool.name}>
                    {post.tool.icon}
                  </span>
                </div>

                <h2 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug mb-2 flex-1">
                  {post.title}
                </h2>

                <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                  {post.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex gap-2 text-xs text-slate-400">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <span className="text-indigo-600 text-xs font-bold group-hover:translate-x-1 transition-transform inline-block" aria-hidden="true">
                    Read
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* BOTTOM CTA updated to 39 tools */}
          <div className="text-center bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl px-8 py-12 text-white">
            <h2 className="text-2xl font-extrabold mb-3">39 free tools, all in one place</h2>
            <p className="text-indigo-200 text-sm mb-6 max-w-md mx-auto">
              Every article you read here links to a free browser-based tool. No account, no installation, no limits.
            </p>
            <Link
              href="/tools"
              className="inline-block bg-white text-indigo-700 font-extrabold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-all"
            >
              Browse All 39 Tools
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
