# Academia dos Validadores Atualização de 08 de outubro de 2026

Esta atualização reúne a edição de nomes, o FAQ consolidado e o quiz interativo.

## Ativar a atualização

1. No Supabase da Academia, abra **SQL Editor** e execute todo o arquivo `supabase/EDICAO_PERFIS_SETUP.sql` deste pacote. Execute esta versão mesmo se já tiver instalado a atualização anterior de edição de perfis: ela vincula a administração de participantes à mesma regra de acesso dos relatórios.
2. Copie os arquivos do pacote para as mesmas pastas do repositório `qualidadesintechtica/Academia_de_Validadores` e publique pelo GitHub Pages. Copie o conteúdo da pasta para a raiz do projeto, sem criar outra pasta de site dentro dela.
3. Aguarde a publicação e atualize o navegador com **Ctrl + Shift + R**.

O pacote de atualização reúne os arquivos novos e os arquivos alterados desde a versão de 16/09/2026. Ele inclui também a edição de perfis enviada anteriormente. Os vídeos, imagens e demais arquivos existentes continuam no repositório. A versão completa inclui esses materiais.

Não é necessário executar novamente os scripts antigos de instalação inicial ou de relatório para aplicar esta atualização.

## Permissão para editar participantes

O menu **Participantes** aparece apenas para as mesmas pessoas que podem acessar **Relatório de Acessos**. A interface usa uma única verificação administrativa para os dois menus.

No banco, a listagem e a correção dos nomes também consultam a autorização dos relatórios, por meio de `public.is_relatorio_admin()`. A atualização preserva essa função quando ela já existe. Se ela não existir, cria a regra padrão baseada nas contas ativas de `public.relatorio_admins`.

Participantes comuns não conseguem listar nem editar outras pessoas, mesmo abrindo a página diretamente ou tentando chamar as funções. Alterar um campo de metadados para dizer que é administrador não concede essa permissão.

**Meu perfil** continua disponível para cada usuário editar somente o próprio nome, conforme solicitado anteriormente. O e-mail identifica a conta e permanece somente para consulta.

## FAQ interativo

Abra **Ajuda & FAQ**. Foram incluídas as 26 perguntas do documento enviado, com busca em perguntas e respostas, filtro por tema e botões para expandir ou recolher as respostas. A busca reconhece termos com ou sem acentos.

Os passos de validação de UA e BDQ aparecem como listas numeradas. Os links para uma orientação específica abrem essa resposta e posicionam a pergunta abaixo do cabeçalho da página.

O texto incorpora as revisões do documento, excluindo trechos marcados como removidos. Foram corrigidos erros pontuais de redação sem alterar os procedimentos.

## Quiz interativo

Abra **Missões** e clique em **Começar quiz**, ou use **Responder quiz** no FAQ ou no módulo 7.

- São 10 questões, com cinco alternativas por questão.
- Selecione uma alternativa e clique em **Conferir resposta**.
- O sistema identifica a resposta correta, explica o conteúdo e oferece um link para a orientação correspondente do FAQ.
- Avance com **Próxima questão**. É possível voltar para consultar as questões já respondidas.
- Ao concluir, veja o percentual de acertos e a correção das 10 questões.
- **Refazer quiz** inicia uma nova tentativa.

O gabarito é o destacado em verde no documento do quiz enviado. As explicações foram baseadas no FAQ anexado.

O andamento e o resultado ficam guardados neste navegador, separados por participante. Para retomá-los, use a mesma conta e o mesmo navegador. Se o armazenamento do navegador estiver bloqueado, a atividade ainda funciona enquanto a página estiver aberta.

O quiz é uma atividade de revisão. A liberação do certificado continua vinculada à conclusão dos sete módulos; não foi criada uma nota mínima para certificação nem um relatório de notas no banco.

## Verificações realizadas

Testados o bloqueio de participantes comuns e visitantes na administração, a preservação da regra administrativa existente, a edição de nomes e sua sincronização, a busca e os filtros do FAQ, o gabarito das dez questões, a correção e o resultado, a retomada separada por participante, o reinício da atividade, o funcionamento sem armazenamento local e o layout em computador e celular.

Os testes foram feitos em ambiente local. A atualização precisa ser ativada no Supabase e publicada para aparecer no sistema em uso.
