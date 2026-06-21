import JSONTool from '@/tools/JSONTool';

export const metadata = {
  title: 'JSON Formatter Free Online JSON Beautifier, Validator and Viewer',
  description:
    'Format, beautify, minify, sort and validate JSON online. Interactive tree view, auto-repair broken JSON, syntax error detection, sort keys A→Z, copy as escaped string, custom indentation and file upload. Free JSON formatter that runs entirely in your browser.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans','TOOLBEANS','TOOL BEANS',
    'json formatter',
    'json formatter online',
    'json beautifier',
    'json validator online',
    'format json online',
    'json pretty print',
    'json minifier',
    'json lint',
    'beautify json',
    'json viewer',
    'json tree viewer online',
    'json sort keys online',
    'json formatter free no signup',
    'validate json online free',
    'fix broken json online',
    'repair json online',
    'json escape string online',
    'minify json online free',
    'online json editor in browser',
    'json formatter and validator tool',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/json-formatter' },
  openGraph: {
    title: 'Free JSON Formatter, Beautifier and Validator Online | TOOLBeans',
    description:
      'Format, validate, minify and sort JSON instantly. Interactive tree view, auto-repair, sort keys, copy as escaped string and file upload. Free, no signup, runs in browser.',
    url: 'https://toolbeans.com/tools/json-formatter',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'JSON Formatter and Viewer TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free JSON Formatter, Validator and Tree Viewer | TOOLBeans',
    description: 'Format, validate, minify, sort and explore JSON with an interactive tree view. Auto-repair, sort keys, copy as escaped string. Free, private, in-browser.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://toolbeans.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://toolbeans.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'JSON Formatter', item: 'https://toolbeans.com/tools/json-formatter' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'JSON Formatter and Viewer TOOLBeans',
      url: 'https://toolbeans.com/tools/json-formatter',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any web browser',
      description: 'Free online JSON formatter, beautifier, validator and viewer. Format and minify JSON, validate syntax with clear error messages, explore an interactive collapsible tree, auto-repair common mistakes, sort keys alphabetically, copy as an escaped string, choose indentation and upload .json files. Runs entirely in the browser with no upload.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Format and beautify JSON with custom indentation',
        'Minify JSON to a single line',
        'Validate JSON with descriptive error messages',
        'Interactive collapsible tree view',
        'Auto-repair common JSON mistakes',
        'Sort object keys alphabetically (recursive)',
        'Copy JSON as an escaped string literal',
        'Live stats: keys, arrays, objects, depth, size',
        'Upload .json files and download results',
        'Runs entirely in browser, nothing uploaded',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is the JSON formatter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It is completely free with no signup and no usage limits, and it runs entirely in your browser.' } },
        { '@type': 'Question', name: 'Is my JSON sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All formatting, validation and other processing happens locally in your browser. Your JSON never leaves your device.' } },
        { '@type': 'Question', name: 'What does the auto-repair feature fix?', acceptedAnswer: { '@type': 'Answer', text: 'Auto-repair attempts to fix common mistakes such as trailing commas, single quotes instead of double quotes, and unquoted object keys, then reformats the result.' } },
        { '@type': 'Question', name: 'Can I sort JSON keys alphabetically?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Sort Keys action recursively orders every object key from A to Z while leaving array order unchanged, which makes diffs and comparisons easier.' } },
        { '@type': 'Question', name: 'What is the difference between format and minify?', acceptedAnswer: { '@type': 'Answer', text: 'Format adds indentation and line breaks to make JSON readable. Minify removes all unnecessary whitespace to make the smallest possible single-line JSON for transport or storage.' } },
        { '@type': 'Question', name: 'Can I explore large nested JSON?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The interactive tree view lets you expand and collapse objects and arrays so you can navigate deeply nested JSON without scrolling through raw text.' } },
      ],
    },
  ],
};

export default function JSONFormatterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <JSONTool />
    </>
  );
}