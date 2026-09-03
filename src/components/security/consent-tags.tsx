import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { readCookieChoices } from "@/lib/cookies";
import { recordPublicVisit } from "@/lib/server/public";

/** Runs only after the visitor allows analytics or ads. */
export function ConsentTags() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const choices = readCookieChoices();
    if (!choices) return;
    if (choices.analytics) {
      void recordPublicVisit({ data: { path: pathname } }).catch(() => undefined);
    }
  }, [pathname]);

  return null;
}
