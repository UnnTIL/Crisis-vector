# Avaliação tecnológica e plano de prova urbana

Estado: `PROPOSED` — proposta técnica para revisão, 12 de novembro de 2026. A orientação inicial do diretor criativo é browser, sujeita a validação; a escolha definitiva do renderizador e os limites de carga continuam por aprovar. Este documento não autoriza implementação nem acrescenta dependências.

Consultar o [índice](README.md), o [registo de decisões](DECISION_LOG.md), as [questões abertas](OPEN_QUESTIONS.md) e as [escalas de jogo](GAMEPLAY_SCALES.md). A base observada é a Alpha 0.1, commit `6efd5b3`: JavaScript sem dependências, Canvas 2D e oito testes de motor. A análise anterior não mediu uma cidade 3D.

## Recomendação

Manter o motor em JavaScript modular e o mapa mundial em Canvas 2D. Avaliar Three.js com WebGL 2 numa prova urbana pequena, isolada da demo, antes de comprometer a arquitetura gráfica. Browser é a recomendação inicial porque conserva o motor testável, reduz a migração e permite observar rapidamente o comportamento das três escalas. Não constitui uma garantia de que qualquer dimensão de cidade caberá no orçamento disponível.

O objetivo de 60 FPS corresponde a aproximadamente 16,7 ms por frame. É uma meta de experiência em hardware a acordar, não um resultado obtido. A qualidade visual pode adaptar-se à capacidade do dispositivo; as regras, o tempo lógico e a conservação não podem ser simplificados silenciosamente em resposta ao FPS.

## Comparação de opções

| Opção | Vantagens para este projeto | Custos e limitações | Posição proposta |
| --- | --- | --- | --- |
| Canvas 2D mundial + Three.js/WebGL 2 urbano | Preserva o motor e a vista mundial; câmara ortográfica com volumes simples; instancing e controlo do desenho; dependência gráfica relativamente delimitada. Codex pode trabalhar em módulos pequenos e testes de domínio sem editor obrigatório. | Integração de picking, navegação, interface, gestão de recursos e perfis de qualidade é responsabilidade do projeto. Muitas entidades com IA continuam a custar CPU. Drivers e browsers variam. | Primeiro candidato da prova de conceito. |
| Canvas 2D em todas as vistas | Menor mudança; offline simples na Alpha atual; apresentação esquemática legível; boa referência de custo e de funcionalidade. | A extrusão, oclusão e perspetiva exigiriam soluções próprias; muitos desenhos/efeitos podem pesar na CPU. Não demonstra por si a experiência 2.5D pretendida. | Preservar como baseline e possível modo de compatibilidade; não prometer equivalência visual. |
| PixiJS | Renderização 2D acelerada, sprites e batching; apropriado se a direção visual puder usar edifícios desenhados/pré-renderizados. | Volumetria 3D, oclusão e câmara exigem aproximações; não elimina o trabalho de simulação, interface ou operações. | Alternativa caso um estilo 2D cumpra a intenção urbana com menor custo. |
| Phaser | Sistemas de cenas, input e ferramentas 2D podem acelerar a produção de uma experiência predominantemente 2D. | Sobreposição com relógio, estado e interface já propostos; física/entidades do framework não devem tornar-se uma segunda autoridade da campanha. Não é a escolha natural para volumes 3D. | Avaliar apenas se os requisitos de jogo justificarem esses sistemas. |
| Babylon.js | Motor Web 3D mais integrado, com ferramentas e funcionalidades de cena que podem reduzir trabalho de infraestrutura. | Mais convenções/sistemas a integrar; risco de utilizar complexidade sem necessidade. Requer medir a mesma cena e o mesmo modelo lógico, em vez de comparar demos diferentes. | Segundo candidato Web 3D se faltarem ferramentas relevantes em Three.js. |
| Godot nativo para PC | Editor de cenas, câmara, input, navegação e exportação desktop; maior controlo de distribuição e de integração com o sistema. | O motor JavaScript não se transfere automaticamente para GDScript/C#; portar ou manter uma ponte acrescenta custo, testes e risco de divergência. Assets e ficheiros de cena exigem revisão própria, incluindo trabalho do Codex no editor. A versão Web teria limitações diferentes da nativa. | Reconsiderar após bloqueio demonstrado no browser ou necessidade produtiva do editor; não migrar agora. |
| Unity nativo para PC | Ecossistema, profiling, ferramentas de cenas e opções para grandes cargas; produtividade potencial para uma equipa experiente em C#. | Migração do domínio/linguagem e pipeline; dependência do editor e dos termos de licença vigentes da versão adotada. Renderização eficiente não garante IA económica ou conservação correta. | Alternativa de plataforma a estudar perante requisitos comprovados, não solução presumida de desempenho. |

Não se fixa uma versão de biblioteca nem um orçamento comercial nesta proposta. Uma futura adoção precisa de versão exata, licença, manutenção, suporte de plataformas e instalação reproduzível. Não introduzir simultaneamente múltiplos motores para a mesma vista.

## Distribuição Web e futura edição local

O jogo deve funcionar com recursos locais e sem APIs obrigatórias. Dependências gráficas, fontes e dados devem ser empacotados e versionados; uma CDN não pode ser requisito da campanha offline. Carregar uma cidade sob demanda significa ler um pacote local quando disponível, não tornar obrigatória uma consulta remota.

A Alpha atual abre `index.html` sem módulos. Uma futura adoção de ES modules, carregamentos de dados e Workers pode exigir uma origem HTTP local, devido às restrições dos browsers para `file://`. Antes dessa mudança, é preciso aprovar e testar uma experiência de arranque offline: manter a demo atual funcional e escolher um pacote/servidor local ou shell desktop para a versão modular. “Offline” não equivale automaticamente a “duplo clique num HTML”. Não remover esse comportamento da Alpha apenas para facilitar a prova.

| Distribuição | Benefício | Custo a validar |
| --- | --- | --- |
| Browser com conteúdo estático local | Menor compromisso de plataforma; distribuição e diagnóstico simples. | Arranque local, armazenamento, importação/exportação de ficheiros, cache e comportamento de separadores inativos. PWA exige preparação/caching e condições de origem adequadas; não é garantia de primeira execução offline. |
| Electron | Reutiliza a aplicação Web e inclui uma versão conhecida de Chromium; experiência de instalação e ficheiros locais. | Binário e memória maiores, atualizações, assinatura e superfície adicional de integração. Manter o domínio separado das APIs de desktop e restringir permissões do renderizador. |
| Tauri | Reutiliza a UI Web com shell nativo e instaladores potencialmente menores. | Dependência do WebView do sistema, diferenças de suporte gráfico, toolchain Rust/nativa, permissões, assinatura e empacotamento por SO. Um instalador menor não prova desempenho superior. |
| Motor nativo | Pipeline de jogo e distribuição próprios. | Migração/revalidação do domínio e da interface; custo de abandonar ou manter duas aplicações. |

Uma shell desktop não elimina o custo de WebGL/JavaScript, nem resolve por si um gargalo de IA. A API do motor deve aceitar comandos e produzir estado/eventos sem conhecer browser, Electron, Tauri ou um editor.

## Desenho da prova de conceito urbana

Proposta de autorização futura: uma cena original, determinística e sintética, separada da demo jogável. Sem dados urbanos completos, inventários militares reais ou campanha paralela. Inclui câmara ortográfica, edifícios extrudidos simples, marcadores, uma horda coletiva, duas unidades, uma barreira e um corredor de evacuação com origem/destino e capacidade limitada.

O protótipo deve partilhar um contrato mínimo de comando, identificadores, tempo e contagem populacional com a arquitetura proposta. Pode usar um adaptador em memória e dados artificiais identificados. Não precisa de toda a economia/diplomacia, mas não deve inventar uma segunda regra de população ou um relógio independente difícil de integrar. O seu relatório deve distinguir código reutilizável de instrumentação descartável.

Não existem imagens de referência visual acessíveis nesta entrega além da descrição textual recebida. A direção artística específica deve ser revista quando essas referências forem disponibilizadas; não se afirma ter reproduzido ou analisado imagens não vistas.

## Matriz de carga a testar

Os números seguintes são hipóteses de ensaio, não promessas nem lotações aprovadas. A cena, seed, trajeto da câmara e sequência de ordens devem ser iguais em cada comparação.

| Perfil | Edifícios na cena | Marcadores populacionais visíveis | Unidades/veículos | Objetivo |
| --- | --- | --- | --- | --- |
| P1 | 2 000 | 2 000 | 20 | Validar interação, modelo e custo mínimo. |
| P2 | 5 000 | 5 000 | 50 | Candidato inicial a carga de referência para o alvo de 60 FPS. |
| P3 | 10 000 | 10 000 | 100 | Identificar limite e comportamento sob sobrecarga. |

Registar separadamente edifícios totais, visíveis e desenhados; marcadores visíveis; pessoas contabilizadas; agentes lógicos ativos; grupos/hordas; unidades; eventos; pedidos de caminho e draw calls. Um marcador pode representar uma fração visual de uma coorte e não deve criar uma nova pessoa no domínio.

Para cada perfil, variar agentes lógicos individuais ativos entre 0 (renderização isolada), 500, 2 000 e todos os marcadores, com o restante movimento por grupos. O modo “todos individuais” é um ensaio de limite, não o desenho recomendado. Comparar também uma horda agregada que represente mais pessoas do que pontos visíveis, declarando essa relação. Nunca apresentar 10 000 pontos desenhados como prova de 10 000 agentes completos com IA.

Ensaios necessários: plano afastado, aproximação máxima, pan/zoom contínuos, seleção de grupo, ordens simultâneas, quebra de perímetro, evacuação congestionada, criação/remoção em massa, troca de cidade e carregamento a frio. Incluir uma campanha mundial de fundo com carga controlada para medir a concorrência real entre escalas.

## Técnicas e experiências controladas

| Técnica | Uso proposto | Comparação necessária |
| --- | --- | --- |
| Instancing/batching | Edifícios de poucos modelos e marcadores com atributos por instância. | Versão ingénua versus instanciada; draw calls, CPU de atualização, GPU e custo de picking. Evitar uma mesh por indivíduo. |
| LOD e culling | Reduzir detalhe, texto, sombras e instâncias fora de vista. | Vistas perto/longe e aproximação; verificar que o desaparecimento visual não remove entidades do estado. |
| Hordas agregadas | Planeamento coletivo por grupos/células, com dispersão visual local. | Conservação, fidelidade dos resultados e custo versus agentes individuais; limites da aproximação explicitados. |
| Partição espacial | Grelha uniforme inicial para vizinhança e seleção; estruturas mais complexas apenas se necessário. | Densidade normal e concentração num gargalo; custo de atualização e consultas. |
| Frequências diferentes | Hipótese de lógica operacional a 10 Hz de tempo simulado com interpolação a 60 FPS; sistemas macro em cadências próprias no mesmo relógio. | Pausa, velocidades, baixa taxa de desenho e determinismo. A cadência final depende do desenho tático e do scheduler. |
| Web Worker | Um proprietário da lógica ou tarefa intensiva delimitada; comandos ordenados e snapshots/deltas. | Main thread versus Worker com o mesmo trabalho; incluir serialização, transferências, latência, filas e memória. Não adotar se o custo de mensagens superar o ganho. |
| Carregamento local sob demanda | Pacotes de cidade e buffers libertados quando deixam de ser necessários. | Carga a frio/quente, troca repetida, cancelamento e crescimento de memória; guardar o estado antes de descartar a representação. |

OffscreenCanvas, SharedArrayBuffer e WebGPU não são pré-requisitos. Exigem avaliar suporte, isolamento de origem e custo de manutenção antes de eventual uso. Começar pela alternativa mais simples que permita medir o gargalo.

## Protocolo de medição e portas de decisão

1. Acordar um PC desktop de referência de gama média e um inferior. Registar CPU, RAM, GPU/VRAM, resolução, DPR, SO, drivers, browser/versão, aceleração gráfica e perfil energético. A máquina Linux cloud e um browser com rasterização por software não certificam desempenho desse PC.
2. Executar pelo menos três repetições de cada variante, com aquecimento de 30 segundos e captura de 120 segundos. Medir carregamento a frio separadamente. Guardar seed, build, configuração, dados brutos e traço de ordens; estes tempos são propostas de protocolo.
3. Registar p50/p95/p99 de tempo de frame, FPS sustentado, frames longos, tempo CPU de lógica por tick, tempo GPU quando a medição for suportada, latência de input/comando, tamanho das filas, memória e custo de carregamento. Separar tempo de frame de duração do tick e não somar medidas CPU/GPU sobrepostas como se fossem sequenciais.
4. Proposta de porta P2: p95 de frame até 16,7 ms e p99 até 33,3 ms após aquecimento, sem atraso lógico crescente durante o ensaio; lógica operacional a 10 Hz com p95 até 5 ms por tick como orçamento inicial a rever. Estes limiares precisam de aprovação e medição conjunta com UI/mundo, não são resultados.
5. Em P3, exigir degradação explicável e recuperação: reduzir efeitos, sombras, resolução interna e detalhe visual antes de reduzir a velocidade oferecida. Se a lógica não acompanhar, limitar explicitamente a aceleração ou pausar com indicação; não saltar eventos nem alterar o resultado para cumprir FPS.
6. Em todas as cargas, exigir invariantes, replay independente do FPS, picking correto em DPR 1/1,5/2, nenhuma duplicação na troca de escala e memória sem crescimento persistente após ciclos de carregar/libertar. Os limites absolutos de memória e carga inicial dependem do hardware e distribuição e devem ser aprovados antes do ensaio final.
7. Se P2 falhar, identificar CPU, GPU, mensagens ou memória, aplicar uma alteração de cada vez e repetir. Comparar um segundo renderizador apenas se o gargalo pertencer à renderização. Avaliar um motor nativo se limitações repetidas de plataforma, ferramentas ou distribuição continuarem materiais após esse diagnóstico.

A aprovação da prova exige um relatório com configuração executada, resultados, limitações, alternativa recomendada e lista do que não foi medido. Não exige resolver já todo o combate, pathfinding mundial ou persistência. Não existe autorização nesta entrega para executar este desenvolvimento.

## Fontes técnicas para a revisão

Referências oficiais de capacidades e APIs, não evidência de desempenho do CRISIS VECTOR. Validar compatibilidade e termos da versão escolhida quando a prova for autorizada:

- [Three.js — InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh), [LOD](https://threejs.org/docs/#api/en/objects/LOD) e [OrthographicCamera](https://threejs.org/docs/#api/en/cameras/OrthographicCamera).
- [MDN — WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) e [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).
- [PixiJS](https://pixijs.com/), [Phaser](https://docs.phaser.io/) e [Babylon.js](https://doc.babylonjs.com/).
- [Godot — documentação](https://docs.godotengine.org/) e [Unity — documentação](https://docs.unity3d.com/).
- [Electron — segurança](https://www.electronjs.org/docs/latest/tutorial/security) e [Tauri — distribuição](https://v2.tauri.app/distribute/).
