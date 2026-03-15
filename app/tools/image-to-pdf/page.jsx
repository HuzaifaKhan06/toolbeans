// app/tools/image-to-pdf/page.jsx
import ImageToPdfTool from '@/tools/ImageToPdfTool';

export const metadata = {
  title: 'Image to PDF Converter Free — JPG PNG WebP GIF BMP SVG, No Upload',
  description:
    'Convert any image to PDF free online. JPG, PNG, WebP, GIF, BMP and SVG supported. No upload — 100% browser-based. Combine multiple images into one PDF. Zero quality loss. No watermark, no signup.',
  keywords: [
    'image to pdf',
    'image to pdf converter',
    'convert image to pdf',
    'jpg png to pdf',
    'webp to pdf',
    'gif to pdf',
    'bmp to pdf',
    'svg to pdf converter',
    'multiple images to pdf',
    'image to pdf free online',
    'image to pdf no upload',
    'pictures to pdf converter',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/image-to-pdf' },
  openGraph: {
    title: 'Image to PDF Converter — JPG, PNG, WebP, GIF, BMP, SVG — Free',
    description:
      'Convert any image format to PDF in your browser. JPG, PNG, WebP, GIF, BMP, SVG all supported. Combine multiple images. Zero quality loss. No server upload.',
    url: 'https://toolbeans.com/tools/image-to-pdf',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',          item: 'https://toolbeans.com'                    },
        { '@type': 'ListItem', position: 2, name: 'Tools',         item: 'https://toolbeans.com/tools'              },
        { '@type': 'ListItem', position: 3, name: 'Image to PDF',  item: 'https://toolbeans.com/tools/image-to-pdf' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Image to PDF Converter',
      url: 'https://toolbeans.com/tools/image-to-pdf',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      description:
        'Free browser-based image to PDF converter supporting JPG, PNG, WebP, GIF, BMP and SVG. Pixel-perfect quality for JPG and PNG via direct byte embedding. No upload, no server, no watermark.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'JPG, PNG, WebP, GIF, BMP, SVG to PDF',
        'Pixel-perfect JPG and PNG embedding',
        'Combine multiple images into one PDF',
        'A4, A3, Letter, Legal, Fit Image page sizes',
        'Portrait and landscape orientation',
        'Adjustable margins',
        'Progress bar for multi-image conversion',
        'Format badge per image in preview',
        'Drag and drop upload',
        'Reorder images before converting',
        'No watermark, no signup, no file size limit',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What image formats can I convert to PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'JPG, JPEG, PNG, WebP, GIF, BMP and SVG are all supported. You can mix different formats in one PDF.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does converting images to PDF reduce quality?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For JPG and PNG files, raw bytes are embedded directly — no re-encoding and zero quality loss. For WebP, GIF, BMP and SVG, a lossless PNG conversion is used before embedding.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are my images uploaded to a server?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All processing happens entirely inside your browser. Your image files never leave your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I combine multiple images into one PDF?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Add as many images as you need. Each becomes one page. Use the arrow buttons to reorder pages before downloading.',
          },
        },
      ],
    },
  ],
};

export default function ImageToPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ImageToPdfTool />
    </>
  );
}