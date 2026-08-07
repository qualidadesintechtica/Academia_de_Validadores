# Academia dos Validadores V3

Arquitetura: GitHub Pages + Supabase.

1. Execute `supabase/SUPABASE_SETUP.sql` no Supabase.
2. Preencha `js/config.js` com a Project URL e a chave pública anon/publishable.
3. No Supabase > Authentication > URL Configuration:
   - Site URL: https://qualidadesintechtica.github.io/Academia_de_Validadores/
   - Redirect URLs:
     - https://qualidadesintechtica.github.io/Academia_de_Validadores/
     - https://qualidadesintechtica.github.io/Academia_de_Validadores/login.html
4. Publique na branch `main`, pasta `/ (root)`.

Nunca use a service_role key no front-end.
