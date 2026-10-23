import { useText as useContentText } from "@/lib/i18n/use-text";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestEmailFactor, verifyEmailFactor } from "@/lib/server/email-factor";
import { usePublicSite } from "@/lib/use-public-site";

export function EmailFactorForm({
  emailMasked,
  sent,
  configured,
  onVerified,
}: {
  emailMasked: string;
  sent: boolean;
  configured: boolean;
  onVerified: () => void;
}) {
  const localizeContent = useContentText();
  const { site } = usePublicSite();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await verifyEmailFactor({ data: { code } });
      toast.success(localizeContent("Email confirmed."));
      onVerified();
    } catch (err) {
      toast.error(localizeContent(err instanceof Error ? err.message : "That code does not match."));
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    setBusy(true);
    try {
      const next = await requestEmailFactor();
      toast.success(localizeContent(next.sent ? `A new code is on the way to ${next.emailMasked}.` : site.factorNoMail));
    } catch (err) {
      toast.error(localizeContent(err instanceof Error ? err.message : "Could not send another code."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="glass-panel mt-8 max-w-md space-y-4 p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-clay">{localizeContent(site.factorKicker)}</p>
      <h2 className="font-display text-3xl">{localizeContent(site.factorTitle)}</h2>
      <p className="text-sm leading-relaxed text-ink-soft">
        {localizeContent(site.factorBody.replace("{email}", emailMasked))}
      </p>
      {localizeContent(!sent ? (
        <p className="rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay-deep">
          {localizeContent(configured ? site.factorSendFail : site.factorNoMail)}
        </p>
      ) : null)}
      <div>
        <Label htmlFor="email-code">{localizeContent(site.factorLabel)}</Label>
        <Input
          id="email-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          minLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={busy || code.length !== 6}>
        {localizeContent(busy ? "Checking…" : site.factorCta)}
      </Button>
      <button type="button" className="text-sm text-primary underline-offset-4 hover:underline" onClick={() => void onResend()} disabled={busy}>
        {localizeContent(site.factorResend)}
      </button>
    </form>
  );
}
