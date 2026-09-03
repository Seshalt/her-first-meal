import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { atelierReadyLocal, markAtelierReady } from "@/lib/atelier-ready";
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
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [mode, setMode] = useState<"enter" | "set">("set");
  const [factor, setFactor] = useState<{
    needed: boolean;
    sent: boolean;
    configured: boolean;
    emailMasked: string;
  } | null>(null);
  const guard = useFormGuard();

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
        /* stay */
      }
    })();
    return () => {
      live = false;
    };
  }, [user, navigate]);

  async function onEnter(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      toast.error("Please confirm you are a person.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/hearth",
      });
      if (error) throw error;
      const status = await requestEmailFactor();
      if (status.needed) {
        setFactor(status);
        toast.success(status.sent ? `A code is on the way to ${status.emailMasked}.` : "Enter the email code.");
        return;
      }
      const r = await getMyRole();
      if (r.role !== "admin") {
        await authClient.signOut();
        throw new Error("That door is not open for this account.");
      }
      markAtelierReady();
      void navigate({ to: "/admin" });
    } catch (err) {
      const message = readableAuthError(err, "That email or password does not match.");
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onSet(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      toast.error("Please confirm you are a person.");
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      await recoverOwner({
        data: {
          email,
          password: newPassword,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      const { error } = await authClient.signIn.email({
        email,
        password: newPassword,
        callbackURL: "/hearth",
      });
      if (error) {
        toast.success("Password saved. Sign in with it now.");
        setPassword(newPassword);
        setMode("enter");
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

  if (!isPending && user && factor?.needed) {
    // collect code
  } else if (!isPending && user && atelierReadyLocal()) {
    return <Navigate to="/admin" />;
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[#101918] px-5 text-[#efe6d6]">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.32em] text-[#c4a574]">Private door</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05]">The hearth.</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#efe6d6]/70">
          Staff only. Members use the public sign-in. Set a new password or enter with the one you already keep.
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
        ) : (
          <>
            <div className="mt-8 flex gap-3 text-sm">
              <button type="button" className={mode === "set" ? "underline" : "text-[#efe6d6]/50"} onClick={() => setMode("set")}>
                Set password
              </button>
              <button type="button" className={mode === "enter" ? "underline" : "text-[#efe6d6]/50"} onClick={() => setMode("enter")}>
                Sign in
              </button>
            </div>
            {authEnabled ? (
              <form onSubmit={mode === "set" ? onSet : onEnter} className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div>
                  <Label htmlFor="hearth-email">Email</Label>
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
                {mode === "set" ? (
                  <div>
                    <Label htmlFor="hearth-new">New password</Label>
                    <Input
                      id="hearth-new"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={12}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#efe6d6] text-[#101918]"
                    />
                    <p className="mt-2 text-xs text-[#efe6d6]/50">At least 12 characters. This replaces the old owner password.</p>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="hearth-password">Password</Label>
                    <Input
                      id="hearth-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#efe6d6] text-[#101918]"
                    />
                  </div>
                )}
                <HumanCheck checked={guard.human} onChecked={guard.setHuman} honey={guard.honey} onHoney={guard.setHoney} />
                {formError ? (
                  <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">
                    {formError}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" size="lg" disabled={busy || !guard.human}>
                  {busy ? "Working…" : mode === "set" ? "Save password" : "Enter"}
                </Button>
              </form>
            ) : (
              <p className="mt-6 text-sm">Sign-in is disabled.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
