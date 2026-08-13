-- =============================================================
-- ACADEMIA DOS VALIDADORES - RELATORIO DE ACESSOS
-- Execute UMA VEZ no SQL Editor do Supabase.
-- =============================================================

create table if not exists public.relatorio_admins(
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.acessos_academia(
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  nome text,
  origem text not null default 'login',
  acessado_em timestamptz not null default now()
);

create index if not exists acessos_academia_user_idx
  on public.acessos_academia(user_id);

create index if not exists acessos_academia_data_idx
  on public.acessos_academia(acessado_em desc);

alter table public.relatorio_admins enable row level security;
alter table public.acessos_academia enable row level security;

-- Função de segurança usada pelas políticas de leitura administrativa.
create or replace function public.is_relatorio_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select exists(
    select 1
    from public.relatorio_admins a
    where a.user_id=auth.uid()
      and a.ativo=true
  );
$$;

revoke all on function public.is_relatorio_admin() from public;
grant execute on function public.is_relatorio_admin() to authenticated;

-- O usuário pode descobrir apenas se ELE PRÓPRIO é administrador.
drop policy if exists relatorio_admin_select_own on public.relatorio_admins;
create policy relatorio_admin_select_own
on public.relatorio_admins
for select
to authenticated
using(user_id=auth.uid() and ativo=true);

-- Cada usuário autenticado registra somente o próprio acesso.
drop policy if exists acessos_insert_own on public.acessos_academia;
create policy acessos_insert_own
on public.acessos_academia
for insert
to authenticated
with check(user_id=auth.uid());

-- Apenas administradores autorizados leem o relatório de acessos.
drop policy if exists acessos_select_admin on public.acessos_academia;
create policy acessos_select_admin
on public.acessos_academia
for select
to authenticated
using(public.is_relatorio_admin());

-- Permite que os administradores do relatório consultem nome, progresso e certificados.
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
on public.profiles
for select
to authenticated
using(public.is_relatorio_admin());

drop policy if exists progress_select_admin on public.progresso_modulos;
create policy progress_select_admin
on public.progresso_modulos
for select
to authenticated
using(public.is_relatorio_admin());

drop policy if exists cert_select_admin on public.certificados;
create policy cert_select_admin
on public.certificados
for select
to authenticated
using(public.is_relatorio_admin());

-- =============================================================
-- AUTORIZAR PESSOAS ESPECIFICAS
-- Depois de executar o bloco acima, troque o e-mail abaixo e rode.
-- Repita para cada pessoa autorizada.
-- =============================================================

-- EXEMPLO (NAO EXECUTE SEM TROCAR O E-MAIL):
-- insert into public.relatorio_admins(user_id,email,nome,ativo)
-- select
--   id,
--   email,
--   coalesce(raw_user_meta_data->>'nome',''),
--   true
-- from auth.users
-- where lower(email)=lower('PESSOA.AUTORIZADA@animaeducacao.com.br')
-- on conflict(user_id) do update
-- set email=excluded.email,
--     nome=excluded.nome,
--     ativo=true;
