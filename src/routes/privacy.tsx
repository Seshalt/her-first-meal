import { createFileRoute } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";

export const Route = createFileRoute("/privacy")({
  loader: () => ({ title: "Privacy" }),
  component: Privacy,
});

function Privacy() {
  return (
    <div>
      <PublicNav />
      <PageCanvas>
        <article className="mx-auto max-w-2xl px-4 pb-24 pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Last updated September 15, 2026</p>
          <h1 className="mt-3 font-display text-5xl">Privacy</h1>
          <div className="glass-panel mt-8 space-y-8 p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
            <section>
              <h2 className="font-display text-2xl text-ink">What we collect</h2>
              <p className="mt-2">
                Account email and password hash, name, optional pregnancy stage, due date or baby’s birthday,
                household notes, pantry and grocery preferences, appointments, letters you send to Maat, belly-binding
                photographs you choose to upload, and records of membership and purchases.
              </p>
              <p className="mt-2">
                City, state, ZIP code, and preferred stores are optional profile information. You can share them to make
                grocery planning and nearby-store suggestions more useful for your area. We do not need your street
                address for grocery planning.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Location and nearby stores</h2>
              <p className="mt-2">
                The Grocery room includes a “Find stores near me” button. If you choose it, your browser asks for
                location permission. Her First Meal uses the coordinates returned by your browser in that moment to
                open a nearby grocery search in Maps. We do not save those precise GPS coordinates to your profile.
              </p>
              <p className="mt-2">
                If you decline device location, the nearby-store search falls back to the city, state, ZIP code, or
                store preferences you chose to save. We do not sell location data.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">How we use it</h2>
              <p className="mt-2">
                To keep you signed in, run membership, personalize meals and grocery planning, help you find nearby
                stores when you ask, operate the binding studio and movement rooms, carry letters to Maat, book optional
                sessions, take payment, and — if you allow cookies — count visits or measure ads.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">How recommendations are made</h2>
              <p className="mt-2">
                Meals, grocery lists, and season guidance come from Her First Meal’s built-in catalog and are selected
                using the stage, dietary preferences, household information, pantry, budget, and location details you
                choose to share. Questions sent through the support experience go to Maat.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Who else sees it</h2>
              <p className="mt-2">
                The owner and administrators of this house can see what you share inside the studio so they can care
                for you. Owner notes are internal.
              </p>
              <p className="mt-2">
                Processors that help run the house may receive what they need to do their job: hosting and database,
                email delivery, Stripe for cards, mapping when you choose a nearby-store search, and — only if you
                consent — analytics or advertising measurement. Stripe processes payment details. We do not keep your
                full card number.
              </p>
              <p className="mt-2">
                Those companies may store data on servers outside your country. If you use the house, you understand
                that transfer.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Cookies</h2>
              <p className="mt-2">
                We use cookies to keep you signed in and to remember that you have already seen the cookie notice, so
                the bar does not return every time you open a page. When you tap OK, that choice is stored on your
                device. Sign-in cookies are required for the member rooms and the owner atelier. We do not use
                advertising cookies. For the rest of how we handle information, keep reading this page and Terms.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">How long we keep it</h2>
              <p className="mt-2">
                While your account is open, and for a limited time after if the law requires us to keep billing or
                security records. You may delete your account from Settings. That removes personal records we control,
                except what the law says we must keep.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Children</h2>
              <p className="mt-2">This house is not directed at anyone under 18. We do not knowingly collect a child’s account.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Your requests</h2>
              <p className="mt-2">
                You may ask to see, correct, or delete personal information we hold, subject to the law. Use the
                Contact page. If your region gives extra rights (for example access, deletion, or a complaint to a
                regulator), we will honor what the law requires.
              </p>
            </section>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
