import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ParallaxFrame({
  src,
  alt,
  speed = 0.28,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  imgClassName?: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      const parent = img.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - viewH / 2) / viewH;
      const shift = Math.max(-72, Math.min(72, progress * speed * 140));
      img.style.transform = `translate3d(0, ${shift}px, 0) scale(1.12)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, src]);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn("media absolute inset-x-0 -top-[12%] h-[124%] w-full object-cover will-change-transform", imgClassName)}
      />
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
