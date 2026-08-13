(()=>{
const publicPage=/(login|cadastro|recuperar-senha)\.html$/.test(location.pathname);
const prefix=(location.pathname.includes('/pages/')||location.pathname.includes('/trilhas/')||location.pathname.includes('/conteudos/'))?'../':'';

async function currentUser(){
  if(!window.sb)return null;
  const{data:{session}}=await sb.auth.getSession();
  return session?.user||null;
}

async function protect(){
  if(publicPage)return;
  const u=await currentUser();
  if(!u)location.replace(prefix+'login.html');
}

async function logout(){
  if(window.sb)await sb.auth.signOut();
  location.replace(prefix+'login.html?logout=1');
}

async function fillUser(){
  const u=await currentUser();
  if(!u)return;
  const{data:p}=await sb.from('profiles').select('nome,nivel').eq('id',u.id).maybeSingle();
  const nome=p?.nome||u.user_metadata?.nome||u.user_metadata?.full_name||u.email?.split('@')[0]||'Professor(a)';
  const nivel=p?.nivel||'Aprendiz';
  document.querySelectorAll('[data-user-name]').forEach(e=>e.textContent=nome);
  document.querySelectorAll('[data-user-level]').forEach(e=>e.textContent=nivel);
  const ps=nome.trim().split(/\s+/),ini=((ps[0]?.[0]||'P')+(ps[1]?.[0]||'')).toUpperCase();
  document.querySelectorAll('[data-user-initials]').forEach(e=>e.textContent=ini);
}

async function isAdmin(){
  const u=await currentUser();
  if(!u||!window.sb)return false;
  try{
    const{data,error}=await sb.from('relatorio_admins')
      .select('user_id,ativo')
      .eq('user_id',u.id)
      .eq('ativo',true)
      .maybeSingle();
    if(error){
      // A Academia continua funcionando mesmo antes da migração do relatório ser executada.
      console.info('Relatório administrativo ainda não configurado no Supabase.');
      return false;
    }
    return Boolean(data?.ativo);
  }catch(e){
    console.info('Não foi possível verificar permissão administrativa.');
    return false;
  }
}

async function fillAdminNav(){
  if(!(await isAdmin()))return;
  const nav=document.querySelector('.side-nav');
  if(!nav||nav.querySelector('[data-admin-report-link]'))return;
  const link=document.createElement('a');
  link.href=prefix+'pages/relatorio-acessos.html';
  link.dataset.adminReportLink='';
  link.innerHTML='<b>▤</b><span>Relatório de Acessos</span>';
  const ajuda=[...nav.querySelectorAll('a')].find(a=>(a.getAttribute('href')||'').includes('ajuda.html'));
  if(ajuda)nav.insertBefore(link,ajuda);else nav.appendChild(link);
}

async function requireAdmin(){
  const ok=await isAdmin();
  if(!ok){
    location.replace(prefix+'index.html?admin=negado');
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded',async()=>{
  if(!publicPage){
    await protect();
    await fillUser();
    await fillAdminNav();
  }
  document.querySelectorAll('[data-logout]').forEach(b=>b.addEventListener('click',logout));
});

window.Auth={currentUser,protect,logout,fillUser,isAdmin,fillAdminNav,requireAdmin};
})();
