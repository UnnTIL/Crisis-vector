# CRISIS VECTOR — BASELINE DATA V1

**Estado:** `PROPOSED` — especificação de importação, proveniência e equilíbrio; **direção de produto estabelecida**: usar dados reais verificáveis como ponto de partida da campanha.  
**Data de corte proposta:** 2026-11-12 (não significa que todos os dados correspondam a 2026).  
**Rastreabilidade:** [Issue #7](https://github.com/UnnTIL/Crisis-vector/issues/7), [simulador de políticas](POLICY_SIMULATOR.md), [arquitetura](SIMULATION_ARCHITECTURE.md), [roadmap](DEVELOPMENT_ROADMAP.md).  
**Âmbito desta entrega:** documentação, sem download de datasets, pipeline executável, alteração ao motor, commit de dados de terceiros ou reequilíbrio do jogo.

## 1. Propósito e limites

A campanha inicial terá condições demográficas, económicas, institucionais, sanitárias e territoriais fundamentadas em dados públicos, sem tratar qualquer índice de jogo como estatística oficial. O ponto de partida é factual na medida da qualidade das fontes; a evolução decorre de regras fictícias do simulador e das decisões do jogador/IA.

**Três camadas independentes:**

1. `ObservedData`: valores publicados por fonte, ano, unidade, revisão, cobertura, licença e qualidade.
2. `DerivedCapabilities`: capacidade de financiamento, preparação, resposta sanitária, logística, investigação e outras *heurísticas de jogo*, com fórmula/versão e incerteza explícitas.
3. `CampaignState`: estado mutável após iniciar a campanha — decisões, receitas, dívida, operações, população, recursos, informação e acontecimentos.

Uma alteração de cenário, dados ou fórmula deve incrementar a versão correspondente; um save antigo não pode ser reinterpretado silenciosamente.

## 2. Países-piloto

| ISO3 | País | Porquê |
| --- | --- | --- |
| PRT | Portugal | Referência de campanha e interação europeia |
| DEU | Alemanha | Economia industrial europeia de grande escala |
| USA | Estados Unidos | Grande dimensão económica e capacidade internacional |
| BRA | Brasil | Grande área e população, heterogeneidade territorial |
| MWI | Malawi | Testar desafios de dados incompletos e restrições materiais |

Este grupo testa diversidade de escala/cobertura. Não pressupõe ranking real de capacidades, equilíbrio ou dificuldade de jogo. O piloto **não** implica que todos os indicadores existam nos cinco países.

O ficheiro `data/world-data.js` atual usa códigos e polígonos herdados da Alpha 0.1; será necessário um dicionário de correspondências `internalId ↔ ISO 3166-1 alpha-3 ↔ sourceId`, com exceções documentadas (territórios dependentes, entidades disputadas, agregados estatísticos e mudanças históricas). Não atribuir arbitrariamente um ISO a territórios.

## 3. Fontes candidatas e série mínima

**Cada indicador abaixo é candidato**, não dado já importado ou licença já confirmada para o produto final. Confirmar metadados, termos de uso da série e disponibilidade ao executar o piloto.

| Área | Série de referência | Fonte candidata | Interpretação e cuidado |
| --- | --- | --- | --- |
| População | `SP.POP.TOTL` | Banco Mundial / ONU | Total de pessoas; confirmar ano, estimativa e eventual revisão |
| Urbanização | `SP.URB.TOTL.IN.ZS` | Banco Mundial | Percentagem urbana; não representa densidade dentro de cada cidade |
| PIB corrente | `NY.GDP.MKTP.CD` | Banco Mundial | Dólares correntes, não tesouraria nem orçamento governamental |
| PIB por habitante | `NY.GDP.PCAP.CD` | Banco Mundial | Contextualização, não um indicador automático de qualidade de vida |
| Receita fiscal | `GC.TAX.TOTL.GD.ZS` | Banco Mundial | Receita fiscal como % do PIB; definição/cobertura fiscal devem ser verificadas |
| Camas hospitalares | `SH.MED.BEDS.ZS` | Banco Mundial/OMS | Capacidade nominal aproximada; não indica vagas, pessoal ou operacionalidade |
| Investigação | `GB.XPD.RSDV.GD.ZS` | Banco Mundial/UNESCO | Despesa I&D % PIB, não resultados científicos garantidos |
| Comércio | `NE.TRD.GNFS.ZS` | Banco Mundial | Abertura comercial agregada, não trajetos logísticos físicos |
| Dívida/finanças públicas | Série a selecionar, com unidade e definição explícitas | FMI WEO e fontes fiscais oficiais | Distinguir dívida bruta/líquida, administração geral/governo central e referência temporal |
| Eficácia governativa | `GE.EST` ou outra série explicitamente identificada | Worldwide Governance Indicators | Indicador estatístico com incerteza; **não** traduzir 1:1 para legitimidade ou competência de governo |
| Rede viária e geografia | Conjuntos definidos por território | Natural Earth / OpenStreetMap / Copernicus GHSL | Licenças e atribuições distintas; rede viária não garante transitabilidade |

**Defesa:** eventual despesa militar como referência histórica pública não equivale a prontidão, efetivos mobilizáveis ou armamento disponível. **Não incorporar dados SIPRI ou derivados em distribuição comercial sem confirmar as condições de uso da série/licença**; prever fontes alternativas oficiais ou estimativas sintéticas declaradas.

### URLs para investigação / consulta

- [World Bank Indicators API](https://api.worldbank.org/v2/country/PRT/indicator/SP.POP.TOTL?format=json), [documentação](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)
- [World Bank Data Catalog / Terms of Use](https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets)
- [UN World Population Prospects](https://population.un.org/wpp/)
- [IMF WEO](https://www.imf.org/en/Publications/WEO/weo-database)
- [WHO Global Health Observatory](https://www.who.int/data/gho)
- [Worldwide Governance Indicators](https://www.worldbank.org/en/publication/worldwide-governance-indicators)
- [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/)
- [OpenStreetMap copyright](https://www.openstreetmap.org/copyright)
- [European Commission GHSL](https://human-settlement.emergency.copernicus.eu/)
- [SIPRI Military Expenditure Database](https://www.sipri.org/databases/milex)

## 4. Ano de referência, qualidade e tratamento de ausências

A `freezeDate` identifica quando se congela uma edição dos dados, não altera o ano de observação.

Regras:

1. Guardar `observationYear` ou período exato por indicador; nunca afirmar que o valor descreve 2026 quando a última observação é de 2021.
2. Guardar `publishedAt` / `retrievedAt` quando disponíveis, `datasetVersion` e `sourceUrl`.
3. Distinguir explicitamente `observed`, `estimated`, `projected`, `imputed`, `synthetic` e `unavailable`. Um valor previsto não tem a mesma natureza de uma medição observada.
4. Não substituir `null` por zero: zero pode ser um dado economicamente significativo.
5. Se existirem lacunas, escolher fallback por regra transparente (`regionalMedian`, `historicalLastValid`, `countryPeerGroup`, `syntheticScenario`) e registar origem, data, método e incerteza. Não usar informação futura em campanhas históricas sem identificar o cenário como contrafactual.
6. A fonte e a licença devem ser avaliadas por **dataset e série**, inclusive quando o valor é reproduzido por um agregador.
7. Não apresentar estimativas de força militar, prontidão ou governança como dados verificados apenas porque a fórmula usa uma variável factual.
8. Agregados mundiais e valores nacionais devem conciliar unidades, divisas e populações; atenção a valores per capita, % PIB, unidades monetárias e deflatores.

## 5. Contrato de dados proposto

Exemplo de metadados (todos os valores ilustrativos):

```json
{
  "schemaVersion": "baseline-v1",
  "freezeDate": "2026-11-12",
  "countryId": "PRT",
  "sourceCountryCode": "PRT",
  "indicators": {
    "population": {
      "value": null,
      "unit": "persons",
      "observationYear": null,
      "status": "unavailable",
      "source": "World Bank",
      "series": "SP.POP.TOTL",
      "sourceUrl": "https://api.worldbank.org/v2/country/PRT/indicator/SP.POP.TOTL?format=json",
      "datasetVersion": null,
      "retrievedAt": null,
      "license": null,
      "fallback": null,
      "checksum": null
    }
  }
}
```

O contrato distingue valores de fonte de quantidades operacionais de jogo. Manifestações de datasets e transformações devem possuir checksum do input e hash estável do output; normalizar ordenação e formatos antes de produzir hashes.

**Sugestão de estrutura futura, ainda não criada:**

```text
data/baseline/
  manifest.json
  baseline-v1.json
  sources.json
  country-map.json
scripts/data/
  fetch-world-bank.*
  normalize-baseline.*
  validate-baseline.*
tests/data/
  ...
```

A execução da campanha usa apenas `baseline-v1.json` congelado e as regras versionadas, sem chamadas de rede.

## 6. Transformação para capacidades jogáveis

A transformação `f(dados, regrasVersionadas, seed)` produz valores de jogo, nunca uma «capacidade real» diretamente. Definir versão de fórmula, normalização, limites e resolução de ausências. Não escolher pesos apenas para reproduzir rankings conhecidos.

| Capacidade derivada futura | Inputs de referência | Limitação |
| --- | --- | --- |
| Base fiscal e receita | Atividade, rendimento, consumo, receita fiscal agregada, emprego quando disponível | `PIB × taxa fiscal nominal` não é base tributária válida universal |
| Crédito e dívida | Dívida pública, receitas, juros/risco e poupança agregada | Emissão precisa de procura finita e custos de financiamento |
| Preparação sanitária | Camas, profissionais, despesa e infraestruturas | Camas ≠ capacidade de cuidados intensivos ou disponibilidade de pessoal |
| Investigação científica | Despesa I&D, formação e cooperação | Investimento não garante descoberta ou eficácia científica |
| Defesa e mobilização | Recursos, financiamento, pessoal e logística | Despesa não mede prontidão ou força projetável |
| Logística e dependências | Urbanização, comércio, transportes e geografia | Comércio % PIB não equivale a capacidade de evacuação |

Recomendo calibração por **sensibilidade e escolhas**: se o jogador tomar a mesma política, o custo, o tempo e os efeitos diferem de modo explicável conforme as condições iniciais. Países com menos meios podem ter alternativas viáveis por prevenção, alocação, diplomacia e adaptação; não precisam de paridade militar artificial.

## 7. Pipeline reproduzível — gates de validação

### D0 — Revisão de fontes e termos

Inventário de séries, campo original, cobertura por país, ano, unidade, licença e autorização de redistribuição. Nenhum dado de origem com termos incompatíveis entra no artefacto do jogo.

### D1 — Piloto de cinco países

Importar apenas `PRT, DEU, USA, BRA, MWI` e série mínima. Relatório país × indicador com ano, disponibilidade, qualidade, falhas, percentagem de imputação e transformação proposta. Não inventar valores.

### D2 — Normalização e congelamento

Gerar o mesmo ficheiro e hash com fontes congeladas; validar schema, IDs, unidades, números finitos, intervalos, agregados e consistência temporal. Comparar dois builds repetidos. Ausências não impedem a produção se houver fallback explícito aprovado.

### D3 — Primeira ligação ao motor (noutra tarefa)

Gerar estado inicial de campanha consumindo a baseline e parâmetros de jogo, sem misturar lógica de importação com `SimEngine`. Testar determinismo, retrocompatibilidade da Alpha e independência da rede.

### D4 — Balanceamento

Executar campanhas de 60/120 dias com seeds fixas e estratégias comparáveis. Medir preservação de população, capacidade fiscal, serviços, custo de preparação, contágio e resposta; interpretar diferenças sem confundir rankings com resultado ótimo. Calibrar parâmetros de jogo, não reescrever os valores originais.

### D5 — Ampliação mundial e distribuição

Expandir cobertura gradualmente após validar o piloto, licenças e desempenho. Testar países sem indicadores, regiões disputadas, mudanças de código, pequenas populações e dados antigos. A versão de baseline mantém-se congelada para saves; uma versão nova é um novo pacote de cenário.

## 8. Dependências de produto e implementação

- [A1a — Issue #2 / PR #5](https://github.com/UnnTIL/Crisis-vector/pull/5): motor financeiro consistente, **não** consumo de baseline real.
- [A1b — Issue #3](https://github.com/UnnTIL/Crisis-vector/issues/3): população e transferências, preservando a autoridade única.
- [Prova urbana — Issue #4](https://github.com/UnnTIL/Crisis-vector/issues/4): pode usar dados sintéticos, não depende de D5.
- [Governação — Issue #6](https://github.com/UnnTIL/Crisis-vector/issues/6): impostos e dívida devem distinguir dados observados de condições de jogo.
- [BASELINE DATA — Issue #7](https://github.com/UnnTIL/Crisis-vector/issues/7): D0–D2 podem decorrer **em paralelo** com a prova urbana; D3 depende dos contratos de cenário/campanha e da revisão humana das transformações.

## 9. Critérios de aceitação da primeira entrega de dados

- Cinco países-piloto e cobertura auditável por campo, com lacunas declaradas.
- `source_country_code`/ISO3 correto ou exceção explicitamente documentada.
- Todas as séries com fonte, ano, unidade, versão, obtenção e licença.
- Nenhuma conversão silenciosa de ausência para zero; nenhum `NaN`/`Infinity`.
- Hash e conteúdos repetíveis com as mesmas entradas congeladas.
- Distinção entre dados factuais e pesos/regras de gameplay.
- Dados redistribuíveis incorporados no jogo; os demais ficam fora ou em importação opcional conforme permissões.
- Sem dependência da rede durante uma partida.
- Preservação da Alpha 0.1 e dos seus testes até nova tarefa de integração.

**O documento não contém os valores estatísticos efetivamente recolhidos.** A sua recolha, validação e interpretação são o primeiro trabalho de engenharia de dados a autorizar.
