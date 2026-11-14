'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {LivingCity,positionOf}=require('../living-city/core/world.cjs');
const seeds=[16927,42,2026];
const routine=p=>({id:p.id,location:p.location,x:p.x,z:p.z,nodeId:p.nodeId,path:p.path,
  activity:p.activity,nextRoutineTick:p.nextRoutineTick,destinationBuildingId:p.destinationBuildingId,
  homeBuildingId:p.homeBuildingId,workBuildingId:p.workBuildingId,routineTrips:p.routineTrips});
const point=(world,person)=>positionOf(world.state,person);
const separation=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function until(world,predicate,limit=6000){
  for(let i=0;i<limit;i++){if(predicate())return;world.step();}
  assert.ok(predicate(),'Expected condition was not reached within bounded logical time.');
}

test('V021 origins: initial case selection preserves every real resident position, route and activity without staged witnesses',()=>{
  for(const seed of seeds){
    const automatic=new LivingCity({seed,scenario:'S0'});
    const other=automatic.state.people.find(p=>p.role==='resident'&&p.id!==automatic.state.initialPersonId);
    const explicit=new LivingCity({seed,scenario:'S0',initialPersonId:other.id});
    assert.notEqual(automatic.state.initialPersonId,explicit.state.initialPersonId);
    assert.deepEqual(automatic.state.people.map(routine),explicit.state.people.map(routine));
    const selected=automatic.state.people.find(p=>p.id===automatic.state.initialPersonId),origin=automatic.state.initialCaseOrigin;
    assert.deepEqual(origin.position,point(automatic,selected));assert.deepEqual(origin.location,selected.location);
    assert.equal(origin.activity,selected.activity);assert.deepEqual(origin.path,selected.path);
    assert.equal(automatic.state.people.filter(p=>p.role==='resident'&&p.activity==='resting').length,0);
  }
});

test('V021 origins: S1 and S2 preserve the same real initial routines as S0 for three seeds',()=>{
  const places=new Set(),identities=new Set(),locationKinds=new Set();
  for(const seed of seeds){
    const normal=new LivingCity({seed,scenario:'S0'});
    places.add(JSON.stringify(normal.state.initialCaseOrigin.position));identities.add(normal.state.initialPersonId);locationKinds.add(normal.state.initialCaseOrigin.location.kind);
    for(const scenario of ['S1','S2']){
      const world=new LivingCity({seed,scenario});
      assert.deepEqual(world.state.people.map(routine),normal.state.people.map(routine));
      assert.deepEqual(world.state.initialCaseOrigin,normal.state.initialCaseOrigin);
      assert.equal(world.state.initialPopulation,164);assert.equal(world.state.people.length,164);
    }
  }
  assert.equal(places.size,3);assert.equal(identities.size,3);assert.ok(locationKinds.has('street'));assert.ok(locationKinds.has('building'));
});

test('V021 origins: no street resident starts on a parked emergency vehicle',()=>{
  for(const seed of seeds){
    const world=new LivingCity({seed});
    for(const person of world.state.people.filter(p=>p.location.kind==='street'))for(const vehicle of world.state.vehicles){
      assert.ok(separation(person,vehicle)>1.5,`${person.id} starts on ${vehicle.id}`);
    }
  }
});

test('V021 origins: progressive symptoms and sudden death occur where the resident actually reached, without repositioning',()=>{
  const observedKinds=new Set();
  for(const seed of seeds)for(const scenario of ['S1','S2']){
    const world=new LivingCity({seed,scenario}),person=world.state.people.find(p=>p.id===world.state.initialPersonId);
    const tick=scenario==='S1'?200:300;world.step(tick-1);
    const before={...point(world,person)},location={...person.location};world.step();
    const event=world.state.events.find(e=>e.type===(scenario==='S1'?'SymptomsDeveloped':'HumanDied')&&e.entityIds.includes(person.id));
    assert.ok(event);assert.equal(event.tick,tick);assert.deepEqual(event.position,before);assert.deepEqual(point(world,person),before);
    assert.deepEqual(person.location,location);observedKinds.add(location.kind);
    assert.equal(world.state.people.length,world.state.initialPopulation);
  }
  assert.ok(observedKinds.has('street'));assert.ok(observedKinds.has('building'));
});

test('V021 origins: S0 normal episodes depend on actual routines and seed, and observation follows the onset',()=>{
  const firstTicks=[],firstPlaces=new Set();
  for(const seed of seeds){
    const world=new LivingCity({seed,scenario:'S0'});
    until(world,()=>world.state.normalEpisodes.records.length>0,2500);
    const episode=world.state.normalEpisodes.records[0],person=world.state.people.find(p=>p.id===episode.personId);
    assert.ok(episode.origin.activity==='walking'&&episode.origin.distanceWalked>=3||['atHome','atService'].includes(episode.origin.activity)&&episode.origin.routineTrips>0);
    assert.deepEqual(point(world,person),episode.origin.position);
    assert.deepEqual(person.location,episode.origin.location);
    assert.ok(person.normalNoticeTick>=episode.onsetTick+20);
    assert.equal(world.state.calls.filter(c=>world.state.incidents.find(i=>i.id===c.incidentId)?.personId===person.id).length,0);
    until(world,()=>world.state.calls.some(c=>world.state.incidents.find(i=>i.id===c.incidentId)?.personId===person.id),100);
    const incident=world.state.incidents.find(i=>i.personId===person.id),call=world.state.calls.find(c=>c.incidentId===incident.id);
    assert.ok(call.createdAt>=person.normalNoticeTick);assert.equal(incident.reporterId,person.id);
    assert.deepEqual(incident.origin.position,episode.origin.position);assert.equal(incident.origin.routineActivity,episode.origin.activity);
    firstTicks.push(episode.onsetTick);firstPlaces.add(JSON.stringify(episode.origin.position));
  }
  assert.equal(new Set(firstTicks).size,3);assert.equal(firstPlaces.size,3);
  assert.ok(firstTicks.every(tick=>![200,2400,4500].includes(tick)));
});

test('V021 origins: a seeded review without eligible people never invents a normal episode or a call',()=>{
  const world=new LivingCity({scenario:'S0'});
  for(const person of world.state.people.filter(p=>p.role==='resident'))person.taskId='controlled-unavailable';
  world.step(5000);
  assert.equal(world.state.normalEpisodes.records.length,0);assert.equal(world.state.calls.length,0);
  assert.equal(world.state.people.length,world.state.initialPopulation);
});

test('V021 origins: the same seed, states and logical ticks reproduce the normal episode schedule',()=>{
  const a=new LivingCity({seed:42,scenario:'S0'}),b=new LivingCity({seed:42,scenario:'S0'});
  a.step(1600);for(let i=0;i<16;i++)b.step(100);
  assert.ok(a.state.normalEpisodes.records.length>0);assert.deepEqual(a.snapshot(),b.snapshot());
});

test('V021 medical: a real mid-edge patient is assessed at physical contact and walks continuously to pickup',()=>{
  const world=new LivingCity({seed:42,scenario:'S0',residents:40,ambulances:1,patrols:0});let patient;
  until(world,()=>{
    patient=world.state.people.find(p=>{
      if(p.role!=='resident'||p.location.kind!=='street'||p.activity!=='walking'||!p.path.length)return false;
      const node=world.ctx.pedestrianNode(p.nodeId),edge=world.state.city.pedestrianGraph.edges.find(e=>e.from===p.nodeId&&e.to===p.path[0]||e.to===p.nodeId&&e.from===p.path[0]);
      return node&&edge?.kind==='sidewalk'&&separation(p,node)>3;
    });return !!patient;
  },150);
  const origin={...point(world,patient)};
  patient.healthState='symptomatic';patient.symptoms=['pain'];patient.activity='awaitingHelp';
  const incident=world.ctx.report(patient,'medical',5,'Dor comunicada',patient.id);
  until(world,()=>world.state.events.some(e=>e.type==='PatientAssessed'&&e.incidentId===incident.id),4000);
  const event=world.state.events.find(e=>e.type==='PatientAssessed'&&e.incidentId===incident.id);
  assert.deepEqual(point(world,patient),origin);assert.ok(event.assessmentDistances.length>0);
  for(const entry of event.assessmentDistances)assert.ok(entry.distance<=1.25);
  let previous=point(world,patient),boarded=false;
  for(let i=0;i<1500&&!boarded;i++){
    const previousLocation=patient.location.kind;world.step();const current=point(world,patient);
    if(previousLocation==='street')assert.ok(separation(previous,current)<=.091,'Patient teleported during physical pickup.');
    previous=current;boarded=patient.location.kind==='vehicle';
  }
  assert.ok(boarded);assert.equal(world.state.people.length,world.state.initialPopulation);
});
