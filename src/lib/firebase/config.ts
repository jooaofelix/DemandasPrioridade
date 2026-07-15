import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { type Auth, getAuth } from "firebase/auth";
import { isFirebaseConfigured } from "./env";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!isFirebaseConfigured()) {
  throw new Error(
    "Firebase não configurado. Preencha .env.local com as chaves do seu projeto (ver .env.example)."
  );
}

function createApp(): FirebaseApp {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  return initializeApp(firebaseConfig);
}

export const app = createApp();

export const auth: Auth = getAuth(app);

// Cache local persistente (IndexedDB) com suporte a múltiplas abas: as funções
// essenciais (ver seção 24 do produto) continuam funcionando offline e
// sincronizam automaticamente quando a conexão retorna.
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
