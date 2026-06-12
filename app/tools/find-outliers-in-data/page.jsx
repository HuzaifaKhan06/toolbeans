// app/tools/find-outliers-in-data/page.jsx
// Path: toolbeans/app/tools/find-outliers-in-data/page.jsx
// Tool component: toolbeans/tools/OutlierDetectorTool.jsx
//
// STANDALONE tool  dedicated outlier/distribution analysis. The
// Data Quality Checker already has a fixed-3-sigma outlier tab as ONE
// of 4 score factors; this tool is genuinely different: it runs TWO
// detection methods (3-sigma/Z-score AND IQR/Tukey's method) side by
// side with ADJUSTABLE thresholds, and renders an actual histogram +
// box plot per column  visualizations that exist nowhere else in the
// family. Deliberately has NO removal button (investigate, don't
// auto-remove). CSV only.

import OutlierDetectorTool from '@/tools/OutlierDetectorTool';

export const metadata = {
  title: 'Find Outliers in Data Free Online  3-Sigma vs IQR, with Box Plots',
  description:
    'Upload a CSV and detect statistical outliers two ways: the 3-sigma (Z-score) rule and the IQR (Tukey) method, side by side with adjustable thresholds. See an interactive histogram and box plot per numeric column, with exact row numbers for every flagged value. Free, no signup, runs entirely in your browser.',
  keywords: [
    'find outliers in data online free csv',
    'outlier detection tool free online 2026',
    'iqr outlier calculator online free',
    'z score outlier detector csv free',
    '3 sigma rule outlier finder online',
    'interquartile range outlier tool free',
    'detect anomalies in csv data free',
    'statistical outlier checker no signup',
    'box plot generator csv online free',
    'data distribution histogram tool free',
    'find extreme values in dataset online',
    'tukey outlier detection free online',
    'csv outlier analysis tool free 2026',
    'compare z score and iqr outliers free',
    'adjustable outlier threshold csv tool',
    'anomaly detection csv free no signup',
    'find data entry errors csv free tool',
    'outlier visualization tool online free',
    'standard deviation outlier finder free',
    'free statistical outlier detector csv',
  ],
  authors: [{ name: 'TOOLBeans Editorial Team' }],
  alternates: { canonical: 'https://toolbeans.com/tools/find-outliers-in-data' },
  openGraph: {
    title: 'Find Outliers in Data  3-Sigma vs IQR, with Box Plots',
    description:
      'Two outlier detection methods side by side with adjustable thresholds, plus an interactive histogram and box plot per column. Exact row numbers, no auto-removal.',
    url: 'https://toolbeans.com/tools/find-outliers-in-data',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [
      {
        url: 'https://toolbeans.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Find Outliers in Data  3-Sigma vs IQR Outlier Detector Free Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Outliers in Data  3-Sigma vs IQR, with Box Plots',
    description:
      'Two detection methods, adjustable thresholds, histogram + box plot per column, exact row numbers. No signup.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

// ── JSON-LD ───────────────────────────────────────────────
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
    name: 'Statistical Outlier Detector  3-Sigma and IQR',
    url: 'https://toolbeans.com/tools/find-outliers-in-data',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    description:
      'Free browser-based tool to detect statistical outliers in CSV files using two methods side by side: the 3-sigma (Z-score) rule and the IQR (Tukey) method. Thresholds are adjustable  sigma from 2.0 to 3.5, IQR multiplier 1.5x or 3x. Shows an interactive histogram with outlier zones shaded and a box plot with Q1, median, Q3, whiskers and outlier points for every numeric column. Every flagged value is listed with its exact row number. Deliberately has no automatic removal, since outliers should be investigated, not deleted by default.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Two outlier detection methods: 3-sigma (Z-score) and IQR (Tukey)',
      'Adjustable sigma threshold from 2.0 to 3.5 standard deviations',
      'Adjustable IQR multiplier: 1.5x (outliers) or 3x (extreme outliers)',
      'Side-by-side comparison of outlier counts from both methods per column',
      'Interactive histogram with outlier zones shaded',
      'Interactive box plot: Q1, median, Q3, whiskers and outlier points',
      'Mean, median, standard deviation, Q1, Q3 and IQR per numeric column',
      'Every outlier listed with its exact row number',
      'Copy outlier row numbers for manual review',
      'No automatic removal  investigation-focused by design',
      'CSV files only  fast, focused, browser-based parsing',
      'No file upload to server  runs in browser',
      'No signup, no account, no row limit',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What outlier detection methods does this tool use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Two methods, calculated for every numeric column and shown side by side: the 3-sigma (Z-score) rule, which flags values more than a chosen number of standard deviations from the mean, and the IQR (Tukey) method, which flags values below Q1 minus a multiplier times the interquartile range, or above Q3 plus that multiple. Both thresholds are adjustable, so you can see how the outlier count changes as you tighten or loosen the definition.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between the 3-sigma method and the IQR method?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 3-sigma method assumes a roughly normal, symmetric distribution and uses the mean and standard deviation, both of which are themselves pulled around by extreme values  a single huge outlier can inflate the standard deviation enough to mask smaller but still unusual values. The IQR method is based on the median and quartiles, which barely move when a few extreme points exist, making it more robust for skewed data such as revenue or transaction amounts. The two methods often agree, but when they disagree it is usually because the data is skewed rather than normally distributed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I adjust the outlier detection threshold?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. For the 3-sigma method you can choose 2.0, 2.5, 3.0 or 3.5 standard deviations  lower values flag more points as outliers. For the IQR method you can choose the standard 1.5x multiplier, which Tukey defined as "outliers," or 3x, which is conventionally used for "extreme outliers" or "far out" points. The histogram, box plot and outlier list update immediately when you change either setting.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I read the box plot and histogram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The box plot shows a shaded box from Q1 to Q3 (the middle 50% of values) with a line at the median, whiskers extending to the most extreme values within the current threshold, and individual dots for every value flagged as an outlier beyond the whiskers. The histogram groups all values into bins and shows a bar per bin  bins that fall entirely within the outlier zone for the current method and threshold are shaded red, while normal bins are shown in purple.',
        },
      },
      {
        '@type': 'Question',
        name: 'Should I remove outliers from my data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not automatically. An outlier might be a data entry error that should be corrected, or it might be a genuine extreme value  a very large order, a payment reversal, a record-setting day  that is exactly the signal you care about. This tool deliberately does not include a one-click removal button. It lists every flagged value with its row number and lets you copy those row numbers so you can look up and judge each one individually in your original file.',
        },
      },
      {
        '@type': 'Question',
        name: 'What causes outliers in business data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Four common causes: data entry errors, such as typing 100000 instead of 10000 or an extra zero from a copy-paste; system or sensor defaults, where a missing reading is stored as -1, 0 or 9999 instead of being left blank; genuinely extreme but real values, such as a single large order among many small ones; and leftover test or staging records with unrealistic placeholder amounts or dates that were never cleaned out before the file was exported.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is this different from the outlier detection in the Data Quality Checker?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Data Quality Checker runs a fixed 3-sigma check as one of four factors feeding into an overall 0-100 score, shown as a simple table of flagged values. This tool is a dedicated deep-dive: it runs both 3-sigma and IQR side by side, lets you adjust both thresholds interactively, and renders an actual histogram and box plot per column so you can see the shape of your data, not just a list of flagged numbers. Use the Data Quality Checker for an overall health score; use this tool when you specifically need to investigate the distribution of one column.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my CSV file uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Your file is read directly in your browser using the JavaScript FileReader API. All statistics, histogram binning and outlier calculations run locally and nothing is transmitted to any server, which makes this safe for confidential financial or operational data.',
        },
      },
    ],
  },
];

export default function FindOutliersInDataPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={`schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <OutlierDetectorTool />
    </>
  );
}