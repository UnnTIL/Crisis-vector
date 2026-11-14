'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {VisualPoseHistory,captureVisualFrame,CANONICAL_AZIMUTH,CAMERA_ROTATION_STEP,rotateAzimuth,cameraOffset}=require('../living-city/presentation/poses.cjs');
function fixture(){return {version:2,seed:16927,scenario:'S0',tick:0,rng:123456,
  city:{buildings:[{id:'home',name:'Casa',x:20,z:30,entranceNodeIds:['door']}],pedestrianGraph:{nodes:[{id:'door',x:20,z:33}]}},
  facilities:{hospital:{buildingId:'home'}},vehicles:[{id:'v',x:3,z:4},{id:'other',x:40,z:42}],
  people:[{id:'p',x:1,z:2,location:{kind:'street',nodeId:'a'},lifeState:'alive',healthState:'healthy'},
    {id:'passenger',x:999,z:999,location:{kind:'vehicle',vehicleId:'v'},lifeState:'alive'},
    {id:'inside',x:999,z:999,location:{kind:'building',buildingId:'home'},lifeState:'alive'}]};}
function update(state,tick,x,z){state.tick=tick;state.people[0].x=x;state.people[0].z=z;state.vehicles[0].x=x+2;state.vehicles[0].z=z+2;}
function freeze(value){Object.freeze(value);for(const child of Object.values(value))if(child&&typeof child==='object'&&!Object.isFrozen(child))freeze(child);return value;}
function close(actual,expected){assert.ok(Math.abs(actual-expected)<1e-10,`${actual} differs from ${expected}`);}

test('100ms visual history produces intermediate person and vehicle poses without canonical writes',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);update(state,1,5,10);history.captureTick(state);const before=structuredClone(state);
  for(const alpha of [0,.25,.5,.75,1]){
    const person=history.getVisualPose('person','p',alpha),vehicle=history.getVisualPose('vehicle','v',alpha);
    close(person.x,1+4*alpha);close(person.z,2+8*alpha);close(vehicle.x,3+4*alpha);close(vehicle.z,4+8*alpha);
    assert.equal(person.previousTick,0);assert.equal(person.currentTick,1);assert.equal(person.hidden,false);
  }
  assert.deepEqual(state,before);assert.equal(state.rng,123456);
});
test('visual captures own detached frozen position metadata, never paths, clinical truth or RNG',()=>{
  const state=fixture(),frame=captureVisualFrame(freeze(state));
  assert.ok(Object.isFrozen(frame)&&Object.isFrozen(frame.people)&&Object.isFrozen(frame.people.p));
  assert.equal(Object.hasOwn(frame,'rng'),false);assert.equal(Object.hasOwn(frame.people.p,'healthState'),false);assert.equal(Object.hasOwn(frame.people.p,'path'),false);
  assert.throws(()=>{frame.people.p.x=99;},TypeError);
  const mutable=fixture(),history=new VisualPoseHistory();history.snapToState(mutable);mutable.people[0].x=44;
  assert.equal(history.getVisualPose('person','p',1).x,1);
  const pose=history.getVisualPose('person','p',1);assert.equal(Object.hasOwn(pose,'lifeState'),false);pose.x=999;assert.equal(history.getVisualPose('person','p',1).x,1);
});
test('passengers and their following anchor inherit the exact carrier interpolation',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);update(state,1,5,10);history.captureTick(state);
  for(const alpha of [0,.1,.5,.9,1]){
    const passenger=history.getVisualPose('person','passenger',alpha),vehicle=history.getVisualPose('vehicle','v',alpha);
    assert.equal(passenger.x,vehicle.x);assert.equal(passenger.z,vehicle.z);assert.equal(passenger.hidden,true);assert.equal(passenger.inside,'vehicle');
  }
});
test('boarding, disembarking and carrier changes never blend unrelated person locations',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);
  update(state,1,5,10);state.people[0].location={kind:'vehicle',vehicleId:'v'};history.captureTick(state);
  const boarded=history.getVisualPose('person','p',.5);assert.equal(boarded.hidden,true);assert.equal(boarded.transitionSnap,true);assert.equal(boarded.x,5);
  state.tick=2;state.people[0].location={kind:'street',nodeId:'door'};state.people[0].x=7.2;state.people[0].z=12.2;history.captureTick(state);
  for(const alpha of [0,.5,1]){const pose=history.getVisualPose('person','p',alpha);assert.equal(pose.x,7.2);assert.equal(pose.z,12.2);assert.equal(pose.hidden,false);}
  state.tick=3;state.people[1].location={kind:'vehicle',vehicleId:'other'};history.captureTick(state);
  assert.equal(history.getVisualPose('person','passenger',0).x,40);
});
test('building and hospital occupants stay hidden at the actual entrance, then emerge without ghosts',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);
  const inside=history.getVisualPose('person','inside',.5);assert.equal(inside.x,20);assert.equal(inside.z,33);assert.equal(inside.hidden,true);
  state.tick=1;state.people[0].location={kind:'hospital',buildingId:'home'};history.captureTick(state);
  for(const alpha of [0,.5,1]){const pose=history.getVisualPose('person','p',alpha);assert.equal(pose.x,20);assert.equal(pose.z,33);assert.equal(pose.hidden,true);}
  state.tick=2;state.people[0].location={kind:'street',nodeId:'door'};state.people[0].x=20.1;state.people[0].z=33.1;history.captureTick(state);
  assert.equal(history.getVisualPose('person','p',0).x,20.1);assert.equal(history.getVisualPose('person','p',0).hidden,false);
});
test('world replacement, backwards time and skipped logical ticks snap rather than sweeping across old states',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);update(state,1,5,10);history.captureTick(state);
  update(state,4,50,52);history.captureTick(state);assert.equal(history.getVisualPose('person','p',0).x,50);assert.equal(history.getSummary().reason,'tick-gap-or-reset');
  update(state,0,1,2);history.captureTick(state);assert.equal(history.getVisualPose('person','p',.5).x,1);
  const replacement=fixture();update(replacement,1,70,72);history.captureTick(replacement);assert.equal(history.getVisualPose('person','p',0).x,70);assert.equal(history.getSummary().reason,'world-change');
});
test('duplicate captures preserve the tick pair while same-tick edits and life transitions snap',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);update(state,1,5,10);history.captureTick(state);
  assert.equal(history.captureTick(state),false);assert.equal(history.getVisualPose('person','p',.5).x,3);
  state.people[0].x=8;history.captureTick(state);assert.equal(history.getVisualPose('person','p',0).x,8);assert.equal(history.getSummary().reason,'same-tick-change');
  update(state,2,10,12);state.people[0].lifeState='dead';history.captureTick(state);assert.equal(history.getVisualPose('person','p',0).x,10);
});
test('explicit pause/fast-forward snap removes all future drift for repeated render fractions',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);update(state,1,5,10);history.captureTick(state);
  assert.equal(history.getVisualPose('person','p',0).x,1);history.snapToState(state);const before=structuredClone(state);
  for(let frame=0;frame<144;frame++){const pose=history.getVisualPose('person','p',(frame%100)/100);assert.equal(pose.x,5);assert.equal(pose.z,10);}
  assert.deepEqual(state,before);
  update(state,2000,80,60);const later=structuredClone(state);history.snapToState(state);assert.equal(history.getVisualPose('person','p',0).x,80);assert.deepEqual(state,later);
});
test('removed identities or missing carriers are not rendered from stale cached coordinates',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);state.tick=1;state.people=state.people.filter(p=>p.id!=='p');state.vehicles=[];history.captureTick(state);
  assert.equal(history.getVisualPose('person','p',.5),null);assert.equal(history.getVisualPose('vehicle','v',.5),null);assert.equal(history.getVisualPose('person','passenger',.5),null);
});
test('invalid snapshots fail atomically and invalid alpha cannot inject NaN visual positions',()=>{
  const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);const summary=history.getSummary();
  for(const tick of [NaN,Infinity,-1,.5]){const broken=structuredClone(state);broken.tick=tick;assert.throws(()=>history.captureTick(broken),TypeError);assert.deepEqual(history.getSummary(),summary);}
  const duplicate=structuredClone(state);duplicate.people.push({...duplicate.people[0]});assert.throws(()=>history.captureTick(duplicate),TypeError);
  const broken=structuredClone(state);broken.people[0].x=NaN;assert.throws(()=>history.captureTick(broken),TypeError);
  for(const alpha of [NaN,Infinity,'0.5',null])assert.throws(()=>history.getVisualPose('person','p',alpha),TypeError);
  assert.equal(history.getVisualPose('person','p',-1).x,1);assert.equal(history.getVisualPose('person','p',2).x,1);
});
test('10/30/60/144 FPS pose queries cannot advance logical time or alter the captured tick trace',()=>{
  const results=[];
  for(const fps of [10,30,60,144]){
    const state=fixture(),history=new VisualPoseHistory();history.snapToState(state);
    for(let tick=1;tick<=20;tick++){
      update(state,tick,1+tick*.1,2+tick*.1);history.captureTick(state);const canonical=structuredClone(state);
      for(let frame=0;frame<Math.ceil(fps/10);frame++){
        const alpha=Math.min(1,frame*10/fps),pose=history.getVisualPose('person','p',alpha);
        assert.ok(pose.x>=1+(tick-1)*.1-1e-12&&pose.x<=1+tick*.1+1e-12);assert.deepEqual(state,canonical);
      }
    }
    results.push(state);
  }
  for(const result of results)assert.deepEqual(result,results[0]);
});
test('Q/E rotation has uniform reversible 15-degree steps and constant orbit radius',()=>{
  let angle=CANONICAL_AZIMUTH;const radius=Math.hypot(68,68);
  for(let n=1;n<=24;n++){angle=rotateAzimuth(angle,1);const offset=cameraOffset(angle);close(Math.hypot(offset.x,offset.z),radius);assert.equal(offset.y,88);}
  close(angle,CANONICAL_AZIMUTH);angle=rotateAzimuth(angle,-1);close(angle,CANONICAL_AZIMUTH-CAMERA_ROTATION_STEP);
  const original=cameraOffset(CANONICAL_AZIMUTH);close(original.x,68);close(original.z,68);
  assert.throws(()=>rotateAzimuth(angle,0),TypeError);assert.throws(()=>rotateAzimuth(NaN,1),TypeError);assert.throws(()=>cameraOffset(Infinity),TypeError);
});
