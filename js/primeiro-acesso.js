(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('#novaSenhaForm');
    const fields = form.querySelector('fieldset');
    const password = document.querySelector('#novaSenha');
    const confirmation = document.querySelector('#confirmarNovaSenha');
    const status = document.querySelector('#senhaStatus');
    const button = document.querySelector('#salvarNovaSenha');
    let userId = null, busy = false, saved = false, finished = false, generation = 0;
    const show = (message, ok = false) => {
      status.textContent = message; status.style.color = ok ? '#16845b' : '#a00045';
    };
    const lock = message => {
      generation++; userId = null; form.reset(); form.hidden = true;
      fields.disabled = true; show(message);
    };
    async function account() {
      const {data, error} = await window.sb.auth.getUser();
      if (error || !data?.user) throw new Error('session_expired');
      return data.user;
    }
    async function pending() {
      const {data, error} = await window.sb.rpc('academia_senha_pendente');
      if (error || typeof data !== 'boolean') throw new Error('status_unavailable');
      return data;
    }
    async function exit() {
      if (busy) return;
      lock('Encerrando a sessão...');
      try { await window.sb?.auth.signOut({scope: 'local'}); } catch (_) { /* Retorna ao login. */ }
      location.replace('login.html');
    }
    document.querySelector('#primeiroAcessoSair').addEventListener('click', exit);
    document.querySelector('#mostrarNovaSenha').addEventListener('click', event => {
      const visible = password.type === 'password';
      password.type = confirmation.type = visible ? 'text' : 'password';
      event.currentTarget.setAttribute('aria-pressed', String(visible));
      event.currentTarget.textContent = visible ? 'Ocultar senhas' : 'Mostrar senhas';
    });
    window.addEventListener('pagehide', () => { generation++; userId = null; form.reset(); });
    window.sb?.auth.onAuthStateChange((event, session) => {
      if (finished) return;
      if (event === 'SIGNED_OUT' || (userId && session?.user?.id && session.user.id !== userId))
        lock('A sessão foi encerrada ou alterada. Entre novamente para continuar.');
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !userId || finished) return;
      if (!saved) {
        const invalid = window.AcademiaPassword.validate(password.value, confirmation.value);
        if (invalid) { show(invalid); return; }
      }
      const expected = userId, request = generation;
      busy = true; fields.disabled = true; show(saved ? 'Verificando a alteração...' : 'Salvando sua senha...');
      try {
        const user = await account();
        if (request !== generation) return;
        if (user.id !== expected) { lock('A conta mudou. Entre novamente para continuar.'); return; }
        if (!saved) {
          const result = await window.sb.auth.updateUser({password: password.value});
          if (request !== generation) return;
          if (result.error) throw result.error;
          if (result.data?.user?.id !== expected) throw new Error('session_expired');
          saved = true; form.reset();
          password.disabled = confirmation.disabled = true;
          button.textContent = 'Verificar e continuar';
        }
        const stillPending = await pending();
        if (request !== generation) return;
        if (stillPending) {
          lock('Há uma nova senha temporária pendente. Entre novamente e faça a troca.'); return;
        }
        const current = await account();
        if (request !== generation) return;
        if (current.id !== expected) { lock('A conta mudou. Entre novamente.'); return; }
        finished = true; userId = null; form.hidden = true;
        show('Senha pessoal definida com sucesso.', true);
        document.querySelector('#senhaSucesso').hidden = false;
        try { await window.sb.auth.signOut({scope: 'local'}); } catch (_) { /* O login permanece disponível. */ }
      } catch (error) {
        if (request !== generation) return;
        if (error?.message === 'session_expired' || error?.status === 401 || error?.status === 403) {
          lock('Sua sessão expirou. Entre novamente para continuar.'); return;
        }
        show(saved
          ? 'Sua senha foi salva, mas não conseguimos confirmar a liberação. Clique em Verificar e continuar.'
          : window.AcademiaPassword.errorMessage(error));
      } finally {
        busy = false;
        if (userId && request === generation) fields.disabled = false;
      }
    });
    if (!window.sb) { lock('O acesso está indisponível. Avise a administração da Academia.'); return; }
    const initial = generation;
    try {
      const user = await account();
      const required = await pending();
      if (initial !== generation) return;
      if (!required) { location.replace('index.html'); return; }
      userId = user.id;
      document.querySelector('#senhaEmail').value = user.email || '';
      form.hidden = false; fields.disabled = false;
      show('Escolha uma senha pessoal para concluir seu primeiro acesso.', true); password.focus();
    } catch (_) {
      lock('Não foi possível verificar sua sessão. Entre novamente; se continuar, avise a administração.');
    }
  });
})();
