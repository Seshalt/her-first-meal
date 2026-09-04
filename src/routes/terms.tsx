import { createFileRoute } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <div>
      <PublicNav />
      <PageCanvas>
        <article className="mx-auto max-w-2xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Last updated September 4, 2026</p>
          <h1 className="mt-3 font-display text-5xl">Terms of use</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            By creating an account, joining a membership, or using this website, you agree to these terms. If you do
            not agree, do not use the house. This page is a contract between you and Her First Meal. It is not a
            substitute for advice from your own lawyer.
          </p>
          <div className="glass-panel mt-8 space-y-8 p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
            <section>
              <h2 className="font-display text-2xl text-ink">1. Who may enter</h2>
              <p className="mt-2">
                You must be at least 18 years old. The house is written for pregnant and postpartum adults and the
                people who care for them. It is not for children. You are responsible for the accuracy of the email
                and information you give us.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">2. What this house is — and is not</h2>
              <p className="mt-2">
                Her First Meal is a membership for education, recipes, grocery planning, movement ideas, belly binding
                education, companion support, and optional paid sessions with Maat. It is wellness and education.
              </p>
              <p className="mt-2">
                It is <strong className="text-ink">not</strong> a medical practice, clinic, pharmacy, hospital, or
                emergency service. Nothing on this site, in Nouri, in the binding studio, in a meal plan, or in a
                session with Maat is a diagnosis, prescription, treatment plan, or substitute for care from a licensed
                clinician. We do not treat, cure, or prevent disease.
              </p>
              <p className="mt-2">
                If you have pain, bleeding, fever, thoughts of harming yourself or your baby, or any emergency, call
                your local emergency number or your clinician. Do not use this website for urgent care.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">3. Artificial intelligence</h2>
              <p className="mt-2">
                Parts of the house use artificial intelligence. That includes Nouri, suggested questions, grocery and
                meal suggestions, and any notes offered on belly-binding photographs. AI can be wrong, incomplete, or
                out of date. It does not know your full medical history. It does not examine you.
              </p>
              <p className="mt-2">
                You agree that AI output is informational only. You will not rely on it as medical, nutritional,
                mental-health, or legal advice. You will check anything important with a qualified professional who
                knows you. We do not guarantee that AI is accurate, safe for your body, or appropriate for your
                pregnancy, birth, or recovery.
              </p>
              <p className="mt-2">
                Messages and photos you send to AI features may be processed by our systems and by third-party model
                providers in order to generate a reply. Do not upload anyone else’s private information. See Privacy
                for how that data is handled.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">4. Food, movement, and binding</h2>
              <p className="mt-2">
                Recipes and grocery lists are general. They cannot promise to be free of every allergen or safe for
                every condition (including gestational diabetes, preeclampsia, cesarean recovery, or food
                restriction). You are responsible for reading ingredients and for what you eat.
              </p>
              <p className="mt-2">
                Movement and belly binding can involve physical risk. Stop if something hurts. Binding is never a
                treatment for organ prolapse, hernia, infection, or unhealed incision. After surgery or a complicated
                birth, ask your clinician before you wrap or train. You use these rooms at your own risk.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">5. Membership, Stripe, and money</h2>
              <p className="mt-2">
                Paid membership is billed through Stripe. We do not store your full card number. Stripe’s terms also
                apply to the payment itself. Prices shown are in US dollars unless we say otherwise. Membership renews
                for the same cadence (month or year) until you cancel.
              </p>
              <p className="mt-2">
                Cancel from Settings before the next renewal if you do not want to be charged again. Fees already
                collected for the current period are not automatically refunded, except where the law of your place
                requires it or we agree in writing. Chargebacks made in bad faith may lead to account closure.
              </p>
              <p className="mt-2">
                A meeting with Maat is optional and billed separately when you book it. It is not included in
                membership unless we expressly say so at booking.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">6. Your account and your content</h2>
              <p className="mt-2">
                Keep your password to yourself. You are responsible for activity under your account. Photographs,
                notes, and messages you upload stay yours. You give Her First Meal a limited license to store them and
                to use them only to run the rooms you asked for (for example, to show a wrap back to you, or to let
                Nouri read a question you typed). We do not sell your photos. We do not show them to other members.
              </p>
              <p className="mt-2">
                Do not upload illegal content, anyone else’s image without permission, or material that harasses. We
                may remove content or close an account that breaks these terms or the law.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">7. Our materials</h2>
              <p className="mt-2">
                The name Her First Meal, the mark, the writing, recipes, layouts, and software belong to the operator
                of this house or its licensors. Membership is a license to use the rooms during the paid period. It is
                not a sale of the underlying work. Do not copy the house to sell it as your own.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">8. Cookies and other companies we use</h2>
              <p className="mt-2">
                Hosting, databases, email, and Stripe sit with third parties. Their outages or errors are outside our
                full control. We are not liable for their independent acts beyond what the law will not let us
                disclaim.
              </p>
              <p className="mt-2">
                Cookies: a small sign-in cookie keeps a member in the rooms. A separate notice cookie (and a matching
                note in the browser) remembers that you already read the cookie bar, so it does not open on every
                visit. We may also store a hashed copy of your IP address for that same purpose — so the bar stays
                away if you come back from the same network. We do not use that hash to advertise to you. Details of
                what we collect are on the Privacy page. There is no cookie-toggles panel in the footer; this page is
                the record.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">9. No warranty</h2>
              <p className="mt-2">
                The house is provided “as is” and “as available.” To the fullest extent the law allows, we disclaim
                all warranties, express or implied, including merchantability, fitness for a particular purpose, and
                non-infringement. We do not warrant that the site or AI will be uninterrupted, secure, or free of
                error.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">10. Limit of liability</h2>
              <p className="mt-2">
                To the fullest extent the law allows, Her First Meal and its owner, workers, and contractors are not
                liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits,
                data, or goodwill, arising from your use of the house, meals, movement, binding, Nouri, or a session
                with Maat.
              </p>
              <p className="mt-2">
                Our total liability for any claim is limited to the membership fees you paid us in the three months
                before the claim, or fifty US dollars, whichever is greater — unless a law in your place says we
                cannot limit it that way.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">11. Your promise to us</h2>
              <p className="mt-2">
                You will not use the house in a way that breaks the law. If your use of the house causes a claim
                against us (for example, you share someone else’s private photo, or you treat AI output as medical
                care and then blame the house), you will cover the reasonable cost of defending that claim, to the
                extent the law allows.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">12. Ending the relationship</h2>
              <p className="mt-2">
                You may stop using the house and cancel renewal at any time. We may suspend or close an account that
                violates these terms, fails payment, or puts others at risk. Sections on money already owed, AI,
                content license for stored files, liability, and indemnity survive closing.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">13. Changes and law</h2>
              <p className="mt-2">
                We may update these terms. The date at the top will change. Continued use after an update means you
                accept the new terms. If a court strikes one sentence, the rest stays. These terms are governed by the
                laws that apply to the operator of Her First Meal, without regard to conflict-of-law rules, except
                where consumer law in your country or state cannot be waived.
              </p>
              <p className="mt-2">
                Questions: use the Contact page. Privacy is separate and also applies.
              </p>
            </section>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
