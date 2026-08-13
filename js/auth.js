(() => {
  "use strict";

  const publicPage =
    /(login|cadastro|recuperar-senha)\.html$/
      .test(location.pathname);

  const prefix =
    (
      location.pathname.includes("/pages/") ||
      location.pathname.includes("/trilhas/") ||
      location.pathname.includes("/conteudos/")
    )
      ? "../"
      : "";


  /* =====================================================
     USUÁRIO ATUAL
  ===================================================== */

  async function currentUser() {

    if (!window.sb) {
      return null;
    }

    try {

      const {
        data: { session },
        error
      } =
        await window.sb.auth.getSession();


      if (error) {

        console.error(
          "Erro ao recuperar sessão:",
          error
        );

        return null;
      }


      return session?.user || null;


    } catch (error) {

      console.error(
        "Erro ao consultar usuário:",
        error
      );

      return null;
    }

  }


  /* =====================================================
     PROTEÇÃO DAS PÁGINAS
  ===================================================== */

  async function protect() {

    if (publicPage) {
      return;
    }


    const user =
      await currentUser();


    if (!user) {

      location.replace(
        prefix + "login.html"
      );

    }

  }


  /* =====================================================
     LOGOUT
  ===================================================== */

  async function logout() {

    try {

      if (window.sb) {

        await window.sb.auth.signOut();

      }

    } catch (error) {

      console.error(
        "Erro ao sair:",
        error
      );

    }


    location.replace(
      prefix +
      "login.html?logout=1"
    );

  }


  /* =====================================================
     NOME / NÍVEL DO USUÁRIO
  ===================================================== */

  async function fillUser() {

    const user =
      await currentUser();


    if (!user) {
      return;
    }


    /*
      Por enquanto usamos os metadados
      do próprio Supabase Auth.

      Isso evita o erro 404 da tabela profiles.
    */

    const nome =
      user.user_metadata?.nome ||
      user.user_metadata?.nome_completo ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Professor(a)";


    const nivel =
      user.user_metadata?.nivel ||
      "Aprendiz";


    document
      .querySelectorAll(
        "[data-user-name]"
      )
      .forEach(
        elemento => {

          elemento.textContent =
            nome;

        }
      );


    document
      .querySelectorAll(
        "[data-user-level]"
      )
      .forEach(
        elemento => {

          elemento.textContent =
            nivel;

        }
      );


    const partes =
      nome
        .trim()
        .split(/\s+/);


    const iniciais =
      (
        (partes[0]?.[0] || "P") +
        (partes[1]?.[0] || "")
      )
        .toUpperCase();


    document
      .querySelectorAll(
        "[data-user-initials]"
      )
      .forEach(
        elemento => {

          elemento.textContent =
            iniciais;

        }
      );

  }


  /* =====================================================
     VERIFICA ADMIN DO RELATÓRIO
  ===================================================== */

  async function isAdmin() {

    const user =
      await currentUser();


    if (
      !user ||
      !window.sb
    ) {

      return false;

    }


    try {

      const {
        data,
        error
      } =
        await window.sb.rpc(
          "is_relatorio_admin"
        );


      if (error) {

        console.error(
          "Erro ao verificar acesso administrativo:",
          error
        );

        return false;

      }


      console.log(
        "Acesso ao relatório:",
        data
      );


      return data === true;


    } catch (error) {

      console.error(
        "Erro inesperado ao verificar administrador:",
        error
      );

      return false;

    }

  }


  /* =====================================================
     ADICIONA RELATÓRIO AO MENU
  ===================================================== */

  async function fillAdminNav() {

    const admin =
      await isAdmin();


    if (!admin) {

      console.log(
        "Usuário sem acesso administrativo."
      );

      return;

    }


    const nav =
      document.querySelector(
        ".side-nav"
      );


    if (!nav) {

      console.warn(
        "Menu lateral não encontrado."
      );

      return;

    }


    /*
      Evita criar o link duas vezes.
    */

    if (
      nav.querySelector(
        "[data-admin-report-link]"
      )
    ) {

      return;

    }


    const link =
      document.createElement(
        "a"
      );


    link.href =
      prefix +
      "pages/relatorio-acessos.html";


    link.dataset.adminReportLink =
      "";


    link.innerHTML = `
      <b>▤</b>
      <span>
        Relatório de Acessos
      </span>
    `;


    /*
      Coloca antes de Ajuda & FAQ.
    */

    const ajuda =
      [
        ...nav.querySelectorAll("a")
      ]
        .find(
          item =>

            (
              item.getAttribute(
                "href"
              ) || ""
            )
              .includes(
                "ajuda.html"
              )

        );


    if (ajuda) {

      nav.insertBefore(
        link,
        ajuda
      );

    } else {

      nav.appendChild(
        link
      );

    }


    console.log(
      "Menu Relatório de Acessos adicionado."
    );

  }


  /* =====================================================
     PROTEÇÃO DA PÁGINA ADMINISTRATIVA
  ===================================================== */

  async function requireAdmin() {

    const permitido =
      await isAdmin();


    if (!permitido) {

      location.replace(
        prefix +
        "index.html?admin=negado"
      );

      return false;

    }


    return true;

  }


  /* =====================================================
     INICIALIZAÇÃO
  ===================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

      if (!publicPage) {

        await protect();

        await fillUser();

        await fillAdminNav();

      }


      document
        .querySelectorAll(
          "[data-logout]"
        )
        .forEach(
          botao => {

            botao.addEventListener(
              "click",
              logout
            );

          }
        );

    }
  );


  /* =====================================================
     EXPOSIÇÃO GLOBAL
  ===================================================== */

  window.Auth = {

    currentUser,

    protect,

    logout,

    fillUser,

    isAdmin,

    fillAdminNav,

    requireAdmin

  };

})();