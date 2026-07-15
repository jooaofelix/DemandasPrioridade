import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { useAuthStore } from "@/store/authStore";
import { useFocusStore } from "@/store/focusStore";
import { useTaskStore } from "@/store/taskStore";
import type { GamificationLevel, ReminderStyle, TaskArea } from "@/types";

const AREA_OPTIONS: { value: TaskArea; label: string }[] = [
  { value: "work", label: "Trabalho" },
  { value: "study", label: "Estudos" },
  { value: "personal", label: "Pessoal" },
  { value: "home", label: "Casa" }
];

const ENERGY_OPTIONS: { value: "morning" | "afternoon" | "evening" | "variable"; label: string }[] = [
  { value: "morning", label: "Manhã" },
  { value: "afternoon", label: "Tarde" },
  { value: "evening", label: "Noite" },
  { value: "variable", label: "Varia bastante" }
];

const REMINDER_OPTIONS: { value: ReminderStyle; label: string; description: string }[] = [
  { value: "direct", label: "Direto", description: '"Começar relatório — abrir a planilha."' },
  { value: "warm", label: "Acolhedor", description: '"Vamos começar só abrindo a planilha?"' }
];

const PRIORITY_COUNT_OPTIONS: (1 | 2 | 3)[] = [1, 2, 3];

const GAMIFICATION_OPTIONS: { value: GamificationLevel; label: string; description: string }[] = [
  { value: "off", label: "Desligada", description: "Só as funções essenciais." },
  { value: "discrete", label: "Discreta", description: "Pequenos registros, sem exagero." },
  { value: "full", label: "Completa", description: "Pontos e celebrações visíveis." }
];

const TOTAL_STEPS = 6;

export function OnboardingFlow() {
  const navigate = useNavigate();
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const createTask = useTaskStore((s) => s.createTask);
  const startFocus = useFocusStore((s) => s.start);

  const [step, setStep] = useState(0);
  const [focusAreas, setFocusAreas] = useState<TaskArea[]>([]);
  const [energyPeriod, setEnergyPeriod] = useState<"morning" | "afternoon" | "evening" | "variable">("morning");
  const [reminderStyle, setReminderStyle] = useState<ReminderStyle>("warm");
  const [maxDailyPriorities, setMaxDailyPriorities] = useState<1 | 2 | 3>(3);
  const [gamificationLevel, setGamificationLevel] = useState<GamificationLevel>("discrete");
  const [firstTaskTitle, setFirstTaskTitle] = useState("");
  const [creatingFirstTask, setCreatingFirstTask] = useState(false);

  function toggleArea(area: TaskArea) {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
  }

  async function finishConfigAndGoToFirstTask() {
    if (uid) {
      await updateSettings({
        focusAreas,
        energyPeriod,
        reminderStyle,
        maxDailyPriorities,
        gamificationLevel
      });
    }
    setStep(TOTAL_STEPS - 1);
  }

  async function skipOnboarding() {
    await completeOnboarding();
    navigate("/agora", { replace: true });
  }

  async function createFirstTaskAndFocus() {
    if (!uid || !firstTaskTitle.trim()) return;
    setCreatingFirstTask(true);
    try {
      const task = await createTask(uid, { title: firstTaskTitle.trim(), source: "onboarding" });
      await completeOnboarding();
      await startFocus(uid, {
        taskId: task.id,
        taskTitle: task.title,
        firstStep: task.firstStep,
        plannedMinutes: 2
      });
      navigate("/foco", { replace: true });
    } finally {
      setCreatingFirstTask(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-between px-6 py-8">
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-brand-500" : "bg-surface-sunken"}`}
              />
            ))}
          </div>
          {step < TOTAL_STEPS - 1 && (
            <button onClick={skipOnboarding} className="text-sm font-medium text-ink-muted hover:text-ink">
              Pular
            </button>
          )}
        </div>

        {step === 0 && (
          <StepShell title="Em quais áreas você quer ajuda?" description="Escolha uma ou mais.">
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map((opt) => (
                <Chip key={opt.value} selected={focusAreas.includes(opt.value)} onClick={() => toggleArea(opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="Em que período você costuma ter mais energia?">
            <div className="flex flex-wrap gap-2">
              {ENERGY_OPTIONS.map((opt) => (
                <Chip key={opt.value} selected={energyPeriod === opt.value} onClick={() => setEnergyPeriod(opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Qual estilo de lembrete você prefere?">
            <div className="flex flex-col gap-2">
              {REMINDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setReminderStyle(opt.value)}
                  className={`rounded-control border p-4 text-left transition-colors ${
                    reminderStyle === opt.value ? "border-brand-500 bg-brand-50" : "border-border bg-surface-raised"
                  }`}
                >
                  <p className="font-medium text-ink">{opt.label}</p>
                  <p className="mt-1 text-sm text-ink-muted">{opt.description}</p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="Quantas prioridades você quer ver por dia?" description="No máximo três, de propósito.">
            <div className="flex gap-2">
              {PRIORITY_COUNT_OPTIONS.map((n) => (
                <Chip key={n} selected={maxDailyPriorities === n} onClick={() => setMaxDailyPriorities(n)}>
                  {n}
                </Chip>
              ))}
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Quer usar gamificação?" description="Você pode mudar isso a qualquer momento.">
            <div className="flex flex-col gap-2">
              {GAMIFICATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGamificationLevel(opt.value)}
                  className={`rounded-control border p-4 text-left transition-colors ${
                    gamificationLevel === opt.value ? "border-brand-500 bg-brand-50" : "border-border bg-surface-raised"
                  }`}
                >
                  <p className="font-medium text-ink">{opt.label}</p>
                  <p className="mt-1 text-sm text-ink-muted">{opt.description}</p>
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === TOTAL_STEPS - 1 && (
          <StepShell
            title="Vamos experimentar?"
            description="Escreva uma coisa que está na sua cabeça agora. Vamos começar com só dois minutos."
          >
            <TextField
              label="Primeira tarefa"
              placeholder="Ex.: responder o e-mail do trabalho"
              value={firstTaskTitle}
              onChange={(e) => setFirstTaskTitle(e.target.value)}
              autoFocus
            />
          </StepShell>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
        )}
        {step < TOTAL_STEPS - 2 && (
          <Button fullWidth onClick={() => setStep((s) => s + 1)}>
            Continuar
          </Button>
        )}
        {step === TOTAL_STEPS - 2 && (
          <Button fullWidth onClick={finishConfigAndGoToFirstTask}>
            Continuar
          </Button>
        )}
        {step === TOTAL_STEPS - 1 && (
          <Button fullWidth onClick={createFirstTaskAndFocus} disabled={!firstTaskTitle.trim() || creatingFirstTask}>
            {creatingFirstTask ? "Preparando..." : "Começar 2 minutos"}
          </Button>
        )}
      </div>
    </div>
  );
}

function StepShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
