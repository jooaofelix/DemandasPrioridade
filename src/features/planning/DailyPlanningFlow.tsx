import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useDailyPlanStore } from "@/store/dailyPlanStore";
import { useTaskStore } from "@/store/taskStore";
import { useGamificationStore } from "@/store/gamificationStore";
import type { EnergyLevel, Task } from "@/types";

const ENERGY_OPTIONS: { value: EnergyLevel; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" }
];

const STEPS = 6;

export function DailyPlanningFlow() {
  const navigate = useNavigate();
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const maxDailyPriorities = useAuthStore((s) => s.profile?.settings.maxDailyPriorities ?? 3);
  const tasks = useTaskStore((s) => s.tasks);
  const setEnergy = useDailyPlanStore((s) => s.setEnergy);
  const savePlanning = useDailyPlanStore((s) => s.savePlanning);
  const updateTask = useTaskStore((s) => s.updateTask);
  const recordAction = useGamificationStore((s) => s.recordAction);

  const [step, setStep] = useState(0);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [hasScheduledCommitment, setHasScheduledCommitment] = useState(false);
  const [worthwhileOutcome, setWorthwhileOutcome] = useState("");
  const [mainPriorityTaskId, setMainPriorityTaskId] = useState<string | null>(null);
  const [secondaryTaskIds, setSecondaryTaskIds] = useState<string[]>([]);
  const [firstStep, setFirstStep] = useState("");

  const eligible: Task[] = tasks.filter((t) => t.status === "inbox" || t.status === "planned" || t.status === "active");
  const maxSecondary = Math.max(0, maxDailyPriorities - 1);

  function toggleSecondary(id: string) {
    setSecondaryTaskIds((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= maxSecondary) return prev;
      return [...prev, id];
    });
  }

  async function finish() {
    if (!uid || !mainPriorityTaskId) return;
    await setEnergy(uid, energyLevel);
    await savePlanning(uid, {
      hasScheduledCommitment,
      worthwhileOutcome: worthwhileOutcome.trim() || null,
      mainPriorityTaskId,
      secondaryTaskIds
    });
    if (firstStep.trim()) {
      await updateTask(uid, mainPriorityTaskId, { firstStep: firstStep.trim() });
    }
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
          <StepBlock title="Como está sua energia?">
            <div className="flex gap-2">
              {ENERGY_OPTIONS.map((opt) => (
                <Chip key={opt.value} selected={energyLevel === opt.value} onClick={() => setEnergyLevel(opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </StepBlock>
        )}

        {step === 1 && (
          <StepBlock title="Existe algum compromisso com horário hoje?">
            <div className="flex gap-2">
              <Chip selected={hasScheduledCommitment} onClick={() => setHasScheduledCommitment(true)}>
                Sim
              </Chip>
              <Chip selected={!hasScheduledCommitment} onClick={() => setHasScheduledCommitment(false)}>
                Não
              </Chip>
            </div>
          </StepBlock>
        )}

        {step === 2 && (
          <StepBlock title="Qual resultado faria o dia valer a pena?">
            <TextField
              label="Em poucas palavras"
              value={worthwhileOutcome}
              onChange={(e) => setWorthwhileOutcome(e.target.value)}
              autoFocus
            />
          </StepBlock>
        )}

        {step === 3 && (
          <StepBlock title="Escolha uma prioridade principal">
            <TaskPicker
              tasks={eligible}
              selectedIds={mainPriorityTaskId ? [mainPriorityTaskId] : []}
              onToggle={(id) => setMainPriorityTaskId(id)}
            />
          </StepBlock>
        )}

        {step === 4 && (
          <StepBlock title={`Escolha até ${maxSecondary} prioridades secundárias`}>
            <TaskPicker
              tasks={eligible.filter((t) => t.id !== mainPriorityTaskId)}
              selectedIds={secondaryTaskIds}
              onToggle={toggleSecondary}
            />
          </StepBlock>
        )}

        {step === 5 && (
          <StepBlock title="Qual é o primeiro passo da prioridade principal?">
            <TextField
              label="Primeiro passo (opcional)"
              value={firstStep}
              onChange={(e) => setFirstStep(e.target.value)}
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
          <Button fullWidth onClick={() => setStep((s) => s + 1)} disabled={step === 3 && !mainPriorityTaskId}>
            Continuar
          </Button>
        )}
        {step === STEPS - 1 && (
          <Button fullWidth onClick={finish}>
            Concluir planejamento
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

function TaskPicker({
  tasks,
  selectedIds,
  onToggle
}: {
  tasks: Task[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return <p className="text-sm text-ink-faint">Nenhuma tarefa disponível. Tire algo da cabeça primeiro.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onToggle(task.id)}
          className={`rounded-control border p-3 text-left text-sm transition-colors ${
            selectedIds.includes(task.id) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border bg-surface-raised text-ink"
          }`}
        >
          {task.title}
        </button>
      ))}
    </div>
  );
}
