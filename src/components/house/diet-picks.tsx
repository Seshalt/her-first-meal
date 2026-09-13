import { Pill } from "@/components/layout/room-hero";
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
    <div className="flex flex-wrap gap-2">
      {DIETS.map((d) => {
        const key = `diet.${d.id}` as MsgKey;
        return (
          <Pill
            key={d.id}
            active={value.includes(d.id)}
            onClick={() =>
              onChange(value.includes(d.id) ? value.filter((x) => x !== d.id) : [...value, d.id as DietFlag])
            }
          >
            {t(key)}
          </Pill>
        );
      })}
    </div>
  );
}
