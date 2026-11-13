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
