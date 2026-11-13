'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {LivingCity,TICK_SECONDS,positionOf}=require('../living-city/core/world.cjs');
const {checkInvariants}=require('../scripts/report-living-city.cjs');
const create=options=>new LivingCity({seed:16927,scenario:'S0',...options});
const fullState=world=>structuredClone({state:world.state,commands:[...world._commands]});
function graphCheck(graph) {
  const nodes=new Map(graph.nodes.map(n=>[n.id,n])),adj=new Map(graph.nodes.map(n=>[n.id,[]]));
  assert.equal(nodes.size,graph.nodes.length,'Graph nodes have unique IDs');
  for(const node of nodes.values())assert.ok(Number.isFinite(node.x)&&Number.isFinite(node.z));
  for(const edge of graph.edges) {
    assert.ok(nodes.has(edge.from)&&nodes.has(edge.to),'An edge cannot reference an absent node');
    assert.ok(Number.isFinite(edge.length)&&edge.length>0,'Graph distances must be positive');
    if(!edge.blocked){adj.get(edge.from).push(edge.to);adj.get(edge.to).push(edge.from);}
  }
  const seen=new Set(),pending=[graph.nodes[0].id];
  while(pending.length){const id=pending.pop();if(seen.has(id))continue;seen.add(id);pending.push(...adj.get(id).filter(n=>!seen.has(n)));}
  assert.equal(seen.size,nodes.size,'Default transport graph must be connected');
  return nodes;
}
function buildingBlock(city,building) {
  return city.blocks.find(b=>Math.abs(building.x-b.x)<=b.width/2&&Math.abs(building.z-b.z)<=b.depth/2)?.id;
}

test('LC0: city entrances, sidewalks, crossings and emergency road accesses form connected physical graphs',()=>{
  const world=create(),city=world.state.city,ped=graphCheck(city.pedestrianGraph),road=graphCheck(city.vehicleGraph);
  assert.ok(city.blocks.length>=6&&city.blocks.length<=10);
  assert.ok(city.buildings.length>=20&&city.buildings.length<=60);
  assert.ok(city.crossings.length>0&&city.sidewalks.length>0);
  assert.ok([...ped.keys()].every(id=>!road.has(id)),'Pedestrian and vehicle networks are distinct');
  assert.equal(city.buildings.filter(b=>b.type==='hospital').length,1);
  assert.equal(city.buildings.filter(b=>b.type==='station').length,1);
  for(const building of city.buildings) {
    assert.ok(buildingBlock(city,building),'Every building belongs to a physical block');
    assert.ok(building.entranceNodeIds.length>0);
    for(const entranceId of building.entranceNodeIds) {
      assert.ok(ped.has(entranceId),'Used buildings need a connected pedestrian entrance');
      const entrance=ped.get(entranceId);
      assert.ok(Math.abs(entrance.x-building.x)>=building.width/2||Math.abs(entrance.z-building.z)>=building.depth/2,
        'Entrance portal must not end inside an impassable volume');
    }
    if(['hospital','station'].includes(building.type))assert.ok(road.has(building.vehicleNodeId));
  }
  for(const edge of city.pedestrianGraph.edges) {
    const a=ped.get(edge.from),b=ped.get(edge.to),steps=Math.ceil(edge.length*2);
    for(let i=0;i<=steps;i++) {
      const p={x:a.x+(b.x-a.x)*i/steps,z:a.z+(b.z-a.z)*i/steps};
      assert.ok(!city.buildings.some(v=>Math.abs(p.x-v.x)<v.width/2-.02&&Math.abs(p.z-v.z)<v.depth/2-.02),
        `Navigable edge ${edge.from}→${edge.to} cuts through a building`);
    }
  }
});

test('LC0: residents and finite emergency/hospital staff share the same conserved census',()=>{
  const world=create(),state=world.state,counts=checkInvariants(state);
  assert.equal(state.people.filter(p=>p.role==='resident').length,150);
  assert.equal(state.people.filter(p=>p.role==='medic').length,4);
  assert.equal(state.people.filter(p=>p.role==='officer').length,6);
  assert.equal(state.people.filter(p=>p.role==='hospitalStaff').length,4);
  assert.equal(state.initialPopulation,164);
  assert.equal(counts.living,164);assert.equal(counts.dead,0);
  assert.ok(state.people.some(p=>p.location.kind==='building'),'Indoor residents remain in the census');
  assert.ok(state.people.some(p=>p.location.kind==='street'),'Residents start on the street as well as indoors');
  assert.equal(state.vehicles.filter(v=>v.type==='ambulance').length,2);assert.equal(state.patrols.length,3);
  for(const person of state.people) {
    assert.ok(state.city.buildings.some(b=>b.id===person.homeBuildingId));
    assert.ok(state.city.buildings.some(b=>b.id===person.workBuildingId));
    const p=positionOf(state,person);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));
  }
});

test('LC0: seed reproduces the initial town population and snapshots are detached',()=>{
  const a=create({seed:42}),b=create({seed:42}),other=create({seed:2026});
  assert.deepEqual(a.snapshot(),b.snapshot());assert.notDeepEqual(a.snapshot(),other.snapshot());
  const before=a.snapshot(),copy=a.snapshot();
  copy.people[0].x+=100;copy.people[0].location.kind='vehicle';copy.city.pedestrianGraph.edges[0].blocked=true;
  assert.deepEqual(a.snapshot(),before,'Presentation snapshots cannot mutate physical state');
});

test('LC0: ordinary residents complete cross-block routines by physically walking connected streets',()=>{
  const world=create(),ids=world.state.people.map(p=>p.id),buildings=new Map(world.state.city.buildings.map(b=>[b.id,b]));
  let walked=0;
  for(let tick=0;tick<1000;tick++) {
    const before=new Map(world.state.people.filter(p=>p.role==='resident'&&p.location.kind==='street').map(p=>[p.id,{x:p.x,z:p.z,speed:p.walkSpeed*p.mobility}]));
    world.step();checkInvariants(world.state,ids);
    for(const person of world.state.people.filter(p=>p.role==='resident'&&p.location.kind==='street')) {
      const previous=before.get(person.id);if(!previous)continue;
      const distance=Math.hypot(person.x-previous.x,person.z-previous.z);
      assert.ok(distance<=previous.speed*TICK_SECONDS+.000001,'Routine walking cannot teleport between nodes');
      if(distance>0)walked++;
    }
  }
  assert.ok(walked>100,'Many actual walking steps must execute');
  const completed=world.state.people.filter(p=>p.role==='resident'&&p.routineTrips>0);
  assert.ok(completed.length>=10,'A quiet city must actually complete routines');
  assert.ok(completed.some(p=>p.location.kind==='building'&&buildingBlock(world.state.city,buildings.get(p.homeBuildingId))!==buildingBlock(world.state.city,buildings.get(p.location.buildingId))),
    'Completed routine destinations include other blocks');
});

test('LC0: invalid step counts reject atomically without consuming time, RNG or IDs',()=>{
  const world=create();
  for(const ticks of [NaN,Infinity,-Infinity,-1,0,.5,'10',null,{},10001]) {
    const before=fullState(world);assert.equal(world.step(ticks).ok,false);assert.deepEqual(fullState(world),before);
  }
  world.step();assert.equal(world.state.tick,1);assert.equal(world.state.timeSeconds,TICK_SECONDS);
});

test('LC0: equal fixed logical time partitions reproduce every canonical identity and routine',()=>{
  const a=create({seed:2026}),b=create({seed:2026});
  a.step(700);
  for(const ticks of [1,9,17,73,100,200,300])b.step(ticks);
  assert.deepEqual(a.snapshot(),b.snapshot());
  checkInvariants(a.state);checkInvariants(b.state);
});

test('LC1: an ordinary call autonomously completes physical assessment, pickup, hospitalization and return',()=>{
  const world=create(),ids=world.state.people.map(p=>p.id),patientId=world.state.initialPersonId;
  const ambulanceStarts=new Map(world.state.vehicles.filter(v=>v.type==='ambulance').map(v=>[v.id,{x:v.x,z:v.z}]));
  let travelled=false,patientInVehicle=false,patientInHospital=false,medicsOnFoot=false;
  for(let tick=0;tick<2000;tick++) {
    const previous=new Map(world.state.vehicles.map(v=>[v.id,{x:v.x,z:v.z}]));
    world.step();checkInvariants(world.state,ids);
    for(const vehicle of world.state.vehicles.filter(v=>v.type==='ambulance')) {
      const old=previous.get(vehicle.id),distance=Math.hypot(vehicle.x-old.x,vehicle.z-old.z);
      assert.ok(distance<=world.state.config.parameters.ambulanceSpeed*TICK_SECONDS+.000001,'Ambulance must travel, not teleport');
      const start=ambulanceStarts.get(vehicle.id);if(Math.hypot(vehicle.x-start.x,vehicle.z-start.z)>2)travelled=true;
    }
    const patient=world.state.people.find(p=>p.id===patientId);
    patientInVehicle ||= patient.location.kind==='vehicle';patientInHospital ||= patient.location.kind==='hospital';
    medicsOnFoot ||= world.state.people.some(p=>p.role==='medic'&&p.location.kind==='street');
  }
  assert.equal(world._commands.size,0,'Ordinary services must not require player commands');
  const incident=world.state.incidents.find(i=>i.personId===patientId&&i.type==='medical');assert.ok(incident);
  assert.equal(incident.status,'resolved');assert.ok(travelled&&patientInVehicle&&patientInHospital&&medicsOnFoot);
  const events=world.state.events.filter(e=>e.incidentId===incident.id);
  const chain=['IncidentObserved','CallCreated','CallReceived','Triaged','AmbulanceDispatched','AmbulanceEnRoute',
    'AmbulanceOnScene','PatientAssessed','PatientMovingToAmbulance','PatientBoarded','HospitalArrival','PatientAdmitted','AmbulanceReturning','AmbulanceAvailable'];
  let previousTick=-1;
  for(const type of chain) {
    const event=events.find(e=>e.type===type);assert.ok(event,`The actual ${type} phase must execute`);
    assert.ok(event.tick>=previousTick,`${type} cannot precede its prerequisite`);previousTick=event.tick;
  }
  assert.equal(events.filter(e=>e.type==='PatientBoarded').length,1,'One person cannot be picked up twice');
  assert.equal(events.filter(e=>e.type==='PatientAdmitted').length,1);
  assert.ok(world.state.events.some(e=>e.type==='PatientDischarged'&&e.entityIds.includes(patientId)));
  assert.equal(world.state.people.find(p=>p.id===patientId).healthState,'healthy');
  assert.equal(world.state.events.some(e=>['PersonInfected','PersonReanimated','ShotFired'].includes(e.type)),false,'S0 does not create an epidemic or combat');
});

test('LC1: simultaneous calls share one finite ambulance by priority and repeat reports do not duplicate service',()=>{
  const world=create({fixture:'concurrentCalls',ambulances:1,patrols:0});world.step(240);
  checkInvariants(world.state);
  const medical=world.state.incidents.filter(i=>i.type==='medical');assert.equal(medical.length,2);
  const high=medical.find(i=>i.severity===5),low=medical.find(i=>i.severity===2);assert.ok(high&&low);
  assert.equal(high.assignedAmbulanceId,'ambulance-1');assert.equal(low.assignedAmbulanceId,null);
  assert.equal(low.status,'waiting');assert.match(low.waitReason,/ocupad|espera/i);
  const calls=world.state.calls.length,incidentCount=world.state.incidents.length;
  const patient=world.state.people.find(p=>p.id===low.personId);
  for(let repeat=0;repeat<5;repeat++)assert.equal(world.ctx.report(patient,'medical',2,'Dor comunicada',patient.id).id,low.id);
  assert.equal(world.state.calls.length,calls);assert.equal(world.state.incidents.length,incidentCount);
  assert.equal(world.state.vehicles.filter(v=>v.type==='ambulance'&&v.incidentId!==null).length,1);
});

test('LC1: priority overrides are idempotent across field order and invalid commands preserve complete state',()=>{
  const world=create();world.step(225);const incident=world.state.incidents[0];assert.ok(incident);
  const command={commandId:'priority-1',type:'overridePriority',incidentId:incident.id,priority:4};
  assert.equal(world.command(command).ok,true);const once=fullState(world);
  assert.equal(world.command({priority:4,incidentId:incident.id,type:'overridePriority',commandId:'priority-1'}).duplicate,true);
  assert.deepEqual(fullState(world),once);
  for(const input of [null,{},'overridePriority',Object.create(command),{...command,priority:3},{...command,commandId:'new',priority:NaN},
    {...command,commandId:'new',priority:0},{...command,commandId:'new',priority:6},
    {...command,commandId:'new',priority:2.5},{...command,commandId:'new',incidentId:'toString'},
    {...command,commandId:'new',unknown:true}]) {
    const before=fullState(world);assert.equal(world.command(input).ok,false);assert.deepEqual(fullState(world),before);
  }
});

test('LC1: a full hospital keeps the patient physically present with an explicit wait instead of inventing capacity',()=>{
  const world=create({fixture:'hospital-full',hospitalCapacity:1,ambulances:1,patrols:0}),ids=world.state.people.map(p=>p.id);
  const existingPatient=world.state.facilities.hospital.patientIds[0];assert.ok(existingPatient);
  for(let tick=0;tick<1800;tick++){world.step();checkInvariants(world.state,ids);}
  const incident=world.state.incidents.find(i=>i.personId===world.state.initialPersonId&&i.type==='medical');
  assert.ok(incident);assert.equal(incident.status,'handover');assert.match(incident.waitReason,/Hospital lotado/);
  assert.deepEqual(world.state.facilities.hospital.patientIds,[existingPatient]);
  const patient=world.state.people.find(p=>p.id===incident.personId);assert.equal(patient.location.kind,'street');
  assert.equal(patient.healthState,'symptomatic');assert.equal(world.state.events.filter(e=>e.type==='PatientAdmitted'&&e.personId===patient.id).length,0);
});

test('LC1: a blocked road explains the unavailable route and prevents a teleport pickup',()=>{
  const world=create({fixture:'blocked-route',ambulances:1,patrols:0}),vehicle=world.state.vehicles[0],initial={x:vehicle.x,z:vehicle.z};
  const ids=world.state.people.map(p=>p.id);
  for(let tick=0;tick<1000;tick++){world.step();checkInvariants(world.state,ids);}
  const incident=world.state.incidents.find(i=>i.type==='medical');assert.ok(incident);
  assert.equal(incident.assignedAmbulanceId,null);assert.match(incident.waitReason,/Percurso.*interrompido/i);
  assert.deepEqual({x:vehicle.x,z:vehicle.z},initial);assert.equal(vehicle.passengerIds.length,0);
  assert.equal(world.state.events.some(e=>e.type==='PatientBoarded'),false);
});

test('LC1: a broken ambulance is not dispatched and its finite crew never appears at the patient',()=>{
  const world=create({fixture:'broken-vehicle',ambulances:1,patrols:0}),vehicle=world.state.vehicles[0],initial={x:vehicle.x,z:vehicle.z};
  world.step(1000);checkInvariants(world.state);
  assert.equal(vehicle.broken,true);assert.deepEqual({x:vehicle.x,z:vehicle.z},initial);
  const incident=world.state.incidents.find(i=>i.type==='medical');assert.ok(incident);
  assert.equal(incident.assignedAmbulanceId,null);assert.match(incident.waitReason,/avariada/i);
  assert.ok(vehicle.crewIds.every(id=>world.state.people.find(p=>p.id===id).location.vehicleId===vehicle.id));
  assert.equal(world.state.events.some(e=>e.type==='AmbulanceDispatched'),false);
});

test('LC1: a free bed cannot admit a patient when every finite hospital professional is unavailable',()=>{
  const world=create({ambulances:1,patrols:0}),ids=world.state.people.map(p=>p.id);
  for(const staff of world.state.people.filter(p=>p.role==='hospitalStaff')){staff.healthState='critical';staff.taskId='fixture-unavailable';}
  for(let tick=0;tick<1800;tick++){world.step();checkInvariants(world.state,ids);}
  const incident=world.state.incidents.find(i=>i.type==='medical'&&i.personId===world.state.initialPersonId);assert.ok(incident);
  assert.equal(incident.status,'handover');assert.match(incident.waitReason,/profissional|pessoal|equipa|staff/i);
  assert.equal(world.state.facilities.hospital.patientIds.length,0);
  assert.ok(world.state.facilities.hospital.capacity>0);
  assert.equal(world.state.people.find(p=>p.id===incident.personId).location.kind,'street');
  assert.equal(world.state.events.some(e=>e.type==='PatientAdmitted'),false);
});

test('LC2: progressive disease is initially unknown, reaches medical care, and exposes existing responders before reanimation',()=>{
  const world=create({scenario:'S1'}),ids=world.state.people.map(p=>p.id),patientId=world.state.initialPersonId;
  const patient=world.state.people.find(p=>p.id===patientId);
  assert.equal(patient.lifeState,'alive');assert.equal(patient.hostile,false);assert.equal(patient.hasPathogen,true);
  assert.deepEqual(patient.observedSymptoms,[]);assert.equal(world.state.calls.length,0);assert.equal(world.state.counters.knownCases,0);
  world.step(199);assert.equal(world.state.calls.length,0,'Hidden truth must not create an omniscient medical call');
  for(let tick=199;tick<2400;tick++){world.step();checkInvariants(world.state,ids);}
  const events=world.state.events;
  const symptom=events.find(e=>e.type==='SymptomsDeveloped'&&e.entityIds.includes(patientId));
  const call=events.find(e=>e.type==='CallCreated'&&world.state.incidents.some(i=>i.id===e.incidentId&&i.personId===patientId));
  const admission=events.find(e=>e.type==='PatientAdmitted'&&e.personId===patientId);
  const death=events.find(e=>e.type==='HumanDied'&&e.entityIds.includes(patientId));
  const reanimation=events.find(e=>e.type==='PersonReanimated'&&e.entityIds.includes(patientId));
  assert.ok(symptom&&call&&admission&&death&&reanimation,'Disease must complete its existing-person chain');
  assert.ok(symptom.tick<=call.tick&&call.tick<admission.tick&&admission.tick<death.tick&&death.tick<reanimation.tick);
  const clinicalExposure=events.find(e=>e.type==='PersonInfected'&&e.sourceId===patientId&&e.sourceLifeState==='alive'&&
    world.state.people.some(p=>e.entityIds.includes(p.id)&&['medic','hospitalStaff'].includes(p.role)));
  assert.ok(clinicalExposure,'Living symptomatic disease must be capable of medical-contact transmission');
  assert.ok(clinicalExposure.tick<death.tick);assert.ok(clinicalExposure.exposureSeconds>=world.state.outbreak.parameters.exposureSeconds);
  assert.equal(reanimation.originalPersonId,patientId);
  assert.equal(events.filter(e=>e.type==='HumanDied'&&e.entityIds.includes(patientId)).length,1,'Reanimation is not a second human death');
});

test('LC2: a deteriorating passenger transforms in the same ambulance and triggers a physical emergency stop and police request',()=>{
  const world=create({scenario:'S1',ambulances:1,patrols:0,parameters:{criticalSeconds:800000,deathSeconds:900000,
    reanimateDelaySeconds:.1,attackDamagePerSecond:0,zombieSpeed:0,exposureSeconds:100000,infectiousWhileAlive:0}});
  const ids=world.state.people.map(p=>p.id),patient=world.state.people.find(p=>p.id===world.state.initialPersonId);
  let vehicle;
  for(let tick=0;tick<1800;tick++) {
    world.step();checkInvariants(world.state,ids);
    vehicle=world.state.vehicles.find(v=>v.passengerIds.includes(patient.id)&&v.status==='transporting');if(vehicle)break;
  }
  assert.ok(vehicle,'Fixture must execute an actual physical pickup before deterioration');
  assert.equal(patient.location.kind,'vehicle');assert.equal(patient.location.vehicleId,vehicle.id);
  patient.scheduledDeathTick=world.state.tick+1;
  for(let tick=0;tick<150;tick++){world.step();checkInvariants(world.state,ids);}
  assert.equal(patient.lifeState,'reanimated');assert.equal(patient.location.kind,'street');
  assert.ok(!vehicle.passengerIds.includes(patient.id),'Disembarkation removes the former passenger reference');
  assert.equal(vehicle.status,'awaitingPolice');
  const incident=world.state.incidents.find(i=>i.id===vehicle.incidentId);assert.equal(incident.requiresPolice,true);
  assert.match(incident.waitReason,/insegura|policial|patrulha|reforço/i);
  assert.ok(world.state.events.some(e=>e.type==='MedicalSupportRequested'&&e.personId===patient.id));
  assert.equal(world.state.events.filter(e=>e.type==='HumanDied'&&e.entityIds.includes(patient.id)).length,1);
  assert.equal(world.state.events.filter(e=>e.type==='PersonReanimated'&&e.entityIds.includes(patient.id)).length,1);
});

test('LC2: sudden transformation preserves the original resident identity and never spawns a new horde',()=>{
  const world=create({scenario:'S2'}),ids=world.state.people.map(p=>p.id),id=world.state.initialPersonId;
  world.step(299);assert.equal(world.state.people.find(p=>p.id===id).lifeState,'alive');
  assert.equal(world.state.events.some(e=>e.type==='HumanDied'),false);
  world.step();assert.equal(world.state.people.find(p=>p.id===id).lifeState,'dead');checkInvariants(world.state,ids);
  world.step(19);assert.equal(world.state.people.find(p=>p.id===id).lifeState,'dead');
  world.step();assert.equal(world.state.people.find(p=>p.id===id).lifeState,'reanimated');checkInvariants(world.state,ids);
  const event=world.state.events.find(e=>e.type==='PersonReanimated'&&e.entityIds.includes(id));
  assert.ok(event);assert.equal(event.originalPersonId,id);assert.equal(event.deathTick,300);
  assert.equal(world.state.people.length,ids.length);assert.equal(world.state.counters.dead,1);
  assert.equal(world.state.counters.reanimatedHistorical,1);
});

function putOnStreet(world,person,node) {
  person.location={kind:'street',nodeId:node.id};person.nodeId=node.id;person.x=node.x;person.z=node.z;
  person.path=[];person.taskId='controlled-fixture';person.activity='resting';person.nextRoutineTick=1000000;
}
function contactFixture(parameters={}) {
  const world=create({residents:4,ambulances:0,patrols:0,parameters:{attackDamagePerSecond:0,zombieSpeed:0,infectiousWhileAlive:0,...parameters}});
  for(const person of world.state.people){person.location={kind:'building',buildingId:person.homeBuildingId};person.path=[];person.taskId='controlled-fixture';}
  const source=world.state.people.find(p=>p.id===world.state.initialPersonId),target=world.state.people.find(p=>p.role==='resident'&&p.id!==source.id);
  const node=world.state.city.pedestrianGraph.nodes.find(n=>n.id==='block-1-walk-1');
  putOnStreet(world,source,node);putOnStreet(world,target,node);
  Object.assign(source,{lifeState:'reanimated',healthState:'deceased',hostile:true,hp:55,reanimatedAt:0,hasPathogen:true});
  world._counters();return {world,source,target};
}

test('LC2: contact infection requires measured duration and distance, with no instant or remote conversion',()=>{
  const {world,source,target}=contactFixture(),ids=world.state.people.map(p=>p.id);
  for(let tick=0;tick<79;tick++){world.step();checkInvariants(world.state,ids);}
  assert.notEqual(target.hasPathogen,true);assert.equal(target.exposureTicks,79);assert.equal(target.healthState,'exposed');
  const far=world.state.city.pedestrianGraph.nodes.find(n=>Math.hypot(n.x-source.x,n.z-source.z)>20);
  putOnStreet(world,target,far);world.step(50);
  assert.equal(target.exposureTicks,79,'Time outside contact radius cannot accumulate exposure');assert.notEqual(target.hasPathogen,true);
  putOnStreet(world,target,world.state.city.pedestrianGraph.nodes.find(n=>n.id===source.nodeId));world.step();
  assert.equal(target.hasPathogen,true);assert.equal(target.exposureSeconds,8);
  const event=world.state.events.find(e=>e.type==='PersonInfected'&&e.entityIds.includes(target.id));assert.ok(event);
  assert.equal(event.sourceId,source.id);assert.equal(event.exposureSeconds,8);checkInvariants(world.state,ids);
});

test('LC2: physically occluded people do not transmit through an intervening building',()=>{
  const {world,source,target}=contactFixture({exposureDistance:25,exposureSeconds:1});
  const nodes=world.state.city.pedestrianGraph.nodes;
  const a=nodes.find(n=>n.id==='building-01-entrance'),b=nodes.find(n=>n.id==='block-1-walk-5');
  putOnStreet(world,source,a);putOnStreet(world,target,b);assert.equal(world.ctx.lineOfSight(a,b),false);
  assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<25,'Fixture is in range, so the wall is the relevant veto');
  world.step(30);assert.equal(target.exposureTicks,0);assert.notEqual(target.hasPathogen,true);
});

test('LC1 regression: duplicate reports preserve a manual priority until genuinely new observed severity escalates',()=>{
  const world=create();world.step(225);const incident=world.state.incidents[0],patient=world.state.people.find(p=>p.id===incident.personId);
  assert.equal(world.command({commandId:'lower-known-case',type:'overridePriority',incidentId:incident.id,priority:1}).ok,true);
  for(let i=0;i<5;i++)world.ctx.report(patient,'medical',incident.severity,'Dor comunicada',patient.id);
  world.step(10);assert.equal(incident.priority,1,'Repeated knowledge cannot silently undo an explicit priority');
  world.ctx.report(patient,'medical',5,'Novos sinais de colapso observados',patient.id);
  assert.equal(incident.priority,5);assert.equal(incident.severity,5);
  const escalation=world.state.events.find(e=>e.type==='IncidentSeverityEscalated'&&e.incidentId===incident.id);assert.ok(escalation);
  assert.equal(escalation.previousPriority,1);assert.equal(escalation.priority,5);
});

test('LC1 regression: concurrent handovers reserve one real professional each and wait when that finite staff is busy',()=>{
  const world=create({fixture:'concurrentCalls',ambulances:2,patrols:0,parameters:{handoverSeconds:1000}}),ids=world.state.people.map(p=>p.id);
  const staff=world.state.people.filter(p=>p.role==='hospitalStaff'),fit=staff[0];
  for(const person of staff.slice(1)){person.healthState='critical';person.taskId='fixture-unavailable';}
  let waiting=false,maximumReservations=0;
  for(let tick=0;tick<2000;tick++) {
    world.step();checkInvariants(world.state,ids);
    const reservations=world.state.vehicles.filter(v=>v.hospitalStaffId);maximumReservations=Math.max(maximumReservations,reservations.length);
    assert.ok(reservations.length<=1,'One professional cannot perform two simultaneous handovers');
    if(reservations.length)assert.equal(reservations[0].hospitalStaffId,fit.id);
    if(world.state.vehicles.filter(v=>v.type==='ambulance'&&v.status==='handover').length===2&&
      world.state.incidents.some(i=>/profissional/.test(i.waitReason??''))){waiting=true;break;}
  }
  assert.ok(waiting,'Both actual transports must reach the hospital and contend for staff');assert.equal(maximumReservations,1);
  assert.equal(world.state.facilities.hospital.patientIds.length,0,'Long controlled handovers have not completed yet');
  world.state.config.parameters.handoverSeconds=1;
  for(let tick=0;tick<100;tick++){world.step();checkInvariants(world.state,ids);}
  assert.equal(world.state.events.filter(e=>e.type==='PatientAdmitted').length,2);
});

test('LC1 regression: a crew emergency after admission cannot reopen or duplicate the completed patient history',()=>{
  const world=create({ambulances:1}),ids=world.state.people.map(p=>p.id),patientId=world.state.initialPersonId;
  let admission;
  for(let tick=0;tick<1800;tick++){world.step();checkInvariants(world.state,ids);admission=world.state.events.find(e=>e.type==='PatientAdmitted'&&e.personId===patientId);if(admission)break;}
  assert.ok(admission);const incident=world.state.incidents.find(i=>i.id===admission.incidentId);
  const vehicle=world.state.vehicles.find(v=>v.id===admission.vehicleId),medic=world.state.people.find(p=>p.id===vehicle.crewIds[0]);
  assert.equal(incident.status,'resolved');medic.healthState='critical';medic.symptoms=['collapse'];
  for(let tick=0;tick<100;tick++){world.step();checkInvariants(world.state,ids);}
  assert.equal(incident.status,'resolved');assert.equal(incident.assignedAmbulanceId,null);
  assert.equal(world.state.facilities.hospital.patientIds.filter(id=>id===patientId).length,1);
  assert.equal(world.state.events.filter(e=>e.type==='PatientAdmitted'&&e.personId===patientId).length,1);
});

test('LC3: witnessed hostility follows triage and physical patrol arrival before finite individual officers fire',()=>{
  const world=create({scenario:'S2'}),ids=world.state.people.map(p=>p.id),ammoBefore=world.state.people.filter(p=>p.role==='officer').reduce((n,p)=>n+p.ammo,0);
  let travelled=false;
  const speed=world.state.config.parameters.policeVehicleSpeed??world.policeSystem.POLICE_DEFAULTS.policeVehicleSpeed;
  for(let tick=0;tick<1500;tick++) {
    const previous=new Map(world.state.vehicles.filter(v=>v.type==='police').map(v=>[v.id,{x:v.x,z:v.z}]));
    world.step();checkInvariants(world.state,ids);
    for(const vehicle of world.state.vehicles.filter(v=>v.type==='police')) {
      const old=previous.get(vehicle.id),distance=Math.hypot(vehicle.x-old.x,vehicle.z-old.z);
      assert.ok(distance<=speed*TICK_SECONDS+.000001,'Police vehicles must follow finite-speed physical routes');if(distance>0)travelled=true;
    }
  }
  assert.equal(world._commands.size,0,'Police response must not depend on player orders');
  const events=world.state.events,dispatches=events.filter(e=>e.type==='PatrolDispatched'),shots=events.filter(e=>e.type==='ShotFired');
  assert.ok(dispatches.length>0&&shots.length>0&&travelled);
  for(const dispatch of dispatches) {
    const triage=events.find(e=>e.type==='Triaged'&&e.incidentId===dispatch.incidentId);assert.ok(triage,'Dispatch cannot bypass triage');
    assert.ok(dispatch.tick>=triage.tick);
    const arrival=events.find(e=>e.type==='PatrolOnScene'&&e.incidentId===dispatch.incidentId&&
      e.patrolId===dispatch.patrolId&&e.eventId>dispatch.eventId);
    if(arrival) {
      const distance=Math.hypot(arrival.position.x-dispatch.position.x,arrival.position.z-dispatch.position.z);
      assert.ok(arrival.tick>=dispatch.tick);
      if(distance>0.000001)assert.ok(arrival.tick>dispatch.tick,'Nonzero physical travel requires elapsed logical time');
    }
  }
  for(const shot of shots) {
    assert.equal(world.state.people.find(p=>p.id===shot.shooterId)?.role,'officer');
    assert.equal(shot.ammoSpent,1);assert.equal(shot.weaponClass,'service-sidearm');assert.equal(shot.authorizedBy,'direct-observation');
    assert.ok(['hit','miss'].includes(shot.hitOutcome));assert.ok(Number.isFinite(shot.position.x)&&Number.isFinite(shot.targetPosition.z));
    const identified=events.find(e=>e.type==='ThreatIdentified'&&e.observerId===shot.shooterId&&e.targetId===shot.targetId&&e.tick<=shot.tick);
    assert.ok(identified,'Every shot requires actual prior recognition by its own shooter');
    assert.ok(events.some(e=>e.type==='PersonReanimated'&&e.entityIds.includes(shot.targetId)&&e.tick<=shot.tick));
  }
  assert.ok(shots.some(e=>e.moving===true),'Officers must be able to react before finishing their walking route');
  const ammoAfter=world.state.people.filter(p=>p.role==='officer').reduce((n,p)=>n+p.ammo,0);
  assert.equal(ammoBefore-ammoAfter,shots.reduce((n,e)=>n+e.ammoSpent,0));
});

test('LC3: occupied patrols explain the queue instead of spawning a replacement response',()=>{
  const world=create({scenario:'S2',residents:12,ambulances:0,patrols:1,fixture:'police-busy',parameters:{policeBusySeconds:120}}),ids=world.state.people.map(p=>p.id);
  for(let tick=0;tick<1000;tick++){world.step();checkInvariants(world.state,ids);}
  assert.equal(world.state.patrols.length,1);assert.equal(world.state.patrols[0].status,'busy');
  const waiting=world.state.incidents.filter(i=>i.requiresPolice&&!['resolved','cancelled'].includes(i.status));assert.ok(waiting.length>0);
  assert.ok(waiting.some(i=>/patrulha|reforço/.test(i.waitReason??'')));
  assert.equal(world.state.events.some(e=>e.type==='PatrolDispatched'),false);assert.equal(world.state.events.some(e=>e.type==='ShotFired'),false);
});

function policeFixture({hostile=true,...parameters}={}) {
  const world=create({residents:4,ambulances:0,patrols:1,parameters:{zombieSpeed:0,attackDamagePerSecond:0,exposureSeconds:100000,
    infectiousWhileAlive:0,policeHitChance:1,...parameters}});
  const source=world.state.people.find(p=>p.id===world.state.initialPersonId),patrol=world.state.patrols[0],vehicle=world.state.vehicles.find(v=>v.id===patrol.vehicleId);
  for(const person of world.state.people.filter(p=>p.role!=='officer')){person.location={kind:'building',buildingId:person.homeBuildingId};person.path=[];person.taskId='controlled-fixture';}
  const shooter=world.state.people.find(p=>p.id===patrol.officerIds[0]),other=world.state.people.find(p=>p.id===patrol.officerIds[1]);
  const a=world.state.city.pedestrianGraph.nodes.find(n=>n.id==='block-1-walk-0'),b=world.state.city.pedestrianGraph.nodes.find(n=>n.id==='block-1-walk-1');
  putOnStreet(world,shooter,a);putOnStreet(world,source,b);other.ammo=0;shooter.ammo=2;
  Object.assign(source,hostile?{lifeState:'reanimated',healthState:'deceased',hostile:true,hp:55,reanimatedAt:0,hasPathogen:true}:
    {lifeState:'alive',healthState:'infected',hostile:false,hasPathogen:true,infectedAt:0,symptomTick:100000,criticalTick:100000,scheduledDeathTick:100000});
  const incident=world.ctx.report(source,'violence',5,'Controlled previously reported scene',shooter.id);
  incident.status='onScene';incident.reportedAt=0;incident.assignedPatrolId=patrol.id;
  for(const call of world.state.calls){call.status='triaged';call.receivedAt=0;}
  patrol.status='approaching';patrol.incidentId=incident.id;patrol.sceneTick=0;vehicle.status='onScene';vehicle.incidentId=incident.id;
  shooter.taskId=incident.id;shooter.knownThreats=[source.id];world.ctx.routePerson(shooter,b.id);world._counters();
  return {world,source,shooter,other,patrol,vehicle,incident};
}

test('LC3: a known but living infected nonhostile person is never an automatic police target',()=>{
  const {world,source,shooter}=policeFixture({hostile:false});world.step(30);checkInvariants(world.state);
  assert.equal(source.lifeState,'alive');assert.equal(source.hostile,false);assert.equal(source.hasPathogen,true);
  assert.equal(shooter.ammo,2);assert.equal(world.state.events.some(e=>e.type==='ShotFired'),false);
});

test('LC3: line of sight and an innocent bystander veto fire even when a hostile target is recognized and in range',()=>{
  const wall=policeFixture({policeFireRange:25,policeObserveRange:25,policeApproachSpeed:0});
  const nodes=wall.world.state.city.pedestrianGraph.nodes,a=nodes.find(n=>n.id==='building-01-entrance'),b=nodes.find(n=>n.id==='block-1-walk-5');
  putOnStreet(wall.world,wall.shooter,a);putOnStreet(wall.world,wall.source,b);
  assert.equal(wall.world.ctx.lineOfSight(a,b),false);wall.world.step(20);
  assert.equal(wall.world.state.events.some(e=>e.type==='ShotFired'),false);assert.equal(wall.shooter.ammo,2);
  const clear=policeFixture({policeApproachSpeed:0}),bystander=clear.world.state.people.find(p=>p.role==='resident'&&p.id!==clear.source.id);
  const midpoint={id:clear.shooter.nodeId,x:(clear.shooter.x+clear.source.x)/2,z:(clear.shooter.z+clear.source.z)/2};
  putOnStreet(clear.world,bystander,midpoint);assert.equal(clear.world.ctx.lineOfSight(clear.shooter,clear.source),true);
  clear.world.step(20);assert.equal(clear.world.state.events.some(e=>e.type==='ShotFired'),false);assert.equal(clear.shooter.ammo,2);
  assert.match(clear.shooter.fireHoldReason,/Terceiro/);
  bystander.location={kind:'building',buildingId:bystander.homeBuildingId};clear.world.step();
  assert.equal(clear.world.state.events.filter(e=>e.type==='ShotFired').length,1,'Removing the actual obstruction permits the otherwise authorized shot');
});

test('LC3: an officer fires while still moving, spends finite ammunition and requests backup when empty',()=>{
  const {world,source,shooter}=policeFixture(),deadBefore=world.state.counters.dead;
  world.step(30);checkInvariants(world.state);
  const shots=world.state.events.filter(e=>e.type==='ShotFired');assert.equal(shots.length,2);
  assert.ok(shots.every(e=>e.shooterId===shooter.id&&e.moving===true));assert.equal(shooter.ammo,0);
  assert.equal(source.lifeState,'neutralized');assert.equal(world.state.counters.dead,deadBefore,'Neutralization does not create another human death');
  assert.ok(world.state.events.some(e=>e.type==='BackupRequested'));
  world.step(200);assert.equal(shooter.ammo,0,'Retreat and waiting cannot refill ammunition');
  assert.equal(world.state.events.filter(e=>e.type==='ShotFired').length,2);
});

test('LC3: full outbreak snapshots are deterministic across frame-like tick partitions and reset reconstructs the initial seed',()=>{
  const a=create({seed:42,scenario:'S2'}),b=create({seed:42,scenario:'S2'}),initial=a.snapshot();
  a.step(900);
  for(const ticks of [1,7,92,111,389,300]){b.step(ticks);for(let frame=0;frame<5;frame++)b.snapshot();}
  assert.deepEqual(a.snapshot(),b.snapshot());checkInvariants(a.state);checkInvariants(b.state);
  assert.deepEqual(create({seed:42,scenario:'S2'}).snapshot(),initial);
});
