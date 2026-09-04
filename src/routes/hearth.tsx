import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { markAtelierReady } from "@/lib/atelier-ready";
import { getMyRole } from "@/lib/server/admin";
import { hasAdministrator, recoverOwner } from "@/lib/server/public";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { readableAuthError } from "@/lib/auth/errors";

export const Route = createFileRoute("/hearth")({ component: Hearth });

function Hearth() {
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [mode, setMode] = useState<"save" | "enter">("enter");
  const [hasAdmin, setHasAdmin] = useState(true);
  const [lastingStore, setLastingStore] = useState(true);
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
    void hasAdministrator()
      .then((s) => {
        setHasAdmin(s.hasAdmin);
        setLastingStore(s.lastingStore !== false);
        if (!s.hasAdmin) setMode("save");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) return;
    let live = true;
    void getMyRole()
      .then((r) => {
        if (!live) return;
        if (r.role === "admin") {
          markAtelierReady();
          window.location.assign("/admin");
        }
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [user]);

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
      const message = "Use a password of at least 12 characters.";
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
      const nextPassword = password;
      const saved = await recoverOwner({
        data: {
          email,
          password: nextPassword,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      if (saved.lastingStore === false) {
        toast.message("Password saved for this server only. Add a database on Vercel so it survives reloads.");
      }
      const { error } = await authClient.signIn.email({
        email,
        password: nextPassword,
        rememberMe: true,
      });
      if (error) {
        setMode("enter");
        toast.success("Password is saved. Use Sign in with the same email and password.");
        return;
      }
      markAtelierReady();
      toast.success("You are in.");
      window.location.assign("/admin");
    } catch (err) {
      const message = readableAuthError(err, "Could not save that password.");
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onEnter(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      const message = "Tick the box that says you are a person.";
      setFormError(message);
      toast.error(message);
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const { error } = await authClient.signIn.email({ email, password, rememberMe: true });
      if (error) throw error;
      markAtelierReady();
      toast.success("You are in.");
      window.location.assign("/admin");
    } catch (err) {
      const message = readableAuthError(err, "That email or password does not match.");
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
          {hasAdmin
            ? "Sign in with the owner email and the password already saved. Use Reset password only when you want a new one."
            : "Create the owner password once. After that, use Sign in — do not create it again unless you are resetting it."}
        </p>
        {!lastingStore ? (
          <p className="mt-4 rounded-2xl bg-[#8a4a3b]/80 px-4 py-3 text-sm">
            This live site does not have a lasting database yet. Accounts vanish when the server sleeps. In Vercel, add
            DATABASE_URL (Neon) to the production project so the owner login stays.
          </p>
        ) : null}
        {authEnabled ? (
          <form onSubmit={(e) => void (mode === "save" ? onSave(e) : onEnter(e))} className="mt-8 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex gap-4 text-sm">
              <button type="button" className={mode === "enter" ? "underline" : "text-[#efe6d6]/50"} onClick={() => setMode("enter")}>
                Sign in
              </button>
              <button type="button" className={mode === "save" ? "underline" : "text-[#efe6d6]/50"} onClick={() => setMode("save")}>
                {hasAdmin ? "Reset password" : "Create password"}
              </button>
            </div>
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
              <Label htmlFor="hearth-new">{mode === "save" ? "New password" : "Password"}</Label>
              <Input
                id="hearth-new"
                type="password"
                autoComplete={mode === "save" ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#efe6d6] text-[#101918]"
              />
            </div>
            {mode === "save" ? (
              <div>
                <Label htmlFor="hearth-confirm">Type it again</Label>
                <Input
                  id="hearth-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="bg-[#efe6d6] text-[#101918]"
                />
                <p className="mt-2 text-xs text-[#efe6d6]/50">Must be at least 12 characters.</p>
              </div>
            ) : null}
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
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Working…" : mode === "save" ? "Save password and enter" : "Enter"}
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
