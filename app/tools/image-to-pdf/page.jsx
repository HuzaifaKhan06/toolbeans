// app/tools/image-to-pdf/page.jsx
import ImageToPdfTool from '@/tools/ImageToPdfTool';

export const metadata = {
  title: 'Image to PDF Converter Free | Combine Multiple Images into One PDF Online',
  description:
    'Create a PDF from multiple images free online. Combine JPG, PNG, WebP, GIF, BMP and SVG files into one PDF in seconds. Rotate sideways scans, reorder pages. No upload, no signup, no watermark. Works entirely in your browser. JPG to PDF maker with zero quality loss.',
  keywords: [
    // High-impression keywords from Search Console
    'create pdf out of images',
    'jpg to pdf maker',
    'multiple image to pdf',
    'combine image files to pdf',
    'combine image files into pdf',
    'create pdf from multiple images',
    'many images to pdf',
    'combine pic to pdf',
    'creating pdf from images',
    'how to make a pdf file with pictures',
    // Existing strong keywords
    'image to pdf',
    'image to pdf converter',
    'convert image to pdf',
    'image to pdf free online',
    'image to pdf no upload',
    'pictures to pdf converter',
    // Format specific
    'jpg to pdf free online',
    'png to pdf converter free',
    'webp to pdf',
    'gif to pdf',
    'bmp to pdf',
    'svg to pdf converter',
    // Action keywords
    'combine images into one pdf free',
    'merge photos into pdf',
    'convert photos to pdf document',
    'make pdf from photos free',
    'photo to pdf converter online free',
    'scan photos to pdf online free',
    'how to combine jpg files into pdf',
    'batch image to pdf converter',
    'rotate image in pdf',
    'rotate scanned image to pdf',
    'reorder images in pdf',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/image-to-pdf' },
  openGraph: {
    title: 'Image to PDF Converter — Combine Multiple Images into One PDF Free | TOOLBeans',
    description:
      'Create a PDF from multiple images free. JPG, PNG, WebP, GIF, BMP and SVG supported. Rotate sideways scans, reorder pages, combine any number of images into one PDF with zero quality loss. No upload, no signup.',
    url: 'https://toolbeans.com/tools/image-to-pdf',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Image to PDF Converter — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image to PDF Free — Combine Multiple Images into One PDF | TOOLBeans',
    description: 'JPG, PNG, WebP, GIF, BMP, SVG to PDF. Rotate and reorder pages. No upload, no watermark, zero quality loss. Free online jpg to pdf maker.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://toolbeans.com'                    },
      { '@type': 'ListItem', position: 2, name: 'All Tools',    item: 'https://toolbeans.com/tools'              },
      { '@type': 'ListItem', position: 3, name: 'Image to PDF', item: 'https://toolbeans.com/tools/image-to-pdf' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Image to PDF Converter — Combine Multiple Images into One PDF',
    url: 'https://toolbeans.com/tools/image-to-pdf',
    description:
      'Free browser-based tool to create PDF from multiple images. Supports JPG, PNG, WebP, GIF, BMP and SVG. Rotate sideways scans, reorder pages, and combine any number of images into one multi-page PDF with pixel-perfect quality. No file upload, no server, no watermark.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Create PDF from multiple images in one step',
      'Combine JPG, PNG, WebP, GIF, BMP and SVG into one PDF',
      'Mix different image formats in the same PDF',
      'Rotate individual images in 90° steps',
      'Reverse the page order in one click',
      'Pixel-perfect JPG and PNG embedding with zero re-encoding',
      'Lossless PNG conversion for WebP, GIF, BMP, SVG and rotated images',
      'A4, A3, Letter, Legal and Fit Image page sizes',
      'Portrait and landscape orientation',
      'Adjustable margins: none, small, medium, large',
      'Image fit options: fit to page, fill page, original size',
      'Drag and drop upload with multi-file support',
      'Reorder images before generating PDF',
      'Progress bar for large batches',
      'No file upload, no server, no watermark, no signup',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I create a PDF from multiple images?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload all your images by clicking the upload area or dragging them in. You can add JPG, PNG, WebP, GIF, BMP and SVG files. Drag to reorder them if needed. Each image becomes one page in the PDF. Click Convert to PDF and the file downloads instantly. No signup required.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I combine multiple image files into one PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Add all the images you want to combine using the upload area. You can upload as many images as you need in one go. Use the arrow buttons to set the page order. Click Convert to PDF and all images are combined into a single PDF file with one image per page.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I rotate an image before adding it to the PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Each thumbnail has rotate-left and rotate-right buttons that turn the image in 90 degree steps, which is ideal for phone photos or scans that came out sideways. Rotation is applied losslessly when the PDF is generated, and images you do not rotate keep their original pixel-perfect embedding.',
        },
      },
      {
        '@type': 'Question',
        name: 'What image formats can I convert to PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'JPG, JPEG, PNG, WebP, GIF, BMP and SVG are all supported. You can mix different formats in the same PDF. For example, you can combine a JPG photo, a PNG screenshot and a WebP diagram into a single PDF document.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does converting images to PDF reduce image quality?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For JPG and PNG files, the raw image bytes are embedded directly into the PDF with no re-encoding. This means zero quality loss and the image in the PDF is identical to the original file. For WebP, GIF, BMP and SVG, a lossless PNG conversion is used before embedding, which preserves as much quality as technically possible.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are my images uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All processing happens entirely inside your browser using JavaScript. Your image files never leave your device and are never sent to any server. This makes the tool safe for private photos, confidential screenshots and sensitive documents.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I make a PDF file with pictures on my phone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Open toolbeans.com/tools/image-to-pdf in your mobile browser. Tap the upload area and select your photos from the camera roll. Arrange them in order and tap Convert to PDF. The PDF downloads to your device. No app download needed.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I convert scanned images to PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. If you have scanned your documents as JPG or PNG images using a scanner or your phone camera, you can upload those image files and convert them into a properly ordered PDF document. This is useful for creating PDF versions of multi-page forms, contracts or handwritten notes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a limit on how many images I can combine into one PDF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'There is no enforced limit. You can combine as many images as you need into one PDF. For very large batches of high-resolution images, processing may take longer depending on your device. The progress bar tracks each image as it converts.',
        },
      },
    ],
  },
];

export default function ImageToPdfPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ImageToPdfTool />
    </>
  );
}