import WordCounterTool from '@/tools/WordCounterTool';

export const metadata = {
  title: 'Word Counter — Free Online Word Count and Character Counter',
  description:
    'Count words, characters, sentences, paragraphs and lines instantly. Includes reading time, speaking time, keyword density analyzer and word count goal tracker. Free online word counter — no signup.',
  keywords: [
    'word counter',
    'word counter online',
    'character counter',
    'word count tool',
    'online word counter',
    'character count online',
    'word count checker',
    'reading time calculator',
    'word frequency counter',
    'keyword density checker',
    'sentence counter',
    'paragraph counter',
    'word count for essay',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/word-counter' },
  openGraph: {
    title: 'Free Word Counter Online — Characters, Sentences, Reading Time | TOOLBeans',
    description:
      'Count words, characters and sentences instantly. Reading time, speaking time, keyword density and word goal tracker. Free, no signup.',
    url: 'https://toolbeans.com/tools/word-counter',
  },
};

export default function WordCounterPage() {
  return <WordCounterTool />;
}