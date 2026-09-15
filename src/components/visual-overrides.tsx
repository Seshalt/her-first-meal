import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { getVisualOverrides, type VisualOverride } from "@/lib/server/visual-overrides";

function applyOne(edit: VisualOverride) {
  let element: Element | null = null;
  try {
    element = document.querySelector(edit.selector);
  } catch {
    return;
  }
  if (!element) return;
  if (edit.kind === "text") {
    element.textContent = edit.value;
    element.setAttribute("data-hfm-visual-overridden", "text");
    return;
  }
  if (edit.kind === "image" && element instanceof HTMLImageElement) {
    element.src = edit.value;
    if (typeof edit.alt === "string") element.alt = edit.alt;
    element.setAttribute("data-hfm-visual-overridden", "image");
    return;
  }
  if (edit.kind === "link" && element instanceof HTMLAnchorElement) {
    element.href = edit.value;
    element.setAttribute("data-hfm-visual-overridden", "link");
  }
}

export function VisualOverrides() {
  const pathname = useLocation({ select: (location) => location.pathname });

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/app") || pathname.startsWith("/api")) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let queued = 0;

    void getVisualOverrides({ data: { page: pathname } })
      .then((overrides) => {
        if (cancelled) return;
        const edits = Object.values(overrides);
        const applyAll = () => {
          for (const edit of edits) applyOne(edit);
        };
        applyAll();
        observer = new MutationObserver(() => {
          window.clearTimeout(queued);
          queued = window.setTimeout(applyAll, 24);
        });
        observer.observe(document.body, { subtree: true, childList: true });
      })
      .catch(() => {
        // Public pages stay usable even if the optional visual override layer is unavailable.
      });

    return () => {
      cancelled = true;
      window.clearTimeout(queued);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
