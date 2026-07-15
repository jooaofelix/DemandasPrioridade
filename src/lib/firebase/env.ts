/**
 * Checagem sem nenhuma dependência do SDK do Firebase, para que `main.tsx`
 * possa decidir *antes* de importar o resto do app (e, por consequência,
 * antes de `getAuth()` ser chamado) se as credenciais existem. Chamar
 * `getAuth()`/`initializeFirestore()` com uma apiKey ausente ou inválida
 * lança um erro síncrono no momento da importação do módulo, o que deixaria
 * a tela em branco sem nenhuma explicação.
 */
export function isFirebaseConfigured(): boolean {
  const env = import.meta.env;
  return Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);
}
