import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pill, RoomBody, RoomHero } from "@/components/layout/room-hero";
import { bookAppointment, cancelAppointment, listMyAppointments, listOpenSlots } from "@/lib/server/appointments";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/app/appointments")({ component: Appointments });

function Appointments() {
  const [mine, setMine] = useState<Awaited<ReturnType<typeof listMyAppointments>> | null>(null);
  const [open, setOpen] = useState<Awaited<ReturnType<typeof listOpenSlots>> | null>(null);
  const [type, setType] = useState("consultation");

  function reload() {
    void listMyAppointments().then(setMine);
    void listOpenSlots({ data: {} }).then(setOpen);
  }
  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <RoomHero
        kicker="The only extra"
        title="A time with Maat"
        body="Membership already includes the house. Holding a live session is the only additional charge — it is billed when you take the time."
        src="/images/family-table.jpg"
        alt="A family sharing a meal at the kitchen table"
        tone="gold"
      />
      <RoomBody>
        <p className="rounded-2xl bg-wash-blush px-5 py-4 text-sm leading-relaxed text-blush-deep">
          {formatCurrency(open?.meetingPriceCents ?? 12000)} per session. Nothing else in the house is billed on top
          of membership.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {(open?.types ?? mine?.types ?? []).map((t) => (
            <Pill key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
              {t.label}
            </Pill>
          ))}
        </div>
        <h2 className="mt-16 font-display text-4xl md:text-5xl">Open times</h2>
        <div className="editorial-rule mt-6" />
        <ul className="mt-2">
          {(open?.slots ?? []).length === 0 ? (
            <li className="py-8 text-lg text-ink-soft">No open times in the next two weeks.</li>
          ) : (
            (open?.slots ?? []).map((s) => (
              <li key={s.startsAt} className="border-b border-border">
                <button
                  type="button"
                  className="flex min-h-16 w-full items-center justify-between py-5 text-left"
                  onClick={() =>
                    void bookAppointment({ data: { type, startsAt: s.startsAt } }).then((res) => {
                      if (!res.ok) toast.error(res.error);
                      else toast.success(`Held for ${formatCurrency(res.chargedCents || open?.meetingPriceCents || 12000)}. That time is no longer open.`);
                      reload();
                    })
                  }
                >
                  <span className="font-display text-2xl">{new Date(s.startsAt).toLocaleString()}</span>
                  <span className="text-sm text-primary">Hold this time</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <h2 className="mt-20 font-display text-4xl md:text-5xl">Yours</h2>
        <div className="editorial-rule mt-6" />
        <ul>
          {(mine?.appointments ?? []).length === 0 ? (
            <li className="py-8 text-lg text-ink-soft">Nothing booked yet.</li>
          ) : (
            (mine?.appointments ?? []).map((a) => (
              <li key={a.id} className="border-b border-border py-8">
                <p className="font-display text-3xl capitalize">{a.type.replace("-", " ")}</p>
                <p className="mt-2 text-ink-soft">
                  {new Date(a.starts_at).toLocaleString()} · {a.status}
                </p>
                {a.zoom_link ? (
                  <a href={a.zoom_link} className="mt-3 inline-block text-sm text-primary" target="_blank" rel="noreferrer">
                    Join Zoom
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Zoom link appears when the owner adds it.</p>
                )}
                {a.status === "confirmed" ? (
                  <Button size="sm" variant="ghost" className="mt-3" onClick={() => void cancelAppointment({ data: { id: a.id } }).then(reload)}>
                    Cancel
                  </Button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </RoomBody>
    </div>
  );
}
