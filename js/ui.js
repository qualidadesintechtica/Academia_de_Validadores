document.addEventListener('DOMContentLoaded', () => {
  const side = document.querySelector('.sidebar');

  document.querySelector('[data-mobile-menu]')?.addEventListener('click', () => {
    side?.classList.toggle('open');
  });

  const file = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.side-nav a').forEach((a) => {
    if ((a.getAttribute('href') || '').endsWith(file)) {
      a.classList.add('active');
    }
  });

  const gui = document.querySelector('.gui-message');
  const guiButton = document.querySelector('[data-gui-toggle]');
  const guiClose = document.querySelector('[data-gui-close]');

  /*
   * SUPORTE DO GUI
   * Ao clicar em "Falar com o Gui", abre o aplicativo de e-mail
   * com destinatário, assunto e mensagem inicial preenchidos.
   */
  guiButton?.addEventListener('click', () => {
    const destinatario = 'qualidadesintechtica@animaeducacao.com.br';
    const assunto = 'Academia dos Validadores | Suporte do Gui';

    const nome =
      document.querySelector('[data-user-name]')?.textContent?.trim() ||
      'Professor(a)';

    const tituloPagina =
      document.querySelector('.hero h1')?.textContent?.trim() ||
      document.title ||
      'Academia dos Validadores';

    const mensagem = [
      'Olá, equipe de Qualidade!',
      '',
      'Preciso de ajuda na Academia dos Validadores.',
      '',
      `Nome: ${nome}`,
      `Página/Módulo: ${tituloPagina}`,
      '',
      'Minha dúvida:',
      '',
      '',
      'Obrigado(a)!'
    ].join('\\r\\n');

    const mailto =
      `mailto:${destinatario}` +
      `?subject=${encodeURIComponent(assunto)}` +
      `&body=${encodeURIComponent(mensagem)}`;

    window.location.href = mailto;
  });

  guiClose?.addEventListener('click', () => {
    gui?.classList.add('hidden');
  });
});
