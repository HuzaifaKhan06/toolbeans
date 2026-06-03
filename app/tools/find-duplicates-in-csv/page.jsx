// app/tools/find-duplicates-in-csv/page.jsx
import DataProfilerTool from '@/tools/DataProfilerTool';

export const metadata = {
  title: 'Find and Remove Duplicate Rows in CSV Free Online  No Code Required',
  description:
    'Instantly find duplicate rows in any CSV or Excel file. Upload your file and see every duplicate row highlighted with its row number in seconds. Remove duplicates and download the cleaned file as CSV or Excel. Free, no signup, runs in your browser.',
  keywords: [
    'find duplicate rows in csv',
    'remove duplicate rows online',
    'check csv for duplicates',
    'duplicate row finder online',
    'find duplicates in csv file free',
    'csv duplicate checker online',
    'remove duplicate records csv',
    'find duplicate data in excel online',
    'duplicate row detector free',
    'check for duplicates in dataset',
    'online csv deduplication tool',
    'find repeated rows in spreadsheet',
    'how to find duplicate rows in csv',
    'excel duplicate row finder online free',
    'deduplicate csv online free',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/find-duplicates-in-csv' },
  openGraph: {
    title: 'Find and Remove Duplicate Rows in CSV Free  TOOLBeans',
    description: 'Upload any CSV or Excel file and instantly see every duplicate row with its row number. Remove duplicates in one click and download the cleaned file.',
    url: 'https://toolbeans.com/tools/find-duplicates-in-csv',
    siteName: 'TOOLBeans',
    type: 'website',
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
      { '@type': 'ListItem', position: 3, name: 'Find Duplicates in CSV', item: 'https://toolbeans.com/tools/find-duplicates-in-csv' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSV Duplicate Row Finder and Remover  TOOLBeans',
    url: 'https://toolbeans.com/tools/find-duplicates-in-csv',
    description: 'Free online tool to find and remove duplicate rows in CSV and Excel files. Upload your file and see every duplicate highlighted with its exact row number. Remove all duplicates in one click and download the cleaned file. Runs entirely in your browser.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Find duplicate rows in CSV files instantly',
      'Find duplicate rows in Excel XLSX and XLS files',
      'Shows exact row numbers of every duplicate',
      'Preview table of first 5 duplicate pairs',
      'Remove all duplicates with one click',
      'Download deduplicated file as CSV, Excel or JSON',
      'Highlights duplicates in red in the data table',
      'No file upload to server  runs in browser',
      'No signup, no watermark, no limit on rows',
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
          text: 'Upload your CSV file to this tool. It automatically scans every row and shows you all duplicates in the Issues tab with their exact row numbers. A preview table shows the first five duplicate pairs side by side. Duplicates are also highlighted in red in the Data Table tab.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I remove duplicate rows from a CSV and download the result?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your file, then go to the Clean Data tab. Click the "Remove Duplicate Rows" button. The row count updates immediately to show how many rows remain after deduplication. Then click CSV, XLSX or JSON to download the cleaned file.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does this tool find exact duplicates or fuzzy duplicates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'This tool finds exact duplicate rows, meaning every column value must match exactly. It is case-insensitive and trims whitespace before comparison, so "John Smith" and "john smith  " would be treated as duplicates.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I find duplicates in Excel files as well as CSV?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Upload .xlsx or .xls files directly. The tool reads all rows from the first sheet and runs the same duplicate detection as for CSV files.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does finding duplicates matter for data analysis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Duplicate rows inflate every aggregate calculation. If 10% of your rows are duplicates, every SUM, COUNT and AVERAGE is 10% wrong. Dashboards built on data with duplicates give misleading insights. Removing duplicates before analysis or database import is a critical data cleaning step.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my CSV file uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Your file is processed entirely in your browser using JavaScript. It never leaves your device and is never sent to any server.',
        },
      },
    ],
  },
];

export default function FindDuplicatesInCsvPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* ── PAGE-SPECIFIC SEO HERO ── */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 border-b border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <a href="/" className="hover:text-slate-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Find Duplicates in CSV</span>
          </nav>

          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🔁</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                Find and Remove Duplicate Rows in CSV
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                Upload any CSV or Excel file and instantly see every duplicate row with its exact row number.
                Remove all duplicates in one click and download the cleaned file  no code, no Excel formulas, no signup.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            {[
              { icon: '🔍', text: 'Exact row numbers shown' },
              { icon: '⚡', text: 'Results in seconds' },
              { icon: '⬇️', text: 'Download cleaned CSV/Excel' },
              { icon: '🔒', text: 'No upload to server' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-sm text-slate-600 shadow-sm">
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <DataProfilerTool />

      {/* ── SEO CONTENT ── */}
      <section className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Why Duplicate Rows Are a Serious Data Problem</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Duplicate rows are one of the most common data quality issues, and one of the most damaging. Unlike missing values which are visible, duplicates are invisible until you look for them. A dataset with 5% duplicate rows will produce a revenue total that is 5% too high, a customer count that is 5% too high, and any rate or percentage that is calculated from those numbers will also be wrong.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The most common cause is data being appended to a CSV multiple times  a scheduled export that ran twice, a manual copy-paste from two overlapping date ranges, or a merge of two tables that shared records. Another common source is data imported from multiple systems where the same customer or transaction exists in both.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Before loading any CSV into a database, Power BI, Tableau or any analysis tool, checking for and removing duplicate rows is one of the first steps every data professional takes. This tool does that check instantly, without requiring any technical knowledge or software installation.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">How to Find and Remove Duplicate Rows Step by Step</h2>
          <div className="flex flex-col gap-4">
            {[
              { step: '1', title: 'Upload Your CSV or Excel File', detail: 'Click the upload area above or drag your file onto it. CSV, Excel (.xlsx and .xls) and JSON files are all supported. Your file is read entirely in your browser  nothing is sent to any server.' },
              { step: '2', title: 'Check the Issues Tab', detail: 'After analysis completes, click the Issues tab. The Duplicate Rows section shows the exact count of duplicate rows and lists every duplicate with its row number and the row it copied.' },
              { step: '3', title: 'Preview the Duplicates', detail: 'Click "Show preview" to see a table of the first five duplicate pairs. This helps you verify the tool is detecting the right rows before you remove them.' },
              { step: '4', title: 'Remove Duplicates with One Click', detail: 'Go to the Clean Data tab and click "Remove Duplicate Rows". The row count updates immediately to show the new total.' },
              { step: '5', title: 'Download the Cleaned File', detail: 'Click CSV, XLSX or JSON to download your deduplicated file. The filename is "data-export" so you can easily find it.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 bg-blue-600 text-white text-sm font-extrabold rounded-full flex items-center justify-center flex-shrink-0">{s.step}</div>
                <div>
                  <div className="text-sm font-extrabold text-slate-800 mb-1">{s.title}</div>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'How does the tool decide if two rows are duplicates?', a: 'Two rows are considered duplicates if every column value matches. The comparison is case-insensitive and ignores leading and trailing whitespace. So "New York" and "new york " would match. Values like 100 and 100.0 would not match unless they are stored as identical strings.' },
              { q: 'What if I only want to check specific columns for duplicates?', a: 'This tool currently checks all columns for exact row-level duplicates. If you need to deduplicate based on a subset of columns, the best approach is to use the Download button to export the data to CSV, then use the CSV to SQL tool on TOOLBeans to write a SELECT DISTINCT query on just those columns.' },
              { q: 'How many rows can the tool handle?', a: 'There is no row limit. All rows in your file are processed. For very large files above several hundred thousand rows, processing may take a few seconds depending on your device.' },
              { q: 'Can I undo the duplicate removal?', a: 'Yes. In the Clean Data tab there is a Reset All button that restores your original data. The tool never modifies your original file on disk  it only works with the in-memory copy.' },
              { q: 'Does this tool also detect duplicate columns?', a: 'Yes. In addition to duplicate rows, the tool detects duplicate columns  columns that have identical values across every row. These are shown separately in the Issues tab and can also be removed from the Clean Data tab.' },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-sm font-bold text-slate-800 mb-1.5">{faq.q}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Internal links */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 mb-3">Related Data Quality Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Check for Null Values in CSV', href: '/tools/csv-null-value-checker', desc: 'Find every missing value in your dataset by column' },
              { name: 'Data Quality Checker', href: '/tools/data-quality-checker', desc: 'Full data quality report with quality score 0-100' },
              { name: 'Excel Data Analyzer', href: '/tools/excel-data-analyzer', desc: 'Analyze Excel files for all quality issues' },
              { name: 'Find Outliers in Data', href: '/tools/find-outliers-in-data', desc: 'Detect statistical outliers using 3-sigma rule' },
            ].map(t => (
              <a key={t.href} href={t.href} className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all">
                <div>
                  <div className="text-sm font-bold text-slate-700">{t.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}