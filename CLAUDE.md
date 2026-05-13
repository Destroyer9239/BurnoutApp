# CLAUDE.md

> Guidance for future Claude Code sessions working in this repository.

## What this is

**Lumen** — a niche-aware burnout monitoring + recovery web app. Next.js 14 (App Router) + TypeScript (strict) + Tailwind + shadcn/ui + Supabase (Postgres + Auth) + Recharts + Framer Motion + sonner + zod + react-hook-form. Optional Claude integration for weekly insights via `@anthropic-ai/sdk`.

## Critical scripts

| Script | When to run |
| --- | --- |
| `pnpm install` | After cloning or when deps change |
| `pnpm dev` | Local development |
| `pnpm typecheck` | Strict TypeScript check (no emit) |
| `pnpm lint` | ESLint via `next lint` |
| `pnpm build` | Production build sanity check |
| `pnpm format` | Prettier with tailwind plugin |

## Repository layout

```
app/                Next.js App Router. Route groups:
  (auth)            /login, /signup, shared auth layout
  auth/callback     OAuth + magic-link exchange
  (onboarding)      4-step wizard before dashboard
  (dashboard)       Authenticated shell — dashboard, check-in, analytics, resources, settings
  api/              Route Handlers (all server-only data writes go here)
components/
  ui/               shadcn primitives (Button, Card, Slider, …)
  charts/           Recharts wrappers (BurnoutGauge, TrendLine, HeatmapCalendar, …)
  onboarding/       Wizard + steps
  check-in/         CheckInForm + StreakBadge
  dashboard/        QuickStats, RecentCheckIns
  analytics/        InsightCard
  resources/        BreathingExercise, BoundaryTemplates, RecoveryPlan, ArticleCard
  settings/         SettingsForm
  layout/           Sidebar, Topbar, MobileNav, PageHeader
  shared/           Logo, EmptyState, ErrorState, LoadingState, ThemeProvider
lib/
  supabase/         server.ts (RSC + handlers), client.ts (browser), middleware helper
  scoring/          burnout.ts (composite), mbi.ts (sub-scores)
  niches/           configs.ts (per-niche copy, prompts, templates, recovery strategies)
  insights/         generator.ts (rule-based) + claude.ts (Anthropic SDK)
  validation/       schemas.ts (zod) shared by forms + API
  export/           csv.ts + pdf.ts
  api/handlers.ts   small helper for route handlers
  utils.ts, constants.ts
types/
  database.ts       Row/Insert/Update shapes mirroring the SQL migration
  domain.ts         App-level domain types (BurnoutScore, NicheSlug, etc.)
supabase/migrations/0001_init.sql   schema + RLS + niche seed data
middleware.ts       refreshes Supabase cookie + gates protected paths
```

## Conventions

- **Strict TypeScript.** `noUncheckedIndexedAccess` is on — handle `undefined` from array indexing explicitly.
- **No client-side Supabase reads.** UI components fetch via `/api/*` route handlers; server components use `createSupabaseServerClient()` directly. The browser client (`lib/supabase/client.ts`) is for `signIn`/`signOut`/OAuth only.
- **Validation.** Every API write parses its body with a shared zod schema from `lib/validation/schemas.ts`. Reuse those schemas in client forms when adding validation there.
- **Auth gate.** `middleware.ts` redirects unauthenticated users away from `/dashboard`, `/check-in`, `/analytics`, `/resources`, `/settings`, `/onboarding`. Layouts that need a complete profile call `redirect("/onboarding")` based on `profiles.onboarded_at`.
- **Scoring.** All composite math lives in `lib/scoring/burnout.ts`. If you need a derived number, add a function there — don't inline arithmetic in components.
- **Styling.** Tailwind + CSS variables in `app/globals.css`. The design tokens live in `tailwind.config.ts`. shadcn primitives are intentionally local — edit them in place, don't depend on the CLI.

## Adding features safely

- New API route → put it under `app/api/<resource>/route.ts`, call `requireUser()` from `lib/supabase/server`, parse the body with a zod schema, and run RLS-scoped queries on the server client.
- New table → add to `supabase/migrations/000X_<name>.sql` with explicit `enable row level security` + per-user policies. Mirror the rows in `types/database.ts`.
- New niche → edit `lib/niches/configs.ts` (UI copy) **and** add a seed row to the SQL migration (community benchmark + resources).
- New chart → wrap Recharts with a `<ResponsiveContainer>`, use the CSS variables for colors, and degrade gracefully via `EmptyState` if the data is empty.

## Things to remember

- `.env.local` is gitignored; `.env.example` documents every required + optional variable.
- The Supabase migration must be applied to the project before the app will function — `pnpm dev` will surface relation errors otherwise.
- AI insights fall back to the rule-based generator automatically when `ANTHROPIC_API_KEY` is missing — don't gate the analytics page on Claude.
- Don't push to `main` without explicit permission. Active branch: `claude/build-burnout-tracker-s9M9r`.
