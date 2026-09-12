import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { getMyHome, saveCheckIn } from "@/lib/server/profile";
import { AFFIRMATIONS, STAGE_LABEL, type Stage } from "@/lib/content/catalog";
import { pregnancyWeekFromDueDate, postpartumWeekFromBirthday } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { altFor } from "@/lib/landing";
import { Pour, GLASS_GOAL } from "@/components/house/pour";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({ component: Today });

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
    return (
      <div className="house-morning px-5 pt-28">
        <p className="font-display text-3xl text-ink-soft">Setting today's table…</p>
      </div>
    );
  }

  if (!home.profile.onboardingCompleted) {
    return (
      <section className="house-morning mx-auto max-w-3xl px-5 pb-24 pt-28 md:px-10">
        <p className="text-xs uppercase tracking-[0.32em] text-sea">Before the table is set</p>
        <h1 className="mt-5 font-display text-[clamp(2.4rem,7vw,4.4rem)] leading-[0.95]">Let us know you first.</h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
          A short welcome so meals, wrapping, and Nouri can meet you where you are — not a generic plan.
        </p>
        <Button asChild className="mt-10 h-14 w-fit rounded-full px-8" variant="gold">
          <Link to="/app/onboarding">Begin onboarding</Link>
        </Button>
      </section>
    );
  }

  const name = home.profile.displayName?.split(" ")[0] ?? "love";
  const stage = home.profile.stage as Stage | null;
  const season = week ? `Week ${week}` : stage ? STAGE_LABEL[stage] : "Your season";

  async function toggle(key: string) {
    const completed = { ...home!.checkin.completed, [key]: !home!.checkin.completed[key] };
    setHome({ ...home!, checkin: { ...home!.checkin, completed } });
    await saveCheckIn({ data: { hydration: home!.checkin.hydration, completed } });
  }

  async function setHydration(next: number) {
    const hydration = Math.min(GLASS_GOAL, Math.max(0, next));
    setHome({ ...home!, checkin: { ...home!.checkin, hydration } });
    await saveCheckIn({ data: { hydration, completed: home!.checkin.completed } });
  }

  return (
    <div className="house-table pb-28">
      <header className="house-morning">
        <div className="mx-auto max-w-5xl px-5 pt-24 pb-12 md:px-10 md:pt-28 md:pb-16">
          <p className="text-xs uppercase tracking-[0.32em] text-sea">Today's table</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,4.8rem)] leading-[0.95]">
            Welcome back, {name}.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            {season}
            <span className="mx-3 text-gold">·</span>
            {affirmation}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 md:px-10">
        <Pour count={home.checkin.hydration} onChange={(n) => void setHydration(n)} />

        <section className="mt-16 md:mt-20" aria-label="Rooms for today">
          <p className="text-xs uppercase tracking-[0.32em] text-earth">Walk the house</p>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.8rem)]">What does her body need?</h2>
          <div className="house-rooms mt-8">
            <RoomCard
              to="/app/meals"
              photo="/images/meal-bowl.jpg"
              alt={altFor("/images/meal-bowl.jpg")}
              kicker="The table"
              title="Today's meals"
              body="A plan that already knows your plate, kitchen, and week."
              label="Open the week"
              tone="clay"
            />
            <RoomCard
              to="/app/binding"
              photo="/images/binding-hands.jpg"
              alt={altFor("/images/binding-hands.jpg")}
              kicker="Flagship"
              title="Belly binding"
              body={
                home.checkin.completed.binding
                  ? "Marked for today. The studio is still here."
                  : "Studio video, wrap review, and a private journal."
              }
              label="Open the studio"
              tone="blush"
              extra={
                <button
                  type="button"
                  className={cn("wrap-toggle", home.checkin.completed.binding && "is-done")}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void toggle("binding");
                  }}
                >
                  <span className="wrap-cloth" aria-hidden />
                  {home.checkin.completed.binding ? "Wrapped" : "Mark wrapped"}
                </button>
              }
            />
            <RoomCard
              to="/app/nouri"
              photo="/images/nouri-drop.jpg"
              alt={altFor("/images/nouri-drop.jpg")}
              kicker="Companion"
              title="Ask Nouri"
              body="She remembers this week. She will not pretend to be your clinician."
              label="Talk to Nouri"
              tone="plum"
            />
            <RoomCard
              to="/app/move"
              photo="/images/movement.jpg"
              alt={altFor("/images/movement.jpg")}
              kicker="The body"
              title="Gentle movement"
              body="Optional. Never punitive. Stop for pain."
              label="Open movement"
              tone="sea"
            />
          </div>
        </section>

        <section className="mt-16 md:mt-20" aria-label="How the body feels">
          <p className="text-xs uppercase tracking-[0.32em] text-earth">How the body feels</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["steady", "tender", "tired", "bright"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setHome({ ...home, checkin: { ...home.checkin, mood: m } });
                  void saveCheckIn({
                    data: { hydration: home.checkin.hydration, mood: m, completed: home.checkin.completed },
                  });
                }}
                className={cn("mood-stone", home.checkin.mood === m && "is-on")}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <section className="house-note mt-16 mb-8 md:mt-20">
          {home.nextAppointment ? (
            <p className="font-display text-2xl leading-snug md:text-3xl">
              Upcoming: {home.nextAppointment.type} · {new Date(home.nextAppointment.startsAt).toLocaleString()}
            </p>
          ) : (
            <p className="font-display text-2xl leading-snug text-ink-soft md:text-3xl">No appointment on the calendar.</p>
          )}
          <Link to="/app/appointments" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sea">
            {home.nextAppointment ? "View the hour" : "Book a time"} <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function RoomCard({
  to,
  photo,
  alt,
  kicker,
  title,
  body,
  label,
  tone,
  extra,
}: {
  to: "/app/meals" | "/app/binding" | "/app/nouri" | "/app/move";
  photo: string;
  alt: string;
  kicker: string;
  title: string;
  body: string;
  label: string;
  tone: "clay" | "blush" | "plum" | "sea";
  extra?: ReactNode;
}) {
  const kickerClass =
    tone === "clay" ? "text-clay" : tone === "blush" ? "text-blush" : tone === "plum" ? "text-plum" : "text-sea";
  return (
    <article className="house-room">
      <Link to={to} className="house-room-link">
        <img src={photo} alt={alt} className="house-room-photo" />
        <div className="house-room-copy">
          <p className={`text-xs uppercase tracking-[0.28em] ${kickerClass}`}>{kicker}</p>
          <h3 className="mt-2 font-display text-2xl leading-[1.1] md:text-3xl">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{body}</p>
          <span className="house-enter">
            {label} <ArrowRight className="size-4" />
          </span>
        </div>
      </Link>
      {extra ? <div className="house-room-extra">{extra}</div> : null}
    </article>
  );
}
