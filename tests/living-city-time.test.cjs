'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {SimulationClock,BASE_SIMULATION_RATE,FIXED_TICK_MS}=require('../living-city/presentation/time.cjs');
const {LivingCity}=require('../living-city/core/world.cjs');

test('V021 time: normal 1x means old 2x, with explicit 2/4/8 logical seconds per real second',()=>{
  assert.equal(BASE_SIMULATION_RATE,2);assert.equal(FIXED_TICK_MS,100);
  for(const speed of [1,2,4]){
    const clock=new SimulationClock({speed});let ticks=0;
    const result=clock.advance(1000,()=>ticks++);
    assert.equal(ticks,20*speed);assert.equal(result.accumulatorMs,0);
    assert.equal(result.logicalSecondsPerRealSecond,2*speed);
  }
});

test('V021 time: fractional frame interpolation and pause preserve requested time without phantom ticks',()=>{
  const clock=new SimulationClock();let ticks=0;
  assert.equal(clock.advance(25,()=>ticks++).alpha,.5);assert.equal(ticks,0);
  clock.setPaused(true);const before=clock.snapshot();clock.advance(60000,()=>ticks++);
  assert.equal(ticks,0);assert.deepEqual(clock.snapshot(),before);assert.equal(clock.alpha(),1);
  clock.setPaused(false);clock.advance(25,()=>ticks++);assert.equal(ticks,1);assert.equal(clock.alpha(),0);
});

test('V021 time: malformed durations and unsupported speeds reject without consuming canonical time',()=>{
  const clock=new SimulationClock();clock.advance(25,()=>{});const before=clock.snapshot();
  for(const delta of [NaN,Infinity,-1,'10',null])assert.throws(()=>clock.advance(delta,()=>assert.fail('Invalid frame advanced a tick')),TypeError);
  for(const speed of [0,3,-1,'2',NaN,Infinity])assert.equal(clock.setSpeed(speed),false);
  assert.deepEqual(clock.snapshot(),before);
});

test('V021 time: overload pauses explicitly and retains every requested tick in the backlog',()=>{
  const clock=new SimulationClock({speed:4});let ticks=0;
  const result=clock.advance(2000,()=>ticks++);
  assert.equal(ticks,100);assert.equal(result.autoPaused,false);assert.equal(result.accumulatorMs,6000);
  const overload=clock.advance(2000,()=>ticks++);
  assert.equal(overload.autoPaused,true);assert.equal(overload.accumulatorMs,12000);assert.equal(ticks,200);
  assert.equal(ticks*100+overload.accumulatorMs,2*2000*8);
  const pending=overload.accumulatorMs;clock.advance(1000,()=>ticks++);assert.equal(ticks,200);assert.equal(clock.accumulatorMs,pending);
});

test('V021 time: fixed logical snapshots match at 1, 10, 30, 60 and 144 rendering FPS',()=>{
  for(const speed of [1,2,4]){
    const reference=new LivingCity({seed:2026,scenario:'S2'});reference.step(100*speed);
    for(const fps of [1,10,30,60,144]){
      const world=new LivingCity({seed:2026,scenario:'S2'}),clock=new SimulationClock({speed});
      for(let frame=0;frame<5*fps;frame++)clock.advance(1000/fps,()=>world.step());
      assert.equal(world.state.tick,100*speed,`${fps} FPS at ${speed}x lost logical ticks`);
      assert.deepEqual(world.snapshot(),reference.snapshot());
    }
  }
});
