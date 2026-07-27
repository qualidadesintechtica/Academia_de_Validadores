// Academia dos Validadores — Dados da Trilha de Aprendizagem
const TRILHA = {
  modulos: [
    {
      id: 1,
      titulo: "Introdução à Validação Acadêmica",
      descricao: "Fundamentos do processo de validação e qualidade acadêmica no ecossistema Ânima.",
      icone: "🎓",
      xp: 100,
      duracao: "45 min",
      nivel: "Iniciante",
      cor: "#6C63FF",
      status: "disponivel",
      quiz: [
        {
          pergunta: "O que é validação acadêmica?",
          opcoes: [
            "Processo de verificação da qualidade e conformidade do conteúdo educacional",
            "Sistema de notas dos alunos",
            "Método de avaliação de professores",
            "Ferramenta de gestão financeira"
          ],
          correta: 0,
          explicacao: "A validação acadêmica é o processo sistemático de verificação da qualidade, conformidade e adequação do conteúdo educacional aos padrões estabelecidos."
        },
        {
          pergunta: "Qual é o principal objetivo do ecossistema Ânima?",
          opcoes: [
            "Maximizar lucros institucionais",
            "Promover qualidade acadêmica digital com excelência",
            "Reduzir custos operacionais",
            "Aumentar o número de matrículas"
          ],
          correta: 1,
          explicacao: "O ecossistema Ânima tem como missão central promover a qualidade acadêmica digital, garantindo excelência no ensino superior."
        },
        {
          pergunta: "Quem são os Validadores?",
          opcoes: [
            "Alunos que revisam provas",
            "Profissionais especializados que garantem a qualidade do conteúdo acadêmico",
            "Gestores financeiros",
            "Técnicos de TI"
          ],
          correta: 1,
          explicacao: "Os Validadores são profissionais especializados responsáveis por garantir que o conteúdo acadêmico atenda aos mais altos padrões de qualidade."
        },
        {
          pergunta: "Qual documento orienta o processo de validação?",
          opcoes: [
            "Manual do Aluno",
            "Regulamento Acadêmico",
            "Guia de Validação Sintechtica",
            "Código de Ética"
          ],
          correta: 2,
          explicacao: "O Guia de Validação Sintechtica é o documento central que orienta todos os processos de validação acadêmica."
        },
        {
          pergunta: "Qual é a frequência recomendada de validações?",
          opcoes: [
            "Anual",
            "Semestral",
            "Contínua e sistemática",
            "Apenas quando solicitado"
          ],
          correta: 2,
          explicacao: "A validação deve ser um processo contínuo e sistemático, não apenas pontual, para garantir a qualidade permanente do conteúdo."
        }
      ]
    },
    {
      id: 2,
      titulo: "Fluxo de Trabalho do Validador",
      descricao: "Entenda o fluxo completo de trabalho, etapas e responsabilidades do validador.",
      icone: "🔄",
      xp: 120,
      duracao: "50 min",
      nivel: "Iniciante",
      cor: "#FF6584",
      status: "disponivel",
      quiz: [
        {
          pergunta: "Qual é a primeira etapa do fluxo de validação?",
          opcoes: [
            "Aprovação final",
            "Recebimento e triagem do material",
            "Publicação do conteúdo",
            "Feedback ao autor"
          ],
          correta: 1,
          explicacao: "O fluxo de validação começa com o recebimento e triagem do material, onde se verifica se está completo e pronto para análise."
        },
        {
          pergunta: "O que deve ser verificado na análise de conteúdo?",
          opcoes: [
            "Apenas a formatação visual",
            "Somente a gramática",
            "Precisão, relevância, atualidade e conformidade pedagógica",
            "Apenas o número de páginas"
          ],
          correta: 2,
          explicacao: "A análise de conteúdo deve abranger precisão das informações, relevância para o público-alvo, atualidade e conformidade com os princípios pedagógicos."
        },
        {
          pergunta: "Como deve ser registrado o processo de validação?",
          opcoes: [
            "Verbalmente para o gestor",
            "Em planilha padronizada com todos os critérios avaliados",
            "Apenas com aprovação ou reprovação",
            "Por e-mail informal"
          ],
          correta: 1,
          explicacao: "Todo processo de validação deve ser documentado em planilha padronizada, registrando cada critério avaliado para rastreabilidade."
        },
        {
          pergunta: "Qual o prazo máximo para retorno de uma validação?",
          opcoes: [
            "30 dias úteis",
            "Sem prazo definido",
            "Conforme SLA estabelecido no projeto",
            "1 ano"
          ],
          correta: 2,
          explicacao: "O prazo de retorno deve seguir o SLA (Service Level Agreement) estabelecido para cada projeto específico."
        },
        {
          pergunta: "O que fazer quando há divergência entre validadores?",
          opcoes: [
            "O mais experiente decide sozinho",
            "Ignorar a divergência",
            "Escalar para o coordenador com justificativas documentadas",
            "Aprovar automaticamente"
          ],
          correta: 2,
          explicacao: "Divergências devem ser escaladas ao coordenador com todas as justificativas documentadas para uma decisão fundamentada."
        }
      ]
    },
    {
      id: 3,
      titulo: "Planilha de Validação",
      descricao: "Domine o uso da planilha oficial de validação: preenchimento, critérios e boas práticas.",
      icone: "📊",
      xp: 150,
      duracao: "60 min",
      nivel: "Intermediário",
      cor: "#43E97B",
      status: "disponivel",
      quiz: [
        {
          pergunta: "Quantas abas principais possui a planilha de validação?",
          opcoes: ["2", "3", "5", "7"],
          correta: 2,
          explicacao: "A planilha oficial possui 5 abas principais: Triagem, Análise de Conteúdo, Análise Técnica, Feedback e Relatório Final."
        },
        {
          pergunta: "Como deve ser preenchida a coluna de 'Criticidade'?",
          opcoes: [
            "Sempre como Alta",
            "Com valores: Baixa, Média, Alta ou Crítica conforme impacto",
            "Deixar em branco",
            "Com números de 1 a 10"
          ],
          correta: 1,
          explicacao: "A criticidade deve refletir o real impacto do problema: Baixa (estética), Média (clareza), Alta (precisão) ou Crítica (erro grave)."
        },
        {
          pergunta: "O que deve constar no campo 'Evidência'?",
          opcoes: [
            "Opinião pessoal do validador",
            "Referência exata (página, slide, timestamp) onde o problema foi identificado",
            "Nome do autor do material",
            "Data de criação"
          ],
          correta: 1,
          explicacao: "O campo Evidência deve conter a referência exata e rastreável de onde o problema foi encontrado, facilitando a correção."
        },
        {
          pergunta: "Qual fórmula calcula o índice de qualidade geral?",
          opcoes: [
            "Soma de todos os critérios",
            "Média ponderada dos critérios por peso de importância",
            "Maior nota entre os critérios",
            "Contagem de aprovações"
          ],
          correta: 1,
          explicacao: "O índice de qualidade é calculado pela média ponderada, onde cada critério tem um peso específico conforme sua importância."
        },
        {
          pergunta: "Quando um material deve ser reprovado automaticamente?",
          opcoes: [
            "Quando tiver qualquer erro",
            "Quando o índice for abaixo de 90%",
            "Quando houver pelo menos um item classificado como Crítico",
            "Quando o autor não responder em 24h"
          ],
          correta: 2,
          explicacao: "A presença de qualquer item Crítico resulta em reprovação automática, independentemente da pontuação geral, pois representa risco à qualidade acadêmica."
        }
      ]
    },
    {
      id: 4,
      titulo: "Critérios de Qualidade",
      descricao: "Aprenda os critérios técnicos e pedagógicos que definem a excelência do conteúdo.",
      icone: "⭐",
      xp: 180,
      duracao: "65 min",
      nivel: "Intermediário",
      cor: "#FA8231",
      status: "bloqueado",
      quiz: [
        {
          pergunta: "Qual é o critério mais importante na validação pedagógica?",
          opcoes: [
            "Formatação visual",
            "Alinhamento com os objetivos de aprendizagem",
            "Quantidade de páginas",
            "Número de imagens"
          ],
          correta: 1,
          explicacao: "O alinhamento com os objetivos de aprendizagem é o critério central, pois garante que o conteúdo realmente desenvolva as competências esperadas."
        },
        {
          pergunta: "O que é 'coerência vertical' no conteúdo?",
          opcoes: [
            "Alinhamento entre títulos e subtítulos",
            "Progressão lógica do simples ao complexo ao longo da disciplina",
            "Formatação de parágrafos",
            "Tamanho das fontes"
          ],
          correta: 1,
          explicacao: "Coerência vertical é a progressão lógica e gradual do conteúdo, do mais simples ao mais complexo, ao longo de toda a disciplina."
        },
        {
          pergunta: "Como avaliar a adequação do nível de linguagem?",
          opcoes: [
            "Verificar se usa palavras difíceis",
            "Comparar com o perfil do público-alvo e nível do curso",
            "Contar o número de termos técnicos",
            "Verificar apenas a gramática"
          ],
          correta: 1,
          explicacao: "A linguagem deve ser avaliada em relação ao perfil do público-alvo e ao nível do curso, sendo nem muito simples nem excessivamente complexa."
        },
        {
          pergunta: "Qual é o peso do critério 'Atualidade' na avaliação?",
          opcoes: ["5%", "10%", "20%", "Depende da área do conhecimento"],
          correta: 3,
          explicacao: "O peso do critério de Atualidade varia conforme a área: em tecnologia e medicina tem peso maior; em humanidades e filosofia pode ser menor."
        },
        {
          pergunta: "O que caracteriza um 'erro factual crítico'?",
          opcoes: [
            "Erro de digitação",
            "Informação incorreta que pode causar dano ao aprendizado ou à prática profissional",
            "Imagem desalinhada",
            "Referência bibliográfica incompleta"
          ],
          correta: 1,
          explicacao: "Erro factual crítico é qualquer informação incorreta que possa comprometer o aprendizado ou levar o profissional a cometer erros em sua prática."
        }
      ]
    },
    {
      id: 5,
      titulo: "Feedback e Comunicação",
      descricao: "Técnicas eficazes para comunicar feedbacks construtivos aos autores de conteúdo.",
      icone: "💬",
      xp: 160,
      duracao: "55 min",
      nivel: "Intermediário",
      cor: "#A29BFE",
      status: "bloqueado",
      quiz: [
        {
          pergunta: "Qual é a estrutura ideal de um feedback de validação?",
          opcoes: [
            "Apenas listar os erros encontrados",
            "Contexto + Problema + Impacto + Sugestão de melhoria",
            "Aprovado ou Reprovado",
            "Nota numérica sem comentários"
          ],
          correta: 1,
          explicacao: "Um feedback eficaz deve contextualizar o problema, descrever o impacto e oferecer sugestão construtiva de melhoria."
        },
        {
          pergunta: "Como deve ser o tom do feedback ao autor?",
          opcoes: [
            "Crítico e direto para economizar tempo",
            "Profissional, respeitoso e construtivo",
            "Informal e amigável",
            "Técnico e impessoal"
          ],
          correta: 1,
          explicacao: "O feedback deve ser sempre profissional, respeitoso e construtivo, focando na melhoria do conteúdo e não na crítica pessoal."
        },
        {
          pergunta: "Quando usar comunicação síncrona vs assíncrona?",
          opcoes: [
            "Sempre usar e-mail",
            "Sempre usar reunião",
            "Síncrona para questões complexas/urgentes; assíncrona para registros formais",
            "Depende da preferência pessoal"
          ],
          correta: 2,
          explicacao: "Questões complexas ou urgentes se beneficiam de comunicação síncrona (reunião/call); registros formais e não urgentes devem ser assíncronos."
        },
        {
          pergunta: "O que fazer quando o autor discorda do feedback?",
          opcoes: [
            "Manter a posição sem discussão",
            "Ceder imediatamente para evitar conflito",
            "Ouvir a argumentação, avaliar com critério e documentar a decisão final",
            "Escalar imediatamente para a diretoria"
          ],
          correta: 2,
          explicacao: "Discordâncias devem ser tratadas com abertura para ouvir, avaliação criteriosa dos argumentos e documentação transparente da decisão."
        },
        {
          pergunta: "Qual é o prazo recomendado para resposta ao autor após envio do feedback?",
          opcoes: [
            "Sem prazo definido",
            "Confirmar recebimento em até 24h úteis",
            "Apenas quando o autor perguntar",
            "30 dias"
          ],
          correta: 1,
          explicacao: "Boas práticas indicam confirmar o recebimento do feedback em até 24 horas úteis, demonstrando profissionalismo e respeito ao autor."
        }
      ]
    },
    {
      id: 6,
      titulo: "Validação de Mídias e Recursos",
      descricao: "Como validar vídeos, podcasts, infográficos e outros recursos multimídia.",
      icone: "🎬",
      xp: 200,
      duracao: "70 min",
      nivel: "Avançado",
      cor: "#FD79A8",
      status: "bloqueado",
      quiz: [
        {
          pergunta: "Qual aspecto técnico é prioritário na validação de vídeos?",
          opcoes: [
            "Duração exata",
            "Qualidade de áudio e legibilidade das legendas",
            "Número de cortes",
            "Presença de música de fundo"
          ],
          correta: 1,
          explicacao: "A qualidade do áudio e a legibilidade das legendas são prioritárias pois afetam diretamente a acessibilidade e compreensão do conteúdo."
        },
        {
          pergunta: "O que verificar em infográficos educacionais?",
          opcoes: [
            "Apenas as cores utilizadas",
            "Precisão das informações, hierarquia visual e acessibilidade",
            "Somente o tamanho do arquivo",
            "Apenas a fonte tipográfica"
          ],
          correta: 1,
          explicacao: "Infográficos devem ter informações precisas, hierarquia visual clara e ser acessíveis, incluindo texto alternativo e contraste adequado."
        },
        {
          pergunta: "Qual padrão de acessibilidade deve ser seguido?",
          opcoes: ["ABNT NBR 9050", "WCAG 2.1 nível AA", "ISO 9001", "MEC 2023"],
          correta: 1,
          explicacao: "O padrão WCAG 2.1 nível AA é o referencial internacional para acessibilidade digital em conteúdo educacional."
        },
        {
          pergunta: "Como validar podcasts educacionais?",
          opcoes: [
            "Apenas verificar a duração",
            "Avaliar clareza, precisão do conteúdo, qualidade técnica e transcrição",
            "Somente ouvir os primeiros 5 minutos",
            "Verificar apenas a capa"
          ],
          correta: 1,
          explicacao: "Podcasts devem ser avaliados integralmente: clareza da fala, precisão do conteúdo, qualidade técnica do áudio e disponibilidade de transcrição."
        },
        {
          pergunta: "Qual é o limite máximo recomendado para vídeos de aula?",
          opcoes: [
            "5 minutos",
            "30 minutos",
            "Entre 8 e 15 minutos por unidade de conteúdo",
            "Sem limite"
          ],
          correta: 2,
          explicacao: "Pesquisas em neurociência da aprendizagem indicam que vídeos entre 8 e 15 minutos maximizam a retenção e o engajamento dos estudantes."
        }
      ]
    },
    {
      id: 7,
      titulo: "Gestão de Projetos de Validação",
      descricao: "Gerencie múltiplos projetos, prazos e equipes com eficiência e qualidade.",
      icone: "📋",
      xp: 220,
      duracao: "75 min",
      nivel: "Avançado",
      cor: "#00B894",
      status: "bloqueado",
      quiz: [
        {
          pergunta: "Qual metodologia é mais adequada para gestão de validações?",
          opcoes: [
            "Waterfall puro",
            "Ágil adaptado com sprints de validação",
            "Sem metodologia definida",
            "Apenas reuniões semanais"
          ],
          correta: 1,
          explicacao: "Uma abordagem ágil adaptada, com sprints de validação, permite flexibilidade para ajustes enquanto mantém ritmo e previsibilidade."
        },
        {
          pergunta: "Como priorizar materiais quando há múltiplos projetos simultâneos?",
          opcoes: [
            "Por ordem de chegada sempre",
            "Por impacto no aluno, prazo de publicação e criticidade do conteúdo",
            "Pelo tamanho do arquivo",
            "Pela preferência do validador"
          ],
          correta: 1,
          explicacao: "A priorização deve considerar o impacto no aluno, o prazo de publicação e a criticidade do conteúdo para otimizar o valor entregue."
        },
        {
          pergunta: "O que é um 'buffer de qualidade' no planejamento?",
          opcoes: [
            "Tempo extra para reuniões",
            "Reserva de tempo para retrabalho e ajustes imprevistos",
            "Arquivo de backup",
            "Lista de espera"
          ],
          correta: 1,
          explicacao: "Buffer de qualidade é uma reserva de tempo planejada para absorver retrabalho e ajustes, garantindo a entrega sem comprometer a qualidade."
        },
        {
          pergunta: "Como medir a produtividade de uma equipe de validação?",
          opcoes: [
            "Apenas pela quantidade de materiais aprovados",
            "Por métricas balanceadas: volume, qualidade, prazo e satisfação",
            "Pelo número de horas trabalhadas",
            "Pela quantidade de reuniões realizadas"
          ],
          correta: 1,
          explicacao: "A produtividade deve ser medida por métricas balanceadas que incluam volume, qualidade das validações, cumprimento de prazos e satisfação dos autores."
        },
        {
          pergunta: "Qual ferramenta é recomendada para rastreamento de validações?",
          opcoes: [
            "Apenas e-mail",
            "Sistema integrado com dashboard, histórico e alertas automáticos",
            "Caderno físico",
            "Memória do validador"
          ],
          correta: 1,
          explicacao: "Um sistema integrado com dashboard, histórico completo e alertas automáticos garante rastreabilidade, transparência e eficiência no processo."
        }
      ]
    },
    {
      id: 8,
      titulo: "Excelência e Inovação na Validação",
      descricao: "Práticas avançadas, tendências e o futuro da validação acadêmica digital.",
      icone: "🚀",
      xp: 250,
      duracao: "80 min",
      nivel: "Expert",
      cor: "#6C63FF",
      status: "bloqueado",
      quiz: [
        {
          pergunta: "Como a IA pode apoiar o processo de validação?",
          opcoes: [
            "Substituir completamente os validadores humanos",
            "Automatizar verificações de conformidade, liberando validadores para análise crítica",
            "Apenas gerar relatórios",
            "A IA não tem aplicação na validação"
          ],
          correta: 1,
          explicacao: "A IA pode automatizar verificações repetitivas de conformidade, liberando os validadores para análise crítica e julgamento pedagógico de alto nível."
        },
        {
          pergunta: "O que é 'validação preditiva'?",
          opcoes: [
            "Validar conteúdo futuro",
            "Usar dados históricos para antecipar problemas comuns antes da revisão",
            "Prever o desempenho dos alunos",
            "Validar previsões financeiras"
          ],
          correta: 1,
          explicacao: "Validação preditiva usa dados históricos de validações anteriores para identificar padrões de problemas e antecipar pontos de atenção."
        },
        {
          pergunta: "Qual é a tendência mais relevante para o futuro da validação?",
          opcoes: [
            "Menos validação para reduzir custos",
            "Validação contínua integrada ao processo de criação",
            "Validação apenas no lançamento",
            "Terceirização total"
          ],
          correta: 1,
          explicacao: "A tendência é integrar a validação ao próprio processo de criação, tornando-a contínua e preventiva em vez de corretiva."
        },
        {
          pergunta: "Como construir uma cultura de qualidade na equipe?",
          opcoes: [
            "Apenas com punições por erros",
            "Com reconhecimento, aprendizado contínuo e melhoria colaborativa",
            "Ignorando feedbacks negativos",
            "Com regras rígidas sem flexibilidade"
          ],
          correta: 1,
          explicacao: "Uma cultura de qualidade se constrói com reconhecimento de boas práticas, aprendizado contínuo com os erros e melhoria colaborativa."
        },
        {
          pergunta: "O que diferencia um validador expert de um intermediário?",
          opcoes: [
            "Velocidade de validação",
            "Visão sistêmica, julgamento crítico e capacidade de desenvolver outros validadores",
            "Quantidade de materiais validados",
            "Anos de experiência apenas"
          ],
          correta: 1,
          explicacao: "O validador expert se distingue pela visão sistêmica do processo, julgamento crítico apurado e capacidade de multiplicar conhecimento na equipe."
        }
      ]
    }
  ],

  niveis: [
    { nivel: 1, titulo: "Aprendiz", xpMin: 0, xpMax: 299, cor: "#95A5A6" },
    { nivel: 2, titulo: "Iniciante", xpMin: 300, xpMax: 699, cor: "#27AE60" },
    { nivel: 3, titulo: "Praticante", xpMin: 700, xpMax: 1299, cor: "#2980B9" },
    { nivel: 4, titulo: "Validador", xpMin: 1300, xpMax: 2199, cor: "#8E44AD" },
    { nivel: 5, titulo: "Especialista", xpMin: 2200, xpMax: 3499, cor: "#E67E22" },
    { nivel: 6, titulo: "Mestre", xpMin: 3500, xpMax: 4999, cor: "#E74C3C" },
    { nivel: 7, titulo: "Guardião da Qualidade", xpMin: 5000, xpMax: 999999, cor: "#F39C12" }
  ],

  medalhas: [
    { id: "primeiro_passo", titulo: "Primeiro Passo", descricao: "Completou o primeiro módulo", icone: "👣", xp: 50 },
    { id: "dedicado", titulo: "Dedicado", descricao: "7 dias consecutivos de estudo", icone: "🔥", xp: 100 },
    { id: "perfeccionista", titulo: "Perfeccionista", descricao: "100% em 3 quizzes seguidos", icone: "💎", xp: 150 },
    { id: "explorador", titulo: "Explorador", descricao: "Completou 4 módulos", icone: "🗺️", xp: 200 },
    { id: "mestre_quiz", titulo: "Mestre do Quiz", descricao: "100% em todos os quizzes", icone: "🏆", xp: 300 },
    { id: "trilha_completa", titulo: "Trilha Completa", descricao: "Completou todos os 8 módulos", icone: "🎯", xp: 500 },
    { id: "velocista", titulo: "Velocista", descricao: "Completou um módulo em menos de 30 min", icone: "⚡", xp: 75 },
    { id: "consistente", titulo: "Consistente", descricao: "30 dias consecutivos de estudo", icone: "🌟", xp: 400 }
  ]
};

// Estado do usuário (simulado — em produção viria do backend)
const USUARIO = {
  nome: "Validador",
  email: "validador@anima.com.br",
  avatar: null,
  xp: 0,
  xpTotal: 0,
  nivel: 1,
  sequencia: 0,
  modulosCompletos: [],
  medalhasObtidas: [],
  quizResultados: {},
  ultimoAcesso: new Date().toISOString()
};

// Carregar estado do localStorage
function carregarEstado() {
  const salvo = localStorage.getItem("academia_validadores_estado");
  if (salvo) {
    const dados = JSON.parse(salvo);
    Object.assign(USUARIO, dados);
  }
  return USUARIO;
}

// Salvar estado no localStorage
function salvarEstado() {
  localStorage.setItem("academia_validadores_estado", JSON.stringify(USUARIO));
}

// Calcular nível baseado no XP
function calcularNivel(xp) {
  for (let i = TRILHA.niveis.length - 1; i >= 0; i--) {
    if (xp >= TRILHA.niveis[i].xpMin) {
      return TRILHA.niveis[i];
    }
  }
  return TRILHA.niveis[0];
}

// Adicionar XP ao usuário
function adicionarXP(quantidade) {
  USUARIO.xp += quantidade;
  USUARIO.xpTotal += quantidade;
  const novoNivel = calcularNivel(USUARIO.xp);
  USUARIO.nivel = novoNivel.nivel;
  salvarEstado();
  return novoNivel;
}

// Verificar e conceder medalhas
function verificarMedalhas() {
  const novasMedalhas = [];

  const checar = (id, condicao) => {
    if (condicao && !USUARIO.medalhasObtidas.includes(id)) {
      USUARIO.medalhasObtidas.push(id);
      novasMedalhas.push(id);
    }
  };

  checar("primeiro_passo",  USUARIO.modulosCompletos.length >= 1);
  checar("explorador",      USUARIO.modulosCompletos.length >= 4);
  checar("trilha_completa", USUARIO.modulosCompletos.length >= 8);
  checar("dedicado",        (USUARIO.sequencia || 0) >= 7);
  checar("consistente",     (USUARIO.sequencia || 0) >= 30);

  const resultados = Object.values(USUARIO.quizResultados || {});
  const perfeitos  = resultados.filter(r => r.percentual === 100).length;
  checar("perfeccionista",  perfeitos >= 3);
  checar("mestre_quiz",     perfeitos >= 8);

  salvarEstado();
  return novasMedalhas;
}

// Exportar para uso global
if (typeof module !== "undefined") {
  module.exports = { TRILHA, USUARIO, carregarEstado, salvarEstado, calcularNivel, adicionarXP, verificarMedalhas };
}
