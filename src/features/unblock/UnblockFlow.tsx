import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { firstMovementExamples, interventionFor, INTERVENTION_LABELS, OBSTACLE_LABELS } from "@/lib/unblock/rules";
import { useAuthStore } from "@/store/authStore";
import { useFocusStore } from "@/store/focusStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";
import type { BlockingThoughtType, Task, UnblockObstacle } from "@/types";

interface UnblockFlowProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onRequestBreakdown: (task: Task) => void;
}

type Step = "obstacle" | "intervention" | "first_movement";

const OBSTACLES: UnblockObstacle[] = [
  "too_big",
  "dont_know_where",
  "boring",
  "tired",
  "anxious",
  "distracted",
  "missing_something",
  "cant_explain"
];

export function UnblockFlow({ task, open, onClose, onRequestBreakdown }: UnblockFlowProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const updateTask = useTaskStore((s) => s.updateTask);
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const startFocus = useFocusStore((s) => s.start);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("obstacle");
  const [obstacle, setObstacle] = useState<UnblockObstacle | null>(null);
  const [minimalVersion, setMinimalVersion] = useState("");
  const [thought, setThought] = useState("");
  const [thoughtType, setThoughtType] = useState<BlockingThoughtType>("prediction");
  const [functionalResponse, setFunctionalResponse] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [helpMessage, setHelpMessage] = useState("");
  const [missingItems, setMissingItems] = useState("");

  function reset() {
    setStep("obstacle");
    setObstacle(null);
    setMinimalVersion("");
    setThought("");
    setFunctionalResponse("");
    setRescheduleDate("");
    setHelpMessage("");
    setMissingItems("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function chooseObstacle(value: UnblockObstacle) {
    setObstacle(value);
    setStep("intervention");
  }

  const intervention = obstacle ? interventionFor(obstacle) : null;

  async function saveMinimalVersion() {
    if (!uid || !minimalVersion.trim()) return;
    await updateTask(uid, task.id, { minimalVersion: minimalVersion.trim() });
    setStep("first_movement");
  }

  async function saveThought() {
    if (!uid || !thought.trim() || !functionalResponse.trim()) return;
    await updateTask(uid, task.id, {
      blockingThought: { thought: thought.trim(), type: thoughtType, functionalResponse: functionalResponse.trim() }
    });
    setStep("first_movement");
  }

  async function saveMissingItems() {
    if (!uid) return;
    if (missingItems.trim()) {
      await updateTask(uid, task.id, { notes: `${task.notes ? `${task.notes}\n` : ""}Faltando: ${missingItems.trim()}` });
    }
    setStep("first_movement");
  }

  async function saveReschedule() {
    if (!uid) return;
    const newDueAt = rescheduleDate ? new Date(rescheduleDate).getTime() : null;
    await postponeTask(uid, task.id, newDueAt);
    showToast("Reagendado. Sem culpa — o plano só mudou.");
    handleClose();
  }

  async function saveAskForHelp() {
    if (!uid) return;
    await updateTask(uid, task.id, {
      notes: `${task.notes ? `${task.notes}\n` : ""}${helpMessage.trim() ? `Pedir ajuda: ${helpMessage.trim()}` : "Pedir ajuda"}`
    });
    await recordAction(uid, "ask_for_help");
    showToast("Pedir ajuda também é progresso.");
    handleClose();
  }

  async function startFirstMovement(movement: string) {
    if (!uid) return;
    await updateTask(uid, task.id, { firstStep: task.firstStep ?? movement });
    await startFocus(uid, {
      taskId: task.id,
      taskTitle: task.title,
      firstStep: task.firstStep ?? movement,
      plannedMinutes: 2
    });
    handleClose();
    navigate("/foco");
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Destravar">
      {step === "obstacle" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">O que está dificultando começar "{task.title}"?</p>
          <div className="flex flex-wrap gap-2">
            {OBSTACLES.map((o) => (
              <Chip key={o} selected={obstacle === o} onClick={() => chooseObstacle(o)}>
                {OBSTACLE_LABELS[o]}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {step === "intervention" && intervention === "split_task" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <Button
            fullWidth
            onClick={() => {
              handleClose();
              onRequestBreakdown(task);
            }}
          >
            Abrir divisão em passos
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "minimal_version" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <TextField
            label="Qual é a menor versão que ainda conta como avanço?"
            value={minimalVersion}
            onChange={(e) => setMinimalVersion(e.target.value)}
            autoFocus
          />
          <Button fullWidth onClick={saveMinimalVersion} disabled={!minimalVersion.trim()}>
            Continuar
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "prepare_environment" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
            <li>Separe o que vai usar.</li>
            <li>Feche uma aba ou aplicativo que não seja desta tarefa.</li>
            <li>Deixe o espaço pronto para começar.</li>
          </ul>
          <Button fullWidth onClick={() => setStep("first_movement")}>
            Pronto, continuar
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "two_minutes" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <p className="text-sm text-ink-muted">
            Sem compromisso de terminar. Só dois minutos, e depois você decide se continua.
          </p>
          <Button fullWidth onClick={() => setStep("first_movement")}>
            Continuar
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "remove_distraction" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <p className="text-sm text-ink-muted">
            Escolha uma única distração para afastar agora — celular, aba do navegador ou som.
          </p>
          <Button fullWidth onClick={() => setStep("first_movement")}>
            Feito, continuar
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "register_thought" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <TextField
            label="O que passa pela sua cabeça quando pensa nessa tarefa?"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Esse pensamento é...</span>
            <div className="flex gap-2">
              {(["fact", "prediction", "demand"] as BlockingThoughtType[]).map((t) => (
                <Chip key={t} selected={thoughtType === t} onClick={() => setThoughtType(t)}>
                  {t === "fact" ? "Um fato" : t === "prediction" ? "Uma previsão" : "Uma cobrança"}
                </Chip>
              ))}
            </div>
          </div>
          <TextField
            label="Uma resposta mais funcional para esse pensamento"
            placeholder='Ex.: "Posso fazer uma primeira versão incompleta e melhorar depois."'
            value={functionalResponse}
            onChange={(e) => setFunctionalResponse(e.target.value)}
          />
          <Button fullWidth onClick={saveThought} disabled={!thought.trim() || !functionalResponse.trim()}>
            Continuar
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "reschedule" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <TextField
            label="Novo horário (opcional)"
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
          <Button fullWidth onClick={saveReschedule}>
            Reagendar
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "ask_for_help" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <TextField
            label="Quem poderia ajudar? (opcional)"
            value={helpMessage}
            onChange={(e) => setHelpMessage(e.target.value)}
          />
          <Button fullWidth onClick={saveAskForHelp}>
            Registrar
          </Button>
        </IntroStep>
      )}

      {step === "intervention" && intervention === "identify_missing_item" && (
        <IntroStep label={INTERVENTION_LABELS[intervention]}>
          <TextField
            label="O que está faltando?"
            value={missingItems}
            onChange={(e) => setMissingItems(e.target.value)}
            autoFocus
          />
          <Button fullWidth onClick={saveMissingItems}>
            Continuar
          </Button>
        </IntroStep>
      )}

      {step === "first_movement" && obstacle && intervention && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">Escolha o menor movimento possível agora.</p>
          <div className="flex flex-col gap-2">
            {firstMovementExamples(intervention, task.title).map((example) => (
              <Button key={example} fullWidth size="lg" onClick={() => startFirstMovement(example)}>
                {example}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}

function IntroStep({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-brand-600">{label}</p>
      {children}
    </div>
  );
}
