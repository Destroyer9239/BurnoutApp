// Marketing landing page. Static, server-rendered, and links into auth.

import Link from "next/link";
import { ArrowRight, Compass, HeartPulse, LineChart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const FEATURES = [
  {
    title: "Niche-aware",
    body: "Adapts to engineers, healthcare workers, teachers, students, creatives, and founders.",
    icon: Compass,
  },
  {
    title: "Maslach-informed",
    body: "Composite score combines daily check-ins with a baseline MBI-style assessment.",
    icon: HeartPulse,
  },
  {
    title: "Real trends",
    body: "Weekly summaries, 12-week heatmaps, and per-niche community benchmarks.",
    icon: LineChart,
  },
  {
    title: "Private by default",
    body: "Row-level security, server-only data writes, exportable CSV / PDF, deletable account.",
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  return (
    <main id="main" className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="gradient-mesh absolute inset-0 -z-10" />

      <header className="container flex items-center justify-between py-6">
        <Logo />
        <nav aria-label="primary" className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="container flex flex-col items-center pb-16 pt-12 text-center sm:pt-24">
        <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Built for the way you actually work
        </span>
        <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Notice burnout earlier. Recover with intention.
        </h1>
        <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
          {APP_TAGLINE} {APP_NAME} adapts to your profession — surfacing the
          right indicators, prompts, and recovery routines for you.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start your free check-in
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </section>

      <section className="container grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <f.icon className="h-6 w-6 text-primary" aria-hidden />
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t bg-background/60">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME}. Built with care.</p>
          <p>Not a substitute for professional mental health care.</p>
        </div>
      </footer>
    </main>
  );
}
