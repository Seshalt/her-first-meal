import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { markAtelierReady } from "@/lib/atelier-ready";
import { getMyRole } from "@/lib/server/admin";
import { hasAdministrator, recoverOwner, enterOwner } from "@/lib/server/public";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { persistOwnerToken, restoreOwnerToken, waitForSignedInUser } from "@/lib/session-ready";

export const Route = createFileRoute("/hearth")({ component: Hearth });

function Hearth() {
  const { user, isPending } = useCurrentUserState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [mode, setMode] = useState<"save" | "enter">("save");
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
    restoreOwnerToken();
    void hasAdministrator()
      .then((s) => {
                setLastingStore(s.lastingStore !== false);
        if (!s.hasAdmin) setMode("save");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user || isPending) return;
    let live = true;
    void getMyRole()
      .then((r) => {
        if (!live) return;
        if (r.role === "admin") markAtelierReady();
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [user, isPending]);

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
      const nextEmail = email.trim().toLowerCase();
      const nextPassword = password;
      const saved = await recoverOwner({
        data: {
          email: nextEmail,
          password: nextPassword,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      if (saved.lastingStore === false) {
        toast.message("Password saved for this server only. Add a database on Vercel so it survives reloads.");
      }
      if (!saved.token) throw new Error("Password is saved, but the session did not open. Wait one minute and tap Enter.");
      persistOwnerToken(saved.token);
      const sessionUser = await waitForSignedInUser(8);
      if (!sessionUser) throw new Error("Password is saved. Refresh this page, then tap Continue to the atelier.");
      markAtelierReady();
      toast.success("You are in.");
      window.location.replace("/admin");
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Could not save that password.";
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
      const entered = await enterOwner({
        data: {
          email: email.trim().toLowerCase(),
          password,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      if (!entered.token) throw new Error("Could not open a session. Try Set new password.");
      persistOwnerToken(entered.token);
      const sessionUser = await waitForSignedInUser(8);
      if (!sessionUser) throw new Error("Session did not stick. Refresh, then tap Continue to the atelier.");
      markAtelierReady();
      toast.success("You are in.");
      window.location.replace("/admin");
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "That email or password does not match.";
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
          Set a new email and password, then you should go straight into the atelier. You should not have to sign in a second time.
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
                Set new password
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
          <div className="mt-6 space-y-3">
            <p className="text-xs text-[#efe6d6]/40">A session is already open in this browser.</p>
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => {
                window.location.replace("/admin");
              }}
            >
              Continue to the atelier
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
