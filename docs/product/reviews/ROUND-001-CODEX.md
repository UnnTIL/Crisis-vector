# ROUND-001 — Consolidação técnica do Codex

Estado: **PROPOSED — para revisão conjunta**. Data: 2026-11-12.

Base de análise: Alpha 0.1, commit `6efd5b3d02aa95475361f1dea8e98f6d818025ee`, auditoria anterior e comunicação do diretor criativo «Consolidação da visão de produto e arquitetura de desenvolvimento». Esta ronda altera apenas documentação. Não implementa correções, protótipo, dependências ou funcionalidades.

## 1. Interpretação da visão

O CRISIS VECTOR pretende permitir governar um país durante uma crise global e observar as consequências até à escala urbana. O seu diferencial é a causalidade: prevenção e cooperação alteram exposição, meios nacionais sustentam operações locais, movimentos de população podem resolver um risco e criar outro, e os governos estrangeiros têm interesses próprios.

O jogador mantém o país escolhido. Forças militares são um instrumento entre saúde, proteção civil, bombeiros, polícia, engenharia e transporte. Uma campanha bem gerida pode evitar escaladas graves; o jogo não deve inventar hordas para obrigar combate. Objetivos e avaliação cobrem preservação, instituições, serviços, segurança, sustentabilidade e recuperação.

Pontos, volumes simples e hordas agregadas são adequados se a imagem mostrar efeitos do domínio. Um edifício 3D ou uma linha animada não demonstra por si infraestrutura funcional, movimento logístico ou tática. Não foram recebidas imagens acessíveis nesta entrega; a interpretação visual baseia-se na descrição textual.

## 2. Decisões recebidas e propostas novas

Registei como direção estabelecida: mundo único, país fixo, evacuação física, financiamento com consequências graduais, regras equivalentes para IA, zombies primeiro, resposta civil/militar, sucesso multidimensional, proveniência e revisão antes de código. As entradas `APPROVED` no [Decision Log](../DECISION_LOG.md) referem explicitamente essas instruções, não uma aprovação desta documentação pelo simples facto de ter sido escrita.

Continuam `PROPOSED`: Three.js como candidato, o esquema populacional, scheduler e frequências, detalhes financeiros, benchmark e gates, sequência operacional e formas de pontuação. [ROUND-001-FEEDBACK](ROUND-001-FEEDBACK.md) está preparado sem decisões inventadas.

## 3. Estado atual revisto

Foram relidos README, AGENTS, documentos de `docs/`, motor, apresentação, HTML/CSS, testes e configuração de CI. A Alpha é browser vanilla, sem dependências nem backend. Oito testes exercitam geografia, início, determinismo parcial, políticas, ajuda, unidades, troca de comando e invariantes agregadas de 120 dias. A CI usa Node 20; nesta instância os oito passaram com Node 24.22.1.

Continuam funcionais as políticas, propagação agregada, custos, apoio temporário, efeitos nacionais de unidades, indicadores e controlos da demo. Não existem relações por par de países, população local, logística, combate espacial, persistência ou scheduler de ordens.

As verificações browser da auditoria confirmaram políticas/custos, turnos, colocação, reinício e execução automática, além dos dois defeitos de DPR/reinício. A aplicação continuou a funcionar após desligar a rede depois do carregamento local. A abertura direta `file://` não foi validada neste Chromium porque a política gerida a bloqueia. Não foi executado benchmark urbano Three.js ou nativo.

O motor atual é pequeno e não apresentou gargalo demonstrado; uma medição isolada da auditoria, sem renderização, processou mil dias/177 entidades em cerca de 340 ms. Não é certificação de desempenho e não exercita milhares de decisões pendentes: elas ainda não estão modeladas. Não usar esse valor para aprovar a carga urbana ou comparar motores.

## 4. Arquitetura recomendada

Manter o domínio independente da UI e evoluir por contratos pequenos: definições versionadas → comandos validados → sistemas num relógio canónico → estado e eventos → consultas/renderização. Um único escritor aplica transferências e regista efeitos; jogador e governos usam o mesmo caminho.

Populações por coortes, localizações e estados ortogonais evitam simular indivíduos no mundo inteiro. Destacamentos, transporte, stocks, financiamento e acolhimento são reservados, deslocados e consumidos com identidade. A conclusão de uma missão resume efeitos já aplicados e liquida apenas o restante, sem aplicar novamente todas as baixas e despesas.

Guardar exige DTO explícito, versões de regras/dados, RNG corrente, agenda, reservas, identificadores e cursores. Índices como `byId` são reconstruídos. Não serializar ingenuamente cópias do mesmo país em duas estruturas. Snapshots com comandos/eventos desde checkpoint são proporcionais; event sourcing integral, ECS ou serviços distribuídos não são requisitos.

O estado real é distinto do conhecido por cada governo. IA explicável pode começar com utilidades e prioridades simples, restrições reais, histerese e desempate estável; não precisa de decisões puramente aleatórias nem de omniscência.

## 5. Plataforma e experiência urbana

Recomendo browser nesta etapa: conserva o motor, testes e apresentação mundial; reduz o custo de validar as escalas. Canvas 2D mundial e Three.js/WebGL 2 urbano são o primeiro candidato, não uma escolha irrevogável. PixiJS/Phaser podem servir outra direção 2D; Babylon.js pode justificar-se por ferramentas; Godot/Unity só por benefícios ou limitações demonstrados. Electron/Tauri são opções futuras de distribuição, não otimizações garantidas.

Recomendo navegação mundo→país/região→cidade com âncoras e contexto preservados, em vez de exigir um único mapa contínuo. A vista urbana usa câmara ortográfica, volumetria leve, seleção de equipas e ordens por zonas/rotas. Autonomia executa o detalhe; alertas e informação por camadas evitam microgestão permanente. A referência textual a milhares de entidades será transformada em cargas mensuráveis, distinguindo pessoas, marcadores e agentes lógicos.

O [plano tecnológico](../TECHNOLOGY_ASSESSMENT.md) propõe perfis de 2 000/5 000/10 000 marcadores, frequências lógicas experimentais, três repetições por variante e métricas de frames, CPU/GPU, latência, memória e filas. Todos os valores são ensaios propostos. O desktop e a carga nominal ainda precisam de acordo. Não existe uma promessa medida de 60 FPS.

## 6. Tensões identificadas e recomendações

### Prova cedo versus integração sustentável

Concordo com antecipar B. Uma prova puramente visual falharia o objetivo de viabilidade operacional; uma segunda campanha completa desperdiçaria esforço. Recomendo contratos mínimos em A e fixtures em B, com relógio/ordens/contabilidade compatíveis. B não precisa de diplomacia extensa.

### Câmara e níveis de detalhe

A cidade não deve passar a evoluir apenas por ser observada. Operações ativas continuam fora da vista. A representação gráfica pode mudar livremente; mudar fidelidade lógica exige fronteiras, conservação e erro dinâmico avaliado. Não prometer equivalência exata agregado/individual sem a demonstrar. Escolher fidelidade por atividade e regras registadas, não por cliques da câmara.

### Modularização e abertura offline

ES modules, Workers e loaders podem impedir duplo clique em `index.html`. Isso não equivale a dependência da internet, mas muda a experiência de distribuição. Preservar a Alpha atual e validar um arranque offline local antes de adotar esses mecanismos; não remover a propriedade silenciosamente para facilitar a arquitetura.

### «Corrigir tudo em A» versus efeito espacial

Os erros de contabilidade/validação/UI devem ser corrigidos antes de consolidar novos sistemas. Já o efeito espacial das unidades exige o recorte operacional B/E. Em A deve ficar explícito que a unidade atual é um modificador nacional; não adicionar círculos ou um coeficiente de distância arbitrário só para declarar T-005 fechado. Fechar o item quando posição/rota/perímetro tiverem efeito e consumo reconciliados na campanha.

### Conservação económica versus um mundo monetário completo

Transferências de ajuda e empréstimos precisam de contrapartes e passivos. Isso não obriga a modelar toda a banca e as famílias. Um setor externo abstrato pode existir com fonte e limites declarados; não apresentar só tesourarias governamentais como economia monetária fechada.

### Pontuação e prevenção

Concordo com pontuar decisões e resultados, mas contar ordens ou «vidas salvas» brutas cria incentivos a repetir viagens ou provocar crises. Recomendo componentes observáveis, objetivos contextuais e resultados humanos absolutos visíveis. Pesos e derrotas não estão decididos.

## 7. Sequência e primeira tarefa

Recomendo A → B → C → D mínimo → E → aprofundamento D/E → F. A contém consistência e contratos; B reduz risco gráfico; C estabiliza tempo/persistência; D introduz capacidades/acordos necessários; E demonstra uma operação completa. Não esperar toda a geopolítica para testar uma evacuação nacional, nem integrar tática antes de conservar recursos.

O [backlog](../DEVELOPMENT_ROADMAP.md) mantém abertos os oito problemas da auditoria, com prioridade, evidência e critérios. Nenhum foi corrigido por esta documentação.

A primeira entrega proposta após validação divide-se em A1a (validação, custos comuns e financiamento mínimo) e A1b (transferência populacional mínima), com gates independentes. Não bloquear validação de entradas por uma decisão narrativa de transformação zombie. Correções de DPR/reinício cabem num PR independente. Manter oito testes e acrescentar regressões significativas; o roadmap define o recorte para evitar implementar logística completa de uma só vez.

## 8. Ordem de discussão sugerida

1. Validar população, transformação/neutralização e modelo de financiamento/prioridades (Q-001/Q-002).
2. Ratificar os contratos mínimos e a prova urbana, hardware e carga nominal (Q-003/Q-006); aprovar a experiência offline antes de introduzir módulos que alterem o arranque (Q-007).
3. Definir atenção/velocidade em incidentes, limites operacionais e objetivos da primeira campanha (Q-004/Q-005).

As respostas pertencem ao [feedback](ROUND-001-FEEDBACK.md) e às decisões correspondentes. A direção browser é inicial; os detalhes de taxas, frequências, lotações, curvas e pesos continuam propostos. Não se solicita novamente autorização genérica para um país fixo ou evacuação física: essas decisões já foram dadas.

## 9. Limites desta entrega

A entrega é documentação para revisão e publicação numa branch própria. Código, dados, testes e dependências da Alpha permanecem inalterados. A comparação tecnológica é uma análise com plano de testes, não um ensaio executado. Resultados futuros deverão registar hardware, versões, comandos, seeds, dados brutos e limitações.

Publicação da branch, abertura do draft PR e estado dos checks serão reportados com evidência na mensagem de entrega; não são presumidos neste documento. A aceitação humana e eventuais tarefas autorizadas ainda não estão preenchidas.
