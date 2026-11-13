import * as THREE from 'three';

const PROFILES = Object.freeze({
  P1: Object.freeze({buildings:2000, markers:2000}),
  P2: Object.freeze({buildings:5000, markers:5000}),
  P3: Object.freeze({buildings:10000, markers:10000})
});
const TEAM_COLORS = [0x60c8ff,0xc6a1ff];
const ZONE_COLORS = {controlled:0x62e6ac, threatened:0xffc765, lost:0xff6c68};
const clamp = (value,min,max)=>Math.max(min,Math.min(max,value));
const finite = value=>typeof value==='number'&&Number.isFinite(value);
// Cosmetic sampling is independent from the operation's deterministic RNG.
function noise(index,salt=0){
  let n=Math.imul((index+1)^salt,0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);
  return ((n^(n>>>16))>>>0)/4294967296;
}
function disposeTree(object){
  const geometries=new Set(),materials=new Set();
  object.traverse(child=>{
    if(child.isInstancedMesh)child.dispose();
    if(child.geometry)geometries.add(child.geometry);
    for(const material of [].concat(child.material||[]))materials.add(material);
  });
  for(const geometry of geometries)geometry.dispose();
  for(const material of materials)material.dispose();
}

/** Read-only Three.js presentation. Coordinates use the simulation's x/z grid. */
export class UrbanRenderer {
  constructor({container,canvas,profile='P1',onGroundClick,onTeamClick,onPointerLatency}={}){
    if(!container)throw new Error('O renderizador urbano precisa de um contentor.');
    this.container=container;this.ownsCanvas=!canvas;this.canvas=canvas||document.createElement('canvas');
    this.canvas.style.cssText+=';display:block;width:100%;height:100%;touch-action:none;';
    this.canvas.setAttribute('aria-label','Cidade sintética 3D: arrastar para mover a câmara, roda para ampliar e clicar para selecionar ou ordenar.');
    this.canvas.tabIndex=0;
    if(!canvas)container.append(this.canvas);
    if(getComputedStyle(container).position==='static')container.style.position='relative';
    this.callbacks={onGroundClick,onTeamClick,onPointerLatency};
    this.profile='P1';this.map=null;this.mapKey=null;this.lastState=null;this.selectedTeamId=null;
    this.pointer=null;this.disposed=false;this.mapWidth=40;this.mapHeight=40;
    this.target=new THREE.Vector3(20,0,20);this.cameraOffset=new THREE.Vector3(31,43,31);
    this.raycaster=new THREE.Raycaster();this.ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);
    this.pointerNdc=new THREE.Vector2();this.matrix=new THREE.Matrix4();this.dummy=new THREE.Object3D();
    const context=this.canvas.getContext('webgl2',{alpha:false,antialias:false,depth:true,stencil:false,powerPreference:'high-performance'});
    if(!context){if(this.ownsCanvas)this.canvas.remove();throw new Error('Esta prova requer WebGL 2. O navegador não disponibilizou esse contexto.');}
    this.webgl=context;
    this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,context,alpha:false,antialias:false});
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x0a1521,1);
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x0a1521);
    this.scene.add(new THREE.HemisphereLight(0xc9e5ff,0x273338,2.2));
    const sunlight=new THREE.DirectionalLight(0xffefce,2.6);sunlight.position.set(-18,45,22);this.scene.add(sunlight);
    this.camera=new THREE.OrthographicCamera(-30,30,24,-24,.1,240);
    this.camera.zoom=1;
    this.staticGroup=new THREE.Group();this.scene.add(this.staticGroup);
    this.liveGroup=new THREE.Group();this.scene.add(this.liveGroup);
    this.labels=document.createElement('div');this.labels.setAttribute('aria-hidden','true');
    this.labels.style.cssText='position:absolute;inset:0;overflow:hidden;pointer-events:none;';
    container.append(this.labels);this.labelMap=new Map();
    this._createLiveMeshes();this._bindInput();this.setProfile(profile);this.resize();this.resetCamera();
    this.resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>this.resize()):null;
    this.resizeObserver?.observe(container);
    this.windowResize=()=>this.resize();window.addEventListener('resize',this.windowResize);
    const debug=context.getExtension('WEBGL_debug_renderer_info');
    this.gpu={vendor:context.getParameter(debug?debug.UNMASKED_VENDOR_WEBGL:context.VENDOR),
      renderer:context.getParameter(debug?debug.UNMASKED_RENDERER_WEBGL:context.RENDERER),
      version:context.getParameter(context.VERSION),timerQuerySupported:!!context.getExtension('EXT_disjoint_timer_query_webgl2')};
  }
  _createLiveMeshes(){
    this.populationGeometry=new THREE.BufferGeometry();
    this.populationMaterial=new THREE.PointsMaterial({size:4,vertexColors:true,sizeAttenuation:false,transparent:false});
    this.populationMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',
      'if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;\n#include <color_fragment>');};
    this.population=new THREE.Points(this.populationGeometry,this.populationMaterial);this.population.frustumCulled=false;
    this.liveGroup.add(this.population);
    this.teams=new THREE.InstancedMesh(new THREE.BoxGeometry(.75,.34,1),new THREE.MeshLambertMaterial({color:0xffffff}),2);
    this.teams.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.teams.frustumCulled=false;this.teams.count=0;
    this.liveGroup.add(this.teams);
    this.teamCaps=new THREE.InstancedMesh(new THREE.BoxGeometry(.46,.21,.42),new THREE.MeshLambertMaterial({color:0xe6f5ff}),2);
    this.teamCaps.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.teamCaps.frustumCulled=false;this.teamCaps.count=0;
    this.liveGroup.add(this.teamCaps);
    this.selection=new THREE.Mesh(new THREE.RingGeometry(.64,.77,32),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
    this.selection.rotation.x=-Math.PI/2;this.selection.position.y=.08;this.selection.visible=false;this.liveGroup.add(this.selection);
    this.barrierCapacity=128;
    this.barriers=new THREE.InstancedMesh(new THREE.BoxGeometry(.92,.65,.34),new THREE.MeshLambertMaterial({color:0xffffff}),this.barrierCapacity);
    this.barriers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.barriers.frustumCulled=false;this.barriers.count=0;this.liveGroup.add(this.barriers);
    this.zoneGroup=new THREE.Group();this.liveGroup.add(this.zoneGroup);this.zoneMeshes=new Map();
    this.beaconGroup=new THREE.Group();this.liveGroup.add(this.beaconGroup);this.beacons=new Map();
    this.route=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x67e4db,transparent:true,opacity:.8}));
    this.route.frustumCulled=false;this.liveGroup.add(this.route);this.routeKey=null;
    this.teamRoutes=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xa4d3ff,transparent:true,opacity:.65}));
    this.teamRoutes.frustumCulled=false;this.liveGroup.add(this.teamRoutes);this.teamRouteKey=null;
  }
  setProfile(profile){
    if(!Object.hasOwn(PROFILES,profile))throw new Error('Perfil visual desconhecido.');
    if(profile===this.profile&&this.populationPositions)return;
    this.profile=profile;
    const count=PROFILES[profile].markers;
    this.populationGeometry.dispose();this.populationGeometry=new THREE.BufferGeometry();this.population.geometry=this.populationGeometry;
    this.populationPositions=new Float32Array(count*3);this.populationColors=new Float32Array(count*3);
    this.populationGeometry.setAttribute('position',new THREE.BufferAttribute(this.populationPositions,3).setUsage(THREE.DynamicDrawUsage));
    this.populationGeometry.setAttribute('color',new THREE.BufferAttribute(this.populationColors,3).setUsage(THREE.DynamicDrawUsage));
    this.populationGeometry.setDrawRange(0,0);
    this.markerOffsets=new Float32Array(count*2);
    for(let i=0;i<count;i++){
      const angle=noise(i,31)*Math.PI*2,radius=Math.sqrt(noise(i,47))*1.7;
      this.markerOffsets[i*2]=Math.cos(angle)*radius;this.markerOffsets[i*2+1]=Math.sin(angle)*radius;
    }
    if(this.map)this._buildMap();
  }
  _mapSignature(map){
    let hash=2166136261;
    for(let i=0;i<map.walkable.length;i++)hash=Math.imul(hash^(map.walkable[i]?1:0),16777619);
    return `${map.width}:${map.height}:${hash>>>0}`;
  }
  _buildMap(){
    disposeTree(this.staticGroup);this.scene.remove(this.staticGroup);this.staticGroup=new THREE.Group();this.scene.add(this.staticGroup);
    const {width,height,walkable}=this.map;
    const surface=new THREE.Mesh(new THREE.PlaneGeometry(width+2,height+2),new THREE.MeshLambertMaterial({color:0x172c35}));
    surface.rotation.x=-Math.PI/2;surface.position.set(width/2,-.08,height/2);this.staticGroup.add(surface);
    const blocked=[],open=[];
    for(let z=0;z<height;z++)for(let x=0;x<width;x++)(walkable[z*width+x]?open:blocked).push({x,z});
    const roads=new THREE.InstancedMesh(new THREE.PlaneGeometry(.99,.99),new THREE.MeshLambertMaterial({color:0xffffff}),open.length);
    const color=new THREE.Color();
    for(let i=0;i<open.length;i++){
      const cell=open[i];this.dummy.position.set(cell.x+.5,-.045,cell.z+.5);this.dummy.rotation.set(-Math.PI/2,0,0);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();roads.setMatrixAt(i,this.dummy.matrix);
      roads.setColorAt(i,color.setHex((cell.x+cell.z)%2?0x263b46:0x293f49));
    }
    roads.instanceMatrix.needsUpdate=true;if(roads.instanceColor)roads.instanceColor.needsUpdate=true;this.staticGroup.add(roads);
    const count=blocked.length?PROFILES[this.profile].buildings:0;
    const buildings=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,count));
    const roofs=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),Math.max(1,count));
    buildings.count=count;roofs.count=count;
    const subdivisions=Math.ceil(Math.sqrt(Math.ceil(count/Math.max(1,blocked.length))));
    for(let i=0;i<count;i++){
      const cell=blocked[i%blocked.length],local=Math.floor(i/blocked.length),step=.9/subdivisions;
      const x=cell.x+.05+(local%subdivisions+.5)*step,z=cell.z+.05+(Math.floor(local/subdivisions)+.5)*step;
      const sx=step*(.74+noise(i,11)*.18),sz=step*(.74+noise(i,17)*.18),h=.42+noise(i,73)**2*2.75;
      this.dummy.rotation.set(0,0,0);this.dummy.position.set(x,h/2,z);this.dummy.scale.set(sx,h,sz);this.dummy.updateMatrix();buildings.setMatrixAt(i,this.dummy.matrix);
      color.setHex([0x526d78,0x637986,0x3d5968,0x6f807e,0x485f73][i%5]);buildings.setColorAt(i,color);
      this.dummy.position.y=h+.025;this.dummy.scale.set(sx*.9,.05,sz*.9);this.dummy.updateMatrix();roofs.setMatrixAt(i,this.dummy.matrix);
      roofs.setColorAt(i,color.multiplyScalar(1.18));
    }
    buildings.instanceMatrix.needsUpdate=true;roofs.instanceMatrix.needsUpdate=true;
    if(count){buildings.instanceColor.needsUpdate=true;roofs.instanceColor.needsUpdate=true;}
    this.staticGroup.add(buildings,roofs);this.buildingCount=count;
    const edge=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,.01,0),new THREE.Vector3(width,.01,0),new THREE.Vector3(width,.01,height),new THREE.Vector3(0,.01,height)
    ]),new THREE.LineBasicMaterial({color:0x66818e}));this.staticGroup.add(edge);
  }
  _label(id,text,color){
    let element=this.labelMap.get(id);
    if(!element){
      element=document.createElement('span');element.style.cssText='position:absolute;left:0;top:0;white-space:nowrap;transform-origin:0 0;font:700 10px system-ui,sans-serif;letter-spacing:.045em;padding:4px 6px;border:1px solid;background:#0a1724e8;border-radius:3px;box-shadow:0 2px 10px #0006;';
      this.labels.append(element);this.labelMap.set(id,element);
    }
    if(element.textContent!==text)element.textContent=text;
    element.style.color=color;element.style.borderColor=color;return element;
  }
  _positionLabel(element,x,z,y=.5,offsetY=0){
    const point=this.screenPoint(x,z,y);element.style.display=point.visible?'block':'none';
    element.style.transform=`translate(${point.x-this.rect.left}px,${point.y-this.rect.top+offsetY}px) translate(-50%,-135%)`;
  }
  _walkable(x,z){
    const ix=Math.floor(x),iz=Math.floor(z);
    return ix>=0&&iz>=0&&ix<this.mapWidth&&iz<this.mapHeight&&this.map.walkable[iz*this.mapWidth+ix];
  }
  _population(state){
    const hordes=(state.hordes||[]).filter(group=>group.count>0&&group.active!==false&&(state.tick??0)>=(group.activeFromTick??group.spawnTick??0));
    const civilians=(state.civilians||[]).filter(group=>group.count>0);
    const key=this.profile+'|'+this.mapKey+'|'+hordes.map(g=>`${g.id}:${g.x}:${g.z}:${g.count}`).join(';')+'|'+civilians.map(g=>`${g.id}:${g.x}:${g.z}:${g.count}`).join(';');
    if(key===this.populationKey)return;this.populationKey=key;
    const zombies=hordes.reduce((sum,g)=>sum+g.count,0),people=civilians.reduce((sum,g)=>sum+g.count,0);
    const count=zombies+people>0?PROFILES[this.profile].markers:0;
    const hordeCount=Math.round(count*zombies/Math.max(1,zombies+people));
    for(let i=0;i<count;i++){
      const isHorde=i<hordeCount,groups=isHorde?hordes:civilians;
      const group=groups[i%groups.length];
      let x=group.x+this.markerOffsets[i*2],z=group.z+this.markerOffsets[i*2+1];
      if(!this._walkable(x,z)){x=group.x;z=group.z;}
      this.populationPositions[i*3]=x;this.populationPositions[i*3+1]=.22;this.populationPositions[i*3+2]=z;
      this.populationColors[i*3]=isHorde?.98:.42;this.populationColors[i*3+1]=isHorde?.39:.91;this.populationColors[i*3+2]=isHorde?.33:.76;
    }
    this.populationGeometry.attributes.position.needsUpdate=true;this.populationGeometry.attributes.color.needsUpdate=true;
    this.populationGeometry.setDrawRange(0,count);this.visualMarkerCount=count;this.logicalPopulation={hordes:hordes.length,zombies,civilianCohorts:civilians.length,civilians:people};
  }
  _updateTeams(state,activeLabels){
    const teams=(state.teams||[]).slice(0,2);this.teams.count=teams.length;this.teamCaps.count=teams.length;this.selection.visible=false;
    teams.forEach((team,index)=>{
      const color=TEAM_COLORS[index];this.dummy.rotation.set(0,0,0);this.dummy.scale.set(1,1,1);
      const destination=team.order?.target||team.order?.destination||team.order;
      if(destination&&finite(destination.x)&&finite(destination.z))this.dummy.rotation.y=Math.atan2(destination.x-team.x,destination.z-team.z);
      this.dummy.position.set(team.x,.35,team.z);this.dummy.updateMatrix();this.teams.setMatrixAt(index,this.dummy.matrix);this.teams.setColorAt(index,new THREE.Color(color));
      this.dummy.position.y=.62;this.dummy.updateMatrix();this.teamCaps.setMatrixAt(index,this.dummy.matrix);
      const id=`team:${team.id}`,selected=team.id===this.selectedTeamId;
      const name=selected?`◆ ${team.name||team.id}`:index?'BRAVO':'ALFA';
      const label=this._label(id,`${name} · ${Math.round(team.health??100)}%`,'#'+color.toString(16).padStart(6,'0'));
      this._positionLabel(label,team.x,team.z,1.05,index?10:-18);activeLabels.add(id);
      if(selected){this.selection.visible=true;this.selection.position.set(team.x,.07,team.z);}
    });
    this.teams.instanceMatrix.needsUpdate=true;this.teamCaps.instanceMatrix.needsUpdate=true;if(this.teams.instanceColor)this.teams.instanceColor.needsUpdate=true;
    this.logicalTeams=teams.length;
    const routes=teams.filter(team=>team.path?.length).map(team=>[{x:team.x,z:team.z},...team.path]);
    const key=routes.map(route=>route.map(point=>`${point.x},${point.z}`).join(';')).join('|');
    if(key!==this.teamRouteKey){
      const points=[];
      for(const route of routes)for(let i=1;i<route.length;i++)points.push(new THREE.Vector3(route[i-1].x,.16,route[i-1].z),new THREE.Vector3(route[i].x,.16,route[i].z));
      this.teamRoutes.geometry.dispose();this.teamRoutes.geometry=new THREE.BufferGeometry().setFromPoints(points);this.teamRouteKey=key;
    }
    this.teamRoutes.visible=!!key;
  }
  _updateBarriers(state){
    const barriers=(state.barriers||[]).filter(barrier=>barrier.hp>0).slice(0,this.barrierCapacity);this.barriers.count=barriers.length;
    const color=new THREE.Color();
    barriers.forEach((barrier,index)=>{
      const fraction=clamp(barrier.hp/Math.max(1,barrier.maxHp??100),0,1);
      this.dummy.rotation.set(0,barrier.rotation||0,0);this.dummy.position.set(barrier.x,.325,barrier.z);this.dummy.scale.set(1,1,1);this.dummy.updateMatrix();this.barriers.setMatrixAt(index,this.dummy.matrix);
      this.barriers.setColorAt(index,color.setHex(fraction>.5?0xffc765:0xff7759));
    });
    this.barriers.instanceMatrix.needsUpdate=true;if(this.barriers.instanceColor)this.barriers.instanceColor.needsUpdate=true;
    this.visualBarrierCount=barriers.length;
  }
  _updateZones(state,activeLabels){
    const present=new Set();
    for(const zone of state.zones||[]){
      let group=this.zoneMeshes.get(zone.id);
      if(!group){
        group=new THREE.Group();const radius=zone.radius||1.65;
        const ring=new THREE.Mesh(new THREE.RingGeometry(radius,radius+.18,40),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.65,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;group.add(ring);
        const mast=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,1.8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55}));mast.position.y=.9;group.add(mast);
        this.zoneGroup.add(group);this.zoneMeshes.set(zone.id,group);
      }
      const color=ZONE_COLORS[zone.state]??ZONE_COLORS.threatened;group.position.set(zone.x,.035,zone.z);
      for(const child of group.children)child.material.color.setHex(color);
      const description={controlled:'CONTROLADA',threatened:'AMEAÇADA',lost:'PERDIDA'}[zone.state]||'AMEAÇADA';
      present.add(zone.id);
      if(zone.id==='exit'&&state.mission?.exit&&Math.hypot(zone.x-state.mission.exit.x,zone.z-state.mission.exit.z)<.5)continue;
      const id=`zone:${zone.id}`,label=this._label(id,`${zone.name||zone.id} · ${description}`,'#'+color.toString(16));
      this._positionLabel(label,zone.x,zone.z,2.1);activeLabels.add(id);
    }
    for(const [id,mesh] of this.zoneMeshes)if(!present.has(id)){disposeTree(mesh);this.zoneGroup.remove(mesh);this.zoneMeshes.delete(id);}
  }
  _updateMission(state,activeLabels){
    const mission=state.mission||{};
    for(const [kind,name,color] of [['base','BASE',0x8fcaff],['exit','SAÍDA / EVACUAÇÃO',0x68f0b4]]){
      const location=mission[kind];let group=this.beacons.get(kind);
      if(!location||!finite(location.x)||!finite(location.z)){if(group)group.visible=false;continue;}
      if(kind==='base'&&mission.exit&&Math.hypot(location.x-mission.exit.x,location.z-mission.exit.z)<.5){if(group)group.visible=false;continue;}
      if(!group){
        group=new THREE.Group();
        const pad=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.07,20),new THREE.MeshLambertMaterial({color}));pad.position.y=.045;group.add(pad);
        const beacon=new THREE.Mesh(new THREE.OctahedronGeometry(.24),new THREE.MeshBasicMaterial({color}));beacon.position.y=2.1;group.add(beacon);
        const mast=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,2,5),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.65}));mast.position.y=1;group.add(mast);
        this.beaconGroup.add(group);this.beacons.set(kind,group);
      }
      group.visible=true;group.position.set(location.x,0,location.z);
      const id=`mission:${kind}`,label=this._label(id,name,'#'+color.toString(16));this._positionLabel(label,location.x,location.z,.15,38);activeLabels.add(id);
    }
    const routes=Array.isArray(mission.corridors)?mission.corridors:Array.isArray(mission.corridor||mission.path)?[mission.corridor||mission.path]:[];
    const key=routes.map(route=>route.map(point=>`${point.x},${point.z}`).join(';')).join('|');
    if(key!==this.routeKey){
      const points=[];
      for(const route of routes)for(let i=1;i<route.length;i++)if([route[i-1].x,route[i-1].z,route[i].x,route[i].z].every(finite))points.push(new THREE.Vector3(route[i-1].x,.11,route[i-1].z),new THREE.Vector3(route[i].x,.11,route[i].z));
      this.route.geometry.dispose();this.route.geometry=new THREE.BufferGeometry().setFromPoints(points);
      this.routeKey=key;
    }
    this.route.visible=!!key;
  }
  render(state,alpha=0){
    if(this.disposed||!state?.map)return;
    const map=state.map;
    if(!Number.isInteger(map.width)||!Number.isInteger(map.height)||map.width<1||map.height<1||!map.walkable||map.walkable.length!==map.width*map.height)throw new Error('Mapa urbano inválido para apresentação.');
    const key=this._mapSignature(map);
    if(key!==this.mapKey){
      const first=!this.map;this.map={width:map.width,height:map.height,walkable:Array.from(map.walkable)};
      this.mapWidth=map.width;this.mapHeight=map.height;this.mapKey=key;this._buildMap();if(first)this.resetCamera();
    }
    this.lastState=state;
    this.rect=this.canvas.getBoundingClientRect();
    this._population(state);const activeLabels=new Set();this._updateTeams(state,activeLabels);this._updateBarriers(state);this._updateZones(state,activeLabels);this._updateMission(state,activeLabels);
    for(const [id,label] of this.labelMap)if(!activeLabels.has(id)){label.remove();this.labelMap.delete(id);}
    this.renderer.render(this.scene,this.camera);
    this.lastAlpha=alpha;
  }
  setSelectedTeam(id){this.selectedTeamId=id;}
  resize(){
    if(this.disposed)return;
    const bounds=this.container.getBoundingClientRect();this.width=Math.max(1,bounds.width||640);this.height=Math.max(1,bounds.height||480);
    this.pixelRatio=clamp(window.devicePixelRatio||1,1,2);this.renderer.setPixelRatio(this.pixelRatio);this.renderer.setSize(this.width,this.height,false);
    this.populationMaterial.size=3.5*this.pixelRatio;
    this.rect=this.canvas.getBoundingClientRect();this._updateCamera();
  }
  _updateCamera(){
    const aspect=(this.width||640)/(this.height||480),span=Math.max(this.mapWidth,this.mapHeight)*1.22;
    this.camera.left=-span*aspect/2;this.camera.right=span*aspect/2;this.camera.top=span/2;this.camera.bottom=-span/2;
    this.camera.position.copy(this.target).add(this.cameraOffset);this.camera.lookAt(this.target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
  }
  resetCamera(){
    this.target.set(this.mapWidth/2,0,this.mapHeight/2);this.camera.zoom=1;this._updateCamera();
  }
  screenPoint(x,z,height=0){
    const point=new THREE.Vector3(x,height,z).project(this.camera),rect=this.canvas.getBoundingClientRect();
    return {x:rect.left+(point.x+1)*rect.width/2,y:rect.top+(1-point.y)*rect.height/2,
      visible:point.z>=-1&&point.z<=1&&Math.abs(point.x)<=1.06&&Math.abs(point.y)<=1.06};
  }
  _groundPoint(clientX,clientY){
    const rect=this.canvas.getBoundingClientRect();this.pointerNdc.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
    this.raycaster.setFromCamera(this.pointerNdc,this.camera);
    return this.raycaster.ray.intersectPlane(this.ground,new THREE.Vector3());
  }
  _panTo(point){
    this.target.x=clamp(point.x,-this.mapWidth*.2,this.mapWidth*1.2);this.target.z=clamp(point.z,-this.mapHeight*.2,this.mapHeight*1.2);this._updateCamera();
  }
  _bindInput(){
    this.handlers={
      pointerdown:event=>{
        if(this.pointer||![0,1,2].includes(event.button))return;
        event.preventDefault();this.canvas.focus({preventScroll:true});
        this.pointer={id:event.pointerId,button:event.button,x:event.clientX,y:event.clientY,ground:this._groundPoint(event.clientX,event.clientY),dragged:false,at:performance.now()};
        this.canvas.setPointerCapture(event.pointerId);
      },
      pointermove:event=>{
        if(!this.pointer||this.pointer.id!==event.pointerId)return;
        const pointer=this.pointer;
        if(Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>5)pointer.dragged=true;
        if(!pointer.dragged||!pointer.ground)return;
        const point=this._groundPoint(event.clientX,event.clientY);
        if(point)this._panTo(this.target.clone().add(pointer.ground).sub(point));
      },
      pointerup:event=>{
        if(!this.pointer||this.pointer.id!==event.pointerId)return;
        const pointer=this.pointer;this.pointer=null;
        if(this.canvas.hasPointerCapture(event.pointerId))this.canvas.releasePointerCapture(event.pointerId);
        if(pointer.dragged||pointer.button===1)return;
        const point=this._groundPoint(event.clientX,event.clientY);
        if(!point||point.x<0||point.z<0||point.x>=this.mapWidth||point.z>=this.mapHeight)return;
        const team=pointer.button===0?(this.lastState?.teams||[]).filter(t=>Math.hypot(t.x-point.x,t.z-point.z)<1.05).sort((a,b)=>Math.hypot(a.x-point.x,a.z-point.z)-Math.hypot(b.x-point.x,b.z-point.z))[0]:null;
        const handledAt=performance.now();
        if(team)this.callbacks.onTeamClick?.(team.id);else this.callbacks.onGroundClick?.({x:point.x,z:point.z,button:pointer.button});
        this.callbacks.onPointerLatency?.(performance.now()-handledAt,{kind:team?'team':'ground',inputAt:pointer.at,handledAt});
      },
      pointercancel:()=>{this.pointer=null;},
      contextmenu:event=>event.preventDefault(),
      wheel:event=>{
        event.preventDefault();const before=this._groundPoint(event.clientX,event.clientY);
        this.camera.zoom=clamp(this.camera.zoom*Math.exp(-event.deltaY*.0012),.55,3.8);this._updateCamera();
        const after=this._groundPoint(event.clientX,event.clientY);if(before&&after)this._panTo(this.target.clone().add(before).sub(after));
      }
    };
    for(const [name,handler] of Object.entries(this.handlers))this.canvas.addEventListener(name,handler,{passive:false});
  }
  getMetrics(){
    return {profile:this.profile,buildings:this.buildingCount||0,visualMarkers:this.visualMarkerCount||0,visualUnits:this.logicalTeams||0,
      logicalTeams:this.logicalTeams||0,logicalPopulation:{...this.logicalPopulation},barriers:this.visualBarrierCount||0,
      activeLogicalHordes:this.logicalPopulation?.hordes||0,
      markerMapping:'Fixed-profile cosmetic samples of aggregated cohorts; markers are not individual logical agents.',
      dummyUnits:0,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,points:this.renderer.info.render.points,
      renderer:`Three.js r${THREE.REVISION} / WebGL 2`,webgl2:true,gpu:{...this.gpu},dpr:this.pixelRatio,
      resolution:{cssWidth:this.width,cssHeight:this.height,bufferWidth:this.canvas.width,bufferHeight:this.canvas.height},
      memory:{geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures},
      camera:{target:{x:this.target.x,z:this.target.z},zoom:this.camera.zoom,position:{x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z}}};
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;
    for(const [name,handler] of Object.entries(this.handlers))this.canvas.removeEventListener(name,handler);
    this.resizeObserver?.disconnect();window.removeEventListener('resize',this.windowResize);
    this.labels.remove();disposeTree(this.scene);this.renderer.dispose();this.renderer.forceContextLoss();if(this.ownsCanvas)this.canvas.remove();
    this.labelMap.clear();this.zoneMeshes.clear();this.beacons.clear();this.lastState=null;this.map=null;
  }
}

export {PROFILES};
