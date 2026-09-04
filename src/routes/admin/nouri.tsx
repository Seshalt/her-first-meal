import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminDashboard, adminSaveSettings } from "@/lib/server/admin";
import { askAtelier } from "@/lib/server/nouri";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/admin/nouri")({ component: AdminNouri });

function AdminNouri() {
  const [notes, setNotes] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void adminDashboard().then((d) => setNotes(d.settings?.nouriSystemNotes ?? ""));
  }, []);
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl">Nouri</h1>
      <p className="mt-2 text-sm text-white/60">
        ChatGPT writes with the house voice here and in the member rooms. Add OPENAI_API_KEY in Vercel. Knowledge
        below is what Nouri may use. She never diagnoses.
      </p>
      <Textarea className="mt-6 min-h-48 bg-white/8 text-[#efe6d6]" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button
        className="mt-4"
        onClick={() => void adminSaveSettings({ data: { nouriNotes: notes } }).then(() => toast.success("Nouri updated."))}
      >
        Save Nouri notes
      </Button>
      <h2 className="mt-12 font-display text-2xl">Ask the kitchen</h2>
      <Textarea className="mt-4 min-h-28 bg-white/8 text-[#efe6d6]" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Write a new postpartum breakfast, or help me answer a member." />
      <Button
        className="mt-3"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void askAtelier({ data: { message: question } })
            .then((r) => setAnswer(r.text))
            .catch((err) => toast.error(err instanceof Error ? err.message : "ChatGPT did not answer."))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Listening…" : "Ask ChatGPT"}
      </Button>
      {answer ? <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-white/80">{answer}</p> : null}
    </div>
  );
}