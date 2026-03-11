'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ── Color Math ─────────────────────────────────────────────
const hexToRgb = (hex) => {
  const clean = hex.replace('#', '');
  const full  = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
};

const hslToRgb = (h, s, l) => {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0)*255), g: Math.round(f(8)*255), b: Math.round(f(4)*255) };
};

const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g-b)/d % 6) * 60; break;
      case g: h = ((b-r)/d + 2) * 60; break;
      default: h = ((r-g)/d + 4) * 60;
    }
  }
  return { h: Math.round(h < 0 ? h+360 : h), s: Math.round(max === 0 ? 0 : (d/max)*100), v: Math.round(max*100) };
};

const rgbToCmyk = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r,g,b);
  if (k === 1) return { c:0, m:0, y:0, k:100 };
  return {
    c: Math.round(((1-r-k)/(1-k))*100),
    m: Math.round(((1-g-k)/(1-k))*100),
    y: Math.round(((1-b-k)/(1-k))*100),
    k: Math.round(k*100),
  };
};

const getLuminance = (r, g, b) => {
  const srgb = [r,g,b].map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
};

const getContrastRatio = (hex1, hex2) => {
  const {r:r1,g:g1,b:b1} = hexToRgb(hex1);
  const {r:r2,g:g2,b:b2} = hexToRgb(hex2);
  const l1 = getLuminance(r1,g1,b1), l2 = getLuminance(r2,g2,b2);
  const lighter = Math.max(l1,l2), darker = Math.min(l1,l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
};

const getTextColor = (hex) => {
  const {r,g,b} = hexToRgb(hex);
  return getLuminance(r,g,b) > 0.179 ? '#1e293b' : '#ffffff';
};

// Darken / Lighten
const adjustHsl = (hex, dH=0, dS=0, dL=0) => {
  const {r,g,b} = hexToRgb(hex);
  const {h,s,l} = rgbToHsl(r,g,b);
  const nh = (h+dH+360)%360, ns = Math.max(0,Math.min(100,s+dS)), nl = Math.max(0,Math.min(100,l+dL));
  const {r:nr,g:ng,b:nb} = hslToRgb(nh,ns,nl);
  return rgbToHex(nr,ng,nb);
};

// ── Palette Generators ─────────────────────────────────────
const generatePalettes = (hex) => {
  const {r,g,b} = hexToRgb(hex);
  const {h,s,l} = rgbToHsl(r,g,b);

  const mkHex = (hh,ss,ll) => {
    const {r:nr,g:ng,b:nb} = hslToRgb((hh+360)%360, Math.max(0,Math.min(100,ss)), Math.max(5,Math.min(95,ll)));
    return rgbToHex(nr,ng,nb);
  };

  return {
    complementary: {
      name: 'Complementary',
      desc: 'Opposite on the color wheel — high contrast, energetic',
      colors: [
        adjustHsl(hex,0,0,-20),
        hex,
        adjustHsl(hex,0,0,20),
        mkHex(h+180,s,l),
        mkHex(h+180,s,l-15),
      ],
    },
    analogous: {
      name: 'Analogous',
      desc: 'Neighbors on the wheel — harmonious, natural feel',
      colors: [
        mkHex(h-30,s,l),
        mkHex(h-15,s,l),
        hex,
        mkHex(h+15,s,l),
        mkHex(h+30,s,l),
      ],
    },
    triadic: {
      name: 'Triadic',
      desc: 'Three equally spaced hues — vibrant and balanced',
      colors: [
        hex,
        mkHex(h+120,s,l),
        mkHex(h+240,s,l),
        mkHex(h+120,s,l+10),
        mkHex(h+240,s,l+10),
      ],
    },
    splitComplementary: {
      name: 'Split-Complementary',
      desc: 'Base + two near-complements — softer than pure complement',
      colors: [
        hex,
        mkHex(h+150,s,l),
        mkHex(h+210,s,l),
        mkHex(h+150,s,l+15),
        mkHex(h+210,s,l+15),
      ],
    },
    tetradic: {
      name: 'Tetradic / Square',
      desc: 'Four hues 90° apart — rich, versatile palette',
      colors: [
        hex,
        mkHex(h+90,s,l),
        mkHex(h+180,s,l),
        mkHex(h+270,s,l),
        mkHex(h+45,s,l+10),
      ],
    },
    monochromatic: {
      name: 'Monochromatic',
      desc: 'Same hue, varying lightness — elegant and cohesive',
      colors: [
        mkHex(h,s,Math.max(10,l-30)),
        mkHex(h,s,Math.max(10,l-15)),
        hex,
        mkHex(h,s,Math.min(90,l+15)),
        mkHex(h,s,Math.min(90,l+30)),
      ],
    },
    shades: {
      name: 'Tints & Shades',
      desc: 'Pure light-to-dark scale of your chosen color',
      colors: [
        mkHex(h,s,90),
        mkHex(h,s,70),
        mkHex(h,s,50),
        mkHex(h,s,30),
        mkHex(h,s,15),
      ],
    },
  };
};

// ── Named Colors (closest match) ──────────────────────────
const NAMED_COLORS = [
  ['Red','#FF0000'],['Crimson','#DC143C'],['Tomato','#FF6347'],['Coral','#FF7F50'],
  ['OrangeRed','#FF4500'],['Orange','#FFA500'],['Gold','#FFD700'],['Yellow','#FFFF00'],
  ['GreenYellow','#ADFF2F'],['Chartreuse','#7FFF00'],['Lime','#00FF00'],['ForestGreen','#228B22'],
  ['Green','#008000'],['DarkGreen','#006400'],['Teal','#008080'],['Cyan','#00FFFF'],
  ['DeepSkyBlue','#00BFFF'],['DodgerBlue','#1E90FF'],['RoyalBlue','#4169E1'],['Blue','#0000FF'],
  ['Navy','#000080'],['Indigo','#4B0082'],['BlueViolet','#8A2BE2'],['Purple','#800080'],
  ['Magenta','#FF00FF'],['DeepPink','#FF1493'],['HotPink','#FF69B4'],['Pink','#FFC0CB'],
  ['LightCoral','#F08080'],['Salmon','#FA8072'],['Sienna','#A0522D'],['Brown','#A52A2A'],
  ['Maroon','#800000'],['Khaki','#F0E68C'],['Wheat','#F5DEB3'],['Tan','#D2B48C'],
  ['Silver','#C0C0C0'],['Gray','#808080'],['DimGray','#696969'],['Black','#000000'],
  ['White','#FFFFFF'],['Snow','#FFFAFA'],['Ivory','#FFFFF0'],['AliceBlue','#F0F8FF'],
  ['SlateBlue','#6A5ACD'],['MediumSlateBlue','#7B68EE'],['Lavender','#E6E6FA'],
  ['Thistle','#D8BFD8'],['Plum','#DDA0DD'],['Orchid','#DA70D6'],['Turquoise','#40E0D0'],
  ['MediumTurquoise','#48D1CC'],['Aquamarine','#7FFFD4'],['SteelBlue','#4682B4'],
];

const closestName = (hex) => {
  const {r,g,b} = hexToRgb(hex);
  let best = NAMED_COLORS[0], bestDist = Infinity;
  NAMED_COLORS.forEach(([name, nhex]) => {
    const {r:nr,g:ng,b:nb} = hexToRgb(nhex);
    const d = Math.sqrt((r-nr)**2+(g-ng)**2+(b-nb)**2);
    if (d < bestDist) { bestDist = d; best = [name, nhex]; }
  });
  return best[0];
};

// ── 50+ Curated Palettes with Categories ──────────────────
const CURATED_PALETTES = [
  // ── TRENDING 2025 ──────────────────────────────────────
  { category: 'Trending 2025', name: 'Mocha Mousse',      colors: ['#6B4226','#8B5E3C','#A87B5A','#C4A882','#E8D5B0'] },
  { category: 'Trending 2025', name: 'Digital Lavender',  colors: ['#B8A9C9','#C9BBDA','#D9CEEB','#EAE2F0','#F5F2FA'] },
  { category: 'Trending 2025', name: 'Neon Aura',         colors: ['#0FF0FC','#7B2FFF','#FF2FBD','#FFE94A','#0BFFA8'] },
  { category: 'Trending 2025', name: 'Clay Earth',        colors: ['#C1440E','#D4724A','#E8A87C','#F2CBA8','#FAE8D4'] },
  { category: 'Trending 2025', name: 'Butter Yellow',     colors: ['#F5E642','#F7ED6E','#FBF3A3','#FDFAD4','#FFFEF0'] },
  { category: 'Trending 2025', name: 'Cyber Punk',        colors: ['#0D0221','#190535','#FF003C','#FF6B35','#FFD700'] },
  { category: 'Trending 2025', name: 'Peach Fuzz',        colors: ['#FFBE98','#FFCBA8','#FFD8BA','#FFE8D0','#FFF3E8'] },
  { category: 'Trending 2025', name: 'Mystic Aurora',     colors: ['#00C9A7','#00B4D8','#0096C7','#7B2D8B','#C77DFF'] },

  // ── NATURE ─────────────────────────────────────────────
  { category: 'Nature',        name: 'Forest Canopy',     colors: ['#1A3A1A','#2D5A27','#4A7C59','#6BAA75','#A8D5A2'] },
  { category: 'Nature',        name: 'Ocean Depths',      colors: ['#03045E','#023E8A','#0077B6','#00B4D8','#90E0EF'] },
  { category: 'Nature',        name: 'Autumn Harvest',    colors: ['#7B2D00','#C44B00','#E8702A','#F4A261','#FFD5A0'] },
  { category: 'Nature',        name: 'Desert Dunes',      colors: ['#C2956E','#D4A96A','#E8C28A','#F2D9B3','#FAF0DC'] },
  { category: 'Nature',        name: 'Cherry Blossom',    colors: ['#D63384','#E8749A','#F5A8BF','#FAD0DA','#FDF0F3'] },
  { category: 'Nature',        name: 'Northern Lights',   colors: ['#012030','#13678A','#45C4B0','#9AEBA3','#DAEFB3'] },
  { category: 'Nature',        name: 'Lavender Fields',   colors: ['#4A2545','#7B5E8A','#A68DC0','#C9B3DC','#EAD9F5'] },
  { category: 'Nature',        name: 'Tropical Sunset',   colors: ['#FF6B35','#FF9F43','#FFCC4A','#FF6B9D','#C44BC5'] },
  { category: 'Nature',        name: 'Moss & Stone',      colors: ['#3D405B','#5E6472','#81968F','#B3C2BF','#DEE9E8'] },
  { category: 'Nature',        name: 'Deep Ocean',        colors: ['#0A0F2E','#162447','#1F4068','#1B6CA8','#36A2EB'] },

  // ── UI / BRAND ─────────────────────────────────────────
  { category: 'UI & Brand',    name: 'Notion Dark',       colors: ['#191919','#2F2F2F','#454545','#787878','#B0B0B0'] },
  { category: 'UI & Brand',    name: 'Stripe Vibes',      colors: ['#0A2540','#425466','#00D4FF','#635BFF','#F7F9FB'] },
  { category: 'UI & Brand',    name: 'Vercel Dark',       colors: ['#000000','#111111','#333333','#888888','#EDEDED'] },
  { category: 'UI & Brand',    name: 'Linear Blue',       colors: ['#0F0F1A','#1A1A3E','#2C2C7A','#5865F2','#FFFFFF'] },
  { category: 'UI & Brand',    name: 'Supabase Green',    colors: ['#1C1C1C','#171717','#3FCF8E','#2DD4BF','#F8F8F8'] },
  { category: 'UI & Brand',    name: 'Figma Palette',     colors: ['#FF7262','#A259FF','#1ABCFE','#0ACF83','#F24E1E'] },
  { category: 'UI & Brand',    name: 'Tailwind Indigo',   colors: ['#E0E7FF','#A5B4FC','#6366F1','#4338CA','#312E81'] },
  { category: 'UI & Brand',    name: 'GitHub Dark',       colors: ['#010409','#0D1117','#161B22','#21262D','#30363D'] },
  { category: 'UI & Brand',    name: 'VS Code Purple',    colors: ['#1E1E1E','#252526','#3C3C3C','#569CD6','#C586C0'] },

  // ── PASTEL ─────────────────────────────────────────────
  { category: 'Pastel',        name: 'Cotton Candy',      colors: ['#FFB3C6','#FFC8DD','#FFDBF0','#BDE0FE','#A2D2FF'] },
  { category: 'Pastel',        name: 'Macaroon',          colors: ['#FFADAD','#FFD6A5','#FDFFB6','#CAFFBF','#9BF6FF'] },
  { category: 'Pastel',        name: 'Dreamy Soft',       colors: ['#D8BBF5','#EAD4F5','#F5E6FA','#FADADD','#FFF0F3'] },
  { category: 'Pastel',        name: 'Sherbet',           colors: ['#FF9AA2','#FFB7B2','#FFDAC1','#E2F0CB','#B5EAD7'] },
  { category: 'Pastel',        name: 'Baby Palette',      colors: ['#AED6F1','#A9DFBF','#F9E79F','#F1948A','#D7BDE2'] },
  { category: 'Pastel',        name: 'Watercolor',        colors: ['#B8D8E8','#C8E6C9','#FFF9C4','#FFCCBC','#E1BEE7'] },

  // ── DARK / MOODY ───────────────────────────────────────
  { category: 'Dark & Moody',  name: 'Midnight Bloom',    colors: ['#0B0014','#1A0033','#3D006E','#7B00D4','#C77DFF'] },
  { category: 'Dark & Moody',  name: 'Dark Academia',     colors: ['#2C2416','#4A3728','#6B4C35','#9C7B5A','#C8A97E'] },
  { category: 'Dark & Moody',  name: 'Obsidian',          colors: ['#080808','#141414','#242424','#3A3A3A','#5C5C5C'] },
  { category: 'Dark & Moody',  name: 'Blood Moon',        colors: ['#1A0000','#3D0000','#7B0000','#C0392B','#E74C3C'] },
  { category: 'Dark & Moody',  name: 'Deep Space',        colors: ['#000014','#0A0A2E','#1A1A5E','#2C2C9A','#4444CC'] },
  { category: 'Dark & Moody',  name: 'Charcoal Smoke',    colors: ['#1A1A2E','#16213E','#0F3460','#533483','#E94560'] },
  { category: 'Dark & Moody',  name: 'Gothic Rose',       colors: ['#1A0010','#3D0025','#7A0040','#B5005A','#FF2B7A'] },

  // ── RETRO / VINTAGE ────────────────────────────────────
  { category: 'Retro & Vintage', name: '70s Groove',      colors: ['#C94B1E','#E8892A','#F0C040','#8AB84D','#3D7A5E'] },
  { category: 'Retro & Vintage', name: 'Polaroid',        colors: ['#F5E6C8','#E8C99A','#D4A96A','#B07D3A','#7A5420'] },
  { category: 'Retro & Vintage', name: 'Neon 80s',        colors: ['#FF0080','#FF8C00','#FFE600','#00FF9C','#00CFFF'] },
  { category: 'Retro & Vintage', name: 'Vaporwave',       colors: ['#FF71CE','#01CDFE','#05FFA1','#B967FF','#FFFB96'] },
  { category: 'Retro & Vintage', name: 'Retro Diner',     colors: ['#E63946','#F1FAEE','#A8DADC','#457B9D','#1D3557'] },
  { category: 'Retro & Vintage', name: 'Film Noir',       colors: ['#1A1A1A','#3D3D3D','#6B6B6B','#B0B0B0','#F5F5F5'] },
  { category: 'Retro & Vintage', name: 'Arcade Pixel',    colors: ['#000000','#FF0000','#FFFF00','#00FF00','#FFFFFF'] },

  // ── MINIMAL ────────────────────────────────────────────
  { category: 'Minimal',      name: 'Pure White',         colors: ['#FFFFFF','#F8F9FA','#E9ECEF','#DEE2E6','#CED4DA'] },
  { category: 'Minimal',      name: 'Warm Neutral',       colors: ['#FAF7F0','#F0EAD6','#DDD0B3','#C2A87A','#8B6914'] },
  { category: 'Minimal',      name: 'Cool Gray',          colors: ['#F0F4F8','#D9E2EC','#BCCCDC','#9FB3C8','#829AB1'] },
  { category: 'Minimal',      name: 'Scandinavian',       colors: ['#FAFAFA','#F0F0F0','#C8CDD0','#8A9BA8','#2E4057'] },
  { category: 'Minimal',      name: 'Paper & Ink',        colors: ['#F5F0E8','#E8DFD0','#8B7355','#4A3728','#1A0F00'] },

  // ── SEASONAL ───────────────────────────────────────────
  { category: 'Seasonal',     name: 'Spring Garden',      colors: ['#7EC8A4','#A8D8EA','#F7D6E0','#FCF3CF','#C3E6CB'] },
  { category: 'Seasonal',     name: 'Summer Vibes',       colors: ['#FF6B6B','#FFA500','#FFD700','#00CED1','#40E0D0'] },
  { category: 'Seasonal',     name: 'Fall Foliage',       colors: ['#8B1A1A','#C44B00','#E8762C','#F4A460','#D2B48C'] },
  { category: 'Seasonal',     name: 'Winter Frost',       colors: ['#E8F4F8','#B8D4E8','#7BAFD4','#4A90C4','#1A5F94'] },
  { category: 'Seasonal',     name: 'Holiday Cheer',      colors: ['#C0392B','#27AE60','#F39C12','#FFFFFF','#8B4513'] },
  { category: 'Seasonal',     name: 'Golden Hour',        colors: ['#FF6B35','#F7931E','#FFD700','#FFF176','#FFFDE7'] },

  // ── FOOD & DRINK ───────────────────────────────────────
  { category: 'Food & Drink',  name: 'Coffee Shop',       colors: ['#3E1C00','#6B3A2A','#9C6B4E','#C4956A','#F5DEB3'] },
  { category: 'Food & Drink',  name: 'Matcha Latte',      colors: ['#2D5016','#4A7C59','#7BAD72','#B5D5A0','#E8F5E0'] },
  { category: 'Food & Drink',  name: 'Berry Smoothie',    colors: ['#4A0D67','#8B2FC9','#D264B6','#F4A9D8','#FDE8F4'] },
  { category: 'Food & Drink',  name: 'Citrus Burst',      colors: ['#FF4500','#FF8C00','#FFA500','#FFD700','#FFFF00'] },
  { category: 'Food & Drink',  name: 'Chocolate Box',     colors: ['#1A0A00','#3D1A00','#7B3F00','#C67C3C','#E8B888'] },

  // ── NEON & ELECTRIC ────────────────────────────────────
  { category: 'Neon & Electric', name: 'Electric Lime',   colors: ['#0A0A0A','#1A1A1A','#39FF14','#CCFF00','#F0FF00'] },
  { category: 'Neon & Electric', name: 'Plasma Pink',     colors: ['#1A001A','#3D0040','#FF00FF','#FF66FF','#FFCCFF'] },
  { category: 'Neon & Electric', name: 'Volt Blue',       colors: ['#000A1A','#001A3D','#0040FF','#0099FF','#00CCFF'] },
  { category: 'Neon & Electric', name: 'Laser Orange',    colors: ['#1A0500','#3D1000','#FF4400','#FF7700','#FFAA00'] },
  { category: 'Neon & Electric', name: 'Toxic Green',     colors: ['#001A00','#003300','#00FF41','#00CC33','#AAFFAA'] },
  { category: 'Neon & Electric', name: 'UV Purple',       colors: ['#0D0020','#1F0050','#6600FF','#9933FF','#CC99FF'] },
  { category: 'Neon & Electric', name: 'Neon Coral',      colors: ['#1A0010','#3D0025','#FF0055','#FF4488','#FF99BB'] },

  // ── GRADIENT DUOS ──────────────────────────────────────
  { category: 'Gradient Duos',  name: 'Sunset Blaze',     colors: ['#FF416C','#FF4B2B','#FF8751','#FFBA6B','#FFE0A3'] },
  { category: 'Gradient Duos',  name: 'Ocean Wave',       colors: ['#2980B9','#2C3E84','#6C5CE7','#A29BFE','#D6C8FF'] },
  { category: 'Gradient Duos',  name: 'Green Mint',       colors: ['#00B09B','#00C9A7','#96E6A1','#D4FC79','#F0FFC8'] },
  { category: 'Gradient Duos',  name: 'Rose Gold',        colors: ['#B76E79','#C9848F','#DBA0AA','#ECBDC5','#F9D9E0'] },
  { category: 'Gradient Duos',  name: 'Purple Haze',      colors: ['#360033','#6A0572','#AB34C5','#D475E0','#F0BBFA'] },
  { category: 'Gradient Duos',  name: 'Golden Sky',       colors: ['#F7971E','#FFD200','#FFF176','#FFFDE7','#FFFFFF'] },
  { category: 'Gradient Duos',  name: 'Aqua Dream',       colors: ['#003973','#00698F','#009DAA','#00CFC1','#A0FAEC'] },

  // ── CULTURAL ───────────────────────────────────────────
  { category: 'Cultural',       name: 'Japanese Zen',     colors: ['#1B1B1B','#D4380D','#FA8C16','#FADB14','#F0F5FF'] },
  { category: 'Cultural',       name: 'Moroccan Spice',   colors: ['#8B1A00','#C44A00','#E8890A','#F5C842','#FFF3CD'] },
  { category: 'Cultural',       name: 'Indian Sari',      colors: ['#9B1B30','#D4570C','#F0A500','#2B8A3E','#1864AB'] },
  { category: 'Cultural',       name: 'Scandinavian Folk', colors: ['#1A3A5C','#C41E3A','#F2E8D5','#E8D5B0','#FFFFFF'] },
  { category: 'Cultural',       name: 'African Kente',    colors: ['#B8860B','#228B22','#DC143C','#000000','#FFD700'] },
  { category: 'Cultural',       name: 'Greek Island',     colors: ['#1A6BC5','#2B8FCE','#FFFFFF','#F5F5DC','#E8C84A'] },
  { category: 'Cultural',       name: 'Chinese New Year', colors: ['#CC0000','#FF4444','#FFD700','#8B0000','#FFEEAA'] },

  // ── SPACE & COSMIC ─────────────────────────────────────
  { category: 'Space & Cosmic', name: 'Nebula Dust',      colors: ['#0B0C10','#1F2833','#C5C6C7','#66FCF1','#45A29E'] },
  { category: 'Space & Cosmic', name: 'Galaxy Core',      colors: ['#04001A','#0D0030','#4B0082','#7B00C8','#C77DFF'] },
  { category: 'Space & Cosmic', name: 'Mars Surface',     colors: ['#3D1C02','#7B3810','#B85C2C','#D4834E','#E8B48A'] },
  { category: 'Space & Cosmic', name: 'Pulsar Glow',      colors: ['#000814','#001233','#0353A4','#023E7D','#33B5E5'] },
  { category: 'Space & Cosmic', name: 'Stardust',         colors: ['#0A0015','#1E0040','#5500B3','#AA66FF','#FFE5FF'] },
  { category: 'Space & Cosmic', name: 'Solar Flare',      colors: ['#1A0500','#7B1200','#CC3300','#FF6600','#FFB347'] },
  { category: 'Space & Cosmic', name: 'Ice Planet',       colors: ['#EAF6FF','#B8E0F7','#7AC5F0','#3A9FE8','#0D6EBD'] },

  // ── LUXURY ─────────────────────────────────────────────
  { category: 'Luxury',         name: 'Black Gold',       colors: ['#000000','#1A1400','#4D3800','#C5A028','#FFD700'] },
  { category: 'Luxury',         name: 'Platinum Silver',  colors: ['#1A1A1A','#3D3D3D','#8C8C8C','#C0C0C0','#F0F0F0'] },
  { category: 'Luxury',         name: 'Royal Velvet',     colors: ['#1A0040','#3D0080','#6600CC','#9933FF','#D4AAFF'] },
  { category: 'Luxury',         name: 'Champagne Toast',  colors: ['#6B4A00','#9A6F00','#C9960A','#E8C96D','#FAF0C8'] },
  { category: 'Luxury',         name: 'Emerald Elite',    colors: ['#001A10','#003320','#006B3C','#00A86B','#A8E6CE'] },
  { category: 'Luxury',         name: 'Sapphire Mist',    colors: ['#000A2E','#001466','#0020B3','#3355FF','#99AAFF'] },
  { category: 'Luxury',         name: 'Ruby Prestige',    colors: ['#1A0010','#4D0030','#990050','#CC0066','#FF3399'] },

  // ── ABSTRACT ART ───────────────────────────────────────
  { category: 'Abstract Art',   name: 'Bauhaus Primary',  colors: ['#E63946','#2196F3','#FFEB3B','#212121','#FAFAFA'] },
  { category: 'Abstract Art',   name: 'Pop Art Splash',   colors: ['#FF1744','#FF9100','#FFEA00','#00E676','#2979FF'] },
  { category: 'Abstract Art',   name: 'Mondrian Grid',    colors: ['#E53935','#1565C0','#F9A825','#FFFFFF','#212121'] },
  { category: 'Abstract Art',   name: 'Kandinsky',        colors: ['#880E4F','#1565C0','#558B2F','#E65100','#F9A825'] },
  { category: 'Abstract Art',   name: 'Impressionist',    colors: ['#5C8A4A','#7EB8C9','#D4A86A','#8A6BAE','#E8D5B0'] },
  { category: 'Abstract Art',   name: 'Cubist Fragments', colors: ['#B0C4DE','#708090','#2F4F4F','#8B4513','#D2691E'] },
  { category: 'Abstract Art',   name: 'Color Field',      colors: ['#FF6B6B','#4ECDC4','#45B7D1','#FFA07A','#98D8C8'] },

  // ── GAMING ─────────────────────────────────────────────
  { category: 'Gaming',         name: 'Synthwave Drive',  colors: ['#0D0221','#3D0066','#7B00CC','#FF00FF','#00FFFF'] },
  { category: 'Gaming',         name: 'Battle Royale',    colors: ['#1A1A1A','#2D2D2D','#CC8800','#FF6600','#FF0000'] },
  { category: 'Gaming',         name: 'Pixel Forest',     colors: ['#005500','#008800','#00BB00','#88FF00','#CCFF88'] },
  { category: 'Gaming',         name: 'Dungeon Stone',    colors: ['#1A1410','#3D2B1A','#6B4C35','#9C7B5A','#C8A97E'] },
  { category: 'Gaming',         name: 'Hologram HUD',     colors: ['#001A1A','#003333','#006666','#00FFFF','#AAFFFF'] },
  { category: 'Gaming',         name: 'Lava World',       colors: ['#1A0000','#4D0000','#990000','#FF3300','#FF9900'] },
  { category: 'Gaming',         name: 'Ice Dungeon',      colors: ['#001433','#002B66','#0055B3','#4499FF','#CCE5FF'] },
];

const CURATED_CATEGORIES = [...new Set(CURATED_PALETTES.map(p => p.category))];

// ── Related Tools ──────────────────────────────────────────
const RELATED_TOOLS = [
  { name: 'Word Counter',       href: '/tools/word-counter',       icon: '📝', desc: 'Count words, characters and reading time instantly' },
  { name: 'Lorem Ipsum',        href: '/tools/lorem-ipsum',        icon: '✍️', desc: 'Generate placeholder text for your UI mockups' },
  { name: 'Base64 Encoder',     href: '/tools/base64-encoder-decoder', icon: '🔄', desc: 'Encode images and data to Base64 for CSS/HTML use' },
  { name: 'Image to Base64',    href: '/tools/image-to-base64',    icon: '🖼️', desc: 'Convert images to Base64 data URLs for inline use' },
];

// ── Main Component ─────────────────────────────────────────
export default function ColorPickerTool() {
  const [hex, setHex]               = useState('#6366f1');
  const [inputHex, setInputHex]     = useState('#6366f1');
  const [copied, setCopied]         = useState('');
  const [activeTab, setActiveTab]   = useState('palettes');
  const [activePalette, setActivePalette] = useState('complementary');
  const [savedColors, setSavedColors] = useState([]);
  const [pickerMode, setPickerMode] = useState('wheel');
  const [hslValues, setHslValues]   = useState({ h: 239, s: 84, l: 60 });
  const [curatedCat, setCuratedCat] = useState('Trending 2025');

  const debounceRef = useRef(null);

  // Sync hex → hsl
  const applyHex = useCallback((h) => {
    const clean = h.startsWith('#') ? h : '#' + h;
    if (!/^#[0-9a-fA-F]{6}$/.test(clean)) return;
    setHex(clean);
    setInputHex(clean);
    const {r,g,b} = hexToRgb(clean);
    setHslValues(rgbToHsl(r,g,b));
  }, []);

  // Sync hsl → hex
  const applyHsl = useCallback((h, s, l) => {
    const {r,g,b} = hslToRgb(h,s,l);
    const newHex   = rgbToHex(r,g,b);
    setHex(newHex);
    setInputHex(newHex);
    setHslValues({h,s,l});
  }, []);

  const copy = async (val, id) => {
    await navigator.clipboard.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const saveColor = () => {
    if (!savedColors.includes(hex)) setSavedColors((p) => [hex, ...p].slice(0, 20));
  };

  const rgb    = hexToRgb(hex);
  const hsl    = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv    = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk   = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const palettes = generatePalettes(hex);
  const textCol  = getTextColor(hex);
  const contrastWhite = getContrastRatio(hex, '#ffffff');
  const contrastBlack = getContrastRatio(hex, '#000000');
  const wcagWhite  = contrastWhite >= 7 ? 'AAA' : contrastWhite >= 4.5 ? 'AA' : contrastWhite >= 3 ? 'AA Large' : 'Fail';
  const wcagBlack  = contrastBlack >= 7 ? 'AAA' : contrastBlack >= 4.5 ? 'AA' : contrastBlack >= 3 ? 'AA Large' : 'Fail';
  const colorName  = closestName(hex);

  const CopyBtn = ({ value, id, small }) => (
    <button onClick={() => copy(value, id)}
      className={'font-bold rounded-lg transition-all flex-shrink-0 ' + (small ? 'text-xs px-1.5 py-0.5 ' : 'text-xs px-2 py-1 ') + (copied === id ? 'bg-emerald-500 text-white' : 'bg-white/20 hover:bg-white/40 text-inherit')}>
      {copied === id ? '✓' : 'Copy'}
    </button>
  );

  const FormatRow = ({ label, value, id }) => (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 font-medium w-20 flex-shrink-0">{label}</span>
      <span className="text-xs font-mono font-bold text-slate-800 flex-1 truncate">{value}</span>
      <button onClick={() => copy(value, id)}
        className={'text-xs font-bold px-2 py-1 rounded-lg transition-all flex-shrink-0 ' + (copied === id ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600')}>
        {copied === id ? '✓' : 'Copy'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="border-b border-slate-100 py-14" style={{ background: `linear-gradient(135deg, ${adjustHsl(hex,0,-20,30)}22, white, ${adjustHsl(hex,30,-10,20)}22)` }}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="inline-block bg-white/80 text-slate-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-slate-200">
            Free · Instant · Color Palettes
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            Color{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(90deg, ${hex}, ${adjustHsl(hex,40,0,0)})` }}>
              Picker
            </span>
            {' '}& Palette Generator
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Pick any color and instantly get HEX, RGB, HSL, HSV, CMYK values plus 7 auto-generated color palettes — complementary, analogous, triadic, monochromatic and more.
          </p>
        </div>
      </section>

      {/* AD */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* ── TOP: PICKER + PREVIEW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Color Picker Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Color Picker</div>

            {/* Native picker — large */}
            <div className="relative mb-4">
              <input type="color" value={hex}
                onChange={(e) => applyHex(e.target.value)}
                className="w-full h-40 rounded-xl border border-slate-200 cursor-pointer p-0 bg-transparent"
                style={{ colorScheme: 'light' }}
              />
            </div>

            {/* HEX input */}
            <div className="flex gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl border border-slate-200 flex-shrink-0" style={{ backgroundColor: hex }} />
              <input
                type="text"
                value={inputHex}
                onChange={(e) => {
                  setInputHex(e.target.value);
                  clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => applyHex(e.target.value), 400);
                }}
                placeholder="#6366f1"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-indigo-400 transition-all"
              />
            </div>

            {/* HSL Sliders */}
            <div className="flex flex-col gap-3 mb-4">
              {[
                { label: 'H', key: 'h', max: 360, gradient: 'linear-gradient(to right, #ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)' },
                { label: 'S', key: 's', max: 100, gradient: `linear-gradient(to right, hsl(${hslValues.h},0%,${hslValues.l}%), hsl(${hslValues.h},100%,${hslValues.l}%))` },
                { label: 'L', key: 'l', max: 100, gradient: `linear-gradient(to right, #000, hsl(${hslValues.h},${hslValues.s}%,50%), #fff)` },
              ].map(({ label, key, max, gradient }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400">{label}</span>
                    <span className="text-xs font-mono text-slate-600">{hslValues[key]}</span>
                  </div>
                  <div className="relative h-4 rounded-full" style={{ background: gradient }}>
                    <input type="range" min="0" max={max} value={hslValues[key]}
                      onChange={(e) => {
                        const newVals = { ...hslValues, [key]: parseInt(e.target.value,10) };
                        setHslValues(newVals);
                        applyHsl(newVals.h, newVals.s, newVals.l);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute top-0 h-4 w-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 pointer-events-none"
                      style={{ left: (hslValues[key] / max * 100) + '%', backgroundColor: key === 'h' ? `hsl(${hslValues[key]},100%,50%)` : hex }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Save + Actions */}
            <div className="flex gap-2">
              <button onClick={saveColor}
                className="flex-1 bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all">
                + Save Color
              </button>
              <button onClick={() => copy(hex, 'quickhex')}
                className={'text-xs font-bold px-4 py-2.5 rounded-xl transition-all border ' + (copied === 'quickhex' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white')}>
                {copied === 'quickhex' ? '✓' : 'Copy HEX'}
              </button>
            </div>
          </div>

          {/* Color Preview */}
          <div className="flex flex-col gap-4">
            {/* Big swatch */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-1 min-h-48" style={{ backgroundColor: hex }}>
              <div className="h-full p-5 flex flex-col justify-between min-h-48">
                <div>
                  <div className="text-lg font-extrabold" style={{ color: textCol }}>{colorName}</div>
                  <div className="text-sm font-mono mt-1 opacity-80" style={{ color: textCol }}>{hex.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-xs font-medium opacity-70 mb-2" style={{ color: textCol }}>Sample Text on this Color</div>
                  <div className="text-sm font-bold" style={{ color: textCol }}>The quick brown fox jumps over the lazy dog.</div>
                </div>
              </div>
            </div>

            {/* White + Black preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 border border-slate-200" style={{ backgroundColor: hex }}>
                <div className="text-xs font-bold text-white mb-1">White text</div>
                <div className="text-xs text-white/80">contrast: {contrastWhite}:1</div>
                <div className={'text-xs font-bold mt-1 px-2 py-0.5 rounded-full w-fit ' + (wcagWhite === 'Fail' ? 'bg-red-500 text-white' : 'bg-green-500 text-white')}>
                  WCAG {wcagWhite}
                </div>
              </div>
              <div className="rounded-xl p-4 border border-slate-200" style={{ backgroundColor: hex }}>
                <div className="text-xs font-bold text-slate-900 mb-1">Black text</div>
                <div className="text-xs text-slate-700/80">contrast: {contrastBlack}:1</div>
                <div className={'text-xs font-bold mt-1 px-2 py-0.5 rounded-full w-fit ' + (wcagBlack === 'Fail' ? 'bg-red-500 text-white' : 'bg-green-500 text-white')}>
                  WCAG {wcagBlack}
                </div>
              </div>
            </div>
          </div>

          {/* Color Values */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Color Values</div>
            <FormatRow label="HEX"   value={hex.toUpperCase()}                                       id="hex"  />
            <FormatRow label="RGB"   value={'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')'}      id="rgb"  />
            <FormatRow label="HSL"   value={'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)'}   id="hsl"  />
            <FormatRow label="HSV"   value={'hsv(' + hsv.h + ', ' + hsv.s + '%, ' + hsv.v + '%)'}   id="hsv"  />
            <FormatRow label="CMYK"  value={'cmyk(' + cmyk.c + '%, ' + cmyk.m + '%, ' + cmyk.y + '%, ' + cmyk.k + '%)'} id="cmyk" />
            <FormatRow label="CSS"   value={'color: ' + hex + ';'}                                   id="css"  />
            <FormatRow label="Tailwind-like" value={'bg-[' + hex + ']'}                              id="tw"   />

            {/* Saved Colors */}
            {savedColors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Saved</div>
                <div className="flex flex-wrap gap-2">
                  {savedColors.map((c) => (
                    <button key={c} onClick={() => applyHex(c)} title={c}
                      className="w-7 h-7 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm flex-wrap">
          {[
            { key: 'palettes',  label: '🎨 Palettes'      },
            { key: 'curated',   label: '✦ Curated 50+'    },
            { key: 'shades',    label: '◑ Tints & Shades' },
            { key: 'harmony',   label: '⚡ Harmony'        },
            { key: 'presets',   label: '🎯 CSS Colors'     },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={'flex-1 min-w-fit py-2 px-3 rounded-xl text-xs font-bold transition-all ' + (activeTab === tab.key ? 'text-white shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')}
              style={activeTab === tab.key ? { backgroundColor: hex } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ PALETTES TAB ══ */}
        {activeTab === 'palettes' && (
          <div className="flex flex-col gap-5">
            {/* Palette selector */}
            <div className="flex gap-2 flex-wrap">
              {Object.keys(palettes).filter(k => k !== 'shades').map((key) => (
                <button key={key} onClick={() => setActivePalette(key)}
                  className={'text-xs font-bold px-3 py-2 rounded-xl border transition-all ' + (activePalette === key ? 'text-white border-transparent shadow' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')}
                  style={activePalette === key ? { backgroundColor: hex } : {}}>
                  {palettes[key].name}
                </button>
              ))}
            </div>

            {/* Active palette detail */}
            {palettes[activePalette] && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{palettes[activePalette].name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{palettes[activePalette].desc}</p>
                  </div>
                  <button onClick={() => copy(palettes[activePalette].colors.join(', '), 'palette-all')}
                    className={'text-xs font-bold px-3 py-1.5 rounded-lg transition-all ' + (copied === 'palette-all' ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600')}>
                    {copied === 'palette-all' ? '✓ Copied' : 'Copy All'}
                  </button>
                </div>

                {/* Big color swatches */}
                <div className="grid grid-cols-5 gap-3 mt-5">
                  {palettes[activePalette].colors.map((c, i) => {
                    const tc = getTextColor(c);
                    const {r,g,b} = hexToRgb(c);
                    const cHsl = rgbToHsl(r,g,b);
                    return (
                      <div key={i} className="flex flex-col">
                        <button onClick={() => applyHex(c)}
                          className="h-24 sm:h-32 rounded-xl border border-slate-200 shadow-sm hover:scale-105 transition-all relative group overflow-hidden"
                          style={{ backgroundColor: c }} title={'Use ' + c}>
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/20 rounded-xl">
                            <span className="text-xs font-bold text-white">Use</span>
                          </div>
                        </button>
                        <div className="mt-2 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-mono font-bold text-slate-700">{c.toUpperCase()}</div>
                            <div className="text-xs text-slate-400">{cHsl.h}° {cHsl.l}%</div>
                          </div>
                          <button onClick={() => copy(c, 'swatch-' + i)}
                            className={'text-xs font-bold px-1.5 py-0.5 rounded-lg transition-all ' + (copied === 'swatch-' + i ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600')}>
                            {copied === 'swatch-' + i ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CSS export */}
                <div className="mt-5 bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-mono">CSS Variables</span>
                    <button onClick={() => copy(
                      ':root {\n' + palettes[activePalette].colors.map((c,i) => '  --color-' + (i+1) + ': ' + c + ';').join('\n') + '\n}',
                      'css-export'
                    )} className={'text-xs font-bold px-2 py-1 rounded-lg transition-all ' + (copied === 'css-export' ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white')}>
                      {copied === 'css-export' ? '✓ Copied' : 'Copy CSS'}
                    </button>
                  </div>
                  <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
{':root {\n' + palettes[activePalette].colors.map((c,i) => '  --color-' + (i+1) + ': ' + c + ';').join('\n') + '\n}'}
                  </pre>
                </div>
              </div>
            )}

            {/* All palettes preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(palettes).filter(([k]) => k !== 'shades').map(([key, palette]) => (
                <button key={key} onClick={() => { setActivePalette(key); }}
                  className={'text-left bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ' + (activePalette === key ? 'border-2' : 'border-slate-200')}
                  style={activePalette === key ? { borderColor: hex } : {}}>
                  <div className="flex gap-1.5 mb-3">
                    {palette.colors.map((c, i) => (
                      <div key={i} className="flex-1 h-10 rounded-lg" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="font-bold text-slate-800 text-xs">{palette.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{palette.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ CURATED PALETTES TAB ══ */}
        {activeTab === 'curated' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">50+ Curated Color Palettes</h2>
                <p className="text-xs text-slate-400 mt-0.5">Handpicked trending, seasonal and themed palettes. Click any color to use it.</p>
              </div>
              <div className="text-xs text-slate-400 font-medium">{CURATED_PALETTES.length} palettes across {CURATED_CATEGORIES.length} categories</div>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap">
              {CURATED_CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCuratedCat(cat)}
                  className={'text-xs font-bold px-3 py-2 rounded-xl border transition-all ' + (curatedCat === cat ? 'text-white border-transparent shadow' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300')}
                  style={curatedCat === cat ? { backgroundColor: hex } : {}}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Palette grid for selected category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURATED_PALETTES.filter(p => p.category === curatedCat).map((palette, pi) => (
                <div key={pi} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group">
                  {/* Color strip */}
                  <div className="flex gap-1.5 mb-3">
                    {palette.colors.map((c, ci) => (
                      <button key={ci} onClick={() => applyHex(c)} title={'Use ' + c}
                        className="flex-1 h-12 rounded-xl hover:scale-105 transition-transform shadow-sm border border-white/20"
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>

                  {/* Name + hex row */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-extrabold text-slate-800">{palette.name}</div>
                      <div className="text-xs text-slate-400">{palette.category}</div>
                    </div>
                    <button onClick={() => copy(palette.colors.join(', '), 'curated-' + pi)}
                      className={'text-xs font-bold px-2.5 py-1 rounded-lg transition-all ' + (copied === 'curated-' + pi ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600')}>
                      {copied === 'curated-' + pi ? '✓ Copied' : 'Copy All'}
                    </button>
                  </div>

                  {/* Hex values */}
                  <div className="flex gap-1 flex-wrap">
                    {palette.colors.map((c, ci) => (
                      <button key={ci} onClick={() => copy(c, 'chex-' + pi + '-' + ci)}
                        className={'text-xs font-mono px-1.5 py-0.5 rounded transition-all ' + (copied === 'chex-' + pi + '-' + ci ? 'bg-emerald-100 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
                        title={'Copy ' + c}>
                        {c.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* CSS var export */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button onClick={() => copy(
                      ':root {\n' + palette.colors.map((c,i) => '  --' + palette.name.toLowerCase().replace(/\s+/g,'-') + '-' + (i+1) + ': ' + c + ';').join('\n') + '\n}',
                      'css-curated-' + pi
                    )} className={'w-full text-xs font-semibold py-1.5 rounded-lg transition-all text-left px-2 ' + (copied === 'css-curated-' + pi ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-500')}>
                      {copied === 'css-curated-' + pi ? '✓ CSS copied!' : '{ } Export CSS Variables'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* All categories quick preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">All Categories Preview</div>
              <div className="flex flex-col gap-3">
                {CURATED_CATEGORIES.map((cat) => (
                  <div key={cat}>
                    <button onClick={() => setCuratedCat(cat)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 mb-2 flex items-center gap-2 transition-colors">
                      <span>{cat}</span>
                      <span className="text-slate-400 font-normal">({CURATED_PALETTES.filter(p => p.category === cat).length})</span>
                      <span className="text-xs" style={{ color: curatedCat === cat ? hex : '#94a3b8' }}>
                        {curatedCat === cat ? '← viewing' : '→ view'}
                      </span>
                    </button>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {CURATED_PALETTES.filter(p => p.category === cat).map((palette, pi) => (
                        <button key={pi} onClick={() => { setCuratedCat(cat); }}
                          className="flex-shrink-0 flex gap-0.5 rounded-lg overflow-hidden shadow-sm hover:scale-105 transition-transform border border-slate-200"
                          title={palette.name}>
                          {palette.colors.map((c, ci) => (
                            <div key={ci} className="w-5 h-8" style={{ backgroundColor: c }} />
                          ))}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ SHADES TAB ══ */}
        {activeTab === 'shades' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Tints & Shades Scale</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {Array.from({ length: 10 }, (_, i) => {
                const l = 95 - i * 9;
                const {r: nr, g: ng, b: nb} = hslToRgb(hsl.h, hsl.s, l);
                const c = rgbToHex(nr, ng, nb);
                const tc = getTextColor(c);
                return (
                  <div key={i} className="flex flex-col">
                    <button onClick={() => applyHex(c)}
                      className="h-16 sm:h-20 rounded-xl border border-white/20 hover:scale-105 transition-all shadow-sm"
                      style={{ backgroundColor: c }}>
                      <span className="text-xs font-bold opacity-0 hover:opacity-100" style={{ color: tc }}>
                        {(i + 1) * 100}
                      </span>
                    </button>
                    <div className="mt-1.5 text-center">
                      <div className="text-xs font-mono font-bold text-slate-600">{c.toUpperCase()}</div>
                      <div className="text-xs text-slate-400">{(i + 1) * 100}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Tailwind-style export */}
            <div className="mt-6 bg-slate-900 rounded-xl p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-mono">Tailwind Config</span>
                <button onClick={() => {
                  const lines = Array.from({length:10},(_,i) => {
                    const l = 95-i*9;
                    const {r:nr,g:ng,b:nb} = hslToRgb(hsl.h,hsl.s,l);
                    return '  ' + (i+1)*100 + ": '" + rgbToHex(nr,ng,nb) + "'";
                  });
                  copy('colors: {\n  primary: {\n' + lines.join(',\n') + '\n  }\n}', 'tw-export');
                }} className={'text-xs font-bold px-2 py-1 rounded-lg transition-all ' + (copied === 'tw-export' ? 'bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white')}>
                  {copied === 'tw-export' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap">
{`colors: {\n  primary: {\n` + Array.from({length:10},(_,i)=>{const l=95-i*9;const {r:nr,g:ng,b:nb}=hslToRgb(hsl.h,hsl.s,l);return `    ${(i+1)*100}: '${rgbToHex(nr,ng,nb)}'`;}).join(',\n') + `\n  }\n}`}
              </pre>
            </div>
          </div>
        )}

        {/* ══ HARMONY TAB ══ */}
        {activeTab === 'harmony' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Accessibility */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Accessibility / WCAG</div>
              <div className="flex flex-col gap-3">
                {[['#ffffff','White background'],['#000000','Black background'],['#f8fafc','Light gray bg'],['#1e293b','Dark navy bg']].map(([bg, label]) => {
                  const ratio = getContrastRatio(hex, bg);
                  const grade = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail';
                  const pass  = grade !== 'Fail';
                  return (
                    <div key={bg} className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: bg, borderColor: bg === '#ffffff' || bg === '#f8fafc' ? '#e2e8f0' : bg }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded" style={{ backgroundColor: hex }} />
                        <span className="text-xs font-medium" style={{ color: getTextColor(bg) }}>{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: getTextColor(bg) }}>{ratio}:1</span>
                        <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (pass ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white')}>
                          {grade}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Color info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Color Properties</div>
              <div className="space-y-2.5">
                {[
                  { label: 'Color Name',    value: colorName },
                  { label: 'Hue',           value: hsl.h + '° (' + (hsl.h < 30 ? 'Red' : hsl.h < 60 ? 'Orange' : hsl.h < 90 ? 'Yellow' : hsl.h < 150 ? 'Green' : hsl.h < 210 ? 'Cyan' : hsl.h < 270 ? 'Blue' : hsl.h < 330 ? 'Purple' : 'Red') + ')' },
                  { label: 'Saturation',    value: hsl.s + '% (' + (hsl.s < 20 ? 'Greyscale' : hsl.s < 50 ? 'Muted' : hsl.s < 80 ? 'Moderate' : 'Vivid') + ')' },
                  { label: 'Lightness',     value: hsl.l + '% (' + (hsl.l < 20 ? 'Very dark' : hsl.l < 40 ? 'Dark' : hsl.l < 60 ? 'Medium' : hsl.l < 80 ? 'Light' : 'Very light') + ')' },
                  { label: 'Temperature',   value: hsl.h >= 0 && hsl.h < 60 || hsl.h >= 330 ? '🔥 Warm' : hsl.h >= 60 && hsl.h < 150 ? '🌿 Neutral-warm' : '❄️ Cool' },
                  { label: 'Best text on',  value: textCol === '#ffffff' ? 'White text' : 'Dark text' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-xs font-bold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ PRESETS TAB ══ */}
        {activeTab === 'presets' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Named CSS Colors</div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {NAMED_COLORS.map(([name, nhex]) => (
                <button key={nhex} onClick={() => applyHex(nhex)} title={name + '\n' + nhex}
                  className="flex flex-col items-center gap-1 hover:scale-110 transition-transform group">
                  <div className="w-full aspect-square rounded-xl border-2 border-white shadow"
                    style={{ backgroundColor: nhex }} />
                  <span className="text-xs text-slate-500 text-center leading-tight hidden sm:block truncate w-full">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AD BOTTOM */}
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement — 728x90
        </div>

        {/* ── RELATED TOOLS ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Related Tools</h2>
          <p className="text-xs text-slate-400 mb-4">Other free tools useful alongside the color picker and palette generator.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RELATED_TOOLS.map((tool) => (
              <a key={tool.href} href={tool.href}
                className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all group"
                style={{ '--hover-border': hex }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = hex}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:transition-colors">{tool.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tool.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Free Online Color Picker & Palette Generator</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-3">
            TOOLBeans color picker lets you select any color using a native picker or HSL sliders, and instantly shows the exact values in HEX, RGB, HSL, HSV and CMYK format — all copyable with one click. Perfect for web designers, UI developers and digital artists who need precise color codes for CSS, Tailwind, Figma, Photoshop or Illustrator.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed">
            The palette generator automatically creates 7 color harmony schemes from your chosen color — complementary, analogous, triadic, split-complementary, tetradic, monochromatic and tints & shades. Each palette includes a CSS variables export and a Tailwind config snippet. The accessibility panel checks WCAG AA and AAA contrast ratios so your color combinations meet accessibility standards.
          </p>
        </div>
      </div>
    </div>
  );
}