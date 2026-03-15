// app/tools/html-to-pdf/page.jsx
import HtmlToPdfTool from '@/tools/HtmlToPdfTool';

export const metadata = {
  title: 'HTML to PDF Converter Free Online Native Browser Render, No Upload',
  description:
    'Convert HTML to PDF free online. Full CSS, web fonts, tables and images preserved. Uses your browser\'s native print engine best HTML-to-PDF quality possible. No upload, no server, no signup.',
  keywords: [
    'html to pdf',
    'html to pdf converter',
    'convert html to pdf',
    'html file to pdf',
    'html to pdf free',
    'html to pdf online',
    'html to pdf no upload',
    'webpage to pdf',
    'html to pdf converter free online',
    'convert html file to pdf',
    'html to pdf with css',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/html-to-pdf' },
  openGraph: {
    title: 'HTML to PDF Converter Full CSS, Native Browser Render, Free',
    description:
      'Convert HTML to PDF in your browser. All CSS, web fonts, tables and images preserved. Uses browser native print engine. No server upload. Free.',
    url: 'https://toolbeans.com/tools/html-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://toolbeans.com'                    },
        { '@type': 'ListItem', position: 2, name: 'Tools',       item: 'https://toolbeans.com/tools'              },
        { '@type': 'ListItem', position: 3, name: 'HTML to PDF', item: 'https://toolbeans.com/tools/html-to-pdf'  },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'HTML to PDF Converter',
      url: 'https://toolbeans.com/tools/html-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free browser-based HTML to PDF converter using the browser\'s native print engine. Full CSS support including Grid, Flexbox, web fonts. Upload .html files or paste HTML. Live preview. No upload, no server.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Upload .html / .htm files or paste HTML',
        'Native browser print engine full CSS support',
        'Web fonts, Grid, Flexbox, gradients preserved',
        'Live preview before converting',
        'A4, A3, Letter, Legal page sizes',
        'Portrait and landscape orientation',
        'None, Narrow, Normal, Wide margins',
        'Zoom 75% to 125%',
        'Background color control',
        'Sample HTML for testing',
        'No upload, no server, no watermark',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does this HTML to PDF converter support CSS?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes fully. It uses your browser\'s native print engine which supports all CSS including Grid, Flexbox, CSS variables, web fonts, gradients and shadows.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save the PDF after clicking Convert?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Your browser\'s print dialog opens. In the Destination dropdown, select "Save as PDF" (Chrome/Edge) or "PDF" (Firefox/Safari), then click Save.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are my HTML files uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. The HTML is processed entirely in your browser using an iframe and the browser print API. Your files never leave your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert HTML with external CSS and images?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The HTML renders inside an iframe using your browser any external resources the HTML references (CSS files, images, fonts) will load if they are accessible online.',
          },
        },
      ],
    },
  ],
};

export default function HtmlToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HtmlToPdfTool />
    </>
  );
}