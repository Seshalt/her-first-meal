import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  const localizeContent = useContentText();
  return (
    <div>
      <PublicNav />
      <PageCanvas>
        <article className="mx-auto max-w-2xl px-4 pb-24 pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">{localizeContent("Last updated September 15, 2026")}</p>
          <h1 className="mt-3 font-display text-5xl">{localizeContent("Terms of use")}</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {localizeContent("By creating an account, purchasing a membership, or using Her First Meal, you agree to these terms. If you do not agree, do not use the service.")}</p>

          <div className="glass-panel mt-8 space-y-8 p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("1. Who may use Her First Meal")}</h2>
              <p className="mt-2">
                {localizeContent("You must be at least 18 years old. You are responsible for providing accurate account and billing information and for keeping your sign-in credentials secure.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("2. Wellness and educational service")}</h2>
              <p className="mt-2">
                {localizeContent("Her First Meal provides wellness education, recipes, grocery and pantry planning, movement ideas, belly-binding education, daily body readings, support, and optional paid meetings. It is not a medical practice, emergency service, pharmacy, or substitute for care from a licensed clinician.")}</p>
              <p className="mt-2">
                {localizeContent("If you have urgent symptoms or an emergency, contact your clinician or local emergency services. Do not use this website for urgent medical care.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("3. Personalization")}</h2>
              <p className="mt-2">
                {localizeContent("The service uses the information you choose to save — such as pregnancy or postpartum stage, dietary preferences, foods you avoid or enjoy, household size, pantry information, city or ZIP code, preferred stores, and check-ins — to select content from Her First Meal’s built-in library and organize your member experience.")}</p>
              <p className="mt-2">
                {localizeContent("Personalized suggestions are informational and may not fit every health condition, allergy, pregnancy complication, recovery plan, or dietary need. You are responsible for checking ingredients and deciding what is appropriate for you with qualified professionals when needed.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("4. Food, movement, and belly binding")}</h2>
              <p className="mt-2">
                {localizeContent("Recipes and grocery lists are general wellness content and cannot guarantee that a food is safe for every allergy, medical condition, or pregnancy. Movement and belly binding can involve physical risk. Stop if something hurts or feels wrong, and ask your clinician before beginning if you have a complicated pregnancy, recent surgery, an unhealed incision, or another condition that may affect safety.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("5. Membership, Stripe, and access")}</h2>
              <p className="mt-2">
                {localizeContent("Membership is paid through Stripe. The member app unlocks only after Stripe confirms a successful payment and an active membership is linked to your account. Creating or signing into an account by itself does not create paid access.")}</p>
              <p className="mt-2">
                {localizeContent("Monthly and yearly memberships renew on their selected cadence until canceled. Prices and billing frequency are shown before purchase. Stripe processes payment information; Her First Meal does not store your full card number.")}</p>
              <p className="mt-2">
                {localizeContent("If a payment fails, a subscription ends, or a membership expires, access to paid member rooms may be restricted. Optional private meetings are billed separately unless the booking page expressly says otherwise.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("6. Your account and saved information")}</h2>
              <p className="mt-2">
                {localizeContent("Member progress and preferences are stored with your account so they can remain available across supported devices. This can include onboarding progress, profile details, diet and grocery preferences, hydration and mood check-ins, appointments, pantry information, support messages, and other records created while using the member service.")}</p>
              <p className="mt-2">
                {localizeContent("Content you upload or submit remains yours. You give Her First Meal permission to store and process it only as reasonably needed to operate the features you choose to use, comply with law, prevent abuse, and maintain the service.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("7. Cookies and privacy")}</h2>
              <p className="mt-2">
                {localizeContent("Necessary cookies and similar storage support authentication, security, checkout continuity, and consent preferences. Optional analytics is used only when allowed. Important member records are stored with your account rather than depending only on browser cookies.")}</p>
              <p className="mt-2">
                {localizeContent("Review the ")}<Link to="/privacy" className="text-primary underline underline-offset-2">{localizeContent("Privacy Policy")}</Link> {localizeContent(" and ")}<Link to="/cookies" className="text-primary underline underline-offset-2">{localizeContent("Cookie Settings")}</Link> {localizeContent(" for more detail.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("8. Acceptable use")}</h2>
              <p className="mt-2">
                {localizeContent("Do not misuse the service, attempt to bypass payment or security controls, interfere with the service, upload unlawful content, impersonate another person, or submit private information about someone else without permission. We may suspend or close accounts that violate these terms or create security or safety risks.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("9. Intellectual property")}</h2>
              <p className="mt-2">
                {localizeContent("Her First Meal’s name, branding, original writing, recipes, layouts, educational materials, and software are owned by Her First Meal or its licensors. A membership gives you a personal right to use the service during your active membership; it does not transfer ownership of the underlying materials.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("10. Availability and warranties")}</h2>
              <p className="mt-2">
                {localizeContent("The service is provided on an “as is” and “as available” basis to the extent permitted by law. We cannot promise uninterrupted access, that every suggestion will suit every person, or that third-party services such as hosting, email, maps, or payment processing will always be available.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("11. Limitation of liability")}</h2>
              <p className="mt-2">
                {localizeContent("To the fullest extent permitted by law, Her First Meal is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service. Nothing here limits rights or remedies that applicable consumer law does not allow us to limit.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("12. Ending or changing the service")}</h2>
              <p className="mt-2">
                {localizeContent("You may stop using the service or cancel future renewal. We may update features, pricing, or these terms, and we may suspend access for failed payment, abuse, or legal or security reasons. Material changes will be reflected by updating the date on this page and, when appropriate, providing additional notice.")}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-ink">{localizeContent("13. Questions")}</h2>
              <p className="mt-2">
                {localizeContent("Use the Contact page for questions about these terms, billing, privacy, or accessibility. The ")}<Link to="/accessibility" className="text-primary underline underline-offset-2">{localizeContent("Accessibility Statement")}</Link> {localizeContent(" also explains how to report a barrier.")}</p>
            </section>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
