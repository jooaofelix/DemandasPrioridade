import { onSnapshot, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { create } from "zustand";
import { ensureUserDocument, onAuthChange, signInWithGoogle, signOutUser } from "@/lib/firebase/auth";
import { userDocRef, type UserDocument } from "@/lib/firebase/firestore";

export type AuthStatus = "loading" | "signed_out" | "signed_in";

interface AuthState {
  status: AuthStatus;
  firebaseUser: User | null;
  profile: UserDocument | null;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateSettings: (patch: Partial<UserDocument["settings"]>) => Promise<void>;
  updateNotificationPreferences: (patch: Partial<UserDocument["notificationPreferences"]>) => Promise<void>;
}

let profileUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "loading",
  firebaseUser: null,
  profile: null,
  error: null,

  signIn: async () => {
    set({ error: null });
    try {
      await signInWithGoogle();
    } catch (err) {
      set({ error: "Não foi possível entrar agora. Tente novamente em instantes." });
      throw err;
    }
  },

  signOut: async () => {
    profileUnsubscribe?.();
    profileUnsubscribe = null;
    await signOutUser();
  },

  completeOnboarding: async () => {
    const uid = get().firebaseUser?.uid;
    if (!uid) return;
    await updateDoc(userDocRef(uid), { onboardingCompletedAt: Date.now(), updatedAt: Date.now() });
  },

  updateSettings: async (patch) => {
    const uid = get().firebaseUser?.uid;
    const current = get().profile?.settings;
    if (!uid || !current) return;
    await updateDoc(userDocRef(uid), {
      settings: { ...current, ...patch, version: current.version + 1 },
      updatedAt: Date.now()
    });
  },

  updateNotificationPreferences: async (patch) => {
    const uid = get().firebaseUser?.uid;
    const current = get().profile?.notificationPreferences;
    if (!uid || !current) return;
    await updateDoc(userDocRef(uid), {
      notificationPreferences: { ...current, ...patch },
      updatedAt: Date.now()
    });
  }
}));

export function initAuthListener(): () => void {
  const unsubscribeAuth = onAuthChange(async (user) => {
    profileUnsubscribe?.();
    profileUnsubscribe = null;

    if (!user) {
      useAuthStore.setState({ status: "signed_out", firebaseUser: null, profile: null });
      return;
    }

    useAuthStore.setState({ status: "signed_in", firebaseUser: user });
    await ensureUserDocument(user);

    profileUnsubscribe = onSnapshot(userDocRef(user.uid), (snapshot) => {
      if (snapshot.exists()) {
        useAuthStore.setState({ profile: snapshot.data() });
      }
    });
  });

  return () => {
    unsubscribeAuth();
    profileUnsubscribe?.();
  };
}
