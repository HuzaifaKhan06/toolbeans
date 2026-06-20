import ImageToBase64Tool from '@/tools/ImageToBase64Tool';

export const metadata = {
  title: 'Image to Base64 Converter  Convert PNG, JPG, SVG to Base64 Free Online',
  description:
    'Convert images to Base64 Data URL, HTML img tag, CSS background, Markdown or JSON free online. Smaller URL-encoded data URI for SVG. Also decode Base64 back to image. Supports PNG, JPG, GIF, WebP, SVG, BMP, ICO, AVIF. Batch convert. No upload, 100% in browser.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans','TOOLBEANS','TOOL BEANS',
    'image to base64',
    'image to base64 converter',
    'convert image to base64',
    'png to base64',
    'jpg to base64',
    'svg to base64',
    'svg to data uri',
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
    'image to base64 free online no signup',
    'convert png to base64 data url online',
    'svg to url encoded data uri',
    'image to base64 for css background',
    'image to base64 html img tag generator',
    'base64 image to markdown converter',
    'image to base64 json field generator',
    'batch image to base64 converter online',
    'decode base64 to image online free',
    'image to base64 in browser private',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/image-to-base64' },
  openGraph: {
    title: 'Free Image to Base64 Converter  PNG, JPG, SVG, WebP + Decoder | TOOLBeans',
    description:
      'Convert any image to Base64 Data URL, HTML, CSS, Markdown or JSON instantly. Smaller URL-encoded data URI for SVG. Decode Base64 back to image. Batch convert. No server upload.',
    url: 'https://toolbeans.com/tools/image-to-base64',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Image to Base64 Converter  TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image to Base64 Converter + Decoder | TOOLBeans',
    description: 'Convert images to Base64 Data URL, HTML, CSS, Markdown or JSON. Smaller URL-encoded data URI for SVG. Decode Base64 back to image. Free, private, in-browser.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://toolbeans.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://toolbeans.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Image to Base64', item: 'https://toolbeans.com/tools/image-to-base64' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Image to Base64 Converter  TOOLBeans',
      url: 'https://toolbeans.com/tools/image-to-base64',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any web browser',
      description: 'Free online image to Base64 converter that turns PNG, JPG, GIF, WebP, SVG, BMP, ICO and AVIF images into Base64 Data URLs, HTML img tags, CSS backgrounds, Markdown or JSON. Offers a smaller URL-encoded data URI for SVG, batch conversion and a Base64-to-image decoder. Runs entirely in the browser with no upload.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Convert PNG, JPG, GIF, WebP, SVG, BMP, ICO and AVIF to Base64',
        'Output as Data URL, Base64, HTML img, CSS background, Markdown or JSON',
        'Smaller URL-encoded data URI option for SVG',
        'Batch convert multiple images at once',
        'Download each result or one combined file',
        'Decode Base64 or a Data URL back to an image',
        'Live preview with dimensions and size stats',
        'Runs entirely in browser, nothing uploaded',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is the image to Base64 converter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It is completely free with no signup and no usage limits, and it runs entirely in your browser.' } },
        { '@type': 'Question', name: 'Are my images uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Images are read and encoded locally in your browser using the FileReader API. They never leave your device.' } },
        { '@type': 'Question', name: 'What output formats can I get?', acceptedAnswer: { '@type': 'Answer', text: 'A raw Data URL, a Base64-only string, an HTML img tag, a CSS background-image rule, Markdown image syntax, or a JSON field. For SVG you can also get a smaller URL-encoded data URI.' } },
        { '@type': 'Question', name: 'Can I decode Base64 back into an image?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to the Base64 to Image tab, paste a Base64 string or full Data URL, and the tool previews the decoded image with a one-click download.' } },
        { '@type': 'Question', name: 'Why is a Base64 image bigger than the original file?', acceptedAnswer: { '@type': 'Answer', text: 'Base64 encoding represents binary data using text characters, which adds roughly 33 percent to the size. The tool shows the exact size increase for each image.' } },
        { '@type': 'Question', name: 'When should I use Base64 images instead of normal files?', acceptedAnswer: { '@type': 'Answer', text: 'Base64 data URLs are best for small images such as icons and logos that you want to embed directly in HTML, CSS or JSON to avoid an extra network request. Large images are usually better served as normal files.' } },
      ],
    },
  ],
};

export default function ImageToBase64Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ImageToBase64Tool />
    </>
  );
}