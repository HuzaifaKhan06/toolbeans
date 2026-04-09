// app/tools/pdf-to-svg/page.jsx
import PdfToSvgTool from '@/tools/PdfToSvgTool';

export const metadata = {
  title: 'PDF to SVG Converter Free — Convert PDF to Vector Graphics',
  description: 'Convert PDF to SVG vector graphics free. Scalable output for web and print. Powered by LibreOffice.',
  keywords: ['pdf-to-svg', 'pdf-to-svg free', 'pdf-to-svg online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-svg' },
  openGraph: {
    title: 'PDF to SVG Converter Free — Convert PDF to Vector Graphics',
    description: 'Convert PDF to SVG vector graphics free. Scalable output for web and print. Powered by LibreOffice.',
    url: 'https://toolbeans.com/tools/pdf-to-svg',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://toolbeans.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://toolbeans.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'PDF to SVG', item: 'https://toolbeans.com/tools/pdf-to-svg' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to SVG Converter',
      url: 'https://toolbeans.com/tools/pdf-to-svg',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Convert PDF to SVG vector graphics free. Scalable output for web and print. Powered by LibreOffice.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is this tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Completely free with no usage limits and no account required.' } },
        { '@type': 'Question', name: 'Is my file stored?', acceptedAnswer: { '@type': 'Answer', text: 'No. Your file is processed and deleted immediately. We never store your documents.' } },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PdfToSvgTool />
    </>
  );
}