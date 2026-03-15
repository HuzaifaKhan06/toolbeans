// app/tools/powerpoint-to-pdf/page.jsx
import PowerPointToPdfTool from '@/tools/PowerPointToPdfTool';

export const metadata = {
  title: 'PowerPoint to PDF Converter Free Online .pptx to PDF, No Signup',
  description: 'Convert PowerPoint .pptx and .ppt presentations to PDF free. Every slide becomes a PDF page. Backgrounds, images and layouts preserved. No signup, no watermark.',
  keywords: ['powerpoint to pdf','pptx to pdf','convert powerpoint to pdf free','ppt to pdf','powerpoint to pdf online','presentation to pdf','pptx to pdf converter'],
  alternates: { canonical: 'https://toolbeans.com/tools/powerpoint-to-pdf' },
  openGraph: {
    title: 'PowerPoint to PDF Converter Free, Every Slide Preserved',
    description: 'Convert PowerPoint presentations to PDF. Every slide becomes a PDF page. Powered by LibreOffice. Free.',
    url: 'https://toolbeans.com/tools/powerpoint-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',              item: 'https://toolbeans.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools',             item: 'https://toolbeans.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'PowerPoint to PDF', item: 'https://toolbeans.com/tools/powerpoint-to-pdf' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'PowerPoint to PDF Converter',
      url: 'https://toolbeans.com/tools/powerpoint-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: 'Free PowerPoint to PDF converter. Each slide becomes one PDF page. Backgrounds, images, shapes and text preserved.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: ['.pptx and .ppt to PDF','Each slide = one PDF page','Backgrounds and images preserved','Shapes and text preserved','No watermark','Files deleted after conversion'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Does each slide become a PDF page?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every slide in your presentation becomes exactly one page in the PDF in the same order.' } },
        { '@type': 'Question', name: 'Are animations preserved?', acceptedAnswer: { '@type': 'Answer', text: 'No. Animations are converted to their final static state. The PDF shows each slide as it would appear without animation.' } },
        { '@type': 'Question', name: 'Is my file stored on your server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Your file is deleted immediately after your PDF downloads.' } },
      ],
    },
  ],
};

export default function PowerPointToPdfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PowerPointToPdfTool />
    </>
  );
}