import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
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
                <span>Pregnancy · postpartum · care centered on you</span>
              </div>
              <p className="hfm4-hero-overline">The world celebrates the baby.</p>
              <h1>We remember<br />the mother.</h1>
              <p className="hfm4-hero-lede">
                Meals, grocery planning, daily body guidance, movement, belly binding education, and real human support — shaped around your stage and preferences.
              </p>
              <div className="hfm4-actions">
                <Link to="/pricing" className="hfm4-button hfm4-button-light">
                  {content.cta} <ArrowRight className="size-4" />
                </Link>
                <Link to="/about" className="hfm4-text-link">Meet Her First Meal <ArrowRight className="size-4" /></Link>
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
                <span>Your care should change when your body does.</span>
                <span>Her First Meal · 2026</span>
              </figcaption>
            </figure>
          </div>
          <div className="hfm4-hero-foot" aria-hidden="true">
            <span>NOURISH</span><span>HOLD</span><span>REST</span><span>MOVE</span><span>REMEMBER</span>
          </div>
        </section>

        <section className="hfm4-manifesto">
          <div className="hfm4-manifesto-grid">
            <p className="hfm4-kicker">Your care stays visible.</p>
            <div>
              <h2>One place for the parts of pregnancy and postpartum you should not have to piece together.</h2>
              <div className="hfm4-quick-points" aria-label="What you can do">
                <span>Plan meals</span>
                <span>Build grocery lists</span>
                <span>Check daily guidance</span>
                <span>Learn belly binding</span>
                <span>Move at your pace</span>
                <span>Ask a real person</span>
              </div>
            </div>
          </div>
        </section>

        <section className="hfm4-stories" aria-label="What membership includes">
          <article className="hfm4-story hfm4-story-food">
            <div className="hfm4-story-media">
              <img src={content.images.meals} alt={content.alts.meals} />
              <img className="hfm4-story-inset" src={content.images.hydration} alt={content.alts.hydration} />
              <span className="hfm4-photo-label">Built for a real kitchen.</span>
            </div>
            <div className="hfm4-story-copy">
              <p className="hfm4-kicker">01 · Nourishment</p>
              <h2>Meals that fit how you eat.</h2>
              <p>Choose your diet, culture, budget, household size, and pantry. Her First Meal turns those choices into practical meals and one grocery list.</p>
              <div className="hfm4-diet-row" aria-label="Supported dietary preferences">
                <span>Vegan</span><span>Vegetarian</span><span>Pescatarian</span><span>Gluten-free</span><span>Dairy-free</span><span>Halal</span><span>Kosher</span>
              </div>
              <Link to="/pricing" className="hfm4-arrow-link">See what membership includes <ArrowRight className="size-4" /></Link>
            </div>
          </article>

          <article className="hfm4-story hfm4-story-market">
            <div className="hfm4-story-copy">
              <p className="hfm4-kicker">02 · Groceries</p>
              <h2>Groceries that fit where you shop.</h2>
              <p>Save your city or ZIP and preferred stores. Your meals become one list, pantry items come off, and nearby-store search only opens when you ask.</p>
              <div className="hfm4-market-line"><MapPin className="size-4" /> City · ZIP · preferred stores · optional nearby search</div>
              <Link to="/pricing" className="hfm4-arrow-link">Explore grocery planning <ArrowRight className="size-4" /></Link>
            </div>
            <div className="hfm4-story-media hfm4-market-photo">
              <img src={content.images.grocery} alt={content.alts.grocery} />
              <p className="hfm4-market-note">Meals → list → your stores.</p>
            </div>
          </article>
        </section>

        <section className="hfm4-binding">
          <img src={content.images.binding} alt={content.alts.binding} className="hfm4-binding-photo" />
          <div className="hfm4-binding-shade" />
          <div className="hfm4-binding-inner">
            <p className="hfm4-kicker">03 · Belly Binding Studio</p>
            <h2>Belly binding,<br /><em>held with care.</em></h2>
            <p>Learn wrapping with clear steps, reference images, a private journal, and optional live review with Maat. Educational support only.</p>
            <Link to="/belly-binding" className="hfm4-button hfm4-button-gold">Enter the studio <ArrowRight className="size-4" /></Link>
          </div>
          <div className="hfm4-binding-still">
            <img src={content.images.bindingStill} alt={content.alts.bindingStill} />
            <span>Teaching first.</span>
          </div>
        </section>

        <section className="hfm4-rhythm">
          <div className="hfm4-rhythm-head">
            <p className="hfm4-kicker">04 · Your daily view</p>
            <h2>See what matters today.</h2>
          </div>
          <div className="hfm4-rhythm-lines">
            <article>
              <span className="hfm4-rhythm-number">A</span>
              <h3>Daily body readings</h3>
              <p>A short note about what may be changing and when a question belongs with your clinician.</p>
            </article>
            <article>
              <span className="hfm4-rhythm-number">B</span>
              <h3>Movement at your pace</h3>
              <p>Walks, mobility, rest, and gentle options matched to your stage and energy.</p>
            </article>
            <article>
              <span className="hfm4-rhythm-number">C</span>
              <h3>Practical partner support</h3>
              <p>Simple ways your partner can help with meals, shopping, and the day ahead.</p>
            </article>
          </div>
        </section>

        <section className="hfm4-seasons">
          <div className="hfm4-seasons-intro">
            <p className="hfm4-kicker">Your plan changes with your stage</p>
            <h2>Trying, pregnancy, and postpartum need different kinds of support.</h2>
          </div>
          <div className="hfm4-season-list">
            <Season number="01" title="Trying" image={content.images.hydration} alt={content.alts.hydration} body="Steady meals, practical routines, and grocery planning without turning the process into another job." />
            <Season number="02" title="Pregnancy" image={content.images.movement} alt={content.alts.movement} body="Meals, body notes, movement, and week guidance that follow the stage and preferences you share." />
            <Season number="03" title="Postpartum" image={content.images.rest} alt={content.alts.rest} body="Recovery-minded meals, rest, movement, daily readings, and belly binding education." />
            <Season number="04" title="Your household" image={content.images.family} alt={content.alts.family} body="Your culture, household size, pantry, budget, and support system shape the plan." />
          </div>
        </section>

        <section className="hfm4-support">
          <div className="hfm4-support-photo">
            <img src={content.images.rest} alt={content.alts.rest} />
          </div>
          <div className="hfm4-support-copy">
            <p className="hfm4-kicker">05 · Human support</p>
            <h2>Need a person? Ask one.</h2>
            <p>Send Maat a private note or book a live Zoom when you want human eyes on a question.</p>
            <Link to="/nouri" className="hfm4-arrow-link">See human support <ArrowRight className="size-4" /></Link>
          </div>
        </section>

        <section className="hfm4-membership">
          <div className="hfm4-membership-top">
            <div>
              <p className="hfm4-kicker">Membership</p>
              <h2>Everything in one membership.</h2>
            </div>
            <p>Meals, groceries, pantry tools, daily guidance, movement, belly binding, partner support, and direct access to Maat.</p>
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
              <small>billed once</small>
            </div>
            <ul className="hfm4-includes">
              <li><Check className="size-4" /> Meals + pantry + grocery planning</li>
              <li><Check className="size-4" /> Daily body readings + stage guidance</li>
              <li><Check className="size-4" /> Belly Binding Studio + movement</li>
              <li><Check className="size-4" /> Partner support + human support</li>
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
