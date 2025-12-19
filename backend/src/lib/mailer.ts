import nodemailer from "nodemailer";

export interface ContactMailPayload {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  category: string;
  subject: string;
  message: string;
  createdAt?: Date | string;
}

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : smtpPort === 465;
const smtpFrom = process.env.SMTP_FROM || smtpUser;
const smtpTo = process.env.SMTP_TO;

let cachedTransport: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass || !smtpTo) {
    return null;
  }
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }
  return cachedTransport;
}

export async function sendContactNotification(payload: ContactMailPayload) {
  const transporter = getTransporter();
  if (!transporter || !smtpFrom || !smtpTo) {
    return { sent: false, skipped: true };
  }

  const createdAt = payload.createdAt
    ? new Date(payload.createdAt).toLocaleString()
    : new Date().toLocaleString();

  const text = [
    `New contact message from ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.company ? `Company: ${payload.company}` : null,
    `Category: ${payload.category}`,
    `Subject: ${payload.subject}`,
    `Received: ${createdAt}`,
    "",
    payload.message,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h2>New Contact Message</h2>
    <p><strong>Name:</strong> ${payload.name}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    ${payload.phone ? `<p><strong>Phone:</strong> ${payload.phone}</p>` : ""}
    ${payload.company ? `<p><strong>Company:</strong> ${payload.company}</p>` : ""}
    <p><strong>Category:</strong> ${payload.category}</p>
    <p><strong>Subject:</strong> ${payload.subject}</p>
    <p><strong>Received:</strong> ${createdAt}</p>
    <hr />
    <pre style="white-space:pre-wrap;font-family:inherit;">${payload.message}</pre>
  `;

  await transporter.sendMail({
    from: smtpFrom,
    to: smtpTo,
    subject: `Hey, just received a contact notification from the website about ${payload.category} - (from ${payload.name})`,
    text,
    html,
  });

  return { sent: true, skipped: false };
}
