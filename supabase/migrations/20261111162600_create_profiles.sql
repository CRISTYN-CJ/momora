-- One row per user: who they are and what they told Momo during onboarding.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  stage text check (stage in ('ttc', 'pregnancy', 'postdelivery')),
  answers jsonb not null default '{}'::jsonb,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each signed-in user can only ever touch their own row.
create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users create own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users delete own profile" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
