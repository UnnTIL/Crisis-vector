# BASELINE DATA V1 — Relatório D0–D2

Versão: 1.0.0-pilot. Corte: 2026-11-12. Camada factual separada; **não integrada no jogo**.

Cobertura distribuível verificada: **0/40 (0%)**. Imputações: 0. Respostas de séries recolhidas: 0/8.

**Entrega parcial:** indisponibilidades abaixo não são prova de lacunas estatísticas do Banco Mundial. Zero não foi usado para preencher ausências.

| Indicador (série) | PRT | DEU | USA | BRA | MWI |
| --- | --- | --- | --- | --- | --- |
| population (SP.POP.TOTL) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |
| urbanization (SP.URB.TOTL.IN.ZS) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |
| gdp (NY.GDP.MKTP.CD) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |
| gdpPerCapita (NY.GDP.PCAP.CD) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |
| taxRevenue (GC.TAX.TOTL.GD.ZS) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |
| hospitalBeds (SH.MED.BEDS.ZS) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |
| research (GB.XPD.RSDV.GD.ZS) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |
| trade (NE.TRD.GNFS.ZS) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) | — (network_access_denied) |

## Interpretação e lacunas

- network_access_denied: 40 células.

Países com cobertura verificada: PRT 0/8; DEU 0/8; USA 0/8; BRA 0/8; MWI 0/8.

Não foram gerados rankings de capacidade ou parâmetros de gameplay. Sem valores verificados, não existe comparação quantitativa legítima entre os cinco países. Mesmo quando disponíveis, PIB não é tesouraria; camas por mil habitantes não são vagas operacionais; comércio pode exceder 100% do PIB.

## Termos e distribuição comercial

- SP.POP.TOTL: pending_review; autorização comercial not_cleared; licença não verificada.
- SP.URB.TOTL.IN.ZS: pending_review; autorização comercial not_cleared; licença não verificada.
- NY.GDP.MKTP.CD: pending_review; autorização comercial not_cleared; licença não verificada.
- NY.GDP.PCAP.CD: pending_review; autorização comercial not_cleared; licença não verificada.
- GC.TAX.TOTL.GD.ZS: pending_review; autorização comercial not_cleared; licença não verificada.
- SH.MED.BEDS.ZS: pending_review; autorização comercial not_cleared; licença não verificada.
- GB.XPD.RSDV.GD.ZS: pending_review; autorização comercial not_cleared; licença não verificada.
- NE.TRD.GNFS.ZS: pending_review; autorização comercial not_cleared; licença não verificada.

Não se presume CC BY para séries agregadas/de terceiros. Valores só entram no pacote quando existe revisão por série, exceções verificadas e evidência congelada dos termos. Nenhum dado numérico não autorizado foi incorporado nesta entrega. SIPRI e dívida/FMI permanecem excluídos.

## Proveniência e reprodução

SHA-256 de scenario-baseline-v1.json: `a4f8ca0d6aaaca2945ee4badcb17902d6e8e542ea56ccecbc0b82bb8deb52c10`.

Consultas, falhas, datas reais de obtenção e revisões constam de sources.json e inputs/acquisition.json; checksums em manifest.json. Uma recusa CONNECT 403 é bloqueio do proxy antes de qualquer resposta HTTP da fonte. As consultas não tentadas após essa recusa apontam para o pedido de evidência, sem inventar datas de obtenção.

Geração offline: node scripts/data/normalize-baseline.cjs. Validação: node scripts/data/validate-baseline.cjs. O manifesto não inclui o próprio hash. A antiguidade e a classificação da fonte são preservadas; códigos não interpretados mantêm qualidade unclassified. lastupdated não é data de publicação de cada observação.
