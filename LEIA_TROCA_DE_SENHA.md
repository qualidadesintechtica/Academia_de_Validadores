> Atualização: a atribuição manual de senha temporária está em [LEIA_SENHA_TEMPORARIA.md](LEIA_SENHA_TEMPORARIA.md). O botão de envio de link por e-mail descrito abaixo continua disponível na mesma janela.

# Academia dos Validadores — troca de senha em Participantes

Atualização de 20/10/2026, aplicada sobre a versão completa de 14/10/2026.

## Publicar

1. Envie todo o conteúdo da pasta **Academia_de_Validadores-main** para a raiz do repositório da Academia, mantendo os arquivos nas mesmas pastas.
2. No **Supabase da Academia**, abra **Authentication → URL Configuration → Redirect URLs** e adicione exatamente:

   `https://qualidadesintechtica.github.io/Academia_de_Validadores/redefinir-senha.html`

3. Mantenha o Site URL e os outros endereços já autorizados. Se a Academia usar outro domínio no futuro, atualize SITE_URL em js/config.js e autorize a nova URL de redefinição nesse mesmo domínio.
4. Aguarde a publicação no GitHub Pages e recarregue com **Ctrl + Shift + R**.

**Não há novo SQL nem Edge Function.** A aba Participantes continua usando as contas ativas em `relatorio_admins`, autorizadas pela função `is_relatorio_admin()`. Não é necessário repetir os SQLs de instalação se a aba e a edição de nomes já funcionam.

## Solicitar a troca para um participante

1. Entre com uma conta administradora e abra **Participantes**.
2. Pesquise pelo nome ou e-mail.
3. Clique em **Trocar senha**, ao lado de Editar nome.
4. Confira o nome e o e-mail exibidos e clique em **Enviar link de troca de senha**.
5. O participante abre o link no próprio e-mail, confere a conta exibida na tela e define/confirma a nova senha.
6. Depois da confirmação, deve voltar ao login e entrar com a nova senha.

O e-mail de destino é conferido novamente na base antes da solicitação. Uma mudança no cadastro ou a perda de permissão administrativa interrompe o envio. A administração solicita a redefinição; a nova senha é escolhida pelo participante. Contas sem e-mail não recebem o botão habilitado.

A mensagem de solicitação enviada indica que o serviço de autenticação aceitou o pedido. A entrega deve ser conferida na caixa de entrada e no spam. O envio usa o serviço de e-mail já configurado no Supabase da Academia. Erros e limites de envio são informados na tela; a página evita cliques simultâneos e reenvio imediato para o mesmo participante.

## Recuperação pelo próprio participante

**Esqueci minha senha** continua disponível no login. Agora o link retorna para **Definir nova senha**, completando o fluxo de recuperação. A tela aceita senhas de 8 a 128 caracteres, solicita confirmação e aplica também as regras de segurança do Supabase. Links expirados ou usados mostram a opção de solicitar outro link.

A sessão do link de recuperação fica isolada da sessão administrativa. A conta mostrada na tela é obtida do Auth, e não de um e-mail informado na URL. O formulário só é liberado após a validação da sessão de recuperação. As senhas não são gravadas em arquivos, relatórios, histórico ou armazenamento local pela página. Os tokens dessa tela ficam apenas em memória; depois de salvar, a sessão de recuperação é encerrada. Se recarregar a tela antes de concluir e perder a sessão, solicite outro link.

Links antigos que retornam ao login com `type=recovery` são encaminhados para a nova tela. Esse encaminhamento ocorre antes de o cliente compartilhado consumir a sessão do link. O redirecionamento cadastrado no Supabase continua necessário para os novos pedidos.

## O que foi preservado

Edição de nomes, busca e paginação de Participantes, Meu perfil, permissões dos relatórios, cadastros, progresso, missões, quiz, certificados, materiais, vídeos e guias permanecem na pasta completa. Os SQLs, js/config.js, a regra administrativa e os dados existentes foram mantidos.

## Conferência

Passaram 72 verificações de DOM simulado: autorização administrativa, nomes e texto seguro; pedido por e-mail; confirmação do cadastro; perda de permissão; limite/reenvio; encerramento da sessão; isolamento da recuperação; links válidos, inválidos e expirados; validação das senhas; erros; gravação única; limpeza dos campos; links antigos e login normal.

Não foram enviados e-mails reais, alteradas senhas de contas reais ou feitas mudanças no Supabase/GitHub de produção. A inspeção visual em navegador real e a entrega real de e-mail precisam ser conferidas após a publicação e a configuração da URL.

Referências oficiais do fluxo:
- https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail
- https://supabase.com/docs/reference/javascript/auth-updateuser
- https://supabase.com/docs/guides/auth/redirect-urls
