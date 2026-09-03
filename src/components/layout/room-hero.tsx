import type { ReactNode } from "react";
import { HouseMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export type RoomTone = "sea" | "clay" | "blush" | "plum" | "gold";

const VEIL: Record<RoomTone, string> = {
  sea: "hero-veil",
  clay: "hero-veil-clay",
  blush: "hero-veil-blush",
  plum: "hero-veil-plum",
  gold: "hero-veil-gold",
};

const KICKER: Record<RoomTone, string> = {
  sea: "text-aqua",
  clay: "text-clay-light",
  blush: "text-blush-light",
  plum: "text-plum-light",
  gold: "text-gold",
};

export function RoomHero({
  kicker,
  title,
  body,
  src,
  alt,
  tone = "sea",
}: {
  kicker?: string;
  title: string;
  body?: string;
  src: string;
  alt: string;
  tone?: RoomTone;
}) {
  return (
    <section className="relative min-h-[44vh] overflow-hidden text-paper md:min-h-[52vh]">
      <img src={src} alt={alt} className="media absolute inset-0 h-full w-full object-cover" />
      <div className={cn("pointer-events-none absolute inset-0", VEIL[tone])} />
      <div className="relative mx-auto flex min-h-[44vh] max-w-5xl flex-col justify-end px-5 pb-12 pt-20 md:min-h-[52vh] md:px-10 md:pb-16">
        <HouseMark className="mb-5 h-16 w-auto md:h-20" />
        {kicker ? <p className={cn("text-xs uppercase tracking-[0.32em]", KICKER[tone])}>{kicker}</p> : null}
        <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.95]">{title}</h1>
        {body ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/88 md:text-xl">{body}</p> : null}
      </div>
    </section>
  );
}

export function RoomBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-5xl px-5 py-14 md:px-10 md:py-20", className)}>{children}</div>;
}

export function Pill({
  active,
  children,
  onClick,
  tone = "sea",
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
  tone?: RoomTone;
}) {
  const activeClass =
    tone === "clay"
      ? "bg-clay text-paper"
      : tone === "blush"
        ? "bg-blush text-paper"
        : tone === "plum"
          ? "bg-plum text-paper"
          : tone === "gold"
            ? "bg-gold text-ink"
            : "bg-primary text-primary-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-full px-5 text-sm transition-colors",
        active ? activeClass : "bg-secondary text-foreground hover:bg-mist",
      )}
    >
      {children}
    </button>
  );
}

export function Kicker({
  children,
  tone = "earth",
  className,
}: {
  children: ReactNode;
  tone?: "earth" | "clay" | "blush" | "plum" | "sea" | "gold";
  className?: string;
}) {
  const color =
    tone === "clay"
      ? "text-clay"
      : tone === "blush"
        ? "text-blush"
        : tone === "plum"
          ? "text-plum"
          : tone === "sea"
            ? "text-sea"
            : tone === "gold"
              ? "text-gold"
              : "text-earth";
  return <p className={cn("text-xs uppercase tracking-[0.32em]", color, className)}>{children}</p>;
}
