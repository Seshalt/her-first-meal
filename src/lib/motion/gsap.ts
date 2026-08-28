import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
}

export { gsap, ScrollTrigger };

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export function isDesktopLayout() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 1024px)").matches;
}

export function isPublicPath(pathname: string) {
  return !pathname.startsWith("/app") && !pathname.startsWith("/admin");
}
