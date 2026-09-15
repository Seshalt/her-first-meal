import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { LiquidArt } from "@/components/layout/liquid-art";
import { MagneticLink } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/parallax";
import { mergeLanding, type LandingContent } from "@/lib/landing";
import { yearlySavings } from "@/lib/pricing";
import { getLanding } from "@/lib/server/public";
import { lines } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return await getLanding();
    } catch {
      return null;
    }
  },
  component: Home,
});

function Home() {
  const page = Route.useLoaderData();
  const content = page?.content ?? mergeLanding(null);
  const features = lines(page?.site.ticker ?? "");
  const monthly = page?.monthlyPriceCents ?? 4900;
  const yearly = page?.yearlyPriceCents ?? 49000;

  return (
    <div className="relative isolate overflow-hidden bg-background text-foreground">
      <LiquidArt />
      <div className="relative z-[1]">
        <PublicNav overlay={false} />
        <Hero content={content} />
        <FeatureGrid items={features} />
        <Manifesto content={content} />
        <MealsStory content={content} />
        <BindingStory content={content} />
        <SupportStory content={content} />
        <JourneyGrid content={content} />
        <PartnerStory content={content} />
        <MembershipClose content={content} monthly={monthly} yearly={yearly} />
        <PublicFooter />
      </div>
    </div>
  );
}

function Hero({ content }: { content: LandingContent }) {
  return (
    <section className="relative border-b border-border/70 bg-wash-linen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_420px_at_12%_15%,rgba(212,162,74,0.16),transparent_62%),radial-gradient(680px_420px_at_88%_20%,rgba(42,117,108,0.13),transparent_62%)]" />
      <div className="relative mx-auto grid min-h-[82vh] max-w-7xl items-center gap-12 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur">
            Pregnancy · postpartum · the fourth trimester
          </p>
          <h1 className="mt-8 font-display text-[clamp(3.35rem,7vw,6.9rem)] leading-[0.88] tracking-[-0.035em] text-ink">
            The world celebrates the baby.
            <span className="mt-3 block italic text-clay">We remember the mother.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-ink-soft md:text-xl">
            {content.subhead}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticLink to="/pricing" className="bg-primary text-primary-foreground hover:bg-sea-deep">
              {content.cta}
            </MagneticLink>
            <Link
              to="/about"
              className="inline-flex h-14 items-center gap-2 rounded-full border border-ink/15 bg-white/65 px-7 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:bg-white"
            >
              See how it works <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 border-t border-ink/10 pt-7 text-sm text-ink-soft sm:grid-cols-4">
            <span>Meals</span>
            <span>Groceries</span>
            <span>Movement</span>
            <span>Binding</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
          <div className="relative overflow-hidden rounded-[42px] bg-card p-3 shadow-[0_38px_100px_-45px_rgba(20,36,31,0.55)] ring-1 ring-ink/10 md:p-4">
            <img
              src={content.images.hero}
              alt={content.alts.hero}
              className="media aspect-[4/5] w-full rounded-[32px] object-cover object-center md:aspect-[5/5.4]"
            />
            <div className="absolute inset-x-7 bottom-7 rounded-[26px] border border-white/45 bg-[#fffaf3]/92 p-5 shadow-xl backdrop-blur-md md:inset-x-auto md:bottom-8 md:left-8 md:max-w-sm md:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-clay">Care that moves with her</p>
              <p className="mt-3 font-display text-2xl leading-tight text-ink md:text-3xl">
                Meals, movement, groceries, and support for the season she is actually in.
              </p>
            </div>
          </div>
          <div className="absolute -right-2 -top-5 hidden rounded-3xl border border-primary/15 bg-white/90 px-5 py-4 shadow-xl backdrop-blur md:block">
            <p className="text-xs uppercase tracking-[0.18em] text-primary">Personalized by stage</p>
            <p className="mt-1 text-sm text-ink-soft">Trying · pregnancy · postpartum</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURE_COPY: Record<string, string> = {
  "Personalized meals": "Recipes shaped around her stage, appetite, culture, dietary needs, pantry, and household.",
  "Belly Binding Studio": "A calm place for wrap education, reference lessons, journaling, and optional live review.",
  "Human support": "A direct path to Maat when a real person is what she needs.",
  Movement: "Gentle stage-aware movement that supports recovery instead of turning care into another performance goal.",
  "Grocery lists": "Turn the week’s meals into a practical market list and find nearby stores when it is time to shop.",
  "Partner lane": "Give partners something useful to do without opening her private health record.",
  "Week-by-week journey": "The house changes with the week instead of handing every member the same static checklist.",
  "Fourth trimester care": "Keep nourishment, recovery, rest, and binding support open after birth.",
};

function FeatureGrid({ items }: { items: string[] }) {
  const fallback = ["Personalized meals", "Belly Binding Studio", "Human support", "Movement"];
  const shown = (items.length ? items : fallback).slice(0, 4);
  return (
    <section className="border-b border-border/70 bg-background px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-2 lg:grid-cols-4">
        {shown.map((item, i) => (
          <article
            key={item}
            className="group rounded-[26px] border border-border/80 bg-card p-6 shadow-[0_18px_50px_-38px_rgba(20,30,28,0.42)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-36px_rgba(20,30,28,0.48)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">0{i + 1}</span>
              <span className="size-2 rounded-full bg-gold transition-transform group-hover:scale-150" />
            </div>
            <h2 className="mt-8 font-display text-3xl leading-none text-ink">{item}</h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              {FEATURE_COPY[item] ?? "Thoughtful support built into the membership and ready when she needs it."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Manifesto({ content }: { content: LandingContent }) {
  return (
    <section className="bg-background px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.24em] text-clay">A membership built around her</p>
          <p className="mt-5 max-w-sm text-lg leading-8 text-ink-soft">{content.offerLine}</p>
        </Reveal>
        <Reveal>
          <h2 className="font-display text-[clamp(2.8rem,5vw,5.4rem)] leading-[0.98] tracking-[-0.03em] text-ink">
            {content.manifesto}
          </h2>
        </Reveal>
      </div>
    </section>
  );
}

function MealsStory({ content }: { content: LandingContent }) {
  return (
    <section className="bg-wash-sea px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <Reveal className="relative">
          <div className="grid grid-cols-[1.4fr_0.7fr] gap-4">
            <img
              src={content.images.meals}
              alt={content.alts.meals}
              className="media h-[560px] w-full rounded-[36px] object-cover"
            />
            <div className="flex flex-col gap-4 pt-16">
              <img
                src={content.images.hydration}
                alt={content.alts.hydration}
                className="media h-56 w-full rounded-[28px] object-cover"
              />
              <div className="rounded-[28px] bg-sea p-6 text-primary-foreground">
                <p className="text-xs uppercase tracking-[0.2em] text-aqua">Built for real kitchens</p>
                <p className="mt-4 font-display text-2xl leading-tight">Culture, pantry, budget, appetite, household.</p>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal className="lg:pl-4">
          <p className="text-xs uppercase tracking-[0.24em] text-sea">{content.mealsKicker}</p>
          <h2 className="mt-5 font-display text-[clamp(3rem,5vw,5rem)] leading-[0.95] tracking-[-0.025em] text-ink">
            {content.mealsTitle}
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-ink-soft">{content.mealsBody}</p>
          <Link to="/pricing" className="mt-9 inline-flex items-center gap-2 font-medium text-sea-deep">
            See the membership <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function BindingStory({ content }: { content: LandingContent }) {
  return (
    <section className="bg-background px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <p className="text-xs uppercase tracking-[0.24em] text-blush">{content.bindingKicker}</p>
          <h2 className="mt-5 font-display text-[clamp(3rem,5vw,5rem)] leading-[0.95] tracking-[-0.025em] text-ink">
            {content.bindingTitle}
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-ink-soft">{content.bindingBody}</p>
          <Link to="/belly-binding" className="mt-9 inline-flex items-center gap-2 font-medium text-blush-deep">
            Visit the studio <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <div className="relative ml-auto max-w-xl">
            <img
              src={content.images.binding}
              alt={content.alts.binding}
              className="media aspect-[4/5] w-full rounded-[40px] object-cover"
            />
            <img
              src={content.images.bindingStill}
              alt={content.alts.bindingStill}
              className="media absolute -bottom-8 -left-5 hidden h-56 w-44 rounded-[28px] border-8 border-background object-cover shadow-xl md:block"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SupportStory({ content }: { content: LandingContent }) {
  return (
    <section className="px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[42px] bg-plum-deep text-paper shadow-[0_35px_100px_-50px_rgba(30,20,45,0.7)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex items-center p-8 md:p-12 lg:p-16">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.24em] text-gold">{content.nouriKicker}</p>
            <h2 className="mt-5 font-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.96]">{content.nouriTitle}</h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-paper/78">{content.nouriBody}</p>
            <Link to="/nouri" className="mt-9 inline-flex items-center gap-2 font-medium text-gold">
              Explore support <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
        <img src={content.images.nouri} alt={content.alts.nouri} className="media h-full min-h-[420px] w-full object-cover" />
      </div>
    </section>
  );
}

function JourneyGrid({ content }: { content: LandingContent }) {
  const stages = [
    { title: "Trying", body: "Mineral-rich plates, practical groceries, and gentler movement while she waits.", image: content.images.hydration, alt: content.alts.hydration },
    { title: "Pregnancy", body: "Meals and guidance that follow appetite, week, energy, and the next appointment.", image: content.images.movement, alt: content.alts.movement },
    { title: "Postpartum", body: "Recovery plates, belly binding education, rest, and movement for the fourth trimester.", image: content.images.rest, alt: content.alts.rest },
    { title: "The table", body: "Culture and household shape the plan, while partners get a clear lane to help.", image: content.images.family, alt: content.alts.family },
  ];

  return (
    <section className="bg-wash-linen px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.24em] text-plum">The house grows with her</p>
          <h2 className="mt-5 font-display text-[clamp(3rem,5.2vw,5.2rem)] leading-[0.96] tracking-[-0.03em] text-ink">
            Different seasons should not get the same care plan.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((stage, i) => (
            <Reveal key={stage.title} className="overflow-hidden rounded-[30px] border border-ink/10 bg-card shadow-sm">
              <img src={stage.image} alt={stage.alt} className="media aspect-[4/3] w-full object-cover" />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">0{i + 1}</p>
                <h3 className="mt-3 font-display text-3xl text-ink">{stage.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{stage.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerStory({ content }: { content: LandingContent }) {
  return (
    <section className="bg-background px-4 py-24 md:px-6 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <Reveal>
          <img src={content.images.grocery} alt={content.alts.grocery} className="media aspect-[16/11] w-full rounded-[40px] object-cover" />
        </Reveal>
        <Reveal>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">For partners, too</p>
          <h2 className="mt-5 font-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.96] text-ink">
            Give the person beside her something useful to do.
          </h2>
          <p className="mt-7 text-lg leading-8 text-ink-soft">
            The week’s grocery list, meals to cook, and a short lane for practical support — without turning her private record into shared reading.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function MembershipClose({ content, monthly, yearly }: { content: LandingContent; monthly: number; yearly: number }) {
  const save = yearlySavings(monthly, yearly);
  const benefits = [
    "Personalized meals and grocery planning",
    "Virtual pantry and nearby-store tools",
    "Belly Binding Studio and recovery movement",
    "Week-by-week guidance and partner support",
  ];

  return (
    <section className="bg-sea px-4 py-24 text-primary-foreground md:px-6 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-end">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.24em] text-aqua">Membership</p>
          <h2 className="mt-5 max-w-3xl font-display text-[clamp(3.2rem,6vw,6rem)] leading-[0.92] tracking-[-0.03em]">
            {content.closeTitle}
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-primary-foreground/78">{content.closeBody}</p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <MagneticLink to="/pricing" className="bg-paper text-ink hover:bg-cream dark:hover:bg-cream">
              {content.cta}
            </MagneticLink>
            <Link to="/login" search={{}} className="text-sm text-paper/80 underline-offset-8 hover:underline">
              Already a member? Sign in
            </Link>
          </div>
        </Reveal>
        <Reveal className="rounded-[34px] border border-white/15 bg-white/10 p-7 backdrop-blur md:p-9">
          <p className="text-sm uppercase tracking-[0.18em] text-aqua">Yearly membership</p>
          <p className="mt-5 font-display text-6xl tabular-nums">{formatCurrency(save.perMonthCents)}</p>
          <p className="mt-1 text-primary-foreground/65">per month, billed {formatCurrency(yearly)} yearly</p>
          <p className="mt-3 text-sm text-gold">Save {save.percent}% versus {formatCurrency(monthly)} month to month.</p>
          <ul className="mt-8 space-y-4">
            {benefits.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-primary-foreground/82">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
