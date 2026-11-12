# CRISIS VECTOR — Visão do jogo

Estado do documento: **PROPOSED** · Revisão: ROUND-001 · Data: 2026-11-12.

Os requisitos assinalados como **APPROVED — direção de produto** foram explicitamente estabelecidos pelo diretor criativo na comunicação de consolidação. As propostas de concretização continuam sujeitas a validação. A aprovação de uma direção não autoriza, por si só, implementação. Consultar o [registo de decisões](DECISION_LOG.md), as [questões em aberto](OPEN_QUESTIONS.md) e o [índice](README.md).

## Identidade e experiência pretendida

O jogador governa um país durante uma crise global e observa as consequências das suas decisões, desde compromissos diplomáticos até às ruas de uma cidade. A profundidade resulta da ligação entre decisões, recursos, informação, acontecimentos e consequências.

**APPROVED — direção de produto:** existe um único mundo persistente. As escalas mundial, nacional/regional e urbana são perspetivas e formas de intervenção sobre esse mundo. Uma missão não recebe população ou forças criadas apenas para a cena: utiliza parcelas identificadas da campanha.

O ciclo de jogo pretendido é observar indícios, avaliar informação, definir prioridades, preparar capacidades, emitir ordens, acompanhar a execução e rever a estratégia. A intervenção tática é uma possibilidade dentro da governação, acompanhada por delegação e comportamentos autónomos. O jogador não precisa de comandar manualmente cada agente ou unidade.

As referências Plague Inc., Hearts of Iron IV, Zombies Aren't Real e Broken Arrow ajudam a comunicar escala, ritmo e legibilidade. Código, arte, áudio, identidade, interfaces e outros elementos proprietários não serão reproduzidos.

## Princípios de produto estabelecidos

| Princípio | Consequência para o desenvolvimento |
| --- | --- |
| Mundo único e causal | Recursos têm origem e destino; operações locais alteram a campanha uma única vez; relatórios permitem seguir as causas. |
| País fixo na campanha | O jogador escolhe um país no início e não evita consequências mudando de comando. A troca da Alpha 0.1 pertence à demonstração. |
| Prevenção e preparação relevantes | Vigilância, exercícios, reservas, investigação e cooperação devem criar opções antes da escalada. |
| Crises explicáveis | A informação pode estar incompleta, mas o estado real obedece a regras. Surpresas não são penalizações arbitrárias. |
| Resposta civil e militar | Saúde, municípios, proteção civil, bombeiros e polícia têm funções próprias. A mobilização militar depende da situação. |
| Sucesso com várias dimensões | População, instituições, serviços, segurança, sustentabilidade, prevenção, recuperação e cooperação contam. |
| Países diferentes, estratégias viáveis | Recursos iniciais distintos criam desafios distintos; poder militar não deve determinar sozinho o resultado. |
| Representação legível | Pontos, formas e edifícios simples tornam multidões e decisões compreensíveis; personagens detalhadas não são prioridade. |
| Expansão controlada | Zombies são o primeiro cenário principal. Pandemia e invasão alienígena permanecem possibilidades futuras. |

Estes princípios são **APPROVED — direção de produto**. Os pesos, regras quantitativas, calendários e soluções técnicas descritos a seguir são **PROPOSED**.

## Ritmo, informação e escolha

Recomenda-se um cenário inicial com sinais observáveis e uma fase de preparação, sem garantir ao jogador conhecimento completo da ameaça. Uma investigação pode diminuir incerteza; atrasos administrativos, deslocação e mobilização tornam a antecipação valiosa. Cada atraso deve possuir uma causa que possa ser inspecionada.

O ritmo não será definido pelo atual botão de um dia. Será calibrado com decisões significativas por intervalo de campanha, tempo disponível para reação e consequências de ordens pendentes. A relação temporal entre escalas está proposta em [SIMULATION_ARCHITECTURE.md](SIMULATION_ARCHITECTURE.md).

A interface deve distinguir estado real, informação disponível ao governo e estimativas apresentadas. Por exemplo, um relatório de ocupação hospitalar inclui momento da observação e cobertura; ausência de casos conhecidos não prova ausência de infeção. Informações ocultas não justificam regras retroativas.

Uma decisão relevante apresenta intenção, custo, disponibilidade, duração estimada, risco conhecido e alternativas. Após execução, o jogador pode consultar o que aconteceu, o que foi observado e o que permaneceu incerto. Uma decisão reversível pode ser cancelada, mas custos já incorridos, deslocações e perdas não são apagados.

## Exemplo de experiência integrada

1. Pequenos focos numa zona residencial produzem pedidos locais e relatórios sanitários incompletos.
2. O governo prioriza vigilância e manda polícia controlar acessos. Mobilizar meios tem custo e duração.
3. O município pede transporte e alojamento para evacuar uma população elegível. Essa população passa da origem para trânsito e depois para um destino com capacidade.
4. Uma estrada bloqueada atrasa o transporte. O jogador pode reforçar a proteção, mudar o trajeto ou suspender a operação.
5. Engenharia e transporte militar só ficam disponíveis se puderem ser mobilizados, abastecidos e destacados das reservas existentes.
6. Ajuda externa pode fornecer meios, mas depende da capacidade do parceiro e de um compromisso registado.
7. O resultado altera pessoas, recursos, serviços e relações. A vista urbana mostra a operação; a vista mundial continua a permitir acompanhar a crise.

O exemplo ilustra o objetivo, **não descreve funcionalidades existentes nem uma sequência já aprovada para implementação**. Os respetivos contratos estão propostos em [GAMEPLAY_SCALES.md](GAMEPLAY_SCALES.md), [POPULATION_AND_EVACUATION.md](POPULATION_AND_EVACUATION.md) e [GEOPOLITICS_AND_ECONOMY.md](GEOPOLITICS_AND_ECONOMY.md).

## Países e capacidades de resposta

Recomenda-se diferenciar capacidade nominal, prontidão, localização, transporte, abastecimento e mobilização. Uma unidade inscrita num inventário pode estar indisponível. Uma reserva financeira não substitui uma ponte, uma equipa formada ou combustível no local certo.

| Capacidade | Função pretendida | Limitações a representar progressivamente |
| --- | --- | --- |
| Polícia | Ordem pública, controlo de acessos e proteção | Disponibilidade, desgaste, equipamento, limites de atuação e escala da ameaça. |
| Bombeiros e proteção civil | Assistência, resgate, evacuação e coordenação local | Transporte, especialização, segurança dos percursos e capacidade de acolhimento. |
| Equipas médicas | Triagem, tratamento, transporte e gestão sanitária | Pessoal, instalações, consumíveis, exposição e tempos de tratamento. |
| Infantaria | Proteção de posições e contenção | Mobilização, abastecimento, fadiga, perdas e necessidade de apoio. |
| Engenharia | Obstáculos, reparações e apoio logístico | Material, acesso ao local, duração e proteção dos trabalhos. |
| Transporte | Movimentação de pessoas e abastecimentos | Capacidade, combustível, distância, congestionamento e risco. |

Esta taxonomia traduz funções pedidas pelo diretor criativo; detalhes de organização e equilíbrio permanecem propostos. A primeira missão deve usar apenas as capacidades necessárias para demonstrar o ciclo completo.

## Sucesso, avaliação e equilíbrio

**APPROVED — direção de produto:** a eliminação da ameaça não é o único objetivo; a campanha mantém o país escolhido e admite condições próprias de conclusão ou colapso.

Propõe-se apresentar um painel de resultados por dimensão antes de reduzir tudo a uma pontuação:

- Pessoas vivas e condições de vida, com perdas e deslocação explicitadas.
- Continuidade institucional e acesso a serviços essenciais ao longo do tempo.
- Segurança de zonas e corredores, sem confundir controlo nominal com proteção efetiva.
- Sustentabilidade financeira e material, incluindo dívida, atrasados e compromissos futuros.
- Preparação comprovada, tempo de deteção, resposta e recuperação.
- Cooperação e cumprimento de compromissos, com custos e benefícios observáveis.

A pontuação deverá combinar resultados com decisões verificáveis, sem premiar o número de cliques, ordens emitidas ou transferências repetidas. Preparar uma reserva útil pode contar; criar e cancelar a mesma ordem não pode gerar pontos. Uma evacuação repetida não converte as mesmas pessoas em várias vidas preservadas.

Para países com capacidades distintas, recomenda-se mostrar resultados absolutos e avaliação contextual separadamente. Objetivos de cenário podem considerar recursos e riscos iniciais, evitando que uma classificação relativa esconda perdas humanas. Pesos, metas, condições de derrota e eventuais limites mínimos por dimensão exigem revisão de produto e testes de equilíbrio; não estão aprovados nesta entrega.

## Escopo e limites da primeira experiência completa

Recomenda-se validar primeiro uma campanha zombie com um país de referência, poucos recursos e uma operação urbana que permita observar preparação, mobilização, deslocação, intervenção e consequências. O cenário Portugal é um candidato coerente com a demo, sujeito à aprovação do recorte de campanha.

Ficam para etapas posteriores a reprodução extensiva de cidades, inventários militares detalhados, múltiplas ameaças completas e diplomacia de grande profundidade. O crescimento depende de critérios de aceitação descritos no [roadmap](DEVELOPMENT_ROADMAP.md), em vez de uma acumulação de sistemas desconectados.

Browser é a orientação inicial do diretor criativo, sujeita a validação técnica. A proposta de candidato gráfico e benchmark está em [TECHNOLOGY_ASSESSMENT.md](TECHNOLOGY_ASSESSMENT.md); não existe promessa de 60 FPS ainda medida nem autorização para migrar o runtime.

## Relação com a Alpha 0.1 e revisão

A [visão original](../GAME_DESIGN.md) e o [roadmap anterior](../ROADMAP.md) permanecem como contexto histórico. A Alpha 0.1 possui políticas e efeitos agregados, mas não as operações, economia e diplomacia descritas nesta proposta. A fonte do comportamento implementado continua a ser o código validado e os seus testes.

Mudanças de direção devem identificar a decisão anterior, alternativas, consequências e aprovação humana no [DECISION_LOG.md](DECISION_LOG.md). Comentários de PR alimentam a revisão; uma sugestão de ChatGPT ou Codex não adquire automaticamente estado APPROVED. A revisão desta proposta encontra-se em [ROUND-001-CODEX.md](reviews/ROUND-001-CODEX.md); o feedback humano será registado separadamente.
