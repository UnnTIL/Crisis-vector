'use strict';
const {distance}=require('./helpers.cjs');
const {setWait}=require('./incidents.cjs');
const personById=(state,id)=>state.people.find(p=>p.id===id);
const seconds=(state,name,fallback)=>Math.max(1,Math.round((state.config.parameters[name]??fallback)*10));
const crew=(s,v)=>v.crewIds.map(id=>personById(s,id)).filter(Boolean);
const hospitalBuilding=s=>s.city.buildings.find(b=>b.id===s.facilities.hospital.buildingId);
function releaseHospitalStaff(ctx,vehicle){
  const person=personById(ctx.state,vehicle.hospitalStaffId);
  if(person?.taskId===`handover:${vehicle.id}`){
    person.taskId=null;if(person.lifeState==='alive'&&person.healthState!=='critical')person.activity='hospitalDuty';
  }
  vehicle.hospitalStaffId=null;
}
function fitHospitalStaff(ctx,person){
  return person&&person.lifeState==='alive'&&person.healthState!=='critical'&&['building','hospital'].includes(person.location.kind)&&
    person.location.buildingId===ctx.state.facilities.hospital.buildingId&&(!person.taskId||person.taskId.startsWith('handover:'));
}
function emit(ctx,type,message,vehicle,incident,extra={}){
  ctx.emit(type,message,{entityIds:[vehicle?.id,incident?.id,incident?.personId].filter(Boolean),position:vehicle?{x:vehicle.x,z:vehicle.z}:undefined,visibility:'confirmed',vehicleId:vehicle?.id,incidentId:incident?.id,...extra});
}
function disembark(ctx,person,vehicle){
  const node=ctx.pedestrianNode(`foot-${vehicle.nodeId}`);
  if(!node)return false;
  vehicle.passengerIds=vehicle.passengerIds.filter(id=>id!==person.id);
  person.location={kind:'street',nodeId:node.id};person.nodeId=node.id;person.x=node.x;person.z=node.z;person.path=[];return true;
}
function board(person,vehicle,isPassenger=false){
  if(isPassenger&&!vehicle.passengerIds.includes(person.id))vehicle.passengerIds.push(person.id);
  person.location={kind:'vehicle',vehicleId:vehicle.id};person.x=vehicle.x;person.z=vehicle.z;person.nodeId=`foot-${vehicle.nodeId}`;person.path=[];
}
function patientPoint(ctx,patient){
  if(patient.location.kind==='building'||patient.location.kind==='hospital'){
    const building=ctx.state.city.buildings.find(b=>b.id===patient.location.buildingId);return ctx.pedestrianNode(building.entranceNodeIds[0]);
  }
  return ctx.pedestrianNode(patient.nodeId)||ctx.pedestrianNode(ctx.nearestPedNode(ctx.position(patient)));
}
function unsafe(ctx,patient,vehicle){
  const s=ctx.state,point=ctx.position(patient);
  return s.people.find(p=>p.lifeState==='reanimated'&&p.hostile&&(
    p.location.kind==='vehicle'&&p.location.vehicleId===vehicle.id||
    p.location.kind==='street'&&distance(ctx.position(p),point)<7&&crew(s,vehicle).some(observer=>canObserve(ctx,observer,p))
  ));
}
function canObserve(ctx,observer,target){
  if(observer.lifeState!=='alive')return false;
  if(observer.location.kind==='vehicle'&&target.location.kind==='vehicle')return observer.location.vehicleId===target.location.vehicleId;
  if(observer.location.buildingId&&observer.location.buildingId===target.location.buildingId)return true;
  return target.location.kind==='street'&&distance(ctx.position(observer),ctx.position(target))<12&&ctx.lineOfSight(ctx.position(observer),ctx.position(target));
}
function assignMedical(ctx){
  const s=ctx.state;
  const waiting=s.incidents.filter(i=>i.type==='medical'&&i.status==='waiting'&&!i.assignedAmbulanceId).sort((a,b)=>b.priority-a.priority||a.reportedAt-b.reportedAt||a.id.localeCompare(b.id));
  for(const incident of waiting){
    const patient=personById(s,incident.personId);
    if(!patient||patient.lifeState!=='alive'||patient.location.kind==='hospital'){incident.status='cancelled';incident.waitReason='A avaliação deixou de necessitar de uma ambulância disponível.';continue;}
    const building=['building','hospital'].includes(patient.location.kind)?s.city.buildings.find(b=>b.id===patient.location.buildingId):null;
    const destination=building?.vehicleNodeId||ctx.nearestRoadNode(ctx.position(patient));
    const available=s.vehicles.filter(v=>v.type==='ambulance'&&v.status==='available'&&!v.broken&&v.availableAt<=s.tick&&crew(s,v).every(p=>p.lifeState==='alive'&&p.healthState!=='critical'&&p.location.kind==='vehicle'&&p.location.vehicleId===v.id));
    available.sort((a,b)=>distance(a,ctx.position(patient))-distance(b,ctx.position(patient))||a.id.localeCompare(b.id));
    let vehicle=null;
    for(const candidate of available){if(ctx.routeVehicle(candidate,destination)){vehicle=candidate;break;}}
    if(!vehicle){
      const reason=available.length?'Percurso viário interrompido; a central aguarda uma rota possível.':s.vehicles.some(v=>v.type==='ambulance'&&v.broken)?'Sem ambulância livre; existe uma viatura avariada.':s.vehicles.some(v=>v.type==='ambulance'&&v.status==='blocked')?'Sem tripulação operacional ou acesso seguro; ambulância indisponível.':'Todas as ambulâncias estão ocupadas; ocorrência em espera por prioridade.';
      setWait(ctx,incident,reason);continue;
    }
    vehicle.status='dispatched';vehicle.incidentId=incident.id;vehicle.destinationPersonId=patient.id;vehicle.speed=s.config.parameters.ambulanceSpeed;
    incident.status='assigned';incident.assignedAmbulanceId=vehicle.id;patient.taskId=incident.id;patient.path=[];patient.activity='awaitingAmbulance';setWait(ctx,incident,null);
    vehicle.phaseTick=s.tick;
    emit(ctx,'AmbulanceDispatched','Uma ambulância com tripulação foi atribuída à ocorrência.',vehicle,incident,{crewIds:vehicle.crewIds.slice()});
  }
}
function returnCrew(ctx,vehicle,incident){
  const s=ctx.state,footId=`foot-${vehicle.nodeId}`;
  let aboard=true;
  for(const medic of crew(s,vehicle)){
    if(medic.lifeState!=='alive'){vehicle.status='blocked';vehicle.waitReason='Tripulação incapacitada; a viatura aguarda substituição externa não modelada.';if(incident)setWait(ctx,incident,vehicle.waitReason);return;}
    if(medic.location.kind==='vehicle'&&medic.location.vehicleId===vehicle.id)continue;
    aboard=false;
    if(medic.destinationNodeId!==footId||!medic.path.length&&medic.nodeId!==footId)ctx.routePerson(medic,footId);
    if(ctx.movePerson(medic,1.2)){board(medic,vehicle);medic.activity='available';medic.taskId=null;}
  }
  if(!aboard)return;
  if(!ctx.routeVehicle(vehicle,vehicle.homeNodeId)){
    vehicle.status='blocked';vehicle.waitReason='Regresso impedido por uma via interrompida.';if(incident)setWait(ctx,incident,vehicle.waitReason);return;
  }
  vehicle.status='returning';emit(ctx,'AmbulanceReturning','A tripulação regressa à base por estrada.',vehicle,incident);
}
function release(ctx,vehicle,incident){
  const s=ctx.state;
  if(incident){incident.completedAmbulanceId=vehicle.id;incident.assignedAmbulanceId=null;}
  vehicle.status='available';vehicle.incidentId=null;vehicle.destinationPersonId=null;vehicle.path=[];vehicle.availableAt=s.tick+30;
  emit(ctx,'AmbulanceAvailable','Ambulância libertada após entrega e preparação.',vehicle,incident);
}
function suspendUnsafe(ctx,vehicle,incident,patient,threat){
  const s=ctx.state;
  releaseHospitalStaff(ctx,vehicle);
  incident.requiresPolice=true;incident.status='awaitingPolice';vehicle.status='awaitingPolice';
  setWait(ctx,incident,'Cena insegura; a equipa médica aguarda proteção policial.');
  if(threat){
    const reporter=crew(s,vehicle).find(p=>canObserve(ctx,p,threat));
    if(reporter)ctx.report(threat,'violence',5,'Comportamento agressivo identificado pela equipa médica',reporter.id);
  }
  emit(ctx,'MedicalSupportRequested','A equipa médica pede apoio e mantém distância.',vehicle,incident,{personId:patient.id});
}
function stopForThreat(ctx,vehicle,incident,patient){
  if(vehicle.path.length){
    const stop=vehicle.path[0];vehicle.path=[stop];vehicle.destinationNodeId=stop;
    if(!ctx.moveVehicle(vehicle,vehicle.speed||ctx.state.config.parameters.ambulanceSpeed))return false;
  }
  for(const id of [...vehicle.passengerIds]){const p=personById(ctx.state,id);if(p)disembark(ctx,p,vehicle);}
  for(const medic of crew(ctx.state,vehicle))if(medic.location.kind==='vehicle'&&medic.location.vehicleId===vehicle.id)disembark(ctx,medic,vehicle);
  return true;
}
function updateAmbulance(ctx,vehicle){
  const s=ctx.state,incident=s.incidents.find(i=>i.id===vehicle.incidentId),patient=incident&&personById(s,incident.personId);
  if(vehicle.broken){releaseHospitalStaff(ctx,vehicle);vehicle.status='blocked';if(incident)setWait(ctx,incident,'Ambulância avariada; doente e tripulação permanecem na sua localização.');return;}
  const compromised=crew(s,vehicle).find(p=>p.lifeState!=='alive'||p.healthState==='critical');
  if(compromised&&!['crewEmergencyStop','blocked'].includes(vehicle.status))vehicle.status='crewEmergencyStop';
  if(vehicle.status==='crewEmergencyStop'){
    releaseHospitalStaff(ctx,vehicle);
    if(!stopForThreat(ctx,vehicle,incident,patient))return;
    vehicle.status='blocked';vehicle.waitReason='Tripulação incapacitada; viatura parada e ocorrência reencaminhada.';
    if(incident){
      incident.assignedAmbulanceId=null;
      if(!['resolved','cancelled'].includes(incident.status)){
        incident.status=patient?.lifeState==='alive'&&patient.location.kind!=='hospital'?'waiting':'cancelled';
        setWait(ctx,incident,vehicle.waitReason);
      }
      vehicle.incidentId=null;
    }
    if(compromised){
      const observer=crew(s,vehicle).find(p=>p.id!==compromised.id&&canObserve(ctx,p,compromised));
      if(observer&&compromised.lifeState==='reanimated')ctx.report(compromised,'violence',5,'Agressão observada na tripulação',observer.id);
      else if(observer&&compromised.lifeState==='alive')ctx.report(compromised,'medical',5,'Colapso observado na tripulação',observer.id);
    }
    emit(ctx,'MedicalResourceUnavailable','A viatura parou num nó viário; pessoas desembarcaram e a central reavalia os meios.',vehicle,incident);return;
  }
  if(vehicle.status==='available'||vehicle.status==='blocked')return;
  if(!incident||!patient){vehicle.status='blocked';vehicle.waitReason='Referência de ocorrência indisponível.';return;}
  const danger=unsafe(ctx,patient,vehicle);
  if(danger&&['transporting','handover'].includes(vehicle.status)&&vehicle.passengerIds.includes(danger.id)){
    vehicle.status='emergencyStop';incident.status='awaitingPolice';vehicle.emergencyThreatId=danger.id;
  }
  if(vehicle.status==='emergencyStop'){
    if(stopForThreat(ctx,vehicle,incident,patient))suspendUnsafe(ctx,vehicle,incident,patient,personById(s,vehicle.emergencyThreatId));return;
  }
  if(vehicle.status==='dispatched'){
    if(s.tick>vehicle.phaseTick){vehicle.status='enRoute';incident.status='enRoute';emit(ctx,'AmbulanceEnRoute','Ambulância em percurso viário.',vehicle,incident);}return;
  }
  if(vehicle.status==='enRoute'){
    if(ctx.moveVehicle(vehicle,vehicle.speed)){
      vehicle.status='onScene';incident.status='onScene';vehicle.phaseTick=s.tick;vehicle.medicalPhase='approach';
      for(const medic of crew(s,vehicle)){
        disembark(ctx,medic,vehicle);medic.taskId=incident.id;medic.activity='approachingPatient';ctx.routePerson(medic,patientPoint(ctx,patient).id);
      }
      emit(ctx,'AmbulanceOnScene','Ambulância estacionou; os socorristas aproximam-se a pé.',vehicle,incident);
    }else if(vehicle.routeBlocked)setWait(ctx,incident,'Percurso interrompido; a ambulância não pode atravessar o obstáculo.');
    return;
  }
  if(vehicle.status==='awaitingPolice'){
    if(danger)return;
    if(patient.lifeState!=='alive'){
      incident.status='resolved';incident.resolution='Avaliação encerrada após neutralização ou óbito confirmado.';vehicle.status='collectingCrew';setWait(ctx,incident,null);return;
    }
    incident.requiresPolice=false;incident.status='onScene';vehicle.status='onScene';vehicle.medicalPhase='approach';
    for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'){if(medic.location.kind==='vehicle')disembark(ctx,medic,vehicle);ctx.routePerson(medic,patientPoint(ctx,patient).id);}
    setWait(ctx,incident,null);return;
  }
  if(vehicle.status==='onScene'){
    if(danger){suspendUnsafe(ctx,vehicle,incident,patient,danger);return;}
    if(patient.lifeState!=='alive'){
      incident.status='resolved';incident.resolution='Óbito observado pela equipa médica.';vehicle.status='collectingCrew';emit(ctx,'MedicalAssessmentClosed','A equipa confirmou que não existe doente vivo para transporte.',vehicle,incident);return;
    }
    if(vehicle.medicalPhase==='approach'){
      const medics=crew(s,vehicle).filter(p=>p.lifeState==='alive');let arrived=0;
      for(const medic of medics){if(ctx.movePerson(medic,1.25))arrived++;}
      if(!medics.length){vehicle.status='blocked';setWait(ctx,incident,'Tripulação médica incapacitada; apoio necessário.');return;}
      if(arrived===medics.length){
        vehicle.medicalPhase='assess';vehicle.phaseTick=s.tick;incident.status='assessed';
        const signs=(patient.symptoms||[]).slice();for(const sign of signs)if(!patient.observedSymptoms.includes(sign))patient.observedSymptoms.push(sign);
        for(const sign of signs)if(!incident.confirmedFacts.includes(sign))incident.confirmedFacts.push(sign);
        emit(ctx,'PatientAssessed','A equipa avaliou sinais observáveis; a causa permanece por esclarecer.',vehicle,incident,{confirmedFacts:signs});
      }return;
    }
    if(vehicle.medicalPhase==='assess'){
      if(s.tick-vehicle.phaseTick<seconds(s,'triageSeconds',5))return;
      const footId=`foot-${vehicle.nodeId}`;
      if(!ctx.routePerson(patient,footId)){setWait(ctx,incident,'Acesso pedonal de recolha interrompido.');return;}
      for(const medic of crew(s,vehicle))if(medic.lifeState==='alive')ctx.routePerson(medic,footId);
      vehicle.medicalPhase='loading';patient.activity='assistedToAmbulance';
      emit(ctx,'PatientMovingToAmbulance','Doente e tripulação percorrem fisicamente o acesso até à ambulância.',vehicle,incident);return;
    }
    if(vehicle.medicalPhase==='loading'){
      const patientArrived=ctx.movePerson(patient,patient.healthState==='critical'?.65:.9);
      let medicsArrived=true;
      for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'&&!ctx.movePerson(medic,1.1))medicsArrived=false;
      if(patientArrived&&medicsArrived){
        if(vehicle.passengerIds.length>=vehicle.capacity){setWait(ctx,incident,'Capacidade de transporte ocupada.');return;}
        board(patient,vehicle,true);patient.activity='inAmbulance';
        for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'){board(medic,vehicle);medic.activity='transporting';}
        const hospital=hospitalBuilding(s);
        if(!ctx.routeVehicle(vehicle,hospital.vehicleNodeId)){vehicle.status='blocked';setWait(ctx,incident,'Sem percurso viário para o hospital; doente permanece na ambulância.');return;}
        vehicle.status='transporting';incident.status='transporting';
        emit(ctx,'PatientBoarded','Doente embarcou uma única vez; a identidade mantém-se no veículo.',vehicle,incident,{personId:patient.id});
      }return;
    }
  }
  if(vehicle.status==='transporting'){
    if(ctx.moveVehicle(vehicle,vehicle.speed)){
      vehicle.status='handover';incident.status='handover';vehicle.medicalPhase='hospitalApproach';
      const hospital=hospitalBuilding(s);
      disembark(ctx,patient,vehicle);ctx.routePerson(patient,hospital.entranceNodeIds[0]);
      for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'){disembark(ctx,medic,vehicle);ctx.routePerson(medic,hospital.entranceNodeIds[0]);}
      emit(ctx,'HospitalArrival','Ambulância chegou; entrega exige acesso pedonal e vaga hospitalar.',vehicle,incident);
    }return;
  }
  if(vehicle.status==='handover'){
    if(danger){suspendUnsafe(ctx,vehicle,incident,patient,danger);return;}
    if(patient.lifeState!=='alive'){releaseHospitalStaff(ctx,vehicle);incident.status='resolved';vehicle.status='collectingCrew';return;}
    if(vehicle.medicalPhase==='hospitalApproach'){
      const arrived=ctx.movePerson(patient,patient.healthState==='critical'?.65:.9);let crewArrived=true;
      for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'&&!ctx.movePerson(medic,1.15))crewArrived=false;
      if(arrived&&crewArrived){vehicle.medicalPhase='waitingBed';vehicle.phaseTick=s.tick;}
      return;
    }
    if(s.facilities.hospital.patientIds.length>=s.facilities.hospital.capacity){
      releaseHospitalStaff(ctx,vehicle);vehicle.medicalPhase='waitingBed';
      setWait(ctx,incident,'Hospital lotado; doente e equipa aguardam uma vaga na entrada.');return;
    }
    let professional=personById(s,vehicle.hospitalStaffId);
    if(!fitHospitalStaff(ctx,professional)){
      releaseHospitalStaff(ctx,vehicle);
      professional=s.facilities.hospital.staffIds.map(id=>personById(s,id)).find(p=>fitHospitalStaff(ctx,p)&&!p.taskId);
      if(!professional){
        vehicle.medicalPhase='waitingBed';setWait(ctx,incident,'Sem profissional hospitalar apto e disponível; entrega em espera apesar da vaga.');return;
      }
      vehicle.hospitalStaffId=professional.id;professional.taskId=`handover:${vehicle.id}`;professional.activity='triaging';
      vehicle.medicalPhase='hospitalAssessment';vehicle.phaseTick=s.tick;
      emit(ctx,'HospitalAssessmentStarted','Um profissional hospitalar existente iniciou a entrega clínica.',vehicle,incident,{staffId:professional.id});
    }
    setWait(ctx,incident,null);
    if(s.tick-vehicle.phaseTick<seconds(s,'handoverSeconds',6))return;
    const hospital=hospitalBuilding(s);
    patient.location={kind:'hospital',buildingId:hospital.id};patient.path=[];patient.activity='hospitalized';patient.taskId='hospital-care';patient.medicalDischargeTick=s.tick+seconds(s,'hospitalStaySeconds',65);
    if(!s.facilities.hospital.patientIds.includes(patient.id))s.facilities.hospital.patientIds.push(patient.id);
    incident.status='resolved';incident.resolution='Doente entregue ao hospital.';incident.resolvedAt=s.tick;vehicle.status='collectingCrew';
    emit(ctx,'PatientAdmitted','Doente entregue; uma vaga hospitalar ficou ocupada.',vehicle,incident,{personId:patient.id,hospitalBuildingId:hospital.id,staffId:professional.id});
    releaseHospitalStaff(ctx,vehicle);return;
  }
  if(vehicle.status==='collectingCrew'){returnCrew(ctx,vehicle,incident);return;}
  if(vehicle.status==='returning'){
    if(ctx.moveVehicle(vehicle,vehicle.speed))release(ctx,vehicle,incident);
    else if(vehicle.routeBlocked){vehicle.status='blocked';setWait(ctx,incident,'Regresso bloqueado por uma via interrompida.');}
  }
}
function discharge(ctx){
  const s=ctx.state;
  for(const id of [...s.facilities.hospital.patientIds]){
    const person=personById(s,id);
    if(!person||person.lifeState!=='alive'||person.hasPathogen||s.tick<(person.medicalDischargeTick||1000000))continue;
    if(!ctx.leaveFacility(person))continue;
    person.medicalCondition=null;person.symptoms=[];person.healthState='healthy';person.activity='resting';person.nextRoutineTick=s.tick+50;person.taskId=null;
    ctx.emit('PatientDischarged','Uma pessoa recebeu alta e regressa às suas rotinas pelo acesso pedonal.',{entityIds:[person.id],position:ctx.position(person),visibility:'confirmed'});
  }
}
function updateMedical(ctx){
  for(const vehicle of ctx.state.vehicles)if(vehicle.type==='ambulance'&&vehicle.status!=='handover'&&vehicle.hospitalStaffId)releaseHospitalStaff(ctx,vehicle);
  discharge(ctx);assignMedical(ctx);
  for(const vehicle of ctx.state.vehicles)if(vehicle.type==='ambulance')updateAmbulance(ctx,vehicle);
}
module.exports={updateMedical};
