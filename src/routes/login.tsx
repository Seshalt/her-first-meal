import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { atelierReadyLocal, markAtelierReady } from "@/lib/atelier-ready";
import { getMyRole } from "@/lib/server/admin";
import { hasAdministrator, recoverOwner } from "@/lib/server/public";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { usePublicSite } from "@/lib/use-public-site";
import { getEmailFactorStatus, requestEmailFactor } from "@/lib/server/email-factor";
import { EmailFactorForm } from "@/components/security/email-factor";
import { readableAuthError } from "@/lib/auth/errors";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { next?: "/admin" } =>
    s.next === "/admin" ? { next: "/admin" } : {},
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const ownerDoor = next === "/admin";
  const { user, isPending } = useCurrentUserState();
  const { site, content } = usePublicSite();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [home, setHome] = useState<"/" | "/app" | "/admin" | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formError, setFormError] = useState("");
  const [recover, setRecover] = useState(ownerDoor);
  const [newPassword, setNewPassword] = useState("");
  const [factor, setFactor] = useState<{
    needed: boolean;
    sent: boolean;
    configured: boolean;
    emailMasked: string;
  } | null>(null);
  const guard = useFormGuard();

  useEffect(() => {
    if (atelierReadyLocal()) {
      setShowCreate(false);
      return;
    }
    void hasAdministrator()
      .then((r) => setShowCreate(!r.hasAdmin))
      .catch(() => setShowCreate(false));
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
        if (r.role === "admin") markAtelierReady();
        setHome(r.role === "admin" || ownerDoor ? "/admin" : "/app");
      } catch {
        if (live) setHome(ownerDoor ? "/admin" : "/app");
      }
    })();
    return () => {
      live = false;
    };
  }, [user, ownerDoor]);

  if (!isPending && user && factor?.needed) {
    // stay on the door and collect the email code
  } else if (!isPending && user && home) {
    return <Navigate to={home} />;
  }

  async function onEmail(e: FormEvent) {
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
        callbackURL: ownerDoor ? "/login?next=/admin" : "/login",
      });
      if (error) throw error;
      const status = await requestEmailFactor();
      if (status.needed) {
        setFactor(status);
        toast.success(status.sent ? `A code is on the way to ${status.emailMasked}.` : "Enter the email code to finish signing in.");
        return;
      }
      const r = await getMyRole();
      if (r.role === "admin") markAtelierReady();
      void navigate({ to: r.role === "admin" || ownerDoor ? "/admin" : "/app" });
    } catch (err) {
      const message = readableAuthError(err, "That email or password does not match.");
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function onRecover(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      const message = "Please confirm you are a person.";
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
          password: newPassword,
          honey: guard.honey,
          startedAt: guard.startedAt,
          human: guard.human,
        },
      });
      setPassword(newPassword);
      setRecover(false);
      const { error } = await authClient.signIn.email({
        email,
        password: newPassword,
        callbackURL: "/login?next=/admin",
      });
      if (error) {
        toast.success("Owner password saved. Sign in with it now.");
        return;
      }
      markAtelierReady();
      toast.success("Owner password saved. Entering the atelier.");
      void navigate({ to: "/admin" });
    } catch (err) {
      const message = readableAuthError(err, "Could not update the owner password.");
      setFormError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PublicNav overlay />
      <section className="grid min-h-dvh lg:grid-cols-2">
        <div className="relative hidden min-h-dvh overflow-hidden text-paper lg:block">
          <img
            src={content.images.login}
            alt=""
            className="media absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-veil pointer-events-none absolute inset-0" />
          <div className="relative flex min-h-dvh flex-col justify-end px-12 pb-16 pt-32">
            <p className="text-xs uppercase tracking-[0.32em] text-aqua">{site.loginKicker}</p>
            <p className="mt-6 max-w-md font-display text-5xl leading-[1.05]">
              {site.loginPhotoLine}
            </p>
          </div>
        </div>
        <div className="flex min-h-dvh flex-col justify-center bg-wash-linen px-5 py-28 md:px-16">
          <p className="text-xs uppercase tracking-[0.32em] text-clay">
            {ownerDoor ? "Owner atelier" : site.loginEyebrow}
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">
            {ownerDoor ? "Owner sign in." : site.loginTitle}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            {ownerDoor
              ? "Use the owner email and password. The same door as members — your role opens the atelier."
              : site.loginBody}
          </p>
          <div className="editorial-rule mt-8" />
          {factor?.needed ? (
            <EmailFactorForm
              emailMasked={factor.emailMasked}
              sent={factor.sent}
              configured={factor.configured}
              onVerified={() => {
                setFactor(null);
                void getMyRole()
                  .then((r) => {
                    if (r.role === "admin") markAtelierReady();
                    void navigate({ to: r.role === "admin" || ownerDoor ? "/admin" : "/app" });
                  })
                  .catch(() => void navigate({ to: ownerDoor ? "/admin" : "/app" }));
              }}
            />
          ) : (
            <>
          {authEnabled ? (
            <div className="mt-10 space-y-3">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full max-w-md"
                  onClick={() => void signIn(p.providerId, { callbackURL: "/login" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Sign-in is disabled.</p>
          )}
          <form onSubmit={onEmail} className="glass-panel mt-8 max-w-md space-y-4 p-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <HumanCheck
              checked={guard.human}
              onChecked={guard.setHuman}
              honey={guard.honey}
              onHoney={guard.setHoney}
            />
            {formError ? (
              <p className="rounded-xl bg-clay px-4 py-3 text-sm text-paper" role="alert">
                {formError}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={busy || !guard.human}>
              {busy ? "Entering…" : ownerDoor ? "Enter the atelier" : "Enter the house"}
            </Button>
          </form>
          <div className="mt-6 max-w-md">
              <button
                type="button"
                className="text-sm text-primary underline-offset-4 hover:underline"
                onClick={() => setRecover((v) => !v)}
              >
                {recover ? "Hide owner password reset" : "Forgot the owner password? Set a new one"}
              </button>
              {recover ? (
                <form onSubmit={(e) => void onRecover(e)} className="glass-panel mt-4 space-y-4 p-5">
                  <p className="text-sm text-ink-soft">
                    Enter Maat’s email and a new password. This replaces the old one and signs you into the atelier.
                  </p>
                  <div>
                    <Label htmlFor="recover-email">Owner email</Label>
                    <Input
                      id="recover-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New owner password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <HumanCheck
                    checked={guard.human}
                    onChecked={guard.setHuman}
                    honey={guard.honey}
                    onHoney={guard.setHoney}
                  />
                  {formError ? (
                    <p className="rounded-xl bg-clay px-4 py-3 text-sm text-paper" role="alert">
                      {formError}
                    </p>
                  ) : null}
                  <Button type="submit" className="w-full" disabled={busy || !guard.human}>
                    {busy ? "Saving…" : "Save new owner password"}
                  </Button>
                </form>
              ) : null}
            </div>
          <p className="mt-8 max-w-md text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/pricing" className="text-primary">
              Start your journey today
            </Link>
          </p>
          {showCreate ? (
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              First time opening the house?{" "}
              <Link to="/admin/setup" className="text-primary">
                Create the owner account
              </Link>
            </p>
          ) : (
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Owner? Sign in with that email — you will land in the atelier.
            </p>
          )}
            </>
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
