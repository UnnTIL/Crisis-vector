'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {SimEngine, POLICY_TYPES, UNIT_TYPES, FINANCE_RULES} = require('../src/simulation.js');

const data = ['PRT', 'ESP'].map((id, i) => ({
  id, name:id, pop:1000000, gdp:100000, continent:'Europe', center:[i * 2, 40],
  rings:[[[0, 0], [1, 0], [1, 1]]]
}));
const create = (seed = 16927) => new SimEngine(data, seed);
const state = sim => structuredClone({...sim});
const minor = n => Math.round(n * 1000);

// Scarcity is a fixture condition, not a new revenue source in the simulation.
function treasury(c, value) {
  c.finance.initialTreasury = (minor(c.finance.initialTreasury) + minor(value) - minor(c.budget)) / 1000;
  c.budget = value;
}
function rejectUnchanged(sim, command) {
  const before = state(sim);
  assert.equal(command().ok, false);
  assert.deepEqual(state(sim), before, 'rejection must preserve countries, finance, RNG, day, history and IDs');
}
function reconcile(c) {
  const f = c.finance, d = f.lastDaily;
  assert.equal(minor(c.budget), minor(f.initialTreasury) + minor(f.totalRevenue) - minor(f.totalSpent));
  assert.equal(minor(f.arrears), minor(f.totalOperatingDue) - minor(f.totalOperatingPaid) - minor(f.totalArrearsPaid));
  if (d) {
    assert.equal(minor(d.opening) + minor(d.revenue) - minor(d.paid) - minor(d.arrearsPaid), minor(d.closing));
    assert.equal(minor(d.due), minor(d.paid) + minor(d.unpaid));
    assert.equal(minor(f.arrears), minor(d.arrearsOpening) + minor(d.unpaid) - minor(d.arrearsPaid));
    assert.equal(minor(d.paid), Object.values(d.services).reduce((sum, s) => sum + minor(s.paid), 0));
  }
  for (const value of [c.budget, f.arrears, f.totalRevenue, f.totalSpent, f.totalOperatingDue, f.totalOperatingPaid, f.totalArrearsPaid]) {
    assert.ok(Number.isFinite(value) && value >= 0);
  }
}

test('invalid unit types and coordinates reject atomically without coercion', () => {
  const sim = create();
  const hostile = {toString() { throw new Error('input must not be coerced'); }};
  for (const type of ['toString', '__proto__', 'constructor', 'unknown', '', null, undefined, {}, hostile, NaN, Infinity]) {
    rejectUnchanged(sim, () => sim.deployUnit(type, .5, .5));
  }
  for (const value of [NaN, Infinity, -Infinity, null, undefined, '0.5', true, false, {}, [], hostile]) {
    rejectUnchanged(sim, () => sim.deployUnit('squad', value, .5));
    rejectUnchanged(sim, () => sim.deployUnit('squad', .5, value));
  }
  for (const x of [-1, 0, .039999, .960001, 1]) rejectUnchanged(sim, () => sim.deployUnit('squad', x, .5));
  for (const y of [-1, 0, .059999, .940001, 1]) rejectUnchanged(sim, () => sim.deployUnit('squad', .5, y));
  assert.equal(sim.deployUnit('squad', .04, .06).ok, true);
  assert.equal(sim.deployUnit('barrier', .96, .94).ok, true);
  assert.deepEqual(sim.player.units.map(u => [u.x, u.y]), [[.04, .06], [.96, .94]]);
  reconcile(sim.player);
});

test('country and policy commands reject unknown or inherited keys atomically', () => {
  const sim = create();
  for (const value of ['toString', '__proto__', 'constructor', '', 'xxx', 'prt', null, undefined, NaN, Infinity, {}, ['PRT']]) {
    assert.equal(sim.getCountry(value), null);
    if (value !== undefined) assert.equal(sim.getFinance(value), null); // undefined selects the documented default country.
    rejectUnchanged(sim, () => sim.takeControl(value));
    rejectUnchanged(sim, () => sim.sendAid(value));
    rejectUnchanged(sim, () => sim.togglePolicy(value));
  }
  rejectUnchanged(sim, () => sim.sendAid('PRT'));
  for (const enabled of [0, 1, 'true', null, undefined]) rejectUnchanged(sim, () => sim._setPolicy('PRT', 'emergency', enabled));
});

test('advance requires bounded positive integers and rejects without consuming RNG', () => {
  const sim = create();
  for (const value of [NaN, Infinity, -Infinity, -1, 0, .5, '2', null, {}, [], FINANCE_RULES.maxAdvanceDays + 1, Number.MAX_SAFE_INTEGER]) {
    rejectUnchanged(sim, () => sim.advance(value));
  }
  sim.advance();
  assert.equal(sim.day, 1);
  sim.advance(2);
  assert.equal(sim.day, 3);
});

test('insufficient activation, aid, unit and operational-limit commands leave state intact', () => {
  const sim = create();
  treasury(sim.player, 0);
  for (const key of Object.keys(POLICY_TYPES)) rejectUnchanged(sim, () => sim.togglePolicy(key));
  rejectUnchanged(sim, () => sim.sendAid('ESP'));
  rejectUnchanged(sim, () => sim.deployUnit('squad', .5, .5));
  treasury(sim.player, 20);
  for (let n = 0; n < 26; n++) assert.equal(sim.deployUnit('barrier', .5, .5).ok, true);
  rejectUnchanged(sim, () => sim.deployUnit('barrier', .5, .5));
});

test('actual AI activations charge exactly the same initial and daily costs as player policies', () => {
  for (const [key, seed] of [['emergency', 2], ['borders', 6], ['mobilized', 1]]) {
    const ai = create(seed), human = create(seed);
    ai.advance();
    const aiCountry = ai.getCountry('ESP');
    assert.equal(aiCountry[key], true, 'seed must exercise the actual AI activation');
    const event = ai.history.find(e => e.details?.countryId === 'ESP' && e.details?.policy === key);
    assert.ok(event);
    assert.equal(event.details.cost, POLICY_TYPES[key].activation);
    assert.equal(human.togglePolicy(key).ok, true);
    human.advance();
    assert.equal(aiCountry.finance.totalSpent, human.player.finance.totalSpent);
    assert.equal(aiCountry.budget, human.player.budget);
    assert.deepEqual(aiCountry.finance.lastDaily.services, human.player.finance.lastDaily.services);
    reconcile(aiCountry);
    reconcile(human.player);
  }
});

test('AI cannot activate measures it cannot afford or receive free funded efficacy', () => {
  const sim = create(2), ai = sim.getCountry('ESP');
  treasury(ai, 0);
  sim.advance();
  assert.equal(ai.emergency, false);
  assert.equal(ai.borders, false);
  assert.equal(ai.mobilized, false);
  assert.equal(ai.finance.totalSpent, 0);
  assert.deepEqual(ai.finance.effectiveness, {emergency:0, units:0, mobilized:0, borders:0});
  assert.equal(ai.budget, .01, 'only the documented domestic revenue enters treasury');
  reconcile(ai);
});

test('daily allocations follow declared priority and record the partially funded service', () => {
  const sim = create(), c = sim.player;
  for (const key of Object.keys(POLICY_TYPES)) assert.equal(sim.togglePolicy(key).ok, true);
  assert.equal(sim.deployUnit('squad', .5, .5).ok, true);
  treasury(c, .092); // + .010 revenue = .102 available for .320 commitments.
  sim.advance();
  const daily = c.finance.lastDaily;
  assert.deepEqual(FINANCE_RULES.priority, ['emergency', 'units', 'mobilized', 'borders']);
  assert.equal(daily.services.emergency.paid, .085);
  assert.equal(daily.services.units.paid, .015);
  assert.equal(daily.services.mobilized.paid, .002);
  assert.equal(daily.services.borders.paid, 0);
  assert.equal(daily.services.mobilized.funding, .002 / .18);
  assert.equal(daily.due, .32);
  assert.equal(daily.unpaid, .218);
  assert.equal(c.budget, 0);
  assert.equal(c.finance.arrears, .218);
  reconcile(c);
});

test('capacity ramps with funding, decays in four unfunded days, and recovers gradually', () => {
  const sim = create(), c = sim.player;
  assert.equal(sim.togglePolicy('emergency').ok, true);
  for (const expected of [.25, .5, .75, 1]) {
    sim.advance();
    assert.equal(c.finance.effectiveness.emergency, expected);
  }
  treasury(c, 0);
  c.gdp = 0;
  c.economy = 0;
  for (const expected of [.75, .5, .25, 0]) {
    sim.advance();
    assert.equal(c.finance.lastDaily.services.emergency.paid, 0);
    assert.equal(c.finance.effectiveness.emergency, expected);
    reconcile(c);
  }
  const arrears = c.finance.arrears;
  assert.ok(arrears > 0);
  treasury(c, 1);
  for (const expected of [.25, .5, .75, 1]) {
    sim.advance();
    assert.equal(c.finance.effectiveness.emergency, expected);
    reconcile(c);
  }
  assert.equal(c.finance.arrears, 0);
});

test('deactivation and reactivation cannot erase arrears or refill degraded capacity', () => {
  const sim = create(), c = sim.player;
  sim.togglePolicy('emergency');
  treasury(c, 0);
  c.economy = 0;
  sim.advance();
  const arrears = c.finance.arrears;
  assert.equal(c.finance.effectiveness.emergency, 0);
  assert.equal(sim.togglePolicy('emergency').ok, true);
  assert.equal(c.finance.arrears, arrears);
  treasury(c, 1);
  assert.equal(sim.togglePolicy('emergency').ok, true);
  assert.equal(c.finance.arrears, arrears);
  assert.equal(c.finance.effectiveness.emergency, 0);
  sim.advance();
  assert.equal(c.finance.effectiveness.emergency, .25);
  reconcile(c);
});

test('old arrears are repaid after current services and repayment grants no inactive efficacy', () => {
  const sim = create(), c = sim.player;
  sim.togglePolicy('emergency');
  treasury(c, 0);
  c.economy = 0;
  sim.advance(3);
  const arrears = c.finance.arrears;
  assert.equal(arrears, .255);
  sim.togglePolicy('emergency');
  treasury(c, .1);
  sim.advance();
  assert.equal(c.finance.lastDaily.due, 0);
  assert.equal(c.finance.lastDaily.arrearsPaid, .1);
  assert.equal(c.finance.arrears, .155);
  assert.equal(c.finance.effectiveness.emergency, 0);
  reconcile(c);
});

test('unfunded urban units cannot continue creating operational benefits indefinitely', () => {
  const funded = create(73), unfunded = create(73);
  funded.player.cases = unfunded.player.cases = 10000; // Make the small urban power observable above integer-case rounding.
  assert.equal(funded.deployUnit('evac', .5, .5).ok, true);
  assert.equal(unfunded.deployUnit('evac', .5, .5).ok, true);
  treasury(unfunded.player, 0);
  unfunded.player.economy = 0;
  funded.advance(8);
  unfunded.advance(8);
  assert.equal(unfunded.player.finance.effectiveness.units, 0);
  assert.equal(unfunded.player.saved, 0);
  assert.ok(funded.player.saved > 0);
  assert.ok(funded.player.cases < unfunded.player.cases);
  const before = unfunded.player.saved;
  unfunded.advance(12);
  assert.equal(unfunded.player.saved, before);
  reconcile(funded.player);
  reconcile(unfunded.player);
});

test('long-run ledgers reconcile for every country with finite obligations and treasury', () => {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../data/world-data.js'), 'utf8'), context);
  const sim = new SimEngine(context.window.WORLD_DATA, 18);
  assert.equal(sim.countries.length, 177);
  sim.togglePolicy('emergency');
  sim.togglePolicy('borders');
  sim.deployUnit('squad', .4, .6);
  sim.sendAid('ESP');
  for (let day = 0; day < 120; day++) {
    sim.advance();
    for (const c of sim.countries) reconcile(c);
  }
  assert.ok(sim.countries.some(c => c.finance.arrears > 0), 'fixture must exercise real funding shortfalls');
});

test('finance views and shared price tables cannot mutate the simulation', () => {
  const sim = create();
  sim.togglePolicy('emergency');
  sim.advance();
  const before = state(sim), view = sim.getFinance();
  view.effectiveness.emergency = 99;
  view.lastDaily.services.emergency.paid = 99;
  view.lastDaily.closing = 99;
  assert.deepEqual(state(sim), before);
  assert.throws(() => { POLICY_TYPES.emergency.activation = 0; }, TypeError);
  assert.throws(() => { UNIT_TYPES.squad.daily = 0; }, TypeError);
  assert.throws(() => { FINANCE_RULES.priority.reverse(); }, TypeError);
});

test('same seed and command sequence reproduce the complete state including finance and RNG', () => {
  const a = create(203), b = create(203);
  const commands = [
    s => s.togglePolicy('emergency'), s => s.deployUnit('squad', .2, .7),
    s => s.sendAid('ESP'), s => s.advance(8), s => s.deployUnit('evac', .6, .5),
    s => s.advance(17), s => s.togglePolicy('borders'), s => s.advance(30),
    s => s.takeControl('ESP'), s => s.togglePolicy('mobilized'), s => s.advance(15),
    s => s.takeControl('PRT'), s => s.advance(60)
  ];
  for (const command of commands) {
    assert.deepEqual(command(a), command(b));
    assert.deepEqual(state(a), state(b));
  }
  for (const c of a.countries) reconcile(c);
});
