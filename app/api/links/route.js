export async function POST(request) {
  const { code, originalURL } = await request.json();

  // TODO: save to Supabase/PlanetScale
  // await db.links.create({ code, originalURL, createdAt: new Date() });

  return Response.json({ success: true });
}