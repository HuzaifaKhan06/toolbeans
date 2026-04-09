// app/tools/pdf-to-html/page.jsx
import PdfToHtmlTool from '@/tools/PdfToHtmlTool';

export const metadata = {
  title: 'PDF to HTML Converter Free — Convert PDF to Web Page Online',
  description: 'Convert PDF to clean responsive HTML with table of contents. Browser-based, no upload needed.',
  keywords: ['pdf-to-html', 'pdf-to-html free', 'pdf-to-html online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-html' },
  openGraph: {
    title: 'PDF to HTML Converter Free — Convert PDF to Web Page Online',
    description: 'Convert PDF to clean responsive HTML with table of contents. Browser-based, no upload needed.',
    url: 'https://toolbeans.com/tools/pdf-to-html',
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
        { '@type': 'ListItem', position: 3, name: 'PDF to HTML', item: 'https://toolbeans.com/tools/pdf-to-html' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to HTML Converter',
      url: 'https://toolbeans.com/tools/pdf-to-html',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Convert PDF to clean responsive HTML with table of contents. Browser-based, no upload needed.',
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
      <PdfToHtmlTool />
    </>
  );
}