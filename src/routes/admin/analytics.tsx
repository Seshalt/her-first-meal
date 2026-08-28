import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminAnalytics, adminDashboard } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/analytics")({ component: Analytics });

function Analytics() {
  const [dash, setDash] = useState<Awaited<ReturnType<typeof adminDashboard>> | null>(null);
  const [extra, setExtra] = useState<Awaited<ReturnType<typeof adminAnalytics>> | null>(null);
  useEffect(() => {
    void adminDashboard().then(setDash);
    void adminAnalytics().then(setExtra);
  }, []);
  return (
    <div>
      <h1 className="font-display text-4xl">Analytics</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Stat label="Members" value={dash?.members} />
        <Stat label="Memberships" value={dash?.activeMemberships} />
        <Stat label="Nouri threads" value={dash?.nouriThreads} />
        <Stat label="Binding photos" value={dash?.bindingUploads} />
        <Stat label="Saved recipes" value={extra?.savedRecipes} />
        <Stat label="Workouts logged" value={extra?.workouts} />
      </div>
      <h2 className="mt-10 font-display text-2xl">By season</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(extra?.byStage ?? []).map((s) => (
          <li key={s.stage ?? "none"}>
            {s.stage ?? "unspecified"} · {s.count}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <article className="rounded-2xl bg-white/6 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</p>
      <p className="mt-2 font-display text-4xl tabular-nums">{value ?? "—"}</p>
    </article>
  );
}
