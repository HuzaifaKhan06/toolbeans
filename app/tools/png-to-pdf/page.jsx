// app/tools/png-to-pdf/page.jsx
import PngToPdfTool from '@/tools/PngToPdfTool';

export const metadata = {
  title: 'PNG to PDF Converter Free Online Transparency Preserved, No Upload',
  description:
    'Convert PNG to PDF free online. Transparency preserved. No upload required 100% browser-based. Combine multiple PNG images into one PDF. Choose A4, Letter, custom page sizes. No watermark, no signup.',
  keywords: [
    'png to pdf',
    'png to pdf converter',
    'convert png to pdf',
    'png to pdf free',
    'png to pdf no upload',
    'transparent png to pdf',
    'multiple png to pdf',
    'png to pdf online',
    'image to pdf converter',
    'png pdf converter free online',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/png-to-pdf' },
  openGraph: {
    title: 'PNG to PDF Converter Free, Transparency Preserved, No Upload',
    description:
      'Convert PNG images to PDF instantly in your browser. Transparency preserved. Combine multiple PNGs into one PDF. A4, Letter, custom sizes. 100% private no server upload.',
    url: 'https://toolbeans.com/tools/png-to-pdf',
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
        { '@type': 'ListItem', position: 3, name: 'PNG to PDF', item: 'https://toolbeans.com/tools/png-to-pdf' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PNG to PDF Converter',
      url: 'https://toolbeans.com/tools/png-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free browser-based PNG to PDF converter. Preserves PNG transparency. Convert single or multiple PNG images to a PDF document. No upload, no server, completely private.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Convert PNG to PDF in browser',
        'PNG transparency preserved',
        'Combine multiple images into one PDF',
        'A4, A3, Letter, Legal and Fit Image page sizes',
        'Portrait and landscape orientation',
        'Adjustable margins',
        'Checkerboard transparency preview',
        'Drag and drop upload',
        'Reorder images before converting',
        'No watermark, no signup, no file size limit',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does converting PNG to PDF preserve transparency?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. PNG alpha channel transparency is preserved during conversion. The tool renders each image through an HTML5 canvas to maintain accurate transparency in the output PDF.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are my PNG files uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All conversion happens entirely inside your browser using the pdf-lib JavaScript library. Your PNG files never leave your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert multiple PNG files to one PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Add as many PNG images as you need. Each becomes one page. Use the arrow buttons to reorder pages before downloading.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between PNG to PDF and JPG to PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PNG supports transparency (alpha channel) while JPG does not. This PNG to PDF converter preserves transparent areas. JPG images are always fully opaque.',
          },
        },
      ],
    },
  ],
};

export default function PngToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PngToPdfTool />
    </>
  );
}