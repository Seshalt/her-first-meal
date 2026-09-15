import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Check,
  HeartHandshake,
  MapPin,
  Salad,
  Sparkles,
  StretchHorizontal,
  Store,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
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

type DemoKey = "meals" | "grocery" | "daily";

function Home() {
  const page = Route.useLoaderData();
  const content = page?.content ?? mergeLanding(null);
  const monthly = page?.monthlyPriceCents ?? 4900;
  const yearly = page?.yearlyPriceCents ?? 49000;
  const [demo, setDemo] = useState<DemoKey>("meals");

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".hfm3-reveal"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hfm3">
      <PublicNav />
      <div className="hfm3-shell">
        <section className="hfm3-hero">
          <div className="hfm3-hero-inner">
            <div className="hfm3-hero-copy hfm3-reveal is-in">
              <p className="hfm3-kicker">Pregnancy · postpartum · daily care</p>
              <h1>
                {content.headline} <em>{content.headlineAccent}</em>
              </h1>
              <p className="hfm3-hero-lede">
                Meals for the way you actually eat. Grocery planning around your city and preferred stores. Daily body notes, belly binding education, movement, and human support — organized around your stage.
              </p>
              <div className="hfm3-actions">
                <Link to="/pricing" className="hfm3-primary">
                  {content.cta} <ArrowRight className="size-4" />
                </Link>
                <Link to="/about" className="hfm3-secondary">
                  See how it works
                </Link>
              </div>
              <div className="hfm3-proofline" aria-label="Membership highlights">
                <span><Check className="size-3.5" /> Stage-aware</span>
                <span><Check className="size-3.5" /> Dietary preferences</span>
                <span><Check className="size-3.5" /> Local grocery tools</span>
                <span><Check className="size-3.5" /> Human support</span>
              </div>
            </div>

            <div className="hfm3-hero-media hfm3-reveal is-in" aria-label="Her First Meal experience preview">
              <div className="hfm3-main-photo">
                <img src={content.images.hero} alt={content.alts.hero} />
              </div>
              <div className="hfm3-photo-note">
                <div className="hfm3-note-row">
                  <img src={content.images.meals} alt={content.alts.meals} />
                  <div>
                    <strong>Meals that fit the week.</strong>
                    <p>Diet, stage, household, pantry, appetite, and the foods you actually like.</p>
                  </div>
                </div>
              </div>
              <div className="hfm3-daily-card">
                <p>Today’s body note · 2 min</p>
                <h3>Hydration works better as a rhythm.</h3>
                <p>Small, regular sips can be easier to remember than catching up at night.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="hfm3-strip" aria-label="Included with membership">
          <div className="hfm3-strip-inner">
            {["Personalized meals", "Local grocery planning", "Daily body readings", "Belly Binding Studio", "Movement", "Partner lane", "Human support"].map((item) => (
              <span key={item} className="hfm3-strip-item">
                <i className="hfm3-strip-dot" /> {item}
              </span>
            ))}
          </div>
        </div>

        <section className="hfm3-section hfm3-demo">
          <div className="hfm3-section-inner">
            <div className="hfm3-section-head hfm3-reveal">
              <div>
                <p className="hfm3-kicker">The product, not a promise</p>
                <h2>Open the app. Know what to do next.</h2>
              </div>
              <p>
                Her First Meal turns the preferences you choose into a useful daily home — not a giant feed, not a generic checklist, and not another place to keep up with.
              </p>
            </div>

            <div className="hfm3-demo-grid hfm3-reveal">
              <div className="hfm3-tabs" role="tablist" aria-label="Product preview">
                <DemoTab
                  id="meals"
                  active={demo === "meals"}
                  title="Meals"
                  note="Stage + diet + real kitchen"
                  onClick={() => setDemo("meals")}
                />
                <DemoTab
                  id="grocery"
                  active={demo === "grocery"}
                  title="Local grocery"
                  note="City, ZIP, stores, one-time nearby search"
                  onClick={() => setDemo("grocery")}
                />
                <DemoTab
                  id="daily"
                  active={demo === "daily"}
                  title="Daily body notes"
                  note="Short readings + practical tips"
                  onClick={() => setDemo("daily")}
                />
              </div>

              <div className="hfm3-product-frame" role="tabpanel">
                <div className="hfm3-frame-bar">
                  <span>Her First Meal · member home</span>
                  <span className="hfm3-frame-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>
                <DemoPreview key={demo} demo={demo} />
              </div>
            </div>
          </div>
        </section>

        <section className="hfm3-section hfm3-features">
          <div className="hfm3-section-inner">
            <div className="hfm3-section-head hfm3-reveal">
              <div>
                <p className="hfm3-kicker">One membership, connected rooms</p>
                <h2>Care that changes when her season changes.</h2>
              </div>
              <p>
                The meals, grocery list, body readings, movement, and stage guidance share the same preferences. Change the season or the way you eat, and the house follows.
              </p>
            </div>

            <div className="hfm3-bento">
              <FeaturePhoto
                className="is-wide hfm3-reveal"
                image={content.images.binding}
                alt={content.alts.binding}
                kicker="Flagship practice"
                title="Belly binding, taught with care."
                body="Studio steps, wrap education, a private journal, and optional live review — educational support, never a diagnosis."
                to="/belly-binding"
              />
              <FeatureSolid
                className="is-tall hfm3-reveal"
                icon={<MapPin className="size-5" />}
                kicker="Local grocery"
                title="A grocery list that knows where it has to work."
                body="Save a city or ZIP and the stores you use. When you choose Find stores near me, your browser can use a one-time location for a nearby map search; precise coordinates are not saved to your profile."
                to="/pricing"
                label="See membership"
              />
              <FeatureSolid
                className="is-third hfm3-reveal"
                icon={<BookOpen className="size-5" />}
                kicker="Daily readings"
                title="Learn your body without doom-scrolling."
                body="Short body notes and practical tips for pregnancy, postpartum, food, hydration, movement, and support."
                to="/pricing"
                label="Get daily guidance"
              />
              <FeatureSolid
                className="is-third hfm3-reveal"
                icon={<StretchHorizontal className="size-5" />}
                kicker="Movement"
                title="Movement for the day you have."
                body="Stage-aware options without streaks, punishment, or turning recovery into a performance."
                to="/pricing"
                label="Explore the house"
              />
              <FeatureSolid
                className="is-third hfm3-reveal"
                icon={<UsersRound className="size-5" />}
                kicker="Partner lane"
                title="Give support somewhere useful to stand."
                body="Meals, grocery help, and practical ways to contribute without making her private notes shared reading."
                to="/pricing"
                label="See what’s included"
              />
            </div>
          </div>
        </section>

        <section className="hfm3-section hfm3-seasons">
          <div className="hfm3-section-inner">
            <div className="hfm3-section-head hfm3-reveal">
              <div>
                <p className="hfm3-kicker">Built to move with the body</p>
                <h2>Different seasons should not get the same plan.</h2>
              </div>
              <p>What is useful while trying, in pregnancy, and in the fourth trimester can be different. The app changes its emphasis with the stage you save.</p>
            </div>
            <div className="hfm3-seasons-grid">
              <Season number="01" title="Trying" body="Steady nourishment, practical routines, grocery planning, and room to keep the process human." />
              <Season number="02" title="Pregnancy" body="Meals, body notes, movement, and week context that follow the stage and preferences you share." />
              <Season number="03" title="Postpartum" body="Recovery-minded meals, daily body readings, rest, movement, and the Belly Binding Studio." />
              <Season number="04" title="The household" body="A pantry and grocery system that respects budget, household size, culture, stores, and the people helping." />
            </div>
          </div>
        </section>

        <section className="hfm3-quote">
          <blockquote className="hfm3-reveal">“The world celebrates the baby. We remember the mother.”</blockquote>
          <p className="hfm3-reveal">A pregnancy and postpartum wellness home should make care easier to use, not give her one more dashboard to manage.</p>
        </section>

        <section className="hfm3-section hfm3-membership">
          <div className="hfm3-membership-inner">
            <div className="hfm3-reveal">
              <p className="hfm3-kicker">Membership</p>
              <h2>The whole house. One membership.</h2>
              <p>
                Meals, local grocery planning, pantry tools, daily body readings, belly binding education, movement, stage guidance, partner support, and a direct lane to a person when you need one.
              </p>
              <div className="hfm3-actions">
                <Link to="/pricing" className="hfm3-primary" style={{ background: "#d3a34d", color: "#10281f" }}>
                  Start your journey <ArrowRight className="size-4" />
                </Link>
                <Link to="/login" search={{}} className="hfm3-secondary" style={{ borderColor: "rgba(255,248,237,.2)", color: "#fff8ed", background: "transparent" }}>
                  Member sign in
                </Link>
              </div>
            </div>

            <div className="hfm3-price-card hfm3-reveal">
              <p className="hfm3-price-label">Choose monthly or save yearly</p>
              <p className="hfm3-price">
                {formatCurrency(monthly)} <small>/ month</small>
              </p>
              <p className="!mt-2 text-sm">or {formatCurrency(yearly)} billed yearly</p>
              <ul className="hfm3-price-list">
                <PriceLine>Personalized meals + pantry planning</PriceLine>
                <PriceLine>Local grocery + nearby-store tools</PriceLine>
                <PriceLine>Daily body readings + stage journey</PriceLine>
                <PriceLine>Belly Binding Studio + movement</PriceLine>
                <PriceLine>Partner lane + human support</PriceLine>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}

function DemoTab({ id, active, title, note, onClick }: { id: DemoKey; active: boolean; title: string; note: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`preview-${id}`}
      className={`hfm3-tab ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      <span className="hfm3-tab-label">{title}</span>
      <span className="hfm3-tab-note">{note}</span>
    </button>
  );
}

function DemoPreview({ demo }: { demo: DemoKey }) {
  if (demo === "grocery") {
    return (
      <div id="preview-grocery" className="hfm3-preview">
        <div>
          <p className="hfm3-kicker">The market</p>
          <h3 className="hfm3-preview-title mt-3">This week’s list, built for real stores.</h3>
          <p className="hfm3-preview-copy mt-3">Meals create the list. Pantry items come off. A saved city, ZIP, and preferred stores make the shopping side more practical.</p>
        </div>
        <div className="hfm3-store-chips" aria-label="Example store preferences">
          <span className="hfm3-store-chip">Publix</span>
          <span className="hfm3-store-chip">Aldi</span>
          <span className="hfm3-store-chip">Trader Joe’s</span>
          <span className="hfm3-store-chip"><MapPin className="mr-1 inline size-3" /> Find stores near me</span>
        </div>
        <div className="hfm3-preview-cards">
          <PreviewCard tag="Produce" title="Spinach · lemons" body="Grouped from this week’s meals." />
          <PreviewCard tag="Pantry" title="Lentils · oats" body="Skip what you already have at home." />
          <PreviewCard tag="Privacy" title="Location only when asked" body="Nearby search uses one-time coordinates; they are not saved to your profile." />
        </div>
      </div>
    );
  }

  if (demo === "daily") {
    return (
      <div id="preview-daily" className="hfm3-preview">
        <div>
          <p className="hfm3-kicker">Today’s body note · 2 min</p>
          <h3 className="hfm3-preview-title mt-3">Appetite is information, not a grade.</h3>
          <p className="hfm3-preview-copy mt-3">Pregnancy and recovery can change hunger, fullness, taste, and what feels tolerable. The plan leaves room for the body to have a different day.</p>
        </div>
        <div className="hfm3-preview-cards">
          <PreviewCard tag="Try today" title="Keep one reliable food close" body="Build around what feels tolerable instead of forcing the perfect meal." />
          <PreviewCard tag="Next reading" title="Hydration as a rhythm" body="A short practical note, not an endless content feed." />
          <PreviewCard tag="Your stage" title="Different notes by season" body="Trying, pregnancy, and postpartum do not receive the same emphasis." />
        </div>
      </div>
    );
  }

  return (
    <div id="preview-meals" className="hfm3-preview">
      <div>
        <p className="hfm3-kicker">Nourishment</p>
        <h3 className="hfm3-preview-title mt-3">Meals that bow to the real kitchen.</h3>
        <p className="hfm3-preview-copy mt-3">The recipe library filters around stage, dietary choices, allergies, dislikes, household size, pantry, and the foods you actually want to eat.</p>
      </div>
      <div className="hfm3-preview-cards">
        <PreviewCard tag="Breakfast" title="Warm oat bowl" body="Fruit, seeds, and easy swaps for the way you eat." />
        <PreviewCard tag="Lunch" title="Ginger lentil soup" body="A built-in recipe with grocery ingredients ready for the list." />
        <PreviewCard tag="Dinner" title="Greens + grain plate" body="Change a meal without throwing away the rest of the week." />
      </div>
    </div>
  );
}

function PreviewCard({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <article className="hfm3-preview-card">
      <p className="tag">{tag}</p>
      <strong>{title}</strong>
      <p>{body}</p>
    </article>
  );
}

function FeaturePhoto({ className, image, alt, kicker, title, body, to }: { className?: string; image: string; alt: string; kicker: string; title: string; body: string; to: "/belly-binding" }) {
  return (
    <Link to={to} className={`hfm3-feature ${className ?? ""}`}>
      <div className="hfm3-feature-photo"><img src={image} alt={alt} /></div>
      <div className="hfm3-feature-shade" />
      <div className="hfm3-feature-copy">
        <p className="hfm3-kicker">{kicker}</p>
        <h3>{title}</h3>
        <p>{body}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#f0c56d]">Enter the studio <ArrowRight className="size-4" /></span>
      </div>
    </Link>
  );
}

function FeatureSolid({ className, icon, kicker, title, body, to, label }: { className?: string; icon: React.ReactNode; kicker: string; title: string; body: string; to: "/pricing"; label: string }) {
  return (
    <Link to={to} className={`hfm3-feature hfm3-feature-solid ${className ?? ""}`}>
      <div>
        <div className="hfm3-feature-icon">{icon}</div>
        <p className="hfm3-kicker mt-5">{kicker}</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <span className="hfm3-feature-arrow">{label} <ArrowRight className="size-4" /></span>
    </Link>
  );
}

function Season({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <article className="hfm3-season hfm3-reveal">
      <p className="hfm3-season-num">{number}</p>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function PriceLine({ children }: { children: React.ReactNode }) {
  return <li><Check className="mt-0.5 size-4" /><span>{children}</span></li>;
}
