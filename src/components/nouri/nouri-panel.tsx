import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askNouri, getNouriThread } from "@/lib/server/nouri";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function NouriFab({ about }: { about?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-border)] md:bottom-6"
        aria-haspopup="dialog"
      >
        <Sparkles className="size-4" />
        Ask Nouri
      </button>
      {open ? <NouriDialog about={about} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function NouriDialog({ about, onClose }: { about?: string; onClose?: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getNouriThread()
      .then((t) => setMessages(t.messages))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const message = text.trim();
    if (!message || busy) return;
    setText("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setBusy(true);
    try {
      const res = await askNouri({ data: { message, about } });
      if (res.ok) setMessages((m) => [...m, { role: "assistant", content: res.text }]);
      else setMessages((m) => [...m, { role: "assistant", content: res.error }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I lost the thread for a moment. Try again whenever you are ready." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return onClose ? (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center">
      <DialogBody onClose={onClose} messages={messages} text={text} setText={setText} busy={busy} send={send} scroller={scroller} />
    </div>
  ) : (
    <DialogBody messages={messages} text={text} setText={setText} busy={busy} send={send} scroller={scroller} />
  );
}

function DialogBody({
  onClose,
  messages,
  text,
  setText,
  busy,
  send,
  scroller,
}: {
  onClose?: () => void;
  messages: Msg[];
  text: string;
  setText: (t: string) => void;
  busy: boolean;
  send: () => void;
  scroller: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-lg flex-col overflow-hidden bg-card",
        onClose ? "h-[min(82dvh,640px)] rounded-3xl shadow-[var(--shadow-border)]" : "h-[min(70dvh,720px)] rounded-[28px] shadow-[var(--shadow-border)]",
      )}
      role="dialog"
      aria-label="Talk to Nouri"
    >
      <header className="flex items-center justify-between px-6 py-5">
        <div>
          <p className="font-display text-3xl leading-none">Nouri</p>
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-earth">Inspired by nourish. Never a clinician.</p>
        </div>
        <div className="flex gap-1">
          {onClose ? (
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/nouri">Open studio</Link>
            </Button>
          ) : null}
          {onClose ? (
            <button type="button" className="grid size-11 place-items-center" onClick={onClose} aria-label="Close">
              <X className="size-5" />
            </button>
          ) : null}
        </div>
      </header>
      <div className="editorial-rule mx-6" />
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <p className="font-display text-2xl leading-snug text-ink-soft">
            Tell me what your body needs today. Food, rest, wrapping, a walk, or a question.
          </p>
        ) : null}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[90%] px-4 py-3 text-sm leading-relaxed",
              m.role === "user"
                ? "ml-auto rounded-[22px] bg-primary text-primary-foreground"
                : "rounded-[22px] bg-secondary",
            )}
          >
            {m.content}
          </div>
        ))}
        {busy ? <p className="text-sm text-muted-foreground">Nouri is gathering a quiet answer…</p> : null}
      </div>
      <form
        className="flex gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Talk to Nouri"
          aria-label="Message Nouri"
          className="h-12 flex-1 rounded-full bg-secondary px-4 text-sm"
        />
        <Button type="submit" size="icon" disabled={busy} aria-label="Send">
          <Send />
        </Button>
      </form>
    </div>
  );
}
