// app/tools/word-to-pdf/page.jsx
import WordToPdfTool from '@/tools/WordToPdfTool';

export const metadata = {
  title: 'Word to PDF Converter Free Online — No Upload, .docx to PDF',
  description:
    'Convert Word .docx to PDF free online. No upload — 100% browser-based using mammoth.js. Headings, tables, lists and images preserved. Live preview. No signup, no watermark.',
  keywords: [
    'word to pdf',
    'word to pdf converter',
    'convert word to pdf',
    'docx to pdf',
    'docx to pdf converter',
    'word to pdf free',
    'word to pdf online',
    'word to pdf no upload',
    'convert docx to pdf free',
    'word document to pdf',
    'doc to pdf converter online free',
    'microsoft word to pdf',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/word-to-pdf' },
  openGraph: {
    title: 'Word to PDF Converter — Free, No Upload, .docx Supported',
    description:
      'Convert Word .docx files to PDF in your browser. Headings, tables, lists, images preserved. Live preview. No server upload. Free.',
    url: 'https://toolbeans.com/tools/word-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://toolbeans.com'                    },
        { '@type': 'ListItem', position: 2, name: 'Tools',       item: 'https://toolbeans.com/tools'              },
        { '@type': 'ListItem', position: 3, name: 'Word to PDF', item: 'https://toolbeans.com/tools/word-to-pdf'  },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Word to PDF Converter',
      url: 'https://toolbeans.com/tools/word-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free browser-based Word to PDF converter. Parses .docx using mammoth.js entirely in-browser. Headings, tables, lists and embedded images preserved. Live preview. No upload, no server.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        '.docx to PDF in browser — no upload',
        'mammoth.js document parsing',
        'Headings H1-H6 preserved',
        'Tables with borders',
        'Ordered and unordered lists',
        'Embedded images (JPEG, PNG)',
        'Bold, italic, underline, strikethrough',
        'Live preview before converting',
        'A4, A3, Letter, Legal page sizes',
        'Portrait and landscape orientation',
        'Narrow, Normal, Wide margins',
        'Font size control',
        'No watermark, no signup',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is my Word document uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. The .docx file is parsed entirely in your browser by mammoth.js. Your document never leaves your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does it support .doc files?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Only .docx (Word 2007 and later) is supported in the browser. To convert a .doc file, open it in Word or LibreOffice and save as .docx first.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save the PDF after clicking Convert?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your browser print dialog opens. In the Destination dropdown select "Save as PDF" then click Save.',
          },
        },
        {
          '@type': 'Question',
          name: 'Will complex Word formatting be preserved?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Core formatting — headings, paragraphs, tables, lists, bold, italic, images — is preserved. Complex elements like text boxes, WordArt, exact fonts and custom spacing have limited support in browser-based conversion.',
          },
        },
      ],
    },
  ],
};

export default function WordToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WordToPdfTool />
    </>
  );
}