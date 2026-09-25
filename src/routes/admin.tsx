import { createFileRoute, Outlet, Navigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { markAtelierReady } from "@/lib/atelier-ready";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyRole } from "@/lib/server/admin";
import { signOut } from "@/lib/auth/client";
import { restoreOwnerToken, clearOwnerToken } from "@/lib/session-ready";

export const Route = createFileRoute("/admin")({ component: AdminGate });

function AdminGate() {
  const { user, isPending } = useCurrentUserState();
  const [role, setRole] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    restoreOwnerToken();
  }, []);

  useEffect(() => {
    if (isPending || !user) return;
    let live = true;
    let tries = 0;
    const run = () => {
      void getMyRole()
        .then((result) => {
          if (!live) return;
          setRole(result.role);
          setMfaEnabled(result.mfaEnabled);
        })
        .catch(() => {
          tries += 1;
          if (!live) return;
          if (tries < 4) {
            window.setTimeout(run, 180 * tries);
            return;
          }
          setDenied(true);
        });
    };
    run();
    return () => {
      live = false;
    };
  }, [isPending, user]);

  useEffect(() => {
    if (role === "admin" && mfaEnabled) markAtelierReady();
  }, [mfaEnabled, role]);

  const stillWaiting =
    isPending ||
    (Boolean(user) && !denied && (role === null || mfaEnabled === null));

  if (stillWaiting) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#101918] text-[#efe6d6]">
        Opening the atelier…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/hearth" replace />;
  }

  if (role === "admin" && !mfaEnabled) {
    return <Navigate to="/hearth" replace />;
  }

  if (role === "admin" && mfaEnabled) {
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
          This browser is signed in as a member. Sign out, then enter at the hearth with the owner email, password, and authenticator code.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-full bg-[#efe6d6] px-5 py-3 text-sm text-[#101918]"
            onClick={() => {
              clearOwnerToken();
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
