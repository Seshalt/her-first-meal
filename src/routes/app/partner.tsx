import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { PARTNER_CARDS } from "@/lib/content/catalog";
import { altFor } from "@/lib/landing";
import { getMyHome } from "@/lib/server/profile";

export const Route = createFileRoute("/app/partner")({ component: Partner });

function Partner() {
  const localizeContent = useContentText();
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    void getMyHome().then((h) => setCode(h.profile.partnerInviteCode));
  }, []);
  return (
    <div>
      <RoomHero
        kicker={localizeContent("For partners")}
        title={localizeContent("A useful, private lane")}
        body={localizeContent("Partners see how to help — not private medical notes, pantry inventories, or private support messages.")}
        src="/images/grocery-partner.jpg"
        alt={localizeContent(altFor("/images/grocery-partner.jpg"))}
        tone="sea"
      />
      <RoomBody>
        {localizeContent(code ? (
          <p className="font-display text-3xl">
            {localizeContent("Invite code ")}<span className="tracking-widest text-sea">{localizeContent(code)}</span>
          </p>
        ) : null)}
        <ul className="mt-10">
          {localizeContent(PARTNER_CARDS.map((c) => (
            <li key={c.title} className="border-b border-border py-12">
              <p className="text-xs uppercase tracking-[0.28em] text-earth">{localizeContent("For partners")}</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">{localizeContent(c.title)}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{localizeContent(c.body)}</p>
            </li>
          )))}
        </ul>
      </RoomBody>
    </div>
  );
}
