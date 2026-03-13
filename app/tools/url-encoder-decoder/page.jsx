import URLTool from '@/tools/URLTool';

export const metadata = {
  title: 'URL Encoder Decoder Free Online Percent Encoding Tool',
  description:
    'Encode and decode URL components and query strings online. Supports percent encoding, full URL encoding and URL-safe encoding. Includes query string builder and URL parser. Free URL encoder decoder.',
  keywords: [
    'url encoder decoder',
    'url encode online',
    'url decode online',
    'percent encoding online',
    'encode url online',
    'url encoding tool',
    'decode url online',
    'query string encoder',
    'url component encoder',
    'url percent encode',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/url-encoder-decoder' },
  openGraph: {
    title: 'Free URL Encoder Decoder Online Percent Encoding | TOOLBeans',
    description:
      'Encode and decode URLs and query strings online. Percent encoding, URL parser and query builder. Free, no signup.',
    url: 'https://toolbeans.com/tools/url-encoder-decoder',
  },
};

export default function URLEncoderDecoderPage() {
  return <URLTool />;
}