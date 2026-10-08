(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector('#perfilForm');
    if (!form) return;
    const fields = form.querySelector('fieldset');
    const name = form.querySelector('#perfilNome');
    const email = form.querySelector('#perfilEmail');
    const status = document.querySelector('#perfilStatus');
    const show = (message, state = '') => {
      status.textContent = message;
      status.dataset.state = state;
    };
    let savedName = '';
    const getName = user => user.user_metadata?.nome || user.user_metadata?.display_name ||
      user.user_metadata?.nome_completo || user.user_metadata?.full_name || user.user_metadata?.name || '';
    try {
      const user = await window.Auth.currentUser();
      if (!user) { show('Entre na Academia para editar seu perfil.', 'error'); return; }
      savedName = getName(user);
      name.value = savedName;
      email.value = user.email || '';
      fields.disabled = false;
      show('');
    } catch (_) { show('Não foi possível carregar seu perfil. Atualize a página para tentar novamente.', 'error'); }

    form.querySelector('[data-profile-reset]').addEventListener('click', () => {
      name.value = savedName;
      show('Alterações descartadas.');
      name.focus();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (fields.disabled) return;
      const nome = name.value.trim().replace(/\s+/g, ' ');
      if (!nome || [...nome].length > 150 || /[\u0000-\u001f\u007f]/.test(name.value)) {
        show('Informe seu nome completo com até 150 caracteres.', 'error'); name.focus(); return;
      }
      fields.disabled = true;
      show('Salvando seu nome...');
      try {
        const {data, error} = await window.sb.auth.updateUser({data: {nome, full_name: nome, display_name: nome}});
        if (error) throw error;
        if (!data?.user) throw new Error('missing_user');
        savedName = getName(data.user);
        name.value = savedName;
        await window.Auth.fillUser(data.user);
        show('Seu nome foi atualizado.', 'success');
      } catch (_) {
        show('Não foi possível salvar seu nome. Confira sua conexão e tente novamente.', 'error');
      } finally { fields.disabled = false; }
    });
  });
})();
