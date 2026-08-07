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
