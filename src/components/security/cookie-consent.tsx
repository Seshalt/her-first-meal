import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { readCookieChoices, writeCookieChoices } from "@/lib/cookies";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readCookieChoices()) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl bg-ink px-4 py-3 text-paper shadow-lg">
        <p className="text-sm leading-snug text-paper/85">
          We use cookies. To see what we use them for, read{" "}
          <Link to="/privacy" className="underline decoration-paper/40 underline-offset-2">
            Privacy
          </Link>{" "}
          or{" "}
          <Link to="/terms" className="underline decoration-paper/40 underline-offset-2">
            Terms
          </Link>
          .
        </p>
        <button
          type="button"
          className="h-10 shrink-0 rounded-full bg-paper px-4 text-sm text-ink"
          onClick={() => {
            writeCookieChoices();
            setOpen(false);
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
