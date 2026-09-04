import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { readCookieChoices, writeCookieChoices } from "@/lib/cookies";
import { hasCookieNotice, rememberCookieNotice } from "@/lib/server/public";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readCookieChoices()) return;
    let live = true;
    void hasCookieNotice()
      .then((seen) => {
        if (!live) return;
        if (seen.remembered) {
          writeCookieChoices();
          return;
        }
        setOpen(true);
      })
      .catch(() => {
        if (live) setOpen(true);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!open) return null;

  function dismiss() {
    writeCookieChoices();
    void rememberCookieNotice().catch(() => undefined);
    setOpen(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-2xl bg-ink px-4 py-3 text-paper shadow-lg">
        <p className="text-sm leading-snug text-paper/85">
          This house uses cookies to keep you signed in and to remember this notice. Details live in{" "}
          <Link to="/terms" className="underline decoration-paper/40 underline-offset-2">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline decoration-paper/40 underline-offset-2">
            Privacy
          </Link>
          .
        </p>
        <button
          type="button"
          className="h-10 shrink-0 rounded-full bg-paper px-4 text-sm text-ink"
          onClick={dismiss}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
