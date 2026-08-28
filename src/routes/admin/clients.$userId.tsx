import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminAddNote, adminGetClient } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/admin/clients/$userId")({ component: ClientDetail });

function ClientDetail() {
  const { userId } = Route.useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof adminGetClient>> | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => {
    void adminGetClient({ data: { userId } }).then(setData);
  }, [userId]);
  if (!data?.profile) return <p>No client found.</p>;
  const p = data.profile;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-4xl">{p.display_name ?? "Member"}</h1>
      <p className="text-sm text-white/60">
        {p.email ?? ""} · {p.stage ?? "no stage"} · {p.location ?? ""}
      </p>
      <section>
        <h2 className="font-display text-2xl">Appointments</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {data.appointments.map((a) => (
            <li key={a.id}>
              {a.type} · {new Date(a.starts_at).toLocaleString()} · {a.status}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl">Binding uploads</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {data.uploads.map((u) => (
            <li key={u.id}>
              {u.angle} · {new Date(u.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl">Private notes</h2>
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void adminAddNote({ data: { userId, note } }).then(() => {
              setNote("");
              void adminGetClient({ data: { userId } }).then(setData);
            });
          }}
        >
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
          <Button type="submit">Save note</Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {data.notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-white/6 p-3">
              {n.note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
