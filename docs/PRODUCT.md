# AGORA — Documento de Produto

## 1. O problema

Pessoas adultas com TDAH frequentemente têm as ideias e tarefas certas, mas perdem
tempo e energia mental no espaço entre "saber o que precisa ser feito" e
"efetivamente começar". Ferramentas de produtividade tradicionais assumem que
quem usa já sabe organizar: exigem categorização, priorização manual e
disciplina de manutenção — exatamente as funções executivas que costumam
estar mais sobrecarregadas no TDAH. O resultado comum é abandonar o sistema
depois de poucos dias.

## 2. Princípio central

> Toda decisão de produto responde à pergunta: **"Isso reduz ou aumenta o
> esforço mental necessário para a pessoa começar?"**

O AGORA não pede para a pessoa se organizar antes de usar o app — o app faz a
maior parte do trabalho de organização. A meta declarada é: sair de um estado
de confusão mental para uma próxima ação concreta em menos de 60 segundos.

## 3. Fluxos principais

1. **Agora** — uma prioridade principal, no máximo duas secundárias, com
   explicação simples do motivo da sugestão e um primeiro passo.
2. **Tirar da cabeça** — captura de qualquer pensamento em menos de 10
   segundos, uma pergunta por vez, sem obrigar categorização imediata.
3. **Quebrar em pedaços** — transforma tarefas vagas em passos observáveis
   (2–20 min, começam com verbo).
4. **Destravar** — fluxo de 3 etapas para quando a pessoa trava: identificar o
   obstáculo, oferecer uma única intervenção, terminar em um primeiro
   movimento concreto.
5. **Foco** — cronômetro de duração livre (2 a 45 min ou personalizado), com
   estacionamento de distrações sem sair da tela.
6. **Planejamento de 3 minutos** e **encerramento de 2 minutos** — rituais
   curtos no início e no fim do dia, sem acumular tarefas atrasadas
   automaticamente.
7. **Rotinas** — sequências curtas e flexíveis (com "versão para dia difícil").
8. **Progresso** — revisão semanal com insights descritivos, sem gráficos
   culpabilizantes, e gamificação opcional e ética.

## 4. Como cada funcionalidade reduz carga executiva

| Funcionalidade | Função executiva apoiada |
|---|---|
| Tela Agora (1 prioridade) | Reduz sobrecarga de decisão |
| Captura rápida | Libera memória de trabalho |
| Motivo da sugestão | Substitui julgamento próprio incerto por explicação externa |
| Quebrar em pedaços | Reduz paralisia diante do vago/grande |
| Destravar | Dá uma saída de baixo custo para a procrastinação situacional |
| Foco com durações variadas | Respeita oscilação de energia/atenção, evita a armadilha do "25 min ou nada" |
| Estacionamento de distração | Preserva atenção sem perder o pensamento |
| Planejamento/encerramento curtos | Cria estrutura sem exigir manutenção complexa |
| Reorganização sem culpa | Reduz autocrítica ao lidar com atrasos |
| Gamificação ética | Reconhece início, pedir ajuda e replanejar — não só "perfeição" |

## 5. Escopo do MVP

Está dentro do MVP (ver critérios de aceitação no README):
login Google, isolamento por UID, tela Agora com priorização algorítmica,
captura rápida com perguntas sequenciais, caixa de entrada com triagem (e
minigame "Fechar abas mentais"), quebra de tarefas, fluxo Destravar completo,
modo foco com timer persistente e estacionamento de distrações, planejamento
diário, encerramento do dia, rotinas com versão reduzida, gamificação
opcional (pontos + estágios visuais + conquistas), lembretes locais
(Notification API), exportação e exclusão de dados, tema claro/escuro, PWA
instalável com suporte offline básico.

Fora do MVP (ver `ROADMAP.md`): push notificado em segundo plano via FCM,
integração com calendário externo, IA para sugestão de subtarefas, testes
E2E automatizados, multi-idioma.

## 6. Riscos de distração e abandono, e como foram mitigados

- **Excesso de opções na tela inicial** → limitado a 1 prioridade principal +
  2 secundárias, configurável até 3 no total.
- **Configuração inicial cansativa** → onboarding de 5 perguntas curtas,
  sempre pulável, terminando em uma primeira vitória (2 minutos de foco).
- **Culpa por tarefas atrasadas** → o encerramento do dia nunca empurra
  tarefas automaticamente; sempre pergunta o que fazer, com linguagem como
  "o plano mudou" em vez de "você falhou".
- **Gamificação viciante** → sem sequências que zeram, sem lootbox, sem
  comparação social; pode ser desligada.
- **Excesso de notificações** → limite diário configurável, horário de
  silêncio, e o sistema não aumenta a frequência sozinho.

## 7. Limites clínicos e éticos

O AGORA não diagnostica TDAH, não substitui psicoterapia ou acompanhamento
médico, não interpreta emoções como diagnóstico e nunca usa culpa, vergonha
ou medo como mecanismo de engajamento. O aviso "Este sistema é uma
ferramenta de apoio à organização e não substitui acompanhamento
profissional" aparece na tela de login, nas configurações e na página de
privacidade.
