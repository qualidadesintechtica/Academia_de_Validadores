# Atualização da Academia — edição de nomes

Para a versão atual com FAQ e quiz, siga **LEIA_FAQ_QUIZ.md**.

Esta atualização adiciona **Meu perfil** para todos os participantes e **Participantes** para os administradores autorizados.

## Ativar no sistema atual

1. No Supabase **da Academia**, abra **SQL Editor**, cole todo o conteúdo de `supabase/EDICAO_PERFIS_SETUP.sql` e execute.
2. No repositório `qualidadesintechtica/Academia_de_Validadores`, copie os arquivos deste pacote para as mesmas pastas e publique pelo GitHub Pages como já faz hoje. Copie o conteúdo da pasta do pacote para a raiz do projeto; não crie uma segunda pasta de site dentro dela.
3. Aguarde a publicação e atualize a página com **Ctrl + Shift + R**.

O pacote de atualização contém os arquivos novos e os arquivos alterados. Pode ser aplicado sobre a Academia atual: os vídeos, imagens e os demais arquivos continuam sendo os que já estão no repositório. A versão completa reúne também esses materiais.

Não é necessário executar novamente `SUPABASE_SETUP.sql` nem `RELATORIO_ACESSOS_SETUP.sql` para esta atualização.

## Como o participante edita o próprio nome

Entre na Academia, abra **Meu perfil**, corrija **Nome completo** e clique em **Salvar alterações**. O nome fica salvo na conta e passa a aparecer no cabeçalho e nas próximas gerações do certificado. **Descartar alterações** restaura o último nome salvo.

O campo **E-mail de acesso** identifica a conta e é somente para consulta. Esta atualização cuida da edição dos nomes.

## Como a administração corrige os nomes

As contas ativas em `public.relatorio_admins` recebem a opção **Participantes**. Pesquise por nome ou e-mail, clique em **Editar nome**, corrija o cadastro e salve. A lista inclui também as pessoas que ainda não têm nome informado ou que nunca tiveram um acesso registrado.

Se sua conta já é administradora do Relatório de Acessos, a autorização é reaproveitada. Se **Participantes** não aparecer, confira no Supabase se sua conta está em `public.relatorio_admins` com `ativo = true`.

Para autorizar uma conta específica, troque o endereço abaixo pelo e-mail real usado no login e execute este bloco no SQL Editor:

```sql
insert into public.relatorio_admins(user_id, email, nome, ativo)
select id, email, coalesce(raw_user_meta_data ->> 'nome', ''), true
from auth.users
where lower(email) = lower('SEU.EMAIL@animaeducacao.com.br')
on conflict(user_id) do update
set ativo = true, email = excluded.email, nome = excluded.nome;
```

A conta precisa existir na Academia antes dessa autorização. Se a consulta não inserir nenhuma linha, confira o e-mail. Essa autorização também dá acesso ao Relatório de Acessos, conforme a permissão administrativa já usada pelo sistema.

## Onde os nomes são atualizados

- Conta no Supabase: `nome`, `full_name` e `display_name` são gravados juntos; os demais metadados são preservados.
- Cabeçalho e **Meu perfil**: mostram o cadastro atualizado. Após uma correção administrativa, o participante pode atualizar a página para ver o novo nome.
- Certificado: as próximas gerações usam o nome atualizado. PDFs já baixados precisam ser gerados novamente.
- Relatório de Acessos e CSV: mostram o nome atual do cadastro; os registros históricos de acesso permanecem preservados.
- Tabela legada `profiles`: o nome também é sincronizado quando essa tabela existe. Nível, progresso e códigos de certificado são mantidos.

Se alguém alterar o nome enquanto uma edição administrativa estiver aberta, o sistema pede para atualizar a lista antes de salvar novamente.

## Validação realizada

Testados salvamento e persistência do próprio perfil, correção administrativa de nomes ausentes, sincronização dos nomes, exibição no certificado e no relatório, falha de conexão, conflito de edição, bloqueio de visitantes e de participantes comuns na administração, desativação da permissão e telas em computador e celular. O SQL foi validado também sem a tabela legada `profiles`.

Os testes foram realizados em ambiente local. A atualização precisa ser ativada no Supabase e publicada no GitHub Pages para aparecer no site em uso.
