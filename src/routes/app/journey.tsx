import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RoomHero } from "@/components/layout/room-hero";
import { getMyHome } from "@/lib/server/profile";
import { WEEKS } from "@/lib/content/catalog";
import { pregnancyWeekFromDueDate, postpartumWeekFromBirthday } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/journey")({ component: Journey });

function Journey() {
  const [week, setWeek] = useState(21);
  const [selected, setSelected] = useState(21);

  useEffect(() => {
    void getMyHome().then((h) => {
      const w =
        h.profile.stage === "postpartum"
          ? Math.min(42, 40 + (postpartumWeekFromBirthday(h.profile.babyBirthday) ?? 0))
          : pregnancyWeekFromDueDate(h.profile.dueDate) ?? 21;
      setWeek(w);
      setSelected(w);
    });
  }, []);

  const content = useMemo(() => WEEKS.find((w) => w.week === selected) ?? WEEKS[20], [selected]);
  const locked = selected > week + 1;

  const chapters = [
    { kicker: "01", title: "Mother", body: content.mother, src: "/images/hero-kitchen.jpg", alt: "A mother in warm kitchen light", wash: "bg-wash-linen", tone: "text-earth" },
    { kicker: "02", title: "Baby", body: content.baby, src: "/images/postpartum-rest.jpg", alt: "Quiet rest by a window", wash: "bg-wash-sea", tone: "text-sea" },
    { kicker: "03", title: "Nourish", body: content.nourish, src: "/images/meal-bowl.jpg", alt: "A nourishing bowl on linen", wash: "bg-wash-clay", tone: "text-clay" },
    { kicker: "04", title: "Move", body: content.move, src: "/images/movement.jpg", alt: "A pregnant woman stretching on a mat", wash: "bg-wash-blush", tone: "text-blush" },
  ];

  return (
    <div>
      <RoomHero
        kicker="Pregnancy journey"
        title="The house grows with you."
        body={`You are in week ${week}. Later weeks wait as a preview — never a locked-door insult.`}
        src="/images/hydration.jpg"
        alt="Lemon water in a ceramic pitcher"
        tone="sea"
      />
      <div className="border-y border-border bg-sea py-5 text-primary-foreground">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-5 md:px-10">
          {WEEKS.map((w) => {
            const later = w.week > week + 1;
            return (
              <button
                key={w.week}
                type="button"
                onClick={() => setSelected(w.week)}
                className={cn(
                  "flex h-12 min-w-12 flex-col items-center justify-center rounded-2xl text-xs tabular-nums",
                  selected === w.week
                    ? "bg-paper text-ink"
                    : later
                      ? "bg-white/10 text-paper/55"
                      : "bg-white/15 text-paper",
                  w.week === week && selected !== w.week && "ring-2 ring-gold",
                )}
                aria-label={`Week ${w.week}${later ? " locked preview" : ""}`}
              >
                {w.week}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mx-auto max-w-5xl px-5 py-10 text-sm uppercase tracking-[0.28em] text-earth md:px-10">
        {locked ? "Preview" : "Open"} · Week {selected}
      </p>
      {chapters.map((c, i) => (
        <article key={c.title} className="grid min-h-[70vh] lg:grid-cols-2 lg:min-h-[78vh]">
          <div className={i % 2 === 1 ? "relative min-h-[48vh] lg:order-2 lg:min-h-[78vh]" : "relative min-h-[48vh] lg:min-h-[78vh]"}>
            <img src={c.src} alt={c.alt} className="media absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className={`flex flex-col justify-center px-5 py-16 md:px-16 ${c.wash}`}>
            <p className={`text-xs uppercase tracking-[0.32em] ${c.tone}`}>{c.kicker}</p>
            <h2 className="mt-5 font-display text-[clamp(2.4rem,5vw,4.4rem)]">{c.title}</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft md:text-xl">{c.body}</p>
          </div>
        </article>
      ))}
      <p className="mx-auto max-w-5xl px-5 py-16 text-lg leading-relaxed text-ink-soft md:px-10">
        Question for your provider: {content.ask}
      </p>
    </div>
  );
}
