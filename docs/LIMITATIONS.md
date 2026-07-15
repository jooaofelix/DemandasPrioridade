# Limitações conhecidas do MVP

Esta é uma lista honesta do que **não** está completo ou tem uma
implementação simplificada, para orientar o uso e os próximos passos.

## Notificações

Ver `NOTIFICATIONS.md`. Resumo: só funcionam com o app aberto/recentemente
usado; não há push real em segundo plano.

## Recompensas (`Reward`)

O campo `Task.rewardId` guarda hoje o **texto livre** digitado pelo usuário
(ex.: "tomar um café"), em vez de referenciar um documento na coleção
`rewards`. Simplificação deliberada para o MVP; a coleção `rewards` existe no
modelo de dados e nas regras de segurança para uma implementação futura de
biblioteca de recompensas reutilizáveis.

## Revisão semanal

Os insights são calculados no cliente a partir dos campos leves já
existentes em `tasks` e `routines` (contagem de conclusões, quantas vezes
uma tarefa foi adiada, precisão de estimativa quando ambos os campos
existem). Não há um log histórico de eventos dedicado, então métricas mais
finas (ex.: horário exato de início de cada tarefa, uso detalhado de cada
rotina ao longo do tempo) são aproximadas, não exatas.

## Testes automatizados

O MVP inclui testes unitários e de componente (motor de priorização,
validação, regras de quebra de tarefas e de destravar, gamificação, revisão
semanal, agendamento de lembretes, e alguns componentes de UI/tela). **Não**
inclui:

- Testes das Firestore Security Rules com `@firebase/rules-unit-testing`
  (recomenda-se rodar `firebase emulators:start` e testar manualmente antes
  de qualquer mudança nas regras).
- Testes end-to-end automatizados (Playwright/Cypress) dos fluxos completos
  descritos na seção de critérios de aceitação — foram validados
  manualmente durante o desenvolvimento, mas não há suíte E2E no CI.
- Testes de fuso horário/horário de verão automatizados (o app usa o fuso
  local do navegador via `Intl.DateTimeFormat().resolvedOptions().timeZone`
  e datas armazenadas como `YYYY-MM-DD` locais, mas não há teste dedicado a
  transições de DST).

## Multiusuário

A arquitetura já isola tudo por UID e suporta múltiplos usuários
simultâneos sem nenhuma mudança de schema. O que **não** existe é qualquer
recurso colaborativo (compartilhar tarefas, delegar de fato para outra
pessoa dentro do app — "Delegar" no MVP apenas cancela a tarefa e registra a
intenção).

## Ícones do PWA

Os ícones em `public/icons/` são SVGs gerados programaticamente (sem
dependência de ferramentas de design) — funcionam para instalação em
Android/desktop, mas para a melhor qualidade em iOS (que prefere PNG
rasterizado para o ícone de tela de início) recomenda-se substituí-los por
PNGs 192×192 e 512×512 antes de um lançamento mais amplo.

## Som ambiente do modo foco

É um tom gerado localmente via Web Audio API (oscilador senoidal simples),
não uma biblioteca de sons ambiente/binaurais.
