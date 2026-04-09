// app/tools/pdf-to-png/page.jsx
import PdfToPngTool from '@/tools/PdfToPngTool';

export const metadata = {
  title: 'PDF to PNG Converter Free — Convert PDF Pages to PNG Images',
  description: 'Convert every PDF page to PNG image free. Transparent background supported. Browser-based, no upload.',
  keywords: ['pdf-to-png', 'pdf-to-png free', 'pdf-to-png online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-png' },
  openGraph: {
    title: 'PDF to PNG Converter Free — Convert PDF Pages to PNG Images',
    description: 'Convert every PDF page to PNG image free. Transparent background supported. Browser-based, no upload.',
    url: 'https://toolbeans.com/tools/pdf-to-png',
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
        { '@type': 'ListItem', position: 3, name: 'PDF to PNG', item: 'https://toolbeans.com/tools/pdf-to-png' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to PNG Converter',
      url: 'https://toolbeans.com/tools/pdf-to-png',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Convert every PDF page to PNG image free. Transparent background supported. Browser-based, no upload.',
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
      <PdfToPngTool />
    </>
  );
}