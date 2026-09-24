/** Deliver house mail when a provider key is present. */

export type MailResult = { sent: boolean; reason?: string };

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function configuredFrom(): string | undefined {
  return env("MAIL_FROM") ?? env("RESEND_FROM");
}

export function mailConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY") && configuredFrom());
}

export async function sendHouseMail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<MailResult> {
  const to = input.to.trim().toLowerCase();
  if (!to.includes("@")) return { sent: false, reason: "missing-to" };

  const from = configuredFrom();
  const resend = env("RESEND_API_KEY");
  if (resend && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resend}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        text: input.text,
        html: input.html ?? `<pre>${input.text}</pre>`,
      }),
    });
    if (!response.ok) {
      // Do not log provider response bodies: they can contain recipient or request details.
      console.error("Resend rejected house mail", response.status);
      return { sent: false, reason: "provider" };
    }
    return { sent: true };
  }

  console.warn("Transactional email is not fully configured — RESEND_API_KEY and MAIL_FROM/RESEND_FROM are required.");
  return { sent: false, reason: "not-configured" };
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "your email";
  const keep = name.slice(0, 1);
  return `${keep}***@${domain}`;
}
