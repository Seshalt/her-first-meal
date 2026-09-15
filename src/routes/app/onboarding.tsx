import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, ShieldCheck, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand/logo";
import { Pill } from "@/components/layout/room-hero";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { DietPicks } from "@/components/house/diet-picks";
import { LocaleSwitch } from "@/components/i18n/locale-switch";
import { STAGE_LABEL, STORES, readJoinDiets, type Stage } from "@/lib/content/catalog";
import { US_STATES, stateByCode } from "@/lib/content/places";
import { altFor } from "@/lib/landing";
import { getMyHome, saveJoinDiets, saveOnboarding } from "@/lib/server/profile";
import { authClient } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n/provider";
import type { MsgKey } from "@/lib/i18n/en";

export const Route = createFileRoute("/app/onboarding")({ component: Onboarding });

const STEPS = [
  {
    label: "You",
    kicker: "onboarding.youKicker",
    title: "onboarding.youTitle",
    body: "onboarding.youBody",
    src: "/images/hero-kitchen.jpg",
    alt: altFor("/images/hero-kitchen.jpg"),
  },
  {
    label: "Season",
    kicker: "onboarding.seasonKicker",
    title: "onboarding.seasonTitle",
    body: "onboarding.seasonBody",
    src: "/images/postpartum-rest.jpg",
    alt: altFor("/images/postpartum-rest.jpg"),
  },
  {
    label: "Plate",
    kicker: "onboarding.plateKicker",
    title: "onboarding.plateTitle",
    body: "onboarding.plateBody",
    src: "/images/meal-bowl.jpg",
    alt: altFor("/images/meal-bowl.jpg"),
  },
  {
    label: "Market",
    kicker: "onboarding.marketKicker",
    title: "onboarding.marketTitle",
    body: "onboarding.marketBody",
    src: "/images/grocery-partner.jpg",
    alt: altFor("/images/grocery-partner.jpg"),
  },
] as const;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function Onboarding() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [location, setLocation] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
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
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  useEffect(() => {
    const stored = readJoinDiets();
    if (stored.length) setDiets(stored);
    let live = true;

    async function loadHome() {
      for (let attempt = 0; attempt < 7; attempt += 1) {
        try {
          await authClient.getSession().catch(() => undefined);
          const home = await getMyHome();
          if (!live) return;
          if (home.profile.displayName) setDisplayName(home.profile.displayName);
          if (home.profile.language) setLocale(home.profile.language as typeof locale);
          if (home.profile.stage) setStage(home.profile.stage);
          if (home.profile.stateCode) setStateCode(home.profile.stateCode);
          if (home.profile.city) setLocation(home.profile.city);
          if (home.profile.zipCode) setZipCode(home.profile.zipCode);
          if (home.grocery.stores.length) setStores(home.grocery.stores);
          if (home.diet.diets.length) setDiets(home.diet.diets);
          else if (stored.length) await saveJoinDiets({ data: { diets: stored, language: locale } }).catch(() => undefined);
          setSessionReady(true);
          setSessionError(false);
          return;
        } catch {
          if (attempt < 6) await wait(250 + attempt * 180);
        }
      }
      if (live) setSessionError(true);
    }

    void loadHome();
    return () => {
      live = false;
    };
  }, []);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  function onboardingPayload(complete = false, nextStep = step) {
    return {
      displayName,
      location: stateByCode(stateCode)?.name ?? location,
      timezone,
      language: locale,
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
      city: location,
      stateCode: stateCode || undefined,
      region: stateByCode(stateCode)?.region,
      complete,
      step: nextStep,
    };
  }

  async function persist(complete = false, nextStep = step) {
    setBusy(true);
    try {
      const data = onboardingPayload(complete, nextStep);
      try {
        await saveOnboarding({ data });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (!/unauthorized/i.test(message)) throw err;
        await authClient.getSession().catch(() => undefined);
        await wait(450);
        await saveOnboarding({ data });
      }
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
              {t(current.kicker as MsgKey)} · {step + 1} of {STEPS.length}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95]">{t(current.title as MsgKey)}</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-paper/88">{t(current.body as MsgKey)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center bg-background px-5 py-12 md:px-14">
        <p className="text-xs uppercase tracking-[0.32em] text-earth">{current.label}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {!sessionReady ? (
          <div className="mt-5 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground backdrop-blur">
            {sessionError ? "Your account was created, but sign-in did not finish. Refresh this page or sign in again." : "Securing your new account…"}
          </div>
        ) : null}

        {step === 0 ? (
          <div className="mt-8 space-y-4">
            <Field label={t("join.name")} value={displayName} onChange={setDisplayName} />
            <Field
              label="City or area"
              value={location}
              onChange={setLocation}
              optional
              helper="Add this if you want grocery planning tailored to stores and markets around you. We do not need your exact address."
            />
            <div className="location-disclosure rounded-[24px] p-5">
              <div className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Make grocery planning local</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your city or ZIP helps us shape store and market guidance around where you actually shop. Later, “Find stores near me” can ask for one-time device location only when you tap it; precise GPS is not saved to your profile.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label>{t("join.language")}</Label>
              <div className="mt-2">
                <LocaleSwitch tone="gold" />
              </div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STAGE_LABEL) as Stage[]).map((s) => (
                <Pill key={s} active={stage === s} onClick={() => setStage(s)}>
                  {t(`stage.${s}` as MsgKey)}
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
            <DietPicks value={diets} onChange={setDiets} />
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
            <div className="location-disclosure rounded-[24px] p-5">
              <div className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gold/15 text-earth dark:text-gold">
                  <Store className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Tell us where the grocery list has to work.</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Choose your state, favorite stores, and optionally a ZIP. We use them to make grocery planning more practical for your area and the stores you actually use.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" /> Exact GPS is only used if you later choose “Find stores near me,” and is not stored.
              </div>
            </div>
            <div>
              <Label>{t("onboarding.state")}</Label>
              <select
                className="mt-2 h-12 w-full rounded-xl border border-border bg-transparent px-3"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
              >
                <option value="">—</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {STORES.map((s) => (
                <Pill key={s} active={stores.includes(s)} onClick={() => toggle(stores, s, setStores)}>
                  {s}
                </Pill>
              ))}
            </div>
            <Field
              label="ZIP code"
              value={zipCode}
              onChange={setZipCode}
              optional
              helper="Helps narrow local grocery planning without asking for a street address."
            />
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
              {t("back")}
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button type="button" disabled={busy || !sessionReady || (step === 0 && !displayName)} onClick={() => void persist(false, step + 1)}>
              {busy ? "Saving…" : !sessionReady ? "Securing account…" : t("continue")}
            </Button>
          ) : (
            <Button type="button" disabled={busy || !sessionReady} onClick={() => void persist(true, step)}>
              {busy ? t("onboarding.opening") : !sessionReady ? "Securing account…" : t("onboarding.enter")}
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
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
  helper?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="ml-1 text-muted-foreground">(optional)</span> : null}
      </Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {helper ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
