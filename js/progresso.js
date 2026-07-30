(function(){
  const TOTAL_MODULOS = 7;
  const path = window.location.pathname;
  const emTrilha = path.endsWith('/pages/trilha.html') || path.endsWith('pages/trilha.html');
  const emCertificado = path.endsWith('/pages/certificacao.html') || path.endsWith('pages/certificacao.html');
  const moduloAtual = Number(document.body.dataset.moduleId || 0);

  async function sessao(){
    const {data, error} = await supabaseClient.auth.getSession();
    if(error || !data.session) return null;
    return data.session;
  }
  async function concluidos(userId){
    const {data, error} = await supabaseClient.from('progresso_modulos').select('modulo_id,concluido,concluido_em').eq('user_id',userId).eq('concluido',true);
    if(error){ console.error(error); return []; }
    return data || [];
  }
  function ids(rows){ return new Set(rows.map(r=>Number(r.modulo_id))); }
  function percentual(set){ return Math.round((set.size/TOTAL_MODULOS)*100); }
  function atualizarIndicadores(set){
    const p=percentual(set);
    document.querySelectorAll('[data-progress]').forEach(el=>el.textContent=p+'% concluído');
    document.querySelectorAll('[data-progress-bar]').forEach(el=>el.style.width=p+'%');
    const mini=document.getElementById('moduleProgressText'); if(mini) mini.textContent=p+'% da trilha';
  }
  function desbloqueado(id,set){ return id===1 || set.has(id-1); }

  async function renderTrilha(session,set){
    document.querySelectorAll('[data-module-card]').forEach(card=>{
      const id=Number(card.dataset.moduleId); const available=card.dataset.available!=='false';
      const done=set.has(id); const unlocked=desbloqueado(id,set); const link=card.querySelector('[data-module-link]'); const status=card.querySelector('[data-module-status]');
      card.classList.toggle('is-complete',done); card.classList.toggle('is-locked',!unlocked); card.classList.toggle('is-pending',!available);
      if(done){status.textContent='Concluído'; link.textContent='Revisar módulo'; link.removeAttribute('aria-disabled');}
      else if(!available){status.textContent='Conteúdo em preparação'; link.textContent='Em breve'; link.setAttribute('aria-disabled','true');}
      else if(!unlocked){status.textContent='Bloqueado'; link.textContent='🔒 Conclua o módulo anterior'; link.setAttribute('aria-disabled','true');}
      else{status.textContent='Disponível'; link.textContent='Acessar módulo'; link.removeAttribute('aria-disabled');}
      if(!available || !unlocked){link.addEventListener('click',e=>e.preventDefault());}
    });
    const cert=document.querySelector('[data-certificate-card]');
    if(cert){const link=cert.querySelector('a'); const ok=set.size===TOTAL_MODULOS; cert.classList.toggle('is-locked',!ok); link.textContent=ok?'Gerar certificado':'🔒 Complete os 7 módulos'; if(!ok){link.setAttribute('aria-disabled','true');link.addEventListener('click',e=>e.preventDefault());}}
  }

  async function renderModulo(session,set){
    atualizarIndicadores(set);
    const btn=document.getElementById('btnConcluirModulo'); const msg=document.getElementById('moduleMessage'); const next=document.getElementById('btnProximoModulo');
    if(!btn) return; // placeholder pending page
    if(!desbloqueado(moduloAtual,set)){window.location.replace('../pages/trilha.html?bloqueado='+moduloAtual);return;}
    if(set.has(moduloAtual)){btn.textContent='✓ Módulo concluído';btn.disabled=true;if(next)next.hidden=false;return;}
    btn.addEventListener('click',async()=>{
      btn.disabled=true;btn.textContent='Salvando...';
      const payload={user_id:session.user.id,email:session.user.email,modulo_id:moduloAtual,concluido:true,concluido_em:new Date().toISOString(),atualizado_em:new Date().toISOString()};
      const {error}=await supabaseClient.from('progresso_modulos').upsert(payload,{onConflict:'user_id,modulo_id'});
      if(error){console.error(error);btn.disabled=false;btn.textContent='✓ Concluir módulo';if(msg)msg.textContent='Não foi possível salvar. Verifique se o SQL do Supabase foi executado.';return;}
      set.add(moduloAtual); atualizarIndicadores(set); btn.textContent='✓ Módulo concluído'; if(msg)msg.textContent='Progresso salvo. A próxima etapa foi liberada.'; if(next)next.hidden=false;
    });
  }

  async function renderCertificado(session,set){
    atualizarIndicadores(set); const btn=document.querySelector('[data-generate-certificate]'); const aviso=document.querySelector('[data-certificate-message]'); const ok=set.size===TOTAL_MODULOS;
    if(btn){btn.disabled=!ok;btn.textContent=ok?'Gerar certificado':'Complete os 7 módulos';}
    if(aviso) aviso.textContent=ok?'Sua certificação está liberada.':'Conclua todos os módulos para liberar o certificado.';
  }

  document.addEventListener('DOMContentLoaded',async()=>{
    const session=await sessao(); if(!session)return;
    const set=ids(await concluidos(session.user.id)); atualizarIndicadores(set);
    if(emTrilha) await renderTrilha(session,set);
    else if(emCertificado) await renderCertificado(session,set);
    else if(moduloAtual) await renderModulo(session,set);
  });
})();
