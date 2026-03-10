// app/s/[code]/route.js
// Server-side redirect — fast, works on ALL devices, SEO friendly
// DELETE the page.jsx in this folder — use this route.js instead

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  const { code } = await params;

  if (!code) notFound();

  // 1. Look up the code in Supabase
  const { data, error } = await supabase
    .from('links')
    .select('original_url, clicks')
    .eq('code', code)
    .single();

  if (error || !data) {
    // Code not found — redirect to tool with error message
    redirect('/tools/url-shortener?notfound=' + encodeURIComponent(code));
  }

  // 2. Increment click count (fire and forget — don't await)
  supabase
    .from('links')
    .update({ clicks: data.clicks + 1 })
    .eq('code', code)
    .then(() => {});

  // 3. Redirect to original URL (308 = Permanent Redirect)
  redirect(data.original_url);
}