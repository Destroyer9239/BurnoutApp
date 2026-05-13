# Lumen — Burnout Tracker

A niche-aware burnout monitoring and recovery web app, built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase (Postgres + Auth), and Recharts. Optional Claude-powered weekly insights via the Anthropic SDK.

## Highlights

- **Multi-step onboarding** that captures your profession (Software Engineer, Healthcare, Teacher, Student, Creative, Entrepreneur, or Custom), a baseline MBI-style assessment, and a couple of small goals.
- **Daily check-in** with mood / energy / stress / workload sliders, optional sleep + journal entry, niche-specific prompts, and streak tracking.
- **Composite burnout score** (0–100) derived from emotional exhaustion, depersonalisation, and personal accomplishment sub-scores. Visualised with a radial gauge plus a 30-day trend.
- **Analytics** — 30-day trend, 12-week heatmap, anonymised niche community comparison, and a weekly insight (rule-based by default, AI-assisted if `ANTHROPIC_API_KEY` is set).
- **Resource hub** with curated articles, an animated 4-7-8 breathing exercise, copyable boundary-setting templates, and a personalised recovery plan generator.
- **Settings** — profile, niche switcher, dark/light mode, notification preferences, CSV + PDF export, and danger zone.
- **Production fundamentals** — RLS-scoped Supabase schema, server-only data writes through Route Handlers, strict TypeScript, mobile-first responsive UI, and WCAG-friendly focus styles + ARIA wiring.

## Quick start

```bash
pnpm install
cp .env.example .env.local           # fill in Supabase keys
pnpm dev                             # http://localhost:3000
```

Other scripts:

| Script              | Purpose                       |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Run the dev server            |
| `pnpm build`        | Production build              |
| `pnpm start`        | Serve the production build    |
| `pnpm lint`         | ESLint                        |
| `pnpm typecheck`    | `tsc --noEmit` (strict)       |
| `pnpm format`       | Prettier (with tailwind plugin)|

## Supabase setup

1. Create a Supabase project at https://supabase.com.
2. In **Settings → API**, copy the `URL`, the anon publishable key, and (optionally) the service-role key into `.env.local`.
3. In **SQL Editor**, paste the contents of `supabase/migrations/0001_init.sql` and run it. This creates:
   - `profiles`, `check_ins`, `journal_entries`, `niche_configs` tables
   - row-level security policies scoped to `auth.uid()`
   - an `on_auth_user_created` trigger that seeds a `profiles` row on signup
   - seed rows in `niche_configs` for the seven niches
4. In **Authentication → Providers**, enable Email (with confirmations as you prefer) and Google. For Google, add `http://localhost:3000/auth/callback` (and your production callback) to the allowed redirect URLs.

## Environment variables

See `.env.example`. The minimum to run locally:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional:

```
SUPABASE_SERVICE_ROLE_KEY=      # only required for privileged admin actions
ANTHROPIC_API_KEY=              # enables AI-assisted weekly insights
ANTHROPIC_MODEL=claude-opus-4-7 # defaults to claude-opus-4-7
```

## Project layout

```
app/                            # Next.js App Router (auth, onboarding, dashboard, api/*)
components/                     # Reusable UI: shadcn primitives, charts, feature blocks
lib/                            # Domain logic: scoring, niches, insights, supabase, validation
hooks/                          # (reserved — most state lives in components)
types/                          # Hand-maintained Database + domain types
supabase/migrations/0001_init.sql
middleware.ts                   # Auth-gated routes
```

## Architecture notes

- **Auth**: `@supabase/ssr` with cookie-based sessions. The browser client is only used for `signIn` / `signOut` / OAuth start; everything else goes through Route Handlers using the server client. `middleware.ts` refreshes the session cookie on every request and redirects unauthenticated traffic away from protected paths.
- **Scoring**: see `lib/scoring/burnout.ts`. Daily inputs are normalised to a 0–100 scale and blended with the onboarding baseline. The composite weights are EE 0.45, DP 0.25, (100 − PA) 0.30, and the result is clamped 0–100.
- **Insights**: `app/api/insights/route.ts` first tries `lib/insights/claude.ts` (Anthropic SDK, `claude-opus-4-7`, prompt-caching on the system prompt). Any failure falls back to `lib/insights/generator.ts`.
- **Data privacy**: every table has RLS policies pinning rows to `auth.uid()`. Read paths in components hit Route Handlers which re-check the session via `requireUser()` before issuing any query. Exports run server-side and stream directly to the browser.

## Disclaimer

Lumen is a wellbeing tool, not a substitute for professional mental health care. If you're in crisis, please contact a local helpline or trusted professional.
