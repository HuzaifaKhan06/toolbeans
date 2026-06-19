import HashTool from '@/tools/HashTool';

export const metadata = {
  title: 'Hash Generator  Free SHA256, MD5, SHA512 Hash Online',
  description:
    'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashes from text or files online. Includes HMAC-SHA256, correct binary file hashing, hash comparison and algorithm security ratings. Free hash generator runs in your browser.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans', 'TOOLBEANS','TOOL BEANS',
    'hash generator',
    'sha256 generator online',
    'md5 hash generator online',
    'sha512 hash generator',
    'sha256 hash online',
    'hash generator free',
    'generate sha256 hash',
    'online hash calculator',
    'md5 checksum online',
    'sha1 hash generator',
    'crc32 calculator',
    'hmac sha256 generator',
    'file hash generator', 'file checksum sha256', 'verify file checksum online',
    'hash generator online free no signup', 'secure hash generator tool online', 'generate hash online instantly free', 'best online hash generator tool', 'free hash generator without login', 'online hash generator with multiple algorithms',
'sha256 hash generator free online tool fast', 'generate sha256 hash from text online free', 'sha256 hash generator without signup instant', 'secure sha256 hash generator online free', 'sha256 checksum generator online tool', 'sha256 encryption hash generator free',
'md5 hash generator online fast free tool', 'generate md5 hash from string online free', 'md5 checksum generator online without signup', 'secure md5 hash generator free online tool', 'md5 hash calculator instant online free', 'md5 hash encryption tool online',
'sha512 hash generator online free instant', 'generate sha512 hash from text free online tool', 'secure sha512 checksum generator online', 'sha512 encryption hash generator fast free', 'sha512 hash generator without login', 'online sha512 calculator free tool',
'sha1 hash generator online free fast', 'generate sha1 hash from string online tool', 'sha1 checksum calculator free online', 'secure sha1 hash generator no signup', 'sha1 encryption tool free online', 'online sha1 hash calculator instant',
'crc32 hash generator online free tool', 'generate crc32 checksum online free fast', 'crc32 calculator instant free tool online', 'crc32 hash generator without login', 'online crc32 checksum generator free fast', 'crc32 encryption hash tool online',
'hmac sha256 generator online free secure', 'generate hmac sha256 hash online tool', 'hmac sha256 calculator free online fast', 'secure hmac sha256 generator without signup', 'hmac sha256 encryption tool online free', 'online hmac generator instant free',
'convert text to hash online free tool', 'string to hash generator online fast free', 'generate hash from text instantly online', 'text encryption hash generator free online', 'online string hash calculator secure tool', 'hash generator for passwords online free',
'file hash generator online free tool secure', 'generate hash from file online free fast', 'file checksum generator sha256 online free', 'upload file to generate md5 hash online', 'online file hash calculator instant free', 'secure file checksum generator tool',
'compare hash values online free tool', 'verify hash checksum online free fast', 'hash comparison tool online secure free', 'check file integrity using hash online', 'online hash verification tool free', 'validate checksum online sha256 md5 free',
'hash generator developer tool free online', 'online cryptographic hash generator tool', 'generate secure hash for api keys online', 'hash generator for developers free tool', 'multi algorithm hash generator online free', 'advanced hash generator online secure',
'fast hash generator online no registration', 'hash calculator tool online high speed free', 'lightweight hash generator web tool free', 'cloud hash generator secure online free', 'instant hash conversion tool online free', 'simple hash generator tool free online'
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/hash-generator' },
  openGraph: {
    title: 'Free Hash Generator  SHA256, MD5, SHA512 Online | TOOLBeans',
    description:
      'Generate SHA-256, MD5, SHA-512, SHA-1 and CRC32 hashes from text or files. HMAC-SHA256, correct binary file checksums and hash comparison included. Free, private.',
    url: 'https://toolbeans.com/tools/hash-generator',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Hash Generator  TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Hash Generator  SHA256, MD5, SHA512 | TOOLBeans',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashes from text or files. HMAC, file checksums and comparison. Free, private, in-browser.',
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
        { '@type': 'ListItem', position: 3, name: 'Hash Generator', item: 'https://toolbeans.com/tools/hash-generator' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Hash Generator  TOOLBeans',
      url: 'https://toolbeans.com/tools/hash-generator',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Any web browser',
      description: 'Free online hash generator for MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 from text or files. Includes HMAC-SHA256, correct binary file checksums, hash comparison and algorithm security ratings. Runs entirely in the browser with no upload.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashing',
        'Hash any text instantly as you type',
        'Correct binary file checksums (SHA-256, MD5 and more)',
        'HMAC-SHA256 message authentication codes',
        'Compare two hashes to verify a match',
        'Uppercase output toggle',
        'Copy all hashes or download as a text file',
        'Algorithm security ratings and guidance',
        'Runs entirely in browser, nothing uploaded',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is hashing the same as encryption?', acceptedAnswer: { '@type': 'Answer', text: 'No. Hashing is a one-way function: you cannot reverse a hash back to the original input. Encryption is two-way and can be decrypted with a key.' } },
        { '@type': 'Question', name: 'Is the hash generator free and private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It is completely free, and all hashing happens in your browser using the Web Crypto API. Your text and files are never uploaded to any server.' } },
        { '@type': 'Question', name: 'Can I hash a file to verify its checksum?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload any file and the tool reads its raw bytes to compute a correct SHA-256, MD5 or other checksum that matches the value published by software vendors.' } },
        { '@type': 'Question', name: 'Which hash should I use for passwords?', acceptedAnswer: { '@type': 'Answer', text: 'None of these raw hashes on their own. Use a dedicated password hashing algorithm such as bcrypt, Argon2 or scrypt with a salt. MD5 and SHA-1 are insecure for any security purpose.' } },
        { '@type': 'Question', name: 'What is HMAC-SHA256 used for?', acceptedAnswer: { '@type': 'Answer', text: 'HMAC-SHA256 combines a secret key with a message to produce a signature that proves the message was not tampered with. It is widely used for API request signing and webhook verification by services like GitHub and Stripe.' } },
        { '@type': 'Question', name: 'Why do MD5 and SHA-1 show a warning?', acceptedAnswer: { '@type': 'Answer', text: 'Both have known collision attacks, meaning different inputs can be forced to produce the same hash. They are fine for non-security checksums but must not be used for passwords, signatures or security tokens.' } },
      ],
    },
  ],
};

export default function HashGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HashTool />
    </>
  );
}