import { CreditCard, LockKeyhole, Wifi } from "lucide-react";

export function CheckoutCardAnimation({
  amount,
  processing = false,
}: {
  amount: string;
  processing?: boolean;
}) {
  return (
    <div className="hfm-pay-stage" aria-hidden="true">
      <div className={`hfm-pay-card ${processing ? "is-processing" : ""}`}>
        <div className="hfm-pay-card-face hfm-pay-card-front">
          <div className="flex items-start justify-between">
            <span className="font-logo text-xl">Her First Meal</span>
            <Wifi className="size-5 rotate-90 opacity-75" />
          </div>
          <div className="hfm-pay-chip"><span /><span /><span /></div>
          <div className="mt-auto">
            <p className="font-mono text-lg tracking-[0.18em] sm:text-xl">•••• •••• •••• 4242</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-55">Membership</p>
                <p className="mt-1 text-xs">HER FIRST MEAL</p>
              </div>
              <CreditCard className="size-7 text-gold" />
            </div>
          </div>
        </div>
        <div className="hfm-pay-card-face hfm-pay-card-back">
          <div className="mt-8 h-10 bg-ink/80" />
          <div className="mx-5 mt-6 flex h-10 items-center justify-end rounded bg-paper px-3 font-mono text-sm text-ink">
            •••
          </div>
          <div className="mt-auto flex items-center justify-between px-5 pb-5 text-[10px] uppercase tracking-[0.18em] opacity-65">
            <span>Secure payment</span><LockKeyhole className="size-4" />
          </div>
        </div>
      </div>
      <div className="hfm-pay-shadow" />
      <div className="mt-7 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-earth">{processing ? "Processing securely" : "Private checkout"}</p>
        <p className="mt-1 font-display text-2xl">{amount}</p>
      </div>
    </div>
  );
}
