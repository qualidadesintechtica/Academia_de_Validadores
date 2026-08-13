(() => {
  "use strict";

  let relatorioCompleto = [];

  function formatarData(valor) {
    if (!valor) return "-";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
      return "-";
    }

    return data.toLocaleString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function percentual(modulos) {
    const totalModulos = 7;

    if (!modulos) return 0;

    return Math.min(
      100,
      Math.round(
        (modulos / totalModulos) * 100
      )
    );
  }

  async function carregarRelatorio() {
    const mensagem =
      document.getElementById(
        "adminMessage"
      );

    const contador =
      document.getElementById(
        "adminCount"
      );

    try {
      mensagem.textContent =
        "Carregando relatório...";

      const {
        data: acessos,
        error: erroAcessos
      } =
        await window.sb
          .from(
            "vw_relatorio_acessos"
          )
          .select("*")
          .order(
            "ultimo_acesso",
            {
              ascending: false
            }
          );

      if (erroAcessos) {
        throw erroAcessos;
      }

      const {
        data: progresso,
        error: erroProgresso
      } =
        await window.sb
          .from(
            "progresso_modulos"
          )
          .select("*");

      if (erroProgresso) {
        console.warn(
          "Não foi possível carregar progresso:",
          erroProgresso
        );
      }

      const progressoPorUsuario = {};

      (progresso || [])
        .forEach(
          function (item) {
            const id =
              item.user_id ||
              item.usuario_id;

            if (!id) return;

            const concluido =
              item.concluido === true ||
              item.status === "concluido" ||
              item.status === "Concluído";

            if (!progressoPorUsuario[id]) {
              progressoPorUsuario[id] = 0;
            }

            if (concluido) {
              progressoPorUsuario[id] += 1;
            }
          }
        );

      relatorioCompleto =
        (acessos || [])
          .map(
            function (item) {
              const modulos =
                progressoPorUsuario[
                  item.user_id
                ] || 0;

              return {
                user_id:
                  item.user_id,

                nome:
                  item.nome ||
                  item.email ||
                  "Professor(a)",

                email:
                  item.email || "",

                primeiro_acesso:
                  item.primeiro_acesso,

                ultimo_acesso:
                  item.ultimo_acesso,

                quantidade_acessos:
                  Number(
                    item.quantidade_acessos || 0
                  ),

                modulos,

                progresso:
                  percentual(modulos),

                certificado:
                  modulos >= 7
                    ? "Sim"
                    : "Não",

                emissao:
                  "-",

                codigo:
                  "-"
              };
            }
          );

      aplicarFiltros();

      mensagem.textContent =
        "Relatório atualizado.";

    } catch (error) {
      console.error(
        "Erro ao carregar relatório:",
        error
      );

      contador.textContent = "0";

      mensagem.textContent =
        "Erro ao carregar o relatório: " +
        (
          error?.message ||
          "erro desconhecido"
        );

      renderizarTabela([]);
    }
  }

  function aplicarFiltros() {
    const busca =
      (
        document.getElementById(
          "adminSearch"
        )?.value || ""
      )
        .trim()
        .toLowerCase();

    const certificado =
      document.getElementById(
        "adminCertificate"
      )?.value || "";

    const dataInicio =
      document.getElementById(
        "adminDateFrom"
      )?.value || "";

    const dataFim =
      document.getElementById(
        "adminDateTo"
      )?.value || "";

    const filtrados =
      relatorioCompleto
        .filter(
          function (item) {
            const texto =
              (
                item.nome +
                " " +
                item.email
              )
                .toLowerCase();

            if (
              busca &&
              !texto.includes(busca)
            ) {
              return false;
            }

            if (
              certificado &&
              certificado !== "todos"
            ) {
              const esperado =
                certificado === "sim"
                  ? "Sim"
                  : "Não";

              if (
                item.certificado !== esperado
              ) {
                return false;
              }
            }

            if (
              dataInicio &&
              item.ultimo_acesso
            ) {
              const acesso =
                new Date(
                  item.ultimo_acesso
                );

              const inicio =
                new Date(
                  dataInicio +
                  "T00:00:00"
                );

              if (
                acesso < inicio
              ) {
                return false;
              }
            }

            if (
              dataFim &&
              item.ultimo_acesso
            ) {
              const acesso =
                new Date(
                  item.ultimo_acesso
                );

              const fim =
                new Date(
                  dataFim +
                  "T23:59:59"
                );

              if (
                acesso > fim
              ) {
                return false;
              }
            }

            return true;
          }
        );

    document.getElementById(
      "adminCount"
    ).textContent =
      filtrados.length;

    renderizarTabela(
      filtrados
    );
  }

  function renderizarTabela(dados) {
    const tbody =
      document.querySelector(
        "#adminTable tbody"
      );

    if (!tbody) return;

    tbody.innerHTML = "";

    if (!dados.length) {
      const tr =
        document.createElement("tr");

      tr.innerHTML = `
        <td
          colspan="10"
          style="
            text-align:center;
            padding:36px
          "
        >
          Nenhum acesso encontrado para os filtros selecionados.
        </td>
      `;

      tbody.appendChild(tr);

      return;
    }

    dados.forEach(
      function (item) {
        const tr =
          document.createElement("tr");

        tr.innerHTML = `
          <td>
            <strong>
              ${item.nome}
            </strong>

            <div
              style="
                font-size:12px;
                opacity:.7;
                margin-top:3px
              "
            >
              ${item.email}
            </div>
          </td>

          <td>
            ${formatarData(
              item.primeiro_acesso
            )}
          </td>

          <td>
            ${formatarData(
              item.ultimo_acesso
            )}
          </td>

          <td>
            ${item.quantidade_acessos}
          </td>

          <td>
            ${item.modulos}
          </td>

          <td>
            ${item.progresso}%
          </td>

          <td>
            ${item.certificado}
          </td>

          <td>
            ${item.emissao}
          </td>

          <td>
            ${item.codigo}
          </td>
        `;

        tbody.appendChild(tr);
      }
    );
  }

  function exportarCSV() {
    if (!relatorioCompleto.length) {
      alert(
        "Não há dados para exportar."
      );

      return;
    }

    const linhas = [
      [
        "Professor",
        "Email",
        "Primeiro acesso",
        "Último acesso",
        "Acessos",
        "Módulos",
        "Progresso",
        "Certificado",
        "Emissão",
        "Código"
      ]
    ];

    relatorioCompleto.forEach(
      function (item) {
        linhas.push([
          item.nome,
          item.email,
          formatarData(
            item.primeiro_acesso
          ),
          formatarData(
            item.ultimo_acesso
          ),
          item.quantidade_acessos,
          item.modulos,
          item.progresso + "%",
          item.certificado,
          item.emissao,
          item.codigo
        ]);
      }
    );

    const csv =
      linhas
        .map(
          linha =>
            linha
              .map(
                valor =>
                  `"${String(valor)
                    .replace(
                      /"/g,
                      '""'
                    )}"`
              )
              .join(";")
        )
        .join("\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
          csv
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "relatorio-acessos-academia.csv";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }

  document.addEventListener(
    "DOMContentLoaded",
    async function () {

      if (
        window.Auth &&
        typeof window.Auth
          .requireAdmin ===
          "function"
      ) {
        const permitido =
          await window.Auth
            .requireAdmin();

        if (!permitido) {
          return;
        }
      }

      document
        .getElementById(
          "adminRefresh"
        )
        ?.addEventListener(
          "click",
          carregarRelatorio
        );

      document
        .getElementById(
          "adminSearch"
        )
        ?.addEventListener(
          "input",
          aplicarFiltros
        );

      document
        .getElementById(
          "adminCertificate"
        )
        ?.addEventListener(
          "change",
          aplicarFiltros
        );

      document
        .getElementById(
          "adminDateFrom"
        )
        ?.addEventListener(
          "change",
          aplicarFiltros
        );

      document
        .getElementById(
          "adminDateTo"
        )
        ?.addEventListener(
          "change",
          aplicarFiltros
        );

      document
        .getElementById(
          "adminExport"
        )
        ?.addEventListener(
          "click",
          exportarCSV
        );

      await carregarRelatorio();
    }
  );
})();