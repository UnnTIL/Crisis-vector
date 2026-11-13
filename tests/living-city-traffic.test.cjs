'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createHelpers,distance}=require('../living-city/core/helpers.cjs');
const {TRAFFIC}=require('../living-city/core/traffic.cjs');
const {LivingCity}=require('../living-city/core/world.cjs');

function fixture({parallel=false,loop=false}={}){
  const roadNodes=[{id:'a',x:-6,z:0},{id:'b',x:8,z:0},...(loop?[{id:'c',x:-6,z:10},{id:'d',x:8,z:10}]:[])];
  const pedNodes=[{id:'south',x:0,z:-5},{id:'north',x:0,z:5},{id:'west',x:-6,z:4},{id:'east',x:8,z:4},
    ...roadNodes.map(n=>({id:'foot-'+n.id,x:n.x,z:n.z}))];
  const edges=(nodes,pairs,kind)=>pairs.map(([from,to])=>({from,to,kind,length:distance(nodes.find(n=>n.id===from),nodes.find(n=>n.id===to)),blocked:false}));
  const vehicle={id:'car',type:'police',x:-6,z:0,nodeId:'a',path:[],crewIds:[],passengerIds:[],status:'responding',broken:false};
  const person={id:'pedestrian',role:'resident',x:parallel?0:0,z:parallel?4:-2,nodeId:parallel?'west':'south',path:[],
    location:{kind:'street',nodeId:parallel?'west':'south'},lifeState:'alive',healthState:'healthy',mobility:1,walkSpeed:1};
  const state={tick:0,timeSeconds:0,eventSequence:0,events:[],people:[person],vehicles:[vehicle],facilities:{hospital:{patientIds:[]}},
    city:{buildings:[],vehicleGraph:{nodes:roadNodes,edges:edges(roadNodes,[['a','b'],...(loop?[['a','c'],['c','d'],['d','b']]:[])],'road')},
      pedestrianGraph:{nodes:pedNodes,edges:edges(pedNodes,[['south','north']],'crossing').concat(edges(pedNodes,[['west','east']],'sidewalk'))}}};
  const helpers=createHelpers(state);
  return {state,helpers,vehicle,person};
}
function tick(f,pedSpeed=1,carSpeed=4){
  f.state.tick++;f.state.timeSeconds=f.state.tick/10;
  if(f.person.path.length||f.person.finalApproach)f.helpers.movePerson(f.person,pedSpeed);
  return f.helpers.moveVehicle(f.vehicle,carSpeed);
}

test('traffic: an actual crossing pedestrian gets priority; the car stops clear and progressively resumes',()=>{
  const f=fixture();
  assert.equal(f.helpers.routePerson(f.person,'north'),true);
  assert.equal(f.helpers.routeVehicle(f.vehicle,'b'),true);
  let yielded=false,resumed=false,previousSpeed=0,arrived=false;
  for(let i=0;i<200;i++){
    const before={x:f.vehicle.x,z:f.vehicle.z};
    arrived=tick(f);
    assert.ok(distance(f.vehicle,f.person)>=TRAFFIC.radius-1e-8,'no vehicle/pedestrian overlap during the crossing');
    assert.ok(distance(f.vehicle,before)<=.4+1e-8,'no teleport or hidden time jump');
    if(f.vehicle.traffic?.status==='yielding')yielded=true;
    if(yielded&&f.vehicle.currentSpeed>0){
      assert.ok(f.vehicle.currentSpeed-previousSpeed<=TRAFFIC.acceleration*.1+1e-8);
      resumed=true;
    }
    previousSpeed=f.vehicle.currentSpeed||0;
    if(arrived)break;
  }
  assert.ok(yielded&&resumed&&arrived);
  assert.ok(f.person.z>TRAFFIC.radius);
  assert.equal(f.vehicle.x,8);
  assert.ok(f.state.events.some(e=>e.type==='VehicleYielded'));
  assert.ok(f.state.events.some(e=>e.type==='VehicleResumed'));
});

test('traffic: a parallel sidewalk pedestrian does not create a false crossing blockade',()=>{
  const f=fixture({parallel:true});
  assert.equal(f.helpers.routePerson(f.person,'east'),true);
  assert.equal(f.helpers.routeVehicle(f.vehicle,'b'),true);
  let arrived=false;
  for(let i=0;i<100&&!arrived;i++)arrived=tick(f);
  assert.ok(arrived);
  assert.equal(f.state.events.some(e=>e.type==='VehicleYielded'),false);
  assert.equal(f.vehicle.traffic?.personId,undefined);
});

test('traffic: true arrival clears speed and a parked vehicle departs with progressive acceleration',()=>{
  const f=fixture();f.person.location.kind='building';
  assert.equal(f.helpers.routeVehicle(f.vehicle,'b'),true);
  let arrived=false;
  for(let i=0;i<100&&!arrived;i++)arrived=tick(f,0);
  assert.ok(arrived);
  assert.equal(f.vehicle.currentSpeed,0);
  assert.equal(f.vehicle.traffic.status,'parked');
  for(let i=0;i<20;i++)tick(f,0);
  assert.equal(f.helpers.routeVehicle(f.vehicle,'a'),true);
  const previous={x:f.vehicle.x,z:f.vehicle.z};tick(f,0);
  assert.equal(f.vehicle.currentSpeed,TRAFFIC.acceleration*.1);
  assert.ok(Math.abs(distance(f.vehicle,previous)-TRAFFIC.acceleration*.01)<1e-8);
});

test('traffic: an emergency destination override becomes the actual replan goal',()=>{
  const f=fixture({loop:true});f.person.location.kind='building';
  assert.equal(f.helpers.routeVehicle(f.vehicle,'d'),true);
  assert.equal(f.vehicle.requestedDestinationNodeId,'d');
  const next=f.vehicle.path[0];
  f.vehicle.path=[next];f.vehicle.destinationNodeId=next;
  tick(f,0);
  assert.equal(f.vehicle.requestedDestinationNodeId,next);
  assert.equal(f.vehicle.plannedDestinationNodeId,next);
});

test('traffic: a stationary road casualty selects a reachable alternative parking node, not a false mid-edge arrival',()=>{
  const f=fixture({loop:true});
  Object.assign(f.person,{x:8,z:0,nodeId:'foot-b',path:[],healthState:'critical',mobility:0});
  f.person.location.nodeId='foot-b';
  assert.equal(f.helpers.routeVehicle(f.vehicle,'b'),true);
  assert.equal(f.vehicle.requestedDestinationNodeId,'b');
  assert.notEqual(f.vehicle.destinationNodeId,'b');
  let arrived=false;
  for(let i=0;i<500&&!arrived;i++){
    arrived=tick(f,0);
    assert.ok(distance(f.vehicle,f.person)>=TRAFFIC.radius);
  }
  assert.ok(arrived);
  const actual=f.state.city.vehicleGraph.nodes.find(n=>n.id===f.vehicle.destinationNodeId);
  assert.equal(distance(f.vehicle,actual),0);
  assert.equal(f.vehicle.nodeId,actual.id);
  assert.ok(f.state.city.pedestrianGraph.nodes.some(n=>n.id==='foot-'+actual.id));
  assert.equal(f.person.x,8);
  assert.equal(f.person.z,0);
});

test('traffic: a casualty appearing mid-route causes a finite physical detour without driving through or teleporting',()=>{
  const f=fixture({loop:true});
  f.person.location.kind='building';
  assert.equal(f.helpers.routeVehicle(f.vehicle,'b'),true);
  for(let i=0;i<15;i++)tick(f,0);
  Object.assign(f.person,{x:2,z:0,path:[],healthState:'critical',mobility:0,location:{kind:'street',nodeId:'foot-b'}});
  let arrived=false,maxZ=0;
  for(let i=0;i<600&&!arrived;i++){
    const before={x:f.vehicle.x,z:f.vehicle.z};
    arrived=tick(f,0);
    assert.ok(distance(f.vehicle,before)<=.4+1e-8);
    assert.ok(distance(f.vehicle,f.person)>=TRAFFIC.radius-1e-8);
    maxZ=Math.max(maxZ,f.vehicle.z);
  }
  assert.ok(arrived&&maxZ>=10);
  assert.ok(f.vehicle.trafficReplans>=1);
  assert.equal(f.person.x,2);
  assert.equal(f.person.z,0);
});

test('traffic: a disconnected road cannot be disguised as an arrival at a convenient reachable base node',()=>{
  const f=fixture({loop:true});
  f.person.location.kind='building';
  for(const edge of f.state.city.vehicleGraph.edges)if(edge.from==='a'||edge.to==='a')edge.blocked=true;
  assert.equal(f.helpers.routeVehicle(f.vehicle,'b'),false);
  assert.equal(f.vehicle.x,-6);
  assert.deepEqual(f.vehicle.path,[]);
});

test('traffic: a mid-edge patient is approached at the real point and can return along that same physical edge',()=>{
  const f=fixture();
  f.state.vehicles=[];
  Object.assign(f.person,{x:0,z:-5,nodeId:'south',location:{kind:'street',nodeId:'south'}});
  assert.equal(f.helpers.routePerson(f.person,'north'),true);
  for(let i=0;i<23;i++)f.helpers.movePerson(f.person,1);
  const patient={...structuredClone(f.person),id:'patient',path:[]};
  const medic={...structuredClone(f.person),id:'medic',x:0,z:5,nodeId:'north',path:[],location:{kind:'street',nodeId:'north'},travelEdge:null};
  f.state.people=[patient,medic];
  const patientPosition={x:patient.x,z:patient.z};
  assert.equal(f.helpers.routePersonToPoint(medic,patient),true);
  let arrived=false;
  for(let i=0;i<150&&!arrived;i++){
    const before={x:medic.x,z:medic.z};
    arrived=f.helpers.movePerson(medic,1.25);
    assert.ok(distance(medic,before)<=.125+1e-8);
    assert.equal(medic.x,0);
  }
  assert.ok(arrived);
  assert.equal(distance(medic,patientPosition),0);
  assert.equal(distance(patient,patientPosition),0);
  assert.equal(f.helpers.routePerson(patient,'south'),true);
  let returned=false;
  for(let i=0;i<100&&!returned;i++)returned=f.helpers.movePerson(patient,1);
  assert.ok(returned);
  assert.equal(patient.z,-5);
});

test('traffic: own boarding at a shared stationary parking node is permitted without globally ignoring that crew member',()=>{
  const f=fixture();
  const own={...f.vehicle,id:'own',crewIds:[f.person.id],path:[]};
  f.state.vehicles.push(own);
  f.person.x=-6;f.person.z=3;f.person.nodeId='north';f.person.destinationNodeId='foot-a';
  f.person.path=['foot-a'];
  f.person.location={kind:'street',nodeId:'north'};
  let arrived=false;
  for(let i=0;i<100&&!arrived;i++)arrived=f.helpers.movePerson(f.person,1);
  assert.ok(arrived);
  assert.equal(distance(f.person,own),0);
  // The same officer on a crossing is still a real obstacle for a moving car.
  own.path=['b'];own.destinationNodeId='b';f.vehicle.path=['b'];f.vehicle.destinationNodeId='b';
  f.person.x=0;f.person.z=0;f.person.path=[];f.person.destinationNodeId='north';
  for(let i=0;i<40;i++){f.state.tick++;f.helpers.moveVehicle(own,4);}
  assert.ok(distance(own,f.person)>=TRAFFIC.radius);
});

test('traffic: identical crossing steps and different tick batches have identical canonical outcomes',()=>{
  const a=fixture(),b=fixture();
  for(const f of [a,b]){f.helpers.routePerson(f.person,'north');f.helpers.routeVehicle(f.vehicle,'b');}
  for(let i=0;i<160;i++)tick(a);
  for(const batch of [17,1,42,36,64])for(let i=0;i<batch;i++)tick(b);
  assert.deepEqual(a.state,b.state);
});

test('traffic: a car already on a crossing and an approaching pedestrian break mutual waiting via a real alternative path',()=>{
  const f=fixture();
  const nodes=[{id:'start',x:12,z:4},{id:'crossing',x:8,z:0},{id:'goal',x:4,z:4},{id:'upper-right',x:12,z:6},{id:'upper-left',x:4,z:6}];
  const pairs=[['start','crossing','crossing'],['crossing','goal','crossing'],['start','upper-right','sidewalk'],['upper-right','upper-left','sidewalk'],['upper-left','goal','sidewalk']];
  f.state.city.pedestrianGraph={nodes,edges:pairs.map(([from,to,kind])=>({from,to,kind,length:distance(nodes.find(n=>n.id===from),nodes.find(n=>n.id===to)),blocked:false}))};
  Object.assign(f.vehicle,{x:8,z:0,nodeId:'b',path:[]});
  Object.assign(f.person,{x:10,z:2,nodeId:'start',path:[],location:{kind:'street',nodeId:'start'}});
  f.helpers=createHelpers(f.state);
  f.helpers.routePerson(f.person,'goal');
  assert.equal(f.helpers.routeVehicle(f.vehicle,'a'),true);
  for(let i=0;i<18;i++){f.state.tick++;f.helpers.movePerson(f.person,1);}
  assert.ok(f.person.trafficWaitReason,'the pedestrian must first encounter the already occupied crossing');
  let carArrived=false,pedArrived=false;
  for(let i=0;i<400&&(!carArrived||!pedArrived);i++){
    f.state.tick++;
    pedArrived=f.helpers.movePerson(f.person,1);
    carArrived=f.helpers.moveVehicle(f.vehicle,4);
    assert.ok(distance(f.person,f.vehicle)>=TRAFFIC.radius-1e-8);
  }
  assert.ok(carArrived&&pedArrived,'both physical routes must complete instead of timing out into an overlap');
  assert.ok(f.person.trafficReplans>=1);
  assert.equal(f.person.x,4);assert.equal(f.person.z,4);
  assert.equal(f.vehicle.x,-6);
});

test('traffic: a blocked final medical approach replans from the other real edge endpoint without losing the patient point',()=>{
  const f=fixture();
  const nodes=[{id:'south',x:0,z:-5},{id:'north',x:0,z:5},{id:'east-north',x:4,z:5},{id:'east-south',x:4,z:-5}];
  const pairs=[['south','north'],['north','east-north'],['east-north','east-south'],['east-south','south']];
  f.state.city.pedestrianGraph={nodes,edges:pairs.map(([from,to])=>({from,to,kind:'sidewalk',length:distance(nodes.find(n=>n.id===from),nodes.find(n=>n.id===to)),blocked:false}))};
  f.state.city.vehicleGraph={nodes:[{id:'a',x:0,z:2},{id:'b',x:5,z:2}],edges:[{from:'a',to:'b',kind:'road',length:5,blocked:false}]};
  f.state.vehicles=[];
  Object.assign(f.person,{id:'medic',role:'medic',x:0,z:5,nodeId:'north',path:[],location:{kind:'street',nodeId:'north'}});
  f.helpers=createHelpers(f.state);
  const patient={x:0,z:0,nodeId:'south',travelEdge:{from:'south',to:'north'}};
  assert.equal(f.helpers.routePersonToPoint(f.person,patient),true);
  for(let i=0;i<8;i++){f.state.tick++;f.helpers.movePerson(f.person,1.25);}
  const vehicle={id:'parked',x:0,z:2,nodeId:'a',path:[],crewIds:[],passengerIds:[],incidentId:null};
  f.state.vehicles.push(vehicle);
  let arrived=false,maximumX=0;
  for(let i=0;i<400&&!arrived;i++){
    f.state.tick++;const before={x:f.person.x,z:f.person.z};
    arrived=f.helpers.movePerson(f.person,1.25);
    assert.ok(distance(f.person,before)<=.125+1e-8);
    assert.ok(distance(f.person,vehicle)>=TRAFFIC.radius-1e-8);
    maximumX=Math.max(maximumX,f.person.x);
  }
  assert.ok(arrived&&maximumX>=4);
  assert.ok(f.person.trafficReplans>=1);
  assert.equal(distance(f.person,patient),0);
});

test('traffic: three real seeded towns yield and resume with bounded route stalls and conserved identities',()=>{
  for(const seed of [16927,42,2026]){
    const world=new LivingCity({seed,scenario:'S0'}),ids=world.state.people.map(p=>p.id);
    const tracks=new Map(world.state.vehicles.map(v=>[v.id,{x:v.x,z:v.z,stalled:0,maximum:0,distance:0}]));
    for(let tick=0;tick<2000;tick++){
      world.step();
      for(const vehicle of world.state.vehicles){
        const t=tracks.get(vehicle.id),moved=distance(vehicle,t);
        t.distance+=moved;t.stalled=vehicle.path.length&&moved<1e-7?t.stalled+1:0;
        t.maximum=Math.max(t.maximum,t.stalled);t.x=vehicle.x;t.z=vehicle.z;
        const limit=vehicle.type==='ambulance'?world.state.config.parameters.ambulanceSpeed:
          world.state.config.parameters.policeVehicleSpeed??5.5;
        assert.ok(moved<=limit*.1+1e-7);
      }
    }
    assert.deepEqual(world.state.people.map(p=>p.id),ids);
    assert.equal(world.state.counters.living+world.state.counters.dead,world.state.initialPopulation);
    assert.ok(world.state.events.some(e=>e.type==='VehicleYielded'));
    assert.ok(world.state.events.some(e=>e.type==='VehicleResumed'));
    for(const [id,t] of tracks){
      assert.ok(t.maximum<300,`${seed}/${id}: pending route stalled for ${t.maximum} ticks`);
      if(id.startsWith('police'))assert.ok(t.distance>100,`${seed}/${id}: patrol did not physically circulate`);
    }
  }
});
