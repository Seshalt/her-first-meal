import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { GlassDefs } from "@/components/layout/glass-defs";
import { ThemePaint } from "@/components/theme-paint";
import { ThemeProvider } from "@/lib/theme";
import { CookieConsent } from "@/components/security/cookie-consent";
import appCss from "../styles.css?url";

const APP_NAME = "Her First Meal";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "The world celebrates the baby. We remember the mother. Pregnancy and postpartum meals, belly binding studio, movement, grocery planning, and Nouri.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Her First Meal" },
      { property: "og:description", content: "The world celebrates the baby. We remember the mother." },
      { property: "og:image", content: "/og.jpg" },
      { property: "og:url", content: "https://her-first-meal-now.vercel.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Her First Meal" },
      { name: "twitter:description", content: "The world celebrates the baby. We remember the mother." },
      { name: "theme-color", content: "#1F5F8A" },
    ],
    links: [
      { rel: "canonical", href: "https://her-first-meal-now.vercel.app/" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png?v=hfm8" },
      { rel: "icon", type: "image/png", sizes: "180x180", href: "/icon-180.png?v=hfm8" },
      { rel: "apple-touch-icon", href: "/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body>
        <GlassDefs />
        <PreviewHostBridge />
        <AuthProvider>
          <ThemeProvider>
            <ThemePaint />
            <Outlet />
            <CookieConsent />
            <Toaster
              position="top-center"
              toastOptions={{
                className: "font-sans",
                classNames: {
                  toast: "bg-paper text-ink border border-ink/10 shadow-lg",
                  title: "text-ink font-medium",
                  description: "text-ink",
                  error: "bg-clay text-paper border-clay-deep",
                  success: "bg-sea text-paper border-sea-deep",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
