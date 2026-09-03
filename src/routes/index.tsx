import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { LiquidArt } from "@/components/layout/liquid-art";
import { MagneticLink } from "@/components/motion/magnetic-button";
import { ParallaxFrame, Reveal } from "@/components/motion/parallax";
import { mergeLanding, type LandingContent } from "@/lib/landing";
import { yearlySavings } from "@/lib/pricing";
import { getLanding } from "@/lib/server/public";
import { lines } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";
import { HouseMark } from "@/components/brand/logo";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [page, setPage] = useState<Awaited<ReturnType<typeof getLanding>> | null>(null);

  useEffect(() => {
    void getLanding()
      .then(setPage)
      .catch(() => undefined);
  }, []);

  const content = page?.content ?? mergeLanding(null);
  const ticker = lines(page?.site.ticker ?? "");
  const monthly = page?.monthlyPriceCents ?? 4900;
  const yearly = page?.yearlyPriceCents ?? 49000;
  const layout = page?.studio.layout;
  const overlayNav = (layout?.nav ?? "overlay") === "overlay";
  const photoStart = layout?.photo === "left" ? "left" : "right";

  return (
    <div className="relative isolate">
      <LiquidArt />
      <div className="relative z-[1]">
      <PublicNav overlay={overlayNav} />
      <Hero content={content} variant={layout?.hero ?? "cinematic"} />
      <Ticker items={ticker} />
      <Manifesto content={content} />
      <SplitStory
        kicker={content.mealsKicker}
        title={content.mealsTitle}
        body={content.mealsBody}
        src={content.images.meals}
        alt="A nourishing bowl set on linen"
        href="/pricing"
        linkLabel="See the membership"
        photo={photoStart}
        tone="clay"
      />
      <SplitStory
        kicker={content.bindingKicker}
        title={content.bindingTitle}
        body={content.bindingBody}
        src={content.images.binding}
        alt="Hands wrapping a cotton belly wrap"
        href="/belly-binding"
        linkLabel="Visit the studio"
        photo={photoStart === "left" ? "right" : "left"}
        extraSrc={content.images.bindingStill}
        extraAlt="A folded belly wrap with eucalyptus"
        tone="blush"
      />
      <NouriBand content={content} />
      <JourneyBand images={content.images} />
      <PartnerBand src={content.images.grocery} />
      <MembershipClose content={content} monthly={monthly} yearly={yearly} />
      <PublicFooter />
      </div>
    </div>
  );
}

function Hero({ content, variant }: { content: LandingContent; variant: "cinematic" | "split" | "centered" }) {
  if (variant === "split") {
    return (
      <section className="grid min-h-[100dvh] bg-wash-linen lg:grid-cols-2">
        <div className="flex flex-col justify-end px-4 py-24 md:px-10 md:py-28">
          <h1>
            <HouseMark className="h-20 w-auto max-w-none md:h-24" />
            <span className="sr-only">Her First Meal</span>
          </h1>
          <p className="mt-8 font-display text-[clamp(1.8rem,3.6vw,3rem)] leading-[1.1] text-ink">
            The world celebrates the baby.
            <span className="mt-2 block italic text-gold">We remember the mother.</span>
          </p>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-soft">{content.subhead}</p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <MagneticLink to="/pricing" className="bg-primary text-primary-foreground">
              {content.cta}
            </MagneticLink>
            <Link to="/pricing" className="text-sm underline-offset-8 hover:underline">
              {content.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="relative min-h-[50vh] lg:min-h-full">
          <img src={content.images.hero} alt="" className="media absolute inset-0 h-full w-full object-cover" />
          <div className="hero-veil pointer-events-none absolute inset-0" />
        </div>
      </section>
    );
  }

  const centered = variant === "centered";
  return (
    <section className="relative min-h-[100dvh] overflow-hidden text-paper">
      <ParallaxFrame
        src={content.images.hero}
        alt="A mother standing in warm kitchen light, hands on her belly"
        speed={0.42}
        className="absolute inset-0"
      />
      <div className="hero-veil pointer-events-none absolute inset-0" />
      <div
        className={
          centered
            ? "relative mx-auto flex min-h-[100dvh] max-w-4xl flex-col items-center justify-center px-4 pb-16 pt-32 text-center md:px-6"
            : "relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 md:px-6 md:pb-28"
        }
      >
        <div className={centered ? "stagger max-w-3xl" : "stagger max-w-3xl"}>
          <h1 className={`overflow-visible ${centered ? "flex flex-col items-center" : ""}`}>
            <HouseMark className={`h-28 w-auto max-w-none md:h-36 ${centered ? "mx-auto" : ""}`} />
            <span className="sr-only">Her First Meal</span>
          </h1>
          <p className={`mt-8 font-display text-[clamp(1.7rem,3.8vw,3.1rem)] leading-[1.12] text-paper [text-shadow:0_8px_28px_rgba(12,16,14,0.35)] ${centered ? "text-center" : ""}`}>
            The world celebrates the baby.
            <span className="mt-2 block italic text-gold">We remember the mother.</span>
          </p>
          <p className={`mt-8 max-w-lg text-lg leading-relaxed text-paper/88 md:text-xl ${centered ? "mx-auto" : ""}`}>
            {content.subhead}
          </p>
          <div className={`mt-12 flex flex-wrap items-center gap-6 ${centered ? "justify-center" : ""}`}>
            <MagneticLink to="/pricing" className="bg-paper text-ink hover:bg-cream dark:hover:bg-cream">
              {content.cta}
            </MagneticLink>
            <Link to="/pricing" className="text-sm text-paper/80 underline-offset-8 hover:text-paper hover:underline">
              {content.secondaryCta}
            </Link>
          </div>
        </div>
        <p className={`mt-20 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-paper/55 ${centered ? "justify-center" : ""}`}>
          <ArrowDown className="size-4" />
          Scroll
        </p>
      </div>
    </section>
  );
}

const OFFER_COPY: Record<string, string> = {
  "Personalized meals": "Plates built for her body, culture, store, and season — not a dump of recipes on day one.",
  "Belly Binding Studio": "Cloth, breath, and a private room after birth. Education first, never spectacle.",
  Nouri: "A quiet companion for the week she is in. Questions, not a diagnosis.",
  Movement: "Soft walks and recovery work that follow the season she is actually in.",
  "Grocery lists": "Lists that match the kitchen she already has and the market she actually walks into.",
  "Partner lane": "A useful lane for the person beside her — what to cook, hold, and stop guessing about.",
  "Week-by-week journey": "The house changes as the weeks change. Nothing is frozen at week twelve.",
  "Fourth trimester care": "The months after birth are a season here, not a discharge summary.",
};

function Ticker({ items }: { items: string[] }) {
  const source = items.length ? items : Object.keys(OFFER_COPY);
  const shown = source.slice(0, 6);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sheets = [...root.querySelectorAll<HTMLElement>("[data-sheet]")];
    let frame = 0;
    const update = () => {
      sheets.forEach((sheet) => {
        const card = sheet.querySelector<HTMLElement>("[data-card]");
        if (!card) return;
        const rect = sheet.getBoundingClientRect();
        const pin = parseFloat(getComputedStyle(sheet).top) || 90;
        const progress = Math.min(1, Math.max(0, (pin + 24 - rect.top) / 240));
        card.style.transform = `translate3d(0, ${progress * -10}px, 0) scale(${1 - progress * 0.035})`;
        card.style.filter = `saturate(${1 + progress * 0.15})`;
        const copy = card.querySelector<HTMLElement>("[data-copy]");
        if (copy) copy.style.opacity = String(1 - progress * 0.92);
      });
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
  }, [shown.join("|")]);

  return (
    <section ref={rootRef} className="offer-stack">
      <div className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
        <p className="text-xs uppercase tracking-[0.28em] text-ink/45">What the house holds</p>
      </div>
      {shown.map((item, i) => (
        <div
          key={item}
          data-sheet
          className="offer-sheet"
          style={{ top: `calc(5.6rem + ${i * 0.7}rem)`, zIndex: i + 1 }}
        >
          <article data-card className="offer-sheet-card">
            <p className="text-xs uppercase tracking-[0.22em] text-ink/40">0{i + 1}</p>
            <div data-copy>
              <p className="mt-4 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.02]">{item}</p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
                {OFFER_COPY[item] ?? "Part of the membership house — meals, binding, movement, and care that stay with her."}
              </p>
            </div>
          </article>
        </div>
      ))}
    </section>
  );
}

function Manifesto({ content }: { content: LandingContent }) {
  return (
    <section className="bg-transparent">
      <div className="section-air mx-auto max-w-5xl px-4 md:px-6">
      <Reveal className="glass-panel p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.32em] text-clay">A membership, not a feed</p>
        <h2 className="mt-8 font-display text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[1.05]">{content.manifesto}</h2>
        <div className="editorial-rule editorial-rule-clay mt-12" />
        <p className="mt-12 max-w-2xl text-xl leading-relaxed text-ink-soft">{content.offerLine}</p>
      </Reveal>
      </div>
    </section>
  );
}

function SplitStory({
  kicker,
  title,
  body,
  src,
  alt,
  href,
  linkLabel,
  photo,
  extraSrc,
  extraAlt,
  tone = "sea",
}: {
  kicker: string;
  title: string;
  body: string;
  src: string;
  alt: string;
  href: "/pricing" | "/belly-binding" | "/nouri" | "/about";
  linkLabel: string;
  photo: "left" | "right";
  extraSrc?: string;
  extraAlt?: string;
  tone?: "sea" | "clay" | "blush" | "plum";
}) {
  const wash =
    tone === "clay"
      ? "bg-wash-clay"
      : tone === "blush"
        ? "bg-wash-blush"
        : tone === "plum"
          ? "bg-wash-plum"
          : "bg-wash-sea";
  const kickerColor =
    tone === "clay"
      ? "text-clay"
      : tone === "blush"
        ? "text-blush"
        : tone === "plum"
          ? "text-plum"
          : "text-sea";
  const linkColor =
    tone === "clay"
      ? "text-clay-deep"
      : tone === "blush"
        ? "text-blush-deep"
        : tone === "plum"
          ? "text-plum"
          : "text-primary";
  const copy = (
    <div className={`split-copy flex min-h-[58vh] items-center px-1 py-8 lg:min-h-[auto] lg:py-16 ${wash}`}>
      <Reveal className="glass-panel w-full max-w-xl p-7 md:p-10">
      <p className={`text-xs uppercase tracking-[0.32em] ${kickerColor}`}>{kicker}</p>
      <h2 className="mt-6 font-display text-[clamp(2.4rem,4.5vw,4.4rem)] leading-[1.02]">{title}</h2>
      <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft md:text-xl">{body}</p>
      <Link to={href} className={`mt-10 inline-flex items-center gap-2 ${linkColor}`}>
        {linkLabel} <ArrowRight className="size-4" />
      </Link>
      </Reveal>
    </div>
  );
  const picture = (
    <div className="split-photo relative">
      <ParallaxFrame src={src} alt={alt} speed={0.34} className="absolute inset-0" />
      {extraSrc ? (
        <img
          src={extraSrc}
          alt={extraAlt ?? ""}
          className="media absolute bottom-8 right-6 hidden w-40 rounded-3xl object-cover shadow-[var(--shadow-border)] md:block md:h-52 md:w-44"
        />
      ) : null}
    </div>
  );
  return (
    <section className={`split-board grid lg:min-h-[auto] lg:grid-cols-2 ${photo === "left" ? "is-left" : "is-right"} ${wash}`}>
      {photo === "left" ? (
        <>
          {picture}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {picture}
        </>
      )}
    </section>
  );
}

function NouriBand({ content }: { content: LandingContent }) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden text-paper">
      <ParallaxFrame src={content.images.nouri} alt="Ripple in a ceramic tea bowl" speed={0.3} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-plum-deep/70" />
      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl items-end px-4 py-28 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-plum-light">{content.nouriKicker}</p>
          <h2 className="mt-5 font-display text-[clamp(2.6rem,6vw,5.2rem)]">{content.nouriTitle}</h2>
          <p className="mt-8 text-lg leading-relaxed text-paper/88 md:text-xl">{content.nouriBody}</p>
          <Link to="/nouri" className="mt-10 inline-flex items-center gap-2 text-plum-light">
            Meet Nouri <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function JourneyBand({ images }: { images: LandingContent["images"] }) {
  const stages = [
    { w: "Trying", d: "Mineral-rich plates and a softer nervous system.", img: images.hydration, alt: "Lemon water in a ceramic pitcher", wash: "bg-wash-sea", kicker: "text-sea" },
    { w: "Pregnancy", d: "Ginger broths, iron, walks, questions for the next visit.", img: images.movement, alt: "A pregnant woman stretching on a mat", wash: "bg-wash-clay", kicker: "text-clay" },
    { w: "Postpartum", d: "Binding studio, recovery movement, the fourth trimester.", img: images.rest, alt: "A postpartum mother resting by a window", wash: "bg-wash-blush", kicker: "text-blush" },
    { w: "The table", d: "Household size and culture shape the plan — partners get a useful lane.", img: images.family, alt: "A family sharing a meal at the kitchen table", wash: "bg-wash-plum", kicker: "text-plum" },
  ];
  return (
    <section>
      <div className="section-air mx-auto max-w-6xl px-4 md:px-6">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.32em] text-plum">The house grows with you</p>
          <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05]">
            New recipes, movement, and questions unlock by week.
          </h2>
        </Reveal>
      </div>
      {stages.map((s, i) => (
        <article key={s.w} className="grid min-h-[78vh] lg:grid-cols-2">
          <div className={i % 2 === 1 ? "relative min-h-[60vh] lg:order-2 lg:min-h-[78vh]" : "relative min-h-[60vh] lg:min-h-[78vh]"}>
            <ParallaxFrame src={s.img} alt={s.alt} speed={0.2} className="absolute inset-0" />
          </div>
          <Reveal className={`flex flex-col justify-center px-5 py-20 md:px-16 ${s.wash}`}>
            <p className={`text-xs uppercase tracking-[0.32em] ${s.kicker}`}>0{i + 1}</p>
            <h3 className="mt-5 font-display text-4xl md:text-6xl">{s.w}</h3>
            <p className="mt-6 max-w-md text-lg text-ink-soft md:text-xl">{s.d}</p>
          </Reveal>
        </article>
      ))}
    </section>
  );
}

function PartnerBand({ src }: { src: string }) {
  return (
    <section className="relative min-h-[80vh] overflow-hidden text-paper">
      <ParallaxFrame src={src} alt="A partner choosing produce from a handwritten list" speed={0.22} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-wine/62" />
      <div className="relative mx-auto flex min-h-[80vh] max-w-6xl items-end px-4 py-24 md:px-6">
        <Reveal className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.32em] text-gold">For partners, too</p>
          <h2 className="mt-5 font-display text-4xl md:text-6xl">A useful, private lane — not her medical chart.</h2>
          <p className="mt-6 text-lg leading-relaxed text-paper/85">
            Grocery lists, meals, and how to help today. The mother remains the patient we refuse to forget.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function MembershipClose({
  content,
  monthly,
  yearly,
}: {
  content: LandingContent;
  monthly: number;
  yearly: number;
}) {
  const save = yearlySavings(monthly, yearly);
  return (
    <section className="bg-sea px-4 py-32 text-primary-foreground md:px-6 md:py-40">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.32em] text-aqua">Membership</p>
          <h2 className="mt-6 font-display text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.95]">{content.closeTitle}</h2>
          <p className="mx-auto mt-8 max-w-lg text-lg text-primary-foreground/80 md:text-xl">{content.closeBody}</p>
          <p className="mt-12 font-display text-5xl tabular-nums">
            {formatCurrency(save.perMonthCents)}
            <span className="text-2xl text-primary-foreground/70"> / month, billed yearly</span>
          </p>
          <p className="mt-3 text-sm text-gold">
            Save {save.percent}% versus monthly · {formatCurrency(yearly)} / year
          </p>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Or {formatCurrency(monthly)} month to month. A meeting with Maat is the only extra.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <MagneticLink to="/pricing" className="bg-paper text-ink hover:bg-cream dark:hover:bg-cream">
              {content.cta}
            </MagneticLink>
            <Link to="/login" search={{}} className="text-sm text-paper/80 underline-offset-8 hover:underline">
              Already a member? Sign in
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
