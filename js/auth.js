(async function protegerPagina() {
  const loginPath = /\/(pages|trilhas)\//.test(window.location.pathname) ? '../login.html' : 'login.html';

  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    window.location.replace(loginPath);
    return;
  }

  const user = session.user;
  const dominio = String(user.email || '').toLowerCase().split('@').pop();
  const dominiosAutorizados = ['animaeducacao.com.br', 'ulife.com.br'];

  if (!dominiosAutorizados.includes(dominio)) {
    await supabaseClient.auth.signOut();
    window.location.replace(loginPath);
    return;
  }

  const nome = user.user_metadata?.nome || user.user_metadata?.nome_completo || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Validador';
  localStorage.setItem('academia_nome_usuario', nome);
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(parte => parte[0].toUpperCase())
    .join('');

  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = nome);
  document.querySelectorAll('.avatar, .profile-big-avatar').forEach(el => el.textContent = iniciais || 'VA');

  const userMenu = document.querySelector('.user-menu');
  if (userMenu && !document.getElementById('logoutButton')) {
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logoutButton';
    logoutButton.className = 'logout-button';
    logoutButton.type = 'button';
    logoutButton.textContent = 'Sair';
    logoutButton.addEventListener('click', async () => {
      logoutButton.disabled = true;
      await supabaseClient.auth.signOut();
      window.location.replace(loginPath);
    });
    userMenu.appendChild(logoutButton);
  }
})();
