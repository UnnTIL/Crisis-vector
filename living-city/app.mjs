import Core from './core/world.cjs';
import {LivingRenderer} from './renderer.mjs';
import {LivingAudio} from './audio.mjs';
import Time from './presentation/time.cjs';

const {LivingCity,positionOf}=Core;
const {SimulationClock,BASE_SIMULATION_RATE}=Time;
const time=new SimulationClock();
const $=id=>document.getElementById(id);
const clock=seconds=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
const quantile=(xs,p)=>{const a=[...xs].sort((x,y)=>x-y);return a[Math.max(0,Math.ceil(a.length*p)-1)]??0;};
const samples={frameMs:[],logicMs:[],renderMs:[],poseMs:[]};
const addSample=(name,value)=>{const a=samples[name];a.push(value);if(a.length>6000)a.shift();};
const roles={resident:'Habitante',officer:'Agente policial',medic:'Tripulante médico',hospitalStaff:'Profissional hospitalar'};
const labels={S0:'Cidade sem surto',S1:'Doença progressiva',S2:'Transformação súbita'};
const statusText=value=>({available:'Disponível',dispatched:'Despachada',enRoute:'Em deslocação',onScene:'No local',transporting:'Em transporte',transportRouteWaiting:'Aguardar rota para o hospital',returnRouteWaiting:'Aguardar rota de regresso',handover:'Entrega hospitalar',returning:'A regressar',awaitingPolice:'Aguardar proteção policial',blocked:'Impedida / indisponível',patrolling:'Em patrulha',responding:'Em resposta',waitingCrew:'Aguardar tripulação',collectingCrew:'Recolher tripulação',emergencyStop:'Paragem de emergência',unavailable:'Sem capacidade operacional',busy:'Ocupada',waiting:'Em espera',calling:'Chamada em curso',received:'Chamada recebida',triaged:'Triagem concluída',assigned:'Meio atribuído',assessed:'Avaliação concluída',resolved:'Encerrada',cancelled:'Cancelada',escalated:'Escalada',residential:'Habitação',office:'Trabalho / serviços',shop:'Comércio',hospital:'Hospital',station:'Esquadra'}[value]??value??'—');
let world=new LivingCity({seed:16927,scenario:'S0'}),renderer,audio,selected=null,following=false,debug=false;
let lastFrame=performance.now(),lastUi=0,lastList=0,lastAudioEvent=0,lastLogKey='',toastTimer;

function toast(message){$('toast').textContent=message;$('toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),5000);}
function find(selection){if(!selection)return null;const s=world.state;return ({person:s.people,vehicle:s.vehicles,building:s.city.buildings,incident:s.incidents}[selection.kind]??[]).find(x=>x.id===selection.id)??null;}
function select(selection){selected=find(selection)?selection:null;following=false;renderer?.setSelected(selected);renderer?.setFollow(null);updateContext();}
function follow(value=!following){following=Boolean(value&&selected);renderer?.setFollow(following?selected:null);updateContext();}
function knownIncidents(){return world.state.incidents.filter(i=>debug||i.reportedAt!=null||(i.confirmedFacts??[]).length>0);}
function visibleEvents(){const known=new Set(knownIncidents().map(i=>i.id));return world.state.events.filter(e=>{if(debug)return true;if(e.visibility==='truth')return false;const incidentIds=[e.incidentId,...(e.entityIds??[])].filter(id=>typeof id==='string'&&id.startsWith('incident-'));return incidentIds.length===0||incidentIds.some(id=>known.has(id));});}
function setPaused(value){time.setPaused(value);lastFrame=performance.now();if(time.paused){renderer?.snapToState(world.state);renderer?.render(world.state,1);}updateUi();}
function setSpeed(value){if(!time.setSpeed(value))return false;updateUi();return true;}
function advanceTicks(ticks){const result=world.step(ticks);if(result?.ok===false)throw new Error(result.message);renderer.snapToState(world.state);renderer.render(world.state,1);updateUi();return world.snapshot();}
function reset(options={}){
  if(typeof options==='number')options={seed:options};
  const seed=Number(options.seed??$('seed-input').value),scenario=options.scenario??$('scenario-select').value;
  try{
    const next=new LivingCity({...options,seed,scenario});world=next;time.reset();selected=null;following=false;lastAudioEvent=0;lastLogKey='';lastList=0;
    for(const xs of Object.values(samples))xs.length=0;
    $('seed-input').value=String(seed);$('scenario-select').value=scenario;
    audio?.reset();renderer?.snapToState(world.state);renderer?.setSelected(null);renderer?.setFollow(null);renderer?.resetCamera();renderer?.render(world.state,1);lastFrame=performance.now();updateUi();refreshEntities();return true;
  }catch(error){toast(error.message);return false;}
}
function details(rows){$('selection-details').replaceChildren(...rows.flatMap(([term,value])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=term;dd.textContent=String(value??'—');return [dt,dd];}));}
function updateContext(){
  const e=find(selected),s=world.state;
  $('selection-title').textContent=e?.name??e?.id??'Acompanha a cidade';
  $('selection-kind').textContent=e?({person:roles[e.role]??'Pessoa',vehicle:e.type==='ambulance'?'Ambulância':'Viatura policial',building:'Instalação / edifício',incident:'Ocorrência'}[selected.kind]):'OBSERVAÇÃO';
  $('follow-button').disabled=!e;$('follow-button').textContent=following?'Deixar de seguir':'Seguir na cidade';$('follow-button').setAttribute('aria-pressed',String(following));
  if(!e){details([['Modo','Resposta autónoma'],['População','Identidades existentes'],['Controlo','Seleciona no mapa ou pesquisa abaixo']]);$('selection-note').textContent='Não é necessário dar ordens. A central despacha os meios disponíveis e regista esperas e riscos.';return;}
  if(selected.kind==='person'){
    const reports=knownIncidents().filter(i=>i.personId===e.id),facts=[...new Set(reports.flatMap(i=>[...(i.knownFacts??[]),...(i.confirmedFacts??[])]))];
    const loc=e.location??{},where=loc.kind==='vehicle'?`Na viatura ${loc.vehicleId}`:loc.kind==='building'||loc.kind==='hospital'?`Interior · ${s.city.buildings.find(b=>b.id===loc.buildingId)?.name??loc.buildingId}`:'Via pública / passeio';
    details([['Identidade',e.id],['Atividade',debug?e.activity:({walking:'A caminhar',atHome:'Em casa',atService:'Num serviço',resting:'Em pausa',onDuty:'Em serviço',available:'Disponível',patrolling:'Em patrulha',responding:'A responder',approaching:'Em aproximação',assessing:'Em avaliação',assisting:'Em auxílio',protecting:'Em proteção',engaging:'Em intervenção',retreating:'Em retirada',returning:'A regressar',hospitalDuty:'Em serviço hospitalar'}[e.activity]??(reports.length?'Ocorrência em acompanhamento':'Atividade não comunicada'))],['Localização',where],['Tarefa',e.taskId??'Rotina'],['Informação conhecida',facts.join(', ')||'Sem avaliação comunicada'],...(e.role==='officer'?[['Munições',e.ammo],['Integridade',e.hp]]:[]),...(debug?[['DEBUG · vida',e.lifeState],['DEBUG · saúde',e.healthState],['DEBUG · posição',`${positionOf(s,e).x.toFixed(1)}, ${positionOf(s,e).z.toFixed(1)}`]]:[])]);
    $('selection-note').textContent=loc.kind==='building'||loc.kind==='hospital'?'A pessoa permanece contabilizada no interior. O seguimento indica o edifício; não representa deslocação na rua.':debug?'Modo de verdade do motor ativo.':'A informação clínica apresentada provém de chamadas e avaliações, não do estado oculto da doença.';
  }else if(selected.kind==='vehicle'){
    details([['Estado',statusText(e.status)],['Missão',e.incidentId??'Sem ocorrência atribuída'],['Tripulação',(e.crewIds??[]).join(', ')],['Passageiros',(e.passengerIds??[]).join(', ')||'Nenhum'],['Capacidade',e.capacity],['Percurso restante',`${(e.path??[]).length} nós`],['Circulação',e.traffic?.status==='yielding'?`A ceder passagem a ${e.traffic.personId??'uma pessoa'}`:e.traffic?.status==='slowing'?'A reduzir velocidade junto de uma travessia':['transportRouteWaiting','returnRouteWaiting','blocked','unavailable'].includes(e.status)?e.waitReason??'Aguarda condições para retomar':'Sem espera de circulação comunicada'],['Indisponibilidade',e.broken?'Viatura avariada':'Sem avaria']]);$('selection-note').textContent='A viatura e os seus ocupantes são entidades distintas. O transporte conserva as mesmas identidades.';
  }else if(selected.kind==='building'){
    const inside=s.people.filter(p=>p.location?.buildingId===e.id&&(p.location.kind==='building'||p.location.kind==='hospital'));
    const hospital=s.facilities.hospital;
    details([['Tipo',statusText(e.type)],['Ocupantes registados',inside.length],['Entradas',(e.entranceNodeIds??[]).join(', ')],['Capacidade',e.id===hospital.buildingId?`${hospital.patientIds.length} / ${hospital.capacity} camas`:e.capacity],['Acesso viário',e.vehicleNodeId??'Via acesso pedonal']]);$('selection-note').textContent='Os interiores são localizações lógicas acessíveis por portais; não há interiores 3D detalhados.';
  }else{
    const assigned=[e.assignedAmbulanceId,e.assignedPatrolId].filter(Boolean),vehicle=s.vehicles.find(v=>v.id===e.assignedAmbulanceId);
    const roadNodes=new Map(s.city.vehicleGraph.nodes.map(n=>[n.id,n]));
    let remaining=0,previous=vehicle?{x:vehicle.x,z:vehicle.z}:null;
    if(previous)for(const id of vehicle.path??[]){const node=roadNodes.get(id);if(node){remaining+=Math.hypot(node.x-previous.x,node.z-previous.z);previous=node;}}
    const travelSpeed=s.config.parameters.ambulanceSpeed??7;
    const eta=vehicle&&remaining>0?(travelSpeed>0?`~${Math.ceil(remaining/travelSpeed)} s de viagem, sem paragens`:'Sem progressão: velocidade nula'):'—';
    details([['Pessoa',e.personId],['Tipo observado',e.type==='medical'?'Ocorrência médica':'Comportamento hostil'],['Estado',statusText(e.status)],['Prioridade',e.priority??e.severity],['Comunicação',e.reportedAt==null?'Chamada em preparação':clock(e.reportedAt*.1)],['Meios',assigned.join(', ')||'Em espera'],['Percurso/ETA',eta],['Conhecido',(e.knownFacts??[]).join(', ')||'Informação incompleta'],['Confirmado',(e.confirmedFacts??[]).join(', ')||'Aguardando avaliação'],['Espera',e.waitReason??'Sem espera comunicada']]);$('selection-note').textContent='A central recebe observações com atraso e atribui meios finitos; a causa verdadeira pode continuar desconhecida.';
  }
}
function refreshEntities(){
  const search=$('entity-search').value.trim().toLocaleLowerCase('pt'),previous=$('entity-select').value,s=world.state;
  const groups=[['person',s.people,e=>`${roles[e.role]??e.role} · ${e.name??e.id}`],['vehicle',s.vehicles,e=>`${e.type==='ambulance'?'Ambulância':'Patrulha'} · ${e.id}`],['building',s.city.buildings,e=>e.name??e.id],['incident',knownIncidents(),e=>`Ocorrência · ${e.id} · ${e.type}`]];
  const options=[];
  for(const [kind,items,name] of groups)for(const e of items){const label=name(e);if(!search||`${label} ${e.id}`.toLocaleLowerCase('pt').includes(search)){const o=document.createElement('option');o.value=`${kind}:${e.id}`;o.textContent=label;options.push(o);}}
  $('entity-select').replaceChildren(...options);if(options.some(o=>o.value===previous))$('entity-select').value=previous;
}
function updateUi(){
  const s=world.state,active=knownIncidents().filter(i=>!['resolved','cancelled'].includes(i.status));
  $('sim-time').textContent=clock(s.timeSeconds);$('scenario-status').textContent=`${labels[s.scenario]} · ${time.paused?'em pausa':'autónoma'}`;
  $('stat-population').textContent=s.initialPopulation??s.people.length;
  $('stat-known-cases').textContent=new Set(knownIncidents().filter(i=>i.type==='medical'||i.type==='violence').map(i=>i.personId)).size;
  $('stat-calls').textContent=active.length;
  const ambulances=s.vehicles.filter(v=>v.type==='ambulance'),police=s.patrols??[];
  $('stat-resources').textContent=`${s.counters.availableAmbulances}/${ambulances.length} AMB · ${s.counters.availablePatrols}/${police.length} PAT`;
  $('pause-button').textContent=time.paused?'▶ Iniciar':'Ⅱ Pausar';$('pause-button').setAttribute('aria-pressed',String(time.paused));
  $('step-button').disabled=!time.paused;
  $('time-scale-note').textContent=`1× = ${BASE_SIMULATION_RATE} s simulados / segundo real · atual ${BASE_SIMULATION_RATE*time.speed} s/s`;
  for(const b of document.querySelectorAll('[data-speed]')){const active=Number(b.dataset.speed)===time.speed;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}
  $('debug-banner').hidden=!debug;$('debug-banner').classList.toggle('hidden',!debug);
  const filter=$('timeline-filter').value;
  const events=visibleEvents().filter(e=>filter==='all'||(filter==='calls'?/Call|Triag|Dispatch|Assign|Wait|Incident/.test(e.type):filter==='police'?/Police|Officer|Shot|Threat|Retreat|Backup|Neutraliz/.test(e.type):/Medical|Ambulance|Patient|Hospital|Assess|Handover|Symptom/.test(e.type))).slice(-55).reverse();
  const key=`${debug}/${filter}/${events.map(e=>e.eventId).join('|')}`;
  if(key!==lastLogKey){lastLogKey=key;$('event-log').replaceChildren(...events.map(e=>{const li=document.createElement('li');li.textContent=`${clock(e.timeSeconds??e.tick*.1)} · ${e.message??e.type}`;li.dataset.eventId=e.eventId;return li;}));}
  const mean=samples.frameMs.reduce((a,b)=>a+b,0)/samples.frameMs.length;
  $('perf-fps').textContent=Number.isFinite(mean)&&mean>0?(1000/mean).toFixed(1):'—';$('perf-p95').textContent=`${quantile(samples.frameMs,.95).toFixed(1)} ms`;
  $('perf-logic').textContent=samples.logicMs.length?`${quantile(samples.logicMs,.95).toFixed(2)} ms/tick`:'sem passos';$('perf-memory').textContent=performance.memory?`${(performance.memory.usedJSHeapSize/1048576).toFixed(1)} MiB`:'indisponível';
  updateContext();
}
try{
  renderer=new LivingRenderer({container:$('scene'),canvas:$('livingCanvas'),onSelect:select});
  audio=new LivingAudio({onStatus:()=>updateAudio()});
  $('scenario-select').value='S0';$('seed-input').value='16927';renderer.snapToState(world.state);renderer.render(world.state,1);updateUi();refreshEntities();updateAudio();
  $('renderer-status').textContent='WebGL 2 · cidade autónoma · geometria e população do domínio';
  window.livingDemo={version:'0.2.1',ready:true,getState:()=>world.snapshot(),advanceTicks,
    reset,setPaused,setSpeed,getTimeState:()=>({...time.snapshot(),tick:world.state.tick}),setScenario:scenario=>reset({scenario}),select,follow,setDebug(value){debug=Boolean(value);$('debug-truth').checked=debug;renderer.setDebug?.(debug);updateUi();},
    setEffects(value){$('reduced-effects').checked=!value;renderer.setReducedEffects?.(!value);},
    audio,getSelection:()=>selected,get isPaused(){return time.paused;},renderer,project:(x,z,h=0)=>renderer.project(x,z,h),
    getMetrics:()=>({...renderer.getMetrics(),...Object.fromEntries(Object.entries(samples).map(([k,v])=>[k,[...v]])),time:time.snapshot(),tick:world.state.tick,logicalPeople:world.state.people.length,logicalVehicles:world.state.vehicles.length,incidentCount:world.state.incidents.length}),
    resetMetrics(){for(const xs of Object.values(samples))xs.length=0;}};
  function frame(now){
    const delta=Math.max(0,now-lastFrame);lastFrame=now;addSample('frameMs',delta);
    const result=time.advance(delta,()=>{const begin=performance.now();world.step();addSample('logicMs',performance.now()-begin);const poseBegin=performance.now();renderer.captureTick(world.state);addSample('poseMs',performance.now()-poseBegin);});
    if(result.autoPaused){renderer.snapToState(world.state);toast('Atraso lógico acumulado. A cidade foi pausada; reduz a velocidade antes de retomar.');}
    const begin=performance.now();renderer.render(world.state,result.alpha);addSample('renderMs',performance.now()-begin);
    if(lastAudioEvent>world.state.events.length)lastAudioEvent=0;
    audio.consume(world.state.events.slice(lastAudioEvent),selected&&find(selected)?positionOf(world.state,find(selected)):{x:world.state.city.width/2,z:world.state.city.height/2});lastAudioEvent=world.state.events.length;
    if(now-lastUi>250){updateUi();updateAudio();lastUi=now;}if(now-lastList>1500){refreshEntities();lastList=now;}requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}catch(error){console.error(error);$('renderer-status').textContent=`Não foi possível iniciar a cidade: ${error.message}`;toast('Usa um browser desktop recente com WebGL 2.');window.livingDemo={ready:false,error:error.message};}
function updateAudio(){if(!audio)return;const status=audio.getStatus();$('sound-toggle').textContent=status.muted?'Ativar som':'Silenciar';$('sound-toggle').setAttribute('aria-pressed',String(!status.muted));$('audio-status').textContent=status.lastError?`Áudio indisponível: ${status.lastError}`:status.muted?'Som desligado · opcional':`Som ativo · ${status.activeVoices}/${6} vozes`;}
$('pause-button').addEventListener('click',()=>setPaused(!time.paused));
$('step-button').addEventListener('click',()=>{if(time.paused)advanceTicks(1);});
for(const b of document.querySelectorAll('[data-speed]'))b.addEventListener('click',()=>setSpeed(Number(b.dataset.speed)));
$('reset-button').addEventListener('click',()=>reset());$('scenario-select').addEventListener('change',()=>reset());
$('entity-search').addEventListener('input',refreshEntities);$('select-entity-button').addEventListener('click',()=>{const [kind,...ids]=$('entity-select').value.split(':');select({kind,id:ids.join(':')});});
$('follow-button').addEventListener('click',()=>follow());$('timeline-filter').addEventListener('change',updateUi);
for(const input of document.querySelectorAll('[data-layer]'))input.addEventListener('change',()=>renderer?.setLayer(input.dataset.layer,input.checked));
$('debug-truth').addEventListener('change',()=>window.livingDemo?.setDebug?.($('debug-truth').checked));
$('sound-toggle').addEventListener('click',async()=>{if(audio){await audio.setMuted(!audio.getStatus().muted);updateAudio();}});
$('volume-control').addEventListener('input',()=>{audio?.setVolume(Number($('volume-control').value));updateAudio();});
$('reduced-effects').addEventListener('change',()=>renderer?.setReducedEffects($('reduced-effects').checked));
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea')||e.target.isContentEditable||e.ctrlKey||e.altKey||e.metaKey)return;
  if(e.code==='Space'){e.preventDefault();if(!e.repeat)setPaused(!time.paused);}
  if(e.repeat)return;
  const key=e.key.toLowerCase();
  if(key==='q'||key==='e'){e.preventDefault();renderer?.rotateCamera(key==='q'?-1:1);}
  if(key==='r'){following=false;renderer?.resetCamera();updateContext();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!time.paused){setPaused(true);toast('Cidade pausada ao ocultar o separador.');}});
