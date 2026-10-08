-- Academia dos Validadores: edição do próprio nome e dos participantes.
-- Execute este arquivo completo no SQL Editor do Supabase da Academia.
-- Usa os administradores já autorizados em public.relatorio_admins.
begin;

create table if not exists public.relatorio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text not null default '',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.relatorio_admins enable row level security;

-- Somente o banco concede a permissão; metadados editáveis não autorizam.
create or replace function public.is_academia_perfil_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.relatorio_admins a
    where a.user_id = auth.uid() and a.ativo = true
  );
$$;
revoke all on function public.is_academia_perfil_admin() from public, anon;
grant execute on function public.is_academia_perfil_admin() to authenticated;

create or replace function public.academia_listar_participantes(
  p_busca text default '', p_offset integer default 0, p_limite integer default 101
)
returns table (user_id uuid, email text, nome text)
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_academia_perfil_admin() then
    raise exception 'Acesso administrativo necessário.' using errcode = '42501';
  end if;
  if char_length(coalesce(p_busca, '')) > 200 or coalesce(p_offset, 0) < 0 then
    raise exception 'Pesquisa inválida.' using errcode = '22023';
  end if;
  return query
  select u.id, u.email::text,
    coalesce(nullif(btrim(u.raw_user_meta_data ->> 'nome'), ''),
             nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
             nullif(btrim(u.raw_user_meta_data ->> 'nome_completo'), ''),
             nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
             nullif(btrim(u.raw_user_meta_data ->> 'name'), ''), '')
  from auth.users u
  where position(lower(btrim(coalesce(p_busca, ''))) in lower(
    coalesce(u.email, '') || ' ' || coalesce(u.raw_user_meta_data ->> 'nome', '') || ' ' ||
    coalesce(u.raw_user_meta_data ->> 'display_name', '') || ' ' ||
    coalesce(u.raw_user_meta_data ->> 'nome_completo', '') || ' ' ||
    coalesce(u.raw_user_meta_data ->> 'full_name', '') || ' ' ||
    coalesce(u.raw_user_meta_data ->> 'name', ''))) > 0
  order by lower(coalesce(u.email, '')), u.id
  limit least(greatest(coalesce(p_limite, 101), 1), 101)
  offset coalesce(p_offset, 0);
end;
$$;
revoke all on function public.academia_listar_participantes(text, integer, integer) from public, anon;
grant execute on function public.academia_listar_participantes(text, integer, integer) to authenticated;

create or replace function public.academia_editar_nome_participante(
  p_user_id uuid, p_nome text, p_nome_anterior text
)
returns table (user_id uuid, email text, nome text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_nome text;
  v_atual text;
begin
  if not public.is_academia_perfil_admin() then
    raise exception 'Acesso administrativo necessário.' using errcode = '42501';
  end if;
  if p_nome is null or p_nome ~ '[[:cntrl:]]' then
    raise exception 'Nome inválido.' using errcode = '22023';
  end if;
  v_nome := btrim(regexp_replace(p_nome, '[[:space:]]+', ' ', 'g'));
  if char_length(v_nome) < 1 or char_length(v_nome) > 150 then
    raise exception 'Informe um nome com até 150 caracteres.' using errcode = '22023';
  end if;
  select coalesce(nullif(btrim(u.raw_user_meta_data ->> 'nome'), ''),
                  nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''),
                  nullif(btrim(u.raw_user_meta_data ->> 'nome_completo'), ''),
                  nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
                  nullif(btrim(u.raw_user_meta_data ->> 'name'), ''), '')
  into v_atual from auth.users u where u.id = p_user_id for update;
  if not found then
    raise exception 'Participante não encontrado.' using errcode = 'P0002';
  end if;
  if v_atual is distinct from p_nome_anterior then
    raise exception 'O nome mudou. Atualize a lista antes de editar.' using errcode = '40001';
  end if;
  return query update auth.users u
  set raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb) ||
    jsonb_build_object('nome', v_nome, 'full_name', v_nome, 'display_name', v_nome),
    updated_at = now()
  where u.id = p_user_id
  returning u.id, u.email::text, v_nome;
end;
$$;
revoke all on function public.academia_editar_nome_participante(uuid, text, text) from public, anon;
grant execute on function public.academia_editar_nome_participante(uuid, text, text) to authenticated;

-- Espelha o nome na tabela legada de perfis, quando ela existe.
-- Mantém nível, progresso, certificados e o histórico de acessos.
create or replace function public.academia_sincronizar_nome_perfil()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_nome text;
begin
  v_nome := nullif(btrim(new.raw_user_meta_data ->> 'nome'), '');
  if v_nome is not null and to_regclass('public.profiles') is not null then
    execute 'insert into public.profiles(id, nome) values ($1, $2)
             on conflict(id) do update set nome = excluded.nome'
    using new.id, v_nome;
  end if;
  return new;
end;
$$;
revoke all on function public.academia_sincronizar_nome_perfil() from public, anon, authenticated;
drop trigger if exists academia_sincronizar_nome_perfil on auth.users;
create trigger academia_sincronizar_nome_perfil
after update of raw_user_meta_data on auth.users
for each row
execute function public.academia_sincronizar_nome_perfil();

commit;

-- Se sua conta já aparece em relatorio_admins com ativo=true, basta atualizar a página.
-- Para autorizar outra conta, execute separadamente após trocar o e-mail:
-- insert into public.relatorio_admins(user_id, email, nome, ativo)
-- select id, email, coalesce(raw_user_meta_data->>'nome', ''), true
-- from auth.users where lower(email) = lower('SEU.EMAIL@animaeducacao.com.br')
-- on conflict(user_id) do update set ativo=true, email=excluded.email, nome=excluded.nome;
