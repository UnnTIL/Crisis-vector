# Living City V0.2 — matriz de revisão

Referências: [Issue #10](https://github.com/UnnTIL/Crisis-vector/issues/10) e
`docs/product/URBAN_LIVING_CITY_V02.md` na branch `docs/product-vision-v1`.
Os valores da fixture são parâmetros fictícios de jogo. Esta matriz descreve os
critérios de revisão; uma linha só fica validada com os testes e resultados
identificados no relatório de execução, não pela presença de código ou de UI.

## Evidência conferida na revisão do candidato

Os **27 testes de domínio LC0–LC3 passaram** no candidato revisto. A suite cobre
redes, censo, rotinas, snapshots, passos inválidos, partições de ticks, serviço
médico completo, prioridade/idempotência, lotação, via bloqueada, avaria,
profissionais finitos, progressão, transformação em transporte e exposição.
Inclui também regressões de prioridade e entrega hospitalar concorrente, despacho
policial após triagem, patrulha ocupada, proibição de atacar infetado não hostil,
vetos por edifícios/terceiros, reação em deslocação, munição finita e reforço.
Isto ainda não confirma CI remota nem as regressões externas à suite Living City.

O [relatório de cenários](living-city-report.json) contém **nove execuções**:
S0/S1/S2 × seeds 16927/42/2026, cada uma por 6000 ticks (600 segundos simulados).
As invariantes foram verificadas a cada um dos **54 000 ticks**. Os hashes dos
módulos nesse relatório foram conferidos com as fontes do candidato.

O ficheiro de execução final `/tmp/living-city-final-smoke.json`, concluído em
13 de novembro de 2026, regista **três verificações de browser aprovadas**, em
DPR 1/1,5/2. Em cada uma, S0/S1/S2 completaram 6000 ticks, sem ordens de gestão.
O browser foi Chromium 156.0.8078.79. Foram verificados seleção, seguimento,
seleção no Canvas antes/depois de redimensionar, ausência de mutação por câmara e
pelas opções de áudio/efeitos e funcionamento com rede desligada após carregar.
Os registos não contêm erros JavaScript. Só foram pedidos HTML, CSS e bundle
locais. O hash do bundle final dessa execução é
`1bf2b16119aa572e069bd5205f882917f4cdbbaacd01e50a4dd04d2454683b1c`.

Em cada DPR, o disparo confirmado **54**, de `officer-5` contra `resident-002`,
consumiu uma munição, foi apresentado visualmente e chegou ao Web Audio após o
gesto de ativar som. O contador de reprodução chegou a dois efeitos. Reconsumir
esse evento não aumentou o contador, e o snapshot lógico completo permaneceu
igual. Isto verifica a execução e deduplicação do efeito; não avalia a qualidade
audível no equipamento do utilizador.

Os casos de browser usam a seed 16927; a comparação das três seeds foi executada
no motor Node. Os 600 segundos foram avançados pela API de ticks do domínio e
apresentados no browser; não representam dez minutos reais de captura contínua.

| Critérios | Estado da evidência nesta revisão |
| --- | --- |
| LC-01/02/03/04/05/11 | Exercitados pelos testes de domínio, nove cenários Node e casos de browser, dentro das fixtures descritas. |
| LC-06 | Espera com hospital cheio, falta de profissional e reserva concorrente de profissionais testadas; libertação posterior de uma cama e continuação não têm teste dirigido próprio. |
| LC-07/08/09 | Testes dirigidos demonstram autonomia, triagem anterior ao despacho, deslocação física, ameaça reconhecida, vetos por visão/terceiros, infetado não hostil, reação em movimento e custo de munição. |
| LC-10 | Evento de tiro real apresentado visualmente e executado por Web Audio nos três DPR; consumo repetido não duplica som nem altera o snapshot. Mute e redução de efeitos não mudam a lógica. |
| LC-12 | Censo, snapshots, comandos idempotentes, partições de ticks e reinício exercitados; matriz de três seeds/cenários concluída com invariantes por tick. |

## Variação entre seeds e equilíbrio

S0 terminou em todas as seeds com 164 vivos, zero mortos e zero reanimados, com
rotinas e serviços normais. Nos cenários de ameaça há forte dependência da seed:

| Cenário | Mortos aos 600 s — seed 16927 | Seed 42 | Seed 2026 |
| --- | ---: | ---: | ---: |
| S1 | 94 | 152 | 15 |
| S2 | 131 | 136 | 19 |

Em S1 e S2, todas estas execuções terminaram com zero ambulâncias disponíveis;
vários casos também esgotaram a disponibilidade policial. A conservação de
identidades e recursos continua válida durante essa deterioração. Estes números
mostram consequências e limites de capacidade da fixture, **não equilíbrio
validado, probabilidades reais ou uma experiência de contenção calibrada**.
Transmissão em compartimentos abstratos, falta de isolamento e perda de
profissionais contribuem para a deterioração; rever parâmetros e capacidade com
observação de jogo antes de expandir o sistema.

## Verificações finais ainda pendentes

As medições de desempenho em curso não são contadas como concluídas nesta
matriz. Regressões completas/CI, pacote HTML/ZIP, hashes dos artefactos e acesso
publicado também precisam de evidência própria. Uma alteração posterior do bundle
exige associar novas verificações ao seu hash; não atribuir automaticamente estes
resultados a outra compilação. Não há certificação de 60 FPS, GPU física, memória
de GPU ou teste prolongado de fugas.

## Critérios do documento de produto

| ID | Comportamento necessário | Evidência a conferir |
| --- | --- | --- |
| LC-01 | S0 mantém vida urbana e ocorrências normais, sem ameaça criada por calendário | Simular 600 s sem ordens; rotinas, entradas/saídas de edifícios, deslocação entre quarteirões e pelo menos um ciclo médico. Zero reanimados em S0. |
| LC-02 | S1 usa um residente existente, chamada e transporte físico até ao hospital | Seguir o mesmo `personId` desde os sintomas à chamada, despacho, chegada, avaliação, embarque e admissão. Tripulação e doente têm uma localização única em cada passo. |
| LC-03 | S2 transforma uma identidade existente e produz resposta a observação | O ID e o censo mantêm-se na morte/reanimação. A verdade do motor precede a chamada; apenas testemunha, próprio ou profissional com acesso físico reporta factos conhecidos. |
| LC-04 | Contacto tem distância/duração e progressão explícitas | Exposição abaixo/acima do limiar; ausência de transmissão através de edifícios ou entre ocupantes sem acesso físico; novas infeções referem IDs já existentes. |
| LC-05 | Duas chamadas disputam uma ambulância finita | Prioridade e desempate determinísticos; espera com motivo; cada meio tem no máximo uma ocorrência atribuída e não existe segundo transporte do mesmo doente. |
| LC-06 | Hospital cheio conserva a pessoa e explica a espera | Capacidade nunca excedida; paciente permanece no local/veículo designado, sem cura ou desaparecimento; a libertação de cama permite continuar. |
| LC-07 | Patrulhas observam/respondem autonomamente | Circulação e despacho por vias reais, agentes saem/entram na viatura, avaliação, apoio e encerramento/retirada sem comandos do utilizador. Polícia ocupada produz espera ou reforço explícito. |
| LC-08 | Fogo depende de ameaça reconhecida, alcance, visão e terceiros | Uma ameaça hostil identificada pode receber reação durante deslocação; alvo oculto/fora de alcance ou corredor de tiro inseguro impede disparo. Cada tiro consome munição finita. |
| LC-09 | Infeção não implica hostilidade | Residente infetado, incluindo sintomas conhecidos e proximidade policial, não é alvo por diagnóstico. Sem aquisição de alvos através do estado de saúde verdadeiro. |
| LC-10 | Efeitos leem eventos de tiro confirmados | `ShotFired` identifica atirador, alvo, posição, tick, munição e resultado; flash/impacto/som consomem o mesmo ID uma vez. Mute/redução de efeitos não altera snapshots lógicos. |
| LC-11 | Topologia e edifícios permitem rotinas físicas | Entradas de todos os edifícios usados ligadas à rede pedonal; hospital/esquadra têm acesso viário. Movimentos e acessos não atravessam volumes; via bloqueada gera desvio ou falha explícita. |
| LC-12 | Identidades, recursos e tempo são determinísticos | Seeds 16927/42/2026 × S0/S1/S2 por 600 s; conservação por tick, retries idempotentes, snapshots destacados, partições de ticks/FPS equivalentes e ausência de mutação por câmara/áudio. |

## Revisão por incremento

- **LC-0:** redes e portais coerentes, instalações finitas, população inicial
  completa (residentes e profissionais), rotinas e seleção/seguimento. Não há
  marcadores que criem habitantes. Contagens incluem interiores e veículos.
- **LC-1:** incidentes observáveis, chamadas atrasadas, triagem, atribuição,
  ambulâncias/tripulações, recolha física e hospital. Ensaiar chamadas concorrentes,
  hospital lotado, viatura avariada e via interrompida.
- **LC-2:** pessoa inicial preexistente; S1/S2/contacto; morte, reanimação e
  neutralização mantêm o mesmo ID. Transformação em transporte ou hospital produz
  consequências locais e comunicação posterior, sem criar outra pessoa.
- **LC-3:** patrulhas, agentes e viaturas distintos; reconhecimento e regras de
  intervenção; recursos finitos; terceiro no corredor de tiro; reação em movimento;
  apoio, indisponibilidade e retirada. Diagnóstico isolado nunca autoriza fogo.
- **LC-4:** UI distingue verdade e conhecimento; debug explícito; efeitos por
  eventos, áudio por gesto e limites de simultaneidade, mute/volume/redução de
  flashes. Validar browser DPR 1/1,5/2, pausa, seguimento, reinício e pacote offline.

## Invariantes transversais

1. O conjunto inicial de IDs de pessoas não cresce. `initialPopulation = living +
   dead`; reanimados e neutralizados são estados das mesmas identidades mortas.
2. Cada pessoa ocupa exatamente um local. Roster da viatura, pacientes do hospital,
   tripulação, tarefa e localização concordam; ninguém pertence simultaneamente a
   dois veículos, a veículo e edifício, ou a duas equipas.
3. Tripulação e doente percorrem acessos físicos. Uma atribuição não desloca uma
   entidade instantaneamente; a posição de um passageiro deriva da sua viatura.
4. Um recurso não executa duas ocorrências incompatíveis em simultâneo. A espera,
   cancelamento, falha, retorno e libertação têm transições auditáveis.
5. Factos clínicos verdadeiros, observações, chamadas e confirmação são distintos.
   O modo normal da UI, o despacho e a seleção de alvos não consultam informação
   oculta para antecipar uma transformação.
6. Renderer e áudio não avançam RNG, saúde, ordens, tempo, disparos ou recursos.
   Sem renderização, a mesma sequência de comandos/ticks conserva o resultado.

## Evidência e limites da entrega

O relatório de execução deve identificar comandos, versões, contagens de testes,
fixtures, seeds, duração simulada e resultados. Distinguir regressões existentes,
testes novos, verificações de browser, medições de desempenho e itens não
executados. Um caso sem testes ou uma porta aberta não prova prontidão.

O pacote publicado deve corresponder às fontes revistas e às medições indicadas;
comparar o bundle, o HTML autónomo, o conteúdo do ZIP e os SHA-256. Abrir a versão
publicada/obtida do GitHub antes de afirmar que funciona. Se a política do browser
bloquear `file://`, registrar essa limitação e validar o servidor estático local
com a rede desligada após carregamento.

Não alegar desempenho em GPU física ou 60 FPS sem medições nesse hardware. O
incremento não inclui campanha mundial, A1b, economia, safe zones, geografia real,
dados militares, interiores completos ou validação clínica. Limitações de trânsito,
triagem, reconhecimento e segurança devem corresponder ao comportamento observado.
