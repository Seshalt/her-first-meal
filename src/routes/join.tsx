import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
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

type CheckoutState = "checking" | "paid" | "invalid";

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
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("checking");
  const [factor, setFactor] = useState<{
    needed: boolean;
    sent: boolean;
    configured: boolean;
    emailMasked: string;
  } | null>(null);
  const guard = useFormGuard();

  useEffect(() => {
    let live = true;
    if (!token) {
      setCheckoutState("invalid");
      return () => {
        live = false;
      };
    }

    setCheckoutState("checking");
    void getCheckoutByToken({ data: { token } })
      .then((row) => {
        if (!live) return;
        if (!row || row.status !== "active") {
          setCheckoutState("invalid");
          return;
        }
        setEmail(row.email);
        setCheckoutState("paid");
      })
      .catch(() => {
        if (live) setCheckoutState("invalid");
      });

    return () => {
      live = false;
    };
  }, [token]);

  useEffect(() => {
    if (checkoutState !== "paid" || manualSignup || busy || isPending || !user || factor?.needed) return;
    let live = true;
    void claimMembership({ data: { token } })
      .then(() => {
        if (live) void navigate({ to: "/app/onboarding" });
      })
      .catch((err) => {
        if (live) toast.error(err instanceof Error ? err.message : "Could not open your membership yet.");
      });
    return () => {
      live = false;
    };
  }, [busy, checkoutState, factor?.needed, isPending, manualSignup, navigate, token, user]);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (checkoutState !== "paid" || !token) {
      toast.error("Complete Stripe payment before creating your member account.");
      return;
    }
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
        callbackURL: `/join?token=${encodeURIComponent(token)}`,
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

      await claimMembership({ data: { token } });
      await saveJoinDiets({ data: { diets, language: locale } }).catch(() => undefined);
      toast.success("Payment confirmed. Your account is ready.");

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

  const checkoutGate = checkoutState !== "paid";

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
            <p className="mt-6 max-w-md font-display text-5xl leading-[1.05]">{site.joinPhotoLine}</p>
          </div>
        </div>

        <div className="flex min-h-dvh flex-col justify-center bg-wash-clay px-5 py-28 md:px-16">
          {checkoutState === "checking" ? (
            <div className="max-w-md rounded-[28px] border border-border bg-card p-7 shadow-[var(--shadow-border)]">
              <p className="text-xs uppercase tracking-[0.22em] text-earth">Secure checkout</p>
              <h1 className="mt-3 font-display text-4xl">Confirming your payment…</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">We are checking the Stripe payment before account creation opens.</p>
            </div>
          ) : null}

          {checkoutState === "invalid" ? (
            <div className="max-w-md rounded-[28px] border border-border bg-card p-7 shadow-[var(--shadow-border)]">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <LockKeyhole className="size-5" />
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.22em] text-earth">Payment required</p>
              <h1 className="mt-3 font-display text-4xl leading-tight">Create your member account after checkout.</h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                This page only opens account creation from a Stripe-confirmed membership. If you canceled checkout or opened this page directly, choose a membership and complete payment first.
              </p>
              <Link
                to="/pricing"
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 active:scale-95"
              >
                Choose membership
              </Link>
            </div>
          ) : null}

          {!checkoutGate ? (
            <>
              <p className="text-xs uppercase tracking-[0.32em] text-clay">{site.joinEyebrow}</p>
              <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">{site.joinTitle}</h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{site.joinBody}</p>

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
                          callbackURL: `/join?token=${encodeURIComponent(token)}`,
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
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("join.email")}</Label>
                    <Input id="email" type="email" required readOnly value={email} autoComplete="email" />
                    <p className="mt-1 text-xs text-muted-foreground">Use the same email that completed Stripe checkout.</p>
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
                      autoComplete="new-password"
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
            </>
          ) : null}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
