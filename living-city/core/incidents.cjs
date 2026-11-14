'use strict';
const {distance}=require('./helpers.cjs');
const CLOSED=new Set(['resolved','cancelled']);
function reportIncident(ctx,person,type,severity,knownFact,reporterId){
  const s=ctx.state;
  if(!person||!s.people.some(p=>p===person)||!['medical','violence'].includes(type)||!Number.isFinite(severity)||severity<1||severity>5)return null;
  let incident=s.incidents.find(i=>i.personId===person.id&&i.type===type&&!CLOSED.has(i.status));
  if(incident){
    if(knownFact&&!incident.knownFacts.includes(knownFact))incident.knownFacts.push(knownFact);
    if(reporterId&&!incident.witnessIds.includes(reporterId))incident.witnessIds.push(reporterId);
    const previousSeverity=incident.severity,previousPriority=incident.priority;
    incident.severity=Math.max(incident.severity,severity);
    if(incident.manualPriority===undefined||severity>previousSeverity)incident.priority=Math.max(incident.priority,severity);
    if(severity>previousSeverity)ctx.emit('IncidentSeverityEscalated','Novos sinais observados aumentaram a gravidade da ocorrência.',{
      entityIds:[incident.id,person.id,reporterId].filter(Boolean),incidentId:incident.id,visibility:'reported',previousSeverity,severity:incident.severity,
      previousPriority,priority:incident.priority,manualOverrideSuperseded:incident.manualPriority!==undefined&&incident.priority>previousPriority
    });
    return incident;
  }
  const position=ctx.position(person),id=`incident-${++s.incidentSequence}`;
  incident={id,type,personId:person.id,...position,nodeId:ctx.nearestPedNode(position),severity,observedAt:s.tick,reportedAt:null,reporterId,
    knownFacts:knownFact?[knownFact]:[],confirmedFacts:[],status:'calling',assignedAmbulanceId:null,assignedPatrolId:null,priority:severity,waitReason:null,
    witnessIds:reporterId?[reporterId]:[],requiresPolice:type==='violence',policeStatus:type==='violence'?'waiting':null,eventIds:[]};
  incident.origin={position:{...position},location:{...person.location},activity:person.activity,
    routineActivity:person.medicalEpisode?.origin.activity||person.activity,episodeId:person.medicalEpisode?.id||null};
  s.incidents.push(incident);
  const observed=ctx.emit('IncidentObserved','Uma ocorrência foi observada por uma pessoa presente.',{entityIds:[person.id,reporterId,id].filter(Boolean),position,visibility:'reported',incidentId:id,knownFact});incident.eventIds.push(observed.eventId);
  const call={id:`call-${++s.callSequence}`,incidentId:id,callerId:reporterId,createdAt:s.tick,receivedAt:null,receiveTick:s.tick+Math.max(1,Math.round(s.config.parameters.callDelaySeconds*10)),status:'calling'};
  s.calls.push(call);ctx.emit('CallCreated','Foi iniciada uma chamada para a central.',{entityIds:[id,call.id,reporterId].filter(Boolean),position,visibility:'reported',incidentId:id,callId:call.id});
  return incident;
}
function setWait(ctx,incident,reason){
  if(incident.waitReason===reason)return;incident.waitReason=reason;
  if(reason)ctx.emit('ServiceWaiting',reason,{entityIds:[incident.id],incidentId:incident.id,visibility:'reported'});
}
function initializeIncidents(ctx){
  const s=ctx.state,fixture=s.config.fixture;
  s.normalEpisodes={sequence:0,records:[],nextReviewTick:80+Math.floor(ctx.random()*120),refractoryUntil:0};
  if(fixture==='brokenVehicle'){
    const vehicle=s.vehicles.find(v=>v.type==='ambulance');if(vehicle){vehicle.broken=true;vehicle.status='blocked';vehicle.waitReason='Viatura avariada; indisponível para despacho.';}
  }
  if(fixture==='blockedRoute'){
    const hospital=s.city.buildings.find(b=>b.id===s.facilities.hospital.buildingId);
    for(const edge of s.city.vehicleGraph.edges)if(edge.from===hospital.vehicleNodeId||edge.to===hospital.vehicleNodeId)edge.blocked=true;
  }
  if(fixture==='hospitalFull'){
    const residents=s.facilities.hospital.capacity>0?s.people.filter(p=>p.role==='resident'&&p.id!==s.initialPersonId).slice(-s.facilities.hospital.capacity):[];
    for(const person of residents){
      person.location={kind:'hospital',buildingId:s.facilities.hospital.buildingId};person.taskId='existing-hospital-care';person.activity='hospitalized';person.path=[];person.medicalDischargeTick=1000000;
      s.facilities.hospital.patientIds.push(person.id);
    }
  }
}
function normalIncident(ctx,person,severity,condition='controlled-case'){
  if(!person||person.lifeState!=='alive'||person.taskId||person.location.kind==='hospital'||person.location.kind==='vehicle')return;
  const s=ctx.state,origin={position:ctx.position(person),location:{...person.location},activity:person.activity,
    path:person.path.slice(),destinationBuildingId:person.destinationBuildingId,distanceWalked:person.distanceWalked,routineTrips:person.routineTrips};
  const episode={id:`normal-episode-${++s.normalEpisodes.sequence}`,personId:person.id,onsetTick:s.tick,condition,origin};
  s.normalEpisodes.records.push(episode);person.medicalEpisode=episode;
  person.normalNoticeTick=s.tick+(s.config.fixture==='default'?20+Math.floor(ctx.random()*50):0);
  person.lastNormalEpisodeTick=s.tick;
  person.medicalCondition='injury';person.medicalSeverity=severity;
  if(person.healthState==='healthy')person.healthState='symptomatic';
  if(!person.symptoms.includes('pain'))person.symptoms.push('pain');
  // Freeze the task, not its physical origin/occupied segment. Helpers retain
  // the route so responders can approach a patient who stopped mid-edge.
  person.activity='awaitingHelp';
  ctx.emit('MedicalConditionBegan','Uma pessoa apresenta dor e necessita de avaliação.',{entityIds:[person.id],position:ctx.position(person),visibility:'truth',episodeId:episode.id,condition,origin});
}
function updateNormalEpisodes(ctx){
  const s=ctx.state,scheduler=s.normalEpisodes;
  if(s.scenario!=='S0'||s.config.fixture!=='default'||s.tick<scheduler.nextReviewTick)return;
  scheduler.nextReviewTick=s.tick+30+Math.floor(ctx.random()*70);
  if(s.tick<scheduler.refractoryUntil||s.incidents.filter(i=>i.type==='medical'&&!CLOSED.has(i.status)).length>=2)return;
  const candidates=s.people.filter(p=>p.role==='resident'&&p.lifeState==='alive'&&p.healthState==='healthy'&&!p.taskId&&
    !['vehicle','hospital'].includes(p.location.kind)&&s.tick-(p.lastNormalEpisodeTick??-10000)>=1800&&
    (p.activity==='walking'&&p.distanceWalked>=3||['atHome','atService'].includes(p.activity)&&p.routineTrips>0));
  if(!candidates.length)return;
  const weights=candidates.map(p=>(p.activity==='walking'?1.5:1)+Math.min(.75,p.distanceWalked/150));
  const total=weights.reduce((sum,value)=>sum+value,0);
  // A small seeded hazard is evaluated only for people whose actual routines
  // meet the conditions; a scheduled review alone does not create an episode.
  if(ctx.random()>=.13)return;
  let draw=ctx.random()*total,index=0;
  while(index<weights.length-1&&draw>=weights[index])draw-=weights[index++];
  const person=candidates[index],condition=person.activity==='walking'?'discomfort-after-walking':'discomfort-during-service-or-rest';
  normalIncident(ctx,person,ctx.random()<.2?3:2,condition);
  scheduler.refractoryUntil=s.tick+300+Math.floor(ctx.random()*500);
}
function detect(ctx){
  const s=ctx.state;
  for(const person of s.people){
    if(person.lifeState==='neutralized'||person.lifeState==='dead')continue;
    const signs=person.symptoms||[],violent=person.hostile&&person.lifeState==='reanimated';
    if(!signs.length&&!violent||person.normalNoticeTick&&s.tick<person.normalNoticeTick&&!violent)continue;
    if(!violent&&(person.location.kind==='hospital'||person.taskId==='hospital-care'))continue;
    let observer=null;
    const conscious=person.lifeState==='alive'&&!signs.includes('collapse');
    if(conscious&&signs.length)observer=person;
    else{
      const point=ctx.position(person);
      observer=s.people.find(p=>p.id!==person.id&&p.lifeState==='alive'&&p.healthState!=='critical'&&p.location.kind!=='vehicle'&&
        (p.location.kind===person.location.kind&&p.location.buildingId&&p.location.buildingId===person.location.buildingId||
        p.location.kind==='street'&&person.location.kind==='street'&&distance(ctx.position(p),point)<12&&ctx.lineOfSight(ctx.position(p),point)));
    }
    if(!observer)continue;
    const visibleSigns=violent?['aggressive']:signs;
    for(const sign of visibleSigns)if(!person.observedSymptoms.includes(sign))person.observedSymptoms.push(sign);
    const severity=violent||signs.includes('collapse')?5:person.medicalSeverity||3;
    reportIncident(ctx,person,violent?'violence':'medical',severity,violent?'Comportamento agressivo observado':signs.includes('collapse')?'Perda de consciência observada':signs.includes('fever')?'Febre comunicada':'Dor comunicada',observer.id);
  }
}
function updateIncidents(ctx){
  const s=ctx.state;
  if(s.tick===200&&s.config.fixture!=='default'){
    if(s.scenario==='S0')normalIncident(ctx,s.people.find(p=>p.id===s.initialPersonId),2);
    if(s.config.fixture==='concurrentCalls'){
      normalIncident(ctx,s.people.find(p=>p.id===s.initialPersonId),2);
      const other=s.people.find(p=>p.role==='resident'&&p.id!==s.initialPersonId&&p.location.kind==='street');normalIncident(ctx,other,5);
    }
  }
  updateNormalEpisodes(ctx);
  if(s.tick%5===0)detect(ctx);
  for(const call of s.calls){
    const incident=s.incidents.find(i=>i.id===call.incidentId);
    if(call.status==='calling'&&s.tick>=call.receiveTick){
      call.status='received';call.receivedAt=s.tick;incident.status='received';incident.reportedAt=s.tick;incident.triageTick=s.tick+Math.max(1,Math.round(s.config.parameters.dispatchDelaySeconds*10));
      ctx.emit('CallReceived','A central recebeu a chamada.',{entityIds:[call.id,incident.id],incidentId:incident.id,visibility:'reported'});
    }
    if(call.status==='received'&&s.tick>=incident.triageTick){
      call.status='triaged';incident.status='waiting';
      ctx.emit('Triaged','A central classificou a prioridade e os meios necessários.',{entityIds:[incident.id],incidentId:incident.id,priority:incident.priority,visibility:'reported'});
    }
  }
}
module.exports={initializeIncidents,updateIncidents,reportIncident,setWait};
