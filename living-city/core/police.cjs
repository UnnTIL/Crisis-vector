'use strict';

const {neutralizePerson} = require('./health.cjs');
const POLICE_DEFAULTS = Object.freeze({
  policeObserveRange:18, policeFireRange:12, policeApproachSpeed:1.75,
  policeRetreatSpeed:2.1, policeVehicleSpeed:5.5, policeShotIntervalSeconds:1,
  policeShotDamage:28, policeHitChance:.82, policeCivilianClearance:.7, policeBusySeconds:120
});
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const params = s => Object.fromEntries(Object.entries(POLICE_DEFAULTS).map(([key, fallback]) => {
  const value = s.config?.parameters?.[key];
  return [key, Number.isFinite(value) && value >= 0 ? value : fallback];
}));
const after = (ctx, seconds) => ctx.state.tick + Math.max(1, Math.ceil(seconds / ctx.dt));
const byId = (items, id) => items.find(item => item.id === id);
const active = person => person && person.lifeState === 'alive';
const fitForDuty = person => active(person) && person.healthState !== 'critical' && person.hp >= 25;
const officers = (s, patrol) => patrol.officerIds.map(id => byId(s.people, id)).filter(Boolean);
const available = (s, patrol) => ['available','patrolling'].includes(patrol.status) &&
  !byId(s.vehicles, patrol.vehicleId)?.broken && officers(s, patrol).some(p => fitForDuty(p) && p.ammo > 0);

function initializePolice(ctx) {
  const s = ctx.state, p = params(s);
  const circuit = s.city.vehicleGraph.nodes.map(n => n.id);
  for (const patrol of s.patrols) {
    patrol.circuitNodeIds = circuit.slice();
    patrol.routeIndex = (patrol.routeIndex ?? 0) * 3;
    patrol.status = 'patrolling';
    const vehicle = byId(s.vehicles, patrol.vehicleId);
    vehicle.status = 'patrolling';
    for (const officer of officers(s, patrol)) {
      officer.activity = 'patrolling';
      officer.knownThreats ??= [];
      officer.lastObservedThreats ??= {};
      officer.confirmedNeutralizedIds ??= [];
      officer.ammo ??= 32;
      officer.cooldownTick ??= 0;
      officer.shotsFired = 0;
    }
    if (s.config.fixture === 'policeBusy') {
      patrol.status = 'busy';
      patrol.busyUntil = after(ctx, p.policeBusySeconds);
      vehicle.status = 'busy';
    }
  }
}

function observesHostile(ctx, officer, target, p) {
  if (!fitForDuty(officer) || !target.hostile || target.lifeState !== 'reanimated') return false;
  if (target.location.kind !== 'street') return false;
  const from = ctx.position(officer), to = ctx.position(target);
  return distance(from, to) <= p.policeObserveRange && ctx.lineOfSight(from, to);
}

function observe(ctx, officer, p) {
  for (const target of ctx.state.people) {
    if (!observesHostile(ctx, officer, target, p)) continue;
    officer.lastObservedThreats[target.id] = {...ctx.position(target), tick:ctx.state.tick};
    if (!officer.knownThreats.includes(target.id)) {
      officer.knownThreats.push(target.id);
      ctx.emit('ThreatIdentified', 'Um agente confirmou uma ameaça hostil por observação física.', {
        entityIds:[officer.id, target.id], observerId:officer.id, targetId:target.id,
        position:ctx.position(target), visibility:'confirmed'
      });
      const incident = ctx.report(target, 'violence', 5, 'agressão hostil observada', officer.id);
      if (incident) {
        incident.confirmedFacts ??= [];
        if (!incident.confirmedFacts.includes('hostile-confirmed')) incident.confirmedFacts.push('hostile-confirmed');
      }
    }
  }
}

function thirdPartyInLine(ctx, officer, target, clearance) {
  const origin = ctx.position(officer), aim = ctx.position(target);
  const dx = aim.x - origin.x, dz = aim.z - origin.z, squared = dx * dx + dz * dz;
  for (const person of ctx.state.people) {
    if (!active(person) || person.id === officer.id || person.id === target.id) continue;
    // Interior occupants are not third parties on a different outdoor line.
    if (!['street','vehicle'].includes(person.location.kind)) continue;
    const point = ctx.position(person);
    if (squared < 1e-9) {
      if (distance(point, aim) < clearance) return person;
      continue;
    }
    const fraction = ((point.x - origin.x) * dx + (point.z - origin.z) * dz) / squared;
    if (fraction <= .035 || fraction > 1.05) continue;
    const projection = {x:origin.x + Math.min(1, fraction) * dx, z:origin.z + Math.min(1, fraction) * dz};
    if (distance(point, projection) < clearance) return person;
  }
  return null;
}

function authorizedTarget(ctx, officer, p) {
  if (!fitForDuty(officer) || officer.location.kind !== 'street' || officer.ammo <= 0) return null;
  const targets = ctx.state.people.filter(target =>
    officer.knownThreats.includes(target.id) && observesHostile(ctx, officer, target, p) &&
    distance(ctx.position(officer), ctx.position(target)) <= p.policeFireRange
  );
  targets.sort((a, b) => distance(ctx.position(officer), ctx.position(a)) - distance(ctx.position(officer), ctx.position(b)) || a.id.localeCompare(b.id));
  for (const target of targets) {
    const bystander = thirdPartyInLine(ctx, officer, target, p.policeCivilianClearance);
    if (!bystander) return target;
    officer.fireHoldReason = 'Terceiro na linha de tiro: ' + bystander.id;
  }
  return null;
}

function fire(ctx, officer, p) {
  if (ctx.state.tick < officer.cooldownTick) return;
  const target = authorizedTarget(ctx, officer, p);
  if (!target) return;
  officer.fireHoldReason = null;
  const moving = officer.path.length > 0;
  const hit = ctx.random() < Math.min(1, p.policeHitChance);
  officer.ammo--;
  officer.shotsFired++;
  officer.cooldownTick = after(ctx, p.policeShotIntervalSeconds);
  const damage = hit ? Math.min(target.hp, p.policeShotDamage) : 0;
  if (hit) target.hp = Math.max(0, target.hp - damage);
  officer.activity = 'engaging';
  ctx.emit('ShotFired', 'Um agente disparou após identificação, alcance, linha de visão e segurança de terceiros.', {
    entityIds:[officer.id, target.id], shooterId:officer.id, weaponClass:'service-sidearm',
    position:ctx.position(officer), targetId:target.id, targetPosition:ctx.position(target),
    ammoSpent:1, hitOutcome:hit ? 'hit' : 'miss', damageApplied:damage,
    moving, authorizedBy:'direct-observation', visibility:'confirmed'
  });
  if (hit && target.hp <= 0 && neutralizePerson(ctx, target, officer.id)) officer.confirmedNeutralizedIds.push(target.id);
}

function requestBackup(ctx, patrol, reason) {
  const s = ctx.state, incident = byId(s.incidents, patrol.incidentId);
  if (incident) {
    incident.requiresPolice = true;
    incident.policeStatus = 'waitingBackup';
    incident.assignedPatrolId = null;
    incident.waitReason = reason;
    if (incident.type === 'violence') incident.status = 'waiting';
  }
  if (!patrol.backupRequested) {
    ctx.emit('BackupRequested', 'A patrulha pede reforço e retira por falta de capacidade operacional.', {
      entityIds:[patrol.id, ...(incident ? [incident.id] : [])], patrolId:patrol.id,
      incidentId:incident?.id ?? null, reason, visibility:'reported'
    });
    patrol.backupRequested = true;
  }
  patrol.incidentId = null;
  patrol.status = 'returning';
  const vehicle = byId(s.vehicles, patrol.vehicleId);
  vehicle.incidentId = null;
  vehicle.status = 'waitingCrew';
  for (const officer of officers(s, patrol)) {
    if (!active(officer) || officer.location.kind === 'vehicle') continue;
    officer.activity = 'retreating';
    officer.taskId = null;
    ctx.routePerson(officer, 'foot-' + vehicle.nodeId);
  }
}

function dispatch(ctx, p) {
  const s = ctx.state;
  const waiting = s.incidents.filter(i => !i.assignedPatrolId && !['observed','calling','received','resolved','cancelled'].includes(i.status) && (i.type === 'violence' || i.requiresPolice));
  waiting.sort((a, b) => b.priority - a.priority || b.severity - a.severity || a.reportedAt - b.reportedAt || a.id.localeCompare(b.id));
  for (const incident of waiting) {
    const ready = s.patrols.filter(patrol => available(s, patrol));
    ready.sort((a, b) => distance(ctx.position(byId(s.vehicles, a.vehicleId)), incident) - distance(ctx.position(byId(s.vehicles, b.vehicleId)), incident) || a.id.localeCompare(b.id));
    let selected = null;
    for (const patrol of ready) {
      const vehicle = byId(s.vehicles, patrol.vehicleId);
      if (ctx.routeVehicle(vehicle, ctx.nearestRoadNode(incident))) { selected = patrol; break; }
    }
    if (!selected) {
      incident.policeStatus = 'waiting';
      incident.waitReason = ready.length ? 'Percurso policial interrompido.' : 'Sem patrulha disponível; aguarda reforço.';
      continue;
    }
    const vehicle = byId(s.vehicles, selected.vehicleId);
    selected.status = 'responding';
    selected.incidentId = incident.id;
    selected.backupRequested = false;
    vehicle.status = 'responding';
    vehicle.incidentId = incident.id;
    incident.assignedPatrolId = selected.id;
    incident.policeStatus = 'enRoute';
    incident.waitReason = null;
    if (incident.type === 'violence') incident.status = 'assigned';
    for (const officer of officers(s, selected)) if (active(officer)) { officer.activity = 'responding'; officer.taskId = incident.id; }
    ctx.emit('PatrolDispatched', 'A central enviou uma patrulha existente para uma ocorrência conhecida.', {
      entityIds:[selected.id, vehicle.id, incident.id], patrolId:selected.id, vehicleId:vehicle.id,
      incidentId:incident.id, position:ctx.position(vehicle), visibility:'reported'
    });
  }
}

function debark(ctx, patrol, vehicle, incident) {
  const nodeId = 'foot-' + vehicle.nodeId;
  for (const officer of officers(ctx.state, patrol)) {
    if (!active(officer) || officer.location.kind !== 'vehicle') continue;
    officer.location = {kind:'street', nodeId};
    officer.nodeId = nodeId;
    officer.x = vehicle.x; officer.z = vehicle.z;
    officer.path = [];
    officer.activity = 'approaching';
    if (incident) ctx.routePerson(officer, ctx.nearestPedNode(incident));
    ctx.emit('OfficerDisembarked', 'Um agente saiu da viatura e iniciou aproximação a pé.', {
      entityIds:[officer.id, vehicle.id], officerId:officer.id, vehicleId:vehicle.id,
      position:ctx.position(officer), visibility:'confirmed'
    });
  }
}

function resolve(ctx, patrol, incident) {
  const s = ctx.state, vehicle = byId(s.vehicles, patrol.vehicleId);
  incident.policeStatus = 'resolved';
  incident.requiresPolice = false;
  incident.assignedPatrolId = null;
  if (incident.type === 'violence') { incident.status = 'resolved'; incident.resolvedAt = s.tick; }
  ctx.emit('PoliceSceneSecured', 'A patrulha terminou a avaliação e libertou a ocorrência para os serviços.', {
    entityIds:[patrol.id, incident.id], patrolId:patrol.id, incidentId:incident.id,
    position:{x:incident.x, z:incident.z}, visibility:'confirmed'
  });
  patrol.status = 'returning'; patrol.incidentId = null;
  vehicle.status = 'waitingCrew'; vehicle.incidentId = null;
  for (const officer of officers(s, patrol)) if (active(officer) && officer.location.kind === 'street') {
    officer.activity = 'returning'; officer.taskId = null;
    ctx.routePerson(officer, 'foot-' + vehicle.nodeId);
  }
}

function returnToVehicle(ctx, patrol, vehicle, p) {
  let allAboard = true;
  for (const officer of officers(ctx.state, patrol)) {
    if (!active(officer)) continue;
    if (officer.location.kind === 'vehicle') continue;
    allAboard = false;
    ctx.movePerson(officer, officer.activity === 'retreating' ? p.policeRetreatSpeed : p.policeApproachSpeed);
    if (distance(ctx.position(officer), vehicle) < .25 && !officer.path.length) {
      officer.location = {kind:'vehicle', vehicleId:vehicle.id};
      officer.activity = 'patrolling';
      officer.taskId = null;
      ctx.emit('OfficerBoarded', 'Um agente regressou fisicamente à sua viatura.', {
        entityIds:[officer.id, vehicle.id], officerId:officer.id, vehicleId:vehicle.id, position:ctx.position(vehicle), visibility:'confirmed'
      });
    }
  }
  if (!allAboard) return;
  if (!officers(ctx.state, patrol).some(officer => active(officer) && officer.ammo > 0 && officer.hp >= 25)) {
    patrol.status = 'unavailable'; vehicle.status = 'unavailable';
    patrol.waitReason = 'Efetivos, saúde ou munições insuficientes; sem reposição automática.';
  } else { patrol.status = 'patrolling'; vehicle.status = 'patrolling'; }
}

function patrolCircuit(ctx, patrol, vehicle, p) {
  if (!vehicle.path.length) {
    const circuit = patrol.circuitNodeIds;
    patrol.routeIndex = (patrol.routeIndex + 1) % circuit.length;
    const target = circuit[patrol.routeIndex];
    if (!ctx.routeVehicle(vehicle, target)) { patrol.waitReason = 'Percurso de patrulha interrompido.'; return; }
  }
  ctx.moveVehicle(vehicle, p.policeVehicleSpeed * .65);
}

function crewEmergency(ctx, patrol, vehicle, p) {
  const s = ctx.state, crew = officers(s, patrol);
  const emergency = crew.filter(officer => officer.lifeState !== 'alive' || officer.healthState === 'critical');
  if (!emergency.length && patrol.status !== 'medicalEmergency') return false;
  if (emergency.length && !patrol.emergencyReported) {
    patrol.emergencyReported = true;
    ctx.emit('PoliceCrewEmergency', 'Uma emergência real na tripulação obriga a parar no próximo nó viário.', {
      entityIds:[patrol.id, vehicle.id, ...emergency.map(officer => officer.id)],
      vehicleId:vehicle.id, visibility:'truth', position:ctx.position(vehicle)
    });
    if (patrol.incidentId) requestBackup(ctx, patrol, 'Emergência médica na própria patrulha.');
    patrol.status = 'medicalEmergency';
  }
  if (emergency.length && vehicle.path.length) {
    // Retain the current edge and stop at its next real endpoint, never jump
    // from a moving vehicle onto a convenient pavement node.
    vehicle.path = vehicle.path.slice(0, 1);
    vehicle.destinationNodeId = vehicle.path[0];
    ctx.moveVehicle(vehicle, p.policeVehicleSpeed);
    if (vehicle.path.length) return true;
  }
  vehicle.status = 'awaitingMedical';
  patrol.status = 'medicalEmergency';
  vehicle.waitReason = patrol.waitReason = 'Tripulação em emergência; aguarda assistência e reavaliação sem substituições automáticas.';
  for (const officer of crew) {
    if (officer.location.kind !== 'vehicle' || officer.location.vehicleId !== vehicle.id) continue;
    const nodeId = 'foot-' + vehicle.nodeId;
    officer.location = {kind:'street', nodeId};
    officer.nodeId = nodeId;
    officer.x = vehicle.x; officer.z = vehicle.z; officer.path = [];
    officer.activity = officer.lifeState === 'reanimated' ? 'searching' : officer.healthState === 'critical' ? 'collapsed' : 'protecting';
    ctx.emit('PoliceEmergencyDisembark', 'Uma identidade saiu da viatura parada sem alterar o censo.', {
      entityIds:[officer.id, vehicle.id], officerId:officer.id, vehicleId:vehicle.id,
      position:ctx.position(officer), visibility:'truth'
    });
    if (active(officer) && officer.healthState === 'critical') {
      const witness = crew.find(other => other.id !== officer.id && fitForDuty(other));
      if (witness) ctx.report(officer, 'medical', 5, 'agente inconsciente observado', witness.id);
    }
  }
  for (const officer of crew) if (fitForDuty(officer) && officer.location.kind === 'street') {
    observe(ctx, officer, p); fire(ctx, officer, p);
  }
  return true;
}

function updatePatrol(ctx, patrol, p) {
  const s = ctx.state, vehicle = byId(s.vehicles, patrol.vehicleId), crew = officers(s, patrol);
  if (crewEmergency(ctx, patrol, vehicle, p)) return;
  if (patrol.status === 'busy') {
    if (s.tick < patrol.busyUntil) return;
    patrol.status = 'patrolling'; vehicle.status = 'patrolling';
  }
  for (const officer of crew) if (fitForDuty(officer)) {
    observe(ctx, officer, p);
    // An officer already on foot may react while returning or following
    // another route; central assignment is not an authorization prerequisite.
    fire(ctx, officer, p);
  }
  if (vehicle.broken) {
    if (patrol.incidentId) requestBackup(ctx, patrol, 'Viatura policial avariada.');
    vehicle.status = 'broken'; patrol.status = 'unavailable';
    return;
  }
  if (patrol.status === 'returning') { returnToVehicle(ctx, patrol, vehicle, p); return; }
  if (['available','patrolling'].includes(patrol.status)) { patrolCircuit(ctx, patrol, vehicle, p); return; }
  if (patrol.status === 'unavailable') return;
  const incident = byId(s.incidents, patrol.incidentId);
  if (!incident) { patrol.status = 'returning'; return; }
  if (!crew.some(officer => fitForDuty(officer) && officer.ammo > 0)) {
    requestBackup(ctx, patrol, 'Munições ou integridade dos agentes insuficientes.');
    return;
  }
  if (patrol.status === 'responding') {
    if (ctx.moveVehicle(vehicle, p.policeVehicleSpeed)) {
      vehicle.status = 'onScene'; patrol.status = 'approaching';
      incident.policeStatus = 'onScene';
      if (incident.type === 'violence') incident.status = 'onScene';
      patrol.sceneTick = s.tick;
      debark(ctx, patrol, vehicle, incident);
      ctx.emit('PatrolOnScene', 'A viatura chegou e a equipa aproxima-se a pé para avaliar a ocorrência.', {
        entityIds:[patrol.id, incident.id], patrolId:patrol.id, incidentId:incident.id,
        position:ctx.position(vehicle), visibility:'confirmed'
      });
    } else if (vehicle.routeBlocked) requestBackup(ctx, patrol, 'Percurso policial bloqueado.');
    return;
  }
  for (const officer of crew) {
    if (!active(officer) || officer.location.kind !== 'street' || officer.healthState === 'critical') continue;
    if (officer.ammo <= 0 || officer.hp < 25) {
      officer.activity = 'retreating';
      if (officer.destinationNodeId !== 'foot-' + vehicle.nodeId) ctx.routePerson(officer, 'foot-' + vehicle.nodeId);
      ctx.movePerson(officer, p.policeRetreatSpeed);
      continue;
    }
    const knownPosition = officer.lastObservedThreats[incident.personId] ?? incident;
    if (s.tick >= (officer.nextApproachTick ?? 0) && distance(ctx.position(officer), knownPosition) > 2) {
      ctx.routePerson(officer, ctx.nearestPedNode(knownPosition));
      officer.nextApproachTick = after(ctx, 2);
    }
    officer.activity = officer.path.length ? 'approaching' : 'assessing';
    ctx.movePerson(officer, p.policeApproachSpeed);
    observe(ctx, officer, p);
    // Deliberately runs during approach; a pending route is not a fire veto.
    fire(ctx, officer, p);
  }
  const nearbyThreat = s.people.some(person => crew.some(officer =>
    officer.knownThreats.includes(person.id) && observesHostile(ctx, officer, person, p)
  ));
  const lastSeen = Math.max(...crew.map(officer => officer.lastObservedThreats[incident.personId]?.tick ?? -Infinity));
  const confirmedNeutralized = crew.some(officer => officer.confirmedNeutralizedIds.includes(incident.personId));
  const searchComplete = confirmedNeutralized || !Number.isFinite(lastSeen) || s.tick - lastSeen >= Math.ceil(20 / ctx.dt);
  if (!nearbyThreat && searchComplete && s.tick >= (patrol.sceneTick ?? s.tick) + 50) resolve(ctx, patrol, incident);
}

function updatePolice(ctx) {
  const p = params(ctx.state);
  dispatch(ctx, p);
  for (const patrol of ctx.state.patrols) updatePatrol(ctx, patrol, p);
}

module.exports = {POLICE_DEFAULTS, initializePolice, updatePolice};
