import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BreakdownAssistant } from "@/features/breakdown/BreakdownAssistant";
import { TaskDetailSheet } from "@/features/tasks/TaskDetailSheet";
import { UnblockFlow } from "@/features/unblock/UnblockFlow";
import { rankTasks, selectAgoraPriorities } from "@/lib/priority/engine";
import { useAuthStore } from "@/store/authStore";
import { useDailyPlanStore } from "@/store/dailyPlanStore";
import { useFocusStore } from "@/store/focusStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";
import type { PriorityResult, Task } from "@/types";
import { CompletedTodayStrip } from "./CompletedTodayStrip";
import { EnergySelector } from "./EnergySelector";
import { MainTaskCard } from "./MainTaskCard";
import { SecondaryTaskList } from "./SecondaryTaskList";
import { SwapPrioritySheet } from "./SwapPrioritySheet";

function formatNow(): string {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function AgoraScreen() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const tasks = useTaskStore((s) => s.tasks);
  const tasksLoaded = useTaskStore((s) => s.loaded);
  const dailyPlan = useDailyPlanStore((s) => s.today);
  const swapMainPriority = useDailyPlanStore((s) => s.swapMainPriority);
  const setNotNormalDay = useDailyPlanStore((s) => s.setNotNormalDay);
  const maxDailyPriorities = useAuthStore((s) => s.profile?.settings.maxDailyPriorities ?? 3);
  const startFocus = useFocusStore((s) => s.start);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const openCapture = useUiStore((s) => s.openCapture);
  const navigate = useNavigate();

  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);
  const [unblockTask, setUnblockTask] = useState<Task | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);

  const now = Date.now();

  const ranked = useMemo(
    () =>
      rankTasks({
        now,
        currentEnergy: dailyPlan?.energyLevel ?? null,
        hasScheduledCommitmentToday: dailyPlan?.hasScheduledCommitment ?? false,
        allTasks: tasks
      }),
    [tasks, dailyPlan?.energyLevel, dailyPlan?.hasScheduledCommitment, now]
  );

  const byId = useMemo(() => new Map(ranked.map((r) => [r.task.id, r])), [ranked]);

  const algorithmic = useMemo(
    () =>
      selectAgoraPriorities(
        {
          now,
          currentEnergy: dailyPlan?.energyLevel ?? null,
          hasScheduledCommitmentToday: dailyPlan?.hasScheduledCommitment ?? false,
          allTasks: tasks
        },
        maxDailyPriorities >= 2 ? 2 : 1
      ),
    [tasks, dailyPlan?.energyLevel, dailyPlan?.hasScheduledCommitment, maxDailyPriorities, now]
  );

  const notNormalDay = dailyPlan?.notNormalDay ?? false;

  const main: PriorityResult | null = dailyPlan?.mainPriorityTaskId
    ? (byId.get(dailyPlan.mainPriorityTaskId) ?? algorithmic.main)
    : algorithmic.main;

  const secondaryFromPlan = (dailyPlan?.secondaryTaskIds ?? [])
    .map((id) => byId.get(id))
    .filter((r): r is PriorityResult => r != null && r.task.id !== main?.task.id);

  const secondary = notNormalDay
    ? []
    : (secondaryFromPlan.length > 0 ? secondaryFromPlan : algorithmic.secondary).slice(
        0,
        Math.max(0, maxDailyPriorities - 1)
      );

  const nextCommitment = useMemo(() => {
    return tasks
      .filter((t) => t.dueAt != null && t.dueAt > now && t.status !== "done" && t.status !== "cancelled")
      .filter((t) => new Date(t.dueAt as number).toDateString() === new Date(now).toDateString())
      .sort((a, b) => (a.dueAt as number) - (b.dueAt as number))[0];
  }, [tasks, now]);

  function handleStart(task: Task) {
    navigate("/foco", {
      state: { taskId: task.id, taskTitle: task.title, firstStep: task.firstStep }
    });
  }

  async function handleTwoMinutes(task: Task) {
    if (!uid) return;
    await startFocus(uid, { taskId: task.id, taskTitle: task.title, firstStep: task.firstStep, plannedMinutes: 2 });
    await recordAction(uid, "start_task");
    navigate("/foco");
  }

  async function handleSwapChoose(taskId: string) {
    if (!uid) return;
    await swapMainPriority(uid, taskId);
  }

  const swapCandidates = ranked.slice(0, 8);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-muted">{formatNow()}</p>
          {nextCommitment && (
            <p className="text-xs text-ink-faint">
              Próximo: {nextCommitment.title} às{" "}
              {new Date(nextCommitment.dueAt as number).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={openCapture}>
          Tirar da cabeça
        </Button>
      </header>

      <EnergySelector />

      {!notNormalDay && (
        <button
          onClick={() => uid && setNotNormalDay(uid, true)}
          className="self-start text-sm font-medium text-ink-muted underline decoration-dotted hover:text-ink"
        >
          Hoje não é um dia normal
        </button>
      )}
      {notNormalDay && (
        <div className="flex items-center justify-between gap-2 rounded-control bg-surface-sunken px-3 py-2 text-sm text-ink-muted">
          <span>Tudo bem. Hoje só o essencial.</span>
          <button onClick={() => uid && setNotNormalDay(uid, false)} className="font-medium text-brand-600 hover:underline">
            Desfazer
          </button>
        </div>
      )}

      {!tasksLoaded && <p className="text-sm text-ink-faint">Carregando...</p>}

      {tasksLoaded && !main && (
        <EmptyState
          title="Nenhuma prioridade agora"
          description="Tire algo da cabeça ou crie uma tarefa para começar."
          action={
            <Button onClick={openCapture} size="sm">
              Tirar da cabeça
            </Button>
          }
        />
      )}

      {main && (
        <MainTaskCard
          result={main}
          onStart={() => handleStart(main.task)}
          onTwoMinutes={() => handleTwoMinutes(main.task)}
          onBreakdown={() => setBreakdownTask(main.task)}
          onUnblock={() => setUnblockTask(main.task)}
          onSwap={() => setSwapOpen(true)}
          onOpenDetail={() => setDetailTask(main.task)}
        />
      )}

      <SecondaryTaskList results={secondary} onSelect={(r) => setDetailTask(r.task)} />

      <CompletedTodayStrip />

      <TaskDetailSheet
        task={detailTask}
        open={Boolean(detailTask)}
        onClose={() => setDetailTask(null)}
        onRequestBreakdown={(task) => {
          setDetailTask(null);
          setBreakdownTask(task);
        }}
      />
      <BreakdownAssistant task={breakdownTask} open={Boolean(breakdownTask)} onClose={() => setBreakdownTask(null)} />
      {unblockTask && (
        <UnblockFlow
          task={unblockTask}
          open={Boolean(unblockTask)}
          onClose={() => setUnblockTask(null)}
          onRequestBreakdown={(task) => {
            setUnblockTask(null);
            setBreakdownTask(task);
          }}
        />
      )}
      <SwapPrioritySheet
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        candidates={swapCandidates}
        currentTaskId={main?.task.id ?? null}
        onChoose={handleSwapChoose}
      />
    </div>
  );
}
