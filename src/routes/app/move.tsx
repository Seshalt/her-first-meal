import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pill, RoomBody, RoomHero } from "@/components/layout/room-hero";
import { WORKOUTS, type Stage } from "@/lib/content/catalog";
import { logWorkout } from "@/lib/server/binding";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/move")({ component: Move });

function Move() {
  const [stage, setStage] = useState<Stage | "any">("any");
  const [energy, setEnergy] = useState<"any" | "low" | "medium" | "steady">("any");
  const filtered = useMemo(
    () =>
      WORKOUTS.filter((w) => (stage === "any" || w.stage.includes(stage)) && (energy === "any" || w.energy === energy)),
    [stage, energy],
  );

  return (
    <div>
      <RoomHero
        kicker="Movement"
        title="Optional. Never punitive."
        body="Stop for pain, bleeding, or dizziness. This is not a replacement for your clinician."
        src="/images/movement.jpg"
        alt="A pregnant woman stretching on a mat"
        tone="sea"
      />
      <RoomBody>
        <div className="flex flex-wrap gap-2">
          {(["any", "trying", "first", "second", "third", "postpartum"] as const).map((s) => (
            <Pill key={s} active={stage === s} onClick={() => setStage(s)}>
              {s}
            </Pill>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["any", "low", "medium", "steady"] as const).map((e) => (
            <Pill key={e} active={energy === e} onClick={() => setEnergy(e)}>
              {e} energy
            </Pill>
          ))}
        </div>
        <ul className="mt-6">
          {filtered.map((w) => (
            <li key={w.id} className="border-b border-border py-12">
              <p className="text-xs uppercase tracking-[0.28em] text-earth">
                {w.minutes} min · {w.category}
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">{w.title}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{w.summary}</p>
              <ol className="mt-6 max-w-xl list-decimal space-y-2 pl-5 text-base">
                {w.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-5 max-w-xl text-sm text-earth">{w.caution}</p>
              <Button
                size="sm"
                className="mt-6"
                onClick={() => void logWorkout({ data: { workoutId: w.id, minutes: w.minutes } }).then(() => toast.success("Marked complete."))}
              >
                I finished this
              </Button>
            </li>
          ))}
        </ul>
      </RoomBody>
    </div>
  );
}
