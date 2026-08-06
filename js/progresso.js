
const Progress={
 total:7,
 completed(){try{return JSON.parse(localStorage.getItem('academia_modules')||'[]')}catch{return[]}},
 isDone(id){return this.completed().includes(Number(id))},
 toggle(id){id=Number(id);let a=this.completed();a=a.includes(id)?a.filter(x=>x!==id):[...a,id];localStorage.setItem('academia_modules',JSON.stringify(a));this.render();},
 percent(){return Math.round(this.completed().length/this.total*100)},
 render(){const c=this.completed().length,p=this.percent();document.querySelectorAll('[data-progress]').forEach(e=>e.textContent=`${p}% concluído`);document.querySelectorAll('[data-progress-bar]').forEach(e=>e.style.width=p+'%');document.querySelectorAll('[data-completed-count]').forEach(e=>e.textContent=c);document.querySelectorAll('[data-module]').forEach(e=>{const id=+e.dataset.module;e.classList.toggle('done',this.isDone(id));const b=e.querySelector('[data-toggle-module]');if(b)b.textContent=this.isDone(id)?'Concluído':'Marcar como concluído'});this.certificate(p,c)},
 certificate(p,c){const msg=document.querySelector('[data-certificate-message]'),btn=document.querySelector('[data-generate-certificate]');if(!msg||!btn)return;if(p===100){msg.textContent='Parabéns! Você concluiu todos os módulos. Seu certificado está disponível.';btn.disabled=false;btn.textContent='Baixar certificado';btn.onclick=()=>window.print();document.querySelector('.certificate-card')?.classList.add('certificate-ready')}else{msg.textContent=`Conclua todos os módulos para liberar seu certificado. Faltam ${this.total-c} módulo(s).`;btn.disabled=true;btn.textContent=`Complete os ${this.total} módulos`;btn.onclick=null;}}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-toggle-module]');if(b)Progress.toggle(b.closest('[data-module]').dataset.module)});Progress.render();
