import Base64Tool from '@/tools/Base64Tool';

export const metadata = {
  title: 'Base64 Encoder Decoder — Free Online Base64 Encode and Decode',
  description:
    'Encode text or files to Base64 and decode Base64 strings online. Supports standard and URL-safe Base64, JWT token decoding and files up to 5MB. Free Base64 encoder decoder — runs in browser.',
  keywords: [
    'base64 encoder decoder',
    'base64 encode online',
    'base64 decode online',
    'base64 encoder online',
    'encode to base64',
    'decode base64 string',
    'base64 url safe',
    'base64 file encoder',
    'jwt base64 decoder',
    'base64 converter online',
    'free base64 converter online',
    'online base64 converter free',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/base64-encoder-decoder' },
  openGraph: {
    title: 'Free Base64 Encoder Decoder Online | TOOLBeans',
    description:
      'Encode and decode Base64 strings instantly. Supports URL-safe Base64, JWT tokens and file upload. Free, private, no signup.',
    url: 'https://toolbeans.com/tools/base64-encoder-decoder',
  },
};

export default function Base64EncoderDecoderPage() {
  return <Base64Tool />;
}