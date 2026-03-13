import URLShortenerTool from '@/tools/URLShortenerTool';

export const metadata = {
  title: 'URL Shortener Free Online Link Shortener with Custom Alias',
  description:
    'Shorten long URLs to clean short links for free. Set custom aliases, track click counts, generate a QR code per link and preview the safe destination. Free URL shortener no account required.',
  keywords: [
    'url shortener',
    'free url shortener',
    'shorten url online',
    'short link generator',
    'custom url shortener',
    'link shortener free',
    'url shortener no signup',
    'custom alias url shortener',
    'short url generator',
    'url shortener with qr code',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/url-shortener' },
  openGraph: {
    title: 'Free URL Shortener Custom Aliases and Click Tracking | TOOLBeans',
    description:
      'Shorten URLs with custom aliases and track click counts. QR code per link, safe destination preview. Free no account needed.',
    url: 'https://toolbeans.com/tools/url-shortener',
  },
};

export default function URLShortenerPage() {
  return <URLShortenerTool />;
}