const clean = (value, max = 2000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Please submit a valid request.' }, { status: 400 }); }

  // Quietly accept bot submissions without sending email.
  if (clean(body.website, 200)) return Response.json({ message: 'Your inquiry has been received.' }, { status: 201 });
  const firstName = clean(body.firstName, 60);
  const lastName = clean(body.lastName, 60);
  const email = clean(body.email, 254).toLowerCase();
  const state = clean(body.state, 80);
  const ownership = clean(body.ownership, 100);
  const interest = clean(body.interest, 40);
  const details = clean(body.details, 2000);
  if (!firstName || !lastName || !email || !state || !ownership || !interest || body.consent !== true) {
    return Response.json({ error: 'Please complete the required fields and consent.' }, { status: 400 });
  }
  if (!emailPattern.test(email)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return Response.json({ error: 'Email intake is not configured yet. Please try again later.' }, { status: 503 });
  }

  const text = [
    'New Mineral Guide inquiry', '',
    `Interest: ${interest}`, `Name: ${firstName} ${lastName}`, `Email: ${email}`,
    `State: ${state}`, `Ownership: ${ownership}`, `Details: ${details || '(none provided)'}`,
    `Consent to partner follow-up: ${body.consent ? 'Yes' : 'No'}`,
  ].join('\n');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject: `Mineral Guide ${interest} inquiry`, text }),
    });
    if (!response.ok) return Response.json({ error: 'We could not deliver your inquiry right now. Please try again later.' }, { status: 502 });
  } catch {
    return Response.json({ error: 'We could not deliver your inquiry right now. Please try again later.' }, { status: 502 });
  }
  return Response.json({ message: 'Your inquiry has been sent. We’ll be in touch soon.' }, { status: 201 });
}
