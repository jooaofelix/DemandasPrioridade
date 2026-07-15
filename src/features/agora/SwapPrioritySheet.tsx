import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import type { PriorityResult } from "@/types";

interface SwapPrioritySheetProps {
  open: boolean;
  onClose: () => void;
  candidates: PriorityResult[];
  currentTaskId: string | null;
  onChoose: (taskId: string) => void;
}

export function SwapPrioritySheet({ open, onClose, candidates, currentTaskId, onChoose }: SwapPrioritySheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Trocar prioridade">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink-muted">Escolha outra tarefa para ser sua prioridade principal agora.</p>
        {candidates.length === 0 && <p className="text-sm text-ink-faint">Não há outras tarefas disponíveis.</p>}
        {candidates
          .filter((c) => c.task.id !== currentTaskId)
          .map((result) => (
            <Card key={result.task.id} className="p-3">
              <button
                onClick={() => {
                  onChoose(result.task.id);
                  onClose();
                }}
                className="w-full text-left"
              >
                <p className="text-sm font-medium text-ink">{result.task.title}</p>
                {result.reasons[0] && <p className="mt-0.5 text-xs text-ink-muted">{result.reasons[0].label}</p>}
              </button>
            </Card>
          ))}
      </div>
    </Sheet>
  );
}
