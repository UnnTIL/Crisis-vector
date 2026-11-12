# Arquitetura da simulação

Estado: **PROPOSED** — proposta técnica de 2026-11-12, sujeita a revisão. Não autoriza implementação. Os requisitos de mundo canónico, conservação, determinismo, pausa e persistência foram estabelecidos pelo diretor criativo; os contratos abaixo ainda carecem de validação. Consultar [decisões](DECISION_LOG.md), [questões em aberto](OPEN_QUESTIONS.md) e [índice](README.md).

## Ponto de partida e limites

A Alpha 0.1 separa o motor sem DOM, em [`src/simulation.js`](../../src/simulation.js), da apresentação em [`src/game.js`](../../src/game.js). Esta separação deve ser preservada. O estado nacional já alimenta os totais mundiais, mas não existe ainda população municipal, reserva de unidades, fila de ordens, persistência ou integração de operações táticas.

O documento anterior [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) permanece como registo da direção inicial. A passagem sobre micro simulação e `OperationResult` descreve uma intenção, não capacidades implementadas. A proposta presente explicita como avaliar essa intenção sem alterar a demo nesta entrega.

## Fronteiras e responsabilidades

| Área | Responsabilidade proposta | Não deve fazer |
| --- | --- | --- |
| Definições | Dados versionados, topologia, cenário, parâmetros de equilíbrio e capacidades | Guardar estado mutável de campanha ou presumir que parâmetros de jogo são factos |
| `CampaignState` | Tempo lógico, entidades, populações, stocks, relações, operações, identificadores e RNG | Depender de DOM, câmara, FPS ou assets gráficos |
| Comandos | Expressar intenções do jogador e IA, validar autoridade, custos, disponibilidade e prazo | Alterar diretamente entidades antes de concluir a validação |
| Sistemas | Aplicar regras de propagação, deslocação, serviços, finanças, diplomacia e operações | Debitar o mesmo recurso através de caminhos paralelos |
| Eventos | Registar transições efetivas, causas, intervenientes, custos e efeitos | Substituir o estado canónico por mensagens livres |
| Consultas | Produzir totais, relatórios, estimativas e projeções para a interface | Criar reservas ou populações alternativas |
| Renderização | Projetar e interpolar o estado, mostrar seleção e encaminhar ordens | Resolver baixas, infeções, chegadas ou combate por frame |

Estes nomes são fronteiras funcionais, não uma obrigação de criar uma classe, pacote ou diretório para cada linha. Extrair módulos quando uma alteração concreta exigir isolamento e testes. Não introduzir ECS, barramento distribuído ou framework genérico de plugins apenas para antecipar escala.

## Mundo canónico e autoridade

Identificadores estáveis relacionam país, região, cidade, zona, coorte populacional, unidade, stock, movimento e operação. O país é proprietário ou responsável por recursos, mas estes têm uma localização e uma afetação únicas. Agregados nacionais e mundiais são consultas ou caches verificáveis sobre as entidades de base.

Uma unidade segue estados explícitos, por exemplo `available → reserved → mobilizing → inTransit → assigned → returning → available`. Uma unidade reservada para uma evacuação deixa de poder ser comprometida numa segunda operação. A afetação não cria uma cópia tática com outro inventário. Consumo de combustível, indisponibilidade e baixas usam a mesma identidade em todas as escalas.

As cidades são parcelas da geografia nacional, e as pessoas em trânsito pertencem a uma localização de trânsito identificada. Propriedade, residência administrativa e presença física são dimensões diferentes; a definição completa está em [população e evacuação](POPULATION_AND_EVACUATION.md).

## Um relógio, várias frequências

Propõe-se `campaignTimeMs` como inteiro não negativo que representa tempo simulado desde o início da campanha, com época e calendário no cenário. Não é o relógio civil da máquina. O quantum mínimo e os intervalos de cada sistema devem ser definidos após a prova de conceito; milissegundos como unidade de armazenamento não obrigam a atualizar todos os sistemas a cada milissegundo.

Um scheduler avança até ao próximo prazo relevante: chegada, conclusão de tarefa, atualização operacional ou fecho financeiro. Sistemas nacionais podem integrar intervalos longos; operações ativas podem usar passos fixos mais curtos. Os prazos pertencem ao mesmo eixo temporal e têm ordem total estável, por exemplo `(dueTime, phase, issuerId, commandSequence)`.

Exemplos de intervalos a experimentar, não compromissos aprovados: passo operacional de 100–1000 ms simulados, exposição por minuto ou por intervalo integrado e contas financeiras por hora/dia. Deve medir-se estabilidade numérica, custo e qualidade de decisões antes de escolher valores. O atual dia a cada 1400/350 ms reais não constitui um contrato para a campanha futura.

### Pausa, velocidade e recuperação

- A pausa congela o tempo de campanha e as transições do domínio. A câmara e efeitos puramente decorativos podem continuar.
- A interface pode aceitar ordens durante a pausa; estas são validadas e enfileiradas para o próximo limite lógico admissível. A aplicação não cobra duas vezes por confirmar e executar a mesma ordem.
- A velocidade altera a quantidade de tempo simulado processada por segundo real. Não altera taxas de infeção, eficácia nem ordem dos comandos.
- Um separador inativo não deve avançar automaticamente segundo a hora real. A recomendação é pausar ou limitar o avanço com aviso; o comportamento final é uma decisão de produto.
- Se a carga exceder o orçamento de CPU, reduzir a velocidade efetiva ou pausar com indicação. Não saltar eventos, aplicar dias fictícios ou descartar tempo já prometido ao jogador.

Não existe um relógio privado para a missão. Se um transporte demora duas horas simuladas, o mundo e os outros governos dispõem das mesmas duas horas. Incidentes importantes podem pedir pausa/atenção segundo critérios configurados, sem exigir microgestão de todos os incidentes.

### Ordem de atualização

Propõe-se processar cada fronteira temporal nesta ordem documentada: ordens e reservas; movimentos vencidos; exposição e transições da ameaça; serviços e operações; consumo e obrigações financeiras; efeitos políticos; eventos e observações. A sequência exata deve ser testada e versionada. Um sistema não pode consumir uma chegada que ainda não foi confirmada nem aplicar efeitos retroativos.

Para eventos simultâneos que disputem a mesma capacidade, adotar prioridade explícita e desempate determinístico, em vez da ordem incidental de objetos JavaScript ou da chegada de mensagens de Workers. Alterações desta ordem são alterações de regras, com notas de equilíbrio e regressão.

## Cidades observadas e não observadas

A câmara seleciona o que é desenhado; não determina se uma operação existe ou avança. Todas as operações ativas seguem as regras e o calendário aprovados mesmo fora do ecrã. Reservar detalhe lógico a operações identificadas é diferente de o ligar automaticamente ao zoom.

Zonas sem operação ativa podem usar coortes, densidades e redes agregadas. Abrir a cidade materializa uma representação visual coerente, sem retirar ou adicionar pessoas. Pontos e instâncias são projeções de uma coorte, não uma segunda população.

Se for necessário mudar também a fidelidade lógica, a transição só pode ocorrer em checkpoints definidos. Deve conservar exatamente quantidades inteiras, stocks, ordens, identidades de operações e momento lógico; a conversão não pode repetir exposição ou movimento já integrado. Guardar a versão do modelo e o estado necessário para voltar a materializar o detalhe.

Modelos agregado e detalhado podem produzir dinâmicas diferentes. Não se promete equivalência exata sem demonstração. Antes da integração, definir tolerâncias e testar as aproximações em cenários controlados. A seleção de fidelidade deve seguir regras de atividade/carga estáveis e registadas, não ser um benefício ou penalização provocado por mudar a câmara. Um modo de referência com operações ativas sempre detalhadas permite avaliar o erro das aproximações.

## Comandos, eventos e aplicação única

Um comando proposto inclui `commandId`, autor, tempo solicitado, sequência, alvo, parâmetros e versão do contrato. A validação consulta o estado atual: país controlado, relações, transporte, recursos, reservas e destino. Uma resposta distingue rejeição sem mutação, aceitação com reserva e execução posterior. Custos de cancelamento/reembolso devem ser definidos por ordem, não presumidos gratuitos.

Jogador e IA enviam os mesmos tipos de comando ao mesmo validador. A IA não ativa políticas ou cria ajuda alterando diretamente o estado. O país do jogador fica fixo na campanha; a mudança atual de comando permanece uma funcionalidade de demonstração, não uma forma de escapar a custos.

Um evento descreve uma transição confirmada: `eventId`, `campaignTime`, tipo, entidades, `causedBy`, deltas com unidades, regra aplicada e observações produzidas. A interface traduz-o para texto. A mensagem pode omitir informação desconhecida pelo jogador, mas o evento de diagnóstico conserva a causa real.

Aplicação única significa um contrato local verificável: validar precondições e versão do estado; aplicar todos os débitos/créditos da transação de forma atómica; marcar o identificador como aplicado na mesma alteração persistida. Reapresentar um comando concluído devolve o resultado anterior ou uma rejeição de duplicado, sem novo custo. Guardar/carregar conserva os identificadores e cursores necessários.

Uma operação pode consumir recursos e produzir resultados ao longo do tempo. O evento de conclusão fecha as reservas e obrigações restantes; não volta a aplicar os mortos, deslocações ou despesas já registados. `OperationResult` é um resumo com referências aos efeitos confirmados e, quando apropriado, um delta final ainda não aplicado. Não deve recontabilizar toda a missão.

Não se afirma que a plataforma oferece transações distribuídas ou entrega exatamente uma vez. A garantia é do protocolo do motor dentro de uma campanha local, incluindo recuperação de checkpoint. Importação deve ser validada para um novo estado temporário e só substituir a campanha após todas as invariantes passarem.

## Determinismo, gravação e diagnóstico

O estado persistido deve incluir versões de schema, regras, cenário e dados; tempo e época; país escolhido; entidades; filas e ordens; reservas; cursores; contadores de identificadores; estados correntes dos PRNG; e checkpoint dos eventos. O histórico visível pode ser curto, mas o período de auditoria/replay deve ser definido independentemente desse limite.

Guardar definições por identificador e versão; não duplicar a instância inteira de `SimEngine`. Reconstruir índices como `byId` a partir de entidades únicas. Um manifesto de assets/data permite validar compatibilidade e apresentar erro claro quando falta uma versão necessária. Uma migração de save é explícita e testada; não corrigir silenciosamente valores inválidos.

Condições de repetibilidade: mesma versão de regras e dados, estado inicial, ordem total dos comandos e política de detalhe lógico. Ordenar entidades por identificador estável. A ordem de carregamento de ficheiros, frames ou respostas de Workers não pode decidir resultados. Separar o RNG cosmético do RNG do domínio; streams por sistema/entidade podem evitar alterações globais acidentais quando introduzidos com necessidade e versão próprias.

Contagens e dinheiro usam unidades inteiras ou escalas fixas documentadas, respeitando o intervalo seguro de inteiros. Taxas podem usar ponto flutuante com arredondamento e resíduos definidos. Comparação bit a bit entre navegadores/versões não deve ser prometida sem testes: evitar dependências de funções transcendentais não controladas em regras críticas ou declarar a matriz de runtimes suportados.

Snapshots mais comandos/eventos desde o checkpoint são suficientes como primeiro desenho. Não é necessário que todos os campos sejam reconstruídos exclusivamente através de event sourcing. Hashes de estado normalizado, seeds e eventos causais ajudam a reproduzir divergências sem guardar detalhes gráficos.

## Paralelismo e renderização

Começar com um único escritor do estado. Um Worker pode calcular propostas ou executar o motor completo, mas a divisão deve preservar propriedade de memória, timestamps e ordem de commit. Não permitir que vários Workers debitem o mesmo stock. Copiar snapshots compactos ou usar buffers com um protocolo claro; medir serialização, latência e memória antes de considerar a mudança uma otimização.

O renderer mundial Canvas e o candidato urbano Three.js recebem consultas/snapshots. Estados de seleção, câmara e efeitos decorativos permanecem na apresentação; posições táticas que afetam o domínio pertencem à operação. Um frame perdido pode reduzir suavidade, mas não eliminar uma chegada ou evitar uma perda. O [plano tecnológico](TECHNOLOGY_ASSESSMENT.md) define os testes prévios à escolha.

## Testes e integração incremental

1. **Comandos:** tipos/IDs/coordenadas não finitos ou inválidos são rejeitados sem mutação; jogador e IA pagam e reservam sob as mesmas regras.
2. **Conservação:** transferências, baixas, alocações e cancelamentos preservam os balanços documentados, sem depender da vista aberta.
3. **Tempo:** pausa, velocidades, atraso de frames e eventos simultâneos produzem a mesma sequência lógica para os mesmos comandos carimbados.
4. **Persistência:** guardar durante trânsito, escassez e operação; carregar e continuar gera o mesmo estado normalizado e fila do jogo sem interrupção.
5. **Idempotência:** repetir aceitação, chegada ou conclusão, inclusive após carregar, não repete custos ou resultados.
6. **Fidelidade:** testar conservação exata e erros dinâmicos acordados nas conversões agregado/detalhado; documentar os casos em que a aproximação não é aceitável.
7. **Diagnóstico:** um desvio identifica seed, versões, comando, instante e causa; o diário do jogador não revela informação ainda não observada.

Primeiro estabilizar as regras existentes e introduzir apenas os contratos mínimos que essas correções exigem. A prova urbana usa fixtures pequenas com estes contratos, sem reescrever a campanha. Depois introduzir saves e scheduler, expandir gestão nacional e só então ligar uma operação completa. A sequência detalhada e os gates estão no [roadmap](DEVELOPMENT_ROADMAP.md).
