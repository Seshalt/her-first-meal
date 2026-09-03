import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/setup")({ component: SetupGone });

function SetupGone() {
  return <Navigate to="/hearth" />;
}