import { useText as useContentText } from "@/lib/i18n/use-text";
import type { ReactNode } from "react";
import { Kicker } from "@/components/layout/room-hero";

export function PageIntro({
  kicker,
  title,
  body,
  children,
  tone = "earth",
}: {
  kicker?: string;
  title: string;
  body?: string;
  children?: ReactNode;
  tone?: "earth" | "clay" | "blush" | "plum" | "sea" | "gold";
}) {
  const localizeContent = useContentText();
  const rule =
    tone === "clay"
      ? "editorial-rule editorial-rule-clay"
      : tone === "blush"
        ? "editorial-rule editorial-rule-blush"
        : tone === "plum"
          ? "editorial-rule editorial-rule-plum"
          : tone === "sea"
            ? "editorial-rule editorial-rule-sea"
            : "editorial-rule";
  return (
    <header className="max-w-3xl">
      {localizeContent(kicker ? <Kicker tone={tone}>{localizeContent(kicker)}</Kicker> : null)}
      <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.02]">{localizeContent(title)}</h1>
      {localizeContent(body ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">{localizeContent(body)}</p> : null)}
      <div className={`${rule} mt-8`} />
      {localizeContent(children)}
    </header>
  );
}
