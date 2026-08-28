import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand/logo";
import { Pill } from "@/components/layout/room-hero";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { DIETS, STAGE_LABEL, STORES, type Stage } from "@/lib/content/catalog";
import { saveOnboarding } from "@/lib/server/profile";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/app/onboarding")({ component: Onboarding });

const STEPS = [
  {
    label: "You",
    kicker: "Welcome",
    title: "What shall we call you?",
    body: "A name, a place, a language. Nothing else is required yet.",
    src: "/images/hero-kitchen.jpg",
    alt: "A mother standing in warm kitchen light",
  },
  {
    label: "Season",
    kicker: "The journey",
    title: "Where is the body in this story?",
    body: "Trying, pregnant, or postpartum — the house grows from here.",
    src: "/images/postpartum-rest.jpg",
    alt: "A postpartum mother resting by a window",
  },
  {
    label: "Plate",
    kicker: "Nourish",
    title: "What does her plate need?",
    body: "Loves, avoids, allergies. We cook from this, not a generic week.",
    src: "/images/meal-bowl.jpg",
    alt: "A nourishing bowl set on linen",
  },
  {
    label: "Market",
    kicker: "The list",
    title: "Where do you shop?",
    body: "Choose as many stores as you like. Location is never required.",
    src: "/images/grocery-partner.jpg",
    alt: "A partner choosing produce from a handwritten list",
  },
];

function Onboarding() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [language, setLanguage] = useState("en");
  const [stage, setStage] = useState<Stage | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [babyBirthday, setBabyBirthday] = useState("");
  const [previousPregnancies, setPreviousPregnancies] = useState(0);
  const [isFirstPregnancy, setIsFirstPregnancy] = useState(true);
  const [isMultiple, setIsMultiple] = useState(false);
  const [diets, setDiets] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [avoids, setAvoids] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [loves, setLoves] = useState("");
  const [cuisines, setCuisines] = useState("");
  const [stores, setStores] = useState<string[]>([]);
  const [householdSize, setHouseholdSize] = useState(2);
  const [weeklyBudget, setWeeklyBudget] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [busy, setBusy] = useState(false);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  async function persist(complete = false, nextStep = step) {
    setBusy(true);
    try {
      await saveOnboarding({
        data: {
          displayName,
          location,
          timezone,
          language,
          stage,
          dueDate: dueDate || null,
          babyBirthday: babyBirthday || null,
          previousPregnancies,
          isFirstPregnancy,
          isMultiple,
          diets,
          allergies: allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          avoids,
          dislikes,
          loves,
          cuisines: cuisines
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          stores,
          householdSize,
          weeklyBudget,
          zipCode,
          complete,
          step: nextStep,
        },
      });
      if (complete) {
        toast.success("Your house is ready.");
        void navigate({ to: "/app" });
      } else {
        setStep(nextStep);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save yet.");
    } finally {
      setBusy(false);
    }
  }

  const current = STEPS[step];

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative min-h-[42vh] overflow-hidden text-paper lg:min-h-dvh">
        <img src={current.src} alt={current.alt} className="media absolute inset-0 h-full w-full object-cover" />
        <div className="hero-veil pointer-events-none absolute inset-0" />
        <div className="relative flex h-full min-h-[42vh] flex-col justify-between px-5 py-8 md:px-10 lg:min-h-dvh lg:py-10">
          <Wordmark to="/" className="text-paper" />
          <div className="pb-8 lg:pb-12">
            <p className="text-xs uppercase tracking-[0.32em] text-aqua">
              {current.kicker} · {step + 1} of {STEPS.length}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95]">{current.title}</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/88">{current.body}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-background px-5 py-12 md:px-14">
        <p className="text-xs uppercase tracking-[0.32em] text-earth">{current.label}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {step === 0 ? (
          <div className="mt-8 space-y-4">
            <Field label="Name" value={displayName} onChange={setDisplayName} />
            <Field label="Location" value={location} onChange={setLocation} optional />
            <Field label="Time zone" value={timezone} onChange={setTimezone} />
            <Field label="Language" value={language} onChange={setLanguage} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STAGE_LABEL) as Stage[]).map((s) => (
                <Pill key={s} active={stage === s} onClick={() => setStage(s)}>
                  {STAGE_LABEL[s]}
                </Pill>
              ))}
            </div>
            {stage && stage !== "postpartum" && stage !== "trying" ? (
              <Field label="Due date" value={dueDate} onChange={setDueDate} type="date" />
            ) : null}
            {stage === "postpartum" ? (
              <Field label="Baby's birthday" value={babyBirthday} onChange={setBabyBirthday} type="date" />
            ) : null}
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={isFirstPregnancy} onChange={(e) => setIsFirstPregnancy(e.target.checked)} />
              First pregnancy
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={isMultiple} onChange={(e) => setIsMultiple(e.target.checked)} />
              Multiple pregnancy
            </label>
            <Field
              label="Previous pregnancies"
              value={String(previousPregnancies)}
              onChange={(v) => setPreviousPregnancies(Number(v) || 0)}
              type="number"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <Pill key={d.id} active={diets.includes(d.id)} onClick={() => toggle(diets, d.id, setDiets)}>
                  {d.label}
                </Pill>
              ))}
            </div>
            <Field label="Allergies (comma separated)" value={allergies} onChange={setAllergies} optional />
            <div>
              <Label>What foods do you avoid?</Label>
              <Textarea value={avoids} onChange={(e) => setAvoids(e.target.value)} />
            </div>
            <div>
              <Label>What foods do you dislike?</Label>
              <Textarea value={dislikes} onChange={(e) => setDislikes(e.target.value)} />
            </div>
            <div>
              <Label>What foods do you love?</Label>
              <Textarea value={loves} onChange={(e) => setLoves(e.target.value)} />
            </div>
            <Field label="Cuisines you enjoy" value={cuisines} onChange={setCuisines} optional />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {STORES.map((s) => (
                <Pill key={s} active={stores.includes(s)} onClick={() => toggle(stores, s, setStores)}>
                  {s}
                </Pill>
              ))}
            </div>
            <Field label="ZIP code" value={zipCode} onChange={setZipCode} optional />
            <Field
              label="Household size"
              value={String(householdSize)}
              onChange={(v) => setHouseholdSize(Number(v) || 1)}
              type="number"
            />
            <Field label="Weekly grocery budget" value={weeklyBudget} onChange={setWeeklyBudget} optional />
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button type="button" disabled={busy || (step === 0 && !displayName)} onClick={() => void persist(false, step + 1)}>
              Continue
            </Button>
          ) : (
            <Button type="button" disabled={busy} onClick={() => void persist(true, step)}>
              {busy ? "Opening the door…" : "Enter Today's Journey"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="ml-1 text-muted-foreground">(optional)</span> : null}
      </Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
