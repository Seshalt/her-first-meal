import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_INCLUDES, yearlySavings } from "@/lib/pricing";
import { getPublicPricing } from "@/lib/server/public";
import { lines } from "@/lib/site";
import { usePublicSite } from "@/lib/use-public-site";
import { cn, formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  loader: async () => {
    try {
      return await getPublicPricing();
    } catch {
      return null;
    }
  },
  component: Pricing,
});

function Pricing() {
  const priced = Route.useLoaderData();
  const { site, content } = usePublicSite();
  const monthly = priced?.settings.monthlyPriceCents ?? 4900;
  const yearly = priced?.settings.yearlyPriceCents ?? 49000;
  const consult = priced?.products.find((p) => p.kind === "consultation" || p.slug === "consultation");
  const meeting = consult?.price_cents ?? 12000;
  const [yearlyOn, setYearlyOn] = useState(true);

  const save = yearlySavings(monthly, yearly);
  const includes = lines(site.pricingIncludes);
  const points = includes.length ? includes : [...MEMBERSHIP_INCLUDES];
  const meetingPoints = lines(site.meetingPoints);

  return (
    <div className="bg-ink">
      <PublicNav overlay />
      <section className="pricing-stage min-h-dvh px-4 pb-16 pt-24 md:px-6 md:pb-24 md:pt-28">
        <div className="pricing-orbs" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="pricing-photo" aria-hidden>
          <img src={content.images.pricing} alt="" />
        </div>
        <div className="pricing-veil" />

        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-gold">{site.pricingKicker}</p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.95] text-paper">
            {site.pricingTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-paper/75 md:text-base">
            {site.pricingBody}
          </p>

          <div className="mt-7 flex flex-col items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-paper/80">
              <span className={cn(!yearlyOn && "text-paper")}>Monthly</span>
              <span className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/15 p-1">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={yearlyOn}
                  onChange={(e) => setYearlyOn(e.target.checked)}
                />
                <span
                  className={cn(
                    "block size-6 rounded-full bg-paper transition-transform duration-200",
                    yearlyOn ? "translate-x-6" : "translate-x-0",
                  )}
                />
              </span>
              <span className={cn(yearlyOn && "text-paper")}>{site.pricingToggleOn}</span>
            </label>
            {yearlyOn ? (
              <p className="text-sm text-gold">
                Yearly keeps {formatCurrency(save.savedCents)} in her pocket — {save.percent}% less than twelve months.
              </p>
            ) : (
              <p className="text-sm text-paper/55">Same rooms either way. Yearly is only how you pay.</p>
            )}
          </div>

          <div className="mt-10 grid gap-5 text-left lg:grid-cols-3">
            <PlanCard
              name={site.pricingMonthlyName}
              headline={formatCurrency(monthly)}
              cadence="/ month"
              sub={`Same house as yearly · ${formatCurrency(monthly * 12)} if you stayed twelve months`}
              cta={site.pricingMonthlyCta}
              toPlan="monthly"
              points={points}
              featured={!yearlyOn}
              muted={yearlyOn}
            />
            <PlanCard
              name={site.pricingYearlyName}
              headline={formatCurrency(yearly)}
              cadence="/ year"
              sub={`${formatCurrency(save.perMonthCents)} / month · same house, save ${save.percent}%`}
              badge={`Save ${save.percent}%`}
              cta={site.pricingYearlyCta}
              toPlan="yearly"
              points={points}
              featured={yearlyOn}
              muted={!yearlyOn}
            />
            <PlanCard
              name={site.pricingMeetingName}
              headline={formatCurrency(meeting)}
              cadence="/ session"
              sub={site.pricingMeetingSub}
              cta={site.pricingMeetingCta}
              href="/login"
              points={meetingPoints}
              extra
            />
          </div>

          <p className="mx-auto mt-12 max-w-xl text-sm text-paper/55">{site.pricingFoot}</p>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

function PlanCard({
  name,
  headline,
  cadence,
  sub,
  badge,
  cta,
  points,
  featured,
  muted,
  extra,
  toPlan,
  href,
}: {
  name: string;
  headline: string;
  cadence: string;
  sub: string;
  badge?: string;
  cta: string;
  points: readonly string[];
  featured?: boolean;
  muted?: boolean;
  extra?: boolean;
  toPlan?: "monthly" | "yearly";
  href?: "/login";
}) {
  return (
    <article
      className={cn(
        "pricing-card h-full",
        featured && "is-featured",
        muted && "opacity-70",
        extra && "border-blush/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl text-paper">{name}</h2>
        {badge ? <span className="pricing-save shrink-0">{badge}</span> : null}
      </div>
      <p className="mt-6 font-display text-5xl tabular-nums leading-none text-paper">
        {headline}
        <span className="ml-2 text-lg text-paper/55">{cadence}</span>
      </p>
      <p className="mt-3 text-sm text-paper/60">{sub}</p>
      <ul className="mt-8 flex-1 space-y-3 text-sm text-paper/80">
        {points.map((p) => (
          <li key={p} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-gold" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {toPlan ? (
        <Button
          asChild
          variant={featured ? "paper" : "ghost"}
          className={
            featured
              ? "mt-8 h-12 w-full"
              : "mt-8 h-12 w-full border border-white/15 text-paper hover:bg-white/10 hover:text-paper"
          }
        >
          <Link to="/checkout" search={{ plan: toPlan, preview: undefined }}>
            {cta}
          </Link>
        </Button>
      ) : (
        <Button asChild variant="gold" className="mt-8 h-12 w-full">
          <Link to={href ?? "/login"} search={{}}>{cta}</Link>
        </Button>
      )}
    </article>
  );
}
