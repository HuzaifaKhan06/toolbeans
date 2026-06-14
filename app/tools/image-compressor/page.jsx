// app/tools/image-compressor/page.jsx
import ImageCompressorTool from '@/tools/ImageCompressorTool';

export const metadata = {
  title: 'Image Compressor  Compress JPG, PNG & WebP to Exact KB Size Free',
  description:
    'Free online image compressor. Compress JPG, PNG, WebP and more to an exact target size in KB, or by a percentage, while keeping maximum quality and full resolution. Before-and-after preview, multiple files, no signup. Runs 100% in your browser  images never leave your device.',
  keywords: [
    'toolbeans','tool beans','ToolBeans','Tool Beans', 'TOOLBEANS','TOOL BEANS',
    'image compressor', 'compress image online', 'image compressor online free',
    'compress jpg', 'compress png', 'compress webp', 'compress image to kb',
    'compress image to exact size', 'reduce image size in kb', 'compress photo online',
    'image size reducer', 'compress image to 50kb', 'compress image to 100kb',
    'compress image to 20kb', 'compress image without losing quality',
    'reduce image file size', 'jpg compressor', 'png compressor', 'webp compressor',
    'online image optimizer', 'compress picture online free', 'shrink image size',
    'image compression tool', 'compress image by percentage', 'bulk image compressor',
    'compress multiple images', 'photo size reducer online', 'image compressor no signup',
    'compress image in browser', 'free image compressor 2026', 'reduce photo size kb',
    'compress image keep quality', 'image to target size compressor',
    'compress images for web', 'optimize images online free', 'lightweight image compressor',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/image-compressor' },
  openGraph: {
    title: 'Free Image Compressor  Compress JPG, PNG, WebP to Exact KB | TOOLBeans',
    description:
      'Compress images to an exact KB size or by percentage while keeping maximum quality. Before-and-after preview, multiple files, fully private. No upload, no signup.',
    url: 'https://toolbeans.com/tools/image-compressor',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Image Compressor  TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Compressor  Compress to Exact KB | TOOLBeans',
    description: 'Compress JPG, PNG and WebP to an exact size in KB or by percentage. Maximum quality, full resolution, before/after preview. Free, private, no install.',
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
        { '@type': 'ListItem', position: 3, name: 'Image Compressor', item: 'https://toolbeans.com/tools/image-compressor' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Image Compressor  TOOLBeans',
      url: 'https://toolbeans.com/tools/image-compressor',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any web browser',
      description: 'Free online image compressor that compresses JPG, PNG and WebP images to an exact target size in KB or by a percentage while preserving maximum quality and full resolution. Runs entirely in the browser with no upload.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Compress JPG, PNG and WebP images',
        'online free image compressor',
        'free online image compressor',
        'online image compressor',
        'free image compressor',
        'toolbeans image compressor',
        'image compressor toolbeans',
        'Compress to an exact target size in KB',
        'Compress by a chosen percentage',
        'Manual quality slider mode',
        'Keeps full image resolution',
        'Before and after preview with size saved',
        'Convert between JPEG, WebP and PNG',
        'Compress multiple images at once',
        'Download individually or all together',
        'Runs entirely in browser, nothing uploaded',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Is the image compressor free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The TOOLBeans Image Compressor is completely free with no usage limits, no account and no signup required.' } },
        { '@type': 'Question', name: 'Are my images uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All compression runs entirely in your browser using the Canvas API. Your images never leave your device and are never sent to any server.' } },
        { '@type': 'Question', name: 'Can I compress an image to an exact size in KB?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter a target size in kilobytes and the tool automatically searches for the highest quality setting that produces a file at or just under that size, getting as close to the target as the format allows.' } },
        { '@type': 'Question', name: 'Will compressing reduce my image quality?', acceptedAnswer: { '@type': 'Answer', text: 'Any reduction in file size involves some quality trade-off, since that is how compression works. The tool keeps the full resolution and chooses the best quality that meets your target, and the before-and-after preview lets you see the result before downloading.' } },
        { '@type': 'Question', name: 'Which image formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'You can compress JPG/JPEG, PNG and WebP images. You can also convert between these formats, for example turning a large PNG into a much smaller WebP or JPEG.' } },
        { '@type': 'Question', name: 'Can I compress more than one image at a time?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Add several images to the queue and the tool compresses each with your chosen settings, then lets you download them one by one or all at once.' } },
      ],
    },
  ],
};

export default function ImageCompressorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ImageCompressorTool />
    </>
  );
}