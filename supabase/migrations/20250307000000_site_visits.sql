-- Site visits / analytics table for Tiger Den Finder
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New query → paste → Run
-- View data: Supabase Dashboard → Table Editor → site_visits (dashboard uses service role, so RLS allows read)

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_agent text,
  device_type text,
  os text,
  country text,
  region text,
  city text,
  visited_at timestamptz not null default now(),
  left_at timestamptz,
  duration_seconds int,
  created_at timestamptz not null default now()
);

-- Allow anonymous inserts (from your web app); restrict reads to service role / auth users only
alter table public.site_visits enable row level security;

create policy "Allow anonymous insert for site visits"
  on public.site_visits for insert
  to anon
  with check (true);

-- Only authenticated users (or service role) can read analytics. Anon cannot update rows directly.
create policy "Allow read for authenticated users only"
  on public.site_visits for select
  to authenticated
  using (true);

-- RPC so anon can record "leave" for their session only (no direct table update)
create or replace function public.record_visit_leave(p_session_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update site_visits
  set left_at = now(),
      duration_seconds = greatest(0, extract(epoch from (now() - visited_at))::int)
  where session_id = p_session_id;
$$;

grant execute on function public.record_visit_leave(text) to anon;

-- Optional: index for querying by date
create index if not exists site_visits_visited_at_idx on public.site_visits (visited_at desc);
