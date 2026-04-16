// app/tools/code-formatter/page.jsx
import CodeFormatterTool from '@/tools/CodeFormatterTool';

export const metadata = {
  title: 'Free Code Formatter and Beautifier — Format JS, HTML, CSS, JSON Online',
  description:
    'Free online code formatter and beautifier for JavaScript, TypeScript, HTML, CSS, SCSS, JSON and XML. Paste any code and get clean, properly indented output instantly. Live formatting mode, minify, syntax highlighting, diff view and file upload. Runs in your browser with no upload and no signup required.',
  keywords: [
    'code formatter online free',
    'javascript formatter online',
    'html beautifier online',
    'css formatter online free',
    'json formatter and validator',
    'typescript formatter online',
    'xml formatter online',
    'code beautifier no signup',
    'format code online instantly',
    'prettier alternative online',
    'javascript minifier online free',
    'css minifier free',
    'html minifier online',
    'format js html css free',
    'online code indenter',
    'code formatter without installing',
    'auto format code browser',
    'beautify code online 2026',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/code-formatter' },
  openGraph: {
    title: 'Free Code Formatter and Beautifier — JS, HTML, CSS, JSON Online | TOOLBeans',
    description:
      'Format JavaScript, TypeScript, HTML, CSS, SCSS, JSON and XML instantly in your browser. Live mode, minify, diff view, syntax highlighting. No install, no upload, no signup.',
    url: 'https://toolbeans.com/tools/code-formatter',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Code Formatter — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Code Formatter Online — JS, HTML, CSS, JSON | TOOLBeans',
    description: 'Format and beautify any code instantly. Live mode, minify, diff view. Free, no install, runs in browser.',
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
      { '@type': 'ListItem', position: 3, name: 'Code Formatter', item: 'https://toolbeans.com/tools/code-formatter' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Code Formatter and Beautifier — TOOLBeans',
    url: 'https://toolbeans.com/tools/code-formatter',
    description: 'Free browser-based code formatter and beautifier. Supports JavaScript, TypeScript, HTML, CSS, SCSS, JSON and XML. Includes live formatting, minify mode, syntax highlighting and diff view.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Format JavaScript and TypeScript code',
      'Format HTML files with proper indentation',
      'Format CSS and SCSS stylesheets',
      'Format and validate JSON',
      'Format XML documents',
      'Live formatting mode',
      'Minify code to reduce file size',
      'Syntax highlighted output',
      'Diff view showing what changed',
      'File upload support',
      'Auto language detection',
      'Download formatted file',
      'Runs in browser with no upload',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the code formatter free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The TOOLBeans Code Formatter is completely free with no usage limits. No account, no signup and no credit card required.' },
      },
      {
        '@type': 'Question',
        name: 'Does my code get uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All formatting runs entirely in your browser using pure JavaScript. Your code never leaves your device and is never uploaded to any server.' },
      },
      {
        '@type': 'Question',
        name: 'Which programming languages does the formatter support?',
        acceptedAnswer: { '@type': 'Answer', text: 'The TOOLBeans Code Formatter supports JavaScript, TypeScript, HTML, CSS, SCSS, JSON and XML. Auto-detection identifies your language automatically when you paste code.' },
      },
      {
        '@type': 'Question',
        name: 'Can I use the formatter to minify code for production?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to Minify mode to compress your code by removing whitespace and comments. This reduces file size for production deployment of JavaScript and CSS files.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between the format and minify modes?',
        acceptedAnswer: { '@type': 'Answer', text: 'Format mode beautifies code with consistent indentation and spacing to improve readability. Minify mode removes all whitespace and comments to create the smallest possible output for production use.' },
      },
      {
        '@type': 'Question',
        name: 'Can I upload a file to format instead of pasting code?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the Upload File button to select a .js, .ts, .html, .css, .scss, .json or .xml file. The file is read and formatted locally in your browser. Nothing is uploaded to any server.' },
      },
    ],
  },
];

export default function CodeFormatterPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <CodeFormatterTool />
    </>
  );
}