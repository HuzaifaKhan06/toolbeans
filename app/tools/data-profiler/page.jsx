// app/tools/data-profiler/page.jsx
import DataProfilerTool from '@/tools/DataProfilerTool';

export const metadata = {
  title: 'Analyze CSV & Excel Data Online Free — Find Duplicates, Nulls & Data Errors',
  description:
    'Free online CSV and Excel data analyzer. Find duplicate rows, null values, type mismatches and data errors instantly. Remove duplicates and download cleaned data as CSV or Excel. No upload, no signup, runs in your browser.',
  keywords: [
    // High-intent action keywords
    'analyze csv data online',
    'check data quality csv',
    'find null values in csv online',
    'find duplicate rows in csv',
    'remove duplicate rows online',
    'find duplicates in excel online free',
    'check missing values in dataset',
    'data quality checker free',
    'csv error checker online',
    'excel data analyzer online free',
    // Tool-seeking keywords
    'data profiler online free',
    'csv data quality checker',
    'duplicate row finder online',
    'null value detector csv',
    'data type mismatch checker',
    'outlier detection online free',
    'data quality score tool',
    'column statistics calculator',
    'dataset summary generator',
    // BI/ETL specific
    'check data before power bi',
    'validate csv before import',
    'data cleaning tool online',
    'bi developer data tool free',
    'etl data validation tool',
    'json data quality checker',
    'api data analyzer',
    'rest api data inspector',
    // Pattern keywords
    'analyze csv file online',
    'analyze excel file online',
    'find empty cells in csv',
    'detect data type online',
    'data schema inference tool',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/data-profiler' },
  openGraph: {
    title: 'CSV & Excel Data Analyzer — Find Duplicates, Nulls & Errors Free | TOOLBeans',
    description:
      'Upload any CSV or Excel file and instantly find duplicate rows, null values, type mismatches and data quality issues. Remove duplicates and download cleaned data. Free, browser-only.',
    url: 'https://toolbeans.com/tools/data-profiler',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'CSV Data Analyzer — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSV & Excel Data Analyzer — Find Duplicates and Nulls Free | TOOLBeans',
    description: 'Find duplicates, null values, type mismatches and data errors instantly. Remove duplicates, download cleaned CSV or Excel. Free, no upload.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools',    item: 'https://toolbeans.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'CSV Data Analyzer', item: 'https://toolbeans.com/tools/data-profiler' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSV & Excel Data Analyzer — Find Duplicates, Nulls and Data Errors',
    url: 'https://toolbeans.com/tools/data-profiler',
    description:
      'Free browser-based CSV and Excel data analyzer. Upload any file to instantly find duplicate rows, duplicate columns, null values, type mismatches and statistical outliers. Remove duplicates and download the cleaned dataset as CSV, Excel or JSON. Supports CSV, Excel, JSON files and REST API endpoints. No file upload, no server, no signup.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Find duplicate rows in CSV and Excel files',
      'Remove duplicate rows and download cleaned data',
      'Detect duplicate columns with identical values',
      'Find null and empty values per column',
      'Detect data type mismatches',
      'Statistical outlier detection using 3-sigma rule',
      'Auto-generated data quality insights',
      'Column fill rate and completeness analysis',
      'Numeric statistics: count, distinct, min, max, mean, median, mode, std dev, sum',
      'Data quality score 0 to 100',
      'Schema inference with nullable and unique flags',
      'Distribution charts per numeric column',
      'Download cleaned data as CSV, Excel or JSON',
      'Export quality report as JSON',
      'REST API endpoint analysis',
      'Supports CSV, XLSX, XLS, JSON — all rows, no limit',
      'Runs entirely in browser with no server upload',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I find duplicate rows in a CSV file online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your CSV file to this tool. The Issues tab shows every duplicate row with its row number and the row it duplicates. A preview table shows the first five duplicate pairs. Duplicate rows are highlighted in red in the Data Table. Use the Clean Data panel to remove all duplicates in one click and download the result as CSV or Excel.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I check for null values in a CSV file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your CSV to this tool. The Issues tab shows every column that has null or empty values, along with the null count and fill rate percentage. The Overview tab shows a fill rate bar chart for all columns at once. Null cells are visually highlighted in the Data Table.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I remove duplicate rows and download the cleaned file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. After uploading your file, if duplicates are detected a Clean Data panel appears. Click Remove Duplicate Rows to deduplicate the dataset. The row count updates immediately. Then use the CSV, XLSX or JSON download buttons to save the cleaned file.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this tool work with Excel files?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Upload .xlsx or .xls files directly. The tool reads all rows from the first sheet and runs the full analysis including duplicate detection, null checking, type validation, outlier detection and numeric statistics.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my data uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All processing runs entirely in your browser using JavaScript. Your files never leave your device. This makes the tool safe for confidential data, internal company spreadsheets and personally identifiable information.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a data quality score?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The data quality score from 0 to 100 measures the overall health of your dataset. A score of 90 or above means the data is clean and ready for analysis or import. Scores below 50 indicate significant problems like high null rates, many duplicates or widespread type mismatches that will cause errors in downstream tools like Power BI, SQL databases or reporting systems.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does a type mismatch mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A type mismatch occurs when a column mostly contains numbers but some rows have text values. For example, a sales amount column where 998 rows contain numbers but 2 rows contain the text N/A or null. Type mismatches break SQL imports, Power BI measures and any calculation expecting consistent numeric data.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I analyze data from a REST API?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Switch to the API tab, enter any REST endpoint URL and optionally add a Bearer token. The tool fetches the JSON response, automatically flattens nested objects into columns, and runs the full analysis. Useful for profiling live API data before building dashboards or ETL pipelines.',
        },
      },
    ],
  },
];

export default function DataProfilerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <DataProfilerTool />
    </>
  );
}