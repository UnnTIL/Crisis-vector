/* Original, isolated urban fixture. No DOM, renderer or campaign dependencies. */
(function (root) {
  'use strict';
  const TICK_SECONDS = .1;
  const ORDERS = Object.freeze(['move','defend','perimeter','escort','retreat']);
  const COMMAND_KEYS = Object.freeze(['commandId','teamId','type','x','z']);
  const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
  const copy = value => JSON.parse(JSON.stringify(value));
  const center = n => Math.floor(n)+.5;
  const cellIndex = (map,x,z) => Math.floor(z)*map.width+Math.floor(x);
  const onMap = (map,x,z) => Number.isFinite(x)&&Number.isFinite(z)&&x>=0&&z>=0&&x<map.width&&z<map.height;
  const walkable = (map,x,z) => onMap(map,x,z)&&map.walkable[cellIndex(map,x,z)]===true;

  function createScenario(options={}) {
    const seed=options.seed===undefined?16927:options.seed;
    if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295)throw new TypeError('Seed must be an unsigned 32-bit integer.');
    let rng=seed>>>0;
    const random=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296;};
    const width=40,height=40,tiles=[];
    for(let z=0;z<height;z++)for(let x=0;x<width;x++)tiles.push(
      x>1&&x<38&&z>1&&z<38&&((x>=3&&x<=5)||(x>=18&&x<=20)||(x>=33&&x<=35)||(z>=7&&z<=9)||(z>=18&&z<=20)||(z>=29&&z<=31))
    );
    const map={width,height,walkable:tiles,cellSize:1};
    const base={x:4.5,z:19.5},north={x:29.5,z:8.5},south={x:29.5,z:30.5};
    const teams=[
      {id:'team-alpha',name:'Equipa Alfa',x:4.5,z:18.5},
      {id:'team-bravo',name:'Equipa Bravo',x:4.5,z:20.5}
    ].map(t=>({...t,health:100,ammo:140,stamina:1,order:{type:'defend',x:t.x,z:t.z},status:'holding',path:[],pendingBarrier:null,nextShotTick:0,nextEscortPathTick:0,shots:0}));
    const civilians=Array.from({length:6},(_,i)=>({
      id:'civil-'+(i+1),name:'Grupo civil '+(i+1),x:25.5,z:i%2?30.5:8.5,
      initialCount:20,count:20,evacuated:0,dead:0,releaseTick:(8+i*22)*10,status:'waiting',path:[],exposure:0
    }));
    const hordes=Array.from({length:12},(_,i)=>({
      id:'horde-'+(i+1),x:35.5,z:i%2?30.5:8.5,count:12+Math.floor(random()*5),
      activeFromTick:(24+Math.floor(i/2)*25)*10,spawnTick:(24+Math.floor(i/2)*25)*10,active:false,status:'waiting',path:[],targetId:null,nextPathTick:0
    }));
    const initialDead=hordes.reduce((sum,h)=>sum+h.count,0);
    return {
      version:1,seed,rngState:rng,tick:0,timeSeconds:0,phase:'running',
      map,teams,hordes,civilians,barriers:[],
      zones:[
        {id:'north',name:'Acesso norte',...north,state:'controlled'},
        {id:'south',name:'Acesso sul',...south,state:'controlled'},
        {id:'exit',name:'Saída humanitária',...base,state:'controlled'}
      ],
      resources:{barriers:4,barriersUsed:0,barriersLost:0,exitIntegrity:100},
      population:{initial:120+initialDead,living:120,evacuated:0,dead:initialDead,activeZombies:initialDead,neutralized:0},
      mission:{name:'Corredor de saída',maxSeconds:210,evacTarget:90,initialCivilians:120,initialDead,
        exit:{...base},base:{...base},suggestedDefense:{...north},suggestedDefenseSouth:{...south},defensePoints:[{...north},{...south}],
        corridors:[8.5,30.5].map(z=>{const start={x:25.5,z};return [start,...findPath(map,start,base)];}),
        result:null,reason:null},
      events:[{id:1,tick:0,type:'mission',message:'Evacuar 90 dos 120 civis pelo corredor oeste. Os grupos saem por fases; proteger os dois acessos leste.',details:{}}],
      acceptedCommands:[],neutralizedTotal:0,eventSequence:1
    };
  }

  // Four-neighbour breadth-first search; all logical movement uses this topology.
  function findPath(map,from,to) {
    if(!walkable(map,from.x,from.z)||!walkable(map,to.x,to.z))return null;
    const start=cellIndex(map,from.x,from.z),goal=cellIndex(map,to.x,to.z);
    if(start===goal)return [];
    const parents=new Int32Array(map.width*map.height);parents.fill(-1);parents[start]=start;
    const queue=new Int32Array(parents.length);let head=0,tail=0;queue[tail++]=start;
    while(head<tail&&parents[goal]<0){
      const at=queue[head++],x=at%map.width,z=Math.floor(at/map.width);
      for(const [nx,nz] of [[x+1,z],[x,z+1],[x-1,z],[x,z-1]]){
        if(nx<0||nz<0||nx>=map.width||nz>=map.height)continue;
        const next=nz*map.width+nx;
        if(parents[next]!==-1||!map.walkable[next])continue;
        parents[next]=at;queue[tail++]=next;
      }
    }
    if(parents[goal]<0)return null;
    const route=[];let at=goal;
    while(at!==start){route.push({x:at%map.width+.5,z:Math.floor(at/map.width)+.5});at=parents[at];}
    return route.reverse();
  }

  class UrbanOperation {
    constructor(options={}) {
      this.state=createScenario(options);
      this._commands=new Map();
    }
    snapshot(){return copy(this.state);}
    findPath(x,z,targetX,targetZ){return findPath(this.state.map,{x,z},{x:targetX,z:targetZ});}
    _event(type,message,details={}){
      const s=this.state;
      s.events.push({id:++s.eventSequence,tick:s.tick,type,message,details});
      if(s.events.length>150)s.events.shift();
    }
    command(input){
      const reject=message=>({ok:false,message});
      if(!input||typeof input!=='object'||Array.isArray(input))return reject('Comando inválido.');
      if(Reflect.ownKeys(input).some(key=>!COMMAND_KEYS.includes(key)))return reject('Campo de comando desconhecido.');
      if(!['commandId','teamId','type'].every(key=>Object.hasOwn(input,key)))return reject('Identificador, equipa e ordem são obrigatórios.');
      const {commandId,teamId,type}=input;
      if(typeof commandId!=='string'||!/^[-A-Za-z0-9_.:]{1,80}$/.test(commandId))return reject('Identificador de comando inválido.');
      if(typeof teamId!=='string'||typeof type!=='string'||!ORDERS.includes(type))return reject('Equipa ou ordem desconhecida.');
      const s=this.state,team=s.teams.find(t=>t.id===teamId);
      if(!team)return reject('Equipa indisponível.');
      const hasX=Object.hasOwn(input,'x'),hasZ=Object.hasOwn(input,'z');
      let x=input.x,z=input.z;
      if(type==='retreat'&&!hasX&&!hasZ)({x,z}=s.mission.base);
      else if(!hasX||!hasZ)return reject('As duas coordenadas do destino são obrigatórias.');
      if(!walkable(s.map,x,z))return reject('Destino inválido: escolher uma célula transitável no mapa.');
      const payload={commandId,teamId,type,x:center(x),z:center(z)};
      const prior=this._commands.get(commandId);
      if(prior){
        if(JSON.stringify(prior.payload)!==JSON.stringify(payload))return reject('Este identificador já pertence a outro comando.');
        return {...prior.result,duplicate:true};
      }
      if(s.phase!=='running')return reject('A operação terminou. Reiniciar para jogar novamente.');
      if(team.health<=0)return reject('Equipa incapacitada.');
      if(s.acceptedCommands.length>=5000)return reject('Limite de comandos desta operação atingido.');
      const destination=type==='retreat'?s.mission.base:payload;
      const path=findPath(s.map,team,destination);
      if(path===null)return reject('Não existe trajeto transitável para esse destino.');
      if(type==='perimeter'){
        if(s.resources.barriers<1)return reject('Sem materiais para mais barreiras.');
        if(s.barriers.some(b=>b.hp>0&&distance(b,payload)<2)||s.teams.some(t=>t.pendingBarrier&&distance(t.pendingBarrier,payload)<2))return reject('Já existe um perímetro reservado ou ativo neste local.');
      }
      // Everything above is read-only; commit the accepted command atomically.
      if(team.pendingBarrier){s.resources.barriersLost++;team.pendingBarrier=null;}
      if(type==='perimeter'){
        s.resources.barriers--;s.resources.barriersUsed++;
        team.pendingBarrier={id:'barrier-'+commandId,x:payload.x,z:payload.z};
      }
      team.order={type,x:destination.x,z:destination.z};team.path=path;
      if(type==='escort'){
        const cohorts=s.civilians.filter(c=>c.count>0).sort((a,b)=>distance(payload,a)-distance(payload,b)||a.id.localeCompare(b.id));
        team.order.cohortId=cohorts[0]?.id||null;
        team.nextEscortPathTick=s.tick;
      }
      team.status=path.length?(type==='retreat'?'withdrawing':'moving'):'holding';
      const result={ok:true,message:type==='perimeter'?'Perímetro ordenado: um material reservado; montagem à chegada.':'Ordem aceite; execução autónoma pela equipa.'};
      s.acceptedCommands.push({...payload,tick:s.tick});
      this._commands.set(commandId,{payload,result});
      this._event('order',team.name+': '+type+'.',{...payload,barriersSpent:type==='perimeter'?1:0});
      return {...result};
    }
    step(ticks=1){
      if(!Number.isSafeInteger(ticks)||ticks<1||ticks>10000)return {ok:false,message:'Avançar entre 1 e 10000 ticks inteiros.'};
      for(let i=0;i<ticks&&this.state.phase==='running';i++)this._tick();
      return this.state;
    }
    _move(entity,speed,barriers=false){
      let remaining=speed*TICK_SECONDS;
      while(remaining>1e-10&&entity.path.length){
        const target=entity.path[0],d=distance(entity,target);
        if(d<1e-8){entity.x=target.x;entity.z=target.z;entity.path.shift();continue;}
        const step=Math.min(d,remaining),next={x:entity.x+(target.x-entity.x)/d*step,z:entity.z+(target.z-entity.z)/d*step};
        const barrier=barriers?this.state.barriers.find(b=>b.hp>0&&distance(next,b)<1.7):null;
        if(barrier){
          const pressure=entity.count*.25*TICK_SECONDS;
          barrier.pressure+=pressure;barrier.hp=Math.max(0,barrier.hp-pressure);
          entity.status='pressuring';
          if(barrier.hp===0)this._event('breach','Uma barreira cedeu à pressão da horda.',{barrierId:barrier.id,hordeId:entity.id});
          return;
        }
        entity.x=next.x;entity.z=next.z;remaining-=step;
        if(step===d)entity.path.shift();
      }
    }
    _lineOfSight(a,b){
      const steps=Math.max(1,Math.ceil(distance(a,b)*4));
      for(let i=0;i<=steps;i++)if(!walkable(this.state.map,a.x+(b.x-a.x)*i/steps,a.z+(b.z-a.z)*i/steps))return false;
      return true;
    }
    _withdraw(team,reason){
      if(team.order.type==='retreat'||team.health<=0)return;
      if(team.pendingBarrier){this.state.resources.barriersLost++;team.pendingBarrier=null;}
      team.order={type:'retreat',...this.state.mission.base};
      team.path=findPath(this.state.map,team,this.state.mission.base)||[];
      team.status='withdrawing';
      this._event('withdrawal',team.name+' retira autonomamente: '+reason+'.',{teamId:team.id,reason});
    }
    _teams(){
      const s=this.state;
      for(const team of s.teams){
        if(team.health<=0){team.status='incapacitated';continue;}
        if(team.health<25||team.ammo===0||team.stamina<.08)this._withdraw(team,team.ammo===0?'munições esgotadas':team.health<25?'integridade crítica':'fadiga');
        if(team.order.type==='escort'){
          const convoy=s.civilians.find(c=>c.id===team.order.cohortId);
          if(convoy?.count>0&&s.tick>=team.nextEscortPathTick){
            team.path=distance(team,convoy)>1.6?(findPath(s.map,team,convoy)||[]):[];
            team.nextEscortPathTick=s.tick+10;
          }else if(convoy&&convoy.count===0){
            team.order={type:'defend',x:center(team.x),z:center(team.z)};team.path=[];
            this._event('escort','Escolta concluída; a equipa mantém a posição.',{teamId:team.id,cohortId:convoy.id});
          }
        }
        const moving=team.path.length>0;
        this._move(team,team.order.type==='retreat'?2.2:1.9);
        team.stamina=Math.max(0,Math.min(1,team.stamina+(moving?-.013:.025)*TICK_SECONDS));
        if(!team.path.length){
          team.status=team.order.type==='retreat'?'exhausted':'holding';
          if(team.pendingBarrier){
            s.barriers.push({...team.pendingBarrier,hp:80,maxHp:80,pressure:0});
            this._event('perimeter','Barreira montada; os civis e equipas mantêm passagem.',{teamId:team.id,barrierId:team.pendingBarrier.id});
            team.pendingBarrier=null;
          }
        }
        if(team.order.type==='move'||team.order.type==='retreat'||team.ammo===0||s.tick<team.nextShotTick)continue;
        const targets=s.hordes.filter(h=>h.count>0&&s.tick>=h.activeFromTick&&distance(team,h)<=7.8&&this._lineOfSight(team,h));
        targets.sort((a,b)=>distance(team,a)-distance(team,b)||a.id.localeCompare(b.id));
        const target=targets[0];
        if(target){
          target.count--;team.ammo--;team.shots++;team.nextShotTick=s.tick+5;s.neutralizedTotal++;
          if(target.count===0){target.status='neutralized';target.active=false;target.path=[];this._event('neutralized','Uma horda foi neutralizada sem novo óbito humano.',{hordeId:target.id,teamId:team.id});}
        }
      }
    }
    _civilians(){
      const s=this.state;
      for(const cohort of s.civilians){
        if(cohort.count===0||s.tick<cohort.releaseTick)continue;
        if(cohort.status==='waiting'){
          cohort.status='inTransit';cohort.path=findPath(s.map,cohort,s.mission.exit)||[];
          this._event('departure',cohort.name+' iniciou a deslocação para a saída.',{cohortId:cohort.id,count:cohort.count});
        }
        const escorted=s.teams.some(t=>t.health>0&&t.order.type==='escort'&&distance(t,cohort)<5);
        this._move(cohort,escorted?.85:.46);
        if(!cohort.path.length&&distance(cohort,s.mission.exit)<.8){
          const arrivals=cohort.count;cohort.evacuated+=arrivals;cohort.count=0;cohort.status='evacuated';
          this._event('arrival',cohort.name+': '+arrivals+' civis chegaram à saída.',{cohortId:cohort.id,count:arrivals});
        }
      }
    }
    _hordes(){
      const s=this.state;
      for(const horde of s.hordes){
        horde.active=horde.count>0&&s.tick>=horde.activeFromTick;
        if(horde.count===0||s.tick<horde.activeFromTick)continue;
        const targets=s.civilians.filter(c=>c.count>0);
        targets.sort((a,b)=>distance(horde,a)-distance(horde,b)||a.id.localeCompare(b.id));
        const target=targets[0]||s.mission.exit;
        const targetId=target.id||'exit';
        if(s.tick>=horde.nextPathTick||horde.targetId!==targetId||!horde.path.length){
          horde.path=findPath(s.map,horde,target)||[];horde.targetId=targetId;horde.nextPathTick=s.tick+10;
        }
        horde.status='approaching';this._move(horde,.68,true);
        for(const cohort of s.civilians){
          if(cohort.count===0||distance(horde,cohort)>1.15)continue;
          cohort.exposure+=horde.count*.075*TICK_SECONDS;
          const deaths=Math.min(cohort.count,Math.floor(cohort.exposure));
          if(deaths){
            cohort.exposure-=deaths;cohort.count-=deaths;cohort.dead+=deaths;horde.count+=deaths;
            this._event('loss',cohort.name+': '+deaths+' morte(s) humana(s) e reanimação; mesma pessoa contabilizada uma vez.',{cohortId:cohort.id,hordeId:horde.id,count:deaths});
            if(cohort.count===0){cohort.status='lost';cohort.path=[];}
          }
        }
        for(const team of s.teams)if(team.health>0&&distance(horde,team)<1.4){
          team.health=Math.max(0,team.health-horde.count*.045*TICK_SECONDS);
        }
        if(distance(horde,s.mission.exit)<1.6)s.resources.exitIntegrity=Math.max(0,s.resources.exitIntegrity-horde.count*.12*TICK_SECONDS);
      }
    }
    _population(){
      const s=this.state,p=s.population;
      p.evacuated=s.civilians.reduce((sum,c)=>sum+c.evacuated,0);
      p.living=s.civilians.reduce((sum,c)=>sum+c.count+c.evacuated,0);
      p.dead=s.mission.initialDead+s.civilians.reduce((sum,c)=>sum+c.dead,0);
      p.activeZombies=s.hordes.reduce((sum,h)=>sum+h.count,0);
      p.neutralized=s.neutralizedTotal;
    }
    _zones(){
      const s=this.state;
      for(const zone of s.zones){
        const close=s.hordes.some(h=>h.count>0&&s.tick>=h.activeFromTick&&distance(h,zone)<6);
        const overrun=s.hordes.some(h=>h.count>0&&s.tick>=h.activeFromTick&&distance(h,zone)<2);
        const protectedZone=s.teams.some(t=>t.health>0&&t.ammo>0&&t.order.type!=='retreat'&&distance(t,zone)<5);
        const previous=zone.state;
        zone.state=overrun&&!protectedZone?'lost':close?'threatened':'controlled';
        if(previous!==zone.state)this._event('zone',zone.name+': '+zone.state+'.',{zoneId:zone.id,state:zone.state});
      }
    }
    _finish(phase,reason){
      const s=this.state;s.phase=phase;s.mission.reason=reason;
      s.mission.result={phase,reason,tick:s.tick,evacuated:s.population.evacuated,dead:s.population.dead-s.mission.initialDead,
        neutralized:s.population.neutralized,ammoUsed:s.teams.reduce((sum,t)=>sum+t.shots,0),barriersUsed:s.resources.barriersUsed};
      this._event('result',phase==='success'?'Operação concluída: objetivo de evacuação alcançado.':'Operação falhou: '+reason+'.',copy(s.mission.result));
    }
    _tick(){
      const s=this.state;s.tick++;s.timeSeconds=s.tick/10;
      this._teams();this._civilians();this._hordes();this._population();this._zones();
      const unresolved=s.civilians.reduce((sum,c)=>sum+c.count,0);
      if(s.resources.exitIntegrity<=0)this._finish('failure','a saída humanitária foi perdida');
      else if(s.population.evacuated+unresolved<s.mission.evacTarget)this._finish('failure','já não existem civis suficientes para cumprir o objetivo');
      else if(unresolved===0)this._finish(s.population.evacuated>=s.mission.evacTarget?'success':'failure','todos os grupos foram resolvidos');
      else if(s.timeSeconds>=s.mission.maxSeconds)this._finish(s.population.evacuated>=s.mission.evacTarget?'success':'failure','prazo da operação esgotado');
    }
  }
  const api={UrbanOperation,createScenario,TICK_SECONDS,ORDERS};
  root.UrbanSim=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
