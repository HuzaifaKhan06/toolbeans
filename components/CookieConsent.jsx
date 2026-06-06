'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'tb_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [fading,  setFading]  = useState(false);

  // On mount: check if user has already accepted — if so, never show
  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage blocked (private browsing edge cases) — just don't show
    }
  }, []);

  const handleAccept = () => {
    // Step 1: trigger CSS fade-out
    setFading(true);
    // Step 2: after animation completes, persist consent and remove from DOM
    setTimeout(() => {
      try {
        localStorage.setItem(CONSENT_KEY, 'accepted');
      } catch { /* ignore */ }
      setVisible(false);
    }, 450);
  };

  // Not visible at all — render nothing (no DOM node, no layout impact)
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position:   'fixed',
        bottom:     0,
        left:       0,
        right:      0,
        zIndex:     999,
        // Fade-out: opacity transitions from 1 → 0 over 450ms
        opacity:    fading ? 0 : 1,
        transform:  fading ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 450ms ease, transform 450ms ease',
      }}
    >
      {/* Thin top border accent in brand purple */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)' }} />

      {/* Banner body */}
      <div
        style={{
          background:   '#ffffff',
          borderTop:    '1px solid #e2e8f0',
          boxShadow:    '0 -4px 24px rgba(0,0,0,0.07)',
          padding:      '14px 24px',
        }}
      >
        {/* Inner layout: text left, buttons right — stacks on mobile */}
        <div
          style={{
            maxWidth:      '1152px',
            margin:        '0 auto',
            display:       'flex',
            alignItems:    'center',
            gap:           '16px',
            flexWrap:      'wrap',
          }}
        >
          {/* Cookie icon + text */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: '260px' }}>
            <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
              🍪
            </span>
            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.55', fontWeight: 400 }}>
              We use cookies to improve your experience and show relevant ads. By using TOOLBeans you agree to our use of cookies.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

            {/* Privacy Policy — text link */}
            <Link
              href="/privacy"
              style={{
                fontSize:       '13px',
                fontWeight:     600,
                color:          '#7c3aed',
                textDecoration: 'none',
                padding:        '8px 4px',
                whiteSpace:     'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              Privacy Policy
            </Link>

            {/* Accept — filled purple button */}
            <button
              onClick={handleAccept}
              style={{
                background:    '#7c3aed',
                color:         '#ffffff',
                border:        'none',
                borderRadius:  '10px',
                padding:       '9px 22px',
                fontSize:      '13px',
                fontWeight:    700,
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                letterSpacing: '0.01em',
                transition:    'background 150ms ease, transform 150ms ease, box-shadow 150ms ease',
                boxShadow:     '0 2px 8px rgba(124,58,237,0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = '#6d28d9';
                e.currentTarget.style.transform   = 'translateY(-1px)';
                e.currentTarget.style.boxShadow   = '0 4px 12px rgba(124,58,237,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = '#7c3aed';
                e.currentTarget.style.transform   = 'translateY(0)';
                e.currentTarget.style.boxShadow   = '0 2px 8px rgba(124,58,237,0.25)';
              }}
            >
              Accept
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}