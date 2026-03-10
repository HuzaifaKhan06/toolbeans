'use client';

// ═══════════════════════════════════════════════════════════
// FILE PATH: app/s/[code]/page.jsx
//
// SETUP INSTRUCTIONS:
// 1. Create folder: app/s/[code]/
// 2. Save this file as: app/s/[code]/page.jsx
// 3. DELETE route.js from that same folder (if it exists)
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const LS_KEY = 'toolbeans_links';

export default function ShortURLRedirect() {
  const params = useParams();
  const code   = params.code;

  const [status, setStatus]           = useState('loading');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    if (!code) { setStatus('notfound'); return; }

    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) { setStatus('notfound'); return; }

      const links = JSON.parse(raw);
      const match = links.find((l) => l.code === code);

      if (!match) { setStatus('notfound'); return; }

      // Increment click counter
      const updated = links.map((l) =>
        l.code === code ? { ...l, clicks: l.clicks + 1 } : l
      );
      localStorage.setItem(LS_KEY, JSON.stringify(updated));

      setDestination(match.originalURL);
      setStatus('found');

      // Redirect after 800ms
      setTimeout(() => { window.location.href = match.originalURL; }, 800);

    } catch {
      setStatus('notfound');
    }
  }, [code]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-slate-600 font-semibold text-sm">Looking up your link...</div>
          <div className="text-slate-400 text-xs mt-1 font-mono">/{code}</div>
        </div>
      </div>
    );
  }

  if (status === 'found') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
            ✓
          </div>
          <h1 className="text-lg font-extrabold text-slate-900 mb-2">Redirecting...</h1>
          <p className="text-xs text-slate-400 mb-4">You are being sent to:</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-mono text-slate-600 break-all">{destination}</p>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Not redirecting?{' '}
            <a href={destination} className="text-violet-600 font-semibold hover:underline">Click here</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-2xl mx-auto mb-4">
          🔗
        </div>
        <h1 className="text-lg font-extrabold text-slate-900 mb-2">Link Not Found</h1>
        <p className="text-sm text-slate-500 mb-2">
          The short link <span className="font-mono text-violet-600">/{code}</span> was not found.
        </p>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Short links are stored in your browser only. They work on the same device and browser where they were created.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/tools/url-shortener"
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm">
            Create a New Short Link
          </Link>
          <Link href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 px-6 rounded-xl transition-all text-sm">
            Go to TOOLBeans Home
          </Link>
        </div>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
          <div className="text-xs font-bold text-amber-700 mb-1">Why did this happen?</div>
          <ul className="text-xs text-amber-600 space-y-1 leading-relaxed list-disc list-inside">
            <li>Links are saved only in your browser storage</li>
            <li>Works only on the device where it was created</li>
            <li>Clearing browser history deletes all links</li>
            <li>Incognito/Private mode links do not persist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}