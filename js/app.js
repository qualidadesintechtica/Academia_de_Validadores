/* =====================================================
   ACADEMIA DOS VALIDADORES — APP.JS
   Sistema de gamificação, estado e utilitários globais
   ===================================================== */

// ── Estado global ──────────────────────────────────────
const App = {
  usuario: null,
  trilha: null,

  init() {
    this.carregarDados();
    this.iniciarNavbar();
    this.iniciarParticulas();
    this.atualizarUI();
    this.verificarSequencia();
  },

  carregarDados() {
    if (typeof TRILHA !== "undefined") this.trilha = TRILHA;
    if (typeof carregarEstado !== "undefined") {
      this.usuario = carregarEstado();
    } else {
      const salvo = localStorage.getItem("academia_validadores_estado");
      this.usuario = salvo ? JSON.parse(salvo) : {
        nome: "Validador",
        xp: 0,
        xpTotal: 0,
        nivel: 1,
        sequencia: 0,
        modulosCompletos: [],
        medalhasObtidas: [],
        quizResultados: {},
        ultimoAcesso: new Date().toISOString()
      };
    }
  },

  salvar() {
    localStorage.setItem("academia_validadores_estado", JSON.stringify(this.usuario));
  },

  // ── Navbar ──────────────────────────────────────────
  iniciarNavbar() {
    const navbar = document.querySelector(".navbar");
    const toggle = document.querySelector(".navbar-toggle");
    const nav    = document.querySelector(".navbar-nav");

    if (navbar) {
      window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
      });
    }

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("aberto");
        toggle.classList.toggle("ativo");
      });
    }

    // Marcar link ativo
    const pagina = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar-nav a").forEach(a => {
      if (a.getAttribute("href") === pagina || a.getAttribute("href") === "../" + pagina) {
        a.classList.add("ativo");
      }
    });
  },

  // ── Partículas de fundo ──────────────────────────────
  iniciarParticulas() {
    const container = document.querySelector(".aurora-bg") || document.body;
    const cores = ["#6C63FF", "#FF6584", "#43E97B", "#FA8231", "#A29BFE"];
    const qtd = window.innerWidth < 768 ? 8 : 15;

    for (let i = 0; i < qtd; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = Math.random() * 6 + 3;
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${cores[Math.floor(Math.random() * cores.length)]};
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 20 + 15}s;
        animation-delay: ${Math.random() * 10}s;
      `;
      container.appendChild(p);
    }
  },

  // ── Atualizar UI com dados do usuário ────────────────
  atualizarUI() {
    if (!this.usuario) return;
    const u = this.usuario;
    const nivelInfo = this.calcularNivel(u.xp);

    // XP na navbar
    document.querySelectorAll(".navbar-xp-valor").forEach(el => {
      el.textContent = u.xp.toLocaleString("pt-BR") + " XP";
    });

    // Nível na navbar
    document.querySelectorAll(".navbar-nivel").forEach(el => {
      el.textContent = nivelInfo.titulo;
    });

    // Nome do usuário
    document.querySelectorAll(".usuario-nome").forEach(el => {
      el.textContent = u.nome;
    });
  },

  // ── Verificar sequência de dias ──────────────────────
  verificarSequencia() {
    if (!this.usuario) return;
    const hoje = new Date().toDateString();
    const ultimo = new Date(this.usuario.ultimoAcesso).toDateString();
    const ontem = new Date(Date.now() - 86400000).toDateString();

    if (ultimo === hoje) return; // já acessou hoje

    if (ultimo === ontem) {
      this.usuario.sequencia = (this.usuario.sequencia || 0) + 1;
    } else if (ultimo !== hoje) {
      this.usuario.sequencia = 1;
    }

    this.usuario.ultimoAcesso = new Date().toISOString();
    this.salvar();

    if (this.usuario.sequencia > 1) {
      setTimeout(() => {
        this.toast("🔥 Sequência!", `${this.usuario.sequencia} dias consecutivos de estudo!`, "info");
      }, 1500);
    }
  },

  // ── Calcular nível ───────────────────────────────────
  calcularNivel(xp) {
    const niveis = (this.trilha?.niveis) || [
      { nivel: 1, titulo: "Aprendiz",    xpMin: 0,    xpMax: 299,    cor: "#95A5A6" },
      { nivel: 2, titulo: "Iniciante",   xpMin: 300,  xpMax: 699,    cor: "#27AE60" },
      { nivel: 3, titulo: "Praticante",  xpMin: 700,  xpMax: 1299,   cor: "#2980B9" },
      { nivel: 4, titulo: "Validador",   xpMin: 1300, xpMax: 2199,   cor: "#8E44AD" },
      { nivel: 5, titulo: "Especialista",xpMin: 2200, xpMax: 3499,   cor: "#E67E22" },
      { nivel: 6, titulo: "Mestre",      xpMin: 3500, xpMax: 4999,   cor: "#E74C3C" },
      { nivel: 7, titulo: "Guardião",    xpMin: 5000, xpMax: 999999, cor: "#F39C12" }
    ];
    for (let i = niveis.length - 1; i >= 0; i--) {
      if (xp >= niveis[i].xpMin) return niveis[i];
    }
    return niveis[0];
  },

  // ── Adicionar XP ────────────────────────────────────
  adicionarXP(qtd, motivo = "") {
    if (!this.usuario) return;
    const nivelAntes = this.calcularNivel(this.usuario.xp);
    this.usuario.xp += qtd;
    this.usuario.xpTotal = (this.usuario.xpTotal || 0) + qtd;
    const nivelDepois = this.calcularNivel(this.usuario.xp);
    this.usuario.nivel = nivelDepois.nivel;
    this.salvar();
    this.atualizarUI();

    this.toast("⚡ XP Ganho!", `+${qtd} XP${motivo ? " — " + motivo : ""}`, "xp");

    if (nivelDepois.nivel > nivelAntes.nivel) {
      setTimeout(() => {
        this.toast("🎉 Nível Up!", `Você alcançou o nível ${nivelDepois.nivel}: ${nivelDepois.titulo}!`, "sucesso");
      }, 1000);
    }

    return nivelDepois;
  },

  // ── Sistema de Toast ─────────────────────────────────
  toast(titulo, mensagem, tipo = "info", duracao = 4000) {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const icones = { sucesso: "✅", erro: "❌", info: "ℹ️", xp: "⚡" };
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
      <span class="toast-icon">${icones[tipo] || "ℹ️"}</span>
      <div>
        <div class="toast-titulo">${titulo}</div>
        <p class="toast-msg">${mensagem}</p>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "toast-out 0.3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }, duracao);
  },

  // ── Progresso da trilha ──────────────────────────────
  getProgressoTrilha() {
    if (!this.usuario || !this.trilha) return { percentual: 0, completos: 0, total: 8 };
    const total = this.trilha.modulos.length;
    const completos = this.usuario.modulosCompletos.length;
    return { percentual: Math.round((completos / total) * 100), completos, total };
  },

  // ── Verificar medalhas ───────────────────────────────
  verificarMedalhas() {
    if (!this.usuario || !this.trilha) return [];
    const novas = [];
    const u = this.usuario;

    const checar = (id, condicao) => {
      if (condicao && !u.medalhasObtidas.includes(id)) {
        u.medalhasObtidas.push(id);
        novas.push(id);
      }
    };

    checar("primeiro_passo", u.modulosCompletos.length >= 1);
    checar("explorador",     u.modulosCompletos.length >= 4);
    checar("trilha_completa",u.modulosCompletos.length >= 8);
    checar("dedicado",       u.sequencia >= 7);
    checar("consistente",    u.sequencia >= 30);

    // Verificar 100% em quizzes
    const resultados = Object.values(u.quizResultados || {});
    const perfeitos = resultados.filter(r => r.percentual === 100).length;
    checar("perfeccionista", perfeitos >= 3);
    checar("mestre_quiz",    perfeitos >= 8);

    if (novas.length > 0) {
      this.salvar();
      novas.forEach(id => {
        const medalha = this.trilha.medalhas.find(m => m.id === id);
        if (medalha) {
          setTimeout(() => {
            this.toast(`${medalha.icone} Medalha Desbloqueada!`, medalha.titulo + " — " + medalha.descricao, "sucesso", 6000);
            this.adicionarXP(medalha.xp, "Medalha: " + medalha.titulo);
          }, 500);
        }
      });
    }

    return novas;
  }
};

// Inicializar quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => App.init());
