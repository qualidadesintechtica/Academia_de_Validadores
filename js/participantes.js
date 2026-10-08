(() => {
  'use strict';
  document.addEventListener('DOMContentLoaded', async () => {
    const section = document.querySelector('#participantesArea');
    if (!section) return;
    const status = document.querySelector('#participantesStatus');
    const list = document.querySelector('#participantesLista');
    const search = document.querySelector('#participantesBusca');
    const previous = document.querySelector('#participantesAnterior');
    const next = document.querySelector('#participantesProxima');
    const pageLabel = document.querySelector('#participantesPagina');
    const dialog = document.querySelector('#participanteDialog');
    const form = document.querySelector('#participanteForm');
    const fields = form.querySelector('fieldset');
    const name = document.querySelector('#participanteNome');
    const editStatus = document.querySelector('#participanteStatus');
    let selected = null, offset = 0, sequence = 0, timer, permitted = false;
    const show = (message, state = '') => { status.textContent = message; status.dataset.state = state; };
    const showEdit = (message, state = '') => { editStatus.textContent = message; editStatus.dataset.state = state; };

    function openEdit(person) {
      selected = {...person};
      document.querySelector('#participanteEmail').textContent = person.email || '';
      name.value = person.nome || '';
      showEdit('');
      fields.disabled = false;
      dialog.showModal();
      name.focus();
    }

    async function load(successMessage = '') {
      if (!permitted) return;
      const request = ++sequence;
      previous.disabled = next.disabled = true;
      list.replaceChildren();
      show('Carregando participantes...');
      try {
        const {data, error} = await window.sb.rpc('academia_listar_participantes', {
          p_busca: search.value.trim(), p_offset: offset, p_limite: 101
        });
        if (request !== sequence) return;
        if (error) throw error;
        const people = Array.isArray(data) ? data : [];
        for (const person of people.slice(0, 100)) {
          const row = document.createElement('article'); row.className = 'participant-row';
          const copy = document.createElement('div'); copy.className = 'participant-copy';
          const title = document.createElement('strong'); title.textContent = person.nome || 'Nome não informado';
          const email = document.createElement('small'); email.textContent = person.email || '';
          const button = document.createElement('button'); button.type = 'button';
          button.className = 'btn btn-secondary'; button.textContent = 'Editar nome';
          button.setAttribute('aria-label', `Editar nome de ${person.nome || person.email}`);
          button.addEventListener('click', () => openEdit(person));
          copy.append(title, email); row.append(copy, button); list.append(row);
        }
        if (!people.length) {
          const empty = document.createElement('p'); empty.className = 'participant-empty';
          empty.textContent = 'Nenhum participante encontrado.'; list.append(empty);
        }
        previous.disabled = offset === 0;
        next.disabled = people.length <= 100;
        pageLabel.textContent = `Página ${offset / 100 + 1}`;
        show(successMessage || `${Math.min(people.length, 100)} participantes nesta página.`, successMessage ? 'success' : '');
      } catch (_) {
        if (request === sequence) show('Não foi possível carregar os participantes. Confira a instalação do SQL e use Atualizar para tentar novamente.', 'error');
      }
    }

    form.querySelector('[data-participant-cancel]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', event => { if (fields.disabled) event.preventDefault(); });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (fields.disabled || !selected) return;
      const nome = name.value.trim().replace(/\s+/g, ' ');
      if (!nome || [...nome].length > 150 || /[\u0000-\u001f\u007f]/.test(name.value)) {
        showEdit('Informe o nome completo com até 150 caracteres.', 'error'); name.focus(); return;
      }
      fields.disabled = true;
      showEdit('Salvando nome...');
      try {
        const {data, error} = await window.sb.rpc('academia_editar_nome_participante', {
          p_user_id: selected.user_id, p_nome: nome, p_nome_anterior: selected.nome || ''
        });
        if (error) throw error;
        if (!Array.isArray(data) || !data[0]) throw new Error('missing_user');
        dialog.close();
        await window.Auth.fillUser();
        await load('Nome do participante atualizado.');
      } catch (error) {
        showEdit(error?.code === '40001'
          ? 'Este nome foi alterado por outra pessoa. Cancele e atualize a lista antes de editar novamente.'
          : 'Não foi possível salvar. Confira sua conexão e sua permissão administrativa e tente novamente.', 'error');
      } finally { fields.disabled = false; }
    });
    search.addEventListener('input', () => {
      clearTimeout(timer); ++sequence; offset = 0;
      previous.disabled = next.disabled = true;
      timer = setTimeout(() => load(), 250);
    });
    previous.addEventListener('click', () => { offset = Math.max(0, offset - 100); load(); });
    next.addEventListener('click', () => { offset += 100; load(); });
    document.querySelector('#participantesAtualizar').addEventListener('click', () => load());
    try {
      const user = await window.Auth.currentUser();
      if (!user) { show('Entre na Academia para continuar.', 'error'); return; }
      const {data, error} = await window.sb.rpc('is_academia_perfil_admin');
      if (error) { show('A edição administrativa ainda precisa ser ativada no Supabase. Consulte as instruções da atualização.', 'error'); return; }
      if (data !== true) { show('Seu perfil não tem permissão para administrar participantes.', 'error'); return; }
      permitted = true; section.hidden = false; await load();
    } catch (_) { show('Não foi possível verificar seu acesso. Tente atualizar a página.', 'error'); }
  });
})();
