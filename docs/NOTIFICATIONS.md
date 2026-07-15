# Notificações e lembretes — decisão técnica e limitações

## O que foi implementado no MVP

O AGORA usa a **Notification API** nativa do navegador, verificada
localmente por um `setInterval` (`useReminderNotifier`, a cada ~20
segundos) enquanto o app está aberto em uma aba ou foi aberto recentemente
como PWA instalado. Quando um lembrete (`Reminder`) vence, dentro da janela
de silêncio configurada e respeitando o limite diário, o app dispara
`new Notification(...)`.

Vantagens: zero infraestrutura de servidor, zero custo, funciona offline,
não exige o plano pago do Firebase.

## Por que não implementamos Web Push / FCM neste MVP

Web Push real (notificação chegando com o app **fechado**) exige:

1. Um **Service Worker** com listener de `push` (`vite-plugin-pwa` já gera
   um service worker, mas o listener de push customizado precisaria ser
   adicionado).
2. Um back-end capaz de **agendar** o envio no horário certo — o Firestore
   sozinho não agenda nada; seria necessário **Cloud Functions** (ou
   Cloudflare Workers + Cron Triggers) rodando periodicamente para
   verificar lembretes vencidos e chamar a API do **Firebase Cloud
   Messaging**.
3. Cloud Functions **exige o plano Blaze** (pago, com camada gratuita
   generosa, mas ainda assim exige cartão cadastrado) — decisão consciente
   de não obrigar isso para um projeto de teste pessoal.
4. Chaves VAPID e permissão de notificação persistente do navegador.

Essa arquitetura está documentada como próximo passo em `ROADMAP.md` e pode
ser adicionada sem quebrar o modelo de dados atual (a coleção `reminders`
já existe e seria reaproveitada por uma Cloud Function agendada).

## Limitações reais por plataforma

- **iOS Safari (navegador comum)**: não suporta Web Push. Só existe suporte
  quando o site é **instalado na tela de início** (PWA) a partir do iOS 16.4+,
  e mesmo assim a API de notificação local só dispara enquanto o
  processo do PWA está ativo/recentemente ativo — não há garantia de
  disparo com o app completamente fechado por muito tempo.
- **Android Chrome**: suporta Web Push mesmo com o site fora do PWA, mas
  isso exigiria a infraestrutura de FCM descrita acima; a versão local
  atual também só dispara com o app aberto/recentemente aberto.
- **Desktop (Chrome/Edge/Firefox)**: a Notification API funciona bem com a
  aba aberta; se a aba for fechada, os lembretes agendados não disparam
  até o app ser reaberto (nesse caso, lembretes vencidos aparecem como
  "atrasados" apenas se ainda estiverem com status `scheduled` na próxima
  abertura — o app não tenta "recuperar o tempo perdido" com uma enxurrada
  de notificações).
- **Permissão negada**: se o usuário negar a permissão do navegador, o app
  continua funcionando normalmente — os lembretes apenas não aparecem como
  notificação do sistema (o usuário ainda vê os horários planejados dentro
  do app).

## Fallback recomendado

Para compromissos realmente críticos, recomendamos ao usuário também criar
um lembrete no calendário nativo do celular/computador — o AGORA não
substitui isso no MVP.
