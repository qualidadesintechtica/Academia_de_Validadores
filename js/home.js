/* =====================================================
   ACADEMIA DOS VALIDADORES — HOME.JS
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderizarTrilhaPreview();
  atualizarStatsHome();
  iniciarFAQ();
  iniciarTimerMissao();
  atualizarHeroCard();
});

// ── Trilha Preview ──────────────────────────────────
function renderizarTrilhaPreview() {
  const grid = document.getElementById("trilhaPreviewGrid");
  if (!grid || typeof TRILHA === "undefined") return;

  const usuario = App?.usuario || JSON.parse(localStorage.getItem("academia_validadores_estado") || "{}");
  const modulosCompletos = usuario.modulosCompletos || [];

  TRILHA.modulos.forEach((mod, idx) => {
    const completo = modulosCompletos.includes(mod.id);
    const desbloqueado = idx < 3 || completo || modulosCompletos.length >= idx;
    const statusClass = completo ? "completo" : (desbloqueado ? "disponivel" : "bloqueado");
    const href = desbloqueado ? `pages/modulo.html?id=${mod.id}` : "#";

    const card = document.createElement("a");
    card.className = `modulo-card-mini ${desbloqueado ? "" : "bloqueado"}`;
    card.href = href;
    if (!desbloqueado) card.addEventListener("click", e => e.preventDefault());

    card.innerHTML = `
      <span class="mcm-icon">${mod.icone}</span>
      <div class="mcm-num">Módulo ${mod.id}</div>
      <div class="mcm-titulo">${mod.titulo}</div>
      <div class="mcm-xp">⚡ ${mod.xp} XP</div>
      <div class="mcm-status ${statusClass}">
        ${completo ? "✅ Completo" : desbloqueado ? "▶ Disponível" : "🔒 Bloqueado"}
      </div>
    `;

    grid.appendChild(card);
  });
}

// ── Atualizar stats da home ──────────────────────────
function atualizarStatsHome() {
  const usuario = App?.usuario || JSON.parse(localStorage.getItem("academia_validadores_estado") || "{}");
  const modulosCompletos = (usuario.modulosCompletos || []).length;
  const medalhas = (usuario.medalhasObtidas || []).length;
  const xp = usuario.xp || 0;
  const sequencia = usuario.sequencia || 0;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("statXP", xp.toLocaleString("pt-BR"));
  set("statModulos", `${modulosCompletos}/8`);
  set("statSequencia", sequencia);
  set("statMedalhas", `${medalhas}/8`);

  // Barra de progresso geral
  const pct = Math.round((modulosCompletos / 8) * 100);
  const bar = document.getElementById("progressoGeralBar");
  const badge = document.getElementById("progressoBadge");
  if (bar) bar.style.width = pct + "%";
  if (badge) badge.textContent = pct + "%";

  // Mini dots dos módulos
  const mini = document.getElementById("progressoModulosMini");
  if (mini && typeof TRILHA !== "undefined") {
    TRILHA.modulos.forEach((mod, idx) => {
      const completo = (usuario.modulosCompletos || []).includes(mod.id);
      const ativo = idx === modulosCompletos && !completo;
      const dot = document.createElement("div");
      dot.className = `pmm-dot ${completo ? "completo" : ativo ? "ativo" : "pendente"}`;
      dot.textContent = mod.id;
      dot.title = mod.titulo;
      mini.appendChild(dot);
    });
  }
}

// ── Hero card atualização ────────────────────────────
function atualizarHeroCard() {
  const usuario = App?.usuario || JSON.parse(localStorage.getItem("academia_validadores_estado") || "{}");
  const xp = usuario.xp || 0;
  const sequencia = usuario.sequencia || 0;
  const modulosCompletos = (usuario.modulosCompletos || []).length;

  const nivelInfo = App?.calcularNivel(xp) || { titulo: "Aprendiz", xpMin: 0, xpMax: 299 };
  const pct = Math.min(100, Math.round(((xp - nivelInfo.xpMin) / (nivelInfo.xpMax - nivelInfo.xpMin)) * 100));

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set("heroNivelBadge", nivelInfo.titulo);
  set("heroXP", xp.toLocaleString("pt-BR") + " XP");
  set("heroModulosCompletos", modulosCompletos);
  set("heroSequencia", sequencia);

  const bar = document.getElementById("heroProgressBar");
  if (bar) bar.style.width = pct + "%";
}

// ── FAQ ──────────────────────────────────────────────
function iniciarFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector(".faq-pergunta");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const ativo = item.classList.contains("ativo");
      document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("ativo"));
      if (!ativo) item.classList.add("ativo");
    });
  });
}

// ── Timer Missão da Semana ───────────────────────────
function iniciarTimerMissao() {
  function calcularFimSemana() {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0=dom, 1=seg...
    const diasAteDomingo = 7 - diaSemana;
    const fim = new Date(agora);
    fim.setDate(fim.getDate() + diasAteDomingo);
    fim.setHours(23, 59, 59, 0);
    return fim;
  }

  function atualizar() {
    const agora = new Date();
    const fim = calcularFimSemana();
    const diff = fim - agora;

    if (diff <= 0) {
      document.getElementById("timerTexto").textContent = "Missão encerrada";
      return;
    }

    const dias  = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);

    const txt = dias > 0
      ? `${dias}d ${horas}h ${mins}m restantes`
      : `${horas}h ${mins}m restantes`;

    const el = document.getElementById("timerTexto");
    if (el) el.textContent = txt;
  }

  atualizar();
  setInterval(atualizar, 60000);
}
