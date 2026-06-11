// app/tools/csv-null-value-checker/page.jsx
// Path: toolbeans/app/tools/csv-null-value-checker/page.jsx
// Tool component: toolbeans/tools/CsvNullValueCheckerTool.jsx
//
// STANDALONE tool  finds null, empty and "null-like" text values
// (NULL, N/A, none, NaN, -, etc.) in CSV files, shows fill rate per
// column, and lets you fill or drop them. Entirely browser-based.
// NOT the DataProfilerTool  genuinely different detection engine,
// cleaning options and UI from any other TOOLBeans data tool.

import CsvNullValueCheckerTool from '@/tools/CsvNullValueCheckerTool';

export const metadata = {
  title: 'Find Null and Missing Values in CSV Free Online  Fill Rate by Column',
  description:
    'Upload a CSV and instantly find every null, empty and "null-like" value (NULL, N/A, none, NaN, -) by column. See fill rate and completeness percentage, fill missing values with zero, mean or a custom value, drop incomplete rows, and download the cleaned CSV. Free, no signup, runs entirely in your browser.',
  keywords: [
    'find null values in csv online free',
    'check missing values in csv file free',
    'csv null value checker no signup',
    'find empty cells in csv online free',
    'csv missing data checker free tool',
    'detect na n/a values in csv online',
    'csv fill rate checker free online',
    'find blank cells in spreadsheet csv',
    'csv completeness checker free 2026',
    'fill null values in csv online free',
    'drop rows with null values csv online',
    'csv column fill rate calculator free',
    'find missing data by column csv',
    'detect null and na text values csv',
    'csv null value finder no excel needed',
    'check data completeness csv online free',
    'fill missing values csv mean free tool',
    'csv empty cell detector online free',
    'find rows with missing values csv',
    'csv data quality null checker free',
  ],
  authors: [{ name: 'TOOLBeans Editorial Team' }],
  alternates: { canonical: 'https://toolbeans.com/tools/csv-null-value-checker' },
  openGraph: {
    title: 'Find Null and Missing Values in CSV  Free Fill Rate Checker',
    description:
      'See exactly which columns have missing data, including hidden "null-like" text such as N/A and NULL. Fill or drop missing values and download the cleaned CSV.',
    url: 'https://toolbeans.com/tools/csv-null-value-checker',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [
      {
        url: 'https://toolbeans.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CSV Null Value Checker  Find Missing Data by Column Free Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Null and Missing Values in CSV  Free Online Tool',
    description:
      'Fill rate per column, hidden NULL/N/A text detection, fill or drop missing values, download cleaned CSV. No signup.',
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
      { '@type': 'ListItem', position: 3, name: 'CSV Null Value Checker', item: 'https://toolbeans.com/tools/csv-null-value-checker' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSV Null and Missing Value Checker',
    url: 'https://toolbeans.com/tools/csv-null-value-checker',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    description:
      'Free browser-based tool to find null, empty and null-like text values (NULL, N/A, none, NaN, -, undefined) in CSV files. Shows fill rate and completeness percentage per column, lists exact row numbers of missing values, fills missing data with zero, column mean, most common value or a custom value, drops incomplete rows, and downloads the cleaned CSV. No upload to any server.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Detect empty and whitespace-only cells per column',
      'Optionally detect null-like text: NULL, N/A, none, NaN, -, undefined',
      'Show fill rate and completeness percentage per column',
      'List exact row numbers containing missing values',
      'Overall dataset completeness score',
      'Fill missing values with zero',
      'Fill missing values with the column mean',
      'Fill missing values with the most common value (mode)',
      'Fill missing values with a custom value',
      'Drop rows missing a value in a specific column',
      'Drop all rows containing any missing value',
      'Download cleaned CSV instantly',
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
        name: 'How do I find null values in a CSV file online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your CSV file to this tool. It reads the file in your browser and checks every cell in every column. The Overview tab shows a fill rate bar for each column  green means complete, amber and red mean missing values. The Null Details tab lists the exact null count, fill rate and affected row numbers for every column with missing data.',
        },
      },
      {
        '@type': 'Question',
        name: 'What counts as a null or missing value in this tool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'By default, a cell is missing if it is completely empty or contains only whitespace. You can also enable "Detect null-like text" which additionally treats common placeholder values as missing, including NULL, N/A, n/a, none, NaN, -, --, #N/A, undefined and similar text that spreadsheets and exports often use to represent missing data without the cell actually being empty.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why would a column show 100% fill rate but still have missing data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Because the cells are not technically empty  they contain text like "N/A" or "NULL" which looks like data to a basic check but represents missing information. Enable the "Detect null-like text" toggle to reveal these hidden gaps. This is one of the most common reasons a dataset that looks complete fails validation when loaded into a database or BI tool.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I fill missing values instead of deleting rows?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Go to the Clean Data tab, select the column you want to fix, and choose a fill method: fill with zero (for numeric columns where missing means none), fill with the column mean (a statistical average for numeric columns), fill with the most common value in that column, or fill with any custom text you type in.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I remove rows that have missing values?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In the Clean Data tab you can either drop rows where a specific column is missing a value, or use the global option to drop every row that has a missing value in any column. The tool shows you exactly how many rows would be removed before you confirm.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is fill rate and what counts as a good fill rate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Fill rate is the percentage of cells in a column that contain a value, calculated as non-missing cells divided by total rows. A fill rate of 100% means no missing data. Fill rates above 95% are usually fine and reflect normal data entry gaps. Fill rates below 70% typically indicate a structural problem at the data source, such as an optional form field or a join that frequently finds no match.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my CSV file uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Your file is read directly in your browser using the JavaScript FileReader API and never transmitted anywhere. This is safe for confidential business data, client records and any sensitive dataset.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this tool work with Excel files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This tool is built specifically for CSV files for fast, reliable browser-based parsing. If your data is in Excel, export the sheet as CSV first (File > Save As > CSV in Excel or Google Sheets), or use the TOOLBeans Data Profiler which supports XLSX and XLS files directly alongside a broader set of data quality checks.',
        },
      },
    ],
  },
];

export default function CsvNullValueCheckerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={`schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <CsvNullValueCheckerTool />
    </>
  );
}