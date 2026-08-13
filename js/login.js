document.addEventListener('DOMContentLoaded',()=>{
const msg=document.querySelector('[data-form-message]'),warning=document.querySelector('[data-supabase-warning]');
const show=(t,ok=false)=>{if(msg){msg.textContent=t;msg.style.color=ok?'#16845b':'#a00045'}};
const c=window.ACADEMIA_CONFIG||{};
const configured=Boolean(window.sb&&c.SUPABASE_URL&&c.SUPABASE_ANON_KEY&&!c.SUPABASE_URL.includes('COLE_AQUI')&&!c.SUPABASE_ANON_KEY.includes('COLE_AQUI'));
if(!configured&&warning)warning.classList.remove('hidden');

async function registrarAcesso(user){
  if(!user||!window.sb)return;
  const nome=(user.user_metadata?.nome||user.user_metadata?.nome_completo||user.user_metadata?.full_name||user.email?.split('@')[0]||'Professor(a)').trim();
  try{
    const{error}=await sb.from('acessos_academia').insert({
      user_id:user.id,
      email:user.email||null,
      nome,
      origem:'login'
    });
    if(error)console.info('Registro de acesso ainda não configurado no Supabase.');
  }catch(e){
    console.info('Não foi possível registrar este acesso.');
  }
}

document.querySelector('#loginForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!configured)return show('Antes de entrar, configure o Supabase em js/config.js.');
  const email=document.querySelector('#email').value.trim(),password=document.querySelector('#password').value;
  if(!email||!password)return show('Preencha e-mail e senha.');
  show('Entrando...');
  try{
    const{data,error}=await sb.auth.signInWithPassword({email,password});
    if(error){
      if(error.message?.toLowerCase().includes('invalid login credentials'))return show('E-mail ou senha não conferem com o cadastro do Supabase.');
      if(error.message?.toLowerCase().includes('email not confirmed'))return show('Seu e-mail ainda não foi confirmado.');
      return show(error.message||'Não foi possível entrar.');
    }
    if(!data?.session)return show('O Supabase não retornou uma sessão válida.');
    await registrarAcesso(data.user||data.session.user);
    location.replace('index.html');
  }catch(err){
    console.error(err);
    show('Falha de conexão com o Supabase.');
  }
});

document.querySelector('#cadastroForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!configured)return show('Configure o Supabase em js/config.js.');
  const nome=document.querySelector('#nome').value.trim(),email=document.querySelector('#email').value.trim(),password=document.querySelector('#password').value,confirm=document.querySelector('#confirmPassword').value;
  const dom=ACADEMIA_CONFIG.DOMINIO_INSTITUCIONAL;
  if(dom&&!email.toLowerCase().endsWith('@'+dom.toLowerCase()))return show('Use seu e-mail institucional.');
  if(password!==confirm)return show('As senhas não conferem.');
  const{error}=await sb.auth.signUp({email,password,options:{data:{nome},emailRedirectTo:ACADEMIA_CONFIG.SITE_URL+'login.html'}});
  if(error)return show(error.message);
  show('Cadastro criado. Confira seu e-mail para confirmar o acesso.',true);
});

document.querySelector('#recoveryForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!configured)return show('Configure o Supabase em js/config.js.');
  const email=document.querySelector('#email').value.trim();
  const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:ACADEMIA_CONFIG.SITE_URL+'login.html'});
  if(error)return show(error.message);
  show('Enviamos um link de recuperação para seu e-mail.',true);
});

if(new URLSearchParams(location.search).get('logout'))show('Você saiu da Academia com segurança.',true);
});
