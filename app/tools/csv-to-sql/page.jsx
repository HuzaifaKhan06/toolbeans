import CsvToSqlTool from '@/tools/CsvToSqlTool';

export const metadata = {
  title: 'CSV to SQL Converter Convert CSV & Excel to SQL INSERT Statements Free',
  description:
    'Convert CSV, TSV and Excel files to SQL INSERT statements for MySQL, PostgreSQL, SQLite, SQL Server, MariaDB and Oracle. Auto column type detection, batch inserts, upserts and transactions. Runs in your browser no data uploaded. Free, no signup.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans', 'TOOLBEANS','TOOL BEANS',
    'toolbeans csv to sql',
    'online free csv to sql',
    'xsv to sql free online',
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
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/csv-to-sql' },
  openGraph: {
    title: 'Free CSV & Excel to SQL Converter MySQL, PostgreSQL, SQLite, SQL Server | TOOLBeans',
    description:
      'Convert CSV or Excel to SQL INSERT statements instantly. Supports 6 SQL dialects, auto type detection, batch inserts and transactions. No upload runs in browser.',
    url: 'https://toolbeans.com/tools/csv-to-sql',
  },
};

export default function CsvToSqlPage() {
  return <CsvToSqlTool />;
}