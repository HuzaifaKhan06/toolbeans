import PasswordTool from '@/tools/PasswordTool';

export const metadata = {
  title: 'Password Generator Free Strong Password & Passphrase Generator Online',
  description:
    'Generate strong, secure, random passwords and memorable passphrases instantly. Choose length, uppercase, lowercase, numbers, symbols, exclude ambiguous characters. Cryptographically secure using the Web Crypto API. Free, private, no signup.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans','TOOLBEANS','TOOL BEANS',
    'password generator',
    'strong password generator',
    'random password generator online',
    'secure password generator',
    'password strength checker',
    'generate secure password',
    'free password generator',
    'crypto random password',
    'passphrase generator',
    'memorable password generator',
    'password generator no ambiguous characters',
    'password generator free no signup',
    'strong random password online',
    'how strong is my password',
    'password crack time estimate',
    'random passphrase generator online',
    'secure password generator web crypto',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/password-generator' },
  openGraph: {
    title: 'Free Password Generator Strong Random Passwords & Passphrases | TOOLBeans',
    description:
      'Generate cryptographically secure passwords or memorable passphrases with custom length and character types. Free online password generator, no signup, nothing leaves your browser.',
    url: 'https://toolbeans.com/tools/password-generator',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Password Generator TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Strong Password & Passphrase Generator | TOOLBeans',
    description: 'Cryptographically secure passwords and memorable passphrases. Custom length, character types, exclude ambiguous chars, strength meter. Free, private, in-browser.',
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
        { '@type': 'ListItem', position: 3, name: 'Password Generator', item: 'https://toolbeans.com/tools/password-generator' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Password Generator TOOLBeans',
      url: 'https://toolbeans.com/tools/password-generator',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any web browser',
      description: 'Free online password generator. Create cryptographically secure random passwords or memorable passphrases using the Web Crypto API. Choose length, character types, exclude ambiguous characters, and see a live strength meter and crack-time estimate. Runs entirely in the browser with nothing sent to any server.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Cryptographically secure generation via Web Crypto API',
        'Random character passwords with custom length',
        'Memorable passphrase mode with word count and separators',
        'Choose uppercase, lowercase, numbers and symbols',
        'Exclude ambiguous characters (0, O, l, 1, I)',
        'Guaranteed at least one of each selected character type',
        'Live strength meter and crack-time estimate',
        'One-click copy and session history',
        'Runs entirely in the browser, nothing uploaded',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is this password generator safe to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Passwords are generated entirely in your browser using the Web Crypto API, the same cryptographically secure randomness standard used by security software. Nothing is ever sent to a server or stored anywhere.' } },
        { '@type': 'Question', name: 'How long should my password be?', acceptedAnswer: { '@type': 'Answer', text: 'Use at least 12 characters for everyday accounts and 16 or more for anything sensitive such as email, banking and password managers. Longer passwords are exponentially harder to crack.' } },
        { '@type': 'Question', name: 'What is a passphrase and is it secure?', acceptedAnswer: { '@type': 'Answer', text: 'A passphrase is a password made of several random words, such as river-tiger-amber-stone. It is easier to remember than a random string and, when it uses enough random words, is just as hard to guess. This tool can generate passphrases with your chosen word count, separator and an optional number.' } },
        { '@type': 'Question', name: 'What does Exclude Ambiguous Characters do?', acceptedAnswer: { '@type': 'Answer', text: 'It removes characters that look alike, specifically 0, O, l, 1 and I, so the password is easier to read and type correctly from a screen or printout without confusion.' } },
        { '@type': 'Question', name: 'Should I use symbols in my password?', acceptedAnswer: { '@type': 'Answer', text: 'Symbols increase the character space and make a password harder to crack, so enable them when a site allows it. If a site rejects certain symbols, a longer password with letters and numbers is still strong.' } },
        { '@type': 'Question', name: 'Are the generated passwords stored anywhere?', acceptedAnswer: { '@type': 'Answer', text: 'No. The session history is kept only in memory while the page is open and is never saved to disk or sent anywhere. Closing or refreshing the page clears it.' } },
      ],
    },
  ],
};

export default function PasswordGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PasswordTool />
    </>
  );
}