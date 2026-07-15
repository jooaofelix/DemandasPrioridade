import { deleteDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { newId, reminderDocRef, remindersCol } from "@/lib/firebase/firestore";
import type { Reminder, ReminderStatus, ReminderStyle, ReminderType } from "@/types";

interface ReminderState {
  reminders: Reminder[];
  loaded: boolean;
  create: (
    uid: string,
    input: {
      type: ReminderType;
      scheduledAt: number;
      style: ReminderStyle;
      message?: string | null;
      taskId?: string | null;
      routineId?: string | null;
    }
  ) => Promise<void>;
  updateStatus: (uid: string, reminderId: string, status: ReminderStatus, extra?: Partial<Reminder>) => Promise<void>;
  remove: (uid: string, reminderId: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>(() => ({
  reminders: [],
  loaded: false,

  create: async (uid, input) => {
    const now = Date.now();
    const reminder: Reminder = {
      id: newId(remindersCol(uid)),
      uid,
      taskId: input.taskId ?? null,
      routineId: input.routineId ?? null,
      type: input.type,
      scheduledAt: input.scheduledAt,
      style: input.style,
      message: input.message ?? null,
      status: "scheduled",
      snoozeCount: 0,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(reminderDocRef(uid, reminder.id), reminder);
  },

  updateStatus: async (uid, reminderId, status, extra = {}) => {
    await updateDoc(reminderDocRef(uid, reminderId), { status, ...extra, updatedAt: Date.now() });
  },

  remove: async (uid, reminderId) => {
    await deleteDoc(reminderDocRef(uid, reminderId));
  }
}));

export function initReminderListener(uid: string): () => void {
  const q = query(remindersCol(uid), orderBy("scheduledAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const reminders = snapshot.docs.map((d) => d.data());
    useReminderStore.setState({ reminders, loaded: true });
  });
}
