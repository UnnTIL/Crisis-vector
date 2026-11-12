# ROUND-001 — Feedback e encaminhamento

**Data:** 2026-11-12  
**Estado:** `REVIEWED — direção funcional validada, execução ainda não iniciada`  
**Autor da validação:** direção criativa, após revisão conjunta com ChatGPT  
**Branch:** `docs/product-vision-v1`  
**PR:** [#1](https://github.com/UnnTIL/Crisis-vector/pull/1)

## Resultado da análise

A arquitetura proposta foi considerada adequada **como orientação a validar por implementação incremental**: estado canónico, regras comuns jogador/IA, conservação de recursos/pessoas, relógio único e separação entre simulação e apresentação. A avaliação tecnológica mantém browser como primeiro candidato, Three.js/WebGL 2 por demonstrar e sem promessa de desempenho.

## Decisões aprovadas nesta ronda

| ID | Decisão | Estado |
| --- | --- | --- |
| DEC-018 | Para o cenário zombie inicial, morte humana e reanimação seguidas de possível neutralização; sem dupla contagem de óbitos. | `APPROVED` — direção funcional |
| DEC-019 | Economia simplificada com receitas, custos, reservas, dívida/atrasados e prioridades; subfinanciamento gera degradação, com regras iguais para IA e jogador. | `APPROVED` — direção funcional |
| DEC-020 | Ordens táticas por equipas, zonas, rotas e objetivos, execução autónoma e intervenção opcional sem microgestão individual. | `APPROVED` — direção funcional |

A aprovação não fixa parâmetros, fórmulas, modelos de dados definitivos, versões de bibliotecas ou critérios gráficos não medidos.

## Observações e cautelas

- A experiência urbana deve demonstrar efeitos espaciais reais, não apenas hordas animadas; sprites/pontos podem representar grupos.
- Não introduzir simulação bancária nem diplomacia extensa antes de demonstrar uma cadeia de decisão → custo → consequência.
- A prova urbana deve separar carga visual de agentes lógicos e medir desempenho em hardware conhecido.
- Não tratar a documentação proposta como funcionalidades presentes na Alpha 0.1.
- A visão artística inicial usa imagens fornecidas na conversa, que não foram disponibilizadas como assets ao Codex; o protótipo deve gerar gráficos originais.

## Encaminhamento e trabalhos registados

- [#2 — A1a: comandos, custos e financiamento mínimo](https://github.com/UnnTIL/Crisis-vector/issues/2) — primeira tarefa proposta, distinta do PR documental.
- [#3 — A1b: evacuação real e contabilidade populacional](https://github.com/UnnTIL/Crisis-vector/issues/3) — tarefa subsequente e separada.
- [#4 — B-SPIKE: prova urbana no browser](https://github.com/UnnTIL/Crisis-vector/issues/4) — especificação de benchmark e validação gráfica, a executar após os contratos mínimos.

**Não há autorização nesta ronda para efetuar merge, refatorização ou implementação automática**; o início da tarefa #2 será instruído expressamente num próximo trabalho do Codex, em branch e PR próprios.

## Questões a amadurecer antes dos respetivos gates

- Q-003: hardware, navegador, resolução e cargas de benchmark.
- Q-004: comportamento de pausa/velocidade e incidentes críticos.
- Q-005: horizonte e objetivos quantitativos da campanha portuguesa.
- Q-007: experiência de arranque offline após adoção de módulos.
- Q-001/Q-002/Q-006: encerradas ao nível da direção, com parâmetros e implementação específicos pendentes.

## Consolidação

Decisões DEC-018 a DEC-020 acrescentadas em `DECISION_LOG.md`. O processo seguinte é executar #2 em branch própria, mantendo `main` jogável; validar #3 posteriormente e preparar #4 com dados de desempenho e critérios de saída.
