import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { usePublicSite } from "@/lib/use-public-site";
import { getEmailFactorStatus, requestEmailFactor } from "@/lib/server/email-factor";
import { EmailFactorForm } from "@/components/security/email-factor";
import { readableAuthError } from "@/lib/auth/errors";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { user, isPending } = useCurrentUserState();
  const { site, content } = usePublicSite();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [home, setHome] = useState<"/" | "/app" | null>(null);
  const [formError, setFormError] = useState("");
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
        if (live) setHome("/app");
      } catch {
        if (live) setHome("/app");
      }
    })();
    return () => {
      live = false;
    };
  }, [user]);

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
        rememberMe: true,
      });
      if (error) throw error;
      const status = await requestEmailFactor();
      if (status.needed) {
        setFactor(status);
        toast.success(status.sent ? `A code is on the way to ${status.emailMasked}.` : "Enter the email code to finish signing in.");
        return;
      }
      window.location.assign("/app");
    } catch (err) {
      const message = readableAuthError(err, "That email or password does not match.");
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
          <p className="text-xs uppercase tracking-[0.32em] text-clay">{site.loginEyebrow}</p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">{site.loginTitle}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{site.loginBody}</p>
          <div className="editorial-rule mt-8" />
          {factor?.needed ? (
            <EmailFactorForm
              emailMasked={factor.emailMasked}
              sent={factor.sent}
              configured={factor.configured}
              onVerified={() => {
                setFactor(null);
                void navigate({ to: "/app" });
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
              {busy ? "Entering…" : "Enter the house"}
            </Button>
          </form>
          <p className="mt-8 max-w-md text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/pricing" className="text-primary">
              Start your journey today
            </Link>
          </p>
            </>
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
