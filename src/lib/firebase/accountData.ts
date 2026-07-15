import { deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import type { User } from "firebase/auth";
import { db } from "./config";
import {
  achievementsCol,
  dailyPlansCol,
  distractionNotesCol,
  energyCheckinsCol,
  focusSessionsCol,
  inboxCol,
  remindersCol,
  rewardsCol,
  routineStepsCol,
  routinesCol,
  subtasksCol,
  tasksCol,
  userDocRef,
  weeklyReviewsCol
} from "./firestore";

async function fetchAll(uid: string) {
  const [tasks, inbox, dailyPlans, routines, focusSessions, distractionNotes, reminders, energyCheckins, weeklyReviews, rewards, achievements] =
    await Promise.all([
      getDocs(tasksCol(uid)),
      getDocs(inboxCol(uid)),
      getDocs(dailyPlansCol(uid)),
      getDocs(routinesCol(uid)),
      getDocs(focusSessionsCol(uid)),
      getDocs(distractionNotesCol(uid)),
      getDocs(remindersCol(uid)),
      getDocs(energyCheckinsCol(uid)),
      getDocs(weeklyReviewsCol(uid)),
      getDocs(rewardsCol(uid)),
      getDocs(achievementsCol(uid))
    ]);

  const subtasksByTask = await Promise.all(tasks.docs.map((d) => getDocs(subtasksCol(uid, d.id))));
  const stepsByRoutine = await Promise.all(routines.docs.map((d) => getDocs(routineStepsCol(uid, d.id))));

  return {
    tasks,
    subtasksByTask,
    inbox,
    dailyPlans,
    routines,
    stepsByRoutine,
    focusSessions,
    distractionNotes,
    reminders,
    energyCheckins,
    weeklyReviews,
    rewards,
    achievements
  };
}

/** Exporta todos os dados do usuário (seção 23: portabilidade de dados / LGPD). */
export async function exportUserDataAsJson(uid: string): Promise<string> {
  const data = await fetchAll(uid);
  const payload = {
    exportedAt: new Date().toISOString(),
    tasks: data.tasks.docs.map((d, i) => ({ ...d.data(), subtasks: data.subtasksByTask[i].docs.map((s) => s.data()) })),
    inboxItems: data.inbox.docs.map((d) => d.data()),
    dailyPlans: data.dailyPlans.docs.map((d) => d.data()),
    routines: data.routines.docs.map((d, i) => ({ ...d.data(), steps: data.stepsByRoutine[i].docs.map((s) => s.data()) })),
    focusSessions: data.focusSessions.docs.map((d) => d.data()),
    distractionNotes: data.distractionNotes.docs.map((d) => d.data()),
    reminders: data.reminders.docs.map((d) => d.data()),
    energyCheckins: data.energyCheckins.docs.map((d) => d.data()),
    weeklyReviews: data.weeklyReviews.docs.map((d) => d.data()),
    rewards: data.rewards.docs.map((d) => d.data()),
    achievements: data.achievements.docs.map((d) => d.data())
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function deleteInBatches(refs: { ref: Parameters<typeof deleteDoc>[0] }[]) {
  const chunkSize = 400;
  for (let i = 0; i < refs.length; i += chunkSize) {
    const batch = writeBatch(db);
    refs.slice(i, i + chunkSize).forEach(({ ref }) => batch.delete(ref));
    await batch.commit();
  }
}

/** Exclusão completa da conta e dos dados (seção 23). Requer login recente. */
export async function deleteAllUserData(uid: string): Promise<void> {
  const data = await fetchAll(uid);

  const refsToDelete: { ref: Parameters<typeof deleteDoc>[0] }[] = [
    ...data.subtasksByTask.flatMap((snap) => snap.docs.map((d) => ({ ref: d.ref }))),
    ...data.tasks.docs.map((d) => ({ ref: d.ref })),
    ...data.inbox.docs.map((d) => ({ ref: d.ref })),
    ...data.dailyPlans.docs.map((d) => ({ ref: d.ref })),
    ...data.stepsByRoutine.flatMap((snap) => snap.docs.map((d) => ({ ref: d.ref }))),
    ...data.routines.docs.map((d) => ({ ref: d.ref })),
    ...data.focusSessions.docs.map((d) => ({ ref: d.ref })),
    ...data.distractionNotes.docs.map((d) => ({ ref: d.ref })),
    ...data.reminders.docs.map((d) => ({ ref: d.ref })),
    ...data.energyCheckins.docs.map((d) => ({ ref: d.ref })),
    ...data.weeklyReviews.docs.map((d) => ({ ref: d.ref })),
    ...data.rewards.docs.map((d) => ({ ref: d.ref })),
    ...data.achievements.docs.map((d) => ({ ref: d.ref }))
  ];

  await deleteInBatches(refsToDelete);
  await deleteDoc(userDocRef(uid));
}

export async function deleteAuthUser(user: User): Promise<void> {
  await deleteUser(user);
}
