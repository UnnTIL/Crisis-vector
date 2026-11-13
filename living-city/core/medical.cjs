'use strict';
const {distance}=require('./helpers.cjs');
const {setWait}=require('./incidents.cjs');
const personById=(state,id)=>state.people.find(p=>p.id===id);
const seconds=(state,name,fallback)=>Math.max(1,Math.round((state.config.parameters[name]??fallback)*10));
const crew=(s,v)=>v.crewIds.map(id=>personById(s,id)).filter(Boolean);
const hospitalBuilding=s=>s.city.buildings.find(b=>b.id===s.facilities.hospital.buildingId);
const closed=incident=>['resolved','cancelled'].includes(incident.status);
function assignedCare(s,person){
  return s.incidents.find(incident=>incident.type==='medical'&&incident.personId===person.id&&!closed(incident)&&incident.assignedAmbulanceId);
}
function operationalCrew(s,vehicle,person){
  return person.lifeState==='alive'&&person.healthState!=='critical'&&person.location.kind!=='hospital'&&
    !(person.location.kind==='vehicle'&&person.location.vehicleId!==vehicle.id)&&
    !s.vehicles.some(other=>other.passengerIds.includes(person.id))&&!assignedCare(s,person)&&
    (!person.taskId||person.taskId===vehicle.incidentId);
}
function parkedAtNode(ctx,vehicle){
  const node=ctx.roadNode(vehicle.nodeId);return node&&!vehicle.path.length&&distance(vehicle,node)<1e-7;
}
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
  if(!node||!parkedAtNode(ctx,vehicle)||person.location.kind!=='vehicle'||person.location.vehicleId!==vehicle.id||
    !vehicle.crewIds.includes(person.id)&&!vehicle.passengerIds.includes(person.id))return false;
  vehicle.passengerIds=vehicle.passengerIds.filter(id=>id!==person.id);
  person.location={kind:'street',nodeId:node.id};person.nodeId=node.id;person.x=node.x;person.z=node.z;person.path=[];return true;
}
function canBoard(ctx,person,vehicle,isPassenger=false){
  const s=ctx.state;
  if(!parkedAtNode(ctx,vehicle)||person.location.kind!=='street'||distance(ctx.position(person),vehicle)>.25||
    s.vehicles.some(other=>other.passengerIds.includes(person.id)))return false;
  if(isPassenger){
    const care=assignedCare(s,person);
    return person.lifeState==='alive'&&!vehicle.crewIds.includes(person.id)&&care?.id===vehicle.incidentId&&care.assignedAmbulanceId===vehicle.id&&person.taskId===care.id;
  }
  return vehicle.crewIds.includes(person.id)&&operationalCrew(s,vehicle,person);
}
function board(ctx,person,vehicle,isPassenger=false){
  if(!canBoard(ctx,person,vehicle,isPassenger))return false;
  if(isPassenger&&!vehicle.passengerIds.includes(person.id))vehicle.passengerIds.push(person.id);
  person.location={kind:'vehicle',vehicleId:vehicle.id};person.x=vehicle.x;person.z=vehicle.z;person.nodeId=`foot-${vehicle.nodeId}`;person.path=[];
  return true;
}
function patientPoint(ctx,patient){
  if(patient.location.kind==='building'||patient.location.kind==='hospital'){
    const building=ctx.state.city.buildings.find(b=>b.id===patient.location.buildingId);return ctx.pedestrianNode(building.entranceNodeIds[0]);
  }
  return {...ctx.position(patient),nodeId:patient.nodeId,travelEdge:patient.travelEdge};
}
function approachPatient(ctx,medic,patient){
  const target=patientPoint(ctx,patient);
  if(patient.location.kind==='street'&&ctx.routePersonToPoint)return ctx.routePersonToPoint(medic,patient);
  return ctx.routePerson(medic,target.id||target.nodeId);
}
function besidePatient(ctx,medic,patient){
  const target=patientPoint(ctx,patient),point=ctx.position(medic);
  return distance(point,target)<=1.25&&ctx.lineOfSight(point,target);
}
function moveToMedicalNode(ctx,person,nodeId,speed){
  const node=ctx.pedestrianNode(nodeId);
  if(!node)return false;
  if(person.location.kind==='street'&&distance(ctx.position(person),node)<1e-7){
    person.nodeId=nodeId;person.location={kind:'street',nodeId};person.travelEdge=null;
    person.path=[];person.finalApproach=null;person.destinationPoint=null;person.destinationNodeId=nodeId;person.medicalRouteBlocked=false;return true;
  }
  const needsRoute=person.destinationNodeId!==nodeId||!person.path.length&&!person.finalApproach;
  if(needsRoute){
    if(person.medicalRouteTarget!==nodeId){person.medicalRouteTarget=nodeId;person.nextMedicalNodeAttemptTick=0;}
    if(ctx.state.tick<(person.nextMedicalNodeAttemptTick||0))return false;
    person.nextMedicalNodeAttemptTick=ctx.state.tick+10;
    if(!ctx.routePerson(person,nodeId)){person.medicalRouteBlocked=true;return false;}
  }
  person.medicalRouteBlocked=false;
  const reached=ctx.movePerson(person,speed);
  return reached&&person.location.kind==='street'&&distance(ctx.position(person),node)<1e-7;
}
function planHospitalRoute(ctx,vehicle,incident){
  vehicle.nextRouteAttemptTick=ctx.state.tick+10;
  if(!ctx.routeVehicle(vehicle,hospitalBuilding(ctx.state).vehicleNodeId)){
    vehicle.status='transportRouteWaiting';vehicle.currentSpeed=0;incident.status='transporting';
    vehicle.waitReason='Percurso viário para o hospital temporariamente indisponível; doente mantém-se a bordo e a central tenta nova rota.';
    setWait(ctx,incident,vehicle.waitReason);return false;
  }
  vehicle.status='transporting';incident.status='transporting';vehicle.waitReason=null;setWait(ctx,incident,null);return true;
}
function planReturnRoute(ctx,vehicle,incident){
  vehicle.nextRouteAttemptTick=ctx.state.tick+10;
  if(!ctx.routeVehicle(vehicle,vehicle.homeNodeId)){
    const reason='Regresso temporariamente impedido; a tripulação aguarda e tenta nova rota.';
    const first=vehicle.status!=='returnRouteWaiting'||vehicle.waitReason!==reason;
    vehicle.status='returnRouteWaiting';vehicle.currentSpeed=0;vehicle.waitReason=reason;
    if(incident&&!closed(incident))setWait(ctx,incident,reason);
    if(first)emit(ctx,'AmbulanceReturnWaiting',reason,vehicle,incident);return false;
  }
  vehicle.status='returning';vehicle.waitReason=null;
  if(incident&&!closed(incident))setWait(ctx,incident,null);
  emit(ctx,'AmbulanceReturning','A tripulação regressa à base por estrada.',vehicle,incident);return true;
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
    const available=s.vehicles.filter(v=>v.type==='ambulance'&&v.status==='available'&&!v.broken&&v.availableAt<=s.tick&&!v.crewIds.includes(patient.id)&&
      crew(s,v).every(p=>operationalCrew(s,v,p)&&!p.taskId&&p.location.kind==='vehicle'&&p.location.vehicleId===v.id));
    available.sort((a,b)=>distance(a,ctx.position(patient))-distance(b,ctx.position(patient))||a.id.localeCompare(b.id));
    let vehicle=null;
    for(const candidate of available){if(ctx.routeVehicle(candidate,destination)){vehicle=candidate;break;}}
    if(!vehicle){
      const reason=available.length?'Percurso viário interrompido; a central aguarda uma rota possível.':s.vehicles.some(v=>v.type==='ambulance'&&v.broken)?'Sem ambulância livre; existe uma viatura avariada.':s.vehicles.some(v=>v.type==='ambulance'&&v.status==='blocked')?'Sem tripulação operacional ou acesso seguro; ambulância indisponível.':'Todas as ambulâncias estão ocupadas; ocorrência em espera por prioridade.';
      setWait(ctx,incident,reason);continue;
    }
    vehicle.status='dispatched';vehicle.incidentId=incident.id;vehicle.destinationPersonId=patient.id;vehicle.speed=s.config.parameters.ambulanceSpeed;
    incident.status='assigned';incident.assignedAmbulanceId=vehicle.id;patient.taskId=incident.id;patient.activity='awaitingAmbulance';setWait(ctx,incident,null);
    vehicle.phaseTick=s.tick;
    emit(ctx,'AmbulanceDispatched','Uma ambulância com tripulação foi atribuída à ocorrência.',vehicle,incident,{crewIds:vehicle.crewIds.slice()});
  }
}
function returnCrew(ctx,vehicle,incident){
  const s=ctx.state,footId=`foot-${vehicle.nodeId}`;
  let aboard=true;
  for(const medic of crew(s,vehicle)){
    if(!operationalCrew(s,vehicle,medic)){vehicle.status='blocked';vehicle.waitReason='Tripulação indisponível ou sob assistência; a viatura não pode recuperar pessoas de outro serviço.';if(incident&&!closed(incident))setWait(ctx,incident,vehicle.waitReason);return;}
    if(medic.location.kind==='vehicle'&&medic.location.vehicleId===vehicle.id)continue;
    aboard=false;
    if(moveToMedicalNode(ctx,medic,footId,1.2)&&board(ctx,medic,vehicle)){medic.activity='available';medic.taskId=null;}
  }
  if(!aboard)return;
  planReturnRoute(ctx,vehicle,incident);
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
  const compromised=crew(s,vehicle).find(p=>!operationalCrew(s,vehicle,p));
  if(compromised&&!['crewEmergencyStop','blocked'].includes(vehicle.status))vehicle.status='crewEmergencyStop';
  if(vehicle.status==='crewEmergencyStop'){
    releaseHospitalStaff(ctx,vehicle);
    if(!stopForThreat(ctx,vehicle,incident,patient))return;
    vehicle.status='blocked';vehicle.waitReason='Tripulação incapacitada ou sob assistência; viatura parada e ocorrência reencaminhada.';
    if(incident){
      incident.assignedAmbulanceId=null;
      if(!closed(incident)){
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
  if(danger&&['transporting','transportRouteWaiting','handover'].includes(vehicle.status)&&vehicle.passengerIds.includes(danger.id)){
    vehicle.status='emergencyStop';incident.status='awaitingPolice';vehicle.emergencyThreatId=danger.id;
  }
  if(vehicle.status==='emergencyStop'){
    if(stopForThreat(ctx,vehicle,incident,patient))suspendUnsafe(ctx,vehicle,incident,patient,personById(s,vehicle.emergencyThreatId));return;
  }
  if(vehicle.status==='dispatched'){
    if(s.tick>vehicle.phaseTick){vehicle.status='enRoute';incident.status='enRoute';emit(ctx,'AmbulanceEnRoute','Ambulância em percurso viário.',vehicle,incident);}return;
  }
  if(vehicle.status==='transportRouteWaiting'){
    if(s.tick>=(vehicle.nextRouteAttemptTick||0))planHospitalRoute(ctx,vehicle,incident);return;
  }
  if(vehicle.status==='returnRouteWaiting'){
    if(s.tick>=(vehicle.nextRouteAttemptTick||0))planReturnRoute(ctx,vehicle,incident);return;
  }
  if(vehicle.status==='enRoute'){
    if(ctx.moveVehicle(vehicle,vehicle.speed)){
      vehicle.status='onScene';incident.status='onScene';vehicle.phaseTick=s.tick;vehicle.medicalPhase='approach';
      for(const medic of crew(s,vehicle)){
        disembark(ctx,medic,vehicle);medic.taskId=incident.id;medic.activity='approachingPatient';approachPatient(ctx,medic,patient);
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
    for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'){if(medic.location.kind==='vehicle')disembark(ctx,medic,vehicle);approachPatient(ctx,medic,patient);}
    setWait(ctx,incident,null);return;
  }
  if(vehicle.status==='onScene'){
    if(danger){suspendUnsafe(ctx,vehicle,incident,patient,danger);return;}
    if(patient.lifeState!=='alive'){
      incident.status='resolved';incident.resolution='Óbito observado pela equipa médica.';vehicle.status='collectingCrew';emit(ctx,'MedicalAssessmentClosed','A equipa confirmou que não existe doente vivo para transporte.',vehicle,incident);return;
    }
    if(vehicle.medicalPhase==='approach'){
      const medics=crew(s,vehicle).filter(p=>p.lifeState==='alive');let arrived=0;
      for(const medic of medics){
        if(!medic.path.length&&!medic.finalApproach&&!besidePatient(ctx,medic,patient)&&s.tick>=(medic.nextMedicalApproachTick||0)){
          const planned=approachPatient(ctx,medic,patient);medic.nextMedicalApproachTick=s.tick+10;
          if(!planned)setWait(ctx,incident,'Acesso pedonal de aproximação temporariamente impedido; a equipa tenta nova rota.');
          else setWait(ctx,incident,null);
        }
        const reached=ctx.movePerson(medic,1.25);
        if((reached||!medic.path.length&&!medic.finalApproach)&&besidePatient(ctx,medic,patient))arrived++;
      }
      if(!medics.length){vehicle.status='blocked';setWait(ctx,incident,'Tripulação médica incapacitada; apoio necessário.');return;}
      if(arrived===medics.length){
        setWait(ctx,incident,null);
        vehicle.medicalPhase='assess';vehicle.phaseTick=s.tick;incident.status='assessed';
        const signs=(patient.symptoms||[]).slice();for(const sign of signs)if(!patient.observedSymptoms.includes(sign))patient.observedSymptoms.push(sign);
        for(const sign of signs)if(!incident.confirmedFacts.includes(sign))incident.confirmedFacts.push(sign);
        emit(ctx,'PatientAssessed','A equipa avaliou sinais observáveis; a causa permanece por esclarecer.',vehicle,incident,{confirmedFacts:signs,
          patientPosition:patientPoint(ctx,patient),assessmentDistances:medics.map(medic=>({personId:medic.id,distance:distance(ctx.position(medic),patientPoint(ctx,patient))}))});
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
      const footId=`foot-${vehicle.nodeId}`;
      const patientArrived=moveToMedicalNode(ctx,patient,footId,patient.healthState==='critical'?.65:.9);
      let medicsArrived=true;
      for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'&&!moveToMedicalNode(ctx,medic,footId,1.1))medicsArrived=false;
      if(patient.medicalRouteBlocked||crew(s,vehicle).some(medic=>medic.medicalRouteBlocked))setWait(ctx,incident,'Acesso pedonal de embarque temporariamente impedido; a equipa tenta nova rota.');
      if(patientArrived&&medicsArrived){
        if(vehicle.passengerIds.length>=vehicle.capacity){setWait(ctx,incident,'Capacidade de transporte ocupada.');return;}
        const medics=crew(s,vehicle);
        if(!canBoard(ctx,patient,vehicle,true)||!medics.every(medic=>canBoard(ctx,medic,vehicle))){
          setWait(ctx,incident,'Embarque aguarda presença física e disponibilidade exclusiva do doente e da tripulação.');return;
        }
        board(ctx,patient,vehicle,true);patient.activity='inAmbulance';
        for(const medic of medics){board(ctx,medic,vehicle);medic.activity='transporting';}
        emit(ctx,'PatientBoarded','Doente embarcou uma única vez; a identidade mantém-se no veículo.',vehicle,incident,{personId:patient.id});
        planHospitalRoute(ctx,vehicle,incident);
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
    }else if(vehicle.routeBlocked){
      vehicle.status='transportRouteWaiting';vehicle.currentSpeed=0;vehicle.nextRouteAttemptTick=s.tick+10;
      vehicle.waitReason='Percurso para o hospital interrompido; doente permanece a bordo enquanto a rota é reavaliada.';
      setWait(ctx,incident,vehicle.waitReason);
    }return;
  }
  if(vehicle.status==='handover'){
    if(danger){suspendUnsafe(ctx,vehicle,incident,patient,danger);return;}
    if(patient.lifeState!=='alive'){releaseHospitalStaff(ctx,vehicle);incident.status='resolved';vehicle.status='collectingCrew';return;}
    if(vehicle.medicalPhase==='hospitalApproach'){
      const portal=hospitalBuilding(s).entranceNodeIds[0];
      const arrived=moveToMedicalNode(ctx,patient,portal,patient.healthState==='critical'?.65:.9);let crewArrived=true;
      for(const medic of crew(s,vehicle))if(medic.lifeState==='alive'&&!moveToMedicalNode(ctx,medic,portal,1.15))crewArrived=false;
      if(patient.medicalRouteBlocked||crew(s,vehicle).some(medic=>medic.medicalRouteBlocked))setWait(ctx,incident,'Acesso pedonal ao hospital temporariamente impedido; ninguém foi admitido e a equipa tenta nova rota.');
      if(arrived&&crewArrived){setWait(ctx,incident,null);vehicle.medicalPhase='waitingBed';vehicle.phaseTick=s.tick;}
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
    else if(vehicle.routeBlocked){vehicle.status='returnRouteWaiting';vehicle.currentSpeed=0;vehicle.nextRouteAttemptTick=s.tick+10;vehicle.waitReason='Regresso temporariamente interrompido; aguarda nova rota.';emit(ctx,'AmbulanceReturnWaiting',vehicle.waitReason,vehicle,incident);}
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
