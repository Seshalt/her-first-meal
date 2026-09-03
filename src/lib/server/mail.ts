/** Deliver house mail when a provider key is present. */

export type MailResult = { sent: boolean; reason?: string };

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function mailConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY"));
}

export async function sendHouseMail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<MailResult> {
  const to = input.to.trim().toLowerCase();
  if (!to.includes("@")) return { sent: false, reason: "missing-to" };

  const from = env("MAIL_FROM") ?? env("RESEND_FROM") ?? "Her First Meal <onboarding@resend.dev>";
  const resend = env("RESEND_API_KEY");
  if (resend) {
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
      const detail = await response.text().catch(() => "");
      console.error("Resend rejected house mail", response.status, detail.slice(0, 300));
      return { sent: false, reason: "provider" };
    }
    return { sent: true };
  }

  console.warn("No RESEND_API_KEY — first-sign-in code was not emailed.");
  return { sent: false, reason: "not-configured" };
}

export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "your email";
  const keep = name.slice(0, 1);
  return `${keep}***@${domain}`;
}
