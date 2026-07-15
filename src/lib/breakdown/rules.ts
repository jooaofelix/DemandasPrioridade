/**
 * Sugestões locais (sem IA) para o assistente "Quebrar em pedaços".
 * Cobrem os tipos de tarefa vaga mais comuns; o usuário sempre pode editar,
 * remover ou adicionar passos livremente.
 */
interface KeywordTemplate {
  keywords: string[];
  steps: string[];
}

const TEMPLATES: KeywordTemplate[] = [
  {
    keywords: ["trabalho da faculdade", "redação", "redacao", "monografia", "tcc", "artigo"],
    steps: [
      "Abrir o documento ou criar um novo",
      "Ler o enunciado ou tema com atenção",
      "Escrever três tópicos principais",
      "Pesquisar sobre o primeiro tópico",
      "Escrever o primeiro parágrafo"
    ]
  },
  {
    keywords: ["estudar", "prova", "revisar matéria", "revisar materia"],
    steps: [
      "Separar o material de estudo",
      "Escolher um único assunto para começar",
      "Ler ou assistir por 10 minutos",
      "Fazer um resumo curto do que foi visto"
    ]
  },
  {
    keywords: ["limpar", "organizar a casa", "arrumar a casa", "faxina"],
    steps: [
      "Escolher um único cômodo ou gaveta",
      "Separar em três pilhas: ficar, doar, jogar fora",
      "Guardar o que vai ficar",
      "Levar o que vai sair do cômodo até a porta"
    ]
  },
  {
    keywords: ["email", "e-mail", "responder mensagens", "caixa de entrada"],
    steps: [
      "Abrir a caixa de entrada",
      "Responder apenas a primeira mensagem pendente",
      "Decidir se as próximas precisam de resposta hoje"
    ]
  },
  {
    keywords: ["ligar para", "telefonar", "marcar consulta", "agendar"],
    steps: [
      "Separar o número ou contato necessário",
      "Escrever em uma frase o que precisa dizer",
      "Fazer a ligação"
    ]
  },
  {
    keywords: ["comprar", "compras", "mercado"],
    steps: ["Fazer uma lista curta do que falta", "Separar o que é essencial para hoje", "Ir até o local ou abrir o app"]
  },
  {
    keywords: ["relatório", "relatorio", "planilha", "apresentação", "apresentacao"],
    steps: [
      "Abrir o arquivo ou criar um novo",
      "Escrever a estrutura em tópicos",
      "Preencher a primeira seção",
      "Revisar o restante depois"
    ]
  }
];

const FALLBACK_STEPS = [
  "Reunir o que for necessário para começar",
  "Fazer a primeira parte, mesmo que incompleta",
  "Conferir o que ainda falta"
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function suggestStepsFromTitle(title: string): string[] {
  const normalized = normalize(title);
  const match = TEMPLATES.find((template) => template.keywords.some((kw) => normalized.includes(normalize(kw))));
  return match ? match.steps : FALLBACK_STEPS;
}

export interface BreakdownAnswers {
  definitionOfDone: string;
  firstMove: string;
  precondition: string;
}

/** Monta passos observáveis a partir das três perguntas do assistente. */
export function buildStepsFromAnswers(answers: BreakdownAnswers): string[] {
  const steps: string[] = [];
  const precondition = answers.precondition.trim();
  const firstMove = answers.firstMove.trim();
  const definitionOfDone = answers.definitionOfDone.trim();

  if (precondition) steps.push(precondition);
  if (firstMove) steps.push(firstMove);
  if (definitionOfDone) steps.push(`Conferir: ${definitionOfDone}`);

  return steps;
}
