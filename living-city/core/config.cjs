'use strict';
const DEFAULT_PARAMETERS=Object.freeze({
  symptomSeconds:20,criticalSeconds:140,deathSeconds:230,reanimateDelaySeconds:6,suddenSeconds:30,
  exposureDistance:1.4,exposureSeconds:8,incubationSeconds:35,attackRange:1.2,attackDamagePerSecond:8,zombieSpeed:1.15,
  ambulanceSpeed:7,policeSpeed:7.5,triageSeconds:5,handoverSeconds:6,hospitalStaySeconds:65,callDelaySeconds:2,dispatchDelaySeconds:1
});
const FIXTURES=Object.freeze(['default','concurrentCalls','hospitalFull','blockedRoute','brokenVehicle','policeBusy']);
function fixtureName(value){
  if(typeof value!=='string')throw new TypeError('Invalid fixture.');
  const compact=value.replace(/[-_ ]/g,'').toLowerCase(),name=FIXTURES.find(n=>n.toLowerCase()===compact);
  if(!name)throw new TypeError('Unknown fixture.');return name;
}
function parameters(input={}){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new TypeError('Invalid parameters.');
  const result={...DEFAULT_PARAMETERS};
  for(const [name,value] of Object.entries(input)){
    if(!/^[A-Za-z][A-Za-z0-9]*$/.test(name)||!Number.isFinite(value)||value<0||value>1000000)throw new TypeError('Parameters must be finite nonnegative fictional values.');
    result[name]=value;
  }
  return result;
}
module.exports={DEFAULT_PARAMETERS,FIXTURES,fixtureName,parameters};
