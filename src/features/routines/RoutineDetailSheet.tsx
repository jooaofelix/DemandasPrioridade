import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { IconClose } from "@/components/ui/icons";
import { useAuthStore } from "@/store/authStore";
import { useRoutineStore } from "@/store/routineStore";
import type { Routine } from "@/types";
import { RoutineRunnerSheet } from "./RoutineRunnerSheet";

interface RoutineDetailSheetProps {
  routine: Routine | null;
  open: boolean;
  onClose: () => void;
}

export function RoutineDetailSheet({ routine, open, onClose }: RoutineDetailSheetProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const stepsByRoutineId = useRoutineStore((s) => s.stepsByRoutineId);
  const subscribeSteps = useRoutineStore((s) => s.subscribeSteps);
  const addStep = useRoutineStore((s) => s.addStep);
  const deleteStep = useRoutineStore((s) => s.deleteStep);
  const reorderSteps = useRoutineStore((s) => s.reorderSteps);
  const updateRoutine = useRoutineStore((s) => s.updateRoutine);
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine);

  const [newStep, setNewStep] = useState("");
  const [runnerVariant, setRunnerVariant] = useState<"full" | "difficult" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!uid || !routine) return;
    return subscribeSteps(uid, routine.id);
  }, [uid, routine, subscribeSteps]);

  if (!routine) return null;
  const steps = stepsByRoutineId[routine.id] ?? [];

  async function handleAddStep() {
    if (!uid || !routine || !newStep.trim()) return;
    await addStep(uid, routine.id, newStep.trim());
    setNewStep("");
  }

  function moveStep(index: number, direction: -1 | 1) {
    if (!uid || !routine) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    reorderSteps(uid, routine.id, reordered.map((s) => s.id));
  }

  return (
    <Sheet open={open} onClose={onClose} title={routine.name}>
      <div className="flex flex-col gap-5">
        {routine.description && <p className="text-sm text-ink-muted">{routine.description}</p>}

        <div className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2 rounded-control border border-border bg-surface-sunken px-3 py-2">
              <span className="flex-1 text-sm text-ink">
                {step.title}
                {step.optional && <span className="ml-2 text-xs text-ink-faint">(opcional)</span>}
              </span>
              <IconButton label="Mover para cima" variant="subtle" onClick={() => moveStep(index, -1)} disabled={index === 0}>
                ↑
              </IconButton>
              <IconButton label="Mover para baixo" variant="subtle" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1}>
                ↓
              </IconButton>
              <IconButton label="Remover passo" variant="subtle" onClick={() => uid && deleteStep(uid, routine.id, step.id)}>
                <IconClose width={16} height={16} />
              </IconButton>
            </div>
          ))}
          {steps.length === 0 && <p className="text-sm text-ink-faint">Nenhum passo ainda.</p>}
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <TextField
              label="Adicionar passo"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddStep();
                }
              }}
            />
          </div>
          <Button variant="secondary" onClick={handleAddStep}>
            Adicionar
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Button fullWidth disabled={steps.length === 0} onClick={() => setRunnerVariant("full")}>
            Iniciar rotina
          </Button>
          <Button fullWidth variant="secondary" disabled={steps.length === 0} onClick={() => setRunnerVariant("difficult")}>
            Versão para dia difícil
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => uid && updateRoutine(uid, routine.id, { active: !routine.active })}
          >
            {routine.active ? "Pausar rotina" : "Reativar rotina"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
            Excluir rotina
          </Button>
        </div>
      </div>

      <RoutineRunnerSheet
        routine={routine}
        steps={steps}
        variant={runnerVariant}
        onClose={() => setRunnerVariant(null)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Excluir esta rotina?"
        description="Os passos também serão removidos. Isso não pode ser desfeito."
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          if (uid) await deleteRoutine(uid, routine.id);
          setConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </Sheet>
  );
}
