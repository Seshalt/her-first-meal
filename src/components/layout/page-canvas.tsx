import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageCanvas({
  children,
  className,
  tone = "linen",
}: {
  children: ReactNode;
  className?: string;
  tone?: "linen" | "sea" | "clay" | "blush" | "plum";
}) {
  const wash =
    tone === "sea"
      ? "bg-wash-sea"
      : tone === "clay"
        ? "bg-wash-clay"
        : tone === "blush"
          ? "bg-wash-blush"
          : tone === "plum"
            ? "bg-wash-plum"
            : "bg-wash-linen";
  return (
    <div className={cn("page-canvas relative overflow-hidden", wash, className)}>
      <div className="page-orbs" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="grain pointer-events-none absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
}
