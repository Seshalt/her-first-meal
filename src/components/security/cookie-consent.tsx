import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DEFAULT_CHOICES,
  readCookieChoices,
  writeCookieChoices,
  type CookieChoices,
} from "@/lib/cookies";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [choices, setChoices] = useState<CookieChoices>(DEFAULT_CHOICES);

  useEffect(() => {
    const existing = readCookieChoices();
    if (!existing) setOpen(true);
    else setChoices(existing);
    const reopen = () => setOpen(true);
    window.addEventListener("hfm-cookies-open", reopen);
    return () => window.removeEventListener("hfm-cookies-open", reopen);
  }, []);

  if (!open) return null;

  function save(next: CookieChoices) {
    writeCookieChoices(next);
    setChoices(next);
    setOpen(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4">
      <div className="glass-panel mx-auto max-w-3xl p-5 md:p-6">
        <p className="font-display text-2xl text-ink">Cookies in this house</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Sign-in cookies stay on so a member can move through the rooms. Everything else waits for her word.{" "}
          <Link to="/privacy" className="underline">
            Privacy
          </Link>
        </p>
        <ul className="mt-4 space-y-3 text-sm text-ink">
          <li className="flex items-start justify-between gap-4">
            <span>
              <strong>Necessary.</strong> Keep her signed in. Always on.
            </span>
            <span className="text-ink/40">On</span>
          </li>
          <Toggle
            label="Analytics"
            detail="Count visits so we can see which rooms are used."
            checked={choices.analytics}
            onChange={(analytics) => setChoices((c) => ({ ...c, analytics }))}
          />
          <Toggle
            label="Ads"
            detail="Remember if she arrived from an ad, and measure those campaigns."
            checked={choices.ads}
            onChange={(ads) => setChoices((c) => ({ ...c, ads }))}
          />
          <Toggle
            label="Preferences"
            detail="Remember theme and this banner choice on her next visit."
            checked={choices.preferences}
            onChange={(preferences) => setChoices((c) => ({ ...c, preferences }))}
          />
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="h-11 rounded-full bg-sea px-5 text-sm text-paper" onClick={() => save({ ...choices, necessary: true })}>
            Save choices
          </button>
          <button
            type="button"
            className="h-11 rounded-full bg-ink px-5 text-sm text-paper"
            onClick={() => save({ necessary: true, analytics: true, ads: true, preferences: true })}
          >
            Accept all
          </button>
          <button type="button" className="h-11 rounded-full px-5 text-sm text-ink" onClick={() => save(DEFAULT_CHOICES)}>
            Necessary only
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <li className="flex items-start justify-between gap-4">
      <span>
        <strong>{label}.</strong> {detail}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`h-7 w-12 shrink-0 rounded-full ${checked ? "bg-sea" : "bg-ink/20"}`}
        onClick={() => onChange(!checked)}
      >
        <span className={`block size-5 rounded-full bg-paper transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </li>
  );
}
