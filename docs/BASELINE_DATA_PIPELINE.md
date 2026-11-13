# BASELINE DATA V1 — piloto D0–D2

Continuação da [Issue #7](https://github.com/UnnTIL/Crisis-vector/issues/7), após leitura integral da [revisão técnica do PR #8](https://github.com/UnnTIL/Crisis-vector/pull/8#issuecomment-6837826628). A implementação permanece na branch `feat/baseline-data-v1`, sem integração D3, alterações ao motor/dados da Alpha, campanhas de 60/120 dias ou merge. Os documentos de produto de referência foram consultados na branch documental, não incorporados por merge.

## Edições e datas reais

- `1.0.0-pilot`, corte **2026-11-12**: edição original com 0/40 valores, bloqueada pelo proxy. Ficheiros e inputs preservados byte a byte em `data/baseline/editions/1.0.0-pilot-2026-11-12/`. Hash da baseline: `a4f8ca0d6aaaca2945ee4badcb17902d6e8e542ea56ccecbc0b82bb8deb52c10`.
- `1.1.0-pilot`, corte **2026-11-13**: edição atual em `data/baseline/`, obtida depois de o novo ambiente responder com HTTP 200 à API. Datas de aquisição são reais e constam de `inputs/acquisition.json`. Cobertura, valores e anos efetivos: [relatório gerado](../data/baseline/REPORT.md).

O corte não torna os valores medições de 2026. Última observação não nula, ano original e revisão WDI são conservados individualmente. `lastupdated` é revisão do dataset, não data de publicação de cada observação. Uma aquisição posterior ao corte é rejeitada antes de contactar fontes ou criar ficheiros; não existe opção CLI para backdating. Uma futura recolha exige nova versão e arquivo da edição anterior, ou um conector histórico com proveniência verificável. Não basta mudar uma data para fazer os testes passar.

## Âmbito factual

Cinco IDs internos/ISO3/World Bank diretamente correspondentes: PRT, DEU, USA, BRA e MWI. Não foram atribuídos códigos a agregados, territórios disputados ou entidades históricas.

Oito séries WDI/source 2: população, urbanização, PIB corrente, PIB por habitante, receita fiscal/PIB, camas por mil habitantes, I&D/PIB e comércio/PIB. FMI/WEO, WGI, SIPRI, cartografia, índices militares e parâmetros derivados continuam fora do piloto. O metadado de país é recolhido apenas para documentar âmbito e comparabilidade, não como novo índice de gameplay.

A base é a camada `ObservedData`, com `integratedIntoGame:false`. O nome da camada não afirma que todos os valores são observações diretas: `obs_status` vazio permanece `unclassified`, sem ocultar as definições de estimativa publicadas pela fonte. A população, por exemplo, é explicitamente descrita como estimativa de meio do ano. Não houve imputação, interpolação, conversão de moeda, preenchimento a zero ou criação de prontidão fictícia. `fallback:null` significa ausência de fallback; zero publicado continua zero.

## Ficheiros

| Ficheiro | Função |
| --- | --- |
| `catalog.json`, `country-map.json` | Versão/corte, oito séries, unidades e dicionário de cinco países. |
| `license-review.json` | Revisão de direitos por série, condições e evidência congelada. |
| `inputs/acquisition.json` | URLs pedidas/finais, datas reais, HTTP/proxy, representações e hashes distintos de resposta/evidência. |
| `inputs/raw/` | Apenas payloads JSON dos dados/metadados WDI, preservados byte a byte. |
| `inputs/evidence/` | Registos mínimos JSON de termos/documentação, sem páginas HTML integrais. |
| `scenario-baseline-v1.json` | Valores originais, anos, unidades, origem, qualidade e licenças; sem consumo pelo motor. |
| `sources.json` | Metadados WDI completos por série, fornecedores, notas e contexto de cada país. |
| `coverage.json`, `coverage.csv`, `REPORT.md` | Cobertura, comparação de valores/anos e limitações. |
| `manifest.json` | SHA-256 de inputs/outputs, sem hash do próprio manifesto. |
| `ATTRIBUTION.md` | Atribuições e condições de utilização comercial. |

## Execução e testes

Node 20 ou superior, sem dependências npm novas. Só a aquisição usa `curl`, com proxy, CA e verificação TLS fornecidos pelo ambiente. Geração e validação são offline.

```bash
# Nova aquisição: nunca sobrescrever uma edição congelada sem criar outra versão.
node scripts/data/fetch-world-bank.cjs --out-dir /tmp/crisis-wdi-acquisition

# Reconstruir a edição atual a partir dos inputs congelados.
node scripts/data/normalize-baseline.cjs
node scripts/data/validate-baseline.cjs
npm test

# Duas gerações independentes com os mesmos inputs.
node scripts/data/normalize-baseline.cjs --out-dir /tmp/crisis-baseline-build-a
node scripts/data/normalize-baseline.cjs --out-dir /tmp/crisis-baseline-build-b
diff -r /tmp/crisis-baseline-build-a /tmp/crisis-baseline-build-b

# Revalidar a edição antiga sem alterar os seus ficheiros.
node scripts/data/validate-baseline.cjs --base-dir data/baseline/editions/1.0.0-pilot-2026-11-12
```

Os três CLIs aceitam `--base-dir` para selecionar os ficheiros de configuração e defaults de uma edição. Normalizador/validador aceitam `--input-dir` e `--out-dir`; aquisição aceita `--out-dir` e exige diretório novo ou `--replace` explícito. O fetch termina com código 2 se existirem pedidos bloqueados/falhados, 1 para erro de execução/configuração e 0 para respostas bem-sucedidas em todas as consultas. HTTP 200 não substitui validação do JSON, metadados e direitos.

A variante oficial de paginação `per_page=10000` é usada para metadados detalhados; o endpoint sem esse parâmetro devolveu corpo vazio em algumas séries durante a investigação. As respostas de observações são verificadas quanto a paginação completa, sem omitir páginas.

## Integridade, unidades e ausências

Validam-se ISO3, source 2, série, URLs, redirecionamento final dos termos, datas de calendário, corte, duplicados, números finitos, limites e coerência das unidades. Valores fora do intervalo não são corrigidos silenciosamente. Comércio e receita fiscal em % do PIB não recebem um teto genérico de 100%; urbanização/I&D seguem o catálogo. Unidades vazias da API ficam registadas como tal; a unidade canónica vem do dicionário fixo da série. Uma unidade reportada contraditória bloqueia a geração.

Os valores conservam a precisão JSON/IEEE-754, com os bytes originais dos payloads estatísticos disponíveis para auditoria. Checksum de `raw-bytes` refere esses bytes exatos; `canonical-json` refere chaves ordenadas, indentação de dois espaços e LF final. `minimal-web-evidence-json` identifica um registo derivado de citação, não uma cópia da resposta HTML. Builds não acrescentam timestamps variáveis. Caminhos e symlinks que escapem aos inputs são rejeitados.

`network_access_denied`, `source_request_failed`, `license_not_cleared`, `source_revision_after_freeze` e `no_non_null_observation` são situações distintas. Nenhuma representa zero. O arquivo de 12/11 continua a descrever CONNECT 403 corretamente: recusa do proxy antes de resposta da origem, não ausência de dados WDI. A nova edição não apaga essa evidência.

## Termos e utilização comercial

A revisão confirmou que o URL antigo de termos redirecionava para condições gerais. A fonte correta é [World Bank Dataset Terms](https://www.worldbank.org/ext/en/legal/terms-conditions/datasets), cuja secção específica prevalece em caso de conflito. As oito séries declaram individualmente `License_Type: CC BY-4.0`; o registo conserva também `License_URL`, fornecedores e limitações/exceções. Não foram encontradas restrições específicas de reutilização nas respostas destas séries e cinco países. Isto não licencia automaticamente outros dados IMF, OECD, WHO, UNESCO ou UN.

O gate moderno exige evidência congelada de **termos específicos + metadados de identificação + declaração explícita da licença da própria série**, revisão de exceções, atribuição e data posterior à obtenção da fonte. A referência aos termos identifica um membro exato dos excertos validados, o hash do registo JSON e o hash da resposta de origem. Não basta procurar uma frase em qualquer campo do JSON. A revisão é técnica e rastreável, não um parecer jurídico.

Uso comercial deve cumprir CC BY 4.0 e condições adicionais WB: atribuição ao Banco Mundial e fornecedores, ligação à licença/termos, indicação das transformações, ausência de endosso e mediação/arbitragem previstas nos termos. As condições concretas e atribuições estão em [ATTRIBUTION.md](../data/baseline/ATTRIBUTION.md). Páginas externas de Data Catalog/Creative Commons não puderam ser obtidas neste ambiente; não se inventou o seu conteúdo. A evidência utilizada é a declaração por série e a concessão direta na página específica do Banco Mundial.

Não foi encontrada autorização específica clara para redistribuir os documentos HTML completos. A sua publicação no repositório público já seria redistribuição, mesmo fora do jogo. Os dois ficheiros integrais foram retirados do estado atual da branch e substituídos por `inputs/evidence/terms.json` e `documentation.json`. O conector agora processa os corpos web em memória e só persiste os registos mínimos; não existe fallback para HTML integral.

Os registos conservam URL pedido/final, identificação/título, datas reais da consulta, MIME, tamanho e SHA-256 da resposta omitida, método/data de preparação e hashes dos excertos. Termos: seis citações estritamente necessárias, 428 caracteres no total; documentação: nenhum excerto do corpo. Os excertos são curtos, verbatim, sem markup, pertencem a uma lista delimitada e tiveram a posição em bytes confirmada contra a resposta original durante a preparação. Não se afirma que a licença dos datasets se estenda a essas citações, títulos ou assets; a seleção mínima não é uma licença geral do website.

`sha256` da consulta passa a identificar o JSON efetivamente congelado; `responseSha256` e `responseBytes` identificam a resposta original omitida. A alteração de representação foi registada sem alterar datas da aquisição, valores estatísticos ou a aprovação original das séries. `license-review.json.evidenceRevision` identifica a data real desta preparação posterior. Os hashes de `scenario-baseline-v1.json`, dos 27 inputs API JSON e a cobertura 40/40 permanecem iguais.

**Limite de verificação:** a reconstrução offline comprova a integridade dos registos e excertos publicados e volta a gerar os mesmos dados. Sem os bytes HTML originais, não consegue reproduzir a resposta nem demonstrar independentemente que uma citação lhe pertencia. Um hash identifica bytes quando estes estão disponíveis; não os reconstrói, autentica a origem ou substitui uma assinatura. A revisão liga a captura anterior, a citação e a origem; uma consulta externa posterior pode encontrar outra versão.

**Histórico público:** remover ficheiros no novo commit não os retira dos commits já publicados (`1fda037`), clones ou caches. Não se fez force-push, reescrita de histórico ou pedido de remoção ao fornecedor GitHub. Uma limpeza histórica, se exigida, precisa de autorização/coordenação própria e não garante eliminar cópias externas. Esta limitação é comunicada no PR.

O jogo permanece sem referências à baseline e sem chamadas de rede. Também não é concedida aqui uma nova licença comercial ao código do repositório.

Antes de distribuir comercialmente uma edição, rever atribuições, cláusulas e fronteira entre payloads licenciados e evidência de desenvolvimento. Não alterar números factuais para balanceamento: integrações e capacidades derivadas pertencem a uma tarefa D3 posterior.
