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
          <h1 className="font-display text-5xl">Terms</h1>
          <div className="glass-panel mt-8 space-y-4 p-6 text-muted-foreground md:p-8">
            <p>
              Her First Meal is a membership house for pregnancy and postpartum nourishment, belly binding education,
              movement, grocery planning, and companion support. It is not medical care and does not diagnose.
            </p>
            <p>
              Membership gives access to the rooms of the house for the billed period. A private session with Maat is
              optional and billed separately when booked.
            </p>
            <p>
              You are responsible for the accuracy of the information you share. You may cancel from Settings. Fees
              already collected for the current period are not automatically refunded.
            </p>
            <p>If these terms and your local law disagree, the law wins.</p>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
