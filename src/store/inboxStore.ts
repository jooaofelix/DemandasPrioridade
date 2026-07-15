import { deleteDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { inboxCol, inboxDocRef, newId } from "@/lib/firebase/firestore";
import type { InboxItem } from "@/types";

interface InboxState {
  items: InboxItem[];
  loaded: boolean;
  capture: (uid: string, content: string) => Promise<InboxItem>;
  update: (uid: string, itemId: string, patch: Partial<InboxItem>) => Promise<void>;
  archive: (uid: string, itemId: string) => Promise<void>;
  remove: (uid: string, itemId: string) => Promise<void>;
  markConverted: (uid: string, itemId: string, taskId: string) => Promise<void>;
}

export const useInboxStore = create<InboxState>(() => ({
  items: [],
  loaded: false,

  capture: async (uid, content) => {
    const now = Date.now();
    const item: InboxItem = {
      id: newId(inboxCol(uid)),
      uid,
      content,
      processed: false,
      scheduledFor: null,
      consequenceIfSkipped: null,
      firstStepKnown: null,
      convertedTaskId: null,
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    };
    await setDoc(inboxDocRef(uid, item.id), item);
    return item;
  },

  update: async (uid, itemId, patch) => {
    await updateDoc(inboxDocRef(uid, itemId), { ...patch, updatedAt: Date.now() });
  },

  archive: async (uid, itemId) => {
    await updateDoc(inboxDocRef(uid, itemId), { archivedAt: Date.now(), updatedAt: Date.now() });
  },

  remove: async (uid, itemId) => {
    await deleteDoc(inboxDocRef(uid, itemId));
  },

  markConverted: async (uid, itemId, taskId) => {
    await updateDoc(inboxDocRef(uid, itemId), {
      processed: true,
      convertedTaskId: taskId,
      updatedAt: Date.now()
    });
  }
}));

export function initInboxListener(uid: string): () => void {
  const q = query(inboxCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => d.data());
    useInboxStore.setState({ items, loaded: true });
  });
}
