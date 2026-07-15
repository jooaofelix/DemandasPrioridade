import { useMemo, useState } from "react";
import { setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { newId, weeklyReviewsCol, weeklyReviewDocRef } from "@/lib/firebase/firestore";
import { ENVIRONMENT_STAGES, stageForPoints, pointsToNextStage } from "@/lib/gamification/engine";
import { computeWeeklyReview } from "@/lib/weeklyReview/compute";
import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useRoutineStore } from "@/store/routineStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";

const ACHIEVEMENT_TITLES: Record<string, string> = {
  started_first_task: "Primeira tarefa começada",
  captured_first_thought: "Primeira ideia tirada da cabeça",
  split_a_task: "Dividiu uma tarefa grande",
  asked_for_help: "Pediu ajuda",
  cancelled_with_clarity: "Cancelou com clareza",
  replanned_day: "Reorganizou o dia",
  made_minimal_version: "Fez uma versão mínima",
  resumed_after_break: "Voltou depois de uma pausa",
  respected_own_limit: "Respeitou o próprio limite",
  completed_five_tasks: "Cinco tarefas concluídas",
  used_focus_mode: "Usou o modo foco"
};

export function ProgressScreen() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const gamificationLevel = useAuthStore((s) => s.profile?.settings.gamificationLevel ?? "discrete");
  const points = useAuthStore((s) => s.profile?.gamification.points ?? 0);
  const achievements = useGamificationStore((s) => s.achievements);
  const tasks = useTaskStore((s) => s.tasks);
  const routines = useRoutineStore((s) => s.routines);
  const showToast = useUiStore((s) => s.showToast);
  const [saving, setSaving] = useState(false);

  const stage = stageForPoints(points);
  const nextStagePoints = pointsToNextStage(points);
  const stageIndex = ENVIRONMENT_STAGES.findIndex((s) => s.stage === stage.stage);
  const nextStage = ENVIRONMENT_STAGES[stageIndex + 1];

  const review = useMemo(() => computeWeeklyReview(tasks, routines), [tasks, routines]);

  async function saveReview() {
    if (!uid) return;
    setSaving(true);
    try {
      const id = newId(weeklyReviewsCol(uid));
      await setDoc(weeklyReviewDocRef(uid, id), { id, uid, ...review, createdAt: Date.now() });
      showToast("Revisão semanal salva.", "success");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-28 pt-6">
      <header>
        <h1 className="text-xl font-semibold text-ink">Progresso</h1>
        <p className="text-sm text-ink-muted">Sem sequências que zeram, sem comparação com ninguém.</p>
      </header>

      {gamificationLevel !== "off" && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">{stage.title}</p>
          {nextStage ? (
            <>
              <ProgressBar value={points} max={nextStage.threshold} label="Progresso até o próximo estágio" />
              <p className="text-xs text-ink-muted">{nextStagePoints} pontos até o próximo estágio.</p>
            </>
          ) : (
            <p className="text-xs text-ink-muted">Estágio máximo alcançado — obrigado por usar o AGORA.</p>
          )}
        </Card>
      )}

      {gamificationLevel !== "off" && achievements.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">Conquistas</h2>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => (
              <Card key={a.id} className="p-3 text-center">
                <p className="text-xs font-medium text-ink">{ACHIEVEMENT_TITLES[a.key] ?? a.key}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Revisão semanal</h2>
          <Button size="sm" variant="secondary" onClick={saveReview} disabled={saving}>
            Salvar
          </Button>
        </div>
        <Card className="flex flex-col gap-2">
          <p className="text-sm text-ink">
            {review.completedCount} concluída(s) · {review.startedCount} tocada(s) esta semana
          </p>
          {review.removedOrDelegatedCount > 0 && (
            <p className="text-sm text-ink-muted">{review.removedOrDelegatedCount} removida(s) ou canceladas com clareza.</p>
          )}
          {review.insights.length === 0 && (
            <p className="text-sm text-ink-faint">Ainda não há dados suficientes para insights esta semana.</p>
          )}
          {review.insights.map((insight, i) => (
            <p key={i} className="text-sm text-ink-muted">
              {insight}
            </p>
          ))}
        </Card>
      </section>
    </div>
  );
}
