'use strict';
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
function shortest(index,from,to){
  if(!index.nodes.has(from)||!index.nodes.has(to))return null;if(from===to)return [];
  const costs=new Map([[from,0]]),previous=new Map(),open=[from],done=new Set();
  while(open.length){
    open.sort((a,b)=>costs.get(a)-costs.get(b)||a.localeCompare(b));const at=open.shift();if(done.has(at))continue;done.add(at);if(at===to)break;
    for(const link of index.adj.get(at)){
      if(link.edge.blocked||done.has(link.node))continue;
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
  const route=(entity,target,index,isPerson)=>{
    if(!index.nodes.has(target)||entity.broken)return false;
    if(isPerson&&entity.location?.kind==='vehicle')return false;
    let from=entity.nodeId;
    if(isPerson&&(entity.location?.kind==='building'||entity.location?.kind==='hospital')){
      const building=state.city.buildings.find(b=>b.id===entity.location.buildingId);from=building?.entranceNodeIds[0];
    }
    if(!index.nodes.has(from))from=nearest(index,positionOf(state,entity));
    const current=index.nodes.get(from),inMotion=entity.path.length>0&&current&&distance(current,entity)>1e-7;
    const anchor=inMotion?entity.path[0]:from;
    const remainder=shortest(index,anchor,target);if(remainder===null)return false;
    const path=inMotion?[anchor,...remainder]:remainder;
    if(isPerson&&entity.location?.kind!=='street'){
      const node=index.nodes.get(from);entity.x=node.x;entity.z=node.z;entity.location={kind:'street',nodeId:from};
    }
    entity.nodeId=from;entity.path=path;entity.destinationNodeId=target;return true;
  };
  const move=(entity,speed,index,isPerson)=>{
    if(!Number.isFinite(speed)||speed<0||entity.broken)return false;
    if(!entity.path.length)return entity.nodeId===entity.destinationNodeId;
    let remaining=speed*.1;
    while(remaining>1e-10&&entity.path.length){
      const nextId=entity.path[0],target=index.nodes.get(nextId);
      const link=index.adj.get(entity.nodeId)?.find(l=>l.node===nextId);
      if(!target||link?.edge.blocked){
        const reroute=shortest(index,entity.nodeId,entity.destinationNodeId);
        if(reroute===null){entity.routeBlocked=true;return false;}
        const previous=index.nodes.get(entity.nodeId);
        entity.path=distance(entity,previous)>1e-7?[entity.nodeId,...reroute]:reroute;continue;
      }
      const d=distance(entity,target),step=Math.min(d,remaining);
      if(d>1e-9){entity.x+=(target.x-entity.x)/d*step;entity.z+=(target.z-entity.z)/d*step;}
      remaining-=step;
      if(d<=step+1e-9){entity.x=target.x;entity.z=target.z;entity.nodeId=nextId;entity.path.shift();if(isPerson)entity.location={kind:'street',nodeId:nextId};}
    }
    entity.routeBlocked=false;return entity.path.length===0&&entity.nodeId===entity.destinationNodeId;
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
    pedestrianNode:id=>pedestrian.nodes.get(id),roadNode:id=>road.nodes.get(id),
    pedestrianRoute:(from,to)=>shortest(pedestrian,from,to),vehicleRoute:(from,to)=>shortest(road,from,to)
  };
}
module.exports={positionOf,createHelpers,distance,clone};
