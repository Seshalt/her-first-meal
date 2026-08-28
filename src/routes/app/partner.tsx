import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { PARTNER_CARDS } from "@/lib/content/catalog";
import { getMyHome } from "@/lib/server/profile";

export const Route = createFileRoute("/app/partner")({ component: Partner });

function Partner() {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    void getMyHome().then((h) => setCode(h.profile.partnerInviteCode));
  }, []);
  return (
    <div>
      <RoomHero
        kicker="For partners"
        title="A useful, private lane"
        body="Partners see how to help — not private medical notes, pantry inventories, or Nouri threads."
        src="/images/grocery-partner.jpg"
        alt="A partner choosing produce from a handwritten list"
        tone="sea"
      />
      <RoomBody>
        {code ? (
          <p className="font-display text-3xl">
            Invite code <span className="tracking-widest text-sea">{code}</span>
          </p>
        ) : null}
        <ul className="mt-10">
          {PARTNER_CARDS.map((c) => (
            <li key={c.title} className="border-b border-border py-12">
              <p className="text-xs uppercase tracking-[0.28em] text-earth">For partners</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">{c.title}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{c.body}</p>
            </li>
          ))}
        </ul>
      </RoomBody>
    </div>
  );
}
