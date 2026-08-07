
document.addEventListener('DOMContentLoaded',()=>{
 const msg=document.querySelector('[data-form-message]');const show=(t,ok=false)=>{if(msg){msg.textContent=t;msg.style.color=ok?'#16845b':'#a00045'}};
 document.querySelector('#loginForm')?.addEventListener('submit',async e=>{
   e.preventDefault();if(!window.sb)return show('Configure o Supabase em js/config.js.');
   show('Entrando...');const email=document.querySelector('#email').value.trim(),password=document.querySelector('#password').value;
   const{error}=await sb.auth.signInWithPassword({email,password});if(error)return show(error.message);location.replace('index.html');
 });
 document.querySelector('#cadastroForm')?.addEventListener('submit',async e=>{
   e.preventDefault();if(!window.sb)return show('Configure o Supabase em js/config.js.');
   const nome=document.querySelector('#nome').value.trim(),email=document.querySelector('#email').value.trim(),password=document.querySelector('#password').value;
   const dom=ACADEMIA_CONFIG.DOMINIO_INSTITUCIONAL;
   if(dom && !email.toLowerCase().endsWith('@'+dom.toLowerCase()))return show('Use seu e-mail institucional.');
   const{error}=await sb.auth.signUp({email,password,options:{data:{nome},emailRedirectTo:ACADEMIA_CONFIG.SITE_URL+'login.html'}});
   if(error)return show(error.message);show('Cadastro criado. Confira seu e-mail para confirmar o acesso.',true);
 });
 document.querySelector('#recoveryForm')?.addEventListener('submit',async e=>{
   e.preventDefault();if(!window.sb)return show('Configure o Supabase em js/config.js.');
   const email=document.querySelector('#email').value.trim();
   const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:ACADEMIA_CONFIG.SITE_URL+'login.html'});if(error)return show(error.message);show('Enviamos um link de recuperação para seu e-mail.',true);
 });
 if(new URLSearchParams(location.search).get('logout'))show('Você saiu da Academia com segurança.',true);
});
