// app/contact/page.jsx
import Link from 'next/link';

export const metadata = {
  title: 'Contact TOOLBeans — Request a Tool, Report a Bug or Send Feedback',
  description:
    'Get in touch with the TOOLBeans team. Request a new free online developer tool, report a bug, suggest an improvement or ask a question. We read every message and respond within 24 hours.',
  keywords: [
    'contact toolbeans',
    'request free developer tool',
    'report bug toolbeans',
    'toolbeans feedback',
    'suggest new online tool',
    'toolbeans support',
    'toolbeans contact page',
    'free tool request',
    'developer tools feedback',
    'toolbeans help',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/contact' },
  openGraph: {
    title: 'Contact TOOLBeans — Request a Tool, Report a Bug or Send Feedback',
    description:
      'Get in touch with the TOOLBeans team. Request new tools, report issues or send suggestions. We respond within 24 hours.',
    url: 'https://toolbeans.com/contact',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Contact TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact TOOLBeans — Request a Tool or Send Feedback',
    description: 'Request new tools, report bugs or send feedback. We respond within 24 hours.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': 'https://toolbeans.com/contact/#page',
      url: 'https://toolbeans.com/contact',
      name: 'Contact TOOLBeans',
      description: 'Contact the TOOLBeans team to request a tool, report a bug or send feedback.',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://toolbeans.com' },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://toolbeans.com/contact' },
        ],
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://toolbeans.com/#organization',
      name: 'TOOLBeans',
      url: 'https://toolbeans.com',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        availableLanguage: 'English',
        url: 'https://toolbeans.com/contact',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How quickly does TOOLBeans respond to messages?',
          acceptedAnswer: { '@type': 'Answer', text: 'We read every message and aim to respond within 24 hours on business days.' },
        },
        {
          '@type': 'Question',
          name: 'Can I request a new tool for TOOLBeans?',
          acceptedAnswer: { '@type': 'Answer', text: 'Yes. Tool requests are our highest priority messages. If enough people want the same tool, it gets built next. Use the contact form and select Tool Request.' },
        },
        {
          '@type': 'Question',
          name: 'How do I report a bug on TOOLBeans?',
          acceptedAnswer: { '@type': 'Answer', text: 'Use the contact form and select Bug Report. Describe what you expected to happen, what actually happened and which browser and device you are using.' },
        },
      ],
    },
  ],
};

const reasons = [
  { icon: '🛠️', title: 'Tool Request',       desc: 'Need a tool that is not on TOOLBeans yet? Tell us what you need. Popular requests get built first.' },
  { icon: '🐛', title: 'Bug Report',         desc: 'Something not working as expected? Report the issue with your browser and device details.' },
  { icon: '💡', title: 'Feature Suggestion', desc: 'Have an idea to improve an existing tool? We read every suggestion seriously.' },
  { icon: '🤝', title: 'Partnership',        desc: 'Business collaboration, integration ideas or press enquiries.' },
  { icon: '📝', title: 'General Feedback',   desc: 'Any other comment, question or thought. We value all feedback.' },
];

const faqs = [
  {
    q: 'How quickly will I get a response?',
    a: 'We aim to respond to every message within 24 hours on business days. Complex technical requests may take a little longer but we always follow up.',
  },
  {
    q: 'How do I request a new tool?',
    a: 'Use the contact form above and select Tool Request as your reason. Describe what the tool should do and what problem it solves. Popular requests get built first.',
  },
  {
    q: 'What information should I include in a bug report?',
    a: 'Include the name of the tool that has the issue, what you expected to happen, what actually happened, and your browser name and version. Screenshots are helpful if you can include them.',
  },
  {
    q: 'Is TOOLBeans free to use?',
    a: 'Yes. All 39 tools on TOOLBeans are completely free with no usage limits. No account, no credit card and no subscription is ever required.',
  },
];

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-white">

        {/* HERO */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <span className="text-slate-600 font-semibold" aria-current="page">Contact</span>
            </nav>

            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-indigo-100">
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              Contact{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                TOOLBeans
              </span>
            </h1>
            <p className="text-base text-slate-500 font-light max-w-xl mx-auto leading-relaxed">
              Request a new tool, report a bug or send any feedback. We read every message
              and respond within 24 hours on business days.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* LEFT — FORM */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-6">Send a Message</h2>

                {/* NOTE: Replace this form with your own form handler (Formspree, EmailJS, Next.js API route, etc.) */}
                <form
                  action="https://formspree.io/f/your-form-id"
                  method="POST"
                  className="flex flex-col gap-5"
                  aria-label="Contact form"
                >
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Your Name <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Email Address <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label htmlFor="reason" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Reason for Contact <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    >
                      <option value="">Select a reason...</option>
                      <option value="tool-request">Tool Request</option>
                      <option value="bug-report">Bug Report</option>
                      <option value="feature-suggestion">Feature Suggestion</option>
                      <option value="partnership">Partnership</option>
                      <option value="general">General Feedback</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Subject <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="Brief description of your message"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Message <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      placeholder="Describe your request or feedback in as much detail as you like..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm"
                  >
                    Send Message
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    We aim to respond within 24 hours on business days.
                  </p>
                </form>
              </div>
            </div>

            {/* RIGHT — INFO */}
            <div className="lg:col-span-1 flex flex-col gap-6">

              {/* Why contact us */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h2 className="text-sm font-extrabold text-slate-800 mb-4">What We Help With</h2>
                <div className="flex flex-col gap-4">
                  {reasons.map((r) => (
                    <div key={r.title} className="flex gap-3 items-start">
                      <span className="text-xl flex-shrink-0 leading-none mt-0.5" aria-hidden="true">{r.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{r.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                <h2 className="text-sm font-extrabold text-indigo-100 mb-4">TOOLBeans by the Numbers</h2>
                {[
                  { v: '39',    l: 'Free Tools Available'  },
                  { v: '24h',   l: 'Response Time Target'  },
                  { v: '100%',  l: 'Free Forever'          },
                  { v: '0',     l: 'Accounts Required'     },
                ].map((s) => (
                  <div key={s.l} className="flex items-center justify-between border-b border-indigo-500 py-2 last:border-0">
                    <span className="text-xs text-indigo-200">{s.l}</span>
                    <span className="text-sm font-extrabold text-white">{s.v}</span>
                  </div>
                ))}
              </div>

              {/* Tools link */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Free Tools</p>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  39 free developer and PDF tools. No account, no limits.
                </p>
                <Link
                  href="/tools"
                  className="block text-center bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all"
                >
                  Browse All 39 Tools
                </Link>
              </div>
            </div>

          </div>

          {/* FAQ SECTION */}
          <div className="mt-14">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}