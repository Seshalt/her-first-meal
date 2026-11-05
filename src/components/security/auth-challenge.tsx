import { useText as useContentText } from "@/lib/i18n/use-text";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";
import { readableAuthError } from "@/lib/auth/errors";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

/** Completes the pending Better Auth session; never grants access itself. */
export function AuthChallenge({ onVerified }: { onVerified: () => void }) {
  const localizeContent = useContentText();
  const [backup, setBackup] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = backup
        ? await authClient.twoFactor.verifyBackupCode({ code: code.trim(), disableSession: false })
        : await authClient.twoFactor.verifyTotp({ code: code.trim(), trustDevice: false });
      if (result.error) throw result.error;
      await authClient.getSession();
      onVerified();
    } catch (err) {
      setError(readableAuthError(err, "That code does not match."));
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="glass-panel mt-8 max-w-md space-y-4 p-6">
    <h2 className="font-display text-3xl">{localizeContent("Confirm your identity.")}</h2>
    <p className="text-sm text-muted-foreground">{localizeContent(backup ? "Enter one of your saved backup codes." : "Enter the six-digit code from your authenticator app.")}</p>
    <Label htmlFor="authenticator-code">{localizeContent(backup ? "Backup code" : "Authenticator code")}</Label>
    <Input id="authenticator-code" autoComplete="one-time-code" inputMode={backup ? "text" : "numeric"} required value={code} onChange={e => setCode(e.target.value)} />
    {localizeContent(error && <p role="alert" className="text-sm text-clay">{localizeContent(error)}</p>)}
    <Button type="submit" className="w-full" disabled={busy || !code.trim()}>{localizeContent(busy ? "Checking…" : "Continue")}</Button>
    <button type="button" className="text-sm text-primary underline" disabled={busy} onClick={() => { setBackup(!backup); setCode(""); setError(""); }}>{localizeContent(backup ? "Use authenticator code" : "Use a backup code")}</button>
  </form>;
}
