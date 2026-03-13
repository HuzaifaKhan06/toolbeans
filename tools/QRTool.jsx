'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';

const INPUT_TYPES = [
  { key: 'url',      label: 'URL',      icon: '🔗', placeholder: 'https://example.com',             prefix: '' },
  { key: 'text',     label: 'Text',     icon: '📝', placeholder: 'Enter any text…',                 prefix: '' },
  { key: 'phone',    label: 'Phone',    icon: '📞', placeholder: '+1234567890',                      prefix: 'tel:' },
  { key: 'email',    label: 'Email',    icon: '✉️',  placeholder: 'hello@example.com',               prefix: 'mailto:' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '💬', placeholder: '+92300xxxxxxx (with country code)', prefix: '' },
  { key: 'wifi',     label: 'Wi-Fi',    icon: '📶', placeholder: 'Network name (SSID)',              prefix: '' },
  { key: 'vcard',    label: 'Contact',  icon: '👤', placeholder: 'Full Name',                        prefix: '' },
];

const SIZE_PRESETS = [
  { label: 'Small',  value: 150 },
  { label: 'Medium', value: 250 },
  { label: 'Large',  value: 400 },
];

const ERROR_LEVELS = [
  { label: 'L 7%',  value: 'L' },
  { label: 'M 15%', value: 'M' },
  { label: 'Q 25%', value: 'Q' },
  { label: 'H 30%', value: 'H' },
];

const STYLE_PRESETS = [
  { label: 'Classic',  fg: '#000000', bg: '#FFFFFF' },
  { label: 'Indigo',   fg: '#4F46E5', bg: '#EEF2FF' },
  { label: 'Ocean',    fg: '#0891B2', bg: '#ECFEFF' },
  { label: 'Forest',   fg: '#15803D', bg: '#F0FDF4' },
  { label: 'Rose',     fg: '#BE123C', bg: '#FFF1F2' },
  { label: 'Midnight', fg: '#FFFFFF', bg: '#0F172A' },
];

export default function QRTool() {
  const canvasRef = useRef(null);

  // ── Input State ──
  const [inputType, setInputType]   = useState('url');
  const [text, setText]             = useState('');
  const [wifiSSID, setWifiSSID]     = useState('');
  const [wifiPass, setWifiPass]     = useState('');
  const [wifiSec, setWifiSec]       = useState('WPA');
  const [vcardName, setVcardName]   = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');

  // ── Settings State ──
  const [size, setSize]             = useState(250);
  const [fgColor, setFgColor]       = useState('#000000');
  const [bgColor, setBgColor]       = useState('#FFFFFF');
  const [errorLevel, setErrorLevel] = useState('M');
  const [margin, setMargin]         = useState(2);

  // ── UI State ──
  const [generated, setGenerated]   = useState(false);
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(false);
  const [scanTest, setScanTest]     = useState('');
  const [downloading, setDownloading] = useState('');

  // ── Build QR Data ──
  const buildData = () => {
    if (inputType === 'wifi') {
      return `WIFI:T:${wifiSec};S:${wifiSSID};P:${wifiPass};;`;
    }
    if (inputType === 'vcard') {
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
    }
    if (inputType === 'whatsapp') {
      const cleaned = text.replace(/\D/g, '');
      return `https://wa.me/${cleaned}`;
    }
    const type = INPUT_TYPES.find((t) => t.key === inputType);
    return (type?.prefix || '') + text;
  };

  // ── Validate ──
  const validate = () => {
    if (inputType === 'wifi') {
      if (!wifiSSID.trim()) return 'Please enter a Wi-Fi network name (SSID).';
      return '';
    }
    if (inputType === 'vcard') {
      if (!vcardName.trim()) return 'Please enter a contact name.';
      return '';
    }
    if (!text.trim()) return 'Please enter some content to generate a QR code.';
    if (text.length > 2000) return 'Content is too long. Maximum 2000 characters allowed.';
    if (inputType === 'url') {
      try { new URL(text); } catch { return 'Please enter a valid URL including https://'; }
    }
    if (inputType === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'Please enter a valid email address.';
    }
    if (inputType === 'whatsapp') {
      if (!text.trim()) return 'Please enter a WhatsApp number.';
    }
    return '';
  };

  // ── Render QR to Canvas ──
  const renderToCanvas = async (data) => {
    if (!canvasRef.current || !data) return;
    await QRCode.toCanvas(canvasRef.current, data, {
      width: size,
      margin,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: errorLevel,
    });
  };

  // ── Generate ──
  const generate = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    const data = buildData();
    try {
      await renderToCanvas(data);
      setGenerated(true);
      setScanTest(data);
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'qr_generated', { type: inputType });
      }
    } catch {
      setError('Failed to generate QR code. Please try again.');
    }
  };

  // ── Auto re-render when style settings change ──
  useEffect(() => {
    if (!generated || !scanTest) return;
    QRCode.toCanvas(canvasRef.current, scanTest, {
      width: size,
      margin,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: errorLevel,
    }).catch(() => {});
  }, [size, fgColor, bgColor, errorLevel, margin]);

  // ── Download PNG ──
  const downloadPNG = () => {
    if (!canvasRef.current) return;
    setDownloading('png');
    try {
      const link = document.createElement('a');
      link.download = 'toolbeans-qr.png';
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'qr_downloaded', { format: 'png' });
      }
    } finally {
      setTimeout(() => setDownloading(''), 1000);
    }
  };

  // ── Download SVG (centered on A4) ──
  const downloadSVG = async () => {
    const data = buildData();
    if (!data) return;
    setDownloading('svg');
    try {
      const qrSvgString = await QRCode.toString(data, {
        type: 'svg',
        width: size,
        margin,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorLevel,
      });

      // A4 page at 96dpi
      const pageW = 794;
      const pageH = 1123;
      const x = Math.round((pageW - size) / 2);
      const y = Math.round((pageH - size) / 2);

      // Extract inner SVG content
      const innerMatch = qrSvgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
      const innerSVG = innerMatch ? innerMatch[1] : '';

      const centeredSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${pageW}" height="${pageH}" viewBox="0 0 ${pageW} ${pageH}">
  <rect width="${pageW}" height="${pageH}" fill="white"/>
  <g transform="translate(${x}, ${y})">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${innerSVG}
    </svg>
  </g>
</svg>`;

      const blob = new Blob([centeredSVG], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'TOOLBeans-qr.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'qr_downloaded', { format: 'svg' });
      }
    } catch {
      setError('SVG export failed. Please try again.');
    } finally {
      setTimeout(() => setDownloading(''), 1000);
    }
  };

  // ── Download PDF (centered on A4) ──
  const downloadPDF = async () => {
    if (!canvasRef.current) return;
    setDownloading('pdf');
    try {
      const { jsPDF } = await import('jspdf');

      // A4 in mm
      const pageW = 210;
      const pageH = 297;

      // Convert px to mm (96dpi)
      const qrMM = Math.round((size / 96) * 25.4);
      const x = (pageW - qrMM) / 2;
      const y = (pageH - qrMM) / 2;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // White background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageW, pageH, 'F');

      // QR code centered
      const imgData = canvasRef.current.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, qrMM, qrMM);

      // Footer label
      pdf.setFontSize(9);
      pdf.setTextColor(180, 180, 180);
      pdf.text('Generated by TOOLBeans TOOLBeans.dev', pageW / 2, pageH - 10, { align: 'center' });

      pdf.save('TOOLBeans-qr.pdf');

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'qr_downloaded', { format: 'pdf' });
      }
    } catch {
      setError('PDF export failed. Please try again.');
    } finally {
      setTimeout(() => setDownloading(''), 1000);
    }
  };

  // ── Copy Image to Clipboard ──
  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch {
      setError('Could not copy image. Try downloading instead.');
    }
  };

  const currentType = INPUT_TYPES.find((t) => t.key === inputType);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b border-slate-100 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-cyan-50 text-cyan-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Utility Tool
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            QR Code{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>
          <p className="text-slate-500 font-light text-base max-w-xl mx-auto">
            Generate QR codes for URLs, text, Wi-Fi, contacts and more.
            Customize colors, download as PNG, SVG or PDF 100% free and private.
          </p>
        </div>
      </section>

      {/* ── AD ── */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
          Advertisement 728×90
        </div>
      </div>

      {/* ── MAIN TOOL ── */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── LEFT PANEL ── */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* QR Type Selector */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                QR Type
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {INPUT_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setInputType(t.key);
                      setText('');
                      setGenerated(false);
                      setError('');
                      setScanTest('');
                    }}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 transition-all duration-200 text-center
                      ${inputType === t.key
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Fields */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {currentType?.icon} {currentType?.label} Content
              </label>

              {/* WiFi */}
              {inputType === 'wifi' && (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={wifiSSID}
                    onChange={(e) => setWifiSSID(e.target.value)}
                    placeholder="Network Name (SSID) *"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                  />
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    placeholder="Password (leave empty if open network)"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                  />
                  <select
                    value={wifiSec}
                    onChange={(e) => setWifiSec(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white text-slate-600"
                  >
                    <option value="WPA">WPA / WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No Password</option>
                  </select>
                </div>
              )}

              {/* vCard */}
              {inputType === 'vcard' && (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={vcardName}
                    onChange={(e) => setVcardName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                  />
                  <input
                    type="tel"
                    value={vcardPhone}
                    onChange={(e) => setVcardPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                  />
                  <input
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                  />
                </div>
              )}

              {/* Standard */}
              {inputType !== 'wifi' && inputType !== 'vcard' && (
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={currentType?.placeholder}
                    rows={3}
                    maxLength={2000}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none"
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-slate-300">
                    {text.length}/2000
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-3 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-rose-600 font-medium">
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Customization */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Customization
              </label>

              {/* Size */}
              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-500 mb-2">Size</div>
                <div className="flex gap-2">
                  {SIZE_PRESETS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSize(s.value)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all
                        ${size === s.value
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                    >
                      {s.label}
                      <span className="block text-xs opacity-60 font-normal mt-0.5">{s.value}px</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Presets */}
              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-500 mb-2">Style Presets</div>
                <div className="flex gap-2 flex-wrap">
                  {STYLE_PRESETS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { setFgColor(s.fg); setBgColor(s.bg); }}
                      title={s.label}
                      className={`w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 flex items-center justify-center
                        ${fgColor === s.fg && bgColor === s.bg
                          ? 'border-indigo-500 scale-110 shadow-md'
                          : 'border-slate-200 hover:border-slate-400'
                        }`}
                      style={{ background: s.bg }}
                    >
                      <div className="w-4 h-4 rounded-sm" style={{ background: s.fg }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">QR Color</div>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 transition-colors">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500">{fgColor.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Background</div>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 transition-colors">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-500">{bgColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Error Correction + Margin */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">Error Correction</div>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-400 bg-white text-slate-600"
                  >
                    {ERROR_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-2">
                    Margin <span className="text-indigo-600">{margin}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={6}
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-indigo-600 mt-3"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm flex items-center justify-center gap-2"
            >
              📱 Generate QR Code
            </button>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 self-start">
                Preview
              </label>

              <div
                className={`rounded-2xl p-4 border-2 transition-all duration-300
                  ${generated ? 'border-indigo-200 shadow-md' : 'border-dashed border-slate-200'}`}
                style={{ background: bgColor }}
              >
                <canvas ref={canvasRef} className="rounded-xl block" />
                {!generated && (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-300 text-center">
                    <div className="text-5xl mb-3">📱</div>
                    <div className="text-xs leading-relaxed">
                      Configure settings<br />and click Generate
                    </div>
                  </div>
                )}
              </div>

              {/* Encoded Data Preview */}
              {generated && scanTest && (
                <div className="mt-4 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Encodes
                  </div>
                  <p className="text-xs text-slate-600 font-mono break-all line-clamp-3 leading-relaxed">
                    {scanTest}
                  </p>
                </div>
              )}
            </div>

            {/* Download Options */}
            {generated && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Download / Export
                </label>
                <div className="flex flex-col gap-3">

                  {/* PNG */}
                  <button
                    onClick={downloadPNG}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 text-sm flex items-center justify-center gap-2"
                  >
                    {downloading === 'png' ? '⏳ Saving…' : '⬇️ Download PNG'}
                  </button>

                  {/* SVG */}
                  <button
                    onClick={downloadSVG}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    {downloading === 'svg' ? '⏳ Saving…' : '⬇️ Download SVG'}
                  </button>

                  {/* PDF */}
                  <button
                    onClick={downloadPDF}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    {downloading === 'pdf' ? '⏳ Generating PDF…' : '⬇️ Download PDF (A4)'}
                  </button>

                  {/* Copy Image */}
                  <button
                    onClick={copyImage}
                    className={`w-full font-bold py-3 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 border
                      ${copied
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                  >
                    {copied ? '✓ Image Copied!' : '⎘ Copy Image'}
                  </button>
                </div>

                {/* Format Info */}
                <div className="mt-4 space-y-1.5">
                  {[
                    { fmt: 'PNG', desc: 'Best for web & social media' },
                    { fmt: 'SVG', desc: 'Best for logos & vector editors' },
                    { fmt: 'PDF', desc: 'Best for printing & documents' },
                  ].map((f) => (
                    <div key={f.fmt} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-bold text-slate-500 w-8">{f.fmt}</span>
                      <span>{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
                💡 Pro Tips
              </div>
              <ul className="space-y-2">
                {[
                  'Use Error Correction H if adding a logo over QR.',
                  'SVG & PDF formats are best for printing.',
                  'Minimum 2cm printed size for reliable scanning.',
                  'High contrast colors scan most reliably.',
                  'Always test your QR before printing.',
                  'Use Wi-Fi type to share network instantly.',
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-indigo-700 flex items-start gap-1.5">
                    <span className="flex-shrink-0 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── AD ── */}
        <div className="mt-8">
          <div className="w-full h-14 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-xs text-slate-400 uppercase tracking-widest">
            Advertisement 728×90
          </div>
        </div>

        {/* ── SEO CONTENT ── */}
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900 mb-5">
            What Can You Do With This QR Code Generator?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🔗', title: 'Website Links',        desc: 'Share your website or portfolio with a scannable QR code.' },
              { icon: '📶', title: 'Wi-Fi Sharing',        desc: 'Let guests connect to Wi-Fi instantly no typing passwords.' },
              { icon: '👤', title: 'Digital Business Card', desc: 'Share contact details with a single scan using vCard format.' },
              { icon: '💬', title: 'WhatsApp Direct',      desc: 'Open a WhatsApp chat instantly great for businesses.' },
              { icon: '✉️',  title: 'Email Links',          desc: 'Pre-fill an email so customers can contact you in one scan.' },
              { icon: '🖨️', title: 'Print Ready PDF',      desc: 'Download PDF with QR perfectly centered on A4 for printing.' },
            ].map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{f.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}