const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageBox = document.getElementById('authMessage');
const loginPanel = document.getElementById('loginPanel');
const registerPanel = document.getElementById('registerPanel');

const DOMINIOS_AUTORIZADOS = ['animaeducacao.com.br', 'ulife.com.br'];

function emailAutorizado(email) {
  const dominio = String(email || '').trim().toLowerCase().split('@').pop();
  return DOMINIOS_AUTORIZADOS.includes(dominio);
}

function showMessage(message, type = 'error') {
  messageBox.textContent = message;
  messageBox.className = `auth-message ${type}`;
  messageBox.hidden = false;
}

function clearMessage() {
  messageBox.hidden = true;
  messageBox.textContent = '';
}

function setLoading(button, loading, normalText) {
  button.disabled = loading;
  button.textContent = loading ? 'Aguarde...' : normalText;
}

document.querySelectorAll('[data-show-panel]').forEach(button => {
  button.addEventListener('click', () => {
    clearMessage();
    const target = button.dataset.showPanel;
    loginPanel.hidden = target !== 'login';
    registerPanel.hidden = target !== 'register';
  });
});

(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) window.location.replace('index.html');
})();

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  clearMessage();
  const button = loginForm.querySelector('button[type="submit"]');
  setLoading(button, true, 'Entrar');

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!emailAutorizado(email)) {
    setLoading(button, false, 'Entrar');
    showMessage('Acesso permitido somente para e-mails @animaeducacao.com.br ou @ulife.com.br.');
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  setLoading(button, false, 'Entrar');

  if (error) {
    showMessage('E-mail ou senha inválidos. Confira os dados e tente novamente.');
    return;
  }

  window.location.replace('index.html');
});

registerForm.addEventListener('submit', async event => {
  event.preventDefault();
  clearMessage();
  const button = registerForm.querySelector('button[type="submit"]');
  setLoading(button, true, 'Criar conta');

  const nome = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!emailAutorizado(email)) {
    setLoading(button, false, 'Criar conta');
    showMessage('Cadastre-se com um e-mail @animaeducacao.com.br ou @ulife.com.br.');
    return;
  }

  if (password.length < 6) {
    setLoading(button, false, 'Criar conta');
    showMessage('A senha precisa ter pelo menos 6 caracteres.');
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { nome } }
  });
  setLoading(button, false, 'Criar conta');

  if (error) {
    showMessage(error.message.includes('already registered')
      ? 'Este e-mail já possui cadastro.'
      : `Não foi possível criar a conta: ${error.message}`);
    return;
  }

  // Sempre retorna à tela de login após o cadastro.
  // Mesmo quando a confirmação de e-mail estiver desativada no Supabase,
  // encerramos a sessão criada automaticamente para manter o mesmo fluxo.
  if (data.session) {
    await supabaseClient.auth.signOut();
  }

  registerForm.reset();
  registerPanel.hidden = true;
  loginPanel.hidden = false;
  showMessage('Conta criada! Enviamos um e-mail de confirmação. Confirme seu cadastro pelo link recebido e depois faça o login.', 'success');
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').focus();
});
