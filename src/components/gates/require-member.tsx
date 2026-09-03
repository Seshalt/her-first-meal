import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getEmailFactorStatus } from "@/lib/server/email-factor";

export function RequireMember({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [timedOut, setTimedOut] = useState(false);
  const [factorNeeded, setFactorNeeded] = useState<boolean | null>(null);
  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 2500);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!user) return;
    let live = true;
    void getEmailFactorStatus()
      .then((s) => {
        if (live) setFactorNeeded(s.needed);
      })
      .catch(() => {
        if (live) setFactorNeeded(false);
      });
    return () => {
      live = false;
    };
  }, [user]);
  if ((isPending || (user && factorNeeded === null)) && !timedOut) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="font-display text-2xl text-muted-foreground">Gathering your table…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <>{children}</>;
}