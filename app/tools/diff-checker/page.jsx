import DiffCheckerTool from '@/tools/DiffCheckerTool';

export const metadata = {
  title: 'Diff Checker Compare Text & Code Online Free | Side-by-Side Diff',
  description:
    'Free online diff checker. Compare two versions of text or code side-by-side with line-level and word-level highlighting. Split view, unified view, ignore whitespace, ignore case, context lines, search highlight and export diff. No upload runs in browser.',
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
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/diff-checker' },
  openGraph: {
    title: 'Free Diff Checker Compare Text & Code Side-by-Side | TOOLBeans',
    description:
      'Compare two versions of text or code instantly. Line and word-level highlighting, split/unified/summary views, ignore whitespace, export diff. No upload needed.',
    url: 'https://toolbeans.com/tools/diff-checker',
  },
};

export default function DiffCheckerPage() {
  return <DiffCheckerTool />;
}