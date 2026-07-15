import type { UnblockIntervention, UnblockObstacle } from "@/types";

export const OBSTACLE_LABELS: Record<UnblockObstacle, string> = {
  too_big: "Parece grande demais",
  dont_know_where: "Não sei por onde começar",
  boring: "Está chato",
  tired: "Estou cansado",
  anxious: "Estou ansioso ou desconfortável",
  distracted: "Estou distraído",
  missing_something: "Não tenho tudo o que preciso",
  cant_explain: "Não sei explicar"
};

export const INTERVENTION_LABELS: Record<UnblockIntervention, string> = {
  split_task: "Dividir a tarefa",
  minimal_version: "Fazer uma versão mínima",
  prepare_environment: "Preparar o ambiente",
  two_minutes: "Trabalhar por dois minutos",
  remove_distraction: "Remover uma distração",
  register_thought: "Registrar o pensamento que está travando",
  reschedule: "Agendar para um horário mais adequado",
  ask_for_help: "Pedir ajuda a alguém",
  identify_missing_item: "Identificar o material que está faltando"
};

const OBSTACLE_TO_INTERVENTION: Record<UnblockObstacle, UnblockIntervention> = {
  too_big: "split_task",
  dont_know_where: "minimal_version",
  boring: "two_minutes",
  tired: "reschedule",
  anxious: "register_thought",
  distracted: "remove_distraction",
  missing_something: "identify_missing_item",
  cant_explain: "ask_for_help"
};

export function interventionFor(obstacle: UnblockObstacle): UnblockIntervention {
  return OBSTACLE_TO_INTERVENTION[obstacle];
}

export function firstMovementExamples(intervention: UnblockIntervention, taskTitle: string): string[] {
  switch (intervention) {
    case "split_task":
      return ["Abrir um espaço para listar os passos", `Escrever o primeiro passo de "${taskTitle}"`];
    case "minimal_version":
      return ["Escrever qual seria a menor versão possível", "Fazer só essa menor versão"];
    case "prepare_environment":
      return ["Separar o material na mesa", "Fechar as abas que não são desta tarefa"];
    case "two_minutes":
      return ["Colocar um cronômetro de 2 minutos", "Fazer o que der nesse tempo"];
    case "remove_distraction":
      return ["Colocar o celular fora de vista", "Fechar uma aba ou aplicativo específico"];
    case "register_thought":
      return ["Escrever em uma frase o que está passando pela cabeça"];
    case "reschedule":
      return ["Escolher um horário mais realista para hoje ou amanhã"];
    case "ask_for_help":
      return ["Escrever uma mensagem curta pedindo ajuda ou uma opinião"];
    case "identify_missing_item":
      return ["Listar o que está faltando", "Separar o que já está disponível"];
    default:
      return ["Fazer o menor movimento possível agora"];
  }
}
