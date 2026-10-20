-- Academia: senha temporária definida pela administração.
-- Execute o arquivo COMPLETO depois de EDICAO_PERFIS_SETUP.sql.
-- Não digite senhas neste SQL. A atribuição usa exclusivamente a API Auth no servidor.
begin;

do $$
begin
  if to_regprocedure('public.is_academia_perfil_admin()') is null then
    raise exception 'Execute primeiro EDICAO_PERFIS_SETUP.sql.';
  end if;
end;
$$;

create schema if not exists academia_privado;
revoke all on schema academia_privado from public, anon, authenticated;

-- Apenas datas/IDs; nenhuma senha ou hash é copiado para esta tabela.
create table if not exists academia_privado.senhas_temporarias (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pedido_id uuid not null,
  transacao_atribuicao bigint not null,
  atribuida_por uuid not null,
  atribuida_em timestamptz not null default now(),
  alterada_em timestamptz
);
alter table academia_privado.senhas_temporarias enable row level security;
revoke all on academia_privado.senhas_temporarias from public, anon, authenticated;

create or replace function public.academia_senha_pendente()
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is null or exists (
    select 1 from academia_privado.senhas_temporarias s
    where s.user_id = auth.uid() and s.alterada_em is null
  );
$$;
revoke all on function public.academia_senha_pendente() from public, anon;
grant execute on function public.academia_senha_pendente() to authenticated;

-- Observa a gravação real do Auth. O marcador em app_metadata é gravado somente
-- pela API administrativa; user_metadata ou localStorage não liberam o acesso.
create or replace function academia_privado.registrar_senha_temporaria()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_novo jsonb;
  v_email text;
  v_admin uuid;
  v_pedido uuid;
begin
  -- O Auth grava senha e metadados em comandos separados na mesma transação.
  -- A execução adiada lê o resultado final, independentemente da ordem.
  select u.raw_app_meta_data -> 'academia_senha_temporaria', u.email
    into v_novo, v_email from auth.users u where u.id = new.id;
  if not found then return new; end if;
  if v_novo ->> 'pedido' is not null and not exists (
    select 1 from academia_privado.senhas_temporarias s
    where s.user_id = new.id and s.pedido_id::text = v_novo ->> 'pedido'
  ) then
    v_admin := (v_novo ->> 'administrador')::uuid;
    v_pedido := (v_novo ->> 'pedido')::uuid;
    if v_admin is null or v_admin = new.id
       or not exists (select 1 from public.relatorio_admins a
                      where a.user_id = v_admin and a.ativo)
       or exists (select 1 from academia_privado.senhas_temporarias s
                  where s.user_id = v_admin and s.alterada_em is null) then
      raise exception 'Administrador não autorizado.' using errcode = '42501';
    end if;
    if lower(coalesce(v_email, '')) <> lower(coalesce(v_novo ->> 'email', ''))
       or coalesce(v_email, '') = '' then
      raise exception 'O cadastro mudou. Atualize a lista.' using errcode = '40001';
    end if;
    if exists (select 1 from academia_privado.senhas_temporarias s
               where s.user_id = new.id and s.atribuida_em > now() - interval '60 seconds') then
      raise exception 'Aguarde um minuto antes de definir outra senha temporária.' using errcode = 'P0001';
    end if;
    insert into academia_privado.senhas_temporarias
      (user_id, pedido_id, transacao_atribuicao, atribuida_por, atribuida_em, alterada_em)
    values (new.id, v_pedido, txid_current(), v_admin, now(), null)
    on conflict (user_id) do update set
      pedido_id = excluded.pedido_id, atribuida_por = excluded.atribuida_por,
      transacao_atribuicao = excluded.transacao_atribuicao,
      atribuida_em = excluded.atribuida_em, alterada_em = null;
  elsif new.encrypted_password is distinct from old.encrypted_password
        and coalesce(new.encrypted_password, '') <> '' then
    -- Também funciona na recuperação por e-mail. Só o Auth grava a senha real.
    update academia_privado.senhas_temporarias set alterada_em = now()
    where user_id = new.id and alterada_em is null
      and transacao_atribuicao <> txid_current();
  end if;
  return new;
end;
$$;
revoke all on function academia_privado.registrar_senha_temporaria() from public, anon, authenticated;
drop trigger if exists academia_registrar_senha_temporaria on auth.users;
create constraint trigger academia_registrar_senha_temporaria
after update on auth.users deferrable initially deferred
for each row execute function academia_privado.registrar_senha_temporaria();

-- Mantém a autorização atual dos relatórios e acrescenta a exigência de troca.
-- O nome original é preservado para guardar eventuais regras locais existentes.
do $$
begin
  if to_regprocedure('academia_privado.is_relatorio_admin_original()') is null then
    alter function public.is_relatorio_admin() set schema academia_privado;
    alter function academia_privado.is_relatorio_admin() rename to is_relatorio_admin_original;
  end if;
end;
$$;
revoke all on function academia_privado.is_relatorio_admin_original() from public, anon, authenticated;
-- Políticas existentes podem manter referência por OID à função original.
-- A execução permite avaliá-las; o schema privado segue inacessível pela API,
-- e a política restritiva abaixo exige a troca em todas essas tabelas.
grant execute on function academia_privado.is_relatorio_admin_original() to authenticated;
create or replace function public.is_relatorio_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select not public.academia_senha_pendente()
    and coalesce(academia_privado.is_relatorio_admin_original(), false);
$$;
revoke all on function public.is_relatorio_admin() from public, anon;
grant execute on function public.is_relatorio_admin() to authenticated;

-- Recompila a dependência para que RPCs administrativas usem a nova barreira.
create or replace function public.is_academia_perfil_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and not public.academia_senha_pendente()
    and coalesce(public.is_relatorio_admin(), false);
$$;
revoke all on function public.is_academia_perfil_admin() from public, anon;
grant execute on function public.is_academia_perfil_admin() to authenticated;

-- Políticas RESTRITIVAS: são somadas às permissões existentes, sem removê-las.
-- Uma sessão antiga também fica bloqueada quando há uma nova senha pendente.
do $$
declare v_tabela text;
begin
  foreach v_tabela in array array['profiles', 'progresso_modulos', 'certificados',
                                  'acessos_academia', 'relatorio_admins'] loop
    if to_regclass('public.' || v_tabela) is not null then
      execute format('drop policy if exists academia_exigir_troca_senha on public.%I', v_tabela);
      execute format('create policy academia_exigir_troca_senha on public.%I
        as restrictive for all to authenticated
        using (not public.academia_senha_pendente())
        with check (not public.academia_senha_pendente())', v_tabela);
    end if;
  end loop;
end;
$$;
commit;
