-- The conversation between a user and Momo.
-- Rows are written only by the momo-chat function (service role), so a
-- user can read and delete their history but cannot forge Momo's replies.
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_user_time on public.chat_messages (user_id, created_at desc);

alter table public.chat_messages enable row level security;

create policy "Users read own chat" on public.chat_messages
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users delete own chat" on public.chat_messages
  for delete to authenticated using ((select auth.uid()) = user_id);
