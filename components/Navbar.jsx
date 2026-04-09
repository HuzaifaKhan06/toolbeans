// components/Navbar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home',    href: '/'        },
  { label: 'Tools',   href: '/tools'   },
  { label: 'About',   href: '/about'   },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200" role="banner">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" aria-label="TOOLBeans Free Online Developer Tools Home" className="flex items-center gap-2 flex-shrink-0">
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">
            TOOL<span className="text-indigo-600">Beans</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" aria-hidden="true" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation" role="navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={
                'text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ' +
                (isActive(link.href)
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50')
              }
            >
              {link.label}
              {link.href === '/tools' && (
                <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">
                  39
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/tools" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200">
            ⚡ Try Tools Free
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={
                'text-sm font-medium px-4 py-3 rounded-lg transition-all flex items-center justify-between ' +
                (isActive(link.href)
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50')
              }
            >
              {link.label}
              {link.href === '/tools' && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                  39 free
                </span>
              )}
            </Link>
          ))}
          <Link href="/tools" onClick={() => setMenuOpen(false)} className="mt-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-3 rounded-xl text-center hover:bg-indigo-500 transition">
            ⚡ Try All 39 Tools Free
          </Link>
        </div>
      )}
    </header>
  );
}