(()=>{var zu=Object.create;var Ol=Object.defineProperty;var Vu=Object.getOwnPropertyDescriptor;var Hu=Object.getOwnPropertyNames;var Gu=Object.getPrototypeOf,Wu=Object.prototype.hasOwnProperty;var ni=(n,e)=>()=>(e||n((e={exports:{}}).exports,e),e.exports);var Xu=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of Hu(e))!Wu.call(n,s)&&s!==t&&Ol(n,s,{get:()=>e[s],enumerable:!(i=Vu(e,s))||i.enumerable});return n};var Do=(n,e,t)=>(t=n!=null?zu(Gu(n)):{},Xu(e||!n||!n.__esModule?Ol(t,"default",{value:n,enumerable:!0}):t,n));var Bl=ni((I_,kl)=>{"use strict";function qu(){let n={width:96,height:70,buildings:[],roads:[],sidewalks:[],crossings:[],blocks:[],pedestrianGraph:{nodes:[],edges:[]},vehicleGraph:{nodes:[],edges:[]}},e=[5,26,48,70,92],t=[5,34,65],i=[],s=(o,c,l,h)=>{let u=o.nodes.find(p=>p.id===c),d=o.nodes.find(p=>p.id===l);o.edges.push({from:c,to:l,kind:h,length:Math.hypot(u.x-d.x,u.z-d.z),blocked:!1})};for(let o=0;o<3;o++)for(let c=0;c<5;c++){let l={id:`road-${o}-${c}`,x:e[c]+[0,1.2,-.8][o],z:t[o]+[0,.9,-.7,1.1,0][c]};n.vehicleGraph.nodes.push(l),i.push(l)}for(let o=0;o<3;o++)for(let c=0;c<5;c++){let l=i[o*5+c];for(let[h,u]of[[o,c+1],[o+1,c]])if(h<3&&u<5){let d=i[h*5+u];s(n.vehicleGraph,l.id,d.id,"road"),n.roads.push({id:`road-segment-${l.id}-${d.id}`,points:[{x:l.x,z:l.z},{x:d.x,z:d.z}],width:4.8})}}let r=[];for(let o=0;o<2;o++)for(let c=0;c<4;c++){let l=`block-${o*4+c+1}`,h=i[o*5+c],u=i[o*5+c+1],d=i[(o+1)*5+c],p=i[(o+1)*5+c+1],g=Math.max(h.x,d.x)+3.8,x=Math.min(u.x,p.x)-3.8,m=Math.max(h.z,u.z)+3.8,f=Math.min(d.z,p.z)-3.8,S=(g+x)/2,T=[{x:g,z:m},{x:S,z:m},{x,z:m},{x,z:(m+f)/2},{x,z:f},{x:S,z:f},{x:g,z:f},{x:g,z:(m+f)/2}].map((E,b)=>({id:`${l}-walk-${b}`,...E}));n.pedestrianGraph.nodes.push(...T);for(let E=0;E<T.length;E++){let b=T[E],C=T[(E+1)%T.length];s(n.pedestrianGraph,b.id,C.id,"sidewalk"),n.sidewalks.push({id:`${l}-side-${E}`,points:[{x:b.x,z:b.z},{x:C.x,z:C.z}],width:1.4})}n.blocks.push({id:l,x:(g+x)/2,z:(m+f)/2,width:x-g,depth:f-m}),r.push(T);for(let E=0;E<4;E++){let b=(o*4+c)*4+E+1,C=`building-${String(b).padStart(2,"0")}`,D=E<2?0:1,y=g+(x-g)*(E%2?.72:.28),v=m+(f-m)*(D?.72:.28),I=b===3?"hospital":b===27?"station":b%4===0?"office":b%4===2?"shop":"residential",N=Math.min(4.4,(x-g)*.32),k=5.2,V={id:`${C}-entrance`,x:y,z:v+(D?1:-1)*(k/2+.35)},W={id:`${C}-sidewalk`,x:y,z:D?f:m};n.pedestrianGraph.nodes.push(V,W),s(n.pedestrianGraph,V.id,W.id,"entrance");let te=(D?[T[4],T[5],T[6]]:[T[0],T[1],T[2]]).slice().sort((Q,ee)=>Math.abs(Q.x-y)-Math.abs(ee.x-y)||Q.id.localeCompare(ee.id))[0];s(n.pedestrianGraph,W.id,te.id,"sidewalk"),n.sidewalks.push({id:`${C}-access`,points:[{x:V.x,z:V.z},{x:W.x,z:W.z},{x:te.x,z:te.z}],width:1.1});let G=i.slice().sort((Q,ee)=>Math.hypot(Q.x-y,Q.z-v)-Math.hypot(ee.x-y,ee.z-v)||Q.id.localeCompare(ee.id))[0];n.buildings.push({id:C,type:I,name:I==="hospital"?"Hospital do Bairro":I==="station"?"Esquadra Central":I==="residential"?`Habita\xE7\xE3o ${b}`:I==="shop"?`Com\xE9rcio ${b}`:`Servi\xE7os ${b}`,x:y,z:v,width:N,depth:k,height:I==="hospital"?6.4:I==="station"?4.4:3.2+b%3*1.1,entranceNodeIds:[V.id],vehicleNodeId:G.id,capacity:I==="hospital"?4:12})}}let a=(o,c,l)=>{s(n.pedestrianGraph,o.id,c.id,"crossing"),n.crossings.push({id:l,points:[{x:o.x,z:o.z},{x:c.x,z:c.z}],width:2})};for(let o=0;o<2;o++)for(let c=0;c<4;c++){let l=r[o*4+c];c<3&&a(l[3],r[o*4+c+1][7],`cross-east-${o}-${c}`),o<1&&a(l[5],r[4+c][1],`cross-south-${c}`)}for(let o of i){let c={id:`foot-${o.id}`,x:o.x,z:o.z,roadNodeId:o.id},l=r.flat().slice().sort((h,u)=>Math.hypot(h.x-c.x,h.z-c.z)-Math.hypot(u.x-c.x,u.z-c.z)||h.id.localeCompare(u.id)).slice(0,2);n.pedestrianGraph.nodes.push(c);for(let h of l)a(c,h,`parking-${o.id}-${h.id}`)}return n}kl.exports={createCity:qu}});var Gl=ni((R_,Hl)=>{"use strict";var si=Object.freeze({radius:1.35,clearance:.2,acceleration:2.5,braking:6,stationaryRetryTicks:20}),Jt=(n,e)=>Math.hypot(n.x-e.x,n.z-e.z),Lo=(n,e)=>n<e?n+"|"+e:e+"|"+n;function xn(n,e,t){let i=t.x-e.x,s=t.z-e.z,r=i*i+s*s,a=r?((n.x-e.x)*i+(n.z-e.z)*s)/r:0,o=Math.max(0,Math.min(1,a));return{fraction:a,distance:Jt(n,{x:e.x+i*o,z:e.z+s*o}),along:o*Math.sqrt(r)}}function zl(n,e,t,i){let s=e.x-n.x,r=e.z-n.z,a=i.x-t.x,o=i.z-t.z,c=s*o-r*a;if(Math.abs(c)<1e-9)return null;let l=t.x-n.x,h=t.z-n.z,u=(l*o-h*a)/c,d=(l*r-h*s)/c;return u>=0&&u<=1&&d>=0&&d<=1?{x:n.x+u*s,z:n.z+u*r}:null}var Vl=n=>n.location?.kind==="street",No=n=>!n.path?.length||!!n.trafficWaitReason||n.mobility===0||["symptomatic","critical"].includes(n.healthState)||n.lifeState!=="alive";function Uo(n,e,t){if(e.lifeState!=="alive"||e.location?.kind!=="street"||t.path.length||(t.currentSpeed??0)!==0)return!1;let i=n.city.vehicleGraph.nodes.find(o=>o.id===t.nodeId);if(!i||Jt(t,i)>1e-7)return!1;let s=(n.incidents||[]).find(o=>o.id===e.taskId&&o.type==="medical"&&!["resolved","cancelled"].includes(o.status)&&o.assignedAmbulanceId);if(!s)return!1;let r=n.vehicles.find(o=>o.id===s.assignedAmbulanceId&&o.type==="ambulance"&&o.incidentId===s.id),a=n.people.find(o=>o.id===s.personId);return!r||!a||a.lifeState!=="alive"||a.location.kind!=="street"||a.taskId!==s.id||!t.crewIds.includes(a.id)&&t.id!==r.id||Jt(a,t)>.25?!1:e.id===a.id||e.role==="medic"&&r.crewIds.includes(e.id)}function Yu(n,e,t,i){let s={x:e.x,z:e.z};if(Jt(s,t)<1e-8)return null;let a=null;for(let o of n.people){if(!Vl(o))continue;let c={x:o.x,z:o.z},l=xn(c,s,t),h=null,u="occupied";if(l.fraction>=0&&l.fraction<=1&&l.distance<si.radius+si.clearance&&(h=c),!h&&o.path?.length){let p=i.nodes.get(o.path[0]),g=i.adj.get(o.nodeId)?.find(x=>x.node===o.path[0]);if(p&&g?.edge.kind==="crossing"){let x=zl(s,t,c,p);x&&Jt(c,x)<=Math.max(.1,o.lastMovementSpeed??o.walkSpeed??1.2)*2&&(h=x,u="crossing")}}if(!h)continue;let d=xn(h,s,t).along;Jt(s,c)<si.radius&&Jt(t,c)>Jt(s,c)+.01&&xn(c,s,t).fraction<=0||(!a||d<a.ahead-1e-8||Math.abs(d-a.ahead)<1e-8&&o.id<a.person.id)&&(a={person:o,ahead:d,kind:u,stationary:No(o),point:h})}return a}function $u(n,e){let t=new Set,i=new Set;for(let s of n.people)if(!(!Vl(s)||!No(s))){for(let r of e.nodes.values())Jt(s,r)<si.radius+si.clearance&&t.add(r.id);for(let[r,a]of e.adj)for(let o of a)r>o.node||xn(s,e.nodes.get(r),e.nodes.get(o.node)).distance<si.radius+si.clearance&&i.add(Lo(r,o.node))}return{blockedNodes:t,blockedEdges:i}}function Zu(n,e,t){let i=n.vehicles.find(s=>(s.crewIds.includes(e.id)||s.incidentId&&s.incidentId===e.taskId)&&!s.path.length&&e.destinationNodeId==="foot-"+s.nodeId);for(let s of n.vehicles){if(Uo(n,e,s))continue;let r=Jt(e,s),a=Jt(t,s),o=s.crewIds.includes(e.id),c=s.incidentId&&s.incidentId===e.taskId,l=(o||c)&&!s.path.length&&e.destinationNodeId==="foot-"+s.nodeId,h=i&&!s.path.length&&s.nodeId===i.nodeId&&Jt(s,i)<1e-6;if(!(l||h)&&!(r<si.radius&&a>=r-1e-8)&&xn(s,e,t).distance<si.radius)return s}return null}function Ju(n,e,t){let i=new Set;for(let s of n.vehicles)if(!(Uo(n,e,s)||s.path.length&&!(s.traffic?.status==="yielding"&&s.currentSpeed<.05)||Jt(e,s)<si.radius||(s.crewIds.includes(e.id)||s.incidentId&&s.incidentId===e.taskId)&&e.destinationNodeId==="foot-"+s.nodeId))for(let[a,o]of t.adj)for(let c of o)a>c.node||xn(s,t.nodes.get(a),t.nodes.get(c.node)).distance<si.radius&&i.add(Lo(a,c.node));return{blockedEdges:i,blockedNodes:new Set}}function Ku(n,e,t,i={}){let s=e.traffic?.status,r=e.traffic?.personId===i.personId&&s===t?e.traffic.since:n.tick;if(e.traffic={status:t,since:r,...i},s===t)return;let a=t==="yielding"?"VehicleYielded":s==="yielding"&&t!=="yielding"&&e.currentSpeed>0?"VehicleResumed":null;a&&n.events.push({eventId:++n.eventSequence,type:a,tick:n.tick,timeSeconds:n.tick/10,entityIds:[e.id,i.personId].filter(Boolean),visibility:"truth",position:{x:e.x,z:e.z},message:a==="VehicleYielded"?"Viatura cede passagem a uma pessoa no trajeto.":"Viatura retoma progressivamente ap\xF3s a passagem ficar livre.",...i})}Hl.exports={TRAFFIC:si,edgeKey:Lo,projection:xn,intersection:zl,stationary:No,vehicleHazard:Yu,roadObstacles:$u,pedestrianVehicleBlock:Zu,pedestrianObstacles:Ju,medicalHandoffAccess:Uo,record:Ku}});var xr=ni((P_,Xl)=>{"use strict";var et=Gl(),xt=(n,e)=>Math.hypot(n.x-e.x,n.z-e.z),ju=n=>JSON.parse(JSON.stringify(n));function Fo(n,e){if(!e)return{x:0,z:0};if(e.location?.kind==="vehicle"){let t=n.vehicles.find(i=>i.id===e.location.vehicleId);if(t)return{x:t.x,z:t.z}}if(e.location?.kind==="building"||e.location?.kind==="hospital"){let t=n.city.buildings.find(i=>i.id===e.location.buildingId);if(t)return{x:t.x,z:t.z}}return{x:e.x,z:e.z}}function Wl(n){let e=new Map(n.nodes.map(i=>[i.id,i])),t=new Map(n.nodes.map(i=>[i.id,[]]));for(let i of n.edges)t.get(i.from).push({node:i.to,edge:i}),t.get(i.to).push({node:i.from,edge:i});for(let i of t.values())i.sort((s,r)=>s.node.localeCompare(r.node));return{nodes:e,adj:t}}function ys(n,e,t,i={}){if(!n.nodes.has(e)||!n.nodes.has(t))return null;if(e===t)return[];let s=new Map([[e,0]]),r=new Map,a=[e],o=new Set;for(;a.length;){a.sort((u,d)=>s.get(u)-s.get(d)||u.localeCompare(d));let h=a.shift();if(!o.has(h)){if(o.add(h),h===t)break;for(let u of n.adj.get(h)){if(u.edge.blocked||o.has(u.node)||i.blockedNodes?.has(u.node)||i.blockedEdges?.has(et.edgeKey(h,u.node)))continue;let d=s.get(h)+u.edge.length;(!s.has(u.node)||d<s.get(u.node)-1e-9)&&(s.set(u.node,d),r.set(u.node,h),a.push(u.node))}}}if(!r.has(t))return null;let c=[],l=t;for(;l!==e;)c.push(l),l=r.get(l);return c.reverse()}function Qu(n){let e=Wl(n.city.pedestrianGraph),t=Wl(n.city.vehicleGraph),i=(d,p)=>Array.from(d.nodes.values()).sort((g,x)=>xt(g,p)-xt(x,p)||g.id.localeCompare(x.id))[0].id,s=(d,p)=>{let g=(m,f)=>{let S=p.nodes.get(m),w=p.nodes.get(f);if(!S||!w)return null;let T=et.projection(d,S,w);return T.fraction>=-1e-7&&T.fraction<=1.0000001&&T.distance<1e-5?{from:m,to:f}:null},x=d.travelEdge&&g(d.travelEdge.from,d.travelEdge.to);if(x)return x;if(d.path?.length){let m=g(d.nodeId,d.path[0]);if(m)return m}for(let m of p.adj.get(d.nodeId)||[]){let f=g(d.nodeId,m.node);if(f)return f}return null},r=(d,p)=>{let g=p.nodes.get(d.nodeId);if(g&&xt(g,d)<1e-7)return[d.nodeId];let x=s(d,p);return x?[...new Set([x.from,x.to])]:g?[g.id]:[i(p,d)]},a=(d,p,g,x={})=>{let m=[];for(let f of r(d,g)){let S=g.nodes.get(f);if(g===t&&xt(d,S)>1e-7&&et.vehicleHazard(n,d,S,e)?.stationary||g===e&&x.blockedEdges?.size&&xt(d,S)>1e-7&&et.pedestrianVehicleBlock(n,{...d,destinationNodeId:p},S))continue;let w=ys(g,f,p,x);if(w===null)continue;let T=g.nodes.get(f),E=xt(d,T),b=f;for(let C of w)E+=xt(g.nodes.get(b),g.nodes.get(C)),b=C;m.push({path:xt(d,T)>1e-7?[f,...w]:w,cost:E,anchor:f})}return m.sort((f,S)=>f.cost-S.cost||f.anchor.localeCompare(S.anchor)),m[0]||null},o=(d,p)=>{if(!t.nodes.has(p)||!r(d,t).some(f=>ys(t,f,p)!==null))return null;let g=et.roadObstacles(n,t),x=t.nodes.get(p),m=Array.from(t.nodes.values()).filter(f=>!g.blockedNodes.has(f.id));m.sort((f,S)=>xt(f,x)-xt(S,x)||f.id.localeCompare(S.id));for(let f of m)if(a(d,f.id,t,g))return f.id;return null},c=(d,p,g,x,m={})=>{if(!g.nodes.has(p)||d.broken||x&&d.location?.kind==="vehicle")return!1;let f=d.nodeId;x&&(d.location?.kind==="building"||d.location?.kind==="hospital")&&(f=n.city.buildings.find(C=>C.id===d.location.buildingId)?.entranceNodeIds[0]),g.nodes.has(f)||(f=i(g,Fo(n,d)));let S=d;if(x&&d.location?.kind!=="street"){let b=g.nodes.get(f);S={...d,...b,nodeId:f,path:[],travelEdge:null}}let w=x?m.avoid||{}:et.roadObstacles(n,t),T=x?p:o(d,p);if(T===null)return!1;let E=a(S,T,g,w);if(!E)return!1;if(x&&d.location?.kind!=="street"){d.location?.kind==="hospital"&&(n.facilities.hospital.patientIds=n.facilities.hospital.patientIds.filter(C=>C!==d.id));let b=g.nodes.get(f);d.x=b.x,d.z=b.z,d.location={kind:"street",nodeId:f}}return d.nodeId=f,d.path=E.path,d.destinationNodeId=T,d.finalApproach=null,d.destinationPoint=null,x||(d.requestedDestinationNodeId=p,d.plannedDestinationNodeId=T,E.path.length||(d.currentSpeed=0)),!0},l=(d,p)=>{if(d.location?.kind==="vehicle"||!p||!Number.isFinite(p.x)||!Number.isFinite(p.z))return!1;let g={x:p.x,z:p.z},x=p.nodeId&&e.nodes.get(p.nodeId);if(n.vehicles.some(E=>xt(E,g)<et.TRAFFIC.radius&&xt(d,E)>=et.TRAFFIC.radius&&!et.medicalHandoffAccess(n,d,E)))return!1;let m=s(p,e);if(!m)for(let[E,b]of e.adj){for(let C of b){if(E>C.node)continue;let D=et.projection(g,e.nodes.get(E),e.nodes.get(C.node));if(D.fraction>=0&&D.fraction<=1&&D.distance<1e-5){m={from:E,to:C.node};break}}if(m)break}let f=m?[m.from,m.to]:x&&xt(x,g)<=.5?[x.id]:[],S=et.pedestrianObstacles(n,d,e),w=[];for(let E of f){let b=e.nodes.get(E);if(et.pedestrianVehicleBlock(n,{...d,...b},g))continue;let C=a(d,E,e,S);C&&w.push({endpoint:E,cost:C.cost+xt(e.nodes.get(E),g)})}w.sort((E,b)=>E.cost-b.cost||E.endpoint.localeCompare(b.endpoint));let T=w[0];return!T||!c(d,T.endpoint,e,!0,{avoid:S})?!1:(d.finalApproach={...g,nodeId:T.endpoint,edge:m},d.destinationPoint={...g},!0)},h=(d,p,g,x)=>{if(!Number.isFinite(p)||p<0||d.broken)return!1;if(!x&&d.plannedDestinationNodeId&&d.destinationNodeId!==d.plannedDestinationNodeId&&(d.requestedDestinationNodeId=d.destinationNodeId,d.plannedDestinationNodeId=d.destinationNodeId),d.lastMovementSpeed=p,!d.path.length&&!d.finalApproach)return x||(d.currentSpeed=0,et.record(n,d,"parked")),d.destinationPoint?xt(d,d.destinationPoint)<1e-7:d.nodeId===d.destinationNodeId;let m=!x&&n.vehicles.some(T=>T.id!==d.id&&T.path.length&&d.path[0]===T.path[0]&&xt(T,d)<4)?.45:1,f=p*m;if(!x){let T=g.nodes.get(d.path[0]),E=T&&et.vehicleHazard(n,d,T,e),b=E?Math.max(0,E.ahead-et.TRAFFIC.radius-et.TRAFFIC.clearance):1/0,C=E?Math.min(f,Math.sqrt(2*et.TRAFFIC.braking*b)):f,D=d.currentSpeed??0;d.currentSpeed=C>D?Math.min(C,D+et.TRAFFIC.acceleration*.1):Math.max(C,D-et.TRAFFIC.braking*.1),f=Math.min(d.currentSpeed,b/.1),d.currentSpeed=f,et.record(n,d,E&&f<.05?"yielding":E?"slowing":"moving",E?{personId:E.person.id,reason:E.kind,stationary:E.stationary}:{}),E?.stationary&&d.traffic.status==="yielding"&&n.tick-d.traffic.since>=et.TRAFFIC.stationaryRetryTicks&&(c(d,d.requestedDestinationNodeId||d.destinationNodeId,t,!1)?(d.trafficReplans=(d.trafficReplans||0)+1,d.traffic.since=n.tick):d.trafficWaitReason="Sem alternativa vi\xE1ria livre; aguarda acesso seguro sem atravessar a pessoa.")}let S=f*.1;for(;S>1e-10&&(d.path.length||x&&d.finalApproach);){let T=x&&!d.path.length&&d.finalApproach,E=d.path[0],b=T||g.nodes.get(E),C=g.adj.get(d.nodeId)?.find(I=>I.node===E);if(!b||!T&&C?.edge.blocked){if(!x){if(!c(d,d.requestedDestinationNodeId||d.destinationNodeId,t,!1))return d.routeBlocked=!0,d.currentSpeed=0,!1;continue}let I=ys(g,d.nodeId,d.destinationNodeId);if(I===null)return d.routeBlocked=!0,!1;let N=g.nodes.get(d.nodeId);d.path=xt(d,N)>1e-7?[d.nodeId,...I]:I;continue}let D=xt(d,b),y=Math.min(D,S,.25);if(!x){let I=et.vehicleHazard(n,d,b,e);if(I&&(y=Math.min(y,Math.max(0,I.ahead-et.TRAFFIC.radius-et.TRAFFIC.clearance))),y<1e-10)return d.currentSpeed=0,!1}let v=D>1e-9?{x:d.x+(b.x-d.x)/D*y,z:d.z+(b.z-d.z)/D*y}:{x:d.x,z:d.z};if(x){if(et.pedestrianVehicleBlock(n,d,v))return d.trafficWaitSince??=n.tick,d.trafficWaitReason="Aguarda passagem junto de uma viatura j\xE1 presente.",n.tick-d.trafficWaitSince>=et.TRAFFIC.stationaryRetryTicks&&(T?l(d,{...d.destinationPoint,nodeId:T.nodeId,travelEdge:T.edge}):c(d,d.destinationNodeId,e,!0,{avoid:et.pedestrianObstacles(n,d,e)}))&&(d.trafficReplans=(d.trafficReplans||0)+1,d.trafficWaitSince=n.tick),!1;d.trafficWaitSince=null,d.trafficWaitReason=null}D>1e-9&&(d.x=v.x,d.z=v.z),!T&&d.nodeId!==E?d.travelEdge={from:d.nodeId,to:E}:T&&T.edge&&(d.travelEdge={...T.edge}),S-=y,D<=y+1e-9&&(d.x=b.x,d.z=b.z,T?d.finalApproach=null:(d.nodeId=E,d.path.shift(),d.travelEdge=null,x&&(d.location={kind:"street",nodeId:E})))}d.routeBlocked=!1;let w=d.path.length===0&&!d.finalApproach&&(d.destinationPoint?xt(d,d.destinationPoint)<1e-7:d.nodeId===d.destinationNodeId);return!x&&w&&(d.currentSpeed=0,et.record(n,d,"parked")),w};return{position:d=>Fo(n,d),nearestPedNode:d=>i(e,d),nearestRoadNode:d=>i(t,d),lineOfSight:(d,p)=>{let g=xt(d,p),x=Math.max(1,Math.ceil(g*2));for(let m=1;m<x;m++){let f=d.x+(p.x-d.x)*m/x,S=d.z+(p.z-d.z)*m/x;if(n.city.buildings.some(w=>Math.abs(f-w.x)<w.width/2-.08&&Math.abs(S-w.z)<w.depth/2-.08))return!1}return!0},routePerson:(d,p)=>c(d,p,e,!0),movePerson:(d,p)=>h(d,p,e,!0),routeVehicle:(d,p)=>c(d,p,t,!1),moveVehicle:(d,p)=>h(d,p,t,!1),routePersonToPoint:l,safeParkingNode:o,pedestrianNode:d=>e.nodes.get(d),roadNode:d=>t.nodes.get(d),pedestrianRoute:(d,p)=>ys(e,d,p),vehicleRoute:(d,p)=>ys(t,d,p)}}Xl.exports={positionOf:Fo,createHelpers:Qu,distance:xt,clone:ju}});var Yl=ni((D_,ql)=>{"use strict";function _r(n,e,t,i,s,r={}){return{id:n,name:e,role:t,homeBuildingId:i.id,workBuildingId:i.id,location:{kind:"building",buildingId:i.id},x:s.x,z:s.z,nodeId:s.id,path:[],destinationBuildingId:null,activity:t==="resident"?"atHome":"onDuty",lifeState:"alive",healthState:"healthy",hostile:!1,symptoms:[],observedSymptoms:[],knownThreats:[],fear:0,mobility:1,taskId:null,hp:100,...r}}function ef(n){let{state:e}=n,t=e.city.buildings.filter(u=>u.type==="residential"),i=e.city.buildings.filter(u=>u.type==="office"||u.type==="shop"),s=e.city.pedestrianGraph.nodes.filter(u=>!u.roadNodeId),r=u=>e.city.pedestrianGraph.nodes.find(d=>d.id===u),a=u=>e.city.vehicleGraph.nodes.find(d=>d.id===u),o=e.city.buildings.find(u=>u.type==="hospital"),c=e.city.buildings.find(u=>u.type==="station");o.capacity=e.config.hospitalCapacity,e.facilities={hospital:{buildingId:o.id,capacity:e.config.hospitalCapacity,patientIds:[],staffIds:[]},station:{buildingId:c.id,patrolIds:[]}};for(let u=0;u<e.config.residents;u++){let d=t[u%t.length],p=i[(u*3+Math.floor(n.random()*i.length))%i.length],g=_r(`resident-${String(u+1).padStart(3,"0")}`,`Habitante ${u+1}`,"resident",d,r(d.entranceNodeIds[0]),{workBuildingId:p.id,nextRoutineTick:20+Math.floor(n.random()*700),routineIndex:u%3,routineTrips:0,distanceWalked:0,walkSpeed:.9+n.random()*.4});if(e.people.push(g),u%4===0){let x=s[u*7%s.length];g.location={kind:"street",nodeId:x.id},g.nodeId=x.id,g.x=x.x,g.z=x.z,g.destinationBuildingId=p.id,g.activity="walking",n.routePerson(g,p.entranceNodeIds[0])}}let l=Math.floor(n.random()*e.config.residents),h=e.config.initialPersonId?e.people.find(u=>u.id===e.config.initialPersonId):e.people[l];if(!h||h.role!=="resident")throw new TypeError("Initial person must identify an existing resident.");e.initialPersonId=h.id,e.initialCaseOrigin={personId:h.id,tick:0,position:n.position(h),location:{...h.location},activity:h.activity,path:h.path.slice(),destinationBuildingId:h.destinationBuildingId,nextRoutineTick:h.nextRoutineTick};for(let u=0;u<e.config.ambulances;u++){let d=a(o.vehicleNodeId),p=`ambulance-${u+1}`,g=[];for(let x=0;x<2;x++){let m=`medic-${u*2+x+1}`;g.push(m),e.people.push(_r(m,`Socorrista ${u*2+x+1}`,"medic",o,r(o.entranceNodeIds[0]),{teamId:p,location:{kind:"vehicle",vehicleId:p},x:d.x,z:d.z,nodeId:`foot-${d.id}`,activity:"available"}))}e.vehicles.push({id:p,type:"ambulance",x:d.x,z:d.z,nodeId:d.id,path:[],crewIds:g,passengerIds:[],capacity:1,status:"available",incidentId:null,availableAt:0,broken:!1,homeNodeId:d.id})}for(let u=0;u<e.config.patrols;u++){let d=a(c.vehicleNodeId),p=`police-car-${u+1}`,g=`patrol-${u+1}`,x=[];for(let m=0;m<2;m++){let f=`officer-${u*2+m+1}`;x.push(f),e.people.push(_r(f,`Agente ${u*2+m+1}`,"officer",c,r(c.entranceNodeIds[0]),{teamId:g,ammo:32,cooldownTick:0,location:{kind:"vehicle",vehicleId:p},x:d.x,z:d.z,nodeId:`foot-${d.id}`,activity:"patrolling"}))}e.vehicles.push({id:p,type:"police",x:d.x,z:d.z,nodeId:d.id,path:[],crewIds:x.slice(),passengerIds:[],capacity:2,status:"available",incidentId:null,availableAt:0,broken:!1,homeNodeId:d.id}),e.patrols.push({id:g,vehicleId:p,officerIds:x,status:"available",incidentId:null,routeIndex:u}),e.facilities.station.patrolIds.push(g)}for(let u=0;u<4;u++){let d=_r(`hospital-staff-${u+1}`,`Profissional hospitalar ${u+1}`,"hospitalStaff",o,r(o.entranceNodeIds[0]),{activity:"hospitalDuty"});e.people.push(d),e.facilities.hospital.staffIds.push(d.id)}e.initialPopulation=e.people.length}function tf(n){let e=n.state;for(let t of e.people)if(!(t.role!=="resident"||t.lifeState!=="alive"||t.taskId||t.healthState==="symptomatic"||t.healthState==="critical"||t.location.kind==="vehicle"||t.location.kind==="hospital")){if(t.activity==="walking"){let i=n.position(t),s=n.movePerson(t,t.walkSpeed*t.mobility),r=n.position(t);if(t.distanceWalked+=Math.hypot(r.x-i.x,r.z-i.z),s){let a=e.city.buildings.find(o=>o.id===t.destinationBuildingId);a&&(t.location={kind:"building",buildingId:a.id},t.activity=a.id===t.homeBuildingId?"atHome":"atService",t.nextRoutineTick=e.tick+120+Math.floor(n.random()*600),t.routineTrips++)}}else if(e.tick>=t.nextRoutineTick){let i=e.city.buildings.filter(a=>a.type==="shop"||a.type==="office"),s=t.routineIndex%3===0?t.workBuildingId:t.routineIndex%3===1?i[(t.routineIndex+t.id.length)%i.length].id:t.homeBuildingId,r=e.city.buildings.find(a=>a.id===s);n.routePerson(t,r.entranceNodeIds[0])?(t.destinationBuildingId=s,t.activity="walking",t.routineIndex++):(t.nextRoutineTick=e.tick+50,t.waitReason="Percurso pedonal interrompido.")}}}ql.exports={initializePopulation:ef,updateRoutines:tf}});var Jl=ni((L_,Zl)=>{"use strict";var Oo=Object.freeze({symptomSeconds:20,criticalSeconds:140,deathSeconds:230,reanimateDelaySeconds:6,suddenSeconds:30,exposureDistance:1.4,exposureSeconds:8,incubationSeconds:35,attackRange:1.2,attackDamagePerSecond:8,zombieSpeed:1.15,ambulanceSpeed:7,policeSpeed:7.5,triageSeconds:5,handoverSeconds:6,hospitalStaySeconds:65,callDelaySeconds:2,dispatchDelaySeconds:1}),nf=new Set([...Object.keys(Oo),"suddenReanimateDelaySeconds","sensingDistance","infectiousWhileAlive","policeObserveRange","policeFireRange","policeApproachSpeed","policeRetreatSpeed","policeVehicleSpeed","policeShotIntervalSeconds","policeShotDamage","policeHitChance","policeCivilianClearance","policeBusySeconds"]),$l=Object.freeze(["default","concurrentCalls","hospitalFull","blockedRoute","brokenVehicle","policeBusy"]);function sf(n){if(typeof n!="string")throw new TypeError("Invalid fixture.");let e=n.replace(/[-_ ]/g,"").toLowerCase(),t=$l.find(i=>i.toLowerCase()===e);if(!t)throw new TypeError("Unknown fixture.");return t}function rf(n={}){if(!n||typeof n!="object"||Array.isArray(n))throw new TypeError("Invalid parameters.");let e={...Oo};for(let t of Reflect.ownKeys(n)){let i=n[t];if(!nf.has(t)||!Number.isFinite(i)||i<0||i>1e6||t==="policeHitChance"&&i>1||t==="infectiousWhileAlive"&&![0,1].includes(i)||["ambulanceSpeed","policeVehicleSpeed"].includes(t)&&i===0)throw new TypeError("Unknown or invalid fictional parameter.");e[t]=i}return e}Zl.exports={DEFAULT_PARAMETERS:Oo,FIXTURES:$l,fixtureName:sf,parameters:rf}});var ko=ni((N_,Ql)=>{"use strict";var{distance:af}=xr(),Kl=new Set(["resolved","cancelled"]);function jl(n,e,t,i,s,r){let a=n.state;if(!e||!a.people.some(d=>d===e)||!["medical","violence"].includes(t)||!Number.isFinite(i)||i<1||i>5)return null;let o=a.incidents.find(d=>d.personId===e.id&&d.type===t&&!Kl.has(d.status));if(o){s&&!o.knownFacts.includes(s)&&o.knownFacts.push(s),r&&!o.witnessIds.includes(r)&&o.witnessIds.push(r);let d=o.severity,p=o.priority;return o.severity=Math.max(o.severity,i),(o.manualPriority===void 0||i>d)&&(o.priority=Math.max(o.priority,i)),i>d&&n.emit("IncidentSeverityEscalated","Novos sinais observados aumentaram a gravidade da ocorr\xEAncia.",{entityIds:[o.id,e.id,r].filter(Boolean),incidentId:o.id,visibility:"reported",previousSeverity:d,severity:o.severity,previousPriority:p,priority:o.priority,manualOverrideSuperseded:o.manualPriority!==void 0&&o.priority>p}),o}let c=n.position(e),l=`incident-${++a.incidentSequence}`;o={id:l,type:t,personId:e.id,...c,nodeId:n.nearestPedNode(c),severity:i,observedAt:a.tick,reportedAt:null,reporterId:r,knownFacts:s?[s]:[],confirmedFacts:[],status:"calling",assignedAmbulanceId:null,assignedPatrolId:null,priority:i,waitReason:null,witnessIds:r?[r]:[],requiresPolice:t==="violence",policeStatus:t==="violence"?"waiting":null,eventIds:[]},o.origin={position:{...c},location:{...e.location},activity:e.activity,routineActivity:e.medicalEpisode?.origin.activity||e.activity,episodeId:e.medicalEpisode?.id||null},a.incidents.push(o);let h=n.emit("IncidentObserved","Uma ocorr\xEAncia foi observada por uma pessoa presente.",{entityIds:[e.id,r,l].filter(Boolean),position:c,visibility:"reported",incidentId:l,knownFact:s});o.eventIds.push(h.eventId);let u={id:`call-${++a.callSequence}`,incidentId:l,callerId:r,createdAt:a.tick,receivedAt:null,receiveTick:a.tick+Math.max(1,Math.round(a.config.parameters.callDelaySeconds*10)),status:"calling"};return a.calls.push(u),n.emit("CallCreated","Foi iniciada uma chamada para a central.",{entityIds:[l,u.id,r].filter(Boolean),position:c,visibility:"reported",incidentId:l,callId:u.id}),o}function of(n,e,t){e.waitReason!==t&&(e.waitReason=t,t&&n.emit("ServiceWaiting",t,{entityIds:[e.id],incidentId:e.id,visibility:"reported"}))}function cf(n){let e=n.state,t=e.config.fixture;if(e.normalEpisodes={sequence:0,records:[],nextReviewTick:80+Math.floor(n.random()*120),refractoryUntil:0},t==="brokenVehicle"){let i=e.vehicles.find(s=>s.type==="ambulance");i&&(i.broken=!0,i.status="blocked",i.waitReason="Viatura avariada; indispon\xEDvel para despacho.")}if(t==="blockedRoute"){let i=e.city.buildings.find(s=>s.id===e.facilities.hospital.buildingId);for(let s of e.city.vehicleGraph.edges)(s.from===i.vehicleNodeId||s.to===i.vehicleNodeId)&&(s.blocked=!0)}if(t==="hospitalFull"){let i=e.facilities.hospital.capacity>0?e.people.filter(s=>s.role==="resident"&&s.id!==e.initialPersonId).slice(-e.facilities.hospital.capacity):[];for(let s of i)s.location={kind:"hospital",buildingId:e.facilities.hospital.buildingId},s.taskId="existing-hospital-care",s.activity="hospitalized",s.path=[],s.medicalDischargeTick=1e6,e.facilities.hospital.patientIds.push(s.id)}}function vr(n,e,t,i="controlled-case"){if(!e||e.lifeState!=="alive"||e.taskId||e.location.kind==="hospital"||e.location.kind==="vehicle")return;let s=n.state,r={position:n.position(e),location:{...e.location},activity:e.activity,path:e.path.slice(),destinationBuildingId:e.destinationBuildingId,distanceWalked:e.distanceWalked,routineTrips:e.routineTrips},a={id:`normal-episode-${++s.normalEpisodes.sequence}`,personId:e.id,onsetTick:s.tick,condition:i,origin:r};s.normalEpisodes.records.push(a),e.medicalEpisode=a,e.normalNoticeTick=s.tick+(s.config.fixture==="default"?20+Math.floor(n.random()*50):0),e.lastNormalEpisodeTick=s.tick,e.medicalCondition="injury",e.medicalSeverity=t,e.healthState==="healthy"&&(e.healthState="symptomatic"),e.symptoms.includes("pain")||e.symptoms.push("pain"),e.activity="awaitingHelp",n.emit("MedicalConditionBegan","Uma pessoa apresenta dor e necessita de avalia\xE7\xE3o.",{entityIds:[e.id],position:n.position(e),visibility:"truth",episodeId:a.id,condition:i,origin:r})}function lf(n){let e=n.state,t=e.normalEpisodes;if(e.scenario!=="S0"||e.config.fixture!=="default"||e.tick<t.nextReviewTick||(t.nextReviewTick=e.tick+30+Math.floor(n.random()*70),e.tick<t.refractoryUntil||e.incidents.filter(h=>h.type==="medical"&&!Kl.has(h.status)).length>=2))return;let i=e.people.filter(h=>h.role==="resident"&&h.lifeState==="alive"&&h.healthState==="healthy"&&!h.taskId&&!["vehicle","hospital"].includes(h.location.kind)&&e.tick-(h.lastNormalEpisodeTick??-1e4)>=1800&&(h.activity==="walking"&&h.distanceWalked>=3||["atHome","atService"].includes(h.activity)&&h.routineTrips>0));if(!i.length)return;let s=i.map(h=>(h.activity==="walking"?1.5:1)+Math.min(.75,h.distanceWalked/150)),r=s.reduce((h,u)=>h+u,0);if(n.random()>=.13)return;let a=n.random()*r,o=0;for(;o<s.length-1&&a>=s[o];)a-=s[o++];let c=i[o],l=c.activity==="walking"?"discomfort-after-walking":"discomfort-during-service-or-rest";vr(n,c,n.random()<.2?3:2,l),t.refractoryUntil=e.tick+300+Math.floor(n.random()*500)}function df(n){let e=n.state;for(let t of e.people){if(t.lifeState==="neutralized"||t.lifeState==="dead")continue;let i=t.symptoms||[],s=t.hostile&&t.lifeState==="reanimated";if(!i.length&&!s||t.normalNoticeTick&&e.tick<t.normalNoticeTick&&!s||!s&&(t.location.kind==="hospital"||t.taskId==="hospital-care"))continue;let r=null;if(t.lifeState==="alive"&&!i.includes("collapse")&&i.length)r=t;else{let l=n.position(t);r=e.people.find(h=>h.id!==t.id&&h.lifeState==="alive"&&h.healthState!=="critical"&&h.location.kind!=="vehicle"&&(h.location.kind===t.location.kind&&h.location.buildingId&&h.location.buildingId===t.location.buildingId||h.location.kind==="street"&&t.location.kind==="street"&&af(n.position(h),l)<12&&n.lineOfSight(n.position(h),l)))}if(!r)continue;let o=s?["aggressive"]:i;for(let l of o)t.observedSymptoms.includes(l)||t.observedSymptoms.push(l);let c=s||i.includes("collapse")?5:t.medicalSeverity||3;jl(n,t,s?"violence":"medical",c,s?"Comportamento agressivo observado":i.includes("collapse")?"Perda de consci\xEAncia observada":i.includes("fever")?"Febre comunicada":"Dor comunicada",r.id)}}function hf(n){let e=n.state;if(e.tick===200&&e.config.fixture!=="default"&&(e.scenario==="S0"&&vr(n,e.people.find(t=>t.id===e.initialPersonId),2),e.config.fixture==="concurrentCalls")){vr(n,e.people.find(i=>i.id===e.initialPersonId),2);let t=e.people.find(i=>i.role==="resident"&&i.id!==e.initialPersonId&&i.location.kind==="street");vr(n,t,5)}lf(n),e.tick%5===0&&df(n);for(let t of e.calls){let i=e.incidents.find(s=>s.id===t.incidentId);t.status==="calling"&&e.tick>=t.receiveTick&&(t.status="received",t.receivedAt=e.tick,i.status="received",i.reportedAt=e.tick,i.triageTick=e.tick+Math.max(1,Math.round(e.config.parameters.dispatchDelaySeconds*10)),n.emit("CallReceived","A central recebeu a chamada.",{entityIds:[t.id,i.id],incidentId:i.id,visibility:"reported"})),t.status==="received"&&e.tick>=i.triageTick&&(t.status="triaged",i.status="waiting",n.emit("Triaged","A central classificou a prioridade e os meios necess\xE1rios.",{entityIds:[i.id],incidentId:i.id,priority:i.priority,visibility:"reported"}))}}Ql.exports={initializeIncidents:cf,updateIncidents:hf,reportIncident:jl,setWait:of}});var cd=ni((U_,od)=>{"use strict";var{distance:Mi}=xr(),{setWait:it}=ko(),Li=(n,e)=>n.people.find(t=>t.id===e),Bo=(n,e,t)=>Math.max(1,Math.round((n.config.parameters[e]??t)*10)),Ct=(n,e)=>e.crewIds.map(t=>Li(n,t)).filter(Boolean),yr=n=>n.city.buildings.find(e=>e.id===n.facilities.hospital.buildingId),Ms=n=>["resolved","cancelled"].includes(n.status);function sd(n,e){return n.incidents.find(t=>t.type==="medical"&&t.personId===e.id&&!Ms(t)&&t.assignedAmbulanceId)}function Mr(n,e,t){return t.lifeState==="alive"&&t.healthState!=="critical"&&t.location.kind!=="hospital"&&!(t.location.kind==="vehicle"&&t.location.vehicleId!==e.id)&&!n.vehicles.some(i=>i.passengerIds.includes(t.id))&&!sd(n,t)&&(!t.taskId||t.taskId===e.incidentId)}function rd(n,e){let t=n.roadNode(e.nodeId);return t&&!e.path.length&&Mi(e,t)<1e-7}function Ki(n,e){let t=Li(n.state,e.hospitalStaffId);t?.taskId===`handover:${e.id}`&&(t.taskId=null,t.lifeState==="alive"&&t.healthState!=="critical"&&(t.activity="hospitalDuty")),e.hospitalStaffId=null}function ed(n,e){return e&&e.lifeState==="alive"&&e.healthState!=="critical"&&["building","hospital"].includes(e.location.kind)&&e.location.buildingId===n.state.facilities.hospital.buildingId&&(!e.taskId||e.taskId.startsWith("handover:"))}function Rt(n,e,t,i,s,r={}){n.emit(e,t,{entityIds:[i?.id,s?.id,s?.personId].filter(Boolean),position:i?{x:i.x,z:i.z}:void 0,visibility:"confirmed",vehicleId:i?.id,incidentId:s?.id,...r})}function Hn(n,e,t){let i=n.pedestrianNode(`foot-${t.nodeId}`);return!i||!rd(n,t)||e.location.kind!=="vehicle"||e.location.vehicleId!==t.id||!t.crewIds.includes(e.id)&&!t.passengerIds.includes(e.id)?!1:(t.passengerIds=t.passengerIds.filter(s=>s!==e.id),e.location={kind:"street",nodeId:i.id},e.nodeId=i.id,e.x=i.x,e.z=i.z,e.path=[],!0)}function Ho(n,e,t,i=!1){let s=n.state;if(!rd(n,t)||e.location.kind!=="street"||Mi(n.position(e),t)>.25||s.vehicles.some(r=>r.passengerIds.includes(e.id)))return!1;if(i){let r=sd(s,e);return e.lifeState==="alive"&&!t.crewIds.includes(e.id)&&r?.id===t.incidentId&&r.assignedAmbulanceId===t.id&&e.taskId===r.id}return t.crewIds.includes(e.id)&&Mr(s,t,e)}function Go(n,e,t,i=!1){return Ho(n,e,t,i)?(i&&!t.passengerIds.includes(e.id)&&t.passengerIds.push(e.id),e.location={kind:"vehicle",vehicleId:t.id},e.x=t.x,e.z=t.z,e.nodeId=`foot-${t.nodeId}`,e.path=[],!0):!1}function br(n,e){if(e.location.kind==="building"||e.location.kind==="hospital"){let t=n.state.city.buildings.find(i=>i.id===e.location.buildingId);return n.pedestrianNode(t.entranceNodeIds[0])}return{...n.position(e),nodeId:e.nodeId,travelEdge:e.travelEdge}}function zo(n,e,t){let i=br(n,t);return t.location.kind==="street"&&n.routePersonToPoint?n.routePersonToPoint(e,t):n.routePerson(e,i.id||i.nodeId)}function td(n,e,t){let i=br(n,t),s=n.position(e);return Mi(s,i)<=1.25&&n.lineOfSight(s,i)}function bs(n,e,t,i){let s=n.pedestrianNode(t);if(!s)return!1;if(e.location.kind==="street"&&Mi(n.position(e),s)<1e-7)return e.nodeId=t,e.location={kind:"street",nodeId:t},e.travelEdge=null,e.path=[],e.finalApproach=null,e.destinationPoint=null,e.destinationNodeId=t,e.medicalRouteBlocked=!1,!0;if(e.destinationNodeId!==t||!e.path.length&&!e.finalApproach){if(e.medicalRouteTarget!==t&&(e.medicalRouteTarget=t,e.nextMedicalNodeAttemptTick=0),n.state.tick<(e.nextMedicalNodeAttemptTick||0))return!1;if(e.nextMedicalNodeAttemptTick=n.state.tick+10,!n.routePerson(e,t))return e.medicalRouteBlocked=!0,!1}return e.medicalRouteBlocked=!1,n.movePerson(e,i)&&e.location.kind==="street"&&Mi(n.position(e),s)<1e-7}function id(n,e,t){return e.nextRouteAttemptTick=n.state.tick+10,n.routeVehicle(e,yr(n.state).vehicleNodeId)?(e.status="transporting",t.status="transporting",e.waitReason=null,it(n,t,null),!0):(e.status="transportRouteWaiting",e.currentSpeed=0,t.status="transporting",e.waitReason="Percurso vi\xE1rio para o hospital temporariamente indispon\xEDvel; doente mant\xE9m-se a bordo e a central tenta nova rota.",it(n,t,e.waitReason),!1)}function ad(n,e,t){if(e.nextRouteAttemptTick=n.state.tick+10,!n.routeVehicle(e,e.homeNodeId)){let i="Regresso temporariamente impedido; a tripula\xE7\xE3o aguarda e tenta nova rota.",s=e.status!=="returnRouteWaiting"||e.waitReason!==i;return e.status="returnRouteWaiting",e.currentSpeed=0,e.waitReason=i,t&&!Ms(t)&&it(n,t,i),s&&Rt(n,"AmbulanceReturnWaiting",i,e,t),!1}return e.status="returning",e.waitReason=null,t&&!Ms(t)&&it(n,t,null),Rt(n,"AmbulanceReturning","A tripula\xE7\xE3o regressa \xE0 base por estrada.",e,t),!0}function uf(n,e,t){let i=n.state,s=n.position(e);return i.people.find(r=>r.lifeState==="reanimated"&&r.hostile&&(r.location.kind==="vehicle"&&r.location.vehicleId===t.id||r.location.kind==="street"&&Mi(n.position(r),s)<7&&Ct(i,t).some(a=>Wo(n,a,r))))}function Wo(n,e,t){return e.lifeState!=="alive"?!1:e.location.kind==="vehicle"&&t.location.kind==="vehicle"?e.location.vehicleId===t.location.vehicleId:e.location.buildingId&&e.location.buildingId===t.location.buildingId?!0:t.location.kind==="street"&&Mi(n.position(e),n.position(t))<12&&n.lineOfSight(n.position(e),n.position(t))}function ff(n){let e=n.state,t=e.incidents.filter(i=>i.type==="medical"&&i.status==="waiting"&&!i.assignedAmbulanceId).sort((i,s)=>s.priority-i.priority||i.reportedAt-s.reportedAt||i.id.localeCompare(s.id));for(let i of t){let s=Li(e,i.personId);if(!s||s.lifeState!=="alive"||s.location.kind==="hospital"){i.status="cancelled",i.waitReason="A avalia\xE7\xE3o deixou de necessitar de uma ambul\xE2ncia dispon\xEDvel.";continue}let a=(["building","hospital"].includes(s.location.kind)?e.city.buildings.find(l=>l.id===s.location.buildingId):null)?.vehicleNodeId||n.nearestRoadNode(n.position(s)),o=e.vehicles.filter(l=>l.type==="ambulance"&&l.status==="available"&&!l.broken&&l.availableAt<=e.tick&&!l.crewIds.includes(s.id)&&Ct(e,l).every(h=>Mr(e,l,h)&&!h.taskId&&h.location.kind==="vehicle"&&h.location.vehicleId===l.id));o.sort((l,h)=>Mi(l,n.position(s))-Mi(h,n.position(s))||l.id.localeCompare(h.id));let c=null;for(let l of o)if(n.routeVehicle(l,a)){c=l;break}if(!c){let l=o.length?"Percurso vi\xE1rio interrompido; a central aguarda uma rota poss\xEDvel.":e.vehicles.some(h=>h.type==="ambulance"&&h.broken)?"Sem ambul\xE2ncia livre; existe uma viatura avariada.":e.vehicles.some(h=>h.type==="ambulance"&&h.status==="blocked")?"Sem tripula\xE7\xE3o operacional ou acesso seguro; ambul\xE2ncia indispon\xEDvel.":"Todas as ambul\xE2ncias est\xE3o ocupadas; ocorr\xEAncia em espera por prioridade.";it(n,i,l);continue}c.status="dispatched",c.incidentId=i.id,c.destinationPersonId=s.id,c.speed=e.config.parameters.ambulanceSpeed,i.status="assigned",i.assignedAmbulanceId=c.id,s.taskId=i.id,s.activity="awaitingAmbulance",it(n,i,null),c.phaseTick=e.tick,Rt(n,"AmbulanceDispatched","Uma ambul\xE2ncia com tripula\xE7\xE3o foi atribu\xEDda \xE0 ocorr\xEAncia.",c,i,{crewIds:c.crewIds.slice()})}}function pf(n,e,t){let i=n.state,s=`foot-${e.nodeId}`,r=!0;for(let a of Ct(i,e)){if(!Mr(i,e,a)){e.status="blocked",e.waitReason="Tripula\xE7\xE3o indispon\xEDvel ou sob assist\xEAncia; a viatura n\xE3o pode recuperar pessoas de outro servi\xE7o.",t&&!Ms(t)&&it(n,t,e.waitReason);return}a.location.kind==="vehicle"&&a.location.vehicleId===e.id||(r=!1,bs(n,a,s,1.2)&&Go(n,a,e)&&(a.activity="available",a.taskId=null))}r&&ad(n,e,t)}function mf(n,e,t){let i=n.state;t&&(t.completedAmbulanceId=e.id,t.assignedAmbulanceId=null),e.status="available",e.incidentId=null,e.destinationPersonId=null,e.path=[],e.availableAt=i.tick+30,Rt(n,"AmbulanceAvailable","Ambul\xE2ncia libertada ap\xF3s entrega e prepara\xE7\xE3o.",e,t)}function Vo(n,e,t,i,s){let r=n.state;if(Ki(n,e),t.requiresPolice=!0,t.status="awaitingPolice",e.status="awaitingPolice",it(n,t,"Cena insegura; a equipa m\xE9dica aguarda prote\xE7\xE3o policial."),s){let a=Ct(r,e).find(o=>Wo(n,o,s));a&&n.report(s,"violence",5,"Comportamento agressivo identificado pela equipa m\xE9dica",a.id)}Rt(n,"MedicalSupportRequested","A equipa m\xE9dica pede apoio e mant\xE9m dist\xE2ncia.",e,t,{personId:i.id})}function nd(n,e,t,i){if(e.path.length){let s=e.path[0];if(e.path=[s],e.destinationNodeId=s,!n.moveVehicle(e,e.speed||n.state.config.parameters.ambulanceSpeed))return!1}for(let s of[...e.passengerIds]){let r=Li(n.state,s);r&&Hn(n,r,e)}for(let s of Ct(n.state,e))s.location.kind==="vehicle"&&s.location.vehicleId===e.id&&Hn(n,s,e);return!0}function gf(n,e){let t=n.state,i=t.incidents.find(o=>o.id===e.incidentId),s=i&&Li(t,i.personId);if(e.broken){Ki(n,e),e.status="blocked",i&&it(n,i,"Ambul\xE2ncia avariada; doente e tripula\xE7\xE3o permanecem na sua localiza\xE7\xE3o.");return}let r=Ct(t,e).find(o=>!Mr(t,e,o));if(r&&!["crewEmergencyStop","blocked"].includes(e.status)&&(e.status="crewEmergencyStop"),e.status==="crewEmergencyStop"){if(Ki(n,e),!nd(n,e,i,s))return;if(e.status="blocked",e.waitReason="Tripula\xE7\xE3o incapacitada ou sob assist\xEAncia; viatura parada e ocorr\xEAncia reencaminhada.",i&&(i.assignedAmbulanceId=null,Ms(i)||(i.status=s?.lifeState==="alive"&&s.location.kind!=="hospital"?"waiting":"cancelled",it(n,i,e.waitReason)),e.incidentId=null),r){let o=Ct(t,e).find(c=>c.id!==r.id&&Wo(n,c,r));o&&r.lifeState==="reanimated"?n.report(r,"violence",5,"Agress\xE3o observada na tripula\xE7\xE3o",o.id):o&&r.lifeState==="alive"&&n.report(r,"medical",5,"Colapso observado na tripula\xE7\xE3o",o.id)}Rt(n,"MedicalResourceUnavailable","A viatura parou num n\xF3 vi\xE1rio; pessoas desembarcaram e a central reavalia os meios.",e,i);return}if(e.status==="available"||e.status==="blocked")return;if(!i||!s){e.status="blocked",e.waitReason="Refer\xEAncia de ocorr\xEAncia indispon\xEDvel.";return}let a=uf(n,s,e);if(a&&["transporting","transportRouteWaiting","handover"].includes(e.status)&&e.passengerIds.includes(a.id)&&(e.status="emergencyStop",i.status="awaitingPolice",e.emergencyThreatId=a.id),e.status==="emergencyStop"){nd(n,e,i,s)&&Vo(n,e,i,s,Li(t,e.emergencyThreatId));return}if(e.status==="dispatched"){t.tick>e.phaseTick&&(e.status="enRoute",i.status="enRoute",Rt(n,"AmbulanceEnRoute","Ambul\xE2ncia em percurso vi\xE1rio.",e,i));return}if(e.status==="transportRouteWaiting"){t.tick>=(e.nextRouteAttemptTick||0)&&id(n,e,i);return}if(e.status==="returnRouteWaiting"){t.tick>=(e.nextRouteAttemptTick||0)&&ad(n,e,i);return}if(e.status==="enRoute"){if(n.moveVehicle(e,e.speed)){e.status="onScene",i.status="onScene",e.phaseTick=t.tick,e.medicalPhase="approach";for(let o of Ct(t,e))Hn(n,o,e),o.taskId=i.id,o.activity="approachingPatient",zo(n,o,s);Rt(n,"AmbulanceOnScene","Ambul\xE2ncia estacionou; os socorristas aproximam-se a p\xE9.",e,i)}else e.routeBlocked&&it(n,i,"Percurso interrompido; a ambul\xE2ncia n\xE3o pode atravessar o obst\xE1culo.");return}if(e.status==="awaitingPolice"){if(a)return;if(s.lifeState!=="alive"){i.status="resolved",i.resolution="Avalia\xE7\xE3o encerrada ap\xF3s neutraliza\xE7\xE3o ou \xF3bito confirmado.",e.status="collectingCrew",it(n,i,null);return}i.requiresPolice=!1,i.status="onScene",e.status="onScene",e.medicalPhase="approach";for(let o of Ct(t,e))o.lifeState==="alive"&&(o.location.kind==="vehicle"&&Hn(n,o,e),zo(n,o,s));it(n,i,null);return}if(e.status==="onScene"){if(a){Vo(n,e,i,s,a);return}if(s.lifeState!=="alive"){i.status="resolved",i.resolution="\xD3bito observado pela equipa m\xE9dica.",e.status="collectingCrew",Rt(n,"MedicalAssessmentClosed","A equipa confirmou que n\xE3o existe doente vivo para transporte.",e,i);return}if(e.medicalPhase==="approach"){let o=Ct(t,e).filter(l=>l.lifeState==="alive"),c=0;for(let l of o){if(!l.path.length&&!l.finalApproach&&!td(n,l,s)&&t.tick>=(l.nextMedicalApproachTick||0)){let u=zo(n,l,s);l.nextMedicalApproachTick=t.tick+10,u?it(n,i,null):it(n,i,"Acesso pedonal de aproxima\xE7\xE3o temporariamente impedido; a equipa tenta nova rota.")}(n.movePerson(l,1.25)||!l.path.length&&!l.finalApproach)&&td(n,l,s)&&c++}if(!o.length){e.status="blocked",it(n,i,"Tripula\xE7\xE3o m\xE9dica incapacitada; apoio necess\xE1rio.");return}if(c===o.length){it(n,i,null),e.medicalPhase="assess",e.phaseTick=t.tick,i.status="assessed";let l=(s.symptoms||[]).slice();for(let h of l)s.observedSymptoms.includes(h)||s.observedSymptoms.push(h);for(let h of l)i.confirmedFacts.includes(h)||i.confirmedFacts.push(h);Rt(n,"PatientAssessed","A equipa avaliou sinais observ\xE1veis; a causa permanece por esclarecer.",e,i,{confirmedFacts:l,patientPosition:br(n,s),assessmentDistances:o.map(h=>({personId:h.id,distance:Mi(n.position(h),br(n,s))}))})}return}if(e.medicalPhase==="assess"){if(t.tick-e.phaseTick<Bo(t,"triageSeconds",5))return;let o=`foot-${e.nodeId}`;if(!n.routePerson(s,o)){it(n,i,"Acesso pedonal de recolha interrompido.");return}for(let c of Ct(t,e))c.lifeState==="alive"&&n.routePerson(c,o);e.medicalPhase="loading",s.activity="assistedToAmbulance",Rt(n,"PatientMovingToAmbulance","Doente e tripula\xE7\xE3o percorrem fisicamente o acesso at\xE9 \xE0 ambul\xE2ncia.",e,i);return}if(e.medicalPhase==="loading"){let o=`foot-${e.nodeId}`,c=bs(n,s,o,s.healthState==="critical"?.65:.9),l=!0;for(let h of Ct(t,e))h.lifeState==="alive"&&!bs(n,h,o,1.1)&&(l=!1);if((s.medicalRouteBlocked||Ct(t,e).some(h=>h.medicalRouteBlocked))&&it(n,i,"Acesso pedonal de embarque temporariamente impedido; a equipa tenta nova rota."),c&&l){if(e.passengerIds.length>=e.capacity){it(n,i,"Capacidade de transporte ocupada.");return}let h=Ct(t,e);if(!Ho(n,s,e,!0)||!h.every(u=>Ho(n,u,e))){it(n,i,"Embarque aguarda presen\xE7a f\xEDsica e disponibilidade exclusiva do doente e da tripula\xE7\xE3o.");return}Go(n,s,e,!0),s.activity="inAmbulance";for(let u of h)Go(n,u,e),u.activity="transporting";Rt(n,"PatientBoarded","Doente embarcou uma \xFAnica vez; a identidade mant\xE9m-se no ve\xEDculo.",e,i,{personId:s.id}),id(n,e,i)}return}}if(e.status==="transporting"){if(n.moveVehicle(e,e.speed)){e.status="handover",i.status="handover",e.medicalPhase="hospitalApproach";let o=yr(t);Hn(n,s,e),n.routePerson(s,o.entranceNodeIds[0]);for(let c of Ct(t,e))c.lifeState==="alive"&&(Hn(n,c,e),n.routePerson(c,o.entranceNodeIds[0]));Rt(n,"HospitalArrival","Ambul\xE2ncia chegou; entrega exige acesso pedonal e vaga hospitalar.",e,i)}else e.routeBlocked&&(e.status="transportRouteWaiting",e.currentSpeed=0,e.nextRouteAttemptTick=t.tick+10,e.waitReason="Percurso para o hospital interrompido; doente permanece a bordo enquanto a rota \xE9 reavaliada.",it(n,i,e.waitReason));return}if(e.status==="handover"){if(a){Vo(n,e,i,s,a);return}if(s.lifeState!=="alive"){Ki(n,e),i.status="resolved",e.status="collectingCrew";return}if(e.medicalPhase==="hospitalApproach"){let l=yr(t).entranceNodeIds[0],h=bs(n,s,l,s.healthState==="critical"?.65:.9),u=!0;for(let d of Ct(t,e))d.lifeState==="alive"&&!bs(n,d,l,1.15)&&(u=!1);(s.medicalRouteBlocked||Ct(t,e).some(d=>d.medicalRouteBlocked))&&it(n,i,"Acesso pedonal ao hospital temporariamente impedido; ningu\xE9m foi admitido e a equipa tenta nova rota."),h&&u&&(it(n,i,null),e.medicalPhase="waitingBed",e.phaseTick=t.tick);return}if(t.facilities.hospital.patientIds.length>=t.facilities.hospital.capacity){Ki(n,e),e.medicalPhase="waitingBed",it(n,i,"Hospital lotado; doente e equipa aguardam uma vaga na entrada.");return}let o=Li(t,e.hospitalStaffId);if(!ed(n,o)){if(Ki(n,e),o=t.facilities.hospital.staffIds.map(l=>Li(t,l)).find(l=>ed(n,l)&&!l.taskId),!o){e.medicalPhase="waitingBed",it(n,i,"Sem profissional hospitalar apto e dispon\xEDvel; entrega em espera apesar da vaga.");return}e.hospitalStaffId=o.id,o.taskId=`handover:${e.id}`,o.activity="triaging",e.medicalPhase="hospitalAssessment",e.phaseTick=t.tick,Rt(n,"HospitalAssessmentStarted","Um profissional hospitalar existente iniciou a entrega cl\xEDnica.",e,i,{staffId:o.id})}if(it(n,i,null),t.tick-e.phaseTick<Bo(t,"handoverSeconds",6))return;let c=yr(t);s.location={kind:"hospital",buildingId:c.id},s.path=[],s.activity="hospitalized",s.taskId="hospital-care",s.medicalDischargeTick=t.tick+Bo(t,"hospitalStaySeconds",65),t.facilities.hospital.patientIds.includes(s.id)||t.facilities.hospital.patientIds.push(s.id),i.status="resolved",i.resolution="Doente entregue ao hospital.",i.resolvedAt=t.tick,e.status="collectingCrew",Rt(n,"PatientAdmitted","Doente entregue; uma vaga hospitalar ficou ocupada.",e,i,{personId:s.id,hospitalBuildingId:c.id,staffId:o.id}),Ki(n,e);return}if(e.status==="collectingCrew"){pf(n,e,i);return}e.status==="returning"&&(n.moveVehicle(e,e.speed)?mf(n,e,i):e.routeBlocked&&(e.status="returnRouteWaiting",e.currentSpeed=0,e.nextRouteAttemptTick=t.tick+10,e.waitReason="Regresso temporariamente interrompido; aguarda nova rota.",Rt(n,"AmbulanceReturnWaiting",e.waitReason,e,i)))}function xf(n){let e=n.state;for(let t of[...e.facilities.hospital.patientIds]){let i=Li(e,t);!i||i.lifeState!=="alive"||i.hasPathogen||e.tick<(i.medicalDischargeTick||1e6)||n.leaveFacility(i)&&(i.medicalCondition=null,i.symptoms=[],i.healthState="healthy",i.activity="resting",i.nextRoutineTick=e.tick+50,i.taskId=null,n.emit("PatientDischarged","Uma pessoa recebeu alta e regressa \xE0s suas rotinas pelo acesso pedonal.",{entityIds:[i.id],position:n.position(i),visibility:"confirmed"}))}}function _f(n){for(let e of n.state.vehicles)e.type==="ambulance"&&e.status!=="handover"&&e.hospitalStaffId&&Ki(n,e);xf(n),ff(n);for(let e of n.state.vehicles)e.type==="ambulance"&&gf(n,e)}od.exports={updateMedical:_f}});var Yo=ni((F_,hd)=>{"use strict";var ld=Object.freeze({symptomSeconds:20,criticalSeconds:140,deathSeconds:230,reanimateDelaySeconds:6,suddenSeconds:30,suddenReanimateDelaySeconds:2,exposureDistance:1.4,exposureSeconds:8,incubationSeconds:35,attackRange:1.2,attackDamagePerSecond:8,zombieSpeed:1.15,sensingDistance:16,infectiousWhileAlive:1}),Ss=(n,e)=>Math.hypot(n.x-e.x,n.z-e.z),_n=n=>Object.fromEntries(Object.entries(ld).map(([e,t])=>{let i=n.config?.parameters?.[e];return[e,Number.isFinite(i)&&i>=0?i:t]})),Ni=(n,e)=>Math.max(1,Math.ceil(e/n.dt)),vf=(...n)=>n.filter(Boolean).map(e=>e.id);function Ui(n,e,t,i,s={}){return n.emit(e,t,{entityIds:vf(i),position:n.position(i),visibility:"truth",...s})}function yf(n){let{state:e}=n,t=_n(e);for(let s of e.people)Number.isFinite(s.hp)||(s.hp=100),s.symptoms??=[],s.exposureSeconds??=0,s.exposureTicks??=0,s.exposedBy??=[];let i=e.people.find(s=>s.id===e.initialPersonId&&s.role==="resident");e.outbreak={patientId:i?.id??null,mode:e.scenario,started:!1,parameters:t},!(!i||e.scenario==="S0")&&e.scenario==="S1"&&(dd(n,i,null,!0),e.outbreak.started=!0)}function dd(n,e,t,i=!1){if(e.lifeState!=="alive"||e.hasPathogen)return!1;let s=_n(n.state),r=n.state.tick,a=i?s.symptomSeconds:s.incubationSeconds,o=Math.max(a+n.dt,s.criticalSeconds),c=Math.max(o+n.dt,s.deathSeconds);return e.hasPathogen=!0,e.healthState="infected",e.infectedAt=r,e.symptomTick=r+Ni(n,a),e.criticalTick=r+Ni(n,o),e.scheduledDeathTick=r+Ni(n,c),Ui(n,"PersonInfected","Uma pessoa existente foi infetada; a condi\xE7\xE3o ainda n\xE3o \xE9 conhecida pelos servi\xE7os.",e,{sourceId:t?.id??null,sourceLifeState:t?.lifeState??null,exposureSeconds:e.exposureSeconds,initial:i}),!0}function Xo(n,e,t,i=null,s){if(e.lifeState!=="alive")return!1;let r=_n(n.state);return e.lifeState="dead",e.healthState="deceased",e.hostile=!1,e.hp=0,e.deathTick=n.state.tick,e.activity="deceased",e.path=[],e.targetPersonId=null,e.willReanimate=n.state.scenario!=="S0"&&(e.hasPathogen||!!i||t==="sudden"),e.willReanimate&&(e.reanimateTick=n.state.tick+Ni(n,s??r.reanimateDelaySeconds)),Ui(n,"HumanDied","\xD3bito humano registado; a identidade e a localiza\xE7\xE3o s\xE3o preservadas.",e,{cause:t,attackerId:i?.id??null,reanimateTick:e.reanimateTick??null}),!0}function bf(n,e){return e.lifeState!=="dead"||!e.willReanimate?!1:(e.lifeState="reanimated",e.reanimatedAt=n.state.tick,e.hostile=!0,e.hp=55,e.mobility=1,e.activity="searching",e.path=[],Ui(n,"PersonReanimated","A mesma pessoa morta reanimou; n\xE3o foi criada uma nova identidade.",e,{originalPersonId:e.id,deathTick:e.deathTick}),!0)}function Mf(n,e,t){return!e||e.lifeState!=="reanimated"||!e.hostile?!1:(e.lifeState="neutralized",e.hostile=!1,e.hp=0,e.neutralizedAt=n.state.tick,e.activity="neutralized",e.path=[],e.targetPersonId=null,Ui(n,"ThreatNeutralized","A amea\xE7a foi neutralizada; n\xE3o se acrescenta um segundo \xF3bito humano.",e,{shooterId:t,originalPersonId:e.id,deathTick:e.deathTick}),!0)}function Sf(n,e){let t=n.location,i=e.location;return!t||!i||t.kind==="street"||i.kind==="street"?!1:t.kind==="vehicle"||i.kind==="vehicle"?t.kind===i.kind&&t.vehicleId===i.vehicleId:t.buildingId&&t.buildingId===i.buildingId}function qo(n,e,t,i){let s=n.position(e),r=n.position(t);return Ss(s,r)>i?!1:Sf(e,t)?!0:e.location.kind!=="street"||t.location.kind!=="street"?!1:n.lineOfSight(s,r)}function wf(n){let e=n.state,t=_n(e),i=e.people.find(s=>s.id===e.initialPersonId);e.scenario==="S2"&&i&&!e.outbreak.started&&e.tick>=Ni(n,t.suddenSeconds)&&(e.outbreak.started=!0,i.lifeState==="alive"&&(i.hasPathogen=!0,Xo(n,i,"sudden",null,t.suddenReanimateDelaySeconds)));for(let s of e.people)if(s.lifeState==="dead"&&s.willReanimate&&e.tick>=s.reanimateTick&&bf(n,s),!(s.lifeState!=="alive"||!s.hasPathogen)){if(e.tick>=s.scheduledDeathTick){Xo(n,s,"illness");continue}e.tick>=s.criticalTick&&s.healthState!=="critical"?(s.healthState="critical",s.symptoms=["fever","collapse"],s.mobility=0,s.path=[],s.activity="collapsed",Ui(n,"CriticalCondition","A pessoa perdeu a capacidade de se deslocar e necessita de assist\xEAncia.",s)):e.tick>=s.symptomTick&&s.healthState==="infected"&&(s.healthState="symptomatic",s.symptoms=["fever"],Ui(n,"SymptomsDeveloped","Surgiram sintomas vis\xEDveis numa pessoa existente.",s))}}function Tf(n,e){let t=n.state,i=_n(t);for(let s of t.people){if(s.lifeState!=="alive"||s.hasPathogen)continue;let r=e.find(a=>qo(n,s,a,i.exposureDistance));r&&(s.exposureTicks++,s.exposureSeconds=s.exposureTicks*n.dt,s.exposedBy.includes(r.id)||s.exposedBy.push(r.id),s.exposureTicks===1&&(s.healthState==="healthy"&&(s.healthState="exposed"),s.exposedAt=t.tick,Ui(n,"PersonExposed","Iniciou-se uma exposi\xE7\xE3o f\xEDsica por proximidade; um contacto n\xE3o \xE9 infe\xE7\xE3o instant\xE2nea.",s,{sourceId:r.id,sourceLifeState:r.lifeState,distance:Ss(n.position(s),n.position(r))})),s.exposureTicks>=Ni(n,i.exposureSeconds)&&dd(n,s,r))}}function Ef(n,e){let t=n.state,i=_n(t);for(let s of e){if(s.lifeState!=="reanimated")continue;["building","hospital"].includes(s.location.kind)&&t.tick>=s.reanimatedAt+Ni(n,1)&&n.leaveFacility&&(n.leaveFacility(s),Ui(n,"PersonLeftFacility","A pessoa reanimada saiu pela entrada f\xEDsica do edif\xEDcio; a ocupa\xE7\xE3o foi reconciliada.",s));let r=t.people.filter(l=>l.lifeState==="alive"&&qo(n,s,l,i.sensingDistance));r.sort((l,h)=>Ss(n.position(s),n.position(l))-Ss(n.position(s),n.position(h))||l.id.localeCompare(h.id));let a=r[0];if(!a){s.targetPersonId=null,s.activity="searching";continue}let o=n.position(s),c=n.position(a);if(s.targetPersonId=a.id,Ss(o,c)>i.attackRange&&s.location.kind==="street"&&((t.tick>=(s.nextChaseTick??0)||!s.path.length)&&(n.routePerson(s,n.nearestPedNode(c)),s.nextChaseTick=t.tick+Ni(n,1)),s.activity="chasing",n.movePerson(s,i.zombieSpeed)),qo(n,s,a,i.attackRange)){if(s.activity="attacking",t.tick>=(s.nextAttackTick??0)){let l=i.attackDamagePerSecond;a.hp=Math.max(0,a.hp-l),a.fear=Math.min(1,(a.fear??0)+.1),Ui(n,"PersonAttacked","Uma agress\xE3o f\xEDsica ocorreu entre duas identidades existentes.",s,{entityIds:[s.id,a.id],attackerId:s.id,victimId:a.id,damage:l,targetPosition:n.position(a)}),s.nextAttackTick=t.tick+Ni(n,1)}a.hp<=0&&Xo(n,a,"attack",s)}}}function Af(n){wf(n);let e=n.state.people.filter(s=>s.lifeState==="reanimated"&&s.hostile),i=_n(n.state).infectiousWhileAlive>0?n.state.people.filter(s=>s.lifeState==="alive"&&s.hasPathogen&&["symptomatic","critical"].includes(s.healthState)):[];Tf(n,[...e,...i]),Ef(n,e)}hd.exports={HEALTH_DEFAULTS:ld,initializeHealth:yf,updateHealth:Af,neutralizePerson:Mf}});var gd=ni((O_,md)=>{"use strict";var{neutralizePerson:Cf}=Yo(),ud=Object.freeze({policeObserveRange:18,policeFireRange:12,policeApproachSpeed:1.75,policeRetreatSpeed:2.1,policeVehicleSpeed:5.5,policeShotIntervalSeconds:1,policeShotDamage:28,policeHitChance:.82,policeCivilianClearance:.7,policeBusySeconds:120}),Kt=(n,e)=>Math.hypot(n.x-e.x,n.z-e.z),fd=n=>Object.fromEntries(Object.entries(ud).map(([e,t])=>{let i=n.config?.parameters?.[e];return[e,Number.isFinite(i)&&i>=0?i:t]})),ws=(n,e)=>n.state.tick+Math.max(1,Math.ceil(e/n.dt)),ri=(n,e)=>n.find(t=>t.id===e),Si=n=>n&&n.lifeState==="alive",vn=n=>Si(n)&&n.healthState!=="critical"&&n.hp>=25,hi=(n,e)=>e.officerIds.map(t=>ri(n.people,t)).filter(Boolean);function ji(n,e,t){return t.location.kind==="hospital"||n.facilities.hospital.patientIds.includes(t.id)||t.location.kind==="vehicle"&&t.location.vehicleId!==e.vehicleId||n.vehicles.some(i=>i.passengerIds.includes(t.id))?!1:!n.incidents.some(i=>i.type==="medical"&&i.personId===t.id&&!["resolved","cancelled"].includes(i.status)&&(i.assignedAmbulanceId||t.taskId===i.id))}function pd(n,e){let t=n.patrols.find(i=>i.officerIds.includes(e.id));return!!t&&ji(n,t,e)}function Jo(n,e){let t=n.roadNode(e.nodeId);return!!t&&!e.path.length&&Kt(e,t)<1e-7}var If=(n,e)=>["available","patrolling"].includes(e.status)&&!ri(n.vehicles,e.vehicleId)?.broken&&hi(n,e).every(t=>ji(n,e,t))&&hi(n,e).some(t=>vn(t)&&t.ammo>0);function Rf(n){let e=n.state,t=fd(e),i=e.city.vehicleGraph.nodes.map(s=>s.id);for(let s of e.patrols){s.circuitNodeIds=i.slice(),s.routeIndex=(s.routeIndex??0)*3,s.status="patrolling";let r=ri(e.vehicles,s.vehicleId);r.status="patrolling";for(let a of hi(e,s))a.activity="patrolling",a.knownThreats??=[],a.lastObservedThreats??={},a.confirmedNeutralizedIds??=[],a.ammo??=32,a.cooldownTick??=0,a.shotsFired=0;e.config.fixture==="policeBusy"&&(s.status="busy",s.busyUntil=ws(n,t.policeBusySeconds),r.status="busy")}}function Ko(n,e,t,i){if(!vn(e)||!t.hostile||t.lifeState!=="reanimated"||t.location.kind!=="street")return!1;let s=n.position(e),r=n.position(t);return Kt(s,r)<=i.policeObserveRange&&n.lineOfSight(s,r)}function $o(n,e,t){if(pd(n.state,e)){for(let i of n.state.people)if(Ko(n,e,i,t)&&(e.lastObservedThreats[i.id]={...n.position(i),tick:n.state.tick},!e.knownThreats.includes(i.id))){e.knownThreats.push(i.id),n.emit("ThreatIdentified","Um agente confirmou uma amea\xE7a hostil por observa\xE7\xE3o f\xEDsica.",{entityIds:[e.id,i.id],observerId:e.id,targetId:i.id,position:n.position(i),visibility:"confirmed"});let s=n.report(i,"violence",5,"agress\xE3o hostil observada",e.id);s&&(s.confirmedFacts??=[],s.confirmedFacts.includes("hostile-confirmed")||s.confirmedFacts.push("hostile-confirmed"))}}}function Pf(n,e,t,i){let s=n.position(e),r=n.position(t),a=r.x-s.x,o=r.z-s.z,c=a*a+o*o;for(let l of n.state.people){if(!Si(l)||l.id===e.id||l.id===t.id||!["street","vehicle"].includes(l.location.kind))continue;let h=n.position(l);if(c<1e-9){if(Kt(h,r)<i)return l;continue}let u=((h.x-s.x)*a+(h.z-s.z)*o)/c;if(u<=.035||u>1.05)continue;let d={x:s.x+Math.min(1,u)*a,z:s.z+Math.min(1,u)*o};if(Kt(h,d)<i)return l}return null}function Df(n,e,t){if(!vn(e)||!pd(n.state,e)||e.location.kind!=="street"||e.ammo<=0)return null;let i=n.state.people.filter(s=>e.knownThreats.includes(s.id)&&Ko(n,e,s,t)&&Kt(n.position(e),n.position(s))<=t.policeFireRange);i.sort((s,r)=>Kt(n.position(e),n.position(s))-Kt(n.position(e),n.position(r))||s.id.localeCompare(r.id));for(let s of i){let r=Pf(n,e,s,t.policeCivilianClearance);if(!r)return s;e.fireHoldReason="Terceiro na linha de tiro: "+r.id}return null}function Zo(n,e,t){if(n.state.tick<e.cooldownTick)return;let i=Df(n,e,t);if(!i)return;e.fireHoldReason=null;let s=e.path.length>0,r=n.random()<Math.min(1,t.policeHitChance);e.ammo--,e.shotsFired++,e.cooldownTick=ws(n,t.policeShotIntervalSeconds);let a=r?Math.min(i.hp,t.policeShotDamage):0;r&&(i.hp=Math.max(0,i.hp-a)),e.activity="engaging",n.emit("ShotFired","Um agente disparou ap\xF3s identifica\xE7\xE3o, alcance, linha de vis\xE3o e seguran\xE7a de terceiros.",{entityIds:[e.id,i.id],shooterId:e.id,weaponClass:"service-sidearm",position:n.position(e),targetId:i.id,targetPosition:n.position(i),ammoSpent:1,hitOutcome:r?"hit":"miss",damageApplied:a,moving:s,authorizedBy:"direct-observation",visibility:"confirmed"}),r&&i.hp<=0&&Cf(n,i,e.id)&&e.confirmedNeutralizedIds.push(i.id)}function Sr(n,e,t){let i=n.state,s=ri(i.incidents,e.incidentId);s&&s.assignedPatrolId===e.id&&(s.requiresPolice=!0,s.policeStatus="waitingBackup",s.assignedPatrolId=null,s.waitReason=t,s.type==="violence"&&(s.status="waiting")),e.backupRequested||(n.emit("BackupRequested","A patrulha pede refor\xE7o e retira por falta de capacidade operacional.",{entityIds:[e.id,...s?[s.id]:[]],patrolId:e.id,incidentId:s?.id??null,reason:t,visibility:"reported"}),e.backupRequested=!0),e.incidentId=null,e.status="returning";let r=ri(i.vehicles,e.vehicleId);r.incidentId=null,r.status="waitingCrew";for(let a of hi(i,e))!Si(a)||!ji(i,e,a)||a.location.kind==="vehicle"||(a.activity="retreating",a.taskId=null,n.routePerson(a,"foot-"+r.nodeId))}function Lf(n,e){let t=n.state,i=t.incidents.filter(s=>!s.assignedPatrolId&&!["observed","calling","received","resolved","cancelled"].includes(s.status)&&(s.type==="violence"||s.requiresPolice));i.sort((s,r)=>r.priority-s.priority||r.severity-s.severity||s.reportedAt-r.reportedAt||s.id.localeCompare(r.id));for(let s of i){let r=t.patrols.filter(c=>If(t,c));r.sort((c,l)=>Kt(n.position(ri(t.vehicles,c.vehicleId)),s)-Kt(n.position(ri(t.vehicles,l.vehicleId)),s)||c.id.localeCompare(l.id));let a=null;for(let c of r){let l=ri(t.vehicles,c.vehicleId);if(n.routeVehicle(l,n.nearestRoadNode(s))){a=c;break}}if(!a){s.policeStatus="waiting",s.waitReason=r.length?"Percurso policial interrompido.":"Sem patrulha dispon\xEDvel; aguarda refor\xE7o.";continue}let o=ri(t.vehicles,a.vehicleId);a.status="responding",a.incidentId=s.id,a.backupRequested=!1,o.status="responding",o.incidentId=s.id,s.assignedPatrolId=a.id,s.policeStatus="enRoute",s.waitReason=null,s.type==="violence"&&(s.status="assigned");for(let c of hi(t,a))Si(c)&&ji(t,a,c)&&(c.activity="responding",c.taskId=s.id);n.emit("PatrolDispatched","A central enviou uma patrulha existente para uma ocorr\xEAncia conhecida.",{entityIds:[a.id,o.id,s.id],patrolId:a.id,vehicleId:o.id,incidentId:s.id,position:n.position(o),visibility:"reported"})}}function Nf(n,e,t,i){if(!Jo(n,t))return;let s="foot-"+t.nodeId;for(let r of hi(n.state,e))!Si(r)||!ji(n.state,e,r)||r.location.kind!=="vehicle"||r.location.vehicleId!==t.id||(r.location={kind:"street",nodeId:s},r.nodeId=s,r.x=t.x,r.z=t.z,r.path=[],r.activity="approaching",i&&n.routePerson(r,n.nearestPedNode(i)),n.emit("OfficerDisembarked","Um agente saiu da viatura e iniciou aproxima\xE7\xE3o a p\xE9.",{entityIds:[r.id,t.id],officerId:r.id,vehicleId:t.id,position:n.position(r),visibility:"confirmed"}))}function Uf(n,e,t){let i=n.state,s=ri(i.vehicles,e.vehicleId);t.policeStatus="resolved",t.requiresPolice=!1,t.assignedPatrolId=null,t.type==="violence"&&(t.status="resolved",t.resolvedAt=i.tick),n.emit("PoliceSceneSecured","A patrulha terminou a avalia\xE7\xE3o e libertou a ocorr\xEAncia para os servi\xE7os.",{entityIds:[e.id,t.id],patrolId:e.id,incidentId:t.id,position:{x:t.x,z:t.z},visibility:"confirmed"}),e.status="returning",e.incidentId=null,s.status="waitingCrew",s.incidentId=null;for(let r of hi(i,e))Si(r)&&ji(i,e,r)&&r.location.kind==="street"&&(r.activity="returning",r.taskId=null,n.routePerson(r,"foot-"+s.nodeId))}function Ff(n,e,t,i){if(!Jo(n,t)){t.waitReason="Viatura ainda n\xE3o estacionou num n\xF3 vi\xE1rio real.";return}let s=!0;for(let r of hi(n.state,e)){if(!Si(r))continue;if(!ji(n.state,e,r)){e.status="unavailable",t.status="unavailable";return}if(r.location.kind==="vehicle"&&r.location.vehicleId===t.id)continue;s=!1;let a="foot-"+t.nodeId;if(r.destinationNodeId!==a||!r.path.length&&!r.finalApproach&&Kt(n.position(r),t)>.25){if(n.state.tick<(r.nextPoliceReturnRouteTick??0))continue;if(r.nextPoliceReturnRouteTick=ws(n,1),!n.routePerson(r,a)){t.waitReason=e.waitReason="Acesso pedonal de regresso indispon\xEDvel; a patrulha volta a tentar sem recuperar pessoas \xE0 dist\xE2ncia.";continue}t.waitReason?.startsWith("Acesso pedonal de regresso")&&(t.waitReason=null),e.waitReason?.startsWith("Acesso pedonal de regresso")&&(e.waitReason=null)}n.movePerson(r,r.activity==="retreating"?i.policeRetreatSpeed:i.policeApproachSpeed),r.location.kind==="street"&&Kt(n.position(r),t)<.25&&!r.path.length&&!r.finalApproach&&(r.location={kind:"vehicle",vehicleId:t.id},r.x=t.x,r.z=t.z,r.nodeId="foot-"+t.nodeId,r.path=[],r.travelEdge=null,r.finalApproach=null,r.destinationPoint=null,r.activity="patrolling",r.taskId=null,n.emit("OfficerBoarded","Um agente regressou fisicamente \xE0 sua viatura.",{entityIds:[r.id,t.id],officerId:r.id,vehicleId:t.id,position:n.position(t),visibility:"confirmed"}))}s&&(hi(n.state,e).some(r=>Si(r)&&r.ammo>0&&r.hp>=25)?(e.status="patrolling",t.status="patrolling"):(e.status="unavailable",t.status="unavailable",e.waitReason="Efetivos, sa\xFAde ou muni\xE7\xF5es insuficientes; sem reposi\xE7\xE3o autom\xE1tica."))}function Of(n,e,t,i){if(!t.path.length){let s=e.circuitNodeIds;e.routeIndex=(e.routeIndex+1)%s.length;let r=s[e.routeIndex];if(!n.routeVehicle(t,r)){e.waitReason="Percurso de patrulha interrompido.";return}}n.moveVehicle(t,i.policeVehicleSpeed*.65)}function kf(n,e,t,i){let s=n.state,r=hi(s,e),a=r.filter(o=>o.lifeState!=="alive"||o.healthState==="critical");if(!a.length&&e.status!=="medicalEmergency")return!1;if(a.length&&!e.emergencyReported&&(e.emergencyReported=!0,n.emit("PoliceCrewEmergency","Uma emerg\xEAncia real na tripula\xE7\xE3o obriga a parar no pr\xF3ximo n\xF3 vi\xE1rio.",{entityIds:[e.id,t.id,...a.map(o=>o.id)],vehicleId:t.id,visibility:"truth",position:n.position(t)}),e.incidentId&&Sr(n,e,"Emerg\xEAncia m\xE9dica na pr\xF3pria patrulha."),e.status="medicalEmergency"),a.length&&t.path.length&&(t.path=t.path.slice(0,1),t.destinationNodeId=t.path[0],n.moveVehicle(t,i.policeVehicleSpeed),t.path.length))return!0;t.status="awaitingMedical",e.status="medicalEmergency",t.waitReason=e.waitReason="Tripula\xE7\xE3o em emerg\xEAncia; aguarda assist\xEAncia e reavalia\xE7\xE3o sem substitui\xE7\xF5es autom\xE1ticas.";for(let o of r){if(o.location.kind!=="vehicle"||o.location.vehicleId!==t.id)continue;let c="foot-"+t.nodeId;if(o.location={kind:"street",nodeId:c},o.nodeId=c,o.x=t.x,o.z=t.z,o.path=[],o.activity=o.lifeState==="reanimated"?"searching":o.healthState==="critical"?"collapsed":"protecting",n.emit("PoliceEmergencyDisembark","Uma identidade saiu da viatura parada sem alterar o censo.",{entityIds:[o.id,t.id],officerId:o.id,vehicleId:t.id,position:n.position(o),visibility:"truth"}),Si(o)&&o.healthState==="critical"){let l=r.find(h=>h.id!==o.id&&vn(h));l&&n.report(o,"medical",5,"agente inconsciente observado",l.id)}}for(let o of r)vn(o)&&o.location.kind==="street"&&($o(n,o,i),Zo(n,o,i));return!0}function Bf(n,e,t){let i=n.state,s=ri(i.vehicles,e.vehicleId),r=hi(i,e),a=r.filter(d=>!ji(i,e,d));if(a.length){if(e.incidentId&&Sr(n,e,"Agente sob assist\xEAncia m\xE9dica ou na posse operacional de outro servi\xE7o."),e.ownershipSuspended||(e.ownershipSuspended=!0,n.emit("PatrolCrewUnavailable","A afilia\xE7\xE3o mant\xE9m-se, mas a patrulha n\xE3o pode recuperar doentes de outro servi\xE7o.",{entityIds:[e.id,...a.map(d=>d.id)],patrolId:e.id,officerIds:a.map(d=>d.id),visibility:"reported"})),e.status="unavailable",s.waitReason=e.waitReason="Tripula\xE7\xE3o sob assist\xEAncia ou noutro servi\xE7o; sem recupera\xE7\xE3o autom\xE1tica de pessoas.",s.path.length){if(Kt(s,n.roadNode(s.nodeId))<1e-7)s.path=[],s.currentSpeed=0;else if(s.path=s.path.slice(0,1),s.destinationNodeId=s.path[0],n.moveVehicle(s,t.policeVehicleSpeed),s.path.length){s.status="stopping";return}}s.status="unavailable",s.currentSpeed=0;for(let d of a){if(d.location.kind!=="vehicle"||d.location.vehicleId!==s.id||!Jo(n,s))continue;let p="foot-"+s.nodeId;d.location={kind:"street",nodeId:p},d.nodeId=p,d.x=s.x,d.z=s.z,d.path=[],d.travelEdge=null,d.finalApproach=null,d.destinationPoint=null,n.emit("OfficerMedicalHandoff","O agente saiu da sua viatura parada para a assist\xEAncia atribu\xEDda, mantendo a tarefa m\xE9dica.",{entityIds:[d.id,s.id,d.taskId].filter(Boolean),officerId:d.id,vehicleId:s.id,incidentId:d.taskId,position:n.position(d),visibility:"confirmed"})}return}if(kf(n,e,s,t))return;if(e.status==="busy"){if(i.tick<e.busyUntil)return;e.status="patrolling",s.status="patrolling"}for(let d of r)vn(d)&&($o(n,d,t),Zo(n,d,t));if(s.broken){e.incidentId&&Sr(n,e,"Viatura policial avariada."),s.status="broken",e.status="unavailable";return}if(e.status==="returning"){Ff(n,e,s,t);return}if(["available","patrolling"].includes(e.status)){Of(n,e,s,t);return}if(e.status==="unavailable")return;let o=ri(i.incidents,e.incidentId);if(!o){e.status="returning";return}if(!r.some(d=>vn(d)&&d.ammo>0)){Sr(n,e,"Muni\xE7\xF5es ou integridade dos agentes insuficientes.");return}if(e.status==="responding"){if(e.routeWait&&i.tick<(e.nextRouteRetryTick??0))return;if(n.moveVehicle(s,t.policeVehicleSpeed))e.routeWait&&(o.waitReason===e.routeWait.message&&(o.waitReason=e.routeWait.previousReason),s.waitReason=null,e.routeWait=null),s.status="onScene",e.status="approaching",o.policeStatus="onScene",o.type==="violence"&&(o.status="onScene"),e.sceneTick=i.tick,Nf(n,e,s,o),n.emit("PatrolOnScene","A viatura chegou e a equipa aproxima-se a p\xE9 para avaliar a ocorr\xEAncia.",{entityIds:[e.id,o.id],patrolId:e.id,incidentId:o.id,position:n.position(s),visibility:"confirmed"});else if(s.routeBlocked){let d="Percurso policial indispon\xEDvel; a equipa aguarda e volta a avaliar o acesso.";e.routeWait||(e.routeWait={message:d,previousReason:o.waitReason??null}),e.nextRouteRetryTick=ws(n,1),o.policeStatus="waitingRoute",o.waitReason=d,s.waitReason=d}else e.routeWait&&(o.waitReason===e.routeWait.message&&(o.waitReason=e.routeWait.previousReason),o.policeStatus="enRoute",s.waitReason=null,e.routeWait=null);return}for(let d of r){if(!Si(d)||d.location.kind!=="street"||d.healthState==="critical")continue;if(d.ammo<=0||d.hp<25){d.activity="retreating",d.destinationNodeId!=="foot-"+s.nodeId&&n.routePerson(d,"foot-"+s.nodeId),n.movePerson(d,t.policeRetreatSpeed);continue}let p=d.lastObservedThreats[o.personId]??o;i.tick>=(d.nextApproachTick??0)&&Kt(n.position(d),p)>2&&(n.routePerson(d,n.nearestPedNode(p)),d.nextApproachTick=ws(n,2)),d.activity=d.path.length?"approaching":"assessing",n.movePerson(d,t.policeApproachSpeed),$o(n,d,t),Zo(n,d,t)}let c=i.people.some(d=>r.some(p=>p.knownThreats.includes(d.id)&&Ko(n,p,d,t))),l=Math.max(...r.map(d=>d.lastObservedThreats[o.personId]?.tick??-1/0)),u=r.some(d=>d.confirmedNeutralizedIds.includes(o.personId))||!Number.isFinite(l)||i.tick-l>=Math.ceil(20/n.dt);!c&&u&&i.tick>=(e.sceneTick??i.tick)+50&&Uf(n,e,o)}function zf(n){let e=fd(n.state);Lf(n,e);for(let t of n.state.patrols)Bf(n,t,e)}md.exports={POLICE_DEFAULTS:ud,initializePolice:Rf,updatePolice:zf}});var vd=ni((k_,_d)=>{"use strict";var{createCity:Vf}=Bl(),{createHelpers:Hf,positionOf:Gf,clone:Wf}=xr(),{initializePopulation:Xf,updateRoutines:qf}=Yl(),{fixtureName:Yf,parameters:$f}=Jl(),Zf=ko(),Jf=cd(),Kf=Yo(),jf=gd(),xd=.1,jo=class{constructor(e={}){let t=e.seed===void 0?16927:e.seed,i=e.scenario===void 0?"S0":e.scenario;if(!Number.isSafeInteger(t)||t<0||t>4294967295||!["S0","S1","S2"].includes(i))throw new TypeError("Invalid scenario or seed.");let s=(c,l,h,u)=>{let d=c===void 0?l:c;if(!Number.isSafeInteger(d)||d<h||d>u)throw new TypeError("Invalid resource configuration.");return d};if(e.initialPersonId!==void 0&&(typeof e.initialPersonId!="string"||!e.initialPersonId.length))throw new TypeError("Invalid initial person identifier.");let r={residents:s(e.residents,150,4,1e3),ambulances:s(e.ambulances,2,0,8),patrols:s(e.patrols,3,0,8),hospitalCapacity:s(e.hospitalCapacity,4,0,30),fixture:Yf(e.fixture===void 0?"default":e.fixture),parameters:$f(e.parameters),initialPersonId:e.initialPersonId??null};this.state={version:2,seed:t,rng:t>>>0,tick:0,timeSeconds:0,scenario:i,config:r,city:Vf(),people:[],vehicles:[],patrols:[],incidents:[],calls:[],events:[],facilities:{},counters:{},initialPopulation:0,initialPersonId:null,eventSequence:0,incidentSequence:0,callSequence:0},this._commands=new Map;let a=this.state,o=Hf(a);this.ctx={state:a,dt:xd,...o,random:()=>(a.rng=Math.imul(1664525,a.rng)+1013904223>>>0,a.rng/4294967296),emit:(c,l,h={})=>{let u={eventId:++a.eventSequence,type:c,tick:a.tick,timeSeconds:a.tick/10,entityIds:[],message:l,visibility:"truth",...h};return a.events.push(u),u}},Xf(this.ctx),this.ctx.leaveFacility=c=>{if(!c||!["building","hospital"].includes(c.location.kind))return!1;let l=a.city.buildings.find(u=>u.id===c.location.buildingId),h=o.pedestrianNode(l?.entranceNodeIds[0]);return h?(a.facilities.hospital.patientIds=a.facilities.hospital.patientIds.filter(u=>u!==c.id),c.location={kind:"street",nodeId:h.id},c.nodeId=h.id,c.x=h.x,c.z=h.z,c.path=[],c.taskId=null,!0):!1},this.incidentSystem=Zf,this.medicalSystem=Jf,this.healthSystem=Kf,this.policeSystem=jf,this.ctx.report=(...c)=>this.incidentSystem.reportIncident?.(this.ctx,...c),this.incidentSystem.initializeIncidents?.(this.ctx),this.healthSystem.initializeHealth?.(this.ctx),this.policeSystem.initializePolice?.(this.ctx),this._counters()}snapshot(){return Wf(this.state)}command(e){if(!e||typeof e!="object"||Array.isArray(e)||Reflect.ownKeys(e).some(a=>!["commandId","type","incidentId","priority"].includes(a)))return{ok:!1,message:"Comando inv\xE1lido."};if(!["commandId","type","incidentId","priority"].every(a=>Object.hasOwn(e,a))||typeof e.commandId!="string"||!/^[-\w:.]{1,80}$/.test(e.commandId)||e.type!=="overridePriority"||typeof e.incidentId!="string"||!Number.isSafeInteger(e.priority)||e.priority<1||e.priority>5)return{ok:!1,message:"Comando ou prioridade inv\xE1lida."};let t=JSON.stringify({commandId:e.commandId,type:e.type,incidentId:e.incidentId,priority:e.priority}),i=this._commands.get(e.commandId);if(i)return i.payload===t?{...i.result,duplicate:!0}:{ok:!1,message:"Identificador j\xE1 utilizado."};let s=this.state.incidents.find(a=>a.id===e.incidentId);if(!s||["resolved","cancelled"].includes(s.status))return{ok:!1,message:"Ocorr\xEAncia indispon\xEDvel."};s.priority=e.priority,s.manualPriority=e.priority;let r={ok:!0,message:"Prioridade atualizada pela central."};return this._commands.set(e.commandId,{payload:t,result:r}),this.ctx.emit("PriorityOverridden","Prioridade manual atualizada.",{entityIds:[s.id],visibility:"confirmed",priority:e.priority}),{...r}}step(e=1){if(!Number.isSafeInteger(e)||e<1||e>1e4)return{ok:!1,message:"Avan\xE7ar entre 1 e 10000 ticks inteiros."};for(let t=0;t<e;t++)this.state.tick++,this.state.timeSeconds=this.state.tick/10,this.healthSystem.updateHealth?.(this.ctx),qf(this.ctx),this.incidentSystem.updateIncidents?.(this.ctx),this.medicalSystem.updateMedical?.(this.ctx),this.policeSystem.updatePolice?.(this.ctx),this._counters();return this.state}_counters(){let e=this.state;e.counters={living:e.people.filter(t=>t.lifeState==="alive").length,dead:e.people.filter(t=>t.lifeState!=="alive").length,activeReanimated:e.people.filter(t=>t.lifeState==="reanimated").length,neutralized:e.people.filter(t=>t.lifeState==="neutralized").length,reanimatedHistorical:e.people.filter(t=>t.lifeState==="reanimated"||t.lifeState==="neutralized").length,knownCases:e.people.filter(t=>t.observedSymptoms.length>0).length,activeIncidents:e.incidents.filter(t=>!["resolved","cancelled"].includes(t.status)).length,availableAmbulances:e.vehicles.filter(t=>t.type==="ambulance"&&t.status==="available"&&!t.broken&&t.availableAt<=e.tick&&t.crewIds.every(i=>e.people.some(s=>s.id===i&&s.lifeState==="alive"&&s.healthState!=="critical"&&s.location.kind==="vehicle"&&s.location.vehicleId===t.id))).length,availablePatrols:e.patrols.filter(t=>t.status==="available"||t.status==="patrolling").length,hospitalOccupancy:e.facilities.hospital.patientIds.length}}};_d.exports={LivingCity:jo,TICK_SECONDS:xd,positionOf:Gf}});var gu=ni((rM,mu)=>{"use strict";var h_=Math.PI/4,pu=Math.PI/12,pl=new WeakMap,u_=0,_s=n=>typeof n=="number"&&Number.isFinite(n),uu=()=>Object.create(null);function f_(n){return pl.has(n)||pl.set(n,++u_),pl.get(n)}function p_(n){if(!_s(n))throw new TypeError("Visual alpha must be finite.");return Math.max(0,Math.min(1,n))}function xl(n){if(!_s(n))throw new TypeError("Camera azimuth must be finite.");let e=Math.PI*2;return(n%e+e)%e}function m_(n,e){if(e!==-1&&e!==1)throw new TypeError("Camera rotation must be -1 or +1.");return xl(n+e*pu)}function g_(n,e=Math.hypot(68,68),t=88){if(!_s(e)||e<=0||!_s(t)||t<=0)throw new TypeError("Invalid camera dimensions.");let i=xl(n);return{x:Math.sin(i)*e,y:t,z:Math.cos(i)*e}}function fu(n,e,t){if(typeof e!="string"||!e||Object.hasOwn(n,e))throw new TypeError("Visual entities require unique non-empty IDs.");if(t&&(!_s(t.x)||!_s(t.z)))throw new TypeError("Visual positions must be finite.");n[e]=t?Object.freeze(t):null}function ml(n){if(!n||typeof n!="object"||!Number.isSafeInteger(n.tick)||n.tick<0)throw new TypeError("A visual frame requires an integer tick.");let e=uu(),t=uu(),i=new Map((n.city?.buildings||[]).map(r=>[r.id,r])),s=new Map((n.city?.pedestrianGraph?.nodes||[]).map(r=>[r.id,r]));for(let r of n.vehicles||[])fu(e,r.id,{id:r.id,kind:"vehicle",x:r.x,z:r.z,hidden:!1,inside:null,description:null,locationKind:"road",locationId:null,carrierId:null,lifeState:null});for(let r of n.people||[]){let a=r.location||{},o=a.kind,c=null,l={id:r.id,kind:"person",lifeState:r.lifeState||null,locationKind:o,locationId:null,carrierId:null,hidden:!1,inside:null,description:null};if(o==="street")c={...l,x:r.x,z:r.z};else if(o==="vehicle"){let h=e[a.vehicleId];h&&(c={...l,x:h.x,z:h.z,hidden:!0,inside:"vehicle",description:"no interior de uma viatura",locationId:a.vehicleId,carrierId:a.vehicleId})}else if(o==="building"||o==="hospital"){let h=a.buildingId||(o==="hospital"?n.facilities?.hospital?.buildingId:null),u=i.get(h);if(u){let d=s.get(u.entranceNodeIds?.[0]);c={...l,x:d?.x??u.x,z:d?.z??u.z,hidden:!0,inside:"building",description:`no interior de ${u.name||"um edif\xEDcio"}`,locationId:h}}}fu(t,r.id,c)}return Object.freeze({identity:f_(n),context:`${n.version??""}:${n.seed??""}:${n.scenario??""}`,tick:n.tick,people:Object.freeze(t),vehicles:Object.freeze(e)})}function x_(n,e){return n===e?!0:!n||!e?!1:Object.keys(n).every(t=>n[t]===e[t])&&Object.keys(n).length===Object.keys(e).length}function __(n,e){if(!n||!e||n.identity!==e.identity||n.context!==e.context||n.tick!==e.tick)return!1;for(let t of["people","vehicles"]){if(Object.keys(n[t]).length!==Object.keys(e[t]).length)return!1;for(let i of Object.keys(n[t]))if(!Object.hasOwn(e[t],i)||!x_(n[t][i],e[t][i]))return!1}return!0}function v_(n,e,t,i){return!!t&&!!i&&n.identity===e.identity&&n.context===e.context&&e.tick===n.tick+1&&t.kind===i.kind&&t.id===i.id&&t.locationKind===i.locationKind&&t.locationId===i.locationId&&t.lifeState===i.lifeState}function _l(n,e,t,i,s=1){let r=p_(s),a=t==="person"?"people":t==="vehicle"?"vehicles":null;if(!a||!e||!Object.hasOwn(e[a],i)||!e[a][i])return null;let o=e[a][i],c=n?.[a]?.[i],l=n&&v_(n,e,c,o),h=o.x,u=o.z,d=!1;if(o.carrierId){let x=_l(n,e,"vehicle",o.carrierId,r);if(!x)return null;h=x.x,u=x.z,d=x.interpolated}else l&&o.locationKind!=="building"&&o.locationKind!=="hospital"&&(h=c.x+(o.x-c.x)*r,u=c.z+(o.z-c.z)*r,d=r<1&&(h!==o.x||u!==o.z));let{lifeState:p,...g}=o;return{...g,x:h,z:u,interpolated:d,transitionSnap:!l,previousTick:n?.tick??e.tick,currentTick:e.tick}}var gl=class{#t=null;#e=null;#i="empty";captureTick(e){let t=ml(e),i=this.#e;return i&&__(i,t)?!1:(i?t.identity!==i.identity||t.context!==i.context?(this.#t=t,this.#e=t,this.#i="world-change"):t.tick!==i.tick+1?(this.#t=t,this.#e=t,this.#i=t.tick===i.tick?"same-tick-change":"tick-gap-or-reset"):(this.#t=i,this.#e=t,this.#i="consecutive"):(this.#t=t,this.#e=t,this.#i="initial"),!0)}snapToState(e){let t=ml(e);this.#t=t,this.#e=t,this.#i="explicit-snap"}getVisualPose(e,t,i=1){return _l(this.#t,this.#e,e,t,i)}getSummary(){return{previousTick:this.#t?.tick??null,currentTick:this.#e?.tick??null,reason:this.#i,people:this.#e?Object.keys(this.#e.people).length:0,vehicles:this.#e?Object.keys(this.#e.vehicles).length:0}}};mu.exports={VisualPoseHistory:gl,captureVisualFrame:ml,interpolateVisualPose:_l,CANONICAL_AZIMUTH:h_,CAMERA_ROTATION_STEP:pu,normalizeAzimuth:xl,rotateAzimuth:m_,cameraOffset:g_}});var bu=ni((cM,yu)=>{"use strict";var Ml=Object.freeze([1,2,4]),Sl=class{constructor({paused:e=!1,speed:t=1}={}){if(this.accumulatorMs=0,this.paused=!!e,this.speed=1,!this.setSpeed(t))throw new TypeError("Unsupported presentation speed.")}reset({paused:e=!0,speed:t=1}={}){if(!Ml.includes(t))throw new TypeError("Unsupported presentation speed.");this.accumulatorMs=0,this.paused=!!e,this.speed=t}setSpeed(e){return Ml.includes(e)?(this.speed=e,!0):!1}setPaused(e){this.paused=!!e}alpha(){return this.paused?1:Math.max(0,Math.min(1,this.accumulatorMs/100))}snapshot(){return{baseSimulationRate:2,fixedTickMs:100,speed:this.speed,paused:this.paused,accumulatorMs:this.accumulatorMs,alpha:this.alpha(),logicalSecondsPerRealSecond:2*this.speed}}advance(e,t){if(!Number.isFinite(e)||e<0||typeof t!="function")throw new TypeError("A finite nonnegative frame duration and tick callback are required.");if(this.paused)return{steps:0,autoPaused:!1,...this.snapshot()};this.accumulatorMs+=e*2*this.speed;let i=0;for(;this.accumulatorMs>=100-1e-8&&i<100;)t(),this.accumulatorMs=Math.max(0,this.accumulatorMs-100),i++;let s=this.accumulatorMs>1e4;return s&&(this.paused=!0),{steps:i,autoPaused:s,...this.snapshot()}}};yu.exports={SimulationClock:Sl,BASE_SIMULATION_RATE:2,FIXED_TICK_MS:100,SPEED_MULTIPLIERS:Ml}});var Eu=Do(vd(),1);var Yd=0,Lc=1,$d=2;var Nc=1,Zd=2,Ai=3,Hi=0,zt=1,Lt=2,Ci=0,Tn=1,Uc=2,Fc=3,Oc=4,Jd=5,on=100,Kd=101,jd=102,Qd=103,eh=104,th=200,ih=201,nh=202,sh=203,qr=204,Yr=205,rh=206,ah=207,oh=208,ch=209,lh=210,dh=211,hh=212,uh=213,fh=214,va=0,ya=1,ba=2,En=3,Ma=4,Sa=5,wa=6,Ta=7,Ea=0,ph=1,mh=2,Yi=0,gh=1,xh=2,_h=3,vh=4,yh=5,bh=6,Mh=7;var kc=300,Nn=301,Un=302,Aa=303,Ca=304,tr=306,$r=1e3,wi=1001,Zr=1002,Xt=1003,Sh=1004;var ir=1005;var ei=1006,Ia=1007;var dn=1008;var _i=1009,Bc=1010,zc=1011,us=1012,Ra=1013,hn=1014,vi=1015,Fn=1016,Pa=1017,Da=1018,fs=1020,Vc=35902,Hc=35899,Gc=1021,Wc=1022,li=1023,ns=1026,ps=1027,La=1028,Na=1029,Ua=1030,Fa=1031;var Oa=1033,nr=33776,sr=33777,rr=33778,ar=33779,ka=35840,Ba=35841,za=35842,Va=35843,Ha=36196,Ga=37492,Wa=37496,Xa=37808,qa=37809,Ya=37810,$a=37811,Za=37812,Ja=37813,Ka=37814,ja=37815,Qa=37816,eo=37817,to=37818,io=37819,no=37820,so=37821,ro=36492,ao=36494,oo=36495,co=36283,lo=36284,ho=36285,uo=36286;var Ls=2300,Jr=2301,Xr=2302,wc=2400,Tc=2401,Ec=2402;var wh=3200,Th=3201;var Xc=0,Eh=1,$i="",Ft="srgb",An="srgb-linear",Ns="linear",Ze="srgb";var wn=7680;var Ac=519,Ah=512,Ch=513,Ih=514,qc=515,Rh=516,Ph=517,Dh=518,Lh=519,Cc=35044,Ii=35048;var Yc="300 es",mi=2e3,Us=2001;function $c(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Fs(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Nh(){let n=Fs("canvas");return n.style.display="block",n}var yd={},ss=null;function Zc(...n){let e="THREE."+n.shift();ss?ss("log",e,...n):console.log(e,...n)}function Re(...n){let e="THREE."+n.shift();ss?ss("warn",e,...n):console.warn(e,...n)}function ke(...n){let e="THREE."+n.shift();ss?ss("error",e,...n):console.error(e,...n)}function rs(...n){let e=n.join(" ");e in yd||(yd[e]=!0,Re(...n))}function Uh(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Gi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Pt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Qo=Math.PI/180,Kr=180/Math.PI;function or(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Pt[n&255]+Pt[n>>8&255]+Pt[n>>16&255]+Pt[n>>24&255]+"-"+Pt[e&255]+Pt[e>>8&255]+"-"+Pt[e>>16&15|64]+Pt[e>>24&255]+"-"+Pt[t&63|128]+Pt[t>>8&255]+"-"+Pt[t>>16&255]+Pt[t>>24&255]+Pt[i&255]+Pt[i>>8&255]+Pt[i>>16&255]+Pt[i>>24&255]).toLowerCase()}function We(n,e,t){return Math.max(e,Math.min(t,n))}function Qf(n,e){return(n%e+e)%e}function ec(n,e,t){return(1-t)*n+t*e}function Ts(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Gt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var Oe=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(We(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Wi=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let c=i[s+0],l=i[s+1],h=i[s+2],u=i[s+3],d=r[a+0],p=r[a+1],g=r[a+2],x=r[a+3];if(o<=0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(o>=1){e[t+0]=d,e[t+1]=p,e[t+2]=g,e[t+3]=x;return}if(u!==x||c!==d||l!==p||h!==g){let m=c*d+l*p+h*g+u*x;m<0&&(d=-d,p=-p,g=-g,x=-x,m=-m);let f=1-o;if(m<.9995){let S=Math.acos(m),w=Math.sin(S);f=Math.sin(f*S)/w,o=Math.sin(o*S)/w,c=c*f+d*o,l=l*f+p*o,h=h*f+g*o,u=u*f+x*o}else{c=c*f+d*o,l=l*f+p*o,h=h*f+g*o,u=u*f+x*o;let S=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=S,l*=S,h*=S,u*=S}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],c=i[s+1],l=i[s+2],h=i[s+3],u=r[a],d=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+h*u+c*p-l*d,e[t+1]=c*g+h*d+l*u-o*p,e[t+2]=l*g+h*p+o*d-c*u,e[t+3]=h*g-o*u-c*d-l*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(s/2),u=o(r/2),d=c(i/2),p=c(s/2),g=c(r/2);switch(a){case"XYZ":this._x=d*h*u+l*p*g,this._y=l*p*u-d*h*g,this._z=l*h*g+d*p*u,this._w=l*h*u-d*p*g;break;case"YXZ":this._x=d*h*u+l*p*g,this._y=l*p*u-d*h*g,this._z=l*h*g-d*p*u,this._w=l*h*u+d*p*g;break;case"ZXY":this._x=d*h*u-l*p*g,this._y=l*p*u+d*h*g,this._z=l*h*g+d*p*u,this._w=l*h*u-d*p*g;break;case"ZYX":this._x=d*h*u-l*p*g,this._y=l*p*u+d*h*g,this._z=l*h*g-d*p*u,this._w=l*h*u+d*p*g;break;case"YZX":this._x=d*h*u+l*p*g,this._y=l*p*u+d*h*g,this._z=l*h*g-d*p*u,this._w=l*h*u-d*p*g;break;case"XZY":this._x=d*h*u-l*p*g,this._y=l*p*u-d*h*g,this._z=l*h*g+d*p*u,this._w=l*h*u+d*p*g;break;default:Re("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],u=t[10],d=i+o+u;if(d>0){let p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(i>o&&i>u){let p=2*Math.sqrt(1+i-o-u);this._w=(h-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>u){let p=2*Math.sqrt(1+o-i-u);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+h)/p}else{let p=2*Math.sqrt(1+u-i-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+a*o+s*l-r*c,this._y=s*h+a*c+r*o-i*l,this._z=r*h+a*l+i*c-s*o,this._w=a*h-i*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},F=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*i),h=2*(o*t-r*s),u=2*(r*i-a*t);return this.x=t+c*l+a*u-o*h,this.y=i+c*h+o*l-r*u,this.z=s+c*u+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-i*c,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return tc.copy(this).projectOnVector(e),this.sub(tc)}reflect(e){return this.sub(tc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(We(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},tc=new F,bd=new Wi,Ue=class n{constructor(e,t,i,s,r,a,o,c,l){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l)}set(e,t,i,s,r,a,o,c,l){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],u=i[7],d=i[2],p=i[5],g=i[8],x=s[0],m=s[3],f=s[6],S=s[1],w=s[4],T=s[7],E=s[2],b=s[5],C=s[8];return r[0]=a*x+o*S+c*E,r[3]=a*m+o*w+c*b,r[6]=a*f+o*T+c*C,r[1]=l*x+h*S+u*E,r[4]=l*m+h*w+u*b,r[7]=l*f+h*T+u*C,r[2]=d*x+p*S+g*E,r[5]=d*m+p*w+g*b,r[8]=d*f+p*T+g*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-i*r*h+i*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=h*a-o*l,d=o*c-h*r,p=l*r-a*c,g=t*u+i*d+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=u*x,e[1]=(s*l-h*i)*x,e[2]=(o*i-s*a)*x,e[3]=d*x,e[4]=(h*t-s*c)*x,e[5]=(s*r-o*t)*x,e[6]=p*x,e[7]=(i*c-l*t)*x,e[8]=(a*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(ic.makeScale(e,t)),this}rotate(e){return this.premultiply(ic.makeRotation(-e)),this}translate(e,t){return this.premultiply(ic.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},ic=new Ue,Md=new Ue().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Sd=new Ue().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ep(){let n={enabled:!0,workingColorSpace:An,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Ze&&(s.r=Vi(s.r),s.g=Vi(s.g),s.b=Vi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Ze&&(s.r=is(s.r),s.g=is(s.g),s.b=is(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===$i?Ns:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return rs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return rs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[An]:{primaries:e,whitePoint:i,transfer:Ns,toXYZ:Md,fromXYZ:Sd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ft},outputColorSpaceConfig:{drawingBufferColorSpace:Ft}},[Ft]:{primaries:e,whitePoint:i,transfer:Ze,toXYZ:Md,fromXYZ:Sd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ft}}}),n}var qe=ep();function Vi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function is(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Gn,jr=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Gn===void 0&&(Gn=Fs("canvas")),Gn.width=e.width,Gn.height=e.height;let s=Gn.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Gn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Fs("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Vi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Vi(t[i]/255)*255):t[i]=Vi(t[i]);return{data:t,width:e.width,height:e.height}}else return Re("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},tp=0,as=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:tp++}),this.uuid=or(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(nc(s[a].image)):r.push(nc(s[a]))}else r=nc(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function nc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?jr.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Re("Texture: Unable to serialize Texture."),{})}var ip=0,sc=new F,qt=class n extends Gi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=wi,s=wi,r=ei,a=dn,o=li,c=_i,l=n.DEFAULT_ANISOTROPY,h=$i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ip++}),this.uuid=or(),this.name="",this.source=new as(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ue,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(sc).x}get height(){return this.source.getSize(sc).y}get depth(){return this.source.getSize(sc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Re(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Re(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==kc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case $r:e.x=e.x-Math.floor(e.x);break;case wi:e.x=e.x<0?0:1;break;case Zr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case $r:e.y=e.y-Math.floor(e.y);break;case wi:e.y=e.y<0?0:1;break;case Zr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};qt.DEFAULT_IMAGE=null;qt.DEFAULT_MAPPING=kc;qt.DEFAULT_ANISOTROPY=1;var pt=class n{constructor(e=0,t=0,i=0,s=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,c=e.elements,l=c[0],h=c[4],u=c[8],d=c[1],p=c[5],g=c[9],x=c[2],m=c[6],f=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(l+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(l+1)/2,T=(p+1)/2,E=(f+1)/2,b=(h+d)/4,C=(u+x)/4,D=(g+m)/4;return w>T&&w>E?w<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(w),s=b/i,r=C/i):T>E?T<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(T),i=b/s,r=D/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=C/r,s=D/r),this.set(i,s,r,t),this}let S=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(u-x)/S,this.z=(d-h)/S,this.w=Math.acos((l+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Qr=class extends Gi{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ei,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new pt(0,0,e,t),this.scissorTest=!1,this.viewport=new pt(0,0,e,t);let s={width:e,height:t,depth:i.depth},r=new qt(s);this.textures=[];let a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){let t={minFilter:ei,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new as(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ti=class extends Qr{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Os=class extends qt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Xt,this.minFilter=Xt,this.wrapR=wi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ea=class extends qt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Xt,this.minFilter=Xt,this.wrapR=wi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ei=class{constructor(e=new F(1/0,1/0,1/0),t=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(ui.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(ui.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=ui.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,ui):ui.fromBufferAttribute(r,a),ui.applyMatrix4(e.matrixWorld),this.expandByPoint(ui);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),wr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),wr.copy(i.boundingBox)),wr.applyMatrix4(e.matrixWorld),this.union(wr)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ui),ui.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Es),Tr.subVectors(this.max,Es),Wn.subVectors(e.a,Es),Xn.subVectors(e.b,Es),qn.subVectors(e.c,Es),Qi.subVectors(Xn,Wn),en.subVectors(qn,Xn),yn.subVectors(Wn,qn);let t=[0,-Qi.z,Qi.y,0,-en.z,en.y,0,-yn.z,yn.y,Qi.z,0,-Qi.x,en.z,0,-en.x,yn.z,0,-yn.x,-Qi.y,Qi.x,0,-en.y,en.x,0,-yn.y,yn.x,0];return!rc(t,Wn,Xn,qn,Tr)||(t=[1,0,0,0,1,0,0,0,1],!rc(t,Wn,Xn,qn,Tr))?!1:(Er.crossVectors(Qi,en),t=[Er.x,Er.y,Er.z],rc(t,Wn,Xn,qn,Tr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ui).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ui).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Fi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Fi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Fi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Fi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Fi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Fi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Fi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Fi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Fi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Fi=[new F,new F,new F,new F,new F,new F,new F,new F],ui=new F,wr=new Ei,Wn=new F,Xn=new F,qn=new F,Qi=new F,en=new F,yn=new F,Es=new F,Tr=new F,Er=new F,bn=new F;function rc(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){bn.fromArray(n,r);let o=s.x*Math.abs(bn.x)+s.y*Math.abs(bn.y)+s.z*Math.abs(bn.z),c=e.dot(bn),l=t.dot(bn),h=i.dot(bn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var np=new Ei,As=new F,ac=new F,Xi=class{constructor(e=new F,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):np.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;As.subVectors(e,this.center);let t=As.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(As,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ac.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(As.copy(e.center).add(ac)),this.expandByPoint(As.copy(e.center).sub(ac))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Oi=new F,oc=new F,Ar=new F,tn=new F,cc=new F,Cr=new F,lc=new F,os=class{constructor(e=new F,t=new F(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Oi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Oi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Oi.copy(this.origin).addScaledVector(this.direction,t),Oi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){oc.copy(e).add(t).multiplyScalar(.5),Ar.copy(t).sub(e).normalize(),tn.copy(this.origin).sub(oc);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Ar),o=tn.dot(this.direction),c=-tn.dot(Ar),l=tn.lengthSq(),h=Math.abs(1-a*a),u,d,p,g;if(h>0)if(u=a*c-o,d=a*o-c,g=r*h,u>=0)if(d>=-g)if(d<=g){let x=1/h;u*=x,d*=x,p=u*(u+a*d+2*o)+d*(a*u+d+2*c)+l}else d=r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-c),r),p=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-r,-c),r),p=d*(d+2*c)+l):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-c),r),p=-u*u+d*(d+2*c)+l);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),p=-u*u+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(oc).addScaledVector(Ar,d),p}intersectSphere(e,t){Oi.subVectors(e.center,this.origin);let i=Oi.dot(this.direction),s=Oi.dot(Oi)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(i=(e.min.x-d.x)*l,s=(e.max.x-d.x)*l):(i=(e.max.x-d.x)*l,s=(e.min.x-d.x)*l),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),i>c||o>s)||((o>i||i!==i)&&(i=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Oi)!==null}intersectTriangle(e,t,i,s,r){cc.subVectors(t,e),Cr.subVectors(i,e),lc.crossVectors(cc,Cr);let a=this.direction.dot(lc),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;tn.subVectors(this.origin,e);let c=o*this.direction.dot(Cr.crossVectors(tn,Cr));if(c<0)return null;let l=o*this.direction.dot(cc.cross(tn));if(l<0||c+l>a)return null;let h=-o*tn.dot(lc);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ot=class n{constructor(e,t,i,s,r,a,o,c,l,h,u,d,p,g,x,m){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,c,l,h,u,d,p,g,x,m)}set(e,t,i,s,r,a,o,c,l,h,u,d,p,g,x,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=i,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=c,f[2]=l,f[6]=h,f[10]=u,f[14]=d,f[3]=p,f[7]=g,f[11]=x,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,s=1/Yn.setFromMatrixColumn(e,0).length(),r=1/Yn.setFromMatrixColumn(e,1).length(),a=1/Yn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=a*h,p=a*u,g=o*h,x=o*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=p+g*l,t[5]=d-x*l,t[9]=-o*c,t[2]=x-d*l,t[6]=g+p*l,t[10]=a*c}else if(e.order==="YXZ"){let d=c*h,p=c*u,g=l*h,x=l*u;t[0]=d+x*o,t[4]=g*o-p,t[8]=a*l,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=x+d*o,t[10]=a*c}else if(e.order==="ZXY"){let d=c*h,p=c*u,g=l*h,x=l*u;t[0]=d-x*o,t[4]=-a*u,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=x-d*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let d=a*h,p=a*u,g=o*h,x=o*u;t[0]=c*h,t[4]=g*l-p,t[8]=d*l+x,t[1]=c*u,t[5]=x*l+d,t[9]=p*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let d=a*c,p=a*l,g=o*c,x=o*l;t[0]=c*h,t[4]=x-d*u,t[8]=g*u+p,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=p*u+g,t[10]=d-x*u}else if(e.order==="XZY"){let d=a*c,p=a*l,g=o*c,x=o*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=d*u+x,t[5]=a*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=o*h,t[10]=x*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(sp,e,rp)}lookAt(e,t,i){let s=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),nn.crossVectors(i,jt),nn.lengthSq()===0&&(Math.abs(i.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),nn.crossVectors(i,jt)),nn.normalize(),Ir.crossVectors(jt,nn),s[0]=nn.x,s[4]=Ir.x,s[8]=jt.x,s[1]=nn.y,s[5]=Ir.y,s[9]=jt.y,s[2]=nn.z,s[6]=Ir.z,s[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],u=i[5],d=i[9],p=i[13],g=i[2],x=i[6],m=i[10],f=i[14],S=i[3],w=i[7],T=i[11],E=i[15],b=s[0],C=s[4],D=s[8],y=s[12],v=s[1],I=s[5],N=s[9],k=s[13],V=s[2],W=s[6],X=s[10],te=s[14],G=s[3],Q=s[7],ee=s[11],Me=s[15];return r[0]=a*b+o*v+c*V+l*G,r[4]=a*C+o*I+c*W+l*Q,r[8]=a*D+o*N+c*X+l*ee,r[12]=a*y+o*k+c*te+l*Me,r[1]=h*b+u*v+d*V+p*G,r[5]=h*C+u*I+d*W+p*Q,r[9]=h*D+u*N+d*X+p*ee,r[13]=h*y+u*k+d*te+p*Me,r[2]=g*b+x*v+m*V+f*G,r[6]=g*C+x*I+m*W+f*Q,r[10]=g*D+x*N+m*X+f*ee,r[14]=g*y+x*k+m*te+f*Me,r[3]=S*b+w*v+T*V+E*G,r[7]=S*C+w*I+T*W+E*Q,r[11]=S*D+w*N+T*X+E*ee,r[15]=S*y+w*k+T*te+E*Me,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],u=e[6],d=e[10],p=e[14],g=e[3],x=e[7],m=e[11],f=e[15];return g*(+r*c*u-s*l*u-r*o*d+i*l*d+s*o*p-i*c*p)+x*(+t*c*p-t*l*d+r*a*d-s*a*p+s*l*h-r*c*h)+m*(+t*l*u-t*o*p-r*a*u+i*a*p+r*o*h-i*l*h)+f*(-s*o*h-t*c*u+t*o*d+s*a*u-i*a*d+i*c*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=e[9],d=e[10],p=e[11],g=e[12],x=e[13],m=e[14],f=e[15],S=u*m*l-x*d*l+x*c*p-o*m*p-u*c*f+o*d*f,w=g*d*l-h*m*l-g*c*p+a*m*p+h*c*f-a*d*f,T=h*x*l-g*u*l+g*o*p-a*x*p-h*o*f+a*u*f,E=g*u*c-h*x*c-g*o*d+a*x*d+h*o*m-a*u*m,b=t*S+i*w+s*T+r*E;if(b===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/b;return e[0]=S*C,e[1]=(x*d*r-u*m*r-x*s*p+i*m*p+u*s*f-i*d*f)*C,e[2]=(o*m*r-x*c*r+x*s*l-i*m*l-o*s*f+i*c*f)*C,e[3]=(u*c*r-o*d*r-u*s*l+i*d*l+o*s*p-i*c*p)*C,e[4]=w*C,e[5]=(h*m*r-g*d*r+g*s*p-t*m*p-h*s*f+t*d*f)*C,e[6]=(g*c*r-a*m*r-g*s*l+t*m*l+a*s*f-t*c*f)*C,e[7]=(a*d*r-h*c*r+h*s*l-t*d*l-a*s*p+t*c*p)*C,e[8]=T*C,e[9]=(g*u*r-h*x*r-g*i*p+t*x*p+h*i*f-t*u*f)*C,e[10]=(a*x*r-g*o*r+g*i*l-t*x*l-a*i*f+t*o*f)*C,e[11]=(h*o*r-a*u*r-h*i*l+t*u*l+a*i*p-t*o*p)*C,e[12]=E*C,e[13]=(h*x*s-g*u*s+g*i*d-t*x*d-h*i*m+t*u*m)*C,e[14]=(g*o*s-a*x*s-g*i*c+t*x*c+a*i*m-t*o*m)*C,e[15]=(a*u*s-h*o*s+h*i*c-t*u*c-a*i*d+t*o*d)*C,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+i,l*o-s*c,l*c+s*o,0,l*o+s*c,h*o+i,h*c-s*a,0,l*c-s*o,h*c+s*a,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,u=o+o,d=r*l,p=r*h,g=r*u,x=a*h,m=a*u,f=o*u,S=c*l,w=c*h,T=c*u,E=i.x,b=i.y,C=i.z;return s[0]=(1-(x+f))*E,s[1]=(p+T)*E,s[2]=(g-w)*E,s[3]=0,s[4]=(p-T)*b,s[5]=(1-(d+f))*b,s[6]=(m+S)*b,s[7]=0,s[8]=(g+w)*C,s[9]=(m-S)*C,s[10]=(1-(d+x))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements,r=Yn.set(s[0],s[1],s[2]).length(),a=Yn.set(s[4],s[5],s[6]).length(),o=Yn.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],fi.copy(this);let l=1/r,h=1/a,u=1/o;return fi.elements[0]*=l,fi.elements[1]*=l,fi.elements[2]*=l,fi.elements[4]*=h,fi.elements[5]*=h,fi.elements[6]*=h,fi.elements[8]*=u,fi.elements[9]*=u,fi.elements[10]*=u,t.setFromRotationMatrix(fi),i.x=r,i.y=a,i.z=o,this}makePerspective(e,t,i,s,r,a,o=mi,c=!1){let l=this.elements,h=2*r/(t-e),u=2*r/(i-s),d=(t+e)/(t-e),p=(i+s)/(i-s),g,x;if(c)g=r/(a-r),x=a*r/(a-r);else if(o===mi)g=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===Us)g=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=mi,c=!1){let l=this.elements,h=2/(t-e),u=2/(i-s),d=-(t+e)/(t-e),p=-(i+s)/(i-s),g,x;if(c)g=1/(a-r),x=a/(a-r);else if(o===mi)g=-2/(a-r),x=-(a+r)/(a-r);else if(o===Us)g=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=g,l[14]=x,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Yn=new F,fi=new ot,sp=new F(0,0,0),rp=new F(1,1,1),nn=new F,Ir=new F,jt=new F,wd=new ot,Td=new Wi,xi=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],h=s[9],u=s[2],d=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(We(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-We(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(We(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:Re("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return wd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(wd,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Td.setFromEuler(this),this.setFromQuaternion(Td,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};xi.DEFAULT_ORDER="XYZ";var cs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},ap=0,Ed=new F,$n=new Wi,ki=new ot,Rr=new F,Cs=new F,op=new F,cp=new Wi,Ad=new F(1,0,0),Cd=new F(0,1,0),Id=new F(0,0,1),Rd={type:"added"},lp={type:"removed"},Zn={type:"childadded",child:null},dc={type:"childremoved",child:null},bt=class n extends Gi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ap++}),this.uuid=or(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new F,t=new xi,i=new Wi,s=new F(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ot},normalMatrix:{value:new Ue}}),this.matrix=new ot,this.matrixWorld=new ot,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new cs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return $n.setFromAxisAngle(e,t),this.quaternion.multiply($n),this}rotateOnWorldAxis(e,t){return $n.setFromAxisAngle(e,t),this.quaternion.premultiply($n),this}rotateX(e){return this.rotateOnAxis(Ad,e)}rotateY(e){return this.rotateOnAxis(Cd,e)}rotateZ(e){return this.rotateOnAxis(Id,e)}translateOnAxis(e,t){return Ed.copy(e).applyQuaternion(this.quaternion),this.position.add(Ed.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ad,e)}translateY(e){return this.translateOnAxis(Cd,e)}translateZ(e){return this.translateOnAxis(Id,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ki.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Rr.copy(e):Rr.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Cs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ki.lookAt(Cs,Rr,this.up):ki.lookAt(Rr,Cs,this.up),this.quaternion.setFromRotationMatrix(ki),s&&(ki.extractRotation(s.matrixWorld),$n.setFromRotationMatrix(ki),this.quaternion.premultiply($n.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Rd),Zn.child=e,this.dispatchEvent(Zn),Zn.child=null):ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(lp),dc.child=e,this.dispatchEvent(dc),dc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ki.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ki.multiply(e.parent.matrixWorld)),e.applyMatrix4(ki),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Rd),Zn.child=e,this.dispatchEvent(Zn),Zn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cs,e,op),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cs,cp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=s,i;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};bt.DEFAULT_UP=new F(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var pi=new F,Bi=new F,hc=new F,zi=new F,Jn=new F,Kn=new F,Pd=new F,uc=new F,fc=new F,pc=new F,mc=new pt,gc=new pt,xc=new pt,an=class n{constructor(e=new F,t=new F,i=new F){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),pi.subVectors(e,t),s.cross(pi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){pi.subVectors(s,t),Bi.subVectors(i,t),hc.subVectors(e,t);let a=pi.dot(pi),o=pi.dot(Bi),c=pi.dot(hc),l=Bi.dot(Bi),h=Bi.dot(hc),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,p=(l*c-o*h)*d,g=(a*h-o*c)*d;return r.set(1-p-g,g,p)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,zi)===null?!1:zi.x>=0&&zi.y>=0&&zi.x+zi.y<=1}static getInterpolation(e,t,i,s,r,a,o,c){return this.getBarycoord(e,t,i,s,zi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,zi.x),c.addScaledVector(a,zi.y),c.addScaledVector(o,zi.z),c)}static getInterpolatedAttribute(e,t,i,s,r,a){return mc.setScalar(0),gc.setScalar(0),xc.setScalar(0),mc.fromBufferAttribute(e,t),gc.fromBufferAttribute(e,i),xc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(mc,r.x),a.addScaledVector(gc,r.y),a.addScaledVector(xc,r.z),a}static isFrontFacing(e,t,i,s){return pi.subVectors(i,t),Bi.subVectors(e,t),pi.cross(Bi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return pi.subVectors(this.c,this.b),Bi.subVectors(this.a,this.b),pi.cross(Bi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;Jn.subVectors(s,i),Kn.subVectors(r,i),uc.subVectors(e,i);let c=Jn.dot(uc),l=Kn.dot(uc);if(c<=0&&l<=0)return t.copy(i);fc.subVectors(e,s);let h=Jn.dot(fc),u=Kn.dot(fc);if(h>=0&&u<=h)return t.copy(s);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(i).addScaledVector(Jn,a);pc.subVectors(e,r);let p=Jn.dot(pc),g=Kn.dot(pc);if(g>=0&&p<=g)return t.copy(r);let x=p*l-c*g;if(x<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(i).addScaledVector(Kn,o);let m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return Pd.subVectors(r,s),o=(u-h)/(u-h+(p-g)),t.copy(s).addScaledVector(Pd,o);let f=1/(m+x+d);return a=x*f,o=d*f,t.copy(i).addScaledVector(Jn,a).addScaledVector(Kn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Fh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},sn={h:0,s:0,l:0},Pr={h:0,s:0,l:0};function _c(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ce=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ft){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,qe.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=qe.workingColorSpace){if(e=Qf(e,1),t=We(t,0,1),i=We(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=_c(a,r,e+1/3),this.g=_c(a,r,e),this.b=_c(a,r,e-1/3)}return qe.colorSpaceToWorking(this,s),this}setStyle(e,t=Ft){function i(r){r!==void 0&&parseFloat(r)<1&&Re("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Re("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Re("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ft){let i=Fh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Re("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Vi(e.r),this.g=Vi(e.g),this.b=Vi(e.b),this}copyLinearToSRGB(e){return this.r=is(e.r),this.g=is(e.g),this.b=is(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ft){return qe.workingToColorSpace(Dt.copy(this),e),Math.round(We(Dt.r*255,0,255))*65536+Math.round(We(Dt.g*255,0,255))*256+Math.round(We(Dt.b*255,0,255))}getHexString(e=Ft){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.workingToColorSpace(Dt.copy(this),t);let i=Dt.r,s=Dt.g,r=Dt.b,a=Math.max(i,s,r),o=Math.min(i,s,r),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case i:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-i)/u+2;break;case r:c=(i-s)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=qe.workingColorSpace){return qe.workingToColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=Ft){qe.workingToColorSpace(Dt.copy(this),e);let t=Dt.r,i=Dt.g,s=Dt.b;return e!==Ft?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(sn),this.setHSL(sn.h+e,sn.s+t,sn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(sn),e.getHSL(Pr);let i=ec(sn.h,Pr.h,t),s=ec(sn.s,Pr.s,t),r=ec(sn.l,Pr.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Dt=new Ce;Ce.NAMES=Fh;var dp=0,qi=class extends Gi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dp++}),this.uuid=or(),this.name="",this.type="Material",this.blending=Tn,this.side=Hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=qr,this.blendDst=Yr,this.blendEquation=on,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=En,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ac,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wn,this.stencilZFail=wn,this.stencilZPass=wn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Re(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Re(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Tn&&(i.blending=this.blending),this.side!==Hi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==qr&&(i.blendSrc=this.blendSrc),this.blendDst!==Yr&&(i.blendDst=this.blendDst),this.blendEquation!==on&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==En&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Ac&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==wn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==wn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==wn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Ot=class extends qi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xi,this.combine=Ea,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var _t=new F,Dr=new Oe,hp=0,It=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:hp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Cc,this.updateRanges=[],this.gpuType=vi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Dr.fromBufferAttribute(this,t),Dr.applyMatrix3(e),this.setXY(t,Dr.x,Dr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ts(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Gt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ts(t,this.array)),t}setX(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ts(t,this.array)),t}setY(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ts(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ts(t,this.array)),t}setW(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),i=Gt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),i=Gt(i,this.array),s=Gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),i=Gt(i,this.array),s=Gt(s,this.array),r=Gt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Cc&&(e.usage=this.usage),e}};var ks=class extends It{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Bs=class extends It{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Je=class extends It{constructor(e,t,i){super(new Float32Array(e),t,i)}},up=0,ai=new ot,vc=new bt,jn=new F,Qt=new Ei,Is=new Ei,wt=new F,vt=class n extends Gi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:up++}),this.uuid=or(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new($c(e)?Bs:ks)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ue().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ai.makeRotationFromQuaternion(e),this.applyMatrix4(ai),this}rotateX(e){return ai.makeRotationX(e),this.applyMatrix4(ai),this}rotateY(e){return ai.makeRotationY(e),this.applyMatrix4(ai),this}rotateZ(e){return ai.makeRotationZ(e),this.applyMatrix4(ai),this}translate(e,t,i){return ai.makeTranslation(e,t,i),this.applyMatrix4(ai),this}scale(e,t,i){return ai.makeScale(e,t,i),this.applyMatrix4(ai),this}lookAt(e){return vc.lookAt(e),vc.updateMatrix(),this.applyMatrix4(vc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(jn).negate(),this.translate(jn.x,jn.y,jn.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Je(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Re("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ei);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];Qt.setFromBufferAttribute(r),this.morphTargetsRelative?(wt.addVectors(this.boundingBox.min,Qt.min),this.boundingBox.expandByPoint(wt),wt.addVectors(this.boundingBox.max,Qt.max),this.boundingBox.expandByPoint(wt)):(this.boundingBox.expandByPoint(Qt.min),this.boundingBox.expandByPoint(Qt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Xi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(e){let i=this.boundingSphere.center;if(Qt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Is.setFromBufferAttribute(o),this.morphTargetsRelative?(wt.addVectors(Qt.min,Is.min),Qt.expandByPoint(wt),wt.addVectors(Qt.max,Is.max),Qt.expandByPoint(wt)):(Qt.expandByPoint(Is.min),Qt.expandByPoint(Is.max))}Qt.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)wt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(wt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)wt.fromBufferAttribute(o,l),c&&(jn.fromBufferAttribute(e,l),wt.add(jn)),s=Math.max(s,i.distanceToSquared(wt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new It(new Float32Array(4*i.count),4));let a=this.getAttribute("tangent"),o=[],c=[];for(let D=0;D<i.count;D++)o[D]=new F,c[D]=new F;let l=new F,h=new F,u=new F,d=new Oe,p=new Oe,g=new Oe,x=new F,m=new F;function f(D,y,v){l.fromBufferAttribute(i,D),h.fromBufferAttribute(i,y),u.fromBufferAttribute(i,v),d.fromBufferAttribute(r,D),p.fromBufferAttribute(r,y),g.fromBufferAttribute(r,v),h.sub(l),u.sub(l),p.sub(d),g.sub(d);let I=1/(p.x*g.y-g.x*p.y);isFinite(I)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(I),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(I),o[D].add(x),o[y].add(x),o[v].add(x),c[D].add(m),c[y].add(m),c[v].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let D=0,y=S.length;D<y;++D){let v=S[D],I=v.start,N=v.count;for(let k=I,V=I+N;k<V;k+=3)f(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let w=new F,T=new F,E=new F,b=new F;function C(D){E.fromBufferAttribute(s,D),b.copy(E);let y=o[D];w.copy(y),w.sub(E.multiplyScalar(E.dot(y))).normalize(),T.crossVectors(b,y);let I=T.dot(c[D])<0?-1:1;a.setXYZW(D,w.x,w.y,w.z,I)}for(let D=0,y=S.length;D<y;++D){let v=S[D],I=v.start,N=v.count;for(let k=I,V=I+N;k<V;k+=3)C(e.getX(k+0)),C(e.getX(k+1)),C(e.getX(k+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new It(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,p=i.count;d<p;d++)i.setXYZ(d,0,0,0);let s=new F,r=new F,a=new F,o=new F,c=new F,l=new F,h=new F,u=new F;if(e)for(let d=0,p=e.count;d<p;d+=3){let g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(i,g),c.fromBufferAttribute(i,x),l.fromBufferAttribute(i,m),o.add(h),c.add(h),l.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(x,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,p=t.count;d<p;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)wt.fromBufferAttribute(e,t),wt.normalize(),e.setXYZ(t,wt.x,wt.y,wt.z)}toNonIndexed(){function e(o,c){let l=o.array,h=o.itemSize,u=o.normalized,d=new l.constructor(c.length*h),p=0,g=0;for(let x=0,m=c.length;x<m;x++){o.isInterleavedBufferAttribute?p=c[x]*o.data.stride+o.offset:p=c[x]*h;for(let f=0;f<h;f++)d[g++]=l[p++]}return new It(d,h,u)}if(this.index===null)return Re("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,i);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){let d=l[h],p=e(d,i);c.push(p)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let p=l[u];h.push(p.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(t))}let r=e.morphAttributes;for(let l in r){let h=[],u=r[l];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,h=a.length;l<h;l++){let u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Dd=new ot,Mn=new os,Lr=new Xi,Ld=new F,Nr=new F,Ur=new F,Fr=new F,yc=new F,Or=new F,Nd=new F,kr=new F,Tt=class extends bt{constructor(e=new vt,t=new Ot){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Or.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=o[c],u=r[c];h!==0&&(yc.fromBufferAttribute(u,e),a?Or.addScaledVector(yc,h):Or.addScaledVector(yc.sub(t),h))}t.add(Or)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Lr.copy(i.boundingSphere),Lr.applyMatrix4(r),Mn.copy(e.ray).recast(e.near),!(Lr.containsPoint(Mn.origin)===!1&&(Mn.intersectSphere(Lr,Ld)===null||Mn.origin.distanceToSquared(Ld)>(e.far-e.near)**2))&&(Dd.copy(r).invert(),Mn.copy(e.ray).applyMatrix4(Dd),!(i.boundingBox!==null&&Mn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Mn)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){let m=d[g],f=a[m.materialIndex],S=Math.max(m.start,p.start),w=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let T=S,E=w;T<E;T+=3){let b=o.getX(T),C=o.getX(T+1),D=o.getX(T+2);s=Br(this,f,e,i,l,h,u,b,C,D),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(o.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){let S=o.getX(m),w=o.getX(m+1),T=o.getX(m+2);s=Br(this,a,e,i,l,h,u,S,w,T),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){let m=d[g],f=a[m.materialIndex],S=Math.max(m.start,p.start),w=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let T=S,E=w;T<E;T+=3){let b=T,C=T+1,D=T+2;s=Br(this,f,e,i,l,h,u,b,C,D),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),x=Math.min(c.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){let S=m,w=m+1,T=m+2;s=Br(this,a,e,i,l,h,u,S,w,T),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function fp(n,e,t,i,s,r,a,o){let c;if(e.side===zt?c=i.intersectTriangle(a,r,s,!0,o):c=i.intersectTriangle(s,r,a,e.side===Hi,o),c===null)return null;kr.copy(o),kr.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(kr);return l<t.near||l>t.far?null:{distance:l,point:kr.clone(),object:n}}function Br(n,e,t,i,s,r,a,o,c,l){n.getVertexPosition(o,Nr),n.getVertexPosition(c,Ur),n.getVertexPosition(l,Fr);let h=fp(n,e,t,i,Nr,Ur,Fr,Nd);if(h){let u=new F;an.getBarycoord(Nd,Nr,Ur,Fr,u),s&&(h.uv=an.getInterpolatedAttribute(s,o,c,l,u,new Oe)),r&&(h.uv1=an.getInterpolatedAttribute(r,o,c,l,u,new Oe)),a&&(h.normal=an.getInterpolatedAttribute(a,o,c,l,u,new F),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:c,c:l,normal:new F,materialIndex:0};an.getNormal(Nr,Ur,Fr,d.normal),h.face=d,h.barycoord=u}return h}var kt=class n extends vt{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],h=[],u=[],d=0,p=0;g("z","y","x",-1,-1,i,t,e,a,r,0),g("z","y","x",1,-1,i,t,-e,a,r,1),g("x","z","y",1,1,e,i,t,s,a,2),g("x","z","y",1,-1,e,i,-t,s,a,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new Je(l,3)),this.setAttribute("normal",new Je(h,3)),this.setAttribute("uv",new Je(u,2));function g(x,m,f,S,w,T,E,b,C,D,y){let v=T/C,I=E/D,N=T/2,k=E/2,V=b/2,W=C+1,X=D+1,te=0,G=0,Q=new F;for(let ee=0;ee<X;ee++){let Me=ee*I-k;for(let Xe=0;Xe<W;Xe++){let Ke=Xe*v-N;Q[x]=Ke*S,Q[m]=Me*w,Q[f]=V,l.push(Q.x,Q.y,Q.z),Q[x]=0,Q[m]=0,Q[f]=b>0?1:-1,h.push(Q.x,Q.y,Q.z),u.push(Xe/C),u.push(1-ee/D),te+=1}}for(let ee=0;ee<D;ee++)for(let Me=0;Me<C;Me++){let Xe=d+Me+W*ee,Ke=d+Me+W*(ee+1),st=d+(Me+1)+W*(ee+1),rt=d+(Me+1)+W*ee;c.push(Xe,Ke,rt),c.push(Ke,st,rt),G+=6}o.addGroup(p,G,y),p+=G,d+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function On(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(Re("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Nt(n){let e={};for(let t=0;t<n.length;t++){let i=On(n[t]);for(let s in i)e[s]=i[s]}return e}function pp(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Jc(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:qe.workingColorSpace}var Oh={clone:On,merge:Nt},mp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,gp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ci=class extends qi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=mp,this.fragmentShader=gp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=On(e.uniforms),this.uniformsGroups=pp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},zs=class extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ot,this.projectionMatrix=new ot,this.projectionMatrixInverse=new ot,this.coordinateSystem=mi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},rn=new F,Ud=new Oe,Fd=new Oe,Wt=class extends zs{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Kr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Qo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Kr*2*Math.atan(Math.tan(Qo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){rn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(rn.x,rn.y).multiplyScalar(-e/rn.z),rn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(rn.x,rn.y).multiplyScalar(-e/rn.z)}getViewSize(e,t){return this.getViewBounds(e,Ud,Fd),t.subVectors(Fd,Ud)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Qo*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*i/l,s*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Qn=-90,es=1,ta=class extends bt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Wt(Qn,es,e,t);s.layers=this.layers,this.add(s);let r=new Wt(Qn,es,e,t);r.layers=this.layers,this.add(r);let a=new Wt(Qn,es,e,t);a.layers=this.layers,this.add(a);let o=new Wt(Qn,es,e,t);o.layers=this.layers,this.add(o);let c=new Wt(Qn,es,e,t);c.layers=this.layers,this.add(c);let l=new Wt(Qn,es,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===mi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Us)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,a),e.setRenderTarget(i,2,s),e.render(t,o),e.setRenderTarget(i,3,s),e.render(t,c),e.setRenderTarget(i,4,s),e.render(t,l),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),e.render(t,h),e.setRenderTarget(u,d,p),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Vs=class extends qt{constructor(e=[],t=Nn,i,s,r,a,o,c,l,h){super(e,t,i,s,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ia=class extends Ti{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Vs(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new kt(5,5,5),r=new ci({name:"CubemapFromEquirect",uniforms:On(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:zt,blending:Ci});r.uniforms.tEquirect.value=t;let a=new Tt(s,r),o=t.minFilter;return t.minFilter===dn&&(t.minFilter=ei),new ta(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}},gi=class extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}},xp={type:"move"},ls=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new gi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new gi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new gi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,i),f=this._getHandJoint(l,x);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),p=.02,g=.005;l.inputState.pinching&&d>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(xp)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new gi;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}};var Hs=class extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new xi,this.environmentIntensity=1,this.environmentRotation=new xi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var Gs=class extends qt{constructor(e=null,t=1,i=1,s,r,a,o,c,l=Xt,h=Xt,u,d){super(null,a,o,c,l,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ws=class extends It{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ts=new ot,Od=new ot,zr=[],kd=new Ei,_p=new ot,Rs=new Tt,Ps=new Xi,yt=class extends Tt{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ws(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,_p)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ei),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ts),kd.copy(e.boundingBox).applyMatrix4(ts),this.boundingBox.union(kd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Xi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,ts),Ps.copy(e.boundingSphere).applyMatrix4(ts),this.boundingSphere.union(Ps)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(Rs.geometry=this.geometry,Rs.material=this.material,Rs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ps.copy(this.boundingSphere),Ps.applyMatrix4(i),e.ray.intersectsSphere(Ps)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ts),Od.multiplyMatrices(i,ts),Rs.matrixWorld=Od,Rs.raycast(e,zr);for(let a=0,o=zr.length;a<o;a++){let c=zr[a];c.instanceId=r,c.object=this,t.push(c)}zr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Ws(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Gs(new Float32Array(s*this.count),s,this.count,La,vi));let r=this.morphTexture.source.data.data,a=0;for(let l=0;l<i.length;l++)a+=i[l];let o=this.geometry.morphTargetsRelative?1:1-a,c=s*e;r[c]=o,r.set(i,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},bc=new F,vp=new F,yp=new Ue,oi=class{constructor(e=new F(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=bc.subVectors(i,t).cross(vp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(bc),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||yp.getNormalMatrix(e),s=this.coplanarPoint(bc).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Sn=new Xi,bp=new Oe(.5,.5),Vr=new F,ds=class{constructor(e=new oi,t=new oi,i=new oi,s=new oi,r=new oi,a=new oi){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=mi,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],u=r[5],d=r[6],p=r[7],g=r[8],x=r[9],m=r[10],f=r[11],S=r[12],w=r[13],T=r[14],E=r[15];if(s[0].setComponents(l-a,p-h,f-g,E-S).normalize(),s[1].setComponents(l+a,p+h,f+g,E+S).normalize(),s[2].setComponents(l+o,p+u,f+x,E+w).normalize(),s[3].setComponents(l-o,p-u,f-x,E-w).normalize(),i)s[4].setComponents(c,d,m,T).normalize(),s[5].setComponents(l-c,p-d,f-m,E-T).normalize();else if(s[4].setComponents(l-c,p-d,f-m,E-T).normalize(),t===mi)s[5].setComponents(l+c,p+d,f+m,E+T).normalize();else if(t===Us)s[5].setComponents(c,d,m,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Sn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Sn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Sn)}intersectsSprite(e){Sn.center.set(0,0,0);let t=bp.distanceTo(e.center);return Sn.radius=.7071067811865476+t,Sn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Sn)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(Vr.x=s.normal.x>0?e.max.x:e.min.x,Vr.y=s.normal.y>0?e.max.y:e.min.y,Vr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Vr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Cn=class extends qi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ce(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},na=new F,sa=new F,Bd=new ot,Ds=new os,Hr=new Xi,Mc=new F,zd=new F,ra=class extends bt{constructor(e=new vt,t=new Cn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)na.fromBufferAttribute(t,s-1),sa.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=na.distanceTo(sa);e.setAttribute("lineDistance",new Je(i,1))}else Re("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Hr.copy(i.boundingSphere),Hr.applyMatrix4(s),Hr.radius+=r,e.ray.intersectsSphere(Hr)===!1)return;Bd.copy(s).invert(),Ds.copy(e.ray).applyMatrix4(Bd);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let x=p,m=g-1;x<m;x+=l){let f=h.getX(x),S=h.getX(x+1),w=Gr(this,e,Ds,c,f,S,x);w&&t.push(w)}if(this.isLineLoop){let x=h.getX(g-1),m=h.getX(p),f=Gr(this,e,Ds,c,x,m,g-1);f&&t.push(f)}}else{let p=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let x=p,m=g-1;x<m;x+=l){let f=Gr(this,e,Ds,c,x,x+1,x);f&&t.push(f)}if(this.isLineLoop){let x=Gr(this,e,Ds,c,g-1,p,g-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Gr(n,e,t,i,s,r,a){let o=n.geometry.attributes.position;if(na.fromBufferAttribute(o,s),sa.fromBufferAttribute(o,r),t.distanceSqToSegment(na,sa,Mc,zd)>i)return;Mc.applyMatrix4(n.matrixWorld);let l=e.ray.origin.distanceTo(Mc);if(!(l<e.near||l>e.far))return{distance:l,point:zd.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}var Vd=new F,Hd=new F,hs=class extends ra{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)Vd.fromBufferAttribute(t,s),Hd.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Vd.distanceTo(Hd);e.setAttribute("lineDistance",new Je(i,1))}else Re("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Xs=class extends qt{constructor(e,t,i=hn,s,r,a,o=Xt,c=Xt,l,h=ns,u=1){if(h!==ns&&h!==ps)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,a,o,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new as(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},qs=class extends qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ys=class n extends vt{constructor(e=1,t=1,i=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:s,heightSegments:r},t=Math.max(0,t),i=Math.max(1,Math.floor(i)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],c=[],l=[],h=t/2,u=Math.PI/2*e,d=t,p=2*u+d,g=i*2+r,x=s+1,m=new F,f=new F;for(let S=0;S<=g;S++){let w=0,T=0,E=0,b=0;if(S<=i){let y=S/i,v=y*Math.PI/2;T=-h-e*Math.cos(v),E=e*Math.sin(v),b=-e*Math.cos(v),w=y*u}else if(S<=i+r){let y=(S-i)/r;T=-h+y*t,E=e,b=0,w=u+y*d}else{let y=(S-i-r)/i,v=y*Math.PI/2;T=h+e*Math.sin(v),E=e*Math.cos(v),b=e*Math.sin(v),w=u+d+y*u}let C=Math.max(0,Math.min(1,w/p)),D=0;S===0?D=.5/s:S===g&&(D=-.5/s);for(let y=0;y<=s;y++){let v=y/s,I=v*Math.PI*2,N=Math.sin(I),k=Math.cos(I);f.x=-E*k,f.y=T,f.z=E*N,o.push(f.x,f.y,f.z),m.set(-E*k,b,E*N),m.normalize(),c.push(m.x,m.y,m.z),l.push(v+D,C)}if(S>0){let y=(S-1)*x;for(let v=0;v<s;v++){let I=y+v,N=y+v+1,k=S*x+v,V=S*x+v+1;a.push(I,N,k),a.push(N,V,k)}}}this.setIndex(a),this.setAttribute("position",new Je(o,3)),this.setAttribute("normal",new Je(c,3)),this.setAttribute("uv",new Je(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}};var $s=class n extends vt{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],p=[],g=0,x=[],m=i/2,f=0;S(),a===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(h),this.setAttribute("position",new Je(u,3)),this.setAttribute("normal",new Je(d,3)),this.setAttribute("uv",new Je(p,2));function S(){let T=new F,E=new F,b=0,C=(t-e)/i;for(let D=0;D<=r;D++){let y=[],v=D/r,I=v*(t-e)+e;for(let N=0;N<=s;N++){let k=N/s,V=k*c+o,W=Math.sin(V),X=Math.cos(V);E.x=I*W,E.y=-v*i+m,E.z=I*X,u.push(E.x,E.y,E.z),T.set(W,C,X).normalize(),d.push(T.x,T.y,T.z),p.push(k,1-v),y.push(g++)}x.push(y)}for(let D=0;D<s;D++)for(let y=0;y<r;y++){let v=x[y][D],I=x[y+1][D],N=x[y+1][D+1],k=x[y][D+1];(e>0||y!==0)&&(h.push(v,I,k),b+=3),(t>0||y!==r-1)&&(h.push(I,N,k),b+=3)}l.addGroup(f,b,0),f+=b}function w(T){let E=g,b=new Oe,C=new F,D=0,y=T===!0?e:t,v=T===!0?1:-1;for(let N=1;N<=s;N++)u.push(0,m*v,0),d.push(0,v,0),p.push(.5,.5),g++;let I=g;for(let N=0;N<=s;N++){let V=N/s*c+o,W=Math.cos(V),X=Math.sin(V);C.x=y*X,C.y=m*v,C.z=y*W,u.push(C.x,C.y,C.z),d.push(0,v,0),b.x=W*.5+.5,b.y=X*.5*v+.5,p.push(b.x,b.y),g++}for(let N=0;N<s;N++){let k=E+N,V=I+N;T===!0?h.push(V,V+1,k):h.push(V+1,V,k),D+=3}l.addGroup(f,D,T===!0?1:2),f+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var aa=class n extends vt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],a=[];o(s),l(i),h(),this.setAttribute("position",new Je(r,3)),this.setAttribute("normal",new Je(r.slice(),3)),this.setAttribute("uv",new Je(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(S){let w=new F,T=new F,E=new F;for(let b=0;b<t.length;b+=3)p(t[b+0],w),p(t[b+1],T),p(t[b+2],E),c(w,T,E,S)}function c(S,w,T,E){let b=E+1,C=[];for(let D=0;D<=b;D++){C[D]=[];let y=S.clone().lerp(T,D/b),v=w.clone().lerp(T,D/b),I=b-D;for(let N=0;N<=I;N++)N===0&&D===b?C[D][N]=y:C[D][N]=y.clone().lerp(v,N/I)}for(let D=0;D<b;D++)for(let y=0;y<2*(b-D)-1;y++){let v=Math.floor(y/2);y%2===0?(d(C[D][v+1]),d(C[D+1][v]),d(C[D][v])):(d(C[D][v+1]),d(C[D+1][v+1]),d(C[D+1][v]))}}function l(S){let w=new F;for(let T=0;T<r.length;T+=3)w.x=r[T+0],w.y=r[T+1],w.z=r[T+2],w.normalize().multiplyScalar(S),r[T+0]=w.x,r[T+1]=w.y,r[T+2]=w.z}function h(){let S=new F;for(let w=0;w<r.length;w+=3){S.x=r[w+0],S.y=r[w+1],S.z=r[w+2];let T=m(S)/2/Math.PI+.5,E=f(S)/Math.PI+.5;a.push(T,1-E)}g(),u()}function u(){for(let S=0;S<a.length;S+=6){let w=a[S+0],T=a[S+2],E=a[S+4],b=Math.max(w,T,E),C=Math.min(w,T,E);b>.9&&C<.1&&(w<.2&&(a[S+0]+=1),T<.2&&(a[S+2]+=1),E<.2&&(a[S+4]+=1))}}function d(S){r.push(S.x,S.y,S.z)}function p(S,w){let T=S*3;w.x=e[T+0],w.y=e[T+1],w.z=e[T+2]}function g(){let S=new F,w=new F,T=new F,E=new F,b=new Oe,C=new Oe,D=new Oe;for(let y=0,v=0;y<r.length;y+=9,v+=6){S.set(r[y+0],r[y+1],r[y+2]),w.set(r[y+3],r[y+4],r[y+5]),T.set(r[y+6],r[y+7],r[y+8]),b.set(a[v+0],a[v+1]),C.set(a[v+2],a[v+3]),D.set(a[v+4],a[v+5]),E.copy(S).add(w).add(T).divideScalar(3);let I=m(E);x(b,v+0,S,I),x(C,v+2,w,I),x(D,v+4,T,I)}}function x(S,w,T,E){E<0&&S.x===1&&(a[w]=S.x-1),T.x===0&&T.z===0&&(a[w]=E/2/Math.PI+.5)}function m(S){return Math.atan2(S.z,-S.x)}function f(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var In=class n extends aa{constructor(e=1,t=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}},Rn=class n extends vt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),c=Math.floor(s),l=o+1,h=c+1,u=e/o,d=t/c,p=[],g=[],x=[],m=[];for(let f=0;f<h;f++){let S=f*d-a;for(let w=0;w<l;w++){let T=w*u-r;g.push(T,-S,0),x.push(0,0,1),m.push(w/o),m.push(1-f/c)}}for(let f=0;f<c;f++)for(let S=0;S<o;S++){let w=S+l*f,T=S+l*(f+1),E=S+1+l*(f+1),b=S+1+l*f;p.push(w,T,b),p.push(T,E,b)}this.setIndex(p),this.setAttribute("position",new Je(g,3)),this.setAttribute("normal",new Je(x,3)),this.setAttribute("uv",new Je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Pn=class n extends vt{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],c=[],l=[],h=[],u=e,d=(t-e)/s,p=new F,g=new Oe;for(let x=0;x<=s;x++){for(let m=0;m<=i;m++){let f=r+m/i*a;p.x=u*Math.cos(f),p.y=u*Math.sin(f),c.push(p.x,p.y,p.z),l.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,h.push(g.x,g.y)}u+=d}for(let x=0;x<s;x++){let m=x*(i+1);for(let f=0;f<i;f++){let S=f+m,w=S,T=S+i+1,E=S+i+2,b=S+1;o.push(w,T,b),o.push(T,E,b)}}this.setIndex(o),this.setAttribute("position",new Je(c,3)),this.setAttribute("normal",new Je(l,3)),this.setAttribute("uv",new Je(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Zs=class n extends vt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let c=Math.min(a+o,Math.PI),l=0,h=[],u=new F,d=new F,p=[],g=[],x=[],m=[];for(let f=0;f<=i;f++){let S=[],w=f/i,T=0;f===0&&a===0?T=.5/t:f===i&&c===Math.PI&&(T=-.5/t);for(let E=0;E<=t;E++){let b=E/t;u.x=-e*Math.cos(s+b*r)*Math.sin(a+w*o),u.y=e*Math.cos(a+w*o),u.z=e*Math.sin(s+b*r)*Math.sin(a+w*o),g.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),m.push(b+T,1-w),S.push(l++)}h.push(S)}for(let f=0;f<i;f++)for(let S=0;S<t;S++){let w=h[f][S+1],T=h[f][S],E=h[f+1][S],b=h[f+1][S+1];(f!==0||a>0)&&p.push(w,T,b),(f!==i-1||c<Math.PI)&&p.push(T,E,b)}this.setIndex(p),this.setAttribute("position",new Je(g,3)),this.setAttribute("normal",new Je(x,3)),this.setAttribute("uv",new Je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Bt=class extends qi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xc,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xi,this.combine=Ea,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},oa=class extends qi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=wh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ca=class extends qi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Wr(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function Mp(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var Dn=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];i:{e:{let a;t:{n:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break i}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},la=class extends Dn{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:wc,endingEnd:wc}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Tc:r=e,o=2*t-i;break;case Ec:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case Tc:a=e,c=2*i-t;break;case Ec:a=1,c=i+s[1]-s[0];break;default:a=e-1,c=t}let l=(i-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,p=this._weightNext,g=(i-t)/(s-t),x=g*g,m=x*g,f=-d*m+2*d*x-d*g,S=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*g+1,w=(-1-p)*m+(1.5+p)*x+.5*g,T=p*m-p*x;for(let E=0;E!==o;++E)r[E]=f*a[h+E]+S*a[l+E]+w*a[c+E]+T*a[u+E];return r}},da=class extends Dn{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(i-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[l+d]*u+a[c+d]*h;return r}},ha=class extends Dn{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ti=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Wr(t,this.TimeBufferType),this.values=Wr(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Wr(e.times,Array),values:Wr(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new ha(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new da(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new la(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ls:t=this.InterpolantFactoryMethodDiscrete;break;case Jr:t=this.InterpolantFactoryMethodLinear;break;case Xr:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Re("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ls;case this.InterpolantFactoryMethodLinear:return Jr;case this.InterpolantFactoryMethodSmooth:return Xr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ke("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(ke("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){ke("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){ke("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Mp(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){ke("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Xr,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(s)c=!0;else{let u=o*i,d=u-i,p=u+i;for(let g=0;g!==i;++g){let x=t[u+g];if(x!==t[d+g]||x!==t[p+g]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let u=o*i,d=a*i;for(let p=0;p!==i;++p)t[d+p]=t[u+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,c=a*i,l=0;l!==i;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};ti.prototype.ValueTypeName="";ti.prototype.TimeBufferType=Float32Array;ti.prototype.ValueBufferType=Float32Array;ti.prototype.DefaultInterpolation=Jr;var cn=class extends ti{constructor(e,t,i){super(e,t,i)}};cn.prototype.ValueTypeName="bool";cn.prototype.ValueBufferType=Array;cn.prototype.DefaultInterpolation=Ls;cn.prototype.InterpolantFactoryMethodLinear=void 0;cn.prototype.InterpolantFactoryMethodSmooth=void 0;var ua=class extends ti{constructor(e,t,i,s){super(e,t,i,s)}};ua.prototype.ValueTypeName="color";var fa=class extends ti{constructor(e,t,i,s){super(e,t,i,s)}};fa.prototype.ValueTypeName="number";var pa=class extends Dn{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-t)/(s-t),l=e*o;for(let h=l+o;l!==h;l+=4)Wi.slerpFlat(r,0,a,l-o,a,l,c);return r}},Js=class extends ti{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new pa(this.times,this.values,this.getValueSize(),e)}};Js.prototype.ValueTypeName="quaternion";Js.prototype.InterpolantFactoryMethodSmooth=void 0;var ln=class extends ti{constructor(e,t,i){super(e,t,i)}};ln.prototype.ValueTypeName="string";ln.prototype.ValueBufferType=Array;ln.prototype.DefaultInterpolation=Ls;ln.prototype.InterpolantFactoryMethodLinear=void 0;ln.prototype.InterpolantFactoryMethodSmooth=void 0;var ma=class extends ti{constructor(e,t,i,s){super(e,t,i,s)}};ma.prototype.ValueTypeName="vector";var ga=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let p=l[u],g=l[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},kh=new ga,xa=class{constructor(e){this.manager=e!==void 0?e:kh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};xa.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ks=class extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},js=class extends Ks{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Sc=new ot,Gd=new F,Wd=new F,Ic=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=_i,this.map=null,this.mapPass=null,this.matrix=new ot,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ds,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new pt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Gd.setFromMatrixPosition(e.matrixWorld),t.position.copy(Gd),Wd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Wd),t.updateMatrixWorld(),Sc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Sc,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Sc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Ln=class extends zs{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Rc=class extends Ic{constructor(){super(new Ln(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Qs=class extends Ks{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new Rc}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var _a=class extends Wt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Kc="\\[\\]\\.:\\/",Sp=new RegExp("["+Kc+"]","g"),jc="[^"+Kc+"]",wp="[^"+Kc.replace("\\.","")+"]",Tp=/((?:WC+[\/:])*)/.source.replace("WC",jc),Ep=/(WCOD+)?/.source.replace("WCOD",wp),Ap=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",jc),Cp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",jc),Ip=new RegExp("^"+Tp+Ep+Ap+Cp+"$"),Rp=["material","materials","bones","map"],Pc=class{constructor(e,t,i){let s=i||lt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},lt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Sp,"")}static parseTrackName(e){let t=Ip.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);Rp.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=i(o.children);if(c)return c}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Re("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=t.objectIndex;switch(i){case"materials":if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(l!==void 0){if(e[l]===void 0){ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;ke("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};lt.Composite=Pc;lt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};lt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};lt.prototype.GetterByBindingType=[lt.prototype._getValue_direct,lt.prototype._getValue_array,lt.prototype._getValue_arrayElement,lt.prototype._getValue_toArray];lt.prototype.SetterByBindingTypeAndVersioning=[[lt.prototype._setValue_direct,lt.prototype._setValue_direct_setNeedsUpdate,lt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_array,lt.prototype._setValue_array_setNeedsUpdate,lt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_arrayElement,lt.prototype._setValue_arrayElement_setNeedsUpdate,lt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_fromArray,lt.prototype._setValue_fromArray_setNeedsUpdate,lt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var B_=new Float32Array(1);var Xd=new ot,er=class{constructor(e,t,i=0,s=1/0){this.ray=new os(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new cs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):ke("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Xd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Xd),this}intersectObject(e,t=!0,i=[]){return Dc(e,this,i,t),i.sort(qd),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Dc(e[s],this,i,t);return i.sort(qd),i}};function qd(n,e){return n.distance-e.distance}function Dc(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let a=0,o=r.length;a<o;a++)Dc(r[a],e,t,!0)}}function Qc(n,e,t,i){let s=Pp(i);switch(t){case Gc:return n*e;case La:return n*e/s.components*s.byteLength;case Na:return n*e/s.components*s.byteLength;case Ua:return n*e*2/s.components*s.byteLength;case Fa:return n*e*2/s.components*s.byteLength;case Wc:return n*e*3/s.components*s.byteLength;case li:return n*e*4/s.components*s.byteLength;case Oa:return n*e*4/s.components*s.byteLength;case nr:case sr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case rr:case ar:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ba:case Va:return Math.max(n,16)*Math.max(e,8)/4;case ka:case za:return Math.max(n,8)*Math.max(e,8)/2;case Ha:case Ga:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Wa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Xa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case qa:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Ya:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case $a:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Za:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Ja:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Ka:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case ja:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Qa:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case eo:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case to:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case io:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case no:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case so:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ro:case ao:case oo:return Math.ceil(n/4)*Math.ceil(e/4)*16;case co:case lo:return Math.ceil(n/4)*Math.ceil(e/4)*8;case ho:case uo:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Pp(n){switch(n){case _i:case Bc:return{byteLength:1,components:1};case us:case zc:case Fn:return{byteLength:2,components:1};case Pa:case Da:return{byteLength:2,components:4};case hn:case Ra:case vi:return{byteLength:4,components:1};case Vc:case Hc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"181"}}));typeof window<"u"&&(window.__THREE__?Re("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="181");function ou(){let n=null,e=!1,t=null,i=null;function s(r,a){t(r,a),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Dp(n){let e=new WeakMap;function t(o,c){let l=o.array,h=o.usage,u=l.byteLength,d=n.createBuffer();n.bindBuffer(c,d),n.bufferData(c,l,h),o.onUploadCallback();let p;if(l instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=n.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=n.SHORT;else if(l instanceof Uint32Array)p=n.UNSIGNED_INT;else if(l instanceof Int32Array)p=n.INT;else if(l instanceof Int8Array)p=n.BYTE;else if(l instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,c,l){let h=c.array,u=c.updateRanges;if(n.bindBuffer(l,o),u.length===0)n.bufferSubData(l,0,h);else{u.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<u.length;p++){let g=u[d],x=u[p];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,u[d]=x)}u.length=d+1;for(let p=0,g=u.length;p<g;p++){let x=u[p];n.bufferSubData(l,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(n.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var Lp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Np=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Up=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Fp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Op=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,kp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Bp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,zp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Vp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Hp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Gp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Wp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Xp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,qp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Yp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$p=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Zp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Kp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Qp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,em=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,tm=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,im=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,nm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,sm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,rm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,am=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,om=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,cm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,lm="gl_FragColor = linearToOutputTexel( gl_FragColor );",dm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,hm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,um=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,fm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,pm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,mm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,gm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_m=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,vm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ym=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,bm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Mm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Sm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,wm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Tm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Em=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Am=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Im=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Rm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Pm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 uv = vec2( roughness, dotNV );
	return texture2D( dfgLUT, uv ).rg;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNV * dotNV), 0.0, dotNV), material.roughness );
	vec2 dfgL = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNL * dotNL), 0.0, dotNL), material.roughness );
	vec3 FssEss_V = material.specularColor * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColor * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColor + ( 1.0 - material.specularColor ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Dm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Lm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Nm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Um=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Fm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Om=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,km=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Bm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,zm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Vm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Hm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Gm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Wm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Xm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,qm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ym=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$m=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Zm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Km=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,e0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,t0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,i0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,n0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,s0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,r0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,a0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,o0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,c0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,l0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,d0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,h0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,u0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,f0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,p0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,m0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,g0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,x0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,_0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,v0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,y0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,b0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,M0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,S0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,w0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,T0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,E0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,A0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,C0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,I0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,R0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,P0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,D0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,L0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,U0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,F0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,O0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,k0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,B0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,z0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,V0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,H0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,G0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,q0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Y0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Z0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,J0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,K0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,j0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Q0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,eg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ig=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ng=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ag=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,og=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,lg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,dg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,hg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Fe={alphahash_fragment:Lp,alphahash_pars_fragment:Np,alphamap_fragment:Up,alphamap_pars_fragment:Fp,alphatest_fragment:Op,alphatest_pars_fragment:kp,aomap_fragment:Bp,aomap_pars_fragment:zp,batching_pars_vertex:Vp,batching_vertex:Hp,begin_vertex:Gp,beginnormal_vertex:Wp,bsdfs:Xp,iridescence_fragment:qp,bumpmap_pars_fragment:Yp,clipping_planes_fragment:$p,clipping_planes_pars_fragment:Zp,clipping_planes_pars_vertex:Jp,clipping_planes_vertex:Kp,color_fragment:jp,color_pars_fragment:Qp,color_pars_vertex:em,color_vertex:tm,common:im,cube_uv_reflection_fragment:nm,defaultnormal_vertex:sm,displacementmap_pars_vertex:rm,displacementmap_vertex:am,emissivemap_fragment:om,emissivemap_pars_fragment:cm,colorspace_fragment:lm,colorspace_pars_fragment:dm,envmap_fragment:hm,envmap_common_pars_fragment:um,envmap_pars_fragment:fm,envmap_pars_vertex:pm,envmap_physical_pars_fragment:Tm,envmap_vertex:mm,fog_vertex:gm,fog_pars_vertex:xm,fog_fragment:_m,fog_pars_fragment:vm,gradientmap_pars_fragment:ym,lightmap_pars_fragment:bm,lights_lambert_fragment:Mm,lights_lambert_pars_fragment:Sm,lights_pars_begin:wm,lights_toon_fragment:Em,lights_toon_pars_fragment:Am,lights_phong_fragment:Cm,lights_phong_pars_fragment:Im,lights_physical_fragment:Rm,lights_physical_pars_fragment:Pm,lights_fragment_begin:Dm,lights_fragment_maps:Lm,lights_fragment_end:Nm,logdepthbuf_fragment:Um,logdepthbuf_pars_fragment:Fm,logdepthbuf_pars_vertex:Om,logdepthbuf_vertex:km,map_fragment:Bm,map_pars_fragment:zm,map_particle_fragment:Vm,map_particle_pars_fragment:Hm,metalnessmap_fragment:Gm,metalnessmap_pars_fragment:Wm,morphinstance_vertex:Xm,morphcolor_vertex:qm,morphnormal_vertex:Ym,morphtarget_pars_vertex:$m,morphtarget_vertex:Zm,normal_fragment_begin:Jm,normal_fragment_maps:Km,normal_pars_fragment:jm,normal_pars_vertex:Qm,normal_vertex:e0,normalmap_pars_fragment:t0,clearcoat_normal_fragment_begin:i0,clearcoat_normal_fragment_maps:n0,clearcoat_pars_fragment:s0,iridescence_pars_fragment:r0,opaque_fragment:a0,packing:o0,premultiplied_alpha_fragment:c0,project_vertex:l0,dithering_fragment:d0,dithering_pars_fragment:h0,roughnessmap_fragment:u0,roughnessmap_pars_fragment:f0,shadowmap_pars_fragment:p0,shadowmap_pars_vertex:m0,shadowmap_vertex:g0,shadowmask_pars_fragment:x0,skinbase_vertex:_0,skinning_pars_vertex:v0,skinning_vertex:y0,skinnormal_vertex:b0,specularmap_fragment:M0,specularmap_pars_fragment:S0,tonemapping_fragment:w0,tonemapping_pars_fragment:T0,transmission_fragment:E0,transmission_pars_fragment:A0,uv_pars_fragment:C0,uv_pars_vertex:I0,uv_vertex:R0,worldpos_vertex:P0,background_vert:D0,background_frag:L0,backgroundCube_vert:N0,backgroundCube_frag:U0,cube_vert:F0,cube_frag:O0,depth_vert:k0,depth_frag:B0,distanceRGBA_vert:z0,distanceRGBA_frag:V0,equirect_vert:H0,equirect_frag:G0,linedashed_vert:W0,linedashed_frag:X0,meshbasic_vert:q0,meshbasic_frag:Y0,meshlambert_vert:$0,meshlambert_frag:Z0,meshmatcap_vert:J0,meshmatcap_frag:K0,meshnormal_vert:j0,meshnormal_frag:Q0,meshphong_vert:eg,meshphong_frag:tg,meshphysical_vert:ig,meshphysical_frag:ng,meshtoon_vert:sg,meshtoon_frag:rg,points_vert:ag,points_frag:og,shadow_vert:cg,shadow_frag:lg,sprite_vert:dg,sprite_frag:hg},ae={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ue}},envmap:{envMap:{value:null},envMapRotation:{value:new Ue},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ue}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ue}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ue},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ue},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ue},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ue}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ue}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ue}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0},uvTransform:{value:new Ue}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}}},Ri={basic:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.fog]),vertexShader:Fe.meshbasic_vert,fragmentShader:Fe.meshbasic_frag},lambert:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Fe.meshlambert_vert,fragmentShader:Fe.meshlambert_frag},phong:{uniforms:Nt([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30}}]),vertexShader:Fe.meshphong_vert,fragmentShader:Fe.meshphong_frag},standard:{uniforms:Nt([ae.common,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.roughnessmap,ae.metalnessmap,ae.fog,ae.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag},toon:{uniforms:Nt([ae.common,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.gradientmap,ae.fog,ae.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Fe.meshtoon_vert,fragmentShader:Fe.meshtoon_frag},matcap:{uniforms:Nt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,{matcap:{value:null}}]),vertexShader:Fe.meshmatcap_vert,fragmentShader:Fe.meshmatcap_frag},points:{uniforms:Nt([ae.points,ae.fog]),vertexShader:Fe.points_vert,fragmentShader:Fe.points_frag},dashed:{uniforms:Nt([ae.common,ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Fe.linedashed_vert,fragmentShader:Fe.linedashed_frag},depth:{uniforms:Nt([ae.common,ae.displacementmap]),vertexShader:Fe.depth_vert,fragmentShader:Fe.depth_frag},normal:{uniforms:Nt([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,{opacity:{value:1}}]),vertexShader:Fe.meshnormal_vert,fragmentShader:Fe.meshnormal_frag},sprite:{uniforms:Nt([ae.sprite,ae.fog]),vertexShader:Fe.sprite_vert,fragmentShader:Fe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ue},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Fe.background_vert,fragmentShader:Fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ue}},vertexShader:Fe.backgroundCube_vert,fragmentShader:Fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Fe.cube_vert,fragmentShader:Fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Fe.equirect_vert,fragmentShader:Fe.equirect_frag},distanceRGBA:{uniforms:Nt([ae.common,ae.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Fe.distanceRGBA_vert,fragmentShader:Fe.distanceRGBA_frag},shadow:{uniforms:Nt([ae.lights,ae.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Fe.shadow_vert,fragmentShader:Fe.shadow_frag}};Ri.physical={uniforms:Nt([Ri.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ue},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ue},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ue},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ue},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ue},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ue},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ue},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ue},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ue},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ue},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ue},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ue}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag};var fo={r:0,b:0,g:0},kn=new xi,ug=new ot;function fg(n,e,t,i,s,r,a){let o=new Ce(0),c=r===!0?0:1,l,h,u=null,d=0,p=null;function g(w){let T=w.isScene===!0?w.background:null;return T&&T.isTexture&&(T=(w.backgroundBlurriness>0?t:e).get(T)),T}function x(w){let T=!1,E=g(w);E===null?f(o,c):E&&E.isColor&&(f(E,1),T=!0);let b=n.xr.getEnvironmentBlendMode();b==="additive"?i.buffers.color.setClear(0,0,0,1,a):b==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||T)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(w,T){let E=g(T);E&&(E.isCubeTexture||E.mapping===tr)?(h===void 0&&(h=new Tt(new kt(1,1,1),new ci({name:"BackgroundCubeMaterial",uniforms:On(Ri.backgroundCube.uniforms),vertexShader:Ri.backgroundCube.vertexShader,fragmentShader:Ri.backgroundCube.fragmentShader,side:zt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(b,C,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),kn.copy(T.backgroundRotation),kn.x*=-1,kn.y*=-1,kn.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(kn.y*=-1,kn.z*=-1),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(ug.makeRotationFromEuler(kn)),h.material.toneMapped=qe.getTransfer(E.colorSpace)!==Ze,(u!==E||d!==E.version||p!==n.toneMapping)&&(h.material.needsUpdate=!0,u=E,d=E.version,p=n.toneMapping),h.layers.enableAll(),w.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(l===void 0&&(l=new Tt(new Rn(2,2),new ci({name:"BackgroundMaterial",uniforms:On(Ri.background.uniforms),vertexShader:Ri.background.vertexShader,fragmentShader:Ri.background.fragmentShader,side:Hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=E,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=qe.getTransfer(E.colorSpace)!==Ze,E.matrixAutoUpdate===!0&&E.updateMatrix(),l.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||d!==E.version||p!==n.toneMapping)&&(l.material.needsUpdate=!0,u=E,d=E.version,p=n.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null))}function f(w,T){w.getRGB(fo,Jc(n)),i.buffers.color.setClear(fo.r,fo.g,fo.b,T,a)}function S(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(w,T=1){o.set(w),c=T,f(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(w){c=w,f(o,c)},render:x,addToRenderList:m,dispose:S}}function pg(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,a=!1;function o(v,I,N,k,V){let W=!1,X=u(k,N,I);r!==X&&(r=X,l(r.object)),W=p(v,k,N,V),W&&g(v,k,N,V),V!==null&&e.update(V,n.ELEMENT_ARRAY_BUFFER),(W||a)&&(a=!1,T(v,I,N,k),V!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function c(){return n.createVertexArray()}function l(v){return n.bindVertexArray(v)}function h(v){return n.deleteVertexArray(v)}function u(v,I,N){let k=N.wireframe===!0,V=i[v.id];V===void 0&&(V={},i[v.id]=V);let W=V[I.id];W===void 0&&(W={},V[I.id]=W);let X=W[k];return X===void 0&&(X=d(c()),W[k]=X),X}function d(v){let I=[],N=[],k=[];for(let V=0;V<t;V++)I[V]=0,N[V]=0,k[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:N,attributeDivisors:k,object:v,attributes:{},index:null}}function p(v,I,N,k){let V=r.attributes,W=I.attributes,X=0,te=N.getAttributes();for(let G in te)if(te[G].location>=0){let ee=V[G],Me=W[G];if(Me===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(Me=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(Me=v.instanceColor)),ee===void 0||ee.attribute!==Me||Me&&ee.data!==Me.data)return!0;X++}return r.attributesNum!==X||r.index!==k}function g(v,I,N,k){let V={},W=I.attributes,X=0,te=N.getAttributes();for(let G in te)if(te[G].location>=0){let ee=W[G];ee===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(ee=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(ee=v.instanceColor));let Me={};Me.attribute=ee,ee&&ee.data&&(Me.data=ee.data),V[G]=Me,X++}r.attributes=V,r.attributesNum=X,r.index=k}function x(){let v=r.newAttributes;for(let I=0,N=v.length;I<N;I++)v[I]=0}function m(v){f(v,0)}function f(v,I){let N=r.newAttributes,k=r.enabledAttributes,V=r.attributeDivisors;N[v]=1,k[v]===0&&(n.enableVertexAttribArray(v),k[v]=1),V[v]!==I&&(n.vertexAttribDivisor(v,I),V[v]=I)}function S(){let v=r.newAttributes,I=r.enabledAttributes;for(let N=0,k=I.length;N<k;N++)I[N]!==v[N]&&(n.disableVertexAttribArray(N),I[N]=0)}function w(v,I,N,k,V,W,X){X===!0?n.vertexAttribIPointer(v,I,N,V,W):n.vertexAttribPointer(v,I,N,k,V,W)}function T(v,I,N,k){x();let V=k.attributes,W=N.getAttributes(),X=I.defaultAttributeValues;for(let te in W){let G=W[te];if(G.location>=0){let Q=V[te];if(Q===void 0&&(te==="instanceMatrix"&&v.instanceMatrix&&(Q=v.instanceMatrix),te==="instanceColor"&&v.instanceColor&&(Q=v.instanceColor)),Q!==void 0){let ee=Q.normalized,Me=Q.itemSize,Xe=e.get(Q);if(Xe===void 0)continue;let Ke=Xe.buffer,st=Xe.type,rt=Xe.bytesPerElement,Y=st===n.INT||st===n.UNSIGNED_INT||Q.gpuType===Ra;if(Q.isInterleavedBufferAttribute){let J=Q.data,fe=J.stride,Ne=Q.offset;if(J.isInstancedInterleavedBuffer){for(let ve=0;ve<G.locationSize;ve++)f(G.location+ve,J.meshPerAttribute);v.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let ve=0;ve<G.locationSize;ve++)m(G.location+ve);n.bindBuffer(n.ARRAY_BUFFER,Ke);for(let ve=0;ve<G.locationSize;ve++)w(G.location+ve,Me/G.locationSize,st,ee,fe*rt,(Ne+Me/G.locationSize*ve)*rt,Y)}else{if(Q.isInstancedBufferAttribute){for(let J=0;J<G.locationSize;J++)f(G.location+J,Q.meshPerAttribute);v.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let J=0;J<G.locationSize;J++)m(G.location+J);n.bindBuffer(n.ARRAY_BUFFER,Ke);for(let J=0;J<G.locationSize;J++)w(G.location+J,Me/G.locationSize,st,ee,Me*rt,Me/G.locationSize*J*rt,Y)}}else if(X!==void 0){let ee=X[te];if(ee!==void 0)switch(ee.length){case 2:n.vertexAttrib2fv(G.location,ee);break;case 3:n.vertexAttrib3fv(G.location,ee);break;case 4:n.vertexAttrib4fv(G.location,ee);break;default:n.vertexAttrib1fv(G.location,ee)}}}}S()}function E(){D();for(let v in i){let I=i[v];for(let N in I){let k=I[N];for(let V in k)h(k[V].object),delete k[V];delete I[N]}delete i[v]}}function b(v){if(i[v.id]===void 0)return;let I=i[v.id];for(let N in I){let k=I[N];for(let V in k)h(k[V].object),delete k[V];delete I[N]}delete i[v.id]}function C(v){for(let I in i){let N=i[I];if(N[v.id]===void 0)continue;let k=N[v.id];for(let V in k)h(k[V].object),delete k[V];delete N[v.id]}}function D(){y(),a=!0,r!==s&&(r=s,l(r.object))}function y(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:D,resetDefaultState:y,dispose:E,releaseStatesOfGeometry:b,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:m,disableUnusedAttributes:S}}function mg(n,e,t){let i;function s(l){i=l}function r(l,h){n.drawArrays(i,l,h),t.update(h,i,1)}function a(l,h,u){u!==0&&(n.drawArraysInstanced(i,l,h,u),t.update(h,i,u))}function o(l,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];t.update(p,i,1)}function c(l,h,u,d){if(u===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<l.length;g++)a(l[g],h[g],d[g]);else{p.multiDrawArraysInstancedWEBGL(i,l,0,h,0,d,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*d[x];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function gg(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==li&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){let D=C===Fn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==_i&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==vi&&!D)}function c(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",h=c(l);h!==l&&(Re("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),f=n.getParameter(n.MAX_VERTEX_ATTRIBS),S=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),w=n.getParameter(n.MAX_VARYING_VECTORS),T=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=g>0,b=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:S,maxVaryings:w,maxFragmentUniforms:T,vertexTextures:E,maxSamples:b}}function xg(n){let e=this,t=null,i=0,s=!1,r=!1,a=new oi,o=new Ue,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||i!==0||s;return s=d,i=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,p){let g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,f=n.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{let S=r?0:i,w=S*4,T=f.clippingState||null;c.value=T,T=h(g,d,w,p);for(let E=0;E!==w;++E)T[E]=t[E];f.clippingState=T,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=S}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,d,p,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=c.value,g!==!0||m===null){let f=p+x*4,S=d.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<f)&&(m=new Float32Array(f));for(let w=0,T=p;w!==x;++w,T+=4)a.copy(u[w]).applyMatrix4(S,o),a.normal.toArray(m,T),m[T+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function _g(n){let e=new WeakMap;function t(a,o){return o===Aa?a.mapping=Nn:o===Ca&&(a.mapping=Un),a}function i(a){if(a&&a.isTexture){let o=a.mapping;if(o===Aa||o===Ca)if(e.has(a)){let c=e.get(a).texture;return t(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let l=new ia(c.height);return l.fromEquirectangularTexture(n,a),e.set(a,l),a.addEventListener("dispose",s),t(l.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}var un=4,Bh=[.125,.215,.35,.446,.526,.582],zn=20,vg=256,cr=new Ln,zh=new Ce,el=null,tl=0,il=0,nl=!1,yg=new F,mo=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=yg}=r;el=this._renderer.getRenderTarget(),tl=this._renderer.getActiveCubeFace(),il=this._renderer.getActiveMipmapLevel(),nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Gh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Hh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(el,tl,il),this._renderer.xr.enabled=nl,e.scissorTest=!1,ms(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Nn||e.mapping===Un?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),el=this._renderer.getRenderTarget(),tl=this._renderer.getActiveCubeFace(),il=this._renderer.getActiveMipmapLevel(),nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:ei,minFilter:ei,generateMipmaps:!1,type:Fn,format:li,colorSpace:An,depthBuffer:!1},s=Vh(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Vh(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=bg(r)),this._blurMaterial=Sg(r,e,t),this._ggxMaterial=Mg(r,e,t)}return s}_compileMaterial(e){let t=new Tt(new vt,e);this._renderer.compile(t,cr)}_sceneToCubeUV(e,t,i,s,r){let c=new Wt(90,1,t,i),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,p=u.toneMapping;u.getClearColor(zh),u.toneMapping=Yi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Tt(new kt,new Ot({name:"PMREM.Background",side:zt,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,f=!1,S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,f=!0):(m.color.copy(zh),f=!0);for(let w=0;w<6;w++){let T=w%3;T===0?(c.up.set(0,l[w],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[w],r.y,r.z)):T===1?(c.up.set(0,0,l[w]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[w],r.z)):(c.up.set(0,l[w],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[w]));let E=this._cubeSize;ms(s,T*E,w>2?E:0,E,E),u.setRenderTarget(s),f&&u.render(x,c),u.render(e,c)}u.toneMapping=p,u.autoClear=d,e.background=S}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===Nn||e.mapping===Un;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Gh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Hh());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;ms(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(a,cr)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let c=a.uniforms,l=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(l*l-h*h),d=.05+l*.95,p=u*d,{_lodMax:g}=this,x=this._sizeLods[i],m=3*x*(i>g-un?i-g+un:0),f=4*(this._cubeSize-x);c.envMap.value=e.texture,c.roughness.value=p,c.mipInt.value=g-t,ms(r,m,f,3*x,2*x),s.setRenderTarget(r),s.render(o,cr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-i,ms(e,m,f,3*x,2*x),s.setRenderTarget(e),s.render(o,cr)}_blur(e,t,i,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,a,o){let c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&ke("blur direction must be either latitudinal or longitudinal!");let h=3,u=this._lodMeshes[s];u.material=l;let d=l.uniforms,p=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*zn-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):zn;m>zn&&Re(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${zn}`);let f=[],S=0;for(let C=0;C<zn;++C){let D=C/x,y=Math.exp(-D*D/2);f.push(y),C===0?S+=y:C<m&&(S+=2*y)}for(let C=0;C<f.length;C++)f[C]=f[C]/S;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:w}=this;d.dTheta.value=g,d.mipInt.value=w-i;let T=this._sizeLods[s],E=3*T*(s>w-un?s-w+un:0),b=4*(this._cubeSize-T);ms(t,E,b,3*T,2*T),c.setRenderTarget(t),c.render(u,cr)}};function bg(n){let e=[],t=[],i=[],s=n,r=n-un+1+Bh.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let c=1/o;a>n-un?c=Bh[a-n+un-1]:a===0&&(c=0),t.push(c);let l=1/(o-2),h=-l,u=1+l,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,x=3,m=2,f=1,S=new Float32Array(x*g*p),w=new Float32Array(m*g*p),T=new Float32Array(f*g*p);for(let b=0;b<p;b++){let C=b%3*2/3-1,D=b>2?0:-1,y=[C,D,0,C+2/3,D,0,C+2/3,D+1,0,C,D,0,C+2/3,D+1,0,C,D+1,0];S.set(y,x*g*b),w.set(d,m*g*b);let v=[b,b,b,b,b,b];T.set(v,f*g*b)}let E=new vt;E.setAttribute("position",new It(S,x)),E.setAttribute("uv",new It(w,m)),E.setAttribute("faceIndex",new It(T,f)),i.push(new Tt(E,null)),s>un&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Vh(n,e,t){let i=new Ti(n,e,t);return i.texture.mapping=tr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ms(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Mg(n,e,t){return new ci({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:vg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:xo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Ci,depthTest:!1,depthWrite:!1})}function Sg(n,e,t){let i=new Float32Array(zn),s=new F(0,1,0);return new ci({name:"SphericalGaussianBlur",defines:{n:zn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ci,depthTest:!1,depthWrite:!1})}function Hh(){return new ci({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ci,depthTest:!1,depthWrite:!1})}function Gh(){return new ci({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ci,depthTest:!1,depthWrite:!1})}function xo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function wg(n){let e=new WeakMap,t=null;function i(o){if(o&&o.isTexture){let c=o.mapping,l=c===Aa||c===Ca,h=c===Nn||c===Un;if(l||h){let u=e.get(o),d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return t===null&&(t=new mo(n)),u=l?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{let p=o.image;return l&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new mo(n)),u=l?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let c=0,l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function r(o){let c=o.target;c.removeEventListener("dispose",r);let l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:a}}function Tg(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&rs("WebGLRenderer: "+i+" extension not supported."),s}}}function Eg(n,e,t,i){let s={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete s[d.id];let p=r.get(d);p&&(e.remove(p),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function c(u){let d=u.attributes;for(let p in d)e.update(d[p],n.ARRAY_BUFFER)}function l(u){let d=[],p=u.index,g=u.attributes.position,x=0;if(p!==null){let S=p.array;x=p.version;for(let w=0,T=S.length;w<T;w+=3){let E=S[w+0],b=S[w+1],C=S[w+2];d.push(E,b,b,C,C,E)}}else if(g!==void 0){let S=g.array;x=g.version;for(let w=0,T=S.length/3-1;w<T;w+=3){let E=w+0,b=w+1,C=w+2;d.push(E,b,b,C,C,E)}}else return;let m=new($c(d)?Bs:ks)(d,1);m.version=x;let f=r.get(u);f&&e.remove(f),r.set(u,m)}function h(u){let d=r.get(u);if(d){let p=u.index;p!==null&&d.version<p.version&&l(u)}else l(u);return r.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function Ag(n,e,t){let i;function s(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function c(d,p){n.drawElements(i,p,r,d*a),t.update(p,i,1)}function l(d,p,g){g!==0&&(n.drawElementsInstanced(i,p,r,d*a,g),t.update(p,i,g))}function h(d,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,r,d,0,g);let m=0;for(let f=0;f<g;f++)m+=p[f];t.update(m,i,1)}function u(d,p,g,x){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<d.length;f++)l(d[f]/a,p[f],x[f]);else{m.multiDrawElementsInstancedWEBGL(i,p,0,r,d,0,x,0,g);let f=0;for(let S=0;S<g;S++)f+=p[S]*x[S];t.update(f,i,1)}}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Cg(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:ke("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Ig(n,e,t){let i=new WeakMap,s=new pt;function r(a,o,c){let l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(o);if(d===void 0||d.count!==u){let y=function(){C.dispose(),i.delete(o),o.removeEventListener("dispose",y)};d!==void 0&&d.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],S=o.morphAttributes.color||[],w=0;p===!0&&(w=1),g===!0&&(w=2),x===!0&&(w=3);let T=o.attributes.position.count*w,E=1;T>e.maxTextureSize&&(E=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);let b=new Float32Array(T*E*4*u),C=new Os(b,T,E,u);C.type=vi,C.needsUpdate=!0;let D=w*4;for(let v=0;v<u;v++){let I=m[v],N=f[v],k=S[v],V=T*E*4*v;for(let W=0;W<I.count;W++){let X=W*D;p===!0&&(s.fromBufferAttribute(I,W),b[V+X+0]=s.x,b[V+X+1]=s.y,b[V+X+2]=s.z,b[V+X+3]=0),g===!0&&(s.fromBufferAttribute(N,W),b[V+X+4]=s.x,b[V+X+5]=s.y,b[V+X+6]=s.z,b[V+X+7]=0),x===!0&&(s.fromBufferAttribute(k,W),b[V+X+8]=s.x,b[V+X+9]=s.y,b[V+X+10]=s.z,b[V+X+11]=k.itemSize===4?s.w:1)}}d={count:u,texture:C,size:new Oe(T,E)},i.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let p=0;for(let x=0;x<l.length;x++)p+=l[x];let g=o.morphTargetsRelative?1:1-p;c.getUniforms().setValue(n,"morphTargetBaseInfluence",g),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function Rg(n,e,t,i){let s=new WeakMap;function r(c){let l=i.render.frame,h=c.geometry,u=e.get(c,h);if(s.get(u)!==l&&(e.update(u),s.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==l&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){let d=c.skeleton;s.get(d)!==l&&(d.update(),s.set(d,l))}return u}function a(){s=new WeakMap}function o(c){let l=c.target;l.removeEventListener("dispose",o),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:a}}var cu=new qt,Wh=new Xs(1,1),lu=new Os,du=new ea,hu=new Vs,Xh=[],qh=[],Yh=new Float32Array(16),$h=new Float32Array(9),Zh=new Float32Array(4);function xs(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Xh[s];if(r===void 0&&(r=new Float32Array(s),Xh[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Mt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function St(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function _o(n,e){let t=qh[e];t===void 0&&(t=new Int32Array(e),qh[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Pg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Dg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;n.uniform2fv(this.addr,e),St(t,e)}}function Lg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;n.uniform3fv(this.addr,e),St(t,e)}}function Ng(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;n.uniform4fv(this.addr,e),St(t,e)}}function Ug(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Mt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,i))return;Zh.set(i),n.uniformMatrix2fv(this.addr,!1,Zh),St(t,i)}}function Fg(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Mt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,i))return;$h.set(i),n.uniformMatrix3fv(this.addr,!1,$h),St(t,i)}}function Og(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Mt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,i))return;Yh.set(i),n.uniformMatrix4fv(this.addr,!1,Yh),St(t,i)}}function kg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Bg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;n.uniform2iv(this.addr,e),St(t,e)}}function zg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;n.uniform3iv(this.addr,e),St(t,e)}}function Vg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;n.uniform4iv(this.addr,e),St(t,e)}}function Hg(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Gg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;n.uniform2uiv(this.addr,e),St(t,e)}}function Wg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;n.uniform3uiv(this.addr,e),St(t,e)}}function Xg(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;n.uniform4uiv(this.addr,e),St(t,e)}}function qg(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Wh.compareFunction=qc,r=Wh):r=cu,t.setTexture2D(e||r,s)}function Yg(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||du,s)}function $g(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||hu,s)}function Zg(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||lu,s)}function Jg(n){switch(n){case 5126:return Pg;case 35664:return Dg;case 35665:return Lg;case 35666:return Ng;case 35674:return Ug;case 35675:return Fg;case 35676:return Og;case 5124:case 35670:return kg;case 35667:case 35671:return Bg;case 35668:case 35672:return zg;case 35669:case 35673:return Vg;case 5125:return Hg;case 36294:return Gg;case 36295:return Wg;case 36296:return Xg;case 35678:case 36198:case 36298:case 36306:case 35682:return qg;case 35679:case 36299:case 36307:return Yg;case 35680:case 36300:case 36308:case 36293:return $g;case 36289:case 36303:case 36311:case 36292:return Zg}}function Kg(n,e){n.uniform1fv(this.addr,e)}function jg(n,e){let t=xs(e,this.size,2);n.uniform2fv(this.addr,t)}function Qg(n,e){let t=xs(e,this.size,3);n.uniform3fv(this.addr,t)}function ex(n,e){let t=xs(e,this.size,4);n.uniform4fv(this.addr,t)}function tx(n,e){let t=xs(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function ix(n,e){let t=xs(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function nx(n,e){let t=xs(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function sx(n,e){n.uniform1iv(this.addr,e)}function rx(n,e){n.uniform2iv(this.addr,e)}function ax(n,e){n.uniform3iv(this.addr,e)}function ox(n,e){n.uniform4iv(this.addr,e)}function cx(n,e){n.uniform1uiv(this.addr,e)}function lx(n,e){n.uniform2uiv(this.addr,e)}function dx(n,e){n.uniform3uiv(this.addr,e)}function hx(n,e){n.uniform4uiv(this.addr,e)}function ux(n,e,t){let i=this.cache,s=e.length,r=_o(t,s);Mt(i,r)||(n.uniform1iv(this.addr,r),St(i,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||cu,r[a])}function fx(n,e,t){let i=this.cache,s=e.length,r=_o(t,s);Mt(i,r)||(n.uniform1iv(this.addr,r),St(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||du,r[a])}function px(n,e,t){let i=this.cache,s=e.length,r=_o(t,s);Mt(i,r)||(n.uniform1iv(this.addr,r),St(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||hu,r[a])}function mx(n,e,t){let i=this.cache,s=e.length,r=_o(t,s);Mt(i,r)||(n.uniform1iv(this.addr,r),St(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||lu,r[a])}function gx(n){switch(n){case 5126:return Kg;case 35664:return jg;case 35665:return Qg;case 35666:return ex;case 35674:return tx;case 35675:return ix;case 35676:return nx;case 5124:case 35670:return sx;case 35667:case 35671:return rx;case 35668:case 35672:return ax;case 35669:case 35673:return ox;case 5125:return cx;case 36294:return lx;case 36295:return dx;case 36296:return hx;case 35678:case 36198:case 36298:case 36306:case 35682:return ux;case 35679:case 36299:case 36307:return fx;case 35680:case 36300:case 36308:case 36293:return px;case 36289:case 36303:case 36311:case 36292:return mx}}var rl=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Jg(t.type)}},al=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=gx(t.type)}},ol=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},sl=/(\w+)(\])?(\[|\.)?/g;function Jh(n,e){n.seq.push(e),n.map[e.id]=e}function xx(n,e,t){let i=n.name,s=i.length;for(sl.lastIndex=0;;){let r=sl.exec(i),a=sl.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){Jh(t,l===void 0?new rl(o,n,e):new al(o,n,e));break}else{let u=t.map[o];u===void 0&&(u=new ol(o),Jh(t,u)),t=u}}}var gs=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);xx(r,a,this)}}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function Kh(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var _x=37297,vx=0;function yx(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}var jh=new Ue;function bx(n){qe._getMatrix(jh,qe.workingColorSpace,n);let e=`mat3( ${jh.elements.map(t=>t.toFixed(4))} )`;switch(qe.getTransfer(n)){case Ns:return[e,"LinearTransferOETF"];case Ze:return[e,"sRGBTransferOETF"];default:return Re("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Qh(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+yx(n.getShaderSource(e),o)}else return r}function Mx(n,e){let t=bx(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Sx(n,e){let t;switch(e){case gh:t="Linear";break;case xh:t="Reinhard";break;case _h:t="Cineon";break;case vh:t="ACESFilmic";break;case bh:t="AgX";break;case Mh:t="Neutral";break;case yh:t="Custom";break;default:Re("WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var po=new F;function wx(){qe.getLuminanceCoefficients(po);let n=po.x.toFixed(4),e=po.y.toFixed(4),t=po.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Tx(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(lr).join(`
`)}function Ex(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Ax(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function lr(n){return n!==""}function eu(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function tu(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Cx=/^[ \t]*#include +<([\w\d./]+)>/gm;function cl(n){return n.replace(Cx,Rx)}var Ix=new Map;function Rx(n,e){let t=Fe[e];if(t===void 0){let i=Ix.get(e);if(i!==void 0)t=Fe[i],Re('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return cl(t)}var Px=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function iu(n){return n.replace(Px,Dx)}function Dx(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function nu(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Lx(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Nc?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Zd?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Ai&&(e="SHADOWMAP_TYPE_VSM"),e}function Nx(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Nn:case Un:e="ENVMAP_TYPE_CUBE";break;case tr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Ux(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Un:e="ENVMAP_MODE_REFRACTION";break}return e}function Fx(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Ea:e="ENVMAP_BLENDING_MULTIPLY";break;case ph:e="ENVMAP_BLENDING_MIX";break;case mh:e="ENVMAP_BLENDING_ADD";break}return e}function Ox(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function kx(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=Lx(t),l=Nx(t),h=Ux(t),u=Fx(t),d=Ox(t),p=Tx(t),g=Ex(r),x=s.createProgram(),m,f,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(lr).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(lr).join(`
`),f.length>0&&(f+=`
`)):(m=[nu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(lr).join(`
`),f=[nu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Yi?"#define TONE_MAPPING":"",t.toneMapping!==Yi?Fe.tonemapping_pars_fragment:"",t.toneMapping!==Yi?Sx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Fe.colorspace_pars_fragment,Mx("linearToOutputTexel",t.outputColorSpace),wx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(lr).join(`
`)),a=cl(a),a=eu(a,t),a=tu(a,t),o=cl(o),o=eu(o,t),o=tu(o,t),a=iu(a),o=iu(o),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Yc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Yc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let w=S+m+a,T=S+f+o,E=Kh(s,s.VERTEX_SHADER,w),b=Kh(s,s.FRAGMENT_SHADER,T);s.attachShader(x,E),s.attachShader(x,b),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function C(I){if(n.debug.checkShaderErrors){let N=s.getProgramInfoLog(x)||"",k=s.getShaderInfoLog(E)||"",V=s.getShaderInfoLog(b)||"",W=N.trim(),X=k.trim(),te=V.trim(),G=!0,Q=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(G=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,E,b);else{let ee=Qh(s,E,"vertex"),Me=Qh(s,b,"fragment");ke("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+W+`
`+ee+`
`+Me)}else W!==""?Re("WebGLProgram: Program Info Log:",W):(X===""||te==="")&&(Q=!1);Q&&(I.diagnostics={runnable:G,programLog:W,vertexShader:{log:X,prefix:m},fragmentShader:{log:te,prefix:f}})}s.deleteShader(E),s.deleteShader(b),D=new gs(s,x),y=Ax(s,x)}let D;this.getUniforms=function(){return D===void 0&&C(this),D};let y;this.getAttributes=function(){return y===void 0&&C(this),y};let v=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(x,_x)),v},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=vx++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=b,this}var Bx=0,ll=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new dl(e),t.set(e,i)),i}},dl=class{constructor(e){this.id=Bx++,this.code=e,this.usedTimes=0}};function zx(n,e,t,i,s,r,a){let o=new cs,c=new ll,l=new Set,h=[],u=s.logarithmicDepthBuffer,d=s.vertexTextures,p=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(y){return l.add(y),y===0?"uv":`uv${y}`}function m(y,v,I,N,k){let V=N.fog,W=k.geometry,X=y.isMeshStandardMaterial?N.environment:null,te=(y.isMeshStandardMaterial?t:e).get(y.envMap||X),G=te&&te.mapping===tr?te.image.height:null,Q=g[y.type];y.precision!==null&&(p=s.getMaxPrecision(y.precision),p!==y.precision&&Re("WebGLProgram.getParameters:",y.precision,"not supported, using",p,"instead."));let ee=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,Me=ee!==void 0?ee.length:0,Xe=0;W.morphAttributes.position!==void 0&&(Xe=1),W.morphAttributes.normal!==void 0&&(Xe=2),W.morphAttributes.color!==void 0&&(Xe=3);let Ke,st,rt,Y;if(Q){let je=Ri[Q];Ke=je.vertexShader,st=je.fragmentShader}else Ke=y.vertexShader,st=y.fragmentShader,c.update(y),rt=c.getVertexShaderID(y),Y=c.getFragmentShaderID(y);let J=n.getRenderTarget(),fe=n.state.buffers.depth.getReversed(),Ne=k.isInstancedMesh===!0,ve=k.isBatchedMesh===!0,ze=!!y.map,At=!!y.matcap,Be=!!te,dt=!!y.aoMap,R=!!y.lightMap,Ve=!!y.bumpMap,He=!!y.normalMap,at=!!y.displacementMap,ge=!!y.emissiveMap,ht=!!y.metalnessMap,be=!!y.roughnessMap,Le=y.anisotropy>0,A=y.clearcoat>0,_=y.dispersion>0,O=y.iridescence>0,q=y.sheen>0,Z=y.transmission>0,H=Le&&!!y.anisotropyMap,_e=A&&!!y.clearcoatMap,oe=A&&!!y.clearcoatNormalMap,Se=A&&!!y.clearcoatRoughnessMap,xe=O&&!!y.iridescenceMap,K=O&&!!y.iridescenceThicknessMap,ne=q&&!!y.sheenColorMap,Ae=q&&!!y.sheenRoughnessMap,Te=!!y.specularMap,de=!!y.specularColorMap,Pe=!!y.specularIntensityMap,P=Z&&!!y.transmissionMap,ce=Z&&!!y.thicknessMap,se=!!y.gradientMap,re=!!y.alphaMap,j=y.alphaTest>0,$=!!y.alphaHash,pe=!!y.extensions,De=Yi;y.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(De=n.toneMapping);let ct={shaderID:Q,shaderType:y.type,shaderName:y.name,vertexShader:Ke,fragmentShader:st,defines:y.defines,customVertexShaderID:rt,customFragmentShaderID:Y,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:p,batching:ve,batchingColor:ve&&k._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&k.instanceColor!==null,instancingMorph:Ne&&k.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:J===null?n.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:An,alphaToCoverage:!!y.alphaToCoverage,map:ze,matcap:At,envMap:Be,envMapMode:Be&&te.mapping,envMapCubeUVHeight:G,aoMap:dt,lightMap:R,bumpMap:Ve,normalMap:He,displacementMap:d&&at,emissiveMap:ge,normalMapObjectSpace:He&&y.normalMapType===Eh,normalMapTangentSpace:He&&y.normalMapType===Xc,metalnessMap:ht,roughnessMap:be,anisotropy:Le,anisotropyMap:H,clearcoat:A,clearcoatMap:_e,clearcoatNormalMap:oe,clearcoatRoughnessMap:Se,dispersion:_,iridescence:O,iridescenceMap:xe,iridescenceThicknessMap:K,sheen:q,sheenColorMap:ne,sheenRoughnessMap:Ae,specularMap:Te,specularColorMap:de,specularIntensityMap:Pe,transmission:Z,transmissionMap:P,thicknessMap:ce,gradientMap:se,opaque:y.transparent===!1&&y.blending===Tn&&y.alphaToCoverage===!1,alphaMap:re,alphaTest:j,alphaHash:$,combine:y.combine,mapUv:ze&&x(y.map.channel),aoMapUv:dt&&x(y.aoMap.channel),lightMapUv:R&&x(y.lightMap.channel),bumpMapUv:Ve&&x(y.bumpMap.channel),normalMapUv:He&&x(y.normalMap.channel),displacementMapUv:at&&x(y.displacementMap.channel),emissiveMapUv:ge&&x(y.emissiveMap.channel),metalnessMapUv:ht&&x(y.metalnessMap.channel),roughnessMapUv:be&&x(y.roughnessMap.channel),anisotropyMapUv:H&&x(y.anisotropyMap.channel),clearcoatMapUv:_e&&x(y.clearcoatMap.channel),clearcoatNormalMapUv:oe&&x(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&x(y.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&x(y.iridescenceMap.channel),iridescenceThicknessMapUv:K&&x(y.iridescenceThicknessMap.channel),sheenColorMapUv:ne&&x(y.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&x(y.sheenRoughnessMap.channel),specularMapUv:Te&&x(y.specularMap.channel),specularColorMapUv:de&&x(y.specularColorMap.channel),specularIntensityMapUv:Pe&&x(y.specularIntensityMap.channel),transmissionMapUv:P&&x(y.transmissionMap.channel),thicknessMapUv:ce&&x(y.thicknessMap.channel),alphaMapUv:re&&x(y.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(He||Le),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!W.attributes.uv&&(ze||re),fog:!!V,useFog:y.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:y.flatShading===!0&&y.wireframe===!1,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:fe,skinning:k.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:Me,morphTextureStride:Xe,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&I.length>0,shadowMapType:n.shadowMap.type,toneMapping:De,decodeVideoTexture:ze&&y.map.isVideoTexture===!0&&qe.getTransfer(y.map.colorSpace)===Ze,decodeVideoTextureEmissive:ge&&y.emissiveMap.isVideoTexture===!0&&qe.getTransfer(y.emissiveMap.colorSpace)===Ze,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Lt,flipSided:y.side===zt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:pe&&y.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(pe&&y.extensions.multiDraw===!0||ve)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return ct.vertexUv1s=l.has(1),ct.vertexUv2s=l.has(2),ct.vertexUv3s=l.has(3),l.clear(),ct}function f(y){let v=[];if(y.shaderID?v.push(y.shaderID):(v.push(y.customVertexShaderID),v.push(y.customFragmentShaderID)),y.defines!==void 0)for(let I in y.defines)v.push(I),v.push(y.defines[I]);return y.isRawShaderMaterial===!1&&(S(v,y),w(v,y),v.push(n.outputColorSpace)),v.push(y.customProgramCacheKey),v.join()}function S(y,v){y.push(v.precision),y.push(v.outputColorSpace),y.push(v.envMapMode),y.push(v.envMapCubeUVHeight),y.push(v.mapUv),y.push(v.alphaMapUv),y.push(v.lightMapUv),y.push(v.aoMapUv),y.push(v.bumpMapUv),y.push(v.normalMapUv),y.push(v.displacementMapUv),y.push(v.emissiveMapUv),y.push(v.metalnessMapUv),y.push(v.roughnessMapUv),y.push(v.anisotropyMapUv),y.push(v.clearcoatMapUv),y.push(v.clearcoatNormalMapUv),y.push(v.clearcoatRoughnessMapUv),y.push(v.iridescenceMapUv),y.push(v.iridescenceThicknessMapUv),y.push(v.sheenColorMapUv),y.push(v.sheenRoughnessMapUv),y.push(v.specularMapUv),y.push(v.specularColorMapUv),y.push(v.specularIntensityMapUv),y.push(v.transmissionMapUv),y.push(v.thicknessMapUv),y.push(v.combine),y.push(v.fogExp2),y.push(v.sizeAttenuation),y.push(v.morphTargetsCount),y.push(v.morphAttributeCount),y.push(v.numDirLights),y.push(v.numPointLights),y.push(v.numSpotLights),y.push(v.numSpotLightMaps),y.push(v.numHemiLights),y.push(v.numRectAreaLights),y.push(v.numDirLightShadows),y.push(v.numPointLightShadows),y.push(v.numSpotLightShadows),y.push(v.numSpotLightShadowsWithMaps),y.push(v.numLightProbes),y.push(v.shadowMapType),y.push(v.toneMapping),y.push(v.numClippingPlanes),y.push(v.numClipIntersection),y.push(v.depthPacking)}function w(y,v){o.disableAll(),v.supportsVertexTextures&&o.enable(0),v.instancing&&o.enable(1),v.instancingColor&&o.enable(2),v.instancingMorph&&o.enable(3),v.matcap&&o.enable(4),v.envMap&&o.enable(5),v.normalMapObjectSpace&&o.enable(6),v.normalMapTangentSpace&&o.enable(7),v.clearcoat&&o.enable(8),v.iridescence&&o.enable(9),v.alphaTest&&o.enable(10),v.vertexColors&&o.enable(11),v.vertexAlphas&&o.enable(12),v.vertexUv1s&&o.enable(13),v.vertexUv2s&&o.enable(14),v.vertexUv3s&&o.enable(15),v.vertexTangents&&o.enable(16),v.anisotropy&&o.enable(17),v.alphaHash&&o.enable(18),v.batching&&o.enable(19),v.dispersion&&o.enable(20),v.batchingColor&&o.enable(21),v.gradientMap&&o.enable(22),y.push(o.mask),o.disableAll(),v.fog&&o.enable(0),v.useFog&&o.enable(1),v.flatShading&&o.enable(2),v.logarithmicDepthBuffer&&o.enable(3),v.reversedDepthBuffer&&o.enable(4),v.skinning&&o.enable(5),v.morphTargets&&o.enable(6),v.morphNormals&&o.enable(7),v.morphColors&&o.enable(8),v.premultipliedAlpha&&o.enable(9),v.shadowMapEnabled&&o.enable(10),v.doubleSided&&o.enable(11),v.flipSided&&o.enable(12),v.useDepthPacking&&o.enable(13),v.dithering&&o.enable(14),v.transmission&&o.enable(15),v.sheen&&o.enable(16),v.opaque&&o.enable(17),v.pointsUvs&&o.enable(18),v.decodeVideoTexture&&o.enable(19),v.decodeVideoTextureEmissive&&o.enable(20),v.alphaToCoverage&&o.enable(21),y.push(o.mask)}function T(y){let v=g[y.type],I;if(v){let N=Ri[v];I=Oh.clone(N.uniforms)}else I=y.uniforms;return I}function E(y,v){let I;for(let N=0,k=h.length;N<k;N++){let V=h[N];if(V.cacheKey===v){I=V,++I.usedTimes;break}}return I===void 0&&(I=new kx(n,v,y,r),h.push(I)),I}function b(y){if(--y.usedTimes===0){let v=h.indexOf(y);h[v]=h[h.length-1],h.pop(),y.destroy()}}function C(y){c.remove(y)}function D(){c.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:T,acquireProgram:E,releaseProgram:b,releaseShaderCache:C,programs:h,dispose:D}}function Vx(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,c){n.get(a)[o]=c}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function Hx(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function su(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function ru(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(u,d,p,g,x,m){let f=n[e];return f===void 0?(f={id:u.id,object:u,geometry:d,material:p,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},n[e]=f):(f.id=u.id,f.object=u,f.geometry=d,f.material=p,f.groupOrder=g,f.renderOrder=u.renderOrder,f.z=x,f.group=m),e++,f}function o(u,d,p,g,x,m){let f=a(u,d,p,g,x,m);p.transmission>0?i.push(f):p.transparent===!0?s.push(f):t.push(f)}function c(u,d,p,g,x,m){let f=a(u,d,p,g,x,m);p.transmission>0?i.unshift(f):p.transparent===!0?s.unshift(f):t.unshift(f)}function l(u,d){t.length>1&&t.sort(u||Hx),i.length>1&&i.sort(d||su),s.length>1&&s.sort(d||su)}function h(){for(let u=e,d=n.length;u<d;u++){let p=n[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:o,unshift:c,finish:h,sort:l}}function Gx(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new ru,n.set(i,[a])):s>=r.length?(a=new ru,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function Wx(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new F,color:new Ce};break;case"SpotLight":t={position:new F,direction:new F,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new F,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new F,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new F,halfWidth:new F,halfHeight:new F};break}return n[e.id]=t,t}}}function Xx(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var qx=0;function Yx(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function $x(n){let e=new Wx,t=Xx(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new F);let s=new F,r=new ot,a=new ot;function o(l){let h=0,u=0,d=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let p=0,g=0,x=0,m=0,f=0,S=0,w=0,T=0,E=0,b=0,C=0;l.sort(Yx);for(let y=0,v=l.length;y<v;y++){let I=l[y],N=I.color,k=I.intensity,V=I.distance,W=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=N.r*k,u+=N.g*k,d+=N.b*k;else if(I.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(I.sh.coefficients[X],k);C++}else if(I.isDirectionalLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let te=I.shadow,G=t.get(I);G.shadowIntensity=te.intensity,G.shadowBias=te.bias,G.shadowNormalBias=te.normalBias,G.shadowRadius=te.radius,G.shadowMapSize=te.mapSize,i.directionalShadow[p]=G,i.directionalShadowMap[p]=W,i.directionalShadowMatrix[p]=I.shadow.matrix,S++}i.directional[p]=X,p++}else if(I.isSpotLight){let X=e.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(N).multiplyScalar(k),X.distance=V,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,i.spot[x]=X;let te=I.shadow;if(I.map&&(i.spotLightMap[E]=I.map,E++,te.updateMatrices(I),I.castShadow&&b++),i.spotLightMatrix[x]=te.matrix,I.castShadow){let G=t.get(I);G.shadowIntensity=te.intensity,G.shadowBias=te.bias,G.shadowNormalBias=te.normalBias,G.shadowRadius=te.radius,G.shadowMapSize=te.mapSize,i.spotShadow[x]=G,i.spotShadowMap[x]=W,T++}x++}else if(I.isRectAreaLight){let X=e.get(I);X.color.copy(N).multiplyScalar(k),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),i.rectArea[m]=X,m++}else if(I.isPointLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){let te=I.shadow,G=t.get(I);G.shadowIntensity=te.intensity,G.shadowBias=te.bias,G.shadowNormalBias=te.normalBias,G.shadowRadius=te.radius,G.shadowMapSize=te.mapSize,G.shadowCameraNear=te.camera.near,G.shadowCameraFar=te.camera.far,i.pointShadow[g]=G,i.pointShadowMap[g]=W,i.pointShadowMatrix[g]=I.shadow.matrix,w++}i.point[g]=X,g++}else if(I.isHemisphereLight){let X=e.get(I);X.skyColor.copy(I.color).multiplyScalar(k),X.groundColor.copy(I.groundColor).multiplyScalar(k),i.hemi[f]=X,f++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ae.LTC_FLOAT_1,i.rectAreaLTC2=ae.LTC_FLOAT_2):(i.rectAreaLTC1=ae.LTC_HALF_1,i.rectAreaLTC2=ae.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let D=i.hash;(D.directionalLength!==p||D.pointLength!==g||D.spotLength!==x||D.rectAreaLength!==m||D.hemiLength!==f||D.numDirectionalShadows!==S||D.numPointShadows!==w||D.numSpotShadows!==T||D.numSpotMaps!==E||D.numLightProbes!==C)&&(i.directional.length=p,i.spot.length=x,i.rectArea.length=m,i.point.length=g,i.hemi.length=f,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.pointShadow.length=w,i.pointShadowMap.length=w,i.spotShadow.length=T,i.spotShadowMap.length=T,i.directionalShadowMatrix.length=S,i.pointShadowMatrix.length=w,i.spotLightMatrix.length=T+E-b,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=b,i.numLightProbes=C,D.directionalLength=p,D.pointLength=g,D.spotLength=x,D.rectAreaLength=m,D.hemiLength=f,D.numDirectionalShadows=S,D.numPointShadows=w,D.numSpotShadows=T,D.numSpotMaps=E,D.numLightProbes=C,i.version=qx++)}function c(l,h){let u=0,d=0,p=0,g=0,x=0,m=h.matrixWorldInverse;for(let f=0,S=l.length;f<S;f++){let w=l[f];if(w.isDirectionalLight){let T=i.directional[u];T.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),u++}else if(w.isSpotLight){let T=i.spot[p];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(m),T.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(m),p++}else if(w.isRectAreaLight){let T=i.rectArea[g];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(m),a.identity(),r.copy(w.matrixWorld),r.premultiply(m),a.extractRotation(r),T.halfWidth.set(w.width*.5,0,0),T.halfHeight.set(0,w.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),g++}else if(w.isPointLight){let T=i.point[d];T.position.setFromMatrixPosition(w.matrixWorld),T.position.applyMatrix4(m),d++}else if(w.isHemisphereLight){let T=i.hemi[x];T.direction.setFromMatrixPosition(w.matrixWorld),T.direction.transformDirection(m),x++}}}return{setup:o,setupView:c,state:i}}function au(n){let e=new $x(n),t=[],i=[];function s(h){l.camera=h,t.length=0,i.length=0}function r(h){t.push(h)}function a(h){i.push(h)}function o(){e.setup(t)}function c(h){e.setupView(t,h)}let l={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:o,setupLightsView:c,pushLight:r,pushShadow:a}}function Zx(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new au(n),e.set(s,[o])):r>=a.length?(o=new au(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var Jx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Kx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function jx(n,e,t){let i=new ds,s=new Oe,r=new Oe,a=new pt,o=new oa({depthPacking:Th}),c=new ca,l={},h=t.maxTextureSize,u={[Hi]:zt,[zt]:Hi,[Lt]:Lt},d=new ci({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:Jx,fragmentShader:Kx}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let g=new vt;g.setAttribute("position",new It(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Tt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nc;let f=this.type;this.render=function(b,C,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;let y=n.getRenderTarget(),v=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),N=n.state;N.setBlending(Ci),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let k=f!==Ai&&this.type===Ai,V=f===Ai&&this.type!==Ai;for(let W=0,X=b.length;W<X;W++){let te=b[W],G=te.shadow;if(G===void 0){Re("WebGLShadowMap:",te,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let Q=G.getFrameExtents();if(s.multiply(Q),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/Q.x),s.x=r.x*Q.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/Q.y),s.y=r.y*Q.y,G.mapSize.y=r.y)),G.map===null||k===!0||V===!0){let Me=this.type!==Ai?{minFilter:Xt,magFilter:Xt}:{};G.map!==null&&G.map.dispose(),G.map=new Ti(s.x,s.y,Me),G.map.texture.name=te.name+".shadowMap",G.camera.updateProjectionMatrix()}n.setRenderTarget(G.map),n.clear();let ee=G.getViewportCount();for(let Me=0;Me<ee;Me++){let Xe=G.getViewport(Me);a.set(r.x*Xe.x,r.y*Xe.y,r.x*Xe.z,r.y*Xe.w),N.viewport(a),G.updateMatrices(te,Me),i=G.getFrustum(),T(C,D,G.camera,te,this.type)}G.isPointLightShadow!==!0&&this.type===Ai&&S(G,D),G.needsUpdate=!1}f=this.type,m.needsUpdate=!1,n.setRenderTarget(y,v,I)};function S(b,C){let D=e.update(x);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,p.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new Ti(s.x,s.y)),d.uniforms.shadow_pass.value=b.map.texture,d.uniforms.resolution.value=b.mapSize,d.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(C,null,D,d,x,null),p.uniforms.shadow_pass.value=b.mapPass.texture,p.uniforms.resolution.value=b.mapSize,p.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(C,null,D,p,x,null)}function w(b,C,D,y){let v=null,I=D.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(I!==void 0)v=I;else if(v=D.isPointLight===!0?c:o,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let N=v.uuid,k=C.uuid,V=l[N];V===void 0&&(V={},l[N]=V);let W=V[k];W===void 0&&(W=v.clone(),V[k]=W,C.addEventListener("dispose",E)),v=W}if(v.visible=C.visible,v.wireframe=C.wireframe,y===Ai?v.side=C.shadowSide!==null?C.shadowSide:C.side:v.side=C.shadowSide!==null?C.shadowSide:u[C.side],v.alphaMap=C.alphaMap,v.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,v.map=C.map,v.clipShadows=C.clipShadows,v.clippingPlanes=C.clippingPlanes,v.clipIntersection=C.clipIntersection,v.displacementMap=C.displacementMap,v.displacementScale=C.displacementScale,v.displacementBias=C.displacementBias,v.wireframeLinewidth=C.wireframeLinewidth,v.linewidth=C.linewidth,D.isPointLight===!0&&v.isMeshDistanceMaterial===!0){let N=n.properties.get(v);N.light=D}return v}function T(b,C,D,y,v){if(b.visible===!1)return;if(b.layers.test(C.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&v===Ai)&&(!b.frustumCulled||i.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,b.matrixWorld);let k=e.update(b),V=b.material;if(Array.isArray(V)){let W=k.groups;for(let X=0,te=W.length;X<te;X++){let G=W[X],Q=V[G.materialIndex];if(Q&&Q.visible){let ee=w(b,Q,y,v);b.onBeforeShadow(n,b,C,D,k,ee,G),n.renderBufferDirect(D,null,k,ee,b,G),b.onAfterShadow(n,b,C,D,k,ee,G)}}}else if(V.visible){let W=w(b,V,y,v);b.onBeforeShadow(n,b,C,D,k,W,null),n.renderBufferDirect(D,null,k,W,b,null),b.onAfterShadow(n,b,C,D,k,W,null)}}let N=b.children;for(let k=0,V=N.length;k<V;k++)T(N[k],C,D,y,v)}function E(b){b.target.removeEventListener("dispose",E);for(let D in l){let y=l[D],v=b.target.uuid;v in y&&(y[v].dispose(),delete y[v])}}}var Qx={[va]:ya,[ba]:wa,[Ma]:Ta,[En]:Sa,[ya]:va,[wa]:ba,[Ta]:Ma,[Sa]:En};function e_(n,e){function t(){let P=!1,ce=new pt,se=null,re=new pt(0,0,0,0);return{setMask:function(j){se!==j&&!P&&(n.colorMask(j,j,j,j),se=j)},setLocked:function(j){P=j},setClear:function(j,$,pe,De,ct){ct===!0&&(j*=De,$*=De,pe*=De),ce.set(j,$,pe,De),re.equals(ce)===!1&&(n.clearColor(j,$,pe,De),re.copy(ce))},reset:function(){P=!1,se=null,re.set(-1,0,0,0)}}}function i(){let P=!1,ce=!1,se=null,re=null,j=null;return{setReversed:function($){if(ce!==$){let pe=e.get("EXT_clip_control");$?pe.clipControlEXT(pe.LOWER_LEFT_EXT,pe.ZERO_TO_ONE_EXT):pe.clipControlEXT(pe.LOWER_LEFT_EXT,pe.NEGATIVE_ONE_TO_ONE_EXT),ce=$;let De=j;j=null,this.setClear(De)}},getReversed:function(){return ce},setTest:function($){$?J(n.DEPTH_TEST):fe(n.DEPTH_TEST)},setMask:function($){se!==$&&!P&&(n.depthMask($),se=$)},setFunc:function($){if(ce&&($=Qx[$]),re!==$){switch($){case va:n.depthFunc(n.NEVER);break;case ya:n.depthFunc(n.ALWAYS);break;case ba:n.depthFunc(n.LESS);break;case En:n.depthFunc(n.LEQUAL);break;case Ma:n.depthFunc(n.EQUAL);break;case Sa:n.depthFunc(n.GEQUAL);break;case wa:n.depthFunc(n.GREATER);break;case Ta:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}re=$}},setLocked:function($){P=$},setClear:function($){j!==$&&(ce&&($=1-$),n.clearDepth($),j=$)},reset:function(){P=!1,se=null,re=null,j=null,ce=!1}}}function s(){let P=!1,ce=null,se=null,re=null,j=null,$=null,pe=null,De=null,ct=null;return{setTest:function(je){P||(je?J(n.STENCIL_TEST):fe(n.STENCIL_TEST))},setMask:function(je){ce!==je&&!P&&(n.stencilMask(je),ce=je)},setFunc:function(je,bi,di){(se!==je||re!==bi||j!==di)&&(n.stencilFunc(je,bi,di),se=je,re=bi,j=di)},setOp:function(je,bi,di){($!==je||pe!==bi||De!==di)&&(n.stencilOp(je,bi,di),$=je,pe=bi,De=di)},setLocked:function(je){P=je},setClear:function(je){ct!==je&&(n.clearStencil(je),ct=je)},reset:function(){P=!1,ce=null,se=null,re=null,j=null,$=null,pe=null,De=null,ct=null}}}let r=new t,a=new i,o=new s,c=new WeakMap,l=new WeakMap,h={},u={},d=new WeakMap,p=[],g=null,x=!1,m=null,f=null,S=null,w=null,T=null,E=null,b=null,C=new Ce(0,0,0),D=0,y=!1,v=null,I=null,N=null,k=null,V=null,W=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,te=0,G=n.getParameter(n.VERSION);G.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(G)[1]),X=te>=1):G.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),X=te>=2);let Q=null,ee={},Me=n.getParameter(n.SCISSOR_BOX),Xe=n.getParameter(n.VIEWPORT),Ke=new pt().fromArray(Me),st=new pt().fromArray(Xe);function rt(P,ce,se,re){let j=new Uint8Array(4),$=n.createTexture();n.bindTexture(P,$),n.texParameteri(P,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(P,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let pe=0;pe<se;pe++)P===n.TEXTURE_3D||P===n.TEXTURE_2D_ARRAY?n.texImage3D(ce,0,n.RGBA,1,1,re,0,n.RGBA,n.UNSIGNED_BYTE,j):n.texImage2D(ce+pe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,j);return $}let Y={};Y[n.TEXTURE_2D]=rt(n.TEXTURE_2D,n.TEXTURE_2D,1),Y[n.TEXTURE_CUBE_MAP]=rt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[n.TEXTURE_2D_ARRAY]=rt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Y[n.TEXTURE_3D]=rt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),J(n.DEPTH_TEST),a.setFunc(En),Ve(!1),He(Lc),J(n.CULL_FACE),dt(Ci);function J(P){h[P]!==!0&&(n.enable(P),h[P]=!0)}function fe(P){h[P]!==!1&&(n.disable(P),h[P]=!1)}function Ne(P,ce){return u[P]!==ce?(n.bindFramebuffer(P,ce),u[P]=ce,P===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=ce),P===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=ce),!0):!1}function ve(P,ce){let se=p,re=!1;if(P){se=d.get(ce),se===void 0&&(se=[],d.set(ce,se));let j=P.textures;if(se.length!==j.length||se[0]!==n.COLOR_ATTACHMENT0){for(let $=0,pe=j.length;$<pe;$++)se[$]=n.COLOR_ATTACHMENT0+$;se.length=j.length,re=!0}}else se[0]!==n.BACK&&(se[0]=n.BACK,re=!0);re&&n.drawBuffers(se)}function ze(P){return g!==P?(n.useProgram(P),g=P,!0):!1}let At={[on]:n.FUNC_ADD,[Kd]:n.FUNC_SUBTRACT,[jd]:n.FUNC_REVERSE_SUBTRACT};At[Qd]=n.MIN,At[eh]=n.MAX;let Be={[th]:n.ZERO,[ih]:n.ONE,[nh]:n.SRC_COLOR,[qr]:n.SRC_ALPHA,[lh]:n.SRC_ALPHA_SATURATE,[oh]:n.DST_COLOR,[rh]:n.DST_ALPHA,[sh]:n.ONE_MINUS_SRC_COLOR,[Yr]:n.ONE_MINUS_SRC_ALPHA,[ch]:n.ONE_MINUS_DST_COLOR,[ah]:n.ONE_MINUS_DST_ALPHA,[dh]:n.CONSTANT_COLOR,[hh]:n.ONE_MINUS_CONSTANT_COLOR,[uh]:n.CONSTANT_ALPHA,[fh]:n.ONE_MINUS_CONSTANT_ALPHA};function dt(P,ce,se,re,j,$,pe,De,ct,je){if(P===Ci){x===!0&&(fe(n.BLEND),x=!1);return}if(x===!1&&(J(n.BLEND),x=!0),P!==Jd){if(P!==m||je!==y){if((f!==on||T!==on)&&(n.blendEquation(n.FUNC_ADD),f=on,T=on),je)switch(P){case Tn:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Uc:n.blendFunc(n.ONE,n.ONE);break;case Fc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Oc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:ke("WebGLState: Invalid blending: ",P);break}else switch(P){case Tn:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Uc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Fc:ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Oc:ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ke("WebGLState: Invalid blending: ",P);break}S=null,w=null,E=null,b=null,C.set(0,0,0),D=0,m=P,y=je}return}j=j||ce,$=$||se,pe=pe||re,(ce!==f||j!==T)&&(n.blendEquationSeparate(At[ce],At[j]),f=ce,T=j),(se!==S||re!==w||$!==E||pe!==b)&&(n.blendFuncSeparate(Be[se],Be[re],Be[$],Be[pe]),S=se,w=re,E=$,b=pe),(De.equals(C)===!1||ct!==D)&&(n.blendColor(De.r,De.g,De.b,ct),C.copy(De),D=ct),m=P,y=!1}function R(P,ce){P.side===Lt?fe(n.CULL_FACE):J(n.CULL_FACE);let se=P.side===zt;ce&&(se=!se),Ve(se),P.blending===Tn&&P.transparent===!1?dt(Ci):dt(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),a.setFunc(P.depthFunc),a.setTest(P.depthTest),a.setMask(P.depthWrite),r.setMask(P.colorWrite);let re=P.stencilWrite;o.setTest(re),re&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),ge(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?J(n.SAMPLE_ALPHA_TO_COVERAGE):fe(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ve(P){v!==P&&(P?n.frontFace(n.CW):n.frontFace(n.CCW),v=P)}function He(P){P!==Yd?(J(n.CULL_FACE),P!==I&&(P===Lc?n.cullFace(n.BACK):P===$d?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):fe(n.CULL_FACE),I=P}function at(P){P!==N&&(X&&n.lineWidth(P),N=P)}function ge(P,ce,se){P?(J(n.POLYGON_OFFSET_FILL),(k!==ce||V!==se)&&(n.polygonOffset(ce,se),k=ce,V=se)):fe(n.POLYGON_OFFSET_FILL)}function ht(P){P?J(n.SCISSOR_TEST):fe(n.SCISSOR_TEST)}function be(P){P===void 0&&(P=n.TEXTURE0+W-1),Q!==P&&(n.activeTexture(P),Q=P)}function Le(P,ce,se){se===void 0&&(Q===null?se=n.TEXTURE0+W-1:se=Q);let re=ee[se];re===void 0&&(re={type:void 0,texture:void 0},ee[se]=re),(re.type!==P||re.texture!==ce)&&(Q!==se&&(n.activeTexture(se),Q=se),n.bindTexture(P,ce||Y[P]),re.type=P,re.texture=ce)}function A(){let P=ee[Q];P!==void 0&&P.type!==void 0&&(n.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function _(){try{n.compressedTexImage2D(...arguments)}catch(P){P("WebGLState:",P)}}function O(){try{n.compressedTexImage3D(...arguments)}catch(P){P("WebGLState:",P)}}function q(){try{n.texSubImage2D(...arguments)}catch(P){P("WebGLState:",P)}}function Z(){try{n.texSubImage3D(...arguments)}catch(P){P("WebGLState:",P)}}function H(){try{n.compressedTexSubImage2D(...arguments)}catch(P){P("WebGLState:",P)}}function _e(){try{n.compressedTexSubImage3D(...arguments)}catch(P){P("WebGLState:",P)}}function oe(){try{n.texStorage2D(...arguments)}catch(P){P("WebGLState:",P)}}function Se(){try{n.texStorage3D(...arguments)}catch(P){P("WebGLState:",P)}}function xe(){try{n.texImage2D(...arguments)}catch(P){P("WebGLState:",P)}}function K(){try{n.texImage3D(...arguments)}catch(P){P("WebGLState:",P)}}function ne(P){Ke.equals(P)===!1&&(n.scissor(P.x,P.y,P.z,P.w),Ke.copy(P))}function Ae(P){st.equals(P)===!1&&(n.viewport(P.x,P.y,P.z,P.w),st.copy(P))}function Te(P,ce){let se=l.get(ce);se===void 0&&(se=new WeakMap,l.set(ce,se));let re=se.get(P);re===void 0&&(re=n.getUniformBlockIndex(ce,P.name),se.set(P,re))}function de(P,ce){let re=l.get(ce).get(P);c.get(ce)!==re&&(n.uniformBlockBinding(ce,re,P.__bindingPointIndex),c.set(ce,re))}function Pe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},Q=null,ee={},u={},d=new WeakMap,p=[],g=null,x=!1,m=null,f=null,S=null,w=null,T=null,E=null,b=null,C=new Ce(0,0,0),D=0,y=!1,v=null,I=null,N=null,k=null,V=null,Ke.set(0,0,n.canvas.width,n.canvas.height),st.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:J,disable:fe,bindFramebuffer:Ne,drawBuffers:ve,useProgram:ze,setBlending:dt,setMaterial:R,setFlipSided:Ve,setCullFace:He,setLineWidth:at,setPolygonOffset:ge,setScissorTest:ht,activeTexture:be,bindTexture:Le,unbindTexture:A,compressedTexImage2D:_,compressedTexImage3D:O,texImage2D:xe,texImage3D:K,updateUBOMapping:Te,uniformBlockBinding:de,texStorage2D:oe,texStorage3D:Se,texSubImage2D:q,texSubImage3D:Z,compressedTexSubImage2D:H,compressedTexSubImage3D:_e,scissor:ne,viewport:Ae,reset:Pe}}function t_(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Oe,h=new WeakMap,u,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,_){return p?new OffscreenCanvas(A,_):Fs("canvas")}function x(A,_,O){let q=1,Z=Le(A);if((Z.width>O||Z.height>O)&&(q=O/Math.max(Z.width,Z.height)),q<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let H=Math.floor(q*Z.width),_e=Math.floor(q*Z.height);u===void 0&&(u=g(H,_e));let oe=_?g(H,_e):u;return oe.width=H,oe.height=_e,oe.getContext("2d").drawImage(A,0,0,H,_e),Re("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+H+"x"+_e+")."),oe}else return"data"in A&&Re("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),A;return A}function m(A){return A.generateMipmaps}function f(A){n.generateMipmap(A)}function S(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function w(A,_,O,q,Z=!1){if(A!==null){if(n[A]!==void 0)return n[A];Re("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let H=_;if(_===n.RED&&(O===n.FLOAT&&(H=n.R32F),O===n.HALF_FLOAT&&(H=n.R16F),O===n.UNSIGNED_BYTE&&(H=n.R8)),_===n.RED_INTEGER&&(O===n.UNSIGNED_BYTE&&(H=n.R8UI),O===n.UNSIGNED_SHORT&&(H=n.R16UI),O===n.UNSIGNED_INT&&(H=n.R32UI),O===n.BYTE&&(H=n.R8I),O===n.SHORT&&(H=n.R16I),O===n.INT&&(H=n.R32I)),_===n.RG&&(O===n.FLOAT&&(H=n.RG32F),O===n.HALF_FLOAT&&(H=n.RG16F),O===n.UNSIGNED_BYTE&&(H=n.RG8)),_===n.RG_INTEGER&&(O===n.UNSIGNED_BYTE&&(H=n.RG8UI),O===n.UNSIGNED_SHORT&&(H=n.RG16UI),O===n.UNSIGNED_INT&&(H=n.RG32UI),O===n.BYTE&&(H=n.RG8I),O===n.SHORT&&(H=n.RG16I),O===n.INT&&(H=n.RG32I)),_===n.RGB_INTEGER&&(O===n.UNSIGNED_BYTE&&(H=n.RGB8UI),O===n.UNSIGNED_SHORT&&(H=n.RGB16UI),O===n.UNSIGNED_INT&&(H=n.RGB32UI),O===n.BYTE&&(H=n.RGB8I),O===n.SHORT&&(H=n.RGB16I),O===n.INT&&(H=n.RGB32I)),_===n.RGBA_INTEGER&&(O===n.UNSIGNED_BYTE&&(H=n.RGBA8UI),O===n.UNSIGNED_SHORT&&(H=n.RGBA16UI),O===n.UNSIGNED_INT&&(H=n.RGBA32UI),O===n.BYTE&&(H=n.RGBA8I),O===n.SHORT&&(H=n.RGBA16I),O===n.INT&&(H=n.RGBA32I)),_===n.RGB&&(O===n.UNSIGNED_INT_5_9_9_9_REV&&(H=n.RGB9_E5),O===n.UNSIGNED_INT_10F_11F_11F_REV&&(H=n.R11F_G11F_B10F)),_===n.RGBA){let _e=Z?Ns:qe.getTransfer(q);O===n.FLOAT&&(H=n.RGBA32F),O===n.HALF_FLOAT&&(H=n.RGBA16F),O===n.UNSIGNED_BYTE&&(H=_e===Ze?n.SRGB8_ALPHA8:n.RGBA8),O===n.UNSIGNED_SHORT_4_4_4_4&&(H=n.RGBA4),O===n.UNSIGNED_SHORT_5_5_5_1&&(H=n.RGB5_A1)}return(H===n.R16F||H===n.R32F||H===n.RG16F||H===n.RG32F||H===n.RGBA16F||H===n.RGBA32F)&&e.get("EXT_color_buffer_float"),H}function T(A,_){let O;return A?_===null||_===hn||_===fs?O=n.DEPTH24_STENCIL8:_===vi?O=n.DEPTH32F_STENCIL8:_===us&&(O=n.DEPTH24_STENCIL8,Re("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===hn||_===fs?O=n.DEPTH_COMPONENT24:_===vi?O=n.DEPTH_COMPONENT32F:_===us&&(O=n.DEPTH_COMPONENT16),O}function E(A,_){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==Xt&&A.minFilter!==ei?Math.log2(Math.max(_.width,_.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?_.mipmaps.length:1}function b(A){let _=A.target;_.removeEventListener("dispose",b),D(_),_.isVideoTexture&&h.delete(_)}function C(A){let _=A.target;_.removeEventListener("dispose",C),v(_)}function D(A){let _=i.get(A);if(_.__webglInit===void 0)return;let O=A.source,q=d.get(O);if(q){let Z=q[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&y(A),Object.keys(q).length===0&&d.delete(O)}i.remove(A)}function y(A){let _=i.get(A);n.deleteTexture(_.__webglTexture);let O=A.source,q=d.get(O);delete q[_.__cacheKey],a.memory.textures--}function v(A){let _=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(_.__webglFramebuffer[q]))for(let Z=0;Z<_.__webglFramebuffer[q].length;Z++)n.deleteFramebuffer(_.__webglFramebuffer[q][Z]);else n.deleteFramebuffer(_.__webglFramebuffer[q]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[q])}else{if(Array.isArray(_.__webglFramebuffer))for(let q=0;q<_.__webglFramebuffer.length;q++)n.deleteFramebuffer(_.__webglFramebuffer[q]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let q=0;q<_.__webglColorRenderbuffer.length;q++)_.__webglColorRenderbuffer[q]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[q]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let O=A.textures;for(let q=0,Z=O.length;q<Z;q++){let H=i.get(O[q]);H.__webglTexture&&(n.deleteTexture(H.__webglTexture),a.memory.textures--),i.remove(O[q])}i.remove(A)}let I=0;function N(){I=0}function k(){let A=I;return A>=s.maxTextures&&Re("WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),I+=1,A}function V(A){let _=[];return _.push(A.wrapS),_.push(A.wrapT),_.push(A.wrapR||0),_.push(A.magFilter),_.push(A.minFilter),_.push(A.anisotropy),_.push(A.internalFormat),_.push(A.format),_.push(A.type),_.push(A.generateMipmaps),_.push(A.premultiplyAlpha),_.push(A.flipY),_.push(A.unpackAlignment),_.push(A.colorSpace),_.join()}function W(A,_){let O=i.get(A);if(A.isVideoTexture&&ht(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&O.__version!==A.version){let q=A.image;if(q===null)Re("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)Re("WebGLRenderer: Texture marked for update but image is incomplete");else{Y(O,A,_);return}}else A.isExternalTexture&&(O.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,O.__webglTexture,n.TEXTURE0+_)}function X(A,_){let O=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&O.__version!==A.version){Y(O,A,_);return}else A.isExternalTexture&&(O.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,O.__webglTexture,n.TEXTURE0+_)}function te(A,_){let O=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&O.__version!==A.version){Y(O,A,_);return}t.bindTexture(n.TEXTURE_3D,O.__webglTexture,n.TEXTURE0+_)}function G(A,_){let O=i.get(A);if(A.version>0&&O.__version!==A.version){J(O,A,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+_)}let Q={[$r]:n.REPEAT,[wi]:n.CLAMP_TO_EDGE,[Zr]:n.MIRRORED_REPEAT},ee={[Xt]:n.NEAREST,[Sh]:n.NEAREST_MIPMAP_NEAREST,[ir]:n.NEAREST_MIPMAP_LINEAR,[ei]:n.LINEAR,[Ia]:n.LINEAR_MIPMAP_NEAREST,[dn]:n.LINEAR_MIPMAP_LINEAR},Me={[Ah]:n.NEVER,[Lh]:n.ALWAYS,[Ch]:n.LESS,[qc]:n.LEQUAL,[Ih]:n.EQUAL,[Dh]:n.GEQUAL,[Rh]:n.GREATER,[Ph]:n.NOTEQUAL};function Xe(A,_){if(_.type===vi&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===ei||_.magFilter===Ia||_.magFilter===ir||_.magFilter===dn||_.minFilter===ei||_.minFilter===Ia||_.minFilter===ir||_.minFilter===dn)&&Re("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,Q[_.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,Q[_.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,Q[_.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,ee[_.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,ee[_.minFilter]),_.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,Me[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Xt||_.minFilter!==ir&&_.minFilter!==dn||_.type===vi&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");n.texParameterf(A,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function Ke(A,_){let O=!1;A.__webglInit===void 0&&(A.__webglInit=!0,_.addEventListener("dispose",b));let q=_.source,Z=d.get(q);Z===void 0&&(Z={},d.set(q,Z));let H=V(_);if(H!==A.__cacheKey){Z[H]===void 0&&(Z[H]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,O=!0),Z[H].usedTimes++;let _e=Z[A.__cacheKey];_e!==void 0&&(Z[A.__cacheKey].usedTimes--,_e.usedTimes===0&&y(_)),A.__cacheKey=H,A.__webglTexture=Z[H].texture}return O}function st(A,_,O){return Math.floor(Math.floor(A/O)/_)}function rt(A,_,O,q){let H=A.updateRanges;if(H.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,O,q,_.data);else{H.sort((K,ne)=>K.start-ne.start);let _e=0;for(let K=1;K<H.length;K++){let ne=H[_e],Ae=H[K],Te=ne.start+ne.count,de=st(Ae.start,_.width,4),Pe=st(ne.start,_.width,4);Ae.start<=Te+1&&de===Pe&&st(Ae.start+Ae.count-1,_.width,4)===de?ne.count=Math.max(ne.count,Ae.start+Ae.count-ne.start):(++_e,H[_e]=Ae)}H.length=_e+1;let oe=n.getParameter(n.UNPACK_ROW_LENGTH),Se=n.getParameter(n.UNPACK_SKIP_PIXELS),xe=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let K=0,ne=H.length;K<ne;K++){let Ae=H[K],Te=Math.floor(Ae.start/4),de=Math.ceil(Ae.count/4),Pe=Te%_.width,P=Math.floor(Te/_.width),ce=de,se=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Pe),n.pixelStorei(n.UNPACK_SKIP_ROWS,P),t.texSubImage2D(n.TEXTURE_2D,0,Pe,P,ce,se,O,q,_.data)}A.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,oe),n.pixelStorei(n.UNPACK_SKIP_PIXELS,Se),n.pixelStorei(n.UNPACK_SKIP_ROWS,xe)}}function Y(A,_,O){let q=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(q=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(q=n.TEXTURE_3D);let Z=Ke(A,_),H=_.source;t.bindTexture(q,A.__webglTexture,n.TEXTURE0+O);let _e=i.get(H);if(H.version!==_e.__version||Z===!0){t.activeTexture(n.TEXTURE0+O);let oe=qe.getPrimaries(qe.workingColorSpace),Se=_.colorSpace===$i?null:qe.getPrimaries(_.colorSpace),xe=_.colorSpace===$i||oe===Se?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);let K=x(_.image,!1,s.maxTextureSize);K=be(_,K);let ne=r.convert(_.format,_.colorSpace),Ae=r.convert(_.type),Te=w(_.internalFormat,ne,Ae,_.colorSpace,_.isVideoTexture);Xe(q,_);let de,Pe=_.mipmaps,P=_.isVideoTexture!==!0,ce=_e.__version===void 0||Z===!0,se=H.dataReady,re=E(_,K);if(_.isDepthTexture)Te=T(_.format===ps,_.type),ce&&(P?t.texStorage2D(n.TEXTURE_2D,1,Te,K.width,K.height):t.texImage2D(n.TEXTURE_2D,0,Te,K.width,K.height,0,ne,Ae,null));else if(_.isDataTexture)if(Pe.length>0){P&&ce&&t.texStorage2D(n.TEXTURE_2D,re,Te,Pe[0].width,Pe[0].height);for(let j=0,$=Pe.length;j<$;j++)de=Pe[j],P?se&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,de.width,de.height,ne,Ae,de.data):t.texImage2D(n.TEXTURE_2D,j,Te,de.width,de.height,0,ne,Ae,de.data);_.generateMipmaps=!1}else P?(ce&&t.texStorage2D(n.TEXTURE_2D,re,Te,K.width,K.height),se&&rt(_,K,ne,Ae)):t.texImage2D(n.TEXTURE_2D,0,Te,K.width,K.height,0,ne,Ae,K.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){P&&ce&&t.texStorage3D(n.TEXTURE_2D_ARRAY,re,Te,Pe[0].width,Pe[0].height,K.depth);for(let j=0,$=Pe.length;j<$;j++)if(de=Pe[j],_.format!==li)if(ne!==null)if(P){if(se)if(_.layerUpdates.size>0){let pe=Qc(de.width,de.height,_.format,_.type);for(let De of _.layerUpdates){let ct=de.data.subarray(De*pe/de.data.BYTES_PER_ELEMENT,(De+1)*pe/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,De,de.width,de.height,1,ne,ct)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,de.width,de.height,K.depth,ne,de.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,j,Te,de.width,de.height,K.depth,0,de.data,0,0);else Re("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else P?se&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,de.width,de.height,K.depth,ne,Ae,de.data):t.texImage3D(n.TEXTURE_2D_ARRAY,j,Te,de.width,de.height,K.depth,0,ne,Ae,de.data)}else{P&&ce&&t.texStorage2D(n.TEXTURE_2D,re,Te,Pe[0].width,Pe[0].height);for(let j=0,$=Pe.length;j<$;j++)de=Pe[j],_.format!==li?ne!==null?P?se&&t.compressedTexSubImage2D(n.TEXTURE_2D,j,0,0,de.width,de.height,ne,de.data):t.compressedTexImage2D(n.TEXTURE_2D,j,Te,de.width,de.height,0,de.data):Re("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):P?se&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,de.width,de.height,ne,Ae,de.data):t.texImage2D(n.TEXTURE_2D,j,Te,de.width,de.height,0,ne,Ae,de.data)}else if(_.isDataArrayTexture)if(P){if(ce&&t.texStorage3D(n.TEXTURE_2D_ARRAY,re,Te,K.width,K.height,K.depth),se)if(_.layerUpdates.size>0){let j=Qc(K.width,K.height,_.format,_.type);for(let $ of _.layerUpdates){let pe=K.data.subarray($*j/K.data.BYTES_PER_ELEMENT,($+1)*j/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,$,K.width,K.height,1,ne,Ae,pe)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,ne,Ae,K.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Te,K.width,K.height,K.depth,0,ne,Ae,K.data);else if(_.isData3DTexture)P?(ce&&t.texStorage3D(n.TEXTURE_3D,re,Te,K.width,K.height,K.depth),se&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,ne,Ae,K.data)):t.texImage3D(n.TEXTURE_3D,0,Te,K.width,K.height,K.depth,0,ne,Ae,K.data);else if(_.isFramebufferTexture){if(ce)if(P)t.texStorage2D(n.TEXTURE_2D,re,Te,K.width,K.height);else{let j=K.width,$=K.height;for(let pe=0;pe<re;pe++)t.texImage2D(n.TEXTURE_2D,pe,Te,j,$,0,ne,Ae,null),j>>=1,$>>=1}}else if(Pe.length>0){if(P&&ce){let j=Le(Pe[0]);t.texStorage2D(n.TEXTURE_2D,re,Te,j.width,j.height)}for(let j=0,$=Pe.length;j<$;j++)de=Pe[j],P?se&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,ne,Ae,de):t.texImage2D(n.TEXTURE_2D,j,Te,ne,Ae,de);_.generateMipmaps=!1}else if(P){if(ce){let j=Le(K);t.texStorage2D(n.TEXTURE_2D,re,Te,j.width,j.height)}se&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ne,Ae,K)}else t.texImage2D(n.TEXTURE_2D,0,Te,ne,Ae,K);m(_)&&f(q),_e.__version=H.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function J(A,_,O){if(_.image.length!==6)return;let q=Ke(A,_),Z=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+O);let H=i.get(Z);if(Z.version!==H.__version||q===!0){t.activeTexture(n.TEXTURE0+O);let _e=qe.getPrimaries(qe.workingColorSpace),oe=_.colorSpace===$i?null:qe.getPrimaries(_.colorSpace),Se=_.colorSpace===$i||_e===oe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);let xe=_.isCompressedTexture||_.image[0].isCompressedTexture,K=_.image[0]&&_.image[0].isDataTexture,ne=[];for(let $=0;$<6;$++)!xe&&!K?ne[$]=x(_.image[$],!0,s.maxCubemapSize):ne[$]=K?_.image[$].image:_.image[$],ne[$]=be(_,ne[$]);let Ae=ne[0],Te=r.convert(_.format,_.colorSpace),de=r.convert(_.type),Pe=w(_.internalFormat,Te,de,_.colorSpace),P=_.isVideoTexture!==!0,ce=H.__version===void 0||q===!0,se=Z.dataReady,re=E(_,Ae);Xe(n.TEXTURE_CUBE_MAP,_);let j;if(xe){P&&ce&&t.texStorage2D(n.TEXTURE_CUBE_MAP,re,Pe,Ae.width,Ae.height);for(let $=0;$<6;$++){j=ne[$].mipmaps;for(let pe=0;pe<j.length;pe++){let De=j[pe];_.format!==li?Te!==null?P?se&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe,0,0,De.width,De.height,Te,De.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe,Pe,De.width,De.height,0,De.data):Re("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):P?se&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe,0,0,De.width,De.height,Te,de,De.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe,Pe,De.width,De.height,0,Te,de,De.data)}}}else{if(j=_.mipmaps,P&&ce){j.length>0&&re++;let $=Le(ne[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,re,Pe,$.width,$.height)}for(let $=0;$<6;$++)if(K){P?se&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,ne[$].width,ne[$].height,Te,de,ne[$].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Pe,ne[$].width,ne[$].height,0,Te,de,ne[$].data);for(let pe=0;pe<j.length;pe++){let ct=j[pe].image[$].image;P?se&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe+1,0,0,ct.width,ct.height,Te,de,ct.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe+1,Pe,ct.width,ct.height,0,Te,de,ct.data)}}else{P?se&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Te,de,ne[$]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,Pe,Te,de,ne[$]);for(let pe=0;pe<j.length;pe++){let De=j[pe];P?se&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe+1,0,0,Te,de,De.image[$]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+$,pe+1,Pe,Te,de,De.image[$])}}}m(_)&&f(n.TEXTURE_CUBE_MAP),H.__version=Z.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function fe(A,_,O,q,Z,H){let _e=r.convert(O.format,O.colorSpace),oe=r.convert(O.type),Se=w(O.internalFormat,_e,oe,O.colorSpace),xe=i.get(_),K=i.get(O);if(K.__renderTarget=_,!xe.__hasExternalTextures){let ne=Math.max(1,_.width>>H),Ae=Math.max(1,_.height>>H);Z===n.TEXTURE_3D||Z===n.TEXTURE_2D_ARRAY?t.texImage3D(Z,H,Se,ne,Ae,_.depth,0,_e,oe,null):t.texImage2D(Z,H,Se,ne,Ae,0,_e,oe,null)}t.bindFramebuffer(n.FRAMEBUFFER,A),ge(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,q,Z,K.__webglTexture,0,at(_)):(Z===n.TEXTURE_2D||Z>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,q,Z,K.__webglTexture,H),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ne(A,_,O){if(n.bindRenderbuffer(n.RENDERBUFFER,A),_.depthBuffer){let q=_.depthTexture,Z=q&&q.isDepthTexture?q.type:null,H=T(_.stencilBuffer,Z),_e=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,oe=at(_);ge(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,oe,H,_.width,_.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,oe,H,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,H,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,_e,n.RENDERBUFFER,A)}else{let q=_.textures;for(let Z=0;Z<q.length;Z++){let H=q[Z],_e=r.convert(H.format,H.colorSpace),oe=r.convert(H.type),Se=w(H.internalFormat,_e,oe,H.colorSpace),xe=at(_);O&&ge(_)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,xe,Se,_.width,_.height):ge(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,xe,Se,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,Se,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ve(A,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,A),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let q=i.get(_.depthTexture);q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),W(_.depthTexture,0);let Z=q.__webglTexture,H=at(_);if(_.depthTexture.format===ns)ge(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Z,0,H):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Z,0);else if(_.depthTexture.format===ps)ge(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Z,0,H):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function ze(A){let _=i.get(A),O=A.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==A.depthTexture){let q=A.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),q){let Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,q.removeEventListener("dispose",Z)};q.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=q}if(A.depthTexture&&!_.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");let q=A.texture.mipmaps;q&&q.length>0?ve(_.__webglFramebuffer[0],A):ve(_.__webglFramebuffer,A)}else if(O){_.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[q]),_.__webglDepthbuffer[q]===void 0)_.__webglDepthbuffer[q]=n.createRenderbuffer(),Ne(_.__webglDepthbuffer[q],A,!1);else{let Z=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,H=_.__webglDepthbuffer[q];n.bindRenderbuffer(n.RENDERBUFFER,H),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,H)}}else{let q=A.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),Ne(_.__webglDepthbuffer,A,!1);else{let Z=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,H=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,H),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,H)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function At(A,_,O){let q=i.get(A);_!==void 0&&fe(q.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),O!==void 0&&ze(A)}function Be(A){let _=A.texture,O=i.get(A),q=i.get(_);A.addEventListener("dispose",C);let Z=A.textures,H=A.isWebGLCubeRenderTarget===!0,_e=Z.length>1;if(_e||(q.__webglTexture===void 0&&(q.__webglTexture=n.createTexture()),q.__version=_.version,a.memory.textures++),H){O.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer[oe]=[];for(let Se=0;Se<_.mipmaps.length;Se++)O.__webglFramebuffer[oe][Se]=n.createFramebuffer()}else O.__webglFramebuffer[oe]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer=[];for(let oe=0;oe<_.mipmaps.length;oe++)O.__webglFramebuffer[oe]=n.createFramebuffer()}else O.__webglFramebuffer=n.createFramebuffer();if(_e)for(let oe=0,Se=Z.length;oe<Se;oe++){let xe=i.get(Z[oe]);xe.__webglTexture===void 0&&(xe.__webglTexture=n.createTexture(),a.memory.textures++)}if(A.samples>0&&ge(A)===!1){O.__webglMultisampledFramebuffer=n.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let oe=0;oe<Z.length;oe++){let Se=Z[oe];O.__webglColorRenderbuffer[oe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,O.__webglColorRenderbuffer[oe]);let xe=r.convert(Se.format,Se.colorSpace),K=r.convert(Se.type),ne=w(Se.internalFormat,xe,K,Se.colorSpace,A.isXRRenderTarget===!0),Ae=at(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ae,ne,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.RENDERBUFFER,O.__webglColorRenderbuffer[oe])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(O.__webglDepthRenderbuffer=n.createRenderbuffer(),Ne(O.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(H){t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),Xe(n.TEXTURE_CUBE_MAP,_);for(let oe=0;oe<6;oe++)if(_.mipmaps&&_.mipmaps.length>0)for(let Se=0;Se<_.mipmaps.length;Se++)fe(O.__webglFramebuffer[oe][Se],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,Se);else fe(O.__webglFramebuffer[oe],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);m(_)&&f(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(_e){for(let oe=0,Se=Z.length;oe<Se;oe++){let xe=Z[oe],K=i.get(xe),ne=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ne=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ne,K.__webglTexture),Xe(ne,xe),fe(O.__webglFramebuffer,A,xe,n.COLOR_ATTACHMENT0+oe,ne,0),m(xe)&&f(ne)}t.unbindTexture()}else{let oe=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(oe=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(oe,q.__webglTexture),Xe(oe,_),_.mipmaps&&_.mipmaps.length>0)for(let Se=0;Se<_.mipmaps.length;Se++)fe(O.__webglFramebuffer[Se],A,_,n.COLOR_ATTACHMENT0,oe,Se);else fe(O.__webglFramebuffer,A,_,n.COLOR_ATTACHMENT0,oe,0);m(_)&&f(oe),t.unbindTexture()}A.depthBuffer&&ze(A)}function dt(A){let _=A.textures;for(let O=0,q=_.length;O<q;O++){let Z=_[O];if(m(Z)){let H=S(A),_e=i.get(Z).__webglTexture;t.bindTexture(H,_e),f(H),t.unbindTexture()}}}let R=[],Ve=[];function He(A){if(A.samples>0){if(ge(A)===!1){let _=A.textures,O=A.width,q=A.height,Z=n.COLOR_BUFFER_BIT,H=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,_e=i.get(A),oe=_.length>1;if(oe)for(let xe=0;xe<_.length;xe++)t.bindFramebuffer(n.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,_e.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,_e.__webglMultisampledFramebuffer);let Se=A.texture.mipmaps;Se&&Se.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,_e.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,_e.__webglFramebuffer);for(let xe=0;xe<_.length;xe++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(Z|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(Z|=n.STENCIL_BUFFER_BIT)),oe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,_e.__webglColorRenderbuffer[xe]);let K=i.get(_[xe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,K,0)}n.blitFramebuffer(0,0,O,q,0,0,O,q,Z,n.NEAREST),c===!0&&(R.length=0,Ve.length=0,R.push(n.COLOR_ATTACHMENT0+xe),A.depthBuffer&&A.resolveDepthBuffer===!1&&(R.push(H),Ve.push(H),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ve)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,R))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),oe)for(let xe=0;xe<_.length;xe++){t.bindFramebuffer(n.FRAMEBUFFER,_e.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.RENDERBUFFER,_e.__webglColorRenderbuffer[xe]);let K=i.get(_[xe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,_e.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+xe,n.TEXTURE_2D,K,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,_e.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&c){let _=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function at(A){return Math.min(s.maxSamples,A.samples)}function ge(A){let _=i.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function ht(A){let _=a.render.frame;h.get(A)!==_&&(h.set(A,_),A.update())}function be(A,_){let O=A.colorSpace,q=A.format,Z=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||O!==An&&O!==$i&&(qe.getTransfer(O)===Ze?(q!==li||Z!==_i)&&Re("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ke("WebGLTextures: Unsupported texture color space:",O)),_}function Le(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(l.width=A.naturalWidth||A.width,l.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(l.width=A.displayWidth,l.height=A.displayHeight):(l.width=A.width,l.height=A.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=N,this.setTexture2D=W,this.setTexture2DArray=X,this.setTexture3D=te,this.setTextureCube=G,this.rebindTextures=At,this.setupRenderTarget=Be,this.updateRenderTargetMipmap=dt,this.updateMultisampleRenderTarget=He,this.setupDepthRenderbuffer=ze,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=ge}function i_(n,e){function t(i,s=$i){let r,a=qe.getTransfer(s);if(i===_i)return n.UNSIGNED_BYTE;if(i===Pa)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Da)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Vc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Hc)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Bc)return n.BYTE;if(i===zc)return n.SHORT;if(i===us)return n.UNSIGNED_SHORT;if(i===Ra)return n.INT;if(i===hn)return n.UNSIGNED_INT;if(i===vi)return n.FLOAT;if(i===Fn)return n.HALF_FLOAT;if(i===Gc)return n.ALPHA;if(i===Wc)return n.RGB;if(i===li)return n.RGBA;if(i===ns)return n.DEPTH_COMPONENT;if(i===ps)return n.DEPTH_STENCIL;if(i===La)return n.RED;if(i===Na)return n.RED_INTEGER;if(i===Ua)return n.RG;if(i===Fa)return n.RG_INTEGER;if(i===Oa)return n.RGBA_INTEGER;if(i===nr||i===sr||i===rr||i===ar)if(a===Ze)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===nr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===sr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===rr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ar)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===nr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===sr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===rr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ar)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===ka||i===Ba||i===za||i===Va)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===ka)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ba)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===za)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Va)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ha||i===Ga||i===Wa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ha||i===Ga)return a===Ze?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Wa)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Xa||i===qa||i===Ya||i===$a||i===Za||i===Ja||i===Ka||i===ja||i===Qa||i===eo||i===to||i===io||i===no||i===so)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Xa)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===qa)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ya)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===$a)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Za)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ja)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ka)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ja)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Qa)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===eo)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===to)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===io)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===no)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===so)return a===Ze?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ro||i===ao||i===oo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===ro)return a===Ze?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ao)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===oo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===co||i===lo||i===ho||i===uo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===co)return r.COMPRESSED_RED_RGTC1_EXT;if(i===lo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ho)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===uo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===fs?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var n_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,s_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,hl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new qs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new ci({vertexShader:n_,fragmentShader:s_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Tt(new Rn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ul=class extends Gi{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,d=null,p=null,g=null,x=typeof XRWebGLBinding<"u",m=new hl,f={},S=t.getContextAttributes(),w=null,T=null,E=[],b=[],C=new Oe,D=null,y=new Wt;y.viewport=new pt;let v=new Wt;v.viewport=new pt;let I=[y,v],N=new _a,k=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let J=E[Y];return J===void 0&&(J=new ls,E[Y]=J),J.getTargetRaySpace()},this.getControllerGrip=function(Y){let J=E[Y];return J===void 0&&(J=new ls,E[Y]=J),J.getGripSpace()},this.getHand=function(Y){let J=E[Y];return J===void 0&&(J=new ls,E[Y]=J),J.getHandSpace()};function W(Y){let J=b.indexOf(Y.inputSource);if(J===-1)return;let fe=E[J];fe!==void 0&&(fe.update(Y.inputSource,Y.frame,l||a),fe.dispatchEvent({type:Y.type,data:Y.inputSource}))}function X(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",te);for(let Y=0;Y<E.length;Y++){let J=b[Y];J!==null&&(b[Y]=null,E[Y].disconnect(J))}k=null,V=null,m.reset();for(let Y in f)delete f[Y];e.setRenderTarget(w),p=null,d=null,u=null,s=null,T=null,rt.stop(),i.isPresenting=!1,e.setPixelRatio(D),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,i.isPresenting===!0&&Re("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,i.isPresenting===!0&&Re("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(Y){l=Y},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(w=e.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",X),s.addEventListener("inputsourceschange",te),S.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(C),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let fe=null,Ne=null,ve=null;S.depth&&(ve=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=S.stencil?ps:ns,Ne=S.stencil?fs:hn);let ze={colorFormat:t.RGBA8,depthFormat:ve,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(ze),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),T=new Ti(d.textureWidth,d.textureHeight,{format:li,type:_i,depthTexture:new Xs(d.textureWidth,d.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let fe={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,fe),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),T=new Ti(p.framebufferWidth,p.framebufferHeight,{format:li,type:_i,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}T.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),rt.setContext(s),rt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function te(Y){for(let J=0;J<Y.removed.length;J++){let fe=Y.removed[J],Ne=b.indexOf(fe);Ne>=0&&(b[Ne]=null,E[Ne].disconnect(fe))}for(let J=0;J<Y.added.length;J++){let fe=Y.added[J],Ne=b.indexOf(fe);if(Ne===-1){for(let ze=0;ze<E.length;ze++)if(ze>=b.length){b.push(fe),Ne=ze;break}else if(b[ze]===null){b[ze]=fe,Ne=ze;break}if(Ne===-1)break}let ve=E[Ne];ve&&ve.connect(fe)}}let G=new F,Q=new F;function ee(Y,J,fe){G.setFromMatrixPosition(J.matrixWorld),Q.setFromMatrixPosition(fe.matrixWorld);let Ne=G.distanceTo(Q),ve=J.projectionMatrix.elements,ze=fe.projectionMatrix.elements,At=ve[14]/(ve[10]-1),Be=ve[14]/(ve[10]+1),dt=(ve[9]+1)/ve[5],R=(ve[9]-1)/ve[5],Ve=(ve[8]-1)/ve[0],He=(ze[8]+1)/ze[0],at=At*Ve,ge=At*He,ht=Ne/(-Ve+He),be=ht*-Ve;if(J.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(be),Y.translateZ(ht),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),ve[10]===-1)Y.projectionMatrix.copy(J.projectionMatrix),Y.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{let Le=At+ht,A=Be+ht,_=at-be,O=ge+(Ne-be),q=dt*Be/A*Le,Z=R*Be/A*Le;Y.projectionMatrix.makePerspective(_,O,q,Z,Le,A),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function Me(Y,J){J===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(J.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let J=Y.near,fe=Y.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(fe=m.depthFar)),N.near=v.near=y.near=J,N.far=v.far=y.far=fe,(k!==N.near||V!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),k=N.near,V=N.far),N.layers.mask=Y.layers.mask|6,y.layers.mask=N.layers.mask&3,v.layers.mask=N.layers.mask&5;let Ne=Y.parent,ve=N.cameras;Me(N,Ne);for(let ze=0;ze<ve.length;ze++)Me(ve[ze],Ne);ve.length===2?ee(N,y,v):N.projectionMatrix.copy(y.projectionMatrix),Xe(Y,N,Ne)};function Xe(Y,J,fe){fe===null?Y.matrix.copy(J.matrixWorld):(Y.matrix.copy(fe.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(J.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(J.projectionMatrix),Y.projectionMatrixInverse.copy(J.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Kr*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(d===null&&p===null))return c},this.setFoveation=function(Y){c=Y,d!==null&&(d.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(N)},this.getCameraTexture=function(Y){return f[Y]};let Ke=null;function st(Y,J){if(h=J.getViewerPose(l||a),g=J,h!==null){let fe=h.views;p!==null&&(e.setRenderTargetFramebuffer(T,p.framebuffer),e.setRenderTarget(T));let Ne=!1;fe.length!==N.cameras.length&&(N.cameras.length=0,Ne=!0);for(let Be=0;Be<fe.length;Be++){let dt=fe[Be],R=null;if(p!==null)R=p.getViewport(dt);else{let He=u.getViewSubImage(d,dt);R=He.viewport,Be===0&&(e.setRenderTargetTextures(T,He.colorTexture,He.depthStencilTexture),e.setRenderTarget(T))}let Ve=I[Be];Ve===void 0&&(Ve=new Wt,Ve.layers.enable(Be),Ve.viewport=new pt,I[Be]=Ve),Ve.matrix.fromArray(dt.transform.matrix),Ve.matrix.decompose(Ve.position,Ve.quaternion,Ve.scale),Ve.projectionMatrix.fromArray(dt.projectionMatrix),Ve.projectionMatrixInverse.copy(Ve.projectionMatrix).invert(),Ve.viewport.set(R.x,R.y,R.width,R.height),Be===0&&(N.matrix.copy(Ve.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),Ne===!0&&N.cameras.push(Ve)}let ve=s.enabledFeatures;if(ve&&ve.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){u=i.getBinding();let Be=u.getDepthInformation(fe[0]);Be&&Be.isValid&&Be.texture&&m.init(Be,s.renderState)}if(ve&&ve.includes("camera-access")&&x){e.state.unbindTexture(),u=i.getBinding();for(let Be=0;Be<fe.length;Be++){let dt=fe[Be].camera;if(dt){let R=f[dt];R||(R=new qs,f[dt]=R);let Ve=u.getCameraImage(dt);R.sourceTexture=Ve}}}}for(let fe=0;fe<E.length;fe++){let Ne=b[fe],ve=E[fe];Ne!==null&&ve!==void 0&&ve.update(Ne,J,l||a)}Ke&&Ke(Y,J),J.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:J}),g=null}let rt=new ou;rt.setAnimationLoop(st),this.setAnimationLoop=function(Y){Ke=Y},this.dispose=function(){}}},Bn=new xi,r_=new ot;function a_(n,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function i(m,f){f.color.getRGB(m.fogColor.value,Jc(n)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,S,w,T){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),u(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f)):f.isMeshStandardMaterial?(r(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,T)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),x(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?c(m,f,S,w):f.isSpriteMaterial?l(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===zt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===zt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let S=e.get(f),w=S.envMap,T=S.envMapRotation;w&&(m.envMap.value=w,Bn.copy(T),Bn.x*=-1,Bn.y*=-1,Bn.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Bn.y*=-1,Bn.z*=-1),m.envMapRotation.value.setFromMatrix4(r_.makeRotationFromEuler(Bn)),m.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function c(m,f,S,w){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*S,m.scale.value=w*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function l(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function u(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,S){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===zt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function x(m,f){let S=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function o_(n,e,t,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(S,w){let T=w.program;i.uniformBlockBinding(S,T)}function l(S,w){let T=s[S.id];T===void 0&&(g(S),T=h(S),s[S.id]=T,S.addEventListener("dispose",m));let E=w.program;i.updateUBOMapping(S,E);let b=e.render.frame;r[S.id]!==b&&(d(S),r[S.id]=b)}function h(S){let w=u();S.__bindingPointIndex=w;let T=n.createBuffer(),E=S.__size,b=S.usage;return n.bindBuffer(n.UNIFORM_BUFFER,T),n.bufferData(n.UNIFORM_BUFFER,E,b),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,w,T),T}function u(){for(let S=0;S<o;S++)if(a.indexOf(S)===-1)return a.push(S),S;return ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(S){let w=s[S.id],T=S.uniforms,E=S.__cache;n.bindBuffer(n.UNIFORM_BUFFER,w);for(let b=0,C=T.length;b<C;b++){let D=Array.isArray(T[b])?T[b]:[T[b]];for(let y=0,v=D.length;y<v;y++){let I=D[y];if(p(I,b,y,E)===!0){let N=I.__offset,k=Array.isArray(I.value)?I.value:[I.value],V=0;for(let W=0;W<k.length;W++){let X=k[W],te=x(X);typeof X=="number"||typeof X=="boolean"?(I.__data[0]=X,n.bufferSubData(n.UNIFORM_BUFFER,N+V,I.__data)):X.isMatrix3?(I.__data[0]=X.elements[0],I.__data[1]=X.elements[1],I.__data[2]=X.elements[2],I.__data[3]=0,I.__data[4]=X.elements[3],I.__data[5]=X.elements[4],I.__data[6]=X.elements[5],I.__data[7]=0,I.__data[8]=X.elements[6],I.__data[9]=X.elements[7],I.__data[10]=X.elements[8],I.__data[11]=0):(X.toArray(I.__data,V),V+=te.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,N,I.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(S,w,T,E){let b=S.value,C=w+"_"+T;if(E[C]===void 0)return typeof b=="number"||typeof b=="boolean"?E[C]=b:E[C]=b.clone(),!0;{let D=E[C];if(typeof b=="number"||typeof b=="boolean"){if(D!==b)return E[C]=b,!0}else if(D.equals(b)===!1)return D.copy(b),!0}return!1}function g(S){let w=S.uniforms,T=0,E=16;for(let C=0,D=w.length;C<D;C++){let y=Array.isArray(w[C])?w[C]:[w[C]];for(let v=0,I=y.length;v<I;v++){let N=y[v],k=Array.isArray(N.value)?N.value:[N.value];for(let V=0,W=k.length;V<W;V++){let X=k[V],te=x(X),G=T%E,Q=G%te.boundary,ee=G+Q;T+=Q,ee!==0&&E-ee<te.storage&&(T+=E-ee),N.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=T,T+=te.storage}}}let b=T%E;return b>0&&(T+=E-b),S.__size=T,S.__cache={},this}function x(S){let w={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(w.boundary=4,w.storage=4):S.isVector2?(w.boundary=8,w.storage=8):S.isVector3||S.isColor?(w.boundary=16,w.storage=12):S.isVector4?(w.boundary=16,w.storage=16):S.isMatrix3?(w.boundary=48,w.storage=48):S.isMatrix4?(w.boundary=64,w.storage=64):S.isTexture?Re("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Re("WebGLRenderer: Unsupported uniform value type.",S),w}function m(S){let w=S.target;w.removeEventListener("dispose",m);let T=a.indexOf(w.__bindingPointIndex);a.splice(T,1),n.deleteBuffer(s[w.id]),delete s[w.id],delete r[w.id]}function f(){for(let S in s)n.deleteBuffer(s[S]);a=[],s={},r={}}return{bind:c,update:l,dispose:f}}var c_=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]),Zi=null;function l_(){return Zi===null&&(Zi=new Gs(c_,32,32,Ua,Fn),Zi.minFilter=ei,Zi.magFilter=ei,Zi.wrapS=wi,Zi.wrapT=wi,Zi.generateMipmaps=!1,Zi.needsUpdate=!0),Zi}var go=class{constructor(e={}){let{canvas:t=Nh(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;let g=new Set([Oa,Fa,Na]),x=new Set([_i,hn,us,fs,Pa,Da]),m=new Uint32Array(4),f=new Int32Array(4),S=null,w=null,T=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Yi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let b=this,C=!1;this._outputColorSpace=Ft;let D=0,y=0,v=null,I=-1,N=null,k=new pt,V=new pt,W=null,X=new Ce(0),te=0,G=t.width,Q=t.height,ee=1,Me=null,Xe=null,Ke=new pt(0,0,G,Q),st=new pt(0,0,G,Q),rt=!1,Y=new ds,J=!1,fe=!1,Ne=new ot,ve=new F,ze=new pt,At={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Be=!1;function dt(){return v===null?ee:1}let R=i;function Ve(M,L){return t.getContext(M,L)}try{let M={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"181"}`),t.addEventListener("webglcontextlost",j,!1),t.addEventListener("webglcontextrestored",$,!1),t.addEventListener("webglcontextcreationerror",pe,!1),R===null){let L="webgl2";if(R=Ve(L,M),R===null)throw Ve(L)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw M("WebGLRenderer: "+M.message),M}let He,at,ge,ht,be,Le,A,_,O,q,Z,H,_e,oe,Se,xe,K,ne,Ae,Te,de,Pe,P,ce;function se(){He=new Tg(R),He.init(),Pe=new i_(R,He),at=new gg(R,He,e,Pe),ge=new e_(R,He),at.reversedDepthBuffer&&d&&ge.buffers.depth.setReversed(!0),ht=new Cg(R),be=new Vx,Le=new t_(R,He,ge,be,at,Pe,ht),A=new _g(b),_=new wg(b),O=new Dp(R),P=new pg(R,O),q=new Eg(R,O,ht,P),Z=new Rg(R,q,O,ht),Ae=new Ig(R,at,Le),xe=new xg(be),H=new zx(b,A,_,He,at,P,xe),_e=new a_(b,be),oe=new Gx,Se=new Zx(He),ne=new fg(b,A,_,ge,Z,p,c),K=new jx(b,Z,at),ce=new o_(R,ht,at,ge),Te=new mg(R,He,ht),de=new Ag(R,He,ht),ht.programs=H.programs,b.capabilities=at,b.extensions=He,b.properties=be,b.renderLists=oe,b.shadowMap=K,b.state=ge,b.info=ht}se();let re=new ul(b,R);this.xr=re,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let M=He.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=He.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(M){M!==void 0&&(ee=M,this.setSize(G,Q,!1))},this.getSize=function(M){return M.set(G,Q)},this.setSize=function(M,L,B=!0){if(re.isPresenting){Re("WebGLRenderer: Can't change size while VR device is presenting.");return}G=M,Q=L,t.width=Math.floor(M*ee),t.height=Math.floor(L*ee),B===!0&&(t.style.width=M+"px",t.style.height=L+"px"),this.setViewport(0,0,M,L)},this.getDrawingBufferSize=function(M){return M.set(G*ee,Q*ee).floor()},this.setDrawingBufferSize=function(M,L,B){G=M,Q=L,ee=B,t.width=Math.floor(M*B),t.height=Math.floor(L*B),this.setViewport(0,0,M,L)},this.getCurrentViewport=function(M){return M.copy(k)},this.getViewport=function(M){return M.copy(Ke)},this.setViewport=function(M,L,B,z){M.isVector4?Ke.set(M.x,M.y,M.z,M.w):Ke.set(M,L,B,z),ge.viewport(k.copy(Ke).multiplyScalar(ee).round())},this.getScissor=function(M){return M.copy(st)},this.setScissor=function(M,L,B,z){M.isVector4?st.set(M.x,M.y,M.z,M.w):st.set(M,L,B,z),ge.scissor(V.copy(st).multiplyScalar(ee).round())},this.getScissorTest=function(){return rt},this.setScissorTest=function(M){ge.setScissorTest(rt=M)},this.setOpaqueSort=function(M){Me=M},this.setTransparentSort=function(M){Xe=M},this.getClearColor=function(M){return M.copy(ne.getClearColor())},this.setClearColor=function(){ne.setClearColor(...arguments)},this.getClearAlpha=function(){return ne.getClearAlpha()},this.setClearAlpha=function(){ne.setClearAlpha(...arguments)},this.clear=function(M=!0,L=!0,B=!0){let z=0;if(M){let U=!1;if(v!==null){let ie=v.texture.format;U=g.has(ie)}if(U){let ie=v.texture.type,le=x.has(ie),me=ne.getClearColor(),ue=ne.getClearAlpha(),Ee=me.r,Ie=me.g,ye=me.b;le?(m[0]=Ee,m[1]=Ie,m[2]=ye,m[3]=ue,R.clearBufferuiv(R.COLOR,0,m)):(f[0]=Ee,f[1]=Ie,f[2]=ye,f[3]=ue,R.clearBufferiv(R.COLOR,0,f))}else z|=R.COLOR_BUFFER_BIT}L&&(z|=R.DEPTH_BUFFER_BIT),B&&(z|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",j,!1),t.removeEventListener("webglcontextrestored",$,!1),t.removeEventListener("webglcontextcreationerror",pe,!1),ne.dispose(),oe.dispose(),Se.dispose(),be.dispose(),A.dispose(),_.dispose(),Z.dispose(),P.dispose(),ce.dispose(),H.dispose(),re.dispose(),re.removeEventListener("sessionstart",Rl),re.removeEventListener("sessionend",Pl),mn.stop()};function j(M){M.preventDefault(),Zc("WebGLRenderer: Context Lost."),C=!0}function $(){Zc("WebGLRenderer: Context Restored."),C=!1;let M=ht.autoReset,L=K.enabled,B=K.autoUpdate,z=K.needsUpdate,U=K.type;se(),ht.autoReset=M,K.enabled=L,K.autoUpdate=B,K.needsUpdate=z,K.type=U}function pe(M){ke("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function De(M){let L=M.target;L.removeEventListener("dispose",De),ct(L)}function ct(M){je(M),be.remove(M)}function je(M){let L=be.get(M).programs;L!==void 0&&(L.forEach(function(B){H.releaseProgram(B)}),M.isShaderMaterial&&H.releaseShaderCache(M))}this.renderBufferDirect=function(M,L,B,z,U,ie){L===null&&(L=At);let le=U.isMesh&&U.matrixWorld.determinant()<0,me=Nu(M,L,B,z,U);ge.setMaterial(z,le);let ue=B.index,Ee=1;if(z.wireframe===!0){if(ue=q.getWireframeAttribute(B),ue===void 0)return;Ee=2}let Ie=B.drawRange,ye=B.attributes.position,Ge=Ie.start*Ee,Qe=(Ie.start+Ie.count)*Ee;ie!==null&&(Ge=Math.max(Ge,ie.start*Ee),Qe=Math.min(Qe,(ie.start+ie.count)*Ee)),ue!==null?(Ge=Math.max(Ge,0),Qe=Math.min(Qe,ue.count)):ye!=null&&(Ge=Math.max(Ge,0),Qe=Math.min(Qe,ye.count));let mt=Qe-Ge;if(mt<0||mt===1/0)return;P.setup(U,z,me,B,ue);let gt,tt=Te;if(ue!==null&&(gt=O.get(ue),tt=de,tt.setIndex(gt)),U.isMesh)z.wireframe===!0?(ge.setLineWidth(z.wireframeLinewidth*dt()),tt.setMode(R.LINES)):tt.setMode(R.TRIANGLES);else if(U.isLine){let we=z.linewidth;we===void 0&&(we=1),ge.setLineWidth(we*dt()),U.isLineSegments?tt.setMode(R.LINES):U.isLineLoop?tt.setMode(R.LINE_LOOP):tt.setMode(R.LINE_STRIP)}else U.isPoints?tt.setMode(R.POINTS):U.isSprite&&tt.setMode(R.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)rs("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),tt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(He.get("WEBGL_multi_draw"))tt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let we=U._multiDrawStarts,ut=U._multiDrawCounts,$e=U._multiDrawCount,$t=ue?O.get(ue).bytesPerElement:1,Vn=be.get(z).currentProgram.getUniforms();for(let Zt=0;Zt<$e;Zt++)Vn.setValue(R,"_gl_DrawID",Zt),tt.render(we[Zt]/$t,ut[Zt])}else if(U.isInstancedMesh)tt.renderInstances(Ge,mt,U.count);else if(B.isInstancedBufferGeometry){let we=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,ut=Math.min(B.instanceCount,we);tt.renderInstances(Ge,mt,ut)}else tt.render(Ge,mt)};function bi(M,L,B){M.transparent===!0&&M.side===Lt&&M.forceSinglePass===!1?(M.side=zt,M.needsUpdate=!0,gr(M,L,B),M.side=Hi,M.needsUpdate=!0,gr(M,L,B),M.side=Lt):gr(M,L,B)}this.compile=function(M,L,B=null){B===null&&(B=M),w=Se.get(B),w.init(L),E.push(w),B.traverseVisible(function(U){U.isLight&&U.layers.test(L.layers)&&(w.pushLight(U),U.castShadow&&w.pushShadow(U))}),M!==B&&M.traverseVisible(function(U){U.isLight&&U.layers.test(L.layers)&&(w.pushLight(U),U.castShadow&&w.pushShadow(U))}),w.setupLights();let z=new Set;return M.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let ie=U.material;if(ie)if(Array.isArray(ie))for(let le=0;le<ie.length;le++){let me=ie[le];bi(me,B,U),z.add(me)}else bi(ie,B,U),z.add(ie)}),w=E.pop(),z},this.compileAsync=function(M,L,B=null){let z=this.compile(M,L,B);return new Promise(U=>{function ie(){if(z.forEach(function(le){be.get(le).currentProgram.isReady()&&z.delete(le)}),z.size===0){U(M);return}setTimeout(ie,10)}He.get("KHR_parallel_shader_compile")!==null?ie():setTimeout(ie,10)})};let di=null;function Lu(M){di&&di(M)}function Rl(){mn.stop()}function Pl(){mn.start()}let mn=new ou;mn.setAnimationLoop(Lu),typeof self<"u"&&mn.setContext(self),this.setAnimationLoop=function(M){di=M,re.setAnimationLoop(M),M===null?mn.stop():mn.start()},re.addEventListener("sessionstart",Rl),re.addEventListener("sessionend",Pl),this.render=function(M,L){if(L!==void 0&&L.isCamera!==!0){ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),L.parent===null&&L.matrixWorldAutoUpdate===!0&&L.updateMatrixWorld(),re.enabled===!0&&re.isPresenting===!0&&(re.cameraAutoUpdate===!0&&re.updateCamera(L),L=re.getCamera()),M.isScene===!0&&M.onBeforeRender(b,M,L,v),w=Se.get(M,E.length),w.init(L),E.push(w),Ne.multiplyMatrices(L.projectionMatrix,L.matrixWorldInverse),Y.setFromProjectionMatrix(Ne,mi,L.reversedDepth),fe=this.localClippingEnabled,J=xe.init(this.clippingPlanes,fe),S=oe.get(M,T.length),S.init(),T.push(S),re.enabled===!0&&re.isPresenting===!0){let ie=b.xr.getDepthSensingMesh();ie!==null&&Ro(ie,L,-1/0,b.sortObjects)}Ro(M,L,0,b.sortObjects),S.finish(),b.sortObjects===!0&&S.sort(Me,Xe),Be=re.enabled===!1||re.isPresenting===!1||re.hasDepthSensing()===!1,Be&&ne.addToRenderList(S,M),this.info.render.frame++,J===!0&&xe.beginShadows();let B=w.state.shadowsArray;K.render(B,M,L),J===!0&&xe.endShadows(),this.info.autoReset===!0&&this.info.reset();let z=S.opaque,U=S.transmissive;if(w.setupLights(),L.isArrayCamera){let ie=L.cameras;if(U.length>0)for(let le=0,me=ie.length;le<me;le++){let ue=ie[le];Ll(z,U,M,ue)}Be&&ne.render(M);for(let le=0,me=ie.length;le<me;le++){let ue=ie[le];Dl(S,M,ue,ue.viewport)}}else U.length>0&&Ll(z,U,M,L),Be&&ne.render(M),Dl(S,M,L);v!==null&&y===0&&(Le.updateMultisampleRenderTarget(v),Le.updateRenderTargetMipmap(v)),M.isScene===!0&&M.onAfterRender(b,M,L),P.resetDefaultState(),I=-1,N=null,E.pop(),E.length>0?(w=E[E.length-1],J===!0&&xe.setGlobalState(b.clippingPlanes,w.state.camera)):w=null,T.pop(),T.length>0?S=T[T.length-1]:S=null};function Ro(M,L,B,z){if(M.visible===!1)return;if(M.layers.test(L.layers)){if(M.isGroup)B=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(L);else if(M.isLight)w.pushLight(M),M.castShadow&&w.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Y.intersectsSprite(M)){z&&ze.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Ne);let le=Z.update(M),me=M.material;me.visible&&S.push(M,le,me,B,ze.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Y.intersectsObject(M))){let le=Z.update(M),me=M.material;if(z&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),ze.copy(M.boundingSphere.center)):(le.boundingSphere===null&&le.computeBoundingSphere(),ze.copy(le.boundingSphere.center)),ze.applyMatrix4(M.matrixWorld).applyMatrix4(Ne)),Array.isArray(me)){let ue=le.groups;for(let Ee=0,Ie=ue.length;Ee<Ie;Ee++){let ye=ue[Ee],Ge=me[ye.materialIndex];Ge&&Ge.visible&&S.push(M,le,Ge,B,ze.z,ye)}}else me.visible&&S.push(M,le,me,B,ze.z,null)}}let ie=M.children;for(let le=0,me=ie.length;le<me;le++)Ro(ie[le],L,B,z)}function Dl(M,L,B,z){let{opaque:U,transmissive:ie,transparent:le}=M;w.setupLightsView(B),J===!0&&xe.setGlobalState(b.clippingPlanes,B),z&&ge.viewport(k.copy(z)),U.length>0&&mr(U,L,B),ie.length>0&&mr(ie,L,B),le.length>0&&mr(le,L,B),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function Ll(M,L,B,z){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;w.state.transmissionRenderTarget[z.id]===void 0&&(w.state.transmissionRenderTarget[z.id]=new Ti(1,1,{generateMipmaps:!0,type:He.has("EXT_color_buffer_half_float")||He.has("EXT_color_buffer_float")?Fn:_i,minFilter:dn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qe.workingColorSpace}));let ie=w.state.transmissionRenderTarget[z.id],le=z.viewport||k;ie.setSize(le.z*b.transmissionResolutionScale,le.w*b.transmissionResolutionScale);let me=b.getRenderTarget(),ue=b.getActiveCubeFace(),Ee=b.getActiveMipmapLevel();b.setRenderTarget(ie),b.getClearColor(X),te=b.getClearAlpha(),te<1&&b.setClearColor(16777215,.5),b.clear(),Be&&ne.render(B);let Ie=b.toneMapping;b.toneMapping=Yi;let ye=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),w.setupLightsView(z),J===!0&&xe.setGlobalState(b.clippingPlanes,z),mr(M,B,z),Le.updateMultisampleRenderTarget(ie),Le.updateRenderTargetMipmap(ie),He.has("WEBGL_multisampled_render_to_texture")===!1){let Ge=!1;for(let Qe=0,mt=L.length;Qe<mt;Qe++){let gt=L[Qe],{object:tt,geometry:we,material:ut,group:$e}=gt;if(ut.side===Lt&&tt.layers.test(z.layers)){let $t=ut.side;ut.side=zt,ut.needsUpdate=!0,Nl(tt,B,z,we,ut,$e),ut.side=$t,ut.needsUpdate=!0,Ge=!0}}Ge===!0&&(Le.updateMultisampleRenderTarget(ie),Le.updateRenderTargetMipmap(ie))}b.setRenderTarget(me,ue,Ee),b.setClearColor(X,te),ye!==void 0&&(z.viewport=ye),b.toneMapping=Ie}function mr(M,L,B){let z=L.isScene===!0?L.overrideMaterial:null;for(let U=0,ie=M.length;U<ie;U++){let le=M[U],{object:me,geometry:ue,group:Ee}=le,Ie=le.material;Ie.allowOverride===!0&&z!==null&&(Ie=z),me.layers.test(B.layers)&&Nl(me,L,B,ue,Ie,Ee)}}function Nl(M,L,B,z,U,ie){M.onBeforeRender(b,L,B,z,U,ie),M.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),U.onBeforeRender(b,L,B,z,M,ie),U.transparent===!0&&U.side===Lt&&U.forceSinglePass===!1?(U.side=zt,U.needsUpdate=!0,b.renderBufferDirect(B,L,z,U,M,ie),U.side=Hi,U.needsUpdate=!0,b.renderBufferDirect(B,L,z,U,M,ie),U.side=Lt):b.renderBufferDirect(B,L,z,U,M,ie),M.onAfterRender(b,L,B,z,U,ie)}function gr(M,L,B){L.isScene!==!0&&(L=At);let z=be.get(M),U=w.state.lights,ie=w.state.shadowsArray,le=U.state.version,me=H.getParameters(M,U.state,ie,L,B),ue=H.getProgramCacheKey(me),Ee=z.programs;z.environment=M.isMeshStandardMaterial?L.environment:null,z.fog=L.fog,z.envMap=(M.isMeshStandardMaterial?_:A).get(M.envMap||z.environment),z.envMapRotation=z.environment!==null&&M.envMap===null?L.environmentRotation:M.envMapRotation,Ee===void 0&&(M.addEventListener("dispose",De),Ee=new Map,z.programs=Ee);let Ie=Ee.get(ue);if(Ie!==void 0){if(z.currentProgram===Ie&&z.lightsStateVersion===le)return Fl(M,me),Ie}else me.uniforms=H.getUniforms(M),M.onBeforeCompile(me,b),Ie=H.acquireProgram(me,ue),Ee.set(ue,Ie),z.uniforms=me.uniforms;let ye=z.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(ye.clippingPlanes=xe.uniform),Fl(M,me),z.needsLights=Fu(M),z.lightsStateVersion=le,z.needsLights&&(ye.ambientLightColor.value=U.state.ambient,ye.lightProbe.value=U.state.probe,ye.directionalLights.value=U.state.directional,ye.directionalLightShadows.value=U.state.directionalShadow,ye.spotLights.value=U.state.spot,ye.spotLightShadows.value=U.state.spotShadow,ye.rectAreaLights.value=U.state.rectArea,ye.ltc_1.value=U.state.rectAreaLTC1,ye.ltc_2.value=U.state.rectAreaLTC2,ye.pointLights.value=U.state.point,ye.pointLightShadows.value=U.state.pointShadow,ye.hemisphereLights.value=U.state.hemi,ye.directionalShadowMap.value=U.state.directionalShadowMap,ye.directionalShadowMatrix.value=U.state.directionalShadowMatrix,ye.spotShadowMap.value=U.state.spotShadowMap,ye.spotLightMatrix.value=U.state.spotLightMatrix,ye.spotLightMap.value=U.state.spotLightMap,ye.pointShadowMap.value=U.state.pointShadowMap,ye.pointShadowMatrix.value=U.state.pointShadowMatrix),z.currentProgram=Ie,z.uniformsList=null,Ie}function Ul(M){if(M.uniformsList===null){let L=M.currentProgram.getUniforms();M.uniformsList=gs.seqWithValue(L.seq,M.uniforms)}return M.uniformsList}function Fl(M,L){let B=be.get(M);B.outputColorSpace=L.outputColorSpace,B.batching=L.batching,B.batchingColor=L.batchingColor,B.instancing=L.instancing,B.instancingColor=L.instancingColor,B.instancingMorph=L.instancingMorph,B.skinning=L.skinning,B.morphTargets=L.morphTargets,B.morphNormals=L.morphNormals,B.morphColors=L.morphColors,B.morphTargetsCount=L.morphTargetsCount,B.numClippingPlanes=L.numClippingPlanes,B.numIntersection=L.numClipIntersection,B.vertexAlphas=L.vertexAlphas,B.vertexTangents=L.vertexTangents,B.toneMapping=L.toneMapping}function Nu(M,L,B,z,U){L.isScene!==!0&&(L=At),Le.resetTextureUnits();let ie=L.fog,le=z.isMeshStandardMaterial?L.environment:null,me=v===null?b.outputColorSpace:v.isXRRenderTarget===!0?v.texture.colorSpace:An,ue=(z.isMeshStandardMaterial?_:A).get(z.envMap||le),Ee=z.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Ie=!!B.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),ye=!!B.morphAttributes.position,Ge=!!B.morphAttributes.normal,Qe=!!B.morphAttributes.color,mt=Yi;z.toneMapped&&(v===null||v.isXRRenderTarget===!0)&&(mt=b.toneMapping);let gt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,tt=gt!==void 0?gt.length:0,we=be.get(z),ut=w.state.lights;if(J===!0&&(fe===!0||M!==N)){let Ut=M===N&&z.id===I;xe.setState(z,M,Ut)}let $e=!1;z.version===we.__version?(we.needsLights&&we.lightsStateVersion!==ut.state.version||we.outputColorSpace!==me||U.isBatchedMesh&&we.batching===!1||!U.isBatchedMesh&&we.batching===!0||U.isBatchedMesh&&we.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&we.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&we.instancing===!1||!U.isInstancedMesh&&we.instancing===!0||U.isSkinnedMesh&&we.skinning===!1||!U.isSkinnedMesh&&we.skinning===!0||U.isInstancedMesh&&we.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&we.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&we.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&we.instancingMorph===!1&&U.morphTexture!==null||we.envMap!==ue||z.fog===!0&&we.fog!==ie||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==xe.numPlanes||we.numIntersection!==xe.numIntersection)||we.vertexAlphas!==Ee||we.vertexTangents!==Ie||we.morphTargets!==ye||we.morphNormals!==Ge||we.morphColors!==Qe||we.toneMapping!==mt||we.morphTargetsCount!==tt)&&($e=!0):($e=!0,we.__version=z.version);let $t=we.currentProgram;$e===!0&&($t=gr(z,L,U));let Vn=!1,Zt=!1,vs=!1,ft=$t.getUniforms(),Vt=we.uniforms;if(ge.useProgram($t.program)&&(Vn=!0,Zt=!0,vs=!0),z.id!==I&&(I=z.id,Zt=!0),Vn||N!==M){ge.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),ft.setValue(R,"projectionMatrix",M.projectionMatrix),ft.setValue(R,"viewMatrix",M.matrixWorldInverse);let Ht=ft.map.cameraPosition;Ht!==void 0&&Ht.setValue(R,ve.setFromMatrixPosition(M.matrixWorld)),at.logarithmicDepthBuffer&&ft.setValue(R,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ft.setValue(R,"isOrthographic",M.isOrthographicCamera===!0),N!==M&&(N=M,Zt=!0,vs=!0)}if(U.isSkinnedMesh){ft.setOptional(R,U,"bindMatrix"),ft.setOptional(R,U,"bindMatrixInverse");let Ut=U.skeleton;Ut&&(Ut.boneTexture===null&&Ut.computeBoneTexture(),ft.setValue(R,"boneTexture",Ut.boneTexture,Le))}U.isBatchedMesh&&(ft.setOptional(R,U,"batchingTexture"),ft.setValue(R,"batchingTexture",U._matricesTexture,Le),ft.setOptional(R,U,"batchingIdTexture"),ft.setValue(R,"batchingIdTexture",U._indirectTexture,Le),ft.setOptional(R,U,"batchingColorTexture"),U._colorsTexture!==null&&ft.setValue(R,"batchingColorTexture",U._colorsTexture,Le));let ii=B.morphAttributes;if((ii.position!==void 0||ii.normal!==void 0||ii.color!==void 0)&&Ae.update(U,B,$t),(Zt||we.receiveShadow!==U.receiveShadow)&&(we.receiveShadow=U.receiveShadow,ft.setValue(R,"receiveShadow",U.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(Vt.envMap.value=ue,Vt.flipEnvMap.value=ue.isCubeTexture&&ue.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&L.environment!==null&&(Vt.envMapIntensity.value=L.environmentIntensity),Vt.dfgLUT!==void 0&&(Vt.dfgLUT.value=l_()),Zt&&(ft.setValue(R,"toneMappingExposure",b.toneMappingExposure),we.needsLights&&Uu(Vt,vs),ie&&z.fog===!0&&_e.refreshFogUniforms(Vt,ie),_e.refreshMaterialUniforms(Vt,z,ee,Q,w.state.transmissionRenderTarget[M.id]),gs.upload(R,Ul(we),Vt,Le)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(gs.upload(R,Ul(we),Vt,Le),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ft.setValue(R,"center",U.center),ft.setValue(R,"modelViewMatrix",U.modelViewMatrix),ft.setValue(R,"normalMatrix",U.normalMatrix),ft.setValue(R,"modelMatrix",U.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){let Ut=z.uniformsGroups;for(let Ht=0,Po=Ut.length;Ht<Po;Ht++){let gn=Ut[Ht];ce.update(gn,$t),ce.bind(gn,$t)}}return $t}function Uu(M,L){M.ambientLightColor.needsUpdate=L,M.lightProbe.needsUpdate=L,M.directionalLights.needsUpdate=L,M.directionalLightShadows.needsUpdate=L,M.pointLights.needsUpdate=L,M.pointLightShadows.needsUpdate=L,M.spotLights.needsUpdate=L,M.spotLightShadows.needsUpdate=L,M.rectAreaLights.needsUpdate=L,M.hemisphereLights.needsUpdate=L}function Fu(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return y},this.getRenderTarget=function(){return v},this.setRenderTargetTextures=function(M,L,B){let z=be.get(M);z.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),be.get(M.texture).__webglTexture=L,be.get(M.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:B,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,L){let B=be.get(M);B.__webglFramebuffer=L,B.__useDefaultFramebuffer=L===void 0};let Ou=R.createFramebuffer();this.setRenderTarget=function(M,L=0,B=0){v=M,D=L,y=B;let z=!0,U=null,ie=!1,le=!1;if(M){let ue=be.get(M);if(ue.__useDefaultFramebuffer!==void 0)ge.bindFramebuffer(R.FRAMEBUFFER,null),z=!1;else if(ue.__webglFramebuffer===void 0)Le.setupRenderTarget(M);else if(ue.__hasExternalTextures)Le.rebindTextures(M,be.get(M.texture).__webglTexture,be.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let ye=M.depthTexture;if(ue.__boundDepthTexture!==ye){if(ye!==null&&be.has(ye)&&(M.width!==ye.image.width||M.height!==ye.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Le.setupDepthRenderbuffer(M)}}let Ee=M.texture;(Ee.isData3DTexture||Ee.isDataArrayTexture||Ee.isCompressedArrayTexture)&&(le=!0);let Ie=be.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ie[L])?U=Ie[L][B]:U=Ie[L],ie=!0):M.samples>0&&Le.useMultisampledRTT(M)===!1?U=be.get(M).__webglMultisampledFramebuffer:Array.isArray(Ie)?U=Ie[B]:U=Ie,k.copy(M.viewport),V.copy(M.scissor),W=M.scissorTest}else k.copy(Ke).multiplyScalar(ee).floor(),V.copy(st).multiplyScalar(ee).floor(),W=rt;if(B!==0&&(U=Ou),ge.bindFramebuffer(R.FRAMEBUFFER,U)&&z&&ge.drawBuffers(M,U),ge.viewport(k),ge.scissor(V),ge.setScissorTest(W),ie){let ue=be.get(M.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+L,ue.__webglTexture,B)}else if(le){let ue=L;for(let Ee=0;Ee<M.textures.length;Ee++){let Ie=be.get(M.textures[Ee]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+Ee,Ie.__webglTexture,B,ue)}}else if(M!==null&&B!==0){let ue=be.get(M.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,ue.__webglTexture,B)}I=-1},this.readRenderTargetPixels=function(M,L,B,z,U,ie,le,me=0){if(!(M&&M.isWebGLRenderTarget)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ue=be.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&le!==void 0&&(ue=ue[le]),ue){ge.bindFramebuffer(R.FRAMEBUFFER,ue);try{let Ee=M.textures[me],Ie=Ee.format,ye=Ee.type;if(!at.textureFormatReadable(Ie)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!at.textureTypeReadable(ye)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}L>=0&&L<=M.width-z&&B>=0&&B<=M.height-U&&(M.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+me),R.readPixels(L,B,z,U,Pe.convert(Ie),Pe.convert(ye),ie))}finally{let Ee=v!==null?be.get(v).__webglFramebuffer:null;ge.bindFramebuffer(R.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=async function(M,L,B,z,U,ie,le,me=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ue=be.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&le!==void 0&&(ue=ue[le]),ue)if(L>=0&&L<=M.width-z&&B>=0&&B<=M.height-U){ge.bindFramebuffer(R.FRAMEBUFFER,ue);let Ee=M.textures[me],Ie=Ee.format,ye=Ee.type;if(!at.textureFormatReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!at.textureTypeReadable(ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ge=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,Ge),R.bufferData(R.PIXEL_PACK_BUFFER,ie.byteLength,R.STREAM_READ),M.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+me),R.readPixels(L,B,z,U,Pe.convert(Ie),Pe.convert(ye),0);let Qe=v!==null?be.get(v).__webglFramebuffer:null;ge.bindFramebuffer(R.FRAMEBUFFER,Qe);let mt=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await Uh(R,mt,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,Ge),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,ie),R.deleteBuffer(Ge),R.deleteSync(mt),ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,L=null,B=0){let z=Math.pow(2,-B),U=Math.floor(M.image.width*z),ie=Math.floor(M.image.height*z),le=L!==null?L.x:0,me=L!==null?L.y:0;Le.setTexture2D(M,0),R.copyTexSubImage2D(R.TEXTURE_2D,B,0,0,le,me,U,ie),ge.unbindTexture()};let ku=R.createFramebuffer(),Bu=R.createFramebuffer();this.copyTextureToTexture=function(M,L,B=null,z=null,U=0,ie=null){ie===null&&(U!==0?(rs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ie=U,U=0):ie=0);let le,me,ue,Ee,Ie,ye,Ge,Qe,mt,gt=M.isCompressedTexture?M.mipmaps[ie]:M.image;if(B!==null)le=B.max.x-B.min.x,me=B.max.y-B.min.y,ue=B.isBox3?B.max.z-B.min.z:1,Ee=B.min.x,Ie=B.min.y,ye=B.isBox3?B.min.z:0;else{let ii=Math.pow(2,-U);le=Math.floor(gt.width*ii),me=Math.floor(gt.height*ii),M.isDataArrayTexture?ue=gt.depth:M.isData3DTexture?ue=Math.floor(gt.depth*ii):ue=1,Ee=0,Ie=0,ye=0}z!==null?(Ge=z.x,Qe=z.y,mt=z.z):(Ge=0,Qe=0,mt=0);let tt=Pe.convert(L.format),we=Pe.convert(L.type),ut;L.isData3DTexture?(Le.setTexture3D(L,0),ut=R.TEXTURE_3D):L.isDataArrayTexture||L.isCompressedArrayTexture?(Le.setTexture2DArray(L,0),ut=R.TEXTURE_2D_ARRAY):(Le.setTexture2D(L,0),ut=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,L.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,L.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,L.unpackAlignment);let $e=R.getParameter(R.UNPACK_ROW_LENGTH),$t=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Vn=R.getParameter(R.UNPACK_SKIP_PIXELS),Zt=R.getParameter(R.UNPACK_SKIP_ROWS),vs=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,gt.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,gt.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Ee),R.pixelStorei(R.UNPACK_SKIP_ROWS,Ie),R.pixelStorei(R.UNPACK_SKIP_IMAGES,ye);let ft=M.isDataArrayTexture||M.isData3DTexture,Vt=L.isDataArrayTexture||L.isData3DTexture;if(M.isDepthTexture){let ii=be.get(M),Ut=be.get(L),Ht=be.get(ii.__renderTarget),Po=be.get(Ut.__renderTarget);ge.bindFramebuffer(R.READ_FRAMEBUFFER,Ht.__webglFramebuffer),ge.bindFramebuffer(R.DRAW_FRAMEBUFFER,Po.__webglFramebuffer);for(let gn=0;gn<ue;gn++)ft&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,be.get(M).__webglTexture,U,ye+gn),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,be.get(L).__webglTexture,ie,mt+gn)),R.blitFramebuffer(Ee,Ie,le,me,Ge,Qe,le,me,R.DEPTH_BUFFER_BIT,R.NEAREST);ge.bindFramebuffer(R.READ_FRAMEBUFFER,null),ge.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(U!==0||M.isRenderTargetTexture||be.has(M)){let ii=be.get(M),Ut=be.get(L);ge.bindFramebuffer(R.READ_FRAMEBUFFER,ku),ge.bindFramebuffer(R.DRAW_FRAMEBUFFER,Bu);for(let Ht=0;Ht<ue;Ht++)ft?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,ii.__webglTexture,U,ye+Ht):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,ii.__webglTexture,U),Vt?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Ut.__webglTexture,ie,mt+Ht):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Ut.__webglTexture,ie),U!==0?R.blitFramebuffer(Ee,Ie,le,me,Ge,Qe,le,me,R.COLOR_BUFFER_BIT,R.NEAREST):Vt?R.copyTexSubImage3D(ut,ie,Ge,Qe,mt+Ht,Ee,Ie,le,me):R.copyTexSubImage2D(ut,ie,Ge,Qe,Ee,Ie,le,me);ge.bindFramebuffer(R.READ_FRAMEBUFFER,null),ge.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else Vt?M.isDataTexture||M.isData3DTexture?R.texSubImage3D(ut,ie,Ge,Qe,mt,le,me,ue,tt,we,gt.data):L.isCompressedArrayTexture?R.compressedTexSubImage3D(ut,ie,Ge,Qe,mt,le,me,ue,tt,gt.data):R.texSubImage3D(ut,ie,Ge,Qe,mt,le,me,ue,tt,we,gt):M.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,ie,Ge,Qe,le,me,tt,we,gt.data):M.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,ie,Ge,Qe,gt.width,gt.height,tt,gt.data):R.texSubImage2D(R.TEXTURE_2D,ie,Ge,Qe,le,me,tt,we,gt);R.pixelStorei(R.UNPACK_ROW_LENGTH,$e),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,$t),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Vn),R.pixelStorei(R.UNPACK_SKIP_ROWS,Zt),R.pixelStorei(R.UNPACK_SKIP_IMAGES,vs),ie===0&&L.generateMipmaps&&R.generateMipmap(ut),ge.unbindTexture()},this.initRenderTarget=function(M){be.get(M).__webglFramebuffer===void 0&&Le.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Le.setTextureCube(M,0):M.isData3DTexture?Le.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Le.setTexture2DArray(M,0):Le.setTexture2D(M,0),ge.unbindTexture()},this.resetState=function(){D=0,y=0,v=null,ge.reset(),P.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=qe._getUnpackColorSpace()}};var vu=Do(gu(),1),{VisualPoseHistory:y_,CANONICAL_AZIMUTH:vl,CAMERA_ROTATION_STEP:b_,normalizeAzimuth:M_,cameraOffset:S_}=vu.default,vo={resident:9812144,officer:6664179,medic:15986401,hospitalStaff:11657941,ambulance:15657693,police:4491447},dr=(n,e,t)=>Math.max(e,Math.min(t,n)),xu=n=>typeof n=="number"&&Number.isFinite(n),w_=n=>n.visibility==="reported"||n.visibility==="confirmed",yl=n=>{let e=2166136261;for(let t of String(n))e=Math.imul(e^t.charCodeAt(0),16777619);return e>>>0};function bl(n){let e=new Set,t=new Set;n.traverse(i=>{i.isInstancedMesh&&i.dispose(),i.geometry&&e.add(i.geometry);for(let s of[].concat(i.material||[]))t.add(s)});for(let i of e)i.dispose();for(let i of t)i.dispose()}function _u(n,e){let t=[];for(let s of n||[]){let r=s.points||[];for(let a=1;a<r.length;a++){let o=r[a-1],c=r[a],l=Math.hypot(c.x-o.x,c.z-o.z);if(!l)continue;let h=(s.width||1)/2,u=-(c.z-o.z)/l*h,d=(c.x-o.x)/l*h,p=[[o.x+u,e,o.z+d],[o.x-u,e,o.z-d],[c.x+u,e,c.z+d],[c.x-u,e,c.z-d]];for(let g of[0,2,1,1,2,3])t.push(...p[g])}}let i=new vt;return i.setAttribute("position",new Je(t,3)),i.computeVertexNormals(),i}function Pi(n,e){return(n||[]).find(t=>t.id===e)}var yo=class{constructor({container:e,canvas:t,onSelect:i}={}){if(!e)throw new Error("\xC9 necess\xE1rio um contentor para observar a cidade.");this.container=e,this.canvas=t||document.createElement("canvas"),this.ownsCanvas=!t,this.onSelect=i,t||e.append(this.canvas),this.canvas.style.cssText+=";display:block;width:100%;height:100%;touch-action:none;",this.canvas.tabIndex=0,this.canvas.setAttribute("aria-label","Cidade viva tridimensional. Arrastar move a c\xE2mara; roda amplia; clique seleciona pessoa, ve\xEDculo, edif\xEDcio ou ocorr\xEAncia."),getComputedStyle(e).position==="static"&&(e.style.position="relative");let s=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!0,stencil:!1,powerPreference:"high-performance"});if(!s)throw this.ownsCanvas&&this.canvas.remove(),new Error("WebGL 2 n\xE3o est\xE1 dispon\xEDvel neste navegador.");this.renderer=new go({canvas:this.canvas,context:s,alpha:!1,antialias:!1}),this.renderer.outputColorSpace=Ft,this.scene=new Hs,this.scene.background=new Ce(1121832),this.scene.add(new js(14151423,2832437,2));let r=new Qs(16772559,2.2);r.position.set(-35,80,42),this.scene.add(r),this.camera=new Ln(-60,60,45,-45,.1,500),this.target=new F(47,0,34),this.cameraOffset=new F(68,88,68),this.azimuth=vl,this.rotationSteps=0,this.poseHistory=new y_,this.visualAlpha=1,this.drawnPoses={people:new Map,vehicles:new Map},this.raycaster=new er,this.pointerNdc=new Oe,this.ground=new oi(new F(0,1,0),0),this.dummy=new bt,this.cityGroup=new gi,this.liveGroup=new gi,this.scene.add(this.cityGroup,this.liveGroup),this.city=null,this.cityKey=null,this.widthWorld=94,this.heightWorld=68,this.state=null,this.disposed=!1,this.selected=null,this.follow=null,this.followOffset={x:0,z:0},this.debug=!1,this.reducedEffects=!1,this.pointer=null,this.layers={people:!0,vehicles:!0,buildings:!0,services:!0,incidents:!0,routes:!1,health:!1,risk:!1},this.labels=document.createElement("div"),this.labels.style.cssText="position:absolute;inset:0;overflow:hidden;pointer-events:none;",this.labels.setAttribute("aria-hidden","true"),e.append(this.labels),this.labelMap=new Map,this.peopleCapacity=0,this.vehicleCapacity=0,this.incidentCapacity=0,this.peopleBodies=null,this.vehicleBodies=null,this.incidentMarkers=null,this.peopleIds=[],this.vehicleIds=[],this.incidentIds=[],this.lastTick=-1,this.lastEventId=0,this.seenEvents=new Set,this.shotEffects=[],this.effectsConsumed=0,this.effectsRendered=0,this._createOverlays(),this._bindInput(),this.resize(),this.resetCamera(),this.resizeObserver=typeof ResizeObserver=="function"?new ResizeObserver(()=>this.resize()):null,this.resizeObserver?.observe(e),this.windowResize=()=>this.resize(),window.addEventListener("resize",this.windowResize);let a=s.getExtension("WEBGL_debug_renderer_info");this.gpu={vendor:s.getParameter(a?a.UNMASKED_VENDOR_WEBGL:s.VENDOR),renderer:s.getParameter(a?a.UNMASKED_RENDERER_WEBGL:s.RENDERER),version:s.getParameter(s.VERSION),timerQuerySupported:!!s.getExtension("EXT_disjoint_timer_query_webgl2")},this.metrics={}}_createOverlays(){this.selectionMarker=new Tt(new Pn(.5,.65,32),new Ot({color:16768909,side:Lt,depthTest:!1,transparent:!0,opacity:.9})),this.selectionMarker.rotation.x=-Math.PI/2,this.selectionMarker.renderOrder=9,this.selectionMarker.visible=!1,this.liveGroup.add(this.selectionMarker),this.route=new hs(new vt,new Cn({color:16768909,transparent:!0,opacity:.9,depthTest:!1})),this.route.renderOrder=8,this.route.frustumCulled=!1,this.liveGroup.add(this.route),this.routeKey=null,this.symptoms=new yt(new In(.14,0),new Ot({color:16761440}),512),this.symptoms.instanceMatrix.setUsage(Ii),this.symptoms.frustumCulled=!1,this.symptoms.count=0,this.liveGroup.add(this.symptoms),this.flash=new yt(new In(.2,0),new Ot({color:16770208,depthTest:!1}),32),this.flash.instanceMatrix.setUsage(Ii),this.flash.frustumCulled=!1,this.flash.count=0,this.flash.renderOrder=10,this.liveGroup.add(this.flash),this.impacts=new yt(new Pn(.08,.2,10),new Ot({color:16760180,side:Lt,transparent:!0,opacity:.7}),32),this.impacts.instanceMatrix.setUsage(Ii),this.impacts.frustumCulled=!1,this.impacts.count=0,this.liveGroup.add(this.impacts),this.tracerPositions=new Float32Array(192),this.tracerColors=new Float32Array(192);let e=new vt;e.setAttribute("position",new It(this.tracerPositions,3).setUsage(Ii)),e.setAttribute("color",new It(this.tracerColors,3).setUsage(Ii)),e.setDrawRange(0,0),this.tracers=new hs(e,new Cn({vertexColors:!0,transparent:!0,opacity:.8,depthTest:!1})),this.tracers.frustumCulled=!1,this.tracers.renderOrder=10,this.liveGroup.add(this.tracers)}_replaceDynamic(e,t){let i=this[e];return i&&(this.liveGroup.remove(i),bl(i)),this[e]=t,this.liveGroup.add(t),t}_ensurePeople(e){if(this.peopleBodies&&e<=this.peopleCapacity)return;this.peopleCapacity=Math.max(32,e,this.state?.people?.length||0);let t=new yt(new Ys(.24,.52,2,6),new Bt({color:16777215}),this.peopleCapacity),i=new yt(new Zs(.2,6,4),new Bt({color:15785152}),this.peopleCapacity),s=new yt(new Pn(.27,.39,12),new Ot({color:16777215,transparent:!0,opacity:.9,side:Lt}),this.peopleCapacity);for(let r of[t,i,s])r.instanceMatrix.setUsage(Ii),r.frustumCulled=!1,r.count=0;this._replaceDynamic("peopleBodies",t),this._replaceDynamic("peopleHeads",i),this._replaceDynamic("peopleHalos",s)}_ensureVehicles(e){if(this.vehicleBodies&&e<=this.vehicleCapacity)return;this.vehicleCapacity=Math.max(8,e);let t=new yt(new kt(1,1,1),new Bt({color:16777215}),this.vehicleCapacity),i=new yt(new kt(1,1,1),new Bt({color:16777215}),this.vehicleCapacity),s=new yt(new $s(.19,.19,.14,8),new Bt({color:1384747}),this.vehicleCapacity*4),r=new yt(new kt(.2,.09,.24),new Ot({color:16777215}),this.vehicleCapacity*2);for(let a of[t,i,s,r])a.instanceMatrix.setUsage(Ii),a.frustumCulled=!1,a.count=0;this._replaceDynamic("vehicleBodies",t),this._replaceDynamic("vehicleRoofs",i),this._replaceDynamic("vehicleWheels",s),this._replaceDynamic("vehicleLights",r)}_ensureIncidents(e){if(this.incidentMarkers&&e<=this.incidentCapacity)return;this.incidentCapacity=Math.max(16,2**Math.ceil(Math.log2(Math.max(1,e))));let t=new yt(new In(.31),new Ot({color:16777215,depthTest:!1}),this.incidentCapacity);t.instanceMatrix.setUsage(Ii),t.frustumCulled=!1,t.renderOrder=7,t.count=0,this._replaceDynamic("incidentMarkers",t)}_node(e,t){return e?.nodes?.find(i=>i.id===t)}_position(e){return e?e.location?this.drawnPoses.people.get(e.id)||null:this.drawnPoses.vehicles.get(e.id)||null:null}captureTick(e){return this.poseHistory.captureTick(e)}snapToState(e){this.poseHistory.snapToState(e)}_prepareVisualPoses(e,t){this.poseHistory.getSummary().currentTick!==e.tick&&this.poseHistory.captureTick(e),this.visualAlpha=t,this.drawnPoses={people:new Map,vehicles:new Map};for(let s of e.people||[]){let r=this.poseHistory.getVisualPose("person",s.id,t);r&&this.drawnPoses.people.set(s.id,r)}for(let s of e.vehicles||[]){let r=this.poseHistory.getVisualPose("vehicle",s.id,t);r&&this.drawnPoses.vehicles.set(s.id,r)}}_buildCity(e){bl(this.cityGroup),this.scene.remove(this.cityGroup),this.cityGroup=new gi,this.scene.add(this.cityGroup),this.city=e,this.widthWorld=e.width,this.heightWorld=e.height;let t=new Tt(new Rn(e.width+6,e.height+6),new Bt({color:2833720}));t.rotation.x=-Math.PI/2,t.position.set(e.width/2,-.06,e.height/2),this.cityGroup.add(t),this.roadMesh=new Tt(_u(e.roads,.005),new Bt({color:2503483,side:Lt})),this.cityGroup.add(this.roadMesh),this.sidewalkMesh=new Tt(_u(e.sidewalks||[],.04),new Bt({color:9082256,side:Lt})),this.cityGroup.add(this.sidewalkMesh);let i=[];for(let l of e.crossings||[])for(let h=1;h<(l.points||[]).length;h++){let u=l.points[h-1],d=l.points[h],p=Math.hypot(d.x-u.x,d.z-u.z),g=Math.atan2(d.x-u.x,d.z-u.z),x=String(l.id).startsWith("parking-");for(let m=.35;m<p;m+=x?1.3:.85)i.push({x:u.x+(d.x-u.x)*m/p,z:u.z+(d.z-u.z)*m/p,angle:g,width:(l.width||1.6)*(x?.55:1),length:x?.28:.42,color:x?9281179:14145993})}let s=new yt(new kt(1,1,1),new Ot({color:14145993}),Math.max(1,i.length));s.count=i.length,i.forEach((l,h)=>{this.dummy.position.set(l.x,.06,l.z),this.dummy.rotation.set(0,l.angle,0),this.dummy.scale.set(l.width,.02,l.length),this.dummy.updateMatrix(),s.setMatrixAt(h,this.dummy.matrix),s.setColorAt(h,new Ce(l.color))}),s.instanceMatrix.needsUpdate=!0,s.instanceColor&&(s.instanceColor.needsUpdate=!0),this.cityGroup.add(s);let r=e.buildings||[],a=r.length;this.buildingBodies=new yt(new kt(1,1,1),new Bt({color:16777215}),Math.max(1,a)),this.buildingRoofs=new yt(new kt(1,1,1),new Bt({color:16777215}),Math.max(1,a)),this.buildingBodies.count=a,this.buildingRoofs.count=a;let o=new yt(new kt(1,1,1),new Bt({color:16777215,emissive:1515546,emissiveIntensity:.25}),Math.max(1,a*8));o.count=a*8,this.buildingWindows=o,r.forEach((l,h)=>{let u=l.height||3.2,d=l.id===this.state.facilities?.hospital?.buildingId||l.type==="hospital",p=l.id===this.state.facilities?.station?.buildingId||/police|station/.test(l.type),g=d?12507086:p?7180198:[10133399,8426647,11576980,9346193][yl(l.id)%4];this.dummy.position.set(l.x,u/2,l.z),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(l.width,u,l.depth),this.dummy.updateMatrix(),this.buildingBodies.setMatrixAt(h,this.dummy.matrix),this.buildingBodies.setColorAt(h,new Ce(g)),this.dummy.position.y=u+.1,this.dummy.scale.set(l.width*1.03,.2,l.depth*1.03),this.dummy.updateMatrix(),this.buildingRoofs.setMatrixAt(h,this.dummy.matrix),this.buildingRoofs.setColorAt(h,new Ce(p?3230556:6386798));for(let x=0;x<8;x++)this.dummy.rotation.set(0,0,0),this.dummy.position.set(l.x+(x%4-1.5)*l.width*.19,u*.57,l.z+(x<4?-1:1)*(l.depth/2+.015)),this.dummy.scale.set(l.width*.11,.6,.025),this.dummy.updateMatrix(),o.setMatrixAt(h*8+x,this.dummy.matrix),o.setColorAt(h*8+x,new Ce(yl(l.id+x)%3?13359305:16043650))});for(let l of[this.buildingBodies,this.buildingRoofs,o])l.instanceMatrix.needsUpdate=!0,l.instanceColor&&(l.instanceColor.needsUpdate=!0),this.cityGroup.add(l);let c=[];for(let l of r)for(let h of l.entranceNodeIds||[]){let u=this._node(e.pedestrianGraph,h);u&&c.push({building:l,node:u})}this.portals=new yt(new kt(.7,.06,.6),new Ot({color:16777215}),Math.max(1,c.length)),this.portals.count=c.length,c.forEach(({building:l,node:h},u)=>{this.dummy.position.set(h.x,.085,h.z),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.portals.setMatrixAt(u,this.dummy.matrix),this.portals.setColorAt(u,new Ce(l.type==="hospital"?8514496:13882552))}),this.portals.instanceMatrix.needsUpdate=!0,this.portals.instanceColor&&(this.portals.instanceColor.needsUpdate=!0),this.cityGroup.add(this.portals),this.structuralCounts={buildings:a,roadSegments:(e.roads||[]).reduce((l,h)=>l+Math.max(0,(h.points||[]).length-1),0),sidewalks:(e.sidewalks||[]).length,crossings:(e.crossings||[]).length,entrances:c.length},this.resetCamera()}_knownPeople(){let e=new Map;for(let t of this.state.people||[])t.observedSymptoms?.length&&e.set(t.id,"symptoms");for(let t of this.state.incidents||[])if(t.reportedAt!==null&&t.reportedAt!==void 0){let i=[...t.knownFacts||[],...t.confirmedFacts||[]].join(" ").toLowerCase();t.type==="violence"||/aggress|hostil|reanim|ameaça/.test(i)?e.set(t.personId,"threat"):i&&e.set(t.personId,"symptoms")}for(let t of this.state.people||[])for(let i of t.knownThreats||[])e.set(typeof i=="string"?i:i.personId,"threat");return e}_personColor(e,t){if(this.debug){if(e.lifeState==="reanimated")return 15758193;if(e.lifeState==="neutralized"||e.lifeState==="dead")return 7106677;if(e.healthState==="critical")return 15700589;if(["exposed","infected","symptomatic"].includes(e.healthState))return 14136431}return t.get(e.id)==="threat"?15372150:e.role!=="resident"?vo[e.role]||vo.resident:[10993594,12168323,9156285,12892326,10398655][yl(e.id)%5]}_drawPeople(e){let t=(this.state.people||[]).filter(s=>s.location?.kind==="street");this._ensurePeople(t.length),this.peopleIds=t.map(s=>s.id),this.peopleBodies.count=t.length,this.peopleHeads.count=t.length,this.peopleHalos.count=t.length;let i=0;t.forEach((s,r)=>{let a=this._position(s);if(!a)return;let o=s.lifeState==="dead"||s.lifeState==="neutralized",c=new Ce(this._personColor(s,e));this.dummy.position.set(a.x,o?.25:.6,a.z),this.dummy.rotation.set(0,0,o?Math.PI/2:0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.peopleBodies.setMatrixAt(r,this.dummy.matrix),this.peopleBodies.setColorAt(r,c),this.dummy.rotation.set(0,0,0),this.dummy.position.set(a.x+(o?.53:0),o?.25:1.25,a.z),this.dummy.updateMatrix(),this.peopleHeads.setMatrixAt(r,this.dummy.matrix),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.position.set(a.x,.105,a.z),this.dummy.updateMatrix(),this.peopleHalos.setMatrixAt(r,this.dummy.matrix),this.peopleHalos.setColorAt(r,c),e.has(s.id)&&i<512&&(this.dummy.rotation.set(0,0,0),this.dummy.position.y=1.78,this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.symptoms.setMatrixAt(i++,this.dummy.matrix))});for(let s of[this.peopleBodies,this.peopleHeads,this.peopleHalos])s.instanceMatrix.needsUpdate=!0,s.boundingSphere=null,s.instanceColor&&(s.instanceColor.needsUpdate=!0),s.visible=this.layers.people;return this.symptoms.count=i,this.symptoms.instanceMatrix.needsUpdate=!0,this.symptoms.visible=this.layers.people&&this.layers.risk,t.length}_drawVehicles(){let e=this.state.vehicles||[];this._ensureVehicles(e.length),this.vehicleIds=e.map(t=>t.id),this.vehicleBodies.count=e.length,this.vehicleRoofs.count=e.length,this.vehicleWheels.count=e.length*4,this.vehicleLights.count=e.length*2,e.forEach((t,i)=>{let s=this._position(t),r=this._node(this.city.vehicleGraph,t.path?.[0]),a=r?Math.atan2(r.x-s.x,r.z-s.z):0,o=t.type==="ambulance",c=o?2.2:1.8;this.dummy.position.set(s.x,.47,s.z),this.dummy.rotation.set(0,a,0),this.dummy.scale.set(.95,.62,c),this.dummy.updateMatrix(),this.vehicleBodies.setMatrixAt(i,this.dummy.matrix),this.vehicleBodies.setColorAt(i,new Ce(o?vo.ambulance:vo.police)),this.dummy.position.y=.94,this.dummy.scale.set(.8,o?.42:.25,o?1.15:.8),this.dummy.updateMatrix(),this.vehicleRoofs.setMatrixAt(i,this.dummy.matrix),this.vehicleRoofs.setColorAt(i,new Ce(o?14476510:9746113));for(let l=0;l<4;l++){let h=l%2?.5:-.5,u=l<2?-c*.32:c*.32;this.dummy.position.set(s.x+h*Math.cos(a)+u*Math.sin(a),.23,s.z-h*Math.sin(a)+u*Math.cos(a)),this.dummy.rotation.set(0,a,Math.PI/2),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.vehicleWheels.setMatrixAt(i*4+l,this.dummy.matrix)}for(let l=0;l<2;l++){let h=l?.2:-.2;this.dummy.position.set(s.x+h*Math.cos(a),o?1.23:1.06,s.z-h*Math.sin(a)),this.dummy.rotation.set(0,a,0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.vehicleLights.setMatrixAt(i*2+l,this.dummy.matrix),this.vehicleLights.setColorAt(i*2+l,new Ce(l?11069684:4423153))}});for(let t of[this.vehicleBodies,this.vehicleRoofs,this.vehicleWheels,this.vehicleLights])t.instanceMatrix.needsUpdate=!0,t.boundingSphere=null,t.instanceColor&&(t.instanceColor.needsUpdate=!0),t.visible=this.layers.vehicles}_visibleIncidents(){return(this.state.incidents||[]).filter(e=>this.debug||e.reportedAt!==null&&e.reportedAt!==void 0)}_drawIncidents(){let e=this._visibleIncidents().filter(t=>!["resolved","cancelled"].includes(t.status));this._ensureIncidents(e.length),this.incidentIds=e.map(t=>t.id),this.incidentMarkers.count=e.length,e.forEach((t,i)=>{this.dummy.position.set(t.x,1.7,t.z),this.dummy.rotation.set(0,0,0),this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),this.incidentMarkers.setMatrixAt(i,this.dummy.matrix),this.incidentMarkers.setColorAt(i,new Ce(t.type==="violence"?15830130:16765060))}),this.incidentMarkers.instanceMatrix.needsUpdate=!0,this.incidentMarkers.boundingSphere=null,this.incidentMarkers.instanceColor&&(this.incidentMarkers.instanceColor.needsUpdate=!0),this.incidentMarkers.visible=this.layers.incidents}_label(e,t,i){let s=this.labelMap.get(e);return s||(s=document.createElement("span"),s.style.cssText="position:absolute;left:0;top:0;pointer-events:none;white-space:nowrap;font:700 10px system-ui,sans-serif;letter-spacing:.025em;padding:4px 6px;border:1px solid;border-radius:3px;background:#10232ce8;",this.labels.append(s),this.labelMap.set(e,s)),s.textContent!==t&&(s.textContent=t),s.style.color=i,s.style.borderColor=i,s}_placeLabel(e,t,i=1.5){let s=this.project(t.x,t.z,i);e.style.display=s.visible?"block":"none",e.style.transform=`translate(${s.x-this.rect.left}px,${s.y-this.rect.top}px) translate(-50%,-125%)`}_entity(e){if(!e||!this.state)return null;if(e.kind==="person"){let t=Pi(this.state.people,e.id);return t?{value:t,position:this._position(t)}:null}if(e.kind==="vehicle"){let t=Pi(this.state.vehicles,e.id);return t?{value:t,position:this._position(t)}:null}if(e.kind==="building"){let t=Pi(this.city.buildings,e.id);return t?{value:t,position:{x:t.x,z:t.z}}:null}if(e.kind==="incident"){let t=Pi(this._visibleIncidents(),e.id);return t?{value:t,position:{x:t.x,z:t.z}}:null}return null}_drawSelection(e){let t=this._entity(this.selected);if(this.selectionMarker.visible=!!t?.position,t?.position){let c=t.position;this.selectionMarker.position.set(c.x,.13,c.z),this.selectionMarker.material.opacity=c.hidden?.45:.9,this.selectionMarker.scale.setScalar(this.selected.kind==="building"?2.7:this.selected.kind==="vehicle"?1.7:1);let l=t.value,h=l.name||l.id,u=c.hidden?` \xB7 INTERIOR: ${c.description} \xB7 ${c.inside==="vehicle"?"posi\xE7\xE3o da viatura":"marcador de entrada"}`:this.selected.kind==="person"?" \xB7 pessoa vis\xEDvel":this.selected.kind==="vehicle"?` \xB7 ${l.type==="ambulance"?"ambul\xE2ncia":"pol\xEDcia"}`:"",d=this._label("selection",h+u,"#ffe2a1");this._placeLabel(d,c,this.selected.kind==="building"?(l.height||3)+.8:1.7),e.add("selection")}let i=[],s,r=t?.position;if(t&&this.layers.routes){if(this.selected.kind==="person"){let c=t.value.location?.kind==="vehicle"?Pi(this.state.vehicles,t.value.location.vehicleId):null;i=c?.path||t.value.path||[],s=c?this.city.vehicleGraph:this.city.pedestrianGraph}else if(this.selected.kind==="vehicle")i=t.value.path||[],s=this.city.vehicleGraph;else if(this.selected.kind==="incident"){let c=Pi(this.state.patrols,t.value.assignedPatrolId),l=Pi(this.state.vehicles,t.value.assignedAmbulanceId)||Pi(this.state.vehicles,c?.vehicleId);l&&(i=l.path||[],s=this.city.vehicleGraph,r=this._position(l))}}let a=s?i.map(c=>this._node(s,c)).filter(Boolean):[];a.length&&r&&a.unshift(r);let o=a.map(c=>`${c.x},${c.z}`).join(";");if(o!==this.routeKey){let c=[];for(let l=1;l<a.length;l++)c.push(new F(a[l-1].x,.19,a[l-1].z),new F(a[l].x,.19,a[l].z));this.route.geometry.dispose(),this.route.geometry=new vt().setFromPoints(c),this.routeKey=o}this.route.visible=this.layers.routes&&a.length>1}_drawFacilities(e){if(this.layers.services)for(let[t,i,s]of[["hospital","+ HOSPITAL","#9bf1cc"],["station","POL\xCDCIA","#9ccdf1"]]){let r=Pi(this.city.buildings,this.state.facilities?.[t]?.buildingId);if(!r)continue;let a="facility:"+t,o=this._label(a,i,s);this._placeLabel(o,r,(r.height||3)+.7),e.add(a)}}_shotPresentation(e){for(let r of this.state.events||[]){if(Number.isSafeInteger(r.eventId)){if(r.eventId<=this.lastEventId)continue;this.lastEventId=r.eventId}else if(r.type==="ShotFired"){if(this.seenEvents.has(r.eventId))continue;this.seenEvents.add(r.eventId)}if(r.type!=="ShotFired"||(this.effectsConsumed++,!this.debug&&!w_(r))||(this.state.tick??0)-(r.tick??0)>3)continue;let a=r.position,o=r.targetPosition||this._position(Pi(this.state.people,r.targetId));a&&o&&[a.x,a.z,o.x,o.z].every(xu)&&(this.shotEffects.push({eventId:r.eventId,from:{x:a.x,z:a.z},to:{x:o.x,z:o.z},startedAt:e,hit:r.hitOutcome==="hit"||r.hitOutcome===!0}),this.effectsRendered++)}this.shotEffects=this.shotEffects.filter(r=>e-r.startedAt<220).slice(-32);let t=0,i=0,s=0;for(let r of this.shotEffects){let a=e-r.startedAt;if(!this.reducedEffects&&a<65&&(this.dummy.position.set(r.from.x,.9,r.from.z),this.dummy.rotation.set(0,0,0),this.dummy.scale.setScalar(1-a/65),this.dummy.updateMatrix(),this.flash.setMatrixAt(t++,this.dummy.matrix)),a<130){let o=i*6;this.tracerPositions.set([r.from.x,.9,r.from.z,r.to.x,.65,r.to.z],o);let c=(1-a/130)*(this.reducedEffects?.3:1);this.tracerColors.set([c,.8*c,.5*c,c,.8*c,.5*c],o),i++}!this.reducedEffects&&r.hit&&a<180&&(this.dummy.position.set(r.to.x,.17,r.to.z),this.dummy.rotation.set(-Math.PI/2,0,0),this.dummy.scale.setScalar(.6+a/160),this.dummy.updateMatrix(),this.impacts.setMatrixAt(s++,this.dummy.matrix))}this.flash.count=t,this.flash.instanceMatrix.needsUpdate=!0,this.impacts.count=s,this.impacts.instanceMatrix.needsUpdate=!0,this.tracers.geometry.attributes.position.needsUpdate=!0,this.tracers.geometry.attributes.color.needsUpdate=!0,this.tracers.geometry.setDrawRange(0,i*2),this.currentShotEffects={flashes:t,tracers:i,impacts:s}}render(e,t=1){if(this.disposed||!e?.city)return;let i=performance.now();if(!xu(t))throw new TypeError("Visual alpha must be finite.");t=dr(t,0,1),this.state!==e&&(this.seenEvents.clear(),this.lastEventId=0,this.shotEffects=[],this.effectsConsumed=0,this.effectsRendered=0,this.lastTick=-1,this.poseHistory.captureTick(e)),this.state=e;let r=e.city,a=`${e.seed}:${r.width}:${r.height}:${r.buildings?.length}:${r.pedestrianGraph?.nodes?.length}`;a!==this.cityKey?(this.cityKey=a,this._buildCity(r)):this.city=r,e.tick<this.lastTick&&(this.seenEvents.clear(),this.lastEventId=0,this.shotEffects=[],this.effectsConsumed=0,this.effectsRendered=0),this.lastTick=e.tick,this._prepareVisualPoses(e,t);let o=this._entity(this.follow);o?.position&&(this.target.x=o.position.x+this.followOffset.x,this.target.z=o.position.z+this.followOffset.z,this._updateCamera()),this.rect=this.canvas.getBoundingClientRect();let c=this._knownPeople(),l=this._drawPeople(c);this._drawVehicles(),this._drawIncidents(),this.buildingBodies.visible=this.layers.buildings,this.buildingRoofs.visible=this.layers.buildings,this.buildingWindows.visible=this.layers.buildings,this.portals.visible=this.layers.buildings;let h=new Set;this._drawFacilities(h),this._drawSelection(h);for(let[d,p]of this.labelMap)h.has(d)||(p.remove(),this.labelMap.delete(d));this._shotPresentation(performance.now()),this.renderer.render(this.scene,this.camera);let u={street:0,building:0,vehicle:0,hospital:0};for(let d of e.people||[])u[d.location?.kind]=(u[d.location?.kind]||0)+1;this.metrics={...this.structuralCounts,logicalPeople:e.people?.length||0,renderedPeople:this.layers.people?l:0,peopleByLocation:u,logicalVehicles:e.vehicles?.length||0,renderedVehicles:this.layers.vehicles&&e.vehicles?.length||0,reportedIncidents:this.incidentIds.length,renderCpuMs:performance.now()-i,alpha:t,shotEventsConsumed:this.effectsConsumed,shotEventsRendered:this.effectsRendered,shotEffects:{...this.currentShotEffects}}}setSelected(e){this.selected=e?{kind:e.kind,id:e.id}:null}setFollow(e){this.follow=e?{kind:e.kind,id:e.id}:null,this.followOffset={x:0,z:0},e&&(this.camera.zoom=Math.max(this.camera.zoom,e.kind==="person"?2.8:e.kind==="vehicle"?2.2:1.8),this._updateCamera())}setLayer(e,t){e={population:"people",agents:"people",service:"services",occurrences:"incidents",paths:"routes",health:"risk"}[e]||e,Object.hasOwn(this.layers,e)&&(this.layers[e]=!!t)}setDebug(e){this.debug=!!e}setReducedEffects(e){this.reducedEffects=!!e}resize(){if(this.disposed)return;let e=this.container.getBoundingClientRect();this.width=Math.max(1,e.width||640),this.height=Math.max(1,e.height||480),this.dpr=dr(window.devicePixelRatio||1,1,2),this.renderer.setPixelRatio(this.dpr),this.renderer.setSize(this.width,this.height,!1),this.rect=this.canvas.getBoundingClientRect(),this._updateCamera()}_updateCamera(){let e=Math.max(this.widthWorld,this.heightWorld)*1.02,t=(this.width||640)/(this.height||480),i=S_(this.azimuth);this.cameraOffset.set(i.x,i.y,i.z),this.camera.left=-e*t/2,this.camera.right=e*t/2,this.camera.top=e/2,this.camera.bottom=-e/2,this.camera.position.copy(this.target).add(this.cameraOffset),this.camera.lookAt(this.target),this.camera.updateProjectionMatrix(),this.camera.updateMatrixWorld()}rotateCamera(e){if(e!==-1&&e!==1)throw new TypeError("Camera rotation must be -1 or +1.");return this.rotationSteps=((this.rotationSteps+e)%24+24)%24,this.azimuth=M_(vl+this.rotationSteps*b_),this._updateCamera(),this.azimuth}resetCamera(){this.follow=null,this.followOffset={x:0,z:0},this.target.set(this.widthWorld/2,0,this.heightWorld/2),this.camera.zoom=1,this.rotationSteps=0,this.azimuth=vl,this._updateCamera()}project(e,t,i=0){let s=new F(e,i,t).project(this.camera),r=this.canvas.getBoundingClientRect();return{x:r.left+(s.x+1)*r.width/2,y:r.top+(1-s.y)*r.height/2,visible:s.z>=-1&&s.z<=1&&Math.abs(s.x)<=1.05&&Math.abs(s.y)<=1.05}}projectEntity(e,t){let i=this._entity({kind:e,id:t});return i?.position?this.project(i.position.x,i.position.z,e==="person"?.6:e==="vehicle"?.65:e==="incident"?1.7:e==="building"?(i.value.height||3)/2:0):null}getVisualPose(e,t){if(e==="person"||e==="vehicle"){let s=this.drawnPoses[e==="person"?"people":"vehicles"].get(t);return s?{...s}:null}let i=this._entity({kind:e,id:t});return i?.position?{kind:e,id:t,...i.position,interpolated:!1,currentTick:this.state.tick,previousTick:this.state.tick}:null}_groundAt(e,t){let i=this.canvas.getBoundingClientRect();return this.pointerNdc.set((e-i.left)/i.width*2-1,1-(t-i.top)/i.height*2),this.raycaster.setFromCamera(this.pointerNdc,this.camera),this.raycaster.ray.intersectPlane(this.ground,new F)}_pick(e,t){let i=this._groundAt(e,t);if(!i)return null;let s=[this.peopleBodies,this.peopleHeads,this.vehicleBodies,this.vehicleRoofs,this.incidentMarkers,this.buildingBodies].filter(a=>a?.visible),r=this.raycaster.intersectObjects(s,!1);for(let a of r){let o=a.instanceId;if(o!==void 0){if(a.object===this.peopleBodies||a.object===this.peopleHeads)return{kind:"person",id:this.peopleIds[o]};if(a.object===this.vehicleBodies||a.object===this.vehicleRoofs)return{kind:"vehicle",id:this.vehicleIds[o]};if(a.object===this.incidentMarkers)return{kind:"incident",id:this.incidentIds[o]};if(a.object===this.buildingBodies)return{kind:"building",id:this.city.buildings[o].id}}}if(this.layers.people){let a=(this.state?.people||[]).filter(o=>o.location?.kind==="street").find(o=>{let c=this._position(o);return c&&Math.hypot(c.x-i.x,c.z-i.z)<.42});if(a)return{kind:"person",id:a.id}}if(this.layers.vehicles){let a=(this.state?.vehicles||[]).find(o=>{let c=this._position(o);return c&&Math.hypot(c.x-i.x,c.z-i.z)<1});if(a)return{kind:"vehicle",id:a.id}}if(this.layers.buildings)for(let a of this.city?.buildings||[])for(let o of a.entranceNodeIds||[]){let c=this._node(this.city.pedestrianGraph,o);if(c&&Math.hypot(c.x-i.x,c.z-i.z)<.7)return{kind:"building",id:a.id}}return null}_pan(e){this.target.x=dr(this.target.x+e.x,-this.widthWorld*.2,this.widthWorld*1.2),this.target.z=dr(this.target.z+e.z,-this.heightWorld*.2,this.heightWorld*1.2);let t=this._entity(this.follow);t?.position&&(this.followOffset={x:this.target.x-t.position.x,z:this.target.z-t.position.z}),this._updateCamera()}_bindInput(){this.handlers={pointerdown:e=>{this.pointer||![0,1,2].includes(e.button)||(e.preventDefault(),this.canvas.focus({preventScroll:!0}),this.pointer={id:e.pointerId,button:e.button,x:e.clientX,y:e.clientY,ground:this._groundAt(e.clientX,e.clientY),dragged:!1},this.canvas.setPointerCapture(e.pointerId))},pointermove:e=>{let t=this.pointer;if(!(!t||t.id!==e.pointerId)&&(Math.hypot(e.clientX-t.x,e.clientY-t.y)>5&&(t.dragged=!0),t.dragged&&t.ground)){let i=this._groundAt(e.clientX,e.clientY);i&&this._pan(t.ground.clone().sub(i))}},pointerup:e=>{let t=this.pointer;!t||t.id!==e.pointerId||(this.pointer=null,this.canvas.hasPointerCapture(e.pointerId)&&this.canvas.releasePointerCapture(e.pointerId),!t.dragged&&t.button===0&&this.onSelect?.(this._pick(e.clientX,e.clientY)))},pointercancel:()=>{this.pointer=null},contextmenu:e=>e.preventDefault(),wheel:e=>{e.preventDefault();let t=this._groundAt(e.clientX,e.clientY);this.camera.zoom=dr(this.camera.zoom*Math.exp(-e.deltaY*.0012),.55,5.5),this._updateCamera();let i=this._groundAt(e.clientX,e.clientY);t&&i&&this._pan(t.sub(i))}};for(let[e,t]of Object.entries(this.handlers))this.canvas.addEventListener(e,t,{passive:!1})}getMetrics(){return{...this.metrics,renderer:`Three.js r${"181"} / WebGL 2`,webgl2:!0,gpu:{...this.gpu},drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,memory:{geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures},dpr:this.dpr,resolution:{cssWidth:this.width,cssHeight:this.height,bufferWidth:this.canvas.width,bufferHeight:this.canvas.height},camera:{target:{x:this.target.x,z:this.target.z},zoom:this.camera.zoom,azimuthRadians:this.azimuth,azimuthDegrees:this.azimuth*180/Math.PI,rotationStepDegrees:15},interpolation:{...this.poseHistory.getSummary(),alpha:this.visualAlpha,tickMilliseconds:100},selected:this.selected?{...this.selected}:null,follow:this.follow?{...this.follow}:null,debug:this.debug,reducedEffects:this.reducedEffects,representation:"One street-person body per canonical identity; building/vehicle occupants remain counted and hidden. Selection markers at entrances are not extra people."}}dispose(){if(!this.disposed){this.disposed=!0;for(let[e,t]of Object.entries(this.handlers))this.canvas.removeEventListener(e,t);this.resizeObserver?.disconnect(),window.removeEventListener("resize",this.windowResize),this.labels.remove(),bl(this.scene),this.renderer.dispose(),this.renderer.forceContextLoss(),this.ownsCanvas&&this.canvas.remove(),this.labelMap.clear(),this.state=null,this.city=null,this.shotEffects=[],this.seenEvents.clear(),this.drawnPoses.people.clear(),this.drawnPoses.vehicles.clear()}}};var bo=class{constructor({volume:e=.35,muted:t=!0,maxVoices:i=6,onStatus:s=()=>{}}={}){this.volume=Number.isFinite(e)?Math.max(0,Math.min(1,e)):.35,this.muted=t!==!1,this.maxVoices=Number.isInteger(i)?Math.max(1,Math.min(12,i)):6,this.onStatus=typeof s=="function"?s:()=>{},this.context=null,this.master=null,this.noiseBuffer=null,this.voices=new Set,this.consumed=new Set,this.played=0,this.suppressed=0,this.lastError=null,this.disposed=!1}getStatus(){let e=typeof(globalThis.AudioContext||globalThis.webkitAudioContext)=="function";return{available:e,muted:this.muted,volume:this.volume,state:this.context?.state||(e?"locked":"unavailable"),activeVoices:this.voices.size,played:this.played,suppressed:this.suppressed,lastError:this.lastError}}_notify(){try{this.onStatus(this.getStatus())}catch{}}async unlock(){if(this.disposed)return!1;try{if(!this.context){let e=globalThis.AudioContext||globalThis.webkitAudioContext;if(typeof e!="function")throw new Error("Web Audio indispon\xEDvel neste navegador.");this.context=new e({latencyHint:"interactive"}),this.master=this.context.createGain(),this.master.gain.value=0,this.master.connect(this.context.destination);let t=Math.ceil(this.context.sampleRate*.14);this.noiseBuffer=this.context.createBuffer(1,t,this.context.sampleRate);let i=this.noiseBuffer.getChannelData(0),s=92711;for(let r=0;r<t;r++)s=Math.imul(s,1664525)+1013904223>>>0,i[r]=(s/2147483648-1)*Math.exp(-r/t*7)}if(this.context.state!=="running"&&await this.context.resume(),this.context.state!=="running")throw new Error("O navegador ainda n\xE3o autorizou o \xE1udio. Volta a ativar o som.");return this.lastError=null,this._notify(),!0}catch(e){return this.muted=!0,this.lastError=e instanceof Error?e.message:"N\xE3o foi poss\xEDvel iniciar o \xE1udio.",this._notify(),!1}}async setMuted(e){return typeof e!="boolean"||this.disposed||!e&&!await this.unlock()?!1:(this.muted=e,this.master&&this.context&&(this.master.gain.cancelScheduledValues(this.context.currentTime),this.master.gain.setTargetAtTime(e?0:this.volume,this.context.currentTime,.015)),e&&this._stopVoices(),this._notify(),!0)}setVolume(e){return!Number.isFinite(e)||e<0||e>1||this.disposed?!1:(this.volume=e,this.master&&this.context&&(this.master.gain.cancelScheduledValues(this.context.currentTime),this.master.gain.setTargetAtTime(this.muted?0:e,this.context.currentTime,.015)),this._notify(),!0)}consume(e,t={x:0,z:0}){if(!Array.isArray(e)||this.disposed)return;let i=0,s=Number.isFinite(t?.x)?t.x:0,r=Number.isFinite(t?.z)?t.z:0;for(let a of e){if(!a||a.type!=="ShotFired"||!["number","string"].includes(typeof a.eventId))continue;let o=String(a.eventId);if(this.consumed.has(o)||(this.consumed.add(o),this.muted||this.volume===0||this.context?.state!=="running"))continue;let c=a.position?.x,l=a.position?.z;if(!Number.isFinite(c)||!Number.isFinite(l))continue;let h=Math.hypot(c-s,l-r),u=1/(1+(h/42)**2);if(h>260||u<.025||i>=2||this.voices.size>=this.maxVoices){this.suppressed++;continue}try{this._shot(u,(c-s)/100,o),i++,this.played++}catch(d){this.lastError=d instanceof Error?d.message:"\xC9 imposs\xEDvel reproduzir o efeito de \xE1udio.",this._notify()}}}_shot(e,t,i){let s=this.context,r=s.currentTime,a=0;for(let g=0;g<i.length;g++)a=Math.imul(a,31)+i.charCodeAt(g)>>>0;let o=s.createBufferSource(),c=s.createBiquadFilter(),l=s.createGain(),h=s.createOscillator(),u=s.createGain(),d=typeof s.createStereoPanner=="function"?s.createStereoPanner():null;o.buffer=this.noiseBuffer,o.playbackRate.value=.93+a%13/100,c.type="highpass",c.frequency.value=650+a%500,l.gain.setValueAtTime(0,r),l.gain.linearRampToValueAtTime(.23*e,r+.0015),l.gain.exponentialRampToValueAtTime(1e-4,r+.11),h.type="sine",h.frequency.setValueAtTime(150+a%38,r),h.frequency.exponentialRampToValueAtTime(65,r+.045),u.gain.setValueAtTime(.1*e,r),u.gain.exponentialRampToValueAtTime(1e-4,r+.065),o.connect(c),c.connect(l),h.connect(u),d?(d.pan.value=Math.max(-.8,Math.min(.8,t)),l.connect(d),u.connect(d),d.connect(this.master)):(l.connect(this.master),u.connect(this.master));let p={source:o,tone:h,nodes:[o,h,c,l,u,d].filter(Boolean)};this.voices.add(p),o.onended=()=>{this.voices.delete(p);for(let g of p.nodes)try{g.disconnect()}catch{}},o.start(r),o.stop(r+.14),h.start(r),h.stop(r+.08)}_stopVoices(){for(let e of this.voices){try{e.source.stop()}catch{}try{e.tone.stop()}catch{}for(let t of e.nodes)try{t.disconnect()}catch{}}this.voices.clear()}reset(){this._stopVoices(),this.consumed.clear(),this.played=0,this.suppressed=0,this._notify()}async dispose(){this.disposed=!0,this._stopVoices(),this.consumed.clear();try{await this.context?.close()}catch{}this.context=null,this.master=null,this.noiseBuffer=null}};var Au=Do(bu(),1),{LivingCity:Cu,positionOf:Tl}=Eu.default,{SimulationClock:T_,BASE_SIMULATION_RATE:Mu}=Au.default,Et=new T_,he=n=>document.getElementById(n),El=n=>`${Math.floor(n/60).toString().padStart(2,"0")}:${Math.floor(n%60).toString().padStart(2,"0")}`,Su=(n,e)=>{let t=[...n].sort((i,s)=>i-s);return t[Math.max(0,Math.ceil(t.length*e)-1)]??0},Ji={frameMs:[],logicMs:[],renderMs:[],poseMs:[]},Mo=(n,e)=>{let t=Ji[n];t.push(e),t.length>6e3&&t.shift()},Iu={resident:"Habitante",officer:"Agente policial",medic:"Tripulante m\xE9dico",hospitalStaff:"Profissional hospitalar"},E_={S0:"Cidade sem surto",S1:"Doen\xE7a progressiva",S2:"Transforma\xE7\xE3o s\xFAbita"},wl=n=>({available:"Dispon\xEDvel",dispatched:"Despachada",enRoute:"Em desloca\xE7\xE3o",onScene:"No local",transporting:"Em transporte",transportRouteWaiting:"Aguardar rota para o hospital",returnRouteWaiting:"Aguardar rota de regresso",handover:"Entrega hospitalar",returning:"A regressar",awaitingPolice:"Aguardar prote\xE7\xE3o policial",blocked:"Impedida / indispon\xEDvel",patrolling:"Em patrulha",responding:"Em resposta",waitingCrew:"Aguardar tripula\xE7\xE3o",collectingCrew:"Recolher tripula\xE7\xE3o",emergencyStop:"Paragem de emerg\xEAncia",unavailable:"Sem capacidade operacional",busy:"Ocupada",waiting:"Em espera",calling:"Chamada em curso",received:"Chamada recebida",triaged:"Triagem conclu\xEDda",assigned:"Meio atribu\xEDdo",assessed:"Avalia\xE7\xE3o conclu\xEDda",resolved:"Encerrada",cancelled:"Cancelada",escalated:"Escalada",residential:"Habita\xE7\xE3o",office:"Trabalho / servi\xE7os",shop:"Com\xE9rcio",hospital:"Hospital",station:"Esquadra"})[n]??n??"\u2014",Ye=new Cu({seed:16927,scenario:"S0"}),nt,Di,Yt=null,fn=!1,yi=!1,So=performance.now(),wu=0,Al=0,ur=0,Cl="",Tu;function wo(n){he("toast").textContent=n,he("toast").classList.remove("hidden"),clearTimeout(Tu),Tu=setTimeout(()=>he("toast").classList.add("hidden"),5e3)}function To(n){if(!n)return null;let e=Ye.state;return({person:e.people,vehicle:e.vehicles,building:e.city.buildings,incident:e.incidents}[n.kind]??[]).find(t=>t.id===n.id)??null}function Il(n){Yt=To(n)?n:null,fn=!1,nt?.setSelected(Yt),nt?.setFollow(null),Io()}function Ru(n=!fn){fn=!!(n&&Yt),nt?.setFollow(fn?Yt:null),Io()}function pr(){return Ye.state.incidents.filter(n=>yi||n.reportedAt!=null||(n.confirmedFacts??[]).length>0)}function A_(){let n=new Set(pr().map(e=>e.id));return Ye.state.events.filter(e=>{if(yi)return!0;if(e.visibility==="truth")return!1;let t=[e.incidentId,...e.entityIds??[]].filter(i=>typeof i=="string"&&i.startsWith("incident-"));return t.length===0||t.some(i=>n.has(i))})}function Co(n){Et.setPaused(n),So=performance.now(),Et.paused&&(nt?.snapToState(Ye.state),nt?.render(Ye.state,1)),pn()}function Pu(n){return Et.setSpeed(n)?(pn(),!0):!1}function Du(n){let e=Ye.step(n);if(e?.ok===!1)throw new Error(e.message);return nt.snapToState(Ye.state),nt.render(Ye.state,1),pn(),Ye.snapshot()}function Eo(n={}){typeof n=="number"&&(n={seed:n});let e=Number(n.seed??he("seed-input").value),t=n.scenario??he("scenario-select").value;try{Ye=new Cu({...n,seed:e,scenario:t}),Et.reset(),Yt=null,fn=!1,ur=0,Cl="",Al=0;for(let s of Object.values(Ji))s.length=0;return he("seed-input").value=String(e),he("scenario-select").value=t,Di?.reset(),nt?.snapToState(Ye.state),nt?.setSelected(null),nt?.setFollow(null),nt?.resetCamera(),nt?.render(Ye.state,1),So=performance.now(),pn(),Ao(),!0}catch(i){return wo(i.message),!1}}function hr(n){he("selection-details").replaceChildren(...n.flatMap(([e,t])=>{let i=document.createElement("dt"),s=document.createElement("dd");return i.textContent=e,s.textContent=String(t??"\u2014"),[i,s]}))}function Io(){let n=To(Yt),e=Ye.state;if(he("selection-title").textContent=n?.name??n?.id??"Acompanha a cidade",he("selection-kind").textContent=n?{person:Iu[n.role]??"Pessoa",vehicle:n.type==="ambulance"?"Ambul\xE2ncia":"Viatura policial",building:"Instala\xE7\xE3o / edif\xEDcio",incident:"Ocorr\xEAncia"}[Yt.kind]:"OBSERVA\xC7\xC3O",he("follow-button").disabled=!n,he("follow-button").textContent=fn?"Deixar de seguir":"Seguir na cidade",he("follow-button").setAttribute("aria-pressed",String(fn)),!n){hr([["Modo","Resposta aut\xF3noma"],["Popula\xE7\xE3o","Identidades existentes"],["Controlo","Seleciona no mapa ou pesquisa abaixo"]]),he("selection-note").textContent="N\xE3o \xE9 necess\xE1rio dar ordens. A central despacha os meios dispon\xEDveis e regista esperas e riscos.";return}if(Yt.kind==="person"){let t=pr().filter(a=>a.personId===n.id),i=[...new Set(t.flatMap(a=>[...a.knownFacts??[],...a.confirmedFacts??[]]))],s=n.location??{},r=s.kind==="vehicle"?`Na viatura ${s.vehicleId}`:s.kind==="building"||s.kind==="hospital"?`Interior \xB7 ${e.city.buildings.find(a=>a.id===s.buildingId)?.name??s.buildingId}`:"Via p\xFAblica / passeio";hr([["Identidade",n.id],["Atividade",yi?n.activity:{walking:"A caminhar",atHome:"Em casa",atService:"Num servi\xE7o",resting:"Em pausa",onDuty:"Em servi\xE7o",available:"Dispon\xEDvel",patrolling:"Em patrulha",responding:"A responder",approaching:"Em aproxima\xE7\xE3o",assessing:"Em avalia\xE7\xE3o",assisting:"Em aux\xEDlio",protecting:"Em prote\xE7\xE3o",engaging:"Em interven\xE7\xE3o",retreating:"Em retirada",returning:"A regressar",hospitalDuty:"Em servi\xE7o hospitalar"}[n.activity]??(t.length?"Ocorr\xEAncia em acompanhamento":"Atividade n\xE3o comunicada")],["Localiza\xE7\xE3o",r],["Tarefa",n.taskId??"Rotina"],["Informa\xE7\xE3o conhecida",i.join(", ")||"Sem avalia\xE7\xE3o comunicada"],...n.role==="officer"?[["Muni\xE7\xF5es",n.ammo],["Integridade",n.hp]]:[],...yi?[["DEBUG \xB7 vida",n.lifeState],["DEBUG \xB7 sa\xFAde",n.healthState],["DEBUG \xB7 posi\xE7\xE3o",`${Tl(e,n).x.toFixed(1)}, ${Tl(e,n).z.toFixed(1)}`]]:[]]),he("selection-note").textContent=s.kind==="building"||s.kind==="hospital"?"A pessoa permanece contabilizada no interior. O seguimento indica o edif\xEDcio; n\xE3o representa desloca\xE7\xE3o na rua.":yi?"Modo de verdade do motor ativo.":"A informa\xE7\xE3o cl\xEDnica apresentada prov\xE9m de chamadas e avalia\xE7\xF5es, n\xE3o do estado oculto da doen\xE7a."}else if(Yt.kind==="vehicle")hr([["Estado",wl(n.status)],["Miss\xE3o",n.incidentId??"Sem ocorr\xEAncia atribu\xEDda"],["Tripula\xE7\xE3o",(n.crewIds??[]).join(", ")],["Passageiros",(n.passengerIds??[]).join(", ")||"Nenhum"],["Capacidade",n.capacity],["Percurso restante",`${(n.path??[]).length} n\xF3s`],["Circula\xE7\xE3o",n.traffic?.status==="yielding"?`A ceder passagem a ${n.traffic.personId??"uma pessoa"}`:n.traffic?.status==="slowing"?"A reduzir velocidade junto de uma travessia":["transportRouteWaiting","returnRouteWaiting","blocked","unavailable"].includes(n.status)?n.waitReason??"Aguarda condi\xE7\xF5es para retomar":"Sem espera de circula\xE7\xE3o comunicada"],["Indisponibilidade",n.broken?"Viatura avariada":"Sem avaria"]]),he("selection-note").textContent="A viatura e os seus ocupantes s\xE3o entidades distintas. O transporte conserva as mesmas identidades.";else if(Yt.kind==="building"){let t=e.people.filter(s=>s.location?.buildingId===n.id&&(s.location.kind==="building"||s.location.kind==="hospital")),i=e.facilities.hospital;hr([["Tipo",wl(n.type)],["Ocupantes registados",t.length],["Entradas",(n.entranceNodeIds??[]).join(", ")],["Capacidade",n.id===i.buildingId?`${i.patientIds.length} / ${i.capacity} camas`:n.capacity],["Acesso vi\xE1rio",n.vehicleNodeId??"Via acesso pedonal"]]),he("selection-note").textContent="Os interiores s\xE3o localiza\xE7\xF5es l\xF3gicas acess\xEDveis por portais; n\xE3o h\xE1 interiores 3D detalhados."}else{let t=[n.assignedAmbulanceId,n.assignedPatrolId].filter(Boolean),i=e.vehicles.find(l=>l.id===n.assignedAmbulanceId),s=new Map(e.city.vehicleGraph.nodes.map(l=>[l.id,l])),r=0,a=i?{x:i.x,z:i.z}:null;if(a)for(let l of i.path??[]){let h=s.get(l);h&&(r+=Math.hypot(h.x-a.x,h.z-a.z),a=h)}let o=e.config.parameters.ambulanceSpeed??7,c=i&&r>0?o>0?`~${Math.ceil(r/o)} s de viagem, sem paragens`:"Sem progress\xE3o: velocidade nula":"\u2014";hr([["Pessoa",n.personId],["Tipo observado",n.type==="medical"?"Ocorr\xEAncia m\xE9dica":"Comportamento hostil"],["Estado",wl(n.status)],["Prioridade",n.priority??n.severity],["Comunica\xE7\xE3o",n.reportedAt==null?"Chamada em prepara\xE7\xE3o":El(n.reportedAt*.1)],["Meios",t.join(", ")||"Em espera"],["Percurso/ETA",c],["Conhecido",(n.knownFacts??[]).join(", ")||"Informa\xE7\xE3o incompleta"],["Confirmado",(n.confirmedFacts??[]).join(", ")||"Aguardando avalia\xE7\xE3o"],["Espera",n.waitReason??"Sem espera comunicada"]]),he("selection-note").textContent="A central recebe observa\xE7\xF5es com atraso e atribui meios finitos; a causa verdadeira pode continuar desconhecida."}}function Ao(){let n=he("entity-search").value.trim().toLocaleLowerCase("pt"),e=he("entity-select").value,t=Ye.state,i=[["person",t.people,r=>`${Iu[r.role]??r.role} \xB7 ${r.name??r.id}`],["vehicle",t.vehicles,r=>`${r.type==="ambulance"?"Ambul\xE2ncia":"Patrulha"} \xB7 ${r.id}`],["building",t.city.buildings,r=>r.name??r.id],["incident",pr(),r=>`Ocorr\xEAncia \xB7 ${r.id} \xB7 ${r.type}`]],s=[];for(let[r,a,o]of i)for(let c of a){let l=o(c);if(!n||`${l} ${c.id}`.toLocaleLowerCase("pt").includes(n)){let h=document.createElement("option");h.value=`${r}:${c.id}`,h.textContent=l,s.push(h)}}he("entity-select").replaceChildren(...s),s.some(r=>r.value===e)&&(he("entity-select").value=e)}function pn(){let n=Ye.state,e=pr().filter(c=>!["resolved","cancelled"].includes(c.status));he("sim-time").textContent=El(n.timeSeconds),he("scenario-status").textContent=`${E_[n.scenario]} \xB7 ${Et.paused?"em pausa":"aut\xF3noma"}`,he("stat-population").textContent=n.initialPopulation??n.people.length,he("stat-known-cases").textContent=new Set(pr().filter(c=>c.type==="medical"||c.type==="violence").map(c=>c.personId)).size,he("stat-calls").textContent=e.length;let t=n.vehicles.filter(c=>c.type==="ambulance"),i=n.patrols??[];he("stat-resources").textContent=`${n.counters.availableAmbulances}/${t.length} AMB \xB7 ${n.counters.availablePatrols}/${i.length} PAT`,he("pause-button").textContent=Et.paused?"\u25B6 Iniciar":"\u2161 Pausar",he("pause-button").setAttribute("aria-pressed",String(Et.paused)),he("step-button").disabled=!Et.paused,he("time-scale-note").textContent=`1\xD7 = ${Mu} s simulados / segundo real \xB7 atual ${Mu*Et.speed} s/s`;for(let c of document.querySelectorAll("[data-speed]")){let l=Number(c.dataset.speed)===Et.speed;c.classList.toggle("active",l),c.setAttribute("aria-pressed",String(l))}he("debug-banner").hidden=!yi,he("debug-banner").classList.toggle("hidden",!yi);let s=he("timeline-filter").value,r=A_().filter(c=>s==="all"||(s==="calls"?/Call|Triag|Dispatch|Assign|Wait|Incident/.test(c.type):s==="police"?/Police|Officer|Shot|Threat|Retreat|Backup|Neutraliz/.test(c.type):/Medical|Ambulance|Patient|Hospital|Assess|Handover|Symptom/.test(c.type))).slice(-55).reverse(),a=`${yi}/${s}/${r.map(c=>c.eventId).join("|")}`;a!==Cl&&(Cl=a,he("event-log").replaceChildren(...r.map(c=>{let l=document.createElement("li");return l.textContent=`${El(c.timeSeconds??c.tick*.1)} \xB7 ${c.message??c.type}`,l.dataset.eventId=c.eventId,l})));let o=Ji.frameMs.reduce((c,l)=>c+l,0)/Ji.frameMs.length;he("perf-fps").textContent=Number.isFinite(o)&&o>0?(1e3/o).toFixed(1):"\u2014",he("perf-p95").textContent=`${Su(Ji.frameMs,.95).toFixed(1)} ms`,he("perf-logic").textContent=Ji.logicMs.length?`${Su(Ji.logicMs,.95).toFixed(2)} ms/tick`:"sem passos",he("perf-memory").textContent=performance.memory?`${(performance.memory.usedJSHeapSize/1048576).toFixed(1)} MiB`:"indispon\xEDvel",Io()}try{let n=function(e){let t=Math.max(0,e-So);So=e,Mo("frameMs",t);let i=Et.advance(t,()=>{let r=performance.now();Ye.step(),Mo("logicMs",performance.now()-r);let a=performance.now();nt.captureTick(Ye.state),Mo("poseMs",performance.now()-a)});i.autoPaused&&(nt.snapToState(Ye.state),wo("Atraso l\xF3gico acumulado. A cidade foi pausada; reduz a velocidade antes de retomar."));let s=performance.now();nt.render(Ye.state,i.alpha),Mo("renderMs",performance.now()-s),ur>Ye.state.events.length&&(ur=0),Di.consume(Ye.state.events.slice(ur),Yt&&To(Yt)?Tl(Ye.state,To(Yt)):{x:Ye.state.city.width/2,z:Ye.state.city.height/2}),ur=Ye.state.events.length,e-wu>250&&(pn(),fr(),wu=e),e-Al>1500&&(Ao(),Al=e),requestAnimationFrame(n)};nt=new yo({container:he("scene"),canvas:he("livingCanvas"),onSelect:Il}),Di=new bo({onStatus:()=>fr()}),he("scenario-select").value="S0",he("seed-input").value="16927",nt.snapToState(Ye.state),nt.render(Ye.state,1),pn(),Ao(),fr(),he("renderer-status").textContent="WebGL 2 \xB7 cidade aut\xF3noma \xB7 geometria e popula\xE7\xE3o do dom\xEDnio",window.livingDemo={version:"0.2.1",ready:!0,getState:()=>Ye.snapshot(),advanceTicks:Du,reset:Eo,setPaused:Co,setSpeed:Pu,getTimeState:()=>({...Et.snapshot(),tick:Ye.state.tick}),setScenario:e=>Eo({scenario:e}),select:Il,follow:Ru,setDebug(e){yi=!!e,he("debug-truth").checked=yi,nt.setDebug?.(yi),pn()},setEffects(e){he("reduced-effects").checked=!e,nt.setReducedEffects?.(!e)},audio:Di,getSelection:()=>Yt,get isPaused(){return Et.paused},renderer:nt,project:(e,t,i=0)=>nt.project(e,t,i),getMetrics:()=>({...nt.getMetrics(),...Object.fromEntries(Object.entries(Ji).map(([e,t])=>[e,[...t]])),time:Et.snapshot(),tick:Ye.state.tick,logicalPeople:Ye.state.people.length,logicalVehicles:Ye.state.vehicles.length,incidentCount:Ye.state.incidents.length}),resetMetrics(){for(let e of Object.values(Ji))e.length=0}},requestAnimationFrame(n)}catch(n){console.error(n),he("renderer-status").textContent=`N\xE3o foi poss\xEDvel iniciar a cidade: ${n.message}`,wo("Usa um browser desktop recente com WebGL 2."),window.livingDemo={ready:!1,error:n.message}}function fr(){if(!Di)return;let n=Di.getStatus();he("sound-toggle").textContent=n.muted?"Ativar som":"Silenciar",he("sound-toggle").setAttribute("aria-pressed",String(!n.muted)),he("audio-status").textContent=n.lastError?`\xC1udio indispon\xEDvel: ${n.lastError}`:n.muted?"Som desligado \xB7 opcional":`Som ativo \xB7 ${n.activeVoices}/6 vozes`}he("pause-button").addEventListener("click",()=>Co(!Et.paused));he("step-button").addEventListener("click",()=>{Et.paused&&Du(1)});for(let n of document.querySelectorAll("[data-speed]"))n.addEventListener("click",()=>Pu(Number(n.dataset.speed)));he("reset-button").addEventListener("click",()=>Eo());he("scenario-select").addEventListener("change",()=>Eo());he("entity-search").addEventListener("input",Ao);he("select-entity-button").addEventListener("click",()=>{let[n,...e]=he("entity-select").value.split(":");Il({kind:n,id:e.join(":")})});he("follow-button").addEventListener("click",()=>Ru());he("timeline-filter").addEventListener("change",pn);for(let n of document.querySelectorAll("[data-layer]"))n.addEventListener("change",()=>nt?.setLayer(n.dataset.layer,n.checked));he("debug-truth").addEventListener("change",()=>window.livingDemo?.setDebug?.(he("debug-truth").checked));he("sound-toggle").addEventListener("click",async()=>{Di&&(await Di.setMuted(!Di.getStatus().muted),fr())});he("volume-control").addEventListener("input",()=>{Di?.setVolume(Number(he("volume-control").value)),fr()});he("reduced-effects").addEventListener("change",()=>nt?.setReducedEffects(he("reduced-effects").checked));document.addEventListener("keydown",n=>{if(n.target.matches("input,select,textarea")||n.target.isContentEditable||n.ctrlKey||n.altKey||n.metaKey||(n.code==="Space"&&(n.preventDefault(),n.repeat||Co(!Et.paused)),n.repeat))return;let e=n.key.toLowerCase();(e==="q"||e==="e")&&(n.preventDefault(),nt?.rotateCamera(e==="q"?-1:1)),e==="r"&&(fn=!1,nt?.resetCamera(),Io())});document.addEventListener("visibilitychange",()=>{document.hidden&&!Et.paused&&(Co(!0),wo("Cidade pausada ao ocultar o separador."))});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
