# Questões para validação humana

Estado: **PROPOSED**. Data: 2026-11-12. Não existem respostas presumidas nesta ronda.

As decisões já estabelecidas — país fixo, evacuação física, regras económicas equivalentes, zombies primeiro e ausência de implementação nesta tarefa — constam do [Decision Log](DECISION_LOG.md) e não são reabertas aqui. Questões técnicas mensuráveis serão resolvidas por testes; não exigem preferências arbitrárias do diretor criativo.

## Antes da estabilização e da primeira tarefa de código

### Q-001 — Transições humanas e identidade da ameaça zombie

- **Impacto:** população, mortes, evacuação e comparação dos resultados da campanha; DEC-013.
- **Proposta:** localização, saúde e deslocação são dimensões diferentes. Pessoas falecidas permanecem no balanço demográfico; a ameaça reanimada referencia essa população e a sua neutralização não gera uma segunda morte humana.
- **Alternativa relevante:** transformação de uma pessoa ainda viva, com morte só noutra transição. O núcleo suporta a variante, mas a primeira campanha precisa de uma regra única e legível.
- **Validação pedida:** aceitar o modelo contabilístico e definir a transição de transformação do primeiro cenário. Não requer escolher taxas ou investigação epidemiológica real nesta fase.

### Q-002 — Prioridades e consequências do financiamento insuficiente

- **Impacto:** testes de insolvência, custos da IA e escolhas de governo; DEC-014.
- **Proposta:** reservas e receitas financiam prioridades explícitas; obrigações não pagas geram atrasados e degradação gradual. Dívida e ajuda são condicionadas. Serviços não desaparecem instantaneamente; compromissos e incumprimentos são visíveis.
- **Alternativas:** distribuição proporcional por todas as despesas ou prioridades automáticas fixas. A recomendação é prioridades do jogador com uma política padrão explicável também usada pela IA.
- **Validação pedida:** confirmar este grau de gestão e se o jogador pode alterar prioridades essenciais. Parâmetros numéricos de crédito, juros e eficácia serão calibrados, sem serem apresentados como factos.

## Antes de executar a prova urbana B

### Q-003 — Hardware de referência e carga mínima útil

- **Impacto:** interpretação da meta de 60 FPS e escolha de plataforma; DEC-011 e DEC-015.
- **Proposta:** acordar um desktop de gama média real, navegador/resolução e uma carga nominal do [benchmark](TECHNOLOGY_ASSESSMENT.md), distinguindo entidades visíveis das simuladas individualmente. Usar um perfil inferior para testar degradação.
- **Validação pedida:** identificar a máquina ou classe verificável disponível e ratificar a carga nominal depois da calibração inicial. Um executor cloud com renderização por software não certifica essa meta.
- **Sem bloqueio atual:** a documentação e o desenho dos ensaios não dependem de acesso imediato a esse hardware.

### Q-006 — Fronteira inicial entre planeamento e comando tático

- **Impacto:** unidade representada, desenho das ordens e reutilização do protótipo B na integração E.
- **Proposta:** selecionar equipas/formações e atribuir objetivos, zonas, rotas e regras de retirada; autonomia executa o detalhe. A câmara é ortográfica com profundidade simples. Uma cidade inicial esquemática pode testar estas operações sem alegar geografia urbana real.
- **Alternativas:** microgestão frequente de pequenas unidades ou intervenção apenas através de planos. A recomendação é planeamento com intervenção direta opcional, em linha com a visão recebida.
- **Validação pedida:** ratificar o recorte de interação antes de B; refinar o detalhe para E a partir dos testes. O protótipo não escolhe silenciosamente o detalhe militar definitivo.

## Antes de fechar a campanha persistente C e a integração E

### Q-004 — Compressão temporal e limites de operações detalhadas

- **Impacto:** ritmo de campanha, atenção exigida ao jogador e custo computacional; DEC-012.
- **Proposta:** um relógio de campanha com pausa e velocidade globais, interrupções configuráveis e operações ativas que continuam fora da câmara. Passos fixos e representação agregada são mecanismos técnicos; não concedem tempo extra numa cidade.
- **Alternativas a discutir:** reduzir automaticamente a velocidade perante incidentes críticos, apenas alertar, ou exigir confirmação em determinados eventos. Definir também a quantidade de operações simultâneas que o jogo pretende tornar administrável.
- **Validação pedida:** comportamento desejado perante incidentes e carga de atenção. As frequências concretas dependem do protótipo, não de uma votação entre valores sem medição.

### Q-005 — Objetivos e avaliação da primeira campanha

- **Impacto:** equilíbrio, condições de fim, valor da prevenção e comparabilidade entre países; DEC-007.
- **Proposta:** Portugal como primeira campanha de referência, já sugerida nos documentos originais, com objetivos de população, serviços, instituições e sustentabilidade. Pontuação por metas e condições iniciais, sem premiar criar uma crise para depois a resolver.
- **Validação pedida:** horizonte e condições de vitória/derrota da primeira campanha; escolher poucos objetivos principais e os restantes como indicadores. Pesos e limiares serão testados antes de serem fixados.

### Q-007 — Arranque offline da versão modular

- **Impacto:** primeira adoção de ES modules, Workers ou carregadores que exijam origem HTTP; DEC-011.
- **Proposta:** preservar a Alpha atual e distribuir a versão modular com recursos empacotados e um arranque local simples, sem internet. Um servidor local incluído ou shell desktop são alternativas; duplo clique no HTML requer um empacotamento compatível testado.
- **Validação pedida:** aprovar a experiência de instalação/arranque antes de alterar essa propriedade do produto. Não é uma pergunta sobre permitir serviços externos: estes continuam dispensáveis.
- **Momento:** antes da primeira tarefa que introduza tal requisito, mesmo que seja anterior a C. Não bloqueia correções independentes da Alpha ou a documentação presente.

## Decisões adiadas

Geografia urbana real em grande escala, distribuição desktop concreta, outros motores e novas ameaças podem esperar pelos gates do [roadmap](DEVELOPMENT_ROADMAP.md). Encontrar a versão e a licença de um dataset é trabalho de investigação, não uma questão de preferência a devolver ao diretor criativo.

Resultados e alterações serão registados em [ROUND-001-FEEDBACK](reviews/ROUND-001-FEEDBACK.md) e depois consolidados no Decision Log. A aprovação de uma resposta não implica aprovação das restantes propostas.
