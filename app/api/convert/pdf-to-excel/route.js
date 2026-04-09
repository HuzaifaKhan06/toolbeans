// app/api/convert/pdf-to-excel/route.js
export const maxDuration = 60;
export const dynamic     = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file     = formData.get('file');

    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf'))
      return Response.json({ error: 'Please upload a .pdf file' }, { status: 400 });

    if (file.size > 50 * 1024 * 1024)
      return Response.json({ error: 'File too large. Maximum size is 50 MB.' }, { status: 400 });

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl)
      return Response.json({ error: 'Backend URL not configured' }, { status: 500 });

    const forwardData = new FormData();
    forwardData.append('file', file, file.name);

    const backendResponse = await fetch(`${backendUrl}/convert/pdf-to-excel`, {
      method:  'POST',
      headers: { 'x-api-key': process.env.BACKEND_API_KEY || '' },
      body:    forwardData,
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || 'Conversion failed' },
        { status: backendResponse.status }
      );
    }

    const buffer       = await backendResponse.arrayBuffer();
    const originalName = file.name.replace(/\.[^.]+$/, '');
    const downloadName = `TOOLBeans-${originalName}.xlsx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length':      buffer.byteLength.toString(),
      },
    });

  } catch (err) {
    console.error('pdf-to-excel API error:', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}