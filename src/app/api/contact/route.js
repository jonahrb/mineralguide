import { sendLeadEmail } from '../../../lib/email.js';

export const runtime = 'nodejs';

const clean = (value, max = 2000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const interests = new Set(['Financing', 'Purchase offer']);

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Please submit a valid request.' }, { status: 400 }); }

  // Quietly accept automated bot submissions without sending email.
  if (clean(body.website, 200)) return Response.json({ message: 'Your inquiry has been received.' }, { status: 201 });

  const firstName = clean(body.firstName, 60);
  const lastName = clean(body.lastName, 60);
  const email = clean(body.email, 254).toLowerCase();
  const state = clean(body.state, 80);
  const ownership = clean(body.ownership, 100);
  const interest = clean(body.interest, 40);
  const details = clean(body.details, 2000);

  if (!firstName || !lastName || !email || !state || !ownership || !interests.has(interest) || body.consent !== true) {
    return Response.json({ error: 'Please complete the required fields and consent.' }, { status: 400 });
  }
  if (!emailPattern.test(email)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });

  const to = process.env.LEAD_TO_EMAIL;
  const from = process.env.LEAD_FROM_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER;
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !to || !from) {
    return Response.json({ error: 'Email intake is not configured yet. Please try again later.' }, { status: 503 });
  }

  const text = [
    'New Mineral Guide inquiry', '',
    `Interest: ${interest}`, `Name: ${firstName} ${lastName}`, `Email: ${email}`,
    `State: ${state}`, `Ownership: ${ownership}`, `Details: ${details || '(none provided)'}`,
    'Consent to partner follow-up: Yes',
  ].join('\n');

  try {
    await sendLeadEmail({ to, from, replyTo: email, subject: `Mineral Guide ${interest} inquiry`, text });
  } catch {
    return Response.json({ error: 'We could not deliver your inquiry right now. Please try again later.' }, { status: 502 });
  }
  return Response.json({ message: 'Your inquiry has been sent. We’ll be in touch soon.' }, { status: 201 });
}
