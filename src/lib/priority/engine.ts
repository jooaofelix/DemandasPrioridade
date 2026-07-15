import type { EnergyLevel, PriorityContext, PriorityReason, PriorityResult, Task } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pesos internos. Nunca exibidos ao usuário — apenas os `reasons` (frases simples)
 * chegam à interface. Os valores foram escolhidos para que urgência real (atraso)
 * sempre vença fatores secundários, sem tornar o restante irrelevante.
 */
const WEIGHTS = {
  overdue: 60,
  dueSoon: 40,
  unblocksOthers: 25,
  importanceHigh: 20,
  importanceMedium: 10,
  matchesEnergy: 15,
  quickWin: 10,
  stalledLong: 12,
  consequenceHigh: 15,
  consequenceMedium: 7,
  manualPin: 10_000,
  energyMismatchPenalty: -20,
  busyDayLongTaskPenalty: -10,
  blockedByDependencyPenalty: -5_000
} as const;

const STALLED_THRESHOLD_MS = 3 * DAY_MS;
const DUE_SOON_WINDOW_MS = DAY_MS;
const QUICK_WIN_MINUTES = 15;
const BUSY_DAY_LONG_TASK_MINUTES = 45;

const ELIGIBLE_STATUSES = new Set<Task["status"]>(["inbox", "planned", "active"]);

function isBlockedByIncompleteDependency(task: Task, byId: Map<string, Task>): boolean {
  return task.dependsOnTaskIds.some((depId) => {
    const dep = byId.get(depId);
    return dep != null && dep.status !== "done" && dep.status !== "cancelled";
  });
}

function isBlockingOtherTasks(task: Task, allTasks: Task[]): boolean {
  if (task.isBlockingOtherTasks) return true;
  return allTasks.some(
    (other) => other.id !== task.id && other.dependsOnTaskIds.includes(task.id) && other.status !== "done"
  );
}

function energyMatch(required: EnergyLevel | null, available: EnergyLevel | null): "match" | "mismatch" | "unknown" {
  if (!required || !available) return "unknown";
  if (required === available) return "match";
  const order: EnergyLevel[] = ["low", "medium", "high"];
  const gap = Math.abs(order.indexOf(required) - order.indexOf(available));
  // Energia disponível bem abaixo da exigida é o único caso penalizado;
  // ter mais energia do que a tarefa exige nunca é um problema.
  if (order.indexOf(available) < order.indexOf(required) && gap >= 1) return "mismatch";
  return "unknown";
}

export function scoreTask(
  task: Task,
  ctx: PriorityContext,
  byId: Map<string, Task>
): { score: number; reasons: PriorityReason[]; blocked: boolean } {
  const reasons: PriorityReason[] = [];
  let score = 0;

  const blocked = isBlockedByIncompleteDependency(task, byId);
  if (blocked) {
    score += WEIGHTS.blockedByDependencyPenalty;
  }

  if (task.manualPriorityPin) {
    score += WEIGHTS.manualPin;
    reasons.push({ key: "manual_pin", label: "Você fixou esta prioridade." });
  }

  if (task.dueAt != null) {
    if (task.dueAt <= ctx.now) {
      score += WEIGHTS.overdue;
      reasons.push({ key: "overdue", label: "O prazo já passou." });
    } else if (task.dueAt - ctx.now <= DUE_SOON_WINDOW_MS) {
      score += WEIGHTS.dueSoon;
      reasons.push({ key: "due_soon", label: "Prazo próximo." });
    }
  }

  if (isBlockingOtherTasks(task, ctx.allTasks)) {
    score += WEIGHTS.unblocksOthers;
    reasons.push({ key: "unblocks_others", label: "Desbloqueia outras demandas." });
  }

  if (task.importance === "high") {
    score += WEIGHTS.importanceHigh;
    reasons.push({ key: "marked_important", label: "Você marcou como importante." });
  } else if (task.importance === "medium") {
    score += WEIGHTS.importanceMedium;
  }

  if (task.consequenceIfSkipped === "high") {
    score += WEIGHTS.consequenceHigh;
  } else if (task.consequenceIfSkipped === "medium") {
    score += WEIGHTS.consequenceMedium;
  } else if (task.consequenceIfSkipped === "low" && task.importance !== "high") {
    reasons.push({ key: "easily_reschedulable", label: "Pode ser reagendada sem grande impacto." });
  }

  const match = energyMatch(task.energyRequired, ctx.currentEnergy);
  if (match === "match") {
    score += WEIGHTS.matchesEnergy;
    reasons.push({ key: "matches_energy", label: "Combina com sua energia atual." });
  } else if (match === "mismatch") {
    score += WEIGHTS.energyMismatchPenalty;
  }

  if (task.estimatedMinutes != null && task.estimatedMinutes <= QUICK_WIN_MINUTES) {
    score += WEIGHTS.quickWin;
    reasons.push({ key: "quick_win", label: "É rápida e pode aliviar sua lista." });
  }

  if (ctx.hasScheduledCommitmentToday && task.estimatedMinutes != null && task.estimatedMinutes > BUSY_DAY_LONG_TASK_MINUTES) {
    score += WEIGHTS.busyDayLongTaskPenalty;
  }

  if (ctx.now - task.lastTouchedAt >= STALLED_THRESHOLD_MS) {
    score += WEIGHTS.stalledLong;
    reasons.push({ key: "stalled_long", label: "Está parada há alguns dias." });
  }

  return { score, reasons: reasons.slice(0, 3), blocked };
}

/**
 * Ordena as tarefas elegíveis por prioridade. Tarefas concluídas, canceladas,
 * arquivadas ou bloqueadas por uma dependência incompleta nunca aparecem no topo.
 */
export function rankTasks(ctx: PriorityContext): PriorityResult[] {
  const byId = new Map(ctx.allTasks.map((t) => [t.id, t]));
  const eligible = ctx.allTasks.filter(
    (t) => ELIGIBLE_STATUSES.has(t.status) && !t.archivedAt && !t.deletedAt
  );

  const results: PriorityResult[] = eligible.map((task) => {
    const { score, reasons } = scoreTask(task, ctx, byId);
    return { task, score, reasons };
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.task.dueAt != null && b.task.dueAt != null) return a.task.dueAt - b.task.dueAt;
    if (a.task.dueAt != null) return -1;
    if (b.task.dueAt != null) return 1;
    return a.task.createdAt - b.task.createdAt;
  });

  return results;
}

/** Sugestão para a tela Agora: uma principal + no máximo `maxSecondary` secundárias. */
export function selectAgoraPriorities(
  ctx: PriorityContext,
  maxSecondary: 1 | 2 = 2
): { main: PriorityResult | null; secondary: PriorityResult[] } {
  const ranked = rankTasks(ctx).filter((r) => r.score > WEIGHTS.blockedByDependencyPenalty / 2);
  const [main = null, ...rest] = ranked;
  return { main, secondary: rest.slice(0, maxSecondary) };
}
