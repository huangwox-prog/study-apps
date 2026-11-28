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

-- ============ 部員名簿(1人の先生につき1行。id は 'main') ============
create table if not exists public.roster (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
grant select, insert, update, delete on public.roster to authenticated;
alter table public.roster enable row level security;
drop policy if exists "roster own" on public.roster;
create policy "roster own" on public.roster
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============ 生徒が8桁のコードで試合に入り、点数を入れる ============
-- 生徒はログインしない。表には直接さわれず、下の3つの関数だけを通る。
-- 関数が許すのは「見る」と「点数(ゲームの得点)を変える」だけ。名前・組み合わせ・ランクは変えられない。

create table if not exists public.shares (
  code       text primary key check (code ~ '^[0-9]{8}$'),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_id   text not null,
  enabled    boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);
alter table public.shares drop constraint if exists shares_code_check;
alter table public.shares add constraint shares_code_check check (code ~ '^[0-9]{8}$');
alter table public.shares enable row level security;
grant select, update, delete on public.shares to authenticated;
drop policy if exists "shares own" on public.shares;
create policy "shares own" on public.shares
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- コードを作る(作り直すと、前のコードは使えなくなる)。先生(ログインした人)だけ
-- まちがった番号を何度も試す人を止める(同じ接続元から10分に10回まちがえたら、しばらく入れない)
create table if not exists public.share_tries (
  ip text not null,
  at timestamptz not null default now()
);
create index if not exists share_tries_ip_at on public.share_tries (ip, at);
alter table public.share_tries enable row level security; -- 方針なし = 関数の外からは読み書きできない

create or replace function public.share_ip()
returns text
language sql
stable
set search_path = ''
as $$
  -- cf-connecting-ip は利用者が書きかえられない。x-forwarded-for は書きかえられるので予備
  select coalesce(nullif(current_setting('request.headers', true)::json->>'cf-connecting-ip', ''),
                  split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1), '')
$$;

create or replace function public.share_find(p_code text)
returns public.shares
language plpgsql
security definer set search_path = ''
as $$
declare
  s public.shares;
  me text := public.share_ip();
begin
  delete from public.share_tries where at < now() - interval '1 day';
  if (select count(*) from public.share_tries where ip = me and at > now() - interval '10 minutes') >= 10 then
    raise exception 'too many tries';
  end if;
  if p_code ~ '^[0-9]{8}$' then
    select * into s from public.shares where code = p_code and enabled;
  end if;
  if s.code is null then
    insert into public.share_tries (ip) values (me);
  end if;
  return s;
end;
$$;
revoke all on function public.share_find(text) from public, anon, authenticated;
revoke all on function public.share_ip() from public, anon, authenticated;

create or replace function public.share_create(p_event text)
returns text
language plpgsql
security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  c text;
begin
  if uid is null then raise exception 'login required'; end if;
  if not exists (select 1 from public.events where user_id = uid and id = p_event) then
    raise exception 'event not found';
  end if;
  delete from public.shares where user_id = uid and event_id = p_event;
  loop
    c := lpad(floor(random() * 100000000)::int::text, 8, '0');
    exit when not exists (select 1 from public.shares where code = c);
  end loop;
  insert into public.shares (code, user_id, event_id) values (c, uid, p_event);
  return c;
end;
$$;
revoke all on function public.share_create(text) from public, anon;
grant execute on function public.share_create(text) to authenticated;

-- コードで試合を見る。名前と学校だけ返す(ランクなどは返さない)
create or replace function public.share_get(p_code text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  s public.shares;
  d jsonb;
begin
  s := public.share_find(p_code);
  if s.code is null then return null; end if;
  select data into d from public.events where user_id = s.user_id and id = s.event_id;
  if d is null or d->>'mode' is distinct from 'practice' then return null; end if;
  return jsonb_build_object(
    'name', d->'name',
    'date', d->'date',
    'games', d->'games',
    'points', d->'points',
    'players', coalesce((select jsonb_agg(jsonb_build_object('id', p->'id', 'name', p->'name', 'school', p->'school'))
                         from jsonb_array_elements(coalesce(d->'players', '[]'::jsonb)) p), '[]'::jsonb),
    'rounds', coalesce((select jsonb_agg(jsonb_build_object(
                          'id', r->'id', 'day', r->'day',
                          'matches', coalesce((select jsonb_agg(jsonb_build_object('id', m->'id', 'ct', m->'ct', 'a', m->'a', 'b', m->'b', 'g', coalesce(m->'g', '[]'::jsonb), 'win', m->'win') order by mo)
                                               from jsonb_array_elements(coalesce(r->'matches', '[]'::jsonb)) with ordinality t(m, mo)), '[]'::jsonb))
                          order by ro)
                        from jsonb_array_elements(coalesce(d #> '{practice,rounds}', '[]'::jsonb)) with ordinality t(r, ro)), '[]'::jsonb),
    'updatedAt', d->'updatedAt'
  );
end;
$$;
grant execute on function public.share_get(text) to anon, authenticated;

-- コードで点数を入れる。p_g は [[a,b],[a,b],[a,b]] の形(空きは null)。0〜99 の整数だけ
drop function if exists public.share_score(text, text, int, jsonb);
create or replace function public.share_score(p_code text, p_round text, p_mid text, p_g jsonb)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  s public.shares;
  d jsonb;
  ri int;
  mi int;
  x jsonb;
  pts int; ng int; cap int; a int; b int; hi int; lo int; i int;
begin
  s := public.share_find(p_code);
  if s.code is null then return null; end if; -- 例外にすると「まちがえた回数」の記録まで消えるので、null で返す
  select data into d from public.events where user_id = s.user_id and id = s.event_id for update;
  if d is null then raise exception 'event not found'; end if;
  select (t.ord - 1)::int into ri
    from jsonb_array_elements(coalesce(d #> '{practice,rounds}', '[]'::jsonb)) with ordinality t(r, ord)
    where t.r->>'id' = p_round;
  if ri is null then raise exception 'round not found'; end if;
  select (t.ord - 1)::int into mi
    from jsonb_array_elements(coalesce(d #> array['practice', 'rounds', ri::text, 'matches'], '[]'::jsonb)) with ordinality t(m, ord)
    where t.m->>'id' = p_mid;
  if mi is null then raise exception 'match not found'; end if;
  -- 本当にありえない点数だけ記録しない(上限を超える・もう終わっているはずの点差)。途中の点数・片方だけは入れてよい
  pts := coalesce((d->>'points')::int, 21);
  ng := case when d->>'games' = '3' then 3 else 1 end;
  cap := case pts when 21 then 30 when 15 then 21 else 15 end;
  if jsonb_typeof(p_g) <> 'array' or jsonb_array_length(p_g) < 1 or jsonb_array_length(p_g) > ng then raise exception 'bad score'; end if;
  for x in select * from jsonb_array_elements(p_g) loop
    if jsonb_typeof(x) <> 'array' or jsonb_array_length(x) <> 2 then raise exception 'bad score'; end if;
    for i in 0..1 loop
      if jsonb_typeof(x->i) = 'null' then continue; end if;
      if jsonb_typeof(x->i) <> 'number' or (x->>i)::numeric <> floor((x->>i)::numeric)
         or (x->>i)::numeric < 0 or (x->>i)::numeric > cap then raise exception 'bad score'; end if;
    end loop;
    if jsonb_typeof(x->0) = 'number' and jsonb_typeof(x->1) = 'number' then
      a := (x->>0)::int; b := (x->>1)::int;
      hi := greatest(a, b); lo := least(a, b);
      if (hi = lo and hi >= cap) or (hi > pts and hi - lo > 2) then raise exception 'bad score'; end if;
    end if;
  end loop;
  d := jsonb_set(d, array['practice', 'rounds', ri::text, 'matches', mi::text, 'g'], p_g);
  d := jsonb_set(d, array['practice', 'rounds', ri::text, 'matches', mi::text, 'win'], 'null'::jsonb);
  d := jsonb_set(d, '{updatedAt}', to_jsonb((extract(epoch from now()) * 1000)::bigint));
  update public.events set data = d, updated_at = now() where user_id = s.user_id and id = s.event_id;
  return public.share_get(p_code);
end;
$$;
grant execute on function public.share_score(text, text, text, jsonb) to anon, authenticated;

-- コート番号(2文字まで。数字と英大文字だけ。空にもできる)を選手が入れる
create or replace function public.share_court(p_code text, p_round text, p_mid text, p_ct text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  s public.shares;
  d jsonb;
  ri int;
  mi int;
begin
  s := public.share_find(p_code);
  if s.code is null then return null; end if;
  if p_ct is null or p_ct !~ '^[0-9A-Z]{0,2}$' then raise exception 'bad court'; end if;
  select data into d from public.events where user_id = s.user_id and id = s.event_id for update;
  if d is null then raise exception 'event not found'; end if;
  select (t.ord - 1)::int into ri
    from jsonb_array_elements(coalesce(d #> '{practice,rounds}', '[]'::jsonb)) with ordinality t(r, ord)
    where t.r->>'id' = p_round;
  if ri is null then raise exception 'round not found'; end if;
  select (t.ord - 1)::int into mi
    from jsonb_array_elements(coalesce(d #> array['practice', 'rounds', ri::text, 'matches'], '[]'::jsonb)) with ordinality t(m, ord)
    where t.m->>'id' = p_mid;
  if mi is null then raise exception 'match not found'; end if;
  d := jsonb_set(d, array['practice', 'rounds', ri::text, 'matches', mi::text, 'ct'], to_jsonb(p_ct));
  d := jsonb_set(d, '{updatedAt}', to_jsonb((extract(epoch from now()) * 1000)::bigint));
  update public.events set data = d, updated_at = now() where user_id = s.user_id and id = s.event_id;
  return public.share_get(p_code);
end;
$$;
grant execute on function public.share_court(text, text, text, text) to anon, authenticated;
