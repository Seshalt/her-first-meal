import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";

export const Route = createFileRoute("/accessibility")({ component: Accessibility });

function Accessibility() {
  return (
    <div>
      <PublicNav />
      <PageCanvas>
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Last updated September 15, 2026</p>
          <h1 className="mt-3 font-display text-5xl">Accessibility</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Her First Meal is working toward an experience that people can use with keyboards, screen readers, zoom, reduced motion, and different contrast needs. Our target is WCAG 2.2 Level AA. This statement describes the standard we are building toward; it is not a claim that every page has already passed a formal third-party accessibility audit.
          </p>

          <div className="glass-panel mt-8 space-y-8 p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
            <section>
              <h2 className="font-display text-2xl text-ink">What we design for</h2>
              <p className="mt-2">
                Clear heading structure, meaningful link and button labels, visible keyboard focus, sufficient text contrast, form labels and instructions, descriptive image alt text, readable zoom behavior, touch targets sized for mobile use, and navigation that does not require a mouse.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Motion and visual effects</h2>
              <p className="mt-2">
                Her First Meal uses motion selectively. When your device requests reduced motion, decorative animation and scrolling effects should be minimized or removed. Important information and controls must not depend on animation alone.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Forms and onboarding</h2>
              <p className="mt-2">
                Signup, checkout, onboarding, location preferences, grocery planning, and account settings are intended to have persistent labels, readable error messages, obvious selected states, and controls that can be reached and activated from a keyboard.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Images and media</h2>
              <p className="mt-2">
                Informative images should include useful alternative text. Decorative imagery should not carry information that is unavailable elsewhere on the page. Video or future audio content should be paired with appropriate text alternatives or captions when needed.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Need another format or found a barrier?</h2>
              <p className="mt-2">
                Tell us what page or feature gave you trouble, what device or assistive technology you were using if you are comfortable sharing it, and what you were trying to do. We will use that report to improve the product.
              </p>
              <Link to="/contact" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-medium text-primary-foreground">
                Contact support
              </Link>
            </section>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
