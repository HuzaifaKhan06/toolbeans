// app/tools/data-quality-checker/page.jsx
// Path: toolbeans/app/tools/data-quality-checker/page.jsx
// Tool component: toolbeans/tools/DataQualityScoreTool.jsx
//
// STANDALONE tool  computes a weighted 0-100 data quality score from
// four factors (completeness, uniqueness, type consistency, statistical
// integrity), detects type mismatches and 3-sigma outliers (which the
// dedicated duplicate/null tools do NOT cover), generates plain-English
// insight cards, infers a schema, and exports a JSON quality report.
// NOT the DataProfilerTool  different scoring engine, different
// detections (type mismatch + outliers), different UI and exports.

import DataQualityScoreTool from '@/tools/DataQualityScoreTool';

export const metadata = {
  title: 'Data Quality Checker Free Online  CSV Quality Score 0–100',
  description:
    'Upload a CSV and get a weighted data quality score from 0 to 100 in seconds. Detects type mismatches (text in numeric columns), statistical outliers (3-sigma rule), duplicate rows and missing values, with plain-English insights, an inferred schema, and a downloadable JSON quality report. Free, no signup, runs entirely in your browser.',
  keywords: [
    'data quality checker free online csv',
    'csv data quality score 0 to 100 free',
    'check data quality before power bi free',
    'find type mismatches in csv online free',
    'detect outliers in csv free online tool',
    'data quality report generator csv free',
    'validate csv data quality online free',
    'csv data health check free no signup',
    'check data quality before sql import',
    'csv schema inference tool free online',
    'data quality score calculator online',
    'find numeric type errors in csv free',
    'csv statistical outlier detector free',
    'export data quality report json free',
    'csv data validation tool no signup 2026',
    'check csv before loading database free',
    'data quality audit tool csv free online',
    'standardize csv column headers free',
    'dataset health checker online free 2026',
    'free csv data quality grade tool',
  ],
  authors: [{ name: 'TOOLBeans Editorial Team' }],
  alternates: { canonical: 'https://toolbeans.com/tools/data-quality-checker' },
  openGraph: {
    title: 'Data Quality Checker  Free CSV Quality Score 0–100',
    description:
      'Get a weighted quality score, plain-English insights, type mismatch and outlier detection, schema inference, and a downloadable JSON report. Free, browser-only.',
    url: 'https://toolbeans.com/tools/data-quality-checker',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [
      {
        url: 'https://toolbeans.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Data Quality Checker  Free CSV Quality Score 0-100',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Quality Checker  Free CSV Quality Score 0–100',
    description:
      'Weighted quality score, type mismatch + outlier detection, schema inference, JSON report export. No signup.',
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
      { '@type': 'ListItem', position: 3, name: 'Data Quality Checker', item: 'https://toolbeans.com/tools/data-quality-checker' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Data Quality Score Checker',
    url: 'https://toolbeans.com/tools/data-quality-checker',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    description:
      'Free browser-based tool that computes a weighted data quality score from 0 to 100 for any CSV file, broken down across completeness, uniqueness, type consistency and statistical integrity. Detects type mismatches such as text values in numeric columns, statistical outliers using the 3-sigma rule, duplicate rows and missing values  each with exact row numbers. Generates plain-English insight cards, infers a column schema with type, fill rate, uniqueness and example values, can standardize column headers, and exports a complete JSON quality report. No upload to any server.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Weighted data quality score from 0 to 100',
      'Score breakdown across 4 factors: completeness, uniqueness, type consistency, statistical integrity',
      'Auto-generated plain-English insight cards for every issue',
      'Type mismatch detection: flags text values in numeric or date columns with row numbers',
      'Statistical outlier detection using the 3-sigma rule with row numbers',
      'Duplicate row count and percentage',
      'Overall and per-column completeness (fill rate)',
      'Inferred schema: data type, fill rate, uniqueness flag and example value per column',
      'Standardize column headers to database-safe snake_case names',
      'Export complete quality report as JSON',
      'Download data with standardized headers as CSV',
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
        name: 'What is a data quality score and how is it calculated?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The score starts at 100 and points are deducted across four weighted factors: completeness (up to 40 points, based on the percentage of missing cells), uniqueness (up to 30 points, based on the percentage of duplicate rows), type consistency (up to 20 points, 7 points per column containing mixed data types), and statistical integrity (up to 10 points, 3 points per numeric column containing 3-sigma outliers). The final score is the result rounded to the nearest whole number, with a floor of 0. Scores of 90 to 100 are Excellent, 70 to 89 are Good, and below 70 are Poor.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does this tool check that the Find Duplicates and Null Value Checker tools do not?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This tool adds two detections neither dedicated tool covers: type mismatches, where a column is mostly numeric or date values but contains some text values that will break SQL imports and Power BI measures, and statistical outliers, where numeric values fall more than three standard deviations from the column mean. It also combines duplicate and missing-value counts with these two new checks into one weighted 0-100 score with plain-English insights, an inferred schema, and a downloadable JSON report  none of which the focused duplicate or null tools provide. For deep duplicate removal or null-filling, this tool links directly to those dedicated tools.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a type mismatch and why does it break Power BI and SQL imports?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A type mismatch occurs when a column is dominated by one data type but contains exceptions. For example, an amount column where 997 rows contain numbers but 3 rows contain the text "N/A". SQL databases reject imports when a column defined as numeric receives a text value. Power BI infers the entire column as text rather than numeric when it sees any non-numeric value, which silently breaks every SUM, AVERAGE or other numeric measure built on that column. This tool identifies the dominant type per column and lists every value that does not match it, with its row number.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the statistical outlier detection work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For every column where values are dominantly numeric, the tool calculates the mean and standard deviation of those values. Any value more than three standard deviations from the mean is flagged as a statistical outlier, along with its row number and how many standard deviations away it is. This is the standard 3-sigma rule used in statistical process control. Outliers are not necessarily errors, but they are unusual enough to warrant a manual check before they skew an average or a chart.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I export a quality report to share with my team?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Click Export Quality Report to download a structured JSON file containing the overall score and its four-factor breakdown, every column with its inferred type, fill rate, uniqueness flag and example value, the full list of type mismatches and outliers with row numbers, the duplicate row count, and all generated insights. This can be shared with a data source owner, attached to a data handover, or kept as a quality baseline to compare against future versions of the same dataset.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does "Standardize Headers" do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It rewrites every column name to a database-safe snake_case format: trimming whitespace, replacing spaces and special characters with underscores, removing duplicate underscores, and converting to lowercase. A header like "Customer Name " becomes "customer_name" and "Order-ID#" becomes "order_id". This prevents quoting issues in SQL, naming errors in pandas, and inconsistent column references across tools. The tool shows exactly which headers changed before you download the result.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my CSV file uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Your file is read directly in your browser using the JavaScript FileReader API and is never transmitted to any server. The entire score calculation, type inference and outlier detection happen locally on your device, which makes this safe for confidential business data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this tool work with Excel files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This tool is built specifically for CSV files for fast, reliable browser-based parsing and a focused experience. If your data is in Excel, export the sheet as CSV first (File > Save As > CSV), or use the TOOLBeans Data Profiler, which supports XLSX and XLS files directly alongside REST API connections.',
        },
      },
    ],
  },
];

export default function DataQualityCheckerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={`schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <DataQualityScoreTool />
    </>
  );
}