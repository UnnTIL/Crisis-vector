#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {checkInvariants,populationOf,stats}=require('./report-living-city.cjs');
const ROOT=path.resolve(__dirname,'..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const clone=value=>value===undefined?null:structuredClone(value);
function sourceHashes() {
  const core=path.join(ROOT,'living-city/core');
  return fs.readdirSync(core).filter(file=>file.endsWith('.cjs')).sort()
    .map(file=>({file:`living-city/core/${file}`,sha256:sha256(fs.readFileSync(path.join(core,file)))}));
}
function originKey(origin) {
  if(!origin)return null;
  const location=origin.location??{},position=origin.position??{};
  return JSON.stringify([location.kind,location.buildingId??null,position.x,position.z]);
}
function observedOrigin(state) {
  const incident=state.incidents.find(i=>i.type===(state.scenario==='S2'?'violence':'medical'));
  return incident?{incidentId:incident.id,personId:incident.personId,observedAt:incident.observedAt,origin:clone(incident.origin)}:null;
}
function caseOrigin(state,diseaseOnset=null) {
  if(state.scenario!=='S0')return clone(diseaseOnset);
  const episode=state.normalEpisodes.records[0];
  return episode?{personId:episode.personId,tick:episode.onsetTick,condition:episode.condition,...clone(episode.origin)}:null;
}
function residentOrigin(state) {
  const person=state.people.find(person=>person.id===state.initialPersonId);
  const {positionOf}=require('../living-city/core/world.cjs');
  return {position:positionOf(state,person),location:clone(person.location),activity:person.activity,
    path:person.path.slice(),destinationBuildingId:person.destinationBuildingId};
}
function onsetThisTick(state,before) {
  const type=state.scenario==='S1'?'SymptomsDeveloped':'HumanDied';
  const event=state.events.find(event=>event.tick===state.tick&&event.type===type&&event.entityIds.includes(state.initialPersonId));
  if(!event)return null;
  const after=residentOrigin(state);
  return {personId:state.initialPersonId,tick:event.tick,eventType:type,position:clone(event.position),location:after.location,
    activityBeforeTick:before.activity,pathBeforeTick:before.path,destinationBuildingIdBeforeTick:before.destinationBuildingId};
}
function runScenario({seed,scenario,seconds=600,residents=150}) {
  const {LivingCity,TICK_SECONDS}=require('../living-city/core/world.cjs');
  const world=new LivingCity({seed,scenario,residents}),state=world.state,initialIds=state.people.map(person=>person.id);
  const ticks=seconds/TICK_SECONDS;assert.ok(Number.isSafeInteger(ticks)&&ticks>0,'Duration must contain whole logical ticks');
  const initial=checkInvariants(state,initialIds),initialOrigin=clone(state.initialCaseOrigin);
  const timings=[],eventTypes=Object.create(null),eventBounds=Object.create(null),traffic=new Map();
  let eventIndex=0,diseaseOnset=null,sampledPeakHeapBytes=process.memoryUsage().heapUsed;
  const peaks={hospitalized:initial.hospitalized,infectedLiving:initial.infectedLiving,reanimated:initial.reanimated};
  const cpuStart=process.cpuUsage(),wallStart=performance.now();
  function collectEvents() {
    for(;eventIndex<state.events.length;eventIndex++) {
      const event=state.events[eventIndex];
      assert.equal(event.eventId,eventIndex+1,'Canonical event ledger must remain complete and ordered');
      eventTypes[event.type]=(eventTypes[event.type]??0)+1;
      const bounds=eventBounds[event.type]??{firstTick:event.tick,lastTick:event.tick};
      bounds.lastTick=event.tick;eventBounds[event.type]=bounds;
    }
  }
  collectEvents();
  for(let tick=0;tick<ticks;tick++) {
    const beforeOnset=state.scenario!=='S0'&&!diseaseOnset?residentOrigin(state):null;
    const before=state.vehicles.map(vehicle=>({id:vehicle.id,x:vehicle.x,z:vehicle.z}));
    const started=performance.now();world.step();timings.push(performance.now()-started);
    if(beforeOnset)diseaseOnset=onsetThisTick(state,beforeOnset);
    const population=checkInvariants(state,initialIds);
    for(const key of Object.keys(peaks))peaks[key]=Math.max(peaks[key],population[key]);
    for(const vehicle of state.vehicles) {
      const previous=before.find(entry=>entry.id===vehicle.id),distance=Math.hypot(vehicle.x-previous.x,vehicle.z-previous.z);
      const speed=vehicle.type==='ambulance'?state.config.parameters.ambulanceSpeed:
        (state.config.parameters.policeVehicleSpeed??world.policeSystem.POLICE_DEFAULTS.policeVehicleSpeed);
      assert.ok(distance<=speed*TICK_SECONDS+1e-6,`${vehicle.id} moved farther than its physical speed permits`);
      if(vehicle.currentSpeed!==undefined)assert.ok(Number.isFinite(vehicle.currentSpeed)&&vehicle.currentSpeed>=0&&vehicle.currentSpeed<=speed+1e-6,
        `${vehicle.id} has invalid traffic speed`);
      const record=traffic.get(vehicle.id)??{id:vehicle.id,type:vehicle.type,distance:0,movingTicks:0,yieldingTicks:0,slowingTicks:0,
        routePendingStationaryTicks:0,longestRoutePendingStationaryTicks:0,currentStationaryTicks:0,maximumStepDistance:0};
      record.distance+=distance;record.maximumStepDistance=Math.max(record.maximumStepDistance,distance);
      if(distance>1e-9)record.movingTicks++;
      if(vehicle.traffic?.status==='yielding')record.yieldingTicks++;
      if(vehicle.traffic?.status==='slowing')record.slowingTicks++;
      const pending=vehicle.path.length>0,previousStationaryTicks=record.currentStationaryTicks;
      record.currentStationaryTicks=pending&&distance<=1e-9?record.currentStationaryTicks+1:0;
      if(record.currentStationaryTicks)record.routePendingStationaryTicks++;
      if(previousStationaryTicks&&!record.currentStationaryTicks&&record.longestStationaryEpisode?.lastTick===state.tick-1) {
        Object.assign(record.longestStationaryEpisode,{endObservedAtTick:state.tick,endStatus:vehicle.status,movementOnEnd:distance});
      }
      if(record.currentStationaryTicks>record.longestRoutePendingStationaryTicks) {
        record.longestRoutePendingStationaryTicks=record.currentStationaryTicks;
        const blocker=state.people.find(person=>person.id===vehicle.traffic?.personId);
        record.longestStationaryEpisode={firstTick:state.tick-record.currentStationaryTicks+1,lastTick:state.tick,
          seconds:record.currentStationaryTicks*TICK_SECONDS,status:vehicle.status,incidentId:vehicle.incidentId,
          position:{x:vehicle.x,z:vehicle.z},destinationNodeId:vehicle.destinationNodeId,traffic:clone(vehicle.traffic),
          blocker:blocker?{id:blocker.id,role:blocker.role,lifeState:blocker.lifeState,healthState:blocker.healthState,
            activity:blocker.activity,taskId:blocker.taskId,location:clone(blocker.location),position:{x:blocker.x,z:blocker.z}}:null,
          vehicleWaitReason:vehicle.waitReason??null,trafficWaitReason:vehicle.trafficWaitReason??null};
      }
      traffic.set(vehicle.id,record);
    }
    collectEvents();
    if(tick%100===0)sampledPeakHeapBytes=Math.max(sampledPeakHeapBytes,process.memoryUsage().heapUsed);
  }
  const cpu=process.cpuUsage(cpuStart),snapshot=world.snapshot();
  assert.equal(world._commands.size,0,'Scenario report must exercise autonomous services');
  // Outbreak crew loss can require a genuine disembarkation and transfer to
  // another finite team. Only quiet S0 requires one boarding per incident.
  for(const type of scenario==='S0'?['PatientBoarded','PatientAdmitted']:['PatientAdmitted']) {
    const counts=new Map();
    for(const event of state.events.filter(event=>event.type===type))counts.set(event.incidentId,(counts.get(event.incidentId)??0)+1);
    assert.ok([...counts.values()].every(count=>count===1),`${type} duplicated an incident's patient`);
  }
  const completedCycles=state.incidents.filter(incident=>state.events.some(event=>event.type==='PatientAdmitted'&&event.incidentId===incident.id)&&
    state.events.some(event=>event.type==='AmbulanceAvailable'&&event.incidentId===incident.id)).length;
  const healthyBlockedAmbulances=state.vehicles.filter(vehicle=>vehicle.type==='ambulance'&&vehicle.status==='blocked'&&!vehicle.broken&&
    vehicle.crewIds.every(id=>state.people.some(person=>person.id===id&&person.lifeState==='alive'&&person.healthState==='healthy'))).map(vehicle=>vehicle.id);
  if(scenario==='S0'&&seconds>=600) {
    assert.ok(completedCycles>0,'S0 must complete actual staffed medical cycles');
    assert.deepEqual(healthyBlockedAmbulances,[],'S0 healthy ambulances must not become permanently blocked after transient routing failures');
  }
  return {seed,scenario,residents,simulatedSeconds:seconds,ticks:state.tick,initialPopulation:state.initialPopulation,
    initialPersonId:state.initialPersonId,initialCaseOrigin:initialOrigin,caseOrigin:caseOrigin(state,diseaseOnset),firstObservedIncident:observedOrigin(state),
    normalEpisodes:clone(state.normalEpisodes.records),population:populationOf(state),counters:clone(state.counters),peaks,commandsIssued:world._commands.size,
    events:{count:eventIndex,byType:eventTypes,bounds:eventBounds,lastEventId:state.events.at(-1)?.eventId??0},
    incidents:state.incidents.map(incident=>({id:incident.id,type:incident.type,personId:incident.personId,status:incident.status,
      priority:incident.priority,waitReason:incident.waitReason,origin:clone(incident.origin),assignedAmbulanceId:incident.assignedAmbulanceId,
      assignedPatrolId:incident.assignedPatrolId})),
    traffic:{note:'Route-pending stationary time includes legitimate occupied-road yielding or incapacitated crews. Longest-episode blocker and status snapshots are observations, not proof of an algorithm deadlock. Wait-reason fields can retain historical metadata after movement or neutralization; use current traffic status, life state and route fields to assess activity.',
      vehicles:state.vehicles.map(vehicle=>({...traffic.get(vehicle.id),currentStationaryTicks:undefined,
        status:vehicle.status,nodeId:vehicle.nodeId,routeRemaining:vehicle.path.length,
        requestedDestinationNodeId:vehicle.requestedDestinationNodeId??null,destinationNodeId:vehicle.destinationNodeId??null,
        currentSpeed:vehicle.currentSpeed??null,traffic:clone(vehicle.traffic),replans:vehicle.trafficReplans??0,
        waitReason:vehicle.trafficWaitReason??null,passengerIds:vehicle.passengerIds.slice()})),
      pedestriansWithRetainedWaitMetadata:state.people.filter(person=>person.trafficWaitReason).map(person=>({id:person.id,since:person.trafficWaitSince,
        reason:person.trafficWaitReason,replans:person.trafficReplans??0,lifeState:person.lifeState,healthState:person.healthState,
        activity:person.activity,taskId:person.taskId,location:clone(person.location),position:{x:person.x,z:person.z},
        path:person.path.slice(),finalApproach:clone(person.finalApproach)}))},
    patrolStatuses:state.patrols.map(patrol=>({id:patrol.id,status:patrol.status,incidentId:patrol.incidentId})),
    hospital:clone(state.facilities.hospital),snapshotSha256:sha256(JSON.stringify(snapshot)),config:clone(state.config),
    performance:{wallMs:performance.now()-wallStart,cpuUserMs:cpu.user/1000,cpuSystemMs:cpu.system/1000,
      synchronousStepMs:stats(timings),sampledPeakHeapBytes,
      note:'Step timings wrap world.step only. CPU/wall include per-tick invariant and diagnostic work. V8 heap sampled every 100 ticks. No rendering/audio/browser workload or GPU/FPS claim.'},
    functionalChecks:{oneBoardingPerIncidentRequired:scenario==='S0',oneBoardingPerIncident:scenario==='S0'?true:null,
      oneAdmissionPerIncident:true,completedMedicalCycles:completedCycles,
      healthyBlockedAmbulances,S0CycleAndHealthyResourceChecksRequired:scenario==='S0'&&seconds>=600},
    invariantsCheckedEveryTick:true,vehicleSpeedBoundsCheckedEveryTick:true};
}
function probeOrigin({seed,scenario,seconds,residents}) {
  const {LivingCity,TICK_SECONDS}=require('../living-city/core/world.cjs');
  const world=new LivingCity({seed,scenario,residents}),ids=world.state.people.map(person=>person.id);
  let diseaseOnset=null,origin=caseOrigin(world.state,diseaseOnset);
  for(let tick=0;!origin&&tick<seconds/TICK_SECONDS;tick++) {
    const before=world.state.scenario!=='S0'?residentOrigin(world.state):null;
    world.step();checkInvariants(world.state,ids);
    if(before)diseaseOnset=onsetThisTick(world.state,before);
    origin=caseOrigin(world.state,diseaseOnset);
  }
  return {seed,scenario,ticks:world.state.tick,caseOrigin:origin,firstObservedIncident:observedOrigin(world.state),invariantsCheckedEveryTick:true};
}
function main(args=process.argv.slice(2)) {
  if(args.includes('--help')) {
    console.log('Usage: node scripts/report-living-city-v021.cjs [--output FILE] [--seconds 600] [--residents 150] [--seeds 16927,42,2026] [--scenarios S0,S1,S2]');
    return;
  }
  const options={seeds:[16927,42,2026],scenarios:['S0','S1','S2'],seconds:600,residents:150,output:path.join(ROOT,'docs/living-city-v021-report.json')};
  for(let index=0;index<args.length;index++) {
    const key=args[index],value=args[++index];assert.ok(value,`Missing value for ${key}`);
    if(key==='--output')options.output=path.resolve(value);
    else if(key==='--seconds')options.seconds=Number(value);
    else if(key==='--residents')options.residents=Number(value);
    else if(key==='--seeds')options.seeds=value.split(',').map(Number);
    else if(key==='--scenarios')options.scenarios=value.split(',');
    else throw new Error(`Unknown option ${key}`);
  }
  assert.ok(options.seeds.length&&options.seeds.every(seed=>Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff));
  assert.ok(options.scenarios.length&&options.scenarios.every(scenario=>['S0','S1','S2'].includes(scenario)));
  assert.ok(Number.isFinite(options.seconds)&&options.seconds>0&&options.seconds<=3600);
  assert.ok(Number.isInteger(options.residents)&&options.residents>=1&&options.residents<=1000);
  const legacyFile=path.join(ROOT,'docs/living-city-report.json'),legacyHash=sha256(fs.readFileSync(legacyFile));
  assert.notEqual(options.output,legacyFile,'V0.2 report must remain preserved');
  const report={schemaVersion:'living-city-v021-scenario-report-v1',generatedAt:new Date().toISOString(),node:process.version,
    note:'Synthetic city; no factual medical or epidemiological forecast. Organic case origins retain actual routine positions; no test anchors or player commands.',
    sourceHashes:sourceHashes(),preservedV02Report:{file:'docs/living-city-report.json',sha256:legacyHash},runs:[],originCoverage:[]};
  for(const scenario of options.scenarios)for(const seed of options.seeds) {
    const run=runScenario({seed,scenario,seconds:options.seconds,residents:options.residents});report.runs.push(run);
    console.log(`${scenario} seed ${seed}: ${run.ticks} ticks; living ${run.population.living}; reanimated ${run.population.reanimated}; origin ${originKey(run.caseOrigin)}; incidents ${run.incidents.length}`);
  }
  for(const scenario of options.scenarios) {
    const primary=report.runs.filter(run=>run.scenario===scenario),keys=new Set(primary.map(run=>originKey(run.caseOrigin)).filter(Boolean)),extraOriginProbes=[];
    if(keys.size===1&&primary.length>=3)for(const seed of [1,7,123,999,2027].filter(seed=>!options.seeds.includes(seed))) {
      const probe=probeOrigin({seed,scenario,seconds:options.seconds,residents:options.residents});extraOriginProbes.push(probe);
      const key=originKey(probe.caseOrigin);if(key)keys.add(key);if(keys.size>1)break;
    }
    report.originCoverage.push({scenario,primarySeeds:primary.map(run=>run.seed),primaryOriginsObserved:primary.filter(run=>run.caseOrigin).length,
      primaryDistinctPhysicalOrigins:new Set(primary.map(run=>originKey(run.caseOrigin)).filter(Boolean)).size,
      extraOriginProbes,distinctPhysicalOriginsIncludingProbes:keys.size,variationObserved:keys.size>1});
  }
  assert.deepEqual(sourceHashes(),report.sourceHashes,'Domain sources changed during the measured matrix');
  assert.equal(sha256(fs.readFileSync(legacyFile)),legacyHash,'V0.2 report changed');
  fs.mkdirSync(path.dirname(options.output),{recursive:true});fs.writeFileSync(options.output,JSON.stringify(report,null,2)+'\n');
  console.log(`Saved ${report.runs.length} scenarios to ${options.output}`);return report;
}
module.exports={runScenario,caseOrigin,originKey,sourceHashes,main};
if(require.main===module){try{main();}catch(error){console.error(error.stack||error.message);process.exitCode=1;}}
