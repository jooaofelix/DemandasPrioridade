import { onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { dailyPlanDocRef, energyCheckinDocRef, energyCheckinsCol, newId } from "@/lib/firebase/firestore";
import type { DailyPlan, EnergyCheckin, EnergyLevel, Mood } from "@/types";

export function todayId(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function emptyPlan(uid: string, dateId: string): DailyPlan {
  const now = Date.now();
  return {
    id: dateId,
    uid,
    date: dateId,
    energyLevel: null,
    mood: null,
    hasScheduledCommitment: false,
    worthwhileOutcome: null,
    mainPriorityTaskId: null,
    secondaryTaskIds: [],
    notNormalDay: false,
    closedAt: null,
    closingNotes: null,
    createdAt: now,
    updatedAt: now
  };
}

interface DailyPlanState {
  today: DailyPlan | null;
  loaded: boolean;

  ensureToday: (uid: string) => Promise<void>;
  setEnergy: (uid: string, level: EnergyLevel, mood?: Mood | null) => Promise<void>;
  setNotNormalDay: (uid: string, value: boolean) => Promise<void>;
  savePlanning: (
    uid: string,
    patch: Pick<
      DailyPlan,
      "hasScheduledCommitment" | "worthwhileOutcome" | "mainPriorityTaskId" | "secondaryTaskIds"
    >
  ) => Promise<void>;
  swapMainPriority: (uid: string, taskId: string) => Promise<void>;
  closeDay: (uid: string, closing: NonNullable<DailyPlan["closingNotes"]>) => Promise<void>;
}

export const useDailyPlanStore = create<DailyPlanState>(() => ({
  today: null,
  loaded: false,

  ensureToday: async (uid) => {
    const dateId = todayId();
    const ref = dailyPlanDocRef(uid, dateId);
    await setDoc(ref, emptyPlan(uid, dateId), { merge: true });
  },

  setEnergy: async (uid, level, mood = null) => {
    const dateId = todayId();
    await setDoc(
      dailyPlanDocRef(uid, dateId),
      { energyLevel: level, mood, updatedAt: Date.now() },
      { merge: true }
    );
    const checkin: EnergyCheckin = {
      id: newId(energyCheckinsCol(uid)),
      uid,
      level,
      mood,
      notNormalDay: false,
      createdAt: Date.now()
    };
    await setDoc(energyCheckinDocRef(uid, checkin.id), checkin);
  },

  setNotNormalDay: async (uid, value) => {
    const dateId = todayId();
    await setDoc(dailyPlanDocRef(uid, dateId), { notNormalDay: value, updatedAt: Date.now() }, { merge: true });
  },

  savePlanning: async (uid, patch) => {
    const dateId = todayId();
    await setDoc(dailyPlanDocRef(uid, dateId), { ...patch, updatedAt: Date.now() }, { merge: true });
  },

  swapMainPriority: async (uid, taskId) => {
    const dateId = todayId();
    await updateDoc(dailyPlanDocRef(uid, dateId), { mainPriorityTaskId: taskId, updatedAt: Date.now() });
  },

  closeDay: async (uid, closing) => {
    const dateId = todayId();
    await setDoc(
      dailyPlanDocRef(uid, dateId),
      { closedAt: Date.now(), closingNotes: closing, updatedAt: Date.now() },
      { merge: true }
    );
  }
}));

export function initDailyPlanListener(uid: string): () => void {
  const dateId = todayId();
  return onSnapshot(dailyPlanDocRef(uid, dateId), (snapshot) => {
    if (snapshot.exists()) {
      useDailyPlanStore.setState({ today: snapshot.data(), loaded: true });
    } else {
      useDailyPlanStore.setState({ today: emptyPlan(uid, dateId), loaded: true });
    }
  });
}
