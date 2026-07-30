-- Execute no SQL Editor do Supabase para permitir que cada usuário veja e atualize somente o próprio perfil.
create policy "usuario_le_proprio_perfil"
on public.usuarios for select
using (auth.uid() = id);

create policy "usuario_atualiza_proprio_perfil"
on public.usuarios for update
using (auth.uid() = id)
with check (auth.uid() = id);
