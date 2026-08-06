document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const loginPanel = document.getElementById("loginPanel");
  const registerPanel = document.getElementById("registerPanel");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");
  const registerMessage = document.getElementById("registerMessage");

  const dominiosPermitidos = new Set([
    "animaeducacao.com.br",
    "ulife.com.br",
  ]);

  function supabaseDisponivel() {
    return Boolean(window.supabaseClient?.auth);
  }

  function mostrarMensagem(elemento, mensagem, tipo = "error") {
    if (!elemento) return;

    elemento.textContent = mensagem;
    elemento.className = `auth-message ${tipo}`;
    elemento.hidden = false;
  }

  function limparMensagem(elemento) {
    if (!elemento) return;

    elemento.textContent = "";
    elemento.className = "auth-message";
    elemento.hidden = true;
  }

  function dominioDoEmail(email) {
    const partes = String(email || "")
      .trim()
      .toLowerCase()
      .split("@");

    return partes.length === 2 ? partes[1] : "";
  }

  function emailPermitido(email) {
    return dominiosPermitidos.has(dominioDoEmail(email));
  }

  function mostrarPainel(nome) {
    if (!loginPanel || !registerPanel) return;

    const cadastro = nome === "register";

    loginPanel.hidden = cadastro;
    registerPanel.hidden = !cadastro;

    limparMensagem(authMessage);
    limparMensagem(registerMessage);
  }

  document.querySelectorAll("[data-show-panel]").forEach((botao) => {
    botao.addEventListener("click", () => {
      mostrarPainel(botao.dataset.showPanel);
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      limparMensagem(authMessage);

      if (!supabaseDisponivel()) {
        mostrarMensagem(
          authMessage,
          "A conexão com o sistema não foi carregada. Atualize a página.",
        );
        return;
      }

      const email =
        document
          .getElementById("loginEmail")
          ?.value.trim()
          .toLowerCase() || "";

      const password =
        document.getElementById("loginPassword")?.value || "";

      const botao = loginForm.querySelector(
        'button[type="submit"]',
      );

      if (!emailPermitido(email)) {
        mostrarMensagem(
          authMessage,
          "Use um e-mail @animaeducacao.com.br ou @ulife.com.br.",
        );
        return;
      }

      if (!password) {
        mostrarMensagem(authMessage, "Digite sua senha.");
        return;
      }

      if (!botao) return;

      botao.disabled = true;
      botao.textContent = "Entrando...";

      try {
        const { data, error } =
          await window.supabaseClient.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        if (!data?.session) {
          throw new Error("Sessão não iniciada.");
        }

        const nome =
          data.user?.user_metadata?.nome ||
          data.user?.user_metadata?.nome_completo ||
          data.user?.user_metadata?.full_name ||
          data.user?.email?.split("@")[0] ||
          "Validador";

        localStorage.setItem("academia_nome_usuario", nome);

        window.location.assign("index.html");
      } catch (error) {
        console.error("Erro no login:", error);

        const texto = String(error?.message || "").toLowerCase();

        let mensagem =
          "Não foi possível entrar. Confira o e-mail e a senha.";

        if (texto.includes("email not confirmed")) {
          mensagem =
            "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.";
        } else if (
          texto.includes("invalid login credentials")
        ) {
          mensagem =
            "E-mail ou senha incorretos. Use a senha criada na Academia.";
        }

        mostrarMensagem(authMessage, mensagem);
      } finally {
        botao.disabled = false;
        botao.textContent = "Entrar";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();
        limparMensagem(registerMessage);

        if (!supabaseDisponivel()) {
          mostrarMensagem(
            registerMessage,
            "A conexão com o sistema não foi carregada. Atualize a página.",
          );
          return;
        }

        const nome =
          document
            .getElementById("registerName")
            ?.value.trim() || "";

        const email =
          document
            .getElementById("registerEmail")
            ?.value.trim()
            .toLowerCase() || "";

        const password =
          document.getElementById("registerPassword")
            ?.value || "";

        const botao = registerForm.querySelector(
          'button[type="submit"]',
        );

        if (!nome) {
          mostrarMensagem(
            registerMessage,
            "Digite seu nome completo.",
          );
          return;
        }

        if (!emailPermitido(email)) {
          mostrarMensagem(
            registerMessage,
            "Use um e-mail @animaeducacao.com.br ou @ulife.com.br.",
          );
          return;
        }

        if (password.length < 6) {
          mostrarMensagem(
            registerMessage,
            "A senha precisa ter pelo menos 6 caracteres.",
          );
          return;
        }

        if (!botao) return;

        botao.disabled = true;
        botao.textContent = "Criando conta...";

        try {
          const redirectUrl =
            "https://qualidadesintechtica.github.io/Academia_de_Validadores/login.html";

          const { error } =
            await window.supabaseClient.auth.signUp({
              email,
              password,
              options: {
                data: {
                  nome,
                  nome_completo: nome,
                  full_name: nome,
                },
                emailRedirectTo: redirectUrl,
              },
            });

          if (error) throw error;

          registerForm.reset();

          mostrarMensagem(
            registerMessage,
            `Cadastro realizado. Enviamos um e-mail de confirmação para ${email}.`,
            "success",
          );

          setTimeout(() => {
            mostrarPainel("login");

            mostrarMensagem(
              authMessage,
              "Conta criada. Confirme o e-mail recebido e depois entre.",
              "success",
            );
          }, 2500);
        } catch (error) {
          console.error("Erro no cadastro:", error);

          mostrarMensagem(
            registerMessage,
            error?.message ||
              "Não foi possível criar sua conta.",
          );
        } finally {
          botao.disabled = false;
          botao.textContent = "Criar conta";
        }
      },
    );
  }

  mostrarPainel("login");
});