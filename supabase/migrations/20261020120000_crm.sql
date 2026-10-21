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
-- outranks every older one.
--
-- Added WITHOUT a default on purpose: Postgres fills existing rows with a
-- column default at ADD COLUMN time, which would stamp every historic lead
-- with the same value and leave the backfill below nothing to do. The default
-- is attached further down, after the backfill — and it matters, because the
-- contact form inserts as anon without this column, so the DB must fill it or
-- a fresh enquiry would sort to the bottom of "ליד חדש".
alter table public.leads add column if not exists board_order double precision;
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

-- Rows that predate the CRM carry the old free-text `status`. Where it already
-- names one of the six stages, keep it; anything else (including the 'new'
-- default) starts at the top of the board. Runs once: after this the trigger
-- below keeps status in step with stage, so the two can never diverge again.
update public.leads
   set stage = lower(trim(status))
 where status is not null
   and lower(trim(status)) in ('new', 'contacted', 'meeting', 'proposal', 'won', 'lost')
   and stage = 'new'
   and lower(trim(status)) <> 'new';

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

-- --------------------------------------------------- status <- stage ----
--
-- The board is the system of record for pipeline state; `status` predates it
-- and nothing reads it in code (the site only INSERTs). Rather than leave it
-- frozen at 'new' while the board says "פגישה", a trigger mirrors every stage
-- change into it, so the Supabase table editor always tells the truth.
--
-- One direction only, on purpose: editing `status` by hand in the table does
-- not move the card, and the next change from the board overwrites it.

create or replace function public.mirror_stage_to_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.status := new.stage;
  return new;
end;
$$;

drop trigger if exists leads_mirror_stage_to_status on public.leads;
create trigger leads_mirror_stage_to_status
  before insert or update of stage on public.leads
  for each row execute function public.mirror_stage_to_status();

-- Bring existing rows in line once, so the mirror starts out accurate.
update public.leads set status = stage where status is distinct from stage;

-- ------------------------------------------------------ contact identity ----
--
-- One person who enquires three times is three rows here (each is a real
-- enquiry and the site must keep writing them exactly as it does today), but
-- one card on the board. contact_key is what ties them together.
--
-- Phone first: it is the field Israelis type consistently, and normalising to
-- the last 9 digits makes 054-979-6211, 0549796211 and +972549796211 equal.
-- Email is the fallback, lowercased. A row with neither keeps its own id, so
-- it can never be merged into someone else by accident.

create or replace function public.lead_contact_key(phone text, email text, id uuid)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  digits text;
begin
  digits := regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g');
  if length(digits) >= 9 then
    return 'p:' || right(digits, 9);
  end if;
  if coalesce(email, '') <> '' then
    return 'e:' || lower(btrim(email));
  end if;
  return 'id:' || id::text;
end;
$$;

alter table public.leads add column if not exists contact_key text;

create or replace function public.set_lead_contact_key()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.contact_key := public.lead_contact_key(new.phone, new.email, new.id);
  return new;
end;
$$;

drop trigger if exists leads_set_contact_key on public.leads;
create trigger leads_set_contact_key
  before insert or update of phone, email on public.leads
  for each row execute function public.set_lead_contact_key();

-- Backfill every existing row, including the ones already in the table.
update public.leads
   set contact_key = public.lead_contact_key(phone, email, id)
 where contact_key is null;

create index if not exists leads_contact_key_idx on public.leads (contact_key, created_at);

-- ------------------------------------------------------------------ RLS ----
--
-- The live table already carries the site's own INSERT policy ("Website form
-- can insert leads") and anon's column grants. Both are the contract the live
-- contact form depends on, so this file only fills them in when they are
-- missing — it never revokes, replaces or renames what is already there.

alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;

do $$
begin
  -- Only if no INSERT policy for anon exists at all (a fresh project).
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public'
       and tablename = 'leads'
       and cmd = 'INSERT'
       and ('anon' = any(roles) or 'public' = any(roles))
  ) then
    create policy "Website form can insert leads"
      on public.leads for insert to anon with check (true);
  end if;

  -- Likewise the column grants: added only when anon cannot insert at all.
  if not exists (
    select 1 from information_schema.column_privileges
     where table_schema = 'public'
       and table_name = 'leads'
       and grantee = 'anon'
       and privilege_type = 'INSERT'
  ) then
    grant insert (
      name, phone, email, service, message, marketing_consent, source_page
    ) on public.leads to anon;
  end if;
end
$$;

-- CRM-only table: anon gets nothing, and no policy is created for it.
revoke all on public.lead_activities from anon;
