-- One mood check-in per user per day.
create table public.check_ins (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  mood text not null check (mood in ('overwhelmed', 'anxious', 'unsure', 'excited', 'hopeful')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.check_ins enable row level security;

create policy "Users read own check-ins" on public.check_ins
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own check-ins" on public.check_ins
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own check-ins" on public.check_ins
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own check-ins" on public.check_ins
  for delete to authenticated using ((select auth.uid()) = user_id);

create trigger check_ins_set_updated_at
  before update on public.check_ins
  for each row execute function public.set_updated_at();

-- Feeds, sleeps and diaper changes logged after delivery.
create table public.baby_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('feed', 'sleep', 'diaper')),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index baby_events_user_time on public.baby_events (user_id, occurred_at desc);

alter table public.baby_events enable row level security;

create policy "Users read own baby events" on public.baby_events
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own baby events" on public.baby_events
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users delete own baby events" on public.baby_events
  for delete to authenticated using ((select auth.uid()) = user_id);
