// app/tools/pdf-to-excel/page.jsx
import PdfToExcelTool from '@/tools/PdfToExcelTool';

export const metadata = {
  title: 'PDF to Excel Converter Free — Convert PDF to XLSX Online',
  description: 'Convert PDF to Excel .xlsx free. Tables and data extracted. Powered by LibreOffice on our secure server.',
  keywords: ['pdf-to-excel', 'pdf-to-excel free', 'pdf-to-excel online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-excel' },
  openGraph: {
    title: 'PDF to Excel Converter Free — Convert PDF to XLSX Online',
    description: 'Convert PDF to Excel .xlsx free. Tables and data extracted. Powered by LibreOffice on our secure server.',
    url: 'https://toolbeans.com/tools/pdf-to-excel',
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
        { '@type': 'ListItem', position: 3, name: 'PDF to Excel', item: 'https://toolbeans.com/tools/pdf-to-excel' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to Excel Converter',
      url: 'https://toolbeans.com/tools/pdf-to-excel',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Convert PDF to Excel .xlsx free. Tables and data extracted. Powered by LibreOffice on our secure server.',
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
      <PdfToExcelTool />
    </>
  );
}