import { useEffect, useState, type ReactNode } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function RequireMember({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 7000);
    return () => window.clearTimeout(t);
  }, []);
  if (isPending && !timedOut) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="font-display text-2xl text-muted-foreground">Gathering your table…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn to="/login" />;
  return <>{children}</>;
}
