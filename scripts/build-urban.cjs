'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const esbuild=require(path.join(root,'urban-spike/node_modules/esbuild'));
(async()=>{
  const result=await esbuild.build({entryPoints:[path.join(root,'urban-spike/app.mjs')],bundle:true,format:'iife',
    outfile:path.join(root,'urban-spike/demo.js'),minify:true,legalComments:'eof',target:['chrome100','firefox100'],metafile:true});
  fs.mkdirSync(path.join(root,'urban-spike/vendor'),{recursive:true});
  fs.copyFileSync(path.join(root,'urban-spike/node_modules/three/LICENSE'),path.join(root,'urban-spike/vendor/THREE-LICENSE.txt'));
  fs.writeFileSync(path.join(root,'urban-spike/build-info.json'),JSON.stringify({three:'0.181.2',esbuild:'0.25.12',
    bundleBytes:result.metafile.outputs[path.relative(process.cwd(),path.join(root,'urban-spike/demo.js'))]?.bytes??fs.statSync(path.join(root,'urban-spike/demo.js')).size,
    externalNetworkRequired:false},null,2)+'\n');
  console.log('Built local urban-spike/demo.js (Three.js included, no CDN).');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
