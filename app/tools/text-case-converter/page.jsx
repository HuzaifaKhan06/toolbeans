import TextCaseTool from '@/tools/TextCaseTool';

export const metadata = {
  title: 'Text Case Converter camelCase, snake_case, PascalCase Online',
  description:
    'Convert text to camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case, Title Case, UPPER CASE, lower case and more. Live conversion with word and character stats. Free text case converter.',
  keywords: [
    'text case converter',
    'camelcase converter online',
    'snake case converter',
    'title case converter',
    'pascal case converter',
    'kebab case converter',
    'convert camelcase to snake_case',
    'uppercase to lowercase online',
    'string case converter',
    'text formatting tool',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/text-case-converter' },
  openGraph: {
    title: 'Free Text Case Converter camelCase, snake_case, PascalCase | TOOLBeans',
    description:
      'Convert text between camelCase, snake_case, PascalCase, kebab-case and more. Instant live conversion. Free, no signup.',
    url: 'https://toolbeans.com/tools/text-case-converter',
  },
};

export default function TextCaseConverterPage() {
  return <TextCaseTool />;
}