import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getEmailFactorStatus } from "@/lib/server/email-factor";
import { getMembershipAccess } from "@/lib/server/checkout";

export function RequireMember({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [factorNeeded, setFactorNeeded] = useState<boolean | null>(null);
  const [membershipActive, setMembershipActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setFactorNeeded(null);
      setMembershipActive(null);
      return;
    }
    let live = true;
    void Promise.all([
      getEmailFactorStatus().catch(() => ({ needed: false })),
      getMembershipAccess().catch(() => ({ active: false, plan: null, expiresAt: null })),
    ]).then(([factor, membership]) => {
      if (!live) return;
      setFactorNeeded(factor.needed);
      setMembershipActive(membership.active);
    });
    return () => {
      live = false;
    };
  }, [user]);

  if (isPending || (user && (factorNeeded === null || membershipActive === null))) {
    return (
      <div className="grid min-h-dvh place-items-center px-5 text-center">
        <p className="font-display text-2xl text-muted-foreground">Checking your membership…</p>
      </div>
    );
  }

  if (!user) return <RedirectToSignIn to="/login" />;

  if (!membershipActive) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background px-5 py-20">
        <section className="w-full max-w-lg rounded-[28px] border border-border bg-card p-7 text-center shadow-[var(--shadow-border)] md:p-10">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.24em] text-earth">Membership required</p>
          <h1 className="mt-3 font-display text-4xl leading-tight">Payment has to clear before the member app opens.</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Your account can stay signed in, but meals, grocery planning, readings, binding, and the rest of the member rooms unlock only after Stripe confirms an active membership.
          </p>
          <Link
            to="/pricing"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 active:scale-95"
          >
            Choose membership
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
