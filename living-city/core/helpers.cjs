'use strict';
const traffic=require('./traffic.cjs');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const clone=value=>JSON.parse(JSON.stringify(value));
function positionOf(state,entity) {
  if(!entity)return {x:0,z:0};
  if(entity.location?.kind==='vehicle'){
    const vehicle=state.vehicles.find(v=>v.id===entity.location.vehicleId);if(vehicle)return {x:vehicle.x,z:vehicle.z};
  }
  if(entity.location?.kind==='building'||entity.location?.kind==='hospital'){
    const building=state.city.buildings.find(b=>b.id===entity.location.buildingId);if(building)return {x:building.x,z:building.z};
  }
  return {x:entity.x,z:entity.z};
}
function graphIndex(graph){
  const nodes=new Map(graph.nodes.map(n=>[n.id,n])),adj=new Map(graph.nodes.map(n=>[n.id,[]]));
  for(const e of graph.edges){adj.get(e.from).push({node:e.to,edge:e});adj.get(e.to).push({node:e.from,edge:e});}
  for(const links of adj.values())links.sort((a,b)=>a.node.localeCompare(b.node));
  return {nodes,adj};
}
function shortest(index,from,to,avoid={}){
  if(!index.nodes.has(from)||!index.nodes.has(to))return null;if(from===to)return [];
  const costs=new Map([[from,0]]),previous=new Map(),open=[from],done=new Set();
  while(open.length){
    open.sort((a,b)=>costs.get(a)-costs.get(b)||a.localeCompare(b));const at=open.shift();if(done.has(at))continue;done.add(at);if(at===to)break;
    for(const link of index.adj.get(at)){
      if(link.edge.blocked||done.has(link.node)||avoid.blockedNodes?.has(link.node)||avoid.blockedEdges?.has(traffic.edgeKey(at,link.node)))continue;
      const cost=costs.get(at)+link.edge.length;
      if(!costs.has(link.node)||cost<costs.get(link.node)-1e-9){costs.set(link.node,cost);previous.set(link.node,at);open.push(link.node);}
    }
  }
  if(!previous.has(to))return null;const path=[];let node=to;
  while(node!==from){path.push(node);node=previous.get(node);}return path.reverse();
}
function createHelpers(state){
  const pedestrian=graphIndex(state.city.pedestrianGraph),road=graphIndex(state.city.vehicleGraph);
  const nearest=(index,point)=>Array.from(index.nodes.values()).sort((a,b)=>distance(a,point)-distance(b,point)||a.id.localeCompare(b.id))[0].id;
  const edgeAt=(entity,index)=>{
    const valid=(from,to)=>{
      const a=index.nodes.get(from),b=index.nodes.get(to);if(!a||!b)return null;
      const p=traffic.projection(entity,a,b);
      return p.fraction>=-1e-7&&p.fraction<=1+1e-7&&p.distance<1e-5?{from,to}:null;
    };
    const saved=entity.travelEdge&&valid(entity.travelEdge.from,entity.travelEdge.to);
    if(saved)return saved;
    if(entity.path?.length){const edge=valid(entity.nodeId,entity.path[0]);if(edge)return edge;}
    for(const link of index.adj.get(entity.nodeId)||[]){const edge=valid(entity.nodeId,link.node);if(edge)return edge;}
    return null;
  };
  const anchors=(entity,index)=>{
    const current=index.nodes.get(entity.nodeId);
    if(current&&distance(current,entity)<1e-7)return [entity.nodeId];
    const edge=edgeAt(entity,index);
    if(edge)return [...new Set([edge.from,edge.to])];
    // Legacy fixtures can use a small offset beside a graph node. This is a
    // real final approach, not a position reset to that node.
    return current?[current.id]:[nearest(index,entity)];
  };
  const plan=(entity,target,index,avoid={})=>{
    const candidates=[];
    for(const anchor of anchors(entity,index)){
      const endpoint=index.nodes.get(anchor);
      if(index===road&&distance(entity,endpoint)>1e-7){
        const obstacle=traffic.vehicleHazard(state,entity,endpoint,pedestrian);
        if(obstacle?.stationary)continue;
      }
      if(index===pedestrian&&avoid.blockedEdges?.size&&distance(entity,endpoint)>1e-7&&
        traffic.pedestrianVehicleBlock(state,{...entity,destinationNodeId:target},endpoint))continue;
      const remainder=shortest(index,anchor,target,avoid);if(remainder===null)continue;
      const node=index.nodes.get(anchor);
      let cost=distance(entity,node),previous=anchor;
      for(const id of remainder){cost+=distance(index.nodes.get(previous),index.nodes.get(id));previous=id;}
      candidates.push({path:distance(entity,node)>1e-7?[anchor,...remainder]:remainder,cost,anchor});
    }
    candidates.sort((a,b)=>a.cost-b.cost||a.anchor.localeCompare(b.anchor));
    return candidates[0]||null;
  };
  const safeParkingNode=(vehicle,preferred)=>{
    if(!road.nodes.has(preferred))return null;
    // Parking alternatives resolve a pedestrian conflict, not a genuinely
    // disconnected road. An ambulance must not claim scene arrival at base.
    if(!anchors(vehicle,road).some(anchor=>shortest(road,anchor,preferred)!==null))return null;
    const avoid=traffic.roadObstacles(state,road),goal=road.nodes.get(preferred);
    const candidates=Array.from(road.nodes.values()).filter(n=>!avoid.blockedNodes.has(n.id));
    candidates.sort((a,b)=>distance(a,goal)-distance(b,goal)||a.id.localeCompare(b.id));
    for(const candidate of candidates)if(plan(vehicle,candidate.id,road,avoid))return candidate.id;
    return null;
  };
  const route=(entity,target,index,isPerson,options={})=>{
    if(!index.nodes.has(target)||entity.broken)return false;
    if(isPerson&&entity.location?.kind==='vehicle')return false;
    let from=entity.nodeId;
    if(isPerson&&(entity.location?.kind==='building'||entity.location?.kind==='hospital')){
      const building=state.city.buildings.find(b=>b.id===entity.location.buildingId);from=building?.entranceNodeIds[0];
    }
    if(!index.nodes.has(from))from=nearest(index,positionOf(state,entity));
    let start=entity;
    if(isPerson&&entity.location?.kind!=='street'){
      const node=index.nodes.get(from);start={...entity,...node,nodeId:from,path:[],travelEdge:null};
    }
    const avoid=isPerson?options.avoid||{}:traffic.roadObstacles(state,road);
    const parking=isPerson?target:safeParkingNode(entity,target);
    if(parking===null)return false;
    const planned=plan(start,parking,index,avoid);if(!planned)return false;
    if(isPerson&&entity.location?.kind!=='street'){
      if(entity.location?.kind==='hospital')state.facilities.hospital.patientIds=state.facilities.hospital.patientIds.filter(id=>id!==entity.id);
      const node=index.nodes.get(from);entity.x=node.x;entity.z=node.z;entity.location={kind:'street',nodeId:from};
    }
    entity.nodeId=from;entity.path=planned.path;entity.destinationNodeId=parking;
    entity.finalApproach=null;entity.destinationPoint=null;
    if(!isPerson){
      entity.requestedDestinationNodeId=target;entity.plannedDestinationNodeId=parking;
      if(!planned.path.length)entity.currentSpeed=0;
    }
    return true;
  };
  const routePersonToPoint=(person,target)=>{
    if(person.location?.kind==='vehicle'||!target||!Number.isFinite(target.x)||!Number.isFinite(target.z))return false;
    const point={x:target.x,z:target.z},targetNode=target.nodeId&&pedestrian.nodes.get(target.nodeId);
    if(state.vehicles.some(vehicle=>distance(vehicle,point)<traffic.TRAFFIC.radius&&distance(person,vehicle)>=traffic.TRAFFIC.radius&&
      !traffic.medicalHandoffAccess(state,person,vehicle)))return false;
    let edge=edgeAt(target,pedestrian);
    if(!edge){
      for(const [from,links] of pedestrian.adj){
        for(const link of links){
          if(from>link.node)continue;
          const projected=traffic.projection(point,pedestrian.nodes.get(from),pedestrian.nodes.get(link.node));
          if(projected.fraction>=0&&projected.fraction<=1&&projected.distance<1e-5){edge={from,to:link.node};break;}
        }
        if(edge)break;
      }
    }
    const endpointIds=edge?[edge.from,edge.to]:targetNode&&distance(targetNode,point)<=.5?[targetNode.id]:[];
    const avoid=traffic.pedestrianObstacles(state,person,pedestrian);
    const options=[];
    for(const endpoint of endpointIds){
      const at=pedestrian.nodes.get(endpoint);
      if(traffic.pedestrianVehicleBlock(state,{...person,...at},point))continue;
      const planned=plan(person,endpoint,pedestrian,avoid);if(!planned)continue;
      options.push({endpoint,cost:planned.cost+distance(pedestrian.nodes.get(endpoint),point)});
    }
    options.sort((a,b)=>a.cost-b.cost||a.endpoint.localeCompare(b.endpoint));
    const chosen=options[0];if(!chosen||!route(person,chosen.endpoint,pedestrian,true,{avoid}))return false;
    person.finalApproach={...point,nodeId:chosen.endpoint,edge};
    person.destinationPoint={...point};
    return true;
  };
  const move=(entity,speed,index,isPerson)=>{
    if(!Number.isFinite(speed)||speed<0||entity.broken)return false;
    if(!isPerson&&entity.plannedDestinationNodeId&&entity.destinationNodeId!==entity.plannedDestinationNodeId){
      // Emergency systems may explicitly shorten a journey to the next road
      // node. A later circulation replan must honor that new stopping goal.
      entity.requestedDestinationNodeId=entity.destinationNodeId;
      entity.plannedDestinationNodeId=entity.destinationNodeId;
    }
    entity.lastMovementSpeed=speed;
    if(!entity.path.length&&!entity.finalApproach){
      if(!isPerson){entity.currentSpeed=0;traffic.record(state,entity,'parked');}
      return entity.destinationPoint?distance(entity,entity.destinationPoint)<1e-7:entity.nodeId===entity.destinationNodeId;
    }
    const congestion=!isPerson&&state.vehicles.some(other=>other.id!==entity.id&&other.path.length&&entity.path[0]===other.path[0]&&distance(other,entity)<4)? .45:1;
    let effectiveSpeed=speed*congestion;
    if(!isPerson){
      const next=index.nodes.get(entity.path[0]);
      const hazard=next&&traffic.vehicleHazard(state,entity,next,pedestrian);
      const safeDistance=hazard?Math.max(0,hazard.ahead-traffic.TRAFFIC.radius-traffic.TRAFFIC.clearance):Infinity;
      const wanted=hazard?Math.min(effectiveSpeed,Math.sqrt(2*traffic.TRAFFIC.braking*safeDistance)):effectiveSpeed;
      const previous=entity.currentSpeed??0;
      entity.currentSpeed=wanted>previous?Math.min(wanted,previous+traffic.TRAFFIC.acceleration*.1):Math.max(wanted,previous-traffic.TRAFFIC.braking*.1);
      effectiveSpeed=Math.min(entity.currentSpeed,safeDistance/.1);
      entity.currentSpeed=effectiveSpeed;
      traffic.record(state,entity,hazard&&effectiveSpeed<.05?'yielding':hazard?'slowing':'moving',hazard?{personId:hazard.person.id,reason:hazard.kind,stationary:hazard.stationary}:{});
      if(hazard?.stationary&&entity.traffic.status==='yielding'&&state.tick-entity.traffic.since>=traffic.TRAFFIC.stationaryRetryTicks){
        if(route(entity,entity.requestedDestinationNodeId||entity.destinationNodeId,road,false)){
          entity.trafficReplans=(entity.trafficReplans||0)+1;
          entity.traffic.since=state.tick;
        }else entity.trafficWaitReason='Sem alternativa viária livre; aguarda acesso seguro sem atravessar a pessoa.';
      }
    }
    let remaining=effectiveSpeed*.1;
    while(remaining>1e-10&&(entity.path.length||isPerson&&entity.finalApproach)){
      const final=isPerson&&!entity.path.length&&entity.finalApproach;
      const nextId=entity.path[0],target=final||index.nodes.get(nextId);
      const link=index.adj.get(entity.nodeId)?.find(l=>l.node===nextId);
      if(!target||!final&&link?.edge.blocked){
        if(!isPerson){
          if(!route(entity,entity.requestedDestinationNodeId||entity.destinationNodeId,road,false)){entity.routeBlocked=true;entity.currentSpeed=0;return false;}
          continue;
        }
        const reroute=shortest(index,entity.nodeId,entity.destinationNodeId);
        if(reroute===null){entity.routeBlocked=true;return false;}
        const previous=index.nodes.get(entity.nodeId);
        entity.path=distance(entity,previous)>1e-7?[entity.nodeId,...reroute]:reroute;continue;
      }
      const d=distance(entity,target);let step=Math.min(d,remaining,.25);
      if(!isPerson){
        const hazard=traffic.vehicleHazard(state,entity,target,pedestrian);
        if(hazard)step=Math.min(step,Math.max(0,hazard.ahead-traffic.TRAFFIC.radius-traffic.TRAFFIC.clearance));
        if(step<1e-10){entity.currentSpeed=0;return false;}
      }
      const next=d>1e-9?{x:entity.x+(target.x-entity.x)/d*step,z:entity.z+(target.z-entity.z)/d*step}:{x:entity.x,z:entity.z};
      if(isPerson){
        const blocked=traffic.pedestrianVehicleBlock(state,entity,next);
        if(blocked){
          entity.trafficWaitSince??=state.tick;
          entity.trafficWaitReason='Aguarda passagem junto de uma viatura já presente.';
          if(state.tick-entity.trafficWaitSince>=traffic.TRAFFIC.stationaryRetryTicks){
            const rerouted=final?routePersonToPoint(entity,{...entity.destinationPoint,nodeId:final.nodeId,travelEdge:final.edge}):
              route(entity,entity.destinationNodeId,pedestrian,true,{avoid:traffic.pedestrianObstacles(state,entity,pedestrian)});
            if(rerouted){
              entity.trafficReplans=(entity.trafficReplans||0)+1;entity.trafficWaitSince=state.tick;
            }
          }
          return false;
        }
        entity.trafficWaitSince=null;entity.trafficWaitReason=null;
      }
      if(d>1e-9){entity.x=next.x;entity.z=next.z;}
      if(!final&&entity.nodeId!==nextId)entity.travelEdge={from:entity.nodeId,to:nextId};
      else if(final&&final.edge)entity.travelEdge={...final.edge};
      remaining-=step;
      if(d<=step+1e-9){
        entity.x=target.x;entity.z=target.z;
        if(final)entity.finalApproach=null;
        else{entity.nodeId=nextId;entity.path.shift();entity.travelEdge=null;if(isPerson)entity.location={kind:'street',nodeId:nextId};}
      }
    }
    entity.routeBlocked=false;
    const arrived=entity.path.length===0&&!entity.finalApproach&&(entity.destinationPoint?distance(entity,entity.destinationPoint)<1e-7:entity.nodeId===entity.destinationNodeId);
    if(!isPerson&&arrived){entity.currentSpeed=0;traffic.record(state,entity,'parked');}
    return arrived;
  };
  const lineOfSight=(a,b)=>{
    const length=distance(a,b),steps=Math.max(1,Math.ceil(length*2));
    for(let i=1;i<steps;i++){
      const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps;
      if(state.city.buildings.some(building=>Math.abs(x-building.x)<building.width/2-.08&&Math.abs(z-building.z)<building.depth/2-.08))return false;
    }
    return true;
  };
  return {
    position:entity=>positionOf(state,entity),nearestPedNode:point=>nearest(pedestrian,point),nearestRoadNode:point=>nearest(road,point),lineOfSight,
    routePerson:(person,target)=>route(person,target,pedestrian,true),movePerson:(person,speed)=>move(person,speed,pedestrian,true),
    routeVehicle:(vehicle,target)=>route(vehicle,target,road,false),moveVehicle:(vehicle,speed)=>move(vehicle,speed,road,false),
    routePersonToPoint,safeParkingNode,
    pedestrianNode:id=>pedestrian.nodes.get(id),roadNode:id=>road.nodes.get(id),
    pedestrianRoute:(from,to)=>shortest(pedestrian,from,to),vehicleRoute:(from,to)=>shortest(road,from,to)
  };
}
module.exports={positionOf,createHelpers,distance,clone};
