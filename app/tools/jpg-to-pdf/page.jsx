// app/tools/jpg-to-pdf/page.jsx
import JpgToPdfTool from '@/tools/JpgToPdfTool';

export const metadata = {
  title: 'JPG to PDF Converter Free Online — No Upload, No Signup',
  description:
    'Convert JPG to PDF free online. No upload required — runs entirely in your browser. Combine multiple JPG images into one PDF. Choose page size, orientation and margin. Supports JPG, PNG, WebP.',
  keywords: [
    'jpg to pdf',
    'jpg to pdf converter',
    'convert jpg to pdf',
    'jpeg to pdf',
    'jpg to pdf free',
    'jpg to pdf no upload',
    'combine images to pdf',
    'multiple jpg to pdf',
    'image to pdf converter',
    'jpg to pdf online free',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/jpg-to-pdf' },
  openGraph: {
    title: 'JPG to PDF Converter — Free, No Upload, Browser-Based',
    description:
      'Convert JPG images to PDF instantly in your browser. Combine multiple images into one PDF. Choose A4, Letter, custom page sizes. 100% private — no server upload.',
    url: 'https://toolbeans.com/tools/jpg-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',       item: 'https://toolbeans.com'                  },
        { '@type': 'ListItem', position: 2, name: 'Tools',      item: 'https://toolbeans.com/tools'            },
        { '@type': 'ListItem', position: 3, name: 'JPG to PDF', item: 'https://toolbeans.com/tools/jpg-to-pdf' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'JPG to PDF Converter',
      url: 'https://toolbeans.com/tools/jpg-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free browser-based JPG to PDF converter. Convert single or multiple JPG images to a PDF document with custom page size, orientation and margins. No upload, no server, completely private.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Convert JPG to PDF in browser',
        'Combine multiple images into one PDF',
        'A4, A3, Letter, Legal and Fit Image page sizes',
        'Portrait and landscape orientation',
        'Adjustable margins',
        'Drag and drop image upload',
        'Reorder images before converting',
        'No file size limit',
        'No watermark',
        'Supports JPG, PNG, WebP, GIF, BMP',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is this JPG to PDF converter free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, completely free. No sign-up, no credit card, no watermark and no file size limit.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are my images uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All conversion happens inside your browser using JavaScript. Your images never leave your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert multiple JPG files to one PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Add as many images as you want. Each image becomes one page in the PDF. You can reorder them before converting.',
          },
        },
        {
          '@type': 'Question',
          name: 'What image formats are supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'JPG, JPEG, PNG, WebP, GIF and BMP are all supported.',
          },
        },
      ],
    },
  ],
};

export default function JpgToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JpgToPdfTool />
    </>
  );
}