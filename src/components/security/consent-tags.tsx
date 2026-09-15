import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { readCookieChoices } from "@/lib/cookies";
import { recordPublicVisit } from "@/lib/server/public";

/** Runs public analytics only after the visitor allows it. */
export function ConsentTags() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let lastRecorded = "";

    const maybeRecord = () => {
      const choices = readCookieChoices();
      if (!choices?.analytics) return;
      if (lastRecorded === pathname) return;
      lastRecorded = pathname;
      void recordPublicVisit({ data: { path: pathname } }).catch(() => undefined);
    };

    maybeRecord();
    window.addEventListener("hfm-cookie-choices", maybeRecord);
    return () => window.removeEventListener("hfm-cookie-choices", maybeRecord);
  }, [pathname]);

  return null;
}
