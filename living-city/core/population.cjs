'use strict';
function personRecord(id,name,role,building,node,extra={}){
  return {id,name,role,homeBuildingId:building.id,workBuildingId:building.id,
    location:{kind:'building',buildingId:building.id},x:node.x,z:node.z,nodeId:node.id,path:[],destinationBuildingId:null,
    activity:role==='resident'?'atHome':'onDuty',lifeState:'alive',healthState:'healthy',hostile:false,symptoms:[],observedSymptoms:[],knownThreats:[],fear:0,mobility:1,taskId:null,hp:100,...extra};
}
function initializePopulation(ctx){
  const {state:s}=ctx,homes=s.city.buildings.filter(b=>b.type==='residential'),destinations=s.city.buildings.filter(b=>b.type==='office'||b.type==='shop');
  const ped=id=>s.city.pedestrianGraph.nodes.find(n=>n.id===id),road=id=>s.city.vehicleGraph.nodes.find(n=>n.id===id);
  const hospital=s.city.buildings.find(b=>b.type==='hospital'),station=s.city.buildings.find(b=>b.type==='station');
  s.facilities={hospital:{buildingId:hospital.id,capacity:s.config.hospitalCapacity,patientIds:[],staffIds:[]},station:{buildingId:station.id,patrolIds:[]}};
  for(let i=0;i<s.config.residents;i++){
    const home=homes[i%homes.length],work=destinations[(i*3+Math.floor(ctx.random()*destinations.length))%destinations.length];
    const p=personRecord(`resident-${String(i+1).padStart(3,'0')}`,`Habitante ${i+1}`,'resident',home,ped(home.entranceNodeIds[0]),{
      workBuildingId:work.id,nextRoutineTick:20+Math.floor(ctx.random()*700),routineIndex:i%3,routineTrips:0,walkSpeed:.9+ctx.random()*.4
    });
    s.people.push(p);
    if(i%4===0){
      const node=s.city.pedestrianGraph.nodes[(i*7)%s.city.pedestrianGraph.nodes.length];p.location={kind:'street',nodeId:node.id};p.nodeId=node.id;p.x=node.x;p.z=node.z;
      p.destinationBuildingId=work.id;p.activity='walking';ctx.routePerson(p,work.entranceNodeIds[0]);
    }
  }
  const patient=s.config.initialPersonId?s.people.find(p=>p.id===s.config.initialPersonId):s.people[s.seed%s.config.residents];
  if(!patient||patient.role!=='resident')throw new TypeError('Initial person must identify an existing resident.');
  s.initialPersonId=patient.id;
  const block=1+(Math.floor(s.seed/32)%8),publicNode=s.city.pedestrianGraph.nodes.find(n=>n.id===`block-${block}-walk-1`);
  patient.location={kind:'street',nodeId:publicNode.id};patient.nodeId=publicNode.id;patient.x=publicNode.x;patient.z=publicNode.z;patient.path=[];patient.activity='resting';patient.nextRoutineTick=800;
  const witnesses=s.people.filter(p=>p.id!==patient.id).slice(0,3);
  for(let i=0;i<witnesses.length;i++){
    const witness=witnesses[i];witness.location={kind:'street',nodeId:publicNode.id};witness.nodeId=publicNode.id;witness.x=publicNode.x+(i-1)*.25;witness.z=publicNode.z;witness.path=[];witness.activity='resting';witness.nextRoutineTick=600+i*40;
  }
  for(let i=0;i<s.config.ambulances;i++){
    const at=road(hospital.vehicleNodeId),id=`ambulance-${i+1}`,crewIds=[];
    for(let j=0;j<2;j++){
      const pid=`medic-${i*2+j+1}`;crewIds.push(pid);s.people.push(personRecord(pid,`Socorrista ${i*2+j+1}`,'medic',hospital,ped(hospital.entranceNodeIds[0]),{teamId:id,location:{kind:'vehicle',vehicleId:id},x:at.x,z:at.z,nodeId:`foot-${at.id}`,activity:'available'}));
    }
    s.vehicles.push({id,type:'ambulance',x:at.x,z:at.z,nodeId:at.id,path:[],crewIds,passengerIds:[],capacity:1,status:'available',incidentId:null,availableAt:0,broken:false,homeNodeId:at.id});
  }
  for(let i=0;i<s.config.patrols;i++){
    const at=road(station.vehicleNodeId),id=`police-car-${i+1}`,patrolId=`patrol-${i+1}`,officerIds=[];
    for(let j=0;j<2;j++){
      const pid=`officer-${i*2+j+1}`;officerIds.push(pid);s.people.push(personRecord(pid,`Agente ${i*2+j+1}`,'officer',station,ped(station.entranceNodeIds[0]),{teamId:patrolId,ammo:32,cooldownTick:0,location:{kind:'vehicle',vehicleId:id},x:at.x,z:at.z,nodeId:`foot-${at.id}`,activity:'patrolling'}));
    }
    s.vehicles.push({id,type:'police',x:at.x,z:at.z,nodeId:at.id,path:[],crewIds:officerIds.slice(),passengerIds:[],capacity:2,status:'available',incidentId:null,availableAt:0,broken:false,homeNodeId:at.id});
    s.patrols.push({id:patrolId,vehicleId:id,officerIds,status:'available',incidentId:null,routeIndex:i});s.facilities.station.patrolIds.push(patrolId);
  }
  for(let i=0;i<4;i++){
    const p=personRecord(`hospital-staff-${i+1}`,`Profissional hospitalar ${i+1}`,'hospitalStaff',hospital,ped(hospital.entranceNodeIds[0]),{activity:'hospitalDuty'});
    s.people.push(p);s.facilities.hospital.staffIds.push(p.id);
  }
  s.initialPopulation=s.people.length;
}
function updateRoutines(ctx){
  const s=ctx.state;
  for(const person of s.people){
    if(person.role!=='resident'||person.lifeState!=='alive'||person.taskId||person.healthState==='symptomatic'||person.healthState==='critical'||person.location.kind==='vehicle'||person.location.kind==='hospital')continue;
    if(person.activity==='walking'){
      if(ctx.movePerson(person,person.walkSpeed*person.mobility)){
        const building=s.city.buildings.find(b=>b.id===person.destinationBuildingId);
        if(building){person.location={kind:'building',buildingId:building.id};person.activity=building.id===person.homeBuildingId?'atHome':'atService';person.nextRoutineTick=s.tick+120+Math.floor(ctx.random()*600);person.routineTrips++;}
      }
    }else if(s.tick>=person.nextRoutineTick){
      const buildings=s.city.buildings.filter(b=>b.type==='shop'||b.type==='office');
      const id=person.routineIndex%3===0?person.workBuildingId:person.routineIndex%3===1?buildings[(person.routineIndex+person.id.length)%buildings.length].id:person.homeBuildingId;
      const target=s.city.buildings.find(b=>b.id===id);
      if(ctx.routePerson(person,target.entranceNodeIds[0])){person.destinationBuildingId=id;person.activity='walking';person.routineIndex++;}
      else{person.nextRoutineTick=s.tick+50;person.waitReason='Percurso pedonal interrompido.';}
    }
  }
}
module.exports={initializePopulation,updateRoutines};
