import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/** Popups são bloqueados em alguns navegadores mobile/PWA instalado; nesse caso caímos para redirect. */
export async function signInWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment" ||
      code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Cria o documento do usuário e as configurações padrão no primeiro login.
 * Idempotente: não sobrescreve dados existentes em logins seguintes.
 */
export async function ensureUserDocument(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) return;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    timezone,
    onboardingCompletedAt: null,
    settings: {
      energyPeriod: null,
      reminderStyle: "warm",
      maxDailyPriorities: 3,
      gamificationLevel: "discrete",
      theme: "system",
      reducedMotion: false,
      focusAreas: [],
      version: 1
    },
    gamification: {
      points: 0
    },
    notificationPreferences: {
      enabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      maxPerDay: 6,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      style: "warm",
      typesEnabled: {
        prepare: true,
        start: true,
        deadline: true,
        resume: true,
        routine: true,
        day_summary: true,
        day_closing: true
      }
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}
