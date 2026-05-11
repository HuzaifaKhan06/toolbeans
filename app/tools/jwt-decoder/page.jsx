// app/tools/jwt-decoder/page.jsx
import JWTTool from '@/tools/JWTTool';

export const metadata = {
  title: 'JWT Decoder What Is JWT, How It Works & Free Online Token Inspector',
  description:
    'JWT stands for JSON Web Token. Learn what JWT means, how JWT authentication works, and decode any JWT token instantly. Free online JWT decoder shows header, payload, expiry countdown and security warnings. Token never leaves your browser.',
  keywords: [
    // Informational — what is jwt cluster
    'what is jwt',
    'what is a jwt',
    'jwt full form',
    'jwt meaning',
    'jwt stands for',
    'what is jwt authentication',
    'how jwt authentication works',
    'jwt auth explained',
    'json web token explained',
    'jwt token meaning',
    // Tool queries
    'online free jwt decoder',
    'free online jwt decoder',
    'jwt decoder free online',
    'jwt decoder online free',
    'jwt decoder',
    'jwt decoder online',
    'decode jwt token online',
    'json web token decoder',
    'jwt token inspector',
    'jwt payload decoder',
    'jwt claims viewer',
    'jwt expiry checker',
    'jwt online tool free',
    'decode jwt header payload',
    // Security queries
    'jwt alg none vulnerability',
    'jwt security best practices',
    'jwt vs session token',
    'jwt bearer token',
    'jwt authentication vs oauth',
    'what is sub in jwt',
    'jwt exp claim explained',
    'jwt iat claim meaning',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/jwt-decoder' },
  openGraph: {
    title: 'JWT Decoder — What Is JWT and How Does It Work? | TOOLBeans',
    description:
      'JWT (JSON Web Token) is the standard for API authentication. Learn what JWT means, decode any token instantly and check expiry and security warnings. Free, 100% private.',
    url: 'https://toolbeans.com/tools/jwt-decoder',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'JWT Decoder — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JWT Decoder — What Is JWT and How Does It Work? | TOOLBeans',
    description: 'Decode JWT tokens instantly. View header, payload, expiry countdown and security warnings. Free, no signup, token never leaves your browser.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'JWT Decoder', item: 'https://toolbeans.com/tools/jwt-decoder' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'JWT Decoder and Inspector — TOOLBeans',
    url: 'https://toolbeans.com/tools/jwt-decoder',
    description:
      'Free online JWT decoder. Paste any JSON Web Token to instantly see the decoded header, payload claims, expiry countdown, algorithm security rating and security warnings. Runs entirely in the browser with no server upload.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Decode JWT header and payload instantly',
      'Live expiry countdown timer',
      'Algorithm security rating (HS256, RS256, ES256, alg:none warning)',
      'Standard claims inspector with explanations (sub, iss, aud, exp, iat, nbf)',
      'Critical security warning for alg:none tokens',
      'Unix timestamp to human-readable date conversion',
      'Export decoded token as formatted JSON',
      'Recent token history',
      'Sample tokens included',
      '100% browser-based, token never sent to any server',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is JWT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JWT stands for JSON Web Token. It is an open standard (RFC 7519) for securely transmitting information between parties as a compact, URL-safe string. A JWT contains digitally signed claims about a user or system, making it the most widely used format for API authentication and authorization in 2026.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does JWT stand for?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JWT stands for JSON Web Token. The full form is JSON Web Token. It is pronounced "jot" and is defined by the IETF standard RFC 7519.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does JWT authentication work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JWT authentication works in three steps. First, the user logs in with credentials and the server verifies them. Second, the server creates a JWT containing the user ID and other claims, signs it with a secret or private key, and returns it to the client. Third, the client sends this JWT in the Authorization header with every subsequent API request. The server verifies the signature and reads the claims without any database lookup.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the three parts of a JWT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A JWT has three Base64URL-encoded parts separated by dots. The Header contains the token type (JWT) and the signing algorithm such as HS256 or RS256. The Payload contains the claims, which are statements about the user including sub (user ID), exp (expiry time), iat (issued at) and any custom data. The Signature is created by signing the header and payload with a secret or private key, which allows the server to verify the token has not been tampered with.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is JWT encrypted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. A standard JWT (technically called JWS, JSON Web Signature) is signed but not encrypted. The payload is Base64URL encoded, which anyone can decode. This means you should never store sensitive data like passwords or credit card numbers in a JWT payload. JWE (JSON Web Encryption) is a separate standard for encrypted tokens.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between HS256 and RS256 in JWT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'HS256 is a symmetric algorithm that uses one shared secret key for both signing and verifying. Both the server that creates the token and the service that verifies it must know the same secret. RS256 is an asymmetric algorithm that uses a private key to sign and a public key to verify. This means verification services never see the private key, making RS256 more secure for distributed systems and microservices.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is alg:none in JWT and why is it dangerous?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Setting the algorithm to "none" in a JWT header means the token has no cryptographic signature. An attacker can create a JWT with any claims they want, set alg to none, and some vulnerable servers will accept it without any verification. This is a critical security vulnerability. Never accept tokens with alg:none in a production server.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is it safe to decode my JWT token in this tool?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The TOOLBeans JWT Decoder runs entirely in your browser using JavaScript. Your token is never sent to any server. The decoding process is completely local to your device, making it safe to use with production tokens and sensitive data.',
        },
      },
    ],
  },
];

export default function JWTDecoderPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <JWTTool />
    </>
  );
}