# CRISIS VECTOR — Living City V0.2.1

Correções da [Issue #12](https://github.com/UnnTIL/Crisis-vector/issues/12), no [draft PR #15](https://github.com/UnnTIL/Crisis-vector/pull/15): `feat/living-city-v021-ux` → `feat/urban-living-city-v02`. A base é o PR #11; os sistemas médicos e policiais continuam autónomos e as identidades mantêm um estado canónico. Esta iteração não inclui o Laboratório V0.2.2 nem o aprofundamento de infeção/hospital V0.2.3.

## Jogar

[Descarregar o ZIP V0.2.1](https://github.com/UnnTIL/Crisis-vector/raw/refs/heads/feat/living-city-v021-ux/artifacts/living-city-v021/crisis-vector-living-city-v021.zip) · [Checksums](../artifacts/living-city-v021/SHA256SUMS.txt)

Extrair e executar na pasta que contém `living-city/`:

```bash
python3 -m http.server 8000
```

No Windows: `py -m http.server 8000`. Abrir `http://127.0.0.1:8000/living-city/`. O mesmo comando funciona na raiz do checkout sem instalar dependências, pois o bundle está incluído. O pacote contém um HTML autónomo, Three.js e os estilos locais, além das demos mundial e tática anteriores.

A cidade funciona sem ordens. S0 mantém rotinas e ocorrências médicas normais; S1 inicia doença progressiva num residente existente; S2 transforma rapidamente uma pessoa da mesma população. Mudar cenário/reiniciar coloca em pausa; usar **Iniciar** para continuar. Selecionar no mapa ou pesquisar pessoas, viaturas, instalações e ocorrências; **Seguir** acompanha a entidade e explica se está no interior.

| Controlo | Ação |
| --- | --- |
| Clique | Selecionar uma entidade |
| Arrastar / roda | Pan / zoom |
| Q / E | Rodar 15° em torno do alvo observado |
| R | Recentrar, terminar seguimento e repor orientação/zoom iniciais |
| Espaço | Pausa / retoma |
| +0,1 s em pausa | Executar exatamente um tick lógico |
| Som / volume / reduzir efeitos | Apresentação opcional, sem alterar resultados |

Q/E/R são ignorados durante escrita em campos de texto, seleção, conteúdo editável e combinações com modificadores. A volta completa tem 24 passos; rotação, seleção e seguimento não alteram a simulação.

## Escala temporal e fluidez

| Controlo atual | Segundos simulados por segundo real |
| --- | ---: |
| 1× | 2 |
| 2× | 4 |
| 4× | 8 |

**O novo 1× equivale ao antigo 2×.** O tick canónico continua a ter 100 ms simulados; a velocidade só determina quantos ticks são pedidos por tempo real. O botão de passo único avança sempre 0,1 s simulados, independentemente do multiplicador selecionado.

O desenho interpola posições visuais imutáveis do tick anterior e atual. Esta interpolação é independente da mudança de ritmo; não altera colisões, tiros, saúde, chegadas, população ou PRNG. Introduz até um tick de atraso visual normal. Pausar, reiniciar, avançar em bloco ou mudar de localização remove a interpolação pendente; não há deslocação fantasma em pausa. Passageiros, seguimento e picking usam a mesma posição desenhada da viatura.

Atrasos excessivos causam pausa explícita, preservando o tempo pedido na fila; não se descartam ticks para melhorar FPS. Ocultar o separador pausa a cidade. Os indicadores de FPS continuam a medir frames reais, sem multiplicação pela velocidade.

## Origens e circulação

O caso inicial é selecionado pelo PRNG entre residentes existentes, preservando a sua localização, atividade e percurso. Não há deslocação do paciente nem três testemunhas colocadas junto dele. `initialCaseOrigin`, eventos e `incident.origin` permitem distinguir localização inicial, início efetivo e observação posterior.

S0 usa condições de rotina, atividade percorrida e revisões/risco/cooldowns por seed, com atraso de perceção. Os antigos instantes globais 20/240/450 s não geram as ocorrências normais. Fixtures controladas usadas nos testes mantêm apenas as condições específicas necessárias para exercitar concorrência/indisponibilidade.

Ambulâncias e patrulhas cedem a pessoas no trajeto e a travessias iminentes, travam e retomam progressivamente. Esperas mútuas podem desencadear desvios ou estacionamento alternativo num nó realmente acessível; a tripulação continua a pé. Uma pessoa a meio de uma aresta é abordada no seu ponto físico, com contacto e linha de visão para avaliação. Não é movida para simplificar a recolha.

`crewIds` identifica afiliação, não autorização para recuperar alguém que já é paciente de outro serviço. Atribuições, embarques e localização são exclusivos; um veículo sem tripulação operacional suspende a resposta. Estes controlos preservam as pessoas e recursos finitos ao variar origens e tempos de deslocação.

## Validação e reprodução

[Relatório técnico V0.2.1](../docs/LIVING_CITY_V021_TECHNICAL_REPORT.md). Os relatórios e ZIP da V0.2 permanecem arquivados nos seus caminhos originais.

```bash
npm test
node scripts/report-living-city-v021.cjs --output /tmp/living-city-v021-report.json
```

A matriz lógica usa S0/S1/S2 e seeds 16927/42/2026, por 600 segundos simulados, com invariantes de pessoas, transporte, camas, atribuições e velocidade a cada tick. Os testes de apresentação e tempo também comparam diferentes frequências de desenho.

```bash
npm ci --prefix urban-spike
node scripts/build-living-city.cjs
node scripts/package-living-city.cjs /tmp/living-city-v021-package
```

Three.js 0.181.2 e esbuild 0.25.12 permanecem fixados no lockfile existente. A licença MIT é incluída. `build-info.json` identifica versão, escala e fontes/bundle por SHA-256. A ordem e os metadados fixos do ZIP permitem reconstrução byte a byte.

Com Playwright 1.62.1 e Chromium disponíveis como ferramentas de desenvolvimento:

```bash
node scripts/verify-living-city-v021.cjs --output /tmp/living-city-v021-browser.json
node scripts/check-living-city-package.cjs /tmp/living-city-v021-package/crisis-vector-living-city-v021.zip /tmp/living-city-v021-package-check.json
```

O verificador de interação usa um relógio RAF controlado para testar câmara, picking, pausa, interpolação e taxas; esses números não são FPS medidos. O benchmark usa o relógio real e identifica os custos e limitações do executor:

```bash
node scripts/benchmark-living-city.cjs --url http://127.0.0.1:8000/living-city/ \
  --ux-evidence /tmp/living-city-v021-browser.json --output /tmp/living-city-v021-performance.json
```

## Limites

O tráfego é um modelo simples de cedência/desvio, sem vias detalhadas, semáforos ou física completa. Obstáculos persistentes e serviços incapacitados podem tornar uma resposta impossível; a espera não autoriza atravessar pessoas. Interiores e patologia continuam com as aproximações da V0.2, a aprofundar na V0.2.3. Parâmetros são ficcionais e o equilíbrio não está validado.

Não existe laboratório de parâmetros, presets, importação/exportação na UI ou sincronização GitHub. Mundo, baseline factual, A1b, economia e safe zones permanecem fora deste recorte. Uma preview web só é apresentada como funcional após teste real; se a política do executor bloquear Pages, a entrega usa o ZIP descarregado e executado localmente. A execução direta `file://` pode ser bloqueada pela política do browser; usar o servidor estático.
