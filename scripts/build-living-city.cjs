'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),entry=path.join(root,'living-city'),sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const esbuild=require(path.join(root,'urban-spike/node_modules/esbuild'));
(async()=>{
  const bundle=path.join(entry,'demo.js');
  await esbuild.build({entryPoints:[path.join(entry,'app.mjs')],bundle:true,format:'iife',outfile:bundle,minify:true,legalComments:'eof',target:['chrome100','firefox100'],nodePaths:[path.join(root,'urban-spike/node_modules')]});
  const files=[];
  function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(/\.(?:cjs|mjs|html|css)$/.test(e.name))files.push({path:path.relative(root,file),sha256:sha(fs.readFileSync(file))});}}
  walk(entry);files.sort((a,b)=>a.path.localeCompare(b.path));
  fs.mkdirSync(path.join(entry,'vendor'),{recursive:true});fs.copyFileSync(path.join(root,'urban-spike/vendor/THREE-LICENSE.txt'),path.join(entry,'vendor/THREE-LICENSE.txt'));
  fs.writeFileSync(path.join(entry,'build-info.json'),JSON.stringify({schemaVersion:1,engineVersion:'0.2.1',baseSimulationRate:2,fixedTickMs:100,visualInterpolation:'previous/current tick poses',three:'0.181.2',esbuild:'0.25.12',bundleBytes:fs.statSync(bundle).size,bundleSHA256:sha(fs.readFileSync(bundle)),externalNetworkRequired:false,files},null,2)+'\n');
  console.log('Built Living City V0.2.1 local bundle and source hashes.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
