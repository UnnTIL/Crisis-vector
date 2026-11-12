'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {ROOT,loadBundle,buildBaseline,generateArtifacts,sha256}=require('./baseline.cjs');
function main(args=process.argv.slice(2)) {
  let inputDir=path.join(ROOT,'data/baseline/inputs'),outDir=path.join(ROOT,'data/baseline');
  for(let i=0;i<args.length;i++){
    if(args[i]==='--input-dir' && args[i+1])inputDir=path.resolve(args[++i]);
    else if(args[i]==='--out-dir' && args[i+1])outDir=path.resolve(args[++i]);
    else throw new Error('Usage: normalize-baseline.cjs [--input-dir DIR] [--out-dir DIR]');
  }
  const bundle=buildBaseline(loadBundle({inputDir})),artifacts=generateArtifacts(bundle);
  fs.mkdirSync(outDir,{recursive:true});
  for(const [name,bytes] of Object.entries(artifacts))fs.writeFileSync(path.join(outDir,name),bytes);
  console.log(`Baseline ${bundle.coverage.availableCells}/40; SHA-256 ${sha256(artifacts['scenario-baseline-v1.json'])}`);
}
if(require.main===module){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={main};
