// app/tools/find-duplicates-in-csv/page.jsx
// Path: toolbeans/app/tools/find-duplicates-in-csv/page.jsx
// Tool component: toolbeans/tools/CsvDuplicateFinderTool.jsx
//
// This is a STANDALONE tool NOT the DataProfilerTool.
// It only finds/removes duplicates in CSV files. Nothing else.
// This keeps it a genuine unique tool and avoids Google doorway-page risk.

import CsvDuplicateFinderTool from '@/tools/CsvDuplicateFinderTool';

export const metadata = {
  title: 'Find and Remove Duplicate Rows in CSV Free Online No Code Required',
  description:
    'Upload any CSV file and instantly find every duplicate row, duplicate column and duplicate header. See exact row numbers, preview pairs side by side, remove duplicates in one click and download the cleaned CSV. Free, no signup, runs entirely in your browser.',
  keywords: [
    'find duplicate rows in csv',
    'remove duplicate rows csv online free',
    'csv duplicate row checker free',
    'find duplicates in csv no code',
    'duplicate row detector csv online',
    'remove duplicate records from csv free',
    'csv deduplication tool online free',
    'find repeated rows in csv file',
    'how to remove duplicates from csv online',
    'deduplicate csv file free browser tool',
    'find duplicate columns in csv online',
    'duplicate header checker csv free',
    'check csv for duplicate rows no excel',
    'csv duplicate finder free no signup 2026',
    'find and delete duplicate rows csv online',
    'csv row deduplicator free browser based',
    'identify duplicate records csv free tool',
    'csv file duplicate remover no code needed',
    'find all duplicates in csv spreadsheet free',
    'exact duplicate row finder csv online 2026',
  ],
  authors: [{ name: 'TOOLBeans Editorial Team' }],
  alternates: { canonical: 'https://toolbeans.com/tools/find-duplicates-in-csv' },
  openGraph: {
    title: 'Find and Remove Duplicate Rows in CSV Free Online Tool',
    description:
      'Upload a CSV and instantly see every duplicate row, column and header with exact row numbers. Remove all duplicates in one click and download the clean file.',
    url: 'https://toolbeans.com/tools/find-duplicates-in-csv',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [
      {
        url: 'https://toolbeans.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CSV Duplicate Finder Find and Remove Duplicate Rows Free Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find and Remove Duplicate Rows in CSV Free Online Tool',
    description:
      'See every duplicate row with its row number. Remove duplicates in one click. Download the cleaned CSV. No code, no signup.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

// ── JSON-LD ───────────────────────────────────────────────
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Find Duplicates in CSV', item: 'https://toolbeans.com/tools/find-duplicates-in-csv' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSV Duplicate Finder and Remover',
    url: 'https://toolbeans.com/tools/find-duplicates-in-csv',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    description:
      'Free browser-based tool to find and remove duplicate rows, duplicate columns and duplicate headers in CSV files. Upload your file and instantly see every duplicate with exact row and column numbers. Remove all duplicates in one click and download the clean file. No code, no signup, no upload to server.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Detect exact duplicate rows across all columns',
      'Show exact row number of every duplicate and its original',
      'Preview first 5 duplicate row pairs side by side',
      'Detect duplicate column names in header row',
      'Detect columns with identical values across every row',
      'Case-insensitive and whitespace-trimmed comparison',
      'Remove all duplicate rows in one click',
      'Remove duplicate columns in one click',
      'Download deduplicated CSV instantly',
      'Live row count before and after deduplication',
      'No file upload to server runs in browser',
      'No signup, no account, no row limit',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I find duplicate rows in a CSV file online without Excel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your CSV file to this tool. It reads your file in the browser and automatically compares every row across all columns simultaneously. Any row that is an exact copy of an earlier row is flagged as a duplicate with both its own row number and the number of the original row it matches. You see the complete list in the Duplicates tab in under one second.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of duplicates does this tool find?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The tool finds three types of duplicates: duplicate rows where every cell in the row matches another row exactly; duplicate column headers where two or more columns have the same name; and duplicate columns where every cell value in one column is identical to every cell value in another column across the entire dataset.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the duplicate comparison work exactly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Two rows are duplicates when every column value in row A matches the corresponding column value in row B. The comparison is case-insensitive "New York" and "new york" are treated as the same and leading and trailing whitespace is trimmed before comparison. Values must otherwise match exactly: 100 and 100.0 would not match unless stored as identical strings in the CSV.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my CSV file uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Your file is read directly by your browser using the JavaScript FileReader API. It never leaves your device and is never transmitted to any server. This makes it completely safe to use with confidential business data, client records or sensitive datasets.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I remove duplicates and download the clean CSV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After the analysis finishes, click the Remove Duplicates button. The tool keeps only the first occurrence of each unique row and removes all subsequent copies. The row count updates immediately. Then click Download Clean CSV to save the deduplicated file to your device.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a duplicate column and why does it matter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A duplicate column is a column where every cell value is identical to every cell value in another column throughout the entire dataset. These provide no unique information and inflate your dataset unnecessarily. They can also cause errors in database imports that require unique column names. This tool detects both duplicate column headers (same name) and duplicate column contents (same values).',
        },
      },
      {
        '@type': 'Question',
        name: 'How many rows can this tool handle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'There is no row limit. All rows in your CSV are analysed. For files with several hundred thousand rows, processing takes a few seconds depending on your device speed. The tool uses efficient string hashing to compare rows, so it handles large files without freezing the browser.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I undo the duplicate removal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Click the Reset button at the top of the tool to restore your original data exactly as it was when you first uploaded the file. The tool never modifies the original file on your disk it only works with a copy held in memory.',
        },
      },
    ],
  },
];

export default function FindDuplicatesInCsvPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={`schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <CsvDuplicateFinderTool />
    </>
  );
}