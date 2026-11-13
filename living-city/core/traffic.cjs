'use strict';

// A small, deterministic circulation rule, not a full road traffic model.
const TRAFFIC = Object.freeze({radius:1.35, clearance:.2, acceleration:2.5, braking:6, stationaryRetryTicks:20});
const distance = (a,b) => Math.hypot(a.x-b.x,a.z-b.z);
const edgeKey = (a,b) => a < b ? a+'|'+b : b+'|'+a;
function projection(point,a,b){
  const dx=b.x-a.x,dz=b.z-a.z,squared=dx*dx+dz*dz;
  const fraction=squared?((point.x-a.x)*dx+(point.z-a.z)*dz)/squared:0;
  const clamped=Math.max(0,Math.min(1,fraction));
  return {fraction,distance:distance(point,{x:a.x+dx*clamped,z:a.z+dz*clamped}),along:clamped*Math.sqrt(squared)};
}
function intersection(a,b,c,d){
  const rx=b.x-a.x,rz=b.z-a.z,sx=d.x-c.x,sz=d.z-c.z,den=rx*sz-rz*sx;
  if(Math.abs(den)<1e-9)return null;
  const qx=c.x-a.x,qz=c.z-a.z,t=(qx*sz-qz*sx)/den,u=(qx*rz-qz*rx)/den;
  return t>=0&&t<=1&&u>=0&&u<=1?{x:a.x+t*rx,z:a.z+t*rz}:null;
}
const onStreet = person => person.location?.kind==='street';
const stationary = person => !person.path?.length || !!person.trafficWaitReason || person.mobility===0 || ['symptomatic','critical'].includes(person.healthState) || person.lifeState!=='alive';

function medicalHandoffAccess(state,person,vehicle){
  if(person.lifeState!=='alive'||person.location?.kind!=='street'||vehicle.path.length||(vehicle.currentSpeed??0)!==0)return false;
  const parked=state.city.vehicleGraph.nodes.find(node=>node.id===vehicle.nodeId);
  if(!parked||distance(vehicle,parked)>1e-7)return false;
  const care=(state.incidents||[]).find(incident=>incident.id===person.taskId&&incident.type==='medical'&&
    !['resolved','cancelled'].includes(incident.status)&&incident.assignedAmbulanceId);
  if(!care)return false;
  const ambulance=state.vehicles.find(candidate=>candidate.id===care.assignedAmbulanceId&&candidate.type==='ambulance'&&candidate.incidentId===care.id);
  const patient=state.people.find(candidate=>candidate.id===care.personId);
  if(!ambulance||!patient||patient.lifeState!=='alive'||patient.location.kind!=='street'||patient.taskId!==care.id||
    !vehicle.crewIds.includes(patient.id)&&vehicle.id!==ambulance.id||distance(patient,vehicle)>.25)return false;
  // Affiliation identifies the parked source car, never authority to recover
  // the patient. Only the assigned ambulance's medic or that patient may use
  // its door/access abstraction during this actual medical handoff.
  return person.id===patient.id||person.role==='medic'&&ambulance.crewIds.includes(person.id);
}

function vehicleHazard(state,vehicle,target,pedestrianIndex){
  const origin={x:vehicle.x,z:vehicle.z},length=distance(origin,target);
  if(length<1e-8)return null;
  let nearest=null;
  for(const person of state.people){
    if(!onStreet(person))continue;
    const point={x:person.x,z:person.z},projected=projection(point,origin,target);
    let at=null,kind='occupied';
    if(projected.fraction>=0&&projected.fraction<=1&&projected.distance<TRAFFIC.radius+TRAFFIC.clearance)at=point;
    // Only an actual crossing path, not an adjacent parallel sidewalk, gives
    // advance priority. The person's current position is never relocated.
    if(!at&&person.path?.length){
      const next=pedestrianIndex.nodes.get(person.path[0]);
      const link=pedestrianIndex.adj.get(person.nodeId)?.find(l=>l.node===person.path[0]);
      if(next&&link?.edge.kind==='crossing'){
        const crossing=intersection(origin,target,point,next);
        if(crossing&&distance(point,crossing)<=Math.max(.1,person.lastMovementSpeed??person.walkSpeed??1.2)*2){at=crossing;kind='crossing';}
      }
    }
    if(!at)continue;
    const ahead=projection(at,origin,target).along;
    // Existing overlap can happen in imported fixtures. Permit separation,
    // never movement towards/through that person or a timeout override.
    if(distance(origin,point)<TRAFFIC.radius&&distance(target,point)>distance(origin,point)+.01&&projection(point,origin,target).fraction<=0)continue;
    if(!nearest||ahead<nearest.ahead-1e-8||Math.abs(ahead-nearest.ahead)<1e-8&&person.id<nearest.person.id)
      nearest={person,ahead,kind,stationary:stationary(person),point:at};
  }
  return nearest;
}

function roadObstacles(state,index){
  const blockedNodes=new Set(),blockedEdges=new Set();
  for(const person of state.people){
    if(!onStreet(person)||!stationary(person))continue;
    for(const node of index.nodes.values())if(distance(person,node)<TRAFFIC.radius+TRAFFIC.clearance)blockedNodes.add(node.id);
    for(const [from,links] of index.adj)for(const link of links){
      if(from>link.node)continue;
      if(projection(person,index.nodes.get(from),index.nodes.get(link.node)).distance<TRAFFIC.radius+TRAFFIC.clearance)
        blockedEdges.add(edgeKey(from,link.node));
    }
  }
  return {blockedNodes,blockedEdges};
}

function pedestrianVehicleBlock(state,person,next){
  const boardingVehicle=state.vehicles.find(vehicle=>(vehicle.crewIds.includes(person.id)||vehicle.incidentId&&vehicle.incidentId===person.taskId)&&
    !vehicle.path.length&&person.destinationNodeId==='foot-'+vehicle.nodeId);
  for(const vehicle of state.vehicles){
    if(medicalHandoffAccess(state,person,vehicle))continue;
    const from=distance(person,vehicle),to=distance(next,vehicle);
    const ownCrew=vehicle.crewIds.includes(person.id);
    const patient=vehicle.incidentId&&vehicle.incidentId===person.taskId;
    const boarding=(ownCrew||patient)&&!vehicle.path.length&&person.destinationNodeId==='foot-'+vehicle.nodeId;
    const sharedParkingHandoff=boardingVehicle&&!vehicle.path.length&&vehicle.nodeId===boardingVehicle.nodeId&&distance(vehicle,boardingVehicle)<1e-6;
    if(boarding||sharedParkingHandoff)continue;
    if(from<TRAFFIC.radius&&to>=from-1e-8)continue; // physical disembark / escape
    if(projection(vehicle,person,next).distance<TRAFFIC.radius)return vehicle;
  }
  return null;
}

function pedestrianObstacles(state,person,index){
  const blockedEdges=new Set();
  for(const vehicle of state.vehicles){
    if(medicalHandoffAccess(state,person,vehicle))continue;
    if(vehicle.path.length&&!(vehicle.traffic?.status==='yielding'&&vehicle.currentSpeed<.05))continue;
    if(distance(person,vehicle)<TRAFFIC.radius)continue; // disembark: plan an exit, then enforce increasing separation
    const boarding=(vehicle.crewIds.includes(person.id)||vehicle.incidentId&&vehicle.incidentId===person.taskId)&&person.destinationNodeId==='foot-'+vehicle.nodeId;
    if(boarding)continue;
    for(const [from,links] of index.adj)for(const link of links){
      if(from>link.node)continue;
      if(projection(vehicle,index.nodes.get(from),index.nodes.get(link.node)).distance<TRAFFIC.radius)blockedEdges.add(edgeKey(from,link.node));
    }
  }
  return {blockedEdges,blockedNodes:new Set()};
}

function record(state,entity,status,fields={}){
  const old=entity.traffic?.status;
  const since=entity.traffic?.personId===fields.personId&&old===status?entity.traffic.since:state.tick;
  entity.traffic={status,since,...fields};
  if(old===status)return;
  const type=status==='yielding'?'VehicleYielded':old==='yielding'&&status!=='yielding'&&entity.currentSpeed>0?'VehicleResumed':null;
  if(!type)return;
  state.events.push({eventId:++state.eventSequence,type,tick:state.tick,timeSeconds:state.tick/10,
    entityIds:[entity.id,fields.personId].filter(Boolean),visibility:'truth',position:{x:entity.x,z:entity.z},
    message:type==='VehicleYielded'?'Viatura cede passagem a uma pessoa no trajeto.':'Viatura retoma progressivamente após a passagem ficar livre.',...fields});
}

module.exports={TRAFFIC,edgeKey,projection,intersection,stationary,vehicleHazard,roadObstacles,pedestrianVehicleBlock,pedestrianObstacles,medicalHandoffAccess,record};
