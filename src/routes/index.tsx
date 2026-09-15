import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { MagneticLink } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/parallax";
import { mergeLanding, type LandingContent } from "@/lib/landing";
import { yearlySavings } from "@/lib/pricing";
import { getLanding } from "@/lib/server/public";
import { lines } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";
import "../motion-home.css";

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
    <div className="hfm-motion-page">
      <PublicNav overlay />
      <MotionHero content={content} />
      <MotionRail items={features} />
      <ScrollMediaStory content={content} />
      <NourishmentScene content={content} />
      <BindingScene content={content} />
      <SupportScene content={content} />
      <SeasonRows content={content} />
      <PartnerScene content={content} />
      <MembershipScene content={content} monthly={monthly} yearly={yearly} />
      <PublicFooter />
    </div>
  );
}

function MotionHero({ content }: { content: LandingContent }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      const rect = root.getBoundingClientRect();
      const range = Math.max(1, rect.height * 0.92);
      const p = Math.min(1, Math.max(0, -rect.top / range));
      root.style.setProperty("--hero-copy-y", `${p * -54}px`);
      root.style.setProperty("--hero-copy-opacity", `${1 - p * 0.52}`);
      root.style.setProperty("--hero-photo-y", `${p * 72}px`);
      root.style.setProperty("--hero-photo-scale", `${1 + p * 0.055}`);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section ref={rootRef} className="hfm-hero px-4 pb-14 pt-28 text-[#f5eddf] md:px-6 md:pb-20 md:pt-36">
      <div className="hfm-grain" />
      <div className="hfm-orbit hfm-orbit-one" />
      <div className="hfm-orbit hfm-orbit-two" />

      <div className="relative mx-auto grid min-h-[calc(100svh-9rem)] max-w-[92rem] items-center gap-12 lg:grid-cols-[1.06fr_.94fr] lg:gap-8">
        <div className="hfm-hero-copy relative z-20 max-w-5xl">
          <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dda442] sm:text-xs">
            <span className="h-px w-12 bg-[#dda442]/65" />
            Pregnancy · postpartum · the fourth trimester
          </div>

          <h1 className="mt-8 font-display text-[clamp(4.25rem,10vw,10.5rem)] leading-[0.77] tracking-[-0.055em]">
            <span className="hfm-line-reveal"><span>The world</span></span>
            <span className="hfm-line-reveal"><span>celebrates</span></span>
            <span className="hfm-line-reveal"><span className="italic text-[#dda442]">the baby.</span></span>
          </h1>

          <div className="mt-7 grid max-w-4xl gap-6 border-t border-[#f5eddf]/16 pt-7 md:grid-cols-[.9fr_1.1fr] md:items-end">
            <p className="font-display text-[clamp(2rem,4vw,4rem)] leading-[.95] italic text-[#f5eddf]/96">
              We remember the mother.
            </p>
            <div>
              <p className="max-w-xl text-base leading-7 text-[#f5eddf]/72 md:text-lg">
                {content.subhead}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <MagneticLink to="/pricing" className="bg-[#f5eddf] text-[#0d1712] hover:bg-white">
                  {content.cta}
                </MagneticLink>
                <Link
                  to="/about"
                  className="inline-flex h-14 items-center gap-2 rounded-full border border-[#f5eddf]/22 bg-[#f5eddf]/7 px-7 text-sm font-medium text-[#f5eddf] backdrop-blur transition hover:bg-[#f5eddf]/12"
                >
                  Enter the house <ArrowDownRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto min-h-[38rem] w-full max-w-[40rem] lg:min-h-[44rem]">
          <div className="hfm-hero-photo-main hfm-cut absolute right-0 top-0 w-[78%] overflow-hidden border border-[#f5eddf]/16 bg-[#1b2c22] shadow-[0_44px_120px_-48px_rgba(0,0,0,.85)]">
            <img
              src={content.images.hero}
              alt={content.alts.hero}
              className="media aspect-[4/5.4] w-full object-cover object-center"
            />
          </div>

          <div className="hfm-hero-photo-small hfm-cut-soft absolute bottom-8 left-0 w-[42%] overflow-hidden border border-[#f5eddf]/18 bg-[#1b2c22] shadow-[0_35px_90px_-46px_rgba(0,0,0,.85)]">
            <img src={content.images.rest} alt={content.alts.rest} className="media aspect-[4/5] w-full object-cover" />
          </div>

          <div className="absolute bottom-[15%] right-[3%] z-20 max-w-[16rem] border-l border-[#dda442] bg-[#0d1712]/78 px-5 py-4 backdrop-blur-xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#dda442]">Care in motion</p>
            <p className="mt-2 text-sm leading-6 text-[#f5eddf]/78">
              Meals, movement, groceries, recovery, and support that change as her season changes.
            </p>
          </div>

          <div className="absolute -left-10 top-[15%] hidden h-32 w-32 rounded-full border border-[#dda442]/35 md:block" />
        </div>

        <p className="hfm-hero-ghost pointer-events-none absolute -bottom-8 left-0 z-0 font-display text-[clamp(7rem,17vw,18rem)] leading-none tracking-[-0.08em] opacity-80">
          MOTHER
        </p>
      </div>
    </section>
  );
}

const FEATURE_FALLBACK = [
  "Personalized meals",
  "Belly Binding Studio",
  "Human support",
  "Movement",
  "Grocery lists",
  "Partner lane",
  "Week-by-week journey",
  "Fourth trimester care",
];

function MotionRail({ items }: { items: string[] }) {
  const source = (items.length ? items : FEATURE_FALLBACK).slice(0, 8);
  const repeated = useMemo(() => [...source, ...source], [source.join("|")]);

  return (
    <section className="hfm-rail py-4" aria-label="Membership features">
      <div className="hfm-rail-track px-5 text-xs font-semibold uppercase tracking-[0.22em] md:text-sm">
        {repeated.map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-center gap-9 whitespace-nowrap">
            <span>{item}</span>
            <span className="hfm-rail-dot" />
          </div>
        ))}
      </div>
    </section>
  );
}

function ScrollMediaStory({ content }: { content: LandingContent }) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 901) return;
    let frame = 0;
    const update = () => {
      const rect = root.getBoundingClientRect();
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      root.style.setProperty("--media-y", `${(1 - p) * 82}px`);
      root.style.setProperty("--media-scale", `${0.82 + p * 0.18}`);
      root.style.setProperty("--media-radius", `${48 - p * 28}px`);
      root.style.setProperty("--media-sat", `${0.76 + p * 0.24}`);
      root.style.setProperty("--copy-y", `${(1 - p) * 40}px`);
      root.style.setProperty("--copy-opacity", `${0.42 + p * 0.58}`);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section ref={rootRef} className="hfm-scroll-story">
      <div className="hfm-scroll-sticky flex items-center px-4 py-16 md:px-6 lg:py-20">
        <div className="mx-auto grid w-full max-w-[92rem] items-center gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-14">
          <div className="hfm-scroll-copy relative z-20 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b94f36]">Not another dashboard</p>
            <h2 className="mt-5 font-display text-[clamp(3.3rem,6vw,6.7rem)] leading-[.88] tracking-[-0.04em] text-[#18201b]">
              Care should feel like a rhythm, not a checklist.
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-8 text-[#425048]">{content.offerLine}</p>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#59665e]">{content.manifesto}</p>
          </div>

          <div className="hfm-media-expand relative overflow-hidden bg-[#c8b59a]">
            <img
              src={content.images.meals}
              alt={content.alts.meals}
              className="media h-[62svh] min-h-[31rem] w-full object-cover lg:h-[76svh]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1712]/42 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7 max-w-md text-[#f5eddf] md:bottom-10 md:left-10">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#dda442]">One house · many seasons</p>
              <p className="mt-3 font-display text-3xl leading-tight md:text-5xl">Nourishment that knows where she is.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NourishmentScene({ content }: { content: LandingContent }) {
  return (
    <section className="hfm-editorial-dark px-4 py-24 md:px-6 md:py-36">
      <div className="mx-auto grid max-w-[92rem] gap-16 lg:grid-cols-[1.15fr_.85fr] lg:gap-24">
        <Reveal className="relative min-h-[42rem] md:min-h-[50rem]">
          <div className="hfm-image-window hfm-cut absolute left-0 top-0 w-[72%]">
            <img src={content.images.meals} alt={content.alts.meals} className="media aspect-[4/5] w-full object-cover" />
          </div>
          <div className="hfm-image-window absolute bottom-0 right-0 w-[43%] rotate-[4deg]">
            <img src={content.images.hydration} alt={content.alts.hydration} className="media aspect-[4/5] w-full object-cover" />
          </div>
          <div className="absolute bottom-[15%] left-[8%] z-20 rounded-full border border-[#dda442]/28 bg-[#0d1712]/72 px-6 py-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#dda442]">Culture · pantry · appetite · budget</p>
          </div>
        </Reveal>

        <Reveal className="flex items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#dda442]">{content.mealsKicker}</p>
            <h2 className="mt-6 font-display text-[clamp(3.6rem,6vw,7rem)] leading-[.86] tracking-[-0.045em]">
              Meals that bow to her real kitchen.
            </h2>
            <p className="mt-9 max-w-xl text-lg leading-8 text-[#f5eddf]/68">{content.mealsBody}</p>
            <Link to="/pricing" className="mt-9 inline-flex items-center gap-3 border-b border-[#dda442]/45 pb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#dda442]">
              Build her meal rhythm <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BindingScene({ content }: { content: LandingContent }) {
  return (
    <section className="relative overflow-hidden bg-[#b94f36] px-4 py-24 text-[#fff3e5] md:px-6 md:py-36">
      <p className="hfm-word-outline pointer-events-none absolute -right-4 top-6 font-display text-[clamp(8rem,18vw,20rem)] leading-none tracking-[-0.08em]">HOLD</p>
      <div className="relative mx-auto grid max-w-[92rem] items-center gap-14 lg:grid-cols-[.86fr_1.14fr] lg:gap-24">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.25em] text-[#ffd487]">{content.bindingKicker}</p>
          <h2 className="mt-6 max-w-2xl font-display text-[clamp(3.8rem,7vw,7.4rem)] leading-[.84] tracking-[-0.045em]">
            Belly binding, held with care.
          </h2>
          <p className="mt-9 max-w-xl text-lg leading-8 text-[#fff3e5]/76">{content.bindingBody}</p>
          <Link to="/belly-binding" className="mt-10 inline-flex items-center gap-3 rounded-full border border-[#fff3e5]/30 bg-[#fff3e5]/8 px-6 py-3 text-sm font-medium backdrop-blur hover:bg-[#fff3e5]/14">
            Enter the studio <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <Reveal className="relative min-h-[42rem] md:min-h-[48rem]">
          <div className="hfm-image-window hfm-cut-soft absolute right-0 top-0 w-[76%]">
            <img src={content.images.binding} alt={content.alts.binding} className="media aspect-[4/5.2] w-full object-cover" />
          </div>
          <div className="hfm-image-window absolute bottom-0 left-0 w-[46%] -rotate-[4deg] border-[10px] border-[#b94f36]">
            <img src={content.images.bindingStill} alt={content.alts.bindingStill} className="media aspect-[4/4.7] w-full object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SupportScene({ content }: { content: LandingContent }) {
  return (
    <section className="relative overflow-hidden bg-[#4a2632] px-4 py-24 text-[#f8eadb] md:px-6 md:py-36">
      <div className="absolute -left-44 -top-44 size-[38rem] rounded-full border border-[#f8eadb]/10" />
      <div className="absolute -left-24 -top-24 size-[24rem] rounded-full border border-[#dda442]/18" />
      <div className="relative mx-auto grid max-w-[92rem] items-center gap-14 lg:grid-cols-[1fr_.82fr] lg:gap-24">
        <Reveal className="order-2 lg:order-1">
          <p className="text-xs uppercase tracking-[0.25em] text-[#dda442]">{content.nouriKicker}</p>
          <h2 className="mt-6 max-w-4xl font-display text-[clamp(3.8rem,7vw,7.5rem)] leading-[.85] tracking-[-0.045em]">
            A real person behind the questions that matter.
          </h2>
          <p className="mt-9 max-w-2xl text-lg leading-8 text-[#f8eadb]/72">{content.nouriBody}</p>
          <Link to="/nouri" className="mt-9 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#dda442]">
            Explore support <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <div className="hfm-image-window hfm-cut mx-auto max-w-[34rem] rotate-[2deg]">
            <img src={content.images.nouri} alt={content.alts.nouri} className="media aspect-[4/5] w-full object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SeasonRows({ content }: { content: LandingContent }) {
  const stages = [
    { n: "01", title: "Trying", body: "Mineral-rich plates, practical groceries, and gentler movement while she waits.", image: content.images.hydration, alt: content.alts.hydration },
    { n: "02", title: "Pregnancy", body: "Meals and guidance that follow appetite, week, energy, and the next appointment.", image: content.images.movement, alt: content.alts.movement },
    { n: "03", title: "Postpartum", body: "Recovery plates, belly binding education, rest, and movement for the fourth trimester.", image: content.images.rest, alt: content.alts.rest },
    { n: "04", title: "The table", body: "Culture and household shape the plan, while partners get a clear lane to help.", image: content.images.family, alt: content.alts.family },
  ];

  return (
    <section className="bg-[#0d1712] px-4 py-24 text-[#f5eddf] md:px-6 md:py-36">
      <div className="mx-auto max-w-[92rem]">
        <Reveal className="grid gap-6 border-b border-[#f5eddf]/14 pb-12 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
          <p className="text-xs uppercase tracking-[0.25em] text-[#dda442]">The house grows with her</p>
          <h2 className="font-display text-[clamp(3.6rem,7vw,7.5rem)] leading-[.84] tracking-[-0.045em]">
            Different seasons should never get the same care plan.
          </h2>
        </Reveal>

        <div>
          {stages.map((stage) => (
            <article key={stage.title} className="hfm-stage-row group grid min-h-[14rem] items-center gap-6 py-8 md:grid-cols-[7rem_.72fr_1fr] lg:grid-cols-[8rem_.7fr_.9fr_18rem]">
              <p className="hfm-number font-display text-5xl text-[#f5eddf]/26 md:text-7xl">{stage.n}</p>
              <h3 className="font-display text-4xl leading-none md:text-6xl">{stage.title}</h3>
              <p className="max-w-xl text-base leading-7 text-[#f5eddf]/62 md:text-lg">{stage.body}</p>
              <div className="hfm-stage-img hfm-image-window hidden h-40 overflow-hidden md:block">
                <img src={stage.image} alt={stage.alt} className="media h-full w-full object-cover" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerScene({ content }: { content: LandingContent }) {
  return (
    <section className="relative overflow-hidden bg-[#f5eddf] px-4 py-24 text-[#172019] md:px-6 md:py-36">
      <div className="mx-auto grid max-w-[92rem] items-center gap-14 lg:grid-cols-[1.2fr_.8fr] lg:gap-24">
        <Reveal>
          <div className="hfm-image-window hfm-cut-soft">
            <img src={content.images.grocery} alt={content.alts.grocery} className="media aspect-[16/10] w-full object-cover" />
          </div>
        </Reveal>
        <Reveal>
          <p className="text-xs uppercase tracking-[0.25em] text-[#b94f36]">For partners, too</p>
          <h2 className="mt-6 font-display text-[clamp(3.5rem,6vw,6.5rem)] leading-[.86] tracking-[-0.04em]">
            Give the person beside her something useful to do.
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#48544d]">
            The week’s grocery list, meals to cook, and a practical lane for support — without turning her private record into shared reading.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function MembershipScene({ content, monthly, yearly }: { content: LandingContent; monthly: number; yearly: number }) {
  const save = yearlySavings(monthly, yearly);
  const included = [
    "Personalized meals and grocery planning",
    "Virtual pantry and nearby-store tools",
    "Belly Binding Studio and recovery movement",
    "Week-by-week guidance and partner support",
  ];

  return (
    <section className="relative overflow-hidden bg-[#0d1712] px-4 py-24 text-[#f5eddf] md:px-6 md:py-36">
      <div className="absolute right-[-12rem] top-[-12rem] size-[40rem] rounded-full border border-[#dda442]/12" />
      <div className="mx-auto grid max-w-[92rem] gap-14 lg:grid-cols-[1fr_.82fr] lg:items-center lg:gap-24">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.25em] text-[#dda442]">Membership</p>
          <h2 className="mt-6 max-w-4xl font-display text-[clamp(4rem,8vw,8.2rem)] leading-[.82] tracking-[-0.05em]">
            {content.closeTitle}
          </h2>
          <p className="mt-9 max-w-2xl text-lg leading-8 text-[#f5eddf]/65">{content.closeBody}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <MagneticLink to="/pricing" className="bg-[#dda442] text-[#0d1712] hover:bg-[#efbb5b]">
              {content.cta}
            </MagneticLink>
            <Link to="/login" search={{}} className="inline-flex h-14 items-center rounded-full border border-[#f5eddf]/20 px-7 text-sm font-medium text-[#f5eddf]/82 hover:bg-[#f5eddf]/6">
              Already a member? Sign in
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <div className="hfm-membership-orb relative mx-auto aspect-square max-w-[34rem] rounded-full p-10 md:p-14">
            <div className="flex h-full flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.22em] text-[#dda442]">Yearly membership</p>
              <p className="mt-5 font-display text-[clamp(4.5rem,8vw,7rem)] leading-none tracking-[-0.055em]">
                {formatCurrency(save.perMonthCents)}
              </p>
              <p className="mt-2 text-sm text-[#f5eddf]/58">per month, billed {formatCurrency(yearly)} yearly</p>
              <p className="mt-4 text-sm text-[#dda442]">Save {save.percent}% versus {formatCurrency(monthly)} month to month.</p>
              <ul className="mt-8 space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[#f5eddf]/72">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#dda442]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
