// app/blog/[slug]/page.jsx
// Next.js 13, 14, and 15 compatible
// Folder MUST be named [slug] with square brackets
// blogData.js MUST be at lib/blogData.js

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/blogData';

// ── Static generation one page per post slug ────────────
export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

// ── SEO metadata ──────────────────────────────────────────
export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const post = blogPosts.find((p) => p.slug === resolvedParams.slug);
  if (!post) return { title: 'Not Found | TOOLBeans' };

  const today = new Date().toISOString().split('T')[0];

  return {
    title: post.title + ' | TOOLBeans Blog',
    description: post.description,
    keywords: post.keywords.join(', '),
    authors: [{ name: 'TOOLBeans' }],
    alternates: { canonical: 'https://toolbeans.com/blog/' + post.slug },
    openGraph: {
      title: post.title,
      description: post.description,
      url: 'https://toolbeans.com/blog/' + post.slug,
      siteName: 'TOOLBeans',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: today,
      authors: ['TOOLBeans'],
      images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['https://toolbeans.com/og-image.png'],
    },
    robots: { index: true, follow: true },
  };
}

// ── Helpers ────────────────────────────────────────────────
const catColor = {
  Developer: 'bg-blue-50 text-blue-700 border-blue-200',
  Security:  'bg-rose-50 text-rose-700 border-rose-200',
  Design:    'bg-purple-50 text-purple-700 border-purple-200',
  Writing:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Data:      'bg-teal-50 text-teal-700 border-teal-200',
  Utility:   'bg-slate-100 text-slate-600 border-slate-200',
};

function InlineText({ text }) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, match, k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={k++} className="font-bold text-slate-800">{token.slice(2, -2)}</strong>
      );
    } else {
      parts.push(
        <code key={k++} className="font-mono text-sm bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded">
          {token.slice(1, -1)}
        </code>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

function renderContent(raw) {
  const lines = raw.trim().split('\n');
  const els = [];
  let i = 0, key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      els.push(
        <div key={key++} className="my-6 rounded-2xl overflow-hidden border border-slate-800">
          {lang && (
            <div className="bg-slate-800 text-slate-400 text-xs font-mono px-4 py-2 border-b border-slate-700">
              {lang}
            </div>
          )}
          <pre className="bg-slate-900 text-emerald-400 text-xs font-mono px-5 py-4 overflow-x-auto leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      i++; continue;
    }

    // H2
    if (line.startsWith('## ')) {
      els.push(
        <h2 key={key++} className="text-xl font-extrabold text-slate-900 mt-10 mb-4">
          <InlineText text={line.slice(3)} />
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith('### ')) {
      els.push(
        <h3 key={key++} className="text-base font-extrabold text-slate-800 mt-7 mb-3">
          <InlineText text={line.slice(4)} />
        </h3>
      );
      i++; continue;
    }

    // List
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      els.push(
        <ul key={key++} className="my-4 space-y-2 pl-5">
          {items.map((item, idx) => (
            <li key={idx} className="text-slate-600 text-base leading-relaxed list-disc">
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Blank line
    if (line.trim() === '') { i++; continue; }

    // Paragraph
    els.push(
      <p key={key++} className="text-slate-600 text-base leading-7 my-4">
        <InlineText text={line} />
      </p>
    );
    i++;
  }
  return els;
}

function getRelated(current) {
  const same  = blogPosts.filter((p) => p.slug !== current.slug && p.category === current.category);
  const other = blogPosts.filter((p) => p.slug !== current.slug && p.category !== current.category);
  return [...same, ...other].slice(0, 3);
}

// ── FAQ data per post category ────────────────────────────
function getFaqForPost(post) {
  const toolName = post.tool?.name || 'this tool';
  const toolHref = post.tool?.href || '/tools';

  // Generic 3-question FAQ for every post
  return [
    {
      q: `Is ${toolName} free to use?`,
      a: `Yes. ${toolName} is completely free on TOOLBeans with no usage limits, no account and no credit card required.`,
    },
    {
      q: 'Is my data safe when using TOOLBeans tools?',
      a: 'Browser-based tools run entirely in your browser so your data never leaves your device. PDF server tools process your file on a secure server and delete it immediately after conversion.',
    },
    {
      q: `Do I need to install anything to use ${toolName}?`,
      a: `No installation is required. ${toolName} runs directly in your browser on any device, including mobile. Just visit TOOLBeans and start using it instantly.`,
    },
    {
      q: 'How is TOOLBeans different from other online tools?',
      a: 'TOOLBeans offers 39 free tools with no paywalls, no account requirements and no usage limits. Browser tools process your data locally for maximum privacy.',
    },
  ];
}

// ── JSON-LD schemas ───────────────────────────────────────
function PostSchemas({ post }) {
  const today = new Date().toISOString().split('T')[0];
  const faqs  = getFaqForPost(post);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url: 'https://toolbeans.com/blog/' + post.slug,
    datePublished: post.date,
    dateModified: today,
    author: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    publisher: {
      '@type': 'Organization',
      name: 'TOOLBeans',
      url: 'https://toolbeans.com',
      logo: { '@type': 'ImageObject', url: 'https://toolbeans.com/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://toolbeans.com/blog/' + post.slug },
    keywords: post.keywords.join(', '),
    image: 'https://toolbeans.com/og-image.png',
    inLanguage: 'en-US',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: 'https://toolbeans.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: 'https://toolbeans.com/blog/' + post.slug },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

// ── FAQ Section component ─────────────────────────────────
function FaqSection({ post }) {
  const faqs = getFaqForPost(post);
  return (
    <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-8">
      <h2 className="text-xl font-extrabold text-slate-900 mb-6">Frequently Asked Questions</h2>
      <div className="flex flex-col gap-6">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0">
            <h3 className="text-sm font-bold text-slate-800 mb-2">{faq.q}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
      {post.tool?.href && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <Link href={post.tool.href} className="text-sm font-bold text-indigo-600 hover:underline">
            Try {post.tool.name} for free on TOOLBeans
          </Link>
        </div>
      )}
    </div>
  );
}

// ── PAGE COMPONENT ────────────────────────────────────────
export default async function BlogPostPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = getRelated(post);
  const allSorted = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
  const idx       = allSorted.findIndex((p) => p.slug === post.slug);
  const prevPost  = allSorted[idx + 1] || null;
  const nextPost  = allSorted[idx - 1] || null;
  const color     = catColor[post.category] || catColor.Utility;

  return (
    <>
      <PostSchemas post={post} />

      <div className="min-h-screen bg-white">

        {/* HERO */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-14 px-6">
          <div className="max-w-3xl mx-auto">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span className="text-slate-700" aria-hidden="true">/</span>
              <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
              <span className="text-slate-700" aria-hidden="true">/</span>
              <span className="text-slate-400 truncate max-w-xs">{post.title}</span>
            </nav>

            <span className={'inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-5 ' + color}>
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {post.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.readTime}</span>
              <span aria-hidden="true">·</span>
              <span>TOOLBeans Team</span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* ARTICLE BODY */}
            <article className="lg:col-span-3">

              {/* Tool CTA top */}
              <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-4 mb-8">
                <span className="text-3xl leading-none" role="img" aria-label={post.tool.name}>
                  {post.tool.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-0.5">Free Tool</p>
                  <p className="text-sm font-extrabold text-slate-800">{post.tool.name}</p>
                  <p className="text-xs text-slate-400">No account. No install. Runs in browser.</p>
                </div>
                <Link
                  href={post.tool.href}
                  className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all"
                >
                  Open Tool
                </Link>
              </div>

              {/* Article content */}
              <div className="max-w-none">
                {renderContent(post.content)}
              </div>

              {/* Internal links browse all tools */}
              <div className="mt-8 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-800 mb-2">Explore More Free Tools</p>
                <p className="text-xs text-slate-500 mb-3">
                  TOOLBeans offers 39 free developer and PDF tools. No account needed.
                </p>
                <Link href="/tools" className="text-sm font-bold text-indigo-600 hover:underline">
                  Browse all 39 free tools
                </Link>
              </div>

              {/* Keyword tags */}
              <div className="mt-10 pt-8 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Related Topics</p>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((kw) => (
                    <span key={kw} className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* FAQ Section required by SEO document */}
              <FaqSection post={post} />

              {/* Tool CTA bottom */}
              <div className="mt-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-7 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl leading-none" role="img" aria-label={post.tool.name}>
                    {post.tool.icon}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-wide mb-0.5">Try it yourself</p>
                    <p className="text-lg font-extrabold">{post.tool.name}</p>
                  </div>
                </div>
                <p className="text-indigo-200 text-sm mb-5 leading-relaxed">
                  Everything in this article is available in the free tool. No account, no subscription, no install.
                </p>
                <Link
                  href={post.tool.href}
                  className="inline-block bg-white text-indigo-700 font-extrabold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all text-sm"
                >
                  {'Open ' + post.tool.name}
                </Link>
              </div>

              {/* Prev / Next navigation */}
              {(prevPost || nextPost) && (
                <nav className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Article navigation">
                  {prevPost && (
                    <Link
                      href={'/blog/' + prevPost.slug}
                      className="group flex flex-col p-5 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <span className="text-xs text-slate-400 mb-2">Previous article</span>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors leading-snug">
                        {prevPost.title}
                      </span>
                    </Link>
                  )}
                  {nextPost && (
                    <Link
                      href={'/blog/' + nextPost.slug}
                      className="group flex flex-col p-5 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <span className="text-xs text-slate-400 mb-2">Next article</span>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors leading-snug">
                        {nextPost.title}
                      </span>
                    </Link>
                  )}
                </nav>
              )}
            </article>

            {/* SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6 flex flex-col gap-5">

                {/* Tool widget */}
                <div className="bg-indigo-600 rounded-2xl p-5 text-white">
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-4">Free Tool</p>
                  <span className="text-5xl leading-none block mb-3" role="img" aria-label={post.tool.name}>
                    {post.tool.icon}
                  </span>
                  <p className="font-extrabold text-base mb-1">{post.tool.name}</p>
                  <p className="text-xs text-indigo-200 mb-4">Free. No account. Browser-based.</p>
                  <Link
                    href={post.tool.href}
                    className="block text-center bg-white text-indigo-700 font-extrabold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-all"
                  >
                    Open Tool
                  </Link>
                </div>

                {/* Related articles */}
                {related.length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Related Articles</p>
                    <div className="flex flex-col gap-4">
                      {related.map((r) => (
                        <Link
                          key={r.slug}
                          href={'/blog/' + r.slug}
                          className="group flex gap-3 items-start"
                        >
                          <span className="text-xl leading-none flex-shrink-0" role="img" aria-label={r.tool.name}>
                            {r.tool.icon}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors leading-snug">
                              {r.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{r.readTime}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Browse all tools updated to 39 */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">More Free Tools</p>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    39 free developer and PDF tools. No account needed.
                  </p>
                  <Link
                    href="/tools"
                    className="block text-center bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Browse All 39 Tools
                  </Link>
                </div>

                <Link href="/blog" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors px-1">
                  Back to all articles
                </Link>

              </div>
            </aside>

          </div>

          {/* MORE ARTICLES */}
          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900 mb-6">More Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={'/blog/' + r.slug}
                    className="group flex flex-col bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl leading-none" role="img" aria-label={r.tool.name}>
                        {r.tool.icon}
                      </span>
                      <span className={'text-xs font-semibold px-2.5 py-1 rounded-full border ' + (catColor[r.category] || catColor.Utility)}>
                        {r.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug mb-2 flex-1">
                      {r.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{r.description}</p>
                    <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-block">
                      Read article
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}