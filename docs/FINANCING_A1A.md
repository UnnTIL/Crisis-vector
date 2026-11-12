# A1a — Comandos, custos e financiamento

Implementação delimitada da [Issue #2](https://github.com/UnnTIL/Crisis-vector/issues/2), seguindo a direção funcional DEC-004/DEC-019 e a proposta DEC-014 do [PR documental #1](https://github.com/UnnTIL/Crisis-vector/pull/1). Esta entrega parte da `main`; não integra esse PR nem implementa a restante visão de produto.

## Parâmetros de jogo

Todos os valores monetários são **B€ ficcionais**, liquidados em milésimos de B€. Não representam contas públicas reais. A receita diária é `arredondar(max(0,002; PIB histórico / 10 000 000) × economia / 100; 3 casas)`. É uma base fiscal doméstica abstrata, exterior aos saldos dos governos simulados; não é dinheiro transferido de outro país nem uma economia mundial fechada. A tesouraria inicial mantém a fórmula da Alpha 0.1.

| Medida | Ativação / colocação | Operação por dia |
| --- | ---: | ---: |
| Emergência | 0,800 | 0,085 |
| Fronteiras | 0,500 | 0,040 |
| Mobilização | 1,200 | 0,180 |
| Infantaria, por unidade | 0,350 | 0,015 |
| Barreira, por unidade | 0,220 | 0,010 |
| Evacuação, por unidade | 0,450 | 0,020 |

Estes contratos estão centralizados em `POLICY_TYPES`, `UNIT_TYPES` e `FINANCE_RULES`, consultados também pela UI. Desativar uma política é gratuito e termina as suas novas despesas, mas não elimina obrigações anteriores. Reativar volta a pagar a ativação e não restaura eficácia. Ajuda humanitária continua a custar 0,800 ao doador, com efeito temporário de oito dias; não credita tesouraria ao destinatário nem cria financiamento de materiais. A ajuda avançada fica fora deste incremento.

## Ordem diária e reconciliação

1. Os governos autónomos tentam ativar políticas pelo mesmo caminho de validação e pagamento do jogador. Ativações sem saldo suficiente são rejeitadas.
2. Cada país recebe a receita e paga as operações correntes na ordem fixa **emergência → unidades urbanas → mobilização → fronteiras**. O grupo urbano agrega a manutenção de todas as suas unidades. Esta prioridade protege primeiro a resposta civil e os destacamentos existentes e é igual para IA e jogador; não existe seletor de prioridades nesta fase.
3. O saldo restante paga atrasados de dias anteriores, sem juros. A parcela das obrigações correntes que ficou por pagar é acrescentada aos atrasados uma única vez. Pagar atrasados não compra eficácia no dia atual.
4. Depois de todos os países liquidarem, a propagação usa uma fotografia comum das fronteiras e respetivas eficácias. Só então são atualizados infeção, vítimas, economia e estabilidade.

Para cada liquidação:

`tesouraria final = tesouraria inicial do dia + receita − operações pagas − atrasados pagos`

`atrasados finais = atrasados iniciais + obrigações correntes − operações pagas − atrasados pagos`

Ativações, colocação de unidades e ajuda debitam imediatamente a tesouraria e o acumulado de despesa. No curso normal da simulação: `tesouraria = tesouraria inicial da campanha + receitas acumuladas − despesas acumuladas`. O registo financeiro mantém acumulados e a última liquidação de cada país; o histórico inclui custos de comandos e o relatório financeiro diário do país sob comando. O diário mantém o limite existente de 80 entradas, não é um ledger de auditoria persistente ilimitado.

## Subfinanciamento e efeitos

Cada grupo tem eficácia entre 0 e 1, inicialmente zero. A fração financiada do dia é `pagamento / obrigação`. A eficácia aproxima-se dessa fração no máximo **0,25 por dia**, tanto na mobilização/recuperação como na degradação. Uma política completamente financiada precisa de quatro liquidações para atingir 100%. Uma capacidade anteriormente a 100% e sem qualquer financiamento chega a zero após quatro liquidações; não há patamar positivo gratuito permanente. Esta inércia é uma abstração limitada de capacidade já preparada, não um inventário de materiais. Um grupo inativo fica com eficácia zero na liquidação.

A eficácia afeta **todos** os modificadores operacionais correspondentes: contenção da emergência, mortalidade, neutralização pela mobilização, restrições nas fronteiras de origem e destino, custos sociais/económicos das políticas e efeitos das unidades urbanas (incluindo o contador demonstrativo de evacuação). Os custos financeiros comprometidos continuam devidos por inteiro enquanto a medida estiver ativa. Cada dia de insuficiência acrescenta uma perda de estabilidade de `0,15 × despesa corrente não paga / despesa corrente devida`. Não há derrota automática por saldo zero.

A UI distingue tesouraria, receita/manutenção previstas, operação paga/devida no último dia, atrasados e eficácia. Apresenta aviso se a próxima liquidação estiver descoberta, se houve incumprimento ou se há capacidade degradada. Valores previstos podem mudar após decisões e evolução da economia.

## Validação dos comandos

- Políticas, tipos de unidade e países usam chaves próprias conhecidas; nomes herdados como `toString`, `constructor` e `__proto__` não são comandos válidos.
- `deployUnit` exige números finitos, com `0,04 ≤ x ≤ 0,96` e `0,06 ≤ y ≤ 0,94`. Não converte strings nem corrige silenciosamente coordenadas fora do intervalo. A UI mantém a restrição operacional mais estreita em altura.
- `advance` aceita de 1 a 3650 dias inteiros por chamada, sem coerção de strings. O limite evita trabalho ilimitado por um comando inválido; chamadas sucessivas continuam possíveis.
- Rejeições preservam tesouraria, unidades, tempo, RNG, histórico e identificadores. Despesas e obrigações são reconciliadas em unidades monetárias inteiras antes da representação decimal.

## Mudanças de equilíbrio e limites

A IA passa a pagar ativações; a receita passa a acompanhar a economia; medidas levam tempo a atingir eficácia máxima; unidades urbanas passam a ter manutenção; incumprimento cria atrasados e desgaste. Por isso, trajetórias numéricas da Alpha 0.1 mudam, embora a mesma seed e sequência de comandos continuem determinísticas. As taxas de transmissão e demais parâmetros epidemiológicos de base não foram recalibrados.

Não inclui crédito, juros, banca, reservas materiais detalhadas, comércio completo, persistência de campanha, contabilidade populacional real de evacuação ou nova plataforma gráfica. O contador de evacuados e a troca de país continuam ferramentas da demonstração, a rever em fases próprias. Os problemas de seleção HiDPI e destaque visual de unidade após reinício também não fazem parte deste PR. Não foram estabelecidos objetivos de vitória nem prometido equilíbrio de campanha longa.
