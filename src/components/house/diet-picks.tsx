import { Pill, type RoomTone } from "@/components/layout/room-hero";
import { DIETS, JOIN_DIETS_STORAGE, type DietFlag } from "@/lib/content/catalog";

export function rememberJoinDiets(diets: string[]) {
  try {
    sessionStorage.setItem(JOIN_DIETS_STORAGE, JSON.stringify(diets));
  } catch {
    /* private mode */
  }
}

export function readJoinDiets(): DietFlag[] {
  try {
    const raw = sessionStorage.getItem(JOIN_DIETS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const allowed = new Set(DIETS.map((d) => d.id));
    return parsed.filter((d): d is DietFlag => typeof d === "string" && allowed.has(d as DietFlag));
  } catch {
    return [];
  }
}

export function DietPicks({
  value,
  onChange,
  tone = "clay",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  tone?: RoomTone;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DIETS.map((d) => (
        <Pill
          key={d.id}
          tone={tone}
          active={value.includes(d.id)}
          onClick={() =>
            onChange(value.includes(d.id) ? value.filter((x) => x !== d.id) : [...value, d.id])
          }
        >
          {d.label}
        </Pill>
      ))}
    </div>
  );
}
