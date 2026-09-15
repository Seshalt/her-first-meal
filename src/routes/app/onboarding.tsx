import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, ShieldCheck, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand/logo";
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
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
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
          if (home.profile.householdSize) setHouseholdSize(home.profile.householdSize);
          if (home.profile.weeklyBudget) setWeeklyBudget(home.profile.weeklyBudget);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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
      <aside className="onboarding-photo" data-step={step}>
        <img src={current.src} alt={current.alt} className="media" />
        <div className="onboarding-photo-veil" />
        <div className="onboarding-photo-copy">
          <Wordmark to="/" className="text-paper" />
          <div className="onboarding-photo-message">
            <p className="onboarding-kicker">
              {t(current.kicker as MsgKey)} · {step + 1} of {STEPS.length}
            </p>
            <h1>{t(current.title as MsgKey)}</h1>
            <p>{t(current.body as MsgKey)}</p>
          </div>
        </div>
      </aside>

      <main className="onboarding-panel">
        <div className="onboarding-form">
          <p className="onboarding-step-label">{current.label}</p>
          <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>

          {!sessionReady ? (
            <div className="onboarding-session">
              {sessionError
                ? "Your account exists, but the secure session did not finish. Refresh once or sign in again."
                : "Securing your new account…"}
            </div>
          ) : null}

          {step === 0 ? (
            <div className="onboarding-body space-y-5">
              <Field label={t("join.name")} value={displayName} onChange={setDisplayName} />
              <Field
                label="City or area"
                value={location}
                onChange={setLocation}
                optional
                helper="Add this if you want grocery planning tailored to stores and markets around you. We do not need your exact address."
              />
              <div className="onboarding-disclosure">
                <div className="flex gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--member-teal)_14%,transparent)] text-[var(--member-teal)]">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <strong className="block text-sm">Why we ask</strong>
                    <p className="mt-1 text-sm leading-6">
                      A city or ZIP helps your grocery list work around the stores and markets near you. Exact device location is only requested later if you tap “Find stores near me.”
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
            <div className="onboarding-body space-y-5">
              <div>
                <Label>Where are you right now?</Label>
                <div className="onboarding-choice-grid mt-2">
                  {(Object.keys(STAGE_LABEL) as Stage[]).map((value) => (
                    <Choice key={value} active={stage === value} onClick={() => setStage(value)}>
                      {t(`stage.${value}` as MsgKey)}
                    </Choice>
                  ))}
                </div>
              </div>
              {stage && stage !== "postpartum" && stage !== "trying" ? (
                <Field label="Due date" value={dueDate} onChange={setDueDate} type="date" />
              ) : null}
              {stage === "postpartum" ? (
                <Field label="Baby's birthday" value={babyBirthday} onChange={setBabyBirthday} type="date" />
              ) : null}
              <label className="onboarding-check">
                <input type="checkbox" checked={isFirstPregnancy} onChange={(e) => setIsFirstPregnancy(e.target.checked)} />
                <span>First pregnancy</span>
              </label>
              <label className="onboarding-check">
                <input type="checkbox" checked={isMultiple} onChange={(e) => setIsMultiple(e.target.checked)} />
                <span>Multiple pregnancy</span>
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
            <div className="onboarding-body space-y-5">
              <div>
                <Label>How do you eat?</Label>
                <p className="onboarding-helper mb-3">Choose every option that should shape recipes. Tap again to remove it.</p>
                <DietPicks value={diets} onChange={setDiets} />
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
            <div className="onboarding-body space-y-5">
              <div className="onboarding-disclosure">
                <div className="flex gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--member-gold)_14%,transparent)] text-[var(--member-gold)]">
                    <Store className="size-5" />
                  </div>
                  <div>
                    <strong className="block text-sm">Make the grocery list useful where you live.</strong>
                    <p className="mt-1 text-sm leading-6">
                      Pick your state, the stores you actually use, and an optional ZIP. This improves local grocery planning without needing your exact address.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 border-t border-[var(--member-line)] pt-4 text-xs leading-5 text-[var(--member-muted)]">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--member-teal)]" />
                  Precise GPS is requested only if you later choose “Find stores near me,” and those coordinates are not saved to your profile.
                </div>
              </div>

              <div>
                <Label htmlFor="state">{t("onboarding.state")}</Label>
                <select id="state" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                  <option value="">Select your state</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Stores you use</Label>
                <p className="onboarding-helper mb-3">Selected stores are clearly filled. You can change these later.</p>
                <div className="onboarding-choice-grid">
                  {STORES.map((store) => (
                    <Choice key={store} active={stores.includes(store)} onClick={() => toggle(stores, store, setStores)}>
                      {store}
                    </Choice>
                  ))}
                </div>
              </div>

              <Field label="ZIP code" value={zipCode} onChange={setZipCode} optional />
              <Field
                label="Household size"
                value={String(householdSize)}
                onChange={(v) => setHouseholdSize(Math.max(1, Number(v) || 1))}
                type="number"
              />
              <Field label="Weekly grocery budget" value={weeklyBudget} onChange={setWeeklyBudget} optional />
            </div>
          ) : null}

          <div className="onboarding-actions">
            {step > 0 ? (
              <button type="button" className="onboarding-secondary" disabled={busy} onClick={() => setStep((value) => value - 1)}>
                {t("back")}
              </button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="onboarding-primary"
                disabled={busy || !sessionReady || (step === 0 && !displayName.trim())}
                onClick={() => void persist(false, step + 1)}
              >
                {busy ? "Saving…" : t("continue")}
              </button>
            ) : (
              <button type="button" className="onboarding-primary" disabled={busy || !sessionReady} onClick={() => void persist(true, step)}>
                {busy ? t("onboarding.opening") : t("onboarding.enter")}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="onboarding-choice" aria-pressed={active} onClick={onClick}>
      {children}
    </button>
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
  onChange: (value: string) => void;
  type?: string;
  optional?: boolean;
  helper?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {optional ? <span className="ml-1 font-normal text-[var(--member-faint)]">(optional)</span> : null}
      </Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {helper ? <p className="onboarding-helper">{helper}</p> : null}
    </div>
  );
}
