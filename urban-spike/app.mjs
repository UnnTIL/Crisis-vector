import UrbanSim from './simulation.js';
import {UrbanRenderer} from './renderer.mjs';

const {UrbanOperation}=UrbanSim;
const $=id=>document.getElementById(id);
const clock=seconds=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;
const percentile=(items,p)=>items.length?[...items].sort((a,b)=>a-b)[Math.min(items.length-1,Math.floor((items.length-1)*p))]:0;
const orders={
  move:{name:'Mover',description:'Clica numa rua para deslocar a equipa. O trajeto evita edifícios; não há teletransporte.',cost:'Sem custo inicial'},
  defend:{name:'Defender',description:'Clica num cruzamento para o defender. A equipa reage às hordas no alcance; munição e resistência são limitadas.',cost:'Consome munição em contacto'},
  perimeter:{name:'Perímetro',description:'Clica numa rua para estabelecer ou reforçar uma barreira ao chegar. A pressão da horda pode romper a linha.',cost:'1 reserva de barreira'},
  escort:{name:'Escoltar',description:'Clica no corredor para proteger e ajudar os civis próximos. Civis continuam a percorrer o trajeto até à saída.',cost:'Munição em contacto'},
  retreat:{name:'Retirar',description:'Retirar para a base segura, recuperar e preservar a equipa. A posição abandonada deixa de estar protegida.',cost:'Sem reposição de munição'}
};
let operation=new UrbanOperation({seed:16927}),paused=true,speed=1,selectedTeamId=operation.state.teams[0].id,activeOrder='move';
let commandNumber=0,lastFrame=performance.now(),accumulator=0,lastUi=0,overlayDismissed=false,toastTimer;
const frameMs=[],logicMs=[],renderMs=[],inputMs=[];
const sample=(items,value)=>{items.push(value);if(items.length>6000)items.shift();};
const initialDead=()=>operation.state.mission.initialZombies??operation.state.population.initial-operation.state.mission.initialCivilians;
let renderer;
function toast(message,error=false){
  const element=$('toast');element.textContent=message;element.classList.remove('hidden');element.style.borderColor=error?'#e68070':'#64d9b6';
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.add('hidden'),3800);
}
function setPaused(value){paused=Boolean(value);lastFrame=performance.now();updateUi();}
function setOrder(type){
  if(!orders[type])return;
  activeOrder=type;
  for(const button of document.querySelectorAll('[data-order]')){
    const selected=button.dataset.order===type;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',selected);
  }
  $('order-description').textContent=orders[type].description;$('order-cost').textContent=orders[type].cost;
}
function selectTeam(id){
  if(!operation.state.teams.some(team=>team.id===id))return;
  selectedTeamId=id;renderer?.setSelectedTeam?.(id);updateUi();
}
function command(input){
  const start=performance.now();
  const result=operation.command(input);
  sample(inputMs,performance.now()-start);updateUi();return result;
}
function issueAt({x,z,button=0}){
  const type=button===2?'move':activeOrder;
  const result=command({commandId:`ui-${++commandNumber}`,teamId:selectedTeamId,type,x,z});
  toast(result.message??(result.ok?'Ordem aceite.':'Ordem rejeitada.'),!result.ok);
  if(result.ok)$('selected-target').textContent=`${orders[type].name} · ${x.toFixed(1)}, ${z.toFixed(1)}`;
}
function reset(seed){
  const value=Number(seed??$('seed-input').value);
  if(!Number.isSafeInteger(value)||value<0||value>4294967295){toast('A seed deve ser um inteiro entre 0 e 4294967295.',true);return false;}
  operation=new UrbanOperation({seed:value});paused=true;speed=1;commandNumber=0;accumulator=0;overlayDismissed=false;
  frameMs.length=0;logicMs.length=0;renderMs.length=0;inputMs.length=0;
  $('seed-input').value=String(value);$('mission-overlay').classList.add('hidden');
  selectedTeamId=operation.state.teams[0].id;setOrder('move');selectTeam(selectedTeamId);renderer?.resetCamera();lastFrame=performance.now();
  $('selected-target').textContent='Escolhe uma ordem e clica numa rua.';updateUi();return true;
}
function setProfile(profile){
  if(!['P1','P2','P3'].includes(profile))return false;
  const before=operation.snapshot();renderer.setProfile(profile);
  $('profile-select').value=profile;
  $('building-count').value=String({P1:2000,P2:5000,P3:10000}[profile]);
  $('marker-count').value=$('building-count').value;
  if(JSON.stringify(before)!==JSON.stringify(operation.snapshot()))throw new Error('Visual profile changed logical state');
  return true;
}
function updateUi(){
  const state=operation.state,p=state.population,team=state.teams.find(t=>t.id===selectedTeamId);
  $('mission-time').textContent=clock(state.timeSeconds??state.tick*.1);
  $('mission-status').textContent=state.phase==='success'?'MISSÃO CUMPRIDA':state.phase==='failure'?'OPERAÇÃO COMPROMETIDA':paused?'EM PAUSA · PREPARAÇÃO':'OPERAÇÃO EM CURSO';
  $('stat-population').textContent=Math.max(0,p.living-p.evacuated);
  $('stat-zombies').textContent=p.activeZombies;
  $('stat-evacuated').textContent=`${p.evacuated} / ${state.mission.initialCivilians}`;
  $('stat-resources').textContent=`${state.resources.barriers} barreiras`;
  $('stat-casualties').textContent=Math.max(0,p.dead-initialDead());
  $('mission-objective').textContent=`Evacua pelo menos ${state.mission.evacTarget} dos ${state.mission.initialCivilians} civis em ${clock(state.mission.maxSeconds)}. Prepara as duas linhas orientais antes das vagas e protege os trajetos até à saída oeste.`;
  $('pause-button').textContent=paused?'▶ INICIAR':'Ⅱ PAUSAR';$('pause-button').setAttribute('aria-pressed',String(paused));
  for(const b of document.querySelectorAll('[data-speed]')){b.classList.toggle('active',Number(b.dataset.speed)===speed);b.setAttribute('aria-pressed',String(Number(b.dataset.speed)===speed));}
  $('selected-team').textContent=team?.name??'Seleciona uma equipa';
  const roster=state.teams.map(unit=>unit.id).join('|');
  if($('team-list').dataset.roster!==roster){
    $('team-list').innerHTML=state.teams.map((unit,index)=>`<button class="team-card" data-team="${unit.id}"><span class="team-symbol">${index?'B':'A'}</span><span class="team-copy"><strong></strong><small></small></span><span class="team-state"></span></button>`).join('');
    $('team-list').dataset.roster=roster;
  }
  for(const [index,unit] of state.teams.entries()){
    const card=$('team-list').children[index];
    card.classList.toggle('selected',unit.id===selectedTeamId);card.setAttribute('aria-pressed',String(unit.id===selectedTeamId));
    card.querySelector('strong').textContent=unit.name;card.querySelector('small').textContent=`${Math.round(unit.health)}% · ${unit.ammo} munições`;
    card.querySelector('.team-state').textContent=unit.health<=0?'INATIVA':orders[unit.order?.type]?.name??'PRONTA';
  }
  const events=(state.events??[]).slice(-8).reverse();
  const eventKey=events.map(event=>event.id).join('|');
  if($('event-log').dataset.events!==eventKey){
    $('event-log').replaceChildren(...events.map(event=>{const li=document.createElement('li');li.textContent=`${clock(event.timeSeconds??(event.tick??0)*.1)} · ${event.message??event.text??event.type}`;return li;}));
    $('event-log').dataset.events=eventKey;
  }
  if(state.phase!=='running'&&!overlayDismissed){
    paused=true;$('mission-overlay').classList.remove('hidden');
    $('result-title').textContent=state.phase==='success'?'O corredor resistiu.':'A linha cedeu.';
    $('result-description').textContent=`${p.evacuated} civis evacuados; ${Math.max(0,p.dead-initialDead())} perdas humanas. ${state.phase==='success'?'A posição das equipas e os perímetros preservaram a saída.':'Reavalia os cruzamentos, as vagas e o consumo de munição.'}`;
  }
  if(renderer){
    const metrics=renderer.getMetrics();
    $('perf-fps').textContent=frameMs.length?(1000/(frameMs.reduce((a,b)=>a+b,0)/frameMs.length)).toFixed(1):'—';
    $('perf-p95').textContent=frameMs.length?percentile(frameMs,.95).toFixed(1)+' ms':'—';
    $('perf-logic').textContent=logicMs.length?percentile(logicMs,.95).toFixed(2)+' ms p95':'sem passos';
    $('perf-memory').textContent=performance.memory?(performance.memory.usedJSHeapSize/1048576).toFixed(1)+' MB':'indisponível';
    $('renderer-status').textContent=`WebGL 2 · ${metrics.buildings??0} edifícios · ${metrics.visualMarkers??metrics.markers??0} marcadores amostrados · 2 equipas lógicas`;
  }
}
try{
  const start=performance.now();
  renderer=new UrbanRenderer({container:$('scene'),canvas:$('urbanCanvas'),profile:'P1',onGroundClick:issueAt,onTeamClick:selectTeam,onPointerLatency:ms=>sample(inputMs,ms)});
  renderer.render(operation.state,0);selectTeam(selectedTeamId);setOrder(activeOrder);updateUi();
  const buildMs=performance.now()-start;
  window.urbanDemo={ready:true,getState:()=>operation.snapshot(),command,advanceTicks(ticks){operation.step(ticks);updateUi();renderer.render(operation.state,0);return operation.snapshot();},
    reset,setProfile,setPaused,get isPaused(){return paused;},getSelectedTeamId:()=>selectedTeamId,
    project:(x,z)=>renderer.screenPoint(x,z),renderer,
    getMetrics:()=>({...renderer.getMetrics(),buildMs,frameMs:[...frameMs],logicMs:[...logicMs],renderMs:[...renderMs],inputMs:[...inputMs],
      logicalTeams:operation.state.teams.length,logicalHordes:operation.state.hordes.length,logicalCohorts:operation.state.civilians.length,tick:operation.state.tick,paused}),
    resetMetrics(){frameMs.length=0;logicMs.length=0;renderMs.length=0;inputMs.length=0;}};
  function frame(now){
    const delta=Math.max(0,now-lastFrame);lastFrame=now;sample(frameMs,delta);
    if(!paused&&operation.state.phase==='running'){
      accumulator+=delta*speed;
      let steps=0;
      while(accumulator>=100&&steps<100&&operation.state.phase==='running'){
        const start=performance.now();operation.step(1);sample(logicMs,performance.now()-start);accumulator-=100;steps++;
      }
      if(accumulator>10000){paused=true;toast('O navegador acumulou atraso lógico. Operação pausada; reduz a carga visual antes de retomar.',true);}
    }
    const renderStart=performance.now();renderer.render(operation.state,Math.min(1,accumulator/100));sample(renderMs,performance.now()-renderStart);
    if(now-lastUi>220){updateUi();lastUi=now;}
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}catch(error){
  console.error(error);$('renderer-status').textContent='Não foi possível iniciar WebGL 2. Usa Chrome/Firefox recente com aceleração gráfica.';
  $('mission-status').textContent='RENDERIZADOR INDISPONÍVEL';toast(error.message,true);
  window.urbanDemo={ready:false,error:error.message};
}
$('team-list').addEventListener('click',event=>{const button=event.target.closest('[data-team]');if(button)selectTeam(button.dataset.team);});
for(const button of document.querySelectorAll('[data-order]'))button.addEventListener('click',()=>{
  setOrder(button.dataset.order);
  if(button.dataset.order==='retreat')issueAt(operation.state.mission.base);
});
$('pause-button').addEventListener('click',()=>{if(operation.state.phase!=='running')return toast('Reinicia o cenário para uma nova tentativa.');setPaused(!paused);});
for(const button of document.querySelectorAll('[data-speed]'))button.addEventListener('click',()=>{speed=Number(button.dataset.speed);updateUi();});
$('reset-button').addEventListener('click',()=>reset());$('restart-result').addEventListener('click',()=>reset());
$('dismiss-result').addEventListener('click',()=>{overlayDismissed=true;$('mission-overlay').classList.add('hidden');});
$('profile-select').addEventListener('change',event=>setProfile(event.target.value));
for(const id of ['building-count','marker-count'])$(id).addEventListener('change',event=>{
  const profile={2000:'P1',5000:'P2',10000:'P3'}[event.target.value];setProfile(profile);toast('Perfil visual alterado; a população e as ordens permanecem iguais.');
});
document.addEventListener('keydown',event=>{
  if(event.target.matches('input,select,textarea'))return;
  if(event.code==='Space'){event.preventDefault();if(operation.state.phase==='running')setPaused(!paused);}
  if(event.key==='1')selectTeam(operation.state.teams[0].id);if(event.key==='2')selectTeam(operation.state.teams[1].id);
  if(event.key.toLowerCase()==='r')renderer?.resetCamera();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused){setPaused(true);toast('Operação pausada ao ocultar o separador.');}});
