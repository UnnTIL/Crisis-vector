# CRISIS VECTOR — Plano de iteração Living City V0.2.1–V0.2.3

**Estado:** direção funcional aprovada pelo diretor criativo em 2026-11-13; implementação e parâmetros ainda por verificar.  
**Fundamento:** [PR #11](https://github.com/UnnTIL/Crisis-vector/pull/11), [URBAN_LIVING_CITY_V02](URBAN_LIVING_CITY_V02.md), [Issues #12](https://github.com/UnnTIL/Crisis-vector/issues/12), [#13](https://github.com/UnnTIL/Crisis-vector/issues/13) e [#14](https://github.com/UnnTIL/Crisis-vector/issues/14).  
**Importante:** PR #11 e PR #9 ainda são draft/stacked, não integrados na `main`. Não criar duas implementações concorrentes. Não mexer nos dados reais, motor nacional, A1b, safe zones ou economia.

## 1. Diagnóstico da V0.2 com base no código

- `living-city/core/population.cjs` escolhe o paciente inicial com base na seed mas **move-o** e a três testemunhas para um ponto `block-*-walk-1`, tornando a origem visualmente fixa/limitada.
- `living-city/core/incidents.cjs` agenda episódios S0 em ticks 200/2400/4500, não como resultado orgânico de múltiplas condições.
- `living-city/core/health.cjs` implementa infeção de pessoas existentes, perseguição e agressão, mas exposição acumula sem decaimento e reanimados no hospital saem pela entrada após ~1 s. O hospital é um compartimento único.
- `living-city/core/population.cjs` não inclui fuga civil geral; sem ameaça observada, os peões continuam rotinas.
- `living-city/core/helpers.cjs` move viaturas com congestionamento causado por outras viaturas, mas não por peões em passadeiras.
- `living-city/renderer.mjs` recebe parâmetro `alpha` de renderização, mas o desenho atual não interpola as posições entre snapshots de ticks; a orientação da câmara é fixa.
- `living-city/app.mjs` usa 10 ticks por segundo simulado e multiplica por `speed`; 2x avança mais passos em tempo real, podendo parecer mais fluido sem efetivamente suavizar animação.

As observações da imagem/experiência são da direção criativa; os pontos acima foram identificados no código do PR #11.

## 2. V0.2.1 — Correções de interação, circulação e origem

Prioridade imediata. [Issue #12](https://github.com/UnnTIL/Crisis-vector/issues/12).

- Os incidentes surgem de residentes existentes onde realmente estão: casa, trabalho, rua ou percurso. Não teleportar paciente nem criar testemunhas como cenário obrigatório. Chamada depende de alguém detetar e reportar.
- Q/E rodam a câmara ortográfica à volta do alvo, preservando pan, zoom, seleção por raycast e seguimento.
- Animar através de interpolação entre os estados **visuais** de dois ticks, sem alterar motor, colisões, contágio, chegada ou tempo lógico.
- Ajustar ritmo padrão: **1x da nova versão corresponde ao ritmo temporal do 2x atual**, com designação/escala inequívoca e opção de testar passos de tempo. Isto é escolha de UX; não substitui interpolação.
- Interação viatura/peão com cedência nas passadeiras, deteção de atravessamento e redução/paragem sem sobreposição; testes de deadlock em cruzamentos.
- Entrega com testes lógicos/visuais e demonstração comparativa pelo menos em três seeds.

## 3. V0.2.2 — Laboratório de Simulação

[Issue #13](https://github.com/UnnTIL/Crisis-vector/issues/13).

O objetivo é que a equipa possa testar e **guardar** parâmetros e resultados sem edição constante do código. É um painel DEV, distinto da UI final de governação.

- Cenários S0/S1/S2 e seed; controles de tempo e tamanho; exposição/incubação; disponibilidade da ambulância/polícia; velocidades; áudio/efeitos.
- Só expor parâmetros realmente ligados ao motor, tipados, com unidades/ranges. Alteração de regras exige reinício determinístico; alterações apenas gráficas podem ocorrer em tempo real.
- Guardar presets locais apenas como conveniência e **exportar/importar ficheiros JSON validados e versionados**. Guardar sem exportar não garante conservação quando se limpa o browser.
- Exportar run e relatório: `schemaVersion`, `engineVersion`, `scenario`, `seed`, parâmetros, ticks, hash lógico, estatísticas, eventos, limitações e metadados de desempenho.
- Comparação por seed igual/parâmetros diferentes e seeds diferentes/mesmos parâmetros. Dar destaque a sobreviventes, infetados, mortes, neutralizados, tempos de resposta, recursos, tiros e custos de lógica.
- Atalho «Copiar relatório para GitHub» cria Markdown para inserir manualmente num Issue/PR. **Sem escrita automática no repositório nesta versão:** GitHub Pages é estático; sincronização requer autenticação/autorização e um serviço separado, sem tokens no browser público.
- Testes de round trip export/import/replay e incompatibilidades versionadas.

## 4. V0.2.3 — Aprofundar propagação e comportamento

[Issue #14](https://github.com/UnnTIL/Crisis-vector/issues/14).

- Hospitais e outros edifícios contêm **zonas interiores lógicas** com ocupantes reais, acessos e contactos por proximidade/compartimento. Não acrescentar interiores gráficos completos antes de validar a dinâmica.
- Fugir da ameaça: deteção parcial, pânico, fuga e procura de abrigo; zombies perseguem pessoas próximas e podem responder a estímulos/ruído conforme regras de cenário.
- Contágio com exposição temporal configurável e hipótese documentada de decaimento ou interrupção. Nenhum zombie novo aparece sem uma pessoa previamente contabilizada.
- Formação/desagregação de hordas por proximidade espacial de indivíduos reanimados, e não por spawns. Grupos lógicos são índice/organização e **não adicionam população**.
- Resposta médica/policial mantém autonomia com recursos existentes e capacidade de intervenção precoce. Não atrasar polícia artificialmente para obrigar à escalada.
- Comparar S0/S1/S2 em pelo menos cinco seeds e diferentes configurações pelo laboratório, com regressões de 5/10/20 minutos.

## 5. Contratos que devemos preservar

1. Estado canónico por pessoa, com localização única (interior, rua, viatura, hospital), saúde, vida, tarefa e informação observável.
2. Tiros lógicos não dependem de flash/áudio; voz/som/zoom são apresentação.
3. Um relógio lógico, comandos idempotentes, PRNG com seed e resultados reproduzíveis por tick.
4. Entidades carregadas/desenhadas não acrescentam pessoas ou veículos. População inicial = vivos + mortos; reanimados ativos + neutralizados = reanimados históricos.
5. O laboratório não pode editar diretamente o estado interno nem conceder recursos fora de comandos validados.
6. Escalabilidade por medição; não aumentar mapa/população enquanto contágio, despachos e movimentação não estiverem fiáveis.
7. Sem integração com baseline, campanha mundial ou novos sistemas monetários nesta etapa.

## 6. Processo de entrega e revisão

- Para V0.2.1: criar `feat/living-city-v021-ux` a partir de `feat/urban-living-city-v02`; PR **stacked** com base nessa branch, nunca em `main` diretamente.
- Depois de rever V0.2.1, criar V0.2.2 a partir de sua cabeça aprovada; preservar histórico/branch e critérios do laboratório.
- V0.2.3 fica a jusante do laboratório para permitir calibração sem recompilar o motor.
- Cada PR: código/testes, CI, preview Pages apenas quando URL comprovado, ZIP autónomo, resultados e limites. **Não fazer merge automático.**
- A discussão/revisão deve deixar feedback no PR e atualizar decisão/roadmap na branch documental; qualquer futura integração da cadeia PR #9 → #11 → #12 etc. deve rever bases de PR e evitar duplicação de commits.

## 7. Perguntas de aprovação futura

- Qual o intervalo de velocidade normal que torna a experiência agradável, depois de interpolar? O valor inicial sugerido corresponde a antigo 2x.
- Quantidade de acontecimentos normais S0 e distribuição de locais/horas sem tornar a simulação imprevisível; validar por seeds, não forçar incidentes artificiais.
- Distinção entre perigo no hospital e comportamento de isolamento/evacuação dos doentes; efeitos de zonas internas.
- Persistência: presets locais + export JSON já aprovados para protótipo; ligação GitHub direta fica para fase com autenticação segura.

**Gate imediato:** V0.2.1 com demonstração mais fluida, incidentes espacialmente variados, Q/E e interação segura viatura/peão. O laboratório V0.2.2 vem a seguir.
