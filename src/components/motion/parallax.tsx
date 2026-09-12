import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ParallaxFrame({
  src,
  alt,
  speed = 0.35,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  imgClassName?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      if (reduced) {
        img.style.transform = "translate3d(0,0,0) scale(1.08)";
        return;
      }
      const r = wrap.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const p = (r.top + r.height / 2 - view / 2) / view;
      const y = Math.max(-240, Math.min(240, p * speed * 520));
      img.style.transform = `translate3d(0, ${y}px, 0) scale(1.32)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, src]);

  return (
    <div ref={wrapRef} className={cn("parallax-frame", className)}>
      <img ref={imgRef} src={src} alt={alt} className={cn("parallax-frame-img", imgClassName)} />
    </div>
  );
}

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("reveal-wait", className)}>
      {children}
    </div>
  );
}
