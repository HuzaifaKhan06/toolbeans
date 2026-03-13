import SQLTool from '@/tools/SQLTool';

export const metadata = {
  title: 'SQL Formatter Free Online SQL Beautifier and Code Formatter',
  description:
    'Format and beautify SQL queries online. Supports MySQL, PostgreSQL, SQLite, T-SQL, BigQuery and MariaDB. Keyword case control, syntax highlighting and file upload. Free SQL formatter.',
  keywords: [
    'sql formatter',
    'sql formatter online',
    'sql beautifier',
    'format sql query online',
    'sql pretty print',
    'mysql formatter online',
    'postgresql formatter',
    'sql code formatter',
    'sql query formatter',
    'bigquery formatter',
    'format sql',
    'online free sql formatter',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/sql-formatter' },
  openGraph: {
    title: 'Free SQL Formatter Online MySQL, PostgreSQL, BigQuery | TOOLBeans',
    description:
      'Format messy SQL into clean readable code. Supports MySQL, PostgreSQL, SQLite, T-SQL and BigQuery. Free, no signup.',
    url: 'https://toolbeans.com/tools/sql-formatter',
  },
};

export default function SQLFormatterPage() {
  return <SQLTool />;
}