import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Wordmark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { claimFirstAdmin, saveSetupWizard } from "@/lib/server/admin";
import { hasAdministrator } from "@/lib/server/public";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { atelierReadyLocal, markAtelierReady } from "@/lib/atelier-ready";
import { readableAuthError } from "@/lib/auth/errors";
import { requestEmailFactor } from "@/lib/server/email-factor";

export const Route = createFileRoute("/admin/setup")({ component: Setup });

function Setup() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("Maat");
  const [businessName, setBusinessName] = useState("Her First Meal");
  const [monthly, setMonthly] = useState("49");
  const [yearly, setYearly] = useState("490");
  const [zoom, setZoom] = useState("");
  const [nouri, setNouri] = useState("Remember: educational only. Honor cultural wrapping traditions. Never diagnose.");
  const [busy, setBusy] = useState(false);
  const guard = useFormGuard();

  useEffect(() => {
    if (atelierReadyLocal() && !user) {
      setBlocked(true);
      return;
    }
    void hasAdministrator()
      .then((r) => {
        if (r.hasAdmin && !user) setBlocked(true);
        if (r.hasAdmin) markAtelierReady();
      })
      .catch(() => {
        if (atelierReadyLocal() && !user) setBlocked(true);
      });
  }, [user]);

  if (blocked) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="font-display text-3xl">Sign in to the atelier</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            The owner account already exists. Use Sign in with that email — you will be taken to the atelier.
          </p>
          <Link to="/login" search={{ next: "/admin" }} className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 text-primary-foreground">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  async function createOwner(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!user && !guard.human) {
      toast.error("Please confirm you are a person.");
      return;
    }
    setBusy(true);
    try {
      if (!user) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/admin/setup",
        });
        if (error) throw error;
      }
      await claimFirstAdmin({ data: { displayName: name } });
      markAtelierReady();
      await requestEmailFactor().catch(() => undefined);
      setStep(1);
    } catch (err) {
      toast.error(readableAuthError(err, "Could not create the owner account."));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    try {
      await saveSetupWizard({
        data: {
          complete: true,
          step: 10,
          businessName,
          monthlyPriceCents: Math.round(Number(monthly) * 100),
          yearlyPriceCents: Math.round(Number(yearly) * 100),
          zoomDefaultLink: zoom,
          nouriNotes: nouri,
        },
      });
      toast.success("Atelier is open.");
      markAtelierReady();
      void navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save setup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#101918] px-4 py-12 text-[#efe6d6]">
      <div className="mx-auto max-w-lg">
        <Wordmark to="/" className="text-[#efe6d6]" />
        <p className="mt-6 text-xs uppercase tracking-[0.22em] text-white/50">Owner setup</p>
        <h1 className="mt-2 font-display text-4xl">Open the atelier.</h1>
        {step === 0 ? (
          <form onSubmit={createOwner} className="mt-8 space-y-4">
            <p className="text-sm text-white/70">
              The first administrator is created here. Members never see this door.
            </p>
            {!isPending && user ? (
              <p className="text-sm">Signed in as {user.primaryEmail ?? user.displayName}. Claim owner role to continue.</p>
            ) : (
              <>
                {authEnabled
                  ? GROK_PROVIDERS.map((p) => (
                      <Button
                        key={p.providerId}
                        type="button"
                        variant="outline"
                        className="w-full border-white/20 bg-transparent text-[#efe6d6]"
                        onClick={() => void signIn(p.providerId, { callbackURL: "/admin/setup" })}
                      >
                        Continue with {p.label}
                      </Button>
                    ))
                  : null}
                <div>
                  <Label className="text-[#efe6d6]">Owner name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-white/8 text-[#efe6d6]" />
                </div>
                <div>
                  <Label className="text-[#efe6d6]">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/8 text-[#efe6d6]" />
                </div>
                <div>
                  <Label className="text-[#efe6d6]">Password</Label>
                  <Input type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/8 text-[#efe6d6]" />
                </div>
              </>
            )}
            {!user ? (
              <HumanCheck
                checked={guard.human}
                onChecked={guard.setHuman}
                honey={guard.honey}
                onHoney={guard.setHoney}
              />
            ) : null}
            <Button type="submit" disabled={busy || (!user && !guard.human)} className="w-full">
              {busy ? "Creating…" : "Create administrator"}
            </Button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <div>
              <Label className="text-[#efe6d6]">Business name</Label>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[#efe6d6]">Monthly USD</Label>
                <Input value={monthly} onChange={(e) => setMonthly(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
              </div>
              <div>
                <Label className="text-[#efe6d6]">Yearly USD</Label>
                <Input value={yearly} onChange={(e) => setYearly(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
              </div>
            </div>
            <div>
              <Label className="text-[#efe6d6]">Default Zoom link</Label>
              <Input value={zoom} onChange={(e) => setZoom(e.target.value)} placeholder="https://" className="bg-white/8 text-[#efe6d6]" />
            </div>
            <div>
              <Label className="text-[#efe6d6]">Notes for Nouri</Label>
              <Textarea value={nouri} onChange={(e) => setNouri(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
            </div>
            <p className="text-xs text-white/50">
              Hours, videos, recipes, and email settings can be refined inside the atelier after this door opens.
            </p>
            <Button type="button" disabled={busy} className="w-full" onClick={() => void finish()}>
              Finish setup
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
