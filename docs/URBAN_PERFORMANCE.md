# Prova urbana — medições e validação

## Resultado executado

Esta é uma medição preliminar do executor Linux cloud, **não uma certificação de 60 FPS num PC com GPU**. Foram concluídas 27 medições: P1/P2/P3 × DPR 1/1,5/2 × três repetições, mais três verificações funcionais de browser. A máquina observada usa Chromium 156.0.8078.79 com ANGLE/Vulkan **SwiftShader por software**.

Viewport de 1440×900 CSS pixels; seed 16927. Cada caso em contexto novo: duas ordens iniciais de perímetro, 300 ticks (30 s lógicos), 3 s de aquecimento e 10 s de captura solicitada. Duração real de captura e amostras estão no JSON. Esses 30 s lógicos de preparação não são aquecimento de hardware. O protocolo de referência proposto (30 s de aquecimento + 120 s de captura, três repetições, desktop representativo) **não foi executado**.

CPU visível: INTEL(R) XEON(R) PLATINUM 8573C. CPUs lógicos visíveis: 5; cgroup CPU: 400000 100000. RAM/cgroup e contexto constam do [JSON bruto](urban-benchmark.json); estes valores não são uma reserva de recursos nem especificação de desktop. O checkout estava ainda em desenvolvimento; os hashes por ficheiro no relatório identificam o código medido e foram conferidos contra o bundle final.

## Matriz observada

FPS abaixo = mediana dos três FPS sustentados por RAF. Percentis de frame e lógica usam as amostras agrupadas e método nearest-rank. N é o número de intervalos de frame efetivamente observado; não se ocultam amostras pequenas.

| Perfil | DPR | FPS | Frame p50 / p95 / p99 (ms) | CPU lógica p95 (ms/tick) | N frames |
| --- | ---: | ---: | --- | ---: | ---: |
| P1 | 1 | 10.23 | 100.0 / 116.7 / 133.3 | 0.10 | 307 |
| P1 | 1.5 | 7.75 | 116.7 / 200.0 / 300.0 | 0.20 | 239 |
| P1 | 2 | 6.68 | 133.4 / 183.4 / 316.6 | 0.10 | 207 |
| P2 | 1 | 4.71 | 216.6 / 233.3 / 249.9 | 0.10 | 144 |
| P2 | 1.5 | 4.23 | 233.3 / 283.3 / 366.7 | 0.10 | 129 |
| P2 | 2 | 3.83 | 266.6 / 349.9 / 400.0 | 0.10 | 113 |
| P3 | 1 | 1.84 | 416.7 / 850.0 / 1516.6 | 0.10 | 62 |
| P3 | 1.5 | 2.27 | 433.3 / 500.0 / 900.0 | 0.10 | 68 |
| P3 | 2 | 2.08 | 483.3 / 816.7 / 1049.9 | 0.10 | 58 |

## Cargas e interpretação

P1: 2.000 edifícios/2.000 marcadores; P2: 5.000/5.000; P3: 10.000/10.000. Todos mantêm **duas equipas, seis grupos civis e doze hordas**, com contagens de pessoas conservadas. Os marcadores são amostragem cosmética, não agentes individuais. Contagens de grupos ativos, pessoas, barreiras e tick inicial/final estão em cada caso.

Foram observadas 23 draw calls nos casos medidos. O total de instâncias é conhecido; visibilidade/oclusão individual dos edifícios não foi contabilizada. O custo de submissão CPU do renderer é separado de intervalos RAF e CPU de lógica, sem os somar como durações sequenciais de GPU.

Heap V8 observado após capturas: 5.30–6.21 MiB. Isto não mede o pico de memória, todo o processo, RAM da GPU ou um ensaio prolongado de fugas. A extensão de timestamp da GPU não estava disponível e o tempo de GPU é **null, não zero**.

Percentis de lógica com 0 ms estão abaixo da resolução do temporizador; não significam ausência de trabalho. O P3 tem poucas amostras e variação elevada, por isso os seus percentis de cauda são preliminares. As diferenças de DPR não constituem uma ordenação universal de desempenho.

As medições apontam para limitações fortes no contexto gráfico por software, com lógica agregada pequena. Sem tempos GPU e sem hardware representativo, não se afirma um diagnóstico exclusivo de gargalo nem que Three.js foi aprovado/reprovado para o produto final. Não se afirma experiência fluida de 60 FPS neste executor.

## Interação e lógica validadas

- DPR 1/1,5/2: seleção no Canvas antes/depois de zoom e redimensionamento; cartões de equipa; cinco ordens e clique direito para mover; câmara sem alteração do estado canónico; execução com rede desligada após carregar.
- A renderização dos perfis não altera ordens, população ou recursos. Há snapshots antes/depois, samples brutos, latência observada de seleção e CPU de callbacks por caso. A latência Playwright inclui protocolo/espera do browser e não é uma medição de ponta a ponta de um dispositivo humano.
- Seed 16927: ficar na base falha no tick 421 (42,1 s), zero evacuados e 32 novas mortes; perímetros nos dois acessos cumprem o objetivo no tick 1875 (187,5 s), 120 evacuados, zero novas mortes, 158 neutralizações e dois materiais gastos.
- Os 11 testes urbanos de Node cobrem comandos inválidos/idempotentes, rotas e edifícios, consumo finito, rutura de barreira uma vez, escolta, conservação a cada tick, reinício, determinismo e distribuição de exatamente os mesmos ticks entre 10/30/60/144 FPS. Não são testes de milhares de IAs individuais.
- O HTML autónomo dentro do ZIP foi também aberto no Chromium: somente uma requisição HTTP (o próprio HTML), rede desligada, hordas ativas aos 25 s, ordens, sucesso com 120 evacuações e reinício, sem erros JavaScript.

## O que falta medir e recomendações

Não foram executados: protocolo longo de referência; GPU física/desktop médio e inferior acordados; medição de tempo GPU; perfis 20/50/100 equipas; 0/500/2.000/todos agentes individuais; mundo em background; picos/leaks de memória prolongados; cache de SO/shader rigorosamente frio; várias cidades e hardware mobile. Não se misturaram unidades cosméticas adicionais para aparentar essas cargas.

Recomendação: manter WebGL 2 como candidato e a lógica separada; medir P2 no hardware alvo antes de fechar a plataforma; testar resolução interna/LOD, custos de marcadores e uploads e orçamento de cenas, sem alterar regras para melhorar FPS. Workers só com comparação de custos de serialização e benefício demonstrado. O spike cumpre a experiência funcional pequena, não o gate de desempenho definitivo.

## Reproduzir

Ver [instruções e versões](../urban-spike/README.md). Executar o servidor estático na raiz e o script abaixo com Playwright 1.62.1 e Chromium instalados:

```bash
node scripts/benchmark-urban.cjs --url http://127.0.0.1:8000/urban-spike/ --output /tmp/urban-benchmark.json --warmup-ms 3000 --capture-ms 10000 --repeats 3
```

O JSON preserva as opções efetivas, sistema/browser, nomes e hashes dos ficheiros, amostras de frames/lógica/submissão, estados, memória, erros e limites do protocolo. Não se devem comparar execuções com carga/seed/timing/hardware distintos sem identificar essas diferenças.
