import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Droplets,
  HeartHandshake,
  MapPin,
  Sparkles,
  StretchHorizontal,
} from "lucide-react";
import { getMyHome, saveCheckIn } from "@/lib/server/profile";
import { AFFIRMATIONS, STAGE_LABEL, type Stage } from "@/lib/content/catalog";
import { dailyCareFor } from "@/lib/content/daily-care";
import { pregnancyWeekFromDueDate, postpartumWeekFromBirthday } from "@/lib/utils";
import { altFor } from "@/lib/landing";

export const Route = createFileRoute("/app/")({ component: Today });

function Today() {
  const [home, setHome] = useState<Awaited<ReturnType<typeof getMyHome>> | null>(null);

  useEffect(() => {
    void getMyHome()
      .then(setHome)
      .catch(() => setHome(null));
  }, []);

  useEffect(() => {
    if (!home) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".member-reveal"));
    const frame = window.requestAnimationFrame(() => {
      nodes.forEach((node, index) => {
        window.setTimeout(() => node.classList.add("is-in"), Math.min(index * 55, 330));
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [home?.profile.onboardingCompleted]);

  const week = useMemo(() => {
    if (!home) return null;
    if (home.profile.stage === "postpartum") return postpartumWeekFromBirthday(home.profile.babyBirthday);
    return pregnancyWeekFromDueDate(home.profile.dueDate);
  }, [home]);

  if (!home) {
    return (
      <div className="member-dashboard">
        <div className="member-card min-h-56 animate-pulse" aria-label="Loading your dashboard" />
      </div>
    );
  }

  if (!home.profile.onboardingCompleted) {
    return (
      <div className="member-dashboard">
        <section className="member-hero-card member-reveal is-in grid min-h-[32rem] items-end overflow-hidden lg:grid-cols-[1fr_.72fr]">
          <div className="relative z-10 max-w-2xl">
            <p className="member-eyebrow">Before the table is set</p>
            <h1 className="member-display">Let us know you first.</h1>
            <p className="member-lede">
              Four short steps shape meals, grocery planning, stage guidance, and the rooms you see first. Nothing here should feel generic.
            </p>
            <Link
              to="/app/onboarding"
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--member-teal)] px-5 font-semibold text-[#06110d] transition hover:-translate-y-0.5 active:scale-95"
            >
              Finish setup <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative mt-8 h-56 overflow-hidden rounded-[22px] lg:mt-0 lg:h-full lg:min-h-[25rem]">
            <img
              src="/images/hero-kitchen.jpg"
              alt={altFor("/images/hero-kitchen.jpg")}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </section>
      </div>
    );
  }

  const name = home.profile.displayName?.split(" ")[0] ?? "there";
  const stage = home.profile.stage as Stage | null;
  const season = week ? `Week ${week}` : stage ? STAGE_LABEL[stage] : "Your season";
  const affirmation = AFFIRMATIONS[(new Date().getDate() + (week ?? 1)) % AFFIRMATIONS.length];
  const reading = dailyCareFor(stage);
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const localPlace = home.profile.city || home.profile.location || (home.profile.stateCode ? "your area" : "your market");

  async function setHydration(value: number) {
    const hydration = Math.max(0, Math.min(12, value));
    setHome({ ...home!, checkin: { ...home!.checkin, hydration } });
    await saveCheckIn({ data: { hydration, completed: home!.checkin.completed } });
  }

  async function setMood(mood: string) {
    setHome({ ...home!, checkin: { ...home!.checkin, mood } });
    await saveCheckIn({ data: { hydration: home!.checkin.hydration, mood, completed: home!.checkin.completed } });
  }

  return (
    <div className="member-dashboard">
      <div className="member-dashboard-hero">
        <section className="member-hero-card member-reveal">
          <p className="member-eyebrow">{dateLabel}</p>
          <h1 className="member-display">Good to see you, {name}.</h1>
          <p className="member-lede">
            {affirmation} Today is organized around your body, your kitchen, and the season you are actually in.
          </p>
          <div className="member-season-chip">
            <Sparkles className="size-4 text-[var(--member-gold)]" />
            <span>{season}</span>
            {stage ? <span className="text-[var(--member-muted)]">· {STAGE_LABEL[stage]}</span> : null}
          </div>
        </section>

        <article className="member-body-note member-card member-reveal">
          <div>
            <p className="member-eyebrow">{reading.eyebrow} · {reading.minutes} min</p>
            <h2>{reading.title}</h2>
            <p className="mt-4 text-sm leading-6">{reading.body}</p>
            <p className="member-reading-tip">Today: {reading.tip}</p>
          </div>
          <Link to="/app/resources" className="member-reading-link mt-5">
            Read today’s body guide <ArrowRight className="size-4" />
          </Link>
        </article>
      </div>

      <section className="member-grid" aria-label="Today at a glance">
        <article className="member-card member-hydration member-reveal">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="member-eyebrow">Hydration</p>
              <h2 className="member-card-title">{home.checkin.hydration} glasses logged</h2>
            </div>
            <Droplets className="size-6 text-[var(--member-teal)]" />
          </div>
          <p className="member-card-copy">Tap a glass to update the day. No streaks, no shame, no fake score.</p>
          <div className="member-glasses" aria-label="Hydration glasses">
            {Array.from({ length: 12 }, (_, index) => {
              const value = index + 1;
              const full = value <= home.checkin.hydration;
              return (
                <button
                  key={value}
                  type="button"
                  className={`member-glass ${full ? "is-full" : ""}`}
                  aria-label={`${value} glass${value === 1 ? "" : "es"}`}
                  aria-pressed={full}
                  onClick={() => void setHydration(full && value === home.checkin.hydration ? value - 1 : value)}
                >
                  <span className="member-glass-water" />
                </button>
              );
            })}
          </div>
        </article>

        <article className="member-card member-photo-card member-reveal">
          <img src="/images/meal-bowl.jpg" alt={altFor("/images/meal-bowl.jpg")} />
          <div className="member-photo-copy">
            <p className="member-eyebrow">Your table</p>
            <h2 className="member-card-title">Meals for this week</h2>
            <p className="member-card-copy">Recipes shaped around your stage, diet, dislikes, and household.</p>
            <Link to="/app/meals" className="member-card-link mt-3">
              Open meals <ArrowRight className="size-4" />
            </Link>
          </div>
        </article>

        <article className="member-card member-photo-card member-reveal">
          <img src="/images/grocery-partner.jpg" alt={altFor("/images/grocery-partner.jpg")} />
          <div className="member-photo-copy">
            <p className="member-eyebrow">Local grocery</p>
            <h2 className="member-card-title">Shop around {localPlace}</h2>
            <p className="member-card-copy">
              Your list follows the meals and pantry. Use your saved city or tap Find stores near me when you want a one-time local search.
            </p>
            <Link to="/app/grocery" className="member-card-link mt-3">
              <MapPin className="size-4" /> Open grocery
            </Link>
          </div>
        </article>

        <article className="member-card member-reveal">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="member-eyebrow">Calendar</p>
              <h2 className="member-card-title">{home.nextAppointment ? "Your next session" : "Your calendar is open"}</h2>
            </div>
            <CalendarDays className="size-6 text-[var(--member-gold)]" />
          </div>
          {home.nextAppointment ? (
            <p className="member-card-copy">
              {home.nextAppointment.type} · {new Date(home.nextAppointment.startsAt).toLocaleString()}
            </p>
          ) : (
            <p className="member-card-copy">Book a private session only when you want one. It stays separate from your membership.</p>
          )}
          <Link to="/app/appointments" className="member-card-link mt-5">
            {home.nextAppointment ? "View appointment" : "See appointments"} <ArrowRight className="size-4" />
          </Link>
        </article>
      </section>

      <section className="member-card member-reveal mt-4 p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="member-eyebrow">How the body feels</p>
            <h2 className="member-card-title">A ten-second check-in.</h2>
            <p className="member-card-copy">This is context for you, not a score to improve.</p>
          </div>
          <div className="member-mood-row lg:mt-0">
            {["steady", "tender", "tired", "bright"].map((mood) => (
              <button
                key={mood}
                type="button"
                className={`member-mood ${home.checkin.mood === mood ? "is-active" : ""}`}
                aria-pressed={home.checkin.mood === mood}
                onClick={() => void setMood(mood)}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="member-section-head member-reveal">
        <div>
          <p className="member-eyebrow">Your rooms</p>
          <h2>Go where you need to go.</h2>
        </div>
        <p className="hidden md:block">No giant list of chores. Open a room when it is useful, then leave it alone when it is not.</p>
      </div>

      <section className="member-room-grid" aria-label="Member rooms">
        <RoomCard
          to="/app/binding"
          image="/images/binding-hands.jpg"
          alt={altFor("/images/binding-hands.jpg")}
          eyebrow="Belly binding"
          title="The Binding Studio"
          body="Wrap education, reference steps, your journal, and optional review."
          icon={<HeartHandshake className="size-4" />}
        />
        <RoomCard
          to="/app/journey"
          image="/images/movement.jpg"
          alt={altFor("/images/movement.jpg")}
          eyebrow="Your stage"
          title="Week-by-week journey"
          body="A quieter timeline for what may be changing in this season."
          icon={<Sparkles className="size-4" />}
        />
        <RoomCard
          to="/app/move"
          image="/images/postpartum-rest.jpg"
          alt={altFor("/images/postpartum-rest.jpg")}
          eyebrow="Movement"
          title="Move with the day you have"
          body="Stage-aware movement without punishment, streaks, or pressure."
          icon={<StretchHorizontal className="size-4" />}
        />
        <RoomCard
          to="/app/resources"
          image="/images/hydration.jpg"
          alt={altFor("/images/hydration.jpg")}
          eyebrow="Readings"
          title="Learn your body in small pieces"
          body="Daily body notes, food and recovery tips, and short practical readings."
          icon={<BookOpen className="size-4" />}
        />
      </section>

      <section className="member-card member-reveal mt-4 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="member-eyebrow">Need a person?</p>
          <h2 className="member-card-title">Write the house.</h2>
          <p className="member-card-copy">Send a private support note when something needs a human answer.</p>
        </div>
        <Link
          to="/app/nouri"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--member-text)] px-5 text-sm font-semibold text-[var(--member-surface)] transition hover:-translate-y-0.5 active:scale-95"
        >
          <HeartHandshake className="size-4" /> Contact support
        </Link>
      </section>
    </div>
  );
}

function RoomCard({
  to,
  image,
  alt,
  eyebrow,
  title,
  body,
  icon,
}: {
  to: "/app/binding" | "/app/journey" | "/app/move" | "/app/resources";
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: ReactNode;
}) {
  return (
    <Link to={to} className="member-room-card member-reveal">
      <div className="overflow-hidden">
        <img src={image} alt={alt} />
      </div>
      <div className="member-room-card-copy">
        <p className="member-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{body}</p>
        <span className="member-room-arrow">
          {icon} Open room <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
