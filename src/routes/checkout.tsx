import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MEMBERSHIP_INCLUDES, yearlySavings } from "@/lib/pricing";
import { startMembershipCheckout } from "@/lib/server/checkout";
import { getPublicPricing } from "@/lib/server/public";
import { formatCurrency } from "@/lib/utils";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { lines } from "@/lib/site";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({
    plan: s.plan === "yearly" ? ("yearly" as const) : ("monthly" as const),
  }),
  component: Checkout,
});

function Checkout() {
  const { plan } = Route.useSearch();
  const { site, content } = usePublicSite();
  const navigate = useNavigate();
  const [monthly, setMonthly] = useState(4900);
  const [yearly, setYearly] = useState(49000);
  const [meeting, setMeeting] = useState(12000);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const price = plan === "yearly" ? yearly : monthly;
  const guard = useFormGuard();

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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
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
      toast.success("Membership reserved. Create your account to enter.");
      void navigate({ to: "/join", search: { token: res.token } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout could not finish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PublicNav />
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 md:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-earth">{site.checkoutKicker}</p>
          <h1 className="mt-3 font-display text-4xl">{site.checkoutTitle}</h1>
          <p className="mt-3 text-muted-foreground">
            {plan === "yearly" ? "Yearly membership" : "Monthly membership"} — {formatCurrency(price)}
            {plan === "yearly"
              ? ` (${formatCurrency(yearlySavings(monthly, yearly).perMonthCents)}/month, save ${yearlySavings(monthly, yearly).percent}%).`
              : "."}{" "}
            Payment runs in demo mode here; the architecture is ready for a live processor.
          </p>
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
              {busy ? "Reserving…" : `Complete membership · ${formatCurrency(price)}`}
            </Button>
            <p className="text-xs text-muted-foreground">
              No card number is stored. After this, you will create an account with the same email.
            </p>
          </form>
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
            <Link to="/pricing" className="text-primary">
              Compare monthly and yearly
            </Link>
          </p>
          <img src={content.images.checkout} alt="" className="media mt-6 h-48 w-full rounded-2xl object-cover" />
        </aside>
      </div>
      <PublicFooter />
    </div>
  );
}
