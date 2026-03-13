import JSONTool from '@/tools/JSONTool';

export const metadata = {
  title: 'JSON Formatter Free Online JSON Beautifier and Validator',
  description:
    'Format, beautify, minify and validate JSON online. Tree view, auto-repair broken JSON, syntax error detection, custom indentation and file upload. Free JSON formatter runs in your browser.',
  keywords: [
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
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/json-formatter' },
  openGraph: {
    title: 'Free JSON Formatter, Beautifier and Validator Online | TOOLBeans',
    description:
      'Format and validate JSON instantly. Tree view, auto-repair, minify and file upload. Free JSON formatter no signup required.',
    url: 'https://toolbeans.com/tools/json-formatter',
  },
};

export default function JSONFormatterPage() {
  return <JSONTool />;
}