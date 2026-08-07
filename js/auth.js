
(()=>{const pub=/(login|cadastro|recuperar-senha)\.html$/.test(location.pathname);const pre=(location.pathname.includes('/pages/')||location.pathname.includes('/trilhas/'))?'../':'';
async function user(){if(!window.sb)return null;const{data:{session}}=await sb.auth.getSession();return session?.user||null}
async function protect(){if(pub)return;const u=await user();if(!u)location.replace(pre+'login.html')}
async function logout(){if(window.sb)await sb.auth.signOut();location.replace(pre+'login.html?logout=1')}
async function fill(){const u=await user();if(!u)return;const{data:p}=await sb.from('profiles').select('nome').eq('id',u.id).maybeSingle();const nome=p?.nome||u.user_metadata?.nome||u.email?.split('@')[0]||'Professor(a)';document.querySelectorAll('[data-user-name]').forEach(e=>e.textContent=nome);const ps=nome.trim().split(/\s+/);const ini=((ps[0]?.[0]||'P')+(ps[1]?.[0]||'')).toUpperCase();document.querySelectorAll('[data-user-initials]').forEach(e=>e.textContent=ini)}
document.addEventListener('DOMContentLoaded',async()=>{if(!pub){await protect();await fill()}document.querySelectorAll('[data-logout]').forEach(b=>b.addEventListener('click',logout))});window.Auth={user,protect,logout,fill}})();
