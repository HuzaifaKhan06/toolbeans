import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — TOOLBeans',
  description: 'Read the TOOLBeans Privacy Policy. We are committed to protecting your privacy.',
};

const sections = [
  {
    icon: '📋',
    title: 'Information We Collect',
    content: [
      'TOOLBeans is designed to process all tool inputs locally in your browser. We do not collect, transmit, or store any data you input into our tools.',
      'The following information may be collected automatically when you visit our website:',
    ],
    bullets: [
      'Browser type and version (for compatibility purposes)',
      'General geographic region at country level (via analytics)',
      'Pages visited and time spent (aggregate, anonymized data)',
      'Device type — desktop, tablet, or mobile',
    ],
  },
  {
    icon: '🎯',
    title: 'How We Use Information',
    content: [
      'Any aggregate analytics data collected is used solely to improve the platform — understanding which tools are most used, detecting errors, and optimizing performance.',
      'We do not sell, rent, or share this data with third parties for advertising or marketing purposes.',
    ],
    bullets: [],
  },
  {
    icon: '🍪',
    title: 'Cookies',
    content: [
      'We use minimal, essential cookies to remember your preferences such as your selected theme. No tracking cookies or third-party advertising cookies are placed without your consent.',
    ],
    bullets: [
      'Essential cookies — required for the website to function',
      'Preference cookies — remember your settings',
      'Analytics cookies — anonymous usage data only',
    ],
  },
  {
    icon: '📢',
    title: 'Advertisements',
    content: [
      'TOOLBeans displays contextual advertisements to fund free tool access for everyone. Advertising partners may use cookies in accordance with their own privacy policies.',
      'You can opt out of personalized advertising through your browser settings or by using an ad blocker.',
    ],
    bullets: [],
  },
  {
    icon: '🔐',
    title: 'Data Security',
    content: [
      'Since tool data never leaves your browser, your sensitive information — passwords, API keys, private text — is never exposed to our servers.',
      'We use HTTPS encryption for all connections to protect data in transit between your browser and our servers.',
    ],
    bullets: [],
  },
  {
    icon: '👶',
    title: "Children's Privacy",
    content: [
      'TOOLBeans does not knowingly collect personal information from children under the age of 13. If you believe a child has provided us with personal information, please contact us immediately.',
    ],
    bullets: [],
  },
  {
    icon: '🔄',
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically.',
    ],
    bullets: [],
  },
  {
    icon: '✉️',
    title: 'Contact Us',
    content: [
      'If you have any questions or concerns about this Privacy Policy or how we handle your data, please reach out to us through our contact page.',
    ],
    bullets: [],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Privacy{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-sm text-slate-500 font-light max-w-xl mx-auto mb-6">
            Your privacy is our top priority. This policy explains what data we collect,
            how we use it, and your rights as a user of TOOLBeans.
          </p>
          {/* Last Updated Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-500 shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Last Updated: January 2025
          </div>
        </div>
      </section>

      {/* ── QUICK SUMMARY CARDS ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="font-bold text-green-800 text-sm mb-1">We DO</div>
            <ul className="text-xs text-green-700 space-y-1 text-left mt-3">
              <li>• Use HTTPS encryption</li>
              <li>• Process data in your browser</li>
              <li>• Use anonymous analytics</li>
              <li>• Respect your preferences</li>
            </ul>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">❌</div>
            <div className="font-bold text-rose-800 text-sm mb-1">We DON&apos;T</div>
            <ul className="text-xs text-rose-700 space-y-1 text-left mt-3">
              <li>• Store your tool inputs</li>
              <li>• Sell your data</li>
              <li>• Require account creation</li>
              <li>• Track you across sites</li>
            </ul>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">⚖️</div>
            <div className="font-bold text-indigo-800 text-sm mb-1">Your Rights</div>
            <ul className="text-xs text-indigo-700 space-y-1 text-left mt-3">
              <li>• Access your data</li>
              <li>• Request deletion</li>
              <li>• Opt out of analytics</li>
              <li>• Contact us anytime</li>
            </ul>
          </div>

        </div>
      </section>

      {/* ── POLICY SECTIONS ── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="flex flex-col gap-5">
          {sections.map((sec, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">
                  {sec.icon}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {i + 1}. {sec.title}
                </h2>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {sec.content.map((para, j) => (
                  <p key={j} className="text-sm text-slate-500 leading-relaxed font-light">
                    {para}
                  </p>
                ))}

                {/* Bullets */}
                {sec.bullets.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {sec.bullets.map((b, k) => (
                      <li key={k} className="flex items-start gap-2 text-sm text-slate-500">
                        <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTACT BOX ── */}
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">
            Have Privacy Concerns?
          </h3>
          <p className="text-sm text-slate-500 font-light mb-5 max-w-md mx-auto">
            If you have any questions about this Privacy Policy or how your data is handled,
            we&apos;re happy to help. Reach out anytime.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm"
          >
            ✉️ Contact Us
          </Link>
        </div>

        {/* ── RELATED LINKS ── */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href="/terms"
            className="text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Terms of Service →
          </Link>
          <Link
            href="/contact"
            className="text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Contact Page →
          </Link>
          <Link
            href="/tools"
            className="text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Browse Tools →
          </Link>
        </div>
      </section>

    </div>
  );
}