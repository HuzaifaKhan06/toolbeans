// app/terms/page.jsx
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — TOOLBeans Free Online Tools',
  description:
    'TOOLBeans terms of service. Read the rules for using our 39 free online developer and PDF tools. Covers acceptable use, intellectual property, disclaimers and your rights.',
  keywords: [
    'toolbeans terms of service',
    'toolbeans terms and conditions',
    'free tools terms of use',
    'toolbeans legal',
    'toolbeans acceptable use',
    'online tools terms',
    'toolbeans user agreement',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/terms' },
  openGraph: {
    title: 'Terms of Service — TOOLBeans',
    description: 'Terms of service for using TOOLBeans free online developer and PDF tools.',
    url: 'https://toolbeans.com/terms',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'TOOLBeans Terms of Service' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service — TOOLBeans',
    description: 'Terms of service for TOOLBeans free online tools.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://toolbeans.com/terms/#page',
  url: 'https://toolbeans.com/terms',
  name: 'Terms of Service — TOOLBeans',
  description: 'Terms of service for using TOOLBeans free online developer and PDF tools.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'Terms', item: 'https://toolbeans.com/terms' },
    ],
  },
  dateModified: '2026-01-01',
  inLanguage: 'en-US',
  publisher: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
};

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing and using TOOLBeans at toolbeans.com, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the site.

These terms apply to all visitors and users of TOOLBeans, including but not limited to individuals, businesses and organisations using our tools for personal or commercial purposes.

We reserve the right to update these terms at any time. Continued use of the site after changes are published constitutes acceptance of the updated terms. We will update the date at the top of this page when changes are made.`,
  },
  {
    id: 'service-description',
    title: '2. Service Description',
    content: `TOOLBeans provides 39 free online tools for developers, data professionals and general users. These tools include browser-based developer utilities and server-side PDF conversion tools.

Browser-based tools run entirely within your web browser. No data is transmitted to our servers during the use of these tools.

Server-side PDF tools require uploading files to our servers for processing. Files are processed and deleted immediately after the conversion is complete. See our Privacy Policy for full details on how uploaded files are handled.

All tools are provided free of charge with no usage limits and no account requirement.`,
  },
  {
    id: 'acceptable-use',
    title: '3. Acceptable Use',
    content: `You agree to use TOOLBeans tools only for lawful purposes and in a manner that does not infringe the rights of others.

You must not use TOOLBeans to upload, process or transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene or otherwise objectionable.

You must not use TOOLBeans to process any content that infringes copyrights, trademarks, trade secrets or other intellectual property rights.

You must not attempt to gain unauthorised access to any part of the site, its servers or any systems connected to it.

You must not use automated scripts, bots or scrapers to access the site in a way that places unreasonable load on our servers or disrupts normal operation for other users.

You must not use TOOLBeans to process files containing malware, viruses or any other malicious code.

We reserve the right to suspend or restrict access to any user or IP address that violates these terms or causes harm to the service.`,
  },
  {
    id: 'intellectual-property',
    title: '4. Intellectual Property',
    content: `The TOOLBeans website, including its design, code, text, graphics and all other content, is owned by TOOLBeans and protected by intellectual property laws.

You may use the tools for any personal or commercial purpose. You may not copy, reproduce, republish, reverse engineer or redistribute the TOOLBeans software or website code without explicit written permission.

The name TOOLBeans and associated branding are property of TOOLBeans. You may not use these in any way that implies association, endorsement or partnership without prior written permission.

Your input data and files remain your property at all times. We do not claim any rights over the content you use with our tools.`,
  },
  {
    id: 'file-upload',
    title: '5. File Upload and Processing',
    content: `When you use a server-side tool that requires file upload, you represent and warrant that you have the right to upload and process that file, that the file does not violate any applicable laws, and that the file does not infringe any third-party rights.

You acknowledge that uploaded files are transmitted to our servers over HTTPS, processed for the sole purpose of completing the requested conversion and permanently deleted immediately after your download is complete.

Maximum file sizes and supported formats are specified on each individual tool page. Uploads that exceed size limits or use unsupported formats will be rejected.

We are not responsible for any data loss that occurs during the upload or conversion process. Keep backups of any important files before uploading.`,
  },
  {
    id: 'disclaimers',
    title: '6. Disclaimers and Limitation of Liability',
    content: `TOOLBeans tools are provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied.

We do not warrant that the tools will be available at all times, error-free, or produce results that meet your specific requirements.

TOOLBeans shall not be liable for any direct, indirect, incidental, consequential, special or exemplary damages arising from your use of or inability to use the tools, even if we have been advised of the possibility of such damages.

This includes but is not limited to damages resulting from loss of data, loss of business, business interruption or any other commercial damages.

The tools are intended as convenient utilities. For critical use cases, always verify outputs and maintain backups of original data.`,
  },
  {
    id: 'privacy',
    title: '7. Privacy',
    content: `Your use of TOOLBeans is also governed by our Privacy Policy, which is incorporated into these Terms of Service by reference. Please review the Privacy Policy at toolbeans.com/privacy to understand our data handling practices.`,
  },
  {
    id: 'third-party',
    title: '8. Third-Party Links and Services',
    content: `TOOLBeans may contain links to third-party websites or services. These links are provided for convenience only. We have no control over third-party sites and are not responsible for their content, privacy practices or availability.

Our use of certain third-party services including Google Analytics for anonymised analytics and hosting providers is described in our Privacy Policy.`,
  },
  {
    id: 'modifications',
    title: '9. Modifications to the Service',
    content: `We reserve the right to modify, suspend or discontinue any part of TOOLBeans at any time without prior notice. This includes adding new tools, removing existing tools, changing tool functionality and updating the site design.

We will make reasonable efforts to maintain continuity of service but cannot guarantee uninterrupted availability. Planned maintenance will be performed during low-usage periods where possible.`,
  },
  {
    id: 'governing-law',
    title: '10. Governing Law',
    content: `These Terms of Service are governed by and construed in accordance with applicable law. Any disputes arising under these terms will be subject to the exclusive jurisdiction of the competent courts.

If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.`,
  },
  {
    id: 'contact-terms',
    title: '11. Contact',
    content: `If you have questions about these Terms of Service or need to report a violation, please contact us through the contact page at toolbeans.com/contact. We respond to all enquiries within 24 hours on business days.`,
  },
];

export default function TermsPage() {
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
              <span className="text-slate-400" aria-current="page">Terms of Service</span>
            </nav>
            <span className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-indigo-500/30 mb-5">
              Legal
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Terms of Service</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Last updated: January 1, 2026
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mt-3 max-w-2xl">
              These terms govern your use of TOOLBeans and all 39 free tools available at toolbeans.com.
              Please read them before using the site.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* SIDEBAR NAV */}
            <aside className="lg:col-span-1">
              <div className="sticky top-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contents</p>
                <nav aria-label="Terms sections">
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
                <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col gap-2">
                  <Link href="/privacy" className="text-xs text-indigo-600 font-bold hover:underline">
                    Privacy Policy
                  </Link>
                  <Link href="/contact" className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                    Contact us
                  </Link>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">

                {/* Summary box */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Key Points</p>
                  <ul className="flex flex-col gap-1.5 mt-2">
                    {[
                      'All 39 tools are free to use for personal and commercial purposes.',
                      'Browser tools process data locally. No data is sent to our servers.',
                      'Uploaded files for PDF conversion are deleted immediately after conversion.',
                      'Do not use the tools for unlawful purposes or to process files you do not own.',
                      'Tools are provided as-is with no warranty of fitness for specific purposes.',
                    ].map((point) => (
                      <li key={point} className="flex gap-2 items-start">
                        <span className="text-amber-600 font-bold text-xs mt-0.5 flex-shrink-0" aria-hidden="true">--</span>
                        <span className="text-xs text-amber-900 leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
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
                    These terms apply to toolbeans.com. Also see our{' '}
                    <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                    Questions? Visit our{' '}
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