-- House Chores — Supabase Schema
-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

-- ─── Tables ────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text unique not null,
  display_name text not null default 'User',
  color       text not null default 'yellow' check (color in ('yellow', 'green')),
  created_at  timestamptz default now()
);

create table if not exists public.categories (
  id            uuid default uuid_generate_v4() primary key,
  name          text not null,
  emoji         text default '🏠',
  display_order integer default 0,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz default now()
);

create table if not exists public.chores (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  category_id uuid references public.categories(id) on delete set null,
  weight      numeric(5,2) not null default 1.0,
  is_active   boolean default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

create table if not exists public.chore_logs (
  id         uuid default uuid_generate_v4() primary key,
  chore_id   uuid references public.chores(id) on delete cascade not null,
  user_id    uuid references public.profiles(id) on delete cascade not null,
  logged_at  timestamptz default now() not null,
  notes      text
);

create table if not exists public.notification_settings (
  user_id         uuid references public.profiles(id) on delete cascade primary key,
  daily_notif     boolean default true,
  notif_hour      integer default 22 check (notif_hour between 0 and 23),
  push_endpoint   text,
  push_p256dh     text,
  push_auth       text,
  updated_at      timestamptz default now()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

create index if not exists chore_logs_chore_id_idx on public.chore_logs(chore_id);
create index if not exists chore_logs_user_id_idx  on public.chore_logs(user_id);
create index if not exists chore_logs_logged_at_idx on public.chore_logs(logged_at desc);

-- ─── Row Level Security ────────────────────────────────────────────────────

alter table public.profiles              enable row level security;
alter table public.categories            enable row level security;
alter table public.chores                enable row level security;
alter table public.chore_logs            enable row level security;
alter table public.notification_settings enable row level security;

-- profiles
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- categories (all authenticated users can manage)
create policy "categories_select" on public.categories
  for select to authenticated using (true);
create policy "categories_insert" on public.categories
  for insert to authenticated with check (true);
create policy "categories_update" on public.categories
  for update to authenticated using (true);
create policy "categories_delete" on public.categories
  for delete to authenticated using (true);

-- chores
create policy "chores_select" on public.chores
  for select to authenticated using (true);
create policy "chores_insert" on public.chores
  for insert to authenticated with check (true);
create policy "chores_update" on public.chores
  for update to authenticated using (true);
create policy "chores_delete" on public.chores
  for delete to authenticated using (true);

-- chore_logs
create policy "logs_select" on public.chore_logs
  for select to authenticated using (true);
create policy "logs_insert" on public.chore_logs
  for insert to authenticated with check (auth.uid() = user_id);
create policy "logs_delete" on public.chore_logs
  for delete to authenticated using (auth.uid() = user_id);

-- notification_settings
create policy "notif_settings_own" on public.notification_settings
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Trigger: auto-create profile on signup ────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, color)
  values (
    new.id,
    new.email,
    case
      when new.email = 'rmaraujo@me.com'      then 'Rodrigo'
      when new.email = 'maiana.ds@gmail.com'  then 'Maiana'
      else split_part(new.email, '@', 1)
    end,
    case
      when new.email = 'maiana.ds@gmail.com'  then 'green'
      else 'yellow'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Enable Realtime ───────────────────────────────────────────────────────

alter publication supabase_realtime add table public.chore_logs;
alter publication supabase_realtime add table public.profiles;
