import { useEffect } from "react";
import { initDailyPlanListener, useDailyPlanStore } from "@/store/dailyPlanStore";
import { initGamificationListener } from "@/store/gamificationStore";
import { initInboxListener } from "@/store/inboxStore";
import { initReminderListener } from "@/store/reminderStore";
import { initRoutineListener } from "@/store/routineStore";
import { initTaskListener } from "@/store/taskStore";

/** Assina todas as coleções do usuário autenticado e garante o plano do dia. */
export function useDataSubscriptions(uid: string | null): void {
  useEffect(() => {
    if (!uid) return;

    useDailyPlanStore.getState().ensureToday(uid);

    const unsubscribers = [
      initTaskListener(uid),
      initInboxListener(uid),
      initRoutineListener(uid),
      initDailyPlanListener(uid),
      initGamificationListener(uid),
      initReminderListener(uid)
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [uid]);
}
