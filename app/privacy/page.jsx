// app/privacy/page.jsx
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy  How TOOLBeans Handles Your Data',
  description:
    'TOOLBeans privacy policy. Learn exactly what data we collect, how browser-based tools keep your data private, how PDF server tools handle files, and your rights as a user.',
  keywords: [
    'toolbeans privacy policy',
    'toolbeans data privacy',
    'free tools privacy',
    'does toolbeans collect data',
    'toolbeans gdpr',
    'browser tool privacy',
    'pdf tool file privacy',
    'toolbeans no tracking',
    'toolbeans data collection',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/privacy' },
  openGraph: {
    title: 'Privacy Policy  TOOLBeans',
    description: 'How TOOLBeans handles your data. Browser tools process locally, PDF tools delete files immediately. No selling of data.',
    url: 'https://toolbeans.com/privacy',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'TOOLBeans Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy  TOOLBeans',
    description: 'How TOOLBeans handles your data and protects your privacy.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://toolbeans.com/privacy/#page',
  url: 'https://toolbeans.com/privacy',
  name: 'Privacy Policy  TOOLBeans',
  description: 'TOOLBeans privacy policy explaining data handling for browser-based and server-side tools.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'Privacy', item: 'https://toolbeans.com/privacy' },
    ],
  },
  dateModified: '2026-01-01',
  inLanguage: 'en-US',
  publisher: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
};

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `TOOLBeans is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it and how we protect it when you use our website at toolbeans.com and all tools available on it.

The short version: our 21 browser-based developer tools process all data locally in your browser and send nothing to any server. Our 18 PDF conversion tools process your file on a secure server solely to perform the conversion and delete it immediately after. We do not sell your data. We do not share it with advertisers.`,
  },
  {
    id: 'data-we-collect',
    title: '2. Data We Collect',
    content: `We collect the minimum data required to operate the site.

Browser-based tools (JSON Formatter, Password Generator, Regex Tester, JWT Decoder, Diff Checker, Word Counter and all other browser-side tools): These tools run entirely within your web browser. No data you enter into these tools is ever transmitted to our servers. Your input stays on your device.

PDF server tools (Word to PDF, Excel to PDF, PDF to Word, PDF to Excel and all other conversion tools involving server processing): When you use a server-side conversion tool, your uploaded file is transmitted to our secure servers over HTTPS. It is processed to perform the conversion. The output file is delivered to you. Your file is permanently deleted from our servers immediately after your download is complete or after a maximum of 1 hour if the download does not complete.

Analytics: We use Google Analytics to collect anonymised usage data including pages visited, time spent on pages and general geographic region. This data does not identify individual users and is used only to understand which tools are most used and to improve the site.

Usage logs: Our hosting provider (Vercel) automatically logs basic request data including IP addresses and request timestamps as part of standard server operation. These logs are retained for a maximum of 30 days and are used only for debugging and security purposes.`,
  },
  {
    id: 'data-we-do-not-collect',
    title: '3. Data We Do Not Collect',
    content: `We do not collect or store:

Your name, email address or any personal identification information unless you voluntarily submit it via the contact form.

The content of anything you enter into browser-based tools. This data never leaves your browser.

The content of files you upload for conversion beyond the time needed to complete the conversion.

Payment information. All TOOLBeans tools are free and no payment is ever requested.

Account information. TOOLBeans has no user accounts and requires no registration.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies',
    content: `We use a minimal number of cookies.

Google Analytics cookies: Used to collect anonymised usage statistics. These cookies are set by Google Analytics and are governed by Google's Privacy Policy.

Functional cookies: Some tools may use browser localStorage or sessionStorage to save your preferences within a session (such as the last format you selected in the JSON Formatter). This data is stored only in your browser and is never transmitted to us.

We do not use advertising cookies. We do not use third-party tracking cookies. We do not share cookie data with any advertising networks.`,
  },
  {
    id: 'data-sharing',
    title: '5. Data Sharing',
    content: `We do not sell, rent or share your personal data with any third party for marketing, advertising or commercial purposes.

We use the following service providers who may have access to limited technical data to operate the site:

Vercel  Our hosting and deployment provider. Handles server infrastructure and request routing.

Google Analytics  Provides anonymised website usage analytics.

Railway  Provides server infrastructure for PDF conversion processing.

Each of these providers has their own privacy policies and data processing agreements. They are not permitted to use any data from TOOLBeans for their own marketing purposes.`,
  },
  {
    id: 'security',
    title: '6. Security',
    content: `We take reasonable measures to protect your data.

All data transmitted between your browser and our servers uses HTTPS encryption. Uploaded files for PDF conversion are processed in isolated environments. Files are permanently deleted immediately after conversion. Our servers are maintained with current security patches. Access to server infrastructure is restricted to authorised personnel only.

No method of transmission over the internet or electronic storage is 100% secure. While we implement appropriate technical safeguards, we cannot guarantee absolute security.`,
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    content: `Depending on your location, you may have rights under data protection laws including GDPR (European Union) and similar legislation in other regions.

Right to access: You can request information about any personal data we hold about you. In practice, this is limited to contact form submissions since we collect virtually no personal data from tool usage.

Right to deletion: You can request deletion of any personal data we hold. Contact us via the contact form to make such a request.

Right to object: You can object to our processing of your data in certain circumstances.

Because we collect virtually no personal data from tool usage, most data rights requests will have a straightforward answer: we do not hold the requested data.

To exercise any of these rights, contact us through the contact page.`,
  },
  {
    id: 'children',
    title: '8. Children',
    content: `TOOLBeans tools are designed for general use and are not directed at children under the age of 13. We do not knowingly collect any data from children under 13. If you believe a child under 13 has submitted personal information to us, please contact us and we will delete it promptly.`,
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make material changes, we will update the date at the top of this policy. Continued use of TOOLBeans after changes are posted constitutes acceptance of the updated policy.

We encourage you to review this policy periodically.`,
  },
  {
    id: 'contact',
    title: '10. Contact',
    content: `If you have questions about this Privacy Policy or how we handle your data, please contact us through the contact page at toolbeans.com/contact. We respond to all enquiries within 24 hours on business days.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-white">

        {/* HERO */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <span className="text-slate-700" aria-hidden="true">/</span>
              <span className="text-slate-400" aria-current="page">Privacy Policy</span>
            </nav>
            <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-500/30 mb-5">
              Legal
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Last updated: January 1, 2026
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mt-3 max-w-2xl">
              The short version: browser tools process data locally and never send it to us.
              PDF tools delete your file immediately after conversion. We do not sell your data.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* SIDEBAR NAV */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contents</p>
                <nav aria-label="Privacy policy sections">
                  <ul className="flex flex-col gap-2">
                    {sections.map((s) => (
                      <li key={s.id}>
                        <a
                          href={'#' + s.id}
                          className="text-xs text-slate-600 hover:text-indigo-600 transition-colors leading-relaxed block"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <Link href="/contact" className="text-xs text-indigo-600 font-bold hover:underline">
                    Questions? Contact us
                  </Link>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">

                {/* Summary box */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">Privacy at a Glance</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: '🔒', title: 'Browser Tools',   desc: 'Data never leaves your device. Zero server transmission.' },
                      { icon: '🗑️', title: 'PDF Tools',        desc: 'Files deleted immediately after conversion.' },
                      { icon: '🚫', title: 'No Data Selling',  desc: 'We never sell or share your data with advertisers.' },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3 items-start">
                        <span className="text-lg flex-shrink-0" aria-hidden="true">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                <div className="flex flex-col gap-10">
                  {sections.map((section) => (
                    <section key={section.id} id={section.id} aria-labelledby={section.id + '-heading'}>
                      <h2 id={section.id + '-heading'} className="text-lg font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                        {section.title}
                      </h2>
                      {section.content.split('\n\n').map((para, i) => (
                        <p key={i} className="text-sm text-slate-600 leading-7 mb-3 last:mb-0">
                          {para}
                        </p>
                      ))}
                    </section>
                  ))}
                </div>

                {/* Footer note */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    This policy applies to toolbeans.com and all tools available on it.
                    For questions, visit our{' '}
                    <Link href="/contact" className="text-indigo-600 hover:underline">contact page</Link>.
                  </p>
                </div>
              </div>
            </main>

          </div>
        </div>
      </div>
    </>
  );
}