# AGORA

Uma estrutura externa para as funções executivas de uma pessoa adulta com
TDAH: tirar demandas da cabeça, escolher uma prioridade sem paralisar,
começar tarefas difíceis e encerrar o dia sem culpa. PWA em React + TypeScript
+ Firebase, pensado inicialmente para uso pessoal com login Google, com
arquitetura pronta para múltiplos usuários.

> Este sistema é uma ferramenta de apoio à organização e não substitui
> acompanhamento profissional de psicoterapia ou medicina.

## Documentação

- [`docs/PRODUCT.md`](docs/PRODUCT.md) — problema, princípios, fluxos, escopo do MVP
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — decisões técnicas, modelo de dados, estrutura de pastas
- [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) — como configurar o Firebase do zero
- [`docs/DEPLOY.md`](docs/DEPLOY.md) — como publicar no Cloudflare Pages
- [`docs/NOTIFICATIONS.md`](docs/NOTIFICATIONS.md) — como os lembretes funcionam e suas limitações reais
- [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) — lista honesta do que não está 100% no MVP
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — próximas fases

## Funcionalidades

- **Agora**: uma prioridade principal + até duas secundárias, escolhidas por
  um motor de priorização transparente (prazo, energia, dependências,
  tempo parado, preferência manual...), sempre com um motivo em linguagem
  simples e a opção de trocar.
- **Tirar da cabeça**: captura em menos de 10 segundos (texto ou voz, quando
  suportado pelo navegador), com perguntas sequenciais opcionais.
- **Caixa de entrada**: triagem manual ou pelo minigame "Fechar abas
  mentais" (fazer / 2 minutos / agendar / guardar).
- **Quebrar em pedaços**: assistente que transforma tarefas vagas em passos
  concretos, com sugestões locais para tipos comuns de tarefa.
- **Destravar**: fluxo de 3 etapas para o botão "Não consigo começar".
- **Modo foco**: cronômetro persistente (sobrevive à troca de tela/recarregar
  a página), durações de 2 a 45 min ou personalizada, estacionamento de
  distrações, som ambiente opcional.
- **Planejamento diário (3 min)** e **encerramento do dia (2 min)**, com
  reorganização sem acúmulo automático de atrasos.
- **Rotinas** flexíveis com passos reordenáveis e "versão para dia difícil".
- **Progresso**: gamificação ética (opcional, sem sequências punitivas) e
  revisão semanal com insights descritivos.
- **Ferramentas de TCC leve**: pensamento que trava (fato/previsão/cobrança),
  plano se-então, versão mínima aceitável, previsão vs. realidade.
- **Lembretes locais** configuráveis (estilo, horário de silêncio, limite
  diário, dias da semana).
- **PWA instalável** com suporte offline para as funções essenciais.
- **Exportação e exclusão completa de dados** (LGPD).

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Zustand ·
React Hook Form + Zod · Firebase Auth (Google) · Cloud Firestore ·
`vite-plugin-pwa` · Vitest + Testing Library · Cloudflare Pages.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do seu projeto Firebase
npm run dev
```

Siga [`docs/FIREBASE_SETUP.md`](docs/FIREBASE_SETUP.md) para criar o projeto
Firebase, ativar o login com Google e publicar as regras do Firestore antes
do primeiro uso.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Typecheck + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | ESLint |
| `npm test` | Testes unitários e de componente (Vitest) |
| `npm run test:watch` | Testes em modo watch |
| `npm run typecheck` | Apenas checagem de tipos |

## Publicar

Veja [`docs/DEPLOY.md`](docs/DEPLOY.md) para o passo a passo no Cloudflare
Pages (dashboard ou `wrangler`).

## Testes

```bash
npm test
```

Cobre o motor de priorização, validações Zod, regras de "quebrar em
pedaços" e "destravar", gamificação, cálculo de revisão semanal,
agendamento de lembretes, e componentes-chave de UI. Veja
[`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) para o que ainda não está
automatizado (regras do Firestore, E2E).

## Critérios de aceitação do MVP

- [x] Projeto builda sem erros (`npm run build`)
- [x] Sem imports quebrados, sem botões sem função
- [x] Login com Google funcional
- [x] Isolamento de dados por UID (Firestore Rules)
- [x] Criar uma tarefa em menos de 10 segundos (captura rápida)
- [x] Tela inicial com no máximo 3 prioridades
- [x] Modo "Não consigo começar" (Destravar) funcional
- [x] Divisão de tarefas em passos funcional
- [x] Cronômetro de foco persiste ao trocar de tela
- [x] Registro de distrações durante o foco
- [x] Tarefas: concluir, adiar, cancelar, reorganizar
- [x] Planejamento diário e encerramento do dia funcionais
- [x] Rotinas funcionais (com versão para dia difícil)
- [x] Tema claro e escuro
- [x] Instalável como PWA
- [x] Suporte offline para funções essenciais (cache do Firestore + service worker)
- [x] Firestore Security Rules implementadas
- [x] Documentação de instalação e implantação
- [x] Layout otimizado para celular (mobile-first)
- [x] Linguagem sem culpa ou julgamento em toda a interface

## Licença e responsabilidade

Projeto pessoal/educacional. Não é um dispositivo médico e não deve ser
usado como única ferramenta de manejo do TDAH.
