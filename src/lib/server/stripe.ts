function stripeKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

export function stripeConfigured(): boolean {
  return Boolean(stripeKey());
}

export function publicOrigin(): string {
  const explicit = process.env.APP_URL?.trim() || process.env.BETTER_AUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const host = (process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "").replace(/^https?:\/\//, "");
  if (host) return `https://${host.replace(/\/$/, "")}`;
  return "https://her-first-meal-now.vercel.app";
}

async function stripeSession(body: URLSearchParams): Promise<{ url: string } | { error: string }> {
  const key = stripeKey();
  if (!key) return { error: "Stripe is not connected yet." };
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const json = (await res.json()) as { url?: string; error?: { message?: string } };
  if (!res.ok || !json.url) return { error: json.error?.message ?? "Stripe could not start checkout." };
  return { url: json.url };
}

export async function createStripeCheckout(input: {
  token: string;
  email: string;
  name: string;
  plan: "monthly" | "yearly";
  priceCents: number;
  origin: string;
}): Promise<{ url: string } | { error: string }> {
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("customer_email", input.email);
  body.set("client_reference_id", input.token);
  body.set("success_url", `${input.origin}/checkout?paid=1&plan=${input.plan}&session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${input.origin}/checkout?plan=${input.plan}`);
  body.set("metadata[token]", input.token);
  body.set("metadata[plan]", input.plan);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(input.priceCents));
  body.set("line_items[0][price_data][recurring][interval]", input.plan === "yearly" ? "year" : "month");
  body.set("line_items[0][price_data][product_data][name]", "Her First Meal membership");
  body.set("line_items[0][price_data][product_data][description]", input.plan === "yearly" ? "Yearly membership" : "Monthly membership");
  body.set("subscription_data[metadata][token]", input.token);
  return stripeSession(body);
}

export async function createStripeMeetingCheckout(input: {
  email: string;
  name: string;
  priceCents: number;
  origin: string;
  productId: number;
  userId: string;
  startsAt?: string;
  type?: string;
}): Promise<{ url: string } | { error: string }> {
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("customer_email", input.email);
  body.set("client_reference_id", `meet-${input.userId}-${Date.now()}`);
  body.set("success_url", `${input.origin}/app/appointments?paid=1&session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", input.startsAt ? `${input.origin}/app/appointments` : `${input.origin}/app/store`);
  body.set("metadata[kind]", "meeting");
  body.set("metadata[userId]", input.userId);
  body.set("metadata[productId]", String(input.productId));
  if (input.startsAt) body.set("metadata[startsAt]", input.startsAt);
  if (input.type) body.set("metadata[type]", input.type);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(input.priceCents));
  body.set("line_items[0][price_data][product_data][name]", "A meeting with Maat");
  body.set(
    "line_items[0][price_data][product_data][description]",
    input.startsAt ? "One 45-minute live session — billed on Stripe, then the time is held." : "One 45-minute live session with Maat.",
  );
  return stripeSession(body);
}

export async function stripeSessionPaid(sessionId: string): Promise<{
  paid: boolean;
  token?: string;
  email?: string;
  kind?: string;
  userId?: string;
  productId?: number;
  startsAt?: string;
  type?: string;
}> {
  const key = stripeKey();
  if (!key) return { paid: false };
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const json = (await res.json()) as {
    payment_status?: string;
    status?: string;
    customer_email?: string | null;
    customer_details?: { email?: string | null };
    metadata?: { token?: string; kind?: string; userId?: string; productId?: string; startsAt?: string; type?: string };
    client_reference_id?: string | null;
  };
  const paid = json.payment_status === "paid" || json.status === "complete";
  return {
    paid,
    token: json.metadata?.token || json.client_reference_id || undefined,
    email: json.customer_details?.email || json.customer_email || undefined,
    kind: json.metadata?.kind,
    userId: json.metadata?.userId,
    productId: json.metadata?.productId ? Number(json.metadata.productId) : undefined,
    startsAt: json.metadata?.startsAt,
    type: json.metadata?.type,
  };
}
