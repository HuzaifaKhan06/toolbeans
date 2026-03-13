import HtmlToMarkdownTool from '@/tools/HtmlToMarkdownTool';

export const metadata = {
  title: 'HTML to Markdown Converter Convert HTML to Markdown Online Free',
  description:
    'Convert HTML to Markdown instantly online. Supports GitHub Flavored Markdown, tables, code blocks, nested lists, blockquotes, links and images. Live preview, clean HTML option, upload .html files. Free no signup, runs in browser.',
  keywords: [
    'html to markdown',
    'html to markdown converter',
    'convert html to markdown',
    'html markdown converter online',
    'html to md',
    'html to github markdown',
    'html to markdown online free',
    'wordpress to markdown',
    'html to readme',
    'html table to markdown',
    'html code to markdown',
    'convert html to md',
    'html to markdown github flavored',
    'markdown converter online',
    'html stripper markdown',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/html-to-markdown' },
  openGraph: {
    title: 'Free HTML to Markdown Converter GFM, Tables, Code Blocks, Live Preview | TOOLBeans',
    description:
      'Convert HTML to clean Markdown instantly. GitHub Flavored Markdown, tables, code blocks, live preview. Upload .html files. No signup, runs in browser.',
    url: 'https://toolbeans.com/tools/html-to-markdown',
  },
};

export default function HtmlToMarkdownPage() {
  return <HtmlToMarkdownTool />;
}