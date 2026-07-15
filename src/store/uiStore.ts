import { create } from "zustand";

export type ToastTone = "neutral" | "success" | "info";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface UiState {
  toasts: Toast[];
  isOnline: boolean;
  captureOpen: boolean;
  showToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
  setOnline: (online: boolean) => void;
  openCapture: () => void;
  closeCapture: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  isOnline: typeof navigator === "undefined" ? true : navigator.onLine,
  captureOpen: false,
  openCapture: () => set({ captureOpen: true }),
  closeCapture: () => set({ captureOpen: false }),

  showToast: (message, tone = "neutral") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  setOnline: (online) => set({ isOnline: online })
}));

export function initOnlineStatusListener(): () => void {
  const update = () => useUiStore.getState().setOnline(navigator.onLine);
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
  return () => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  };
}
