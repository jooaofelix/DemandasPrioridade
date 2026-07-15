import { todayId } from "@/store/dailyPlanStore";
import { useTaskStore } from "@/store/taskStore";

export function CompletedTodayStrip() {
  const tasks = useTaskStore((s) => s.tasks);
  const todayStart = new Date(`${todayId()}T00:00:00`).getTime();
  const completedToday = tasks.filter((t) => t.completedAt != null && t.completedAt >= todayStart);

  if (completedToday.length === 0) return null;

  return (
    <details className="rounded-control border border-border bg-surface-raised px-4 py-3 text-sm">
      <summary className="cursor-pointer font-medium text-ink-muted">
        {completedToday.length === 1 ? "1 tarefa concluída hoje" : `${completedToday.length} tarefas concluídas hoje`}
      </summary>
      <ul className="mt-2 flex flex-col gap-1">
        {completedToday.map((t) => (
          <li key={t.id} className="text-ink-faint line-through">
            {t.title}
          </li>
        ))}
      </ul>
    </details>
  );
}
