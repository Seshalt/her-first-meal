import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { claimMembership, getCheckoutByToken } from "@/lib/server/checkout";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { EmailFactorForm } from "@/components/security/email-factor";
import { requestEmailFactor } from "@/lib/server/email-factor";
import { DietPicks } from "@/components/house/diet-picks";
import { LocaleSwitch } from "@/components/i18n/locale-switch";
import { JOIN_DIETS_STORAGE } from "@/lib/content/catalog";
import { saveJoinDiets } from "@/lib/server/profile";
import { useI18n } from "@/lib/i18n/provider";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/join")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  component: Join,
});

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function waitForSession() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const session = await authClient.getSession();
      if (session.data?.user) return true;
    } catch {
      /* session store can lag for a moment after signup */
    }
    await wait(220 + attempt * 140);
  }
  return false;
}

function Join() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const { site, content } = usePublicSite();
  const { t, locale } = useI18n();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [diets, setDiets] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [manualSignup, setManualSignup] = useState(false);
  const [factor, setFactor] = useState<{
    needed: boolean;
    sent: boolean;
    configured: boolean;
    emailMasked: string;
  } | null>(null);
  const guard = useFormGuard();

  useEffect(() => {
    if (!token) return;
    void getCheckoutByToken({ data: { token } }).then((row) => {
      if (row?.email) setEmail(row.email);
    });
  }, [token]);

  useEffect(() => {
    if (manualSignup || busy || isPending || !user || factor?.needed) return;
    let live = true;
    void claimMembership({ data: { token: token || undefined } })
      .then(() => {
        if (live) void navigate({ to: "/app/onboarding" });
      })
      .catch((err) => {
        if (live) toast.error(err instanceof Error ? err.message : "Could not open your account yet.");
      });
    return () => {
      live = false;
    };
  }, [busy, factor?.needed, isPending, manualSignup, navigate, token, user]);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      toast.error("Please confirm you are a person.");
      return;
    }
    setBusy(true);
    setManualSignup(true);
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: token ? `/join?token=${encodeURIComponent(token)}` : "/app/onboarding",
      });
      if (error) throw new Error(error.message);

      try {
        sessionStorage.setItem(JOIN_DIETS_STORAGE, JSON.stringify(diets));
      } catch {
        /* ignore */
      }

      let sessionReady = await waitForSession();
      if (!sessionReady) {
        const { error: signInError } = await authClient.signIn.email({ email, password });
        if (signInError) throw new Error(signInError.message ?? "Your account was created, but sign-in did not finish.");
        sessionReady = await waitForSession();
      }
      if (!sessionReady) throw new Error("Your account was created, but the secure session is still starting. Please sign in once and continue.");

      toast.success("Account created.");
      await claimMembership({ data: { token: token || undefined } });
      await saveJoinDiets({ data: { diets, language: locale } }).catch(() => undefined);
      const status = await requestEmailFactor();
      if (status.needed) {
        setFactor(status);
        return;
      }
      void navigate({ to: "/app/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the account.");
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
            src={content.images.join}
            alt={content.alts.join}
            className="media absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-veil pointer-events-none absolute inset-0" />
          <div className="relative flex min-h-dvh flex-col justify-end px-12 pb-16 pt-32">
            <p className="text-xs uppercase tracking-[0.32em] text-gold">{site.joinKicker}</p>
            <p className="mt-6 max-w-md font-display text-5xl leading-[1.05]">
              {site.joinPhotoLine}
            </p>
          </div>
        </div>
        <div className="flex min-h-dvh flex-col justify-center bg-wash-clay px-5 py-28 md:px-16">
          <p className="text-xs uppercase tracking-[0.32em] text-clay">{site.joinEyebrow}</p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">{site.joinTitle}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            {site.joinBody}
          </p>
          <div className="mt-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-earth">{t("join.language")}</p>
            <LocaleSwitch tone="gold" />
          </div>
          <div className="mt-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-earth">{t("join.howSheEats")}</p>
            <p className="max-w-md text-sm leading-relaxed text-ink-soft">{t("join.eatsHint")}</p>
            <DietPicks value={diets} onChange={setDiets} />
          </div>
          <div className="editorial-rule mt-8" />
          {authEnabled ? (
            <div className="mt-10 space-y-3">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full max-w-md"
                  onClick={() => {
                    try {
                      sessionStorage.setItem(JOIN_DIETS_STORAGE, JSON.stringify(diets));
                    } catch {
                      /* ignore */
                    }
                    void signIn(p.providerId, {
                      callbackURL: token ? `/join?token=${encodeURIComponent(token)}` : "/app/onboarding",
                    });
                  }}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : null}
          {factor?.needed ? (
            <EmailFactorForm
              emailMasked={factor.emailMasked}
              sent={factor.sent}
              configured={factor.configured}
              onVerified={() => {
                setFactor(null);
                void navigate({ to: "/app/onboarding" });
              }}
            />
          ) : (
          <form onSubmit={onEmail} className="glass-panel mt-8 max-w-md space-y-4 p-6">
            <div>
              <Label htmlFor="name">{t("join.name")}</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">{t("join.email")}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">{t("join.password")}</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={10}
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
            <Button type="submit" className="w-full" size="lg" disabled={busy || !guard.human}>
              {busy ? "Securing your account…" : t("join.submit")}
            </Button>
          </form>
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
