import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Send, HeartHandshake } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { altFor } from "@/lib/landing";
import { askNouri, getPhaseGuide } from "@/lib/server/nouri";
import { useI18n } from "@/lib/i18n/provider";

export const Route = createFileRoute("/app/nouri")({ component: NouriRoom });

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STARTERS = [
  "What should I eat this week?",
  "Help me make a grocery swap.",
  "What should I know about this stage?",
  "Where do I start with belly binding education?",
];

function NouriRoom() {
  const { t, locale } = useI18n();
  const [guide, setGuide] = useState<Awaited<ReturnType<typeof getPhaseGuide>> | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getPhaseGuide().then(setGuide);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  const welcome = useMemo(() => {
    const stage = guide?.stage ? String(guide.stage).replaceAll("-", " ") : "your journey";
    return `I’m Nouri. I can help you think through meals, groceries, ${stage}, movement, belly binding education, and where to find things in Her First Meal. I’m here for education and support — not diagnosis or medical care.`;
  }, [guide?.stage]);

  async function send(text: string) {
    const clean = text.trim();
    if (clean.length < 2 || busy) return;
    const prior = messages.slice(-8);
    setMessages((current) => [...current, { role: "user", content: clean }]);
    setMessage("");
    setBusy(true);
    try {
      const result = await askNouri({ data: { message: clean, locale, history: prior } });
      setMessages((current) => [...current, { role: "assistant", content: result.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nouri could not answer that yet.");
    } finally {
      setBusy(false);
    }
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    await send(message);
  }

  return (
    <div>
      <RoomHero
        kicker="Nouri"
        title={t("ask.title")}
        body={t("ask.body")}
        src="/images/nouri-drop.jpg"
        alt={altFor("/images/nouri-drop.jpg")}
        tone="plum"
      />
      <RoomBody className="max-w-5xl space-y-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="glass-panel overflow-hidden">
            <div className="border-b border-border/60 px-5 py-4 md:px-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-plum text-white shadow-sm">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <p className="font-display text-2xl">Nouri</p>
                  <p className="text-xs text-muted-foreground">Private wellness companion · educational, not medical care</p>
                </div>
              </div>
            </div>

            <div className="min-h-[420px] space-y-5 px-5 py-6 md:px-7">
              <Bubble role="assistant">{welcome}</Bubble>
              {messages.map((item, index) => (
                <Bubble key={`${item.role}-${index}`} role={item.role}>
                  {item.content}
                </Bubble>
              ))}
              {busy ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                  <span className="size-2 animate-pulse rounded-full bg-plum" />
                  Nouri is gathering a thoughtful answer…
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2 px-5 pb-5 md:px-7">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void send(starter)}
                    className="rounded-full border border-plum/20 bg-plum/5 px-4 py-2 text-left text-sm text-foreground transition hover:-translate-y-0.5 hover:bg-plum/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={onSend} className="border-t border-border/60 p-4 md:p-5">
              <div className="flex items-end gap-3">
                <Textarea
                  aria-label="Ask Nouri"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(message);
                    }
                  }}
                  placeholder={t("ask.placeholder")}
                  className="min-h-14 flex-1 resize-none"
                />
                <Button type="submit" size="icon" variant="plum" disabled={busy || message.trim().length < 2} aria-label={t("ask.send")}>
                  <Send className="size-4" />
                </Button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Nouri can educate and help you navigate Her First Meal. For symptoms, emergencies, treatment, medication, or clinical decisions, contact your healthcare professional.
              </p>
            </form>
          </div>

          <aside className="space-y-4">
            {guide ? (
              <div className="glass-panel p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-plum">{t("ask.guidance")}</p>
                <h2 className="mt-3 font-display text-2xl">{guide.guide.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">{guide.guide.nourish}</p>
              </div>
            ) : null}
            <div className="glass-panel p-5">
              <HeartHandshake className="size-5 text-clay" />
              <p className="mt-3 font-display text-xl">Want a human?</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Nouri does not replace Maat. You can still send a private note when you want a person behind the answer.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/contact">Write Maat</Link>
              </Button>
            </div>
          </aside>
        </section>
      </RoomBody>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: string }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          role === "user"
            ? "max-w-[85%] rounded-[24px_24px_8px_24px] bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground md:max-w-[72%]"
            : "max-w-[88%] rounded-[24px_24px_24px_8px] bg-muted/70 px-4 py-3 text-sm leading-relaxed text-foreground md:max-w-[76%]"
        }
      >
        {children}
      </div>
    </div>
  );
}
