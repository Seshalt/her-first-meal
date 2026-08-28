import { createFileRoute } from "@tanstack/react-router";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { RESOURCE_LIBRARY } from "@/lib/content/catalog";

export const Route = createFileRoute("/app/resources")({ component: Resources });

function Resources() {
  return (
    <div>
      <RoomHero
        kicker="Library"
        title="Short, practical pieces"
        body="Unlocked with your season inside the journey — never a feed to catch up on."
        src="/images/hydration.jpg"
        alt="Lemon water in a ceramic pitcher"
        tone="plum"
      />
      <RoomBody>
        <ul>
          {RESOURCE_LIBRARY.map((r) => (
            <li key={r.id} className="border-b border-border py-12">
              <p className="text-xs uppercase tracking-[0.28em] text-plum">
                {r.category} · {r.minutes} minute read
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">{r.title}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{r.body}</p>
            </li>
          ))}
        </ul>
      </RoomBody>
    </div>
  );
}
