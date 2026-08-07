
document.addEventListener('DOMContentLoaded',()=>{
 const side=document.querySelector('.sidebar');
 document.querySelector('[data-mobile-menu]')?.addEventListener('click',()=>side?.classList.toggle('open'));
 const file=location.pathname.split('/').pop()||'index.html';
 document.querySelectorAll('.side-nav a').forEach(a=>{if((a.getAttribute('href')||'').endsWith(file))a.classList.add('active')});
 const gui=document.querySelector('.gui-message');document.querySelector('[data-gui-toggle]')?.addEventListener('click',()=>gui?.classList.toggle('hidden'));document.querySelector('[data-gui-close]')?.addEventListener('click',()=>gui?.classList.add('hidden'));
});
