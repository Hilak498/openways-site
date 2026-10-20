-- Open Ways CRM — leads pipeline + interaction history.
--
-- Idempotent on purpose: the same file runs on the existing project (where
-- public.leads already receives contact-form submissions) and on a fresh
-- project. Re-running it is a no-op.
--
-- Access model:
--   anon         INSERT only, on the contact-form columns (src/lib/leads.ts).
--   service_role everything — the CRM talks to the DB only from the server
--                with SUPABASE_SECRET_KEY, behind the /crm password gate.

-- ---------------------------------------------------------------- leads ----

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  service text,
  message text not null,
  marketing_consent boolean not null default false,
  source_page text,
  status text,
  notes text
);

-- CRM columns. Each one guarded, so an existing table just gains what it lacks.
alter table public.leads add column if not exists stage text not null default 'new';
alter table public.leads add column if not exists priority text not null default 'normal';
alter table public.leads add column if not exists source text not null default 'website';
alter table public.leads add column if not exists owner text;
alter table public.leads add column if not exists estimated_value numeric(12, 2);
alter table public.leads add column if not exists next_follow_up_at timestamptz;
alter table public.leads add column if not exists last_contacted_at timestamptz;
alter table public.leads add column if not exists lost_reason text;
-- Position inside a board column, in epoch milliseconds so a brand-new lead
-- outranks every older one. The default matters: the contact form inserts as
-- anon and is not granted this column, so the DB has to fill it — without it a
-- fresh website enquiry would sort to the bottom of "ליד חדש".
alter table public.leads add column if not exists board_order double precision
  default (extract(epoch from now()) * 1000);
alter table public.leads add column if not exists is_archived boolean not null default false;
alter table public.leads add column if not exists updated_at timestamptz not null default now();
alter table public.leads add column if not exists notes text;
alter table public.leads add column if not exists status text;

-- Stage/priority vocabularies. Dropped first so a changed list can be reapplied.
alter table public.leads drop constraint if exists leads_stage_check;
alter table public.leads
  add constraint leads_stage_check
  check (stage in ('new', 'contacted', 'meeting', 'proposal', 'won', 'lost'));

alter table public.leads drop constraint if exists leads_priority_check;
alter table public.leads
  add constraint leads_priority_check
  check (priority in ('low', 'normal', 'high'));

-- A lead typed into the CRM by hand has no message; the form still requires one.
alter table public.leads alter column message drop not null;

alter table public.leads
  alter column board_order set default (extract(epoch from now()) * 1000);

-- Rows that predate the CRM: seed the board position from created_at so the
-- first render has a stable order instead of an arbitrary one. Same unit as
-- the default above, or old and new leads would not be comparable.
update public.leads
   set board_order = extract(epoch from created_at) * 1000
 where board_order is null;

create index if not exists leads_stage_idx on public.leads (stage, board_order);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_follow_up_idx on public.leads (next_follow_up_at)
  where next_follow_up_at is not null;

-- ----------------------------------------------------------- activities ----

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  kind text not null default 'note',
  body text,
  happened_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by text
);

alter table public.lead_activities drop constraint if exists lead_activities_kind_check;
alter table public.lead_activities
  add constraint lead_activities_kind_check
  check (kind in ('note', 'call', 'meeting', 'email', 'whatsapp', 'stage_change', 'system'));

create index if not exists lead_activities_lead_idx
  on public.lead_activities (lead_id, happened_at desc);

-- -------------------------------------------------------------- updated ----

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------ RLS ----

alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;

-- The contact form inserts as anon and never reads back (no .select()).
drop policy if exists "anon can submit a lead" on public.leads;
create policy "anon can submit a lead"
  on public.leads for insert to anon with check (true);

revoke all on public.leads from anon;
grant insert (
  name, phone, email, service, message, marketing_consent, source_page
) on public.leads to anon;

-- No anon policy on lead_activities at all: CRM-only data.
revoke all on public.lead_activities from anon;
