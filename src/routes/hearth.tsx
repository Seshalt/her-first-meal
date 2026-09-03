import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { markAtelierReady } from "@/lib/atelier-ready";
import { getMyRole } from "@/lib/server/admin";
import { recoverOwner } from "@/lib/server/public";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { getEmailFactorStatus, requestEmailFactor } from "@/lib/server/email-factor";
import { EmailFactorForm } from "@/components/security/email-factor";
import { readableAuthError } from "@/lib/auth/errors";

export const Route = createFileRoute("/hearth")({ component: Hearth });

function Hearth() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [factor, setFactor] = useState<{
    needed: boolean;
    sent: boolean;
    configured: boolean;
    emailMasked: string;
  } | null>(null);
  const guard = useFormGuard();

  useEffect(() => {
    document.title = "Private";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow, noarchive";
    document.head.appendChild(robots);
    return () => {
      robots.remove();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let live = true;
    void (async () => {
      try {
        const status = await getEmailFactorStatus();
        if (!live) return;
        if (status.needed) {
          const sent = await requestEmailFactor();
          if (live) setFactor(sent);
          return;
        }
        const r = await getMyRole();
        if (!live) return;
        if (r.role === "admin") {
          markAtelierReady();
          void navigate({ to: "/admin" });
        }
      } catch {
        /* stay on the door */
      }
    })();
    return () => {
      live = false;
    };
  }, [user, navigate]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      const message = "Tick the box that says you are a person.";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (password.length < 12) {
      const message = "Use at least 12 characters.";
      setFormError(message);
      toast.error(message);
      return;
    }
    if (password !== confirm) {
      const message = "Those two passwords do not match.";
      setFormError(message);
      toast.error(message);
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      await recoverOwner({
        data: {
          email,
          password,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      setSaved(true);
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/hearth",
      });
      if (error) {
        toast.success("Password saved. Sign in below with it.");
        return;
      }
      const status = await requestEmailFactor();
      if (status.needed) {
        setFactor(status);
        toast.success("Password saved. Enter the email code to finish.");
        return;
      }
      markAtelierReady();
      toast.success("Password saved.");
      void navigate({ to: "/admin" });
    } catch (err) {
      const message = readableAuthError(err, "Could not save that password.");
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[#101918] px-5 text-[#efe6d6]">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.32em] text-[#c4a574]">Private door</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05]">The hearth.</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#efe6d6]/70">
          Set a new owner password, then enter. Use the owner email already on this house. Members never see this page.
        </p>
        {factor?.needed ? (
          <div className="mt-8">
            <EmailFactorForm
              emailMasked={factor.emailMasked}
              sent={factor.sent}
              configured={factor.configured}
              onVerified={() => {
                setFactor(null);
                markAtelierReady();
                void navigate({ to: "/admin" });
              }}
            />
          </div>
        ) : authEnabled ? (
          <form onSubmit={(e) => void onSave(e)} className="mt-8 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div>
              <Label htmlFor="hearth-email">Owner email</Label>
              <Input
                id="hearth-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#efe6d6] text-[#101918]"
              />
            </div>
            <div>
              <Label htmlFor="hearth-new">New password</Label>
              <Input
                id="hearth-new"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#efe6d6] text-[#101918]"
              />
            </div>
            <div>
              <Label htmlFor="hearth-confirm">Type it again</Label>
              <Input
                id="hearth-confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-[#efe6d6] text-[#101918]"
              />
              <p className="mt-2 text-xs text-[#efe6d6]/50">Twelve characters at least. This replaces the old password.</p>
            </div>
            <HumanCheck
              tone="dark"
              checked={guard.human}
              onChecked={guard.setHuman}
              honey={guard.honey}
              onHoney={guard.setHoney}
            />
            {formError ? (
              <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">
                {formError}
              </p>
            ) : saved ? (
              <p className="rounded-xl bg-[#2a5a4a] px-4 py-3 text-sm">Password saved. You can enter the atelier.</p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Saving…" : "Save password and enter"}
            </Button>
          </form>
        ) : (
          <p className="mt-6 text-sm">Sign-in is disabled.</p>
        )}
        {!isPending && user ? (
          <p className="mt-6 text-xs text-[#efe6d6]/40">A session is already open in this browser.</p>
        ) : null}
      </div>
    </div>
  );
}
