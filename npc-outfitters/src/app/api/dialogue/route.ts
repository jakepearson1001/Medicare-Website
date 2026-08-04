import { NextResponse } from 'next/server';

/**
 * Contact form submission (the "Dialogue" page). Currently just validates
 * and logs.
 *
 * TODO: forward to your real inbox — e.g. via Resend, Postmark, SendGrid,
 * or a Slack/email webhook. Set the relevant API key as an env var and
 * send `{ subject, name, email, message }` along.
 */
export async function POST(request: Request) {
  let payload: { subject?: string; name?: string; email?: string; message?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid input. Dialogue tree broken.' }, { status: 400 });
  }

  const { subject, name, email, message } = payload;
  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Invalid input. Dialogue tree broken.' }, { status: 400 });
  }

  // eslint-disable-next-line no-console
  console.log('[dialogue submission]', { subject, name, email, message });

  return NextResponse.json({ ok: true });
}
