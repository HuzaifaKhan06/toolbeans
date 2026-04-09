// app/tools/pdf-to-csv/page.jsx
import PdfToCsvTool from '@/tools/PdfToCsvTool';

export const metadata = {
  title: 'PDF to CSV Converter Free — Extract Tables From PDF Online',
  description: 'Extract tables and data from PDF to CSV free. Column detection using text positions. Browser-based.',
  keywords: ['pdf-to-csv', 'pdf-to-csv free', 'pdf-to-csv online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-csv' },
  openGraph: {
    title: 'PDF to CSV Converter Free — Extract Tables From PDF Online',
    description: 'Extract tables and data from PDF to CSV free. Column detection using text positions. Browser-based.',
    url: 'https://toolbeans.com/tools/pdf-to-csv',
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
        { '@type': 'ListItem', position: 3, name: 'PDF to CSV', item: 'https://toolbeans.com/tools/pdf-to-csv' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to CSV Converter',
      url: 'https://toolbeans.com/tools/pdf-to-csv',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Extract tables and data from PDF to CSV free. Column detection using text positions. Browser-based.',
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
      <PdfToCsvTool />
    </>
  );
}