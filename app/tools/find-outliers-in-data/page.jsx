// app/tools/find-outliers-in-data/page.jsx
import DataProfilerTool from '@/tools/DataProfilerTool';

export const metadata = {
  title: 'Find Outliers in Data Online Free  Statistical Outlier Detector for CSV and Excel',
  description:
    'Detect statistical outliers in any CSV or Excel file using the 3-sigma rule. Upload your file and instantly see which values are more than 3 standard deviations from the column mean. Free, no signup, browser-only.',
  keywords: [
    'find outliers in data online',
    'outlier detection online free',
    'detect anomalies in dataset',
    'statistical outlier calculator',
    'find outliers in csv file',
    'outlier detector csv excel free',
    'z-score outlier detection online',
    '3 sigma outlier detection online',
    'standard deviation outlier finder',
    'find extreme values in dataset',
    'detect data anomalies online',
    'outlier analysis tool free',
    'find statistical outliers free',
    'data outlier checker csv',
    'anomaly detection tool free online',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/find-outliers-in-data' },
  openGraph: {
    title: 'Find Outliers in Data  Statistical Outlier Detector Free | TOOLBeans',
    description: 'Upload any CSV or Excel file and instantly detect outliers using the 3-sigma rule. See which values are more than 3 standard deviations from the mean per column. Free, browser-only.',
    url: 'https://toolbeans.com/tools/find-outliers-in-data',
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
      { '@type': 'ListItem', position: 3, name: 'Find Outliers in Data', item: 'https://toolbeans.com/tools/find-outliers-in-data' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Statistical Outlier Detector for CSV and Excel  TOOLBeans',
    url: 'https://toolbeans.com/tools/find-outliers-in-data',
    description: 'Free browser-based tool to detect statistical outliers in CSV and Excel files. Uses the 3-sigma rule to identify values more than 3 standard deviations from the column mean. Shows outlier count per numeric column with mean, standard deviation and distribution charts.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Detect statistical outliers using 3-sigma rule (3 standard deviations from mean)',
      'Outlier count per numeric column',
      'Mean and standard deviation shown per column',
      'Distribution histogram for each numeric column',
      'Works with CSV, Excel XLSX and XLS, and JSON files',
      'Also detects nulls, duplicates and type mismatches',
      'Full numeric statistics per column',
      'Runs entirely in browser  no server upload',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does this tool detect outliers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The tool uses the 3-sigma rule, also called the empirical rule. For each numeric column, it calculates the mean and standard deviation. Any value that is more than 3 standard deviations above or below the mean is flagged as an outlier. In a normal distribution, about 99.7% of values fall within 3 standard deviations, so values outside this range are statistically unusual.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the 3-sigma rule for outlier detection?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 3-sigma rule states that in a normal distribution, 99.7% of data points fall within 3 standard deviations of the mean. Values outside this range are considered outliers. If your mean is 100 and standard deviation is 10, any value below 70 or above 130 would be flagged. The rule is widely used in data quality, quality control and anomaly detection.',
        },
      },
      {
        '@type': 'Question',
        name: 'What causes outliers in data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Outliers have several common causes. Data entry errors where a wrong number was typed  for example, entering 10000 instead of 1000. System errors where a sensor, form or API produced an abnormal value. Legitimate extreme values that genuinely occur in the real world, such as a very large order or a payment reversal. And test data or staging records that were never removed from the production dataset.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I see which specific rows contain the outlier values?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Issues tab shows the outlier count per column and the mean and standard deviation. To find the specific rows, go to the Data Table tab and use the search box to filter for values you know are outliers. You can also use the Distribution chart in the Columns tab to see which buckets contain the extreme values.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I always remove outliers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Outliers should be investigated, not automatically removed. If an outlier is a data entry error, it should be corrected or removed. If it is a legitimate extreme value, removing it would make your analysis less accurate. The goal of outlier detection is to bring unusual values to your attention so you can make an informed decision, not to automatically delete them.',
        },
      },
    ],
  },
];

export default function FindOutliersInDataPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className="bg-gradient-to-br from-violet-50 via-white to-purple-50 border-b border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <a href="/" className="hover:text-slate-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Find Outliers in Data</span>
          </nav>

          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">📉</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                Find Statistical Outliers in CSV and Excel Data
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                Upload any CSV or Excel file and instantly detect outliers in every numeric column using the 3-sigma rule.
                See which values are more than 3 standard deviations from the mean  the standard statistical definition of an outlier.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            {[
              { icon: '📐', text: '3-sigma rule detection' },
              { icon: '📊', text: 'Distribution charts' },
              { icon: '🔢', text: 'Mean and std dev shown' },
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
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What Is the 3-Sigma Rule for Outlier Detection?</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The 3-sigma rule, also called the empirical rule or the 68-95-99.7 rule, is the standard statistical method for identifying unusual values in a dataset. In a normal distribution, 68% of values fall within 1 standard deviation of the mean, 95% fall within 2, and 99.7% fall within 3. Any value outside 3 standard deviations is therefore in the most extreme 0.3% of the distribution and is considered a statistical outlier.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="text-sm font-extrabold text-slate-800 mb-3">Example: Sales Amount Column</div>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Mean',                 value: '$4,500', color: 'text-slate-700' },
                { label: 'Standard Deviation',   value: '$800',   color: 'text-slate-700' },
                { label: 'Normal Range (±3σ)',   value: '$2,100 to $6,900', color: 'text-emerald-600' },
                { label: 'Flagged as Outlier',   value: 'Below $2,100 or above $6,900', color: 'text-red-600' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">{r.label}</span>
                  <span className={'font-bold font-mono ' + r.color}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">Four Common Causes of Outliers in Business Data</h2>
          <div className="flex flex-col gap-4">
            {[
              { icon: '⌨️', title: 'Data Entry Errors', desc: 'A person typed 100000 instead of 10000. Or a form accepted scientific notation like 1e5 which appears as a massive number. Or a copy-paste duplicated a digit. These are the most common outliers in manually entered spreadsheets and they are genuinely wrong values that should be corrected.' },
              { icon: '🖥️', title: 'System or Sensor Errors', desc: 'An API returned -1 as a default for a missing reading. A sensor produced a null reading that got stored as 0 or 9999. A database default value of 99999 was used for unknown records. These are not real data points and should be treated as missing values, not extreme but valid ones.' },
              { icon: '✅', title: 'Legitimate Extreme Values', desc: 'A VIP customer who placed a $500,000 order while every other order is under $10,000. A transaction on Black Friday that is 20x the daily average. These are genuine values that accurately represent reality and should not be removed  they are the signal, not the noise.' },
              { icon: '🧪', title: 'Test or Staging Data', desc: 'Records inserted during testing that have amounts like 12345.67 or dates in 1970 or 2099. These should be filtered out before any production analysis. Outlier detection often catches them because test values are chosen to be distinctive rather than realistic.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <div className="text-sm font-extrabold text-slate-800 mb-1">{f.title}</div>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'How do I find outliers in a CSV file?', a: 'Upload your CSV file to this tool. After analysis, the Issues tab shows an Outliers section listing every numeric column that has values more than 3 standard deviations from the mean, with the outlier count and the column mean. The Columns tab shows a distribution histogram for each numeric column so you can visually see where extreme values appear.' },
              { q: 'Can I use this for Excel files as well as CSV?', a: 'Yes. Upload .xlsx or .xls files directly. The tool reads all rows from the first sheet and runs the same outlier detection as for CSV files, including distribution histograms and statistics per numeric column.' },
              { q: 'What if my data is not normally distributed?', a: 'The 3-sigma rule works best for roughly normal distributions. For highly skewed data, such as income or transaction amounts where most values are small but a few are very large, the 3-sigma rule may flag many legitimate high values as outliers. In those cases, consider transforming your data (such as using log scale) before analysis, or treat the flagged values as candidates for investigation rather than definitive outliers.' },
              { q: 'How do I remove outlier rows from my dataset?', a: 'This tool detects outliers but does not currently have a one-click outlier removal button, because outliers should be investigated before being removed. You can export the data using the Download button in the Data Table tab, then filter and remove the specific rows manually. For bulk operations on known outlier thresholds, the CSV to SQL tool can help you write a query to filter them.' },
              { q: 'What other data quality issues does this tool detect besides outliers?', a: 'The full analysis includes null and missing values per column, exact duplicate rows, data type mismatches (text in numeric columns), duplicate columns with identical data, and a data quality score from 0 to 100. All of these are shown in the same analysis when you upload your file.' },
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
              { name: 'CSV Null Value Checker', href: '/tools/csv-null-value-checker', desc: 'Find and fix missing values by column' },
              { name: 'Data Quality Checker', href: '/tools/data-quality-checker', desc: 'Full quality report with score and auto-insights' },
              { name: 'Excel Data Analyzer', href: '/tools/excel-data-analyzer', desc: 'Full analysis for Excel XLSX and XLS files' },
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