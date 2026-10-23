import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pill, RoomBody, RoomHero } from "@/components/layout/room-hero";
import { WORKOUTS, type Stage } from "@/lib/content/catalog";
import { altFor } from "@/lib/landing";
import { logWorkout } from "@/lib/server/binding";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/move")({ component: Move });

function Move() {
  const localizeContent = useContentText();
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
        kicker={localizeContent("Movement")}
        title={localizeContent("Optional. Never punitive.")}
        body={localizeContent("Stop for pain, bleeding, or dizziness. This is not a replacement for your clinician.")}
        src="/images/movement.jpg"
        alt={localizeContent(altFor("/images/movement.jpg"))}
        tone="sea"
      />
      <RoomBody>
        <div className="flex flex-wrap gap-2">
          {localizeContent((["any", "trying", "first", "second", "third", "postpartum"] as const).map((s) => (
            <Pill key={s} active={stage === s} onClick={() => setStage(s)}>
              {localizeContent(s)}
            </Pill>
          )))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {localizeContent((["any", "low", "medium", "steady"] as const).map((e) => (
            <Pill key={e} active={energy === e} onClick={() => setEnergy(e)}>
              {localizeContent(e)} {localizeContent(" energy")}</Pill>
          )))}
        </div>
        <ul className="mt-6">
          {localizeContent(filtered.map((w) => (
            <li key={w.id} className="border-b border-border py-12">
              <p className="text-xs uppercase tracking-[0.28em] text-earth">
                {localizeContent(w.minutes)} {localizeContent(" min · ")}{localizeContent(w.category)}
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">{localizeContent(w.title)}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{localizeContent(w.summary)}</p>
              <ol className="mt-6 max-w-xl list-decimal space-y-2 pl-5 text-base">
                {localizeContent(w.steps.map((s) => (
                  <li key={s}>{localizeContent(s)}</li>
                )))}
              </ol>
              <p className="mt-5 max-w-xl text-sm text-earth">{localizeContent(w.caution)}</p>
              <Button
                size="sm"
                className="mt-6"
                onClick={() => void logWorkout({ data: { workoutId: w.id, minutes: w.minutes } }).then(() => toast.success(localizeContent("Marked complete.")))}
              >
                {localizeContent("I finished this")}</Button>
            </li>
          )))}
        </ul>
      </RoomBody>
    </div>
  );
}
