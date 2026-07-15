import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { PriorityResult } from "@/types";

const AREA_LABELS: Record<string, string> = {
  work: "Trabalho",
  study: "Estudos",
  personal: "Pessoal",
  home: "Casa"
};

const ENERGY_LABELS: Record<string, string> = {
  low: "energia baixa",
  medium: "energia média",
  high: "energia alta"
};

function formatDueAt(dueAt: number | null): string | null {
  if (!dueAt) return null;
  const date = new Date(dueAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Hoje às ${time}`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface MainTaskCardProps {
  result: PriorityResult;
  onStart: () => void;
  onTwoMinutes: () => void;
  onBreakdown: () => void;
  onUnblock: () => void;
  onSwap: () => void;
  onOpenDetail: () => void;
}

export function MainTaskCard({
  result,
  onStart,
  onTwoMinutes,
  onBreakdown,
  onUnblock,
  onSwap,
  onOpenDetail
}: MainTaskCardProps) {
  const { task, reasons } = result;
  const dueLabel = formatDueAt(task.dueAt);

  return (
    <Card raised className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Prioridade principal</p>
          <button onClick={onOpenDetail} className="mt-1 text-left text-xl font-semibold text-ink hover:underline">
            {task.title}
          </button>
        </div>
        {task.area && (
          <span className="shrink-0 rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-ink-muted">
            {AREA_LABELS[task.area]}
          </span>
        )}
      </div>

      {reasons.length > 0 && (
        <p className="text-sm text-ink-muted">
          Sugerida porque {reasons.map((r) => r.label.toLowerCase()).join(", ")}.
        </p>
      )}

      {task.firstStep && (
        <p className="text-sm text-ink">
          <span className="font-medium">Primeiro passo:</span> {task.firstStep}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        {task.estimatedMinutes && <span>~{task.estimatedMinutes} min</span>}
        {task.energyRequired && <span>Exige {ENERGY_LABELS[task.energyRequired]}</span>}
        {dueLabel && <span>{dueLabel}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={onStart}>
          Começar agora
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onTwoMinutes}>
            Só 2 minutos
          </Button>
          <Button size="sm" variant="secondary" onClick={onBreakdown}>
            Dividir em passos
          </Button>
          <Button size="sm" variant="secondary" onClick={onSwap}>
            Trocar prioridade
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={onUnblock}>
          Não consigo começar
        </Button>
      </div>
    </Card>
  );
}
