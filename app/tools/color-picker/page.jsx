// app/tools/color-picker/page.jsx
import ColorPickerTool from '@/tools/ColorPickerTool';

export const metadata = {
  title: 'Free Color Picker and Palette Generator — HEX, RGB, HSL, CMYK Online',
  description:
    'Free online color picker with instant HEX, RGB, HSL, HSV and CMYK values. Auto-generates 7 harmony palettes including complementary, analogous, triadic and monochromatic. Browse 200 plus curated palettes. WCAG accessibility contrast checker. Tints and shades scale with CSS and Tailwind export. No signup.',
  keywords: [
    'color picker online free',
    'color palette generator free',
    'hex color picker online',
    'rgb to hex converter',
    'hex to rgb converter',
    'hsl color converter free',
    'cmyk color converter online',
    'complementary color generator',
    'analogous color palette',
    'triadic color scheme',
    'monochromatic palette generator',
    'wcag contrast checker free',
    'color accessibility checker',
    'tailwind color generator',
    'css color variables generator',
    'tints and shades generator',
    'color harmony generator',
    'website color palette creator',
    'color scheme picker 2026',
    'color converter hex rgb hsl cmyk',
    'free color palette tool no signup',
  ],
  authors: [{ name: 'TOOLBeans' }],
  alternates: { canonical: 'https://toolbeans.com/tools/color-picker' },
  openGraph: {
    title: 'Free Color Picker and Palette Generator — HEX, RGB, HSL, CMYK | TOOLBeans',
    description:
      'Pick any color and get HEX, RGB, HSL, CMYK values instantly. Auto-generates 7 harmony palettes plus 200 curated palettes. WCAG accessibility checker included. Free, no signup.',
    url: 'https://toolbeans.com/tools/color-picker',
    siteName: 'TOOLBeans',
    type: 'website',
    images: [{ url: 'https://toolbeans.com/og-image.png', width: 1200, height: 630, alt: 'Color Picker and Palette Generator — TOOLBeans' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Color Picker and Palette Generator | TOOLBeans',
    description: 'HEX, RGB, HSL, CMYK values plus 7 auto-generated palettes and 200 curated schemes. WCAG contrast checker. Free, no signup.',
    images: ['https://toolbeans.com/og-image.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',      item: 'https://toolbeans.com' },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: 'https://toolbeans.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Color Picker', item: 'https://toolbeans.com/tools/color-picker' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Color Picker and Palette Generator — TOOLBeans',
    url: 'https://toolbeans.com/tools/color-picker',
    description: 'Free online color picker with HEX, RGB, HSL, HSV and CMYK values. Auto-generates complementary, analogous, triadic and monochromatic palettes. WCAG accessibility checker. 200 plus curated palettes across 30 categories.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@type': 'Organization', name: 'TOOLBeans', url: 'https://toolbeans.com' },
    featureList: [
      'Native color picker with HSL sliders',
      'HEX, RGB, HSL, HSV and CMYK color values',
      'One-click copy for all color formats',
      'Complementary color palette',
      'Analogous color palette',
      'Triadic color palette',
      'Split-complementary palette',
      'Tetradic color palette',
      'Monochromatic palette',
      'Tints and shades scale',
      'WCAG AA and AAA contrast checker',
      '200 plus curated palettes in 30 categories',
      'CSS variables export',
      'Tailwind config export',
      'Named CSS color reference',
      'Save and recall colors',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is the color picker free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. The TOOLBeans Color Picker is completely free with no usage limits. No account, no signup and no credit card required.' },
      },
      {
        '@type': 'Question',
        name: 'What color formats does the tool support?',
        acceptedAnswer: { '@type': 'Answer', text: 'The tool provides HEX, RGB, HSL, HSV and CMYK values for any color you pick. All values are copyable with one click.' },
      },
      {
        '@type': 'Question',
        name: 'What is the WCAG contrast checker used for?',
        acceptedAnswer: { '@type': 'Answer', text: 'The WCAG contrast checker verifies whether your chosen color meets Web Content Accessibility Guidelines for text readability. It checks both white and black text against your color and shows whether it passes at AA or AAA level, which is required for accessible web design.' },
      },
      {
        '@type': 'Question',
        name: 'What color palettes does the tool generate automatically?',
        acceptedAnswer: { '@type': 'Answer', text: 'From any chosen color, the tool automatically generates 7 harmony palettes: complementary, analogous, triadic, split-complementary, tetradic, monochromatic and a tints and shades scale. Each palette includes a CSS variables export and Tailwind config snippet.' },
      },
      {
        '@type': 'Question',
        name: 'How do I export color palettes for use in code?',
        acceptedAnswer: { '@type': 'Answer', text: 'Each palette has a Copy CSS button that exports the colors as CSS custom properties and a Tailwind config button that exports the color scale in the format used by tailwind.config.js. Both are ready to paste directly into your project.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between HEX, RGB and HSL?',
        acceptedAnswer: { '@type': 'Answer', text: 'HEX is a six-character hexadecimal code like #6366f1, most common in web development. RGB splits the color into red, green and blue channels from 0 to 255. HSL uses hue (the color itself, 0 to 360 degrees), saturation (0 to 100 percent) and lightness (0 to 100 percent), which is more intuitive for adjusting colors.' },
      },
    ],
  },
];

export default function ColorPickerPage() {
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ColorPickerTool />
    </>
  );
}