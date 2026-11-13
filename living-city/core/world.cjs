'use strict';
const {createCity}=require('./topology.cjs');
const {createHelpers,positionOf,clone}=require('./helpers.cjs');
const {initializePopulation,updateRoutines}=require('./population.cjs');
const {fixtureName,parameters}=require('./config.cjs');
const incidentSystem=require('./incidents.cjs');
const medicalSystem=require('./medical.cjs');
const healthSystem=require('./health.cjs');
const policeSystem=require('./police.cjs');
const TICK_SECONDS=.1;
class LivingCity{
  constructor(options={}){
    const seed=options.seed===undefined?16927:options.seed,scenario=options.scenario===undefined?'S0':options.scenario;
    if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295||!['S0','S1','S2'].includes(scenario))throw new TypeError('Invalid scenario or seed.');
    const integer=(value,fallback,min,max)=>{const n=value===undefined?fallback:value;if(!Number.isSafeInteger(n)||n<min||n>max)throw new TypeError('Invalid resource configuration.');return n;};
    if(options.initialPersonId!==undefined&&(typeof options.initialPersonId!=='string'||!options.initialPersonId.length))throw new TypeError('Invalid initial person identifier.');
    const config={residents:integer(options.residents,150,4,1000),ambulances:integer(options.ambulances,2,0,8),patrols:integer(options.patrols,3,0,8),hospitalCapacity:integer(options.hospitalCapacity,4,0,30),fixture:fixtureName(options.fixture===undefined?'default':options.fixture),parameters:parameters(options.parameters),initialPersonId:options.initialPersonId??null};
    this.state={version:2,seed,rng:seed>>>0,tick:0,timeSeconds:0,scenario,config,city:createCity(),people:[],vehicles:[],patrols:[],incidents:[],calls:[],events:[],facilities:{},counters:{},initialPopulation:0,initialPersonId:null,eventSequence:0,incidentSequence:0,callSequence:0};
    this._commands=new Map();
    const state=this.state,helpers=createHelpers(state);
    this.ctx={state,dt:TICK_SECONDS,...helpers,random:()=>{state.rng=(Math.imul(1664525,state.rng)+1013904223)>>>0;return state.rng/4294967296;},emit:(type,message,fields={})=>{
      const event={eventId:++state.eventSequence,type,tick:state.tick,timeSeconds:state.tick/10,entityIds:[],message,visibility:'truth',...fields};state.events.push(event);return event;
    }};
    initializePopulation(this.ctx);
    this.ctx.leaveFacility=person=>{
      if(!person||!['building','hospital'].includes(person.location.kind))return false;
      const building=state.city.buildings.find(b=>b.id===person.location.buildingId),node=helpers.pedestrianNode(building?.entranceNodeIds[0]);
      if(!node)return false;
      state.facilities.hospital.patientIds=state.facilities.hospital.patientIds.filter(id=>id!==person.id);
      person.location={kind:'street',nodeId:node.id};person.nodeId=node.id;person.x=node.x;person.z=node.z;person.path=[];person.taskId=null;return true;
    };
    this.incidentSystem=incidentSystem;this.medicalSystem=medicalSystem;this.healthSystem=healthSystem;this.policeSystem=policeSystem;
    this.ctx.report=(...args)=>this.incidentSystem.reportIncident?.(this.ctx,...args);
    this.incidentSystem.initializeIncidents?.(this.ctx);this.healthSystem.initializeHealth?.(this.ctx);this.policeSystem.initializePolice?.(this.ctx);
    this._counters();
  }
  snapshot(){return clone(this.state);}
  command(input){
    if(!input||typeof input!=='object'||Array.isArray(input)||Reflect.ownKeys(input).some(k=>!['commandId','type','incidentId','priority'].includes(k)))return {ok:false,message:'Comando inválido.'};
    if(!['commandId','type','incidentId','priority'].every(k=>Object.hasOwn(input,k))||typeof input.commandId!=='string'||!/^[-\w:.]{1,80}$/.test(input.commandId)||input.type!=='overridePriority'||typeof input.incidentId!=='string'||!Number.isSafeInteger(input.priority)||input.priority<1||input.priority>5)return {ok:false,message:'Comando ou prioridade inválida.'};
    const payload=JSON.stringify({commandId:input.commandId,type:input.type,incidentId:input.incidentId,priority:input.priority}),prior=this._commands.get(input.commandId);
    if(prior)return prior.payload===payload?{...prior.result,duplicate:true}:{ok:false,message:'Identificador já utilizado.'};
    const incident=this.state.incidents.find(i=>i.id===input.incidentId);
    if(!incident||['resolved','cancelled'].includes(incident.status))return {ok:false,message:'Ocorrência indisponível.'};
    incident.priority=input.priority;incident.manualPriority=input.priority;
    const result={ok:true,message:'Prioridade atualizada pela central.'};this._commands.set(input.commandId,{payload,result});
    this.ctx.emit('PriorityOverridden','Prioridade manual atualizada.',{entityIds:[incident.id],visibility:'confirmed',priority:input.priority});return {...result};
  }
  step(ticks=1){
    if(!Number.isSafeInteger(ticks)||ticks<1||ticks>10000)return {ok:false,message:'Avançar entre 1 e 10000 ticks inteiros.'};
    for(let i=0;i<ticks;i++){
      this.state.tick++;this.state.timeSeconds=this.state.tick/10;
      this.healthSystem.updateHealth?.(this.ctx);updateRoutines(this.ctx);this.incidentSystem.updateIncidents?.(this.ctx);this.medicalSystem.updateMedical?.(this.ctx);this.policeSystem.updatePolice?.(this.ctx);this._counters();
    }
    return this.state;
  }
  _counters(){
    const s=this.state;
    s.counters={living:s.people.filter(p=>p.lifeState==='alive').length,dead:s.people.filter(p=>p.lifeState!=='alive').length,
      activeReanimated:s.people.filter(p=>p.lifeState==='reanimated').length,neutralized:s.people.filter(p=>p.lifeState==='neutralized').length,
      reanimatedHistorical:s.people.filter(p=>p.lifeState==='reanimated'||p.lifeState==='neutralized').length,
      knownCases:s.people.filter(p=>p.observedSymptoms.length>0).length,activeIncidents:s.incidents.filter(i=>!['resolved','cancelled'].includes(i.status)).length,
      availableAmbulances:s.vehicles.filter(v=>v.type==='ambulance'&&v.status==='available'&&!v.broken&&v.availableAt<=s.tick&&v.crewIds.every(id=>s.people.some(p=>p.id===id&&p.lifeState==='alive'&&p.healthState!=='critical'&&p.location.kind==='vehicle'&&p.location.vehicleId===v.id))).length,
      availablePatrols:s.patrols.filter(p=>p.status==='available'||p.status==='patrolling').length,hospitalOccupancy:s.facilities.hospital.patientIds.length};
  }
}
module.exports={LivingCity,TICK_SECONDS,positionOf};
