-- Burnout Tracker — initial schema, RLS policies, triggers, and niche seed data.
-- Apply via the Supabase dashboard SQL editor or `supabase db push`.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- profiles
-- One row per auth.users row. Created automatically by the on_auth_user_created
-- trigger so signup flows never have to handle the empty-profile case.
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  niche text,
  custom_niche_label text,
  goals jsonb not null default '[]'::jsonb,
  notification_prefs jsonb not null default '{"daily_reminder": true, "weekly_summary": true}'::jsonb,
  baseline_ee smallint,
  baseline_dp smallint,
  baseline_pa smallint,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_niche_idx on public.profiles(niche);

-- ============================================================================
-- check_ins
-- One submission per user per day. The unique constraint on (user_id, entry_date)
-- lets us upsert when a user re-saves today's check-in.
-- ============================================================================
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  checked_in_at timestamptz not null default now(),
  mood smallint not null check (mood between 1 and 10),
  energy smallint not null check (energy between 1 and 10),
  stress smallint not null check (stress between 1 and 10),
  workload smallint not null check (workload between 1 and 10),
  sleep_hours numeric(4, 2) check (sleep_hours >= 0 and sleep_hours <= 24),
  ee_score smallint check (ee_score between 0 and 100),
  dp_score smallint check (dp_score between 0 and 100),
  pa_score smallint check (pa_score between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists check_ins_user_date_idx on public.check_ins(user_id, entry_date desc);

-- ============================================================================
-- journal_entries
-- Free-form journal — may or may not be linked to a check-in.
-- ============================================================================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete set null,
  content text not null,
  mood_tag text,
  created_at timestamptz not null default now()
);

create index if not exists journal_entries_user_created_idx
  on public.journal_entries(user_id, created_at desc);

-- ============================================================================
-- niche_configs
-- Public read-only seed table. Drives the niche selector and per-niche
-- benchmark/resource content. No user_id — readable by every authenticated user.
-- ============================================================================
create table if not exists public.niche_configs (
  slug text primary key,
  label text not null,
  description text not null,
  indicators jsonb not null default '[]'::jsonb,
  prompts jsonb not null default '[]'::jsonb,
  community_avg_ee smallint not null default 50,
  community_avg_dp smallint not null default 40,
  community_avg_pa smallint not null default 60,
  resources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists check_ins_set_updated_at on public.check_ins;
create trigger check_ins_set_updated_at
  before update on public.check_ins
  for each row execute function public.set_updated_at();

-- ============================================================================
-- auth.users -> profiles bridge
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row-level security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.check_ins enable row level security;
alter table public.journal_entries enable row level security;
alter table public.niche_configs enable row level security;

drop policy if exists "profiles owner select" on public.profiles;
create policy "profiles owner select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles owner upsert" on public.profiles;
create policy "profiles owner upsert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles owner delete" on public.profiles;
create policy "profiles owner delete" on public.profiles
  for delete using (auth.uid() = id);

drop policy if exists "check_ins owner all" on public.check_ins;
create policy "check_ins owner all" on public.check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "journal owner all" on public.journal_entries;
create policy "journal owner all" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "niche_configs read all" on public.niche_configs;
create policy "niche_configs read all" on public.niche_configs
  for select using (true);

-- ============================================================================
-- Niche seed data
-- ============================================================================
insert into public.niche_configs (slug, label, description, indicators, prompts, community_avg_ee, community_avg_dp, community_avg_pa, resources)
values
  ('software_engineer', 'Software Engineer',
    'Long focus sessions, on-call rotations, and shifting priorities can quietly drain you.',
    '["context-switching fatigue","on-call sleep disruption","unclear scope","imposter feelings"]'::jsonb,
    '["What''s draining the most focus today?","Did you protect any deep-work time?","How often were you paged this week?"]'::jsonb,
    58, 42, 55,
    '[
      {"title":"The Tao of On-Call","kind":"article","url":"https://increment.com/on-call/the-tao-of-on-call/"},
      {"title":"Deep work routines for engineers","kind":"article","url":"https://lethain.com/staying-aligned-with-a-boss/"}
    ]'::jsonb
  ),
  ('healthcare', 'Healthcare Worker',
    'Emotional load, shift work, and exposure to suffering compound quickly.',
    '["compassion fatigue","shift-work sleep disruption","moral injury","patient load"]'::jsonb,
    '["Did you feel emotionally present with patients today?","Did you take any breaks during the shift?","Is there a case weighing on you?"]'::jsonb,
    72, 55, 50,
    '[
      {"title":"Self-care for caregivers","kind":"article","url":"https://www.who.int/news-room/feature-stories/detail/mental-health-for-health-workers"},
      {"title":"Mindful pause between patients","kind":"exercise","url":"https://www.headspace.com/articles/mini-meditations-throughout-the-day"}
    ]'::jsonb
  ),
  ('teacher', 'Teacher',
    'Unrelenting demands from students, parents, and admin make recovery time scarce.',
    '["after-hours grading","emotional labor","classroom management","admin overhead"]'::jsonb,
    '["Did you have time to plan without interruption?","How were your boundaries with parents this week?","Did a student moment energise you?"]'::jsonb,
    68, 48, 58,
    '[
      {"title":"Edutopia: Teacher self-care","kind":"article","url":"https://www.edutopia.org/article/teacher-burnout-prevention"},
      {"title":"Boundary email templates","kind":"template","url":""}
    ]'::jsonb
  ),
  ('student', 'Student',
    'Academic pressure, sleep debt, and uncertainty about the future stack up.',
    '["exam stress","social comparison","sleep deprivation","unclear direction"]'::jsonb,
    '["What''s your biggest deadline this week?","How many hours did you sleep last night?","Did you do something just for fun today?"]'::jsonb,
    52, 38, 60,
    '[
      {"title":"Pomodoro made simple","kind":"article","url":"https://francescocirillo.com/products/the-pomodoro-technique"},
      {"title":"4-7-8 calming breath","kind":"exercise","url":""}
    ]'::jsonb
  ),
  ('creative', 'Creative Professional',
    'Output expectations and the visibility of your work can fuel chronic self-criticism.',
    '["creative block","public critique","feast-or-famine schedule","perfectionism"]'::jsonb,
    '["Did you make anything just for yourself today?","How is your relationship with feedback this week?","What''s your input-to-output ratio been like?"]'::jsonb,
    60, 45, 62,
    '[
      {"title":"On finishing things","kind":"article","url":"https://austinkleon.com/2019/03/30/how-to-finish/"},
      {"title":"Box breathing","kind":"exercise","url":""}
    ]'::jsonb
  ),
  ('entrepreneur', 'Entrepreneur',
    'Always-on responsibility, financial stress, and identity-fusion with the company.',
    '["financial anxiety","decision fatigue","isolation","always-on culture"]'::jsonb,
    '["When did you last take a real day off?","Did you talk to anyone about non-work things today?","What''s the biggest unknown weighing on you?"]'::jsonb,
    70, 52, 65,
    '[
      {"title":"The maker''s schedule, the manager''s schedule","kind":"article","url":"http://www.paulgraham.com/makersschedule.html"},
      {"title":"Founder peer-support groups","kind":"article","url":"https://www.ycombinator.com/founder-resources"}
    ]'::jsonb
  ),
  ('custom', 'Custom / Other',
    'Set your own indicators — we''ll still personalise prompts and benchmarks.',
    '[]'::jsonb,
    '["How is your energy today?","What''s one thing you want less of this week?","What gave you a moment of relief recently?"]'::jsonb,
    55, 45, 55,
    '[]'::jsonb
  )
on conflict (slug) do update set
  label = excluded.label,
  description = excluded.description,
  indicators = excluded.indicators,
  prompts = excluded.prompts,
  community_avg_ee = excluded.community_avg_ee,
  community_avg_dp = excluded.community_avg_dp,
  community_avg_pa = excluded.community_avg_pa,
  resources = excluded.resources;
