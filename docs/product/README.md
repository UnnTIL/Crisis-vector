# CRISIS VECTOR — Proposta de produto e arquitetura v1

Estado: **PROPOSED — em análise, sem autorização de implementação**. Data: 2026-11-12.

Esta pasta consolida a visão apresentada pelo diretor criativo após a auditoria da Alpha 0.1. Propõe contratos e etapas verificáveis para um mundo persistente que liga geopolítica, gestão nacional e operações locais. Publicar ou integrar estes documentos não implementa funcionalidades nem autoriza automaticamente tarefas de código.

## Como ler e interpretar os estados

1. Começar por [GAME_VISION](GAME_VISION.md) e pelo [relatório da primeira revisão](reviews/ROUND-001-CODEX.md).
2. Consultar os contratos de [população](POPULATION_AND_EVACUATION.md), [simulação](SIMULATION_ARCHITECTURE.md) e [economia](GEOPOLITICS_AND_ECONOMY.md).
3. Rever a [avaliação tecnológica](TECHNOLOGY_ASSESSMENT.md), os critérios do [roadmap](DEVELOPMENT_ROADMAP.md) e as [questões em aberto](OPEN_QUESTIONS.md).
4. Registar a validação em [ROUND-001-FEEDBACK](reviews/ROUND-001-FEEDBACK.md) e consolidar decisões no [DECISION_LOG](DECISION_LOG.md).

| Estado | Significado |
| --- | --- |
| `PROPOSED` | Recomendação sujeita a discussão; não constitui uma decisão aprovada. |
| `APPROVED` | Direção explicitamente estabelecida pelo diretor criativo ou posteriormente validada, com referência da origem. Não significa «implementado». |
| `DEFERRED` | Escolha conscientemente adiada, com condição para voltar a ser analisada. |
| `REJECTED` | Alternativa recusada por decisão explícita, com motivo registado. Não presumir este estado só porque existe outra recomendação. |

O pacote técnico está em proposta. O Decision Log distingue os princípios já estabelecidos na comunicação de consolidação das soluções técnicas ainda propostas. Os documentos temáticos desenvolvem esses registos; em caso de conflito, não selecionar silenciosamente uma interpretação: identificar o registo afetado e propor uma revisão.

## Índice e âmbito

| Documento | Responsabilidade | Estado desta entrega |
| --- | --- | --- |
| [GAME_VISION](GAME_VISION.md) | Identidade, experiência, prevenção, sucesso e limites de âmbito. | Direções de produto estabelecidas + proposta de concretização. |
| [GAMEPLAY_SCALES](GAMEPLAY_SCALES.md) | Navegação, câmara, seleção, ordens e comunicação entre escalas. | `PROPOSED`. |
| [CRISIS_SCENARIOS](CRISIS_SCENARIOS.md) | Núcleo comum e regras específicas de cada ameaça. | Zombies primeiro estabelecido; contratos `PROPOSED`. |
| [POLICY_SIMULATOR](POLICY_SIMULATOR.md) | Modelo híbrido de governação, impostos, dívida, preparação e decisões por setor. | Direção funcional aprovada; mecanismos `PROPOSED`. |
| [GEOPOLITICS_AND_ECONOMY](GEOPOLITICS_AND_ECONOMY.md) | Países, capacidades, diplomacia, financiamento e IA. | Regras gerais estabelecidas; modelo `PROPOSED`. |
| [POPULATION_AND_EVACUATION](POPULATION_AND_EVACUATION.md) | Estados, localização, trânsito, baixas e conservação. | Evacuação física estabelecida; modelo `PROPOSED`. |
| [SIMULATION_ARCHITECTURE](SIMULATION_ARCHITECTURE.md) | Estado, comandos, relógio, sistemas, eventos e persistência. | `PROPOSED`. |
| [TECHNOLOGY_ASSESSMENT](TECHNOLOGY_ASSESSMENT.md) | Comparação tecnológica e plano de prova técnica. | `PROPOSED`; nenhum benchmark urbano executado. |
| [DEVELOPMENT_ROADMAP](DEVELOPMENT_ROADMAP.md) | Dependências, critérios de aceitação e backlog técnico. | `PROPOSED`; nenhuma correção implementada. |
| [DECISION_LOG](DECISION_LOG.md) | Registo identificável de decisões e alternativas. | Estados individuais por decisão. |
| [OPEN_QUESTIONS](OPEN_QUESTIONS.md) | Validações humanas por momento e impacto. | Pendentes, sem respostas presumidas. |
| [ROUND-001-CODEX](reviews/ROUND-001-CODEX.md) | Interpretação consolidada, recomendações e discordâncias. | Revisão técnica apresentada para discussão. |
| [ROUND-001-FEEDBACK](reviews/ROUND-001-FEEDBACK.md) | Formulário de feedback, aprovações e alterações. | Estrutura vazia; revisão conjunta ainda não registada. |

## Relação com a Alpha 0.1

Os documentos anteriores permanecem intactos:

- [README da aplicação](../../README.md): execução e funcionalidades da demo.
- [Game Design original](../GAME_DESIGN.md): visão inicial e campanha de referência.
- [Arquitetura original](../ARCHITECTURE.md): componentes atuais e primeiras intenções de evolução.
- [Roadmap original](../ROADMAP.md): sequência inicial Alpha 0.2–Beta.
- [Começar com Codex](../CODEX_START_HERE.md): contexto e tarefa sugerida anteriormente.
- [AGENTS.md](../../AGENTS.md): orientações de trabalho e preservação da versão jogável.

Para saber o que existe, prevalecem o código e os resultados verificados, não uma intenção documental. A baseline revista é `6efd5b3d02aa95475361f1dea8e98f6d818025ee`. A Alpha 0.1 não possui campanhas persistentes, estados municipais ou tática espacial. O seu tick diário não é uma decisão final sobre o relógio do produto.

Esta proposta explicita diferenças: país fixo na campanha em vez da transferência de comando da demo; relações futuras por par de países em vez do escalar atual; operações com conservação em vez de modificadores passivos; benchmark urbano antes de escolher definitivamente a tecnologia. O roadmap novo é uma proposta de revisão, não uma substituição silenciosa dos marcos antigos.

## Processo permanente de colaboração

1. O diretor criativo estabelece objetivos e valida decisões de produto.
2. ChatGPT analisa coerência, alternativas e consequências; Codex verifica viabilidade e propõe execução técnica. Uma sugestão de qualquer participante continua proposta até validação explícita.
3. Uma mudança de decisão recebe identificação, contexto, alternativas, fundamento, consequências e estado no Decision Log. Preservar o historial de alterações; não reescrever uma aprovação como se nunca tivesse existido.
4. Usar `reviews/ROUND-NNN-CODEX.md` e `ROUND-NNN-FEEDBACK.md` para revisões relevantes. Referenciar a origem e, quando disponível, o comentário/PR que contém a validação. Não inventar links, votos ou aprovações.
5. Só iniciar implementação mediante tarefa explicitamente autorizada, com âmbito e critérios de aceitação, apoiada nas decisões necessárias. Usar branches próprias e PRs; manter `main` jogável e integrar após revisão.
6. Discussões num PR devem ser resumidas no Decision Log quando produzirem decisões. Resolver divergências no respetivo documento e atualizar referências, evitando duas especificações concorrentes.

Esta entrega autoriza apenas documentação, branch e draft PR. Protótipo Three.js, correções do motor e novas dependências ficam para tarefas futuras aprovadas.
