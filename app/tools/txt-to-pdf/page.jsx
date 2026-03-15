// app/tools/txt-to-pdf/page.jsx
import TxtToPdfTool from '@/tools/TxtToPdfTool';

export const metadata = {
  title: 'TXT to PDF Converter Free Online — Selectable Text, No Upload',
  description:
    'Convert TXT to PDF free online. Paste text or upload .txt files. Choose font, size, margins, line spacing. Text is selectable and searchable — not an image. 100% browser-based, no upload, no signup.',
  keywords: [
    'txt to pdf',
    'txt to pdf converter',
    'convert text to pdf',
    'text file to pdf',
    'txt to pdf free',
    'txt to pdf online',
    'notepad to pdf',
    'plain text to pdf',
    'text to pdf converter online free',
    'convert txt file to pdf',
    'log file to pdf',
    'csv to pdf',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/txt-to-pdf' },
  openGraph: {
    title: 'TXT to PDF Converter — Free, Selectable Text, No Upload',
    description:
      'Convert plain text and .txt files to PDF in your browser. Choose font, size, margins and line spacing. Selectable text output. No server upload, completely private.',
    url: 'https://toolbeans.com/tools/txt-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',       item: 'https://toolbeans.com'                   },
        { '@type': 'ListItem', position: 2, name: 'Tools',      item: 'https://toolbeans.com/tools'             },
        { '@type': 'ListItem', position: 3, name: 'TXT to PDF', item: 'https://toolbeans.com/tools/txt-to-pdf'  },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'TXT to PDF Converter',
      url: 'https://toolbeans.com/tools/txt-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free browser-based TXT to PDF converter. Embed real selectable text. Upload .txt, .csv, .md, .log files or paste text directly. Full font, size, margin and line spacing control.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Upload .txt, .csv, .md, .log, .json, .xml and more',
        'Paste or type text directly',
        'Real selectable and searchable PDF text',
        'Courier, Helvetica, Times Roman fonts',
        'Font size 8pt to 24pt',
        'Compact, Normal, Relaxed line spacing',
        'Document title header',
        'Line numbers toggle',
        'Auto page numbers on multi-page PDFs',
        'A4, A3, Letter, Legal page sizes',
        'Portrait and landscape orientation',
        'Narrow, Normal, Wide margins',
        'No upload, no server, no watermark',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is the text in the PDF selectable?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Text is embedded as real PDF text using pdf-lib font embedding — not rasterized into an image. You can select, copy and search the text in any PDF reader.',
          },
        },
        {
          '@type': 'Question',
          name: 'What file types can I convert to PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Any plain text file — .txt, .csv, .md, .log, .json, .xml, .js, .ts, .py, .sh, .yaml and more. You can also paste text directly without uploading a file.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are my text files uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All processing happens entirely in your browser. Your text files never leave your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I add line numbers to the PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Toggle the line numbers switch in the settings panel to prepend each line with its line number — useful for code files and log analysis.',
          },
        },
      ],
    },
  ],
};

export default function TxtToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TxtToPdfTool />
    </>
  );
}