import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, isPublicPath, prefersReducedMotion, ScrollTrigger } from "@/lib/motion/gsap";

export function SmoothScroll() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion() || !isPublicPath(pathname)) {
      document.documentElement.classList.remove("has-lenis");
      ScrollTrigger.getAll().forEach((t) => t.kill());
      return;
    }

    document.documentElement.classList.add("has-lenis");

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.12,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.05,
      wheelMultiplier: 0.9,
      overscroll: false,
      respectReducedMotion: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    const boot = window.setTimeout(refresh, 80);

    return () => {
      window.clearTimeout(boot);
      window.removeEventListener("resize", refresh);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      document.documentElement.classList.remove("has-lenis");
    };
  }, [pathname]);

  return null;
}
