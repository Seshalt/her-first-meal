import { CreditCard, LoaderCircle, LockKeyhole, Wifi } from "lucide-react";

export function CheckoutCardAnimation({
  amount,
  name,
  plan,
  processing = false,
}: {
  amount: string;
  name?: string;
  plan?: "monthly" | "yearly";
  processing?: boolean;
}) {
  const holder = name?.trim() ? name.trim().toUpperCase().slice(0, 24) : "MEMBER";
  const membership = plan === "yearly" ? "YEARLY MEMBERSHIP" : "MONTHLY MEMBERSHIP";

  return (
    <div className={`hfm-pay-stage ${processing ? "is-processing" : ""}`} aria-hidden="true">
      <div className="hfm-pay-orbit">
        <div className={`hfm-pay-card ${processing ? "is-processing" : ""}`}>
          <div className="hfm-pay-card-face hfm-pay-card-front">
            <div className="flex items-start justify-between">
              <span className="font-logo text-xl">Her First Meal</span>
              <Wifi className="size-5 rotate-90 opacity-75" />
            </div>

            <div className="hfm-pay-chip" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <div className="mt-auto">
              <p className="font-mono text-lg tracking-[0.18em] sm:text-xl">•••• •••• •••• ••••</p>
              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">{membership}</p>
                  <p className="mt-1 truncate text-xs tracking-[0.08em]">{holder}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">Secure</p>
                  <p className="mt-1 font-mono text-xs">••/••</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hfm-pay-card-face hfm-pay-card-back">
            <div className="mt-8 h-10 bg-ink/80" />
            <div className="mx-5 mt-6 flex h-10 items-center justify-end rounded bg-paper px-3 font-mono text-sm text-ink">
              •••
            </div>
            <div className="mt-auto flex items-center justify-between px-5 pb-5 text-[10px] uppercase tracking-[0.18em] opacity-65">
              <span>Stripe secure field</span>
              <LockKeyhole className="size-4" />
            </div>
          </div>
        </div>

        <div className="hfm-pay-processing-ring" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="hfm-pay-shadow" />

      <div className="mt-7 text-center">
        <div className="flex items-center justify-center gap-2">
          {processing ? <LoaderCircle className="size-4 animate-spin text-gold" /> : <CreditCard className="size-4 text-earth" />}
          <p className="text-xs uppercase tracking-[0.24em] text-earth">
            {processing ? "Preparing secure payment" : "Private checkout"}
          </p>
        </div>
        <p className="mt-1 font-display text-2xl">{amount}</p>
      </div>
    </div>
  );
}
