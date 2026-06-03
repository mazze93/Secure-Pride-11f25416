import { EmailMessage } from 'cloudflare:email';

interface Env {
  SEND_EMAIL: { send(message: EmailMessage): Promise<void> };
  CONTACT_ENDPOINT?: string;
}

interface ContactBody {
  name?: unknown;
  email?: unknown;
  organization?: unknown;
  message?: unknown;
}

function buildMimeStream({
  from, to, replyTo, subject, text,
}: {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}): ReadableStream {
  const raw = [
    `From: Secure Pride <${from}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    text,
  ].join('\r\n');

  const bytes = new TextEncoder().encode(raw);
  return new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return Response.json({ error: 'Invalid content type.' }, { status: 400 });
  }

  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { name, email, organization, message } = body;

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return Response.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  if (!name.trim() || !email.trim() || !message.trim()) {
    return Response.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return Response.json({ error: 'Input exceeds allowed length.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const org = typeof organization === 'string' ? organization.slice(0, 200) : '';
  const subject = org ? `Contact from ${name} (${org})` : `Contact from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    org ? `Organization: ${org}` : null,
    '',
    message,
  ].filter(Boolean).join('\n');

  // Primary: Cloudflare Email Workers — no third party, stays in CF infrastructure
  if (env.SEND_EMAIL) {
    try {
      const msg = new EmailMessage(
        'contact-form@securepride.org',
        'hello@securepride.org',
        buildMimeStream({
          from: 'contact-form@securepride.org',
          to: 'hello@securepride.org',
          replyTo: email,
          subject,
          text,
        }),
      );
      await env.SEND_EMAIL.send(msg);
    } catch (err) {
      console.error('[contact-form] send error:', err);
      return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
    }
    return Response.json({ ok: true });
  }

  // Fallback: forward to a custom endpoint if configured
  if (env.CONTACT_ENDPOINT) {
    try {
      const upstream = await fetch(env.CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, organization: org, message }),
      });
      if (!upstream.ok) {
        return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
      }
    } catch {
      return Response.json({ error: 'Failed to send message. Please try again.' }, { status: 502 });
    }
    return Response.json({ ok: true });
  }

  // No delivery method bound — log only (expected during local dev)
  console.log('[contact-form]', { name, email, org, preview: message.slice(0, 80) });
  return Response.json({ ok: true });
}
