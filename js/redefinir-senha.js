(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('#novaSenhaForm');
    const fields = form.querySelector('fieldset');
    const status = document.querySelector('#senhaStatus');
    const password = document.querySelector('#novaSenha');
    const confirmation = document.querySelector('#confirmarNovaSenha');
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    let recovery = hash.get('type') === 'recovery', userId = '', saving = false, completed = false, check = 0;
    const show = (message, ok = false) => { status.textContent = message; status.style.color = ok ? '#16845b' : '#a00045'; };
    const cleanURL = () => { window.history.replaceState(null, document.title, window.location.pathname); };
    function lock(message) {
      userId = ''; fields.disabled = true; form.hidden = true; form.reset();
      document.querySelector('#senhaNovoLink').hidden = false; show(message);
    }
    const c = window.ACADEMIA_CONFIG;
    if (!c?.SUPABASE_URL || !c?.SUPABASE_ANON_KEY || !window.supabase || !window.AcademiaPassword) {
      lock('Não foi possível iniciar a recuperação. Tente abrir a página novamente.'); return;
    }
    if (hash.has('error') || hash.has('error_code') || query.has('error') || query.has('error_code')) {
      cleanURL(); lock('O link expirou ou já foi utilizado. Solicite um novo link de recuperação.'); return;
    }
    // A sessão do link é isolada da sessão usada pela administração da Academia.
    // O SDK mantém os tokens somente em memória nesta tela.
    const client = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
      auth: {storageKey: 'academia-senha-recovery-isolada', persistSession: false, autoRefreshToken: false, detectSessionInUrl: true, flowType: 'implicit'}
    });
    async function verify() {
      if (saving || completed) return;
      const request = ++check;
      try {
        const {data, error} = await client.auth.getUser();
        if (request !== check || saving || completed) return;
        cleanURL();
        if (error || !data?.user || !recovery) {
          lock('Abra o link de troca de senha recebido no seu e-mail. Se ele expirou, solicite outro.'); return;
        }
        userId = data.user.id;
        document.querySelector('#senhaEmail').value = data.user.email || '';
        document.querySelector('#senhaNovoLink').hidden = true;
        form.hidden = false; fields.disabled = false; show('Informe e confirme a nova senha.');
      } catch (_) { cleanURL(); lock('Não foi possível validar o link. Solicite outro link ou tente novamente.'); }
    }
    client.auth.onAuthStateChange((event) => {
      if (completed) return;
      if (event === 'PASSWORD_RECOVERY') {
        recovery = true;
        // A verificação é feita fora do callback do Auth para evitar bloqueio da sessão.
        setTimeout(() => verify(), 0);
      } else if (event === 'SIGNED_OUT') {
        check++; lock('A sessão de recuperação terminou. Solicite outro link para continuar.');
      }
    });
    document.querySelector('#mostrarNovaSenha').addEventListener('click', event => {
      const visible = password.type === 'password';
      password.type = confirmation.type = visible ? 'text' : 'password';
      event.currentTarget.textContent = visible ? 'Ocultar senhas' : 'Mostrar senhas';
      event.currentTarget.setAttribute('aria-pressed', String(visible));
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (saving || completed || !userId) return;
      const invalid = window.AcademiaPassword.validate(password.value, confirmation.value);
      if (invalid) { show(invalid); return; }
      const expectedId = userId, newPassword = password.value;
      saving = true; fields.disabled = true; show('Salvando nova senha...');
      try {
        const current = await client.auth.getUser();
        if (current.error || current.data?.user?.id !== expectedId || userId !== expectedId) {
          lock('A sessão de recuperação terminou. Solicite um novo link.'); return;
        }
        const {data, error} = await client.auth.updateUser({password: newPassword});
        if (error) throw error;
        if (data?.user?.id !== expectedId) throw new Error('missing_user');
        completed = true; userId = ''; form.reset(); form.hidden = true;
        document.querySelector('#senhaSucesso').hidden = false;
        document.querySelector('#senhaNovoLink').hidden = true;
        show('Senha alterada com sucesso.', true); cleanURL();
        try { await client.auth.signOut({scope: 'local'}); } catch (_) { /* A sessão desta tela permanece somente em memória. */ }
      } catch (error) {
        const message = window.AcademiaPassword.errorMessage(error);
        if (error?.status === 401 || error?.status === 403 || ['session_not_found', 'reauthentication_needed', 'reauthentication_not_valid'].includes(error?.code)) lock(message);
        else show(message);
      }
      finally { saving = false; fields.disabled = completed || !userId; }
    });
    window.addEventListener('pagehide', () => { check++; form.reset(); userId = ''; });
    await verify();
  });
})();
