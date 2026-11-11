# CRISIS VECTOR — Arquitetura

## Componentes Alpha 0.1

- `data/world-data.js`: polígonos mundiais e indicadores históricos para demonstrar.
- `src/simulation.js`: `SimEngine`, estado e evolução diária, independente do DOM.
- `src/game.js`: interface, Canvas e interação; não deve conter regras de simulação.
- `index.html`, `styles.css`: funcionamento no browser offline.
- `tests/simulation.test.cjs`: testes Node.

## Modelo alvo (incremental)

`ScenarioDefinition`: seed, país, focos, dificuldade, objetivos. `WorldState`: relógio, países, regiões, cidades, relações, eventos, PRNG. `CountryState`: recursos, políticas, estabilidade, mobilização, populações. `RegionState`: população sem duplicações, stocks e serviços. `CityOperation`: tropas, objetivos, civis, consumo e resultado. `DiplomaticRelation`: pares de países, confiança, interesses, alianças, histórico. `EventLedger`: origem, dia, decisão, custo e efeitos auditáveis.

## Invariantes

1. `0 <= infetados + mortos <= população` por território.
2. Recursos, fundos e efetivos não negativos nem criados sem uma fonte.
3. Unidades e população não são duplicadas entre cidade, região e país.
4. Atualização diária com ordem determinística: decisões → movimentações → transmissão → operações → custos → estabilidade → eventos.
5. Exportação/importação deve preservar seed e estado do RNG, país, tempo, unidades, recursos, diplomacia e decisões.
6. Estatísticas mundiais derivam do mesmo estado canónico.
7. Dados factuais com fonte/data/unidades/licença; heurísticas de gameplay identificadas.

## Tempo e desempenho

Tick diário agregado mundial. Apenas a cidade observada usa simulação micro em segundos/minutos; terminar operação gera `OperationResult` aplicado **uma vez**. A animação Canvas é ilustrativa e não representa todos os habitantes como agentes. Evitar 8 mil milhões de agentes individuais.

## Qualidade

Preservar a abertura offline. Seed estável e testes reprodutíveis. Módulos por domínio só quando a complexidade justificar. `npm test` obrigatório em PRs. Incluir testes para contabilidade, persistência, sincronização das escalas e resposta internacional.
