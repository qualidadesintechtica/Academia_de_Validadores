
document.addEventListener('DOMContentLoaded',()=>{
  const msg=document.querySelector('[data-form-message]');
  const warning=document.querySelector('[data-supabase-warning]');
  const show=(text,ok=false)=>{
    if(msg){
      msg.textContent=text;
      msg.style.color=ok?'#16845b':'#a00045';
    }
  };

  const cfg=window.ACADEMIA_CONFIG||{};
  const configured=Boolean(
    window.sb &&
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes('COLE_AQUI') &&
    !cfg.SUPABASE_ANON_KEY.includes('COLE_AQUI')
  );

  if(!configured && warning){
    warning.classList.remove('hidden');
  }

  document.querySelector('#loginForm')?.addEventListener('submit',async e=>{
    e.preventDefault();

    if(!configured){
      return show('Antes de entrar, configure a Project URL e a chave pública do Supabase em js/config.js.');
    }

    const email=document.querySelector('#email').value.trim();
    const password=document.querySelector('#password').value;

    if(!email || !password){
      return show('Preencha seu e-mail e sua senha.');
    }

    show('Entrando...');

    try{
      const {data,error}=await sb.auth.signInWithPassword({email,password});

      if(error){
        if(error.message?.toLowerCase().includes('invalid login credentials')){
          return show('E-mail ou senha não conferem com o cadastro do Supabase.');
        }
        if(error.message?.toLowerCase().includes('email not confirmed')){
          return show('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.');
        }
        return show(error.message || 'Não foi possível entrar.');
      }

      if(!data?.session){
        return show('O Supabase não retornou uma sessão válida.');
      }

      location.replace('index.html');
    }catch(err){
      console.error(err);
      show('Falha de conexão com o Supabase. Verifique js/config.js e tente novamente.');
    }
  });

  document.querySelector('#cadastroForm')?.addEventListener('submit',async e=>{
    e.preventDefault();

    if(!configured){
      return show('Antes de criar a conta, configure o Supabase em js/config.js.');
    }

    const nome=document.querySelector('#nome').value.trim();
    const email=document.querySelector('#email').value.trim();
    const password=document.querySelector('#password').value;
    const dom=ACADEMIA_CONFIG.DOMINIO_INSTITUCIONAL;

    if(dom && !email.toLowerCase().endsWith('@'+dom.toLowerCase())){
      return show('Use seu e-mail institucional.');
    }

    const {error}=await sb.auth.signUp({
      email,
      password,
      options:{
        data:{nome},
        emailRedirectTo:ACADEMIA_CONFIG.SITE_URL+'login.html'
      }
    });

    if(error) return show(error.message);

    show('Cadastro criado. Confira seu e-mail para confirmar o acesso.',true);
  });

  document.querySelector('#recoveryForm')?.addEventListener('submit',async e=>{
    e.preventDefault();

    if(!configured){
      return show('Configure o Supabase em js/config.js antes de recuperar a senha.');
    }

    const email=document.querySelector('#email').value.trim();
    const {error}=await sb.auth.resetPasswordForEmail(
      email,
      {redirectTo:ACADEMIA_CONFIG.SITE_URL+'login.html'}
    );

    if(error) return show(error.message);

    show('Enviamos um link de recuperação para seu e-mail.',true);
  });

  if(new URLSearchParams(location.search).get('logout')){
    show('Você saiu da Academia com segurança.',true);
  }
});
