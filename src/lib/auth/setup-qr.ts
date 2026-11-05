import qrcode from "qrcode-generator";

/** Encode the issued TOTP URI locally, including its account and timing settings. */
export function buildAuthenticatorQr(uri: string): { size: number; path: string } | null {
  if (!uri.startsWith("otpauth://totp/")) return null;

  try {
    const qr = qrcode(0, "M");
    qr.addData(uri, "Byte");
    qr.make();
    const count = qr.getModuleCount();
    const margin = 4;
    const modules: string[] = [];
    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        if (qr.isDark(y, x)) modules.push(`M${x + margin},${y + margin}h1v1h-1z`);
      }
    }
    return { size: count + 2 * margin, path: modules.join("") };
  } catch {
    // Manual entry remains available if the QR code cannot be generated.
    return null;
  }
}
