import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getMyHome, saveCheckIn } from "@/lib/server/profile";
import { AFFIRMATIONS, STAGE_LABEL, type Stage } from "@/lib/content/catalog";
import { pregnancyWeekFromDueDate, postpartumWeekFromBirthday } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/")({ component: Today });

function heroFor(stage: Stage | null) {
  if (stage === "postpartum") return { src: "/images/postpartum-rest.jpg", alt: "Morning rest by a window" };
  if (stage === "first" || stage === "second" || stage === "third") {
    return { src: "/images/hero-kitchen.jpg", alt: "A mother in warm kitchen light" };
  }
  if (stage === "trying") return { src: "/images/hydration.jpg", alt: "Lemon water in a ceramic pitcher" };
  return { src: "/images/meal-bowl.jpg", alt: "A nourishing bowl on linen" };
}

function Today() {
  const [home, setHome] = useState<Awaited<ReturnType<typeof getMyHome>> | null>(null);

  useEffect(() => {
    void getMyHome()
      .then(setHome)
      .catch(() => setHome(null));
  }, []);

  const week = useMemo(() => {
    if (!home) return null;
    if (home.profile.stage === "postpartum") return postpartumWeekFromBirthday(home.profile.babyBirthday);
    return pregnancyWeekFromDueDate(home.profile.dueDate);
  }, [home]);

  const affirmation = AFFIRMATIONS[(new Date().getDate() + (week ?? 1)) % AFFIRMATIONS.length];

  if (!home) {
    return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">Setting today's table…</p>;
  }

  if (!home.profile.onboardingCompleted) {
    return (
      <section className="relative min-h-dvh overflow-hidden text-paper">
        <img src="/images/hero-kitchen.jpg" alt="A mother standing in warm kitchen light" className="media absolute inset-0 h-full w-full object-cover" />
        <div className="hero-veil pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col justify-end px-5 pb-24 pt-32 md:px-10">
          <p className="text-xs uppercase tracking-[0.32em] text-aqua">Before the table is set</p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,8vw,5.6rem)] leading-[0.95]">Let us know you first.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/88">
            A short welcome so meals, wrapping, and Nouri can meet you where you are — not a generic plan.
          </p>
          <Button asChild className="mt-10 h-14 w-fit rounded-full px-8" variant="gold">
            <Link to="/app/onboarding">Begin onboarding</Link>
          </Button>
        </div>
      </section>
    );
  }

  const name = home.profile.displayName?.split(" ")[0] ?? "love";
  const stage = home.profile.stage as Stage | null;
  const hero = heroFor(stage);
  const season = week ? `Week ${week}` : stage ? STAGE_LABEL[stage] : "Your season";

  async function toggle(key: string) {
    const completed = { ...home!.checkin.completed, [key]: !home!.checkin.completed[key] };
    setHome({ ...home!, checkin: { ...home!.checkin, completed } });
    await saveCheckIn({ data: { hydration: home!.checkin.hydration, completed } });
  }

  async function sip() {
    const hydration = Math.min(12, home!.checkin.hydration + 1);
    setHome({ ...home!, checkin: { ...home!.checkin, hydration } });
    await saveCheckIn({ data: { hydration, completed: home!.checkin.completed } });
  }

  return (
    <div>
      <section className="relative min-h-[88dvh] overflow-hidden text-paper md:min-h-dvh">
        <img src={hero.src} alt={hero.alt} className="media absolute inset-0 h-full w-full object-cover" />
        <div className="hero-veil pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex min-h-[88dvh] max-w-5xl flex-col justify-end px-5 pb-16 pt-32 md:min-h-dvh md:px-10 md:pb-24">
          <p className="text-xs uppercase tracking-[0.32em] text-aqua">Today's journey</p>
          <h1 className="mt-5 font-display text-[clamp(3rem,8vw,6.4rem)] leading-[0.92]">Welcome back, {name}.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/88 md:text-xl">
            {season}
            <span className="mx-3 text-gold">·</span>
            {affirmation}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-20 md:px-10 md:py-28">
        <p className="text-xs uppercase tracking-[0.32em] text-earth">This day's care</p>
        <h2 className="mt-5 font-display text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05]">What does her body need?</h2>
        <div className="editorial-rule mt-10" />

        <ul className="mt-6">
          <Ritual
            photo="/images/hydration.jpg"
            photoAlt="Lemon water in a ceramic pitcher"
            kicker="Hydration"
            kickerTone="text-sea"
            title={`${home.checkin.hydration} glasses so far`}
            body="A quiet tally. No streak. No shame."
            action="Add a glass"
            onAction={() => void sip()}
          />
          <Ritual
            photo="/images/meal-bowl.jpg"
            photoAlt="A nourishing bowl on linen"
            kicker="The table"
            kickerTone="text-clay"
            title="Today's meals"
            body="A plan that already knows your plate, kitchen, and week."
            href="/app/meals"
            linkLabel="Open the week"
          />
          <Ritual
            photo="/images/binding-hands.jpg"
            photoAlt="Hands wrapping a cotton belly bind"
            kicker="Flagship practice"
            kickerTone="text-blush"
            title="Belly binding"
            body={
              home.checkin.completed.binding
                ? "Marked for today. The studio is still here if you want to look again."
                : "Studio video, wrap review, and a private journal — when you are ready."
            }
            href="/app/binding"
            linkLabel="Open the studio"
            action={home.checkin.completed.binding ? "Undo" : "Mark done"}
            onAction={() => void toggle("binding")}
          />
          <Ritual
            photo="/images/nouri-drop.jpg"
            photoAlt="Ripple in a ceramic tea bowl"
            kicker="Companion"
            kickerTone="text-plum"
            title="Need help? Ask Nouri."
            body="She remembers this week. She will not pretend to be your clinician."
            href="/app/nouri"
            linkLabel="Talk to Nouri"
          />
        </ul>

        <section className="mt-20">
          <p className="text-xs uppercase tracking-[0.32em] text-earth">How the body feels</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["steady", "tender", "tired", "bright"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setHome({ ...home, checkin: { ...home.checkin, mood: m } });
                  void saveCheckIn({ data: { hydration: home.checkin.hydration, mood: m, completed: home.checkin.completed } });
                }}
                className={`h-11 rounded-full px-5 text-sm ${home.checkin.mood === m ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-20 border-t border-border pt-12">
          {home.nextAppointment ? (
            <p className="font-display text-3xl leading-snug">
              Upcoming: {home.nextAppointment.type} · {new Date(home.nextAppointment.startsAt).toLocaleString()}
              <Link to="/app/appointments" className="ml-4 text-xl text-primary">
                View
              </Link>
            </p>
          ) : (
            <p className="font-display text-3xl leading-snug text-ink-soft">
              No appointment on the calendar.{" "}
              <Link to="/app/appointments" className="text-primary">
                Book a time
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Ritual({
  photo,
  photoAlt,
  kicker,
  kickerTone = "text-earth",
  title,
  body,
  href,
  linkLabel,
  action,
  onAction,
}: {
  photo: string;
  photoAlt: string;
  kicker: string;
  kickerTone?: string;
  title: string;
  body: string;
  href?: "/app/meals" | "/app/binding" | "/app/nouri";
  linkLabel?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <li className="grid gap-8 border-b border-border py-14 md:grid-cols-[minmax(0,16rem)_1fr] md:items-center md:py-16">
      <img src={photo} alt={photoAlt} className="media h-56 w-full object-cover md:h-44" />
      <div>
        <p className={`text-xs uppercase tracking-[0.28em] ${kickerTone}`}>{kicker}</p>
        <h3 className="mt-3 font-display text-3xl md:text-5xl">{title}</h3>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft md:text-lg">{body}</p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          {href && linkLabel ? (
            <Link to={href} className="inline-flex items-center gap-2 text-primary">
              {linkLabel} <ArrowRight className="size-4" />
            </Link>
          ) : null}
          {action && onAction ? (
            <button type="button" onClick={onAction} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              {action}
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
