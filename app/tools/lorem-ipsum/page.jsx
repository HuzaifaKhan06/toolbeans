import LoremIpsumTool from '@/tools/LoremIpsumTool';

export const metadata = {
  title: 'Lorem Ipsum Generator — Free Placeholder Text Generator Online',
  description:
    'Generate Lorem Ipsum placeholder text instantly. Choose classic Lorem Ipsum, tech, business or casual styles. Generate paragraphs, sentences or words with optional HTML output. Free lorem ipsum generator — no signup.',
  keywords: [
    'lorem ipsum generator',
    'lorem ipsum',
    'placeholder text generator',
    'lorem ipsum online',
    'dummy text generator',
    'fake text generator',
    'lorem ipsum paragraphs',
    'lorem ipsum html',
    'random text generator',
    'filler text generator',
    'lipsum generator',
    'lorem ipsum words',
    'lorem ipsum sentences',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/lorem-ipsum' },
  openGraph: {
    title: 'Free Lorem Ipsum Generator — Classic, Tech, Business Styles | TOOLBeans',
    description:
      'Generate Lorem Ipsum placeholder text in classic, tech, business or casual styles. Paragraphs, sentences or words with optional HTML wrapping. Free, instant.',
    url: 'https://toolbeans.com/tools/lorem-ipsum',
  },
};

export default function LoremIpsumPage() {
  return <LoremIpsumTool />;
}