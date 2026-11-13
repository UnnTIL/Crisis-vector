# CRISIS VECTOR — Alpha 0.1

Protótipo **original e jogável**, em português europeu, de um simulador fictício de crise internacional. Combina três escalas num mesmo estado de jogo: estratégia mundial, gestão nacional e intervenção urbana esquemática.

## Executar

1. Abrir `index.html` num navegador recente (Chrome, Edge, Firefox), sem instalação nem ligação à internet. Os ficheiros JavaScript e CSS são locais.
2. Escolher países no mapa mundial. Portugal está sob comando inicialmente.
3. Aplicar políticas nacionais no painel direito; selecionar outros países para cooperação ou para assumir o seu comando.
4. Abrir **Cidade / Operações** e clicar no mapa para posicionar infantaria, barreiras ou evacuação.
5. Usar **+1 dia** ou **Iniciar**, com velocidades 1× e 4×. A tecla Espaço permite iniciar/parar.

Para desenvolver com Codex, abrir esta pasta como projeto. O ficheiro `AGENTS.md` explica os princípios e as verificações a manter.

## Funcionalidades incluídas

- Fronteiras de 177 países e territórios, com seleção interativa e estado próprio.
- Propagação agregada de uma infeção fictícia entre países por proximidade e circulação, com efeitos nacionais e internacionais.
- Capacidade defensiva, orçamento, estabilidade, economia e diplomacia modelados por **índices abstratos**.
- Três decisões nacionais: controlo fronteiriço, estado de emergência, mobilização militar.
- Ajuda internacional, relação bilateral simplificada e possibilidade de assumir outro país.
- Vista urbana 2D gerada proceduralmente, partículas animadas de infetados/civis, infantaria, barreiras e evacuação.
- Interdependência: unidades urbanas e políticas nacionais reduzem pressão infecciosa; medidas gastam orçamento e podem afetar estabilidade/economia.
- Registo de acontecimentos, avanço em turnos, execução automática, reinício do cenário.
- Funciona offline, sem frameworks, servidores, recolha de dados ou APIs.

## Organização

- `index.html` — UI estática, acessibilidade, botões e painéis.
- `styles.css` — identidade visual responsiva.
- `data/world-data.js` — países e fronteiras simplificadas, base de demonstração.
- `src/simulation.js` — evolução diária, decisões, diplomacia e unidades: **o modelo de domínio**.
- `src/game.js` — renderização canvas, interação, interface e controlo temporal.
- `tests/simulation.test.cjs` — verificações automatizadas do motor (Node 18+).
- `docs/ROADMAP.md` — evolução modular com critérios de aceitação.
- `AGENTS.md` — instruções orientadoras para iteração com Codex.

## Fontes e limites

O desenho das fronteiras e nomes usa um shapefile de baixa resolução da **Natural Earth**, distribuído em domínio público e disponível nas fixtures do `pyogrio`. As estimativas de população e PIB do ficheiro são históricas e **não representam o ano de 2026/2027**. Não incluem todos os territórios e podem apresentar fronteiras controversas, desatualizadas ou simplificadas.

**Nenhuma classificação defensiva, militar, diplomática, económica ou de saúde desta demo corresponde a uma medição oficial atual.** São parâmetros fictícios, derivados por heurísticas de escala para permitir testar a jogabilidade. A taxa de infeção também não é um modelo epidemiológico validado; um cenário zombie não deve ser tratado como previsão científica.

Os mapas das cidades são **esquemáticos** e não usam mapas urbanos reais. A infantaria e os civis são representados por marcadores animados; ainda não há pathfinding, geolocalização de infraestruturas, unidades militares reais, logística detalhada, combates táticos completos, IA diplomática sofisticada, persistência ou multilíngua.

A demo inspira-se na categoria de estratégia e simulação de surtos, **sem copiar o código, arte, design visual ou identidade** de jogos comerciais existentes.

## Próximos passos prioritários

1. Adicionar cenários configuráveis e salvar/carregar.
2. Separar o sistema diplomático em relações bilaterais e blocos, com IA simples e decisões auditáveis.
3. Criar províncias e cidades com população real e traçados abertos (OpenStreetMap), respeitando licenças e atribuições.
4. Motor tático com pathfinding, linhas de visão, zonas de evacuação e objetivos, sem pretender imitar a complexidade de Broken Arrow.
5. Obter e versionar conjuntos de dados datados (World Bank, UN, SIPRI/IISS onde licenciados), separando real de ficcional.
6. Migrar a aplicação para TypeScript + PixiJS/Phaser ou Godot, conforme o perfil alvo (browser vs. desktop).

## Testes

```bash
node --test tests/simulation.test.cjs
```

O piloto de dados está isolado em `data/baseline/` e **não substitui a Alpha 0.1**. A edição `1.1.0-pilot`, com corte em 13/11/2026, contém os oito indicadores dos cinco países; cada valor conserva o seu ano e as condições de reutilização. A edição anterior de 12/11 está arquivada. Consultar o [pipeline D0–D2 e limitações](docs/BASELINE_DATA_PIPELINE.md), o [relatório de cobertura](data/baseline/REPORT.md) e as [atribuições e condições](data/baseline/ATTRIBUTION.md). `npm test` inclui as regressões do pipeline; a geração offline pode ser validada com `node scripts/data/validate-baseline.cjs`.

## Licença

Este protótipo foi gerado como ponto de partida de desenvolvimento. As fronteiras Natural Earth são de domínio público. Consultar as licenças das demais bases de dados antes de as integrar. Não há dependências de terceiros em tempo de execução.

## Visão de produto e colaboração com Codex

Este jogo pretende combinar a escala geopolítica mundial com a gestão de crise nacional e as operações urbanas 2D, numa simulação única e contínua — **não três minijogos independentes**. Os governos devem seguir interesses e capacidades próprias, e o tempo de progressão deve permitir decisões estratégicas ponderadas.

- [Conceção do jogo](docs/GAME_DESIGN.md)
- [Arquitetura, invariantes e integração micro–macro](docs/ARCHITECTURE.md)
- [Primeira tarefa para o Codex e fluxo GitHub](docs/CODEX_START_HERE.md)
- [Roadmap incremental](docs/ROADMAP.md)

`main` deve permanecer jogável; desenvolver milestones em branches e PRs com testes.
