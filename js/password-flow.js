(() => {
  'use strict';
  function resetURL() {
    if (!window.ACADEMIA_CONFIG?.SITE_URL) throw new Error('invalid_site_url');
    const site = new URL(window.ACADEMIA_CONFIG.SITE_URL);
    if (!['https:', 'http:'].includes(site.protocol)) throw new Error('invalid_site_url');
    if (!site.pathname.endsWith('/')) site.pathname += '/';
    site.search = ''; site.hash = '';
    return new URL('redefinir-senha.html', site).href;
  }
  function validate(password, confirmation) {
    if (password.length < 8 || password.length > 128 || !password.trim()) return 'Use uma senha de 8 a 128 caracteres.';
    if (password !== confirmation) return 'As senhas não conferem. Digite a mesma senha nos dois campos.';
    return '';
  }
  function errorMessage(error) {
    if (error?.status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error?.code)) return 'O limite de solicitações foi atingido. Aguarde alguns minutos antes de tentar novamente.';
    if (error?.code === 'same_password') return 'Escolha uma senha diferente da senha atual.';
    if (error?.code === 'weak_password') return 'A senha não atende às regras de segurança desta Academia. Escolha uma senha mais forte.';
    if (['otp_expired', 'session_not_found', 'refresh_token_not_found', 'refresh_token_already_used', 'reauthentication_needed', 'reauthentication_not_valid'].includes(error?.code) || error?.status === 401 || error?.status === 403) return 'O link expirou ou a sessão de recuperação terminou. Solicite um novo link.';
    return 'Não foi possível confirmar a solicitação. Confira sua conexão e tente novamente.';
  }
  window.AcademiaPassword = {resetURL, validate, errorMessage};

  // Links antigos que retornam ao login seguem para o formulário de senha.
  // O cliente compartilhado não deve consumir a sessão do link nessa página.
  const hash = new URLSearchParams(window.location.hash.slice(1));
  if (/\/login\.html$/.test(window.location.pathname) && hash.get('type') === 'recovery') {
    const destino = new URL('redefinir-senha.html', window.location.href);
    destino.search = window.location.search; destino.hash = window.location.hash;
    window.__academiaRecoveryRedirect = true;
    window.location.replace(destino.href);
  }
})();
