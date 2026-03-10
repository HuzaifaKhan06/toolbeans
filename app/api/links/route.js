// app/api/links/route.js
// Handles: POST (create link), GET (list links), DELETE (remove link)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateCode(length = 6) {
  let result = '';
  // Use Math.random on server (no Web Crypto needed here)
  for (let i = 0; i < length; i++) {
    result += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return result;
}

function isValidURL(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

function isValidAlias(alias) {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(alias);
}

// ── BLOCKED BRAND NAMES ──
const BLOCKED_BRANDS = [
  'netflix','youtube','spotify','twitch','disney','hulu','facebook','instagram',
  'twitter','tiktok','snapchat','linkedin','reddit','telegram','whatsapp','discord',
  'google','apple','microsoft','amazon','samsung','paypal','stripe','visa',
  'mastercard','binance','coinbase','bitcoin','shopify','ebay','github','gitlab',
  'vercel','netlify','cloudflare','zoom','slack','teams','gmail','outlook',
  'uber','lyft','airbnb','bank','banking','wallet','loan','credit',
  'admin','support','login','signin','signup','verify','verification',
  'secure','security','official','real','legit','authentic','helpdesk',
  'customer','service','account','password','reset','toolbeans',
];

function checkBrandAlias(alias) {
  const lower = alias.toLowerCase().replace(/[-_]/g, '');
  return BLOCKED_BRANDS.find((brand) => lower.includes(brand)) || null;
}

// ══════════════════════════════
// POST /api/links — Create link
// ══════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json();
    const { originalURL, customAlias } = body;

    if (!originalURL || !isValidURL(originalURL)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    let code = customAlias ? customAlias.trim() : null;

    if (code) {
      if (!isValidAlias(code)) {
        return NextResponse.json({ error: 'Invalid alias format. Use 3-30 chars: letters, numbers, - and _' }, { status: 400 });
      }
      const blocked = checkBrandAlias(code);
      if (blocked) {
        return NextResponse.json({ error: 'Alias contains protected brand name: ' + blocked }, { status: 400 });
      }
      // Check if custom alias already exists
      const { data: existing } = await supabase
        .from('links')
        .select('code')
        .eq('code', code)
        .single();
      if (existing) {
        return NextResponse.json({ error: 'Alias "' + code + '" is already taken. Try another.' }, { status: 409 });
      }
    } else {
      // Auto-generate a unique code
      let attempts = 0;
      while (attempts < 10) {
        const candidate = generateCode(6);
        const { data: existing } = await supabase
          .from('links')
          .select('code')
          .eq('code', candidate)
          .single();
        if (!existing) { code = candidate; break; }
        attempts++;
      }
      if (!code) {
        return NextResponse.json({ error: 'Could not generate a unique code. Try again.' }, { status: 500 });
      }
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('links')
      .insert({
        code,
        original_url: originalURL,
        is_custom:    !!customAlias,
        clicks:       0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 });
    }

    const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolbeans.com';

    return NextResponse.json({
      id:          data.id,
      code:        data.code,
      shortURL:    siteURL + '/s/' + data.code,
      originalURL: data.original_url,
      clicks:      data.clicks,
      isCustom:    data.is_custom,
      createdAt:   data.created_at,
    }, { status: 201 });

  } catch (err) {
    console.error('POST /api/links error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ══════════════════════════════════════
// GET /api/links?limit=50 — List links
// ══════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolbeans.com';

    const links = (data || []).map((row) => ({
      id:          row.id,
      code:        row.code,
      shortURL:    siteURL + '/s/' + row.code,
      originalURL: row.original_url,
      clicks:      row.clicks,
      isCustom:    row.is_custom,
      createdAt:   row.created_at,
    }));

    return NextResponse.json({ links });

  } catch (err) {
    console.error('GET /api/links error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ════════════════════════════════════════════
// DELETE /api/links?code=xxx — Delete a link
// ════════════════════════════════════════════
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('code', code);

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('DELETE /api/links error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}