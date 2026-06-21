import LoremIpsumTool from '@/tools/LoremIpsumTool';

export const metadata = {
  title: 'Lorem Ipsum Generator Free Placeholder Text Generator Online',
  description:
    'Generate Lorem Ipsum placeholder text instantly. Choose classic Lorem Ipsum, tech, business or casual styles. Generate paragraphs, sentences, words or lists with short, medium or long sentences and optional HTML output. Free lorem ipsum generator, no signup.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans','TOOLBEANS','TOOL BEANS',
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
    'lorem ipsum list generator',
    'lorem ipsum ul ol html',
    'lorem ipsum generator free no signup',
    'placeholder text for design',
    'dummy paragraph generator online',
    'lorem ipsum bullet list',
    'generate filler text for website',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/lorem-ipsum' },
  openGraph: {
    title: 'Free Lorem Ipsum Generator Classic, Tech, Business Styles | TOOLBeans',
    description:
      'Generate Lorem Ipsum placeholder text in classic, tech, business or casual styles. Paragraphs, sentences, words or lists with optional HTML wrapping. Free, instant.',
    url: 'https://toolbeans.com/tools/lorem-ipsum',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Lorem Ipsum Generator TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Lorem Ipsum Generator Classic, Tech, Business, Casual | TOOLBeans',
    description: 'Generate placeholder text in four styles as paragraphs, sentences, words or lists. Short/medium/long sentences, optional HTML. Free, instant, in-browser.',
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
        { '@type': 'ListItem', position: 3, name: 'Lorem Ipsum Generator', item: 'https://toolbeans.com/tools/lorem-ipsum' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Lorem Ipsum Generator TOOLBeans',
      url: 'https://toolbeans.com/tools/lorem-ipsum',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Any web browser',
      description: 'Free online Lorem Ipsum and placeholder text generator. Produce classic Lorem Ipsum or tech, business and casual styles as paragraphs, sentences, words or lists, with short, medium or long sentences and optional HTML wrapping. Runs entirely in the browser.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Classic Lorem Ipsum plus tech, business and casual styles',
        'Generate paragraphs, sentences, words or lists',
        'Ordered and unordered list output',
        'Short, medium or long sentence length',
        'Optional HTML output with selectable tags',
        'Start with the classic Lorem ipsum opening',
        'Live word and character counts',
        'Copy to clipboard and download as .txt',
        'Runs entirely in the browser, no signup',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is Lorem Ipsum?', acceptedAnswer: { '@type': 'Answer', text: 'Lorem Ipsum is placeholder or dummy text used in design and publishing to fill a layout before the real content is ready. It is based on scrambled Latin so the words have no meaning and do not distract from the visual design.' } },
        { '@type': 'Question', name: 'Is this Lorem Ipsum generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It is completely free with no signup and no limits, and it runs entirely in your browser.' } },
        { '@type': 'Question', name: 'Can I generate Lorem Ipsum as an HTML list?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Choose the List unit and turn on HTML output to get a ready-to-paste unordered (ul) or ordered (ol) list with li items. With HTML off you get a plain bullet or numbered list.' } },
        { '@type': 'Question', name: 'Can I control how long the sentences are?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The sentence length control offers Short, Medium and Long, which changes how many words each generated sentence contains so the placeholder matches the density of your real content.' } },
        { '@type': 'Question', name: 'What is the difference between the styles?', acceptedAnswer: { '@type': 'Answer', text: 'Classic is traditional Latin Lorem Ipsum. Tech uses developer terminology, Business uses corporate language, and Casual uses natural everyday words. The non-Latin styles make UI mockups and decks feel more realistic.' } },
        { '@type': 'Question', name: 'Can I copy the generated text or download it?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use Copy to put the text on your clipboard, or download it as a .txt file. You can also regenerate to get a fresh batch with the same settings.' } },
      ],
    },
  ],
};

export default function LoremIpsumPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LoremIpsumTool />
    </>
  );
}