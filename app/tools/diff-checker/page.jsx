// app/tools/diff-checker/page.jsx
import DiffCheckerTool from '@/tools/DiffCheckerTool';

export const metadata = {
  title: 'Diff Checker  Compare Text & Code Online Free | Side-by-Side Diff',
  description:
    'Free online diff checker. Compare two versions of text or code side-by-side with line-level and word-level highlighting. Split view, unified view, ignore whitespace, ignore case, context lines, search highlight and export diff. No upload, runs in browser.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans', 'TOOLBEANS','TOOL BEANS',
    'toolbeans diff checker',
    'diff checker toolbeans',
    'free diff checker', 'online free diff checker', 'free diff checker online', 'diff checker free online', 'diff checker free',
    'diff checker',
    'text diff',
    'code diff',
    'compare text online',
    'diff tool online',
    'text comparison tool',
    'code comparison',
    'find differences in text',
    'diff checker online free',
    'side by side diff',
    'unified diff viewer',
    'compare two files online',
    'online diff',
    'text diff tool',
    'code diff viewer',
    'git diff online',
    'word level diff',
    'compare two text files',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/diff-checker' },
  openGraph: {
    title: 'Free Diff Checker  Compare Text & Code Side-by-Side | TOOLBeans',
    description:
      'Compare two versions of text or code instantly. Line and word-level highlighting, split/unified/summary views, ignore whitespace, export diff. No upload needed.',
    url: 'https://toolbeans.com/tools/diff-checker',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Diff Checker  TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Diff Checker  Compare Text & Code | TOOLBeans',
    description: 'Compare two versions of text or code with line and word-level highlighting. Split, unified and summary views. Free, private, no install.',
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
      { '@type': 'ListItem', position: 3, name: 'Diff Checker', item: 'https://toolbeans.com/tools/diff-checker' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Diff Checker  TOOLBeans',
    url: 'https://toolbeans.com/tools/diff-checker',
    description: 'Free online diff checker to compare two versions of text or code. Shows line-level and word-level differences in split, unified and summary views, with ignore whitespace, ignore case, context lines, search highlighting and diff export. Runs entirely in the browser with no upload.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Compare two text or code versions side by side',
      'Line-level difference detection',
      'Word-level inline highlighting on changed lines',
      'Split, unified and summary diff views',
      'Ignore whitespace option',
      'Ignore case option',
      'Adjustable context lines to collapse unchanged sections',
      'Search and highlight within the diff',
      'Upload files to compare',
      'Export the diff as a text file',
      'Runs entirely in browser, nothing uploaded',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the diff checker free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The TOOLBeans Diff Checker is completely free with no usage limits, no account and no signup required.' },
      },
      {
        '@type': 'Question',
        name: 'Does my text or code get uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All comparison runs entirely in your browser using JavaScript. Your text, code and uploaded files never leave your device and are never sent to any server.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between split and unified view?',
        acceptedAnswer: { '@type': 'Answer', text: 'Split view shows the two versions side by side in two columns, like a typical code review. Unified view shows a single column with removed and added lines stacked together, like the output of git diff. Summary view shows change statistics and a distribution chart.' },
      },
      {
        '@type': 'Question',
        name: 'What does word-level inline diff mean?',
        acceptedAnswer: { '@type': 'Answer', text: 'When a line is changed rather than fully added or removed, the tool highlights only the specific words that differ within that line, so you can see exactly what was edited instead of treating the whole line as changed.' },
      },
      {
        '@type': 'Question',
        name: 'Can I ignore whitespace or letter case when comparing?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Toggle Ignore Whitespace to treat lines that differ only in spacing or indentation as equal, and Ignore Case to compare text without regard to upper or lower case. Both update the diff immediately.' },
      },
      {
        '@type': 'Question',
        name: 'What file types can I upload to compare?',
        acceptedAnswer: { '@type': 'Answer', text: 'You can upload plain text and common code and config files including .txt, .js, .ts, .jsx, .tsx, .html, .css, .json, .xml, .md, .py, .php, .java, .sql, .yaml and more. Files are read locally in your browser.' },
      },
    ],
  },
];

export default function DiffCheckerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <DiffCheckerTool />
    </>
  );
}