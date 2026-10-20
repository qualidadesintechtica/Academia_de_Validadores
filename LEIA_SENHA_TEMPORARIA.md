# Senha temporária definida manualmente

A administração digita uma senha em **Participantes → Trocar senha → Senha temporária**, confirma no segundo campo e clica em **Definir senha temporária**. O professor entra com seu e-mail e essa senha, define uma senha pessoal diferente e volta ao login para entrar com ela. A exigência vale no próximo acesso após cada atribuição manual, inclusive para quem já usava a Academia.

A pasta contém a Academia completa, com materiais, vídeos, nomes, recuperação por e-mail, relatórios, progresso e certificados. Não é necessário recadastrar os professores.

## Instalação — nesta ordem

### 1. Instale o SQL no projeto Supabase da Academia

Se a edição/listagem de participantes já está funcionando, execute apenas o novo arquivo **supabase/SENHA_TEMPORARIA_SETUP.sql**. Se ainda não foi instalada, execute primeiro **supabase/EDICAO_PERFIS_SETUP.sql**.

No SQL Editor, crie uma consulta, cole **o conteúdo completo do arquivo novo**, desde `begin;` até `commit;`, e execute tudo. Não execute trechos isolados. O arquivo pode ser executado novamente: preserva participantes e pendências existentes.

Ele cria o controle privado de troca, o RPC de consulta do próprio acesso, o trigger de confirmação da troca real e políticas restritivas para os dados da Academia. Mantém as permissões existentes dos relatórios. Se precisar reinstalar os SQLs antigos no futuro, execute este arquivo novo por último.

### 2. Publique a função de servidor

No mesmo projeto, em **Edge Functions**, crie a função com o nome exato:

`academia-senha-temporaria`

Use o código completo de **supabase/functions/academia-senha-temporaria/index.ts** e publique a função. Mantenha a verificação de JWT ativada. Se usar a CLI já configurada para este projeto, na raiz da pasta execute:

```sh
supabase functions deploy academia-senha-temporaria
```

O arquivo **supabase/config.toml** contém a configuração dessa função. Se já existir um config.toml no seu ambiente de implantação, acrescente a seção desta função sem substituir as demais configurações.

As variáveis `SUPABASE_URL` e os mapas `SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS` são lidos do ambiente de servidor do Supabase. Há compatibilidade com `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` quando o projeto usa as variáveis anteriores. Nenhum valor de chave administrativa está incluído nesta pasta. Não coloque chaves administrativas em `js/config.js` ou no GitHub.

A origem permitida padrão é `https://qualidadesintechtica.github.io`, que atende ao endereço atual da Academia. Caso use outro domínio, configure a variável de ambiente `ACADEMIA_ORIGINS` na função com as origens exatas separadas por vírgula, sem caminhos ou barra final.

### 3. Atualize os arquivos no GitHub

Depois de concluir as duas etapas anteriores, extraia o ZIP e atualize a raiz do repositório **Academia_de_Validadores** com o conteúdo da pasta **Academia_de_Validadores-main**. Inclua os novos arquivos **primeiro-acesso.html** e **js/primeiro-acesso.js** e substitua as versões de JavaScript/HTML existentes. O `js/config.js` da versão anterior foi preservado.

A publicação somente no GitHub não publica a Edge Function nem instala o SQL. A página consulta o servidor antes de liberar a entrada; se esse serviço estiver indisponível ou o SQL não estiver instalado, mostra uma mensagem para tentar novamente, sem liberar o acesso por engano.

## Como utilizar

1. Entre com uma conta administrativa já autorizada em `relatorio_admins`.
2. Abra **Participantes**, localize o professor e clique em **Trocar senha**.
3. Confira o nome e o e-mail. Digite e confirme uma senha temporária de 8 a 128 caracteres, conforme as regras de segurança do projeto.
4. Clique em **Definir senha temporária** e aguarde a confirmação. Informe ao professor a senha que você escolheu, pelo canal institucional utilizado por vocês. A atribuição manual não envia essa senha por e-mail.
5. O professor entra com o e-mail cadastrado e a senha temporária. A tela **Crie sua senha pessoal** será aberta. Ele deve escolher uma senha diferente, confirmar e salvar.
6. Depois da confirmação, volta ao login e entra com sua senha pessoal. O progresso e os certificados continuam disponíveis.

O cadastro deve existir no Auth. A operação não cria contas nem confirma e-mails automaticamente. Se o cadastro ainda exige confirmação de e-mail, a confirmação continua necessária. Há um intervalo mínimo de um minuto entre atribuições manuais para o mesmo professor. Para a própria conta administrativa, use a opção de recuperação por e-mail.

O botão **Enviar link por e-mail** continua na janela. **Esqueci minha senha** continua no login. O fluxo de e-mail ainda requer a URL de retorno descrita em **LEIA_TROCA_DE_SENHA.md**. Uma troca concluída por esse caminho também encerra a pendência da senha temporária.

## Como a exigência é aplicada

A função valida a sessão no Auth, consulta a autorização administrativa no banco e confere o ID e o e-mail atual do participante. A chave administrativa permanece no servidor. O navegador não escolhe quem é administrador e não pode remover a pendência editando seus metadados.

A senha e o marcador protegido são enviados pela API administrativa do Auth. O trigger adiado lê o resultado ao final da transação do Auth, que pode gravar senha e metadados em comandos separados. Uma falha de autorização ou de cadastro desfaz a transação. Uma alteração posterior real da senha pelo Auth encerra a pendência; mudanças no nome e em metadados editáveis não a encerram.

A tabela privada guarda apenas identificadores e datas de atribuição/troca, além do identificador da transação. Não armazena a senha nem copia seu hash. A página não grava senhas em histórico, relatórios ou armazenamento local; limpa os campos ao salvar, fechar ou sair.

Login e páginas internas consultam a pendência no servidor. As políticas do banco bloqueiam leitura/escrita dos dados da Academia durante a pendência, inclusive com uma sessão anterior à atribuição. Os arquivos HTML, vídeos e PDFs continuam hospedados estaticamente no GitHub Pages, como na versão anterior; o redirecionamento da interface não torna esses arquivos privados. Para restringir também o download direto desses arquivos, seria necessário hospedá-los com autorização de servidor.

## Conferência desta entrega

- 114 verificações de DOM simulado: senha manual, confirmação, edição de nome, recuperação por e-mail, permissões, cadastro alterado, logout, sessão expirada, troca obrigatória, erros e nova verificação sem salvar duas vezes.
- 46 verificações de regressão da recuperação por e-mail e dos links antigos.
- 159 verificações da Edge Function com clientes simulados: autenticação, permissão, instalação incompleta, destinatário, validação, falhas, CORS e resposta sem credenciais.
- 32 verificações em PostgreSQL local (PGlite): instalação repetida, ordem das gravações do Auth, políticas restritivas, permissões, intervalo, rollback, mudança efetiva de senha e preservação de progresso/certificados.
- Sintaxe dos arquivos JavaScript conferida; formulário administrativo e tela de primeiro acesso inspecionados no navegador com dados fictícios.

Não foram alteradas senhas reais, enviados e-mails reais, publicados arquivos no GitHub ou executados SQL/funções no Supabase de produção. Após a instalação, confira com uma conta de professor de teste: atribuição manual → entrada → troca obrigatória → novo login → progresso preservado.

Referências técnicas oficiais:
- https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid
- https://supabase.com/docs/reference/javascript/auth-updateuser
- https://supabase.com/docs/guides/functions/auth
- https://supabase.com/docs/guides/functions/secrets
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://github.com/supabase/auth/blob/master/internal/api/admin.go
