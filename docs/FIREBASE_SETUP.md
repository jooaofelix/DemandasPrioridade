# Configurar o Firebase

## 1. Criar o projeto

1. Acesse https://console.firebase.google.com e crie um novo projeto (ex.:
   `agora-pessoal`). Você pode desativar o Google Analytics, não é
   necessário.
2. No painel do projeto, clique em **Adicionar app → Web** (ícone `</>`).
   Registre um apelido (ex.: `agora-web`) — **não** marque "Configurar
   também o Firebase Hosting" (usaremos Cloudflare Pages).
3. Copie o objeto `firebaseConfig` mostrado na tela.

## 2. Preencher as variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os valores copiados:

```bash
cp .env.example .env.local
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Essas chaves identificam o projeto no cliente (não são segredas no sentido de
back-end); a segurança real vem das Firestore Security Rules.

## 3. Ativar a autenticação por Google

No console: **Authentication → Sign-in method → Google → Ativar**. Defina um
e-mail de suporte do projeto (obrigatório pelo próprio Firebase).

Em **Authentication → Settings → Authorized domains**, adicione o domínio
onde o app vai rodar (ex.: `localhost` já vem por padrão; adicione o domínio
do Cloudflare Pages depois do deploy, ex. `agora.pages.dev` ou seu domínio
customizado).

## 4. Criar o Cloud Firestore

**Firestore Database → Criar banco de dados**. Escolha uma região próxima de
você. Selecione **modo de produção** (as regras deste repositório já cobrem
o isolamento por usuário).

## 5. Publicar as regras de segurança e índices

Instale a CLI do Firebase e faça login:

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # selecione o projeto criado acima
```

Publique as regras e índices deste repositório:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## 6. (Opcional) Firebase App Check

Para reduzir abuso do endpoint do Firestore em produção, você pode ativar o
App Check com reCAPTCHA v3:

1. **App Check** no console → registre o app Web → escolha reCAPTCHA v3 →
   copie a "site key".
2. Preencha `VITE_FIREBASE_APPCHECK_SITE_KEY` no `.env.local`.
3. No código, inicialize o App Check em `src/lib/firebase/config.ts`
   (deixamos o gancho pronto via variável de ambiente opcional; a
   inicialização do SDK de App Check não está incluída por padrão no MVP
   para não obrigar todo mundo a configurar reCAPTCHA antes do primeiro
   uso — ver `docs/ROADMAP.md`).

## 7. Testar localmente com os emuladores (recomendado antes de publicar)

```bash
firebase emulators:start
```

Isso sobe os emuladores de Auth e Firestore definidos em `firebase.json`,
úteis para testar as regras de segurança sem afetar dados reais.

## 8. Rodar o app

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`, clique em "Entrar com Google" e conclua o
onboarding.
