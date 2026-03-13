import RegexTool from '@/tools/RegexTool';

export const metadata = {
  title: 'Regex Tester Free Online Regular Expression Tester with Live Highlight',
  description:
    'Test regular expressions online with live match highlighting, captured group inspector, pattern explanation engine, replace mode, flag toggles and a cheatsheet with 10 ready-made patterns. Free regex tester.',
  keywords: [
    'regex tester',
    'regex tester online',
    'regular expression tester',
    'test regex online',
    'live regex tester',
    'regex checker',
    'regex validator online',
    'regex match highlighter',
    'regex replace online',
    'regular expression checker',
    'regex pattern tester',
    'javascript regex tester',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/regex-tester' },
  openGraph: {
    title: 'Free Regex Tester Online Live Match Highlighting | TOOLBeans',
    description:
      'Test regex with live highlighting, group inspector, pattern explainer and replace mode. Free online regex tester no signup.',
    url: 'https://toolbeans.com/tools/regex-tester',
  },
};

export default function RegexTesterPage() {
  return <RegexTool />;
}