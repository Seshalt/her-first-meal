import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { applyAtelierEdit } from "@/lib/server/atelier-ai";
import { bustPublicSiteCache } from "@/lib/use-public-site";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/admin/ai")({ component: HouseAi });

function HouseAi() {
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl">House AI</h1>
      <p className="mt-3 text-sm text-white/60">
        Speak to ChatGPT here and it writes straight onto the public site — headlines, belly binding steps, contact
        lines, footer links. You do not need to open each field.
      </p>
      <Textarea
        className="mt-8 min-h-36 bg-white/8 text-[#efe6d6]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Example: Add a fifth belly binding step about resting after the wrap. Change the home headline to mention Sunday kitchen hours."
      />
      <Button
        className="mt-4"
        disabled={busy || !message.trim()}
        onClick={() => {
          setBusy(true);
          void applyAtelierEdit({ data: { message } })
            .then((r) => {
              bustPublicSiteCache();
              setLog((prev) => [r.text, ...prev].slice(0, 8));
              if (r.ok) {
                setMessage("");
                toast.success("Public site updated.");
              } else {
                toast.error(r.text);
              }
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "ChatGPT could not edit."))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "Editing the house…" : "Apply to the public site"}
      </Button>
      <ul className="mt-10 space-y-3 text-sm text-white/70">
        {log.map((line, i) => (
          <li key={i} className="rounded-2xl bg-white/6 px-4 py-3 whitespace-pre-wrap">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
