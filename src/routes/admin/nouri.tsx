import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminDashboard, adminSaveSettings } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/admin/nouri")({ component: AdminNouri });

function AdminNouri() {
  const [notes, setNotes] = useState("");
  useEffect(() => {
    void adminDashboard().then((d) => setNotes(d.settings?.nouriSystemNotes ?? ""));
  }, []);
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl">Nouri</h1>
      <p className="mt-2 text-sm text-white/60">
        Knowledge Nouri is allowed to use. She never sees records you do not authorize here. Conversations stay on the member's account.
      </p>
      <Textarea className="mt-6 min-h-48 bg-white/8 text-[#efe6d6]" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button
        className="mt-4"
        onClick={() => void adminSaveSettings({ data: { nouriNotes: notes } }).then(() => toast.success("Nouri updated."))}
      >
        Save Nouri notes
      </Button>
    </div>
  );
}
