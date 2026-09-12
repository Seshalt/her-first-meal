import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { MagneticLink } from "@/components/motion/magnetic-button";
import { ParallaxFrame, Reveal } from "@/components/motion/parallax";
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
  const ticker = lines(page?.site.ticker ?? "");
  const monthly = page?.monthlyPriceCents ?? 4900;
  const yearly = page?.yearlyPriceCents ?? 49000;
  const layout = page?.studio.layout;
  const overlayNav = (layout?.nav ?? "overlay") === "overlay";
  const photoStart = layout?.photo === "left" ? "left" : "right";

  return (
    <div className="landing-cinematic relative isolate">
      <div className="cine-wash" aria-hidden />
      <div className="relative z-[1]">
        <a href="#house" className="skip-to-house">
          Skip to the house
        </a>
        <PublicNav overlay={overlayNav} cinematic />
        <Hero content={content} variant={layout?.hero ?? "cinematic"} />
        <Manifesto content={content} items={ticker} src={content.images.family} alt={content.alts.family} />
        <PhotoChapter
          kicker={content.mealsKicker}
          title={content.mealsTitle}
          body={content.mealsBody}
          src={content.images.meals}
          alt={content.alts.meals}
          href="/pricing"
          linkLabel="See the membership"
          photo={photoStart}
          tone="clay"
        />
        <PhotoChapter
          kicker={content.bindingKicker}
          title={content.bindingTitle}
          body={content.bindingBody}
          src={content.images.binding}
          alt={content.alts.binding}
          href="/belly-binding"
          linkLabel="Visit the studio"
          photo={photoStart === "left" ? "right" : "left"}
          tone="blush"
        />
        <PhotoChapter
          kicker={content.nouriKicker}
          title={content.nouriTitle}
          body={content.nouriBody}
          src={content.images.nouri}
          alt={content.alts.nouri}
          href="/nouri"
          linkLabel="Meet Nouri"
          photo={photoStart}
          tone="plum"
        />
        <JourneyBand images={content.images} alts={content.alts} />
        <PartnerBand src={content.images.grocery} alt={content.alts.grocery} />
        <MembershipClose content={content} monthly={monthly} yearly={yearly} />
        <PublicFooter />
      </div>
    </div>
  );
}

function Hero({ content, variant }: { content: LandingContent; variant: "cinematic" | "split" | "centered" }) {
  const centered = variant === "centered";
  const split = variant === "split";

  if (split) {
    return (
      <section className="cine-hero grid min-h-[100dvh] lg:grid-cols-2" aria-label="Opening">
        <div className="relative order-1 min-h-[58vh] lg:order-2 lg:min-h-full">
          <ParallaxFrame
            src={content.images.hero}
            alt={content.alts.hero}
            speed={0.48}
            className="absolute inset-0"
            imgClassName="object-[center_18%]"
          />
          <div className="cine-hero-veil pointer-events-none absolute inset-0 lg:hidden" />
        </div>
        <div className="order-2 flex flex-col justify-end px-5 py-16 md:px-10 md:py-24 lg:order-1">
          <p className="text-xs uppercase tracking-[0.42em] text-gold">{content.eyebrow}</p>
          <h1 className="mt-8 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[0.98] text-paper">
            {content.headline}
            <span className="mt-3 block italic text-gold">{content.headlineAccent}</span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/86">{content.subhead}</p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <MagneticLink to="/pricing" className="bg-gold text-ink hover:bg-paper">
              {content.cta}
            </MagneticLink>
            <Link to="/pricing" className="text-sm text-paper/75 underline-offset-8 hover:text-paper hover:underline">
              {content.secondaryCta}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cine-hero relative min-h-[100dvh] overflow-hidden text-paper" aria-label="Opening">
      <ParallaxFrame
        src={content.images.hero}
        alt={content.alts.hero}
        speed={0.55}
        className="absolute inset-0"
        imgClassName="object-[center_16%]"
      />
      <div className="cine-hero-veil pointer-events-none absolute inset-0" />
      <div
        className={
          centered
            ? "relative mx-auto flex min-h-[100dvh] max-w-4xl flex-col items-center justify-end px-5 pb-20 pt-32 text-center md:px-10 md:pb-28"
            : "relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32 md:px-10 md:pb-28"
        }
      >
        <div className={centered ? "stagger max-w-2xl" : "stagger max-w-xl"}>
          <p className="text-xs uppercase tracking-[0.42em] text-gold">{content.eyebrow}</p>
          <h1 className="mt-8 font-display text-[clamp(2.5rem,7.2vw,5.8rem)] leading-[0.94] text-paper [text-shadow:0_18px_40px_rgba(8,6,8,0.45)]">
            {content.headline}
            <span className="mt-4 block italic text-gold">{content.headlineAccent}</span>
          </h1>
          <p className={`mt-8 max-w-md text-lg leading-relaxed text-paper/88 md:text-xl ${centered ? "mx-auto" : ""}`}>
            {content.subhead}
          </p>
          <div className={`mt-12 flex flex-wrap items-center gap-6 ${centered ? "justify-center" : ""}`}>
            <MagneticLink to="/pricing" className="bg-gold text-ink hover:bg-paper">
              {content.cta}
            </MagneticLink>
            <Link to="/pricing" className="text-sm text-paper/75 underline-offset-8 hover:text-paper hover:underline">
              {content.secondaryCta}
            </Link>
          </div>
        </div>
        <p
          className={`mt-16 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-paper/50 ${centered ? "justify-center" : ""}`}
        >
          <ArrowDown className="size-4" />
          Scroll
        </p>
      </div>
    </section>
  );
}

function Manifesto({
  content,
  items,
  src,
  alt,
}: {
  content: LandingContent;
  items: string[];
  src: string;
  alt: string;
}) {
  const held = items.length ? items.slice(0, 6) : ["Personalized meals", "Belly Binding Studio", "Nouri", "Movement", "Partner lane"];
  return (
    <section id="house" className="cine-manifesto">
      <div className="cine-air mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.42em] text-gold">A membership, not a feed</p>
          <div className="editorial-rule mt-8" />
          <h2 className="mt-10 font-display text-[clamp(2.4rem,5.6vw,4.8rem)] leading-[1.02] text-paper">
            {content.headlineAccent}
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/80 md:text-xl">{content.offerLine}</p>
          <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase tracking-[0.22em] text-gold/90">
            {held.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
        <div className="cine-portrait">
          <ParallaxFrame src={src} alt={alt} speed={0.28} className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}

function PhotoChapter({
  kicker,
  title,
  body,
  src,
  alt,
  href,
  linkLabel,
  photo,
  tone,
}: {
  kicker: string;
  title: string;
  body: string;
  src: string;
  alt: string;
  href: "/pricing" | "/belly-binding" | "/nouri" | "/about";
  linkLabel: string;
  photo: "left" | "right";
  tone: "sea" | "clay" | "blush" | "plum";
}) {
  const kickerClass =
    tone === "clay" ? "text-gold" : tone === "blush" ? "text-blush-light" : tone === "plum" ? "text-plum-light" : "text-aqua";
  const picture = (
    <div className="cine-split-photo">
      <ParallaxFrame src={src} alt={alt} speed={0.5} className="absolute inset-0" />
    </div>
  );
  const copy = (
    <div className="cine-split-copy">
      <Reveal className="cine-panel">
        <p className={`text-xs uppercase tracking-[0.42em] ${kickerClass}`}>{kicker}</p>
        <h2 className="mt-6 font-display text-[clamp(2.2rem,4.4vw,4.2rem)] leading-[1.04] text-paper">{title}</h2>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/82 md:text-xl">{body}</p>
        <Link to={href} className="mt-10 inline-flex min-h-11 items-center gap-2 text-gold hover:text-paper">
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </div>
  );
  return (
    <section className={`cine-split ${photo === "left" ? "is-left" : "is-right"}`}>
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

function JourneyBand({
  images,
  alts,
}: {
  images: LandingContent["images"];
  alts: LandingContent["alts"];
}) {
  const stages = [
    { w: "Trying", d: "Mineral-rich plates, grocery lists for the kitchen she has, and gentler movement while she waits.", n: "01" },
    { w: "Pregnancy", d: "Meals that follow appetite and week, iron and broths, walks, and questions worth bringing to the next visit.", n: "02" },
    { w: "Postpartum", d: "Recovery plates, the Belly Binding Studio, and movement that treats the fourth trimester as a season.", n: "03" },
    { w: "The table", d: "Household size and culture shape the meals. Partners get a grocery list and a lane that is useful — not her chart.", n: "04" },
  ];
  return (
    <section className="cine-journey">
      <div className="cine-journey-photo">
        <ParallaxFrame src={images.rest} alt={alts.rest} speed={0.38} className="absolute inset-0" />
        <div className="cine-journey-veil" />
      </div>
      <div className="relative cine-air mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.42em] text-gold">The house grows with you</p>
          <h2 className="mt-8 max-w-3xl font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] text-paper">
            Meals, movement, and questions change with the week she is in.
          </h2>
        </Reveal>
        <ol className="mt-20 grid gap-x-16 gap-y-16 md:grid-cols-2">
          {stages.map((s) => (
            <li key={s.w}>
              <Reveal>
                <p className="font-display text-4xl text-gold/80 md:text-5xl">{s.n}</p>
                <h3 className="mt-4 font-display text-3xl text-paper md:text-4xl">{s.w}</h3>
                <p className="mt-5 max-w-sm text-base leading-relaxed text-paper/78 md:text-lg">{s.d}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="mt-16 text-sm text-paper/55">
          Movement stays gentle: stretching, walks, and work for the body she is in — never a bootcamp.
        </p>
      </div>
    </section>
  );
}

function PartnerBand({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="cine-partner relative min-h-[88vh] overflow-hidden text-paper">
      <ParallaxFrame src={src} alt={alt} speed={0.42} className="absolute inset-0" />
      <div className="cine-partner-veil pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl items-end px-5 py-24 md:px-10">
        <Reveal className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.42em] text-gold">For partners, too</p>
          <h2 className="mt-6 font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.04]">
            A useful, private lane — not her medical chart.
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-paper/86 md:text-xl">
            Partners get the week’s grocery list, the meals to cook, and a short note on how to help today. Her record stays hers.
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
    <section className="cine-close px-5 py-32 md:px-10 md:py-44">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.42em] text-gold">Membership</p>
          <div className="editorial-rule mx-auto mt-8" />
          <h2 className="mt-10 font-display text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.95] text-paper">
            {content.closeTitle}
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-paper/80 md:text-xl">{content.closeBody}</p>
          <p className="mt-14 font-display text-5xl tabular-nums text-paper">
            {formatCurrency(save.perMonthCents)}
            <span className="text-2xl text-paper/65"> / month, billed yearly</span>
          </p>
          <p className="mt-4 text-sm text-gold">
            Save {save.percent}% versus monthly · {formatCurrency(yearly)} / year
          </p>
          <p className="mt-3 text-sm text-paper/60">
            Or {formatCurrency(monthly)} month to month. A private session with Maat is the only extra.
          </p>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            <MagneticLink to="/pricing" className="bg-gold text-ink hover:bg-paper">
              {content.cta}
            </MagneticLink>
            <Link to="/login" search={{}} className="text-sm text-paper/75 underline-offset-8 hover:underline">
              Already a member? Sign in
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
