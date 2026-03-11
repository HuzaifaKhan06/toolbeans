import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Script from 'next/script';

const geist = Geist({ subsets: ['latin'] });

const SITE_URL = 'https://toolbeans.com';
const SITE_NAME = 'TOOLBeans';
const SITE_TAGLINE = 'Free Online Developer Tools';

export const metadata = {
  verification: {
    google: 'PCF_XKyYgfZ_L7sZ7Vodi9sxMs4Vl0RwYQpGhYzYD1k',
  },
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'TOOLBeans — Free Online Developer Tools',
    template: '%s | TOOLBeans',
  },

  description:
    'TOOLBeans gives developers, data engineers and everyday users free online tools that run entirely in the browser. Generate passwords, format JSON and SQL, decode JWT tokens, test regex patterns, create QR codes, shorten URLs and more — no signup required.',

  keywords: [
    'free developer tools',
    'online developer tools',
    'json formatter online',
    'password generator',
    'qr code generator free',
    'jwt decoder online',
    'regex tester online',
    'base64 encode decode',
    'url encoder decoder',
    'sql formatter online',
    'hash generator sha256',
    'url shortener free',
    'text case converter',
    'toolbeans',
    'free web tools',
    'browser tools no signup',
  ],

  authors: [{ name: 'TOOLBeans', url: SITE_URL }],
  creator: 'TOOLBeans',
  publisher: 'TOOLBeans',

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'TOOLBeans — Free Online Developer Tools',
    description:
      'Password generator, JSON formatter, QR code creator, JWT decoder, regex tester, URL shortener and more. All free, all private, all in your browser.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TOOLBeans — Free Online Developer Tools',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@toolbeans',
    creator: '@toolbeans',
    title: 'TOOLBeans — Free Online Developer Tools',
    description:
      'Password generator, JSON formatter, QR code creator, JWT decoder, regex tester and more. Free, private, no signup.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: [
      { url: '/favicon.ico',             sizes: 'any'     },
      { url: '/icon-16.png',             sizes: '16x16',   type: 'image/png' },
      { url: '/icon-32.png',             sizes: '32x32',   type: 'image/png' },
      { url: '/icon-192.png',            sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png',    sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },

  manifest: '/site.webmanifest',

  category: 'technology',

  other: {
    'theme-color': '#7c3aed',
  },
};

// JSON-LD structured data — tells Google exactly what this site is
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': SITE_URL + '/#website',
      url: SITE_URL,
      name: SITE_NAME,
      description: 'Free online tools for developers and professionals.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: SITE_URL + '/tools?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id': SITE_URL + '/#organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: SITE_URL + '/logo.png',
        width: 200,
        height: 60,
      },
      sameAs: [
        'https://twitter.com/toolbeans',
        'https://github.com/toolbeans',
      ],
    },
    {
      '@type': 'ItemList',
      '@id': SITE_URL + '/#tools',
      name: 'Free Developer Tools',
      description: 'A collection of free online tools for developers.',
      numberOfItems: 11,
      itemListElement: [
        { '@type': 'ListItem', position: 1,  name: 'Password Generator',     url: SITE_URL + '/tools/password-generator'     },
        { '@type': 'ListItem', position: 2,  name: 'QR Code Generator',      url: SITE_URL + '/tools/qr-code-generator'      },
        { '@type': 'ListItem', position: 3,  name: 'JSON Formatter',         url: SITE_URL + '/tools/json-formatter'         },
        { '@type': 'ListItem', position: 4,  name: 'SQL Formatter',          url: SITE_URL + '/tools/sql-formatter'          },
        { '@type': 'ListItem', position: 5,  name: 'Base64 Encoder Decoder', url: SITE_URL + '/tools/base64-encoder-decoder' },
        { '@type': 'ListItem', position: 6,  name: 'URL Encoder Decoder',    url: SITE_URL + '/tools/url-encoder-decoder'    },
        { '@type': 'ListItem', position: 7,  name: 'URL Shortener',          url: SITE_URL + '/tools/url-shortener'          },
        { '@type': 'ListItem', position: 8,  name: 'Text Case Converter',    url: SITE_URL + '/tools/text-case-converter'    },
        { '@type': 'ListItem', position: 9,  name: 'Hash Generator',         url: SITE_URL + '/tools/hash-generator'         },
        { '@type': 'ListItem', position: 10, name: 'JWT Decoder',            url: SITE_URL + '/tools/jwt-decoder'            },
        { '@type': 'ListItem', position: 11, name: 'Regex Tester',           url: SITE_URL + '/tools/regex-tester'           },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>

  <Script
    src="https://www.googletagmanager.com/gtag/js?id=G-1LE5VZ745C"
    strategy="afterInteractive"
  />

  <Script id="google-analytics" strategy="afterInteractive">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-1LE5VZ745C');
    `}
  </Script>

  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />

</head>
      <body className={geist.className + ' bg-slate-50 antialiased'}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}