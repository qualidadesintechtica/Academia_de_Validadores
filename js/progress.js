(()=>{
async function getRows(){
  const u=await Auth.currentUser();
  if(!u)return[];
  const{data,error}=await sb.from('progresso_modulos').select('modulo_id,concluido,concluido_em').eq('user_id',u.id).eq('concluido',true).order('modulo_id');
  if(error){console.error(error);return[]}
  return data||[];
}
async function getDone(){return(await getRows()).map(x=>Number(x.modulo_id))}
async function complete(id){
  const u=await Auth.currentUser();if(!u)return;
  const{error}=await sb.from('progresso_modulos').upsert({user_id:u.id,modulo_id:Number(id),concluido:true,concluido_em:new Date().toISOString()},{onConflict:'user_id,modulo_id'});
  if(error)throw error;
  await render();
}
async function issueCertificate(){
  const u=await Auth.currentUser();if(!u)throw new Error('Usuário não autenticado.');
  const rows=await getRows(),total=ACADEMIA_CONFIG.TOTAL_MODULOS||7;
  if(rows.length<total)throw new Error(`Conclua os ${total} módulos antes de emitir o certificado.`);
  let{data:cert,error}=await sb.from('certificados').select('id,codigo,emitido_em').eq('user_id',u.id).maybeSingle();
  if(error)throw error;
  if(!cert){
    const res=await sb.from('certificados').insert({user_id:u.id}).select('id,codigo,emitido_em').single();
    if(res.error)throw res.error;cert=res.data;
  }
  const conclusao=rows.map(x=>x.concluido_em).filter(Boolean).sort().at(-1)||cert.emitido_em;
  return{...cert,concluido_em:conclusao};
}
async function render(){
  const rows=await getRows(),done=rows.map(x=>Number(x.modulo_id)),total=ACADEMIA_CONFIG.TOTAL_MODULOS||7,pct=Math.round(done.length/total*100);
  document.querySelectorAll('[data-progress-percent]').forEach(e=>e.textContent=pct+'%');
  document.querySelectorAll('[data-progress-count]').forEach(e=>e.textContent=`${done.length} de ${total}`);
  document.querySelectorAll('[data-progress-bar]').forEach(e=>e.style.width=pct+'%');
  document.querySelectorAll('[data-completed-count]').forEach(e=>e.textContent=done.length);
  document.querySelectorAll('[data-total-count]').forEach(e=>e.textContent=total);
  document.querySelectorAll('[data-module-id]').forEach(card=>{const ok=done.includes(Number(card.dataset.moduleId)),b=card.querySelector('[data-module-status]');if(b){b.textContent=ok?'Concluído':'Pendente';b.className='badge '+(ok?'badge-ok':'badge-warn')}});
  document.querySelectorAll('[data-medal-id]').forEach(m=>m.classList.toggle('locked',done.length<Number(m.dataset.medalId)));
  const cb=document.querySelector('[data-certificate-button]'),cm=document.querySelector('[data-certificate-message]');
  if(cb){const ok=done.length>=total;cb.disabled=!ok;cb.textContent=ok?'Gerar certificado de proficiência':`Complete os ${total} módulos`;if(cm)cm.textContent=ok?'Parabéns! Seu certificado de proficiência está liberado.':'Conclua todos os módulos para liberar seu certificado.'}
}
async function fillCertificate(){
  const target=document.querySelector('[data-certificate-view]');if(!target)return;
  try{
    const cert=await issueCertificate();
    const u=await Auth.currentUser();
    const{data:p}=await sb.from('profiles').select('nome').eq('id',u.id).maybeSingle();
    const nome=p?.nome||u.user_metadata?.nome||u.email?.split('@')[0]||'Professor(a)';
    const dataConclusao=new Date(cert.concluido_em||cert.emitido_em);
    document.querySelectorAll('[data-cert-name]').forEach(e=>e.textContent=nome);
    document.querySelectorAll('[data-cert-date]').forEach(e=>e.textContent=dataConclusao.toLocaleDateString('pt-BR'));
    document.querySelectorAll('[data-cert-code]').forEach(e=>e.textContent=String(cert.codigo));
    target.classList.remove('certificate-locked');
  }catch(e){console.error(e)}
}
document.addEventListener('DOMContentLoaded',async()=>{
  if(document.querySelector('[data-progress-percent],[data-module-id],[data-certificate-button],[data-medal-id]'))await render();
  document.querySelectorAll('[data-complete-module]').forEach(b=>b.addEventListener('click',async()=>{try{await complete(Number(b.dataset.completeModule));b.textContent='Módulo concluído ✓';b.disabled=true}catch(e){console.error(e);alert('Não foi possível registrar a conclusão.')}}));
  const btn=document.querySelector('[data-certificate-button]');
  if(btn)btn.addEventListener('click',async()=>{try{await fillCertificate();setTimeout(()=>window.print(),150)}catch(e){alert(e.message)}});
  await fillCertificate();
});
window.Progress={getRows,getDone,complete,issueCertificate,render,fillCertificate};
})();
