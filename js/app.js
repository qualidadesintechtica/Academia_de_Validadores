
(() => {
  const cfg = window.ACADEMIA_CONFIG || {};
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];
  const current = location.pathname.split('/').pop() || 'index.html';

  const sessionKey = 'academia_v3_session';
  const usersKey = 'academia_v3_users';
  const progressKey = 'academia_v3_progress';

  function read(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function write(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function getSession(){ return read(sessionKey, null); }
  function getUsers(){ return read(usersKey, []); }
  function setUsers(users){ write(usersKey, users); }
  function getProgress(){ return read(progressKey, []); }
  function setProgress(p){ write(progressKey, p); }

  function pathToLogin(){
    return location.pathname.includes('/pages/') || location.pathname.includes('/trilhas/')
      ? '../login.html' : 'login.html';
  }

  function requireAuth(){
    if (current === 'login.html') return;
    if (!getSession()) location.replace(pathToLogin());
  }

  function populateUser(){
    const user = getSession();
    if (!user) return;
    $$('[data-user-name]').forEach(el => el.textContent = user.name || 'Professor(a)');
    $$('[data-user-email]').forEach(el => el.textContent = user.email || '');
    $$('[data-user-initials]').forEach(el => {
      const parts=(user.name||'Professor').trim().split(/\s+/);
      el.textContent=((parts[0]?.[0]||'P')+(parts[1]?.[0]||'')).toUpperCase();
    });
  }

  function setActiveNav(){
    $$('.main-nav a').forEach(a => {
      const href=a.getAttribute('href')||'';
      if (href.endsWith(current)) a.classList.add('active');
    });
  }

  function renderProgress(){
    const done = getProgress();
    const total = cfg.modulesTotal || 7;
    const pct = Math.round((done.length/total)*100);
    $$('[data-progress-percent]').forEach(el => el.textContent = `${pct}%`);
    $$('[data-progress-count]').forEach(el => el.textContent = `${done.length} de ${total}`);
    $$('[data-progress-bar]').forEach(el => el.style.width = `${pct}%`);
    $$('[data-completed-count]').forEach(el => el.textContent = done.length);
    $$('[data-total-count]').forEach(el => el.textContent = total);

    $$('.module-card[data-module-id]').forEach(card => {
      const id = Number(card.dataset.moduleId);
      const badge = card.querySelector('[data-module-status]');
      if (done.includes(id)) {
        card.classList.add('completed');
        if (badge){ badge.textContent='Concluído'; badge.className='badge badge-ok'; }
      } else if (badge) {
        badge.textContent='Pendente'; badge.className='badge badge-warn';
      }
    });

    const certBtn = $('[data-certificate-button]');
    const certMsg = $('[data-certificate-message]');
    if (certBtn) {
      const complete = done.length >= total;
      certBtn.disabled = !complete;
      certBtn.textContent = complete ? 'Baixar certificado' : `Complete os ${total} módulos`;
      if (certMsg) certMsg.textContent = complete
        ? 'Parabéns! Seu certificado está liberado.'
        : 'Conclua todos os módulos para liberar seu certificado.';
    }
  }

  function toggleModule(id){
    const p=getProgress();
    const next=p.includes(id)?p.filter(x=>x!==id):[...p,id].sort((a,b)=>a-b);
    setProgress(next);renderProgress();
  }

  function setupActions(){
    $('[data-menu-toggle]')?.addEventListener('click',()=>$('.main-nav')?.classList.toggle('open'));
    $$('[data-logout]').forEach(btn => btn.addEventListener('click', () => {
      localStorage.removeItem(sessionKey);
      const dest = location.pathname.includes('/pages/') || location.pathname.includes('/trilhas/')
        ? '../login.html?logout=1' : 'login.html?logout=1';
      location.replace(dest);
    }));
    $$('[data-toggle-module]').forEach(btn => btn.addEventListener('click', () => toggleModule(Number(btn.dataset.toggleModule))));
    $('[data-certificate-button]')?.addEventListener('click', () => {
      if (!getProgress().length || getProgress().length < (cfg.modulesTotal||7)) return;
      window.print();
    });
  }

  function login(email, password){
    const user = getUsers().find(u => u.email.toLowerCase()===email.toLowerCase() && u.password===password);
    if (!user) throw new Error('E-mail ou senha inválidos.');
    const session={name:user.name,email:user.email};
    write(sessionKey,session);
    return session;
  }
  function register(name,email,password){
    const users=getUsers();
    if (users.some(u=>u.email.toLowerCase()===email.toLowerCase())) throw new Error('Este e-mail já está cadastrado.');
    users.push({name,email,password});
    setUsers(users);
    write(sessionKey,{name,email});
  }

  function setupLogin(){
    const loginForm=$('#loginForm'), registerForm=$('#registerForm');
    const message=$('#loginMessage');
    const show=(msg,ok=false)=>{ if(message){message.textContent=msg;message.style.color=ok?'#16845b':'#a00045';} };
    $$('.tabs button').forEach(btn=>btn.addEventListener('click',()=>{
      $$('.tabs button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
      loginForm.classList.toggle('hidden',btn.dataset.tab!=='login');
      registerForm.classList.toggle('hidden',btn.dataset.tab!=='register');
      show('');
    }));
    loginForm?.addEventListener('submit',e=>{
      e.preventDefault();
      try{ login($('#loginEmail').value.trim(),$('#loginPassword').value); location.replace('index.html'); }
      catch(err){ show(err.message); }
    });
    registerForm?.addEventListener('submit',e=>{
      e.preventDefault();
      try{
        register($('#registerName').value.trim(),$('#registerEmail').value.trim(),$('#registerPassword').value);
        location.replace('index.html');
      } catch(err){ show(err.message); }
    });
    if(new URLSearchParams(location.search).get('logout')) show('Você saiu da Academia com segurança.',true);
    if(!getUsers().length){
      setUsers([{name:'Professor(a) Demo',email:'demo@academia.com',password:'123456'}]);
    }
  }

  window.Academia = {getSession,getProgress,toggleModule};

  if(current==='login.html') setupLogin();
  else {
    requireAuth(); populateUser(); setActiveNav(); renderProgress(); setupActions();
  }
})();
