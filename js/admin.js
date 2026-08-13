(()=>{
const TOTAL_MODULOS=window.ACADEMIA_CONFIG?.TOTAL_MODULOS||7;
let relatorio=[];
let filtrado=[];

function fmtDate(value){
  if(!value)return '—';
  const d=new Date(value);
  if(Number.isNaN(d.getTime()))return '—';
  return d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
}

function csvCell(value){
  const s=String(value??'');
  return '"'+s.replaceAll('"','""')+'"';
}

async function fetchAll(table,select='*'){
  const batch=1000;
  let start=0,out=[];
  while(true){
    const{data,error}=await sb.from(table).select(select).range(start,start+batch-1);
    if(error)throw error;
    const rows=data||[];
    out=out.concat(rows);
    if(rows.length<batch)break;
    start+=batch;
  }
  return out;
}

function construirResumo(acessos,profiles,progressos,certificados){
  const map=new Map();
  const perfilMap=new Map(profiles.map(p=>[p.id,p]));
  const progMap=new Map();
  progressos.filter(p=>p.concluido).forEach(p=>{
    if(!progMap.has(p.user_id))progMap.set(p.user_id,[]);
    progMap.get(p.user_id).push(p);
  });
  const certMap=new Map(certificados.map(c=>[c.user_id,c]));

  acessos.forEach(a=>{
    if(!map.has(a.user_id))map.set(a.user_id,{
      user_id:a.user_id,
      email:a.email||'',
      nome:a.nome||'',
      acessos:[],
      primeiro_acesso:null,
      ultimo_acesso:null
    });
    const r=map.get(a.user_id);
    if(a.email)r.email=a.email;
    if(a.nome)r.nome=a.nome;
    r.acessos.push(a);
  });

  return [...map.values()].map(r=>{
    const dates=r.acessos.map(a=>new Date(a.acessado_em)).filter(d=>!Number.isNaN(d.getTime())).sort((a,b)=>a-b);
    const perfil=perfilMap.get(r.user_id);
    const progs=progMap.get(r.user_id)||[];
    const cert=certMap.get(r.user_id);
    return{
      ...r,
      nome:perfil?.nome||r.nome||'Professor(a)',
      primeiro_acesso:dates[0]?.toISOString()||null,
      ultimo_acesso:dates.at(-1)?.toISOString()||null,
      quantidade_acessos:r.acessos.length,
      modulos_concluidos:new Set(progs.map(p=>Number(p.modulo_id))).size,
      progresso_percentual:Math.round(new Set(progs.map(p=>Number(p.modulo_id))).size/TOTAL_MODULOS*100),
      certificado_emitido:Boolean(cert),
      certificado_em:cert?.emitido_em||null,
      codigo_certificado:cert?.codigo||''
    };
  }).sort((a,b)=>(new Date(b.ultimo_acesso||0))-(new Date(a.ultimo_acesso||0)));
}

function aplicarFiltros(){
  const busca=(document.querySelector('#adminBusca')?.value||'').trim().toLowerCase();
  const cert=document.querySelector('#adminCertificado')?.value||'';
  const inicio=document.querySelector('#adminDataInicio')?.value||'';
  const fim=document.querySelector('#adminDataFim')?.value||'';

  filtrado=relatorio.filter(r=>{
    const texto=(r.nome+' '+r.email).toLowerCase();
    if(busca&&!texto.includes(busca))return false;
    if(cert==='sim'&&!r.certificado_emitido)return false;
    if(cert==='nao'&&r.certificado_emitido)return false;
    if(inicio){
      const di=new Date(inicio+'T00:00:00');
      if(!r.ultimo_acesso||new Date(r.ultimo_acesso)<di)return false;
    }
    if(fim){
      const df=new Date(fim+'T23:59:59');
      if(!r.ultimo_acesso||new Date(r.ultimo_acesso)>df)return false;
    }
    return true;
  });
  render();
}

function render(){
  const body=document.querySelector('#adminTabelaBody');
  const count=document.querySelector('[data-admin-count]');
  if(count)count.textContent=filtrado.length;
  if(!body)return;
  body.innerHTML='';
  if(!filtrado.length){
    body.innerHTML='<tr><td colspan="9" class="admin-empty">Nenhum acesso encontrado para os filtros selecionados.</td></tr>';
    return;
  }
  filtrado.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td><strong>${escapeHtml(r.nome)}</strong><small>${escapeHtml(r.email)}</small></td>
      <td>${fmtDate(r.primeiro_acesso)}</td>
      <td>${fmtDate(r.ultimo_acesso)}</td>
      <td class="admin-number">${r.quantidade_acessos}</td>
      <td>${r.modulos_concluidos}/${TOTAL_MODULOS}</td>
      <td><div class="admin-progress"><span style="width:${r.progresso_percentual}%"></span></div><small>${r.progresso_percentual}%</small></td>
      <td><span class="badge ${r.certificado_emitido?'badge-ok':'badge-warn'}">${r.certificado_emitido?'Emitido':'Não emitido'}</span></td>
      <td>${fmtDate(r.certificado_em)}</td>
      <td><code>${escapeHtml(r.codigo_certificado||'—')}</code></td>`;
    body.appendChild(tr);
  });
}

function escapeHtml(v){
  return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function exportarCSV(){
  const header=['Nome','E-mail','Primeiro acesso','Último acesso','Qtd. acessos','Módulos concluídos','Progresso','Certificado','Data certificado','Código certificado'];
  const rows=filtrado.map(r=>[
    r.nome,r.email,fmtDate(r.primeiro_acesso),fmtDate(r.ultimo_acesso),r.quantidade_acessos,
    `${r.modulos_concluidos}/${TOTAL_MODULOS}`,`${r.progresso_percentual}%`,r.certificado_emitido?'Sim':'Não',fmtDate(r.certificado_em),r.codigo_certificado||''
  ]);
  const csv='\ufeff'+[header,...rows].map(row=>row.map(csvCell).join(';')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`relatorio-acessos-academia-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}

async function carregar(){
  const status=document.querySelector('[data-admin-status]');
  try{
    const permitido=await Auth.requireAdmin();
    if(!permitido)return;
    if(status)status.textContent='Carregando relatório...';
    const [acessos,profiles,progressos,certificados]=await Promise.all([
      fetchAll('acessos_academia','user_id,email,nome,origem,acessado_em'),
      fetchAll('profiles','id,nome,nivel'),
      fetchAll('progresso_modulos','user_id,modulo_id,concluido,concluido_em'),
      fetchAll('certificados','user_id,codigo,emitido_em')
    ]);
    relatorio=construirResumo(acessos,profiles,progressos,certificados);
    filtrado=[...relatorio];
    render();
    if(status)status.textContent=`${acessos.length} acessos registrados desde a ativação do relatório.`;
  }catch(e){
    console.error('Erro no relatório administrativo:',e);
    if(status)status.textContent='Não foi possível carregar o relatório. Execute primeiro o SQL de configuração no Supabase.';
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  ['#adminBusca','#adminCertificado','#adminDataInicio','#adminDataFim'].forEach(sel=>{
    document.querySelector(sel)?.addEventListener(sel==='#adminBusca'?'input':'change',aplicarFiltros);
  });
  document.querySelector('[data-admin-export]')?.addEventListener('click',exportarCSV);
  document.querySelector('[data-admin-refresh]')?.addEventListener('click',carregar);
  carregar();
});
})();
