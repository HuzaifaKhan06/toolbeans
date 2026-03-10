import { redirect } from 'next/navigation';

// This will query your database in production
export async function GET(request, { params }) {
  const { code } = await params;

  // TODO after deployment: replace with real DB query
  // const link = await db.links.findOne({ code });
  // if (link) redirect(link.originalURL);

  redirect('/tools/url-shortener?notfound=' + code);
}