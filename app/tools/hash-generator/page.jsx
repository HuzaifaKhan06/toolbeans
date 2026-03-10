import HashTool from '@/tools/HashTool';

export const metadata = {
  title: 'Hash Generator — Free SHA256, MD5, SHA512 Hash Online',
  description:
    'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 hashes from text or files online. Includes HMAC-SHA256, hash comparison and algorithm security ratings. Free hash generator — runs in browser.',
  keywords: [
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
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/hash-generator' },
  openGraph: {
    title: 'Free Hash Generator — SHA256, MD5, SHA512 Online | TOOLBeans',
    description:
      'Generate SHA-256, MD5, SHA-512, SHA-1 and CRC32 hashes from text or files. HMAC-SHA256 and hash comparison included. Free, private.',
    url: 'https://toolbeans.com/tools/hash-generator',
  },
};

export default function HashGeneratorPage() {
  return <HashTool />;
}