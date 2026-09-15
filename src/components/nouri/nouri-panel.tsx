import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export function NouriFab() {
  return (
    <Link to="/app/nouri" className="member-support-fab" aria-label="Contact support" title="Support">
      <Mail className="size-[1.05rem]" />
    </Link>
  );
}
