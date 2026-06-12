// app/tools/excel-data-analyzer/page.jsx
// Path: toolbeans/app/tools/excel-data-analyzer/page.jsx
// Tool component: toolbeans/tools/ExcelDataAnalyzerTool.jsx
//
// STANDALONE tool  reads .xlsx/.xls files directly via SheetJS (no
// Papa Parse, no DataProfilerTool). Two genuinely unique mechanics:
// (1) multi-sheet detection + selector, analyzing each sheet
// independently  fixing the "first sheet only" limitation other
// tools admit to; (2) a full descriptive-statistics table per column
// (count, distinct, min, max, mean, median, mode, std dev, sum) that
// no other TOOLBeans data tool computes. Duplicate/null/type/outlier
// checks appear only as a condensed Issues Summary that cross-links
// to the dedicated CSV tools for deep cleanup.

import ExcelDataAnalyzerTool from '@/tools/ExcelDataAnalyzerTool';

export const metadata = {
  title: 'Excel Data Analyzer Free Online  Multi-Sheet Stats, No Excel Needed',
  description:
    'Upload any .xlsx or .xls file and instantly get full column statistics  count, distinct, min, max, mean, median, mode, standard deviation and sum  for every sheet in your workbook. Automatically detects all sheets, finds duplicates and missing values, and lets you download as XLSX or CSV. Free, no signup, runs entirely in your browser.',
  keywords: [
    'analyze excel file online free no install',
    'excel data analyzer free online tool',
    'xlsx column statistics calculator free',
    'excel multi sheet analyzer online free',
    'analyze xls file online without excel',
    'excel median mode standard deviation tool',
    'excel data quality checker free online',
    'xlsx file analyzer no signup free 2026',
    'excel spreadsheet statistics tool online',
    'check excel file for errors free online',
    'excel duplicate row finder free online',
    'analyze multiple excel sheets online free',
    'excel column distinct count tool free',
    'xlsx data profiler free browser based',
    'excel descriptive statistics online free',
    'free excel analyzer no software needed',
    'excel data validation tool online 2026',
    'analyze xlsx without opening excel free',
    'excel sum mean median calculator online',
    'free online tool to analyze spreadsheet data',
  ],
  authors: [{ name: 'TOOLBeans Editorial Team' }],
  alternates: { canonical: 'https://toolbeans.com/tools/excel-data-analyzer' },
  openGraph: {
    title: 'Excel Data Analyzer  Free Multi-Sheet Statistics, No Excel Needed',
    description:
      'Full column statistics for every sheet in your workbook: count, distinct, min, max, mean, median, mode, std dev, sum. Detect duplicates and missing values. Download as XLSX or CSV.',
    url: 'https://toolbeans.com/tools/excel-data-analyzer',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [
      {
        url: 'https://toolbeans.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Excel Data Analyzer  Free Multi-Sheet Column Statistics Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Excel Data Analyzer  Free Multi-Sheet Statistics Online',
    description:
      'Count, distinct, min, max, mean, median, mode, std dev, sum  for every sheet in your XLSX/XLS file. No Excel needed, no signup.',
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
      { '@type': 'ListItem', position: 3, name: 'Excel Data Analyzer', item: 'https://toolbeans.com/tools/excel-data-analyzer' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Excel and XLSX Data Analyzer',
    url: 'https://toolbeans.com/tools/excel-data-analyzer',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    description:
      'Free browser-based tool to analyze .xlsx and .xls Excel files without installing Excel. Automatically detects every sheet in the workbook and shows row and column counts for each, with a selector to analyze any sheet independently. Computes full column statistics  count, distinct values, null count, fill rate, minimum, maximum, mean, median, mode, standard deviation and sum  for every column. Detects duplicate rows, low-fill columns, type mismatches and statistical outliers as a condensed issue summary. Download the analyzed data as XLSX or CSV. No upload to any server.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Analyze .xlsx and .xls files directly, no Excel installation needed',
      'Automatically detects and lists every sheet in the workbook',
      'Switch between sheets via a sheet selector, each analyzed independently',
      'Full column statistics: count, distinct, nulls, fill rate, min, max, mean, median, mode, standard deviation, sum',
      'Duplicate row detection with one-click removal',
      'Type mismatch detection: text values mixed into numeric columns',
      'Statistical outlier detection using the 3-sigma rule',
      'Plain-English issue summary cards with links to dedicated cleanup tools',
      'Data preview with duplicate rows highlighted',
      'Download analyzed data as XLSX',
      'Download analyzed data as CSV',
      'No file upload to server  runs in browser',
      'No signup, no account, no row limit',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can I analyze an Excel file online without installing Excel?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. This tool reads .xlsx and .xls files directly in your browser using the SheetJS library. You do not need Excel, Google Sheets, or any spreadsheet software installed. Upload your file and get full column statistics, sheet detection, duplicate analysis and an issue summary immediately.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this tool support Excel files with multiple sheets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. As soon as a workbook is uploaded, every sheet is detected and listed with its row and column counts. Use the sheet selector to switch between sheets  each one is parsed and analyzed independently, with its own statistics table, issue summary and data preview. You do not need to copy data to the first sheet before uploading.',
        },
      },
      {
        '@type': 'Question',
        name: 'What column statistics does this tool calculate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For every column: count of non-empty values, distinct value count, null count and fill rate percentage. For columns where at least 70% of values are numeric, it additionally calculates minimum, maximum, mean, median, mode, standard deviation and sum. For text columns, it shows the most frequently occurring value where one exists. All of this is calculated automatically with no formulas.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does this compare to using Excel formulas like COUNTIF, COUNTBLANK and AVERAGE?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Getting count, distinct count, nulls, min, max, mean, median, mode, standard deviation and sum for every column in Excel requires writing up to ten separate formulas per column, or building a pivot table and configuring multiple value fields. This tool computes all of it for every column in every sheet the moment the file is uploaded, with no formulas, helper columns or pivot tables.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this tool also check for duplicates, missing values, type mismatches and outliers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, in the Issues Summary tab, presented as condensed cards: duplicate row count with a one-click removal button, columns below 70% fill rate, columns with type mismatches, and columns with statistical outliers. For deep duplicate removal with multiple detection types, per-column null-filling strategies, or a full weighted 0-100 quality score, export your sheet as CSV and use the Find Duplicates in CSV, CSV Null Value Checker, or Data Quality Checker tools, which this page links to directly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I download the analyzed data as Excel or CSV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Download XLSX button writes the currently selected sheet back to a .xlsx file using SheetJS, including any duplicate rows you removed. The Download CSV button exports the same data as a comma-separated file, useful if you want to continue with one of the dedicated CSV data quality tools.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my Excel file uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Your file is read directly in your browser as binary data and parsed locally using SheetJS. Nothing is sent to any server. This makes the tool safe for confidential spreadsheets, financial models and any data subject to privacy restrictions.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I analyze very large Excel files or workbooks with many sheets?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'There is no row limit per sheet and no limit on the number of sheets detected. Each sheet is parsed when the workbook loads, but full statistics are computed for one sheet at a time as you select it, keeping the tool responsive even for workbooks with many large sheets. Processing time depends on your device memory and processor speed.',
        },
      },
    ],
  },
];

export default function ExcelDataAnalyzerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={`schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ExcelDataAnalyzerTool />
    </>
  );
}