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
