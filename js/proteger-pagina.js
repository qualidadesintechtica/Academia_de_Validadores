(async function protegerPagina() {
  "use strict";

  const paginaAtual = window.location.pathname.toLowerCase();

  if (paginaAtual.endsWith("/login.html") || paginaAtual.endsWith("/login")) {
    return;
  }

  if (!window.supabaseClient?.auth) {
    console.error("supabaseClient não foi carregado.");
    return;
  }

  const loginPath = /\/(pages|trilhas)\//.test(window.location.pathname)
    ? "../login.html"
    : "login.html";

  const {
    data: { session },
    error,
  } = await window.supabaseClient.auth.getSession();

  if (error || !session) {
    window.location.replace(loginPath);
    return;
  }

  const user = session.user;
  const dominio = String(user.email || "").toLowerCase().split("@").pop();
  const dominiosAutorizados = ["animaeducacao.com.br", "ulife.com.br"];

  if (!dominiosAutorizados.includes(dominio)) {
    await window.supabaseClient.auth.signOut();
    window.location.replace(loginPath);
    return;
  }

  const nome =
    user.user_metadata?.nome ||
    user.user_metadata?.nome_completo ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Validador";

  localStorage.setItem("academia_nome_usuario", nome);

  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = nome;
  });

  document.querySelectorAll(".avatar, .profile-big-avatar").forEach((el) => {
    el.textContent = iniciais || "VA";
  });

  const userMenu = document.querySelector(".user-menu");

  if (userMenu && !document.getElementById("logoutButton")) {
    const botao = document.createElement("button");
    botao.id = "logoutButton";
    botao.className = "logout-button";
    botao.type = "button";
    botao.textContent = "Sair";

    botao.addEventListener("click", async () => {
      botao.disabled = true;
      await window.supabaseClient.auth.signOut();
      window.location.replace(loginPath);
    });

    userMenu.appendChild(botao);
  }
})();
