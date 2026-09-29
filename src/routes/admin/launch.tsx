import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, CircleDashed, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { adminLaunchReadiness } from "@/lib/server/admin";

type Readiness = Awaited<ReturnType<typeof adminLaunchReadiness>>;

const KEY = "hfm-launch-human-todo";

const HUMAN_ITEMS = [
  { id: "mfa", label: "Finish owner MFA setup and save the recovery codes." },
  { id: "stripe-test", label: "After live Stripe keys are added, complete one real end-to-end purchase and refund it if desired." },
  { id: "mail-test", label: "After Resend is connected, request one verification email and one password-reset email." },
  { id: "legal", label: "Have a qualified attorney review the Terms and Privacy Policy before broad launch." },
  { id: "mobile", label: "Walk the full member flow once on your phone." },
];

export const Route = createFileRoute("/admin/launch")({ component: LaunchReadiness });

function Dot({ good }: { good: boolean }) {
  return good ? <CheckCircle2 className="size-5 text-emerald-300" /> : <CircleAlert className="size-5 text-[#d5a76f]" />;
}

function LaunchReadiness() {
  const [status, setStatus] = useState<Readiness | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [humanDone, setHumanDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setHumanDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      // Ignore a blocked or malformed local preference and show unchecked items.
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStatus(await adminLaunchReadiness());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read launch status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  function toggle(id: string) {
    setHumanDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {
        // Keep the checkbox usable when browser storage is unavailable.
      }
      return next;
    });
  }

  const automatic = useMemo(() => {
    if (!status) return [];
    return [
      { label: "Production database responds", good: status.database.configured && status.database.healthy, note: status.database.dedicated ? "Using the dedicated Her First Meal database override." : "Database works, but the dedicated Her First Meal database override is not set." },
      { label: "Real authentication is enabled", good: status.auth.enabled && status.auth.secretConfigured && status.auth.baseUrlConfigured, note: status.auth.productionDomain ? "Production domain is recognized." : "Production authentication URL still needs attention." },
      { label: "Live Stripe secret key", good: status.payments.liveSecret, note: status.payments.secretConfigured ? "A Stripe secret exists, but it is not a live key." : "Live Stripe secret key is still missing." },
      { label: "Live Stripe publishable key", good: status.payments.livePublishable, note: status.payments.publishableConfigured ? "A publishable key exists, but it is not a live key." : "Live Stripe publishable key is still missing." },
      { label: "Transactional email", good: status.email.apiConfigured && status.email.senderConfigured && status.email.senderUsesDomain, note: !status.email.apiConfigured ? "Transactional email provider is not connected yet." : !status.email.senderConfigured ? "Branded sender is missing." : !status.email.senderUsesDomain ? "Sender is not using @herfirstmeal.app." : "Transactional email and branded sender are configured." },
    ];
  }, [status]);

  const autoDone = automatic.filter((item) => item.good).length;
  const manualDone = HUMAN_ITEMS.filter((item) => humanDone[item.id]).length;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">Production readiness</p>
          <h1 className="mt-2 font-display text-4xl">Launch control.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
            This page checks launch configuration without exposing any secret values.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refresh()} disabled={loading}>
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error ? <p className="mt-6 rounded-2xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">{error}</p> : null}

      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#c4a574]">Automatic checks</p>
            <h2 className="mt-1 font-display text-2xl">{autoDone} of {automatic.length || 5} ready</h2>
          </div>
          {loading ? <CircleDashed className="size-5 animate-spin text-white/45" /> : null}
        </div>
        <div className="mt-5 space-y-3">
          {automatic.map((item) => (
            <div key={item.label} className="flex gap-3 rounded-2xl bg-black/15 px-4 py-3">
              <div className="mt-0.5"><Dot good={item.good} /></div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[#c4a574]">Human checks</p>
        <h2 className="mt-1 font-display text-2xl">{manualDone} of {HUMAN_ITEMS.length} complete</h2>
        <div className="mt-5 space-y-3">
          {HUMAN_ITEMS.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-2xl bg-black/15 px-4 py-3">
              <input type="checkbox" checked={Boolean(humanDone[item.id])} onChange={() => toggle(item.id)} className="mt-1 size-4 accent-[#c4a574]" />
              <span className={humanDone[item.id] ? "text-sm text-white/35 line-through" : "text-sm"}>{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-3 text-xs">
        <a href="https://www.herfirstmeal.app" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#c4a574] underline underline-offset-4">
          Production site <ExternalLink className="size-3.5" />
        </a>
        <a href="https://www.herfirstmeal.app/sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#c4a574] underline underline-offset-4">
          Sitemap <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
