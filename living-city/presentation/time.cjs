'use strict';

// Presentation pacing only. The domain still owns one canonical 100 ms tick.
const FIXED_TICK_MS=100;
const BASE_SIMULATION_RATE=2;
const SPEED_MULTIPLIERS=Object.freeze([1,2,4]);
class SimulationClock {
  constructor({paused=false,speed=1}={}) {
    this.accumulatorMs=0;this.paused=Boolean(paused);this.speed=1;
    if(!this.setSpeed(speed))throw new TypeError('Unsupported presentation speed.');
  }
  reset({paused=true,speed=1}={}) {
    if(!SPEED_MULTIPLIERS.includes(speed))throw new TypeError('Unsupported presentation speed.');
    this.accumulatorMs=0;this.paused=Boolean(paused);this.speed=speed;
  }
  setSpeed(speed) {if(!SPEED_MULTIPLIERS.includes(speed))return false;this.speed=speed;return true;}
  setPaused(paused) {this.paused=Boolean(paused);}
  alpha() {return this.paused?1:Math.max(0,Math.min(1,this.accumulatorMs/FIXED_TICK_MS));}
  snapshot() {return {baseSimulationRate:BASE_SIMULATION_RATE,fixedTickMs:FIXED_TICK_MS,speed:this.speed,paused:this.paused,
    accumulatorMs:this.accumulatorMs,alpha:this.alpha(),logicalSecondsPerRealSecond:BASE_SIMULATION_RATE*this.speed};}
  advance(realDeltaMs,step) {
    if(!Number.isFinite(realDeltaMs)||realDeltaMs<0||typeof step!=='function')throw new TypeError('A finite nonnegative frame duration and tick callback are required.');
    if(this.paused)return {steps:0,autoPaused:false,...this.snapshot()};
    this.accumulatorMs+=realDeltaMs*BASE_SIMULATION_RATE*this.speed;
    let steps=0;
    while(this.accumulatorMs>=FIXED_TICK_MS-1e-8&&steps<100){
      step();this.accumulatorMs=Math.max(0,this.accumulatorMs-FIXED_TICK_MS);steps++;
    }
    const autoPaused=this.accumulatorMs>10000;
    if(autoPaused)this.paused=true;
    // Preserve excess requested time; never silently discard logical ticks for FPS.
    return {steps,autoPaused,...this.snapshot()};
  }
}
module.exports={SimulationClock,BASE_SIMULATION_RATE,FIXED_TICK_MS,SPEED_MULTIPLIERS};
