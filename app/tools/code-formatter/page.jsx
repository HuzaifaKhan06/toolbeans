import CodeFormatterTool from '@/tools/CodeFormatterTool';

export const metadata = {
  title: 'Code Formatter & Beautifier Format JS, HTML, CSS, JSON Online Free',
  description:
    'Free online code formatter and beautifier for JavaScript, TypeScript, HTML, CSS, SCSS, JSON and XML. Live formatting, minify mode, syntax highlighting, diff view and file upload. Runs in browser no data uploaded. No signup.',
  keywords: [
    'code formatter',
    'code formatter online',
    'javascript formatter',
    'html formatter',
    'css formatter',
    'json formatter',
    'code beautifier',
    'js formatter online',
    'html beautifier',
    'css beautifier',
    'typescript formatter',
    'xml formatter',
    'code minifier',
    'javascript minifier',
    'css minifier',
    'online code formatter free',
    'prettier online',
    'format code online',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/code-formatter' },
  openGraph: {
    title: 'Free Code Formatter JS, TypeScript, HTML, CSS, JSON, XML | TOOLBeans',
    description:
      'Format and beautify JavaScript, TypeScript, HTML, CSS, JSON and XML instantly. Live mode, minify, diff view, syntax highlighting. No upload, runs in browser.',
    url: 'https://toolbeans.com/tools/code-formatter',
  },
};

export default function CodeFormatterPage() {
  return <CodeFormatterTool />;
}