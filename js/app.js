
Auth.require();
const user=Auth.getUser();
const base=Auth.base();
const page=document.body.dataset.page||'inicio';
const nav=[['inicio','⌂','Início',base+'index.html'],['jornada','◈','Minha Jornada',base+'pages/trilha.html'],['missoes','♡','Missões',base+'pages/missoes.html'],['progresso','▥','Meu Progresso',base+'pages/progresso.html'],['medalhas','♕','Medalhas',base+'pages/medalhas.html'],['certificacao','◇','Certificação',base+'pages/certificacao.html'],['ajuda','?','Ajuda',base+'pages/ajuda.html']];
const header=document.createElement('header');header.className='topbar';header.innerHTML=`<a class="brand" href="${base}index.html"><div class="brand-mark">✓</div><div><strong>ACADEMIA DOS<br>VALIDADORES</strong><span>by Sintechtica</span></div></a><button class="menu-toggle" aria-label="Abrir menu">☰</button><nav class="main-nav">${nav.map(n=>`<a class="${page===n[0]?'active':''}" href="${n[3]}"><span class="nav-icon">${n[1]}</span>${n[2]}</a>`).join('')}</nav><div class="user-area"><div class="avatar">${(user.name||'P').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><div class="user-copy"><strong>${user.name||'Professor(a)'}</strong><small>Aprendiz</small></div><button class="logout-button" id="logoutBtn">Sair</button></div>`;
document.body.prepend(header);
document.querySelector('.menu-toggle').onclick=()=>document.querySelector('.main-nav').classList.toggle('open');
document.getElementById('logoutBtn').onclick=()=>Auth.logout();
const footer=document.createElement('footer');footer.className='footer';footer.innerHTML='<div><b>sintechtica</b><br><small>Educação Digital com Excelência</small></div><div class="footer-center">Academia dos Validadores by Sintechtica © 2026</div><b>Aprender. Validar. Transformar.</b>';document.body.append(footer);
document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent=user.name||'Professor(a)');
