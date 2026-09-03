import { createFileRoute, Outlet, useRouterState, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { markAtelierReady } from "@/lib/atelier-ready";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyRole } from "@/lib/server/admin";
import { hasAdministrator } from "@/lib/server/public";
import { getEmailFactorStatus } from "@/lib/server/email-factor";

export const Route = createFileRoute("/admin")({ component: AdminGate });

function AdminGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const [role, setRole] = useState<string | null>(null);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [factorNeeded, setFactorNeeded] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 7000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    let live = true;
    void hasAdministrator()
      .then((r) => {
        if (live) setHasAdmin(r.hasAdmin);
      })
      .catch(() => {
        if (live) setHasAdmin(null);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (isPending || !user) return;
    let live = true;
    void getMyRole()
      .then((r) => {
        if (live) setRole(r.role);
      })
      .catch(() => {
        if (live) setDenied(true);
      });
    void getEmailFactorStatus()
      .then((s) => {
        if (live) setFactorNeeded(s.needed);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [isPending, user]);

  useEffect(() => {
    if (role === "admin") markAtelierReady();
  }, [role]);

  if (pathname.startsWith("/admin/setup")) return <Outlet />;

  const stillWaiting = isPending || (Boolean(user) && !role && !denied);
  if (stillWaiting && !timedOut) {
    return <div className="grid min-h-dvh place-items-center bg-[#101918] text-[#efe6d6]">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/hearth" />;
  }
  if (factorNeeded) {
    return <Navigate to="/hearth" />;
  }
  if (denied || (role && role !== "admin")) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="font-display text-3xl">This page isn't available.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the owner email. Members enter through the house, not the atelier.
          </p>
        </div>
      </div>
    );
  }
  if (role !== "admin") {
    if (hasAdmin === false) return <Navigate to="/admin/setup" />;
    return <Navigate to="/login" search={{ next: "/admin" }} />;
  }
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
