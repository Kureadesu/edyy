import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email || !body.email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const feeling = escapeHtml(body.feeling);
  const idea = escapeHtml(
    body.dateIdea === 'custom'
      ? `Suggested - ${body.customIdea}`
      : body.dateIdea
  );
  const location = escapeHtml(body.dateLocation?.trim() || 'Not specified');
  const date = escapeHtml(body.date);
  const time = escapeHtml(body.time);
  const email = escapeHtml(body.email);

  await resend.emails.send({
    from: 'Kurea <onboarding@resend.dev>',
    to: 'balaba.claire2003@gmail.com',
    replyTo: body.email,
    subject: 'I would like to take you out on a date...',

    html: `
      <div style="background:#f7f3ed;padding:32px 16px;font-family:Arial,sans-serif;color:#3d3935;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:36px;border:1px solid #e5ddd3;">
          <p style="margin:0 0 12px;color:#a47c62;font-size:12px;letter-spacing:2px;text-transform:uppercase;">
            Date planner
          </p>

          <h1 style="margin:0 0 12px;font-size:30px;font-weight:500;">
            A little plan is taking shape.
          </h1>

          <p style="margin:0 0 28px;color:#716b65;line-height:1.6;">
            Thank you for participating on my very cutesy survey : D
          </p>

            <p style="padding:16px 0;margin:0;border-bottom:1px solid #eee5dc;">
              <strong>The plan:</strong><br />
              ${idea}
            </p>

            <p style="padding:16px 0;margin:0;border-bottom:1px solid #eee5dc;">
              <strong>Where:</strong><br />
              ${location}
            </p>

            <p style="padding:16px 0;margin:0;">
              <strong>When:</strong><br />
              ${date} at ${time}
            </p>
          </div>
      </div>
    `,

    text: `Kurea @ 2026.`
  });

  return NextResponse.json({ success: true });
}