// app/api/convert/word-to-pdf/route.js
// This is the Next.js API route on Vercel
// It receives the file from the browser and forwards it to Railway backend
// The user never talks to Railway directly — only to your Vercel site

export const maxDuration = 60; // 60 second timeout for large files
export const dynamic     = 'force-dynamic';

export async function POST(request) {
  try {
    // Get the file from the browser request
    const formData = await request.formData();
    const file     = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      return Response.json({ error: 'Please upload a .docx or .doc file' }, { status: 400 });
    }

    // Check file size (50 MB max)
    if (file.size > 50 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Maximum size is 50 MB.' }, { status: 400 });
    }

    // Forward the file to Railway backend
    const backendUrl = process.env.BACKEND_URL; // e.g. https://toolbeans-backend.railway.app
    if (!backendUrl) {
      return Response.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    // Build the forwarded form data
    const forwardData = new FormData();
    forwardData.append('file', file, file.name);

    // Call Railway backend
    const backendResponse = await fetch(`${backendUrl}/convert/word-to-pdf`, {
      method:  'POST',
      headers: {
        'x-api-key': process.env.BACKEND_API_KEY || '',
      },
      body: forwardData,
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error || 'Conversion failed on backend' },
        { status: backendResponse.status }
      );
    }

    // Get the PDF bytes from Railway
    const pdfBuffer = await backendResponse.arrayBuffer();

    // Send PDF back to the browser
    const originalName  = file.name.replace(/\.[^.]+$/, '');
    const downloadName  = `TOOLBeans-${originalName}.pdf`;

    return new Response(pdfBuffer, {
      status:  200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length':      pdfBuffer.byteLength.toString(),
      },
    });

  } catch (err) {
    console.error('Word to PDF API error:', err);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}