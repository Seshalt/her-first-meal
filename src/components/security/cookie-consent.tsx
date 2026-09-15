import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ALL_ALLOWED_CHOICES, DEFAULT_CHOICES, readCookieChoices, writeCookieChoices } from "@/lib/cookies";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readCookieChoices()) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] px-3 pb-3">
      <div className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-ink px-4 py-4 text-paper shadow-2xl md:px-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="font-medium">Your privacy choices</p>
            <p className="mt-1 text-sm leading-6 text-paper/75">
              Required cookies keep sign-in and security working. Preference storage remembers choices like cookie settings and interface preferences. Optional analytics only runs if you allow it. Your actual member progress is saved to your account, not only to this browser.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-paper/65">
              <Link to="/cookies" className="underline underline-offset-2">Cookie settings</Link>
              <Link to="/privacy" className="underline underline-offset-2">Privacy</Link>
              <Link to="/terms" className="underline underline-offset-2">Terms</Link>
              <Link to="/accessibility" className="underline underline-offset-2">Accessibility</Link>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-full border border-paper/25 px-4 text-sm text-paper transition hover:bg-paper/10 active:scale-95"
              onClick={() => {
                writeCookieChoices(DEFAULT_CHOICES);
                setOpen(false);
              }}
            >
              Necessary only
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full bg-paper px-4 text-sm font-medium text-ink transition hover:-translate-y-0.5 active:scale-95"
              onClick={() => {
                writeCookieChoices(ALL_ALLOWED_CHOICES);
                setOpen(false);
              }}
            >
              Allow analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
