import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("surface-card p-6 text-card-foreground", className)}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "sea",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "sea" | "gold" | "muted" | "clay" | "blush" | "plum" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        tone === "sea" && "bg-primary/12 text-sea-deep dark:text-aqua",
        tone === "gold" && "bg-accent/20 text-earth dark:text-accent",
        tone === "muted" && "bg-secondary text-muted-foreground",
        tone === "clay" && "bg-clay/15 text-clay-deep dark:text-clay-light",
        tone === "blush" && "bg-blush/15 text-blush-deep dark:text-blush-light",
        tone === "plum" && "bg-plum/15 text-plum dark:text-plum-light",
        className,
      )}
      {...props}
    />
  );
}
