# Urban Living City V0.2 — validação da primeira versão jogável

Entrega incremental da [Issue #10](https://github.com/UnnTIL/Crisis-vector/issues/10), em [draft PR #11](https://github.com/UnnTIL/Crisis-vector/pull/11): `feat/urban-living-city-v02` → `spike/urban-webgl`. Base explícita: PR #9, sem merge automático. Alpha mundial, baseline e protótipo V0.1 preservados byte a byte nos caminhos existentes.

## Código e contratos entregues

- LC-0: duas redes físicas conectadas, oito quarteirões, 32 edifícios com entradas, 150 residentes e 14 profissionais, rotinas e localizações únicas.
- LC-1: observação, chamadas com atraso, triagem, prioridade, atribuição finita, percurso viário, aproximação a pé, recolha, transporte, entrega hospitalar, alta e regresso da tripulação.
- LC-2: S1/S2 partem de um residente existente; exposição acumulada por duração/distância, sintomas, morte e reanimação conservam identidade. Contactos sintomáticos vivos e reanimados podem transmitir; infeção oculta não é conhecimento dos serviços.
- LC-3: agentes individuais, viaturas, patrulhas, despacho autónomo, observação, alcance/linha de visão, segurança de terceiros, tiros em movimento, munições, retirada e reforço com recursos existentes.
- LC-4: seleção/seguimento, índice de entidades incluindo interiores, diário e filtros, informação conhecida/debug, pausa/velocidades/seed, flashes/traços/impactos e áudio original opcional baseado em eventos.

[Regras efetivas e parâmetros](LIVING_CITY_RULES.md) · [matriz de aceitação](LIVING_CITY_ACCEPTANCE.md) · [instruções de jogo/build](../living-city/README.md).

## Testes executados

`npm test` em Node 24.22.1: **75/75 passaram**, sem falhas, skips ou cancelamentos. São 47 regressões existentes e 28 testes novos da cidade viva. A CI utiliza Node 20; o estado do commit final e os links das execuções são registados no PR.

Os testes novos cobrem conectividade/portais e obstáculos, censo e pessoal finito, rotinas entre quarteirões, snapshots e ticks inválidos, ciclo médico físico, concorrência por uma ambulância, deduplicação/idempotência, prioridade manual e escalada, hospital lotado/sem profissionais, entrega concorrente, alta que liberta uma cama e retoma o serviço, avaria/via bloqueada, transformação em transporte, identidade e exposição temporal/oclusão, polícia ocupada, reconhecimento individual, tiro durante movimento, exclusão de infetado não hostil, segurança de terceiros, munições/reforço e replay determinístico com diferentes partições de tempo.

As correções verificadas durante revisão incluem: triagem antes do despacho policial; observação real em vez de conhecimento oculto; tripulação incapacitada obriga a paragem/desembarque; ocorrência já encerrada não reabre por emergência posterior da tripulação; cama livre não substitui profissional disponível; relatórios repetidos não anulam a prioridade manual.

## Nove cenários autónomos

`node scripts/report-living-city.cjs` executou seeds **16927/42/2026 × S0/S1/S2**, cada uma por **600 segundos simulados**, sem ordens do jogador: **54 000 verificações de invariantes por tick**, todas aprovadas. Fontes identificadas por hashes dos nove módulos. [JSON integral](living-city-report.json).

| Cenário | Seed | Primeiro caso / residente | Vivos | Infetados vivos | Mortos humanos | Reanimados ativos | Neutralizados | Admissões acumuladas | Tiros |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| S0 | 16927 | resident-128 | 164 | 0 | 0 | 0 | 0 | 3 | 0 |
| S0 | 42 | resident-043 | 164 | 0 | 0 | 0 | 0 | 3 | 0 |
| S0 | 2026 | resident-077 | 164 | 0 | 0 | 0 | 0 | 3 | 0 |
| S1 | 16927 | resident-128 | 70 | 69 | 94 | 72 | 17 | 4 | 38 |
| S1 | 42 | resident-043 | 12 | 12 | 152 | 125 | 26 | 2 | 60 |
| S1 | 2026 | resident-077 | 149 | 0 | 15 | 0 | 15 | 2 | 37 |
| S2 | 16927 | resident-128 | 33 | 33 | 131 | 118 | 11 | 2 | 30 |
| S2 | 42 | resident-043 | 28 | 27 | 136 | 131 | 3 | 4 | 7 |
| S2 | 2026 | resident-077 | 145 | 9 | 19 | 3 | 16 | 2 | 43 |

As 164 identidades mantêm-se em todas as execuções. Mortos humanos incluem cadáveres ainda não reanimados; neutralizar não acrescenta outro óbito. Admissões são eventos acumulados, não ocupação simultânea; camas, profissionais e transporte mantêm invariantes.

S0 completou três chamadas, admissões e altas por seed, sem infeções zombie, mortes ou tiros, mantendo rotinas e meios disponíveis no fim. Na seed 16927, a primeira admissão ocorre aos **89,5 segundos simulados**. S1 permite acompanhar sintomas, chamada e hospitalização antes da transformação. S2 comprime morte/reanimação da mesma pessoa aos 30/32 segundos.

Os surtos mostram forte dependência da posição/seed, exposição clínica e perda de recursos. **O equilíbrio não está validado**: podem colapsar os serviços. Não existe ainda proteção clínica, cura do patogénio, reforço externo ou estratégia nacional. Estes resultados são mecânicas ficcionais, não previsões epidemiológicas.

## Browser e efeitos

Chromium **156.0.8078.79** / Playwright **1.62.1**: três verificações funcionais em **DPR 1/1,5/2**, cada uma com S0/S1/S2 até 600 segundos lógicos por avanço da API. Isto não é uma sessão humana de dez minutos em tempo real.

Foram validados seleção/lista/seguimento, seleção por Canvas antes/depois de redimensionamento, pan/zoom, modos/debug, reset, execução sem rede após carregar e igualdade integral do estado antes/depois de alterações de apresentação. Os contadores finais coincidiram entre DPR nas mesmas condições da seed 16927.

Um `ShotFired` verdadeiro foi reproduzido em cada DPR: consumo de uma munição por atirador, efeito visual e Web Audio em estado `running` (duas vozes reproduzidas nessa passagem). Reconsumir o mesmo evento não reproduziu som nem alterou o snapshot. Mute, volume e redução de efeitos foram exercitados. A geração de áudio foi verificada no browser; não foi realizado ensaio de audição em altifalantes de um PC físico.

As verificações funcionais e medições usam o mesmo bundle, comprovado por SHA-256. O JSON de desempenho incorpora os smokes por hash de origem, sem voltar a executá-los durante a captura. [Evidência de browser](living-city-browser.json) · [smokes originais com hash verificável](living-city-smoke.json).

## Desempenho medido

Medição preliminar cloud com **ANGLE/Vulkan SwiftShader por software**, não GPU física. Viewport 1440×900; três cenários × três DPR, **uma captura por combinação**, 2 s de aquecimento e 10 s de captura solicitada, em contextos novos. Preparação lógica: S0 25 s, S1 50 s, S2 33 s, seguida de execução autónoma. Não são repetições do protocolo longo de referência.

FPS = intervalos RAF observados / duração real; percentis nearest-rank. Lógica e submissão CPU do renderer são medidas separadamente; não representam tempo GPU nem devem ser somadas como durações sequenciais.

| Cenário | DPR | FPS | Frame p50 / p95 / p99 (ms) | Lógica p95 / p99 (ms/tick) | N frames |
| --- | ---: | ---: | --- | --- | ---: |
| S0 | 1 | 27.08 | 33.3 / 33.5 / 133.4 | 1.20 / 107.20 | 271 |
| S0 | 1.5 | 28.10 | 33.3 / 50.0 / 50.1 | 0.70 / 1.00 | 281 |
| S0 | 2 | 17.78 | 50.0 / 66.7 / 166.7 | 0.80 / 1.00 | 178 |
| S1 | 1 | 37.76 | 33.3 / 33.4 / 50.0 | 0.90 / 1.90 | 379 |
| S1 | 1.5 | 27.56 | 33.3 / 50.0 / 50.1 | 0.80 / 1.00 | 276 |
| S1 | 2 | 17.85 | 50.0 / 66.7 / 83.3 | 1.40 / 4.30 | 179 |
| S2 | 1 | 38.12 | 33.3 / 33.4 / 33.5 | 1.00 / 1.50 | 382 |
| S2 | 1.5 | 27.95 | 33.3 / 50.0 / 50.1 | 1.70 / 2.30 | 280 |
| S2 | 2 | 18.93 | 50.0 / 66.7 / 83.3 | 1.90 / 2.90 | 190 |

As nove capturas acima cobrem fases iniciais e não continham disparos. Foram por isso acrescentadas **três capturas de S2 durante o primeiro confronto**, uma por DPR, no mesmo bundle: preparação de 470 ticks (47 s), aquecimento de 2 s e captura de 10 s, com áudio ativado por clique. Em cada caso foram registados dois eventos de tiro apresentados e dois sons reproduzidos.

| Carga | DPR | FPS | Frame p50 / p95 / p99 (ms) | Lógica p95 / p99 (ms/tick) | Tiros visuais / sons |
| --- | ---: | ---: | --- | --- | ---: |
| S2 com disparos/som | 1 | 35.52 | 33.3 / 33.4 / 66.7 | 1.80 / 4.40 | 2 / 2 |
| S2 com disparos/som | 1.5 | 22.37 | 33.4 / 66.7 / 166.7 | 2.80 / 4.00 | 2 / 2 |
| S2 com disparos/som | 2 | 14.09 | 66.6 / 100.1 / 150.1 | 2.80 / 7.00 | 2 / 2 |

[JSON das três capturas de confronto](living-city-combat-browser.json). São **12 capturas curtas no total**, sem repetições por combinação. Estas usam outro momento lógico; as diferenças não isolam o custo do áudio/efeitos como num ensaio A/B. A carga tardia de centenas de ocorrências/reanimados não foi perfilada graficamente.

As cargas mantêm 164 pessoas lógicas e cinco viaturas, com 32 edifícios; apenas pessoas efetivamente na rua são desenhadas individualmente. Pessoas no interior/veículo permanecem no censo. Foram observadas 18 draw calls no último frame das capturas iniciais; isto não mede o pico das chamadas temporárias de efeitos. Não há milhares de pontos cosméticos equivalentes a milhares de agentes.

Heap JS observado após capturas: **8.13–10.63 MiB**; não é pico do processo ou memória GPU. A extensão de timestamps GPU não estava disponível: `gpuMs=null`, não zero. O p99 de lógica de S0/DPR1 teve um pico de 107,2 ms; não é ocultado pela média ou pelo p95 baixo. Diferenças pontuais de DPR não provam uma ordenação universal.

A matriz Node sem desenho mediu p95 de passos síncronos entre 0,257 e 8,206 ms, com heap do processo amostrado entre cerca de 18 e 56 MiB. O tempo total/CPU do runner inclui verificações e instrumentação; não equivale ao custo isolado do motor nem ao heap de uma partida no browser.

**Não foi certificada a meta de 60 FPS.** Faltam GPU física/hardware alvo, protocolo prolongado/repetições, memória prolongada, tempos GPU, trânsito completo e avaliação de utilização humana. Cargas da V0.1 e V0.2 são diferentes e não permitem declarar um ganho direto de desempenho.

## Pacote e acesso efetivamente verificados

O ZIP publicado foi descarregado do GitHub: **HTTP 200, 396 828 bytes**, SHA-256 `b98c1f5346d80d65e0047ebfc365e97ae397f5a4e947b86dae536201ecda985b`. O download coincide byte a byte com o artefacto local e duas reconstruções independentes produziram o mesmo arquivo.

O próprio ZIP obtido do GitHub foi extraído e aberto no Chromium através de servidor estático. S0/S1 completaram admissão da mesma pessoa; S2 produziu disparos; seleção/seguimento e disposição mobile foram verificados. O HTML realizou **uma única requisição HTTP** e continuou a funcionar com rede desligada; sem erros JavaScript. [Relatório do pacote](living-city-package-check.json) · [captura desktop](living-city-package-desktop.png) · [captura mobile](living-city-package-mobile.png).

A tentativa direta por `file://` foi bloqueada antes da execução por `ERR_BLOCKED_BY_ADMINISTRATOR`. A via comprovada é extrair e executar `python3 -m http.server 8000` (Windows: `py -m http.server 8000`), abrindo a pasta `/living-city/` no browser local.

O domínio `unntil.github.io` está bloqueado pela política de saída deste executor. Não foi fornecido um URL da nova preview como funcional sem verificação; o ZIP é a alternativa autorizada e comprovada. A preview V0.1 não foi substituída nesta entrega.

## Limitações e próxima integração

Interiores, deteção, triagem e uso da força são aproximações de jogo; não há quartos, tráfego civil completo, proteção clínica, investigação médica ou doutrina operacional real. Não existe evacuação espontânea coletiva, relações familiares ou comportamento social profundo. O mapa é sintético e a população é um pequeno conjunto representativo, não uma densidade factual.

A próxima iteração deverá calibrar exposição/tempos e capacidade, melhorar comportamento civil/legibilidade e medir no PC alvo. A integração futura deve adaptar IDs, relógio, pessoas, pessoal e recursos ao estado canónico da campanha e aplicar os eventos/resultados uma única vez. Economia, A1b, safe zones e campanha continuam fora da V0.2.
