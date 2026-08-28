import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminListClients } from "@/lib/server/admin";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/clients")({ component: Clients });

function Clients() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminListClients>>>([]);
  useEffect(() => {
    const t = setTimeout(() => {
      void adminListClients({ data: { q } }).then(setRows);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div>
      <h1 className="font-display text-4xl">Clients</h1>
      <Input className="mt-4 max-w-sm bg-white/8 text-[#efe6d6]" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-6 divide-y divide-white/10">
        {rows.length === 0 ? (
          <li className="py-6 text-sm text-white/50">No members yet.</li>
        ) : (
          rows.map((r) => (
            <li key={r.user_id} className="py-4">
              <Link to="/admin/clients/$userId" params={{ userId: r.user_id }} className="block hover:text-white">
                <p className="font-medium">{r.display_name || "Unnamed"}</p>
                <p className="text-sm text-white/50">
                  {r.email} · {r.stage ?? "no stage"} · {r.onboarding_completed ? "onboarded" : "in onboarding"}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
