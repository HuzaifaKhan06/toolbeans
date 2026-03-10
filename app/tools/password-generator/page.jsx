import PasswordTool from '@/tools/PasswordTool';

export const metadata = {
  title: 'Password Generator — Free Strong Password Generator Online',
  description:
    'Generate strong, secure, random passwords instantly. Choose length, uppercase, lowercase, numbers and symbols. Cryptographically secure using Web Crypto API. Free, private, no signup required.',
  keywords: [
    'password generator',
    'strong password generator',
    'random password generator online',
    'secure password generator',
    'password strength checker',
    'generate secure password',
    'free password generator',
    'crypto random password',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/password-generator' },
  openGraph: {
    title: 'Free Password Generator — Strong Random Passwords | TOOLBeans',
    description:
      'Generate cryptographically secure passwords with custom length and character types. Free online password generator — no signup required.',
    url: 'https://toolbeans.com/tools/password-generator',
  },
};

export default function PasswordGeneratorPage() {
  return <PasswordTool />;
}