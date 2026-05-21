// app/tools/data-profiler/page.jsx
import DataProfilerTool from '@/tools/DataProfilerTool';

export const metadata = {
  title: 'Free Data Profiler & Quality Inspector — Analyze CSV, Excel, JSON & API Data Online',
  description:
    'Free browser-based data profiler for BI developers and data analysts. Upload CSV, Excel or JSON files or connect any REST API to instantly detect null values, duplicate rows, type mismatches, outliers and get a full column-level data quality report. No upload, no signup, no code required.',
  keywords: [
    'data profiler online free',
    'csv data quality checker',
    'excel data profiler free',
    'data quality inspector tool',
    'null value detector csv',
    'duplicate row finder online',
    'data type mismatch checker',
    'bi developer data tool free',
    'data analysis tool online free',
    'api data profiler',
    'json data quality checker',
    'data completeness checker',
    'column statistics tool',
    'outlier detection online free',
    'data schema inference tool',
    'data quality score calculator',
    'free data profiling tool 2026',
    'csv column analyzer online',
    'excel quality report free',
    'rest api data inspector',
    'data analyst tool free online',
    'no code data profiler',
    'dataset quality checker browser',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/data-profiler' },
  openGraph: {
    title: 'Free Data Profiler & Quality Inspector — CSV, Excel, JSON, API | TOOLBeans',
    description:
      'Instantly profile any dataset. Detect nulls, duplicates, type mismatches and outliers. Column-level stats, data quality score, schema inference. Browser-only, no upload, no signup.',
    url: 'https://toolbeans.com/tools/data-profiler',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Data Profiler — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Data Profiler — CSV, Excel, JSON & API Quality Inspector | TOOLBeans',
    description: 'Null detection, duplicate rows, type mismatches, outliers, column stats and quality score. Free, no upload, runs in browser.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Data Profiler', item: 'https://toolbeans.com/tools/data-profiler' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Data Profiler and Quality Inspector — TOOLBeans',
    url: 'https://toolbeans.com/tools/data-profiler',
    description:
      'Free browser-based data profiling tool for BI developers. Analyzes CSV, Excel and JSON files and REST API responses. Detects null values, duplicate rows, type mismatches, statistical outliers and infers column data types. Provides column-level statistics and an overall data quality score.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'CSV file data profiling',
      'Excel XLSX and XLS data profiling',
      'JSON file data profiling',
      'REST API endpoint data profiling',
      'Null and empty value detection per column',
      'Duplicate row detection with row numbers',
      'Data type inference for all columns',
      'Type mismatch detection',
      'Statistical outlier detection using 3-sigma rule',
      'Column fill rate calculation',
      'Unique value count per column',
      'Numeric column statistics: min, max, mean, median, standard deviation, sum',
      'String column statistics: min, max and average character length',
      'Top 5 most frequent values per column',
      'Pattern recognition: email, phone, URL, date, UUID, boolean',
      'Data quality score 0 to 100',
      'Schema inference with nullable and unique flags',
      'Export report as JSON',
      'Runs entirely in browser with no server upload',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the TOOLBeans Data Profiler free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Data Profiler is completely free with no usage limits, no account required and no signup. Upload any CSV, Excel or JSON file and get instant results.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data uploaded to a server when I use the Data Profiler?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All processing happens entirely in your browser using JavaScript. Your files never leave your device and are never transmitted to any server. This makes the tool safe for use with confidential or proprietary datasets.',
        },
      },
      {
        '@type': 'Question',
        name: 'What file formats does the Data Profiler support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The tool supports CSV files, Excel spreadsheets in both XLSX and XLS format, and JSON files. For API data, it supports any REST endpoint returning a JSON array or an object containing a nested array. Nested JSON objects are automatically flattened into columns.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a type mismatch in data profiling?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A type mismatch occurs when a column predominantly contains one data type but has some values of a different type. For example, an amount column where most values are numbers but a few rows contain text like NULL or N/A. Type mismatches cause errors when loading data into databases, Power BI or other BI tools.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the data quality score work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The data quality score from 0 to 100 measures the overall health of your dataset. It accounts for column fill rates, type mismatches, duplicate rows and statistical outliers. A score of 90 or above means the data is in excellent condition. Scores below 50 indicate significant issues that should be fixed before using the data in analysis or reporting.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I profile live API data with the tool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Switch to the API tab, enter any REST endpoint URL and optionally add a Bearer token for authenticated APIs. The tool fetches the JSON response and profiles it exactly like an uploaded file. Note that CORS restrictions may block some third-party APIs from browser access.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I export the data quality report?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Click the Export Report button to download a structured JSON file containing the full analysis including column types, fill rates, null counts, type mismatches, duplicate row indices, outlier counts and the inferred schema. The schema view can also be copied as JSON directly.',
        },
      },
      {
        '@type': 'Question',
        name: 'How large a dataset can the Data Profiler handle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The tool handles up to approximately 100,000 rows comfortably in most modern browsers. Files larger than this may work but could be slower depending on your device memory and the number of columns.',
        },
      },
    ],
  },
];

export default function DataProfilerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
  <script key={`schema-${i}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
))}
      <DataProfilerTool />
    </>
  );
}