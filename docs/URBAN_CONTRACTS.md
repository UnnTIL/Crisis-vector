# Urban WebGL spike — contrato da fixture

Esta operação é uma prova isolada e inteiramente fictícia. Não lê nem altera o
motor nacional, os países, a tesouraria ou a população da demo Alpha. Não constitui
a integração A1b nem uma campanha persistente. Todos os parâmetros abaixo são
parâmetros de jogo sintéticos, não dados de capacidade militar ou epidemiologia.

## API independente do renderizador

`urban-spike/simulation.js` publica `window.UrbanSim` no browser e o mesmo objeto
por CommonJS no Node. Exporta `UrbanOperation`, `createScenario`, `TICK_SECONDS`
e `ORDERS`. Não existem dependências externas no motor.

```js
const operation = new UrbanSim.UrbanOperation({ seed: 16927 });
operation.command({
  commandId: 'north-1', teamId: 'team-alpha', type: 'perimeter',
  x: 29.5, z: 8.5
});
operation.step(10); // exatamente um segundo lógico
const detachedState = operation.snapshot();
```

O passo lógico é sempre 0,1 segundos. `step(ticks)` aceita 1–10000 ticks inteiros;
uma entrada inválida devolve `{ok:false,message}` sem mutação. Após sucesso ou
falha, novos passos não alteram o resultado. A pausa consiste em não invocar
`step`; velocidade e frequência de desenho não entram nas regras. Para reiniciar,
construir outra operação com a mesma seed. `snapshot()` é uma cópia destacada;
não existe importação de saves neste spike.

`command` aceita apenas os campos próprios `commandId`, `teamId`, `type`, `x`, `z`.
IDs de comando têm 1–80 caracteres alfanuméricos, `_`, `-`, `.`, `:`. As equipas
são `team-alpha` e `team-bravo`; os tipos são `move`, `defend`, `perimeter`,
`escort` e `retreat`. Coordenadas finitas devem identificar uma célula transitável
dentro do mapa; o destino é normalizado para o seu centro. Apenas `retreat` permite
omitir ambas as coordenadas, usando a base. Repetir o mesmo ID e comando devolve
o resultado anterior com `duplicate:true`, sem nova ordem ou custo. Reutilizar o
ID para outra ordem é rejeitado. Todas as rejeições preservam o estado, os recursos
e os eventos.

## Geometria e movimento

O mapa tem 40×40 células de uma unidade urbana sintética. As posições do domínio
são `(x,z)`, e não pixels nem coordenadas do Canvas. `map.walkable` é um vetor
booleano com índice `floor(z) * width + floor(x)`. Os edifícios são as células
intransitáveis; os corredores têm três células de largura. A saída/base está em
`(4.5,19.5)`. Não existe geografia real nem alegação de escala em metros.

Todas as deslocações usam busca em largura com quatro vizinhos e desempate fixo.
Os segmentos não atravessam edifícios. `findPath(x,z,targetX,targetZ)` devolve
os centros seguintes da rota, ou `null` para pontos ilegais/sem ligação.
`mission.corridors` contém as duas rotas reais entre a origem civil e a saída;
os trajetos restantes das entidades estão em `path`.

As hordas recalculam a rota para o grupo civil vivo mais próximo ou para a saída.
As barreiras são obstáculos de acesso: civis e equipas passam no checkpoint,
hordas param e exercem pressão até destruir a barreira. Nesta fixture as hordas
não procuram um desvio dinâmico para evitar checkpoints. Posição, alcance e
linha de visão pelas células transitáveis determinam o combate.

## Ordens e recursos finitos

- `move`: desloca sem disparar; mantém a posição de destino.
- `defend`: desloca e combate autonomamente dentro do alcance e linha de visão.
- `perimeter`: reserva um dos quatro materiais e monta uma barreira à chegada;
  a equipa também defende. Substituir a ordem antes da montagem perde o material
  reservado, sem reembolso ou criação de outra barreira.
- `escort`: escolhe o grupo civil mais próximo do destino indicado, acompanha-o
  e acelera o movimento dos civis próximos. Quando esse grupo termina, a equipa
  mantém a posição; não evacua automaticamente todos os grupos restantes.
- `retreat`: regressa à base por uma rota física, sem teletransporte nem reembolso.

Cada equipa dispõe de 140 munições, integridade 100 e stamina 1. Cada disparo
consome uma munição e neutraliza um zombie; a cadência máxima é dois disparos por
segundo e o alcance é 7,8 unidades com linha de visão transitável. Movimento
consome stamina, imobilidade permite recuperar stamina, e ameaça próxima reduz
integridade. Munições e integridade não são reabastecidas gratuitamente. Falta de
munições, fadiga ou integridade crítica desencadeiam retirada autónoma. A
integridade das equipas é um recurso operacional abstrato; não representa um
contador adicional de população humana.

Cada barreira tem 80 pontos de integridade e ocupa um acesso de raio 1,7. Cada
zombie próximo exerce 0,25 de pressão por segundo. `resources.barriers` conta
materiais disponíveis, `barriersUsed` os reservados, e `barriersLost` as reservas
abandonadas. Barreiras destruídas permanecem no estado com integridade zero.

## População, ameaça e sucesso

Há seis grupos civis identificados, de vinte pessoas cada, que partem aos
8, 30, 52, 74, 96 e 118 segundos. A deslocação normal é de 0,46 unidades/segundo,
ou 0,85 sob escolta próxima. Há doze coortes de ameaça com contagens determinadas
pela seed; entram em movimento em pares a partir dos 24 segundos e a cada
25 segundos. `activeFromTick`/`spawnTick` indicam essa ativação operacional, e
`active` distingue as coortes que já se movem das que aguardam nos acessos.
Todos os membros dessas coortes já pertencem ao censo histórico da fixture.

Os balanços são derivados das mesmas entidades:

```
population.initial = population.living + population.dead
population.living = soma(civilian.count) + population.evacuated
population.dead = mission.initialDead + soma(civilian.dead)
population.activeZombies + population.neutralized = population.dead
```

Uma morte civil retira uma pessoa do grupo vivo e acrescenta a mesma pessoa à
coorte reanimada atacante. Neutralizar essa ameaça não produz outro óbito humano.
A chegada à saída transfere `count` para `evacuated` uma vez; evacuar não cria
pessoas. Os participantes humanos de referência são os civis e as coortes
históricas de ameaça; as duas equipas são recursos abstratos desta fixture.

O objetivo é evacuar pelo menos 90 de 120 civis até 210 segundos, conservando
integridade positiva na saída. Não restarem sobreviventes suficientes para o
objetivo ou perder toda a integridade da saída causa falha antecipada. Ao resolver
todos os grupos ou esgotar o prazo, o motor produz um resultado único em
`mission.result`; o resultado resume os efeitos já contabilizados.

Calibração de desenvolvimento, seed 16927: duas ordens iniciais de perímetro em
`mission.defensePoints` permitem evacuar 120 civis sem novas mortes humanas em
187,5 segundos. Sem novas ordens, a operação falha após perder civis suficientes
para tornar o objetivo impossível. Isto demonstra uma diferença funcional, não
uma conclusão sobre equilíbrio final, desempenho gráfico ou hardware alvo.

Zonas têm estado local `controlled`, `threatened` ou `lost`, conforme proximidade
da ameaça e das equipas capazes. Perder controlo local da zona da saída é um aviso;
a condição de perda da instalação é `resources.exitIntegrity <= 0`.

## Limites

Não há integração com economia/campanha, A1b, transportes internacionais,
patologias, trajetória balística, cobertura complexa, navegação multiescala,
persistência/importação ou validação de desempenho de desktop. A geometria é
sintética; cada marcador de horda representa a contagem explícita dessa coorte.
Medidas de FPS/GPU pertencem ao protocolo do renderizador, não aos resultados
deste motor lógico.
