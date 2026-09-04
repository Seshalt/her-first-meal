import { useEffect, useState, type ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getEmailFactorStatus } from "@/lib/server/email-factor";

export function RequireMember({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [factorNeeded, setFactorNeeded] = useState<boolean | null>(null);
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
  if (isPending || (user && factorNeeded === null)) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="font-display text-2xl text-muted-foreground">Gathering your table…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <>{children}</>;
}