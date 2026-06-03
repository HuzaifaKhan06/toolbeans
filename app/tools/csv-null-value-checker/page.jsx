// app/tools/csv-null-value-checker/page.jsx
import DataProfilerTool from '@/tools/DataProfilerTool';

export const metadata = {
  title: 'Find Null Values in CSV Free Online  Check Missing Data by Column',
  description:
    'Upload any CSV or Excel file and instantly find every null, empty and missing value by column. See fill rates, null counts and completeness percentage. Fill or remove nulls and download the cleaned dataset. Free, no signup, browser-only.',
  keywords: [
    'find null values in csv',
    'check missing values in dataset',
    'null value detector csv',
    'find empty cells in csv online',
    'csv missing data checker',
    'check null values in excel online free',
    'find blank cells in csv',
    'missing value analysis csv',
    'data completeness checker online',
    'check empty values in dataset',
    'null value finder online free',
    'csv column completeness checker',
    'find missing data in spreadsheet',
    'how to find null values in csv file',
    'check for missing values in dataset online',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/csv-null-value-checker' },
  openGraph: {
    title: 'Find Null Values in CSV  Missing Data Checker Free | TOOLBeans',
    description: 'Instantly see every null and missing value in your CSV or Excel file by column. Fill or remove nulls and download the cleaned data. Free, browser-only.',
    url: 'https://toolbeans.com/tools/csv-null-value-checker',
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
      { '@type': 'ListItem', position: 3, name: 'CSV Null Value Checker', item: 'https://toolbeans.com/tools/csv-null-value-checker' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CSV Null and Missing Value Checker  TOOLBeans',
    url: 'https://toolbeans.com/tools/csv-null-value-checker',
    description: 'Free browser-based tool to find null and missing values in CSV and Excel files. Shows null count and fill rate percentage per column. Fill nulls with 0, column mean or empty string, or drop rows with nulls. Download cleaned file as CSV or Excel.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Find null and empty values per column in CSV',
      'Find missing values in Excel XLSX and XLS files',
      'Shows null count and fill rate percentage per column',
      'Overall dataset completeness percentage',
      'Fill nulls with 0, column mean, or empty string',
      'Drop all rows containing any null value',
      'Download cleaned file as CSV, Excel or JSON',
      'Runs entirely in browser  no file upload to server',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I find null values in a CSV file?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your CSV file to this tool. After analysis, the Issues tab shows every column that has null or missing values, with the exact null count and fill rate percentage. The overview tab shows a fill rate bar chart for all columns at once. Null cells are highlighted in the Data Table.',
        },
      },
      {
        '@type': 'Question',
        name: 'What counts as a null value in this tool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A cell is treated as null if it is completely empty, contains only whitespace, is a JavaScript null or undefined value, or is an empty string. The tool does not currently treat text like "NULL", "NA", "N/A" as null unless the cell is literally empty.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I fill null values instead of deleting rows?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. In the Clean Data tab, choose Fill Null Values and select one of three options: fill with 0 (useful for numeric columns), fill with the column mean (replaces each null with the average of that column), or fill with an empty string (keeps the row but makes the cell explicitly empty).',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a fill rate and why does it matter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Fill rate is the percentage of non-null values in a column. A fill rate of 100% means no nulls. A fill rate of 70% means 30% of values are missing. Columns below 70% fill rate usually indicate a problem at the data source  a form field that was optional, an API that sometimes omits a field, or a join that did not find a match.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does checking for nulls work with Excel files too?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Upload .xlsx or .xls files directly. The tool reads all rows from the first sheet and runs the same null detection as for CSV files, showing fill rates for every column.',
        },
      },
    ],
  },
];

export default function CsvNullValueCheckerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-b border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <a href="/" className="hover:text-slate-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">CSV Null Value Checker</span>
          </nav>

          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">⬜</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                Find Null and Missing Values in CSV
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                Upload any CSV or Excel file and instantly see every null value and missing cell by column.
                Fill nulls or drop incomplete rows with one click, then download your cleaned dataset.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            {[
              { icon: '📊', text: 'Fill rate per column' },
              { icon: '🔢', text: 'Exact null counts' },
              { icon: '✏️', text: 'Fill with 0 or mean' },
              { icon: '🔒', text: 'No upload to server' },
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
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Why Missing Values Break Downstream Systems</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Missing values cause silent failures in almost every data system. A SQL import that encounters a null in a NOT NULL column will reject the entire row or the entire file depending on the database. A Power BI measure that tries to SUM a column with nulls will return a blank or incorrect result. A machine learning model trained on data with nulls will either error out or silently learn from incomplete information.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The challenge is that missing values are not always obvious. A CSV might look complete in Excel because empty cells look the same as cells containing spaces. A column might have 5,000 rows of valid data and 200 rows of blanks at the bottom that are easy to miss when scrolling. This tool scans every single cell and gives you exact counts by column, so nothing is hidden.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            The fill rate percentage per column tells you not just whether nulls exist but how severe the problem is. A column at 99% fill rate has a trivial problem  probably a few data entry gaps. A column at 45% fill rate has a structural problem  the data is not being collected consistently at the source and needs to be fixed upstream before the data is useful for analysis.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Three Ways to Handle Null Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🗑️', title: 'Drop Rows with Nulls', desc: 'Removes any row that has at least one null value. Best when you need a completely clean dataset and can afford to lose some records. Use when nulls represent genuinely bad data.' },
              { icon: '0️⃣', title: 'Fill with Zero', desc: 'Replaces every null with 0. Best for numeric columns where a missing value genuinely means zero  such as a count of transactions or a quantity field.' },
              { icon: '📐', title: 'Fill with Column Mean', desc: 'Replaces each null with the average value of that column. A statistical imputation technique that preserves column distribution. Best for continuous numeric variables where the missing value could reasonably be average.' },
            ].map(opt => (
              <div key={opt.title} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-2xl mb-2">{opt.icon}</div>
                <div className="text-sm font-extrabold text-slate-800 mb-1">{opt.title}</div>
                <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'How do I check how many null values are in each column of my CSV?', a: 'Upload your CSV to this tool. The Overview tab shows a fill rate bar chart for every column at once. Green bars are 100% full, amber bars have some nulls, red bars have many nulls. The Issues tab shows the exact null count and fill rate percentage for each column that has missing values.' },
              { q: 'What is the difference between a null value and an empty string?', a: 'A null value means the cell has no data at all. An empty string means the cell contains a string of zero characters. In CSV files the distinction is sometimes lost. This tool treats both as missing  any cell that is blank, contains only whitespace, or has an empty string is counted as a null.' },
              { q: 'How do I find which rows have null values?', a: 'Go to the Data Table tab. Null cells are highlighted with a red background, making them easy to spot. You can search the table using the search box to filter rows. The Clean Data tab also shows the total null count across all columns.' },
              { q: 'Can I see the fill rate for every column in one view?', a: 'Yes. The Overview tab has a Column Fill Rate chart that shows every column as a horizontal bar from 0% to 100%. You can see all columns at a glance and immediately spot which ones have the most missing data.' },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-sm font-bold text-slate-800 mb-1.5">{faq.q}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 mb-3">Related Data Quality Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Find Duplicate Rows in CSV', href: '/tools/find-duplicates-in-csv', desc: 'Detect and remove exact duplicate rows from any file' },
              { name: 'Data Quality Checker', href: '/tools/data-quality-checker', desc: 'Full quality report with quality score and insights' },
              { name: 'Excel Data Analyzer', href: '/tools/excel-data-analyzer', desc: 'Complete analysis for Excel XLSX and XLS files' },
              { name: 'Find Outliers in Data', href: '/tools/find-outliers-in-data', desc: 'Detect statistical outliers in numeric columns' },
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