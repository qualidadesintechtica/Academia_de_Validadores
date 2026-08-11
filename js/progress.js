(()=>{
function formatDateBR(value){
  if(!value)return '--/--/----';
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return '--/--/----';
  return d.toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'});
}
async function getRows(){
  const u=await Auth.currentUser();
  if(!u)return[];
  const{data,error}=await sb.from('progresso_modulos')
    .select('modulo_id,concluido,concluido_em')
    .eq('user_id',u.id)
    .eq('concluido',true)
    .order('modulo_id');
  if(error){console.error('Erro ao carregar progresso:',error);throw error}
  return data||[];
}
async function getDone(){return(await getRows()).map(x=>Number(x.modulo_id))}
async function complete(id){
  const u=await Auth.currentUser();
  if(!u)throw new Error('Usuário não autenticado.');
  const{error}=await sb.from('progresso_modulos').upsert({
    user_id:u.id,
    modulo_id:Number(id),
    concluido:true,
    concluido_em:new Date().toISOString()
  },{onConflict:'user_id,modulo_id'});
  if(error)throw error;
  await render();
}
async function getProfessorName(u){
  let profile=null;
  try{
    const res=await sb.from('profiles').select('nome').eq('id',u.id).maybeSingle();
    if(res.error)console.warn('Não foi possível ler o perfil:',res.error);
    profile=res.data||null;
  }catch(e){console.warn('Falha ao consultar profile:',e)}
  const meta=u.user_metadata||{};
  const nome=(profile?.nome||meta.nome||meta.nome_completo||meta.full_name||meta.name||'').trim();
  if(nome)return nome;
  const exibido=document.querySelector('[data-user-name]')?.textContent?.trim();
  if(exibido && exibido!=='Professor(a)')return exibido;
  return u.email?.split('@')[0]||'Professor(a)';
}
function getConclusionDate(rows){
  const dates=rows
    .map(x=>x.concluido_em)
    .filter(Boolean)
    .map(x=>new Date(x))
    .filter(d=>!Number.isNaN(d.getTime()))
    .sort((a,b)=>a-b);
  return dates.length?dates.at(-1).toISOString():null;
}
async function getOrCreateCertificate(u){
  let cert=null;
  try{
    const existing=await sb.from('certificados')
      .select('id,codigo,emitido_em')
      .eq('user_id',u.id)
      .maybeSingle();
    if(existing.error)throw existing.error;
    cert=existing.data;
    if(!cert){
      const created=await sb.from('certificados')
        .insert({user_id:u.id})
        .select('id,codigo,emitido_em')
        .single();
      if(created.error)throw created.error;
      cert=created.data;
    }
    return cert;
  }catch(e){
    console.warn('Não foi possível registrar/ler o certificado. A exibição continuará sem bloquear o professor.',e);
    return{
      id:null,
      codigo:`ACV-${String(u.id).replace(/-/g,'').slice(0,12).toUpperCase()}`,
      emitido_em:new Date().toISOString(),
      local_fallback:true
    };
  }
}
async function issueCertificate(){
  const u=await Auth.currentUser();
  if(!u)throw new Error('Usuário não autenticado.');
  const rows=await getRows();
  const total=ACADEMIA_CONFIG.TOTAL_MODULOS||7;
  if(rows.length<total)throw new Error(`Conclua os ${total} módulos antes de emitir o certificado.`);
  const nome=await getProfessorName(u);
  const concluido_em=getConclusionDate(rows);
  if(!concluido_em)throw new Error('Não foi possível identificar a data de conclusão dos módulos.');
  const cert=await getOrCreateCertificate(u);
  return{...cert,nome,concluido_em};
}
async function render(){
  let rows=[];
  try{rows=await getRows()}catch(e){rows=[]}
  const done=rows.map(x=>Number(x.modulo_id));
  const total=ACADEMIA_CONFIG.TOTAL_MODULOS||7;
  const pct=Math.round(done.length/total*100);
  document.querySelectorAll('[data-progress-percent]').forEach(e=>e.textContent=pct+'%');
  document.querySelectorAll('[data-progress-count]').forEach(e=>e.textContent=`${done.length} de ${total}`);
  document.querySelectorAll('[data-progress-bar]').forEach(e=>e.style.width=pct+'%');
  document.querySelectorAll('[data-completed-count]').forEach(e=>e.textContent=done.length);
  document.querySelectorAll('[data-total-count]').forEach(e=>e.textContent=total);
  document.querySelectorAll('[data-module-id]').forEach(card=>{
    const ok=done.includes(Number(card.dataset.moduleId));
    const b=card.querySelector('[data-module-status]');
    if(b){b.textContent=ok?'Concluído':'Pendente';b.className='badge '+(ok?'badge-ok':'badge-warn')}
  });
  document.querySelectorAll('[data-medal-id]').forEach(m=>m.classList.toggle('locked',done.length<Number(m.dataset.medalId)));
  const cb=document.querySelector('[data-certificate-button]');
  const cm=document.querySelector('[data-certificate-message]');
  if(cb){
    const ok=done.length>=total;
    cb.disabled=!ok;
    cb.textContent=ok?'Gerar certificado de proficiência':`Complete os ${total} módulos`;
    if(cm)cm.textContent=ok?'Parabéns! Seu certificado de proficiência está liberado.':'Conclua todos os módulos para liberar seu certificado.';
  }
}
async function fillCertificate(){
  const target=document.querySelector('[data-certificate-view]');
  if(!target)return null;
  const cert=await issueCertificate();
  document.querySelectorAll('[data-cert-name]').forEach(e=>e.textContent=cert.nome);
  document.querySelectorAll('[data-cert-date]').forEach(e=>e.textContent=formatDateBR(cert.concluido_em));
  document.querySelectorAll('[data-cert-code]').forEach(e=>e.textContent=String(cert.codigo||'—'));
  target.classList.remove('certificate-locked');
  return cert;
}
document.addEventListener('DOMContentLoaded',async()=>{
  if(document.querySelector('[data-progress-percent],[data-module-id],[data-certificate-button],[data-medal-id]')){
    await render();
  }
  document.querySelectorAll('[data-complete-module]').forEach(b=>b.addEventListener('click',async()=>{
    try{
      await complete(Number(b.dataset.completeModule));
      b.textContent='Módulo concluído ✓';
      b.disabled=true;
    }catch(e){
      console.error(e);
      alert('Não foi possível registrar a conclusão.');
    }
  }));
  const btn=document.querySelector('[data-certificate-button]');
  if(btn){
    btn.addEventListener('click',async()=>{
      try{
        await fillCertificate();
        setTimeout(()=>window.print(),250);
      }catch(e){
        console.error('Erro ao gerar certificado:',e);
        alert(e.message||'Não foi possível gerar o certificado.');
      }
    });
  }
  if(document.querySelector('[data-certificate-view]')){
    try{await fillCertificate()}catch(e){console.info('Certificado ainda não liberado:',e.message)}
  }
});
window.Progress={getRows,getDone,complete,issueCertificate,render,fillCertificate};
})();
