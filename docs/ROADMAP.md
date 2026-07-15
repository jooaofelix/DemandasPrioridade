# Roadmap

## Fase 2 (curto prazo)

- Web Push real via Firebase Cloud Messaging + Cloud Functions agendadas
  (requer plano Blaze). Reaproveita a coleção `reminders` já existente.
- Firebase App Check habilitado por padrão (reCAPTCHA v3), com instruções
  de setup já documentadas em `FIREBASE_SETUP.md`.
- Biblioteca de recompensas reutilizáveis (coleção `rewards` já modelada).
- Testes E2E (Playwright) cobrindo os 13 fluxos obrigatórios da seção 26 do
  briefing de produto.
- Testes automatizados das Firestore Security Rules com
  `@firebase/rules-unit-testing`.
- Ícones PNG dedicados para instalação em iOS.

## Fase 3 (médio prazo)

- Sugestão de subtarefas assistida por IA como complemento opcional ao
  motor de regras locais (`suggestStepsFromTitle`), mantendo o modo local
  como padrão e sem dependência obrigatória de rede.
- Integração de leitura com calendários externos (Google Calendar) para
  popular "próximo compromisso" de forma real, hoje aproximado por tarefas
  com `dueAt` no dia.
- Suporte a múltiplos usuários com convites (ex.: terapeuta acompanhando o
  progresso agregado, com consentimento explícito).
- Internacionalização (hoje o app é pt-BR apenas).
- Exportação de dados também em formato legível (Markdown/CSV), além do
  JSON atual.

## Fase 4 (longo prazo)

- Modo "check-in por voz" mais completo, com transcrição de sessões de
  planejamento inteiras.
- Painel para profissionais de saúde (com consentimento do usuário) — nunca
  substituindo o acompanhamento profissional, apenas facilitando a
  conversa com dados que o próprio usuário já registrou.
