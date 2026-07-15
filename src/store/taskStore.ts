import { deleteDoc, onSnapshot, orderBy, query, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { create } from "zustand";
import { db } from "@/lib/firebase/config";
import { newId, subtaskDocRef, subtasksCol, taskDocRef, tasksCol } from "@/lib/firebase/firestore";
import type { Subtask, Task, TaskSource } from "@/types";

function draftTask(uid: string, title: string, overrides: Partial<Task> = {}): Task {
  const now = Date.now();
  return {
    id: newId(tasksCol(uid)),
    uid,
    title,
    notes: null,
    status: "planned",
    source: "manual",
    area: null,
    dueAt: null,
    estimatedMinutes: null,
    energyRequired: null,
    importance: null,
    consequenceIfSkipped: null,
    isBlockingOtherTasks: false,
    dependsOnTaskIds: [],
    manualPriorityPin: false,
    firstStep: null,
    minimalVersion: null,
    ifThenPlan: null,
    blockingThought: null,
    estimatePrediction: null,
    actualReflection: null,
    rewardId: null,
    completedAt: null,
    postponedCount: 0,
    lastTouchedAt: now,
    version: 1,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    deletedAt: null,
    ...overrides
  };
}

interface TaskState {
  tasks: Task[];
  loaded: boolean;
  subtasksByTaskId: Record<string, Subtask[]>;

  quickCreate: (uid: string, title: string, source?: TaskSource) => Promise<Task>;
  createTask: (uid: string, input: Partial<Task> & { title: string }) => Promise<Task>;
  updateTask: (uid: string, taskId: string, patch: Partial<Task>) => Promise<void>;
  completeTask: (uid: string, taskId: string) => Promise<void>;
  reopenTask: (uid: string, taskId: string) => Promise<void>;
  postponeTask: (uid: string, taskId: string, newDueAt: number | null) => Promise<void>;
  cancelTask: (uid: string, taskId: string) => Promise<void>;
  deleteTask: (uid: string, taskId: string) => Promise<void>;
  setPin: (uid: string, taskId: string, pinned: boolean) => Promise<void>;
  touchTask: (uid: string, taskId: string) => Promise<void>;

  subscribeSubtasks: (uid: string, taskId: string) => () => void;
  addSubtasks: (uid: string, taskId: string, titles: string[]) => Promise<void>;
  toggleSubtask: (uid: string, taskId: string, subtaskId: string) => Promise<void>;
  deleteSubtask: (uid: string, taskId: string, subtaskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loaded: false,
  subtasksByTaskId: {},

  quickCreate: async (uid, title, source = "quick_capture") => {
    const task = draftTask(uid, title, { source, status: "inbox" });
    await setDoc(taskDocRef(uid, task.id), task);
    return task;
  },

  createTask: async (uid, input) => {
    const { title, ...overrides } = input;
    const task = draftTask(uid, title, overrides);
    await setDoc(taskDocRef(uid, task.id), task);
    return task;
  },

  updateTask: async (uid, taskId, patch) => {
    await updateDoc(taskDocRef(uid, taskId), { ...patch, updatedAt: Date.now(), lastTouchedAt: Date.now() });
  },

  completeTask: async (uid, taskId) => {
    const now = Date.now();
    await updateDoc(taskDocRef(uid, taskId), { status: "done", completedAt: now, updatedAt: now, lastTouchedAt: now });
  },

  reopenTask: async (uid, taskId) => {
    await updateDoc(taskDocRef(uid, taskId), {
      status: "planned",
      completedAt: null,
      updatedAt: Date.now(),
      lastTouchedAt: Date.now()
    });
  },

  postponeTask: async (uid, taskId, newDueAt) => {
    const task = get().tasks.find((t) => t.id === taskId);
    await updateDoc(taskDocRef(uid, taskId), {
      status: "planned",
      dueAt: newDueAt,
      postponedCount: (task?.postponedCount ?? 0) + 1,
      updatedAt: Date.now(),
      lastTouchedAt: Date.now()
    });
  },

  cancelTask: async (uid, taskId) => {
    await updateDoc(taskDocRef(uid, taskId), {
      status: "cancelled",
      archivedAt: Date.now(),
      updatedAt: Date.now()
    });
  },

  deleteTask: async (uid, taskId) => {
    await deleteDoc(taskDocRef(uid, taskId));
  },

  setPin: async (uid, taskId, pinned) => {
    await updateDoc(taskDocRef(uid, taskId), { manualPriorityPin: pinned, updatedAt: Date.now() });
  },

  touchTask: async (uid, taskId) => {
    await updateDoc(taskDocRef(uid, taskId), { lastTouchedAt: Date.now() });
  },

  subscribeSubtasks: (uid, taskId) => {
    const q = query(subtasksCol(uid, taskId), orderBy("order", "asc"));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => d.data());
      set((state) => ({ subtasksByTaskId: { ...state.subtasksByTaskId, [taskId]: items } }));
    });
  },

  addSubtasks: async (uid, taskId, titles) => {
    const batch = writeBatch(db);
    const now = Date.now();
    const existing = get().subtasksByTaskId[taskId] ?? [];
    titles.forEach((title, index) => {
      const id = newId(subtasksCol(uid, taskId));
      const subtask: Subtask = {
        id,
        uid,
        taskId,
        title,
        done: false,
        order: existing.length + index,
        completedAt: null,
        createdAt: now,
        updatedAt: now
      };
      batch.set(subtaskDocRef(uid, taskId, id), subtask);
    });
    await batch.commit();
  },

  toggleSubtask: async (uid, taskId, subtaskId) => {
    const subtask = (get().subtasksByTaskId[taskId] ?? []).find((s) => s.id === subtaskId);
    if (!subtask) return;
    await updateDoc(subtaskDocRef(uid, taskId, subtaskId), {
      done: !subtask.done,
      completedAt: !subtask.done ? Date.now() : null,
      updatedAt: Date.now()
    });
  },

  deleteSubtask: async (uid, taskId, subtaskId) => {
    await deleteDoc(subtaskDocRef(uid, taskId, subtaskId));
  }
}));

export function initTaskListener(uid: string): () => void {
  const q = query(tasksCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => d.data());
    useTaskStore.setState({ tasks, loaded: true });
  });
}
