# CRISIS VECTOR — Geopolítica, economia e capacidades nacionais

Estado do documento: **PROPOSED** · Revisão: ROUND-001 · Data: 2026-11-12.

As direções explicitamente decididas pelo diretor criativo são identificadas como **APPROVED — direção de produto**. Entidades, fórmulas e regras operacionais abaixo são propostas para revisão, sem autorização de implementação. Consultar o [DECISION_LOG.md](DECISION_LOG.md), as [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) e o [índice](README.md).

## Direção estabelecida e diferença face à demo

**APPROVED — direção de produto:** cada país tem interesses, informação, recursos e limitações próprios; o jogador mantém o país escolhido; governos autónomos usam regras económicas equivalentes às do jogador. Cooperação depende de capacidade e compromissos. Falta de financiamento produz consequências progressivas e não derrota automática.

A Alpha 0.1 ainda usa PIB fixo para receita, um índice de economia, políticas binárias e um valor `relations` por país. A ajuda é um efeito temporário, sem transporte ou obrigação bilateral. Este documento propõe a evolução e não apresenta essas capacidades como existentes.

## Estado nacional mínimo e autoridade dos recursos

Recomenda-se distinguir cinco grupos, adicionando campos apenas quando uma regra os utilizar:

| Grupo | Exemplos de estado | Regra de autoridade |
| --- | --- | --- |
| Finanças | Tesouraria, receitas, despesas, contratos de dívida e pagamentos em atraso | Um registo financeiro canónico; despesas locais são parcelas deste registo. |
| Recursos materiais | Combustível, bens essenciais, consumíveis médicos | Stocks localizados e transferências identificadas, sem duplicar reservas nacionais e locais. |
| Serviços | Saúde, segurança, transporte, água/energia numa fase posterior | Capacidade instalada, disponibilidade corrente e prestação efetiva são valores distintos. |
| Capacidades humanas e operacionais | Equipas, forças, transporte, prontidão e fadiga | Um destacamento retira disponibilidade à origem; pessoas e meios não surgem na cidade. |
| Compromissos e relações | Acordos, ajuda prometida, entregas e obrigações | Cada compromisso reserva capacidade e tem partes, prazo e estado próprios. |

O PIB descreve produção numa unidade e período de referência. Não é dinheiro disponível ao governo. O orçamento operacional da campanha terá moeda/unidade e período explícitos. Taxas de receita, custos e produtividade são parâmetros de jogo identificados, sem apresentar a fórmula da Alpha 0.1 como política fiscal real.

A integração com população e deslocações está em [POPULATION_AND_EVACUATION.md](POPULATION_AND_EVACUATION.md); comandos, relógio e transações estão em [SIMULATION_ARCHITECTURE.md](SIMULATION_ARCHITECTURE.md).

## Proposta de finanças simplificadas

### Contas e fluxos

Propõem-se tesouraria não negativa, dívida contratual e atrasados separados. Dívida não é receita permanente: financia tesouraria agora e cria obrigações futuras. Atrasados são obrigações vencidas ainda não pagas; não são simultaneamente contabilizados como um empréstimo, salvo refinanciamento explícito.

Em cada liquidação financeira, na mesma unidade monetária:

`tesouraria final = tesouraria inicial + receitas recebidas + donativos recebidos + crédito desembolsado - serviços pagos - juros pagos - capital amortizado - donativos enviados`

Esta equação ilustra categorias, não fixa taxas nem periodicidade. Pagamentos de atrasados pertencem à categoria da obrigação original e não são descontados duas vezes. O ledger liga obrigação, liquidação, destinatário e ordem causadora. Compromissos reservados mas ainda não pagos reduzem dinheiro livre para novas ordens, sem desaparecer da tesouraria antes da liquidação.

Receitas podem resultar de uma base fiscal simplificada afetada por atividade económica, controlo territorial e continuidade dos serviços. Comércio pode alterar acesso a bens e atividade; não deve produzir dinheiro automático por cada acordo sem fluxo ou contrapartida. Produção, importação e consumo devem ter fontes declaradas.

Para o primeiro recorte, recomenda-se poucos tipos de receita e despesa, sem simular famílias, bancos e empresas individualmente. Qualquer financiamento de um setor externo abstrato terá uma fonte explicitamente identificada e limites; os saldos dos governos não serão apresentados como um sistema monetário mundial fechado se esse setor ainda não for simulado.

### Custos e eficácia financiada

Uma medida tem custo inicial, necessidades operacionais por intervalo, tempo de mobilização e dependências materiais. Comandar uma medida e obter a sua eficácia são estados diferentes. O jogador vê custo estimado, obrigação já assumida e custo efetivamente pago.

Propõe-se uma fração de financiamento `f = valor alocado e pago / custo operacional necessário`, limitada entre 0 e 1. A eficácia resulta de `f`, pessoal, abastecimento, prontidão e condições locais, através de uma função de jogo a calibrar. Não se aprova aqui uma relação linear universal.

Reservas e capacidade já mobilizada podem amortecer falhas breves. A duração dessa autonomia deve ser explícita: uma unidade não perde toda a capacidade no instante em que falta dinheiro, nem permanece indefinidamente eficaz sem salários, manutenção ou abastecimento. Consumo de stocks, desgaste e atrasos decorrem do relógio da campanha.

A regra deve impedir a estratégia de gastar a tesouraria e conservar medidas gratuitas. Também deve evitar desligar automaticamente serviços essenciais sem dar opções de repriorização.

### Dívida, crédito e assistência

Um contrato de dívida proposto contém credor, devedor, principal, desembolsos, juros, vencimentos, garantias ou condições quando aplicáveis, pagamentos efetuados e atrasados. Para manter legibilidade, o primeiro recorte pode usar uma única categoria de empréstimo com calendário simples.

Novo crédito depende de oferta finita, capacidade de pagamento estimada, dívida e compromissos existentes, relações e condições negociadas. A disponibilidade nominal de crédito não autoriza gastar antes do desembolso. Refinanciamento é uma operação explícita, não um reinício do prazo sem custo.

Assistência pode assumir donativo, empréstimo, entrega de bens ou apoio operacional. Um donativo entre governos debita recursos do doador e credita o destinatário na mesma transação, ou passa por trânsito quando existir deslocação. Um empréstimo cria ainda ativo do credor e passivo correspondente do devedor. Prometer ajuda reserva capacidade; a entrega e a conclusão usam o mesmo identificador para impedir repetição.

Um país em crise pode recusar pedidos, reduzir montantes ou exigir condições. Organizações internacionais apenas distribuem recursos provenientes dos seus fundos ou contribuições modeladas. Não fornecem reservas infinitas para compensar dificuldades de equilíbrio.

### Insolvência progressiva

Propõe-se derivar a situação financeira de indicadores observáveis, usando patamares para comunicação e não uma barra arbitrária de falência:

| Situação proposta | Sinais | Consequências e opções |
| --- | --- | --- |
| Sustentável | Receitas, reservas e crédito comprometido cobrem obrigações próximas | Preparar reservas, investir, cumprir ajuda e reduzir exposição futura. |
| Sob pressão | Défice persistente ou reservas próximas de um limite de segurança | Avisos antecipados, revisão de prioridades e negociação de assistência. |
| Incumprimento parcial | Obrigações vencidas sem liquidação ou serviços abaixo do financiamento necessário | Eficácia degrada-se ao longo do tempo; surgem atrasados e desgaste; renegociar, cortar ou financiar. |
| Crise fiscal e institucional | Incumprimento prolongado com quebra de serviços e confiança | Acesso a crédito piora; apoio pode ter condições; recuperação permanece possível se houver capacidade institucional. |

Não existe derrota automática por tesouraria zero ou por atingir um rácio universal. Colapso institucional é uma condição de cenário separada, sustentada por serviços, legitimidade e controlo, com critérios aprovados antes da implementação.

Juros, limites de crédito, durações de tolerância, prioridade de pagamentos e curvas de degradação exigem calibração e decisão humana. São questões de revisão, não números inferidos de dados históricos.

## Capacidades de resposta, mobilização e logística

Recomenda-se substituir gradualmente o índice defensivo único por capacidades utilizadas em decisões concretas:

- Capacidade nominal: pessoal e meios que constam da definição de referência.
- Disponibilidade: recursos que não estão comprometidos, em reparação ou perdidos.
- Prontidão: capacidade de iniciar uma missão e cumprir uma função.
- Mobilização: custo e duração para passar de reserva a força operacional.
- Sustentação: transporte, combustível, consumíveis, manutenção e pessoal de apoio.
- Estado operacional: localização, missão, fadiga, desgaste, perdas e recuperação.

Polícia, proteção civil, bombeiros, equipas médicas, infantaria, engenharia e transporte terão funções complementares. A mesma unidade não deve ser a opção dominante para evacuar, tratar, reparar e conter. Uma ordem estratégica especifica intenção e limites; comportamentos autónomos executam-na dentro dessas condições, pedindo decisão quando ultrapassam a autoridade delegada.

Países menos poderosos devem poder prevenir exposição, usar informação, concentrar meios e negociar apoio. O equilíbrio não exige igualar inventários nem oferecer assistência garantida: exige cenários e objetivos que permitam alternativas além de confronto direto. A avaliação mostra resultados humanos absolutos e desempenho contextual, conforme [GAME_VISION.md](GAME_VISION.md).

## Relações bilaterais, acordos e confiança

Propõe-se distinguir perceções direcionadas de obrigações partilhadas:

- A avaliação de A sobre B pode diferir da de B sobre A: confiança, alinhamento de interesses, necessidade, perceção de risco e histórico relevante.
- Um acordo A–B é um objeto comum com partes, condições, duração, recursos prometidos e obrigações verificáveis.
- Uma relação não aumenta automaticamente por qualquer ajuda recebida de um terceiro. Os efeitos referem emissor e destinatário.
- Relações e compromissos não substituem acesso físico: ajuda acordada pode enfrentar fronteiras, rotas inseguras, capacidade de transporte ou atraso.
- Incumprimento altera a confiança com causa e contexto: incapacidade comprovada, cancelamento negociado e quebra unilateral podem ter efeitos diferentes.

No primeiro incremento diplomático, recomenda-se um pedido de ajuda, uma resposta limitada por capacidade e um acordo de entrega. Alianças, sanções, comércio completo e organizações com múltiplos membros entram apenas quando este ciclo estiver testado.

## Governos autónomos e explicáveis

Cada governo decide a partir da informação disponível ao seu país, não diretamente de todos os valores reais do mundo. O estado canónico contém a realidade; relatórios, estimativas, datas de observação e canais de partilha determinam o conhecimento de cada ator. A IA pode ter prioridades diferentes sem receber recursos ou certezas ocultas para compensar dificuldade.

Propõe-se uma política de decisão pequena e inspecionável:

1. Identificar necessidades, riscos conhecidos, obrigações e oportunidades no momento de avaliação agendado.
2. Gerar ações possíveis e eliminar as ilegais, indisponíveis ou incompatíveis com recursos e compromissos existentes.
3. Avaliar ações por utilidade, combinando preservação da população, serviços, segurança, estabilidade, finanças e interesses externos.
4. Aplicar prioridades e limiares para evitar oscilações constantes; considerar custo de cancelar uma ordem em curso.
5. Resolver empates por ordem estável. Aleatoriedade residual, se necessária, usa PRNG persistido e parâmetros identificados.
6. Emitir os mesmos comandos validados que o jogador e registar motivos, informação usada, custos e alternativas relevantes.

Exemplo de explicação: «Pedido reduzido porque 70% do transporte disponível já está reservado para evacuação interna; oferta restante chega após a conclusão desse compromisso». Os valores são ilustrativos, sem parametrização aprovada.

Reações não precisam de ocorrer a cada frame. Decisões periódicas e revisões por incidentes usam o relógio comum. Um pedido urgente pode antecipar a próxima avaliação, sem eliminar o tempo de mobilização ou de entrega.

Uma utilidade ponderada simples é o candidato inicial; planeamento hierárquico ou outros métodos só serão considerados se testes revelarem limites. A explicação deve preservar a incerteza e informação sigilosa perante o jogador; o modo de diagnóstico pode guardar a justificação completa para investigação.

## Fontes, parâmetros e proveniência

**APPROVED — direção de produto:** dados factuais possuem fonte, ano, unidade e metodologia; parâmetros fictícios são identificados; capacidade nominal não equivale a prontidão operacional. Não se pretende reproduzir operações militares contemporâneas com exatidão.

Recomenda-se um manifesto de datasets com origem, versão, data de obtenção, referência temporal, unidade, licença, cobertura, transformação e checksum do artefacto. Cada parâmetro derivado liga os seus dados de entrada e a versão da fórmula. Ausências são explícitas; um fallback tem marcação `synthetic` ou `estimated`, não é convertido silenciosamente em estatística oficial.

O ficheiro atual `data/world-data.js` atribui Natural Earth e contém população/PIB históricos, mas não permite reproduzir a origem e transformação exatas. Recuperar essa proveniência ou declarar a limitação deve anteceder a expansão de dados. Valores desconhecidos não justificam preencher um inventário detalhado sem fonte.

Introduzir primeiro o dado necessário a uma mecânica validada. Para uma missão de transporte, capacidade disponível e tempo de mobilização podem ser mais úteis do que um catálogo extenso de equipamento. Licenças e condições de redistribuição serão verificadas antes de incorporar dados ou artefactos ao jogo.

## Validação proposta

- Mesmas ações, informação e estado produzem as mesmas decisões e resultados, incluindo após guardar/carregar.
- Jogador e IA pagam os mesmos custos e respeitam disponibilidade, crédito e mobilização equivalentes.
- Tesouraria e stocks não ficam negativos; dívida e atrasados são contabilizados separadamente e reconciliados.
- Um compromisso financeiro não é cobrado duas vezes; uma entrega repetida não credita bens ou dinheiro novamente.
- Um país sem capacidade pode recusar ajuda; nenhum ciclo de pedidos, empréstimos ou cancelamentos cria recursos.
- A deterioração e recuperação de serviços seguem financiamento, stocks e tempo, sem eficácia integral infinita a custo zero.
- A ajuda A→B afeta a relação pertinente e não a de C→B; acordos mantêm obrigações próprias.
- Cenários com poucos recursos preservam alternativas viáveis de prevenção, cooperação e priorização.
- A alteração da câmara ou da frequência de renderização não muda obrigações, pagamentos ou decisões autónomas.

Estes são critérios para futuras tarefas, não testes acrescentados ou resultados já medidos. A sequência de implementação e o backlog da auditoria estão no [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md).

## Questões para a revisão

Devem ser validados o recorte financeiro inicial, a representação de crédito externo, as prioridades em insuficiência de tesouraria e a forma de apresentar deterioração/recuperação. Taxas, pesos, metas e disponibilidade de acordos não são decisões fechadas. A decisão de manter o país escolhido, de representar deslocação física e de aplicar regras equivalentes à IA já foi tomada e não deve ser reaberta como pergunta genérica.

Consolidar as respostas nas [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) e no [DECISION_LOG.md](DECISION_LOG.md). O contexto histórico permanece em [GAME_DESIGN.md](../GAME_DESIGN.md) e [ARCHITECTURE.md](../ARCHITECTURE.md); este documento não substitui silenciosamente essas versões nem descreve uma implementação pronta.
