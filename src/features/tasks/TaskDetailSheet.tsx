import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { IconCheck } from "@/components/ui/icons";
import { useAuthStore } from "@/store/authStore";
import { useFocusStore } from "@/store/focusStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";
import type { BlockingThoughtType, Task } from "@/types";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onRequestBreakdown: (task: Task) => void;
}

export function TaskDetailSheet({ task, open, onClose, onRequestBreakdown }: TaskDetailSheetProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const updateTask = useTaskStore((s) => s.updateTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const cancelTask = useTaskStore((s) => s.cancelTask);
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const setPin = useTaskStore((s) => s.setPin);
  const subtasksByTaskId = useTaskStore((s) => s.subtasksByTaskId);
  const subscribeSubtasks = useTaskStore((s) => s.subscribeSubtasks);
  const toggleSubtask = useTaskStore((s) => s.toggleSubtask);
  const startFocus = useFocusStore((s) => s.start);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();

  const [ifWhen, setIfWhen] = useState("");
  const [ifThen, setIfThen] = useState("");
  const [minimalVersion, setMinimalVersion] = useState("");
  const [thought, setThought] = useState("");
  const [thoughtType, setThoughtType] = useState<BlockingThoughtType>("prediction");
  const [functionalResponse, setFunctionalResponse] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [expectedMinutes, setExpectedMinutes] = useState("");
  const [expectedDifficulty, setExpectedDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [actualMinutes, setActualMinutes] = useState("");
  const [actualDifficulty, setActualDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [rewardLabel, setRewardLabel] = useState("");

  useEffect(() => {
    if (!task || !uid) return;
    setIfWhen(task.ifThenPlan?.when ?? "");
    setIfThen(task.ifThenPlan?.then ?? "");
    setMinimalVersion(task.minimalVersion ?? "");
    setThought(task.blockingThought?.thought ?? "");
    setThoughtType(task.blockingThought?.type ?? "prediction");
    setFunctionalResponse(task.blockingThought?.functionalResponse ?? "");
    setExpectedMinutes(task.estimatePrediction ? String(task.estimatePrediction.expectedMinutes) : "");
    setExpectedDifficulty(task.estimatePrediction?.expectedDifficulty ?? 3);
    setActualMinutes(task.actualReflection ? String(task.actualReflection.actualMinutes) : "");
    setActualDifficulty(task.actualReflection?.actualDifficulty ?? 3);
    setRewardLabel("");
    const unsubscribe = subscribeSubtasks(uid, task.id);
    return unsubscribe;
  }, [task, uid, subscribeSubtasks]);

  if (!task) return null;
  const subtasks = subtasksByTaskId[task.id] ?? [];

  async function handleComplete() {
    if (!uid || !task) return;
    await completeTask(uid, task.id);
    await recordAction(uid, "complete_task");
    showToast("Concluída. Bom trabalho.", "success");
    onClose();
  }

  async function handleCancel() {
    if (!uid || !task) return;
    await cancelTask(uid, task.id);
    await recordAction(uid, "cancel_with_clarity");
    setConfirmCancel(false);
    showToast("Cancelada. Tudo bem mudar de ideia.");
    onClose();
  }

  async function handlePostpone(days: number) {
    if (!uid || !task) return;
    const newDueAt = Date.now() + days * 24 * 60 * 60 * 1000;
    await postponeTask(uid, task.id, newDueAt);
    showToast("Adiada sem problema.");
  }

  async function togglePin() {
    if (!uid || !task) return;
    await setPin(uid, task.id, !task.manualPriorityPin);
  }

  async function saveIfThen() {
    if (!uid || !task || !ifWhen.trim() || !ifThen.trim()) return;
    await updateTask(uid, task.id, { ifThenPlan: { when: ifWhen.trim(), then: ifThen.trim() } });
    showToast("Plano se-então salvo.");
  }

  async function saveMinimalVersion() {
    if (!uid || !task || !minimalVersion.trim()) return;
    await updateTask(uid, task.id, { minimalVersion: minimalVersion.trim() });
    await recordAction(uid, "make_minimal_version");
    showToast("Versão mínima salva.");
  }

  async function saveThought() {
    if (!uid || !task || !thought.trim() || !functionalResponse.trim()) return;
    await updateTask(uid, task.id, {
      blockingThought: { thought: thought.trim(), type: thoughtType, functionalResponse: functionalResponse.trim() }
    });
    showToast("Pensamento registrado.");
  }

  async function savePrediction() {
    if (!uid || !task || !expectedMinutes) return;
    await updateTask(uid, task.id, {
      estimatePrediction: {
        expectedMinutes: Number(expectedMinutes),
        expectedDifficulty,
        recordedAt: Date.now()
      }
    });
    showToast("Previsão registrada.");
  }

  async function saveReflection() {
    if (!uid || !task || !actualMinutes) return;
    await updateTask(uid, task.id, {
      actualReflection: {
        actualMinutes: Number(actualMinutes),
        actualDifficulty,
        recordedAt: Date.now()
      }
    });
    showToast("Registrado — isso ajuda a calibrar as próximas estimativas.");
  }

  async function saveReward() {
    if (!uid || !task || !rewardLabel.trim()) return;
    await updateTask(uid, task.id, { rewardId: rewardLabel.trim() });
    showToast("Recompensa planejada.");
  }

  async function beginFocusNow(minutes: number) {
    if (!uid || !task) return;
    await startFocus(uid, {
      taskId: task.id,
      taskTitle: task.title,
      firstStep: task.firstStep,
      plannedMinutes: minutes
    });
    await recordAction(uid, "start_task");
    onClose();
    navigate("/foco");
  }

  function choosePlannedFocus() {
    if (!task) return;
    onClose();
    navigate("/foco", { state: { taskId: task.id, taskTitle: task.title, firstStep: task.firstStep } });
  }

  return (
    <Sheet open={open} onClose={onClose} title={task.title}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={choosePlannedFocus}>
            Começar agora
          </Button>
          <Button size="sm" variant="secondary" onClick={() => beginFocusNow(2)}>
            Fazer só 2 minutos
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onRequestBreakdown(task)}>
            Dividir em passos
          </Button>
          <Button size="sm" variant={task.manualPriorityPin ? "primary" : "ghost"} onClick={togglePin}>
            {task.manualPriorityPin ? "Prioridade fixada" : "Fixar prioridade"}
          </Button>
        </div>

        {subtasks.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-ink">Passos</h3>
            <ul className="flex flex-col gap-2">
              {subtasks.map((subtask) => (
                <li key={subtask.id} className="flex items-center gap-3">
                  <IconButton
                    label={subtask.done ? "Marcar como não feito" : "Marcar como feito"}
                    variant="subtle"
                    onClick={() => uid && toggleSubtask(uid, task.id, subtask.id)}
                    className={subtask.done ? "bg-success/10 text-success" : ""}
                  >
                    <IconCheck width={16} height={16} />
                  </IconButton>
                  <span className={subtask.done ? "text-sm text-ink-faint line-through" : "text-sm text-ink"}>
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">Plano se-então</h3>
          <TextField label="Se" placeholder="forem 19h e eu terminar de jantar" value={ifWhen} onChange={(e) => setIfWhen(e.target.value)} />
          <TextField label="Então" placeholder="abrirei o material por 5 minutos" value={ifThen} onChange={(e) => setIfThen(e.target.value)} />
          <Button variant="secondary" onClick={saveIfThen} disabled={!ifWhen.trim() || !ifThen.trim()}>
            Salvar plano
          </Button>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">Versão mínima aceitável</h3>
          <TextField
            label="Qual é a menor versão que ainda conta como avanço?"
            value={minimalVersion}
            onChange={(e) => setMinimalVersion(e.target.value)}
          />
          <Button variant="secondary" onClick={saveMinimalVersion} disabled={!minimalVersion.trim()}>
            Salvar
          </Button>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">Pensamento que está travando</h3>
          <TextArea
            label="O que passa pela sua cabeça quando pensa nessa tarefa?"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
          />
          <div className="flex gap-2">
            {(["fact", "prediction", "demand"] as BlockingThoughtType[]).map((t) => (
              <Chip key={t} selected={thoughtType === t} onClick={() => setThoughtType(t)}>
                {t === "fact" ? "Fato" : t === "prediction" ? "Previsão" : "Cobrança"}
              </Chip>
            ))}
          </div>
          <TextField
            label="Uma resposta mais funcional"
            value={functionalResponse}
            onChange={(e) => setFunctionalResponse(e.target.value)}
          />
          <Button variant="secondary" onClick={saveThought} disabled={!thought.trim() || !functionalResponse.trim()}>
            Salvar
          </Button>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">Previsão e realidade</h3>
          <p className="text-xs text-ink-muted">
            Sem julgamento — isso só ajuda a calibrar as próximas estimativas.
          </p>
          <div className="flex gap-2">
            <TextField
              label="Quanto acha que vai levar (min)"
              type="number"
              min={1}
              value={expectedMinutes}
              onChange={(e) => setExpectedMinutes(e.target.value)}
            />
            <Button variant="secondary" onClick={savePrediction} disabled={!expectedMinutes} className="self-end">
              Salvar
            </Button>
          </div>
          <div className="flex gap-2">
            <TextField
              label="Quanto levou de fato (min)"
              type="number"
              min={1}
              value={actualMinutes}
              onChange={(e) => setActualMinutes(e.target.value)}
            />
            <Button variant="secondary" onClick={saveReflection} disabled={!actualMinutes} className="self-end">
              Salvar
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-ink">Recompensa planejada</h3>
          <div className="flex gap-2">
            <TextField
              label="Depois disso, você vai..."
              placeholder="Ex.: tomar um café"
              value={rewardLabel}
              onChange={(e) => setRewardLabel(e.target.value)}
            />
            <Button variant="secondary" onClick={saveReward} disabled={!rewardLabel.trim()} className="self-end">
              Salvar
            </Button>
          </div>
          {task.rewardId && <p className="text-xs text-ink-muted">Combinado: {task.rewardId}</p>}
        </section>

        <section className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={handleComplete}>
              Concluir
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handlePostpone(1)}>
              Adiar 1 dia
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(true)}>
              Cancelar tarefa
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancelar esta tarefa?"
        description="Ela deixará de aparecer nas suas prioridades. Você pode criar outra igual depois, se mudar de ideia."
        confirmLabel="Cancelar tarefa"
        destructive
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </Sheet>
  );
}
