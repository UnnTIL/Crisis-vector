#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const args=process.argv.slice(2),options={url:'http://127.0.0.1:8000/living-city/',output:'/tmp/living-city-browser.json',captureMs:10000,warmupMs:2000,smokeOnly:false,scenarios:['S0','S1','S2'],s2PrimeTicks:330,audioEnabled:false,speeds:[1],dprs:[1,1.5,2]};
for(let i=0;i<args.length;i+=2){const key={'--url':'url','--output':'output','--capture-ms':'captureMs','--warmup-ms':'warmupMs','--smoke-only':'smokeOnly','--reuse-smoke':'reuseSmoke','--scenarios':'scenarios','--s2-prime-ticks':'s2PrimeTicks','--audio':'audioEnabled','--ux-evidence':'uxEvidence','--speeds':'speeds','--dprs':'dprs'}[args[i]];assert.ok(key&&args[i+1],`Invalid option ${args[i]}`);options[key]=['smokeOnly','audioEnabled'].includes(key)?args[i+1]==='1':key==='scenarios'?args[i+1].split(','):['speeds','dprs'].includes(key)?args[i+1].split(',').map(Number):(key.endsWith('Ms')||key==='s2PrimeTicks')?Number(args[i+1]):args[i+1];}
assert.ok(options.scenarios.length&&options.scenarios.every(s=>['S0','S1','S2'].includes(s)));
assert.ok(Number.isSafeInteger(options.s2PrimeTicks)&&options.s2PrimeTicks>=1&&options.s2PrimeTicks<=10000);
assert.ok(options.speeds.length&&options.speeds.every(s=>[1,2,4].includes(s)));
assert.ok(options.dprs.length&&options.dprs.every(d=>[1,1.5,2].includes(d)));
const stats=values=>{const a=[...values].sort((x,y)=>x-y),p=q=>a[Math.max(0,Math.ceil(a.length*q)-1)]??null;return {count:a.length,mean:a.length?a.reduce((x,y)=>x+y,0)/a.length:null,p50:p(.5),p95:p(.95),p99:p(.99)};};
const read=file=>{try{return fs.readFileSync(file,'utf8').trim();}catch{return null;}};
const root=path.resolve(__dirname,'..');
const build=JSON.parse(fs.readFileSync(path.join(root,'living-city/build-info.json')));
for(const file of build.files)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file.path))).digest('hex'),file.sha256,`Rebuild before measuring changed source ${file.path}`);
const report={schemaVersion:build.engineVersion==='0.2.1'?'living-city-browser-v021':'living-city-browser-v02',engineVersion:build.engineVersion??'0.2',classification:'preliminary_cloud_measurement',startedAt:new Date().toISOString(),options,
 environment:{node:process.version,cpu:[...new Set(os.cpus().map(c=>c.model))],visibleLogicalCpus:os.cpus().length,cgroupCPU:read('/sys/fs/cgroup/cpu.max'),cgroupMemory:read('/sys/fs/cgroup/memory.max'),bundleSHA256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'living-city/demo.js'))).digest('hex'),sourceFiles:build.files},smoke:[],runs:[],limitations:['Short cloud captures; not certification of 60 FPS or physical-GPU desktop performance.','GPU timing, peak process/GPU memory and prolonged leak tests are not measured.','Different scenarios/DPR cases have one capture each, not replicated reference-hardware trials.']};
const save=()=>{fs.mkdirSync(path.dirname(path.resolve(options.output)),{recursive:true});fs.writeFileSync(options.output,JSON.stringify(report,null,2)+'\n');};
async function open(browser,dpr,url=options.url){
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr}),page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(url,{waitUntil:'load',timeout:120000});await page.waitForFunction(()=>window.livingDemo?.ready===true,null,{timeout:120000});
 await page.evaluate(()=>window.livingDemo.setPaused(true));return {context,page,errors,requests};
}
async function smoke(browser,dpr){
 const {context,page,errors,requests}=await open(browser,dpr);
 try{
  await context.setOffline(true);
  const before=await page.evaluate(()=>JSON.stringify(window.livingDemo.getState()));
  const id=await page.evaluate(()=>window.livingDemo.getState().people.find(p=>p.role==='resident').id);
  await page.selectOption('#entity-select',`person:${id}`);await page.click('#select-entity-button');
  assert.equal((await page.evaluate(()=>window.livingDemo.getSelection())).id,id);
  await page.click('#follow-button');await page.locator('.display-section').evaluate(el=>{el.open=true;});await page.check('#debug-truth');await page.uncheck('#debug-truth');await page.check('#reduced-effects');
  await page.click('#sound-toggle');await page.locator('#volume-control').evaluate(el=>{el.value='.15';el.dispatchEvent(new Event('input',{bubbles:true}));});await page.click('#sound-toggle');
  const scene=await page.locator('#livingCanvas').boundingBox();await page.mouse.move(scene.x+scene.width*.55,scene.y+scene.height*.45);await page.mouse.wheel(0,-100);
  await page.mouse.move(scene.x+scene.width*.5,scene.y+scene.height*.5);await page.mouse.down();await page.mouse.move(scene.x+scene.width*.5+35,scene.y+scene.height*.5+20,{steps:5});await page.mouse.up();
  await page.locator('#livingCanvas').focus();await page.keyboard.press('r');
  async function pickHospital(){const target=await page.evaluate(()=>{const s=livingDemo.getState(),id=s.facilities.hospital.buildingId;return {id,...livingDemo.renderer.projectEntity('building',id)};});assert.ok(target.visible);await page.mouse.click(target.x,target.y);assert.deepEqual(await page.evaluate(()=>livingDemo.getSelection()),{kind:'building',id:target.id});}
  await pickHospital();await page.setViewportSize({width:1280,height:850});await page.waitForTimeout(150);await pickHospital();
  assert.equal(await page.evaluate(()=>JSON.stringify(window.livingDemo.getState())),before,'Presentation changed canonical state');
  const cases=[];
  for(const scenario of ['S0','S1','S2']){
   await page.selectOption('#scenario-select',scenario);
   const initial=await page.evaluate(()=>window.livingDemo.getState());assert.equal(initial.scenario,scenario);
   for(let i=0;i<6;i++)await page.evaluate(()=>window.livingDemo.advanceTicks(1000));
   const end=await page.evaluate(()=>{const s=window.livingDemo.getState();return {scenario:s.scenario,tick:s.tick,people:s.people.length,counters:s.counters,events:s.events.reduce((out,e)=>(out[e.type]=(out[e.type]??0)+1,out),{}),patient:s.people.find(p=>p.id===s.initialPersonId),audio:window.livingDemo.audio.getStatus()};});
   assert.equal(end.people,initial.people.length);assert.equal(end.counters.living+end.counters.dead,initial.initialPopulation);if(scenario==='S0')assert.equal(end.counters.reanimatedHistorical,0);
   cases.push(end);
  }
  const firstShotTick=await page.evaluate(()=>livingDemo.getState().events.find(e=>e.type==='ShotFired')?.tick);
  assert.ok(firstShotTick,'S2 must produce a real authorized shot for audiovisual validation');
  await page.evaluate(tick=>{livingDemo.reset({scenario:'S2',seed:16927});livingDemo.setPaused(true);livingDemo.advanceTicks(tick-1);livingDemo.setEffects(true);},firstShotTick);
  await page.click('#sound-toggle');
  const shotCheck=await page.evaluate(()=>{const before=livingDemo.getState(),after=livingDemo.advanceTicks(1),event=after.events.find(e=>e.type==='ShotFired');return {event,render:livingDemo.getMetrics(),state:JSON.stringify(after),ammoBefore:before.people.find(p=>p.id===event?.shooterId)?.ammo,ammoAfter:after.people.find(p=>p.id===event?.shooterId)?.ammo};});
  assert.ok(shotCheck.event);assert.ok(shotCheck.render.shotEventsRendered>0);assert.equal(shotCheck.ammoBefore-shotCheck.ammoAfter,1);
  await page.waitForFunction(()=>livingDemo.audio.getStatus().played>0,null,{timeout:5000});
  const audioCheck=await page.evaluate(event=>{const first=livingDemo.audio.getStatus().played;livingDemo.audio.consume([event],event.position);return {played:first,afterDuplicate:livingDemo.audio.getStatus().played,audio:livingDemo.audio.getStatus(),state:JSON.stringify(livingDemo.getState())};},shotCheck.event);
  assert.equal(audioCheck.afterDuplicate,audioCheck.played);assert.equal(audioCheck.state,shotCheck.state,'Audio consumption changed canonical state');
  await page.click('#sound-toggle');
  await page.click('#reset-button');assert.equal(await page.evaluate(()=>window.livingDemo.getState().tick),0);assert.equal(errors.length,0,errors.join('\n'));
  const screenshot=path.resolve(path.dirname(options.output),`living-city-dpr-${dpr}.png`);await page.screenshot({path:screenshot});
  return {dpr,status:'passed',offlineAfterLoad:true,selection:true,follow:true,canvasPickingBeforeAfterResize:true,cameraDoesNotMutate:true,audioAndEffectsDoNotMutate:true,scenarios:cases,confirmedShot:{eventId:shotCheck.event.eventId,shooterId:shotCheck.event.shooterId,targetId:shotCheck.event.targetId,ammoSpent:1,visualRendered:true,audio:audioCheck.audio,deduplicated:true},errors,requests,screenshot};
 }finally{await context.close();}
}
async function run(browser,scenario,dpr,speed=1){
 const {context,page,errors,requests}=await open(browser,dpr);
 try{
  const primeTicks=scenario==='S0'?250:scenario==='S1'?500:options.s2PrimeTicks;
  await page.evaluate(({scenario,primeTicks,speed})=>{window.livingDemo.reset({scenario,seed:16927});window.livingDemo.advanceTicks(primeTicks);if(window.livingDemo.setSpeed)window.livingDemo.setSpeed(speed);window.livingDemo.setPaused(true);},{scenario,primeTicks,speed});
  if(options.audioEnabled)await page.click('#sound-toggle');
  await page.evaluate(()=>window.livingDemo.setPaused(false));
  await page.waitForTimeout(options.warmupMs);const captureStart=await page.evaluate(()=>{window.livingDemo.resetMetrics();return {tick:window.livingDemo.getState().tick,shots:window.livingDemo.getState().events.filter(e=>e.type==='ShotFired').length,renderedShots:window.livingDemo.getMetrics().shotEventsRendered,audioPlayed:window.livingDemo.audio.getStatus().played};});
  const capture=await page.evaluate(ms=>new Promise(resolve=>{const frames=[];let previous,start=performance.now();function frame(now){if(previous!==undefined)frames.push(now-previous);previous=now;if(performance.now()-start>=ms)resolve({frames,wallMs:performance.now()-start});else requestAnimationFrame(frame);}requestAnimationFrame(frame);}),options.captureMs);
  const data=await page.evaluate(()=>{const runningBeforeStop=!window.livingDemo.isPaused,timeBeforeStop=window.livingDemo.getTimeState?.()??null;window.livingDemo.setPaused(true);const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return {runningBeforeStop,timeBeforeStop,state:window.livingDemo.getState(),audio:window.livingDemo.audio.getStatus(),metrics:window.livingDemo.getMetrics(),browser:{userAgent:navigator.userAgent,dpr:devicePixelRatio,width:innerWidth,height:innerHeight,webgl2:!!gl,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,gpuTimer:!!gl?.getExtension('EXT_disjoint_timer_query_webgl2')},heap:performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize}:null};});
  assert.equal(errors.length,0,errors.join('\n'));const metrics=data.metrics;
  const shotPresentation={logicalDuringCapture:data.state.events.filter(e=>e.type==='ShotFired').length-captureStart.shots,renderedDuringCapture:metrics.shotEventsRendered-captureStart.renderedShots,audioDuringCapture:data.audio.played-captureStart.audioPlayed};
  if(options.audioEnabled){assert.ok(shotPresentation.audioDuringCapture>0,'No shot audio occurred DURING the intended combat capture');assert.ok(shotPresentation.renderedDuringCapture>0,'No visual shot event occurred DURING the intended combat capture');}
  return {scenario,dpr,speed,simulatedInterval:{startTick:captureStart.tick,endTick:data.state.tick},runningBeforeStop:data.runningBeforeStop,timeBeforeStop:data.timeBeforeStop,shotPresentation,timeScale:metrics.time??null,presentationTickMs:stats(metrics.poseMs??[]),seed:16927,logicalPrimingTicks:primeTicks,audio:data.audio,status:'passed',browser:data.browser,wallMs:capture.wallMs,fps:capture.frames.length/(capture.wallMs/1000),frameMs:stats(capture.frames),logicMs:stats(metrics.logicMs),renderSubmissionMs:stats(metrics.renderMs),heap:data.heap,gpuMs:null,counts:{people:data.state.people.length,vehicles:data.state.vehicles.length,buildings:data.state.city.buildings.length,incidents:data.state.incidents.length},metrics,rawFrameMs:capture.frames,counters:data.state.counters,errors,externalRequests:requests.filter(u=>new URL(u).origin!==new URL(options.url).origin)};
 }finally{await context.close();}
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{report.browserVersion=browser.version();if(options.uxEvidence){const bytes=fs.readFileSync(options.uxEvidence),prior=JSON.parse(bytes);assert.equal(prior.status,'completed');assert.equal(prior.bundleSHA256,report.environment.bundleSHA256);assert.equal(prior.cases.length,9);assert.ok(prior.cases.every(c=>c.status==='passed'));report.uxVerification={evidenceFile:options.uxEvidence,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),caseCount:prior.cases.length,sameBundle:true,clock:prior.classification};save();}else if(options.reuseSmoke){const bytes=fs.readFileSync(options.reuseSmoke),prior=JSON.parse(bytes);assert.equal(prior.status,'completed');assert.equal(prior.environment.bundleSHA256,report.environment.bundleSHA256);assert.equal(prior.options.url,options.url);assert.deepEqual(prior.smoke.map(s=>s.dpr),[1,1.5,2]);assert.ok(prior.smoke.every(s=>s.status==='passed'));report.smoke=prior.smoke;report.reusedSmoke={sha256:crypto.createHash('sha256').update(bytes).digest('hex'),startedAt:prior.startedAt,completedAt:prior.completedAt,sameBundle:true};save();}else for(const dpr of [1,1.5,2]){report.smoke.push(await smoke(browser,dpr));save();console.log(`DPR ${dpr} smoke passed`);}if(!options.smokeOnly)for(const scenario of options.scenarios)for(const dpr of options.dprs)for(const speed of options.speeds){const r=await run(browser,scenario,dpr,speed);report.runs.push(r);save();console.log(`${scenario} DPR ${dpr} speed ${speed}x: ${r.fps.toFixed(2)} FPS`);}report.status='completed';report.completedAt=new Date().toISOString();save();}
 finally{await browser.close();}
})().catch(error=>{report.status='failed';report.failure=error.stack;save();console.error(error);process.exitCode=1;});
