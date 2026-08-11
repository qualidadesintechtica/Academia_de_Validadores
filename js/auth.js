
(()=>{
const publicPage=/(login|cadastro|recuperar-senha)\.html$/.test(location.pathname);
const prefix=(location.pathname.includes('/pages/')||location.pathname.includes('/trilhas/')||location.pathname.includes('/conteudos/'))?'../':'';
async function currentUser(){if(!window.sb)return null;const{data:{session}}=await sb.auth.getSession();return session?.user||null}
async function protect(){if(publicPage)return;const u=await currentUser();if(!u)location.replace(prefix+'login.html')}
async function logout(){if(window.sb)await sb.auth.signOut();location.replace(prefix+'login.html?logout=1')}
async function fillUser(){const u=await currentUser();if(!u)return;const{data:p}=await sb.from('profiles').select('nome,nivel').eq('id',u.id).maybeSingle();const nome=p?.nome||u.user_metadata?.nome||u.email?.split('@')[0]||'Professor(a)';const nivel=p?.nivel||'Aprendiz';document.querySelectorAll('[data-user-name]').forEach(e=>e.textContent=nome);document.querySelectorAll('[data-user-level]').forEach(e=>e.textContent=nivel);const ps=nome.trim().split(/\s+/),ini=((ps[0]?.[0]||'P')+(ps[1]?.[0]||'')).toUpperCase();document.querySelectorAll('[data-user-initials]').forEach(e=>e.textContent=ini)}
document.addEventListener('DOMContentLoaded',async()=>{if(!publicPage){await protect();await fillUser()}document.querySelectorAll('[data-logout]').forEach(b=>b.addEventListener('click',logout))});window.Auth={currentUser,protect,logout,fillUser};
})();
