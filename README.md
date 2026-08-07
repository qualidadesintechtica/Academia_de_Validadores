# Academia dos Validadores V3 Premium

Arquitetura oficial:
- GitHub Pages = hospedagem
- Supabase = autenticação, usuários, progresso e certificados
- Cloudflare = não utilizado

## Instalação
1. No Supabase, execute `supabase/SUPABASE_SETUP.sql`.
2. Abra `js/config.js`.
3. Preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
4. No Supabase > Authentication > URL Configuration:
   - Site URL:
     `https://qualidadesintechtica.github.io/Academia_de_Validadores/`
   - Redirect URLs:
     `https://qualidadesintechtica.github.io/Academia_de_Validadores/`
     `https://qualidadesintechtica.github.io/Academia_de_Validadores/login.html`
5. Publique o conteúdo na branch `main`, pasta `/ (root)`.
6. Nunca publique a chave `service_role`.

## Recursos incluídos
- Login, cadastro e recuperação de senha via Supabase Auth
- Sessão protegida
- Botão Sair
- Dashboard premium
- Gui integrado
- 7 módulos
- Progresso persistente
- Medalhas
- Missões
- FAQ
- Certificado para impressão/PDF
- Responsivo

## Importante sobre o login
Se o login não funcionar, confira `js/config.js`. Os campos `SUPABASE_URL` e
`SUPABASE_ANON_KEY` precisam estar preenchidos com os dados públicos do mesmo
projeto Supabase onde os usuários foram cadastrados. Sem isso, o sistema não
consegue reconhecer e-mail e senha.
