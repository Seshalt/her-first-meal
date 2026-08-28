import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminDashboard } from "@/lib/server/admin";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminDashboard>> | null>(null);
  useEffect(() => {
    void adminDashboard().then(setData);
  }, []);
  if (!data) return <p>Loading atelier…</p>;
  const cards = [
    { label: "Members", value: data.members },
    { label: "Active memberships", value: data.activeMemberships },
    { label: "Upcoming visits", value: data.upcomingAppointments },
    { label: "Nouri threads", value: data.nouriThreads },
    { label: "Binding uploads", value: data.bindingUploads },
  ];
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/50">Owner atelier</p>
      <h1 className="mt-2 font-display text-4xl">Overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <article key={c.label} className="rounded-2xl bg-white/6 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">{c.label}</p>
            <p className="mt-2 font-display text-4xl tabular-nums">{c.value}</p>
          </article>
        ))}
      </div>
      {data.settings ? (
        <p className="mt-8 text-sm text-white/70">
          Membership {formatCurrency(data.settings.monthlyPriceCents)} / month ·{" "}
          {formatCurrency(data.settings.yearlyPriceCents)} / year.{" "}
          <Link to="/admin/business" className="underline">
            Edit pricing
          </Link>
          {" · "}
          <Link to="/admin/landing" className="underline">
            Edit website copy and photographs
          </Link>
        </p>
      ) : null}
    </div>
  );
}
