# População, deslocações e evacuação

Estado: **PROPOSED** — modelo técnico de 2026-11-12 para revisão. A evacuação física, destino identificado, existência de pessoas em trânsito e proibição de dupla contagem são direções estabelecidas pelo diretor criativo. Os estados e algoritmos propostos aqui ainda não são especificação aprovada nem implementação. Ver [decisões](DECISION_LOG.md), [questões em aberto](OPEN_QUESTIONS.md) e [arquitetura](SIMULATION_ARCHITECTURE.md).

## Problema da Alpha 0.1

O contador `saved` em [`src/simulation.js`](../../src/simulation.js) aumenta diariamente segundo o número de unidades de evacuação, sem retirar pessoas de uma origem ou limitar a população elegível. Uma execução com ATF, uma unidade e 15 dias registou 204 evacuados para uma população de 140. Isso é uma falha conhecida, não uma representação aceitável para a campanha.

Também não basta acrescentar um limite `saved <= population`: a mesma pessoa pode viajar mais de uma vez; uma deslocação pode falhar; e alguém evacuado pode adoecer ou morrer posteriormente. O modelo deve separar pessoas, estados presentes e acontecimentos históricos.

## Unidade de contabilização

Propõem-se coortes identificadas com uma contagem inteira, e indivíduos apenas quando forem necessários à operação. Uma coorte agrupa pessoas com atributos relevantes equivalentes; pode ser dividida para uma deslocação ou transição sanitária. Dividir 100 pessoas em 40 e 60 não cria duas novas populações de 100. Fusões devem preservar a informação necessária a ordens, origem e auditoria.

Um marcador visual pode representar uma pessoa ou uma fração agregada, segundo a escala. O peso da representação é explícito e não constitui um stock adicional. Instanciar mais marcadores não altera o balanço.

| Dimensão | Exemplos de valores | Regra |
| --- | --- | --- |
| Identidade/proveniência | `cohortId`, origem, população de referência | Pessoas não surgem por mudar a representação |
| Ciclo de vida | viva, falecida | Estados exclusivos; um óbito é registado uma vez |
| Saúde entre vivos | suscetível, exposta, infetada, recuperada | Valores permitidos e transições definidos pelo cenário |
| Localização física | zona, instalação, abrigo ou `transitId` | Exatamente uma localização atual por parcela |
| Situação de deslocação | residente, deslocada, regressada | Atributo ortogonal à saúde e à vida |
| Administração/proteção | residência habitual, nacionalidade agregada, entidade responsável | Não equivale à presença física |
| Estado pós-morte da ameaça | inerte, reanimada, neutralizada | Apenas nos cenários que o definem; não cria outro óbito humano |

Estes eixos evitam uma lista de contadores incompatíveis. Uma pessoa pode estar viva, infetada, deslocada e em trânsito ao mesmo tempo; não se somam essas quatro descrições para obter quatro pessoas. Coortes com combinações diferentes devem ser separadas onde isso afete regras.

## Balanços e agregados

Para a primeira campanha, propõe-se fixar a população de referência e não simular nascimentos nem imigração externa ao mundo. Se mais tarde existirem entradas/saídas demográficas, serão transações explícitas com origem e motivo.

O balanço global conceptual é:

`população inicial + entradas demográficas = pessoas vivas + pessoas falecidas + saídas demográficas`

Para os vivos, as categorias sanitárias exclusivas somam a população viva. As localizações físicas, incluindo trânsito, também particionam essa mesma população. Não somar totais sanitários aos totais geográficos. Nas agregações por localização, a zona urbana pertence à cidade, a cidade à região e a região ao país: os totais dos pais são derivados, não stocks adicionais.

Uma fronteira internacional pode mudar a presença física sem mudar a nacionalidade ou residência administrativa. Relatórios devem distinguir claramente “pessoas presentes”, “residentes habituais” e “cidadãos”. Pessoas em trânsito internacional contam uma vez no mundo; a rota é a sua localização, e o país responsável pelo transporte não as ganha como residentes. O destino pode reservar acolhimento antes da chegada, mas uma reserva não é ocupação.

Definir população preservada como resultado verificado num momento e numa população de referência. Não usar o número bruto de viagens como pontuação de sobrevivência.

## Ameaça zombie e mortes sem dupla contagem

O módulo de cenário define se a transformação ocorre antes ou depois da morte. A recomendação inicial para um cenário de mortos-vivos é: viva/infetada → falecida/reanimada. Nessa transição regista-se uma morte humana e a ativação da ameaça associada à mesma coorte histórica.

Neutralizar uma coorte reanimada altera o estado pós-morte de ativa para neutralizada; não cria uma segunda morte nem aumenta a população. O número de zombies ativos é uma consulta aos falecidos reanimados, e não um contador de novas pessoas a somar ao balanço humano. Ameaças de origem externa precisam de uma origem explícita separada; não podem ser disfarçadas de população humana duplicada.

Se o cenário escolher transformação enquanto vivo, o catálogo de estados e as métricas deverão representar isso de outra forma. A alternativa deve ser aprovada antes de programar as transições, sem transformar uma opção narrativa numa suposta regra biológica universal. Uma pandemia convencional pode incluir recuperação e imunidade sem qualquer estado de reanimação.

## Processo de evacuação proposto

| Etapa | Validações e efeitos |
| --- | --- |
| Planeamento | Origem, destino, pessoas elegíveis, prioridade, trajeto, prazo, condições sanitárias e autoridade competente |
| Aceitação | Reservar pessoas elegíveis, transporte, pessoal, combustível, financiamento e acolhimento; rejeitar compromissos incompatíveis |
| Preparação | Mobilizar meios e preparar embarque; a população continua fisicamente na origem |
| Partida | Retirar apenas os embarcados da origem e atribuí-los ao `transitId`; iniciar consumo e tempo de percurso |
| Trânsito | Aplicar atrasos, riscos, exposição, avarias e rerouting com causas e recursos explícitos |
| Chegada | Transferir sobreviventes para o destino; converter reserva de acolhimento em ocupação; aplicar triagem ou isolamento |
| Encerramento | Resolver reservas e obrigações restantes; produzir resumo sem reaplicar movimentos e perdas anteriores |

A quantidade embarcada é limitada pelo mínimo entre população elegível não comprometida, lugares efetivos de transporte, capacidade de embarque e acolhimento reservado. Capacidade por viagem é distinta de fluxo por hora; a mesma viatura não pode cumprir viagens sobrepostas. Lotação, duração e custos são parâmetros de jogo identificados, não dados presumidos.

Reservar pessoas impede ordens simultâneas de as comprometer duas vezes, mas não lhes retira vida, saúde ou localização. Antes de partir, revalidar alterações entretanto ocorridas: mortes, ausência de transporte, fronteira encerrada ou perda do destino. Uma reserva não garante partida nem eficácia.

Uma evacuação internacional exige acordo, autorização ou outra regra de cenário aprovada. Pedido de ajuda não teleporta viaturas nem pessoas. Identificar quem paga cada custo, quem fornece transporte e quem assume o acolhimento. Recursos do fornecedor ficam indisponíveis enquanto afetos; as duas partes registam compromissos coerentes.

### Cancelamento, perdas e deslocações repetidas

Cancelar antes de partir liberta reservas e liquida preparação já consumida. Durante o trânsito, a ordem deve regressar ou procurar outro destino válido; cancelar não repõe instantaneamente pessoas na origem nem restitui combustível gasto.

Mortes durante o trajeto são transições na coorte em trânsito. Os vivos que chegam são os embarcados menos as saídas registadas, incluindo mudanças explícitas para outras rotas. Não escrever simultaneamente a mesma perda numa população nacional e numa população local.

Uma pessoa pode ser evacuada novamente de um abrigo ameaçado. A segunda viagem é um novo acontecimento real, mas não uma nova pessoa preservada. Métricas distintas: viagens realizadas, pessoas atualmente deslocadas, pessoas únicas deslocadas e sobreviventes da população de referência. Se a agregação impedir medir pessoas únicas com exatidão, manter uma proveniência suficiente ou declarar a métrica indisponível; não a inferir somando chegadas.

## Exemplo de reconciliação

Exemplo fictício de teste: uma zona tem 100 pessoas vivas, das quais 10 infetadas. Uma ordem reserva 40 pessoas, transporte e acolhimento. Antes da partida permanecem 100 na origem. Depois partem 40: origem 60, trânsito 40, destino 0. A saúde dessas 40 segue com a coorte e não é reposta para “saudável”.

Se ocorrerem dois óbitos em trânsito, o balanço passa a 60 vivos na origem + 38 vivos em trânsito + 2 falecidos = 100. A chegada produz 60 vivos na origem + 38 no destino + 2 falecidos = 100. Reprocessar o evento de chegada não altera estes valores. O resultado da operação pode dizer “38 chegaram”; não soma 40 ou 38 a um stock autónomo de pessoas salvas.

Se cinco dessas 38 pessoas voltarem a deslocar-se, continua a haver 98 vivos. Foram realizadas mais cinco viagens pessoais, sem aumentar o número de pessoas únicas existentes.

## Consequências e informação disponível

Evacuar pode transferir infeção, congestionar estradas, interromper trabalho, sobrecarregar saúde e reduzir estabilidade no acolhimento. O objetivo é dar ao jogador escolhas com riscos observáveis e meios de mitigação: triagem, trajetos protegidos, partidas faseadas e reforço de capacidade. Não aplicar penalizações ocultas sem mecanismo ou contexto.

O estado verdadeiro da saúde é distinto do que os serviços conhecem. Triagem tem cobertura, atraso e eventual erro configurados pelo cenário. A interface pode apresentar estimativas e confiança sem adulterar o balanço interno. Decisões da IA usam a informação disponível ao respetivo governo, não conhecimento global automático.

## Invariantes e critérios de aceitação

- Quantidades inteiras e não negativas; combinações de estados válidas para o cenário.
- Uma localização física por parcela e nenhuma pessoa comprometida em duas partidas simultâneas.
- Divisão/fusão de coortes e transferências preservam os balanços; reservas são distinguidas de presença.
- População nacional/mundial deriva das mesmas parcelas, com trânsito explicitamente incluído.
- Um óbito é contado uma vez; reanimação e neutralização não duplicam mortes ou pessoas.
- Capacidade de transporte e acolhimento não é usada por compromissos incompatíveis.
- Partida, cancelamento, chegada e conclusão têm aplicação única, inclusive após guardar/carregar.
- Mudar a câmara não altera a evacuação nem a saúde dos passageiros.

Testar população zero, última pessoa elegível, destino lotado, comando duplicado, partidas concorrentes, mudança sanitária antes do embarque, fronteira encerrada, perdas em trânsito, novo destino, regresso e save durante a viagem. Incluir testes gerados de sequências de transferências para encontrar fugas de conservação, além de exemplos fixos.

## Entrega incremental

A estabilização não deve implementar de imediato migrações internacionais, simulação individual e redes completas de transporte. Recomenda-se uma transferência pequena entre origem e destino identificados, com elegibilidade, trânsito, capacidade e balanço testáveis. O contrato deixa espaço para rotas e acordos posteriores, sem fingir que estes sistemas já existem. O detalhe e o gate da primeira correção constam do [roadmap](DEVELOPMENT_ROADMAP.md).
