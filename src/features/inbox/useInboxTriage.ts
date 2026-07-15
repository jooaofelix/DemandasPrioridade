import { useAuthStore } from "@/store/authStore";
import { useGamificationStore } from "@/store/gamificationStore";
import { useInboxStore } from "@/store/inboxStore";
import { useTaskStore } from "@/store/taskStore";
import { useUiStore } from "@/store/uiStore";
import type { InboxItem } from "@/types";

export function useInboxTriage() {
  const uid = useAuthStore((s) => s.firebaseUser?.uid ?? null);
  const createTask = useTaskStore((s) => s.createTask);
  const markConverted = useInboxStore((s) => s.markConverted);
  const updateItem = useInboxStore((s) => s.update);
  const archiveItem = useInboxStore((s) => s.archive);
  const removeItem = useInboxStore((s) => s.remove);
  const recordAction = useGamificationStore((s) => s.recordAction);
  const showToast = useUiStore((s) => s.showToast);

  async function doNow(item: InboxItem) {
    if (!uid) return;
    const task = await createTask(uid, { title: item.content, source: "quick_capture", status: "planned" });
    await markConverted(uid, item.id, task.id);
    await recordAction(uid, "start_task");
  }

  async function doTwoMinutes(item: InboxItem) {
    if (!uid) return;
    const task = await createTask(uid, {
      title: item.content,
      source: "quick_capture",
      status: "planned",
      estimatedMinutes: 2
    });
    await markConverted(uid, item.id, task.id);
    await recordAction(uid, "start_task");
  }

  async function schedule(item: InboxItem, dueAt: number | null) {
    if (!uid) return;
    await updateItem(uid, item.id, { scheduledFor: dueAt });
    showToast("Agendado.");
  }

  async function keep(_item: InboxItem) {
    if (!uid) return;
    showToast("Continua guardado na caixa de entrada.");
  }

  async function discard(item: InboxItem) {
    if (!uid) return;
    await archiveItem(uid, item.id);
    showToast("Descartado.");
  }

  async function remove(item: InboxItem) {
    if (!uid) return;
    await removeItem(uid, item.id);
  }

  return { doNow, doTwoMinutes, schedule, keep, discard, remove };
}
