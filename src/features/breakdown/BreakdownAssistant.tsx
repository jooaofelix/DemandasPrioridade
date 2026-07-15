import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { IconClose } from "@/components/ui/icons";
import { buildStepsFromAnswers, suggestStepsFromTitle } from "@/lib/breakdown/rules";
import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";
import type { Task } from "@/types";

interface BreakdownAssistantProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

type Phase = "questions" | "review";

export function BreakdownAssistant({ task, open, onClose }: BreakdownAssistantProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const addSubtasks = useTaskStore((s) => s.addSubtasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const showToast = useUiStore((s) => s.showToast);

  const [phase, setPhase] = useState<Phase>("questions");
  const [definitionOfDone, setDefinitionOfDone] = useState("");
  const [firstMove, setFirstMove] = useState("");
  const [precondition, setPrecondition] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState("");

  function reset() {
    setPhase("questions");
    setDefinitionOfDone("");
    setFirstMove("");
    setPrecondition("");
    setSteps([]);
    setNewStep("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function goToReview() {
    if (!task) return;
    const fromAnswers = buildStepsFromAnswers({ definitionOfDone, firstMove, precondition });
    const suggested = fromAnswers.length > 0 ? fromAnswers : suggestStepsFromTitle(task.title);
    setSteps(suggested);
    setPhase("review");
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function addStep() {
    if (!newStep.trim()) return;
    setSteps((prev) => [...prev, newStep.trim()]);
    setNewStep("");
  }

  async function save() {
    if (!uid || !task || steps.length === 0) return;
    await addSubtasks(uid, task.id, steps);
    if (!task.firstStep) {
      await updateTask(uid, task.id, { firstStep: steps[0] });
    }
    await recordAction(uid, "split_task");
    showToast("Tarefa dividida em passos menores.", "success");
    handleClose();
  }

  if (!task) return null;

  return (
    <Sheet open={open} onClose={handleClose} title="Quebrar em pedaços">
      {phase === "questions" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">Responda o que fizer sentido. Pode pular qualquer pergunta.</p>
          <TextField
            label="O que significa terminar essa tarefa?"
            value={definitionOfDone}
            onChange={(e) => setDefinitionOfDone(e.target.value)}
            autoFocus
          />
          <TextField
            label="Qual seria o menor primeiro movimento possível?"
            value={firstMove}
            onChange={(e) => setFirstMove(e.target.value)}
          />
          <TextField
            label="Existe algo que precisa acontecer antes?"
            value={precondition}
            onChange={(e) => setPrecondition(e.target.value)}
          />
          <Button fullWidth onClick={goToReview}>
            Ver sugestão de passos
          </Button>
        </div>
      )}

      {phase === "review" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">Ajuste como quiser antes de salvar.</p>
          <ul className="flex flex-col gap-2">
            {steps.map((step, index) => (
              <li key={`${step}-${index}`} className="flex items-center gap-2 rounded-control border border-border bg-surface-sunken px-3 py-2">
                <span className="flex-1 text-sm text-ink">{step}</span>
                <IconButton label="Remover passo" variant="subtle" onClick={() => removeStep(index)}>
                  <IconClose width={16} height={16} />
                </IconButton>
              </li>
            ))}
            {steps.length === 0 && <p className="text-sm text-ink-faint">Nenhum passo ainda. Adicione um abaixo.</p>}
          </ul>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <TextField
                label="Adicionar passo"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addStep();
                  }
                }}
              />
            </div>
            <Button variant="secondary" onClick={addStep}>
              Adicionar
            </Button>
          </div>
          <Button fullWidth onClick={save} disabled={steps.length === 0}>
            Salvar passos
          </Button>
        </div>
      )}
    </Sheet>
  );
}
