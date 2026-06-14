// app/tools/csv-to-sql/page.jsx
import CsvToSqlTool from '@/tools/CsvToSqlTool';

export const metadata = {
  title: 'CSV to SQL Converter  Convert CSV & Excel to SQL INSERT Statements Free',
  description:
    'Convert CSV, TSV and Excel files to SQL INSERT statements for MySQL, PostgreSQL, SQLite, SQL Server, MariaDB and Oracle. Auto column type detection, batch inserts, upserts and transactions. Runs in your browser, no data uploaded. Free, no signup.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans', 'TOOLBEANS','TOOL BEANS',
    'toolbeans csv to sql',
    'online free csv to sql',
    'csv to sql free online',
    'csv to sql',
    'csv to sql converter',
    'convert csv to sql',
    'excel to sql',
    'csv to mysql',
    'csv to postgresql',
    'csv import sql',
    'csv to insert statements',
    'csv to sql online',
    'excel to mysql',
    'tsv to sql',
    'csv to database',
    'sql insert generator',
    'csv sql import tool',
    'convert excel to sql',
    'bulk insert sql generator',
    'csv to sql server',
    'csv to sqlite converter',
    'csv to oracle sql',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/csv-to-sql' },
  openGraph: {
    title: 'Free CSV & Excel to SQL Converter  MySQL, PostgreSQL, SQLite, SQL Server | TOOLBeans',
    description:
      'Convert CSV or Excel to SQL INSERT statements instantly. Supports 6 SQL dialects, auto type detection, batch inserts and transactions. No upload  runs in browser.',
    url: 'https://toolbeans.com/tools/csv-to-sql',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'CSV to SQL Converter  TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free CSV & Excel to SQL Converter | TOOLBeans',
    description: 'Convert CSV, TSV and Excel to SQL INSERT statements for 6 databases. Auto type detection, batch inserts, upserts. Free, private, no install.',
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
      { '@type': 'ListItem', position: 3, name: 'CSV to SQL Converter', item: 'https://toolbeans.com/tools/csv-to-sql' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSV to SQL Converter  TOOLBeans',
    url: 'https://toolbeans.com/tools/csv-to-sql',
    description: 'Free online CSV, TSV and Excel to SQL converter. Generates SQL INSERT statements for MySQL, PostgreSQL, SQLite, SQL Server, MariaDB and Oracle with automatic column type detection, batch inserts, upserts and transactions. Runs entirely in the browser with no upload.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Convert CSV to SQL INSERT statements',
      'Convert Excel XLSX and XLS files to SQL',
      'Convert TSV and delimited text to SQL',
      'Supports MySQL, PostgreSQL, SQLite, SQL Server, MariaDB and Oracle',
      'Automatic column data type detection',
      'CREATE TABLE schema generation',
      'Single, batch and upsert insert modes',
      'Auto-increment primary key option',
      'Transaction wrapping with BEGIN and COMMIT',
      'Download generated SQL as a .sql file',
      'Runs entirely in browser, nothing uploaded',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the CSV to SQL converter free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The TOOLBeans CSV to SQL converter is completely free with no usage limits, no account and no signup required.' },
      },
      {
        '@type': 'Question',
        name: 'Does my data get uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All parsing and SQL generation runs entirely in your browser using JavaScript. Your CSV and Excel files never leave your device and are never uploaded to any server.' },
      },
      {
        '@type': 'Question',
        name: 'Which databases and SQL dialects are supported?',
        acceptedAnswer: { '@type': 'Answer', text: 'The converter supports MySQL, PostgreSQL, SQLite, SQL Server (T-SQL), MariaDB and Oracle. Each dialect uses the correct identifier quoting, data type mapping and INSERT syntax for that database.' },
      },
      {
        '@type': 'Question',
        name: 'Can I convert Excel files to SQL?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can upload .xlsx and .xls files directly. The tool reads the first worksheet, converts it to rows and generates SQL. CSV, TSV and plain text delimited files are also supported.' },
      },
      {
        '@type': 'Question',
        name: 'Does it detect column data types automatically?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The tool inspects each column and detects integers, decimals, booleans, dates, timestamps and strings, then maps them to the correct type for your chosen database dialect in the CREATE TABLE statement.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between single, batch and upsert insert modes?',
        acceptedAnswer: { '@type': 'Answer', text: 'Single mode writes one INSERT statement per row, which is the most compatible. Batch mode groups many rows into each INSERT for faster loading of large datasets. Upsert mode generates dialect-specific insert-or-update statements such as ON DUPLICATE KEY UPDATE for MySQL, ON CONFLICT for PostgreSQL, INSERT OR REPLACE for SQLite and MERGE for SQL Server.' },
      },
    ],
  },
];

export default function CsvToSqlPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <CsvToSqlTool />
    </>
  );
}