import { useState } from "react";
import { cn } from "@/lib/utils";

export const GLASS_GOAL = 8;

export function Pour({
  count,
  onChange,
}: {
  count: number;
  onChange: (next: number) => void;
}) {
  const [stream, setStream] = useState(false);
  const filled = Math.min(GLASS_GOAL, Math.max(0, count));
  const full = filled >= GLASS_GOAL;

  function pour() {
    if (full) return;
    setStream(true);
    onChange(filled + 1);
    window.setTimeout(() => setStream(false), 520);
  }

  function onGlass(index: number) {
    if (index === filled - 1) {
      onChange(filled - 1);
      return;
    }
    if (index === filled) pour();
  }

  return (
    <section className="pour-hearth" aria-label="Hydration">
      <div className="pour-copy">
        <p className="text-xs uppercase tracking-[0.32em] text-aqua">Hydration</p>
        <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] text-paper">
          <span className="tabular-nums">{filled}</span>
          <span className="text-paper/55"> of {GLASS_GOAL}</span>
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/75">
          Pour a glass. Tap the last one to undo. No streak. No shame.
        </p>
      </div>

      <div className="pour-stage">
        <button
          type="button"
          className={cn("carafe", stream && "is-pouring", full && "is-resting")}
          onClick={pour}
          disabled={full}
          aria-label={full ? "Eight glasses already poured" : "Pour a glass"}
        >
          <Carafe pouring={stream} />
          <span className="carafe-label">{full ? "The pitcher is enough" : "Pour a glass"}</span>
        </button>
        {stream ? <span className="pour-stream" aria-hidden /> : null}
        <ol className="pour-row">
          {Array.from({ length: GLASS_GOAL }, (_, i) => {
            const isFull = i < filled;
            const isNext = i === filled;
            return (
              <li key={i}>
                <button
                  type="button"
                  className={cn("tumbler", isFull && "is-full", isNext && stream && "is-filling")}
                  onClick={() => onGlass(i)}
                  aria-label={
                    isFull
                      ? `Glass ${i + 1}, poured${i === filled - 1 ? ". Tap to undo" : ""}`
                      : isNext
                        ? `Pour glass ${i + 1}`
                        : `Glass ${i + 1}, waiting`
                  }
                  aria-pressed={isFull}
                >
                  <span className="tumbler-glass">
                    <span className="tumbler-water" />
                    <span className="tumbler-shine" />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Carafe({ pouring }: { pouring: boolean }) {
  return (
    <svg viewBox="0 0 88 128" className="carafe-svg" aria-hidden>
      <path
        d="M34 8h20c2 0 3 1.5 3 3.5V20H31v-8.5C31 9.5 32 8 34 8z"
        fill="currentColor"
        opacity="0.28"
      />
      <path
        d="M31 22h26l13 76a11 11 0 0 1-11 13H29a11 11 0 0 1-11-13L31 22z"
        fill="currentColor"
        opacity="0.16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M57 44c15 8 16 26 1 38"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="44" cy="92" rx="16" ry="7" fill="currentColor" opacity={pouring ? 0.25 : 0.4} />
    </svg>
  );
}
