# BASELINE DATA V1 — Relatório D0–D2

Edição **1.1.0-pilot**, corte **2026-11-13**. Camada factual separada, não integrada no motor. A edição 1.0.0-pilot de 12/11/2026 foi preservada em editions/1.0.0-pilot-2026-11-12.

**Cobertura efetiva: 40/40 (100%).** Séries com resposta de dados: 8/8. Imputações pelo pipeline: 0.

| País | Indicadores disponíveis |
| --- | ---: |
| Portugal (PRT) | 8/8 |
| Alemanha (DEU) | 8/8 |
| Estados Unidos (USA) | 8/8 |
| Brasil (BRA) | 8/8 |
| Malawi (MWI) | 8/8 |

## Valores originais e anos

Cada célula indica valor e ano próprios; não são todos dados de 2026. Valores em USD são correntes, sem conversão ou arredondamento de gameplay. A classificação permanece unclassified quando o código da fonte não identifica a natureza da observação; a definição de população explicita estimativas de meio do ano.

| Indicador / unidade | PRT | DEU | USA | BRA | MWI |
| --- | --- | --- | --- | --- | --- |
| population (persons) | 10804871 (2025) | 83491249 (2025) | 341784857 (2025) | 212812405 (2025) | 22216120 (2025) |
| urbanization (percent_population) | 61.4953199318985 (2025) | 82.13822205362 (2025) | 80.1921733027869 (2025) | 88.1772996487898 (2025) | 17.5949868386317 (2025) |
| gdp (current_USD) | 346639825141.821 (2025) | 5050922925047.05 (2025) | 30769700000000 (2025) | 2279920092492.13 (2025) | 14918276698.303 (2025) |
| gdpPerCapita (current_USD_per_person) | 32081.8106150292 (2025) | 60496.4350820414 (2025) | 90026.5163005744 (2025) | 10713.2856869511 (2025) | 671.506847203876 (2025) |
| taxRevenue (percent_GDP) | 22.3472676749446 (2024) | 10.890812364142 (2024) | 10.7694743667429 (2024) | 15.4102340832552 (2024) | 15.5978477117661 (2024) |
| hospitalBeds (beds_per_1000_people) | 3.48 (2022) | 7.55 (2023) | 2.68 (2022) | 2.52 (2021) | 1.3 (2011) |
| research (percent_GDP) | 1.69491 (2023) | 3.1539 (2023) | 3.44716 (2023) | 1.1938 (2023) | 0.17752 (2019) |
| trade (percent_GDP) | 86.3988769792664 (2025) | 78.5128112199127 (2025) | 25.0160172978284 (2024) | 35.2914822615074 (2025) | 39.3994694717291 (2025) |

## Cobertura por indicador e antiguidade

| Série | Cobertura | Anos disponíveis | Maior antiguidade |
| --- | ---: | --- | ---: |
| SP.POP.TOTL | 5/5 | 2025 | 1 ano |
| SP.URB.TOTL.IN.ZS | 5/5 | 2025 | 1 ano |
| NY.GDP.MKTP.CD | 5/5 | 2025 | 1 ano |
| NY.GDP.PCAP.CD | 5/5 | 2025 | 1 ano |
| GC.TAX.TOTL.GD.ZS | 5/5 | 2024 | 2 anos |
| SH.MED.BEDS.ZS | 5/5 | 2011, 2021, 2022, 2023 | 15 anos |
| GB.XPD.RSDV.GD.ZS | 5/5 | 2019, 2023 | 7 anos |
| NE.TRD.GNFS.ZS | 5/5 | 2024, 2025 | 2 anos |

## Comparação e limites de interpretação

Os números acima permitem comparar magnitudes publicadas, não prontidão, dificuldade ou resultados de campanha. Não há pontuações nem normalização de poder. PIB não é tesouraria; PIB por habitante não descreve desigualdade; camas por mil habitantes não medem vagas disponíveis, pessoal ou cuidados intensivos; comércio/PIB pode exceder 100%.

Amostras antigas são mantidas com o ano original, sem preenchimento silencioso. A variação de anos impede tratar razões entre séries como se fossem medições contemporâneas. Os perfis dos cinco países são um teste de diversidade de escala e cobertura, não uma classificação de vencedores e perdedores.

Âmbito da contabilidade governamental segundo metadados WDI:

- BRA: Consolidated central government.
- DEU: Consolidated central government.
- MWI: Budgetary central government.
- PRT: Consolidated central government.
- USA: Consolidated central government.

Por isso, receita fiscal/PIB não representa necessariamente o mesmo perímetro administrativo nos cinco países. A diferença é documentada; não foi corrigida com uma estimativa.

## Fontes, versões e direitos de utilização

| Série | Revisão WDI | Licença declarada / revisão |
| --- | --- | --- |
| SP.POP.TOTL | 2026-11-11 | CC BY-4.0 / verified |
| SP.URB.TOTL.IN.ZS | 2026-11-11 | CC BY-4.0 / verified |
| NY.GDP.MKTP.CD | 2026-11-11 | CC BY-4.0 / verified |
| NY.GDP.PCAP.CD | 2026-11-11 | CC BY-4.0 / verified |
| GC.TAX.TOTL.GD.ZS | 2026-11-11 | CC BY-4.0 / verified |
| SH.MED.BEDS.ZS | 2026-11-11 | CC BY-4.0 / verified |
| GB.XPD.RSDV.GD.ZS | 2026-11-11 | CC BY-4.0 / verified |
| NE.TRD.GNFS.ZS | 2026-11-11 | CC BY-4.0 / verified |

Os metadados por série, origem, limitações estatísticas, evidência e atribuições estão em sources.json e license-review.json. A revisão técnica verificou os rótulos de licença e as exceções publicadas; não substitui aconselhamento jurídico nem autoriza outros datasets dos mesmos fornecedores.

Uso comercial dos valores declarados CC BY 4.0 exige cumprir atribuição ao Banco Mundial e fornecedores, identificação de alterações, ligação aos termos e preservação das condições adicionais WB, incluindo mediação/arbitragem e ausência de endosso. Os termos específicos de datasets prevalecem sobre termos gerais em conflito. HTML/assets do site são evidência de desenvolvimento, não recursos licenciados para embutir no jogo. Ver ATTRIBUTION.md e docs/BASELINE_DATA_PIPELINE.md.

## Proveniência e reprodução

SHA-256 de scenario-baseline-v1.json: `1f3c2e2f15a9ca7776ab87ab57ab63d6f81bc26bd74238760f37e282df5ed506`.

Aquisição com datas reais em inputs/acquisition.json; URLs finais, tipos de conteúdo e hashes dos bytes congelados constam do manifesto. O corte é 2026-11-13; lastupdated é revisão do dataset, não ano de observação ou data individual de publicação.

Geração e validação offline: node scripts/data/normalize-baseline.cjs e node scripts/data/validate-baseline.cjs. Usar --base-dir para a edição arquivada. O manifesto não inclui o próprio hash.

Não houve integração D3, alterações ao motor/dados da Alpha, recalibração de regras, campanhas comparativas de 60/120 dias ou merge do PR.
