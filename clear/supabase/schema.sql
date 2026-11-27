-- CLEAR のクラウド保存(Supabase)
-- Supabase の「SQL Editor」に全部貼って「Run」を1回押す。何回流しても壊れないように書いてある。

-- ============ 作ったもの(練習試合・リーグ戦・トーナメント)1つ = 1行 ============
create table if not exists public.events (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- 古い形から移す前の控え(消さない)
create table if not exists public.backups (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- アプリ(ログインした人)から表を使えるようにする。どの行に触れるかは下の RLS で絞る
grant select, insert, update, delete on public.events  to authenticated;
grant select, insert, update, delete on public.backups to authenticated;

-- 自分の行だけ読み書きできる(RLS)
alter table public.events  enable row level security;
alter table public.backups enable row level security;

drop policy if exists "events own" on public.events;
create policy "events own" on public.events
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "backups own" on public.backups;
create policy "backups own" on public.backups
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============ 会員の情報(あとで Stripe の支払い状況を入れる) ============
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text,
  is_subscribed       boolean not null default false,
  subscription_status text,
  stripe_customer_id  text unique,
  current_period_end  timestamptz,
  created_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;

-- 本人は自分の行を読めるだけ。書き換えはできない(is_subscribed を自分で true にできないように)。
-- 書き換えるのは、あとで作る Stripe の受け口(service_role で動く)だけ
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- 新しく登録した人の profiles の行を自動で作る
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- この SQL より前に登録した人の分も作っておく
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ============ ほかの端末で変えたら、すぐ映す(Realtime) ============
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'events'
  ) then
    alter publication supabase_realtime add table public.events;
  end if;
end $$;
