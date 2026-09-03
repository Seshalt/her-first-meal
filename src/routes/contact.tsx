import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Reveal } from "@/components/motion/parallax";
import { usePublicSite } from "@/lib/use-public-site";
import { publicHttpUrl } from "@/lib/site";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const { site } = usePublicSite();
  const instagram = publicHttpUrl(site.instagramUrl);
  const tiktok = publicHttpUrl(site.tiktokUrl);

  return (
    <div className="bg-background">
      <PublicNav />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_10%_-10%,rgba(42,117,108,0.16),transparent_60%),radial-gradient(700px_380px_at_90%_0%,rgba(196,92,62,0.12),transparent_55%)]" />
        <div className="section-air relative mx-auto max-w-5xl px-4 md:px-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.32em] text-clay">{site.contactKicker}</p>
            <h1 className="mt-6 font-display text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.92]">{site.contactTitle}</h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">{site.contactIntro}</p>
          </Reveal>

          <div className="mt-16 grid gap-5 md:grid-cols-2">
            <InfoCard label={site.contactStudioLabel} value={site.contactStudioName} icon={<MapPin className="size-4" />} />
            <InfoCard label={site.contactEmailLabel} value={site.contactEmail} href={`mailto:${site.contactEmail}`} icon={<Mail className="size-4" />} />
            <InfoCard label={site.contactPhoneLabel} value={site.contactPhone} href={`tel:${site.contactPhone.replace(/[^\d+]/g, "")}`} icon={<Phone className="size-4" />} />
            <InfoCard label={site.contactHoursLabel} value={site.contactHours} icon={<Clock className="size-4" />} />
          </div>

          {site.contactAddress.trim() ? (
            <Reveal className="glass-panel mt-5 p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.22em] text-gold">{site.contactAddressLabel}</p>
              <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{site.contactAddress}</p>
            </Reveal>
          ) : null}

          {site.contactNote.trim() ? (
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">{site.contactNote}</p>
          ) : null}

          {(instagram || tiktok) && (
            <div className="mt-14 flex flex-wrap gap-3">
              {instagram ? (
                <a href={instagram} target="_blank" rel="noreferrer" className="glass-chip">
                  {site.instagramLabel}
                </a>
              ) : null}
              {tiktok ? (
                <a href={tiktok} target="_blank" rel="noreferrer" className="glass-chip">
                  {site.tiktokLabel}
                </a>
              ) : null}
            </div>
          )}
        </div>
      </section>
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
  if (!value.trim()) return null;
  const inner = (
    <>
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
        {icon}
        {label}
      </p>
      <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">{value}</p>
    </>
  );
  if (href) {
    return (
      <a href={href} className="glass-panel block p-6 transition-transform duration-150 ease-out hover:-translate-y-0.5 md:p-8">
        {inner}
      </a>
    );
  }
  return <div className="glass-panel p-6 md:p-8">{inner}</div>;
}
