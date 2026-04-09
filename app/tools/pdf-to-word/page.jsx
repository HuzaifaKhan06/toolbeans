// app/tools/pdf-to-word/page.jsx
import PdfToWordTool from '@/tools/PdfToWordTool';

export const metadata = {
  title: 'PDF to Word Converter Free — Convert PDF to Editable DOCX',
  description: 'Convert PDF to editable Word .docx free. Text, headings and tables preserved. Powered by LibreOffice.',
  keywords: ['pdf-to-word', 'pdf-to-word free', 'pdf-to-word online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-word' },
  openGraph: {
    title: 'PDF to Word Converter Free — Convert PDF to Editable DOCX',
    description: 'Convert PDF to editable Word .docx free. Text, headings and tables preserved. Powered by LibreOffice.',
    url: 'https://toolbeans.com/tools/pdf-to-word',
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
        { '@type': 'ListItem', position: 3, name: 'PDF to Word', item: 'https://toolbeans.com/tools/pdf-to-word' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to Word Converter',
      url: 'https://toolbeans.com/tools/pdf-to-word',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Convert PDF to editable Word .docx free. Text, headings and tables preserved. Powered by LibreOffice.',
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
      <PdfToWordTool />
    </>
  );
}