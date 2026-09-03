import { useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

export function ScrollReset() {
  const pathname = useRouterState({ select: (s) => s.location.pathname + s.location.searchStr });
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" in window ? "instant" : "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
}
