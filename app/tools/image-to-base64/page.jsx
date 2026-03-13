import ImageToBase64Tool from '@/tools/ImageToBase64Tool';

export const metadata = {
  title: 'Image to Base64 Converter Convert PNG, JPG, SVG to Base64 Free Online',
  description:
    'Convert images to Base64 Data URL, HTML img tag, CSS background, Markdown or JSON free online. Also decode Base64 back to image. Supports PNG, JPG, GIF, WebP, SVG, BMP, ICO, AVIF. Batch convert. No upload 100% in browser.',
  keywords: [
    'image to base64',
    'image to base64 converter',
    'convert image to base64',
    'png to base64',
    'jpg to base64',
    'svg to base64',
    'base64 image encoder',
    'image base64 online',
    'base64 to image',
    'data url generator',
    'base64 encode image',
    'image to data url',
    'webp to base64',
    'gif to base64',
    'base64 image decoder',
    'inline image base64',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/image-to-base64' },
  openGraph: {
    title: 'Free Image to Base64 Converter PNG, JPG, SVG, WebP + Decoder | TOOLBeans',
    description:
      'Convert any image to Base64 Data URL, HTML, CSS, Markdown or JSON instantly. Decode Base64 back to image. Batch convert. No server upload.',
    url: 'https://toolbeans.com/tools/image-to-base64',
  },
};

export default function ImageToBase64Page() {
  return <ImageToBase64Tool />;
}