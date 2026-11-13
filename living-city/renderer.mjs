import * as THREE from 'three';
import PosePresentation from './presentation/poses.cjs';

const {VisualPoseHistory,CANONICAL_AZIMUTH,CAMERA_ROTATION_STEP,normalizeAzimuth,cameraOffset}=PosePresentation;

const COLORS={resident:0x95b8b0,officer:0x65aff3,medic:0xf3eee1,hospitalStaff:0xb1e2d5,ambulance:0xeeeadd,police:0x4488b7};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const publicEvent=event=>event.visibility==='reported'||event.visibility==='confirmed';
const hash=text=>{let n=2166136261;for(const char of String(text))n=Math.imul(n^char.charCodeAt(0),16777619);return n>>>0;};
function disposeTree(root){
  const geometries=new Set(),materials=new Set();
  root.traverse(object=>{if(object.isInstancedMesh)object.dispose();if(object.geometry)geometries.add(object.geometry);for(const material of [].concat(object.material||[]))materials.add(material);});
  for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
}
function ribbonGeometry(items,elevation){
  const vertices=[];
  for(const item of items||[]){
    const points=item.points||[];
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.z-a.z);if(!length)continue;
      const half=(item.width||1)/2,nx=-(b.z-a.z)/length*half,nz=(b.x-a.x)/length*half;
      const corners=[[a.x+nx,elevation,a.z+nz],[a.x-nx,elevation,a.z-nz],[b.x+nx,elevation,b.z+nz],[b.x-nx,elevation,b.z-nz]];
      for(const index of [0,2,1,1,2,3])vertices.push(...corners[index]);
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();return geometry;
}
function recordOf(records,id){return (records||[]).find(record=>record.id===id);}

/** Independent read-only presentation of the finite city state. */
export class LivingRenderer{
  constructor({container,canvas,onSelect}={}){
    if(!container)throw new Error('É necessário um contentor para observar a cidade.');
    this.container=container;this.canvas=canvas||document.createElement('canvas');this.ownsCanvas=!canvas;this.onSelect=onSelect;
    if(!canvas)container.append(this.canvas);
    this.canvas.style.cssText+=';display:block;width:100%;height:100%;touch-action:none;';this.canvas.tabIndex=0;
    this.canvas.setAttribute('aria-label','Cidade viva tridimensional. Arrastar move a câmara; roda amplia; clique seleciona pessoa, veículo, edifício ou ocorrência.');
    if(getComputedStyle(container).position==='static')container.style.position='relative';
    const context=this.canvas.getContext('webgl2',{alpha:false,antialias:false,depth:true,stencil:false,powerPreference:'high-performance'});
    if(!context){if(this.ownsCanvas)this.canvas.remove();throw new Error('WebGL 2 não está disponível neste navegador.');}
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,context,alpha:false,antialias:false});this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x111e28);
    this.scene.add(new THREE.HemisphereLight(0xd7eeff,0x2b3835,2.0));
    const sun=new THREE.DirectionalLight(0xffedcf,2.2);sun.position.set(-35,80,42);this.scene.add(sun);
    this.camera=new THREE.OrthographicCamera(-60,60,45,-45,.1,500);this.target=new THREE.Vector3(47,0,34);this.cameraOffset=new THREE.Vector3(68,88,68);
    this.azimuth=CANONICAL_AZIMUTH;this.rotationSteps=0;this.poseHistory=new VisualPoseHistory();this.visualAlpha=1;this.drawnPoses={people:new Map(),vehicles:new Map()};
    this.raycaster=new THREE.Raycaster();this.pointerNdc=new THREE.Vector2();this.ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.dummy=new THREE.Object3D();
    this.cityGroup=new THREE.Group();this.liveGroup=new THREE.Group();this.scene.add(this.cityGroup,this.liveGroup);
    this.city=null;this.cityKey=null;this.widthWorld=94;this.heightWorld=68;this.state=null;this.disposed=false;
    this.selected=null;this.follow=null;this.followOffset={x:0,z:0};this.debug=false;this.reducedEffects=false;this.pointer=null;
    this.layers={people:true,vehicles:true,buildings:true,services:true,incidents:true,routes:false,health:false,risk:false};
    this.labels=document.createElement('div');this.labels.style.cssText='position:absolute;inset:0;overflow:hidden;pointer-events:none;';this.labels.setAttribute('aria-hidden','true');container.append(this.labels);this.labelMap=new Map();
    this.peopleCapacity=0;this.vehicleCapacity=0;this.incidentCapacity=0;this.peopleBodies=null;this.vehicleBodies=null;this.incidentMarkers=null;
    this.peopleIds=[];this.vehicleIds=[];this.incidentIds=[];this.lastTick=-1;this.lastEventId=0;this.seenEvents=new Set();this.shotEffects=[];this.effectsConsumed=0;this.effectsRendered=0;
    this._createOverlays();this._bindInput();this.resize();this.resetCamera();
    this.resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>this.resize()):null;this.resizeObserver?.observe(container);
    this.windowResize=()=>this.resize();window.addEventListener('resize',this.windowResize);
    const info=context.getExtension('WEBGL_debug_renderer_info');
    this.gpu={vendor:context.getParameter(info?info.UNMASKED_VENDOR_WEBGL:context.VENDOR),renderer:context.getParameter(info?info.UNMASKED_RENDERER_WEBGL:context.RENDERER),version:context.getParameter(context.VERSION),timerQuerySupported:!!context.getExtension('EXT_disjoint_timer_query_webgl2')};
    this.metrics={};
  }
  _createOverlays(){
    this.selectionMarker=new THREE.Mesh(new THREE.RingGeometry(.5,.65,32),new THREE.MeshBasicMaterial({color:0xffdf8d,side:THREE.DoubleSide,depthTest:false,transparent:true,opacity:.9}));
    this.selectionMarker.rotation.x=-Math.PI/2;this.selectionMarker.renderOrder=9;this.selectionMarker.visible=false;this.liveGroup.add(this.selectionMarker);
    this.route=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffdf8d,transparent:true,opacity:.9,depthTest:false}));this.route.renderOrder=8;this.route.frustumCulled=false;this.liveGroup.add(this.route);this.routeKey=null;
    this.symptoms=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.14,0),new THREE.MeshBasicMaterial({color:0xffc260}),512);this.symptoms.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.symptoms.frustumCulled=false;this.symptoms.count=0;this.liveGroup.add(this.symptoms);
    this.flash=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.2,0),new THREE.MeshBasicMaterial({color:0xffe4a0,depthTest:false}),32);this.flash.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.flash.frustumCulled=false;this.flash.count=0;this.flash.renderOrder=10;this.liveGroup.add(this.flash);
    this.impacts=new THREE.InstancedMesh(new THREE.RingGeometry(.08,.2,10),new THREE.MeshBasicMaterial({color:0xffbd74,side:THREE.DoubleSide,transparent:true,opacity:.7}),32);this.impacts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.impacts.frustumCulled=false;this.impacts.count=0;this.liveGroup.add(this.impacts);
    this.tracerPositions=new Float32Array(32*6);this.tracerColors=new Float32Array(32*6);
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(this.tracerPositions,3).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('color',new THREE.BufferAttribute(this.tracerColors,3).setUsage(THREE.DynamicDrawUsage));geometry.setDrawRange(0,0);
    this.tracers=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.8,depthTest:false}));this.tracers.frustumCulled=false;this.tracers.renderOrder=10;this.liveGroup.add(this.tracers);
  }
  _replaceDynamic(name,object){
    const previous=this[name];if(previous){this.liveGroup.remove(previous);disposeTree(previous);}
    this[name]=object;this.liveGroup.add(object);return object;
  }
  _ensurePeople(count){
    if(this.peopleBodies&&count<=this.peopleCapacity)return;this.peopleCapacity=Math.max(32,count,this.state?.people?.length||0);
    const body=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.24,.52,2,6),new THREE.MeshLambertMaterial({color:0xffffff}),this.peopleCapacity);
    const head=new THREE.InstancedMesh(new THREE.SphereGeometry(.2,6,4),new THREE.MeshLambertMaterial({color:0xf0dcc0}),this.peopleCapacity);
    const halo=new THREE.InstancedMesh(new THREE.RingGeometry(.27,.39,12),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,side:THREE.DoubleSide}),this.peopleCapacity);
    for(const mesh of [body,head,halo]){mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;}
    this._replaceDynamic('peopleBodies',body);this._replaceDynamic('peopleHeads',head);this._replaceDynamic('peopleHalos',halo);
  }
  _ensureVehicles(count){
    if(this.vehicleBodies&&count<=this.vehicleCapacity)return;this.vehicleCapacity=Math.max(8,count);
    const body=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),this.vehicleCapacity);
    const roof=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),this.vehicleCapacity);
    const wheels=new THREE.InstancedMesh(new THREE.CylinderGeometry(.19,.19,.14,8),new THREE.MeshLambertMaterial({color:0x15212b}),this.vehicleCapacity*4);
    const lights=new THREE.InstancedMesh(new THREE.BoxGeometry(.2,.09,.24),new THREE.MeshBasicMaterial({color:0xffffff}),this.vehicleCapacity*2);
    for(const mesh of [body,roof,wheels,lights]){mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;}
    this._replaceDynamic('vehicleBodies',body);this._replaceDynamic('vehicleRoofs',roof);this._replaceDynamic('vehicleWheels',wheels);this._replaceDynamic('vehicleLights',lights);
  }
  _ensureIncidents(count){
    if(this.incidentMarkers&&count<=this.incidentCapacity)return;this.incidentCapacity=Math.max(16,2**Math.ceil(Math.log2(Math.max(1,count))));
    const mesh=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.31),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false}),this.incidentCapacity);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.renderOrder=7;mesh.count=0;this._replaceDynamic('incidentMarkers',mesh);
  }
  _node(graph,id){return graph?.nodes?.find(node=>node.id===id);}
  _position(entity){
    if(!entity)return null;
    return entity.location?this.drawnPoses.people.get(entity.id)||null:this.drawnPoses.vehicles.get(entity.id)||null;
  }
  captureTick(state){return this.poseHistory.captureTick(state);}
  snapToState(state){this.poseHistory.snapToState(state);}
  _prepareVisualPoses(state,alpha){
    const summary=this.poseHistory.getSummary();
    if(summary.currentTick!==state.tick)this.poseHistory.captureTick(state);
    this.visualAlpha=alpha;this.drawnPoses={people:new Map(),vehicles:new Map()};
    for(const person of state.people||[]){const pose=this.poseHistory.getVisualPose('person',person.id,alpha);if(pose)this.drawnPoses.people.set(person.id,pose);}
    for(const vehicle of state.vehicles||[]){const pose=this.poseHistory.getVisualPose('vehicle',vehicle.id,alpha);if(pose)this.drawnPoses.vehicles.set(vehicle.id,pose);}
  }
  _buildCity(city){
    disposeTree(this.cityGroup);this.scene.remove(this.cityGroup);this.cityGroup=new THREE.Group();this.scene.add(this.cityGroup);
    this.city=city;this.widthWorld=city.width;this.heightWorld=city.height;
    const terrain=new THREE.Mesh(new THREE.PlaneGeometry(city.width+6,city.height+6),new THREE.MeshLambertMaterial({color:0x2b3d38}));terrain.rotation.x=-Math.PI/2;terrain.position.set(city.width/2,-.06,city.height/2);this.cityGroup.add(terrain);
    this.roadMesh=new THREE.Mesh(ribbonGeometry(city.roads,.005),new THREE.MeshLambertMaterial({color:0x26333b,side:THREE.DoubleSide}));this.cityGroup.add(this.roadMesh);
    this.sidewalkMesh=new THREE.Mesh(ribbonGeometry(city.sidewalks||[],.04),new THREE.MeshLambertMaterial({color:0x8a9590,side:THREE.DoubleSide}));this.cityGroup.add(this.sidewalkMesh);
    const stripeTransforms=[];
    for(const crossing of city.crossings||[])for(let i=1;i<(crossing.points||[]).length;i++){
      const a=crossing.points[i-1],b=crossing.points[i],length=Math.hypot(b.x-a.x,b.z-a.z),angle=Math.atan2(b.x-a.x,b.z-a.z);
      const parking=String(crossing.id).startsWith('parking-');
      for(let d=.35;d<length;d+=parking?1.3:.85)stripeTransforms.push({x:a.x+(b.x-a.x)*d/length,z:a.z+(b.z-a.z)*d/length,angle,width:(crossing.width||1.6)*(parking?.55:1),length:parking?.28:.42,color:parking?0x8d9e9b:0xd7d9c9});
    }
    const stripes=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xd7d9c9}),Math.max(1,stripeTransforms.length));stripes.count=stripeTransforms.length;
    stripeTransforms.forEach((item,index)=>{this.dummy.position.set(item.x,.06,item.z);this.dummy.rotation.set(0,item.angle,0);this.dummy.scale.set(item.width,.02,item.length);this.dummy.updateMatrix();stripes.setMatrixAt(index,this.dummy.matrix);stripes.setColorAt(index,new THREE.Color(item.color));});stripes.instanceMatrix.needsUpdate=true;if(stripes.instanceColor)stripes.instanceColor.needsUpdate=true;this.cityGroup.add(stripes);
    const buildings=city.buildings||[],count=buildings.length;
    this.buildingBodies=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,count));
    this.buildingRoofs=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,count));this.buildingBodies.count=count;this.buildingRoofs.count=count;
    const windows=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x17201a,emissiveIntensity:.25}),Math.max(1,count*8));windows.count=count*8;this.buildingWindows=windows;
    buildings.forEach((building,index)=>{
      const height=building.height||3.2;const hospital=building.id===this.state.facilities?.hospital?.buildingId||building.type==='hospital';const station=building.id===this.state.facilities?.station?.buildingId||/police|station/.test(building.type);
      const color=hospital?0xbed7ce:station?0x6d8fa6:[0x9a9f97,0x809497,0xb0a694,0x8e9c91][hash(building.id)%4];
      this.dummy.position.set(building.x,height/2,building.z);this.dummy.rotation.set(0,0,0);this.dummy.scale.set(building.width,height,building.depth);this.dummy.updateMatrix();this.buildingBodies.setMatrixAt(index,this.dummy.matrix);this.buildingBodies.setColorAt(index,new THREE.Color(color));
      this.dummy.position.y=height+.1;this.dummy.scale.set(building.width*1.03,.2,building.depth*1.03);this.dummy.updateMatrix();this.buildingRoofs.setMatrixAt(index,this.dummy.matrix);this.buildingRoofs.setColorAt(index,new THREE.Color(station?0x314b5c:0x61746e));
      for(let n=0;n<8;n++){
        this.dummy.rotation.set(0,0,0);this.dummy.position.set(building.x+((n%4)-1.5)*building.width*.19,height*.57,building.z+(n<4?-1:1)*(building.depth/2+.015));
        this.dummy.scale.set(building.width*.11,.6,.025);this.dummy.updateMatrix();windows.setMatrixAt(index*8+n,this.dummy.matrix);windows.setColorAt(index*8+n,new THREE.Color((hash(building.id+n)%3)?0xcbd8c9:0xf4ce82));
      }
    });
    for(const mesh of [this.buildingBodies,this.buildingRoofs,windows]){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;this.cityGroup.add(mesh);}
    const entrances=[];for(const building of buildings)for(const id of building.entranceNodeIds||[]){const node=this._node(city.pedestrianGraph,id);if(node)entrances.push({building,node});}
    this.portals=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.06,.6),new THREE.MeshBasicMaterial({color:0xffffff}),Math.max(1,entrances.length));this.portals.count=entrances.length;
    entrances.forEach(({building,node},index)=>{this.dummy.position.set(node.x,.085,node.z);this.dummy.rotation.set(0,0,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.portals.setMatrixAt(index,this.dummy.matrix);this.portals.setColorAt(index,new THREE.Color(building.type==='hospital'?0x81ebc0:0xd3d4b8));});this.portals.instanceMatrix.needsUpdate=true;if(this.portals.instanceColor)this.portals.instanceColor.needsUpdate=true;this.cityGroup.add(this.portals);
    this.structuralCounts={buildings:count,roadSegments:(city.roads||[]).reduce((sum,r)=>sum+Math.max(0,(r.points||[]).length-1),0),sidewalks:(city.sidewalks||[]).length,crossings:(city.crossings||[]).length,entrances:entrances.length};
    this.resetCamera();
  }
  _knownPeople(){
    const known=new Map();
    for(const person of this.state.people||[])if(person.observedSymptoms?.length)known.set(person.id,'symptoms');
    for(const incident of this.state.incidents||[])if(incident.reportedAt!==null&&incident.reportedAt!==undefined){
      const facts=[...(incident.knownFacts||[]),...(incident.confirmedFacts||[])].join(' ').toLowerCase();
      if(incident.type==='violence'||/aggress|hostil|reanim|ameaça/.test(facts))known.set(incident.personId,'threat');else if(facts)known.set(incident.personId,'symptoms');
    }
    for(const witness of this.state.people||[])for(const id of witness.knownThreats||[])known.set(typeof id==='string'?id:id.personId,'threat');
    return known;
  }
  _personColor(person,known){
    if(this.debug){
      if(person.lifeState==='reanimated')return 0xf07371;
      if(person.lifeState==='neutralized'||person.lifeState==='dead')return 0x6c7075;
      if(person.healthState==='critical')return 0xef926d;
      if(['exposed','infected','symptomatic'].includes(person.healthState))return 0xd7b46f;
    }
    if(known.get(person.id)==='threat')return 0xea8f76;
    if(person.role!=='resident')return COLORS[person.role]||COLORS.resident;
    return [0xa7bfba,0xb9ac83,0x8bb6bd,0xc4b8a6,0x9eabbf][hash(person.id)%5];
  }
  _drawPeople(known){
    const people=(this.state.people||[]).filter(person=>person.location?.kind==='street');this._ensurePeople(people.length);
    this.peopleIds=people.map(p=>p.id);this.peopleBodies.count=people.length;this.peopleHeads.count=people.length;this.peopleHalos.count=people.length;let symptoms=0;
    people.forEach((person,index)=>{
      const position=this._position(person);if(!position)return;
      const fallen=person.lifeState==='dead'||person.lifeState==='neutralized';
      const color=new THREE.Color(this._personColor(person,known));
      this.dummy.position.set(position.x,fallen?.25:.6,position.z);this.dummy.rotation.set(0,0,fallen?Math.PI/2:0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.peopleBodies.setMatrixAt(index,this.dummy.matrix);this.peopleBodies.setColorAt(index,color);
      this.dummy.rotation.set(0,0,0);this.dummy.position.set(position.x+(fallen?.53:0),fallen?.25:1.25,position.z);this.dummy.updateMatrix();this.peopleHeads.setMatrixAt(index,this.dummy.matrix);
      this.dummy.rotation.set(-Math.PI/2,0,0);this.dummy.position.set(position.x,.105,position.z);this.dummy.updateMatrix();this.peopleHalos.setMatrixAt(index,this.dummy.matrix);this.peopleHalos.setColorAt(index,color);
      if(known.has(person.id)&&symptoms<512){this.dummy.rotation.set(0,0,0);this.dummy.position.y=1.78;this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.symptoms.setMatrixAt(symptoms++,this.dummy.matrix);}
    });
    for(const mesh of [this.peopleBodies,this.peopleHeads,this.peopleHalos]){mesh.instanceMatrix.needsUpdate=true;mesh.boundingSphere=null;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.visible=this.layers.people;}
    this.symptoms.count=symptoms;this.symptoms.instanceMatrix.needsUpdate=true;this.symptoms.visible=this.layers.people&&this.layers.risk;
    return people.length;
  }
  _drawVehicles(){
    const vehicles=this.state.vehicles||[];this._ensureVehicles(vehicles.length);this.vehicleIds=vehicles.map(vehicle=>vehicle.id);
    this.vehicleBodies.count=vehicles.length;this.vehicleRoofs.count=vehicles.length;this.vehicleWheels.count=vehicles.length*4;this.vehicleLights.count=vehicles.length*2;
    vehicles.forEach((vehicle,index)=>{
      const position=this._position(vehicle);
      const next=this._node(this.city.vehicleGraph,vehicle.path?.[0]),angle=next?Math.atan2(next.x-position.x,next.z-position.z):0;
      const ambulance=vehicle.type==='ambulance',length=ambulance?2.2:1.8;
      this.dummy.position.set(position.x,.47,position.z);this.dummy.rotation.set(0,angle,0);this.dummy.scale.set(.95,.62,length);this.dummy.updateMatrix();this.vehicleBodies.setMatrixAt(index,this.dummy.matrix);this.vehicleBodies.setColorAt(index,new THREE.Color(ambulance?COLORS.ambulance:COLORS.police));
      this.dummy.position.y=.94;this.dummy.scale.set(.8,ambulance?.42:.25,ambulance?1.15:.8);this.dummy.updateMatrix();this.vehicleRoofs.setMatrixAt(index,this.dummy.matrix);this.vehicleRoofs.setColorAt(index,new THREE.Color(ambulance?0xdce4de:0x94b6c1));
      for(let wheel=0;wheel<4;wheel++){
        const dx=wheel%2?.5:-.5,dz=wheel<2?-length*.32:length*.32;
        this.dummy.position.set(position.x+dx*Math.cos(angle)+dz*Math.sin(angle),.23,position.z-dx*Math.sin(angle)+dz*Math.cos(angle));this.dummy.rotation.set(0,angle,Math.PI/2);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.vehicleWheels.setMatrixAt(index*4+wheel,this.dummy.matrix);
      }
      for(let lamp=0;lamp<2;lamp++){
        const offset=lamp?.2:-.2;this.dummy.position.set(position.x+offset*Math.cos(angle),ambulance?1.23:1.06,position.z-offset*Math.sin(angle));this.dummy.rotation.set(0,angle,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.vehicleLights.setMatrixAt(index*2+lamp,this.dummy.matrix);this.vehicleLights.setColorAt(index*2+lamp,new THREE.Color(lamp?0xa8e8f4:0x437df1));
      }
    });
    for(const mesh of [this.vehicleBodies,this.vehicleRoofs,this.vehicleWheels,this.vehicleLights]){mesh.instanceMatrix.needsUpdate=true;mesh.boundingSphere=null;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.visible=this.layers.vehicles;}
  }
  _visibleIncidents(){return (this.state.incidents||[]).filter(incident=>this.debug||(incident.reportedAt!==null&&incident.reportedAt!==undefined));}
  _drawIncidents(){
    const incidents=this._visibleIncidents().filter(incident=>!['resolved','cancelled'].includes(incident.status));this._ensureIncidents(incidents.length);this.incidentIds=incidents.map(incident=>incident.id);this.incidentMarkers.count=incidents.length;
    incidents.forEach((incident,index)=>{this.dummy.position.set(incident.x,1.7,incident.z);this.dummy.rotation.set(0,0,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.incidentMarkers.setMatrixAt(index,this.dummy.matrix);this.incidentMarkers.setColorAt(index,new THREE.Color(incident.type==='violence'?0xf18c72:0xffd084));});
    this.incidentMarkers.instanceMatrix.needsUpdate=true;this.incidentMarkers.boundingSphere=null;if(this.incidentMarkers.instanceColor)this.incidentMarkers.instanceColor.needsUpdate=true;this.incidentMarkers.visible=this.layers.incidents;
  }
  _label(id,text,color){
    let element=this.labelMap.get(id);
    if(!element){element=document.createElement('span');element.style.cssText='position:absolute;left:0;top:0;pointer-events:none;white-space:nowrap;font:700 10px system-ui,sans-serif;letter-spacing:.025em;padding:4px 6px;border:1px solid;border-radius:3px;background:#10232ce8;';this.labels.append(element);this.labelMap.set(id,element);}
    if(element.textContent!==text)element.textContent=text;element.style.color=color;element.style.borderColor=color;return element;
  }
  _placeLabel(element,position,height=1.5){
    const p=this.project(position.x,position.z,height);element.style.display=p.visible?'block':'none';element.style.transform=`translate(${p.x-this.rect.left}px,${p.y-this.rect.top}px) translate(-50%,-125%)`;
  }
  _entity(selection){
    if(!selection||!this.state)return null;
    if(selection.kind==='person'){const value=recordOf(this.state.people,selection.id);return value?{value,position:this._position(value)}:null;}
    if(selection.kind==='vehicle'){const value=recordOf(this.state.vehicles,selection.id);return value?{value,position:this._position(value)}:null;}
    if(selection.kind==='building'){const value=recordOf(this.city.buildings,selection.id);return value?{value,position:{x:value.x,z:value.z}}:null;}
    if(selection.kind==='incident'){const value=recordOf(this._visibleIncidents(),selection.id);return value?{value,position:{x:value.x,z:value.z}}:null;}
    return null;
  }
  _drawSelection(activeLabels){
    const record=this._entity(this.selected);this.selectionMarker.visible=!!record?.position;
    if(record?.position){
      const p=record.position;this.selectionMarker.position.set(p.x,.13,p.z);this.selectionMarker.material.opacity=p.hidden?.45:.9;
      this.selectionMarker.scale.setScalar(this.selected.kind==='building'?2.7:this.selected.kind==='vehicle'?1.7:1);
      const value=record.value,name=value.name||value.id;
      const description=p.hidden?` · INTERIOR: ${p.description} · ${p.inside==='vehicle'?'posição da viatura':'marcador de entrada'}`:(this.selected.kind==='person'?' · pessoa visível':this.selected.kind==='vehicle'?` · ${value.type==='ambulance'?'ambulância':'polícia'}`:'');
      const label=this._label('selection',name+description,'#ffe2a1');this._placeLabel(label,p,this.selected.kind==='building'?(value.height||3)+.8:1.7);activeLabels.add('selection');
    }
    let path=[],graph,start=record?.position;
    if(record&&this.layers.routes){
      if(this.selected.kind==='person'){
        const transport=record.value.location?.kind==='vehicle'?recordOf(this.state.vehicles,record.value.location.vehicleId):null;
        path=transport?.path||record.value.path||[];graph=transport?this.city.vehicleGraph:this.city.pedestrianGraph;
      }
      else if(this.selected.kind==='vehicle'){path=record.value.path||[];graph=this.city.vehicleGraph;}
      else if(this.selected.kind==='incident'){
        const patrol=recordOf(this.state.patrols,record.value.assignedPatrolId);
        const vehicle=recordOf(this.state.vehicles,record.value.assignedAmbulanceId)||recordOf(this.state.vehicles,patrol?.vehicleId);
        if(vehicle){path=vehicle.path||[];graph=this.city.vehicleGraph;start=this._position(vehicle);}
      }
    }
    const nodes=graph?path.map(id=>this._node(graph,id)).filter(Boolean):[];
    if(nodes.length&&start)nodes.unshift(start);
    const key=nodes.map(p=>`${p.x},${p.z}`).join(';');
    if(key!==this.routeKey){const points=[];for(let i=1;i<nodes.length;i++)points.push(new THREE.Vector3(nodes[i-1].x,.19,nodes[i-1].z),new THREE.Vector3(nodes[i].x,.19,nodes[i].z));this.route.geometry.dispose();this.route.geometry=new THREE.BufferGeometry().setFromPoints(points);this.routeKey=key;}
    this.route.visible=this.layers.routes&&nodes.length>1;
  }
  _drawFacilities(activeLabels){
    if(!this.layers.services)return;
    for(const [kind,title,color] of [['hospital','+ HOSPITAL','#9bf1cc'],['station','POLÍCIA','#9ccdf1']]){
      const building=recordOf(this.city.buildings,this.state.facilities?.[kind]?.buildingId);if(!building)continue;
      const id='facility:'+kind,label=this._label(id,title,color);this._placeLabel(label,building,(building.height||3)+.7);activeLabels.add(id);
    }
  }
  _shotPresentation(now){
    for(const event of this.state.events||[]){
      if(Number.isSafeInteger(event.eventId)){if(event.eventId<=this.lastEventId)continue;this.lastEventId=event.eventId;}
      else if(event.type==='ShotFired'){if(this.seenEvents.has(event.eventId))continue;this.seenEvents.add(event.eventId);}
      if(event.type!=='ShotFired')continue;this.effectsConsumed++;
      if(!this.debug&&!publicEvent(event))continue;
      if((this.state.tick??0)-(event.tick??0)>3)continue;
      const from=event.position,to=event.targetPosition||this._position(recordOf(this.state.people,event.targetId));
      if(from&&to&&[from.x,from.z,to.x,to.z].every(finite)){this.shotEffects.push({eventId:event.eventId,from:{x:from.x,z:from.z},to:{x:to.x,z:to.z},startedAt:now,hit:event.hitOutcome==='hit'||event.hitOutcome===true});this.effectsRendered++;}
    }
    this.shotEffects=this.shotEffects.filter(effect=>now-effect.startedAt<220).slice(-32);let flashes=0,tracers=0,impacts=0;
    for(const effect of this.shotEffects){
      const elapsed=now-effect.startedAt;
      if(!this.reducedEffects&&elapsed<65){this.dummy.position.set(effect.from.x,.9,effect.from.z);this.dummy.rotation.set(0,0,0);this.dummy.scale.setScalar(1-elapsed/65);this.dummy.updateMatrix();this.flash.setMatrixAt(flashes++,this.dummy.matrix);}
      if(elapsed<130){
        const index=tracers*6;this.tracerPositions.set([effect.from.x,.9,effect.from.z,effect.to.x,.65,effect.to.z],index);
        const fade=(1-elapsed/130)*(this.reducedEffects?.3:1);this.tracerColors.set([fade,.8*fade,.5*fade,fade,.8*fade,.5*fade],index);tracers++;
      }
      if(!this.reducedEffects&&effect.hit&&elapsed<180){this.dummy.position.set(effect.to.x,.17,effect.to.z);this.dummy.rotation.set(-Math.PI/2,0,0);this.dummy.scale.setScalar(.6+elapsed/160);this.dummy.updateMatrix();this.impacts.setMatrixAt(impacts++,this.dummy.matrix);}
    }
    this.flash.count=flashes;this.flash.instanceMatrix.needsUpdate=true;this.impacts.count=impacts;this.impacts.instanceMatrix.needsUpdate=true;
    this.tracers.geometry.attributes.position.needsUpdate=true;this.tracers.geometry.attributes.color.needsUpdate=true;this.tracers.geometry.setDrawRange(0,tracers*2);
    this.currentShotEffects={flashes,tracers,impacts};
  }
  render(state,alpha=1){
    if(this.disposed||!state?.city)return;const started=performance.now();
    if(!finite(alpha))throw new TypeError('Visual alpha must be finite.');alpha=clamp(alpha,0,1);
    const newWorld=this.state!==state;
    if(newWorld){this.seenEvents.clear();this.lastEventId=0;this.shotEffects=[];this.effectsConsumed=0;this.effectsRendered=0;this.lastTick=-1;this.poseHistory.captureTick(state);}
    this.state=state;const city=state.city;
    const key=`${state.seed}:${city.width}:${city.height}:${city.buildings?.length}:${city.pedestrianGraph?.nodes?.length}`;
    if(key!==this.cityKey){this.cityKey=key;this._buildCity(city);}else this.city=city;
    if(state.tick<this.lastTick){this.seenEvents.clear();this.lastEventId=0;this.shotEffects=[];this.effectsConsumed=0;this.effectsRendered=0;}this.lastTick=state.tick;
    this._prepareVisualPoses(state,alpha);
    const following=this._entity(this.follow);
    if(following?.position){this.target.x=following.position.x+this.followOffset.x;this.target.z=following.position.z+this.followOffset.z;this._updateCamera();}
    this.rect=this.canvas.getBoundingClientRect();const known=this._knownPeople(),visiblePeople=this._drawPeople(known);this._drawVehicles();this._drawIncidents();
    this.buildingBodies.visible=this.layers.buildings;this.buildingRoofs.visible=this.layers.buildings;this.buildingWindows.visible=this.layers.buildings;this.portals.visible=this.layers.buildings;
    const activeLabels=new Set();this._drawFacilities(activeLabels);this._drawSelection(activeLabels);
    for(const [id,label] of this.labelMap)if(!activeLabels.has(id)){label.remove();this.labelMap.delete(id);}
    this._shotPresentation(performance.now());this.renderer.render(this.scene,this.camera);
    const locations={street:0,building:0,vehicle:0,hospital:0};for(const person of state.people||[])locations[person.location?.kind]=(locations[person.location?.kind]||0)+1;
    this.metrics={...this.structuralCounts,logicalPeople:state.people?.length||0,renderedPeople:this.layers.people?visiblePeople:0,peopleByLocation:locations,
      logicalVehicles:state.vehicles?.length||0,renderedVehicles:this.layers.vehicles?(state.vehicles?.length||0):0,reportedIncidents:this.incidentIds.length,
      renderCpuMs:performance.now()-started,alpha,shotEventsConsumed:this.effectsConsumed,shotEventsRendered:this.effectsRendered,shotEffects:{...this.currentShotEffects}};
  }
  setSelected(selection){this.selected=selection?{kind:selection.kind,id:selection.id}:null;}
  setFollow(selection){this.follow=selection?{kind:selection.kind,id:selection.id}:null;this.followOffset={x:0,z:0};if(selection){this.camera.zoom=Math.max(this.camera.zoom,selection.kind==='person'?2.8:selection.kind==='vehicle'?2.2:1.8);this._updateCamera();}}
  setLayer(name,value){const alias={population:'people',agents:'people',service:'services',occurrences:'incidents',paths:'routes',health:'risk'};name=alias[name]||name;if(Object.hasOwn(this.layers,name))this.layers[name]=Boolean(value);}
  setDebug(value){this.debug=Boolean(value);}
  setReducedEffects(value){this.reducedEffects=Boolean(value);}
  resize(){
    if(this.disposed)return;const rect=this.container.getBoundingClientRect();this.width=Math.max(1,rect.width||640);this.height=Math.max(1,rect.height||480);
    this.dpr=clamp(window.devicePixelRatio||1,1,2);this.renderer.setPixelRatio(this.dpr);this.renderer.setSize(this.width,this.height,false);this.rect=this.canvas.getBoundingClientRect();this._updateCamera();
  }
  _updateCamera(){const span=Math.max(this.widthWorld,this.heightWorld)*1.02,aspect=(this.width||640)/(this.height||480),offset=cameraOffset(this.azimuth);this.cameraOffset.set(offset.x,offset.y,offset.z);this.camera.left=-span*aspect/2;this.camera.right=span*aspect/2;this.camera.top=span/2;this.camera.bottom=-span/2;this.camera.position.copy(this.target).add(this.cameraOffset);this.camera.lookAt(this.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();}
  rotateCamera(direction){if(direction!==-1&&direction!==1)throw new TypeError('Camera rotation must be -1 or +1.');this.rotationSteps=((this.rotationSteps+direction)%24+24)%24;this.azimuth=normalizeAzimuth(CANONICAL_AZIMUTH+this.rotationSteps*CAMERA_ROTATION_STEP);this._updateCamera();return this.azimuth;}
  resetCamera(){this.follow=null;this.followOffset={x:0,z:0};this.target.set(this.widthWorld/2,0,this.heightWorld/2);this.camera.zoom=1;this.rotationSteps=0;this.azimuth=CANONICAL_AZIMUTH;this._updateCamera();}
  project(x,z,height=0){const p=new THREE.Vector3(x,height,z).project(this.camera),rect=this.canvas.getBoundingClientRect();return {x:rect.left+(p.x+1)*rect.width/2,y:rect.top+(1-p.y)*rect.height/2,visible:p.z>=-1&&p.z<=1&&Math.abs(p.x)<=1.05&&Math.abs(p.y)<=1.05};}
  projectEntity(kind,id){const entity=this._entity({kind,id});return entity?.position?this.project(entity.position.x,entity.position.z,kind==='person'?.6:kind==='vehicle'?.65:kind==='incident'?1.7:kind==='building'?(entity.value.height||3)/2:0):null;}
  getVisualPose(kind,id){
    if(kind==='person'||kind==='vehicle'){const pose=this.drawnPoses[kind==='person'?'people':'vehicles'].get(id);return pose?{...pose}:null;}
    const entity=this._entity({kind,id});return entity?.position?{kind,id,...entity.position,interpolated:false,currentTick:this.state.tick,previousTick:this.state.tick}:null;
  }
  _groundAt(x,y){const rect=this.canvas.getBoundingClientRect();this.pointerNdc.set((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2);this.raycaster.setFromCamera(this.pointerNdc,this.camera);return this.raycaster.ray.intersectPlane(this.ground,new THREE.Vector3());}
  _pick(clientX,clientY){
    const point=this._groundAt(clientX,clientY);if(!point)return null;
    const meshes=[this.peopleBodies,this.peopleHeads,this.vehicleBodies,this.vehicleRoofs,this.incidentMarkers,this.buildingBodies].filter(mesh=>mesh?.visible);
    const hits=this.raycaster.intersectObjects(meshes,false);
    for(const hit of hits){
      const index=hit.instanceId;if(index===undefined)continue;
      if(hit.object===this.peopleBodies||hit.object===this.peopleHeads)return {kind:'person',id:this.peopleIds[index]};
      if(hit.object===this.vehicleBodies||hit.object===this.vehicleRoofs)return {kind:'vehicle',id:this.vehicleIds[index]};
      if(hit.object===this.incidentMarkers)return {kind:'incident',id:this.incidentIds[index]};
      if(hit.object===this.buildingBodies)return {kind:'building',id:this.city.buildings[index].id};
    }
    if(this.layers.people){const person=(this.state?.people||[]).filter(p=>p.location?.kind==='street').find(p=>{const pose=this._position(p);return pose&&Math.hypot(pose.x-point.x,pose.z-point.z)<.42;});if(person)return {kind:'person',id:person.id};}
    if(this.layers.vehicles){const vehicle=(this.state?.vehicles||[]).find(v=>{const pose=this._position(v);return pose&&Math.hypot(pose.x-point.x,pose.z-point.z)<1;});if(vehicle)return {kind:'vehicle',id:vehicle.id};}
    if(this.layers.buildings){for(const building of this.city?.buildings||[])for(const id of building.entranceNodeIds||[]){const node=this._node(this.city.pedestrianGraph,id);if(node&&Math.hypot(node.x-point.x,node.z-point.z)<.7)return {kind:'building',id:building.id};}}
    return null;
  }
  _pan(delta){
    this.target.x=clamp(this.target.x+delta.x,-this.widthWorld*.2,this.widthWorld*1.2);this.target.z=clamp(this.target.z+delta.z,-this.heightWorld*.2,this.heightWorld*1.2);
    const following=this._entity(this.follow);if(following?.position)this.followOffset={x:this.target.x-following.position.x,z:this.target.z-following.position.z};this._updateCamera();
  }
  _bindInput(){
    this.handlers={
      pointerdown:event=>{if(this.pointer||![0,1,2].includes(event.button))return;event.preventDefault();this.canvas.focus({preventScroll:true});this.pointer={id:event.pointerId,button:event.button,x:event.clientX,y:event.clientY,ground:this._groundAt(event.clientX,event.clientY),dragged:false};this.canvas.setPointerCapture(event.pointerId);},
      pointermove:event=>{const pointer=this.pointer;if(!pointer||pointer.id!==event.pointerId)return;if(Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>5)pointer.dragged=true;if(pointer.dragged&&pointer.ground){const now=this._groundAt(event.clientX,event.clientY);if(now)this._pan(pointer.ground.clone().sub(now));}},
      pointerup:event=>{const pointer=this.pointer;if(!pointer||pointer.id!==event.pointerId)return;this.pointer=null;if(this.canvas.hasPointerCapture(event.pointerId))this.canvas.releasePointerCapture(event.pointerId);if(!pointer.dragged&&pointer.button===0)this.onSelect?.(this._pick(event.clientX,event.clientY));},
      pointercancel:()=>{this.pointer=null;},contextmenu:event=>event.preventDefault(),
      wheel:event=>{event.preventDefault();const before=this._groundAt(event.clientX,event.clientY);this.camera.zoom=clamp(this.camera.zoom*Math.exp(-event.deltaY*.0012),.55,5.5);this._updateCamera();const after=this._groundAt(event.clientX,event.clientY);if(before&&after)this._pan(before.sub(after));}
    };
    for(const [type,handler] of Object.entries(this.handlers))this.canvas.addEventListener(type,handler,{passive:false});
  }
  getMetrics(){return {...this.metrics,renderer:`Three.js r${THREE.REVISION} / WebGL 2`,webgl2:true,gpu:{...this.gpu},drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,
    memory:{geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures},dpr:this.dpr,resolution:{cssWidth:this.width,cssHeight:this.height,bufferWidth:this.canvas.width,bufferHeight:this.canvas.height},
    camera:{target:{x:this.target.x,z:this.target.z},zoom:this.camera.zoom,azimuthRadians:this.azimuth,azimuthDegrees:this.azimuth*180/Math.PI,rotationStepDegrees:15},
    interpolation:{...this.poseHistory.getSummary(),alpha:this.visualAlpha,tickMilliseconds:100},selected:this.selected?{...this.selected}:null,follow:this.follow?{...this.follow}:null,debug:this.debug,reducedEffects:this.reducedEffects,
    representation:'One street-person body per canonical identity; building/vehicle occupants remain counted and hidden. Selection markers at entrances are not extra people.'};}
  dispose(){if(this.disposed)return;this.disposed=true;for(const [type,handler] of Object.entries(this.handlers))this.canvas.removeEventListener(type,handler);this.resizeObserver?.disconnect();window.removeEventListener('resize',this.windowResize);this.labels.remove();disposeTree(this.scene);this.renderer.dispose();this.renderer.forceContextLoss();if(this.ownsCanvas)this.canvas.remove();this.labelMap.clear();this.state=null;this.city=null;this.shotEffects=[];this.seenEvents.clear();this.drawnPoses.people.clear();this.drawnPoses.vehicles.clear();}
}
