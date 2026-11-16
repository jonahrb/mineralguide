import nodemailer from 'nodemailer';

export async function sendLeadEmail({ to, from, replyTo, subject, text }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass || !to)
    throw new Error('Lead email configuration is incomplete.');

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter.sendMail({ from: from || user, to, replyTo, subject, text });
}
