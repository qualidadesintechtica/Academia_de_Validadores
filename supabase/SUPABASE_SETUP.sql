
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,nome text not null default '',created_at timestamptz not null default now());
create table if not exists public.progresso_modulos(id bigint generated always as identity primary key,user_id uuid not null references auth.users(id) on delete cascade,modulo_id int not null check(modulo_id between 1 and 7),concluido boolean not null default false,concluido_em timestamptz,unique(user_id,modulo_id));
alter table public.profiles enable row level security;
alter table public.progresso_modulos enable row level security;
drop policy if exists profiles_select_own on public.profiles; create policy profiles_select_own on public.profiles for select using(auth.uid()=id);
drop policy if exists profiles_insert_own on public.profiles; create policy profiles_insert_own on public.profiles for insert with check(auth.uid()=id);
drop policy if exists profiles_update_own on public.profiles; create policy profiles_update_own on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
drop policy if exists progress_select_own on public.progresso_modulos; create policy progress_select_own on public.progresso_modulos for select using(auth.uid()=user_id);
drop policy if exists progress_insert_own on public.progresso_modulos; create policy progress_insert_own on public.progresso_modulos for insert with check(auth.uid()=user_id);
drop policy if exists progress_update_own on public.progresso_modulos; create policy progress_update_own on public.progresso_modulos for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,nome) values(new.id,coalesce(new.raw_user_meta_data->>'nome','')) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
