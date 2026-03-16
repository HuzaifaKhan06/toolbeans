// app/api/contact/route.js
// Uses the same Gmail credentials as your existing email config
// npm install nodemailer   <-- run this once if not already installed

import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Basic validation
    if (!name || !email || !subject || !message) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Transporter — uses EMAIL_HOST/PORT/USER/PASSWORD from .env.local
    const transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const subjectLabels = {
      general:        'General Question',
      bug:            'Bug Report',
      'tool-request': 'Tool Request',
      feedback:       'Feedback',
      other:          'Other',
    };
    const subjectLabel = subjectLabels[subject] || subject;

    // Email to YOU
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      process.env.CONTACT_RECEIVER,
      replyTo: email,
      subject: '[TOOLBeans] ' + subjectLabel + ' from ' + name,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#4f46e5;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <h1 style="color:white;font-size:20px;margin:0;">New message from TOOLBeans</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:120px;">Name</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;"><strong>${name}</strong></td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;"><a href="mailto:${email}" style="color:#4f46e5;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Subject</td>
              <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;">${subjectLabel}</td>
            </tr>
          </table>
          <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px;">
            <p style="color:#64748b;font-size:13px;margin:0 0 10px;">Message</p>
            <p style="color:#1e293b;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#94a3b8;font-size:12px;">Sent via toolbeans.com/contact</p>
        </div>
      `,
    });

    // Auto-reply to the sender
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: 'We received your message — TOOLBeans',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:#4f46e5;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <h1 style="color:white;font-size:20px;margin:0;">Thanks for reaching out, ${name}!</h1>
          </div>
          <p style="color:#475569;font-size:14px;line-height:1.7;">
            We received your message and will reply within <strong>24 business hours</strong>.
          </p>
          <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin:20px 0;border-left:3px solid #4f46e5;">
            <p style="color:#64748b;font-size:13px;margin:0 0 6px;">Your message</p>
            <p style="color:#1e293b;font-size:14px;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#475569;font-size:14px;">
            While you wait, explore our
            <a href="https://toolbeans.com/tools" style="color:#4f46e5;">30 free tools</a>.
          </p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
          <p style="color:#94a3b8;font-size:12px;margin:0;">TOOLBeans — Free Online Developer Tools · toolbeans.com</p>
        </div>
      `,
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}