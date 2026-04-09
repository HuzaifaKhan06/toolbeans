// app/tools/pdf-to-text/page.jsx
import PdfToTextTool from '@/tools/PdfToTextTool';

export const metadata = {
  title: 'PDF to Text Converter Free — Extract Text From PDF Online',
  description: 'Extract all text from any PDF free. Every page, line breaks preserved. Runs in your browser — no upload needed.',
  keywords: ['pdf-to-text', 'pdf-to-text free', 'pdf-to-text online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-text' },
  openGraph: {
    title: 'PDF to Text Converter Free — Extract Text From PDF Online',
    description: 'Extract all text from any PDF free. Every page, line breaks preserved. Runs in your browser — no upload needed.',
    url: 'https://toolbeans.com/tools/pdf-to-text',
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
        { '@type': 'ListItem', position: 3, name: 'PDF to Text', item: 'https://toolbeans.com/tools/pdf-to-text' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to Text Converter',
      url: 'https://toolbeans.com/tools/pdf-to-text',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Extract all text from any PDF free. Every page, line breaks preserved. Runs in your browser — no upload needed.',
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
      <PdfToTextTool />
    </>
  );
}