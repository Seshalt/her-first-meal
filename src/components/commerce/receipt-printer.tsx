import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Stage = "processing" | "printing" | "complete";

export function ReceiptPrinter({
  plan,
  amountCents,
  email,
  onDone,
}: {
  plan: "monthly" | "yearly";
  amountCents: number;
  email?: string;
  onDone?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("processing");

  useEffect(() => {
    const a = window.setTimeout(() => setStage("printing"), 700);
    const b = window.setTimeout(() => setStage("complete"), 2800);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  const label =
    stage === "processing" ? "Holding your place…" : stage === "printing" ? "Printing the receipt…" : "Membership reserved";

  return (
    <section className="mx-auto w-full max-w-sm" aria-label="Membership receipt">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-ink/15 bg-sea p-3 pb-8 shadow-[0_20px_36px_-20px_rgba(18,42,38,0.45)]">
        <div className="flex h-11 items-center justify-between px-2 text-paper">
          <p className="font-display text-lg">Her First Meal</p>
          {stage === "complete" ? <Check className="size-5 text-gold" /> : <span className="size-4 animate-spin rounded-full border-2 border-paper/30 border-t-gold" />}
        </div>
        <div className="rounded-[1rem] bg-ink px-4 py-3 text-paper">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">{label}</p>
        </div>
        <div className="relative z-10 -mb-2 mt-3 h-2 rounded-sm bg-ink/80" />
      </div>
      <div className={`receipt-feed mx-auto -mt-2 w-[88%] overflow-hidden ${stage === "processing" ? "h-0" : "h-[22rem]"}`}>
        <article className={`receipt-paper bg-paper px-6 pb-10 pt-7 font-mono text-sm text-ink ${stage === "printing" ? "is-printing" : "is-out"}`}>
          <p className="text-center font-display text-2xl">Her First Meal</p>
          <p className="mt-1 text-center text-[10px] uppercase tracking-[0.22em] text-ink/50">Membership receipt</p>
          <div className="my-4 border-t border-dashed border-ink/20" />
          <p>{plan === "yearly" ? "Yearly membership" : "Monthly membership"}</p>
          <p className="mt-2 font-display text-3xl">{formatCurrency(amountCents)}</p>
          {email ? <p className="mt-3 text-ink/60">{email}</p> : null}
          <div className="my-4 border-t border-dashed border-ink/20" />
          <p className="text-xs leading-relaxed text-ink/70">
            The house is reserved. Meals, studio, movement, grocery lists, and Nouri open after you create your account.
          </p>
          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-ink/40">We remember the mother</p>
        </article>
      </div>
      {stage === "complete" && onDone ? (
        <button
          type="button"
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-sea text-paper"
          onClick={onDone}
        >
          Continue
        </button>
      ) : null}
    </section>
  );
}
