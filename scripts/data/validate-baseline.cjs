'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {ROOT,loadBundle,buildBaseline,generateArtifacts,sha256}=require('./baseline.cjs');
function main(args=process.argv.slice(2)){
  let baseDir=path.join(ROOT,'data/baseline'),dir,inputDir;
  for(let i=0;i<args.length;i++){
    const option=args[i];
    if(['--base-dir','--input-dir','--out-dir'].includes(option) && args[i+1] && !args[i+1].startsWith('--')){
      const value=path.resolve(args[++i]);
      if(option==='--base-dir')baseDir=value;
      else if(option==='--out-dir')dir=value;
      else inputDir=value;
    }else throw new Error('Usage: validate-baseline.cjs [--base-dir DIR] [--input-dir DIR] [--out-dir DIR]');
  }
  inputDir ??= path.join(baseDir,'inputs'); dir ??= baseDir;
  const inputs=loadBundle({baseDir,inputDir}),a=generateArtifacts(buildBaseline(inputs)),b=generateArtifacts(buildBaseline(inputs));
  assert.deepEqual(a,b,'Non-deterministic build');
  for(const [name,bytes] of Object.entries(a))assert.equal(fs.readFileSync(path.join(dir,name),'utf8'),bytes,`Stale or corrupt artifact: ${name}`);
  console.log(`Validated ${Object.keys(a).length} artifacts; two builds identical; SHA-256 ${sha256(a['scenario-baseline-v1.json'])}`);
}
if(require.main===module){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={main};
