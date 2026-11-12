# Cenários de crise

Estado: **PROPOSED** — estrutura técnica de 2026-11-12 para revisão. Estão estabelecidos pelo diretor criativo um mundo comum, regras próprias por ameaça e o cenário zombie como primeiro cenário principal. Pandemia convencional e invasão alienígena são expansões futuras, não entregas paralelas. Ver [decisões](DECISION_LOG.md), [questões em aberto](OPEN_QUESTIONS.md) e [visão](GAME_VISION.md).

## Cenário não é apenas uma seed

A Alpha 0.1 usa focos, país inicial e data incorporados em [`src/simulation.js`](../../src/simulation.js). Uma definição de cenário deverá separar condições iniciais das regras e do estado evolutivo da campanha.

Contrato conceptual proposto:

| Elemento | Conteúdo |
| --- | --- |
| Identidade | `scenarioId`, versão, título, descrição e dependências de regras/dados |
| Mundo inicial | Data, população, geografia/topologia, instituições, stocks e relações |
| Escolha do país | Países elegíveis, desafios e parâmetros de assistência; país fixo após iniciar |
| Ameaça | Módulo e versão, origem, estados, transições, taxas, comportamento e condições de deteção |
| Conhecimento | O que cada governo sabe inicialmente, atrasos, fontes e qualidade dos relatórios |
| Cronologia | Focos, condições de escalada e acontecimentos com precondições e causas |
| Objetivos | Métricas, horizonte, condições de sucesso/derrota e regras de pontuação |
| Repetibilidade | Seed inicial, configurações de dificuldade e manifesto de conteúdo |

Guardar a campanha conserva o estado corrente, incluindo RNG e acontecimentos pendentes. Reiniciar um cenário cria um novo estado a partir da definição e seed. Uma alteração de equilíbrio ou de dados muda a versão necessária para comparar resultados; não reinterpreta silenciosamente uma campanha anterior.

## Sistemas comuns e específicos

| Comum ao mundo | Específico ou parametrizado pela ameaça |
| --- | --- |
| Países, regiões, cidades, topologia e relógio | Meio de propagação e velocidade de progressão |
| Pessoas, localizações e conservação | Catálogo sanitário, transformação, recuperação ou neutralização |
| Recursos, transporte, financiamento e serviços | Consumo médico e tecnologias relevantes para a crise |
| Instituições, ordens e capacidades de resposta | Comportamento de hordas, ataques e condições de contenção |
| Diplomacia, compromissos, comércio e ajuda | Informação a descobrir e métodos de investigação |
| Comandos validados, eventos e persistência | Objetivos próprios, escaladas e indicadores de ameaça |
| Observações e qualidade da informação | Regras de deteção, incerteza e desinformação próprias do cenário |

Um motor comum não obriga uma invasão externa a usar compartimentos de infeção, nem obriga uma pandemia a ter combate tático. As capacidades dos serviços podem ser comuns, mas a contribuição concreta de uma equipa médica, polícia ou infantaria depende das regras aplicáveis.

## Extensão proporcional

Começar com módulos JavaScript internos e uma interface pequena, exercida pelo primeiro cenário. Ameaças podem propor transições, exposição, pedidos de resposta e eventos; aplicam-nas através dos contratos de população, recursos e tempo. Não podem escrever contadores paralelos que ignorem conservação.

O contrato não deve tentar prever todas as crises futuras. Não há necessidade nesta etapa de scripts externos não confiáveis, editor universal, sistema de mods ou linguagem de regras própria. A primeira expansão demonstrará quais as abstrações que se mantêm e quais exigem revisão explícita.

O núcleo conhece capacidade, presença, compromisso e transferência. O módulo de ameaça conhece o significado de exposição, neutralização ou investigação nesse cenário. A apresentação pede descrições e estados por identificador, sem embutir fórmulas da ameaça nos renderizadores.

## Primeiro cenário: crise zombie

Recomenda-se uma campanha de referência com Portugal e contexto internacional limitado, mas autónomo. Portugal não deve ser a única entidade com evolução: os outros governos precisam de capacidade, necessidades, informação e decisões próprias. O detalhe inicial pode limitar-se a uma cidade e poucos corredores sem eliminar o resto do mundo agregado.

Proposta de arco para validar a experiência:

1. **Sinais e preparação:** incidentes pequenos, informação incompleta, vigilância e capacidade de resposta; a escalada não é inevitável por calendário.
2. **Contenção inicial:** coordenação municipal, saúde, proteção civil e polícia; meios e informação condicionam a resposta.
3. **Escalada condicionada:** aumento ou deslocação da ameaça quando as regras e capacidades o justificarem; mobilização, ajuda e evacuação tornam-se opções.
4. **Estabilização e recuperação:** manter serviços, acolhimento, finanças e população, mesmo depois de a ameaça imediata diminuir.

Este arco é uma proposta de design, não um guião de derrotas obrigatório. Condições de progressão devem estar ligadas ao estado, aos tempos e às decisões. Uma boa preparação pode evitar uma fase grave; o jogo deve conseguir reconhecer esse sucesso em vez de criar uma horda arbitrária para assegurar combate.

No cenário de mortos-vivos, ainda é necessário aprovar se transformação exige morte, que eventos a desencadeiam, o que significa neutralizar e se existe tratamento. O [modelo populacional](POPULATION_AND_EVACUATION.md) oferece uma alternativa recomendada que mantém o balanço humano e a ameaça separados sem duplicar pessoas.

### Operação de referência

Uma zona residencial perde capacidade de contenção. O governo recebe um relatório com timestamp e confiança, reserva polícia/proteção civil e prepara uma rota para um destino com acolhimento. Uma horda ou um foco local pode ameaçar a rota; reforçar, atrasar, mudar o destino ou retirar forças tem custos e consequências.

O critério de validação é a cadeia causal completa: capacidade nacional → ordem → mobilização e trânsito → efeito espacial → deslocação/baixas/consumo → situação nacional e pedidos internacionais. A animação mostra as entidades resultantes dessa cadeia; não é ela que cria o efeito.

## Expansões posteriores

### Pandemia convencional

Partilha população, transportes, economia, serviços, diplomacia e informação. Acrescenta transições sanitárias próprias, vigilância, investigação, amostras, tratamentos e capacidade hospitalar. Recuperação e imunidade dependem da definição; taxas fictícias são identificadas e não apresentadas como previsão científica.

Não duplicar o mundo para cada tipo de pandemia. Testar o módulo com um cenário pequeno que demonstre a reutilização dos contratos comuns sem estados zombie obrigatórios. A investigação deve representar trabalho, recursos e informação, não ser apenas um temporizador de vitória universal.

### Invasão alienígena

Estado **DEFERRED** enquanto conteúdo: é uma ambição de expansão estabelecida, mas sem especificação suficiente para implementação. Poderá partilhar soberania, logística, recursos, unidades, alianças, danos e deslocações; terá entidades externas, objetivos e regras próprias de tecnologia e conflito.

Entidades alienígenas de origem externa não pertencem à população humana inicial. Devem ter identidade e balanço próprios, sem reutilizar “infetados” para simplificar a apresentação. A arquitetura será reavaliada quando existir uma proposta de experiência jogável, em vez de construir já sistemas para uma ameaça indefinida.

## Dificuldade, sucesso e justiça

O sucesso deve considerar população preservada, serviços essenciais, instituições, território, sustentabilidade, preparação e cooperação, com objetivos próprios. Pesos, horizontes e condições de colapso são decisões de produto ainda em aberto. Não converter riqueza ou poder militar inicial diretamente em pontuação superior.

Recomenda-se comparar resultados com condições e objetivos específicos do país/cenário, e apresentar os componentes da avaliação. Evitar uma única média que esconda, por exemplo, perda de população compensada por dinheiro. Os critérios e quaisquer mínimos obrigatórios são visíveis antes da campanha.

Dificuldade pode variar informação inicial, capacidade e intensidade da ameaça de forma declarada. Não deve tornar a IA omnisciente nem conceder recursos sem origem de forma oculta. Sorteios são limitados por regras, conservam a seed e produzem causas investigáveis. Informação incompleta para o jogador não significa acontecimentos sem causa no motor.

## Validação de cenários

- Validar schema, referências, versões, contagens, localizações, recursos, objetivos e combinações de estados antes de criar a campanha.
- A mesma definição, seed e comandos carimbados produzem o mesmo estado normalizado dentro da matriz de runtimes suportados.
- Os módulos respeitam as invariantes de população e recursos, incluindo viagens, transformação, perdas e carga de saves.
- A prevenção bem executada pode reduzir ou evitar escalada; não há eventos obrigatórios que anulem silenciosamente decisões válidas.
- A IA usa a informação disponível ao seu governo e os mesmos comandos e custos do jogador.
- A campanha reconhece êxito por preservação e recuperação, sem exigir destruir uma quantidade predeterminada de ameaças.
- Abrir ou fechar uma cidade não altera as regras, sorteios de domínio ou resultados das operações ativas.

Primeiro validar uma crise zombie completa e pequena. Só expandir quando a integração entre escalas e a qualidade de decisões estiverem demonstradas nos gates do [roadmap](DEVELOPMENT_ROADMAP.md).
