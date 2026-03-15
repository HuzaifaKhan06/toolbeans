// app/tools/svg-to-pdf/page.jsx
import SvgToPdfTool from '@/tools/SvgToPdfTool';

export const metadata = {
  title: 'SVG to PDF Converter Free Online — Vector Quality, No Upload',
  description:
    'Convert SVG to PDF free online. No upload — 100% browser-based. Retina-quality render at 2× scale. Fit SVG page mode. Combine multiple SVGs into one PDF. No watermark, no signup.',
  keywords: [
    'svg to pdf',
    'svg to pdf converter',
    'convert svg to pdf',
    'svg to pdf free',
    'svg to pdf online',
    'svg to pdf no upload',
    'vector to pdf',
    'svg file to pdf',
    'svg to pdf converter free online',
    'convert vector to pdf',
    'svg to pdf high quality',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/svg-to-pdf' },
  openGraph: {
    title: 'SVG to PDF Converter — Free, Retina Quality, No Upload',
    description:
      'Convert SVG vector graphics to PDF in your browser. Up to 2× retina scale. Fit SVG page mode. Combine multiple SVGs. No server upload.',
    url: 'https://toolbeans.com/tools/svg-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',       item: 'https://toolbeans.com'                   },
        { '@type': 'ListItem', position: 2, name: 'Tools',      item: 'https://toolbeans.com/tools'             },
        { '@type': 'ListItem', position: 3, name: 'SVG to PDF', item: 'https://toolbeans.com/tools/svg-to-pdf'  },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'SVG to PDF Converter',
      url: 'https://toolbeans.com/tools/svg-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free browser-based SVG to PDF converter. Rasterizes SVG at up to 2× retina scale using lossless PNG. Fit SVG page mode. Combine multiple SVGs into one PDF. No upload, no server.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'SVG to PDF in browser — no upload',
        'Render scale 0.5× to 2× (retina)',
        'Fit SVG page mode — exact dimensions',
        'A4, A3, Letter, Legal page sizes',
        'Portrait and landscape orientation',
        'Adjustable margins',
        'SVG dimension preview per file',
        'Multi-SVG to one PDF',
        'Drag and drop upload',
        'Reorder SVGs before converting',
        'No watermark, no signup',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I convert SVG to PDF without losing quality?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use the 2× render scale — this rasterizes the SVG at double resolution before embedding as lossless PNG in the PDF. The output is sharp on both regular and high-DPI screens.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are my SVG files uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All conversion happens entirely in your browser using pdf-lib and the browser\'s native SVG renderer. Your files never leave your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does Fit SVG page size mean?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Fit SVG creates a PDF page that exactly matches your SVG viewBox dimensions — no wasted white space, perfect proportions for the original artwork.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert multiple SVG files to one PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Upload multiple SVG files and they all combine into one PDF — one SVG per page. Use the arrows to reorder before downloading.',
          },
        },
      ],
    },
  ],
};

export default function SvgToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SvgToPdfTool />
    </>
  );
}