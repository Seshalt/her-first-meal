import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Lightbulb, Sparkles } from "lucide-react";
import { RESOURCE_LIBRARY, type Stage } from "@/lib/content/catalog";
import { DAILY_CARE_READINGS, dailyCareFor } from "@/lib/content/daily-care";
import { getMyHome } from "@/lib/server/profile";

export const Route = createFileRoute("/app/resources")({ component: Resources });

function Resources() {
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => {
    void getMyHome()
      .then((home) => setStage(home.profile.stage as Stage | null))
      .catch(() => setStage(null));
  }, []);

  const today = useMemo(() => dailyCareFor(stage), [stage]);
  const relevant = useMemo(
    () => DAILY_CARE_READINGS.filter((reading) => reading.id !== today.id && (reading.stages.includes("any") || (stage ? reading.stages.includes(stage) : true))),
    [stage, today.id],
  );

  return (
    <div className="member-dashboard">
      <header className="member-reveal is-in max-w-4xl py-4 md:py-8">
        <p className="member-eyebrow">Body library</p>
        <h1 className="mt-4 font-display text-[clamp(3.4rem,8vw,7rem)] leading-[.86] tracking-[-.045em]">
          Learn your body in small pieces.
        </h1>
        <p className="member-lede">
          Short readings for pregnancy, postpartum, nourishment, movement, and recovery. Open what helps today; there is no feed to keep up with.
        </p>
      </header>

      <section className="member-card member-reveal is-in mt-5 grid gap-6 p-5 md:p-7 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
        <div className="flex min-h-64 flex-col justify-between rounded-[22px] bg-[var(--member-surface-2)] p-5">
          <div>
            <div className="flex items-center gap-2 text-[var(--member-gold)]">
              <Sparkles className="size-5" />
              <p className="text-[11px] font-semibold uppercase tracking-[.22em]">Today’s reading · {today.minutes} min</p>
            </div>
            <h2 className="mt-5 font-display text-4xl leading-[.95] md:text-5xl">{today.title}</h2>
          </div>
          <p className="mt-7 text-sm leading-6 text-[var(--member-muted)]">{today.note}</p>
        </div>
        <div className="lg:px-3">
          <p className="text-lg leading-8 text-[var(--member-muted)]">{today.body}</p>
          <div className="mt-6 border-l-2 border-[var(--member-gold)] pl-4">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--member-gold)]">Try this today</p>
            <p className="mt-2 text-base leading-7 text-[var(--member-text)]">{today.tip}</p>
          </div>
        </div>
      </section>

      <div className="member-section-head member-reveal is-in">
        <div>
          <p className="member-eyebrow">Daily body notes</p>
          <h2>Useful in a few minutes.</h2>
        </div>
        <p className="hidden md:block">These rotate on your dashboard. You can read ahead here without changing what appears tomorrow.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {relevant.map((reading) => (
          <article key={reading.id} className="member-card member-reveal is-in flex min-h-[20rem] flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="member-eyebrow">{reading.eyebrow}</p>
                <span className="text-xs text-[var(--member-faint)]">{reading.minutes} min</span>
              </div>
              <h3 className="mt-4 font-display text-3xl leading-[1]">{reading.title}</h3>
              <p className="member-card-copy mt-4">{reading.body}</p>
            </div>
            <div className="mt-6 rounded-[18px] bg-[var(--member-surface-2)] p-4">
              <div className="flex gap-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-[var(--member-gold)]" />
                <p className="text-sm leading-6 text-[var(--member-text)]">{reading.tip}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="member-section-head member-reveal is-in">
        <div>
          <p className="member-eyebrow">Practical library</p>
          <h2>Keep going when you want more.</h2>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {RESOURCE_LIBRARY.map((resource) => (
          <article key={resource.id} className="member-card member-reveal is-in min-h-[18rem]">
            <div className="flex items-center gap-2 text-[var(--member-teal)]">
              <BookOpen className="size-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[.2em]">
                {resource.category} · {resource.minutes} min read
              </p>
            </div>
            <h3 className="mt-5 font-display text-4xl leading-[.98]">{resource.title}</h3>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--member-muted)]">{resource.body}</p>
          </article>
        ))}
      </section>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-5 text-[var(--member-faint)]">
        Educational wellness information only. These readings do not diagnose, treat, or replace guidance from your healthcare team.
      </p>
    </div>
  );
}
