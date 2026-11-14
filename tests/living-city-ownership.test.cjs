'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {LivingCity}=require('../living-city/core/world.cjs');
const {updatePolice}=require('../living-city/core/police.cjs');
const {distance}=require('../living-city/core/helpers.cjs');

function fixture(options={}){
  const world=new LivingCity({seed:42,scenario:'S0',residents:4,ambulances:1,patrols:1,...options});
  const s=world.state,patrol=s.patrols[0],car=s.vehicles.find(v=>v.id===patrol.vehicleId);
  const officer=s.people.find(p=>p.id===patrol.officerIds[0]);
  const ambulance=s.vehicles.find(v=>v.type==='ambulance');
  const subject=s.people.find(p=>p.role==='resident');
  const incident=world.ctx.report(subject,'violence',5,'Ocorrência observada de teste',subject.id);
  incident.status='onScene';incident.reportedAt=0;incident.assignedPatrolId=patrol.id;
  for(const call of s.calls){call.status='triaged';call.receivedAt=0;}
  patrol.status='approaching';patrol.incidentId=incident.id;patrol.sceneTick=0;
  car.path=[];car.status='onScene';car.incidentId=incident.id;car.destinationNodeId=car.nodeId;
  return {world,s,patrol,car,officer,ambulance,incident};
}
function medicalAssignment(f){
  const care=f.world.ctx.report(f.officer,'medical',4,'Doente sob assistência',f.officer.id);
  care.status='assigned';care.reportedAt=0;care.assignedAmbulanceId=f.ambulance.id;
  f.officer.taskId=care.id;
  return care;
}
function tick(f){f.s.tick++;f.s.timeSeconds=f.s.tick/10;updatePolice(f.world.ctx);}

test('ownership: an officer assigned as a medical patient keeps that service route and is not ordered by the source patrol',()=>{
  const f=fixture(),node=f.world.ctx.pedestrianNode('block-1-walk-0');
  Object.assign(f.officer,{x:node.x,z:node.z,nodeId:node.id,path:[],location:{kind:'street',nodeId:node.id},activity:'awaitingAmbulance'});
  const care=medicalAssignment(f);
  f.world.ctx.routePerson(f.officer,'block-1-walk-1');
  const before=structuredClone(f.officer),roster=f.patrol.officerIds.slice();
  tick(f);
  assert.deepEqual(f.officer,before,'police must not replace the medical task, route, activity, resources or position');
  assert.deepEqual(f.patrol.officerIds,roster);
  assert.equal(care.assignedAmbulanceId,f.ambulance.id);
  assert.equal(f.incident.assignedPatrolId,null);
  assert.ok(f.s.events.some(e=>e.type==='BackupRequested'));
  assert.ok(!['available','patrolling','responding'].includes(f.patrol.status));
});

test('ownership: source police cannot disembark or recover an affiliated officer who is an external ambulance passenger',()=>{
  const f=fixture();medicalAssignment(f);
  f.officer.location={kind:'vehicle',vehicleId:f.ambulance.id};f.officer.path=[];f.officer.activity='inAmbulance';
  f.ambulance.passengerIds=[f.officer.id];
  f.patrol.status='responding';
  const before=structuredClone(f.officer),passengers=f.ambulance.passengerIds.slice();
  for(let i=0;i<10;i++)tick(f);
  assert.deepEqual(f.officer,before);
  assert.deepEqual(f.ambulance.passengerIds,passengers);
  assert.ok(f.car.crewIds.includes(f.officer.id),'roster affiliation remains historical membership, not physical possession');
  assert.equal(f.s.events.some(e=>e.type==='OfficerDisembarked'&&e.officerId===f.officer.id),false);
  assert.equal(f.s.events.some(e=>e.type==='OfficerBoarded'&&e.officerId===f.officer.id),false);
});

test('ownership: an assigned medical patient still in the own police car is handed off only at its real stopped access',()=>{
  const f=fixture(),care=medicalAssignment(f),roster=f.car.crewIds.slice();
  assert.equal(f.officer.location.vehicleId,f.car.id);
  tick(f);
  assert.deepEqual(f.officer.location,{kind:'street',nodeId:'foot-'+f.car.nodeId});
  assert.equal(distance(f.officer,f.car),0);
  assert.equal(f.officer.taskId,care.id);
  assert.deepEqual(f.car.crewIds,roster);
  assert.equal(f.ambulance.passengerIds.length,0);
  assert.equal(f.s.events.filter(e=>e.type==='OfficerMedicalHandoff'&&e.officerId===f.officer.id).length,1);
  const handedOff=structuredClone(f.officer);
  tick(f);
  assert.deepEqual(f.officer,handedOff,'the source patrol cannot continue moving the medical patient after handoff');
});

test('ownership: autonomous medical care can physically collect an officer after the source car hands them off',()=>{
  const world=new LivingCity({seed:42,scenario:'S0',residents:4,ambulances:1,patrols:1});
  const officer=world.state.people.find(p=>p.role==='officer');
  officer.healthState='symptomatic';officer.symptoms=['pain'];officer.medicalSeverity=5;
  const originalIds=world.state.people.map(p=>p.id);
  let boarded=false;
  for(let i=0;i<4000&&!boarded;i++){
    world.step();
    boarded=world.state.events.some(e=>e.type==='PatientBoarded'&&e.personId===officer.id);
  }
  assert.ok(world.state.events.some(e=>e.type==='OfficerMedicalHandoff'&&e.officerId===officer.id));
  assert.ok(boarded,'a safe handoff must not strand a patient inside the parked source-car collision footprint');
  const ambulance=world.state.vehicles.find(v=>v.passengerIds.includes(officer.id));
  assert.ok(ambulance?.type==='ambulance');
  assert.equal(officer.location.vehicleId,ambulance.id);
  assert.deepEqual(world.state.people.map(p=>p.id),originalIds);
});

test('ownership: the parked handoff door never admits foreign or unassigned people, closed care, or a moving source car',()=>{
  for(const variant of ['unassigned','foreign','closed','no-ambulance','moving-path','moving-speed']){
    const f=fixture({ambulances:2}),care=medicalAssignment(f);
    f.car.status='unavailable';f.car.currentSpeed=0;f.car.path=[];f.car.incidentId=null;
    const foot=f.world.ctx.pedestrianNode('foot-'+f.car.nodeId);
    Object.assign(f.officer,{x:foot.x,z:foot.z,nodeId:foot.id,path:[],location:{kind:'street',nodeId:foot.id}});
    f.ambulance.incidentId=care.id;
    const ambulance=variant==='foreign'?f.s.vehicles.find(v=>v.type==='ambulance'&&v.id!==f.ambulance.id):f.ambulance;
    const medic=f.s.people.find(p=>p.id===ambulance.crewIds[0]);
    const edge=f.s.city.pedestrianGraph.edges.find(e=>e.from===foot.id||e.to===foot.id);
    const neighbor=f.world.ctx.pedestrianNode(edge.from===foot.id?edge.to:edge.from),length=distance(foot,neighbor);
    Object.assign(medic,{x:foot.x+(neighbor.x-foot.x)*1.4/length,z:foot.z+(neighbor.z-foot.z)*1.4/length,
      nodeId:neighbor.id,path:[foot.id],destinationNodeId:foot.id,location:{kind:'street',nodeId:neighbor.id},
      taskId:variant==='unassigned'?null:care.id,travelEdge:{from:neighbor.id,to:foot.id}});
    if(variant==='closed')care.status='resolved';
    if(variant==='no-ambulance')care.assignedAmbulanceId=null;
    if(variant==='moving-path'){
      const road=f.s.city.vehicleGraph.edges.find(e=>e.from===f.car.nodeId||e.to===f.car.nodeId);
      f.car.path=[road.from===f.car.nodeId?road.to:road.from];
    }
    if(variant==='moving-speed')f.car.currentSpeed=1;
    const before={x:medic.x,z:medic.z};
    assert.equal(f.world.ctx.routePersonToPoint(medic,f.officer),false,variant+' cannot use the parked source-car care exception in path planning');
    f.world.ctx.movePerson(medic,1);
    assert.equal(distance(medic,before),0,variant+' remains physically blocked at the next step');
    assert.equal(f.officer.location.kind,'street');
    assert.equal(f.car.crewIds.filter(id=>id===f.officer.id).length,1);
  }
});

test('ownership: hospital care excludes the source roster from a new patrol dispatch without changing the patient or hospital occupancy',()=>{
  const f=fixture(),hospital=f.s.facilities.hospital;
  f.officer.location={kind:'hospital',buildingId:hospital.buildingId};
  f.officer.taskId='hospital-care';f.officer.activity='hospitalized';
  hospital.patientIds.push(f.officer.id);
  f.patrol.status='patrolling';f.patrol.incidentId=null;f.car.incidentId=null;
  f.incident.status='waiting';f.incident.assignedPatrolId=null;
  const before=structuredClone(f.officer),patients=hospital.patientIds.slice();
  tick(f);
  assert.deepEqual(f.officer,before);
  assert.deepEqual(hospital.patientIds,patients);
  assert.equal(f.incident.assignedPatrolId,null);
  assert.equal(f.s.events.some(e=>e.type==='PatrolDispatched'),false);
  assert.ok(!['available','patrolling','responding'].includes(f.patrol.status));
});

test('ownership: loss of operational crew stops at the next real road node and releases only the source police assignment',()=>{
  const f=fixture();medicalAssignment(f);
  f.officer.location={kind:'vehicle',vehicleId:f.ambulance.id};f.officer.activity='inAmbulance';
  f.ambulance.passengerIds=[f.officer.id];
  const edge=f.s.city.vehicleGraph.edges.find(e=>e.from===f.car.nodeId||e.to===f.car.nodeId);
  const nextId=edge.from===f.car.nodeId?edge.to:edge.from;
  const from=f.world.ctx.roadNode(f.car.nodeId),to=f.world.ctx.roadNode(nextId),length=distance(from,to);
  f.car.x=from.x+(to.x-from.x)*.25;f.car.z=from.z+(to.z-from.z)*.25;
  f.car.path=[nextId];f.car.destinationNodeId=nextId;f.car.travelEdge={from:from.id,to:nextId};
  f.patrol.status='responding';
  const patient=structuredClone(f.officer),ids=f.s.people.map(p=>p.id);
  for(let i=0;i<200&&f.car.path.length;i++){
    const old={x:f.car.x,z:f.car.z};tick(f);
    assert.ok(distance(f.car,old)<=5.5*.1+1e-8);
  }
  assert.equal(f.car.path.length,0);
  assert.equal(distance(f.car,to),0);
  assert.equal(f.car.nodeId,nextId);
  assert.equal(f.incident.assignedPatrolId,null);
  assert.deepEqual(f.officer,patient);
  assert.deepEqual(f.ambulance.passengerIds,[f.officer.id]);
  assert.deepEqual(f.s.people.map(p=>p.id),ids);
});

test('ownership: police boarding requires contact with the own vehicle parked at its actual road node',()=>{
  const f=fixture(),from=f.world.ctx.roadNode(f.car.nodeId);
  const edge=f.s.city.vehicleGraph.edges.find(e=>e.from===from.id||e.to===from.id);
  const to=f.world.ctx.roadNode(edge.from===from.id?edge.to:edge.from);
  f.car.x=from.x+(to.x-from.x)*.1;f.car.z=from.z+(to.z-from.z)*.1;
  f.patrol.status='returning';f.patrol.incidentId=null;
  Object.assign(f.officer,{location:{kind:'street',nodeId:'foot-'+from.id},nodeId:'foot-'+from.id,
    destinationNodeId:'foot-'+from.id,x:f.car.x,z:f.car.z,path:[],taskId:null,activity:'returning'});
  tick(f);
  assert.equal(f.officer.location.kind,'street','near a stopped mid-edge vehicle is not a valid boarding/access node');
  assert.equal(f.s.events.some(e=>e.type==='OfficerBoarded'&&e.officerId===f.officer.id),false);
});

test('police retry: a healthy response waits through a temporary road closure and resumes the same physical assignment',()=>{
  const f=fixture();
  for(const person of f.s.people.filter(p=>p.role==='resident')){person.location={kind:'building',buildingId:person.homeBuildingId};person.path=[];}
  const goal=f.s.city.vehicleGraph.nodes.find(n=>n.id!==f.car.nodeId);
  assert.equal(f.world.ctx.routeVehicle(f.car,goal.id),true);
  const from=f.world.ctx.roadNode(f.car.nodeId),next=f.world.ctx.roadNode(f.car.path[0]);
  f.car.x=from.x+(next.x-from.x)*.25;f.car.z=from.z+(next.z-from.z)*.25;
  f.car.travelEdge={from:from.id,to:next.id};f.patrol.status='responding';f.car.status='responding';
  const ids=f.s.people.map(p=>p.id);
  for(const edge of f.s.city.vehicleGraph.edges)edge.blocked=true;
  tick(f);
  assert.equal(f.patrol.status,'responding','a transient access failure cannot discard an otherwise healthy response');
  assert.equal(f.incident.assignedPatrolId,f.patrol.id);
  assert.equal(f.patrol.incidentId,f.incident.id);
  assert.match(f.incident.waitReason,/percurso|via|acesso/i);
  for(const edge of f.s.city.vehicleGraph.edges)edge.blocked=false;
  let arrived=false;
  for(let i=0;i<600&&!arrived;i++){
    const old={x:f.car.x,z:f.car.z};tick(f);
    assert.ok(distance(f.car,old)<=5.5*.1+1e-8);
    arrived=f.s.events.some(e=>e.type==='PatrolOnScene'&&e.incidentId===f.incident.id);
  }
  assert.ok(arrived);
  assert.equal(distance(f.car,goal),0);
  assert.equal(f.incident.assignedPatrolId,f.patrol.id);
  assert.equal(f.s.events.some(e=>e.type==='BackupRequested'),false);
  assert.deepEqual(f.s.people.map(p=>p.id),ids);
});

test('police retry: an initially blocked walking return is replanned after reopening and boards only at real own-car contact',()=>{
  const f=fixture();
  for(const person of f.s.people.filter(p=>p.role==='resident')){person.location={kind:'building',buildingId:person.homeBuildingId};person.path=[];}
  const node=f.world.ctx.pedestrianNode('block-1-walk-0');
  Object.assign(f.officer,{x:node.x,z:node.z,nodeId:node.id,location:{kind:'street',nodeId:node.id},
    path:[],destinationNodeId:node.id,activity:'assessing',taskId:f.incident.id});
  f.patrol.sceneTick=-100;f.car.currentSpeed=0;
  const ids=f.s.people.map(p=>p.id),ammo=f.officer.ammo;
  for(const edge of f.s.city.pedestrianGraph.edges)edge.blocked=true;
  tick(f);
  assert.equal(f.patrol.status,'returning');
  assert.equal(f.officer.path.length,0,'the initial real walking route must fail while disconnected');
  for(let i=0;i<20;i++)tick(f);
  assert.equal(f.officer.location.kind,'street');
  for(const edge of f.s.city.pedestrianGraph.edges)edge.blocked=false;
  let boarded=false;
  for(let i=0;i<1500&&!boarded;i++){
    const old=f.world.ctx.position(f.officer);tick(f);
    assert.ok(distance(f.world.ctx.position(f.officer),old)<=1.75*.1+1e-8);
    boarded=f.officer.location.kind==='vehicle';
  }
  assert.ok(boarded);
  assert.equal(f.officer.location.vehicleId,f.car.id);
  assert.equal(distance(f.world.ctx.position(f.officer),f.car),0);
  assert.equal(distance(f.car,f.world.ctx.roadNode(f.car.nodeId)),0);
  assert.ok(f.s.events.some(e=>e.type==='OfficerBoarded'&&e.officerId===f.officer.id));
  assert.equal(f.officer.ammo,ammo);
  assert.deepEqual(f.s.people.map(p=>p.id),ids);
});
