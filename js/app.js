(async () => {
  const user = await Auth.require();
  if (!user) return;

  const base = Auth.base();
  const page = document.body.dataset.page || 'inicio';
  const nav = [
    ['inicio', '⌂', 'Início', base + 'index.html'],
    ['jornada', '◈', 'Minha Jornada', base + 'pages/trilha.html'],
    ['missoes', '♡', 'Missões', base + 'pages/missoes.html'],
    ['progresso', '▥', 'Meu Progresso', base + 'pages/progresso.html'],
    ['medalhas', '♕', 'Medalhas', base + 'pages/medalhas.html'],
    ['certificacao', '◇', 'Certificação', base + 'pages/certificacao.html'],
    ['ajuda', '?', 'Ajuda', base + 'pages/ajuda.html']
  ];

  const displayName = user.name || 'Professor(a)';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'P';

  document.body.insertAdjacentHTML('afterbegin', `
    <header class="topbar">
      <a class="brand" href="${base}index.html">
        <div class="brand-mark">✓</div>
        <div><strong>ACADEMIA DOS<br>VALIDADORES</strong><span>by Sintechtica</span></div>
      </a>
      <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu">☰</button>
      <nav class="main-nav" id="mainNav">
        ${nav.map(([id, icon, title, href]) => `<a class="${id === page ? 'active' : ''}" href="${href}"><span class="nav-icon">${icon}</span>${title}</a>`).join('')}
      </nav>
      <div class="user-area">
        <div class="avatar">${initials}</div>
        <div class="user-copy"><strong>${displayName}</strong><small>Aprendiz</small></div>
        <button class="logout-button" id="logoutButton" type="button" aria-label="Sair da Academia">↪ Sair</button>
      </div>
    </header>
  `);

  document.body.insertAdjacentHTML('beforeend', `
    <footer class="footer">
      <div><b>sintechtica</b><br><small>Educação Digital com Excelência</small></div>
      <div class="footer-center">Academia dos Validadores by Sintechtica © 2026</div>
      <b>Aprender. Validar. Transformar.</b>
    </footer>
    <div class="gui-float"><button class="gui-button" type="button" onclick="alert('Olá! O suporte do Gui estará disponível em breve.')">Falar com o Gui</button></div>
  `);

  document.getElementById('logoutButton')?.addEventListener('click', () => Auth.logout());
  document.getElementById('menuToggle')?.addEventListener('click', () => document.getElementById('mainNav')?.classList.toggle('open'));
})();
