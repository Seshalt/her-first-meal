import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { HouseMark } from "@/components/brand/logo";
import { mergeLanding } from "@/lib/landing";
import { getLanding } from "@/lib/server/public";
import { formatCurrency } from "@/lib/utils";
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
                <HouseMark className="hfm4-hero-mark" />
                <span>Pregnancy · postpartum · care for the mother</span>
              </div>
              <p className="hfm4-hero-overline">The world celebrates the baby.</p>
              <h1>We remember<br />the mother.</h1>
              <p className="hfm4-hero-lede">
                Nourishment, grocery planning, belly binding education, movement, daily body notes, and human support — shaped around the season she is actually living.
              </p>
              <div className="hfm4-actions">
                <Link to="/pricing" className="hfm4-button hfm4-button-light">
                  {content.cta} <ArrowRight className="size-4" />
                </Link>
                <Link to="/about" className="hfm4-text-link">Meet the house <ArrowRight className="size-4" /></Link>
              </div>
              <div className="hfm4-hero-proof" aria-label="Membership highlights">
                <span>Meals</span><i />
                <span>Groceries</span><i />
                <span>Movement</span><i />
                <span>Binding</span><i />
                <span>Support</span>
              </div>
            </div>

            <figure className="hfm4-hero-figure">
              <div className="hfm4-hero-photo-wrap">
                <img src={content.images.hero} alt={content.alts.hero} className="hfm4-hero-photo" />
              </div>
              <figcaption>
                <span>Care should change when her body does.</span>
                <span>Her First Meal · 2026</span>
              </figcaption>
            </figure>
          </div>
          <div className="hfm4-hero-foot" aria-hidden="true">
            <span>NOURISH</span><span>HOLD</span><span>REST</span><span>MOVE</span><span>REMEMBER</span>
          </div>
        </section>

        <section className="hfm4-manifesto">
          <div className="hfm4-manifesto-mark" aria-hidden="true"><HouseMark /></div>
          <div className="hfm4-manifesto-grid">
            <p className="hfm4-kicker">Her care does not become background care.</p>
            <div>
              <h2>A whole maternal wellness house, built around the woman in the middle of it.</h2>
              <p>{content.offerLine}</p>
            </div>
          </div>
        </section>

        <section className="hfm4-stories" aria-label="What membership holds">
          <article className="hfm4-story hfm4-story-food">
            <div className="hfm4-story-media">
              <img src={content.images.meals} alt={content.alts.meals} />
              <img className="hfm4-story-inset" src={content.images.hydration} alt={content.alts.hydration} />
              <span className="hfm4-photo-label">A real kitchen, not a perfect one.</span>
            </div>
            <div className="hfm4-story-copy">
              <p className="hfm4-kicker">01 · Nourishment</p>
              <h2>Meals that know how she actually eats.</h2>
              <p>{content.mealsBody}</p>
              <div className="hfm4-rule" />
              <p className="hfm4-detail">Vegan, vegetarian, pescatarian, gluten-free, dairy-free, nut-free, soy-free, halal, kosher — chosen during onboarding and used throughout the house.</p>
              <Link to="/pricing" className="hfm4-arrow-link">See what membership holds <ArrowRight className="size-4" /></Link>
            </div>
          </article>

          <article className="hfm4-story hfm4-story-market">
            <div className="hfm4-story-copy">
              <p className="hfm4-kicker">02 · The market</p>
              <h2>A grocery plan that has to work where she lives.</h2>
              <p>
                Meals become one practical list. Pantry items come off. Save the city or ZIP and the stores she actually uses, then open a nearby-store search only when she asks for it.
              </p>
              <div className="hfm4-market-line"><MapPin className="size-4" /> City · ZIP · preferred stores · one-time nearby search</div>
              <Link to="/pricing" className="hfm4-arrow-link">Explore local grocery planning <ArrowRight className="size-4" /></Link>
            </div>
            <div className="hfm4-story-media hfm4-market-photo">
              <img src={content.images.grocery} alt={content.alts.grocery} />
              <p className="hfm4-market-note">The list follows the meals. The meals follow her.</p>
            </div>
          </article>
        </section>

        <section className="hfm4-binding">
          <img src={content.images.binding} alt={content.alts.binding} className="hfm4-binding-photo" />
          <div className="hfm4-binding-shade" />
          <div className="hfm4-binding-inner">
            <p className="hfm4-kicker">03 · Flagship practice</p>
            <h2>Belly binding,<br /><em>held with care.</em></h2>
            <p>{content.bindingBody}</p>
            <Link to="/belly-binding" className="hfm4-button hfm4-button-gold">Enter the Belly Binding Studio <ArrowRight className="size-4" /></Link>
          </div>
          <div className="hfm4-binding-still">
            <img src={content.images.bindingStill} alt={content.alts.bindingStill} />
            <span>Teaching first. Never spectacle.</span>
          </div>
        </section>

        <section className="hfm4-rhythm">
          <div className="hfm4-rhythm-head">
            <p className="hfm4-kicker">04 · A daily rhythm</p>
            <h2>Useful care should meet the day she has — not hand her another dashboard.</h2>
          </div>
          <div className="hfm4-rhythm-lines">
            <article>
              <span className="hfm4-rhythm-number">A</span>
              <h3>Daily body readings</h3>
              <p>Short, grounded notes about pregnancy, postpartum, appetite, hydration, recovery, movement, and when a question belongs with a clinician.</p>
            </article>
            <article>
              <span className="hfm4-rhythm-number">B</span>
              <h3>Movement without punishment</h3>
              <p>Stage-aware walks, mobility, rest, and gentle work without streaks, calorie language, or turning recovery into a performance.</p>
            </article>
            <article>
              <span className="hfm4-rhythm-number">C</span>
              <h3>A partner lane with a job</h3>
              <p>What to cook, what to buy, and how to help today — without making her private journal or body notes shared reading.</p>
            </article>
          </div>
        </section>

        <section className="hfm4-seasons">
          <div className="hfm4-seasons-intro">
            <p className="hfm4-kicker">The house grows with her</p>
            <h2>Trying is not pregnancy. Pregnancy is not postpartum. The plan should know the difference.</h2>
          </div>
          <div className="hfm4-season-list">
            <Season number="01" title="Trying" image={content.images.hydration} alt={content.alts.hydration} body="Steady nourishment, practical routines, grocery planning, and room for the process to stay human." />
            <Season number="02" title="Pregnancy" image={content.images.movement} alt={content.alts.movement} body="Meals, body notes, movement, and week context that follow the stage and preferences she shares." />
            <Season number="03" title="Postpartum" image={content.images.rest} alt={content.alts.rest} body="Recovery-minded meals, rest, movement, daily readings, and the Belly Binding Studio." />
            <Season number="04" title="The household" image={content.images.family} alt={content.alts.family} body="Culture, household size, pantry, budget, and the people helping all shape the practical plan." />
          </div>
        </section>

        <section className="hfm4-support">
          <div className="hfm4-support-photo">
            <img src={content.images.rest} alt={content.alts.rest} />
          </div>
          <div className="hfm4-support-copy">
            <p className="hfm4-kicker">05 · Human support</p>
            <h2>Some questions deserve a person.</h2>
            <p>{content.nouriBody}</p>
            <Link to="/nouri" className="hfm4-arrow-link">See the support lane <ArrowRight className="size-4" /></Link>
          </div>
        </section>

        <section className="hfm4-membership">
          <div className="hfm4-membership-top">
            <div>
              <p className="hfm4-kicker">Membership</p>
              <h2>The whole house.<br />One membership.</h2>
            </div>
            <p>{content.closeBody}</p>
          </div>
          <div className="hfm4-membership-bottom">
            <div className="hfm4-price">
              <span>Monthly</span>
              <strong>{formatCurrency(monthly)}</strong>
              <small>month to month</small>
            </div>
            <div className="hfm4-price hfm4-price-yearly">
              <span>Yearly</span>
              <strong>{formatCurrency(yearly)}</strong>
              <small>billed once for the same full house</small>
            </div>
            <ul className="hfm4-includes">
              <li><Check className="size-4" /> Meals + pantry + grocery planning</li>
              <li><Check className="size-4" /> Daily body readings + stage guidance</li>
              <li><Check className="size-4" /> Belly Binding Studio + movement</li>
              <li><Check className="size-4" /> Partner lane + human support</li>
            </ul>
            <Link to="/pricing" className="hfm4-button hfm4-button-gold">Choose membership <ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function Season({ number, title, body, image, alt }: { number: string; title: string; body: string; image: string; alt: string }) {
  return (
    <article className="hfm4-season">
      <span className="hfm4-season-number">{number}</span>
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="hfm4-season-image"><img src={image} alt={alt} /></div>
    </article>
  );
}
