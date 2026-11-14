'use strict';

// Presentation copies only coordinates and location continuity metadata. It
// never owns domain entities, their paths, health, resources or the simulation RNG.
const CANONICAL_AZIMUTH=Math.PI/4;
const CAMERA_ROTATION_STEP=Math.PI/12;
const identities=new WeakMap();let nextIdentity=0;
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const table=()=>Object.create(null);
function identityOf(state){if(!identities.has(state))identities.set(state,++nextIdentity);return identities.get(state);}
function fraction(value){if(!finite(value))throw new TypeError('Visual alpha must be finite.');return Math.max(0,Math.min(1,value));}
function normalizeAzimuth(value){if(!finite(value))throw new TypeError('Camera azimuth must be finite.');const tau=Math.PI*2;return ((value%tau)+tau)%tau;}
function rotateAzimuth(azimuth,direction){if(direction!==-1&&direction!==1)throw new TypeError('Camera rotation must be -1 or +1.');return normalizeAzimuth(azimuth+direction*CAMERA_ROTATION_STEP);}
function cameraOffset(azimuth,horizontal=Math.hypot(68,68),height=88){
  if(!finite(horizontal)||horizontal<=0||!finite(height)||height<=0)throw new TypeError('Invalid camera dimensions.');
  const angle=normalizeAzimuth(azimuth);return {x:Math.sin(angle)*horizontal,y:height,z:Math.cos(angle)*horizontal};
}
function store(target,id,pose){
  if(typeof id!=='string'||!id||Object.hasOwn(target,id))throw new TypeError('Visual entities require unique non-empty IDs.');
  if(pose&&(!finite(pose.x)||!finite(pose.z)))throw new TypeError('Visual positions must be finite.');
  target[id]=pose?Object.freeze(pose):null;
}
function captureVisualFrame(state){
  if(!state||typeof state!=='object'||!Number.isSafeInteger(state.tick)||state.tick<0)throw new TypeError('A visual frame requires an integer tick.');
  const vehicles=table(),people=table(),buildings=new Map((state.city?.buildings||[]).map(b=>[b.id,b]));
  const entrances=new Map((state.city?.pedestrianGraph?.nodes||[]).map(n=>[n.id,n]));
  for(const vehicle of state.vehicles||[])store(vehicles,vehicle.id,{id:vehicle.id,kind:'vehicle',x:vehicle.x,z:vehicle.z,
    hidden:false,inside:null,description:null,locationKind:'road',locationId:null,carrierId:null,lifeState:null});
  for(const person of state.people||[]){
    const location=person.location||{},kind=location.kind;let pose=null;
    const base={id:person.id,kind:'person',lifeState:person.lifeState||null,locationKind:kind,locationId:null,carrierId:null,hidden:false,inside:null,description:null};
    if(kind==='street')pose={...base,x:person.x,z:person.z};
    else if(kind==='vehicle'){
      const vehicle=vehicles[location.vehicleId];
      if(vehicle)pose={...base,x:vehicle.x,z:vehicle.z,hidden:true,inside:'vehicle',description:'no interior de uma viatura',locationId:location.vehicleId,carrierId:location.vehicleId};
    }else if(kind==='building'||kind==='hospital'){
      const id=location.buildingId||(kind==='hospital'?state.facilities?.hospital?.buildingId:null),building=buildings.get(id);
      if(building){const entry=entrances.get(building.entranceNodeIds?.[0]);pose={...base,x:entry?.x??building.x,z:entry?.z??building.z,hidden:true,inside:'building',description:`no interior de ${building.name||'um edifício'}`,locationId:id};}
    }
    store(people,person.id,pose);
  }
  return Object.freeze({identity:identityOf(state),context:`${state.version??''}:${state.seed??''}:${state.scenario??''}`,tick:state.tick,
    people:Object.freeze(people),vehicles:Object.freeze(vehicles)});
}
function samePose(a,b){
  if(a===b)return true;if(!a||!b)return false;
  return Object.keys(a).every(key=>a[key]===b[key])&&Object.keys(a).length===Object.keys(b).length;
}
function sameFrame(a,b){
  if(!a||!b||a.identity!==b.identity||a.context!==b.context||a.tick!==b.tick)return false;
  for(const key of ['people','vehicles']){
    if(Object.keys(a[key]).length!==Object.keys(b[key]).length)return false;
    for(const id of Object.keys(a[key]))if(!Object.hasOwn(b[key],id)||!samePose(a[key][id],b[key][id]))return false;
  }
  return true;
}
function continuous(previous,current,a,b){
  return !!a&&!!b&&previous.identity===current.identity&&previous.context===current.context&&current.tick===previous.tick+1
    &&a.kind===b.kind&&a.id===b.id&&a.locationKind===b.locationKind&&a.locationId===b.locationId&&a.lifeState===b.lifeState;
}
function interpolateVisualPose(previous,current,kind,id,alpha=1){
  const amount=fraction(alpha),key=kind==='person'?'people':kind==='vehicle'?'vehicles':null;
  if(!key||!current||!Object.hasOwn(current[key],id)||!current[key][id])return null;
  const now=current[key][id],before=previous?.[key]?.[id],canBlend=previous&&continuous(previous,current,before,now);
  let x=now.x,z=now.z,interpolated=false;
  if(now.carrierId){
    // A passenger always follows the same drawn carrier. Boarding never blends
    // a street body into the vehicle or creates a duplicate visible identity.
    const carrier=interpolateVisualPose(previous,current,'vehicle',now.carrierId,amount);
    if(!carrier)return null;x=carrier.x;z=carrier.z;interpolated=carrier.interpolated;
  }else if(canBlend&&now.locationKind!=='building'&&now.locationKind!=='hospital'){
    x=before.x+(now.x-before.x)*amount;z=before.z+(now.z-before.z)*amount;
    interpolated=amount<1&&(x!==now.x||z!==now.z);
  }
  const {lifeState,...display}=now;
  return {...display,x,z,interpolated,transitionSnap:!canBlend,previousTick:previous?.tick??current.tick,currentTick:current.tick};
}
class VisualPoseHistory{
  #previous=null;#current=null;#reason='empty';
  captureTick(state){
    const frame=captureVisualFrame(state),current=this.#current;
    if(current&&sameFrame(current,frame))return false;
    if(!current){this.#previous=frame;this.#current=frame;this.#reason='initial';}
    else if(frame.identity!==current.identity||frame.context!==current.context){this.#previous=frame;this.#current=frame;this.#reason='world-change';}
    else if(frame.tick!==current.tick+1){this.#previous=frame;this.#current=frame;this.#reason=frame.tick===current.tick?'same-tick-change':'tick-gap-or-reset';}
    else{this.#previous=current;this.#current=frame;this.#reason='consecutive';}
    return true;
  }
  snapToState(state){const frame=captureVisualFrame(state);this.#previous=frame;this.#current=frame;this.#reason='explicit-snap';}
  getVisualPose(kind,id,alpha=1){return interpolateVisualPose(this.#previous,this.#current,kind,id,alpha);}
  getSummary(){return {previousTick:this.#previous?.tick??null,currentTick:this.#current?.tick??null,reason:this.#reason,
    people:this.#current?Object.keys(this.#current.people).length:0,vehicles:this.#current?Object.keys(this.#current.vehicles).length:0};}
}
module.exports={VisualPoseHistory,captureVisualFrame,interpolateVisualPose,CANONICAL_AZIMUTH,CAMERA_ROTATION_STEP,normalizeAzimuth,rotateAzimuth,cameraOffset};
