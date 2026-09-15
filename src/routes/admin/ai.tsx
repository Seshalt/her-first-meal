import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listHouseLetters, markLetterRead } from "@/lib/server/letters";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/ai")({ component: Letters });

function Letters() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listHouseLetters>>>([]);

  useEffect(() => {
    void listHouseLetters().then(setRows);
  }, []);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl">Letters</h1>
      <p className="mt-3 text-sm text-white/60">
        Members and visitors write Maat here. Open an email to reply from your own inbox.
      </p>
      <ul className="mt-10 space-y-4">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl bg-white/6 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">
              {new Date(row.created_at).toLocaleString()} · {row.locale ?? "en"} · {row.stage ?? "unspecified"}
            </p>
            <p className="mt-2 font-display text-2xl">{row.subject}</p>
            <p className="mt-1 text-sm text-white/70">{row.name} · {row.email}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/80">{row.body}</p>
            {!row.read_at ? (
              <Button
                className="mt-4"
                size="sm"
                variant="outline"
                onClick={() =>
                  void markLetterRead({ data: { id: row.id } }).then(() => {
                    toast.success("Marked read.");
                    void listHouseLetters().then(setRows);
                  })
                }
              >
                Mark read
              </Button>
            ) : (
              <p className="mt-3 text-xs text-white/40">Read</p>
            )}
          </li>
        ))}
        {!rows.length ? <p className="text-sm text-white/50">No letters yet.</p> : null}
      </ul>
    </div>
  );
}
