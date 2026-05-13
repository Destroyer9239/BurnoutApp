// Root layout for every route. Mounts the theme provider, font tokens, and
// global toaster. All other layouts (auth, onboarding, dashboard) nest inside
// this one and can rely on the shared CSS variables.

import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — Burnout tracker`, template: `%s · ${APP_NAME}` },
  description: APP_TAGLINE,
  applicationName: APP_NAME,
  keywords: ["burnout", "wellbeing", "mental health", "tracker", "MBI"],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} — Burnout tracker`,
    description: APP_TAGLINE,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster richColors position="top-right" closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
