// app/tools/layout.jsx
// This server component provides metadata for the tools directory page.
// The actual tools/page.jsx is 'use client' so metadata must live here.

export const metadata = {
  title: 'All 39 Free Online Developer and PDF Tools No Login Required | TOOLBeans',
  description: 'Browse all 39 free developer tools on TOOLBeans. JSON formatter, password generator, Word to PDF, PDF to Word, JWT decoder, regex tester and 34 more. No account needed.',
  keywords: [
    'free online developer tools', 'json formatter', 'password generator',
    'word to pdf', 'pdf to word', 'jwt decoder', 'regex tester', 'diff checker',
    'qr code generator', 'base64 encoder', 'pdf converter', 'excel to pdf',
    'pdf to excel', 'free pdf tools', 'browser based tools'
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools' },
  openGraph: {
    title: 'All 39 Free Online Developer and PDF Tools | TOOLBeans',
    description: 'Browse all 39 free developer tools. JSON formatter, password generator, Word to PDF, PDF to Word, JWT decoder and more. No account needed.',
    url: 'https://toolbeans.com/tools',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'TOOLBeans 39 Free Developer and PDF Tools' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 39 Free Online Developer and PDF Tools | TOOLBeans',
    description: '39 free tools. No signup, no limits. JSON formatter, password generator, Word to PDF, PDF to Word and more.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function ToolsLayout({ children }) {
  return children;
}