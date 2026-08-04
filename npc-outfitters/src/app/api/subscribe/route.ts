import { NextResponse } from 'next/server';

/**
 * "JOIN THE SERVER" email capture. Currently just validates and logs.
 *
 * TODO to go live with Klaviyo:
 *   1. Create a Klaviyo private API key with `lists:write` access.
 *   2. Set KLAVIYO_API_KEY and KLAVIYO_LIST_ID in .env.local.
 *   3. POST to https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/
 *      with the email + list ID, using the Klaviyo Revision header.
 *
 * TODO to go live with Mailchimp instead:
 *   1. Create a Mailchimp API key and get your Audience (list) ID.
 *   2. Set MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID in .env.local.
 *   3. POST to https://<dc>.api.mailchimp.com/3.0/lists/<list_id>/members
 *      with { email_address, status: 'subscribed' }, using Basic auth
 *      ("anystring:<api-key>"). The <dc> is the suffix of your API key
 *      after the dash (e.g. "us21").
 */
export async function POST(request: Request) {
  let email: string | undefined;
  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return NextResponse.json({ error: 'Invalid input. Dialogue tree broken.' }, { status: 400 });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid input. Dialogue tree broken.' }, { status: 400 });
  }

  const klaviyoKey = process.env.KLAVIYO_API_KEY;
  const mailchimpKey = process.env.MAILCHIMP_API_KEY;

  if (!klaviyoKey && !mailchimpKey) {
    // eslint-disable-next-line no-console
    console.log(`[subscribe] ${email} (no email provider configured — logged only)`);
    return NextResponse.json({ ok: true, provider: 'none' });
  }

  // TODO: call the real provider here once keys are configured (see above).
  return NextResponse.json({ ok: true });
}
