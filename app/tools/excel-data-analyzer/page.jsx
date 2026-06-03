// app/tools/excel-data-analyzer/page.jsx
import DataProfilerTool from '@/tools/DataProfilerTool';

export const metadata = {
  title: 'Excel Data Analyzer Free Online  Analyze XLSX Files Without Opening Excel',
  description:
    'Analyze any Excel file online for free. Upload .xlsx or .xls and instantly get column statistics, null values, duplicate rows, type mismatches and a data quality score. No Excel needed. Clean and download your data. Free, browser-only.',
  keywords: [
    'analyze excel file online',
    'excel data analyzer free',
    'excel data profiler online',
    'check excel data quality',
    'analyze xlsx file online free',
    'excel spreadsheet analyzer',
    'excel file data checker',
    'excel column statistics online',
    'excel data quality checker free',
    'analyze excel data without excel',
    'online excel data analyzer no signup',
    'excel data validation tool online',
    'check excel spreadsheet for errors',
    'excel null value finder online',
    'analyze excel file free no install',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/excel-data-analyzer' },
  openGraph: {
    title: 'Excel Data Analyzer  Analyze XLSX Files Free Online | TOOLBeans',
    description: 'Upload any .xlsx or .xls file and get instant column stats, null detection, duplicate rows and a data quality score. No Excel required. Free, browser-only.',
    url: 'https://toolbeans.com/tools/excel-data-analyzer',
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
      { '@type': 'ListItem', position: 3, name: 'Excel Data Analyzer', item: 'https://toolbeans.com/tools/excel-data-analyzer' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Excel Data Analyzer  TOOLBeans',
    url: 'https://toolbeans.com/tools/excel-data-analyzer',
    description: 'Free browser-based tool to analyze Excel XLSX and XLS files. Detects null values, duplicate rows, type mismatches and outliers. Shows column statistics, data quality score and auto-generated insights. Clean and export data without needing Excel installed.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Analyze Excel XLSX and XLS files without installing Excel',
      'Data quality score 0 to 100 for any Excel file',
      'Null and missing value detection per column',
      'Duplicate row detection with row numbers',
      'Data type inference and mismatch detection',
      'Column statistics: count, distinct, min, max, mean, median, mode',
      'Statistical outlier detection using 3-sigma rule',
      'Auto-generated insights explaining each issue',
      'Remove duplicates and fill nulls with one click',
      'Download cleaned file as CSV, Excel or JSON',
      'Runs entirely in browser  no server upload',
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
          text: 'Yes. This tool reads .xlsx and .xls files directly in your browser using the SheetJS library. You do not need Excel installed. Upload your file and get full column statistics, null detection, duplicate analysis and a quality score without any software installation.',
        },
      },
      {
        '@type': 'Question',
        name: 'What Excel file formats are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Both .xlsx (Excel 2007 and later) and .xls (older Excel format) are supported. The tool reads data from the first worksheet in the file. If your data is on a different sheet, copy it to the first sheet before uploading.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does this compare to using COUNTIF formulas in Excel to find duplicates?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'COUNTIF formulas in Excel require you to add a helper column, write the formula, filter the results and manually delete rows. This tool does the entire process in one click  upload the file, click Remove Duplicate Rows in the Clean Data tab, and download the result. No formulas, no manual steps.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I see column statistics for an Excel file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The Overview tab shows a full numeric statistics table for every numeric column in your file: count, distinct count, minimum, maximum, mean, median, mode, standard deviation, sum and outlier count. This is available for any Excel file without writing a single formula.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my Excel file uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Your Excel file is read and processed entirely in your browser. Nothing is sent to any server. This makes the tool safe for confidential spreadsheets, financial data, and any data subject to privacy restrictions.',
        },
      },
    ],
  },
];

export default function ExcelDataAnalyzerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className="bg-gradient-to-br from-green-50 via-white to-emerald-50 border-b border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <a href="/" className="hover:text-slate-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Excel Data Analyzer</span>
          </nav>

          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📗</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                Excel Data Analyzer  No Excel Required
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                Upload any .xlsx or .xls file and get instant column statistics, null detection, duplicate rows and a data quality score.
                Analyze, clean and export your Excel data entirely in the browser  no Excel needed, no signup, no install.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            {[
              { icon: '📗', text: 'XLSX and XLS supported' },
              { icon: '💻', text: 'No Excel needed' },
              { icon: '📊', text: 'Full column stats' },
              { icon: '🔒', text: 'No server upload' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-sm text-slate-600 shadow-sm">
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <DataProfilerTool />

      <section className="max-w-4xl mx-auto px-6 py-12">

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What You Can Learn About Your Excel Data in 30 Seconds</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Excel has powerful analysis features, but getting a complete picture of a large dataset typically requires writing multiple formulas, creating pivot tables, and spending 15-30 minutes on setup. This tool gives you that same overview instantly just by uploading the file.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '📊', title: 'Column Statistics', desc: 'Count, distinct count, min, max, mean, median, mode, standard deviation and sum for every numeric column. No formulas needed.' },
              { icon: '⬜', title: 'Missing Values', desc: 'Exact null count and fill rate percentage for each column. Immediately see which columns have data gaps.' },
              { icon: '🔁', title: 'Duplicate Rows', desc: 'Every duplicate row with its exact row number and the row it copied. Highlighted in red in the data table.' },
              { icon: '⚡', title: 'Type Problems', desc: 'Columns where text values are mixed into numeric data. These break SQL imports and Power BI measures.' },
              { icon: '📉', title: 'Outliers', desc: 'Values more than 3 standard deviations from the column mean. Suggests data entry errors or extreme values.' },
              { icon: '🏆', title: 'Quality Score', desc: 'A single number from 0 to 100 summarising the overall health of your spreadsheet data.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="text-sm font-extrabold text-slate-800 mb-1">{f.title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What This Tool Does That Excel Cannot Do Easily</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Excel is built for data entry and manual analysis. It is not optimized for automated data quality checking. Here is what typically requires hours in Excel but seconds in this tool.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-bold text-slate-600">Task</th>
                  <th className="text-left px-4 py-3 font-bold text-green-600">This Tool</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500">In Excel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Find all duplicate rows',      'Instant on upload',              'COUNTIF formula + filter + manual review'],
                  ['See null count per column',    'Shown automatically',            'COUNTBLANK formula per column'],
                  ['Get min/max/mean per column',  'Full stats table automatically', 'Multiple formulas or pivot table'],
                  ['Detect type mismatches',       'Automatic with column highlight', 'Not possible without complex VBA'],
                  ['Remove duplicates and export', 'One click + download',           'Remove Duplicates tool + Save As'],
                  ['Overall quality score',        'Calculated automatically',       'Not available'],
                ].map(([task, tool, excel]) => (
                  <tr key={task} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{task}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">{tool}</td>
                    <td className="px-4 py-3 text-slate-500">{excel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'What if my Excel file has multiple sheets?', a: 'The tool reads data from the first worksheet only. If your data is on a different sheet, open the file in Excel or Google Sheets, copy the data to the first sheet, and re-upload.' },
              { q: 'Does the tool handle Excel files with formatting, merged cells, or formulas?', a: 'The tool reads the values from cells, not the formatting. Formula results are read as their computed values. Merged cells may cause issues  the tool reads the cell values as stored in the file, so merged cells may appear as empty in non-anchor cells.' },
              { q: 'Can I analyze very large Excel files?', a: 'Yes. There is no row limit. Files with 100,000 rows or more can be analyzed. Processing time depends on your device memory and processor speed. The analysis runs entirely in your browser.' },
              { q: 'Can I download the analysis results as Excel?', a: 'You can download the cleaned data as an Excel .xlsx file using the Download button in the Clean Data or Data Table tabs. The quality report can be exported as a JSON file using the Export Report button.' },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-sm font-bold text-slate-800 mb-1.5">{faq.q}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 mb-3">Related Data Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Find Duplicate Rows in CSV', href: '/tools/find-duplicates-in-csv', desc: 'Focused duplicate detection for CSV files' },
              { name: 'CSV Null Value Checker', href: '/tools/csv-null-value-checker', desc: 'Find and fix missing values in CSV files' },
              { name: 'Data Quality Checker', href: '/tools/data-quality-checker', desc: 'Full quality report with score and insights' },
              { name: 'Find Outliers in Data', href: '/tools/find-outliers-in-data', desc: 'Statistical outlier detection for numeric columns' },
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