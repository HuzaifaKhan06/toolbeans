// app/tools/word-to-pdf/page.jsx
import WordToPdfTool from '@/tools/WordToPdfTool';

export const metadata = {
  title: 'Word to PDF Converter Free Online .docx to PDF, No Signup',
  description: 'Convert Word .docx and .doc files to PDF free. Fonts, tables, images, headers and footers fully preserved. Powered by LibreOffice. No signup, no watermark.',
  keywords: ['word to pdf','word to pdf converter','docx to pdf','convert word to pdf free','word to pdf online','doc to pdf','microsoft word to pdf'],
  alternates: { canonical: 'https://toolbeans.com/tools/word-to-pdf' },
  openGraph: {
    title: 'Word to PDF Converter Free, LibreOffice Quality',
    description: 'Convert Word .docx to PDF with full formatting preserved. Powered by LibreOffice. Free.',
    url: 'https://toolbeans.com/tools/word-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://toolbeans.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools',       item: 'https://toolbeans.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Word to PDF', item: 'https://toolbeans.com/tools/word-to-pdf' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Word to PDF Converter',
      url: 'https://toolbeans.com/tools/word-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Free Word to PDF converter powered by LibreOffice. Converts .docx and .doc with full formatting fidelity.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['.docx and .doc to PDF','Fonts and tables preserved','Headers and footers preserved','Images preserved','No watermark','Files deleted after conversion'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is my Word document stored on your server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Your file is deleted from our server immediately after your PDF downloads.' } },
        { '@type': 'Question', name: 'What is the conversion quality?', acceptedAnswer: { '@type': 'Answer', text: 'We use LibreOffice the same engine used by ilovepdf and Smallpdf for professional quality conversion.' } },
        { '@type': 'Question', name: 'Does it support .doc files?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Both .docx (Word 2007+) and .doc (Word 97-2003) formats are supported.' } },
      ],
    },
  ],
};

export default function WordToPdfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WordToPdfTool />
    </>
  );
}