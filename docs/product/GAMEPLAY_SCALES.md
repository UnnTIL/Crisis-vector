# Escalas, navegação e experiência operacional

Estado: `PROPOSED` — desenho de interação para revisão, 12 de novembro de 2026. Um mundo persistente, país fixo na campanha, resposta civil antes da escalada militar e efeitos reais entre escalas são orientações estabelecidas pelo diretor criativo; os controlos, a câmara e a organização da interface abaixo são propostas. Não descrevem funcionalidades já implementadas.

Consultar o [índice](README.md), a [visão](GAME_VISION.md), a [arquitetura](SIMULATION_ARCHITECTURE.md), a [avaliação tecnológica](TECHNOLOGY_ASSESSMENT.md), o [registo de decisões](DECISION_LOG.md) e as [questões abertas](OPEN_QUESTIONS.md).

## Base existente e direção

A Alpha 0.1 alterna dois Canvas em `src/game.js`, através de `setView()`. A vista urbana desenha indicadores nacionais num cenário procedural; não existe mapa regional, zoom geográfico contínuo ou estado municipal. Coordenadas e círculos das unidades ainda não determinam os efeitos agregados do motor. As rotas mundiais animadas são ilustrativas, não fluxos observados.

A evolução proposta usa três representações ligadas por identificadores e contexto, sem exigir um globo 3D contínuo. Mundo e país/região podem conservar desenho 2D; a cidade pode usar uma câmara ortográfica sobre geometria 3D leve. O jogador deve saber sempre onde está, o que observa, quem pode comandar e quanto tempo decorreu.

## Papel de cada escala

| Escala | Pergunta principal | Informação e decisões | Consequência noutras escalas |
| --- | --- | --- | --- |
| Mundo | Onde está a crise e de quem dependemos? | Focos, tendências, qualidade dos relatórios, fronteiras, acordos, pedidos, rotas comerciais/logísticas e deslocações confirmadas. Decisões nacionais e cooperação, sem comando sobre países da IA. | Um acordo disponibiliza um recurso e um compromisso; uma restrição altera uma ligação real do modelo. |
| País/região | Onde aplicar recursos escassos? | Cidades, instalações críticas, serviços, reservas, caminhos, prazos e incidentes. Prioridades, mobilização, atribuição de meios, planos e abastecimento. | Unidades destacadas saem da reserva; atrasos e congestionamentos afetam operações e população. |
| Cidade/operação | O plano está a funcionar e quando devemos adaptá-lo? | Perímetros, zonas, população, ameaça, unidades, trajetos e capacidade local. Ordens de defesa, retirada, evacuação, assistência e mudança de prioridades. | Transferências, consumo, perdas e interrupções de serviços atualizam a mesma campanha. |

Uma instalação vista no mapa nacional e na cidade é a mesma entidade. Os totais de população e recursos são consultas ao estado canónico, não cópias por painel. A geografia real não autoriza assumir que qualquer indicador ou pormenor urbano tem fonte factual.

## Navegação recomendada

1. No mundo, um clique seleciona um país e abre o resumo. Uma ação explícita “Abrir país” ou um zoom além do limiar oferece entrada na escala seguinte; evita-se confundir consultar com comandar.
2. No país, regiões e cidades são selecionáveis. A seleção mostra incidentes e meios atribuídos; “Abrir operação” entra na cidade. Nem toda a cidade precisa de detalhe 3D: a ficha deve explicar se há mapa operacional disponível ou apenas resolução agregada.
3. A transição centra-se no local selecionado, com uma animação curta opcional e um breadcrumb `Mundo > Portugal > Região > Cidade`. A data, velocidade, seleção e alertas mantêm-se visíveis. Pode existir crossfade entre renderizadores em vez de um zoom físico através de toda a geografia.
4. Voltar restaura a posição e o zoom anteriores por vista. Um mini mapa/contexto regional localiza a cidade e permite regressar ao incidente. A operação continua a existir quando deixa de estar em ecrã.
5. Um alerta inclui localização, hora e gravidade e permite “Ver” sem apagar a seleção anterior. Uma lista de operações ativas permanece acessível em todas as escalas; o jogador pode voltar ao mundo sem perder ordens ou acompanhamento.

Pan por arrasto e teclas, zoom centrado no cursor, botões de zoom e comando de recentrar são candidatos iniciais. A seleção deve distinguir clique de arrasto. Controlos definitivos de rato/teclado, touch e remapeamento devem ser validados com testes de utilização; não depender de um gesto oculto ou de double-click como único acesso.

## Coordenadas e câmara

Definir coordenadas geográficas para país/cidade e um referencial urbano local, preferencialmente em metros, com origem, escala e orientação documentadas. Um identificador de local liga os referenciais; uma transformação explícita liga posições de domínio, mundo 3D, ecrã e picking. Não reutilizar pixels do Canvas como posição física de unidades.

A primeira câmara urbana proposta é ortográfica, de inclinação fixa ou limitada, voltada para uma cidade com edifícios extrudidos simples. Proporciona leitura de mapa e profundidade sem exigir personagens ou navegação em primeira pessoa. Zoom altera a escala ortográfica; pan é limitado à área relevante. Rotação livre e inclinação extrema ficam adiadas até demonstrarem benefício.

Edifícios próximos podem ocultar unidades: contornos, transparência contextual, corte de cobertura ou realce de seleção devem manter rotas e riscos legíveis. A geometria não deve esconder a informação essencial nem exigir reconstruções artísticas detalhadas. O estilo é original; referências de género servem para discutir legibilidade e ritmo, sem copiar assets ou identidade.

As referências a imagens no briefing não correspondem a imagens visualizadas nesta entrega. Esta proposta baseia-se na descrição textual de vista superior, volumes simples e indivíduos geométricos.

## Seleção, ordens e autonomia

O jogador governa um país escolhido no início; consultar outro país nunca transfere comando. Ajuda e destacamentos internacionais exigem direitos e compromissos do modelo diplomático. A troca de comando da Alpha permanece identificada como ferramenta de demonstração até uma futura alteração aprovada.

Selecionar uma unidade ou grupo mostra missão, efetivos disponíveis, prontidão, suprimentos, tempo de chegada e restrições. A unidade não deve ser avaliada por um único valor de combate: polícia controla acessos, saúde trata/transporta, proteção civil evacua, engenharia prepara obstáculos e militares complementam a resposta conforme a ameaça.

Ordens iniciais propostas: proteger zona, controlar acesso, estabelecer perímetro, patrulhar ligação, assistir/evacuar, deslocar, reforçar e retirar. O planeamento mostra destino, trajeto, duração estimada, custo inicial e operacional, capacidade necessária, risco e alternativas. Uma ordem impossível é rejeitada com motivo; uma ordem condicionada aparece pendente, com dependência e prazo.

No nível estratégico, o jogador define objetivos e prioridades; a unidade executa o plano dentro de regras de autonomia e pode pedir nova decisão. A intervenção tática ajusta posição, linha defensiva ou retirada, sem exigir microgestão de cada indivíduo. Políticas de autonomia, cancelamento e custos já incorridos devem ser explícitos. Evitar teletransporte, reembolsos automáticos totais e utilização simultânea da mesma unidade em duas operações.

As posições e os corredores devem passar a ter efeitos espaciais verificáveis antes de serem apresentados como tática. Uma zona protegida deve depender de acessos, alcance efetivo, capacidade e abastecimento; um círculo desenhado não demonstra proteção.

## Hordas, civis e consequências visíveis

O desenho pode combinar hordas agregadas no domínio e pontos instanciados na vista, mantendo a relação entre grupo lógico e amostra visual. Indicar quando um símbolo representa várias pessoas; não apresentar partículas decorativas como uma contagem individual exata. Movimento coletivo, gargalos e quebra de perímetros precisam de influenciar o resultado lógico antes de constituírem funcionalidades de jogo.

Exemplo de sequência a validar num futuro slice: foco residencial detetado → polícia limita acessos → proteção civil reserva transporte e acolhimento → comboio inicia trânsito → congestionamento expõe pessoas e atrasa meios → reforço ou retirada altera o controlo → chegada liberta transporte e ocupa capacidade de acolhimento. Cada passo tem horário, recursos e população; evacuar não equivale automaticamente a salvar.

No mapa mundial, uma linha animada só deve representar um fluxo existente ou ser rotulada como ilustração. Na cidade, a passagem de um perímetro, uma interrupção de energia ou uma retirada deve corresponder a um acontecimento consultável. O painel causal liga a decisão ao custo e ao resultado, distinguindo consequência observada de previsão.

## Informação progressiva e acessibilidade

Usar um resumo permanente de tempo e estado nacional, uma ficha contextual de seleção e camadas temáticas, em vez de mostrar todos os indicadores simultaneamente. Camadas candidatas: ameaça, população, saúde/serviços, controlo, unidades, logística e evacuação. Combinações devem preservar contraste e incluir legenda/unidades. Risco previsto, posição confirmada e informação desatualizada necessitam de símbolos diferentes.

O estado verdadeiro do mundo é separado do conhecimento do governo. Cada relatório deve poder apresentar fonte, hora e confiança; um país não deve conhecer automaticamente uma infeção ainda não detetada. A incerteza resulta das regras e da observação, sem eventos punitivos arbitrários. O modo de diagnóstico dos desenvolvedores pode mostrar a verdade, mas não constitui informação do jogador.

Disponibilizar pesquisa/lista de países e cidades, seleção por teclado, foco visível, botões de navegação, descrições de estado e alternativas textuais para os principais fluxos. Não depender só de cor, Canvas, hover ou som. Modais devem gerir foco e permitir fecho por teclado; alertas devem evitar spam e oferecer pausa/agrupamento configuráveis. Movimento de câmara e efeitos podem ser reduzidos sem perder informação.

## Tempo e incidentes não observados

Todas as vistas mostram o mesmo relógio e controlo de velocidade. Pausa interrompe a progressão lógica; animação cosmética pode continuar se identificável, mas não representa pessoas a atravessar fisicamente uma zona em pausa. A câmara nunca avança tempo nem concede eficácia adicional a uma operação.

Operações ativas continuam a seguir os mesmos comandos e regras quando não são observadas. Regiões sem operação detalhada podem evoluir agregadamente, com contratos de conversão e invariantes definidos na [arquitetura](SIMULATION_ARCHITECTURE.md). Alterar detalhe não deve ser uma consequência arbitrária de olhar ou deixar de olhar: o plano de operação e as fronteiras de conversão são decisões do motor. As aproximações precisam de tolerâncias e testes; não se promete identidade entre dois modelos diferentes sem demonstração.

Ao acelerar, a interface mostra ordens pendentes e consequências urgentes. Uma proposta é pausar ou desacelerar em incidentes de gravidade configurável; a política precisa de revisão para não tornar campanhas com muitas operações impraticáveis. Uma máquina lenta não deve perder acontecimentos: reduz detalhe visual ou limita explicitamente a aceleração.

## Critérios de aceitação da experiência proposta

- Entrar e sair de cada escala conserva seleção, tempo, ordens, recursos e população; restaurar a câmara não altera o estado lógico.
- Picking e hit testing funcionam em DPR 1, 1,5 e 2, com redimensionamento, pan/zoom e edifícios sobrepostos. A correção do defeito HiDPI atual é uma tarefa de estabilização, não uma funcionalidade já entregue.
- Depois de reiniciar/carregar, o destaque de unidade, a instrução, a ação emitida e o custo concordam. O defeito atual após reinício permanece no backlog até ser corrigido.
- Uma ordem mostra custos, disponibilidade, prazos e eventual motivo de rejeição; o mesmo identificador não duplica a ordem ao mudar de vista.
- Uma operação não observada continua e produz resultados consultáveis uma vez; reabrir não recria unidades nem participantes.
- O resultado de uma sequência de comandos não depende de FPS, câmara ou visibilidade; os limites de aproximação agregada são testados separadamente.
- É possível navegar até uma cidade, consultar incidentes e emitir as ações principais por teclado/lista sem escolher um ponto minúsculo no mapa.
- Um utilizador consegue explicar, pelo diário e pelos indicadores, por que um perímetro falhou ou uma evacuação atrasou; símbolos ilustrativos e estimativas estão identificados.

Os testes gráficos, de interação e de utilização ainda são trabalho futuro. O [roadmap](DEVELOPMENT_ROADMAP.md) deve ligar estas verificações às fases de estabilização, prova urbana e integração, sem confundir uma demonstração visual com uma simulação concluída.
