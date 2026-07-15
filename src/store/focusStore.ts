import { setDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { distractionNoteDocRef, distractionNotesCol, focusSessionDocRef, newId } from "@/lib/firebase/firestore";
import type { DistractionCategory, DistractionNote, FocusOutcome, FocusPausedInterval, FocusSession } from "@/types";

const STORAGE_KEY = "agora.focus.activeSession";

export interface ActiveFocusSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  firstStep: string | null;
  plannedMinutes: number;
  startedAt: number;
  pausedIntervals: FocusPausedInterval[];
  distractionCount: number;
}

function loadFromStorage(): ActiveFocusSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveFocusSession;
  } catch {
    return null;
  }
}

function saveToStorage(session: ActiveFocusSession | null) {
  if (typeof window === "undefined") return;
  if (session == null) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}

export function computeElapsedMs(session: ActiveFocusSession, now: number): number {
  const pausedMs = session.pausedIntervals.reduce((sum, interval) => {
    const end = interval.end ?? now;
    return sum + Math.max(0, end - interval.start);
  }, 0);
  return Math.max(0, now - session.startedAt - pausedMs);
}

export function isCurrentlyPaused(session: ActiveFocusSession): boolean {
  const last = session.pausedIntervals[session.pausedIntervals.length - 1];
  return last != null && last.end == null;
}

interface FocusState {
  activeSession: ActiveFocusSession | null;
  recentDistractions: DistractionNote[];

  hydrate: () => void;
  start: (
    uid: string,
    args: { taskId: string | null; taskTitle: string | null; firstStep: string | null; plannedMinutes: number }
  ) => Promise<void>;
  pause: () => void;
  resume: () => void;
  registerDistraction: (uid: string, content: string, category: DistractionCategory) => Promise<void>;
  finish: (
    uid: string,
    outcome: FocusOutcome,
    args?: { nextStepChanged?: boolean }
  ) => Promise<void>;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  activeSession: null,
  recentDistractions: [],

  hydrate: () => {
    const stored = loadFromStorage();
    if (stored) set({ activeSession: stored });
  },

  start: async (uid, { taskId, taskTitle, firstStep, plannedMinutes }) => {
    const id = newId(distractionNotesCol(uid));
    const session: ActiveFocusSession = {
      id,
      taskId,
      taskTitle,
      firstStep,
      plannedMinutes,
      startedAt: Date.now(),
      pausedIntervals: [],
      distractionCount: 0
    };
    set({ activeSession: session, recentDistractions: [] });
    saveToStorage(session);

    const doc: FocusSession = {
      id,
      uid,
      taskId,
      plannedMinutes,
      startedAt: session.startedAt,
      endedAt: null,
      pausedIntervals: [],
      outcome: null,
      distractionCount: 0,
      nextStepChanged: false,
      createdAt: session.startedAt,
      updatedAt: session.startedAt
    };
    await setDoc(focusSessionDocRef(uid, id), doc);
  },

  pause: () => {
    const session = get().activeSession;
    if (!session || isCurrentlyPaused(session)) return;
    const updated: ActiveFocusSession = {
      ...session,
      pausedIntervals: [...session.pausedIntervals, { start: Date.now(), end: null }]
    };
    set({ activeSession: updated });
    saveToStorage(updated);
  },

  resume: () => {
    const session = get().activeSession;
    if (!session || !isCurrentlyPaused(session)) return;
    const intervals = [...session.pausedIntervals];
    intervals[intervals.length - 1] = { ...intervals[intervals.length - 1], end: Date.now() };
    const updated: ActiveFocusSession = { ...session, pausedIntervals: intervals };
    set({ activeSession: updated });
    saveToStorage(updated);
  },

  registerDistraction: async (uid, content, category) => {
    const session = get().activeSession;
    if (!session) return;
    const now = Date.now();
    const note: DistractionNote = {
      id: newId(distractionNotesCol(uid)),
      uid,
      focusSessionId: session.id,
      content,
      category,
      resolved: false,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(distractionNoteDocRef(uid, note.id), note);

    const updated: ActiveFocusSession = { ...session, distractionCount: session.distractionCount + 1 };
    set((state) => ({ activeSession: updated, recentDistractions: [note, ...state.recentDistractions] }));
    saveToStorage(updated);
    await updateDoc(focusSessionDocRef(uid, session.id), {
      distractionCount: updated.distractionCount,
      updatedAt: now
    });
  },

  finish: async (uid, outcome, args = {}) => {
    const session = get().activeSession;
    if (!session) return;
    const now = Date.now();
    await updateDoc(focusSessionDocRef(uid, session.id), {
      endedAt: now,
      outcome,
      pausedIntervals: session.pausedIntervals,
      distractionCount: session.distractionCount,
      nextStepChanged: args.nextStepChanged ?? false,
      updatedAt: now
    });
    set({ activeSession: null, recentDistractions: [] });
    saveToStorage(null);
  }
}));
