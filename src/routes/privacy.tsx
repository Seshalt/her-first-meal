import { createFileRoute } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { HouseMark } from "@/components/brand/logo";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <div>
      <PublicNav />
      <PageCanvas>
        <article className="mx-auto max-w-2xl px-4 py-16">
          <HouseMark className="mb-6 h-16 w-auto" />
          <h1 className="font-display text-5xl">Privacy</h1>
          <div className="glass-panel mt-8 space-y-4 p-6 text-muted-foreground md:p-8">
            <p>
              Your pregnancy information, photos, pantry, appointments, and conversations with Nouri are private
              to your account. They are never shown to other members.
            </p>
            <p>
              Location is optional. If you decline, a ZIP code, city, or manual store list is enough. We do not
              sell location data.
            </p>
            <p>
              Administrators can see what you choose to share inside the studio (onboarding, appointments,
              binding uploads) in order to care for you. Owner notes are internal.
            </p>
            <p>You may delete your account from Settings. That removes your personal records from this house.</p>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
