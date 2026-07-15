import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Sheet } from "@/components/ui/Sheet";
import { IconCheck } from "@/components/ui/icons";
import { todayId } from "@/store/dailyPlanStore";
import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useRoutineStore } from "@/store/routineStore";
import { useUiStore } from "@/store/uiStore";
import type { Routine, RoutineStep } from "@/types";

interface RoutineRunnerSheetProps {
  routine: Routine;
  steps: RoutineStep[];
  variant: "full" | "difficult" | null;
  onClose: () => void;
}

export function RoutineRunnerSheet({ routine, steps, variant, onClose }: RoutineRunnerSheetProps) {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const recordRun = useRoutineStore((s) => s.recordRun);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const showToast = useUiStore((s) => s.showToast);
  const [done, setDone] = useState<Set<string>>(new Set());

  const activeSteps = variant === "difficult" ? steps.filter((s) => !s.optional) : steps;

  useEffect(() => {
    if (variant) setDone(new Set());
  }, [variant]);

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function finish(partial: boolean) {
    if (!uid) return;
    await recordRun(uid, routine.id, todayId(), Array.from(done));
    if (!partial) {
      await recordAction(uid, "complete_task");
      showToast("Rotina concluída.", "success");
    } else {
      await recordAction(uid, "respect_own_limit");
      showToast("Concluída em parte. Isso conta.");
    }
    onClose();
  }

  if (!variant) return null;

  return (
    <Sheet open={Boolean(variant)} onClose={onClose} title={routine.name}>
      <div className="flex flex-col gap-4">
        {variant === "difficult" && (
          <p className="text-sm text-ink-muted">Versão reduzida: só os passos essenciais.</p>
        )}
        <ul className="flex flex-col gap-2">
          {activeSteps.map((step) => (
            <li key={step.id} className="flex items-center gap-3">
              <IconButton
                label={done.has(step.id) ? "Marcar como não feito" : "Marcar como feito"}
                variant="subtle"
                onClick={() => toggle(step.id)}
                className={done.has(step.id) ? "bg-success/10 text-success" : ""}
              >
                <IconCheck width={16} height={16} />
              </IconButton>
              <span className={done.has(step.id) ? "text-sm text-ink-faint line-through" : "text-sm text-ink"}>
                {step.title}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Button fullWidth onClick={() => finish(false)}>
            Concluir rotina
          </Button>
          <Button fullWidth variant="secondary" onClick={() => finish(true)}>
            Concluir parcialmente
          </Button>
          <Button fullWidth variant="ghost" onClick={onClose}>
            Pausar por agora
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
