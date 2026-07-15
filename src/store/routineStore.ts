import { deleteDoc, onSnapshot, orderBy, query, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { create } from "zustand";
import { db } from "@/lib/firebase/config";
import {
  newId,
  routineDocRef,
  routineStepDocRef,
  routineStepsCol,
  routinesCol
} from "@/lib/firebase/firestore";
import type { RoutineInput } from "@/lib/validation/schemas";
import type { Routine, RoutineStep } from "@/types";

interface RoutineState {
  routines: Routine[];
  loaded: boolean;
  stepsByRoutineId: Record<string, RoutineStep[]>;

  createRoutine: (uid: string, input: RoutineInput) => Promise<string>;
  updateRoutine: (uid: string, routineId: string, patch: Partial<Routine>) => Promise<void>;
  archiveRoutine: (uid: string, routineId: string) => Promise<void>;
  deleteRoutine: (uid: string, routineId: string) => Promise<void>;

  subscribeSteps: (uid: string, routineId: string) => () => void;
  addStep: (uid: string, routineId: string, title: string, optional?: boolean) => Promise<void>;
  reorderSteps: (uid: string, routineId: string, orderedStepIds: string[]) => Promise<void>;
  deleteStep: (uid: string, routineId: string, stepId: string) => Promise<void>;
  recordRun: (uid: string, routineId: string, dateId: string, completedStepIds: string[]) => Promise<void>;
}

export const useRoutineStore = create<RoutineState>((_set, get) => ({
  routines: [],
  loaded: false,
  stepsByRoutineId: {},

  createRoutine: async (uid, input) => {
    const now = Date.now();
    const id = newId(routinesCol(uid));
    const routine: Routine = {
      id,
      uid,
      name: input.name,
      description: input.description ?? null,
      icon: null,
      daysOfWeek: input.daysOfWeek,
      timeOfDay: input.timeOfDay ?? null,
      linkedEventLabel: input.linkedEventLabel ?? null,
      active: true,
      lastRunDate: null,
      lastRunCompletedStepIds: [],
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
      deletedAt: null
    };
    await setDoc(routineDocRef(uid, id), routine);
    return id;
  },

  updateRoutine: async (uid, routineId, patch) => {
    await updateDoc(routineDocRef(uid, routineId), { ...patch, updatedAt: Date.now() });
  },

  archiveRoutine: async (uid, routineId) => {
    await updateDoc(routineDocRef(uid, routineId), { active: false, archivedAt: Date.now(), updatedAt: Date.now() });
  },

  deleteRoutine: async (uid, routineId) => {
    await deleteDoc(routineDocRef(uid, routineId));
  },

  subscribeSteps: (uid, routineId) => {
    const q = query(routineStepsCol(uid, routineId), orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
      const steps = snapshot.docs.map((d) => d.data());
      useRoutineStore.setState((state) => ({
        stepsByRoutineId: { ...state.stepsByRoutineId, [routineId]: steps }
      }));
    });
  },

  addStep: async (uid, routineId, title, optional = false) => {
    const now = Date.now();
    const existing = get().stepsByRoutineId[routineId] ?? [];
    const id = newId(routineStepsCol(uid, routineId));
    const step: RoutineStep = {
      id,
      uid,
      routineId,
      title,
      order: existing.length,
      optional,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(routineStepDocRef(uid, routineId, id), step);
  },

  reorderSteps: async (uid, routineId, orderedStepIds) => {
    const batch = writeBatch(db);
    orderedStepIds.forEach((stepId, index) => {
      batch.update(routineStepDocRef(uid, routineId, stepId), { order: index, updatedAt: Date.now() });
    });
    await batch.commit();
  },

  deleteStep: async (uid, routineId, stepId) => {
    await deleteDoc(routineStepDocRef(uid, routineId, stepId));
  },

  recordRun: async (uid, routineId, dateId, completedStepIds) => {
    await updateDoc(routineDocRef(uid, routineId), {
      lastRunDate: dateId,
      lastRunCompletedStepIds: completedStepIds,
      updatedAt: Date.now()
    });
  }
}));

export function initRoutineListener(uid: string): () => void {
  const q = query(routinesCol(uid), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map((d) => d.data());
    useRoutineStore.setState({ routines, loaded: true });
  });
}
