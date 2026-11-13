# Living City V0.2 — regras implementadas

Esta demonstração é uma sociedade urbana sintética, autónoma e isolada da
campanha mundial. Não altera a população, a economia ou as regras da Alpha
nacional, nem integra A1b. Pessoas, instituições, doença, distâncias e tempos são
parâmetros ficcionais de jogo. Não constituem previsões clínicas, dados policiais
ou estimativas de capacidade de serviços reais.

Este documento descreve o código em `living-city/core/`. Resultados de testes,
medições de browser e limitações do hardware pertencem ao relatório de validação,
não são inferidos destas regras.

## Organização e relógio

| Etapa | Módulos e responsabilidade |
| --- | --- |
| LC0 | `topology.cjs`, `helpers.cjs`, `population.cjs`: cidade, redes, identidades, localizações e rotinas. |
| LC1 | `incidents.cjs`, `medical.cjs`: observação, chamadas, despacho, recolha e hospital. |
| LC2 | `health.cjs`: exposição, progressão, óbito, reanimação e agressão. |
| LC3 | `police.cjs`: patrulhas, identificação, aproximação, intervenção e retirada. |
| LC4 | Apresentação, áudio e interface leem o estado e os eventos; não decidem resultados do domínio. |

`world.cjs` exporta `LivingCity`, `TICK_SECONDS` e `positionOf`. O construtor aceita
seed, cenário, números de residentes e meios, capacidade hospitalar, fixture e
parâmetros validados. O passo lógico é sempre **0,1 segundos**. `step(ticks)` aceita
1–10000 ticks inteiros; a pausa consiste em não chamar o método. Velocidade,
câmara, FPS, desenho e áudio não entram nas decisões de saúde, deslocação ou tiro.

A sequência de cada tick é saúde → rotinas → observação/chamadas → medicina →
polícia → contagens derivadas. Cada sistema move apenas as pessoas e viaturas
sob a sua responsabilidade. Aleatoriedade de população, incidentes e resultado de
tiro usa o PRNG do domínio, guardado em `state.rng`.

`snapshot()` devolve uma cópia destacada para observação e diagnóstico. Não existe
importação de saves nesta versão. Reiniciar cria outra cidade com a mesma seed.
O diário canónico conserva os eventos; a interface pode mostrar apenas uma janela
do diário sem apagar a cadeia causal do domínio.

## Cidade, edifícios e caminhos

A topologia fixa tem **oito quarteirões e 32 edifícios** num espaço de 96×70
unidades urbanas sintéticas. Pequenos desvios nos cruzamentos produzem uma malha
ligeiramente irregular. As seeds variam habitantes, horários, pessoa inicial e
local inicial; não geram uma geografia real ou uma nova malha de ruas.

Existem habitações, comércio, serviços, hospital e esquadra. Cada edifício tem uma
identidade, uma entrada pedonal e um acesso viário associado. As redes são
distintas: 143 nós pedonais ligam passeios, passadeiras, portais e pontos de
desembarque; 15 nós viários ligam as ruas. A apresentação usa estes mesmos dados.

Rotas usam distâncias das arestas e procura de menor custo, com desempate estável.
Uma pessoa entra ou sai pelo portal do edifício. A viatura estaciona num nó
viário; o nó pedonal de desembarque coincide com essa posição. Doente e tripulação
percorrem os acessos a pé antes de embarcar ou entrar no hospital. Não há
recolha por teletransporte quando um marcador de ambulância se aproxima.

Uma nova ordem durante um trajeto conserva o segmento físico atual antes de
mudar de ramo. Uma aresta interrompida provoca novo percurso ou espera explícita;
não permite atravessar edifícios ou saltar o obstáculo.

O congestionamento é deliberadamente pequeno: viaturas próximas, a menos de
quatro unidades e dirigidas ao mesmo nó seguinte, reduzem o movimento a 45% da
velocidade. Passadeiras são ligações físicas no grafo, mas ainda não têm semáforos,
prioridade entre peões e viaturas ou gestão completa de colisões. Não há tráfego
automóvel civil, lugares de estacionamento ou simulação de trânsito de uma cidade
real.

## Pessoas e conservação

O cenário padrão cria **150 residentes, quatro socorristas, seis agentes policiais
e quatro profissionais hospitalares: 164 pessoas no total**. Os socorristas são
dois por ambulância e os agentes dois por patrulha; mudar os números de meios no
construtor muda esse censo inicial de forma explícita. Não surgem substitutos,
reforços, pessoas ou hordas por calendário.

Cada pessoa mantém a mesma identidade e exatamente uma localização: edifício,
rua, veículo ou hospital. Estar infetado não altera automaticamente a localização.
`crewIds` é uma afiliação estável à equipa; não significa que todos os membros
estão fisicamente dentro da viatura. `passengerIds` contém os doentes realmente
embarcados e `patientIds` os doentes realmente admitidos.

```
initialPopulation = pessoas vivas + pessoas falecidas
reanimatedHistorical = reanimadas ativas + neutralizadas
```

Uma pessoa falecida à espera de reanimação pertence ao primeiro balanço, mas ainda
não ao segundo. Reanimar reutiliza a identidade do óbito; neutralizar não cria
outro óbito humano. Entrar no hospital ou num veículo não cria uma cópia da pessoa.

Os residentes alternam casa, emprego/serviço e comércio, com deslocações físicas
entre quarteirões. A velocidade inicial varia entre 0,9 e 1,3 unidades/segundo;
permanências normais duram entre 12 e 72 segundos. Uma fração começa na rua e os
restantes no interior dos edifícios. A pessoa inicial e três testemunhas próximas
têm uma pausa inicial para tornar o primeiro acontecimento observável.

Pessoas sintomáticas, críticas, transportadas ou atribuídas a assistência deixam
de executar a rotina normal. Há medo individual após agressão, mas ainda não
existe um sistema geral de fuga de multidões, relações familiares ou decisões
sociais complexas.

## Cenários e saúde fictícia

| Cenário | Acontecimento inicial padrão |
| --- | --- |
| S0 | Sem patogénio e sem zombies. Uma pessoa existente apresenta dor aos 20 segundos; outros incidentes normais podem ocorrer aos 240 e 450 segundos. |
| S1 | Uma pessoa existente está infetada desde o início, manifesta sintomas aos 20 segundos, torna-se crítica aos 140, morre aos 230 e pode reanimar seis segundos depois. |
| S2 | Uma pessoa existente sofre óbito súbito aos 30 segundos e reanima dois segundos depois, mantendo identidade e censo. |

A pessoa e o local iniciais são determinísticos e variam com a seed. É também
possível indicar explicitamente um residente inicial existente. Não são criadas
vagas, entidades zombie externas ou cidadãos adicionais.

Por defeito, a exposição pode provir de uma pessoa reanimada **ou de um vivo
infetado já sintomático/crítico**. Um portador ainda assintomático não é uma fonte
de contacto neste modelo. `infectiousWhileAlive:0` desliga a transmissão a partir
de vivos para experiências controladas.

A exposição exige proximidade até 1,4 unidades e contacto fisicamente possível:
mesmo compartimento de veículo/edifício ou rua com linha de visão. O tempo de
exposição acumula-se por pessoa; **não tem de ser contínuo** e não decai entre
contactos nesta versão. Aos oito segundos acumulados de exposição ocorre infeção.
As novas infeções têm incubação de 35 segundos, estado crítico aos 140 e óbito
aos 230 segundos desde a infeção, com a ordem temporal protegida pelo motor.

Os interiores são compartimentos abstratos, sem divisões ou pisos: pessoas no
mesmo edifício/veículo podem partilhar contacto. Em particular, o hospital não
inclui isolamento clínico, equipamento de proteção ou ventilação. Este recorte
permite observar exposição de socorristas, profissionais e outros doentes; não
constitui um modelo de controlo de infeção hospitalar.

Uma pessoa reanimada procura pessoas vivas que consegue detetar até 16 unidades,
percorre o grafo a 1,15 unidades/segundo e agride até 1,2 unidades. Cada agressão
aplica oito pontos de dano, no máximo uma vez por segundo. São valores de jogo.
Um reanimado no interior pode sair pelo portal conhecido; num veículo permanece
na mesma localização até o serviço parar e desembarcar fisicamente os ocupantes.

## O que é observado e o que chega à central

`healthState`, `hasPathogen`, `symptoms` e os eventos `truth` são verdade de
diagnóstico, não conhecimento automático dos serviços. `observedSymptoms`,
relatórios e `confirmedFacts` só recebem sinais observados por alguém.

Uma pessoa consciente pode comunicar os seus próprios sintomas. Perda de
consciência e agressão precisam de uma testemunha viva presente, de contacto no
mesmo interior ou de proximidade e linha de visão na rua. Uma chamada comunica
dor, febre, colapso ou comportamento agressivo; não revela um patogénio invisível
nem um diagnóstico zombie por consultar a verdade do motor.

O fluxo é observação → chamada → receção → triagem → atribuição → percurso →
avaliação → resolução/espera/escalada. A chamada demora dois segundos a chegar à
central; a triagem demora mais um segundo. Uma observação pessoal anterior à
receção não deve ser apresentada como informação já recebida pela central.

Relatórios ativos sobre a mesma pessoa e o mesmo tipo de ocorrência são
consolidados. Uma nova testemunha ou facto não cria outra vítima ou outra
ambulância. Gravidade nova pode aumentar a prioridade. A prioridade manual
mantém-se perante repetições da mesma informação; uma gravidade observada
superior à anterior pode voltar a escalar, com evento explícito.

O comando opcional `overridePriority` aceita prioridade inteira entre 1 e 5,
identifica a ocorrência e exige `commandId`. Repetir o mesmo ID e conteúdo,
independentemente da ordem dos campos, não reaplica o comando. Usar o ID com outro
conteúdo ou enviar uma entrada inválida é rejeitado sem mudar o estado.

## Medicina: pessoas, meios e camas finitos

Por defeito há **duas ambulâncias, dois socorristas por ambulância, quatro camas
e quatro profissionais hospitalares**. Cada ambulância transporta um doente além
da tripulação. Não existem ambulâncias, tripulações ou camas criadas para resolver
automaticamente uma fila.

A central ordena ocorrências médicas por prioridade, hora recebida e identificador.
Escolhe entre viaturas livres com tripulação presente e apta, aproximando distância
pela posição atual e validando a rota real. Não é um otimizador global de ETA.
Uma viatura tem apenas uma missão ativa; uma pessoa tem uma tarefa médica.

O ciclo inclui despacho, estrada, estacionamento, aproximação a pé, avaliação,
recolha física, embarque, transporte, acesso pedonal ao hospital, entrega e regresso.
Valores padrão:

| Ação | Parâmetro ficcional |
| --- | --- |
| Ambulância na estrada | 7 unidades/segundo, antes do fator de congestionamento. |
| Socorrista na aproximação | 1,25 unidades/segundo. |
| Avaliação no local | 5 segundos. |
| Doente assistido até ambulância/hospital | 0,9 unidades/segundo; 0,65 se crítico, representando transporte assistido. |
| Entrega hospitalar | 6 segundos com um profissional reservado. |
| Internamento normal sem patogénio | 65 segundos antes da alta. |
| Preparação após libertar a ambulância | 3 segundos antes de poder receber novo despacho. |

A entrega exige **cama livre e profissional hospitalar vivo, não crítico e presente**.
Cada entrega simultânea reserva um profissional distinto; a reserva é libertada
na admissão, interrupção ou perda de capacidade. Camas livres não substituem
profissionais incapacitados. Se faltar uma cama ou profissional, o doente e a
equipa ficam fisicamente à espera na entrada, com motivo registado.

Um incidente normal pode receber alta e voltar às rotinas. O patogénio desconhecido
não é curado instantaneamente por triagem, transporte ou hospitalização. A sua
progressão pode continuar no local, na ambulância ou no hospital.

Uma ameaça percebida torna a cena insegura: a equipa pede apoio e aguarda.
Uma transformação dentro da viatura, ou doença crítica/óbito da própria
tripulação, obriga a parar no próximo nó real antes de desembarcar. A localização
e os registos de passageiros são reconciliados na mesma transição. Tripulação
incapacitada torna o recurso indisponível; um doente vivo de uma ocorrência ainda
aberta, que não esteja admitido, pode voltar à fila para outro meio existente.
Uma entrega já concluída conserva a resolução e a ocupação hospitalar mesmo que a
tripulação adoeça no regresso. Não há substituição automática de profissionais.

As fixtures `concurrentCalls`, `hospitalFull`, `blockedRoute` e `brokenVehicle`
permitem observar filas, prioridades, lotação e indisponibilidade. Não existe
reparação de viaturas, rede regional de hospitais, abastecimento de combustível
ou resgate externo completo.

## Polícia: observação, decisão e consequências

Existem por defeito **três patrulhas, uma viatura e dois agentes por patrulha**.
Os veículos percorrem circuitos reais enquanto disponíveis. O despacho usa a
ocorrência conhecida, prioridade, posição e disponibilidade; os agentes saem da
viatura e aproximam-se a pé.

| Regra | Valor padrão |
| --- | --- |
| Observação policial | Até 18 unidades, com linha de visão. |
| Tiro | Até 12 unidades; um disparo por segundo. |
| Munição | 32 por agente, sem reposição automática. |
| Dano por acerto | 28; integridade inicial reanimada 55. |
| Probabilidade de acerto | 0,82, usando exclusivamente o PRNG do domínio. |
| Viatura em resposta | 5,5 unidades/segundo; patrulha normal a 65% desse valor. |
| Aproximação / retirada a pé | 1,75 / 2,1 unidades/segundo. |
| Margem para terceiros na linha de tiro | 0,7 unidades. |

Um agente só dispara a pé, apto, com munição e autorização por observação física
de uma pessoa **reanimada e hostil**. A pessoa precisa de pertencer ao conhecimento
individual desse agente e continuar visível e dentro do alcance. Ser infetado,
sintomático, crítico ou desconhecido **não é autorização de tiro**.

O motor verifica edifícios na linha de visão e pessoas vivas próximas da linha
de tiro, incluindo ocupantes de viaturas. Terceiros podem impedir o disparo. O
agente pode reagir enquanto caminha; uma rota ainda pendente não impede observar,
decidir ou disparar. Não existe dano automático porque um carro policial chegou.

Cada disparo consome uma munição e produz `ShotFired`, com agente, alvo, posições,
tick, arma abstrata, munição, resultado e dano. Áudio, flash e impacto consomem
esse evento; não geram novos tiros. Neutralizar altera a mesma identidade sem
acrescentar outro óbito humano.

Munições insuficientes, saúde crítica, falta de efetivos ou avaria podem provocar
retirada, pedido de reforço ou indisponibilidade. Emergência na própria tripulação
também exige paragem num nó e desembarque físico. Reforço significa procurar outra
patrulha existente. Não há reposição automática de agentes, integridade ou munição.
`policeBusy` mantém temporariamente os meios ocupados para testar espera por apoio.

## Limites desta versão

- Interiores são localizações abstratas, sem quartos, portas animadas, pisos ou
  circulação interna detalhada. A passagem interior/portal é uma fronteira do
  modelo, não uma simulação de percurso dentro de cada edifício.
- Os grafos e os obstáculos sustentam as rotas, mas trânsito, passadeiras,
  estacionamento e colisões são aproximações simples.
- Não existem diagnóstico clínico validado, imunidade, tratamento do patogénio,
  equipamentos de proteção, isolamento ou epidemiologia real.
- A polícia usa regras ficcionais limitadas de observação, alcance e segurança;
  não representa doutrina policial nem investigação ou uso da força reais.
- Não há economia nacional, mobilização, safe zones, reforços infinitos,
  diplomacia, A1b, campanha persistente ou migração de saves.
- Não há promessa de identidade numérica entre todos os browsers ou de 60 FPS
  num PC não medido. O motor é independente do desenho; desempenho e experiência
  de utilização precisam de medições identificadas.
