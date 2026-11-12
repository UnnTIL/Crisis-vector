# Roadmap proposto e backlog técnico

Estado: **PROPOSED**. Data: 2026-11-12. Este plano não autoriza implementação. Ver [decisões](DECISION_LOG.md), [questões](OPEN_QUESTIONS.md) e [revisão](reviews/ROUND-001-CODEX.md).

## Leitura crítica da sequência A–F

A sequência apresentada pelo diretor criativo é adequada com uma condição: a prova B deve testar cedo o risco gráfico e operacional, mas usar os contratos mínimos de tempo, comandos e conservação definidos em A. Não deve criar uma campanha concorrente que depois precise de ser reconstruída.

Proposta de dependências:

`A (consistência e contratos mínimos) → B (viabilidade urbana) → C (campanha persistente) → D mínimo (capacidade nacional e acordos) → E (uma operação integrada) → D/E incrementais → F`

Não é preciso concluir diplomacia profunda ou toda a logística para integrar a primeira evacuação nacional. Também não se deve adiar o ensaio gráfico até essas funcionalidades existirem. Se o gate B falhar, rever o candidato tecnológico antes de ampliar a tática; C pode continuar com a apresentação atual se não depender dessa escolha. Uma implementação não começa só porque uma fase aparece neste plano: requer aprovação e tarefa delimitada.

As versões Alpha 0.2–0.5 do [roadmap original](../ROADMAP.md) continuam como histórico. Esta proposta divide campanha em entregas menores e antecipa a prova técnica, sem atribuir datas, equipas ou versões finais ainda não acordadas.

## Fase A — Estabilização da base existente

**Objetivo:** remover regras que impedem confiar no estado antes de o persistir e estender.

**Entregas propostas:** transferência populacional mínima entre uma origem e um destino identificados, com trânsito e capacidade; financiamento efetivo e consequência de falta de pagamento; custos e validações comuns ao jogador e IA; comandos inválidos sem mutação; correções de seleção DPR/reinício; custos visíveis. Introduzir apenas os contratos e eventos que estas alterações precisarem.

**Dependências:** Q-001 para transições populacionais e Q-002 para financiamento. Validar tipos, coordenadas ou custos comuns não depende de fechar a narrativa de transformação zombie. Não exige rede urbana real, múltiplas cidades, mercados completos ou tática 3D.

**Riscos:** transformar uma correção em simulação logística completa; mudar equilíbrio sem o documentar; acrescentar apenas um limite ao contador `saved` e deixar a contagem repetida por resolver.

**Aceitação:** oito testes existentes mantidos; novas regressões dos casos T-001–T-004 e T-007–T-008; balanços antes/depois de cada transferência e obrigação; mesma sequência de ações produz estado completo igual; demo jogável e offline preservada. As alterações de regras e custos aparecem em notas de equilíbrio.

**Impacto arquitetural:** preservar `SimEngine` sem DOM; extrair validadores/transferências à medida da necessidade. Um contrato pequeno de comandos, identificadores, tempo e estados é disponibilizado para B, sem implementar já o scheduler inteiro ou uma API universal.

## Fase B — Prova urbana isolada

**Objetivo:** confirmar legibilidade, interação, efeito espacial e viabilidade de renderização/operações no browser.

**Entregas propostas:** cena sintética original com volumes simples, câmara ortográfica, hordas, equipas, barreira e evacuação; ordens e autonomia pequenas mas reais; instrumentação e relatório. Usar contratos de A e fixtures determinísticas, sem modificar a demo mundial para executar o ensaio.

**Dependências:** contratos mínimos A, proposta de benchmark e hardware/carga Q-003. Q-006 delimita o recorte de interação. Não depende de toda a economia/diplomacia.

**Riscos:** medir só pontos desenhados, ignorar IA/ordens; resultados de GPU cloud serem tomados como desempenho de desktop; código visual passar a ser autoridade de população. Diferenciar componentes reaproveitáveis de instrumentação descartável.

**Aceitação:** executar e publicar o protocolo de [TECHNOLOGY_ASSESSMENT](TECHNOLOGY_ASSESSMENT.md), incluindo cargas visuais e lógicas separadas, métricas por percentil, concorrência macro controlada, memória, picking DPR e testes de conservação. Demonstrar que posições, perímetros e rotas mudam resultados. Nenhuma promessa de 60 FPS é aceite sem o relatório no hardware acordado.

**Impacto arquitetural:** adaptador de apresentação e modelo operacional restrito. Autorizar Three.js ou outra dependência apenas numa tarefa futura; selecionar candidato final após os resultados. A saída inclui limites conhecidos e recomendação de continuar, reduzir âmbito ou comparar alternativa.

## Fase C — Campanha persistente e relógio coerente

**Objetivo:** estabelecer uma campanha reproduzível que suporte ordens com duração e informação causal.

**Entregas propostas:** cenário versionado; país fixo; estado explícito; relógio canónico e tarefas agendadas; gravação/importação validada; objetivos iniciais; eventos com custos e deltas; diário como apresentação desses eventos. Separar verdade do mundo e conhecimento dos atores.

**Dependências:** estado consistente A; conclusões relevantes de tempo e carga de B quando disponíveis; Q-004 e Q-005. C pode prosseguir com fixtures e apresentação atual se o renderizador de B precisar de revisão. Frequências e níveis de detalhe são propostas a medir, não o dia atual convertido automaticamente em contrato definitivo. Q-007 deve ser validada antes de qualquer mudança no arranque offline.

**Riscos:** serializar `countries` e `byId` como cópias; esquecer RNG, ordens pendentes ou eventos aplicados; tornar o save um histórico ilimitado sem política de retenção; usar o relógio real ou FPS para decidir o domínio.

**Aceitação:** guardar durante trânsito, insuficiência financeira e uma ordem/operação mínima headless ou de fixture; carregar e continuar com o mesmo estado, agenda e RNG; importação inválida não altera a sessão; replay independe do FPS e da vista; comandos e conclusões duplicados não repetem efeitos. A operação tática completa será testada em E. Objetivos e condições de fim são claros, sem exigir eliminação militar como único sucesso.

**Impacto arquitetural:** DTO de campanha, índices reconstruídos e scheduler pequeno. Snapshots mais eventos/comandos desde checkpoint; sem event sourcing integral obrigatório. Definir matriz de runtimes suportados e limites de compatibilidade dos saves.

## Fase D — Gestão nacional e diplomacia, por ciclos completos

**Objetivo:** dar alternativas estratégicas e capacidade real ao mundo autónomo.

**Entregas propostas:** poucos stocks e serviços ligados à tesouraria, dívida/atrasados e eficácia; unidades com disponibilidade, prontidão, mobilização e consumo; relações direcionadas e acordos partilhados; pedido, oferta limitada e entrega de ajuda; IA explicável baseada em informação disponível.

**Dependências:** comandos, tempo, persistência e causalidade C; dados de referência apenas para capacidades efetivamente usadas. Empréstimos e refinanciamento precisam de testes de passivos e limites.

**Riscos:** matrizes de dados sem efeito jogável; crédito/ajuda infinitos; IA omnisciente; introduzir muitos recursos antes de um ciclo ser útil. Países fracos não devem depender de confrontos impossíveis ou de ajuda garantida.

**Aceitação:** fornecedor sem capacidade recusa/reduz ajuda; reservas não são comprometidas duas vezes; devedor e credor reconciliam contratos; incumprimento tem causa e efeito; A→B não altera uma relação de C→B; decisões têm motivos inspecionáveis; prevenção e priorização oferecem caminhos viáveis com poucos meios.

**Impacto arquitetural:** módulos de finanças, stocks, capacidades e relações sobre o mesmo estado. Começar pelo mínimo necessário à operação E. Expandir comércio/alianças/organizações depois de testar um acordo completo.

## Fase E — Uma operação urbana integrada

**Objetivo:** demonstrar a cadeia nacional → operação espacial → consequências nacionais/mundiais.

**Entregas propostas:** uma cidade/área de referência, reservas nacionais, mobilização, deslocação, evacuação, contenção e retirada; efeitos espaciais reais e consumo/perdas; ordens autónomas e intervenção opcional. Navegação preserva contexto sem ativar/desativar a simulação.

**Dependências:** candidato B validado, relógio/persistência C e capacidades mínimas D. Integração nacional pode anteceder evacuação internacional complexa.

**Riscos:** duplicar forças/civis ao materializar a cidade; repetir efeitos na conclusão; variar resultados ao trocar a câmara; aceitar uma aproximação agregada sem medir o erro.

**Aceitação:** destacar uma unidade reduz a reserva disponível; operação e trânsito continuam fora da vista; incidentes e conclusão são aplicados uma vez, inclusive após carregar; uma alteração de rota/perímetro tem consequência mensurável; fidelidade respeita conservação exata e tolerâncias dinâmicas aprovadas. O desempenho volta a ser medido com a campanha real, não apenas a fixture B.

**Impacto arquitetural:** operações tornam-se entidades da campanha, renderizador como consumidor. Atualizar T-005 até resolver o defeito no produto, não apenas na prova isolada.

## Fase F — Expansão controlada

**Objetivo:** acrescentar conteúdo e profundidade a uma experiência completa já demonstrada.

**Entregas possíveis:** mais regiões/cidades, logística adicional, investigação, acordos complexos, recuperação, acessibilidade refinada e novos cenários. Pandemia e ameaça externa só depois de validar zombies e contratos comuns.

**Dependências:** gates anteriores e objetivos de conteúdo explícitos. Fontes/licenças verificadas antes de incorporar dados.

**Riscos:** multiplicar custo de conteúdo, compatibilidade de saves e combinações de regras. A aparência modular não demonstra que qualquer crise cabe sem revisão.

**Aceitação:** cada expansão entrega um ciclo jogável com custos, consequências, teste e reconciliação. Desempenho e memória medidos em campanhas longas; migrações de save testadas; novo módulo de ameaça não duplica o mundo nem força estados sanitários inadequados.

**Impacto arquitetural:** extrair novas abstrações a partir de reutilização demonstrada. Reavaliar plataforma apenas por limitações documentadas; distribuição desktop é uma tarefa própria.

## Backlog da auditoria — todos ainda abertos

Prioridades: **P0** bloqueia confiar na contabilidade/entradas; **P1** afeta interação, explicação ou integração seguinte. A fase indica quando resolver, não quando foi implementado.

| ID / prioridade | Problema e referência na baseline | Critério de aceitação | Fase / dependência |
| --- | --- | --- | --- |
| **T-001 / P0** | Evacuação sem origem/destino nem elegibilidade: [`simulation.js`](../../src/simulation.js), `_step`, incremento de `saved`. ATF: 140 habitantes, 204 evacuados após 15 dias. | Pessoas únicas e stocks não nascem de viagens; origem→trânsito→destino reconcilia; repetir chegada/conclusão não credita novamente; testar população zero, lotação e reevacuação. | A; Q-001, DEC-003/013. |
| **T-002 / P0** | Políticas plenamente eficazes a saldo zero: `_step`, orçamento limitado a zero. | Pagamentos, autonomia material e degradação seguem regra aprovada; dívida/atrasados não desaparecem; recuperação possível; ausência prolongada de financiamento não conserva benefícios gratuitos. | A, profundidade D; Q-002, DEC-004/014. |
| **T-003 / P0** | IA altera políticas diretamente e evita custos iniciais de `togglePolicy`. | Mesma ação nas mesmas condições paga/reserva sob as mesmas regras, independentemente do emissor; comandos rejeitados não mutam o estado. | A; DEC-004. |
| **T-004 / P0** | Validação frágil em `deployUnit`: `toString` aceite e orçamento `NaN`; coordenadas não finitas aceites. | Allowlist própria de tipos; IDs/valores/ranges validados; `NaN`, infinito, propriedades herdadas e parâmetros em falta rejeitados sem qualquer mutação. | A, antes de C; DEC-013. |
| **T-005 / P1** | Unidades sem efeito espacial; `x/y/radius` não entram no cálculo agregado. | Dois posicionamentos com condições distintas geram efeitos espacialmente explicáveis; barreira/rota têm função; consumo e efeitos ligados a entidades canónicas. Não fechar só por desenhar círculos. | B valida mecanismo; E resolve no produto. Em A tornar a abstração explícita, sem fingir tática existente. |
| **T-006 / P1** | Histórico textual de 80 entradas, sem custos/deltas ou causas completas. | Eventos estruturados, versões, atores e `causedBy`; diário derivado; retenção/checkpoints definida; investigar uma perda/custo até à ordem; persistir cursores de aplicação. | Contrato mínimo A/B; conclusão C e E. |
| **T-007 / P1** | Seleção em DPR 2 diverge de DPR 1: [`game.js`](../../src/game.js), `size` e hit testing. | Mesmo ponto geográfico selecionável em DPR 1/1,5/2 e após redimensionar; zoom/pan futuros mantêm picking e coordenadas coerentes. | A; regressão de browser. |
| **T-008 / P1** | Reinício muda `selectedUnit` mas mantém classe visual anterior na toolbar. | Após selecionar cada tipo e reiniciar, botão destacado, instrução, unidade colocada e preço correspondem ao mesmo tipo. | A; regressão de browser. |

Complementos a tratar nas tarefas correspondentes: proveniência dos dados antes de expansão, valores de custos num único contrato consultado pela UI, alternativa acessível à seleção apenas por Canvas, cobertura de ajuda/RNG/contabilidade e tratamento explícito de separadores inativos. Nenhum destes itens é declarado corrigido por este PR documental.

## Primeira tarefa proposta após revisão

Recomendam-se duas tarefas com gates independentes:

- **A1a — Validação, custos comuns e financiamento mínimo:** T-002/T-003/T-004, com poucas obrigações e a consequência gradual acordada. Depende de Q-002 para financiamento; a validação independente pode ser isolada primeiro.
- **A1b — Transferência populacional mínima:** T-001, com origem, destino, capacidade e trânsito identificados, seguindo o contrato populacional validado. Não inclui já rede logística completa ou evacuação internacional.

Manter o fluxo jogável em ambas; não introduzir crédito internacional ou nova ameaça. T-007/T-008 podem seguir num PR de interface independente.

A tarefa só começa após validação dos modelos necessários e autorização explícita de implementação. Critérios: suite atual aprovada; regressões dos casos reproduzidos; estado inteiro/finito e recursos conservados; equivalência de custos jogador/IA; ações inválidas sem mutação; repetição determinística do estado completo; demo preservada. Indicar parâmetros novos e alterações de equilíbrio no PR.

## Disciplina de entrega

Cada milestone precisa de uma demonstração executável, objetivos de gameplay, testes significativos, limites conhecidos e notas de equilíbrio. Distinguir «passou», «falhou», «não executado» e «planeado». Um PR documental não transforma benchmark planeado em resultado. Não estimar capacidade de milhares de agentes a partir dos oito testes agregados.

Branches próprias e PRs pequenos; nenhum merge automático. Rever decisões no [Decision Log](DECISION_LOG.md) e registar a ronda antes de atualizar os próximos marcos. A documentação anterior permanece referenciada, sem eliminar o seu histórico.


## Nota de integração — dados reais e governação (2026-11-12)

O roadmap desta ronda continua válido como histórico de dependências A–F. A [proposta integrada v2](MASTER_ROADMAP_V2.md) acrescenta a frente independente de [dados de campanha V1](BASELINE_DATA_V1.md), com investigação/licenças e piloto de cinco países (`D0–D2`) em paralelo com a prova urbana. A ligação da baseline ao estado canónico (`D3`) depende da campanha persistente e contratos de estado; **não** alterar o motor Alpha apenas para incorporar valores estatísticos. A [governação híbrida](POLICY_SIMULATOR.md) terá milestones pequenas após o fundamento financeiro, distinguindo impostos, dívida e políticas de preparação.

O documento v2 é `PROPOSED` até revisão, e não altera o estado dos PRs/Issues atuais.
