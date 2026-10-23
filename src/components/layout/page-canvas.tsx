import { useText as useContentText } from "@/lib/i18n/use-text";
import type { ReactNode } from "react";
import { LiquidArt } from "@/components/layout/liquid-art";
import { cn } from "@/lib/utils";

export function PageCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  tone?: "linen" | "sea" | "clay" | "blush" | "plum";
}) {
  const localizeContent = useContentText();
  return (
    <div className={cn("page-canvas relative overflow-hidden", className)}>
      <LiquidArt />
      <div className="relative z-[1]">{localizeContent(children)}</div>
    </div>
  );
}