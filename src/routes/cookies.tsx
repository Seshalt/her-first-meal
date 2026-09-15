import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { DEFAULT_CHOICES, readCookieChoices, writeCookieChoices, type CookieChoices } from "@/lib/cookies";

export const Route = createFileRoute("/cookies")({ component: Cookies });

function Cookies() {
  const [choices, setChoices] = useState<CookieChoices>(DEFAULT_CHOICES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setChoices(readCookieChoices() ?? DEFAULT_CHOICES);
  }, []);

  function save() {
    writeCookieChoices(choices);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div>
      <PublicNav />
      <PageCanvas>
        <article className="mx-auto max-w-3xl px-4 pb-24 pt-12 md:pt-16">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Last updated September 15, 2026</p>
          <h1 className="mt-3 font-display text-5xl">Cookies & preferences</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Cookies keep secure sign-in working and remember privacy choices. Her First Meal does not rely on browser cookies to remember your actual member journey: onboarding, dietary preferences, grocery settings, hydration, mood, appointments, and other account activity are saved to your account so they can follow you across supported devices.
          </p>

          <section className="mt-10 grid gap-4">
            <ChoiceCard
              title="Necessary"
              body="Required for authentication, account security, checkout continuity, and remembering that you already made a cookie choice. These cannot be switched off while using account features."
              checked
              locked
            />
            <ChoiceCard
              title="Preferences"
              body="Lets this browser remember convenience choices such as consent preferences and interface settings. Important member records are still stored securely with your account."
              checked={choices.preferences}
              onChange={(value) => setChoices((current) => ({ ...current, preferences: value }))}
            />
            <ChoiceCard
              title="Analytics"
              body="Allows privacy-conscious visit measurement so we can understand which public pages are useful. Analytics stays off unless you choose to allow it."
              checked={choices.analytics}
              onChange={(value) => setChoices((current) => ({ ...current, analytics: value }))}
            />
            <ChoiceCard
              title="Advertising"
              body="Her First Meal does not currently use advertising cookies. This category remains off."
              checked={false}
              locked
            />
          </section>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 active:scale-95"
            >
              <Check className="size-4" /> Save cookie choices
            </button>
            {saved ? <span className="text-sm text-primary">Saved on this browser.</span> : null}
          </div>

          <div className="glass-panel mt-10 space-y-6 p-6 text-sm leading-6 text-muted-foreground md:p-8">
            <section>
              <h2 className="font-display text-2xl text-ink">What is remembered where</h2>
              <p className="mt-2">
                Authentication and consent use cookies or local browser storage. Account information and member progress use the Her First Meal database. Payment card details are handled by Stripe; Her First Meal does not store your full card number.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">How long choices last</h2>
              <p className="mt-2">
                The cookie preference record is set for up to one year unless you clear browser data or change your choices here. Authentication cookies may use different lifetimes for security reasons.
              </p>
            </section>
            <section className="flex gap-3 rounded-2xl bg-primary/8 p-4 text-foreground">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
              <p>
                Blocking optional cookies will not erase your saved member profile. You can still use paid member features that depend only on necessary authentication and account storage.
              </p>
            </section>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}

function ChoiceCard({
  title,
  body,
  checked,
  locked = false,
  onChange,
}: {
  title: string;
  body: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-[24px] border border-border bg-card p-5 shadow-[var(--shadow-border)]">
      <span>
        <span className="font-display text-2xl text-foreground">{title}</span>
        <span className="mt-1 block max-w-xl text-sm leading-6 text-muted-foreground">{body}</span>
      </span>
      <input
        type="checkbox"
        className="mt-1 size-5 accent-primary"
        checked={checked}
        disabled={locked}
        onChange={(event) => onChange?.(event.target.checked)}
      />
    </label>
  );
}
