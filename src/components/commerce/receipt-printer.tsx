import { useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Stage = "processing" | "success" | "printing" | "complete";

export function ReceiptPrinter({
  plan,
  amountCents,
  email,
  reference,
  onDone,
}: {
  plan: "monthly" | "yearly";
  amountCents: number;
  email?: string;
  reference?: string;
  onDone?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("processing");
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (reducedMotion) {
      setStage("complete");
      return;
    }

    const timers = [
      window.setTimeout(() => setStage("success"), 650),
      window.setTimeout(() => setStage("printing"), 1450),
      window.setTimeout(() => setStage("complete"), 3300),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reducedMotion]);

  const label =
    stage === "processing"
      ? "Confirming payment…"
      : stage === "success"
        ? "Payment Successful!"
        : stage === "printing"
          ? "Printing your receipt…"
          : "Payment Successful!";

  const safeReference = reference?.trim()
    ? reference.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(-14).toUpperCase()
    : undefined;

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="mx-auto w-full max-w-sm" aria-label="Membership payment confirmation" aria-live="polite">
      <div className={`hfm-receipt-terminal relative overflow-hidden rounded-[1.5rem] border border-ink/15 bg-sea p-3 pb-8 shadow-[0_20px_36px_-20px_rgba(18,42,38,0.45)] ${stage !== "processing" ? "is-success" : ""}`}>
        <div className="flex h-11 items-center justify-between px-2 text-paper">
          <p className="font-display text-lg">Her First Meal</p>
          {stage === "processing" ? (
            <LoaderCircle className="size-5 animate-spin text-gold" />
          ) : (
            <span className="hfm-success-check grid size-8 place-items-center rounded-full bg-gold text-ink">
              <Check className="size-5" strokeWidth={3} />
            </span>
          )}
        </div>

        <div className="rounded-[1rem] bg-ink px-4 py-4 text-paper">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">{label}</p>
          {stage !== "processing" ? (
            <p className="mt-2 text-sm text-paper/70">Your membership payment has been confirmed.</p>
          ) : null}
        </div>

        <div className="relative z-10 -mb-2 mt-3 h-2 rounded-sm bg-ink/80" />
      </div>

      <div className={`receipt-feed mx-auto -mt-2 w-[88%] overflow-hidden ${stage === "processing" || stage === "success" ? "h-0" : "h-[27rem]"}`}>
        <article className={`receipt-paper bg-paper px-6 pb-10 pt-7 font-mono text-sm text-ink ${stage === "printing" ? "is-printing" : "is-out"}`}>
          <p className="text-center font-display text-2xl">Her First Meal</p>
          <p className="mt-1 text-center text-[10px] uppercase tracking-[0.22em] text-ink/50">Payment receipt</p>

          <div className="my-4 border-t border-dashed border-ink/20" />

          <div className="space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-ink/55">Plan</span>
              <span className="text-right">{plan === "yearly" ? "Yearly membership" : "Monthly membership"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink/55">Status</span>
              <span>PAID</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-ink/55">Date</span>
              <span>{dateLabel}</span>
            </div>
            {safeReference ? (
              <div className="flex justify-between gap-4">
                <span className="text-ink/55">Reference</span>
                <span className="max-w-[11rem] truncate">{safeReference}</span>
              </div>
            ) : null}
          </div>

          <p className="mt-5 font-display text-3xl">{formatCurrency(amountCents)}</p>
          {email ? <p className="mt-2 break-all text-xs text-ink/55">{email}</p> : null}

          <div className="my-4 border-t border-dashed border-ink/20" />

          <p className="text-xs leading-relaxed text-ink/70">
            Next, create your account to open meals, movement, grocery planning, belly binding education, and the rest of your Her First Meal experience.
          </p>
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-ink/40">We remember the mother</p>
        </article>
      </div>

      {stage === "complete" && onDone ? (
        <button
          type="button"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-sea text-paper transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          onClick={onDone}
        >
          Continue to account setup
        </button>
      ) : null}
    </section>
  );
}
