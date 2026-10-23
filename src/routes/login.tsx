import { useText as useContentText } from "@/lib/i18n/use-text";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, rememberSessionToken, signIn } from "@/lib/auth/client";
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
  const localizeContent = useContentText();
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
        if (live) setFactor({ needed: true, sent: false, configured: false, emailMasked: "your email" });
      }
    })();
    return () => {
      live = false;
    };
  }, [user]);

  if (!isPending && user && factor?.needed) {
    // stay on the door and collect the email code
  } else if (!isPending && user && home) {
    return <Navigate to={home} replace />;
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      toast.error(localizeContent("Please confirm you are a person."));
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });
      if (error) throw error;
      rememberSessionToken((data as { token?: string } | null)?.token);
      const status = await requestEmailFactor();
      if (status.needed) {
        setFactor(status);
        toast.success(localizeContent(status.sent ? `A code is on the way to ${status.emailMasked}.` : "Enter the email code to finish signing in."));
        return;
      }
      window.location.replace("/app");
    } catch (err) {
      const message = readableAuthError(err, "That email or password does not match.");
      setFormError(message);
      toast.error(localizeContent(message));
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
            alt={localizeContent(content.alts.login)}
            className="media absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-veil pointer-events-none absolute inset-0" />
          <div className="relative flex min-h-dvh flex-col justify-end px-12 pb-16 pt-32">
            <p className="text-xs uppercase tracking-[0.32em] text-aqua">{localizeContent(site.loginKicker)}</p>
            <p className="mt-6 max-w-md font-display text-5xl leading-[1.05]">
              {localizeContent(site.loginPhotoLine)}
            </p>
          </div>
        </div>
        <div className="flex min-h-dvh flex-col justify-center bg-wash-linen px-5 py-28 md:px-16">
          <p className="text-xs uppercase tracking-[0.32em] text-clay">{localizeContent(site.loginEyebrow)}</p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">{localizeContent(site.loginTitle)}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{localizeContent(site.loginBody)}</p>
          <div className="editorial-rule mt-8" />
          {localizeContent(factor?.needed ? (
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
          {localizeContent(authEnabled ? (
            <div className="mt-10 space-y-3">
              {localizeContent(GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full max-w-md"
                  onClick={() => void signIn(p.providerId, { callbackURL: "/login" })}
                >
                  {localizeContent("Continue with ")}{localizeContent(p.label)}
                </Button>
              )))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">{localizeContent("Sign-in is disabled.")}</p>
          ))}
          <form onSubmit={onEmail} className="glass-panel mt-8 max-w-md space-y-4 p-6">
            <div>
              <Label htmlFor="email">{localizeContent("Email")}</Label>
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
              <Label htmlFor="password">{localizeContent("Password")}</Label>
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
            <div className="-mt-1 text-right">
              <Link to="/forgot-password" className="text-xs text-primary underline-offset-4 hover:underline">
                {localizeContent("Forgot password?")}</Link>
            </div>
            <HumanCheck
              checked={guard.human}
              onChecked={guard.setHuman}
              honey={guard.honey}
              onHoney={guard.setHoney}
            />
            {localizeContent(formError ? (
              <p className="rounded-xl bg-clay px-4 py-3 text-sm text-paper" role="alert">
                {localizeContent(formError)}
              </p>
            ) : null)}
            <Button type="submit" className="w-full" size="lg" disabled={busy || !guard.human}>
              {localizeContent(busy ? "Entering…" : "Enter the house")}
            </Button>
          </form>
          <p className="mt-8 max-w-md text-sm text-muted-foreground">
            {localizeContent("New here?")}{localizeContent(" ")}
            <Link to="/pricing" className="text-primary">
              {localizeContent("Start your journey today")}</Link>
          </p>
            </>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
