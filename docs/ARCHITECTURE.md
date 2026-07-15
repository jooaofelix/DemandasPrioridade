# Arquitetura técnica

## Stack

- **Front-end**: React 18 + TypeScript + Vite, Tailwind CSS, React Router,
  Zustand (estado global simples — ver justificativa abaixo), React Hook
  Form + Zod (validação), `vite-plugin-pwa` (service worker/manifest).
- **Back-end/dados**: Firebase Authentication (Google), Cloud Firestore,
  Firestore Security Rules. Sem servidor próprio — toda lógica roda no
  cliente, adequado ao uso pessoal/single-tenant deste MVP.
- **Hospedagem**: Cloudflare Pages (front-end estático).

### Por que Zustand em vez de Redux/Context puro?

O estado do AGORA é majoritariamente "espelho" de coleções do Firestore
(tarefas, rotinas, caixa de entrada) mais alguns estados de UI efêmeros
(sessão de foco ativa, toasts). Zustand permite armazenar isso fora da árvore
React sem boilerplate de reducers/actions, com seletores simples e sem
necessidade de Context Providers aninhados. Redux traria cerimônia
desnecessária para este volume de estado; Context puro exigiria memoização
manual para não re-renderizar a árvore inteira a cada snapshot do Firestore.

## Estrutura de pastas

```
src/
  app/                RootLayout, menu secundário, providers de rota
  components/ui/       Biblioteca de componentes acessíveis (Button, Sheet, ...)
  features/            Um diretório por funcionalidade de produto
    agora/              Tela "Agora"
    auth/                Login + AuthGate
    onboarding/          Fluxo de 5 perguntas
    inbox/               Captura rápida + Caixa de entrada
    breakdown/            Assistente "Quebrar em pedaços"
    unblock/               Fluxo "Destravar"
    focus/                  Modo foco
    routines/                Rotinas
    planning/                 Planejamento diário + encerramento do dia
    progress/                  Progresso + revisão semanal
    gamification/               Minigames e celebrações
    reminders/                   Notificador local
    settings/                     Configurações, privacidade, exportação
    tasks/                         Detalhe de tarefa (CCT: se-então, versão mínima, etc.)
  hooks/               Hooks compartilhados (tema, assinatura de dados, instalação PWA)
  lib/
    firebase/           Configuração, autenticação, referências tipadas do Firestore
    priority/            Motor de priorização (puro, testado)
    breakdown/            Regras de sugestão de subtarefas (puro, testado)
    unblock/               Regras de obstáculo → intervenção (puro, testado)
    gamification/            Regras de pontuação e estágios (puro, testado)
    reminders/                Regras de agendamento local (puro, testado)
    weeklyReview/              Cálculo da revisão semanal (puro, testado)
    validation/                Schemas Zod
  store/               Stores Zustand (um por domínio, ligados ao Firestore)
  types/               Modelo de dados compartilhado (TypeScript)
```

## Modelo de dados

Todas as coleções vivem sob `users/{uid}/...`, garantindo isolamento total por
UID tanto na leitura quanto na escrita (reforçado pelas Firestore Security
Rules). Ver `src/types/index.ts` para os tipos completos e `firestore.rules`
para as regras.

```
users/{uid}                        Perfil + settings + notificationPreferences + gamification (documento único)
users/{uid}/tasks/{taskId}
users/{uid}/tasks/{taskId}/subtasks/{subtaskId}
users/{uid}/inboxItems/{itemId}
users/{uid}/dailyPlans/{YYYY-MM-DD}
users/{uid}/routines/{routineId}
users/{uid}/routines/{routineId}/steps/{stepId}
users/{uid}/focusSessions/{sessionId}
users/{uid}/distractionNotes/{noteId}
users/{uid}/reminders/{reminderId}
users/{uid}/energyCheckins/{checkinId}
users/{uid}/weeklyReviews/{reviewId}
users/{uid}/rewards/{rewardId}
users/{uid}/achievements/{achievementId}
```

Decisão de simplificação: `UserSettings` e `NotificationPreferences` (seção 22
do prompt original) são armazenados como mapas dentro do documento
`users/{uid}` em vez de coleções próprias, porque são dados 1:1 com o
usuário e isso evita uma leitura extra a cada carregamento do app. Os tipos
TypeScript continuam modelados separadamente para clareza.

Todos os registros usam `EpochMs` (número, milissegundos desde epoch) em vez
de `Timestamp` do Firestore. Isso simplifica drasticamente a camada de dados
(sem conversores assíncronos, sem problemas de serialização em arrays/mapas
aninhados) ao custo de não usar `serverTimestamp()` — aceitável para um app
de uso pessoal onde o relógio do dispositivo é a única fonte de verdade
relevante.

## Motor de priorização

`src/lib/priority/engine.ts` é uma função pura: recebe todas as tarefas mais
o contexto do momento (energia atual, se há compromisso agendado, hora
atual) e devolve uma lista ordenada com pontuação interna (nunca exibida) e
até 3 motivos legíveis por tarefa (`"Prazo próximo"`, `"Combina com sua
energia atual"`, etc.). Tarefas bloqueadas por uma dependência incompleta são
fortemente despriorizadas. Prioridades fixadas manualmente sempre vencem.
Testes cobrem cada regra de pontuação isoladamente (`engine.test.ts`).

## Regras de segurança (Firestore)

- Toda leitura/escrita exige `request.auth.uid == uid` no caminho do
  documento.
- Campos críticos são validados nas regras (tamanho máximo de string, status
  dentro de um enum, tipos corretos) como defesa em profundidade — o
  cliente já valida com Zod antes de enviar.
- Qualquer caminho fora da lista explícita é bloqueado (`allow read, write:
  if false`).

## Estratégia offline

Cloud Firestore é inicializado com `persistentLocalCache` (IndexedDB) e
`persistentMultipleTabManager`, então leituras/escritas funcionam
imediatamente a partir do cache local e são sincronizadas automaticamente
quando a conexão volta — sem necessidade de fila manual. A UI mostra um
aviso discreto (`OfflineBanner`) quando `navigator.onLine` é falso. A sessão
de foco ativa é também persistida em `localStorage` com timestamps reais
(não um contador de intervalo), então sobrevive a fechamentos de aba e
funciona corretamente mesmo se o relógio de JS for pausado em segundo
plano.

## Estratégia de notificações

Ver `NOTIFICATIONS.md` para a análise completa e as limitações por
plataforma. Resumo: o MVP usa a Notification API do navegador, verificada
localmente a cada ~20s enquanto o app está aberto ou foi usado recentemente
como PWA. Uma integração futura com Firebase Cloud Messaging + Cloud
Functions está descrita no roadmap, mas não é necessária para o uso pessoal
inicial e exigiria o plano pago (Blaze) do Firebase.
