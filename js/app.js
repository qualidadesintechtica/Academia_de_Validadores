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

// Balão flutuante da Aurora.
if (!document.querySelector('.aurora-float')) {
  const wrapper = document.createElement('div');
  wrapper.className = 'aurora-float';
  wrapper.innerHTML = `
    <div class="aurora-float-message" id="auroraFloatMessage" hidden>
      <button type="button" class="aurora-close" aria-label="Fechar">×</button>
      <strong>Olá! Eu sou a Aurora.</strong>
      <p>Estou aqui para acompanhar sua jornada. Os recursos de atendimento interativo estarão disponíveis em breve.</p>
    </div>
    <button type="button" class="aurora-float-button" aria-label="Abrir mensagem da Aurora">
      <span>A</span><b>Aurora</b>
    </button>`;
  document.body.appendChild(wrapper);
  const message = wrapper.querySelector('.aurora-float-message');
  wrapper.querySelector('.aurora-float-button')?.addEventListener('click', () => {
    message.hidden = !message.hidden;
  });
  wrapper.querySelector('.aurora-close')?.addEventListener('click', () => {
    message.hidden = true;
  });
}
