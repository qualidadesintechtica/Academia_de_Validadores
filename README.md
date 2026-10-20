## Senha temporária e primeiro acesso — 20/10/2026

Em **Participantes → Trocar senha**, a administração pode digitar e confirmar uma senha temporária. O professor deverá definir outra antes de continuar. A recuperação por e-mail permanece disponível.

**Instale o SQL e publique a Edge Function antes de atualizar os arquivos do GitHub.** Consulte **[LEIA_SENHA_TEMPORARIA.md](LEIA_SENHA_TEMPORARIA.md)**. Apenas subir o HTML não ativa a atribuição manual de senhas.

# Atualização de 20/10/2026 — troca de senha

A aba **Participantes** agora tem **Trocar senha**. A administração solicita o link e o participante define a própria senha na nova tela. Para publicar, autorize a URL de retorno e siga **LEIA_TROCA_DE_SENHA.md**. Não há novo SQL; as permissões administrativas existentes foram mantidas.

# Atualização de 08/10/2026

Para habilitar a edição de nomes, o FAQ e o quiz interativo no sistema atual, siga **LEIA_FAQ_QUIZ.md**.

As instruções abaixo são as orientações originais para uma instalação inicial.

# Academia dos Validadores V4 Final

Arquitetura:
- GitHub Pages = hospedagem
- Supabase = autenticação, usuários, progresso e certificados
- Cloudflare = não utilizado

Antes de publicar:
1. Execute `supabase/SUPABASE_SETUP.sql` no SQL Editor do Supabase.
2. Preencha `js/config.js` com:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
3. No Supabase > Authentication > URL Configuration:
   - Site URL:
     https://qualidadesintechtica.github.io/Academia_de_Validadores/
   - Redirect URLs:
     https://qualidadesintechtica.github.io/Academia_de_Validadores/
     https://qualidadesintechtica.github.io/Academia_de_Validadores/login.html
4. Publique na branch `main`, pasta `/ (root)`.

Nunca use a chave `service_role` no front-end.
