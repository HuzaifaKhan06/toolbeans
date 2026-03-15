// app/layout.js
import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Script from 'next/script';

const geist = Geist({ subsets: ['latin'] });

const SITE_URL  = 'https://toolbeans.com';
const SITE_NAME = 'TOOLBeans';

export const metadata = {
  metadataBase: new URL(SITE_URL),

  verification: {
    google: 'PCF_XKyYgfZ_L7sZ7Vodi9sxMs4Vl0RwYQpGhYzYD1k',
  },

  title: {
    default:  'TOOLBeans Free Online Developer Tools',
    template: '%s | TOOLBeans',
  },

  description:
    'TOOLBeans gives developers, data engineers and everyday users 30 free online tools. Password generator, JSON formatter, JWT decoder, diff checker, CSV to SQL, regex tester, QR code generator, Word to PDF, Excel to PDF, PowerPoint to PDF and more no signup required.',

  keywords: [
    // Brand
    'toolbeans', 'tool beans', 'toolbeans tools',
    // Category
    'free developer tools', 'free online developer tools',
    'browser based developer tools', 'online tools no signup',
    // Developer tools
    'password generator online', 'qr code generator free',
    'json formatter online', 'sql formatter online',
    'base64 encode decode online', 'url encoder decoder online',
    'url shortener free', 'text case converter',
    'hash generator sha256 md5', 'jwt decoder online',
    'regex tester online', 'word counter online',
    'lorem ipsum generator', 'color picker online',
    'unix timestamp converter', 'csv to sql converter',
    'html to markdown converter', 'code formatter online',
    'diff checker online', 'image to base64 converter',
    'api request tester online',
    // PDF tools
    'word to pdf converter', 'excel to pdf converter',
    'powerpoint to pdf converter', 'jpg to pdf',
    'png to pdf', 'image to pdf', 'txt to pdf',
    'svg to pdf', 'html to pdf', 'pdf converter free',
    'convert word to pdf free', 'convert excel to pdf free',
  ],

  authors:   [{ name: 'TOOLBeans', url: SITE_URL }],
  creator:   'TOOLBeans',
  publisher: 'TOOLBeans',

  robots: {
    index: true, follow: true, nocache: false,
    googleBot: {
      index: true, follow: true, noimageindex: false,
      'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1,
    },
  },

  alternates: { canonical: SITE_URL },

  openGraph: {
    type: 'website', locale: 'en_US', url: SITE_URL, siteName: SITE_NAME,
    title: 'TOOLBeans 30 Free Online Developer & PDF Tools',
    description:
      'Password generator, JSON formatter, diff checker, JWT decoder, Word to PDF, Excel to PDF, PowerPoint to PDF and 23 more. All free, all private, all in your browser.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TOOLBeans Free Online Developer Tools', type: 'image/png' }],
  },

  twitter: {
    card: 'summary_large_image', site: '@toolbeans', creator: '@toolbeans',
    title: 'TOOLBeans 30 Free Online Developer & PDF Tools',
    description: 'Password generator, JSON formatter, Word to PDF, Excel to PDF, PowerPoint to PDF and 25 more. Free, private, no signup.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: [
      { url: '/favicon.ico',  sizes: 'any'              },
      { url: '/icon-16.png',  sizes: '16x16',  type: 'image/png' },
      { url: '/icon-32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple:   [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },

  manifest: '/site.webmanifest',
  category: 'technology',
  other: { 'theme-color': '#7c3aed' },
};

// ── Global JSON-LD WebSite + Organization + ItemList (all 30 tools) ──
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id':   SITE_URL + '/#website',
      url:     SITE_URL,
      name:    SITE_NAME,
      description: '30 free browser-based tools for developers and data professionals.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE_URL + '/tools?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Organization',
      '@id':   SITE_URL + '/#organization',
      name:    SITE_NAME,
      url:     SITE_URL,
      logo: { '@type': 'ImageObject', url: SITE_URL + '/logo.png', width: 200, height: 60 },
      sameAs: ['https://twitter.com/toolbeans', 'https://github.com/toolbeans'],
    },
    {
      '@type':       'ItemList',
      '@id':         SITE_URL + '/#tools',
      name:          'Free Developer & PDF Tools',
      description:   '30 free online tools for developers, data engineers and everyday users.',
      numberOfItems: 30,
      itemListElement: [
        // ── 21 Developer tools ──
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
        { '@type': 'ListItem', position: 12, name: 'Word Counter',           url: SITE_URL + '/tools/word-counter'           },
        { '@type': 'ListItem', position: 13, name: 'Lorem Ipsum Generator',  url: SITE_URL + '/tools/lorem-ipsum'            },
        { '@type': 'ListItem', position: 14, name: 'Color Picker',           url: SITE_URL + '/tools/color-picker'           },
        { '@type': 'ListItem', position: 15, name: 'Timestamp Converter',    url: SITE_URL + '/tools/timestamp-converter'    },
        { '@type': 'ListItem', position: 16, name: 'CSV to SQL Converter',   url: SITE_URL + '/tools/csv-to-sql'             },
        { '@type': 'ListItem', position: 17, name: 'HTML to Markdown',       url: SITE_URL + '/tools/html-to-markdown'       },
        { '@type': 'ListItem', position: 18, name: 'Code Formatter',         url: SITE_URL + '/tools/code-formatter'         },
        { '@type': 'ListItem', position: 19, name: 'Diff Checker',           url: SITE_URL + '/tools/diff-checker'           },
        { '@type': 'ListItem', position: 20, name: 'Image to Base64',        url: SITE_URL + '/tools/image-to-base64'        },
        { '@type': 'ListItem', position: 21, name: 'API Request Tester',     url: SITE_URL + '/tools/api-request-tester'     },
        // ── 9 PDF tools ──
        { '@type': 'ListItem', position: 22, name: 'JPG to PDF',             url: SITE_URL + '/tools/jpg-to-pdf'             },
        { '@type': 'ListItem', position: 23, name: 'PNG to PDF',             url: SITE_URL + '/tools/png-to-pdf'             },
        { '@type': 'ListItem', position: 24, name: 'Image to PDF',           url: SITE_URL + '/tools/image-to-pdf'           },
        { '@type': 'ListItem', position: 25, name: 'TXT to PDF',             url: SITE_URL + '/tools/txt-to-pdf'             },
        { '@type': 'ListItem', position: 26, name: 'SVG to PDF',             url: SITE_URL + '/tools/svg-to-pdf'             },
        { '@type': 'ListItem', position: 27, name: 'HTML to PDF',            url: SITE_URL + '/tools/html-to-pdf'            },
        { '@type': 'ListItem', position: 28, name: 'Word to PDF',            url: SITE_URL + '/tools/word-to-pdf'            },
        { '@type': 'ListItem', position: 29, name: 'Excel to PDF',           url: SITE_URL + '/tools/excel-to-pdf'           },
        { '@type': 'ListItem', position: 30, name: 'PowerPoint to PDF',      url: SITE_URL + '/tools/powerpoint-to-pdf'      },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-1LE5VZ745C" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-1LE5VZ745C');`}
        </Script>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={geist.className + ' bg-slate-50 antialiased'}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}