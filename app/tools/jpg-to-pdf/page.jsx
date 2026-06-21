// app/tools/jpg-to-pdf/page.jsx
import JpgToPdfTool from '@/tools/JpgToPdfTool';

export const metadata = {
  title: 'JPG to PDF Converter Free Online No Upload, No Signup',
  description:
    'Convert JPG to PDF free online. No upload required, runs entirely in your browser. Combine multiple JPG images into one PDF, rotate sideways photos, reorder pages. Choose page size, orientation and margin. Supports JPG, PNG, WebP, GIF, BMP.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans','TOOLBEANS','TOOL BEANS',
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
    'jpg to pdf converter free no signup',
    'combine multiple jpg into one pdf free',
    'jpg to pdf without losing quality',
    'jpeg to pdf converter online free',
    'convert photos to pdf free online',
    'rotate jpg to pdf online',
    'jpg to pdf no watermark free',
    'how to convert jpg to pdf without software',
    'merge jpg files into pdf online',
    'scanned jpg to pdf converter free',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/jpg-to-pdf' },
  openGraph: {
    title: 'JPG to PDF Converter Free, No Upload, Browser-Based',
    description:
      'Convert JPG images to PDF instantly in your browser. Combine multiple images into one PDF, rotate and reorder pages. Choose A4, Letter, custom page sizes. 100% private, no server upload.',
    url: 'https://toolbeans.com/tools/jpg-to-pdf',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'JPG to PDF Converter TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free JPG to PDF Converter No Upload | TOOLBeans',
    description: 'Convert and combine JPG images into one PDF in your browser. Rotate, reorder, choose page size. No upload, no watermark, free.',
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
        'Free browser-based JPG to PDF converter. Convert single or multiple JPG images to a PDF document with custom page size, orientation and margins. Rotate sideways photos and reorder pages. No upload, no server, completely private.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Convert JPG to PDF in browser',
        'Combine multiple images into one PDF',
        'Rotate individual images in 90° steps',
        'Reverse the page order in one click',
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
          name: 'Can I rotate a JPG before converting it to PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Each image has rotate-left and rotate-right buttons that turn it in 90 degree steps, which is ideal for sideways phone photos or scans. Rotation is applied losslessly, and images you do not rotate keep their original pixel-perfect embedding.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does converting JPG to PDF reduce quality?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. For JPG and PNG, the raw image bytes are embedded directly into the PDF with no re-encoding, so the image in the PDF is identical to the original file.',
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