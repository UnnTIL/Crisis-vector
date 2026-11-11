# Orientações para agentes de código / Codex

Objetivo de produto: criar um jogo original de simulação da resposta humana a uma ameaça zombie fictícia com três escalas coerentes (global, nacional, urbana). Deve privilegiar clareza, consistência causal, decisões significativas, desempenho e separação entre dados reais documentados e mecânicas ficcionais.

## Regras

- Não usar código, gráficos, sons, nomes ou assets copiados de outros jogos. `Zombies Aren't Real`, `Plague Inc.` e `Broken Arrow` são apenas referências de género, não modelos a reproduzir.
- Preservar o funcionamento offline de `index.html` enquanto for utilizado um runtime browser vanilla.
- Alterar a lógica de simulação em `src/simulation.js`; evitar misturá-la com os desenhos do Canvas em `src/game.js`.
- Manter um único estado global de cada país; as operações locais devem produzir efeitos quantitativos claros, equilibrados e testáveis nessa mesma simulação.
- Tratar defesa, diplomacia, estabilidade, orçamento e economia como indicadores de jogo até existirem fontes versionadas, metodologias transparentes e validação.
- Não afirmar que dados históricos são informação atual. Manter indicadores e limites documentados no README.
- Manter todas as ações do jogador reversíveis quando fizer sentido e com custo visível. Corrigir exploits que permitam criar recursos infinitos.
- Garantir que `node --test tests/simulation.test.cjs` passa após cada alteração do motor.
- Privilegiar PRs pequenos e incrementais; cada milestone deve ter uma demo executável, teste de regressão, objetivos de gameplay e notas de equilíbrio.

## Primeira tarefa sugerida

Implementar persistência local do cenário: guardar e recuperar o dia, países, políticas, relações, orçamento, unidades e estado do gerador aleatório sem perdas, com testes de exportação/importação determinística. Acrescentar um seletor de cenários iniciais (Portugal contido, Europa em emergência, crise mundial) e um painel que explique a causalidade de cada decisão tomada.

## Leitura e direção do produto (antes de começar)

Ler `docs/GAME_DESIGN.md`, `docs/ARCHITECTURE.md` e `docs/CODEX_START_HERE.md`. O objetivo final é uma resposta humana a uma crise global fictícia, em três escalas (mundo, país/região e operação urbana) partilhando o **mesmo estado e recursos**. Os outros governos devem atuar autonomamente e as decisões devem produzir custos e consequências coerentes, auditáveis e com atraso temporal quando aplicável.

A demo Alpha 0.1 **não** contém inventários militares reais nem diplomacia avançada. Nunca apresentar métricas heurísticas como estatísticas oficiais. Na primeira evolução, implementar cenários, persistência e causalidade antes de introduzir sistemas táticos complexos. Trabalhar em branches dedicadas, rever diferenças e criar PR para integração sem quebrar `main`.