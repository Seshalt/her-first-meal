import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "hfm-cookie-ok";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(!window.localStorage.getItem(KEY));
  }, []);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4">
      <div className="glass-panel mx-auto flex max-w-3xl flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-ink">
          This house uses only the cookies needed to keep you signed in and to remember this choice. Read the{" "}
          <Link to="/privacy" className="underline">
            privacy note
          </Link>
          .
        </p>
        <button
          type="button"
          className="h-11 shrink-0 rounded-full bg-sea px-5 text-sm text-paper"
          onClick={() => {
            window.localStorage.setItem(KEY, "1");
            setOpen(false);
          }}
        >
          I understand
        </button>
      </div>
    </div>
  );
}
