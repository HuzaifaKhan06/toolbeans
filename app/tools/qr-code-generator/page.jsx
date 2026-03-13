import QRTool from '@/tools/QRTool';

export const metadata = {
  title: 'QR Code Generator Free Online QR Code Creator',
  description:
    'Generate QR codes for URLs, text, email, phone, Wi-Fi and more. Download as PNG, SVG or PDF. Custom colors, sizes and error correction levels. Free QR code generator no signup.',
  keywords: [
    'qr code generator',
    'free qr code generator',
    'qr code creator online',
    'generate qr code',
    'qr code maker',
    'custom qr code generator',
    'qr code download png',
    'qr code for url',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/qr-code-generator' },
  openGraph: {
    title: 'Free QR Code Generator PNG, SVG, PDF Download | TOOLBeans',
    description:
      'Create QR codes for any URL, text, email or phone number. Download as PNG, SVG or PDF. Custom colors and sizes. Completely free.',
    url: 'https://toolbeans.com/tools/qr-code-generator',
  },
};

export default function QRCodeGeneratorPage() {
  return <QRTool />;
}