# BASELINE DATA V1 — piloto D0–D2

Implementação isolada da [Issue #7](https://github.com/UnnTIL/Crisis-vector/issues/7), com base na autorização D0–D2 de 2026-11-12. Foram lidos integralmente `docs/product/BASELINE_DATA_V1.md` e `MASTER_ROADMAP_V2.md` na branch `docs/product-vision-v1`, commit `7a35654b3803aaf440d58efab96eac8d7ff82ad4`. A branch de implementação parte da `main` (`6efd5b3`), sem integrar os PRs #1/#5. Motor, interface e `data/world-data.js` da Alpha 0.1 permanecem intactos.

**Estado desta edição: entrega parcial, recolha e revisão comercial bloqueadas.** O proxy do ambiente recusou `api.worldbank.org`, `www.worldbank.org` e `datahelpdesk.worldbank.org` com `CONNECT 403`, antes de qualquer resposta da origem. O pacote tem 40 células explícitas, **zero valores factuais recolhidos ou licenciados**, e não é uma baseline real pronta para campanha. Ver [relatório gerado](../data/baseline/REPORT.md).

## Âmbito e ficheiros

Os cinco países são PRT, DEU, USA, BRA e MWI. O dicionário verifica correspondência direta com os IDs da Alpha; não inventa ISO3 para agregados, territórios ou entidades disputadas. A expansão mundial exige outro trabalho de mapeamento.

As oito séries WDI/source 2 são população, urbanização, PIB corrente, PIB por habitante, receita fiscal/PIB, camas por mil habitantes, I&D/PIB e comércio/PIB. FMI/WEO, WGI, SIPRI, cartografia e capacidades derivadas ficam excluídos. Não há rankings de prontidão, valores de gameplay, integração, campanha de 60/120 dias nem alterações às regras do jogo; estes pertencem a D3–D4.

| Ficheiro | Função |
| --- | --- |
| `data/baseline/catalog.json` | Oito séries, unidades esperadas, limites, versão e corte. |
| `data/baseline/country-map.json` | IDs internos, ISO3, IDs de origem e exclusões. |
| `data/baseline/license-review.json` | Revisão e autorização comercial por série; atualmente pendentes. |
| `data/baseline/inputs/acquisition.json` | Consultas planeadas, tentativas reais, falhas e referências para recusas de host. |
| `data/baseline/inputs/raw/` | Bytes exatos de respostas futuras; ignorados pelo Git até à revisão dos direitos. |
| `data/baseline/scenario-baseline-v1.json` | Camada `ObservedData`, separada e sem consumo pelo jogo. |
| `data/baseline/sources.json` | Metadados, termos, URLs e versões, ou ausência explícita. |
| `coverage.json`, `coverage.csv`, `REPORT.md` | Matriz país × série × ano × valor × unidade × qualidade, cobertura e limitações. |
| `manifest.json` | Checksums de entradas e saídas; não inclui o próprio hash. |

## Execução

Requer Node 20 ou superior. A geração e validação offline usam apenas a biblioteca padrão. A recolha usa também `curl`, para respeitar as variáveis de proxy e CA fornecidas pelo ambiente; TLS e verificações de certificados permanecem ativos. Não há `npm install`, dependência nova ou configuração do runtime do jogo.

A partir da raiz do checkout:

```bash
# Apenas build-time; não é necessário para gerar de novo a edição congelada.
node scripts/data/fetch-world-bank.cjs --out-dir /tmp/crisis-wdi-acquisition

# Reproduzir e verificar o pacote já congelado, sem rede.
node scripts/data/normalize-baseline.cjs
node scripts/data/validate-baseline.cjs
npm test

# Duas gerações independentes, usando exatamente os mesmos inputs.
node scripts/data/normalize-baseline.cjs --out-dir /tmp/crisis-baseline-build-a
node scripts/data/normalize-baseline.cjs --out-dir /tmp/crisis-baseline-build-b
diff -r /tmp/crisis-baseline-build-a /tmp/crisis-baseline-build-b
```

O fetch termina com código **2** quando regista aquisição bloqueada/incompleta, **1** para erros de execução/configuração e **0** apenas para respostas HTTP 200 em todas as consultas. A presença de respostas não prova que valores, versões ou licenças tenham passado a normalização. Não converter código 2 num alegado sucesso da recolha. O manifesto guarda `proxyStatus:403` separado de `httpStatus:null`; o Banco Mundial não respondeu com um erro estatístico. Depois da primeira recusa explícita, as consultas do mesmo host ficam `attempted:false`, com datas nulas e referência ao pedido que recebeu a recusa.

O conector recusa sobrescrever uma aquisição existente; usar um diretório novo ou `--replace` explicitamente. Nunca substituir um input congelado para fazer testes passar. A normalização aceita `--input-dir DIR` e `--out-dir DIR`; a validação aceita os mesmos argumentos para comparar ficheiros com uma reconstrução completa.

## Corte, origem e qualidade

O corte é **2026-11-12**, não o ano comum dos dados. São pedidos os anos 1960–2026, sempre com `source=2`, e selecionado para cada país/série o último número não nulo com ano até ao corte. Valores de 2027 ou posteriores são excluídos; não há interpolação, medianas, extrapolação, preenchimento a zero ou fallback sintético. `fallback:null` significa que nenhum fallback foi aplicado. Zero publicado é mantido como zero. Se só existirem nulos, o motivo é `no_non_null_observation`; isso é diferente de uma falha de rede ou de licença.

Não há opção CLI para falsificar a data de obtenção. Aquisições posteriores ao corte são rejeitadas pela normalização. Uma nova recolha após essa data exige nova edição/data de corte/versionamento, ou um arquivo histórico verificável e um conector próprio; uma API atual não prova que uma revisão era conhecida no passado. `lastupdated` identifica a revisão do dataset, não a data de publicação ou observação individual. Uma revisão posterior ao corte não é distribuída nesta edição. `publishedAt` permanece nulo quando não fornecido.

Cada valor conserva ano, unidade canónica, unidade reportada quando disponível, valor original, URL, data real de obtenção, revisão, checksum do payload e transformação `identity_latest_non_null_at_cutoff/v1`. As unidades canónicas vêm do dicionário fixo de séries; metadados com unidade vazia não são confundidos com uma unidade medida adicional. Uma unidade reportada contraditória/desconhecida bloqueia a normalização e exige revisão. Não há conversão de moeda ou deflatores. Números seguem a precisão IEEE-754 do JSON/JavaScript; os bytes originais conservam a representação publicada.

Uma publicação WDI pode conter observações, estimativas, projeções ou imputações. Códigos `obs_status` não interpretados ficam `quality.classification:unclassified`, preservando o código original; não se presume que o valor seja uma medição observada. Não existe inferência de qualidade a partir do país, magnitude ou nome da série. Dados sintéticos só existem nas fixtures identificadas dos testes, nunca na baseline factual.

Validam-se schema, ISO3, série/source, URLs, paginação completa, anos/datas de calendário, duplicados, números finitos e limites de unidades. Comércio e receita fiscal em % do PIB não recebem um teto genérico de 100%; urbanização e I&D têm os limites definidos no catálogo. Uma anomalia não é silenciosamente corrigida. PIB corrente não é dinheiro público disponível; camas não medem pessoal, vagas ou capacidade operacional; comércio não representa rotas físicas.

## Congelamento, hashes e distribuição

Respostas bem-sucedidas são guardadas byte a byte, com SHA-256. O manifesto distingue `raw-bytes` de `canonical-json`: o segundo representa JSON com chaves ordenadas, duas casas de indentação e LF final, não os espaços de apresentação do ficheiro original. Datas de execução da geração não entram nos outputs. Os outputs são sempre reconstruídos a partir dos mesmos inputs e comparados, em vez de confiar apenas num hash editável. Caminhos de inputs que escapem ao diretório, incluindo symlinks, são rejeitados.

Payloads novos ficam em quarentena no diretório `raw/`, ignorado pelo Git. **Não fazer commit de dados brutos ou derivados antes de confirmar direitos aplicáveis a cada série/ficheiro e aos cinco países.** Após revisão, os inputs permitidos necessários à reprodução devem ser adicionados intencionalmente ao pacote congelado; ficheiros não redistribuíveis devem ficar fora e a sua cobertura permanecer indisponível. Repetibilidade com payloads apenas locais não equivale a reprodução por terceiros.

Não se presume que qualquer série WDI/agregada seja CC BY: podem existir fontes originais e exceções de terceiros. `license-review.json` só permite incorporar valores com `status:verified`, licença identificada, `commercialUse:allowed`, revisão de exceções, atribuição, data e evidência congelada dos termos **e dos metadados da série correspondente**. Um excerto de outra série não autoriza a atual; pagamentos/licenças restritos não são contornados. Esse registo é uma revisão humana rastreável, não um parecer jurídico automático. Atualmente as oito entradas estão `pending_review/not_cleared`, sem valores incorporados.

Para eventual uso comercial, verificar atribuição exigida, licença exata, restrições por fonte/país/ficheiro, direito a transformações e redistribuição offline e quaisquer termos de terceiros. A ausência de acesso aos termos não constitui autorização. A licença do código do projeto também não é conferida pela licença dos dados; o repositório não contém aqui uma concessão nova de licença comercial do código.

## Bloqueios e próxima ação

A política de rede em execução recusou os três hosts do Banco Mundial. Foi guardado no rascunho o conjunto restrito `api.worldbank.org`, `www.worldbank.org`, `datahelpdesk.worldbank.org` e `api.github.com`, preservando a entrada GitHub já existente. O guardado não aplicou a política nem publicou o ambiente. Para retomar recolha/revisão e abrir o draft PR, é necessário aplicar as alterações nas definições; o produto também assinala publicação pendente da configuração.

Depois de confirmar novo acesso, executar uma aquisição nova com datas reais, rever os termos por série, congelar apenas inputs permitidos e voltar a gerar/testar. **D0–D2 não é declarado concluído com dados reais enquanto estes bloqueios persistirem.** Não existe uma comparação quantitativa defensável entre os países nesta edição; o relatório comparativo é de cobertura, proveniência e limitações.
