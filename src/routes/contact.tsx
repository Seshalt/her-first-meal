import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";
import { Reveal } from "@/components/motion/parallax";
import { usePublicSite } from "@/lib/use-public-site";
import { publicHttpUrl } from "@/lib/site";
import { getLanding } from "@/lib/server/public";
import { sendPublicLetter } from "@/lib/server/letters";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";

export const Route = createFileRoute("/contact")({
  loader: async () => {
    try {
      return await getLanding();
    } catch {
      return null;
    }
  },
  component: Contact,
});

function Contact() {
  const localizeContent = useContentText();
  const { site } = usePublicSite();
  const { t, locale } = useI18n();
  const instagram = publicHttpUrl(site.instagramUrl);
  const tiktok = publicHttpUrl(site.tiktokUrl);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await sendPublicLetter({ data: { name, email, message, locale } });
      if (!res.ok) throw new Error(res.error);
      setMessage("");
      toast.success(localizeContent(t("contact.thanks")));
    } catch (err) {
      toast.error(localizeContent(err instanceof Error ? err.message : t("contact.fail")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PublicNav />
      <PageCanvas tone="linen">
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_10%_-10%,rgba(42,117,108,0.16),transparent_60%),radial-gradient(700px_380px_at_90%_0%,rgba(196,92,62,0.12),transparent_55%)]" />
        <div className="section-air relative mx-auto max-w-5xl px-4 md:px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.32em] text-clay">{localizeContent(t("contact.kicker"))}</p>
            <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.92]">{localizeContent(t("contact.title"))}</h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">{localizeContent(t("contact.intro"))}</p>
          </Reveal>

          <div className="glass-panel mt-10 max-w-2xl border border-clay/20 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-clay">{localizeContent(site.doulaKicker)}</p>
            <h2 className="mt-2 font-display text-3xl">{localizeContent(site.doulaPriceLabel)} · {localizeContent(site.doulaPrice)}</h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">{localizeContent(site.doulaPriceNote)}</p>
          </div>

          <form onSubmit={onSend} className="glass-panel mt-14 max-w-2xl space-y-4 p-6 md:p-8">
            <div>
              <Label htmlFor="cname">{localizeContent(t("contact.name"))}</Label>
              <Input id="cname" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cemail">{localizeContent(t("contact.email"))}</Label>
              <Input id="cemail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cmsg">{localizeContent(t("contact.message"))}</Label>
              <Textarea id="cmsg" required minLength={8} value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-36" />
            </div>
            <Button type="submit" size="lg" disabled={busy}>
              {localizeContent(busy ? t("sending") : t("contact.send"))}
            </Button>
          </form>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <InfoCard label={localizeContent(site.contactStudioLabel)} value={site.contactStudioName} icon={<MapPin className="size-4" />} />
            <InfoCard label={localizeContent(site.contactEmailLabel)} value={site.contactEmail} href={`mailto:${site.contactEmail}`} icon={<Mail className="size-4" />} />
            <InfoCard label={localizeContent(site.contactPhoneLabel)} value={site.contactPhone} href={`tel:${site.contactPhone.replace(/[^\d+]/g, "")}`} icon={<Phone className="size-4" />} />
            <InfoCard label={localizeContent(site.contactHoursLabel)} value={site.contactHours} icon={<Clock className="size-4" />} />
          </div>

          {localizeContent(site.contactAddress.trim() ? (
            <Reveal className="glass-panel mt-5 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-gold">{localizeContent(site.contactAddressLabel)}</p>
              <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{localizeContent(site.contactAddress)}</p>
            </Reveal>
          ) : null)}

          <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">{localizeContent(t("contact.note"))}</p>

          {localizeContent((instagram || tiktok) && (
            <div className="mt-14 flex flex-wrap gap-3">
              {localizeContent(instagram ? (
                <a href={instagram} target="_blank" rel="noreferrer" className="glass-chip">
                  {localizeContent(site.instagramLabel)}
                </a>
              ) : null)}
              {localizeContent(tiktok ? (
                <a href={tiktok} target="_blank" rel="noreferrer" className="glass-chip">
                  {localizeContent(site.tiktokLabel)}
                </a>
              ) : null)}
            </div>
          ))}
        </div>
      </section>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}

function InfoCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href?: string;
  icon: ReactNode;
}) {
  const localizeContent = useContentText();
  if (!value.trim()) return null;
  const inner = (
    <>
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
        {localizeContent(icon)}
        {localizeContent(label)}
      </p>
      <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{localizeContent(value)}</p>
    </>
  );
  if (href) {
    return (
      <a href={href} className="glass-panel block p-6 transition-transform duration-150 ease-out hover:-translate-y-0.5 md:p-8">
        {localizeContent(inner)}
      </a>
    );
  }
  return <div className="glass-panel p-6 md:p-8">{localizeContent(inner)}</div>;
}
