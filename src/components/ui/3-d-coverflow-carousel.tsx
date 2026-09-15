import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type CoverFlowItem = {
  id: string;
  tag?: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  alt: string;
  meta?: string;
  ctaText?: string;
};

export type CoverFlowCarouselProps = {
  items: CoverFlowItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CoverFlowItem) => void;
  onActiveChange?: (item: CoverFlowItem) => void;
};

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

export function CoverFlowCarousel({
  items,
  sectionLabel = "RECIPE LIBRARY",
  autoplay = true,
  autoplayDelay = 5200,
  className,
  onCtaClick,
  onActiveChange,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef(0);
  const total = items.length;
  const current = items[currentIndex];

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 760px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCompact(compactQuery.matches);
      setReduceMotion(motionQuery.matches);
    };
    sync();
    compactQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      compactQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (current) onActiveChange?.(current);
  }, [current, onActiveChange]);

  useEffect(() => {
    if (!autoplay || isHovered || reduceMotion || total <= 1) return;
    const timer = window.setInterval(() => setCurrentIndex((index) => (index + 1) % total), autoplayDelay);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, reduceMotion, total]);

  const visibleDots = useMemo(() => {
    if (total <= 9) return items.map((_, index) => index);
    const indexes = new Set<number>();
    for (let delta = -3; delta <= 3; delta += 1) indexes.add((currentIndex + delta + total) % total);
    return [...indexes].sort((a, b) => a - b);
  }, [currentIndex, items, total]);

  if (!items.length) return null;

  const next = () => setCurrentIndex((index) => (index + 1) % total);
  const previous = () => setCurrentIndex((index) => (index - 1 + total) % total);
  const goTo = (index: number) => setCurrentIndex((index + total) % total);

  return (
    <section
      className={cn("relative isolate w-full overflow-hidden rounded-[34px] border border-white/10", className)}
      style={{
        minHeight: compact ? "620px" : "760px",
        background:
          "radial-gradient(circle at 50% 20%, rgba(47,132,120,.26), transparent 34%), radial-gradient(circle at 78% 84%, rgba(211,163,77,.13), transparent 30%), #07110e",
        color: "#fff8ed",
      }}
      aria-roledescription="carousel"
      aria-label={sectionLabel}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          previous();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          next();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? 0;
      }}
      onTouchEnd={(event) => {
        const x = event.changedTouches[0]?.clientX ?? touchStartX.current;
        const diff = x - touchStartX.current;
        if (Math.abs(diff) > 44) {
          if (diff < 0) next();
          else previous();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          key={current?.image}
          src={current?.image}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-20 blur-3xl"
          style={{ transition: "opacity 700ms ease" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,17,14,.28)_0%,rgba(7,17,14,.82)_46%,rgba(4,10,8,.98)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d3a34d]/60 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-7xl flex-col items-center px-3 py-10 sm:px-6 sm:py-12">
        <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d3a34d]">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#d3a34d]" />
          <span>{sectionLabel}</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#d3a34d]" />
        </div>

        <div
          className="relative flex w-full flex-1 items-center justify-center"
          style={{ minHeight: compact ? "450px" : "530px", perspective: compact ? "1050px" : "1500px" }}
        >
          {items.map((item, index) => {
            const raw = (index - currentIndex + total) % total;
            const signed = raw > total / 2 ? raw - total : raw;
            const distance = Math.abs(signed);
            const active = signed === 0;
            const visible = distance <= 2;
            const x = compact
              ? signed === 0
                ? 0
                : signed * (distance === 1 ? 190 : 155)
              : signed === 0
                ? 0
                : signed * (distance === 1 ? 300 : 245);
            const scale = active ? 1 : distance === 1 ? (compact ? 0.78 : 0.86) : compact ? 0.62 : 0.68;
            const rotation = active ? 0 : signed > 0 ? -29 - distance * 4 : 29 + distance * 4;
            const opacity = active ? 1 : distance === 1 ? 0.66 : distance === 2 ? 0.34 : 0;
            const filter = active ? "brightness(1)" : distance === 1 ? "brightness(.68)" : "brightness(.46) blur(1px)";

            return (
              <article
                key={item.id}
                aria-hidden={!visible}
                className="absolute overflow-hidden border border-white/15 bg-[#101814]"
                style={{
                  width: compact ? "min(78vw, 318px)" : "340px",
                  height: compact ? "440px" : "500px",
                  borderRadius: compact ? "24px" : "28px",
                  transform: `translateX(${x}px) scale(${scale}) rotateY(${rotation}deg)`,
                  opacity,
                  zIndex: active ? 40 : 30 - distance * 8,
                  filter,
                  transformOrigin: "center center",
                  transition: reduceMotion ? "opacity 140ms ease" : "all 760ms cubic-bezier(.22,1,.36,1)",
                  boxShadow: active
                    ? "0 34px 80px rgba(0,0,0,.62), 0 0 0 1px rgba(211,163,77,.16), 0 0 60px rgba(47,132,120,.14)"
                    : "0 18px 42px rgba(0,0,0,.38)",
                  pointerEvents: visible ? "auto" : "none",
                }}
                onClick={() => {
                  if (!active) goTo(index);
                }}
              >
                <img
                  src={item.image}
                  alt={active ? item.alt : ""}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={distance <= 1 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.18)_0%,rgba(0,0,0,.06)_27%,rgba(5,12,9,.64)_62%,rgba(3,8,6,.98)_100%)]" />
                <div
                  className="relative z-10 flex h-full flex-col p-5 text-center"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active ? "translateY(0)" : "translateY(14px)",
                    transition: reduceMotion ? "none" : "opacity 420ms ease 120ms, transform 420ms ease 120ms",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em]">
                    <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-white/85 backdrop-blur-md">
                      {item.tag}
                    </span>
                    {item.meta ? <span className="rounded-full bg-[#fff8ed]/90 px-3 py-1.5 text-[#10281f]">{item.meta}</span> : null}
                  </div>

                  <div className="mt-auto flex flex-col items-center pb-1">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d3a34d]">{item.subtitle}</p>
                    <h3 className="max-w-[290px] font-display text-[clamp(2rem,4vw,2.65rem)] leading-[.92] text-[#fff8ed] [text-shadow:0_4px_18px_rgba(0,0,0,.78)]">
                      {item.title}
                    </h3>
                    <div className="my-4 h-px w-12 bg-[#d3a34d]" />
                    <p className="max-w-[285px] text-sm leading-relaxed text-white/82 [text-shadow:0_2px_8px_rgba(0,0,0,.75)]">
                      {item.description}
                    </p>
                    <button
                      type="button"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#d3a34d] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#10281f] shadow-[0_12px_28px_rgba(0,0,0,.28)] transition hover:-translate-y-0.5 hover:bg-[#efbf63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff8ed] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07110e]"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCtaClick?.(item);
                      }}
                    >
                      {item.ctaText ?? "Open recipe"}
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          <button
            type="button"
            aria-label="Previous recipe"
            className="absolute left-2 top-1/2 z-50 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d3a34d] sm:left-5"
            onClick={previous}
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next recipe"
            className="absolute right-2 top-1/2 z-50 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white shadow-xl backdrop-blur-md transition hover:scale-105 hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d3a34d] sm:right-5"
            onClick={next}
          >
            <ChevronRightIcon />
          </button>
        </div>

        <div className="mt-4 flex max-w-full items-center justify-center gap-1.5 overflow-hidden px-2" aria-label="Recipe carousel position">
          {visibleDots.map((index) => (
            <button
              key={items[index]?.id ?? index}
              type="button"
              aria-label={`Go to recipe ${index + 1}: ${items[index]?.title ?? ""}`}
              aria-current={index === currentIndex ? "true" : undefined}
              onClick={() => goTo(index)}
              className="h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fff8ed]"
              style={{ width: index === currentIndex ? 28 : 8, background: index === currentIndex ? "#d3a34d" : "rgba(255,248,237,.24)" }}
            />
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-white/50">Swipe, use the arrows, or press ← →. Hovering pauses the rotation.</p>
      </div>
    </section>
  );
}

export default CoverFlowCarousel;
