// app/tools/base64-encoder-decoder/page.jsx
import Base64Tool from '@/tools/Base64Tool';

export const metadata = {
  title: 'Free Base64 Encoder and Decoder — Encode and Decode Online Instantly',
  description:
    'Encode any text or file to Base64 and decode Base64 strings back to readable text for free. Supports standard Base64, URL-safe Base64, JWT token decoding and file uploads up to 5MB. Runs entirely in your browser. No upload, no signup, completely private.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans', 'TOOLBEANS','TOOL BEANS',
    'base64 encoder decoder online free',
    'encode text to base64 online',
    'decode base64 string free',
    'base64 encode decode tool',
    'base64 url safe encoder',
    'base64 file encoder online',
    'jwt base64 decoder free',
    'base64 converter no signup',
    'online base64 tool 2026',
    'base64 image encoder free',
    'convert string to base64 online',
    'base64 decode to text',
    'base64 encode file browser',
    'free base64 converter tool',
    'base64 online no install',
    'decode base64 to readable text',
    'what is base64 online tool',
    'base64 encoding tool developer',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/base64-encoder-decoder' },
  openGraph: {
    title: 'Free Base64 Encoder and Decoder — Encode and Decode Online Instantly | TOOLBeans',
    description:
      'Encode and decode Base64 strings instantly. Supports standard and URL-safe Base64, JWT token decoding and file upload. 100% browser-based, completely private, no signup.',
    url: 'https://toolbeans.com/tools/base64-encoder-decoder',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Base64 Encoder Decoder — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Base64 Encoder and Decoder Online | TOOLBeans',
    description: 'Encode text and files to Base64. Decode Base64 strings. URL-safe Base64, JWT decoding. Free, private, no install.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Base64 Encoder Decoder', item: 'https://toolbeans.com/tools/base64-encoder-decoder' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Base64 Encoder and Decoder — TOOLBeans',
    url: 'https://toolbeans.com/tools/base64-encoder-decoder',
    description: 'Free online Base64 encoder and decoder. Encode text or files to Base64. Decode Base64 strings to readable text. Supports standard Base64, URL-safe Base64 and JWT token decoding. Runs in browser with no upload.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Encode any text string to Base64',
      'Decode Base64 strings to readable text',
      'URL-safe Base64 encoding and decoding',
      'File upload and Base64 encoding up to 5MB',
      'JWT token Base64 payload decoding',
      'Copy to clipboard with one click',
      'Runs entirely in browser, nothing uploaded',
      'Supports UTF-8 characters and Unicode',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this Base64 encoder decoder free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The TOOLBeans Base64 Encoder and Decoder is completely free with no limits, no account and no signup required.' },
      },
      {
        '@type': 'Question',
        name: 'Does my data get uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. The Base64 encoder and decoder runs entirely in your browser using JavaScript. Your text and files never leave your device and are never sent to any server.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between standard Base64 and URL-safe Base64?',
        acceptedAnswer: { '@type': 'Answer', text: 'Standard Base64 uses + and / characters which have special meaning in URLs. URL-safe Base64 replaces + with - and / with _ so the encoded string can be used safely in URLs and filenames without percent-encoding. JWT tokens use URL-safe Base64.' },
      },
      {
        '@type': 'Question',
        name: 'Can I encode image files to Base64?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can upload any file up to 5MB and the tool will encode it to Base64. This is useful for embedding images in HTML as data URLs or including binary files in JSON payloads.' },
      },
      {
        '@type': 'Question',
        name: 'Is Base64 the same as encryption?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. Base64 is encoding, not encryption. It is a completely reversible transformation with no secret key. Anyone can decode a Base64 string instantly. Do not use Base64 to protect sensitive data.' },
      },
      {
        '@type': 'Question',
        name: 'Can I decode JWT tokens with this tool?',
        acceptedAnswer: { '@type': 'Answer', text: 'You can decode the Base64URL-encoded header and payload sections of a JWT token using this tool. For a dedicated JWT decoder with claim inspection and expiry countdown, use our JWT Decoder tool.' },
      },
    ],
  },
];

export default function Base64EncoderDecoderPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <Base64Tool />
    </>
  );
}