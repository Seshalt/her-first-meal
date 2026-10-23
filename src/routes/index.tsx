import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { mergeLanding } from "@/lib/landing";
import { getLanding } from "@/lib/server/public";
import { formatCurrency } from "@/lib/utils";
import { useT } from "@/lib/i18n/provider";
import { usePublicSite } from "@/lib/use-public-site";
import "../landing-v3.css";

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
  const localizeContent = useContentText();
  const t = useT();
  const { site } = usePublicSite();
  const page = Route.useLoaderData();
  const content = page?.content ?? mergeLanding(null);
  const monthly = page?.monthlyPriceCents ?? 4900;
  const yearly = page?.yearlyPriceCents ?? 49000;

  return (
    <div className="hfm4">
      <PublicNav overlay />
      <main>
        <section className="hfm4-hero">
          <div className="hfm4-thread hfm4-thread-a" aria-hidden="true" />
          <div className="hfm4-thread hfm4-thread-b" aria-hidden="true" />
          <div className="hfm4-hero-inner">
            <div className="hfm4-hero-copy">
              <div className="hfm4-hero-brand">
                <span>{localizeContent("Pregnancy · postpartum · care centered on you")}</span>
              </div>
              <p className="hfm4-hero-overline">{localizeContent(t("home.heroOverline"))}</p>
              <h1>{localizeContent(t("home.heroTitle"))}</h1>
              <p className="hfm4-hero-lede">
                {localizeContent(t("home.heroBody"))}
              </p>
              <div className="hfm4-actions">
                <Link to="/pricing" className="hfm4-button hfm4-button-light">
                  {localizeContent(t("cta"))} <ArrowRight className="size-4" />
                </Link>
                <Link to="/about" className="hfm4-text-link">{localizeContent(t("home.meet"))} <ArrowRight className="size-4" /></Link>
              </div>
              <div className="hfm4-hero-proof" aria-label={localizeContent("Membership highlights")}>
                <span>{localizeContent(t("room.meals"))}</span><i />
                <span>{localizeContent(t("room.grocery"))}</span><i />
                <span>{localizeContent(t("room.move"))}</span><i />
                <span>{localizeContent(t("room.binding"))}</span><i />
                <span>{localizeContent(t("room.write"))}</span>
              </div>
            </div>

            <figure className="hfm4-hero-figure">
              <div className="hfm4-hero-photo-wrap">
                <img src={content.images.hero} alt={localizeContent(content.alts.hero)} className="hfm4-hero-photo" />
              </div>
              <figcaption>
                <span>{localizeContent(t("home.careChanges"))}</span>
                <span>{localizeContent("Her First Meal · 2026")}</span>
              </figcaption>
            </figure>
          </div>
          <div className="hfm4-hero-foot" aria-hidden="true">
            <span>{localizeContent("NOURISH")}</span><span>{localizeContent("HOLD")}</span><span>{localizeContent("REST")}</span><span>{localizeContent("MOVE")}</span><span>{localizeContent("REMEMBER")}</span>
          </div>
        </section>

        <section className="hfm4-manifesto">
          <div className="hfm4-manifesto-grid">
            <p className="hfm4-kicker">{localizeContent("Your care stays visible.")}</p>
            <div>
              <h2>{localizeContent("One place for the parts of pregnancy and postpartum you should not have to piece together.")}</h2>
              <div className="hfm4-quick-points" aria-label={localizeContent("What you can do")}>
                <span>{localizeContent("Plan meals")}</span>
                <span>{localizeContent("Build grocery lists")}</span>
                <span>{localizeContent("Check daily guidance")}</span>
                <span>{localizeContent("Learn belly binding")}</span>
                <span>{localizeContent("Move at your pace")}</span>
                <span>{localizeContent("Ask a real person")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="hfm4-stories" aria-label={localizeContent("What membership includes")}>
          <article className="hfm4-story hfm4-story-food">
            <div className="hfm4-story-media">
              <img src={content.images.meals} alt={localizeContent(content.alts.meals)} />
              <img className="hfm4-story-inset" src={content.images.hydration} alt={localizeContent(content.alts.hydration)} />
              <span className="hfm4-photo-label">{localizeContent("Built for a real kitchen.")}</span>
            </div>
            <div className="hfm4-story-copy">
              <p className="hfm4-kicker">{localizeContent("01 · Nourishment")}</p>
              <h2>{localizeContent("Meals that fit how you eat.")}</h2>
              <p>{localizeContent("Choose your diet, culture, budget, household size, and pantry. Her First Meal turns those choices into practical meals and one grocery list.")}</p>
              <div className="hfm4-diet-row" aria-label={localizeContent("Supported dietary preferences")}>
                <span>{localizeContent("Vegan")}</span><span>{localizeContent("Vegetarian")}</span><span>{localizeContent("Pescatarian")}</span><span>{localizeContent("Gluten-free")}</span><span>{localizeContent("Dairy-free")}</span><span>{localizeContent("Halal")}</span><span>{localizeContent("Kosher")}</span>
              </div>
              <Link to="/pricing" className="hfm4-arrow-link">{localizeContent("See what membership includes ")}<ArrowRight className="size-4" /></Link>
            </div>
          </article>

          <article className="hfm4-story hfm4-story-market">
            <div className="hfm4-story-copy">
              <p className="hfm4-kicker">{localizeContent("02 · Groceries")}</p>
              <h2>{localizeContent("Groceries that fit where you shop.")}</h2>
              <p>{localizeContent("Save your city or ZIP and preferred stores. Your meals become one list, pantry items come off, and nearby-store search only opens when you ask.")}</p>
              <div className="hfm4-market-line"><MapPin className="size-4" /> {localizeContent(" City · ZIP · preferred stores · optional nearby search")}</div>
              <Link to="/pricing" className="hfm4-arrow-link">{localizeContent("Explore grocery planning ")}<ArrowRight className="size-4" /></Link>
            </div>
            <div className="hfm4-story-media hfm4-market-photo">
              <img src={content.images.grocery} alt={localizeContent(content.alts.grocery)} />
              <p className="hfm4-market-note">{localizeContent("Meals → list → your stores.")}</p>
            </div>
          </article>
        </section>

        <section className="hfm4-binding">
          <img src={content.images.binding} alt={localizeContent(content.alts.binding)} className="hfm4-binding-photo" />
          <div className="hfm4-binding-shade" />
          <div className="hfm4-binding-inner">
            <p className="hfm4-kicker">{localizeContent("03 · Belly Binding Studio")}</p>
            <h2>{localizeContent("Belly binding,")}<br /><em>{localizeContent("held with care.")}</em></h2>
            <p>{localizeContent("Learn wrapping with clear steps, reference images, a private journal, and optional live review with Maat. Educational support only.")}</p>
            <Link to="/belly-binding" className="hfm4-button hfm4-button-gold">{localizeContent("Enter the studio ")}<ArrowRight className="size-4" /></Link>
          </div>
          <div className="hfm4-binding-still">
            <img src={content.images.bindingStill} alt={localizeContent(content.alts.bindingStill)} />
            <span>{localizeContent("Teaching first.")}</span>
          </div>
        </section>

        <section className="hfm4-rhythm">
          <div className="hfm4-rhythm-head">
            <p className="hfm4-kicker">{localizeContent("04 · Your daily view")}</p>
            <h2>{localizeContent("See what matters today.")}</h2>
          </div>
          <div className="hfm4-rhythm-lines">
            <article>
              <span className="hfm4-rhythm-number">{localizeContent("A")}</span>
              <h3>{localizeContent("Daily body readings")}</h3>
              <p>{localizeContent("A short note about what may be changing and when a question belongs with your clinician.")}</p>
            </article>
            <article>
              <span className="hfm4-rhythm-number">{localizeContent("B")}</span>
              <h3>{localizeContent("Movement at your pace")}</h3>
              <p>{localizeContent("Walks, mobility, rest, and gentle options matched to your stage and energy.")}</p>
            </article>
            <article>
              <span className="hfm4-rhythm-number">{localizeContent("C")}</span>
              <h3>{localizeContent("Practical partner support")}</h3>
              <p>{localizeContent("Simple ways your partner can help with meals, shopping, and the day ahead.")}</p>
            </article>
          </div>
        </section>

        <section className="hfm4-seasons">
          <div className="hfm4-seasons-intro">
            <p className="hfm4-kicker">{localizeContent("Your plan changes with your stage")}</p>
            <h2>{localizeContent("Trying, pregnancy, and postpartum need different kinds of support.")}</h2>
          </div>
          <div className="hfm4-season-list">
            <Season number="01" title={localizeContent("Trying")} image={content.images.hydration} alt={localizeContent(content.alts.hydration)} body={localizeContent("Steady meals, practical routines, and grocery planning without turning the process into another job.")} />
            <Season number="02" title={localizeContent("Pregnancy")} image={content.images.movement} alt={localizeContent(content.alts.movement)} body={localizeContent("Meals, body notes, movement, and week guidance that follow the stage and preferences you share.")} />
            <Season number="03" title={localizeContent("Postpartum")} image={content.images.rest} alt={localizeContent(content.alts.rest)} body={localizeContent("Recovery-minded meals, rest, movement, daily readings, and belly binding education.")} />
            <Season number="04" title={localizeContent("Your household")} image={content.images.family} alt={localizeContent(content.alts.family)} body={localizeContent("Your culture, household size, pantry, budget, and support system shape the plan.")} />
          </div>
        </section>

        <section className="hfm4-support">
          <div className="hfm4-support-photo">
            <img src={content.images.rest} alt={localizeContent(content.alts.rest)} />
          </div>
          <div className="hfm4-support-copy">
            <p className="hfm4-kicker">{localizeContent("05 · Human support")}</p>
            <h2>{localizeContent("Need a person? Ask one.")}</h2>
            <p>{localizeContent("Send Maat a private note or book a live Zoom when you want human eyes on a question.")}</p>
            <Link to="/nouri" className="hfm4-arrow-link">{localizeContent("See human support ")}<ArrowRight className="size-4" /></Link>
          </div>
        </section>

        <section className="bg-[#eee7dc] px-4 py-16 text-ink md:px-6 md:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_1.1fr]">
            <div className="overflow-hidden rounded-[30px]">
              <img src={content.images.family} alt={localizeContent(content.alts.family)} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-clay">{localizeContent(site.doulaKicker)}</p>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-none">{localizeContent(site.doulaTitle)}</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-ink-soft">{localizeContent(site.doulaIntro)}</p>
              <p className="mt-6 font-display text-4xl">{localizeContent(site.doulaPrice)}</p>
              <p className="mt-2 text-sm text-ink-soft">{localizeContent(site.doulaPriceNote)}</p>
              <Link to="/doula" className="mt-7 inline-flex items-center gap-2 border-b border-clay pb-1 text-sm font-semibold text-clay">
                {localizeContent(site.navDoula)} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="hfm4-membership">
          <div className="hfm4-membership-top">
            <div>
              <p className="hfm4-kicker">{localizeContent("Membership")}</p>
              <h2>{localizeContent("Everything in one membership.")}</h2>
            </div>
            <p>{localizeContent("Meals, groceries, pantry tools, daily guidance, movement, belly binding, partner support, and direct access to Maat.")}</p>
          </div>
          <div className="hfm4-membership-bottom">
            <div className="hfm4-price">
              <span>{localizeContent("Monthly")}</span>
              <strong>{localizeContent(formatCurrency(monthly))}</strong>
              <small>{localizeContent("month to month")}</small>
            </div>
            <div className="hfm4-price hfm4-price-yearly">
              <span>{localizeContent("Yearly")}</span>
              <strong>{localizeContent(formatCurrency(yearly))}</strong>
              <small>{localizeContent("billed once")}</small>
            </div>
            <ul className="hfm4-includes">
              <li><Check className="size-4" /> {localizeContent(" Meals + pantry + grocery planning")}</li>
              <li><Check className="size-4" /> {localizeContent(" Daily body readings + stage guidance")}</li>
              <li><Check className="size-4" /> {localizeContent(" Belly Binding Studio + movement")}</li>
              <li><Check className="size-4" /> {localizeContent(" Partner support + human support")}</li>
            </ul>
            <Link to="/pricing" className="hfm4-button hfm4-button-gold">{localizeContent("Choose membership ")}<ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function Season({ number, title, body, image, alt }: { number: string; title: string; body: string; image: string; alt: string }) {
  const localizeContent = useContentText();
  return (
    <article className="hfm4-season">
      <span className="hfm4-season-number">{localizeContent(number)}</span>
      <h3>{localizeContent(title)}</h3>
      <p>{localizeContent(body)}</p>
      <div className="hfm4-season-image"><img src={image} alt={localizeContent(alt)} /></div>
    </article>
  );
}
