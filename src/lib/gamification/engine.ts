import type { AchievementKey } from "@/types";

/**
 * Regras de pontuação éticas: pontos por iniciar, dividir, replanejar e pedir
 * ajuda — não apenas por concluir. Não existe perda de pontos, sequência que
 * zera ou penalidade por ausência (seção 16 do produto).
 */
export type GamificationAction =
  | "start_task"
  | "split_task"
  | "reorganize_day"
  | "complete_task"
  | "ask_for_help"
  | "cancel_with_clarity"
  | "make_minimal_version"
  | "resume_after_break"
  | "respect_own_limit"
  | "use_focus_mode";

const ACTION_POINTS: Record<GamificationAction, number> = {
  start_task: 2,
  split_task: 1,
  reorganize_day: 1,
  complete_task: 3,
  ask_for_help: 2,
  cancel_with_clarity: 1,
  make_minimal_version: 2,
  resume_after_break: 2,
  respect_own_limit: 1,
  use_focus_mode: 1
};

export function pointsForAction(action: GamificationAction): number {
  return ACTION_POINTS[action];
}

export const ACTION_TO_ACHIEVEMENT: Partial<Record<GamificationAction, AchievementKey>> = {
  ask_for_help: "asked_for_help",
  cancel_with_clarity: "cancelled_with_clarity",
  make_minimal_version: "made_minimal_version",
  resume_after_break: "resumed_after_break",
  respect_own_limit: "respected_own_limit",
  split_task: "split_a_task",
  reorganize_day: "replanned_day",
  use_focus_mode: "used_focus_mode"
};

export interface EnvironmentStage {
  stage: number;
  title: string;
  threshold: number;
}

/** Evolução visual discreta de um ambiente (ex.: um jardim), sem elementos competitivos. */
export const ENVIRONMENT_STAGES: EnvironmentStage[] = [
  { stage: 0, title: "Terreno preparado", threshold: 0 },
  { stage: 1, title: "Primeiro broto", threshold: 15 },
  { stage: 2, title: "Muda crescendo", threshold: 40 },
  { stage: 3, title: "Jardim florescendo", threshold: 90 },
  { stage: 4, title: "Jardim maduro", threshold: 180 }
];

export function stageForPoints(points: number): EnvironmentStage {
  let current = ENVIRONMENT_STAGES[0];
  for (const stage of ENVIRONMENT_STAGES) {
    if (points >= stage.threshold) current = stage;
  }
  return current;
}

export function pointsToNextStage(points: number): number | null {
  const next = ENVIRONMENT_STAGES.find((stage) => stage.threshold > points);
  return next ? next.threshold - points : null;
}
