# CRISIS VECTOR — Começar com Codex

## Ler primeiro
`README.md`, `AGENTS.md`, `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`.

## Primeira tarefa

> Lê as orientações e todo o código Alpha 0.1 antes de alterar. Implementa a Alpha 0.2 numa branch `feat/alpha-02-campaign`: (1) cenários configuráveis com seed; (2) exportação/importação integral incluindo estado do RNG, unidades e decisões; (3) UI de seleção, guardar/carregar e explicação das consequências; (4) testes de determinismo e de regressão. Não mistures regras de simulação no Canvas e não reescrevas todo o projeto. Mantém a demo offline, os oito testes existentes e abre PR para revisão com critérios de aceitação. Os índices militares da demo não são dados reais.

## Fluxo GitHub
`main` sempre jogável; branches `feat/`, `fix/`, `docs/`; PR pequeno por funcionalidade; `npm test` obrigatório; não fazer merge se os testes falharem. Comparar alterações com a mesma seed e explicar alterações de balanceamento.

## Decisões de produto pendentes
Jogador controla sempre o mesmo país? Mapa urbano abstrato ou geografia aberta? Tempo por turnos ou híbrido? Qual o detalhe militar datado/licenciado? Quais condições de vitória? Não tomar decisões irreversíveis antes de discutir as consequências técnicas e de jogabilidade.
