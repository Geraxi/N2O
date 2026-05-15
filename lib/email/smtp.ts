import nodemailer from 'nodemailer';

let _transport: nodemailer.Transporter | null = null;
export function smtp(): nodemailer.Transporter {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  return _transport;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  return smtp().sendMail({ from: process.env.SMTP_USER!, ...opts });
}
