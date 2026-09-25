import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Copy, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authClient, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { markAtelierReady } from "@/lib/atelier-ready";
import { getMyRole } from "@/lib/server/admin";
import { hasAdministrator, recoverOwner } from "@/lib/server/public";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { clearOwnerToken, persistOwnerToken, restoreOwnerToken, waitForSignedInUser } from "@/lib/session-ready";

export const Route = createFileRoute("/hearth")({ component: Hearth });

type DoorMode = "bootstrap" | "signin" | "mfa-setup" | "mfa-challenge" | "backup";

function totpSecret(uri: string) {
  try {
    return new URL(uri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

function Hearth() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<DoorMode>("signin");
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [lastingStore, setLastingStore] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [setupUri, setSetupUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedCodes, setSavedCodes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const guard = useFormGuard();

  const secret = useMemo(() => totpSecret(setupUri), [setupUri]);

  useEffect(() => {
    document.title = "Private";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow, noarchive";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  useEffect(() => {
    restoreOwnerToken();
    void hasAdministrator()
      .then((status) => {
        setHasAdmin(status.hasAdmin);
        setLastingStore(status.lastingStore !== false);
        setMode(status.hasAdmin ? "signin" : "bootstrap");
      })
      .catch(() => {
        setHasAdmin(false);
        setMode("bootstrap");
      });
  }, []);

  useEffect(() => {
    if (isPending || !user || mode === "mfa-challenge" || mode === "backup") return;
    let live = true;
    void getMyRole()
      .then((role) => {
        if (!live || role.role !== "admin") return;
        if (role.mfaEnabled) {
          markAtelierReady();
          window.location.replace("/admin");
          return;
        }
        setMode("mfa-setup");
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [isPending, mode, user]);

  function fail(message: string) {
    setFormError(message);
    toast.error(message);
  }

  async function finishAdminEntry() {
    clearOwnerToken();
    await authClient.getSession().catch(() => undefined);
    const role = await getMyRole();
    if (role.role !== "admin" || !role.mfaEnabled) {
      await authClient.signOut().catch(() => undefined);
      throw new Error("This account is not authorized for the atelier.");
    }
    markAtelierReady();
    toast.success("Identity confirmed.");
    window.location.replace("/admin");
  }

  async function onBootstrap(event: FormEvent) {
    event.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) return fail("Tick the box that says you are a person.");
    if (password.length < 12) return fail("Use a password of at least 12 characters.");
    if (password !== confirm) return fail("Those two passwords do not match.");

    setBusy(true);
    setFormError("");
    try {
      const saved = await recoverOwner({
        data: {
          email: email.trim().toLowerCase(),
          password,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      if (saved.lastingStore === false) {
        toast.message("The owner account is temporary until the production database is connected.");
      }
      if (!saved.token) throw new Error("The owner account was created, but the secure session did not open.");
      persistOwnerToken(saved.token);
      const sessionUser = await waitForSignedInUser(10);
      if (!sessionUser) throw new Error("The owner account exists. Refresh this page and sign in.");
      setHasAdmin(true);
      setMode("mfa-setup");
      toast.success("Owner account created. Add your authenticator before entering the atelier.");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not create the owner account.");
    } finally {
      setBusy(false);
    }
  }

  async function onSignIn(event: FormEvent) {
    event.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) return fail("Tick the box that says you are a person.");

    setBusy(true);
    setFormError("");
    try {
      clearOwnerToken();
      if (user) await authClient.signOut().catch(() => undefined);

      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe: true,
      });
      if (error) throw new Error(error.message ?? "That email or password does not match.");

      const result = data as
        | { twoFactorRedirect?: boolean; twoFactorMethods?: string[]; user?: { id: string } }
        | null;

      if (result?.twoFactorRedirect) {
        setMfaCode("");
        setMode("mfa-challenge");
        return;
      }

      await authClient.getSession();
      const role = await getMyRole();
      if (role.role !== "admin") {
        await authClient.signOut().catch(() => undefined);
        throw new Error("This account is not authorized for the atelier.");
      }
      if (!role.mfaEnabled) {
        setMode("mfa-setup");
        toast.message("Authenticator setup is required before admin access.");
        return;
      }

      await finishAdminEntry();
    } catch (err) {
      fail(err instanceof Error ? err.message : "That email or password does not match.");
    } finally {
      setBusy(false);
    }
  }

  async function beginMfaSetup() {
    if (!password) return fail("Enter your owner password first.");
    setBusy(true);
    setFormError("");
    try {
      const { data, error } = await authClient.twoFactor.enable({
        password,
        issuer: "Her First Meal Admin",
      });
      if (error) throw new Error(error.message ?? "Authenticator setup could not start.");
      if (!data?.totpURI || !data.backupCodes?.length) {
        throw new Error("Authenticator setup did not return a secret and recovery codes.");
      }
      setSetupUri(data.totpURI);
      setBackupCodes(data.backupCodes);
      setSavedCodes(false);
      setMfaCode("");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Authenticator setup could not start.");
    } finally {
      setBusy(false);
    }
  }

  async function verifySetup(event: FormEvent) {
    event.preventDefault();
    if (!savedCodes) return fail("Save the recovery codes before finishing MFA setup.");
    const code = mfaCode.replace(/\D/g, "");
    if (code.length !== 6) return fail("Enter the six-digit code from your authenticator app.");

    setBusy(true);
    setFormError("");
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: false,
      });
      if (error) throw new Error(error.message ?? "That authenticator code did not match.");

      // Enabling MFA replaces the active setup session. Remove any older
      // bootstrap bearer before revoking every other session.
      clearOwnerToken();
      await authClient.revokeOtherSessions().catch(() => undefined);
      await finishAdminEntry();
    } catch (err) {
      fail(err instanceof Error ? err.message : "That authenticator code did not match.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyChallenge(event: FormEvent) {
    event.preventDefault();
    const code = mfaCode.replace(/\D/g, "");
    if (code.length !== 6) return fail("Enter the six-digit code from your authenticator app.");

    setBusy(true);
    setFormError("");
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: false,
      });
      if (error) throw new Error(error.message ?? "That authenticator code did not match.");
      await finishAdminEntry();
    } catch (err) {
      fail(err instanceof Error ? err.message : "That authenticator code did not match.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyBackup(event: FormEvent) {
    event.preventDefault();
    const code = mfaCode.trim();
    if (!code) return fail("Enter one of your recovery codes.");

    setBusy(true);
    setFormError("");
    try {
      const { error } = await authClient.twoFactor.verifyBackupCode({
        code,
        trustDevice: false,
      });
      if (error) throw new Error(error.message ?? "That recovery code is not valid.");
      await finishAdminEntry();
    } catch (err) {
      fail(err instanceof Error ? err.message : "That recovery code is not valid.");
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      toast.success("Authenticator key copied.");
    } catch {
      toast.message("Select and copy the key manually.");
    }
  }

  async function copyBackupCodes() {
    if (!backupCodes.length) return;
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Recovery codes copied.");
    } catch {
      toast.message("Select and copy the recovery codes manually.");
    }
  }

  const initialLoading = hasAdmin === null;

  return (
    <div className="grid min-h-dvh place-items-center bg-[#101918] px-5 py-10 text-[#efe6d6]">
      <div className="w-full max-w-lg">
        <p className="text-xs uppercase tracking-[0.32em] text-[#c4a574]">Private door</p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05]">The hearth.</h1>

        {initialLoading ? (
          <p className="mt-6 text-sm text-[#efe6d6]/60">Checking the owner door…</p>
        ) : null}

        {!lastingStore ? (
          <p className="mt-4 rounded-2xl bg-[#8a4a3b]/80 px-4 py-3 text-sm">
            The production database is not persistent yet. Do not rely on owner access until Neon is connected.
          </p>
        ) : null}

        {authEnabled && !initialLoading && mode === "bootstrap" ? (
          <>
            <p className="mt-4 text-sm leading-relaxed text-[#efe6d6]/70">
              Create the one owner account. After this, the recovery door closes and every admin login requires an authenticator code.
            </p>
            <form onSubmit={onBootstrap} className="mt-8 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div>
                <Label htmlFor="owner-email">Owner email</Label>
                <Input id="owner-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#efe6d6] text-[#101918]" />
              </div>
              <div>
                <Label htmlFor="owner-password">Create password</Label>
                <Input id="owner-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#efe6d6] text-[#101918]" />
              </div>
              <div>
                <Label htmlFor="owner-confirm">Type it again</Label>
                <Input id="owner-confirm" type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="bg-[#efe6d6] text-[#101918]" />
                <p className="mt-2 text-xs text-[#efe6d6]/50">Use at least 12 characters. MFA setup is required next.</p>
              </div>
              <HumanCheck tone="dark" checked={guard.human} onChecked={guard.setHuman} honey={guard.honey} onHoney={guard.setHoney} />
              {formError ? <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">{formError}</p> : null}
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? "Creating owner…" : "Create owner and set up MFA"}
              </Button>
            </form>
          </>
        ) : null}

        {authEnabled && !initialLoading && mode === "signin" ? (
          <>
            <p className="mt-4 text-sm leading-relaxed text-[#efe6d6]/70">
              Owner password first. Then the authenticator code. Admin access does not trust remembered devices.
            </p>
            <form onSubmit={onSignIn} className="mt-8 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div>
                <Label htmlFor="hearth-email">Owner email</Label>
                <Input id="hearth-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#efe6d6] text-[#101918]" />
              </div>
              <div>
                <Label htmlFor="hearth-password">Password</Label>
                <Input id="hearth-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#efe6d6] text-[#101918]" />
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-[#c4a574] underline-offset-4 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <HumanCheck tone="dark" checked={guard.human} onChecked={guard.setHuman} honey={guard.honey} onHoney={guard.setHoney} />
              {formError ? <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">{formError}</p> : null}
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? "Checking password…" : "Continue"}
              </Button>
            </form>
          </>
        ) : null}

        {authEnabled && mode === "mfa-challenge" ? (
          <form onSubmit={verifyChallenge} className="mt-8 space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="grid size-12 place-items-center rounded-full bg-[#c4a574]/15 text-[#c4a574]">
              <LockKeyhole className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#c4a574]">Second factor</p>
              <h2 className="mt-2 font-display text-3xl">Authenticator code</h2>
              <p className="mt-2 text-sm leading-6 text-[#efe6d6]/65">
                Open your authenticator app and enter the current six-digit code.
              </p>
            </div>
            <div>
              <Label htmlFor="mfa-code">6-digit code</Label>
              <Input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="bg-[#efe6d6] text-center font-mono text-xl tracking-[0.35em] text-[#101918]" />
            </div>
            {formError ? <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">{formError}</p> : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Verifying…" : "Verify and enter"}
            </Button>
            <button type="button" className="w-full text-center text-xs text-[#c4a574] underline-offset-4 hover:underline" onClick={() => { setMfaCode(""); setFormError(""); setMode("backup"); }}>
              Use a recovery code instead
            </button>
          </form>
        ) : null}

        {authEnabled && mode === "backup" ? (
          <form onSubmit={verifyBackup} className="mt-8 space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="grid size-12 place-items-center rounded-full bg-[#c4a574]/15 text-[#c4a574]">
              <KeyRound className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#c4a574]">Recovery</p>
              <h2 className="mt-2 font-display text-3xl">Use one backup code.</h2>
              <p className="mt-2 text-sm leading-6 text-[#efe6d6]/65">
                Each recovery code works once. Use this only if you cannot access your authenticator app.
              </p>
            </div>
            <div>
              <Label htmlFor="backup-code">Recovery code</Label>
              <Input id="backup-code" autoComplete="one-time-code" required value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="bg-[#efe6d6] font-mono text-[#101918]" />
            </div>
            {formError ? <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">{formError}</p> : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy ? "Verifying…" : "Use recovery code"}
            </Button>
            <button type="button" className="w-full text-center text-xs text-[#c4a574] underline-offset-4 hover:underline" onClick={() => { setMfaCode(""); setFormError(""); setMode("mfa-challenge"); }}>
              Back to authenticator code
            </button>
          </form>
        ) : null}

        {authEnabled && mode === "mfa-setup" ? (
          <div className="mt-8 space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="grid size-12 place-items-center rounded-full bg-[#c4a574]/15 text-[#c4a574]">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#c4a574]">Required admin security</p>
              <h2 className="mt-2 font-display text-3xl">Set up MFA.</h2>
              <p className="mt-2 text-sm leading-6 text-[#efe6d6]/65">
                Use Google Authenticator, Microsoft Authenticator, 1Password, Authy, or another TOTP app. Your authenticator secret stays between this site and your device.
              </p>
            </div>

            {!setupUri ? (
              <>
                <div>
                  <Label htmlFor="mfa-password">Owner password</Label>
                  <Input id="mfa-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#efe6d6] text-[#101918]" />
                </div>
                {formError ? <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">{formError}</p> : null}
                <Button type="button" className="w-full" size="lg" disabled={busy} onClick={() => void beginMfaSetup()}>
                  {busy ? "Creating secure key…" : "Create authenticator key"}
                </Button>
              </>
            ) : (
              <form onSubmit={verifySetup} className="space-y-5">
                <section className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4a574]">1. Add account manually</p>
                  <p className="mt-3 text-xs leading-5 text-[#efe6d6]/60">
                    In your authenticator app choose “Enter setup key” or “Manual entry.” Account: <strong className="text-[#efe6d6]">{email || "owner"}</strong>. Type: time based.
                  </p>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#efe6d6] px-3 py-2 text-[#101918]">
                    <code className="min-w-0 flex-1 break-all text-xs">{secret}</code>
                    <button type="button" className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#101918] text-[#efe6d6]" aria-label="Copy authenticator key" onClick={() => void copySecret()}>
                      <Copy className="size-4" />
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4a574]">2. Save recovery codes</p>
                    <button type="button" className="inline-flex items-center gap-1 text-xs text-[#c4a574]" onClick={() => void copyBackupCodes()}>
                      <Copy className="size-3.5" /> Copy
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {backupCodes.map((code) => (
                      <code key={code} className="rounded-lg bg-[#efe6d6] px-2 py-2 text-center text-xs text-[#101918]">{code}</code>
                    ))}
                  </div>
                  <label className="mt-4 flex items-start gap-3 text-sm text-[#efe6d6]/75">
                    <input type="checkbox" className="mt-0.5 size-4 accent-[#c4a574]" checked={savedCodes} onChange={(e) => setSavedCodes(e.target.checked)} />
                    <span>I saved these recovery codes somewhere private.</span>
                  </label>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4a574]">3. Confirm the app</p>
                  <Label htmlFor="setup-code" className="mt-3">Current 6-digit code</Label>
                  <Input id="setup-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-2 bg-[#efe6d6] text-center font-mono text-xl tracking-[0.35em] text-[#101918]" />
                </section>

                {formError ? <p className="rounded-xl bg-[#8a4a3b] px-4 py-3 text-sm" role="alert">{formError}</p> : null}
                <Button type="submit" className="w-full" size="lg" disabled={busy || !savedCodes}>
                  {busy ? "Locking the admin door…" : "Enable MFA and enter"}
                </Button>
                <p className="flex items-start gap-2 text-xs leading-5 text-[#efe6d6]/50">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[#c4a574]" />
                  After setup, older admin sessions are revoked. Every new password login requires a fresh authenticator or recovery code.
                </p>
              </form>
            )}
          </div>
        ) : null}

        {!authEnabled ? <p className="mt-6 text-sm">Sign-in is disabled.</p> : null}
      </div>
    </div>
  );
}
