// app/tools/data-quality-checker/page.jsx
import DataProfilerTool from '@/tools/DataProfilerTool';

export const metadata = {
  title: 'Data Quality Checker Free Online  Score, Validate and Fix Your Dataset',
  description:
    'Get a complete data quality report for any CSV, Excel or JSON file. Quality score 0-100, null detection, duplicate rows, type mismatches, outliers and column statistics. Fix issues and download cleaned data. Free, no signup, browser-only.',
  keywords: [
    'data quality checker',
    'check data quality csv',
    'data validation tool online free',
    'dataset quality checker browser',
    'data quality score tool',
    'data quality analyzer online',
    'check data quality before power bi',
    'data quality report generator free',
    'validate dataset online free',
    'data quality inspector tool',
    'free data quality tool',
    'data quality assessment tool',
    'check data before dashboard',
    'data validation checker free',
    'dataset health checker online',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/data-quality-checker' },
  openGraph: {
    title: 'Data Quality Checker  Score and Validate Any Dataset Free | TOOLBeans',
    description: 'Complete data quality report with a score from 0-100. Detects nulls, duplicates, type mismatches and outliers. Fix issues and export cleaned data. Free, browser-only.',
    url: 'https://toolbeans.com/tools/data-quality-checker',
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
      { '@type': 'ListItem', position: 3, name: 'Data Quality Checker', item: 'https://toolbeans.com/tools/data-quality-checker' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Data Quality Checker and Validator  TOOLBeans',
    url: 'https://toolbeans.com/tools/data-quality-checker',
    description: 'Free browser-based data quality checker that scores datasets from 0 to 100. Detects null values, duplicate rows, type mismatches, statistical outliers and infers data types. Provides auto-generated insights, column-level statistics, and one-click data cleaning tools.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Data quality score from 0 to 100',
      'Auto-generated insight cards explaining each issue',
      'Null value detection per column with fill rates',
      'Duplicate row detection with row numbers',
      'Data type mismatch detection',
      'Statistical outlier detection using 3-sigma rule',
      'Column statistics: min, max, mean, median, mode, std dev',
      'Schema inference with nullable and unique flags',
      'One-click data cleaning: remove duplicates, fill nulls, standardize headers',
      'Export quality report as JSON',
      'Download cleaned data as CSV, Excel or JSON',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a data quality score?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A data quality score from 0 to 100 measures the overall health of a dataset. This tool calculates it based on column fill rates, the presence of type mismatches, duplicate rows and statistical outliers. A score above 90 means the data is clean and ready for analysis. Scores below 50 indicate multiple significant problems that will cause errors in databases, Power BI or other downstream tools.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does this data quality checker look for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The checker detects null and empty values per column, exact duplicate rows, data type mismatches (text values in numeric columns), statistical outliers more than three standard deviations from the mean, duplicate columns with identical data, and low fill rate columns below 70%. It also infers the data type of each column and generates auto-insights explaining what each issue means.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I check data quality before loading into Power BI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your CSV or Excel file to this tool. The quality score and insights tab will highlight any issues that would cause problems in Power BI  type mismatches that break measures, nulls that cause blank visuals, and duplicates that inflate aggregations. Fix the issues using the Clean Data tab and download the cleaned file before importing into Power BI.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I get a data quality report I can share?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Click the Export Report button to download a structured JSON file containing the quality score, all column-level statistics, detected issues and the inferred schema. You can share this file with stakeholders or include it in a data documentation process.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a type mismatch and why does it fail imports?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A type mismatch occurs when a column mostly contains numbers but a few rows contain text values. For example, an amount column where 997 rows have numbers but 3 rows have the text N/A. SQL databases will reject the import because they expect a consistent data type. Power BI will treat the entire column as text rather than numeric, breaking any measure that tries to SUM or AVERAGE it.',
        },
      },
    ],
  },
];

export default function DataQualityCheckerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={`schema-${i}`} type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-b border-slate-100 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-5" aria-label="Breadcrumb">
            <a href="/" className="hover:text-slate-600">Home</a>
            <span>/</span>
            <a href="/tools" className="hover:text-slate-600">Tools</a>
            <span>/</span>
            <span className="text-slate-600 font-semibold">Data Quality Checker</span>
          </nav>

          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🏆</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                Data Quality Checker  Score Any Dataset in Seconds
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                Get a complete data quality report with a score from 0 to 100. Detects nulls, duplicates, type mismatches and outliers with auto-generated insights explaining exactly what each issue means and why it matters.
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            {[
              { icon: '🏆', text: 'Quality score 0–100' },
              { icon: '💡', text: 'Auto insights' },
              { icon: '🔧', text: 'One-click fixes' },
              { icon: '📄', text: 'Export report JSON' },
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
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">What the Data Quality Score Measures</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            The quality score is a single number from 0 to 100 that summarises the overall health of your dataset. It is calculated from four factors. Column completeness  how full each column is, where 100% means no nulls and anything below 70% heavily penalises the score. Type consistency  whether numeric columns contain only numbers or have text mixed in. Data uniqueness  whether duplicate rows are inflating the dataset. And statistical integrity  whether numeric columns have outliers that suggest data entry errors.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { range: '90–100', label: 'Excellent', color: 'bg-emerald-50 border-emerald-200', tc: 'text-emerald-700', desc: 'Clean and ready for production use, database import or dashboard connection.' },
              { range: '70–89',  label: 'Good',      color: 'bg-amber-50 border-amber-200',   tc: 'text-amber-700',  desc: 'Minor issues exist. Review the insights and fix before using in production reports.' },
              { range: '0–69',   label: 'Poor',      color: 'bg-red-50 border-red-200',       tc: 'text-red-700',    desc: 'Multiple significant problems. Fix before analysis or the results will be unreliable.' },
            ].map(s => (
              <div key={s.range} className={'border rounded-xl p-4 ' + s.color}>
                <div className={'text-lg font-extrabold mb-0.5 ' + s.tc}>{s.range}</div>
                <div className={'text-sm font-bold mb-1 ' + s.tc}>{s.label}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-3">How to Check Data Quality Before Loading into Power BI or a Database</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The most common scenario where data quality checking prevents serious problems is before loading a CSV or Excel export into a BI tool or database. Skipping this step is the leading cause of dashboards that show wrong numbers, database imports that fail with cryptic errors, and reports that a stakeholder later flags as inconsistent with source system data.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { step: '1', text: 'Upload your export file to this tool' },
              { step: '2', text: 'Check the quality score and read the auto-generated insights' },
              { step: '3', text: 'Go to the Issues tab and review each detected problem' },
              { step: '4', text: 'Use the Clean Data tab to fix issues: remove duplicates, fill nulls, standardize headers' },
              { step: '5', text: 'Download the cleaned file and import it into Power BI or your database' },
            ].map(s => (
              <div key={s.step} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-7 h-7 bg-emerald-600 text-white text-xs font-extrabold rounded-full flex items-center justify-center flex-shrink-0">{s.step}</div>
                <span className="text-sm text-slate-700">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'How is the data quality score calculated?', a: 'The score starts at 100 and deductions are applied for each quality issue. Missing values reduce the score based on how many columns are affected and how incomplete they are. Type mismatches deduct points per column with inconsistent types. Duplicate rows deduct up to 30 points depending on the percentage of duplicates. The final score is capped at 0 and rounded to the nearest integer.' },
              { q: 'What is the difference between this tool and Excel data validation?', a: 'Excel data validation prevents bad data from being entered in the first place. This tool analyzes data that already exists and finds problems. It is most useful when you receive data from an external system, a client, or an automated export and need to check its quality before using it.' },
              { q: 'Can this tool validate data against rules I define?', a: 'The current version uses automatic detection based on statistical analysis. It detects type patterns, null rates and outliers without requiring you to define rules. Custom rule-based validation (such as "amount must be positive" or "email must contain @") is not currently supported.' },
              { q: 'Can I use this to check API data quality before building a dashboard?', a: 'Yes. Switch to the API tab, enter your REST endpoint URL, and optionally add a Bearer token for authenticated APIs. The tool fetches the JSON response and runs the same quality check as for files. This is useful for checking the quality of live API data before connecting it to a dashboard.' },
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
              { name: 'Find Duplicate Rows in CSV', href: '/tools/find-duplicates-in-csv', desc: 'Focused tool for detecting and removing duplicate rows' },
              { name: 'CSV Null Value Checker', href: '/tools/csv-null-value-checker', desc: 'Find and fix missing values column by column' },
              { name: 'Excel Data Analyzer', href: '/tools/excel-data-analyzer', desc: 'Full analysis for Excel files with the same quality score' },
              { name: 'Find Outliers in Data', href: '/tools/find-outliers-in-data', desc: 'Detect statistical outliers with 3-sigma analysis' },
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