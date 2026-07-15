import { getDoc, increment, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { achievementDocRef, achievementsCol, userDocRef } from "@/lib/firebase/firestore";
import { ACTION_TO_ACHIEVEMENT, type GamificationAction, pointsForAction } from "@/lib/gamification/engine";
import { useAuthStore } from "@/store/authStore";
import type { Achievement } from "@/types";

interface GamificationState {
  achievements: Achievement[];
  loaded: boolean;
  celebration: { message: string } | null;
  dismissCelebration: () => void;
  recordAction: (uid: string, action: GamificationAction) => Promise<void>;
}

const ACHIEVEMENT_MESSAGES: Partial<Record<Achievement["key"], string>> = {
  started_first_task: "Você começou sua primeira tarefa.",
  captured_first_thought: "Primeira ideia tirada da cabeça.",
  split_a_task: "Boa: dividir uma tarefa grande também é progresso.",
  asked_for_help: "Pedir ajuda também conta como avanço.",
  cancelled_with_clarity: "Cancelar algo que perdeu sentido é uma decisão válida.",
  replanned_day: "Reorganizar o dia com consciência é uma habilidade.",
  made_minimal_version: "Uma versão mínima ainda é um avanço real.",
  resumed_after_break: "Bom te ver de volta. Isso também é constância.",
  respected_own_limit: "Respeitar o próprio limite é progresso, não desistência.",
  completed_five_tasks: "Cinco tarefas concluídas.",
  used_focus_mode: "Primeira sessão de foco concluída."
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  achievements: [],
  loaded: false,
  celebration: null,

  dismissCelebration: () => set({ celebration: null }),

  recordAction: async (uid, action) => {
    const level = useAuthStore.getState().profile?.settings.gamificationLevel ?? "discrete";
    if (level === "off") return;

    const points = pointsForAction(action);
    await updateDoc(userDocRef(uid), { "gamification.points": increment(points), updatedAt: Date.now() });

    const achievementKey = ACTION_TO_ACHIEVEMENT[action];
    if (!achievementKey) return;

    const alreadyUnlocked = get().achievements.some((a) => a.key === achievementKey);
    if (alreadyUnlocked) return;

    const ref = achievementDocRef(uid, achievementKey);
    const existing = await getDoc(ref);
    if (existing.exists()) return;

    const achievement: Achievement = {
      id: achievementKey,
      uid,
      key: achievementKey,
      unlockedAt: Date.now(),
      meta: null
    };
    await setDoc(ref, achievement);

    if (level === "full") {
      const message = ACHIEVEMENT_MESSAGES[achievementKey];
      if (message) set({ celebration: { message } });
    }
  }
}));

export function initGamificationListener(uid: string): () => void {
  const q = query(achievementsCol(uid), orderBy("unlockedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const achievements = snapshot.docs.map((d) => d.data());
    useGamificationStore.setState({ achievements, loaded: true });
  });
}
