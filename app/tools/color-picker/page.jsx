import ColorPickerTool from '@/tools/ColorPickerTool';

export const metadata = {
  title: 'Color Picker & Palette Generator — HEX, RGB, HSL, CMYK Online Free',
  description:
    'Free online color picker with HEX, RGB, HSL, HSV and CMYK values. Auto-generates 7 color palettes — complementary, analogous, triadic, monochromatic and more. WCAG accessibility checker, tints & shades scale, CSS variables export. No signup.',
  keywords: [
    'Free online color picker',
    'color pallet',
    'free color pallet',
    'color picker',
    'color picker online',
    'color palette generator',
    'hex color picker',
    'rgb color picker',
    'hsl color picker',
    'color converter',
    'hex to rgb',
    'rgb to hex',
    'color palette',
    'complementary colors',
    'color wheel',
    'color scheme generator',
    'wcag contrast checker',
    'css color picker',
    'tailwind color generator',
    'color code picker',
    'color harmony generator',
  ],
  alternates: { canonical: 'https://toolbeans.com/tools/color-picker' },
  openGraph: {
    title: 'Free Color Picker & Palette Generator — HEX, RGB, HSL, CMYK | TOOLBeans',
    description:
      'Pick any color and get HEX, RGB, HSL, CMYK values instantly. Auto-generates 7 harmony palettes with CSS export. WCAG accessibility checker included. Free.',
    url: 'https://toolbeans.com/tools/color-picker',
  },
};

export default function ColorPickerPage() {
  return <ColorPickerTool />;
}