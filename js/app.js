const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
menuToggle?.addEventListener('click', () => mainNav?.classList.toggle('open'));

const KEY = 'academia_validadores_state_v1';
const state = {
  nivel: 'Aprendiz',
  xp: 0,
  progresso: 0,
  modulosConcluidos: 0,
  medalhas: 0,
  ...JSON.parse(localStorage.getItem(KEY) || '{}')
};
localStorage.setItem(KEY, JSON.stringify(state));

// O nome é preenchido pelo auth.js com os dados reais do cadastro no Supabase.
document.querySelectorAll('[data-user-level]').forEach(el => el.textContent = state.nivel);
document.querySelectorAll('[data-xp]').forEach(el => el.textContent = state.xp);
document.querySelectorAll('[data-progress]').forEach(el => el.textContent = `${state.progresso}%`);
document.querySelectorAll('[data-progress-bar]').forEach(el => el.style.width = `${state.progresso}%`);
document.querySelectorAll('[data-modules-done]').forEach(el => el.textContent = state.modulosConcluidos);
document.querySelectorAll('[data-medals]').forEach(el => el.textContent = state.medalhas);

document.querySelectorAll('.faq button').forEach(button => button.addEventListener('click', () => {
  const answer = button.nextElementSibling;
  const icon = button.querySelector('span');
  const open = answer?.classList.toggle('open');
  if (icon) icon.textContent = open ? '−' : '+';
}));

// Assistente virtual flutuante do Gui.
if (!document.querySelector('.gui-float')) {
  const wrapper = document.createElement('div');
  wrapper.className = 'gui-float';
  wrapper.innerHTML = `
    <div class="gui-float-message" id="guiFloatMessage" hidden>
      <button type="button" class="gui-close" aria-label="Fechar">×</button>
      <div class="gui-message-head"><img src="${location.pathname.includes('/pages/')||location.pathname.includes('/trilhas/')?'../':''}assets/img/gui-avatar.png" alt="Gui"><strong>Gui, seu guia virtual</strong></div>
      <p>Estou aqui para acompanhar sua jornada. Em breve teremos orientações interativas em cada módulo.</p>
    </div>
    <button type="button" class="gui-float-button" aria-label="Abrir mensagem do Gui">
      <img src="${location.pathname.includes('/pages/')||location.pathname.includes('/trilhas/')?'../':''}assets/img/gui-avatar.png" alt=""><b>Falar com o Gui</b>
    </button>`;
  document.body.appendChild(wrapper);
  const message = wrapper.querySelector('.gui-float-message');
  wrapper.querySelector('.gui-float-button')?.addEventListener('click', () => { message.hidden = !message.hidden; });
  wrapper.querySelector('.gui-close')?.addEventListener('click', () => { message.hidden = true; });
}
