import JWTTool from '@/tools/JWTTool';

export const metadata = {
  title: 'JWT Decoder Free Online JSON Web Token Decoder and Inspector',
  description:
    'Decode JSON Web Tokens and inspect header, payload and all claims online. Live expiry countdown, security warnings for alg:none, algorithm ratings and a full JWT guide. Free JWT decoder 100% private.',
  keywords: [
    'jwt decoder',
    'jwt decoder online',
    'decode jwt token online',
    'json web token decoder',
    'jwt token inspector',
    'jwt payload decoder',
    'jwt claims viewer',
    'jwt expiry checker',
    'jwt alg none vulnerability',
    'decode jwt header payload',
    'jwt online tool',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/jwt-decoder' },
  openGraph: {
    title: 'Free JWT Decoder Online Inspect JSON Web Tokens | TOOLBeans',
    description:
      'Decode JWT tokens and inspect all claims, expiry countdown and security warnings. Free JWT decoder token never leaves your browser.',
    url: 'https://toolbeans.com/tools/jwt-decoder',
  },
};

export default function JWTDecoderPage() {
  return <JWTTool />;
}