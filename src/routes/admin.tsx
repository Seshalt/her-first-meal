import { createFileRoute, Outlet, useRouterState, Navigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { markAtelierReady } from "@/lib/atelier-ready";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyRole } from "@/lib/server/admin";
import { signOut } from "@/lib/auth/client";

export const Route = createFileRoute("/admin")({ component: AdminGate });

function AdminGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const [role, setRole] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

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
    return () => {
      live = false;
    };
  }, [isPending, user]);

  useEffect(() => {
    if (role === "admin") markAtelierReady();
  }, [role]);

  if (pathname.startsWith("/admin/setup")) return <Outlet />;

  const stillWaiting = isPending || (Boolean(user) && !role && !denied);
  if (stillWaiting) {
    return <div className="grid min-h-dvh place-items-center bg-[#101918] text-[#efe6d6]">Opening the atelier…</div>;
  }

  if (!user) {
    return <Navigate to="/hearth" />;
  }
  if (role === "admin") {
    return (
      <AdminShell>
        <Outlet />
      </AdminShell>
    );
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-[#101918] px-6 text-center text-[#efe6d6]">
      <div>
        <h1 className="font-display text-3xl">Use the private door.</h1>
        <p className="mt-3 max-w-sm text-sm text-[#efe6d6]/70">
          This browser is signed in as a member. Sign out, then enter at the hearth with the owner email and password.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-full bg-[#efe6d6] px-5 py-3 text-sm text-[#101918]"
            onClick={() => {
              void signOut("/hearth");
            }}
          >
            Sign out and open the hearth
          </button>
          <Link to="/hearth" className="rounded-full border border-white/20 px-5 py-3 text-sm">
            Go to the hearth
          </Link>
        </div>
      </div>
    </div>
  );
}