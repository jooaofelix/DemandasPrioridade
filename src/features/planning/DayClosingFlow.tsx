import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useDailyPlanStore, todayId } from "@/store/dailyPlanStore";
import { useInboxStore } from "@/store/inboxStore";
import { useTaskStore } from "@/store/taskStore";
import { useGamificationStore } from "@/store/gamificationStore";
import type { Task } from "@/types";

type ReorgAction = "tomorrow" | "other_date" | "reduce" | "delegate" | "cancel" | "inbox";

const REORG_OPTIONS: { value: ReorgAction; label: string }[] = [
  { value: "tomorrow", label: "Fazer amanhã" },
  { value: "other_date", label: "Escolher outra data" },
  { value: "reduce", label: "Reduzir a tarefa" },
  { value: "delegate", label: "Delegar" },
  { value: "cancel", label: "Cancelar" },
  { value: "inbox", label: "Manter na caixa de entrada" }
];

const STEPS = 4;

export function DayClosingFlow() {
  const navigate = useNavigate();
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const tasks = useTaskStore((s) => s.tasks);
  const dailyPlan = useDailyPlanStore((s) => s.today);
  const closeDay = useDailyPlanStore((s) => s.closeDay);
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const cancelTask = useTaskStore((s) => s.cancelTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const capture = useInboxStore((s) => s.capture);
  const recordAction = useGamificationStore((s) => s.recordAction);

  const [step, setStep] = useState(0);
  const [advancedTaskIds, setAdvancedTaskIds] = useState<string[]>([]);
  const [somethingOnMind, setSomethingOnMind] = useState("");
  const [firstThingTomorrow, setFirstThingTomorrow] = useState("");
  const [reorgChoices, setReorgChoices] = useState<Record<string, ReorgAction>>({});

  const todayStart = new Date(`${todayId()}T00:00:00`).getTime();
  const completedToday = tasks.filter((t) => t.completedAt != null && t.completedAt >= todayStart);

  const planTaskIds = new Set([
    ...(dailyPlan?.mainPriorityTaskId ? [dailyPlan.mainPriorityTaskId] : []),
    ...(dailyPlan?.secondaryTaskIds ?? [])
  ]);
  const pendingPlanTasks: Task[] = tasks.filter((t) => planTaskIds.has(t.id) && t.status !== "done" && t.status !== "cancelled");
  const notCompletedCandidates = tasks.filter(
    (t) => !planTaskIds.has(t.id) && t.status !== "done" && t.status !== "cancelled" && t.lastTouchedAt >= todayStart
  );

  function toggleAdvanced(id: string) {
    setAdvancedTaskIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function setReorg(taskId: string, action: ReorgAction) {
    setReorgChoices((prev) => ({ ...prev, [taskId]: action }));
  }

  async function applyReorganization() {
    if (!uid) return;
    for (const task of pendingPlanTasks) {
      const action = reorgChoices[task.id];
      if (!action) continue;
      if (action === "tomorrow") {
        await postponeTask(uid, task.id, Date.now() + 24 * 60 * 60 * 1000);
      } else if (action === "reduce") {
        // leave dueAt as-is; user will define minimal version from task detail later.
        await updateTask(uid, task.id, { status: "planned" });
      } else if (action === "delegate") {
        await cancelTask(uid, task.id);
      } else if (action === "cancel") {
        await cancelTask(uid, task.id);
      } else if (action === "inbox") {
        await updateTask(uid, task.id, { status: "inbox" });
      }
      // "other_date" is left for the user to set from the task detail screen.
    }
  }

  async function finish() {
    if (!uid) return;
    await applyReorganization();
    if (somethingOnMind.trim()) {
      await capture(uid, somethingOnMind.trim());
    }
    await closeDay(uid, {
      completedTaskIds: completedToday.map((t) => t.id),
      advancedTaskIds,
      somethingOnMind: somethingOnMind.trim() || null,
      firstThingTomorrow: firstThingTomorrow.trim() || null
    });
    await recordAction(uid, "reorganize_day");
    navigate("/agora", { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-6 py-8">
      <div>
        <div className="mb-6 flex gap-1" aria-hidden="true">
          {Array.from({ length: STEPS }).map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-brand-500" : "bg-surface-sunken"}`} />
          ))}
        </div>

        {step === 0 && (
          <StepBlock title="O que foi concluído?">
            {completedToday.length === 0 ? (
              <p className="text-sm text-ink-faint">Nada marcado como concluído hoje, e tudo bem.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {completedToday.map((t) => (
                  <li key={t.id} className="text-sm text-ink">
                    ✓ {t.title}
                  </li>
                ))}
              </ul>
            )}
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock title="O que avançou, mesmo sem ter sido concluído?">
            {notCompletedCandidates.length === 0 ? (
              <p className="text-sm text-ink-faint">Nenhuma outra tarefa foi tocada hoje.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {notCompletedCandidates.map((t) => (
                  <Chip key={t.id} selected={advancedTaskIds.includes(t.id)} onClick={() => toggleAdvanced(t.id)}>
                    {t.title}
                  </Chip>
                ))}
              </div>
            )}

            {pendingPlanTasks.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm font-medium text-ink">O plano mudou. Vamos reorganizar:</p>
                {pendingPlanTasks.map((task) => (
                  <div key={task.id} className="rounded-control border border-border p-3">
                    <p className="text-sm font-medium text-ink">{task.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {REORG_OPTIONS.map((opt) => (
                        <Chip
                          key={opt.value}
                          selected={reorgChoices[task.id] === opt.value}
                          onClick={() => setReorg(task.id, opt.value)}
                        >
                          {opt.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock title="Existe algo ocupando sua cabeça?">
            <TextField
              label="Escreva aqui (vai para sua caixa de entrada)"
              value={somethingOnMind}
              onChange={(e) => setSomethingOnMind(e.target.value)}
              autoFocus
            />
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock title="Qual é a primeira coisa de amanhã?">
            <TextField
              label="Opcional"
              value={firstThingTomorrow}
              onChange={(e) => setFirstThingTomorrow(e.target.value)}
              autoFocus
            />
          </StepBlock>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
        )}
        {step < STEPS - 1 && (
          <Button fullWidth onClick={() => setStep((s) => s + 1)}>
            Continuar
          </Button>
        )}
        {step === STEPS - 1 && (
          <Button fullWidth onClick={finish}>
            Encerrar o dia
          </Button>
        )}
      </div>
    </div>
  );
}

function StepBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      {children}
    </div>
  );
}
