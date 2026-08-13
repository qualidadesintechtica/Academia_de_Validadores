(() => {
  "use strict";

  const TOTAL_MODULOS =
    window.ACADEMIA_CONFIG?.TOTAL_MODULOS || 7;

  let relatorio = [];
  let filtrado = [];


  function fmtDate(value) {
    if (!value) return "—";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return "—";
    }

    return d.toLocaleString(
      "pt-BR",
      {
        timeZone:
          "America/Sao_Paulo"
      }
    );
  }


  function escapeHtml(value) {
    return String(value ?? "")
      .replace(
        /[&<>'"]/g,
        c => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;"
        })[c]
      );
  }


  function csvCell(value) {
    return (
      '"' +
      String(value ?? "")
        .replaceAll(
          '"',
          '""'
        ) +
      '"'
    );
  }


  async function fetchAll(
    table,
    select = "*"
  ) {
    const batch = 1000;

    let start = 0;
    let out = [];

    while (true) {
      const {
        data,
        error
      } =
        await window.sb
          .from(table)
          .select(select)
          .range(
            start,
            start + batch - 1
          );

      if (error) {
        throw error;
      }

      const rows =
        data || [];

      out =
        out.concat(rows);

      if (
        rows.length <
        batch
      ) {
        break;
      }

      start += batch;
    }

    return out;
  }


  function construirResumo(
    acessos,
    progressos
  ) {
    const map =
      new Map();

    const progMap =
      new Map();


    /*
      Organiza módulos concluídos
      por usuário.
    */

    progressos
      .filter(
        p =>
          p.concluido === true
      )
      .forEach(
        p => {

          if (
            !progMap.has(
              p.user_id
            )
          ) {
            progMap.set(
              p.user_id,
              []
            );
          }

          progMap
            .get(
              p.user_id
            )
            .push(p);

        }
      );


    /*
      Organiza os acessos.
    */

    acessos.forEach(
      a => {

        if (
          !map.has(
            a.user_id
          )
        ) {
          map.set(
            a.user_id,
            {
              user_id:
                a.user_id,

              email:
                a.email || "",

              nome:
                a.nome || "",

              acessos: []
            }
          );
        }


        const r =
          map.get(
            a.user_id
          );


        if (a.email) {
          r.email =
            a.email;
        }


        if (a.nome) {
          r.nome =
            a.nome;
        }


        r.acessos.push(a);

      }
    );


    return [
      ...map.values()
    ]
      .map(
        r => {

          const dates =
            r.acessos
              .map(
                a =>
                  new Date(
                    a.acessado_em
                  )
              )
              .filter(
                d =>
                  !Number.isNaN(
                    d.getTime()
                  )
              )
              .sort(
                (a, b) =>
                  a - b
              );


          const progs =
            progMap.get(
              r.user_id
            ) || [];


          const modulos =
            new Set(
              progs.map(
                p =>
                  Number(
                    p.modulo_id
                  )
              )
            ).size;


          /*
            Por enquanto:
            se concluiu todos os módulos,
            consideramos certificado liberado.

            Não dependemos da tabela
            certificados.
          */

          const certificado =
            modulos >=
            TOTAL_MODULOS;


          return {

            user_id:
              r.user_id,

            nome:
              r.nome ||
              r.email ||
              "Professor(a)",

            email:
              r.email,

            primeiro_acesso:
              dates[0]
                ?.toISOString() ||
              null,

            ultimo_acesso:
              dates.at(-1)
                ?.toISOString() ||
              null,

            quantidade_acessos:
              r.acessos.length,

            modulos_concluidos:
              modulos,

            progresso_percentual:
              Math.round(
                (
                  modulos /
                  TOTAL_MODULOS
                ) *
                100
              ),

            certificado_emitido:
              certificado,

            certificado_em:
              null,

            codigo_certificado:
              ""
          };

        }
      )
      .sort(
        (a, b) =>
          (
            new Date(
              b.ultimo_acesso ||
              0
            )
          ) -
          (
            new Date(
              a.ultimo_acesso ||
              0
            )
          )
      );
  }


  function aplicarFiltros() {

    const busca =
      (
        document
          .querySelector(
            "#adminBusca"
          )
          ?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const cert =
      document
        .querySelector(
          "#adminCertificado"
        )
        ?.value ||
      "";


    const inicio =
      document
        .querySelector(
          "#adminDataInicio"
        )
        ?.value ||
      "";


    const fim =
      document
        .querySelector(
          "#adminDataFim"
        )
        ?.value ||
      "";


    filtrado =
      relatorio
        .filter(
          r => {

            const texto =
              (
                r.nome +
                " " +
                r.email
              )
                .toLowerCase();


            if (
              busca &&
              !texto.includes(
                busca
              )
            ) {
              return false;
            }


            if (
              cert === "sim" &&
              !r.certificado_emitido
            ) {
              return false;
            }


            if (
              cert === "nao" &&
              r.certificado_emitido
            ) {
              return false;
            }


            if (inicio) {

              const di =
                new Date(
                  inicio +
                  "T00:00:00"
                );


              if (
                !r.ultimo_acesso ||
                new Date(
                  r.ultimo_acesso
                ) < di
              ) {
                return false;
              }

            }


            if (fim) {

              const df =
                new Date(
                  fim +
                  "T23:59:59"
                );


              if (
                !r.ultimo_acesso ||
                new Date(
                  r.ultimo_acesso
                ) > df
              ) {
                return false;
              }

            }


            return true;

          }
        );


    render();
  }


  function render() {

    const body =
      document
        .querySelector(
          "#adminTabelaBody"
        );


    const count =
      document
        .querySelector(
          "[data-admin-count]"
        );


    if (count) {
      count.textContent =
        filtrado.length;
    }


    if (!body) {
      return;
    }


    body.innerHTML =
      "";


    if (
      !filtrado.length
    ) {

      body.innerHTML = `
        <tr>
          <td
            colspan="9"
            class="admin-empty"
          >
            Nenhum acesso encontrado para os filtros selecionados.
          </td>
        </tr>
      `;

      return;
    }


    filtrado.forEach(
      r => {

        const tr =
          document
            .createElement(
              "tr"
            );


        tr.innerHTML = `
          <td>
            <strong>
              ${escapeHtml(
                r.nome
              )}
            </strong>

            <small>
              ${escapeHtml(
                r.email
              )}
            </small>
          </td>

          <td>
            ${fmtDate(
              r.primeiro_acesso
            )}
          </td>

          <td>
            ${fmtDate(
              r.ultimo_acesso
            )}
          </td>

          <td class="admin-number">
            ${r.quantidade_acessos}
          </td>

          <td>
            ${r.modulos_concluidos}/${TOTAL_MODULOS}
          </td>

          <td>

            <div
              class="admin-progress"
            >
              <span
                style="
                  width:
                  ${r.progresso_percentual}%
                "
              ></span>
            </div>

            <small>
              ${r.progresso_percentual}%
            </small>

          </td>

          <td>

            <span
              class="
                badge
                ${
                  r.certificado_emitido
                    ? "badge-ok"
                    : "badge-warn"
                }
              "
            >
              ${
                r.certificado_emitido
                  ? "Liberado"
                  : "Não liberado"
              }
            </span>

          </td>

          <td>
            —
          </td>

          <td>
            —
          </td>
        `;


        body.appendChild(
          tr
        );

      }
    );
  }


  function exportarCSV() {

    if (
      !filtrado.length
    ) {

      alert(
        "Não há dados para exportar."
      );

      return;
    }


    const header = [
      "Nome",
      "E-mail",
      "Primeiro acesso",
      "Último acesso",
      "Qtd. acessos",
      "Módulos concluídos",
      "Progresso",
      "Certificado"
    ];


    const rows =
      filtrado.map(
        r => [
          r.nome,
          r.email,
          fmtDate(
            r.primeiro_acesso
          ),
          fmtDate(
            r.ultimo_acesso
          ),
          r.quantidade_acessos,
          `${r.modulos_concluidos}/${TOTAL_MODULOS}`,
          `${r.progresso_percentual}%`,
          r.certificado_emitido
            ? "Liberado"
            : "Não liberado"
        ]
      );


    const csv =
      "\ufeff" +
      [
        header,
        ...rows
      ]
        .map(
          row =>
            row
              .map(csvCell)
              .join(";")
        )
        .join("\r\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const a =
      document
        .createElement(
          "a"
        );


    a.href = url;


    a.download =
      `relatorio-acessos-academia-${
        new Date()
          .toISOString()
          .slice(0, 10)
      }.csv`;


    document
      .body
      .appendChild(a);


    a.click();


    a.remove();


    URL.revokeObjectURL(
      url
    );
  }


  async function carregar() {

    const status =
      document
        .querySelector(
          "[data-admin-status]"
        );


    try {

      if (
        !window.sb
      ) {
        throw new Error(
          "Cliente Supabase não encontrado."
        );
      }


      const permitido =
        await window.Auth
          .requireAdmin();


      if (!permitido) {
        return;
      }


      if (status) {
        status.textContent =
          "Carregando relatório...";
      }


      /*
        Carregamos SOMENTE
        tabelas que existem hoje.
      */

      const [
        acessos,
        progressos
      ] =
        await Promise.all([
          fetchAll(
            "acessos_academia",
            "user_id,email,nome,origem,acessado_em"
          ),

          fetchAll(
            "progresso_modulos",
            "user_id,modulo_id,concluido,concluido_em"
          )
        ]);


      console.log(
        "Acessos:",
        acessos.length
      );


      console.log(
        "Progressos:",
        progressos.length
      );


      relatorio =
        construirResumo(
          acessos,
          progressos
        );


      filtrado =
        [
          ...relatorio
        ];


      render();


      if (status) {

        status.textContent =
          `${acessos.length} acessos registrados desde a ativação do relatório.`;

      }


    } catch (error) {

      console.error(
        "Erro no relatório administrativo:",
        error
      );


      if (status) {

        status.textContent =
          "Erro ao carregar relatório: " +
          (
            error?.message ||
            "erro desconhecido"
          );

      }


      const body =
        document
          .querySelector(
            "#adminTabelaBody"
          );


      if (body) {

        body.innerHTML = `
          <tr>
            <td
              colspan="9"
              class="admin-empty"
            >
              Não foi possível carregar os dados.
            </td>
          </tr>
        `;

      }

    }
  }


  document.addEventListener(
    "DOMContentLoaded",
    () => {

      document
        .querySelector(
          "#adminBusca"
        )
        ?.addEventListener(
          "input",
          aplicarFiltros
        );


      document
        .querySelector(
          "#adminCertificado"
        )
        ?.addEventListener(
          "change",
          aplicarFiltros
        );


      document
        .querySelector(
          "#adminDataInicio"
        )
        ?.addEventListener(
          "change",
          aplicarFiltros
        );


      document
        .querySelector(
          "#adminDataFim"
        )
        ?.addEventListener(
          "change",
          aplicarFiltros
        );


      document
        .querySelector(
          "[data-admin-export]"
        )
        ?.addEventListener(
          "click",
          exportarCSV
        );


      document
        .querySelector(
          "[data-admin-refresh]"
        )
        ?.addEventListener(
          "click",
          carregar
        );


      carregar();

    }
  );

})();