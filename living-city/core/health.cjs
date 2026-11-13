'use strict';

// Fictional timings for this isolated fixture; none are clinical estimates.
const HEALTH_DEFAULTS = Object.freeze({
  symptomSeconds:20, criticalSeconds:140, deathSeconds:230,
  reanimateDelaySeconds:6, suddenSeconds:30, suddenReanimateDelaySeconds:2,
  exposureDistance:1.4, exposureSeconds:8, incubationSeconds:35,
  attackRange:1.2, attackDamagePerSecond:8, zombieSpeed:1.15, sensingDistance:16,
  infectiousWhileAlive:1
});
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const parameters = state => Object.fromEntries(Object.entries(HEALTH_DEFAULTS).map(([key, fallback]) => {
  const value = state.config?.parameters?.[key];
  return [key, Number.isFinite(value) && value >= 0 ? value : fallback];
}));
const ticks = (ctx, seconds) => Math.max(1, Math.ceil(seconds / ctx.dt));
const personIds = (...people) => people.filter(Boolean).map(p => p.id);

function event(ctx, type, message, person, fields = {}) {
  return ctx.emit(type, message, {entityIds:personIds(person), position:ctx.position(person), visibility:'truth', ...fields});
}

function initializeHealth(ctx) {
  const {state:s} = ctx, config = parameters(s);
  for (const person of s.people) {
    if (!Number.isFinite(person.hp)) person.hp = 100;
    person.symptoms ??= [];
    person.exposureSeconds ??= 0;
    person.exposureTicks ??= 0;
    person.exposedBy ??= [];
  }
  const patient = s.people.find(p => p.id === s.initialPersonId && p.role === 'resident');
  s.outbreak = {patientId:patient?.id ?? null, mode:s.scenario, started:false, parameters:config};
  if (!patient || s.scenario === 'S0') return;
  if (s.scenario === 'S1') {
    infect(ctx, patient, null, true);
    s.outbreak.started = true;
  }
}

function infect(ctx, person, source, initial = false) {
  if (person.lifeState !== 'alive' || person.hasPathogen) return false;
  const p = parameters(ctx.state), now = ctx.state.tick;
  const symptomDelay = initial ? p.symptomSeconds : p.incubationSeconds;
  const criticalDelay = Math.max(symptomDelay + ctx.dt, p.criticalSeconds);
  const deathDelay = Math.max(criticalDelay + ctx.dt, p.deathSeconds);
  person.hasPathogen = true;
  person.healthState = 'infected';
  person.infectedAt = now;
  person.symptomTick = now + ticks(ctx, symptomDelay);
  person.criticalTick = now + ticks(ctx, criticalDelay);
  person.scheduledDeathTick = now + ticks(ctx, deathDelay);
  event(ctx, 'PersonInfected', 'Uma pessoa existente foi infetada; a condição ainda não é conhecida pelos serviços.', person,
    {sourceId:source?.id ?? null, sourceLifeState:source?.lifeState ?? null, exposureSeconds:person.exposureSeconds, initial});
  return true;
}

function die(ctx, person, cause, attacker = null, reanimationDelay) {
  if (person.lifeState !== 'alive') return false;
  const p = parameters(ctx.state);
  person.lifeState = 'dead';
  person.healthState = 'deceased';
  person.hostile = false;
  person.hp = 0;
  person.deathTick = ctx.state.tick;
  person.activity = 'deceased';
  person.path = [];
  person.targetPersonId = null;
  person.willReanimate = ctx.state.scenario !== 'S0' && (person.hasPathogen || !!attacker || cause === 'sudden');
  if (person.willReanimate) person.reanimateTick = ctx.state.tick + ticks(ctx, reanimationDelay ?? p.reanimateDelaySeconds);
  event(ctx, 'HumanDied', 'Óbito humano registado; a identidade e a localização são preservadas.', person,
    {cause, attackerId:attacker?.id ?? null, reanimateTick:person.reanimateTick ?? null});
  return true;
}

function reanimate(ctx, person) {
  if (person.lifeState !== 'dead' || !person.willReanimate) return false;
  person.lifeState = 'reanimated';
  person.reanimatedAt = ctx.state.tick;
  person.hostile = true;
  person.hp = 55;
  person.mobility = 1;
  person.activity = 'searching';
  person.path = [];
  // This is truth, not a report or permission for police to fire.
  event(ctx, 'PersonReanimated', 'A mesma pessoa morta reanimou; não foi criada uma nova identidade.', person,
    {originalPersonId:person.id, deathTick:person.deathTick});
  return true;
}

function neutralizePerson(ctx, person, shooterId) {
  if (!person || person.lifeState !== 'reanimated' || !person.hostile) return false;
  person.lifeState = 'neutralized';
  person.hostile = false;
  person.hp = 0;
  person.neutralizedAt = ctx.state.tick;
  person.activity = 'neutralized';
  person.path = [];
  person.targetPersonId = null;
  event(ctx, 'ThreatNeutralized', 'A ameaça foi neutralizada; não se acrescenta um segundo óbito humano.', person,
    {shooterId, originalPersonId:person.id, deathTick:person.deathTick});
  return true;
}

function sameInterior(a, b) {
  const x = a.location, y = b.location;
  if (!x || !y || x.kind === 'street' || y.kind === 'street') return false;
  if (x.kind === 'vehicle' || y.kind === 'vehicle') return x.kind === y.kind && x.vehicleId === y.vehicleId;
  return x.buildingId && x.buildingId === y.buildingId;
}
function visibleContact(ctx, a, b, maximum) {
  const pa = ctx.position(a), pb = ctx.position(b);
  if (distance(pa, pb) > maximum) return false;
  if (sameInterior(a, b)) return true;
  if (a.location.kind !== 'street' || b.location.kind !== 'street') return false;
  return ctx.lineOfSight(pa, pb);
}

function progression(ctx) {
  const s = ctx.state, p = parameters(s);
  const initial = s.people.find(person => person.id === s.initialPersonId);
  if (s.scenario === 'S2' && initial && !s.outbreak.started && s.tick >= ticks(ctx, p.suddenSeconds)) {
    s.outbreak.started = true;
    if (initial.lifeState === 'alive') {
      initial.hasPathogen = true;
      die(ctx, initial, 'sudden', null, p.suddenReanimateDelaySeconds);
    }
  }
  for (const person of s.people) {
    if (person.lifeState === 'dead' && person.willReanimate && s.tick >= person.reanimateTick) reanimate(ctx, person);
    if (person.lifeState !== 'alive' || !person.hasPathogen) continue;
    if (s.tick >= person.scheduledDeathTick) {
      die(ctx, person, 'illness');
      continue;
    }
    if (s.tick >= person.criticalTick && person.healthState !== 'critical') {
      person.healthState = 'critical';
      person.symptoms = ['fever', 'collapse'];
      person.mobility = 0;
      person.path = [];
      person.activity = 'collapsed';
      event(ctx, 'CriticalCondition', 'A pessoa perdeu a capacidade de se deslocar e necessita de assistência.', person);
    } else if (s.tick >= person.symptomTick && person.healthState === 'infected') {
      person.healthState = 'symptomatic';
      person.symptoms = ['fever'];
      event(ctx, 'SymptomsDeveloped', 'Surgiram sintomas visíveis numa pessoa existente.', person);
    }
  }
}

function exposures(ctx, sources) {
  const s = ctx.state, p = parameters(s);
  for (const person of s.people) {
    if (person.lifeState !== 'alive' || person.hasPathogen) continue;
    const source = sources.find(other => visibleContact(ctx, person, other, p.exposureDistance));
    if (!source) continue;
    person.exposureTicks++;
    person.exposureSeconds = person.exposureTicks * ctx.dt;
    if (!person.exposedBy.includes(source.id)) person.exposedBy.push(source.id);
    if (person.exposureTicks === 1) {
      if (person.healthState === 'healthy') person.healthState = 'exposed';
      person.exposedAt = s.tick;
      event(ctx, 'PersonExposed', 'Iniciou-se uma exposição física por proximidade; um contacto não é infeção instantânea.', person,
        {sourceId:source.id, sourceLifeState:source.lifeState, distance:distance(ctx.position(person), ctx.position(source))});
    }
    if (person.exposureTicks >= ticks(ctx, p.exposureSeconds)) infect(ctx, person, source);
  }
}

function aggression(ctx, reanimated) {
  const s = ctx.state, p = parameters(s);
  for (const threat of reanimated) {
    if (threat.lifeState !== 'reanimated') continue;
    if (['building','hospital'].includes(threat.location.kind) && s.tick >= threat.reanimatedAt + ticks(ctx, 1) && ctx.leaveFacility) {
      ctx.leaveFacility(threat);
      event(ctx, 'PersonLeftFacility', 'A pessoa reanimada saiu pela entrada física do edifício; a ocupação foi reconciliada.', threat);
    }
    const targets = s.people.filter(person => person.lifeState === 'alive' && visibleContact(ctx, threat, person, p.sensingDistance));
    targets.sort((a, b) => distance(ctx.position(threat), ctx.position(a)) - distance(ctx.position(threat), ctx.position(b)) || a.id.localeCompare(b.id));
    const target = targets[0];
    if (!target) {
      threat.targetPersonId = null;
      threat.activity = 'searching';
      continue;
    }
    const current = ctx.position(threat), targetPosition = ctx.position(target);
    threat.targetPersonId = target.id;
    if (distance(current, targetPosition) > p.attackRange && threat.location.kind === 'street') {
      if (s.tick >= (threat.nextChaseTick ?? 0) || !threat.path.length) {
        ctx.routePerson(threat, ctx.nearestPedNode(targetPosition));
        threat.nextChaseTick = s.tick + ticks(ctx, 1);
      }
      threat.activity = 'chasing';
      ctx.movePerson(threat, p.zombieSpeed);
    }
    if (visibleContact(ctx, threat, target, p.attackRange)) {
      threat.activity = 'attacking';
      if (s.tick >= (threat.nextAttackTick ?? 0)) {
        const damage = p.attackDamagePerSecond;
        target.hp = Math.max(0, target.hp - damage);
        target.fear = Math.min(1, (target.fear ?? 0) + .1);
        event(ctx, 'PersonAttacked', 'Uma agressão física ocorreu entre duas identidades existentes.', threat,
          {entityIds:[threat.id, target.id], attackerId:threat.id, victimId:target.id, damage, targetPosition:ctx.position(target)});
        threat.nextAttackTick = s.tick + ticks(ctx, 1);
      }
      if (target.hp <= 0) die(ctx, target, 'attack', threat);
    }
  }
}

function updateHealth(ctx) {
  progression(ctx);
  const reanimated = ctx.state.people.filter(person => person.lifeState === 'reanimated' && person.hostile);
  const p = parameters(ctx.state);
  const infectious = p.infectiousWhileAlive > 0 ? ctx.state.people.filter(person => person.lifeState === 'alive' &&
    person.hasPathogen && ['symptomatic','critical'].includes(person.healthState)) : [];
  exposures(ctx, [...reanimated, ...infectious]);
  aggression(ctx, reanimated);
}

module.exports = {HEALTH_DEFAULTS, initializeHealth, updateHealth, neutralizePerson};
