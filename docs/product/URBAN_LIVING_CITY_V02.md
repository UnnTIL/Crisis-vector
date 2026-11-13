# CRISIS VECTOR — Urban Living City V0.2

**Estado:** `PROPOSED` quanto a contratos, algoritmos e parâmetros; **visão de produto estabelecida**: começar por simular uma sociedade urbana viva, com doença espontânea, recolha médica e resposta policial autónoma, antes da gestão nacional e safe zones.  
**Origem:** feedback da direção criativa após [PR #9](https://github.com/UnnTIL/Crisis-vector/pull/9) e [Issue #10](https://github.com/UnnTIL/Crisis-vector/issues/10).  
**Âmbito:** segunda prova urbana, isolada da campanha mundial, mas preparada para integração futura. O presente documento **não implementa funcionalidades**.

## 1. Identidade da experiência

Não construir apenas uma missão de defesa contra vagas. O jogo deve começar com uma cidade a funcionar sem ordens: habitantes têm origem e destino, trabalham, percorrem ruas e passeios, usam serviços e podem pedir ajuda. A crise nasce de acontecimentos dessa sociedade, não de hordas pré-programadas.

Em primeiro plano está a observação da dinâmica urbana: um doente pede assistência, uma testemunha chama o INEM/serviço médico simulado, uma ambulância é despachada, há triagem e transporte. A evolução pode conduzir à descoberta de uma condição desconhecida, agressão, transformação zombie, chamadas adicionais e intervenção policial. O jogador pode observar tudo **sem comandar** e receber informação parcial e tardia conforme o sistema de comunicação.

O modo de gestão nacional, legislação, orçamentos, mobilização militar geral, safe zones com portões e linhas de defesa estratégicas, e diplomacia ficam fora deste incremento. Estruturar dados e interfaces, sem criar um segundo simulador mundial.

## 2. Zona de teste — pequena, detalhada e expandível

**Proposta de parâmetros de teste** (não densidades factuais): 6–10 quarteirões, 20–60 edifícios, 150–300 civis, uma esquadra, um hospital, 1–2 ambulâncias, 2–4 patrulhas e um centro de despacho lógico. Reduzir números se a IA/tráfego necessitarem de otimização; priorizar observabilidade sobre quantidade.

### Topologia

- Malha orgânica de vias conectadas, quarteirões e passeios; cruzamentos e passadeiras como pontos com regras próprias.
- Edifícios com `buildingId`, `type` (habitação, comércio, emprego, hospital, esquadra, escola/parque opcional), `entranceNodeIds`, capacidade e ocupação.
- Grafo pedonal (`PedestrianGraph`) distinto do viário (`VehicleGraph`), unidos por acessos e locais de recolha. A construção visual pode extrudir os volumes sobre a mesma topologia, mas não definir caminhos através do desenho.
- As pessoas devem sair/entrar em edifícios, atravessar a cidade e permanecer contabilizadas dentro dos edifícios quando não estão visíveis na rua. Evitar clusters isolados e pontos inacessíveis.
- Rotas dependem de obstáculos e congestionamentos; um caminho interrompido pode provocar novo trajeto ou falha explícita. Não atravessar volumes intransitáveis.
- Zonas de interação/raycast e coordenadas estáveis no domínio, independentes de pixels, FPS e zoom.

**Teste de topologia:** qualquer edifício utilizado no cenário possui entrada pedonal ligada a pelo menos um destino relevante. Hospital/esquadra também têm acesso por veículo. Caminhos cruzam quarteirões por passeios e ruas legítimos.

## 3. População — estado e rotinas

### Estado mínimo conceptual

`personId, homeBuildingId, currentLocation, destination, currentActivity, schedule, lifeState, healthState, observedSymptoms, fear, mobility, currentTaskId, knownThreats`.

Uma pessoa tem **localização física única**: rua/nó, interior de edifício, veículo, hospital ou outra localização explicitamente identificada. Pode estar infetada e não o saber. A informação verdadeira está no motor; polícia, hospital e jogador observam apenas relatórios/deteções acessíveis.

### Rotinas

- Início com pessoas espalhadas por edifícios, ruas e serviços, não em seis grupos à espera de partir.
- Rotina determinística por seed: residência ↔ trabalho/serviço/comércio ↔ casa, caminhada, permanência, passagem na rua e interações.
- Pequenas variações de trajeto, pausas e horários, sem eventos periódicos que teletransportem pessoas.
- Quando há alarme, podem fugir, pedir socorro, evitar um ponto ou procurar abrigo. Não é necessário simular relações familiares profundas inicialmente.
- A renderização pode usar instancing; o número de marcadores é uma representação, não uma fonte autónoma de população.

### Conservação

A mesma pessoa passa por estados e localizações, nunca é substituída por um zombie independente. Manter `initialPopulation = living + dead` (sem nascimentos/entradas externas nesta fixture). Nos cenários zombie com reanimação após morte, `activeReanimated + neutralized = reanimatedHistorical`, em que reanimados remetem às mesmas identidades humanas mortas; neutralizar não acrescenta outro óbito humano.

O estado de doença e o estado de localização são eixos distintos: exposto, infetado ou doente não significa automaticamente agressivo.

## 4. Patologia e primeiro acontecimento

Definir um `OutbreakScenario` configurável, com `seed`, `initialPersonId` ou seleção determinística de uma pessoa existente, localização, modo, parâmetros e instante de início. **Proibir a geração de pessoas/hordas do nada por calendário**.

### Dois modos de teste

**S1 — doença progressiva:** um residente adoece, manifesta sintomas, testemunhas ou o próprio procuram assistência. O hospital pode avaliar o doente. Se o agente patogénico progredir, pode ocorrer perda de consciência, morte e reanimação segundo regras do cenário; o sistema médico pode ser o primeiro a confrontar-se com a ameaça.

**S2 — transformação súbita:** uma pessoa existente passa por um evento rápido de morte/reanimação (ou uma transição comprimida) num local determinístico mas variável por seed. Deve ser uma transformação da **mesma identidade**, não a inserção de um novo zombie. Acontecimento imprevisível para os agentes, mas causal no motor.

### Exposição

Para uma infeção por contacto, testar proximidade e duração com contagem de exposição por pessoa; após contacto relevante, transições condicionadas pela susceptibilidade e parâmetros da ameaça. Incubação, sintomas, perda de controlo e reanimação com eventos e instantes explícitos. Inicialmente sem modelação epidemiológica clínica real, com parâmetros de jogo identificados.

A opção «sem surto» mantém vida urbana e despachos normais, sem criação forçada de zombies. Hordas só se formam quando há concentração física de indivíduos reanimados; o agrupamento lógico pode aumentar/decompor-se sem mudar o balanço de pessoas.

## 5. Sistema de ocorrências e central de despacho

Pipeline canónico:

`IncidentObserved → CallCreated → CallReceived → Triaged → Assigned → EnRoute → OnScene → Assessed → Resolved / Escalated / Cancelled`.

- Incidentes têm `incidentId`, localização, tipo observado (queda, febre, agressão, perda de consciência), gravidade percebida, autor da chamada, `reportedAt`, `knownFacts`, meios necessários e estado.
- Uma testemunha só pode reportar o que observou; chamadas podem atrasar-se, ser incompletas ou duplicadas. A central consolida duplicados sem multiplicar vítimas.
- A central decide por prioridade, gravidade, distância/ETA, disponibilidade, ocupação e segurança; simultaneidade usa desempate determinístico.
- Um meio só pode estar ocupado numa missão de cada vez, com estados explícitos `available → dispatched → enRoute → onScene → transporting → handover → available`.
- Falhas verificáveis: dois incidentes com uma ambulância, viatura avariada, percurso interrompido, hospital cheio, cena insegura e falta de patrulhas.
- Eventos/relatórios separam `truth`, `reported` e `confirmed`. Uma chamada não revela automaticamente a natureza zombie ao governo.

## 6. Resposta médica autónoma

Uma ambulância não é um marcador que aparece na vítima. Parte de uma instalação ou posição real com tripulação e capacidade finitas.

Ciclo: despacho → percurso viário → chegada/estacionamento → tripulação sai ou avalia na posição → triagem → cuidados iniciais → embarque do doente → transporte → chegada ao hospital → entrega/ocupação → libertação ou higienização/reabastecimento.

- O doente move-se da rua/edifício para a ambulância, e desta para o hospital; uma localização por identidade.
- O hospital possui capacidade, profissionais em serviço e tempo de triagem; não curar instantaneamente uma patologia desconhecida.
- Se a pessoa estiver agressiva ou se a cena for insegura, o serviço pode pedir apoio policial, aguardar à distância ou retirar.
- Um doente pode transformar-se em qualquer fase, inclusive durante triagem/transporte; consequências são processadas no mesmo estado e podem gerar nova ocorrência.
- Inclui incidentes médicos não relacionados com a epidemia para testar a autonomia sem surto.

## 7. Polícia autónoma e agentes individuais

Separar `PoliceOfficer`, `PatrolTeam`, `PoliceVehicle` e `PoliceStation`. A equipa recebe a ocorrência; os agentes executam ações individuais (deslocação a pé, observação, auxílio, proteção, cobertura e reação). A viatura transporta os agentes e estaciona; não se confunde com uma unidade de combate.

- Patrulhas têm posições reais e percursos enquanto não existem incidentes; outras ficam na esquadra.
- A central pode enviar a patrulha próxima ou pedir reforço de outra zona; tempos de resposta e efetivos são finitos.
- Estados por agente, por exemplo `patrolling, responding, approaching, assessing, assisting, protecting, engaging, retreating, injured`. Não adicionar 30 estados sem comportamento demonstrável.
- Ao identificar ameaça hostil confirmada dentro do alcance e com linha de visão, um agente autorizado pode reagir **mesmo em deslocação**, se as regras de intervenção e segurança o permitirem. Uma pessoa infetada mas não agressiva não é automaticamente alvo.
- Regras de intervenção consideram reconhecimento, terceiros, risco, munições, prioridade de proteção e necessidade de retirada. Não emitir fogo para «pontos de infeção» invisíveis.
- Não exigir que o jogador escolha patrulhas, mande disparar ou recolha cada doente. O comando manual é opcional para testes e futura gestão.
- A dinâmica relevante é `ocorrência → avaliação → patrulha → decisão → consequência`, não «carro azul aproxima-se e causa dano».

## 8. Efeitos visuais e sonoros

Cada disparo lógico produz um evento estruturado `ShotFired` com `shooterId`, `weaponClass` abstrata, `position`, `targetId`, `tick`, `ammoSpent`, `hitOutcome` e `eventId`. Os efeitos de apresentação **consomem** o evento; não criam tiros nem baixas.

- Flash muito breve no cano, traço/projétil estilizado opcional, impacto e pequena reação visual; sem efeitos excessivos ou gore.
- Som original sintetizado por Web Audio ou assets licenciados, com variações simples e volume atenuado com distância; som no canal de interface/radio diferenciado de ruído ambiente. Web Audio deve ser iniciado após interação explícita do utilizador, com estado mute/volume e manejo de bloqueio por autoplay.
- Limitar sons simultâneos, agrupar tiros distantes para evitar cacofonia e otimizar muitas fontes. Não enviar centenas de `AudioNode` novos por frame.
- Opções de acessibilidade: mute, volume, redução de flashes/movimento; eventos críticos visíveis e legíveis sem áudio.
- FPS/câmara/áudio desligado não alteram munição, resultado de tiro, saúde ou evolução dos incidentes.
- Extras futuros: sirenes com atenuação, rádio/despacho, travagens e ambiente urbano; não copiar efeitos sonoros de jogos comerciais.

## 9. Interface do teste — observação primeiro

**Objetivo:** o jogador vê a cidade como um observador de uma emergência, podendo consultar e intervir quando quiser.

**Barra superior:** tempo simulado, modo de cenário e velocidade/pausa, população, casos conhecidos, incidentes ativos e meios disponíveis. Verdade total só num modo debug explícito.

**Centro:** cidade com câmara ortográfica e zoom, habitantes/polícias/ambulâncias, seleção e seguimento opcional de pessoa/viatura/incidente, camadas de serviços/estado/risco.

**Painel lateral contextual:** ocorrência selecionada, localização, hora da chamada, gravidade estimada, estado de despacho, ETA, equipa atribuída e situação conhecida; selecionar agente mostra estado, recurso e tarefa.

**Diário de acontecimentos:** chamadas, triagem, despachos, chegadas, reconhecimento, socorro, transformações confirmadas e escaladas. Não inundar o utilizador com cada contacto micro.

**Controlos:** iniciar, pausa, 1×/2×/4×, reiniciar seed, cenário S0/S1/S2; opcionais comandos manuais `respond`, `dispatch`, `requestBackup` ou `overridePriority`, sem necessidade de uso. Alterações táticas devem entrar no mesmo sistema de comandos da IA.

## 10. Contratos de arquitetura e tempo

- `CityDefinition`: geometria, edifícios, redes, bases, capacidades.
- `UrbanWorldState`: `time/tick`, habitantes, saúde, veículos, instalações, incidentes, equipas e tarefas.
- `Command`: autor, intenção, destinatário, validação, tempo, resultado e ID único; agentes/centrais podem emitir comandos como o jogador.
- `DomainEvent`: efeito confirmado com `eventId`, origem, tempo, entidades e deltas auditáveis.
- `Renderer/Audio`: apenas leitores, sem decisões de infeção, despacho ou combate.
- `ScenarioConfig`: S0 sem surto, S1 doença progressiva, S2 transformação súbita, seeds e valores experimentais.
- `OperationSnapshot`: cópia destacada, compatível com exportação futura (sem obrigação de persistência completa V0.2).

Reaproveitar funções e contratos do `urban-spike` quando existirem, mas não preservar a estrutura de ondas e equipas abstratas se conflituar com a visão. Evitar refatorizar a Alpha mundial nesta tarefa.

A cidade pode atualizar-se a 10 Hz de tempo simulado e renderizar por interpolação até 60 FPS no hardware de referência; ajustar cadências por benchmark. Um relógio canónico local serve a prova; futura integração terá de mapear os ticks para o relógio de campanha, sem dois mundos paralelos.

## 11. Casos de teste e critérios de aceitação

| ID | Cenário | Demonstração necessária |
| --- | --- | --- |
| LC-01 | Sem infeção | Habitantes seguem rotinas e serviços, sem zombies criados por timer |
| LC-02 | Doença progressiva | Pessoa já existente adoece, chamada médica, ambulância sai da base, recolhe e leva ao hospital |
| LC-03 | Transformação súbita | Pessoa existente reanima, mantém identidade/censo e desencadeia incidente observável |
| LC-04 | Infeção por contacto | Exposição temporal identificada; infetados novos provêm de pessoas existentes |
| LC-05 | Despacho concorrente | Uma ambulância para duas chamadas → prioridades/espera explícitas e sem duplicação |
| LC-06 | Hospital lotado | Espera/reencaminhamento explicado; ninguém desaparece ou é curado por falta de cama |
| LC-07 | Polícia autónoma | Patrulha dirige-se ao incidente e avalia sem comando do jogador |
| LC-08 | Combate autorizado | Agente reage quando identifica ameaça hostil e tem linha de visão/alcance, inclusive enquanto se desloca |
| LC-09 | Civil infetado não hostil | Agente não abate automaticamente alguém apenas infetado |
| LC-10 | Tiro multimodal | Evento lógico produz flash, som e impacto; mute/redução de efeitos não altera a simulação |
| LC-11 | Cidade navegável | Pessoas entram/saem de edifícios e circulam entre quarteirões por vias válidas |
| LC-12 | Determinismo/recursos | Seeds, diferentes FPS, pausas/zoom, custos, identidades, ambulâncias e patrulhas não duplicam resultados |

**Gates de qualidade:** `npm test` e regressões existentes sem falhas; validação de browser DPR 1/1.5/2; simulação parada sem erros; demonstração offline após carregamento; profiling em hardware relevante antes de alegar 60 FPS; medições identificam agentes lógicos e marcadores separadamente.

## 12. Sequência de desenvolvimento / revisão

- **LC-0 — Cidade e estado:** redes conectadas, instalações, pessoas finitas, rotinas, câmara/observação, invariantes.
- **LC-1 — Resposta médica:** incidentes normais, testemunhas/chamadas, central, ambulâncias, recolha, hospital, simultaneidade.
- **LC-2 — Ameaça:** origem em pessoa existente, progressão/súbito, exposição, transformação, propagação e primeiras concentrações.
- **LC-3 — Polícia:** esquadra, patrulhas, agentes individuais, reconhecimento, intervenção e retirada, critérios de segurança.
- **LC-4 — Audiovisual e refinamento:** flashes, disparos, som, sirenes, UI de ocorrências, desempenho, variação de seed.

Idealmente entregar V0.2 em PRs pequenos/stacked que demonstram cada ciclo antes de expandir para outra regra. Não misturar com A1b, safe zones, dados reais, orçamento ou gestão mundial.

### Avaliação recomendada pela direção criativa

1. Deixar 5–10 minutos de tempo de campanha com S0 sem dar ordens: a cidade deve parecer viva, com rotinas e resposta normal a incidentes.
2. Repetir com S1; seguir o paciente desde a chamada até ao hospital; observar possível escalada e comunicação.
3. Repetir S2; observar transformação abrupta, deteção, chegada da polícia, intervenção e propagação.
4. Testar carga e som no PC real, com áudio ativável e visualização clara do que cada agente fez.
5. Abrir o mapa após 10 minutos e verificar que o crescimento da ameaça e os recursos correspondem ao histórico, sem novas entidades criadas pelo zoom.

## 13. Decisões ainda a validar

- Número inicial de habitantes/agentes e dimensão do bairro após medição com GPU física.
- Regras concretas de agressão e letalidade (ficcionais, calibráveis).
- Hospitaliza-se quem e com que critérios? Definir triagem sem construir simulador médico completo.
- A polícia pode agir autonomamente sem intervenção; como a IA classifica ameaça e aplica regras de intervenção?
- Nível de detalhe do trânsito automóvel nesta fase; mínimo: veículos de emergência com rotas reais.
- Tipo de saída da demo: atualização do site Pages, preview estática ou ZIP; não declarar URL funcional sem teste.
- Estado e documentação do PR #9: aproveitar sua base como dependência explícita e manter `main` estável.

**Princípio final:** primeiro simular uma cidade e instituições autónomas; depois controlar uma crise; só numa fase futura construir gestão nacional e zonas seguras sobre esta base.
