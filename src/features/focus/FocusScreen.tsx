import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { UnblockFlow } from "@/features/unblock/UnblockFlow";
import { BreakdownAssistant } from "@/features/breakdown/BreakdownAssistant";
import { useAuthStore } from "@/store/authStore";
import { computeElapsedMs, isCurrentlyPaused, useFocusStore } from "@/store/focusStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";
import type { Task } from "@/types";
import { DistractionParkSheet } from "./DistractionParkSheet";
import { DurationPicker } from "./DurationPicker";
import { useAmbientSound } from "./useAmbientSound";

interface PendingTaskState {
  taskId: string | null;
  taskTitle: string;
  firstStep: string | null;
}

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const activeSession = useFocusStore((s) => s.activeSession);
  const recentDistractions = useFocusStore((s) => s.recentDistractions);
  const start = useFocusStore((s) => s.start);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const finish = useFocusStore((s) => s.finish);
  const tasks = useTaskStore((s) => s.tasks);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const showToast = useUiStore((s) => s.showToast);
  const ambient = useAmbientSound();

  const [tick, setTick] = useState(Date.now());
  const [distractionOpen, setDistractionOpen] = useState(false);
  const [showEndQuestions, setShowEndQuestions] = useState(false);
  const [unblockTask, setUnblockTask] = useState<Task | null>(null);
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => setTick(Date.now()), 500);
    return () => clearInterval(interval);
  }, [activeSession]);

  const pending = location.state as PendingTaskState | undefined;

  if (!activeSession && pending) {
    return (
      <DurationPicker
        taskTitle={pending.taskTitle}
        firstStep={pending.firstStep}
        onStart={async (minutes) => {
          if (!uid) return;
          await start(uid, { taskId: pending.taskId, taskTitle: pending.taskTitle, firstStep: pending.firstStep, plannedMinutes: minutes });
          await recordAction(uid, "start_task");
          navigate("/foco", { replace: true, state: undefined });
        }}
      />
    );
  }

  if (!activeSession) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-6">
        <EmptyState
          title="Nenhuma sessão de foco ativa"
          description="Escolha uma tarefa na tela Agora e toque em 'Começar agora'."
          action={<Button onClick={() => navigate("/agora")}>Ir para Agora</Button>}
        />
      </div>
    );
  }

  const elapsedMs = computeElapsedMs(activeSession, tick);
  const plannedMs = activeSession.plannedMinutes * 60 * 1000;
  const remainingMs = plannedMs - elapsedMs;
  const paused = isCurrentlyPaused(activeSession);
  const currentTask = tasks.find((t) => t.id === activeSession.taskId) ?? null;

  async function handleConclude() {
    if (!uid) return;
    await finish(uid, "completed");
    await recordAction(uid, "use_focus_mode");
    if (currentTask) {
      await useTaskStore.getState().completeTask(uid, currentTask.id);
      await recordAction(uid, "complete_task");
    }
    showToast("Sessão concluída.", "success");
    navigate("/agora");
  }

  async function handleStop(outcome: "partial" | "abandoned") {
    if (!uid) return;
    await finish(uid, outcome);
    navigate("/agora");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-6 py-10">
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <p className="text-sm text-ink-muted">Foco</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{activeSession.taskTitle ?? "Sessão livre"}</h1>
          {activeSession.firstStep && <p className="mt-1 text-sm text-ink-muted">{activeSession.firstStep}</p>}
        </div>

        <div className="text-6xl font-semibold tabular-nums text-ink" aria-live="polite">
          {formatClock(Math.max(remainingMs, 0))}
        </div>
        {remainingMs <= 0 && <p className="text-sm text-ink-muted">Tempo planejado terminou. Pode concluir ou continuar.</p>}

        <div className="w-full">
          <ProgressBar value={Math.min(elapsedMs, plannedMs)} max={plannedMs} label="Progresso da sessão" />
        </div>

        {recentDistractions.length > 0 && (
          <p className="text-xs text-ink-faint">{recentDistractions.length} pensamento(s) estacionado(s)</p>
        )}

        <button
          type="button"
          onClick={ambient.toggle}
          className="text-sm text-ink-muted underline decoration-dotted hover:text-ink"
        >
          {ambient.enabled ? "Desligar som ambiente" : "Ligar som ambiente"}
        </button>
      </div>

      {!showEndQuestions ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button fullWidth variant="secondary" onClick={paused ? resume : pause}>
              {paused ? "Retomar" : "Pausar"}
            </Button>
            <Button fullWidth variant="secondary" onClick={() => setDistractionOpen(true)}>
              Registrar distração
            </Button>
          </div>
          <Button fullWidth onClick={() => setShowEndQuestions(true)}>
            Concluir sessão
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="self-center"
            onClick={() => currentTask && setUnblockTask(currentTask)}
            disabled={!currentTask}
          >
            Ficou difícil
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-card border border-border bg-surface-raised p-4">
          <p className="text-sm font-medium text-ink">Como foi?</p>
          <Button fullWidth onClick={handleConclude}>
            Concluí a tarefa
          </Button>
          <Button fullWidth variant="secondary" onClick={() => handleStop("partial")}>
            Avancei, mas não terminei
          </Button>
          <Button fullWidth variant="ghost" onClick={() => handleStop("abandoned")}>
            Preciso de uma pausa
          </Button>
          {currentTask && (
            <Button fullWidth variant="ghost" onClick={() => setBreakdownTask(currentTask)}>
              O próximo passo mudou — ajustar
            </Button>
          )}
        </div>
      )}

      <DistractionParkSheet open={distractionOpen} onClose={() => setDistractionOpen(false)} />

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
      <BreakdownAssistant task={breakdownTask} open={Boolean(breakdownTask)} onClose={() => setBreakdownTask(null)} />
    </div>
  );
}
