import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, LockKeyhole } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MEMBERSHIP_INCLUDES, yearlySavings } from "@/lib/pricing";
import { startMembershipCheckout, confirmStripeCheckout } from "@/lib/server/checkout";
import { getPublicPricing } from "@/lib/server/public";
import { formatCurrency } from "@/lib/utils";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { lines } from "@/lib/site";
import { usePublicSite } from "@/lib/use-public-site";
import { ReceiptPrinter } from "@/components/commerce/receipt-printer";
import { CheckoutCardAnimation } from "@/components/commerce/checkout-card-animation";
import { isMemberWalk } from "@/lib/preview-mode";

type EmbeddedCheckout = { mount: (selector: string) => void; destroy: () => void };
type StripeInstance = { initEmbeddedCheckout: (input: { clientSecret: string }) => Promise<EmbeddedCheckout> };
type StripeFactory = (publishableKey: string) => StripeInstance;

declare global {
  interface Window {
    Stripe?: StripeFactory;
  }
}

function loadStripeJs(): Promise<StripeFactory> {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');
    const script = existing ?? document.createElement("script");
    const done = () => (window.Stripe ? resolve(window.Stripe) : reject(new Error("Stripe.js did not load.")));
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => reject(new Error("Stripe.js could not load.")), { once: true });
    if (!existing) {
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({
    plan: s.plan === "yearly" ? ("yearly" as const) : ("monthly" as const),
    preview: s.preview === "1" || s.preview === 1 ? true : undefined,
    paid: s.paid === "1" || s.paid === 1 ? true : undefined,
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  component: Checkout,
});

function Checkout() {
  const { plan, preview, paid, session_id } = Route.useSearch();
  const mock = preview || isMemberWalk();
  const [printed, setPrinted] = useState(false);
  const [joinToken, setJoinToken] = useState("");
  const { site, content } = usePublicSite();
  const navigate = useNavigate();
  const [monthly, setMonthly] = useState(4900);
  const [yearly, setYearly] = useState(49000);
  const [meeting, setMeeting] = useState(12000);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [embedded, setEmbedded] = useState<{ clientSecret: string; publishableKey: string } | null>(null);
  const price = plan === "yearly" ? yearly : monthly;
  const guard = useFormGuard();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!paid || !session_id) return;
    void confirmStripeCheckout({ data: { sessionId: session_id } })
      .then((row) => {
        setJoinToken(row.token);
        if (row.email) setEmail(row.email);
        setPrinted(true);
      })
      .catch(() => toast.error("We could not confirm that Stripe payment yet."));
  }, [paid, session_id]);

  useEffect(() => {
    void getPublicPricing()
      .then((d) => {
        setMonthly(d.settings.monthlyPriceCents);
        setYearly(d.settings.yearlyPriceCents);
        const consult = d.products.find((p) => p.kind === "consultation" || p.slug === "consultation");
        if (consult) setMeeting(consult.price_cents);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!embedded) return;
    let checkout: EmbeddedCheckout | null = null;
    let cancelled = false;
    void loadStripeJs()
      .then((factory) => factory(embedded.publishableKey).initEmbeddedCheckout({ clientSecret: embedded.clientSecret }))
      .then((instance) => {
        if (cancelled) {
          instance.destroy();
          return;
        }
        checkout = instance;
        instance.mount("#stripe-embedded-checkout");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Secure payment form could not load."));
    return () => {
      cancelled = true;
      checkout?.destroy();
    };
  }, [embedded]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mock) {
        setPrinted(true);
        return;
      }
      const res = await startMembershipCheckout({
        data: {
          plan,
          email,
          name,
          code: code || undefined,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      setJoinToken(res.token);
      if (res.stripeClientSecret && res.stripePublishableKey) {
        setEmbedded({ clientSecret: res.stripeClientSecret, publishableKey: res.stripePublishableKey });
        toast.success("Secure Stripe checkout is ready below.");
        return;
      }
      if (res.stripeUrl) {
        toast.success("Opening secure Stripe checkout…");
        window.location.assign(res.stripeUrl);
        return;
      }
      setPrinted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout could not finish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PublicNav />
      {printed ? (
        <div className="px-4 py-16">
          <ReceiptPrinter
            plan={plan}
            amountCents={price}
            email={email}
            onDone={() => {
              if (mock) {
                void navigate({ to: "/app" });
                return;
              }
              void navigate({ to: "/join", search: { token: joinToken } });
            }}
          />
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-[1fr_0.9fr]">
          <div>
            <CheckoutCardAnimation amount={formatCurrency(price)} processing={busy} />
            <p className="mt-10 text-xs uppercase tracking-[0.2em] text-earth">{site.checkoutKicker}</p>
            <h1 className="mt-3 font-display text-4xl">{site.checkoutTitle}</h1>
            <p className="mt-3 text-muted-foreground">
              {plan === "yearly" ? "Yearly membership" : "Monthly membership"} — {formatCurrency(price)}
              {plan === "yearly"
                ? ` (${formatCurrency(yearlySavings(monthly, yearly).perMonthCents)}/month, save ${yearlySavings(monthly, yearly).percent}%).`
                : "."}{" "}
              Payment is securely processed by Stripe. After it clears, a receipt prints and you create your account.
            </p>

            {embedded ? (
              <section className="mt-8 overflow-hidden rounded-[28px] border border-border bg-card p-3 shadow-[0_28px_80px_-35px_rgba(20,30,28,.45)]">
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                  <LockKeyhole className="size-4 text-primary" /> Secure embedded Stripe checkout
                </div>
                <div id="stripe-embedded-checkout" className="min-h-[520px]" />
                <Button type="button" variant="ghost" className="mt-2" onClick={() => setEmbedded(null)}>
                  Change membership details
                </Button>
              </section>
            ) : (
              <form onSubmit={submit} className="mt-8 space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Discount or gift code</Label>
                  <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Optional" />
                </div>
                <HumanCheck
                  checked={guard.human}
                  onChecked={guard.setHuman}
                  honey={guard.honey}
                  onHoney={guard.setHoney}
                />
                <Button type="submit" className="w-full" disabled={busy || !guard.human}>
                  {busy ? "Preparing secure checkout…" : `Continue to payment · ${formatCurrency(price)}`}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Payment is processed by Stripe. Completing checkout means you agree to the{" "}
                  <Link to="/terms" className="underline">terms</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="underline">privacy</Link>{" "}
                  pages. Her First Meal personalizes your experience using the preferences you save. It is not medical care.
                </p>
              </form>
            )}
          </div>
          <aside className="rounded-[28px] bg-card p-6 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl">{site.checkoutAside}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {(lines(site.pricingIncludes).length ? lines(site.pricingIncludes) : MEMBERSHIP_INCLUDES).map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-clay" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-wash-blush px-4 py-3 text-sm text-blush-deep">
              The only extra after this is a private meeting with Maat — {formatCurrency(meeting)} per session,
              booked inside the house. Nothing else is billed on top of membership.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Want the other cadence?{" "}
              <Link to="/pricing" className="text-primary">Compare monthly and yearly</Link>
            </p>
            <img src={content.images.checkout} alt={content.alts.checkout} className="media mt-6 h-48 w-full rounded-2xl object-cover" />
          </aside>
        </div>
      )}
      <PublicFooter />
    </div>
  );
}
