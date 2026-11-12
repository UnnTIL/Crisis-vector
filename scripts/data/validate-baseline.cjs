'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {ROOT,loadBundle,buildBaseline,generateArtifacts,sha256}=require('./baseline.cjs');
function main(args=process.argv.slice(2)){
  let dir=path.join(ROOT,'data/baseline'),inputDir=path.join(dir,'inputs');
  for(let i=0;i<args.length;i++){
    if(args[i]==='--out-dir' && args[i+1])dir=path.resolve(args[++i]);
    else if(args[i]==='--input-dir' && args[i+1])inputDir=path.resolve(args[++i]);
    else throw new Error('Usage: validate-baseline.cjs [--input-dir DIR] [--out-dir DIR]');
  }
  const inputs=loadBundle({inputDir}),a=generateArtifacts(buildBaseline(inputs)),b=generateArtifacts(buildBaseline(inputs));
  assert.deepEqual(a,b,'Non-deterministic build');
  for(const [name,bytes] of Object.entries(a))assert.equal(fs.readFileSync(path.join(dir,name),'utf8'),bytes,`Stale or corrupt artifact: ${name}`);
  console.log(`Validated ${Object.keys(a).length} artifacts; two builds identical; SHA-256 ${sha256(a['scenario-baseline-v1.json'])}`);
}
if(require.main===module){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={main};
