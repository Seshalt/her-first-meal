import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { RequireMember } from "@/components/gates/require-member";
import "../app-atmosphere.css";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname.startsWith("/app/onboarding");
  return (
    <RequireMember>
      <div className={bare ? "onboarding-shell" : "member-shell"}>
        {bare ? (
          <Outlet />
        ) : (
          <AppShell hideNouri={pathname.startsWith("/app/nouri")}>
            <Outlet />
          </AppShell>
        )}
      </div>
    </RequireMember>
  );
}
