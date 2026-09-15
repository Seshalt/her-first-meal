import { createFileRoute, Link } from "@tanstack/react-router";
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
                Account information such as email, name, authentication records, and password hash; optional pregnancy or postpartum stage information; due date or baby’s birthday; dietary preferences and allergies; foods you avoid, dislike, or enjoy; household and budget information; pantry and grocery preferences; city, state, ZIP code, and preferred stores; hydration and mood check-ins; appointments; support messages; belly-binding photographs you choose to upload; and membership and purchase records.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Account continuity</h2>
              <p className="mt-2">
                Her First Meal saves member progress and preferences to your account so they are not lost just because you close a browser, clear optional cookies, or sign in from another supported device. This includes onboarding progress, profile information, diet and grocery settings, daily check-ins, appointments, and other records created through member features.
              </p>
              <p className="mt-2">
                Browser cookies are not the only copy of your important member information. Necessary cookies primarily support secure authentication and continuity of the session; account records live in the service database.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Location and nearby stores</h2>
              <p className="mt-2">
                City, state, ZIP code, and preferred stores are optional profile information. You can provide them to make grocery planning and nearby-store suggestions more useful for your area. We do not need your street address for grocery planning.
              </p>
              <p className="mt-2">
                The Grocery room includes a “Find stores near me” action. If you choose it, your browser asks for location permission. The coordinates returned by your browser are used at that moment to open a nearby grocery search. Her First Meal does not save those precise GPS coordinates to your profile.
              </p>
              <p className="mt-2">
                If you decline device location, nearby-store search can fall back to the city, state, ZIP code, or store preferences you chose to save. We do not sell location data.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">How we use information</h2>
              <p className="mt-2">
                We use information to create and secure accounts, confirm paid membership, personalize the built-in meal and grocery library, remember your settings and progress, operate the pantry, movement and belly-binding rooms, support nearby-store searches you request, carry support messages, schedule optional sessions, process payments, prevent abuse, maintain the service, and comply with law.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">How personalization works</h2>
              <p className="mt-2">
                Meals, grocery lists, daily readings, and stage guidance come from Her First Meal’s built-in content library and are selected using the profile, stage, dietary preferences, household information, pantry, budget, grocery preferences, and location details you choose to save.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Payments</h2>
              <p className="mt-2">
                Stripe processes membership and optional meeting payments. Her First Meal receives payment status, customer identifiers, purchase amounts, subscription information, and related billing records needed to operate membership. Her First Meal does not store your full card number.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Service providers</h2>
              <p className="mt-2">
                Companies that help operate the service may receive the information they need for their role, such as hosting and database providers, email delivery providers, Stripe for payments, and mapping services when you choose a nearby-store search. Those providers process information under their own terms and privacy obligations.
              </p>
              <p className="mt-2">
                We do not sell your personal information or your uploaded photographs to advertisers.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Cookies and browser storage</h2>
              <p className="mt-2">
                Necessary cookies and similar storage keep authentication and account security working and remember that you have made a privacy choice. Preference storage can remember convenience settings on a device. Optional analytics remains off unless you allow it. Her First Meal does not currently use advertising cookies.
              </p>
              <p className="mt-2">
                You can review or change your choices at any time on the <Link to="/cookies" className="text-primary underline underline-offset-2">Cookies & Preferences</Link> page. Changing optional cookie settings does not delete member records stored with your account.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">How long we keep information</h2>
              <p className="mt-2">
                We keep account information while your account is open and for a limited period afterward when needed for security, billing, dispute handling, fraud prevention, backups, or legal obligations. Some billing and transaction records may need to be retained longer than ordinary profile information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Security</h2>
              <p className="mt-2">
                We use access controls and other technical and organizational safeguards intended to protect information. No online service can guarantee perfect security, so use a unique password and contact support if you believe your account has been compromised.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Children</h2>
              <p className="mt-2">Her First Meal is not directed to anyone under 18 and does not knowingly create child member accounts.</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Your choices and requests</h2>
              <p className="mt-2">
                You may request access to, correction of, or deletion of personal information we control, subject to applicable law and records we must retain. Use the Contact page for privacy requests. If your region provides additional rights, we will respond as required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">Accessibility and contact</h2>
              <p className="mt-2">
                For accessibility barriers, see the <Link to="/accessibility" className="text-primary underline underline-offset-2">Accessibility Statement</Link>. For privacy or account questions, use the Contact page.
              </p>
            </section>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
