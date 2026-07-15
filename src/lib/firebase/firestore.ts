import {
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type FirestoreDataConverter,
  collection,
  doc
} from "firebase/firestore";
import { db } from "./config";
import type {
  Achievement,
  DailyPlan,
  DistractionNote,
  EnergyCheckin,
  FocusSession,
  InboxItem,
  Reminder,
  Reward,
  Routine,
  RoutineStep,
  Subtask,
  Task,
  TaskArea,
  WeeklyReview
} from "@/types";

/** Conversor de identidade: os documentos já são objetos JSON simples (sem Timestamp do Firestore). */
function identityConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: T) => data as DocumentData,
    fromFirestore: (snapshot) => ({ id: snapshot.id, ...snapshot.data() }) as unknown as T
  };
}

function typedCollection<T extends DocumentData>(path: string, ...pathSegments: string[]): CollectionReference<T> {
  return collection(db, path, ...pathSegments).withConverter(identityConverter<T>());
}

function typedDoc<T extends DocumentData>(path: string, ...pathSegments: string[]): DocumentReference<T> {
  return doc(db, path, ...pathSegments).withConverter(identityConverter<T>());
}

export interface UserDocument {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  timezone: string;
  onboardingCompletedAt: number | null;
  createdAt: number;
  updatedAt: number;
  settings: {
    energyPeriod: "morning" | "afternoon" | "evening" | "variable" | null;
    reminderStyle: "direct" | "warm";
    maxDailyPriorities: 1 | 2 | 3;
    gamificationLevel: "off" | "discrete" | "full";
    theme: "light" | "dark" | "system";
    reducedMotion: boolean;
    focusAreas: TaskArea[];
    version: number;
  };
  gamification: {
    points: number;
  };
  notificationPreferences: {
    enabled: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    maxPerDay: number;
    daysOfWeek: number[];
    style: "direct" | "warm";
    typesEnabled: Record<string, boolean>;
  };
}

export const userDocRef = (uid: string) => typedDoc<UserDocument>("users", uid);

export const tasksCol = (uid: string) => typedCollection<Task>("users", uid, "tasks");
export const taskDocRef = (uid: string, taskId: string) => typedDoc<Task>("users", uid, "tasks", taskId);

export const subtasksCol = (uid: string, taskId: string) =>
  typedCollection<Subtask>("users", uid, "tasks", taskId, "subtasks");
export const subtaskDocRef = (uid: string, taskId: string, subtaskId: string) =>
  typedDoc<Subtask>("users", uid, "tasks", taskId, "subtasks", subtaskId);

export const inboxCol = (uid: string) => typedCollection<InboxItem>("users", uid, "inboxItems");
export const inboxDocRef = (uid: string, itemId: string) => typedDoc<InboxItem>("users", uid, "inboxItems", itemId);

export const dailyPlansCol = (uid: string) => typedCollection<DailyPlan>("users", uid, "dailyPlans");
export const dailyPlanDocRef = (uid: string, planId: string) =>
  typedDoc<DailyPlan>("users", uid, "dailyPlans", planId);

export const routinesCol = (uid: string) => typedCollection<Routine>("users", uid, "routines");
export const routineDocRef = (uid: string, routineId: string) =>
  typedDoc<Routine>("users", uid, "routines", routineId);

export const routineStepsCol = (uid: string, routineId: string) =>
  typedCollection<RoutineStep>("users", uid, "routines", routineId, "steps");
export const routineStepDocRef = (uid: string, routineId: string, stepId: string) =>
  typedDoc<RoutineStep>("users", uid, "routines", routineId, "steps", stepId);

export const focusSessionsCol = (uid: string) => typedCollection<FocusSession>("users", uid, "focusSessions");
export const focusSessionDocRef = (uid: string, sessionId: string) =>
  typedDoc<FocusSession>("users", uid, "focusSessions", sessionId);

export const distractionNotesCol = (uid: string) =>
  typedCollection<DistractionNote>("users", uid, "distractionNotes");
export const distractionNoteDocRef = (uid: string, noteId: string) =>
  typedDoc<DistractionNote>("users", uid, "distractionNotes", noteId);

export const remindersCol = (uid: string) => typedCollection<Reminder>("users", uid, "reminders");
export const reminderDocRef = (uid: string, reminderId: string) =>
  typedDoc<Reminder>("users", uid, "reminders", reminderId);

export const energyCheckinsCol = (uid: string) => typedCollection<EnergyCheckin>("users", uid, "energyCheckins");
export const energyCheckinDocRef = (uid: string, checkinId: string) =>
  typedDoc<EnergyCheckin>("users", uid, "energyCheckins", checkinId);

export const weeklyReviewsCol = (uid: string) => typedCollection<WeeklyReview>("users", uid, "weeklyReviews");
export const weeklyReviewDocRef = (uid: string, reviewId: string) =>
  typedDoc<WeeklyReview>("users", uid, "weeklyReviews", reviewId);

export const rewardsCol = (uid: string) => typedCollection<Reward>("users", uid, "rewards");
export const rewardDocRef = (uid: string, rewardId: string) => typedDoc<Reward>("users", uid, "rewards", rewardId);

export const achievementsCol = (uid: string) => typedCollection<Achievement>("users", uid, "achievements");
export const achievementDocRef = (uid: string, achievementId: string) =>
  typedDoc<Achievement>("users", uid, "achievements", achievementId);

export function newId(col: CollectionReference<DocumentData>): string {
  return doc(col).id;
}
