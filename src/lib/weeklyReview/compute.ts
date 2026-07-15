import type { Routine, Task } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export interface WeeklyReviewData {
  weekStart: string;
  weekEnd: string;
  completedCount: number;
  startedCount: number;
  mostPostponedTaskIds: string[];
  bestStartWindow: string | null;
  estimateAccuracyRatio: number | null;
  mostUsedRoutineIds: string[];
  removedOrDelegatedCount: number;
  insights: string[];
}

function isoDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function computeWeeklyReview(tasks: Task[], routines: Routine[], now: number = Date.now()): WeeklyReviewData {
  const weekStartMs = now - WEEK_MS;

  const completed = tasks.filter((t) => t.completedAt != null && t.completedAt >= weekStartMs);
  const started = tasks.filter((t) => t.status !== "inbox" && t.updatedAt >= weekStartMs);
  const cancelled = tasks.filter((t) => t.status === "cancelled" && t.archivedAt != null && t.archivedAt >= weekStartMs);

  const mostPostponed = [...tasks]
    .filter((t) => t.postponedCount >= 2)
    .sort((a, b) => b.postponedCount - a.postponedCount)
    .slice(0, 3)
    .map((t) => t.id);

  const startHours = completed
    .map((t) => (t.completedAt ? new Date(t.completedAt).getHours() : null))
    .filter((h): h is number => h != null);
  const bestStartWindow = startHours.length > 0 ? modeHourRange(startHours) : null;

  const withEstimates = tasks.filter((t) => t.estimatePrediction && t.actualReflection);
  const estimateAccuracyRatio =
    withEstimates.length > 0
      ? withEstimates.reduce((sum, t) => {
          const expected = t.estimatePrediction!.expectedMinutes;
          const actual = t.actualReflection!.actualMinutes;
          return sum + Math.min(actual, expected) / Math.max(actual, expected);
        }, 0) / withEstimates.length
      : null;

  const mostUsedRoutineIds = routines
    .filter((r) => r.lastRunDate && new Date(r.lastRunDate).getTime() >= weekStartMs)
    .map((r) => r.id);

  const quickTasksCompleted = completed.filter((t) => t.estimatedMinutes != null && t.estimatedMinutes <= 15);

  const insights: string[] = [];
  if (quickTasksCompleted.length >= 2 && completed.length > 0) {
    insights.push("Tarefas de até 15 minutos foram mais fáceis de iniciar.");
  }
  if (bestStartWindow) {
    insights.push(`Você costuma concluir tarefas ${bestStartWindow}.`);
  }
  mostPostponed.forEach((id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      insights.push(`"${task.title}" foi adiada ${task.postponedCount} vezes. Talvez precise ser dividida ou reconsiderada.`);
    }
  });
  if (completed.length === 0 && started.length > 0) {
    insights.push("Você voltou a mexer em algumas tarefas essa semana. Isso também é constância.");
  }

  return {
    weekStart: isoDate(weekStartMs),
    weekEnd: isoDate(now),
    completedCount: completed.length,
    startedCount: started.length,
    mostPostponedTaskIds: mostPostponed,
    bestStartWindow,
    estimateAccuracyRatio,
    mostUsedRoutineIds,
    removedOrDelegatedCount: cancelled.length,
    insights
  };
}

function modeHourRange(hours: number[]): string {
  const buckets: Record<string, number> = { manhã: 0, tarde: 0, noite: 0 };
  hours.forEach((h) => {
    if (h < 12) buckets["manhã"] += 1;
    else if (h < 18) buckets["tarde"] += 1;
    else buckets["noite"] += 1;
  });
  const [best] = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  return `mais pela ${best[0]}`;
}
