'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {ROOT,loadBundle,buildBaseline,generateArtifacts,sha256}=require('./baseline.cjs');
function main(args=process.argv.slice(2)) {
  let baseDir=path.join(ROOT,'data/baseline'),inputDir,outDir;
  for(let i=0;i<args.length;i++){
    const option=args[i];
    if(['--base-dir','--input-dir','--out-dir'].includes(option) && args[i+1] && !args[i+1].startsWith('--')){
      const value=path.resolve(args[++i]);
      if(option==='--base-dir')baseDir=value;
      else if(option==='--input-dir')inputDir=value;
      else outDir=value;
    }else throw new Error('Usage: normalize-baseline.cjs [--base-dir DIR] [--input-dir DIR] [--out-dir DIR]');
  }
  inputDir ??= path.join(baseDir,'inputs'); outDir ??= baseDir;
  const bundle=buildBaseline(loadBundle({baseDir,inputDir})),artifacts=generateArtifacts(bundle);
  fs.mkdirSync(outDir,{recursive:true});
  for(const [name,bytes] of Object.entries(artifacts))fs.writeFileSync(path.join(outDir,name),bytes);
  console.log(`Baseline ${bundle.coverage.availableCells}/40; SHA-256 ${sha256(artifacts['scenario-baseline-v1.json'])}`);
}
if(require.main===module){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={main};
