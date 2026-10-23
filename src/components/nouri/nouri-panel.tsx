import { useText as useContentText } from "@/lib/i18n/use-text";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";

export function NouriFab() {
  const localizeContent = useContentText();
  return (
    <Link to="/app/nouri" className="member-support-fab" aria-label={localizeContent("Contact support")} title={localizeContent("Support")}>
      <Mail className="size-[1.05rem]" />
    </Link>
  );
}
