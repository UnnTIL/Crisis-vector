# CRISIS VECTOR — Conceção do jogo

## Conceito
Grande estratégia geopolítica e gestão de crise com operações urbanas 2D. O jogador lidera a resposta de um Estado a uma infeção fictícia de mortos-vivos; não controla a ameaça. O jogo pretende ser mais lento e sistémico que Plague Inc., com relações internacionais, capacidades militares proporcionais, cidades em crise e operações táticas simplificadas. Referências de género: Zombies Aren't Real, Plague Inc., Hearts of Iron IV e Broken Arrow — não copiar ativos, interfaces ou mecânicas proprietárias.

## Três escalas, um estado

1. **Mundo:** países, fronteiras, alianças, relações bilaterais, comércio, viagens, corredores, refugiados e surtos internacionais. Governos estrangeiros agem autonomamente e têm prioridades políticas distintas.
2. **País e região:** economia, orçamento, estabilidade, legitimidade, saúde, alimentos, energia, combustível, forças armadas, reservas e logística; decisões com custo, atraso, eficácia incerta e externalidades.
3. **Cidade e operações:** mapa 2D animado com civis, infetados, tropas, serviços de emergência, checkpoints, hospitais, evacuação e controlo de zonas. Tática acessível, não simulador militar exaustivo.

**Invariante:** tropas, civis, mortos, infetados e recursos das cidades são parcelas dos totais regionais/nacionais. Operações consomem reservas nacionais e os seus resultados só são aplicados uma vez na simulação macro.

## Experiência de jogo

Informação → avaliação de risco → diplomacia e decisão → alocação → execução → consequências → adaptação. Simulação estratégica em dias; cidade ativa em minutos; pausa e velocidades de tempo. Relatórios podem ser incertos, desatualizados ou ocultados. Nenhuma política é perfeita: quarentena protege mas reduz economia e abastecimento; mobilização reforça defesa mas custa orçamento e causa desgaste.

## Portugal — campanha de referência

O jogador governa Portugal com focos ainda controláveis. Espanha, UE e NATO reagem aos seus próprios interesses; o jogador articula fronteiras, hospitais, reservas, militares e ajuda. Uma missão de evacuação em Lisboa preserva vidas mas consome combustível e tropas. O seu resultado deve alterar os indicadores de Portugal e o cenário global.

## Condições e rigor

Vitórias: população preservada, serviços essenciais ativos, estabilidade, recuperação e cooperação internacional. Derrotas: colapso institucional, rutura logística, perda de infraestruturas ou mortalidade extrema. Usar geografia real e fontes públicas datadas, com licença, unidades e metodologia. Indicadores militares Alpha 0.1 são **ficcionais**; não equivalem a ordens de batalha, prontidão ou capacidades oficiais. O cenário zombie não é epidemiologia validada.

## Estado Alpha 0.1

177 países/territórios, surto agregado, políticas nacionais, ajuda, interface mundial, cidade 2D e intervenções com efeito. Ainda não existem dados militares reais, diplomacia profunda, regiões reais, logística detalhada, pathfinding, combate autónomo, persistência ou campanhas finais.

## Regra para cada milestone

Entregar vertical slice jogável com entrada, estado, transição, custo, consequência, visualização, testes e reconciliação micro–macro. Evitar sistemas isolados e reescrita total precoce.
