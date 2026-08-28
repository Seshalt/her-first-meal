import { createFileRoute } from "@tanstack/react-router";
import { RoomHero } from "@/components/layout/room-hero";
import { NouriDialog } from "@/components/nouri/nouri-panel";

export const Route = createFileRoute("/app/nouri")({ component: NouriPage });

function NouriPage() {
  return (
    <div>
      <RoomHero
        kicker="Companion"
        title="Talk to Nouri"
        body="Inspired by nourish. She remembers this conversation and the preferences you authorized. She does not diagnose."
        src="/images/nouri-drop.jpg"
        alt="Ripple in a ceramic tea bowl"
        tone="plum"
      />
      <div className="mx-auto max-w-2xl px-5 py-14 md:px-10 md:py-20">
        <NouriDialog />
      </div>
    </div>
  );
}
