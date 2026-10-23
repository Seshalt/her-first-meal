import { useI18n } from "@/lib/i18n/provider";
import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pill, RoomBody, RoomHero } from "@/components/layout/room-hero";
import {
  bookAppointment,
  cancelAppointment,
  confirmMeetingCheckout,
  listMyAppointments,
  listOpenSlots,
} from "@/lib/server/appointments";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { altFor } from "@/lib/landing";

type AppointmentsSearch = {
  paid?: string;
  session_id?: string;
};

export const Route = createFileRoute("/app/appointments")({
  validateSearch: (s: Record<string, unknown>): AppointmentsSearch => ({
    paid: s.paid === "1" || s.paid === 1 ? "1" : undefined,
    session_id: typeof s.session_id === "string" && s.session_id ? s.session_id : undefined,
  }),
  component: Appointments,
});

function Appointments() {
  const localizeContent = useContentText();
  const { locale } = useI18n();
  const { paid, session_id: sessionId } = Route.useSearch();
  const [mine, setMine] = useState<Awaited<ReturnType<typeof listMyAppointments>> | null>(null);
  const [open, setOpen] = useState<Awaited<ReturnType<typeof listOpenSlots>> | null>(null);
  const [type, setType] = useState("consultation");
  const [holding, setHolding] = useState<string | null>(null);

  function reload() {
    void listMyAppointments().then(setMine);
    void listOpenSlots({ data: {} }).then(setOpen);
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (paid !== "1" || !sessionId) return;
    void confirmMeetingCheckout({ data: { sessionId } }).then((res) => {
      if (!res.ok) {
        toast.error(localizeContent(res.error));
        return;
      }
      toast.success(
        localizeContent(res.appointmentId
          ? "Stripe is paid. That time is held."
          : "Stripe is paid. Pick a time below — it will use this session."),
      );
      reload();
    });
  }, [paid, sessionId, localizeContent]);

  return (
    <div>
      <RoomHero
        kicker={localizeContent("Live care")}
        title={localizeContent("A time with Maat")}
        body={localizeContent("Book a private live session, pay securely through Stripe, and join your Zoom room from the same member space.")}
        src="/images/family-table.jpg"
        alt={localizeContent(altFor("/images/family-table.jpg"))}
        tone="gold"
      />
      <RoomBody>
        <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="overflow-hidden rounded-[32px] border border-border/60 bg-ink shadow-[0_30px_90px_-40px_rgba(0,0,0,.65)]">
            <div className="relative aspect-video bg-gradient-to-br from-sea-deep via-ink to-plum p-6 text-paper">
              <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_20%,white,transparent_26%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-black/25 px-3 py-1 text-xs backdrop-blur">{localizeContent("Zoom room preview")}</span>
                  <Video className="size-5" />
                </div>
                <div>
                  <div className="grid size-20 place-items-center rounded-full bg-paper/15 font-display text-4xl ring-1 ring-paper/25 backdrop-blur">{localizeContent("M")}</div>
                  <p className="mt-4 font-display text-3xl">{localizeContent("Private session with Maat")}</p>
                  <p className="mt-1 text-sm text-paper/70">{localizeContent("Your real meeting link appears on a confirmed booking.")}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-card p-4 text-sm text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" /> {localizeContent(" Camera and microphone stay off until you join the real Zoom meeting.")}</div>
          </div>

          <div className="rounded-[32px] border border-border/60 bg-card p-6 shadow-[0_24px_70px_-36px_rgba(30,42,38,.45)]">
            <CalendarDays className="size-5 text-gold" />
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-gold">{localizeContent("Session price")}</p>
            <p className="mt-2 font-display text-5xl">{localizeContent(formatCurrency(open?.meetingPriceCents ?? 12000))}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {localizeContent("One private live session. Membership features stay included; this is the only optional live-service charge.")}{localizeContent((open?.credits ?? 0) > 0
                ? ` You have ${open?.credits} unused paid session${open?.credits === 1 ? "" : "s"} ready to schedule.`
                : "")}
            </p>
            {localizeContent(!open?.stripeReady && !(open?.credits ?? 0) ? (
              <p className="mt-4 rounded-2xl bg-wash-blush p-4 text-sm text-blush-deep">
                {localizeContent("Live-session payment is temporarily unavailable. Your membership features are still available.")}</p>
            ) : null)}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-2">
          {localizeContent((open?.types ?? mine?.types ?? []).map((t) => (
            <Pill key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
              {localizeContent(t.label)}
            </Pill>
          )))}
        </div>

        <h2 className="mt-16 font-display text-4xl md:text-5xl">{localizeContent("Open times")}</h2>
        <div className="editorial-rule mt-6" />
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {localizeContent((open?.slots ?? []).length === 0 ? (
            <li className="py-8 text-lg text-ink-soft">{localizeContent("No open times in the next two weeks.")}</li>
          ) : (
            (open?.slots ?? []).map((s) => (
              <li key={s.startsAt}>
                <button
                  type="button"
                  disabled={holding === s.startsAt}
                  className="w-full rounded-[24px] border border-border/70 bg-card p-5 text-left shadow-[0_16px_40px_-30px_rgba(20,30,28,.5)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-30px_rgba(20,30,28,.55)] disabled:opacity-60"
                  onClick={() => {
                    setHolding(s.startsAt);
                    void bookAppointment({ data: { type, startsAt: s.startsAt } })
                      .then((res) => {
                        if ("needsCheckout" in res && res.needsCheckout && res.url) {
                          window.location.assign(res.url);
                          return;
                        }
                        if (!res.ok) toast.error(localizeContent(res.error));
                        else
                          toast.success(
                            localizeContent(res.usedCredit
                              ? "Held with the session you already paid for."
                              : "Held. That time is no longer open."),
                          );
                        reload();
                      })
                      .finally(() => setHolding(null));
                  }}
                >
                  <span className="font-display text-2xl">{localizeContent(new Date(s.startsAt).toLocaleString(locale === "yue" ? "zh-HK" : locale))}</span>
                  <span className="mt-3 block text-sm text-primary">
                    {localizeContent(holding === s.startsAt
                      ? "Opening…"
                      : (open?.credits ?? 0) > 0
                        ? "Hold this time"
                        : "Pay on Stripe to hold")}
                  </span>
                </button>
              </li>
            ))
          ))}
        </ul>

        <h2 className="mt-20 font-display text-4xl md:text-5xl">{localizeContent("Your sessions")}</h2>
        <div className="editorial-rule mt-6" />
        <ul>
          {localizeContent((mine?.appointments ?? []).length === 0 ? (
            <li className="py-8 text-lg text-ink-soft">{localizeContent("Nothing booked yet.")}</li>
          ) : (
            (mine?.appointments ?? []).map((a) => (
              <li key={a.id} className="border-b border-border py-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-display text-3xl capitalize">{localizeContent(a.type.replace("-", " "))}</p>
                    <p className="mt-2 text-ink-soft">{localizeContent(new Date(a.starts_at).toLocaleString(locale === "yue" ? "zh-HK" : locale))} · {localizeContent(a.status)}</p>
                  </div>
                  {localizeContent(a.zoom_link ? (
                    <Button asChild>
                      <a href={a.zoom_link} target="_blank" rel="noreferrer"><Video className="mr-2 size-4" /> {localizeContent(" Join Zoom")}</a>
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">{localizeContent("Zoom link appears here when Maat adds it.")}</span>
                  ))}
                </div>
                {localizeContent(a.status === "confirmed" ? (
                  <Button size="sm" variant="ghost" className="mt-3" onClick={() => void cancelAppointment({ data: { id: a.id } }).then(reload)}>
                    {localizeContent("Cancel")}</Button>
                ) : null)}
              </li>
            ))
          ))}
        </ul>
      </RoomBody>
    </div>
  );
}
