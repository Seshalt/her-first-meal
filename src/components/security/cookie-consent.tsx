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
    <aside
      aria-label="Cookie preferences"
      className="fixed bottom-2 left-2 right-2 z-[120] rounded-[16px] border border-white/12 bg-ink/96 px-3 py-2.5 text-paper shadow-[0_20px_55px_-28px_rgba(0,0,0,.72)] backdrop-blur-xl sm:bottom-5 sm:left-auto sm:right-5 sm:w-[25rem] sm:p-4"
    >
      <div className="flex items-center justify-between gap-3 sm:items-start">
        <div className="min-w-0">
          <p className="text-xs font-semibold sm:text-sm">Privacy choices</p>
          <p className="hidden mt-1 text-xs leading-5 text-paper/68 sm:block">
            Required cookies keep sign-in working. Analytics stays off unless you allow it.
          </p>
        </div>
        <Link to="/cookies" className="shrink-0 text-[11px] text-gold underline underline-offset-4 sm:text-xs">Details</Link>
      </div>
      <div className="mt-2 flex gap-2 sm:mt-3 sm:flex-wrap">
        <button
          type="button"
          className="min-h-9 flex-1 rounded-full border border-paper/22 px-2.5 text-[11px] font-medium text-paper transition hover:bg-paper/10 active:scale-95 sm:min-h-10 sm:px-3 sm:text-xs"
          onClick={() => {
            writeCookieChoices(DEFAULT_CHOICES);
            setOpen(false);
          }}
        >
          Necessary only
        </button>
        <button
          type="button"
          className="min-h-9 flex-1 rounded-full bg-gold px-2.5 text-[11px] font-semibold text-ink transition hover:bg-paper active:scale-95 sm:min-h-10 sm:px-3 sm:text-xs"
          onClick={() => {
            writeCookieChoices(ALL_ALLOWED_CHOICES);
            setOpen(false);
          }}
        >
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
