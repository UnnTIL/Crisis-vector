'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {UrbanOperation, createScenario, TICK_SECONDS} = require('../urban-spike/simulation.js');

const create = (seed = 16927) => new UrbanOperation({seed});
const command = (commandId, teamId = 'team-alpha', type = 'move', x = 29.5, z = 8.5) => ({commandId, teamId, type, x, z});
const fullState = op => structuredClone({state:op.state, commands:[...op._commands]});
const walkable = (map, p) => map.walkable[Math.floor(p.z) * map.width + Math.floor(p.x)] === true;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
function rejectUnchanged(op, input) {
  const before = fullState(op);
  assert.equal(op.command(input).ok, false);
  assert.deepEqual(fullState(op), before, 'rejection cannot spend stock, advance RNG, alter routes or append events');
}
function goodOrders(op) {
  assert.equal(op.command(command('protect-north', 'team-alpha', 'perimeter', 29.5, 8.5)).ok, true);
  assert.equal(op.command(command('protect-south', 'team-bravo', 'perimeter', 29.5, 30.5)).ok, true);
}
function conserved(s) {
  const p = s.population;
  assert.equal(p.initial, p.living + p.dead);
  assert.equal(p.dead, p.activeZombies + p.neutralized, 'neutralization must not count another human death');
  assert.equal(p.living, s.civilians.reduce((sum, c) => sum + c.count + c.evacuated, 0));
  assert.equal(p.evacuated, s.civilians.reduce((sum, c) => sum + c.evacuated, 0));
  for (const c of s.civilians) {
    assert.equal(c.initialCount, c.count + c.evacuated + c.dead, c.id);
    for (const n of [c.count, c.evacuated, c.dead]) assert.ok(Number.isSafeInteger(n) && n >= 0);
  }
  for (const n of Object.values(p)) assert.ok(Number.isSafeInteger(n) && n >= 0);
  const r = s.resources, pending = s.teams.filter(t => t.pendingBarrier).length;
  assert.equal(r.barriers + r.barriersUsed, 4, 'materials have a finite initial source');
  assert.equal(r.barriersUsed, s.barriers.length + pending + r.barriersLost, 'cancelled reservations cannot return free material');
  assert.ok(r.barriers >= 0 && r.barriersLost >= 0 && r.exitIntegrity >= 0);
}

test('urban commands reject malformed payloads and own-key violations atomically', () => {
  const op = create();
  for (const input of [null, undefined, NaN, Infinity, true, 'move', [], {},
    {...command('a'), commandId:''}, {...command('a'), commandId:1}, {...command('a'), commandId:'a b'},
    {...command('a'), commandId:'a'.repeat(81)}, {...command('a'), extra:'field'},
    Object.create(command('inherited')),
    JSON.parse('{"commandId":"proto","teamId":"team-alpha","type":"move","x":29.5,"z":8.5,"__proto__":{}}')]) rejectUnchanged(op, input);
  for (const value of ['toString', '__proto__', 'constructor', 'unknown', '', null, NaN, Infinity, {}, ['team-alpha']]) {
    rejectUnchanged(op, {...command('type'), type:value});
    rejectUnchanged(op, {...command('team'), teamId:value});
  }
  const inheritedCoordinates = Object.create({x:29.5, z:8.5});
  Object.assign(inheritedCoordinates, {commandId:'coordinates', teamId:'team-alpha', type:'move'});
  rejectUnchanged(op, inheritedCoordinates);
});

test('urban coordinates require finite numbers, map bounds and traversable terrain', () => {
  const op = create();
  for (const value of [NaN, Infinity, -Infinity, null, undefined, '8.5', true, false, [], {}]) {
    rejectUnchanged(op, {...command('x'), x:value});
    rejectUnchanged(op, {...command('z'), z:value});
  }
  for (const x of [-1, 40, 100]) rejectUnchanged(op, command('bounds-x', 'team-alpha', 'move', x, 8.5));
  for (const z of [-1, 40, 100]) rejectUnchanged(op, command('bounds-z', 'team-alpha', 'move', 4.5, z));
  assert.equal(walkable(op.state.map, {x:12.5, z:12.5}), false, 'fixture includes a solid building block');
  rejectUnchanged(op, command('building', 'team-alpha', 'move', 12.5, 12.5));
  rejectUnchanged(op, {commandId:'missing-z', teamId:'team-alpha', type:'retreat', x:4.5});
});

test('accepted command retries are idempotent and conflicting IDs cannot spend twice', () => {
  const op = create(), input = command('once', 'team-alpha', 'perimeter');
  assert.equal(op.command(input).ok, true);
  const before = fullState(op);
  const retry = op.command({z:8.5, type:'perimeter', x:29.5, teamId:'team-alpha', commandId:'once'});
  assert.equal(retry.ok, true);
  assert.equal(retry.duplicate, true);
  assert.deepEqual(fullState(op), before);
  rejectUnchanged(op, {...input, z:30.5});
  rejectUnchanged(op, {...input, type:'defend'});
  assert.equal(op.state.resources.barriers, 3);
  assert.equal(op.state.acceptedCommands.length, 1);
  conserved(op.state);
});

test('invalid tick counts do not change mission state or RNG', () => {
  const op = create();
  for (const ticks of [0, -1, .5, '10', NaN, Infinity, -Infinity, null, {}, 10001, Number.MAX_SAFE_INTEGER]) {
    const before = fullState(op);
    assert.equal(op.step(ticks).ok, false);
    assert.deepEqual(fullState(op), before);
  }
  op.step();
  assert.equal(op.state.tick, 1);
  assert.equal(op.state.timeSeconds, TICK_SECONDS);
});

test('both teams follow physical road paths around buildings and retreat independently', () => {
  const op = create(), [alpha, bravo] = op.state.teams;
  const startA = {x:alpha.x, z:alpha.z}, startB = {x:bravo.x, z:bravo.z};
  assert.equal(op.command(command('north', 'team-alpha', 'move', 29.5, 8.5)).ok, true);
  assert.equal(op.command(command('south', 'team-bravo', 'move', 29.5, 30.5)).ok, true);
  const directDistance = distance(startA, {x:29.5, z:8.5});
  assert.ok(alpha.path.length > directDistance, 'road routing must detour around the building, not cut a straight line');
  for (const team of op.state.teams) for (const point of team.path) assert.ok(walkable(op.state.map, point));
  let travelled = 0, previous = startA;
  for (let tick = 0; tick < 200; tick++) {
    op.step();
    for (const team of op.state.teams) assert.ok(walkable(op.state.map, team));
    travelled += distance(previous, alpha);
    previous = {x:alpha.x, z:alpha.z};
  }
  assert.ok(travelled > directDistance);
  assert.equal(alpha.x, 29.5);
  assert.equal(alpha.z, 8.5);
  assert.equal(bravo.x, 29.5);
  assert.equal(bravo.z, 30.5);
  assert.ok(distance(bravo, startB) > 20);
  assert.equal(op.command({commandId:'withdraw', teamId:'team-alpha', type:'retreat'}).ok, true);
  assert.equal(alpha.status, 'withdrawing');
  op.step(180);
  assert.equal(distance(alpha, op.state.mission.base), 0);
  assert.equal(bravo.x, 29.5);
  assert.equal(bravo.z, 30.5);
});

test('perimeter orders reserve finite stock, deploy on arrival and cannot replenish through cancellation', () => {
  const op = create();
  assert.equal(op.command(command('material-0', 'team-alpha', 'perimeter', 18.5, 8.5)).ok, true);
  assert.equal(op.state.resources.barriers, 3);
  assert.equal(op.state.barriers.length, 0, 'ordering a remote perimeter must not teleport a built barrier');
  assert.ok(op.state.teams[0].pendingBarrier);
  for (let i = 1; i < 4; i++) assert.equal(op.command(command('material-' + i, 'team-alpha', 'perimeter', 18.5 + i * 4, 8.5)).ok, true);
  assert.equal(op.state.resources.barriers, 0);
  assert.equal(op.state.resources.barriersLost, 3);
  rejectUnchanged(op, command('no-material', 'team-bravo', 'perimeter', 29.5, 30.5));
  op.step(220);
  assert.equal(op.state.barriers.length, 1);
  assert.equal(op.state.barriers[0].x, 30.5);
  assert.equal(op.state.barriers[0].z, 8.5);
  conserved(op.state);
});

test('unprotected perimeter physically delays a horde, accumulates pressure and breaches once', () => {
  const op = create();
  goodOrders(op);
  op.step(210);
  assert.equal(op.state.barriers.length, 2);
  assert.equal(op.command({commandId:'abandon-north', teamId:'team-alpha', type:'retreat'}).ok, true);
  let pressed = false, stoppedAtBarrier = false;
  for (let tick = 0; tick < 400 && op.state.phase === 'running'; tick++) {
    const north = op.state.barriers.find(b => b.z === 8.5);
    const horde = op.state.hordes[0], previous = {x:horde.x, z:horde.z};
    op.step();
    if (north.pressure > 0) pressed = true;
    if (horde.status === 'pressuring' && distance(horde, previous) === 0) stoppedAtBarrier = true;
  }
  const north = op.state.barriers.find(b => b.z === 8.5);
  assert.ok(pressed && stoppedAtBarrier, 'barrier must stop logical movement, not just draw an outline');
  assert.equal(north.hp, 0);
  assert.ok(north.pressure >= north.maxHp);
  assert.equal(op.state.events.filter(e => e.type === 'breach' && e.details.barrierId === north.id).length, 1);
  conserved(op.state);
});

test('escort changes a nearby civilian route progression before any combat occurs', () => {
  const escort = create(), movementOnly = create();
  assert.equal(escort.command(command('escort', 'team-alpha', 'escort', 19.5, 8.5)).ok, true);
  assert.equal(movementOnly.command(command('move', 'team-alpha', 'move', 19.5, 8.5)).ok, true);
  escort.step(220);
  movementOnly.step(220);
  const fast = escort.state.civilians[0], slow = movementOnly.state.civilians[0];
  assert.ok(distance(fast, slow) > 3, 'escort must change actual civilian progress');
  assert.ok(fast.path.length < slow.path.length);
  assert.equal(fast.dead, 0);
  assert.equal(slow.dead, 0);
  assert.equal(fast.count, slow.count);
  conserved(escort.state);
  conserved(movementOnly.state);
});

test('good position and route orders produce reachable success, while no-op reaches real failure', () => {
  const good = create(), idle = create();
  goodOrders(good);
  while (good.state.phase === 'running') {
    good.step();
    conserved(good.state);
  }
  while (idle.state.phase === 'running') {
    idle.step();
    conserved(idle.state);
  }
  assert.equal(good.state.phase, 'success');
  assert.equal(idle.state.phase, 'failure');
  assert.ok(good.state.population.evacuated >= good.state.mission.evacTarget);
  assert.ok(good.state.population.evacuated - idle.state.population.evacuated >= 90);
  assert.ok(good.state.population.dead < idle.state.population.dead);
  assert.ok(good.state.population.neutralized > 0);
  assert.ok(good.state.tick <= good.state.mission.maxSeconds / TICK_SECONDS);
  assert.equal(good.state.mission.result.evacuated, good.state.population.evacuated);
  const arrivals = good.state.events.filter(e => e.type === 'arrival');
  assert.equal(new Set(arrivals.map(e => e.details.cohortId)).size, arrivals.length);
  assert.equal(arrivals.reduce((sum, e) => sum + e.details.count, 0), good.state.population.evacuated);
  const completed = fullState(good);
  good.step(10000);
  assert.deepEqual(fullState(good), completed, 'completed groups cannot evacuate twice or keep accumulating results');
  rejectUnchanged(good, command('late-order'));
});

test('same seed and ordered commands reproduce complete mission state; reset restores the initial scenario', () => {
  const a = create(2026), b = create(2026), initial = a.snapshot();
  assert.deepEqual(initial, createScenario({seed:2026}));
  assert.notDeepEqual(initial.hordes.map(h => h.count), create(2027).state.hordes.map(h => h.count));
  for (const op of [a, b]) {
    goodOrders(op);
    op.step(170);
    op.command(command('support', 'team-alpha', 'escort', 20.5, 8.5));
    op.step(50);
    op.command(command('resume', 'team-alpha', 'defend', 29.5, 8.5));
    op.step(2100);
  }
  assert.deepEqual(fullState(a), fullState(b));
  assert.deepEqual(create(2026).snapshot(), initial);
  const view = a.snapshot(), before = fullState(a);
  view.teams[0].health = -1;
  view.map.walkable.fill(false);
  assert.deepEqual(fullState(a), before, 'snapshot must not expose mutable engine state');
});

test('10, 30, 60 and 144 FPS delivery partitions produce exactly the same fixed ticks and outcome', () => {
  const batch = create();
  goodOrders(batch);
  batch.step(2100);
  const snapshots = [fullState(batch)];
  for (const fps of [10, 30, 60, 144]) {
    const op = create();
    goodOrders(op);
    let delivered = 0;
    for (let frame = 1; frame <= fps * 210; frame++) {
      const targetTicks = Math.floor(frame * 10 / fps), ticks = targetTicks - delivered;
      if (ticks) op.step(ticks);
      delivered = targetTicks;
    }
    assert.equal(delivered, 2100);
    assert.equal(op.state.phase, 'success');
    assert.equal(op.state.tick, op.state.mission.result.tick);
    assert.equal(op.state.timeSeconds, op.state.tick * TICK_SECONDS);
    snapshots.push(fullState(op));
  }
  for (const snapshot of snapshots.slice(1)) assert.deepEqual(snapshot, snapshots[0]);
});
