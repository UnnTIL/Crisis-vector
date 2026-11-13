#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const unique=(values,label)=>assert.equal(new Set(values).size,values.length,`${label}: duplicate identity`);
function populationOf(state) {
  const people=state.people;
  return {total:people.length,living:people.filter(p=>p.lifeState==='alive').length,
    dead:people.filter(p=>p.lifeState!=='alive').length,
    reanimated:people.filter(p=>p.lifeState==='reanimated').length,
    neutralized:people.filter(p=>p.lifeState==='neutralized').length,
    infectedLiving:people.filter(p=>p.lifeState==='alive'&&Number.isFinite(p.infectedAt)).length,
    hospitalized:state.facilities.hospital.patientIds.length};
}
function checkInvariants(state,initialIds) {
  assert.ok(Number.isSafeInteger(state.tick)&&state.tick>=0,'Invalid canonical tick');
  assert.ok(Number.isFinite(state.timeSeconds)&&state.timeSeconds>=0,'Invalid canonical time');
  const people=state.people,vehicles=state.vehicles,incidents=state.incidents,buildings=state.city.buildings;
  unique(people.map(p=>p.id),'people');unique(vehicles.map(v=>v.id),'vehicles');
  unique(incidents.map(i=>i.id),'incidents');unique(buildings.map(b=>b.id),'buildings');
  assert.equal(people.length,state.initialPopulation,'Population changed without a source');
  if(initialIds)assert.deepEqual(people.map(p=>p.id).sort(),[...initialIds].sort(),'Person identities changed');
  const personIds=new Set(people.map(p=>p.id)),vehicleIds=new Set(vehicles.map(v=>v.id));
  const buildingIds=new Set(buildings.map(b=>b.id)),pedestrianIds=new Set(state.city.pedestrianGraph.nodes.map(n=>n.id));
  const byPerson=new Map(people.map(p=>[p.id,p])),byVehicle=new Map(vehicles.map(v=>[v.id,v]));
  assert.ok(personIds.has(state.initialPersonId),'Initial case is not an existing person');
  for(const person of people) {
    assert.ok(typeof person.id==='string'&&person.id.length>0);
    assert.ok(['resident','officer','medic','hospitalStaff'].includes(person.role),'Unknown person role');
    assert.ok(['alive','dead','reanimated','neutralized'].includes(person.lifeState),'Unknown life state');
    assert.ok(['healthy','exposed','infected','symptomatic','critical','deceased'].includes(person.healthState),'Unknown health state');
    assert.ok(Number.isFinite(person.x)&&Number.isFinite(person.z),'Invalid physical person position');
    assert.ok(person.location&&['building','street','vehicle','hospital'].includes(person.location.kind),'Missing unique physical location');
    const location=person.location;
    if(location.kind==='building'||location.kind==='hospital')assert.ok(buildingIds.has(location.buildingId),'Unknown location building');
    if(location.kind==='street')assert.ok(pedestrianIds.has(location.nodeId??person.nodeId),'Unknown pedestrian location node');
    if(location.kind==='vehicle') {
      assert.ok(vehicleIds.has(location.vehicleId),'Unknown person vehicle');
      const vehicle=byVehicle.get(location.vehicleId);
      assert.ok(vehicle.crewIds.includes(person.id)||vehicle.passengerIds.includes(person.id),'Vehicle occupant lacks a roster or passenger reference');
    }
    if(person.ammo!==undefined)assert.ok(Number.isSafeInteger(person.ammo)&&person.ammo>=0,'Invalid officer ammunition');
  }
  const allPassengers=[],allCrew=[];
  for(const vehicle of vehicles) {
    assert.ok(Number.isFinite(vehicle.x)&&Number.isFinite(vehicle.z),'Invalid physical vehicle position');
    assert.ok(Number.isSafeInteger(vehicle.capacity)&&vehicle.capacity>=0,'Invalid vehicle capacity');
    unique(vehicle.crewIds,'vehicle crew');unique(vehicle.passengerIds,'vehicle passengers');
    assert.ok(vehicle.passengerIds.length<=vehicle.capacity,'Vehicle passenger capacity exceeded');
    for(const id of vehicle.crewIds){assert.ok(personIds.has(id),'Missing crew identity');allCrew.push(id);}
    for(const id of vehicle.passengerIds) {
      assert.ok(personIds.has(id),'Missing passenger identity');allPassengers.push(id);
      const passenger=byPerson.get(id);assert.equal(passenger.location.kind,'vehicle');assert.equal(passenger.location.vehicleId,vehicle.id,'Passenger exists in multiple physical locations');
    }
    if(vehicle.incidentId!==null&&vehicle.incidentId!==undefined)assert.ok(incidents.some(i=>i.id===vehicle.incidentId),'Vehicle references an unknown incident');
  }
  unique(allPassengers,'passengers across vehicles');unique(allCrew,'crew across vehicles');
  const hospital=state.facilities.hospital;
  unique(hospital.patientIds,'hospital patients');
  assert.ok(Number.isSafeInteger(hospital.capacity)&&hospital.capacity>=0);
  assert.ok(hospital.patientIds.length<=hospital.capacity,'Hospital capacity exceeded');
  for(const id of hospital.patientIds) {
    assert.ok(personIds.has(id),'Unknown hospital patient');assert.ok(!allPassengers.includes(id),'Patient duplicated between hospital and vehicle');
    const p=byPerson.get(id);assert.equal(p.location.kind,'hospital');assert.equal(p.location.buildingId,hospital.buildingId);
  }
  for(const p of people.filter(p=>p.location.kind==='hospital'&&p.role!=='hospitalStaff'))assert.ok(hospital.patientIds.includes(p.id),'Hospital occupant lacks a patient record');
  for(const patrol of state.patrols) {
    assert.ok(vehicleIds.has(patrol.vehicleId),'Unknown police vehicle');unique(patrol.officerIds,'patrol officers');
    assert.ok(patrol.officerIds.every(id=>byPerson.get(id)?.role==='officer'),'Patrol staff not drawn from canonical officers');
  }
  const handovers=vehicles.filter(v=>v.hospitalStaffId);
  unique(handovers.map(v=>v.hospitalStaffId),'hospital professionals across handovers');
  for(const vehicle of handovers) {
    const professional=byPerson.get(vehicle.hospitalStaffId);
    assert.equal(professional?.role,'hospitalStaff','Handover requires an existing professional');
    assert.equal(professional.taskId,`handover:${vehicle.id}`,'A professional cannot serve conflicting handovers');
  }
  const active=incidents.filter(i=>!['resolved','closed','cancelled'].includes(i.status));
  for(const field of ['assignedAmbulanceId','assignedPatrolId'])unique(active.map(i=>i[field]).filter(Boolean),'Active '+field);
  const population=populationOf(state);
  assert.equal(population.living+population.dead,state.initialPopulation);
  for(const [counter,expected] of Object.entries({living:population.living,dead:population.dead,
    activeReanimated:population.reanimated,neutralized:population.neutralized,
    reanimatedHistorical:population.reanimated+population.neutralized,hospitalOccupancy:population.hospitalized})) {
    assert.equal(state.counters[counter],expected,`Counter ${counter} does not reconcile with identities`);
  }
  return population;
}
function stats(values) {
  const ordered=[...values].sort((a,b)=>a-b),pick=p=>ordered.length?ordered[Math.max(0,Math.ceil(ordered.length*p)-1)]:null;
  return {count:values.length,mean:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,p50:pick(.5),p95:pick(.95),p99:pick(.99),max:ordered.at(-1)??null};
}
function runScenario({seed,scenario,seconds=600,residents=150,...options}) {
  const {LivingCity,TICK_SECONDS}=require('../living-city/core/world.cjs');
  const world=new LivingCity({seed,scenario,residents,...options}),initialIds=world.state.people.map(p=>p.id);
  const ticks=seconds/TICK_SECONDS;assert.ok(Number.isSafeInteger(ticks)&&ticks>=1);
  const timings=[],eventTypes=Object.create(null),eventBounds=Object.create(null);
  let eventCursor=0,sampledPeakHeapBytes=process.memoryUsage().heapUsed;
  const initial=checkInvariants(world.state,initialIds),started=performance.now(),cpuStarted=process.cpuUsage();
  const peaks={hospitalized:initial.hospitalized,infectedLiving:initial.infectedLiving,reanimated:initial.reanimated};
  function collectEvents() {
    for(const event of world.state.events)if(event.eventId>eventCursor) {
      eventTypes[event.type]=(eventTypes[event.type]??0)+1;
      const bounds=eventBounds[event.type]??{firstTick:event.tick,lastTick:event.tick};bounds.lastTick=event.tick;eventBounds[event.type]=bounds;
      eventCursor=event.eventId;
    }
  }
  collectEvents();
  for(let tick=0;tick<ticks;tick++) {
    const before=performance.now();world.step(1);timings.push(performance.now()-before);
    const counts=checkInvariants(world.state,initialIds);
    for(const key of Object.keys(peaks))peaks[key]=Math.max(peaks[key],counts[key]);
    collectEvents();
    if(tick%100===0)sampledPeakHeapBytes=Math.max(sampledPeakHeapBytes,process.memoryUsage().heapUsed);
  }
  const cpu=process.cpuUsage(cpuStarted),state=world.snapshot(),counts=checkInvariants(state,initialIds);
  return {seed,scenario,residents,simulatedSeconds:seconds,ticks:state.tick,initialPopulation:state.initialPopulation,
    initialPersonId:state.initialPersonId,population:counts,counters:state.counters,peaks,
    events:{count:Object.values(eventTypes).reduce((a,b)=>a+b,0),byType:eventTypes,bounds:eventBounds,lastEventId:eventCursor},
    incidents:state.incidents.map(i=>({id:i.id,type:i.type,personId:i.personId,status:i.status,priority:i.priority,waitReason:i.waitReason,
      assignedAmbulanceId:i.assignedAmbulanceId,assignedPatrolId:i.assignedPatrolId})),
    vehicleStatuses:state.vehicles.map(v=>({id:v.id,type:v.type,status:v.status,incidentId:v.incidentId,passengerIds:v.passengerIds})),
    patrolStatuses:state.patrols.map(p=>({id:p.id,status:p.status,incidentId:p.incidentId})),
    hospital:{capacity:state.facilities.hospital.capacity,patientIds:state.facilities.hospital.patientIds},
    snapshotSha256:sha256(JSON.stringify(state)),config:state.config,
    performance:{wallMs:performance.now()-started,cpuUserMs:cpu.user/1000,cpuSystemMs:cpu.system/1000,
      synchronousStepMs:stats(timings),sampledPeakHeapBytes,heapSamplingNote:'Process V8 heap sampled every 100 ticks; not process/GPU peak memory.'},
    invariantsCheckedEveryTick:true};
}
function main(args=process.argv.slice(2)) {
  const options={seeds:[16927,42,2026],scenarios:['S0','S1','S2'],seconds:600,residents:150,output:path.join(ROOT,'docs/living-city-report.json')};
  for(let i=0;i<args.length;i++) {
    const key=args[i],value=args[++i];assert.ok(value,`Missing value for ${key}`);
    if(key==='--output')options.output=path.resolve(value);
    else if(key==='--seconds')options.seconds=Number(value);
    else if(key==='--residents')options.residents=Number(value);
    else if(key==='--seeds')options.seeds=value.split(',').map(Number);
    else if(key==='--scenarios')options.scenarios=value.split(',');
    else throw new Error(`Unknown option ${key}`);
  }
  assert.ok(options.seeds.every(v=>Number.isSafeInteger(v)&&v>=0&&v<=0xffffffff));
  assert.ok(options.scenarios.every(v=>['S0','S1','S2'].includes(v)));
  assert.ok(Number.isFinite(options.seconds)&&options.seconds>0&&options.seconds<=3600);
  const report={schemaVersion:'living-city-scenario-report-v1',generatedAt:new Date().toISOString(),
    note:'Synthetic small-city scenarios, no factual medical/epidemiological forecast. No rendering/audio/browser workload in these CPU measurements.',
    node:process.version,sourceHashes:[],runs:[]};
  const core=path.join(ROOT,'living-city/core');
  for(const file of fs.readdirSync(core).filter(f=>f.endsWith('.cjs')).sort())report.sourceHashes.push({file:'living-city/core/'+file,sha256:sha256(fs.readFileSync(path.join(core,file)))});
  for(const scenario of options.scenarios)for(const seed of options.seeds) {
    const result=runScenario({seed,scenario,seconds:options.seconds,residents:options.residents});report.runs.push(result);
    console.log(`${scenario} seed ${seed}: ${result.ticks} ticks; living ${result.population.living}; reanimated ${result.population.reanimated}; incidents ${result.incidents.length}`);
  }
  fs.mkdirSync(path.dirname(options.output),{recursive:true});fs.writeFileSync(options.output,JSON.stringify(report,null,2)+'\n');
  console.log(`Saved ${report.runs.length} scenarios to ${options.output}`);
  return report;
}
module.exports={checkInvariants,populationOf,stats,runScenario,main};
if(require.main===module){try{main();}catch(error){console.error(error.stack||error.message);process.exitCode=1;}}
