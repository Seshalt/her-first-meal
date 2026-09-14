import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { altFor } from "@/lib/landing";
import { getPhaseGuide } from "@/lib/server/nouri";
import { sendMemberLetter } from "@/lib/server/letters";
import { useI18n } from "@/lib/i18n/provider";

export const Route = createFileRoute("/app/nouri")({ component: SupportRoom });

function SupportRoom() {
  const { t, locale } = useI18n();
  const [guide, setGuide] = useState<Awaited<ReturnType<typeof getPhaseGuide>> | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getPhaseGuide().then(setGuide);
  }, []);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await sendMemberLetter({ data: { message, locale } });
      if (!res.ok) throw new Error(res.error);
      setMessage("");
      toast.success(t("ask.thanks"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("contact.fail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <RoomHero
        kicker={t("ask.kicker")}
        title={t("ask.title")}
        body={t("ask.body")}
        src="/images/nouri-drop.jpg"
        alt={altFor("/images/nouri-drop.jpg")}
        tone="plum"
      />
      <RoomBody className="max-w-3xl space-y-14">
        {guide ? (
          <section className="glass-panel p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-plum">{t("ask.guidance")}</p>
            <h2 className="mt-4 font-display text-4xl">{guide.guide.title}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 text-base leading-relaxed text-ink-soft">
              <p>{guide.guide.nourish}</p>
              <p>{guide.guide.move}</p>
              <p>{guide.guide.grocery}</p>
              <p>{guide.guide.rest}</p>
            </div>
          </section>
        ) : null}

        <form onSubmit={onSend} className="glass-panel space-y-4 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-clay">Human support</p>
          <h2 className="font-display text-3xl">Send a private note to Maat.</h2>
          <Label htmlFor="letter">{t("contact.message")}</Label>
          <Textarea
            id="letter"
            required
            minLength={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("ask.placeholder")}
            className="min-h-36"
          />
          <Button type="submit" disabled={busy || message.trim().length < 8}>
            {busy ? t("sending") : t("ask.send")}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Her First Meal uses pre-written wellness education and your saved preferences to organize meals, groceries, and stage guidance. This is educational support, not medical care.
          </p>
        </form>
      </RoomBody>
    </div>
  );
}
