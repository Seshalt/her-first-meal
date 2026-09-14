import { Check } from "lucide-react";
import { DIETS, type DietFlag } from "@/lib/content/catalog";
import { useT } from "@/lib/i18n/provider";
import type { MsgKey } from "@/lib/i18n/en";

export function DietPicks({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-3 [perspective:1000px] sm:grid-cols-3">
      {DIETS.map((d, index) => {
        const key = `diet.${d.id}` as MsgKey;
        const active = value.includes(d.id);
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange(active ? value.filter((x) => x !== d.id) : [...value, d.id as DietFlag])
            }
            className={`group relative min-h-28 overflow-hidden rounded-[24px] border p-4 text-left transition duration-300 [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "-translate-y-1 border-primary/40 bg-primary text-primary-foreground shadow-[0_20px_45px_-20px_rgba(25,87,78,.7)] [transform:rotateX(2deg)_rotateY(-2deg)]"
                : "border-border/80 bg-card/90 text-foreground shadow-[0_18px_45px_-28px_rgba(20,30,28,.45)] hover:-translate-y-1 hover:[transform:rotateX(2deg)_rotateY(2deg)]"
            }`}
          >
            <span className="absolute -right-7 -top-7 size-20 rounded-full bg-gold/20 blur-sm transition-transform duration-500 group-hover:scale-125" />
            <span className="text-[10px] uppercase tracking-[0.18em] opacity-60">Preference {index + 1}</span>
            <span className="mt-5 block font-display text-xl leading-none">{t(key)}</span>
            <span
              className={`absolute bottom-3 right-3 grid size-7 place-items-center rounded-full border transition ${
                active ? "border-white/50 bg-white/15" : "border-border bg-background/70"
              }`}
              aria-hidden="true"
            >
              {active ? <Check className="size-4" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
