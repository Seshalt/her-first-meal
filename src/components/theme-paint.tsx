import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { studioCss, type StudioTheme } from "@/lib/theme-studio";
import { usePublicSite } from "@/lib/use-public-site";

export function ThemePaint() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { studio } = usePublicSite();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    applyStudio(studio);
  }, [studio, pathname]);
  return null;
}

export function applyStudio(studio: StudioTheme) {
  let el = document.getElementById("hfm-studio");
  if (!el) {
    el = document.createElement("style");
    el.id = "hfm-studio";
    document.head.appendChild(el);
  }
  el.textContent = studioCss(studio);
  const root = document.documentElement;
  root.dataset.hero = studio.layout.hero;
  root.dataset.photo = studio.layout.photo;
  root.dataset.spacing = studio.layout.spacing;
  root.dataset.corners = studio.layout.corners;
  root.dataset.glow = studio.layout.glow;
  root.dataset.nav = studio.layout.nav;
  root.dataset.pricing = studio.layout.pricing;
  root.dataset.width = studio.layout.width;
}
