import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminBlockDate, adminCalendar, adminUpdateAppointment } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/admin/calendar")({ component: CalendarPage });

function CalendarPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof adminCalendar>> | null>(null);
  const [day, setDay] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    void adminCalendar().then(setData);
  }, []);
  return (
    <div>
      <h1 className="font-display text-4xl">Calendar</h1>
      <p className="mt-2 text-sm text-white/60">Internal booking only. Double-booking is blocked at the database.</p>
      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void adminBlockDate({ data: { day, reason } }).then(() => adminCalendar().then(setData));
        }}
      >
        <div>
          <Label className="text-[#efe6d6]">Block a date</Label>
          <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
        </div>
        <Input placeholder="Holiday / travel" value={reason} onChange={(e) => setReason(e.target.value)} className="max-w-xs bg-white/8 text-[#efe6d6]" />
        <Button type="submit">Block</Button>
      </form>
      <h2 className="mt-10 font-display text-2xl">Appointments</h2>
      <ul className="mt-4 space-y-3">
        {(data?.appointments ?? []).map((a) => (
          <li key={a.id} className="rounded-2xl bg-white/6 p-4 text-sm">
            <p>
              {a.type} · {new Date(a.starts_at).toLocaleString()} · {a.status}
            </p>
            <form
              className="mt-2 flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void adminUpdateAppointment({
                  data: {
                    id: a.id,
                    zoomLink: String(fd.get("zoom") || ""),
                    ownerNotes: String(fd.get("notes") || ""),
                  },
                }).then(() => adminCalendar().then(setData));
              }}
            >
              <Input name="zoom" defaultValue={a.zoom_link ?? ""} placeholder="Zoom link" className="bg-white/8 text-[#efe6d6]" />
              <Input name="notes" defaultValue={a.owner_notes ?? ""} placeholder="Notes" className="bg-white/8 text-[#efe6d6]" />
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
