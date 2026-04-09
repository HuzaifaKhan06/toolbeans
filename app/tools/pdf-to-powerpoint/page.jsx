// app/tools/pdf-to-powerpoint/page.jsx
import PdfToPowerPointTool from '@/tools/PdfToPowerPointTool';

export const metadata = {
  title: 'PDF to PowerPoint Converter Free — Convert PDF to PPTX',
  description: 'Convert PDF to PowerPoint .pptx free. Each page becomes a slide. Powered by LibreOffice.',
  keywords: ['pdf-to-powerpoint', 'pdf-to-powerpoint free', 'pdf-to-powerpoint online', 'pdf converter free'],
  alternates: { canonical: 'https://toolbeans.com/tools/pdf-to-powerpoint' },
  openGraph: {
    title: 'PDF to PowerPoint Converter Free — Convert PDF to PPTX',
    description: 'Convert PDF to PowerPoint .pptx free. Each page becomes a slide. Powered by LibreOffice.',
    url: 'https://toolbeans.com/tools/pdf-to-powerpoint',
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
        { '@type': 'ListItem', position: 3, name: 'PDF to PowerPoint', item: 'https://toolbeans.com/tools/pdf-to-powerpoint' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PDF to PowerPoint Converter',
      url: 'https://toolbeans.com/tools/pdf-to-powerpoint',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Convert PDF to PowerPoint .pptx free. Each page becomes a slide. Powered by LibreOffice.',
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
      <PdfToPowerPointTool />
    </>
  );
}